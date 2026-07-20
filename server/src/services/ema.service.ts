import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { AppError, NotFoundError } from '../utils/errors';
import { EMA_REVIEW_FLOW, APPLICATION_STATUS } from '../utils/constants';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export class EMAService {
  /**
   * Get available EMA procedure types with details.
   */
  getProcedureTypes() {
    return [
      {
        code: 'CP',
        name: 'Centralised Procedure',
        description: '单一申请覆盖所有欧盟成员国，适用于生物制品、孤儿药、先进疗法药品',
        timeline: '210天评估 + 67天EC决策',
        applicableFor: ['生物制品', '孤儿药', '先进疗法', '特定新活性物质'],
        mandatory: true,
      },
      {
        code: 'DCP',
        name: 'Decentralised Procedure',
        description: '同时向多个成员国申请，尚无上市许可的药品',
        timeline: '约210天',
        applicableFor: ['仿制药', '非处方药', '其他常规药品'],
        mandatory: false,
      },
      {
        code: 'MRP',
        name: 'Mutual Recognition Procedure',
        description: '已在某成员国获批，互相认可至其他成员国',
        timeline: '约90天',
        applicableFor: ['已有成员国上市许可的药品'],
        mandatory: false,
      },
      {
        code: 'INP',
        name: 'Independent National Procedure',
        description: '单一成员国独立审评',
        timeline: '各国不同',
        applicableFor: ['仅在单一成员国上市的药品'],
        mandatory: false,
      },
    ];
  }

  /**
   * Get list of EU/EEA member states for RMS/CMS selection.
   */
  getMemberStates() {
    return [
      { code: 'AT', name: 'Austria' },
      { code: 'BE', name: 'Belgium' },
      { code: 'BG', name: 'Bulgaria' },
      { code: 'HR', name: 'Croatia' },
      { code: 'CY', name: 'Cyprus' },
      { code: 'CZ', name: 'Czech Republic' },
      { code: 'DK', name: 'Denmark' },
      { code: 'EE', name: 'Estonia' },
      { code: 'FI', name: 'Finland' },
      { code: 'FR', name: 'France' },
      { code: 'DE', name: 'Germany' },
      { code: 'GR', name: 'Greece' },
      { code: 'HU', name: 'Hungary' },
      { code: 'IS', name: 'Iceland' },
      { code: 'IE', name: 'Ireland' },
      { code: 'IT', name: 'Italy' },
      { code: 'LV', name: 'Latvia' },
      { code: 'LI', name: 'Liechtenstein' },
      { code: 'LT', name: 'Lithuania' },
      { code: 'LU', name: 'Luxembourg' },
      { code: 'MT', name: 'Malta' },
      { code: 'NL', name: 'Netherlands' },
      { code: 'NO', name: 'Norway' },
      { code: 'PL', name: 'Poland' },
      { code: 'PT', name: 'Portugal' },
      { code: 'RO', name: 'Romania' },
      { code: 'SK', name: 'Slovakia' },
      { code: 'SI', name: 'Slovenia' },
      { code: 'ES', name: 'Spain' },
      { code: 'SE', name: 'Sweden' },
    ];
  }

  /**
   * Save/update EMA registration info for an application.
   */
  async saveEMARegistration(applicationId: number, data: {
    procedureType: string;
    rmsCountry?: string;
    cmsCountries?: string;
    orphanDesignation?: boolean;
    paediatricPlan?: boolean;
    saProcedure?: boolean;
    saNumber?: string;
    maaNumber?: string;
  }) {
    const app = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!app) throw new NotFoundError('申请不存在');

    const validProcedures = ['CP', 'DCP', 'MRP', 'INP'];
    if (!validProcedures.includes(data.procedureType)) {
      throw new AppError(`无效的EMA程序类型: ${data.procedureType}。有效值: ${validProcedures.join(', ')}`);
    }

    const existing = await prisma.eMARegistration.findUnique({
      where: { applicationId },
    });

    if (existing) {
      return prisma.eMARegistration.update({
        where: { applicationId },
        data,
      });
    }

    return prisma.eMARegistration.create({
      data: {
        applicationId,
        ...data,
      },
    });
  }

  /**
   * Get EMA registration info for an application.
   */
  async getEMARegistration(applicationId: number) {
    const info = await prisma.eMARegistration.findUnique({
      where: { applicationId },
    });
    if (!info) throw new NotFoundError('EMA注册信息不存在');
    return info;
  }

  /**
   * Submit an EMA application (CP procedure) - creates all EMA review stages.
   */
  async submitEMAApplication(applicationId: number, userId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true, emaInfo: true },
    });

    if (!app) throw new NotFoundError('申请不存在');
    if (app.applicantId !== userId) throw new AppError('只能提交自己的申请', 403);
    if (app.status !== 'draft') throw new AppError('只能提交草稿状态的申请');
    if (app.regulatorySystemId !== 3) throw new AppError('该申请不是EMA体系');

    // Check EMA-specific info
    if (!app.emaInfo) throw new AppError('请先填写EMA注册信息（程序类型/RMS/CMS）');

    // Generate MAA-style number
    const procedureType = app.emaInfo.procedureType || 'CP';
    const applicationNo = this.generateEMAApplicationNo(procedureType);

    // Create EMA review stages based on procedure type
    const stages = EMA_REVIEW_FLOW.map(flow => ({
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
    const firstStage = EMA_REVIEW_FLOW[0];
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
      title: '新EMA申请提交',
      message: `${app.applicant.realName} 提交了EMA ${procedureType}申请: ${app.drugName}（受理号: ${applicationNo}）`,
      type: 'stage_change',
    });

    return prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true, emaInfo: true },
    });
  }

  /**
   * Advance an EMA review stage.
   * Respects clock-stop status — will not advance if the stage clock is currently stopped.
   */
  async advanceEMAStage(applicationId: number, userId: number, action: string, notes?: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
    if (!app) throw new NotFoundError('申请不存在');

    // Find the current in-progress stage
    const currentStage = app.stages.find(s => s.status === 'in_progress');
    if (!currentStage) throw new AppError('没有正在进行的EMA审评阶段');

    // Check if the clock is stopped — cannot advance while clock is stopped
    if (currentStage.clockStoppedAt && !currentStage.clockRestartedAt) {
      throw new AppError(
        '审评时钟已暂停，无法推进阶段。请等待申请人提交LoQ回复后再继续。',
      );
    }

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
        title: 'EMA审评不通过',
        message: `您的EMA申请 ${app.applicationNo}（${app.drugName}）在"${this.getEMAStageLabel(currentStage.stageName)}"阶段未通过审评`,
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
        data: { status: 'paused', notes: notes || 'EMA: List of Questions (LoQ)' },
      });

      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.SUPPLEMENT_NEEDED },
      });

      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: 'EMA需要补充资料（LoQ）',
        message: `您的EMA申请 ${app.applicationNo} 收到问题列表（LoQ），请尽快回复（${this.getEMAStageLabel(currentStage.stageName)}阶段）`,
        type: 'supplement_request',
      });

      return prisma.application.findUnique({
        where: { id: applicationId },
        include: { stages: true, applicant: true },
      });
    }

    // Advance to next stage
    const currentFlow = EMA_REVIEW_FLOW.find(f => f.name === currentStage.stageName);
    const nextFlow = EMA_REVIEW_FLOW.find(f => f.order === (currentFlow?.order || 0) + 1);

    if (!nextFlow) {
      // All stages complete - EC Decision made
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.APPROVED, approvedAt: new Date() },
      });

      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: 'EMA申请已获EC批准',
        message: `恭喜！您的EMA申请 ${app.applicationNo}（${app.drugName}）已获得EC Decision批准`,
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
      title: 'EMA审评阶段推进',
      message: `EMA申请 ${app.applicationNo} 已进入"${nextFlow.label}"阶段`,
      type: 'stage_change',
    });

    await notificationService.create({
      userId: app.applicantId,
      applicationId: app.id,
      title: 'EMA审评阶段更新',
      message: `您的EMA申请 ${app.applicationNo} 已进入"${nextFlow.label}"阶段`,
      type: 'stage_change',
    });

    return prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
  }

  /**
   * Get EMA DCP/MRP procedure details.
   */
  async getDCPMrpWorkflow(applicationId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { emaInfo: true },
    });
    if (!app || !app.emaInfo) throw new NotFoundError('EMA注册信息不存在');

    const procedureType = app.emaInfo.procedureType;

    if (procedureType === 'CP') {
      return {
        procedureType: 'CP',
        workflow: EMA_REVIEW_FLOW,
        estimatedTotalDays: EMA_REVIEW_FLOW.reduce((sum, s) => sum + s.days, 0),
      };
    }

    if (procedureType === 'DCP') {
      return {
        procedureType: 'DCP',
        workflow: [
          { name: 'pre_submission', order: 1, label: 'Pre-Submission', days: 30 },
          { name: 'validation', order: 2, label: 'Validation (RMS)', days: 14 },
          { name: 'rms_assessment', order: 3, label: 'RMS Assessment', days: 120 },
          { name: 'cms_comments', order: 4, label: 'CMS Comments', days: 60 },
          { name: 'consolidation', order: 5, label: 'Consolidation', days: 30 },
          { name: 'national_phase', order: 6, label: 'National Phase', days: 30 },
        ],
        estimatedTotalDays: 284,
      };
    }

    return {
      procedureType: procedureType || 'CP',
      workflow: EMA_REVIEW_FLOW,
      estimatedTotalDays: EMA_REVIEW_FLOW.reduce((sum, s) => sum + s.days, 0),
    };
  }

  // ============================================================
  // EMA Clock-Stop Mechanism (D120 LoQ / D180)
  // ============================================================

  /**
   * Issue List of Questions (LoQ) at D120 — EMA Clock-Stop mechanism.
   * Sets clockStoppedAt on the current stage and creates a DeficiencyLetter.
   *
   * @param applicationId Application ID
   * @param questions Array of questions
   * @param clockStopDays Expected clock-stop duration in days (default 120 for applicant response time)
   */
  async issueListOfQuestions(
    applicationId: number,
    questions: Array<{ category: string; question: string; guidance?: string }>,
    clockStopDays: number = 120,
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
    if (!app) throw new NotFoundError('申请不存在');

    // Find the current in-progress EMA stage (typically CHMP Assessment D120)
    const currentStage = app.stages.find(s => s.status === 'in_progress');
    if (!currentStage) throw new AppError('没有正在进行的EMA审评阶段');

    // Calculate the due date for response
    const dueDate = dayjs().add(clockStopDays, 'day').toDate();

    // Count existing deficiency letters for round number
    const existingLetters = await prisma.deficiencyLetter.count({
      where: { applicationId, stageId: currentStage.id },
    });
    const round = existingLetters + 1;

    // Set clock stopped and create DeficiencyLetter
    await prisma.$transaction([
      prisma.applicationStage.update({
        where: { id: currentStage.id },
        data: {
          status: 'paused',
          clockStoppedAt: new Date(),
          notes: `EMA D120 LoQ 已发出 - 审评时钟暂停（第${round}轮）`,
        },
      }),
      prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.SUPPLEMENT_NEEDED },
      }),
      prisma.deficiencyLetter.create({
        data: {
          applicationId,
          stageId: currentStage.id,
          round,
          dueDate,
          status: 'issued',
          questions: JSON.stringify(questions),
          internalNotes: `EMA D120 LoQ - 审评时钟暂停${clockStopDays}天`,
        },
      }),
    ]);

    await notificationService.create({
      userId: app.applicantId,
      applicationId: app.id,
      title: 'EMA D120 - 问题列表已发出',
      message: `您的EMA申请 ${app.applicationNo}（${app.drugName}）收到${questions.length}个审评问题，时钟已暂停。请在 ${dayjs(dueDate).format('YYYY-MM-DD')} 前提交回复。`,
      type: 'supplement_request',
    });

    return {
      applicationNo: app.applicationNo,
      stage: this.getEMAStageLabel(currentStage.stageName),
      questionsCount: questions.length,
      round,
      dueDate: dueDate.toISOString(),
      clockStatus: 'stopped',
      message: `已发出${questions.length}个审评问题，审评时钟暂停，截止日期 ${dayjs(dueDate).format('YYYY-MM-DD')}`,
    };
  }

  /**
   * Submit applicant response to LoQ. Sets clockRestartedAt and completes the open DeficiencyLetter.
   */
  async submitResponse(applicationId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
    if (!app) throw new NotFoundError('申请不存在');
    if (app.status !== APPLICATION_STATUS.SUPPLEMENT_NEEDED) {
      throw new AppError('当前状态不是补正状态');
    }

    // Find paused stage with clock stopped
    const pausedStage = app.stages.find(
      s => s.status === 'paused' && s.clockStoppedAt,
    );
    if (!pausedStage) throw new AppError('没有找到时钟暂停的审评阶段');

    // Calculate total stopped time
    const stoppedAt = dayjs(pausedStage.clockStoppedAt!);
    const restartedAt = dayjs();
    const stoppedDays = restartedAt.diff(stoppedAt, 'day');

    // Complete the open DeficiencyLetter for this stage
    const openLetter = await prisma.deficiencyLetter.findFirst({
      where: {
        applicationId,
        stageId: pausedStage.id,
        status: 'issued',
      },
      orderBy: { round: 'desc' },
    });

    await prisma.$transaction([
      prisma.applicationStage.update({
        where: { id: pausedStage.id },
        data: {
          status: 'in_progress',
          clockRestartedAt: new Date(),
          notes: `${pausedStage.notes}\n[${new Date().toISOString()}] 申请人已提交LoQ回复，审评时钟恢复。总暂停${stoppedDays}天`,
        },
      }),
      prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.UNDER_REVIEW },
      }),
    ]);

    if (openLetter) {
      await prisma.deficiencyLetter.update({
        where: { id: openLetter.id },
        data: {
          status: 'responded',
          responseDate: new Date(),
        },
      });
    }

    await notificationService.createForRole('reviewer', {
      applicationId: app.id,
      title: 'EMA LoQ回复已提交',
      message: `EMA申请 ${app.applicationNo}（${app.drugName}）已提交LoQ回复，审评时钟恢复。暂停${stoppedDays}天`,
      type: 'stage_change',
    });

    return {
      applicationNo: app.applicationNo,
      clockStatus: 'restarted',
      totalStoppedDays: stoppedDays,
      message: `审评时钟已恢复，总暂停时间: ${stoppedDays}天`,
    };
  }

  /**
   * Get EMA clock status: running/stopped state, total stopped days, days remaining.
   */
  async getClockStatus(applicationId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, deficiencyLetters: true, emaInfo: true },
    });
    if (!app) throw new NotFoundError('申请不存在');

    let totalStoppedMs = 0;
    const stageDetails: Array<{
      stageName: string;
      status: string;
      stoppedAt: Date | null;
      restartedAt: Date | null;
      stoppedDays: number;
    }> = [];

    for (const stage of app.stages) {
      const stoppedAt = stage.clockStoppedAt;
      const restartedAt = stage.clockRestartedAt;
      let stoppedDays = 0;

      if (stoppedAt) {
        const end = restartedAt || new Date();
        stoppedDays = dayjs(end).diff(dayjs(stoppedAt), 'day');
        totalStoppedMs += dayjs(end).diff(dayjs(stoppedAt), 'millisecond');
      }

      stageDetails.push({
        stageName: stage.stageName,
        status: stage.status,
        stoppedAt: stoppedAt || null,
        restartedAt: restartedAt || null,
        stoppedDays,
      });
    }

    const totalStoppedDays = Math.ceil(totalStoppedMs / (1000 * 60 * 60 * 24));

    // Calculate total review days and remaining
    const totalReviewDays = EMA_REVIEW_FLOW.reduce((sum, f) => sum + f.days, 0);
    const submissionDate = app.submittedAt || app.createdAt;
    const elapsedDays = dayjs().diff(dayjs(submissionDate), 'day');
    const effectiveElapsed = elapsedDays - totalStoppedDays;
    const daysRemaining = Math.max(0, totalReviewDays - effectiveElapsed);

    // Determine clock state
    const isRunning = app.stages.some(s => s.status === 'in_progress');
    const isStopped = app.stages.some(s => s.status === 'paused');
    let clockState: 'running' | 'stopped' | 'completed';

    if (isStopped) {
      clockState = 'stopped';
    } else if (isRunning) {
      clockState = 'running';
    } else {
      clockState = 'completed';
    }

    // Count total deficiency letters
    const totalLoQRounds = app.deficiencyLetters.length;

    return {
      applicationId,
      applicationNo: app.applicationNo,
      clockStatus: clockState,
      totalStoppedDays,
      totalReviewDays,
      elapsedCalendarDays: elapsedDays,
      effectiveElapsedDays: effectiveElapsed,
      daysRemaining,
      totalLoQRounds,
      procedureType: app.emaInfo?.procedureType || 'CP',
      stages: stageDetails,
    };
  }

  private generateEMAApplicationNo(procedureType: string): string {
    const prefix = procedureType === 'CP' ? 'EMEA/H/C' : 'EMEA/H/X';
    const year = dayjs().format('YYYY');
    const seq = Math.floor(Math.random() * 900) + 100;
    return `${prefix}/${seq}/${year}`;
  }

  private getEMAStageLabel(name: string): string {
    const flow = EMA_REVIEW_FLOW.find(f => f.name === name);
    return flow?.label || name;
  }
}

export const emaService = new EMAService();
