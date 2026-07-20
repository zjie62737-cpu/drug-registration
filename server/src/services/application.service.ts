import { PrismaClient } from '@prisma/client';
import { AppError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export class ApplicationService {
  async list(params: {
    userId: number;
    role: string;
    status?: string;
    type?: string;
    regulatorySystemId?: number;
    applicationCategory?: string;
    registrationClass?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      userId,
      role,
      status,
      type,
      regulatorySystemId,
      applicationCategory,
      registrationClass,
      search,
      page = 1,
      pageSize = 20,
    } = params;

    const where: any = {};

    // Applicant can only see own applications
    if (role === 'applicant') {
      where.applicantId = userId;
    }

    if (status) where.status = status;
    if (type) where.type = type;
    if (regulatorySystemId) where.regulatorySystemId = regulatorySystemId;
    if (applicationCategory) where.applicationCategory = applicationCategory;
    if (registrationClass) where.registrationClass = registrationClass;
    if (search) {
      where.OR = [
        { drugName: { contains: search } },
        { applicationNo: { contains: search } },
        { genericName: { contains: search } },
        { tradeName: { contains: search } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.application.count({ where }),
      prisma.application.findMany({
        where,
        include: {
          applicant: { select: { id: true, realName: true, organization: true } },
          regulatorySystem: { select: { id: true, code: true, name: true } },
          stages: {
            where: { status: 'in_progress' },
            select: { stageName: true, status: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return { total, page, pageSize, items };
  }

  async getById(id: number, userId: number, role: string) {
    const app = await prisma.application.findUnique({
      where: { id },
      include: {
        applicant: { select: { id: true, realName: true, organization: true, email: true, phone: true } },
        regulatorySystem: { select: { id: true, code: true, name: true } },
        enterpriseInfo: true,
        croInfos: true,
        patentDeclarations: true,
        fdaInfo: true,
        emaInfo: true,
        stages: {
          orderBy: { stageOrder: 'asc' },
          include: {
            assignedReviewer: { select: { id: true, realName: true } },
            reviews: {
              include: { reviewer: { select: { id: true, realName: true, role: true } } },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        documents: {
          include: { uploadedBy: { select: { id: true, realName: true } } },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!app) throw new NotFoundError('申请不存在');

    // Applicant can only see own applications
    if (role === 'applicant' && app.applicantId !== userId) {
      throw new AppError('无权限查看此申请', 403);
    }

    return app;
  }

  async create(data: {
    type: string;
    drugName: string;
    drugType: string;
    regulatorySystemId?: number;
    applicationCategory?: string;
    registrationClass?: string;
    genericName?: string;
    tradeName?: string;
    dosageForm?: string;
    specification?: string;
    indication?: string;
    usageDosage?: string;
    atcCode?: string;
    manufacturer?: string;
    isOverseas?: boolean;
    productionSite?: string;
    priorityReview?: boolean;
    breakthroughTherapy?: boolean;
    orphanDrug?: boolean;
    emergencyUse?: boolean;
    isSmallEnterprise?: boolean;
    feePayer?: string;
    applicantId: number;
  }) {
    if (!data.drugName.trim()) {
      throw new AppError('药品名称不能为空');
    }

    return prisma.application.create({
      data: {
        type: data.type,
        drugName: data.drugName,
        drugType: data.drugType,
        regulatorySystemId: data.regulatorySystemId || 1,
        applicationCategory: data.applicationCategory || null,
        registrationClass: data.registrationClass || null,
        genericName: data.genericName || null,
        tradeName: data.tradeName || null,
        dosageForm: data.dosageForm || null,
        specification: data.specification || null,
        indication: data.indication || null,
        usageDosage: data.usageDosage || null,
        atcCode: data.atcCode || null,
        manufacturer: data.manufacturer || null,
        isOverseas: data.isOverseas || false,
        productionSite: data.productionSite || null,
        priorityReview: data.priorityReview || false,
        breakthroughTherapy: data.breakthroughTherapy || false,
        orphanDrug: data.orphanDrug || false,
        emergencyUse: data.emergencyUse || false,
        isSmallEnterprise: data.isSmallEnterprise || false,
        feePayer: data.feePayer || null,
        applicantId: data.applicantId,
        status: 'draft',
      },
    });
  }

  async update(id: number, userId: number, data: {
    drugName?: string;
    drugType?: string;
    regulatorySystemId?: number;
    applicationCategory?: string;
    registrationClass?: string;
    genericName?: string;
    tradeName?: string;
    dosageForm?: string;
    specification?: string;
    indication?: string;
    usageDosage?: string;
    atcCode?: string;
    manufacturer?: string;
    isOverseas?: boolean;
    productionSite?: string;
    priorityReview?: boolean;
    breakthroughTherapy?: boolean;
    orphanDrug?: boolean;
    emergencyUse?: boolean;
    isSmallEnterprise?: boolean;
    feePayer?: string;
  }) {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundError('申请不存在');
    if (app.applicantId !== userId) throw new AppError('只能编辑自己的申请', 403);
    if (app.status !== 'draft') throw new AppError('只能编辑草稿状态的申请');

    return prisma.application.update({
      where: { id },
      data,
    });
  }

  async delete(id: number, userId: number) {
    const app = await prisma.application.findUnique({ where: { id } });
    if (!app) throw new NotFoundError('申请不存在');
    if (app.applicantId !== userId) throw new AppError('只能删除自己的申请', 403);
    if (app.status !== 'draft') throw new AppError('只能删除草稿状态的申请');

    await prisma.application.delete({ where: { id } });
    return { message: '删除成功' };
  }

  async getStats(userId: number, role: string, regulatorySystemId?: number) {
    const baseWhere: any = {};
    if (role === 'applicant') {
      baseWhere.applicantId = userId;
    }
    if (regulatorySystemId) {
      baseWhere.regulatorySystemId = regulatorySystemId;
    }

    const [total, draft, submitted, underReview, supplement, approved, rejected] = await Promise.all([
      prisma.application.count({ where: baseWhere }),
      prisma.application.count({ where: { ...baseWhere, status: 'draft' } }),
      prisma.application.count({ where: { ...baseWhere, status: 'submitted' } }),
      prisma.application.count({ where: { ...baseWhere, status: 'under_review' } }),
      prisma.application.count({ where: { ...baseWhere, status: 'supplement_needed' } }),
      prisma.application.count({ where: { ...baseWhere, status: 'approved' } }),
      prisma.application.count({ where: { ...baseWhere, status: 'rejected' } }),
    ]);

    return { total, draft, submitted, underReview, supplement, approved, rejected };
  }

  async getSystemStats() {
    const systems = await prisma.regulatorySystem.findMany({
      include: {
        applications: {
          select: { id: true, status: true },
        },
      },
    });

    return systems.map(sys => {
      const apps = sys.applications;
      return {
        id: sys.id,
        code: sys.code,
        name: sys.name,
        fullName: sys.fullName,
        totalApplications: apps.length,
        approved: apps.filter(a => a.status === 'approved').length,
        underReview: apps.filter(a => a.status === 'under_review').length,
        submitted: apps.filter(a => a.status === 'submitted').length,
        draft: apps.filter(a => a.status === 'draft').length,
        rejected: apps.filter(a => a.status === 'rejected').length,
        supplementNeeded: apps.filter(a => a.status === 'supplement_needed').length,
      };
    });
  }

  async getRecentActivities(userId: number, role: string, limit = 10) {
    const where: any = {};
    if (role === 'applicant') {
      where.applicantId = userId;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        applicant: { select: { id: true, realName: true } },
        regulatorySystem: { select: { code: true } },
        stages: {
          where: { status: { not: 'pending' } },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { reviewer: { select: { id: true, realName: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    const activities: Array<{
      id: string;
      type: string;
      description: string;
      time: Date;
      applicationId: number;
      applicationNo: string;
      systemCode?: string;
    }> = [];

    for (const app of applications) {
      if (app.status === 'submitted' && app.applicationNo) {
        activities.push({
          id: `submit-${app.id}`,
          type: 'submitted',
          description: `${app.applicant.realName} 提交了 ${app.drugName}`,
          time: app.updatedAt,
          applicationId: app.id,
          applicationNo: app.applicationNo,
          systemCode: app.regulatorySystem?.code,
        });
      }

      const lastStage = app.stages[0];
      if (lastStage) {
        const stageLabel = this.getStageLabel(lastStage.stageName);
        if (lastStage.status === 'completed') {
          activities.push({
            id: `stage-${lastStage.id}`,
            type: 'stage_completed',
            description: `${stageLabel}阶段已完成`,
            time: lastStage.updatedAt,
            applicationId: app.id,
            applicationNo: app.applicationNo || '',
            systemCode: app.regulatorySystem?.code,
          });
        }
      }

      const lastReview = app.reviews[0];
      if (lastReview && lastReview.action !== 'comment') {
        activities.push({
          id: `review-${lastReview.id}`,
          type: lastReview.action || 'review',
          description: `${lastReview.reviewer.realName} 提交了审评意见`,
          time: lastReview.createdAt,
          applicationId: app.id,
          applicationNo: app.applicationNo || '',
          systemCode: app.regulatorySystem?.code,
        });
      }
    }

    return activities.sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, limit);
  }

  private getStageLabel(name: string): string {
    const map: Record<string, string> = {
      account_creation: '账号注册',
      form_filling: '申请表填写',
      document_preparation: '申报资料准备',
      online_booking: '网上预约',
      disc_submission: '光盘提交',
      acceptance: '受理',
      formal_review: '形式审查',
      technical_review: '技术审评',
      onsite_inspection: '现场核查',
      sample_testing: '样品检验',
      administrative_approval: '行政审批',
      certificate_issuance: '制证送达',
      pre_submission: '预提交',
      filing_review: '立卷审查',
      plan_review: '计划审查',
      conduct_review: '实施审查',
      advisory_committee: '专家委员会',
      official_action: '官方行动',
      post_action_feedback: '行动后反馈',
      validation: '验证',
      chmp_assessment_day120: 'CHMP评估(D120)',
      chmp_assessment_day180: 'CHMP评估(D180)',
      chmp_opinion: 'CHMP意见',
      ec_decision: 'EC决定',
      national_implementation: '国家实施',
    };
    return map[name] || name;
  }
}

export const applicationService = new ApplicationService();
