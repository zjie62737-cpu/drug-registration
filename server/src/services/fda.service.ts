import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { AppError, NotFoundError } from '../utils/errors';
import { FDA_REVIEW_FLOW, APPLICATION_STATUS } from '../utils/constants';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export class FDAService {
  /**
   * Validate DUNS/FEI/ESG registration info.
   */
  async validateFDARegistration(data: {
    dunsNumber?: string;
    feiNumber?: string;
    esgAccount?: string;
    usAgentName?: string;
    usAgentContact?: string;
    usAgentEmail?: string;
  }) {
    const errors: string[] = [];

    if (data.dunsNumber && !/^\d{9}$/.test(data.dunsNumber)) {
      errors.push('DUNS号必须是9位数字');
    }
    if (data.feiNumber && !/^\d{10}$/.test(data.feiNumber)) {
      errors.push('FEI号必须是10位数字');
    }
    if (data.usAgentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.usAgentEmail)) {
      errors.push('美国代理人邮箱格式不正确');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Save/update FDA registration info for an application.
   */
  async saveFDARegistration(applicationId: number, data: {
    dunsNumber?: string;
    feiNumber?: string;
    esgAccount?: string;
    usAgentName?: string;
    usAgentContact?: string;
    usAgentEmail?: string;
    ndcNumber?: string;
    preAssignedBla?: string;
    proprietaryName?: string;
    applicationForm?: string;
    // Paragraph I-IV patent certification (Hatch-Waxman Act)
    patentCertPara?: string;
    patentCertNumber?: string;
    patentCertExpiry?: string;
    patentCertNotice?: boolean;
  }) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) throw new NotFoundError('申请不存在');

    // Validate
    const validation = await this.validateFDARegistration(data);
    if (!validation.valid) {
      throw new AppError(`FDA注册信息验证失败: ${validation.errors.join('; ')}`);
    }

    // Validate patent certification paragraph if provided
    if (data.patentCertPara) {
      const validParas = ['I', 'II', 'III', 'IV'];
      if (!validParas.includes(data.patentCertPara)) {
        throw new AppError(`专利声明段落无效: ${data.patentCertPara}。有效值: ${validParas.join(', ')}`);
      }
      // Paragraph IV requires a patent number
      if (data.patentCertPara === 'IV' && !data.patentCertNumber) {
        throw new AppError('Paragraph IV 认证需要提供专利号');
      }
    }

    const existing = await prisma.fDARegistration.findUnique({
      where: { applicationId },
    });

    if (existing) {
      return prisma.fDARegistration.update({
        where: { applicationId },
        data: {
          ...data,
          patentCertExpiry: data.patentCertExpiry ? new Date(data.patentCertExpiry) : undefined,
        },
      });
    }

    return prisma.fDARegistration.create({
      data: {
        applicationId,
        ...data,
        patentCertExpiry: data.patentCertExpiry ? new Date(data.patentCertExpiry) : undefined,
      },
    });
  }

  /**
   * Get FDA registration info for an application.
   */
  async getFDARegistration(applicationId: number) {
    const info = await prisma.fDARegistration.findUnique({
      where: { applicationId },
    });
    if (!info) throw new NotFoundError('FDA注册信息不存在');
    return info;
  }

  /**
   * Submit an FDA application - creates all FDA review stages.
   */
  async submitFDAApplication(applicationId: number, userId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true, fdaInfo: true },
    });

    if (!app) throw new NotFoundError('申请不存在');
    if (app.applicantId !== userId) throw new AppError('只能提交自己的申请', 403);
    if (app.status !== 'draft') throw new AppError('只能提交草稿状态的申请');
    if (app.regulatorySystemId !== 2) throw new AppError('该申请不是FDA体系');

    // Check FDA-specific info exists
    if (!app.fdaInfo) throw new AppError('请先填写FDA注册信息（DUNS/FEI/ESG）');

    // Generate FDA-style application number
    const applicationNo = this.generateFDAApplicationNo(app.type);

    // Create FDA review stages
    const stages = FDA_REVIEW_FLOW.map(flow => ({
      applicationId: app.id,
      stageName: flow.name,
      stageOrder: flow.order,
      status: 'pending',
      deadline: null,
    }));

    await prisma.$transaction([
      prisma.application.update({
        where: { id: applicationId },
        data: {
          applicationNo,
          status: APPLICATION_STATUS.SUBMITTED,
        },
      }),
      prisma.applicationStage.createMany({ data: stages }),
    ]);

    // Auto-start first stage
    const firstStage = FDA_REVIEW_FLOW[0];
    const stageRecord = await prisma.applicationStage.findFirst({
      where: { applicationId, stageName: firstStage.name },
    });
    if (stageRecord) {
      const deadline = dayjs().add(firstStage.days, 'day').toDate();
      await prisma.applicationStage.update({
        where: { id: stageRecord.id },
        data: {
          status: 'in_progress',
          startedAt: new Date(),
          deadline,
        },
      });

      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.UNDER_REVIEW },
      });
    }

    // Notify reviewers
    await notificationService.createForRole('reviewer', {
      applicationId: app.id,
      title: '新FDA申请提交',
      message: `${app.applicant.realName} 提交了FDA ${app.type}申请: ${app.drugName}（受理号: ${applicationNo}）`,
      type: 'stage_change',
    });

    return prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true, fdaInfo: true },
    });
  }

  /**
   * Advance an FDA review stage.
   */
  async advanceFDAStage(applicationId: number, userId: number, action: string, notes?: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
    if (!app) throw new NotFoundError('申请不存在');

    // Find the current in-progress stage
    const currentStage = app.stages.find(s => s.status === 'in_progress');
    if (!currentStage) throw new AppError('没有正在进行的FDA审评阶段');

    // Complete current stage
    await prisma.applicationStage.update({
      where: { id: currentStage.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        notes: notes || null,
      },
    });

    if (action === 'reject') {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.REJECTED },
      });

      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: 'FDA审评不通过',
        message: `您的FDA申请 ${app.applicationNo}（${app.drugName}）在"${this.getFDAStageLabel(currentStage.stageName)}"阶段未通过审评`,
        type: 'rejection',
      });

      return prisma.application.findUnique({
        where: { id: applicationId },
        include: { stages: true, applicant: true },
      });
    }

    if (action === 'request_supplement') {
      await prisma.applicationStage.update({
        where: { id: currentStage.id },
        data: { status: 'paused', notes: notes || 'FDA: 需要补充资料' },
      });

      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.SUPPLEMENT_NEEDED },
      });

      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: 'FDA需要补充资料',
        message: `您的FDA申请 ${app.applicationNo}（${app.drugName}）需要补充资料（${this.getFDAStageLabel(currentStage.stageName)}阶段）`,
        type: 'supplement_request',
      });

      return prisma.application.findUnique({
        where: { id: applicationId },
        include: { stages: true, applicant: true },
      });
    }

    // Advance to next stage
    const currentFlow = FDA_REVIEW_FLOW.find(f => f.name === currentStage.stageName);
    const nextFlow = FDA_REVIEW_FLOW.find(f => f.order === (currentFlow?.order || 0) + 1);

    if (!nextFlow) {
      // All stages complete - approved
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.APPROVED, approvedAt: new Date() },
      });

      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: 'FDA申请已批准',
        message: `恭喜！您的FDA申请 ${app.applicationNo}（${app.drugName}）已通过全部审评`,
        type: 'approval',
      });

      return prisma.application.findUnique({
        where: { id: applicationId },
        include: { stages: true, applicant: true },
      });
    }

    // Start next stage
    const nextStage = await prisma.applicationStage.findFirst({
      where: { applicationId, stageName: nextFlow.name },
    });
    if (nextStage) {
      const deadline = dayjs().add(nextFlow.days, 'day').toDate();
      await prisma.applicationStage.update({
        where: { id: nextStage.id },
        data: {
          status: 'in_progress',
          startedAt: new Date(),
          deadline,
        },
      });
    }

    // Notify
    await notificationService.createForRole('reviewer', {
      applicationId: app.id,
      title: 'FDA审评阶段推进',
      message: `FDA申请 ${app.applicationNo} 已进入"${nextFlow.label}"阶段`,
      type: 'stage_change',
    });

    await notificationService.create({
      userId: app.applicantId,
      applicationId: app.id,
      title: 'FDA审评阶段更新',
      message: `您的FDA申请 ${app.applicationNo} 已进入"${nextFlow.label}"阶段`,
      type: 'stage_change',
    });

    return prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
  }

  /**
   * Get FDA application submission checklist.
   */
  getFilingChecklist(applicationType: string) {
    const baseChecklist = [
      { item: 'Form FDA 356h (Application for NDA/BLA)', required: true },
      { item: 'Cover Letter', required: true },
      { item: 'Certification of Compliance (Form 3674)', required: true },
      { item: 'DUNS Number', required: true },
      { item: 'FEI Number', required: true },
      { item: 'ESG Account', required: true },
      { item: 'US Agent Appointment Letter', required: true },
      { item: 'Patent Information (Form 3542)', required: false },
      { item: 'Debarment Certification', required: true },
      { item: 'Financial Disclosure (Form 3454/3455)', required: true },
      { item: 'Module 1 (Administrative Information)', required: true },
      { item: 'Module 2 (Summaries)', required: true },
      { item: 'Module 3 (Quality)', required: true },
      { item: 'Module 4 (Nonclinical)', required: true },
      { item: 'Module 5 (Clinical)', required: true },
      { item: 'Pediatric Study Plan (iPSP)', required: applicationType === 'NDA' },
      { item: 'Pediatric Assessment (PREA)', required: applicationType === 'NDA' || applicationType === 'BLA' },
    ];

    return {
      applicationType,
      checkList: baseChecklist,
      totalItems: baseChecklist.length,
      requiredItems: baseChecklist.filter(i => i.required).length,
    };
  }

  /**
   * Perform filing review: returns Refuse-to-File (RTF) or File decision.
   * If RTF, returns detailed reasons. If File, sets application status to under_review.
   */
  async performFilingReview(applicationId: number, decision: 'filed' | 'rtf', rtfReasons?: string[]) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
    if (!app) throw new NotFoundError('申请不存在');

    // Verify the application is in filing_review stage
    const filingStage = app.stages.find(
      s => s.stageName === 'filing_review' && s.status === 'in_progress',
    );
    if (!filingStage) throw new AppError('申请当前不在立卷审查阶段');

    if (decision === 'rtf') {
      // Refuse-to-File: reject the application with detailed reasons
      const reasons = rtfReasons && rtfReasons.length > 0
        ? rtfReasons.join('; ')
        : '未满足FDA立卷要求';

      await prisma.$transaction([
        prisma.applicationStage.update({
          where: { id: filingStage.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            notes: `RTF: ${reasons}`,
          },
        }),
        prisma.application.update({
          where: { id: applicationId },
          data: { status: APPLICATION_STATUS.REJECTED },
        }),
      ]);

      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: 'FDA立卷审查 - RTF拒绝立卷',
        message: `您的FDA申请 ${app.applicationNo}（${app.drugName}）未通过立卷审查（RTF）。原因: ${reasons}`,
        type: 'rejection',
      });

      return {
        decision: 'rtf',
        applicationNo: app.applicationNo,
        reasons: rtfReasons || ['未满足要求'],
        message: '申请被拒绝立卷（Refuse-to-File）。请修正后重新提交。',
      };
    }

    // Filed: mark filing review complete and advance to next stage
    await prisma.applicationStage.update({
      where: { id: filingStage.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        notes: 'Filed - 满足立卷要求',
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: APPLICATION_STATUS.UNDER_REVIEW },
    });

    // Auto-advance to Plan Review stage
    const nextFlow = FDA_REVIEW_FLOW.find(f => f.order === (filingStage.stageOrder + 1));
    if (nextFlow) {
      const nextStage = await prisma.applicationStage.findFirst({
        where: { applicationId, stageName: nextFlow.name },
      });
      if (nextStage) {
        const deadline = dayjs().add(nextFlow.days, 'day').toDate();
        await prisma.applicationStage.update({
          where: { id: nextStage.id },
          data: {
            status: 'in_progress',
            startedAt: new Date(),
            deadline,
          },
        });
      }
    }

    await notificationService.create({
      userId: app.applicantId,
      applicationId: app.id,
      title: 'FDA立卷审查 - 通过',
      message: `您的FDA申请 ${app.applicationNo}（${app.drugName}）已通过立卷审查，进入实质审评阶段`,
      type: 'stage_change',
    });

    return {
      decision: 'filed',
      applicationNo: app.applicationNo,
      message: '已通过立卷审查，进入实质审评。',
    };
  }

  /**
   * Issue an official action on an FDA application.
   * Two outcomes:
   * - "approval": Approval Letter with labeling instructions
   * - "crl": Complete Response Letter with deficiency list
   */
  async issueOfficialAction(
    applicationId: number,
    action: 'approval' | 'crl',
    details?: {
      deficiencies?: Array<{ category: string; description: string }>;
      labeling?: string;
      postMarketingRequirements?: string[];
    },
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
    if (!app) throw new NotFoundError('申请不存在');

    // Find the official_action stage
    const actionStage = app.stages.find(
      s => s.stageName === 'official_action' && s.status === 'in_progress',
    );
    if (!actionStage) throw new AppError('申请当前不在官方行动(Official Action)阶段');

    if (action === 'approval') {
      // Approval Letter
      await prisma.$transaction([
        prisma.applicationStage.update({
          where: { id: actionStage.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            notes: `Approval Letter issued${details?.labeling ? '. 标签要求: ' + details.labeling : ''}`,
          },
        }),
        prisma.application.update({
          where: { id: applicationId },
          data: {
            status: APPLICATION_STATUS.APPROVED,
            approvedAt: new Date(),
          },
        }),
      ]);

      // Create labeling record if provided
      if (details?.labeling) {
        const existingLabel = await prisma.labeling.findFirst({
          where: { applicationId, labelType: 'SmPC' },
        });
        if (existingLabel) {
          await prisma.labeling.update({
            where: { id: existingLabel.id },
            data: { content: details.labeling, negotiationStatus: 'agreed' },
          });
        } else {
          await prisma.labeling.create({
            data: {
              applicationId,
              labelType: 'SmPC',
              language: 'en-US',
              content: details.labeling,
              negotiationStatus: 'agreed',
            },
          });
        }
      }

      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: 'FDA 官方行动 - 批准',
        message: `恭喜！您的FDA申请 ${app.applicationNo}（${app.drugName}）已获得批准（Approval Letter）。`,
        type: 'approval',
      });

      return {
        action: 'approval',
        applicationNo: app.applicationNo,
        message: '已发出批准函（Approval Letter）。',
        labeling: details?.labeling || null,
        postMarketingRequirements: details?.postMarketingRequirements || [],
      };
    }

    // Complete Response Letter (CRL)
    const deficiencyList = details?.deficiencies || [];
    const crlSummary = deficiencyList.length > 0
      ? deficiencyList.map(d => `[${d.category}] ${d.description}`).join('\n')
      : '未详细列出缺陷项';

    await prisma.$transaction([
      prisma.applicationStage.update({
        where: { id: actionStage.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          notes: `Complete Response Letter issued.\nDeficiencies:\n${crlSummary}`,
        },
      }),
      prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.SUPPLEMENT_NEEDED },
      }),
    ]);

    // Create deficiency letters for each deficiency
    for (const def of deficiencyList) {
      await prisma.deficiencyLetter.create({
        data: {
          applicationId,
          stageId: actionStage.id,
          round: 1,
          dueDate: dayjs().add(180, 'day').toDate(), // 6 months typical CRL response
          status: 'issued',
          questions: JSON.stringify([def]),
        },
      });
    }

    await notificationService.create({
      userId: app.applicantId,
      applicationId: app.id,
      title: 'FDA 官方行动 - CRL完整答复函',
      message: `您的FDA申请 ${app.applicationNo}（${app.drugName}）收到完整答复函（CRL），请查看缺陷项并及时补正`,
      type: 'supplement_request',
    });

    return {
      action: 'crl',
      applicationNo: app.applicationNo,
      message: '已发出完整答复函（Complete Response Letter）。',
      deficiencies: deficiencyList,
    };
  }

  /**
   * Calculate PDUFA goal date based on submission date and review type.
   * Standard: 10 months from submission (NDA/BLA)
   * Priority: 6 months from submission
   * IND: 30 days from submission
   */
  async getPDUFADate(applicationId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { fdaInfo: true },
    });
    if (!app) throw new NotFoundError('申请不存在');
    if (!app.submittedAt) throw new AppError('申请尚未提交');

    const submittedAt = dayjs(app.submittedAt);
    let reviewMonths: number;
    let reviewType: string;
    let regulatoryBasis: string;

    switch (app.type.toUpperCase()) {
      case 'IND':
        // IND: 30-day review
        return {
          applicationNo: app.applicationNo,
          submissionDate: submittedAt.format('YYYY-MM-DD'),
          pdufaDate: submittedAt.add(30, 'day').format('YYYY-MM-DD'),
          reviewType: 'IND 30-Day Safety Review',
          reviewTimeline: '30 calendar days',
          regulatoryBasis: '21 CFR 312.20',
        };

      case 'NDA':
      case 'BLA':
        if (app.priorityReview) {
          reviewMonths = 6;
          reviewType = 'Priority (6-Month)';
          regulatoryBasis = 'PDUFA Goal - Priority Review (FDARA)';
        } else {
          reviewMonths = 10;
          reviewType = 'Standard (10-Month)';
          regulatoryBasis = 'PDUFA Goal - Standard Review';
        }
        break;

      case 'ANDA':
        // ANDA: GDUFA 10-month goal date
        reviewMonths = 10;
        reviewType = 'GDUFA Standard (10-Month)';
        regulatoryBasis = 'GDUFA Goal Date';
        break;

      default:
        reviewMonths = 10;
        reviewType = 'Standard';
        regulatoryBasis = 'PDUFA Goal Date';
    }

    const pdufaDate = submittedAt.add(reviewMonths, 'month');

    return {
      applicationNo: app.applicationNo,
      applicationType: app.type,
      submissionDate: submittedAt.format('YYYY-MM-DD'),
      pdufaDate: pdufaDate.format('YYYY-MM-DD'),
      reviewType,
      reviewTimeline: `${reviewMonths} months from submission`,
      regulatoryBasis,
      priorityReview: app.priorityReview,
      daysFromNow: pdufaDate.diff(dayjs(), 'day'),
    };
  }

  private generateFDAApplicationNo(type: string): string {
    const prefix = type.toUpperCase() === 'NDA' ? 'NDA' : type.toUpperCase();
    const year = dayjs().format('YYYY');
    const seq = Math.floor(Math.random() * 900) + 100;
    return `${prefix}${year}${seq}`;
  }

  private getFDAStageLabel(name: string): string {
    const flow = FDA_REVIEW_FLOW.find(f => f.name === name);
    return flow?.label || name;
  }
}

export const fdaService = new FDAService();
