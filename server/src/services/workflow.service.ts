import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { AppError } from '../utils/errors';
import {
  STAGE_FLOW,
  STAGE_NAMES,
  STAGE_STATUS,
  APPLICATION_STATUS,
  CTD_MODULE_TREE,
  FDA_REVIEW_FLOW,
  EMA_REVIEW_FLOW,
  TECHNICAL_REVIEW_TRACKS,
  DEFICIENCY_ROUNDS,
} from '../utils/constants';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export class WorkflowService {
  /**
   * Submit NMPA application: creates 7 review stages.
   * For the technical_review stage (parallel), creates 3 track records
   * (pharmaceutical, nonclinical, clinical).
   */
  async submitApplication(applicationId: number, userId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });

    if (!app) throw new AppError('申请不存在', 404);
    if (app.applicantId !== userId) throw new AppError('只能提交自己的申请', 403);
    if (app.status !== 'draft') throw new AppError('只能提交草稿状态的申请');

    // Generate acceptance number
    const applicationNo = this.generateApplicationNo(app.type);

    // Create 7 core CDE stages; for parallel technical_review, create 3 track records
    const stages: Array<{
      applicationId: number;
      stageName: string;
      stageOrder: number;
      status: string;
      deadline: null;
      reviewTrack?: string;
    }> = [];

    for (const flow of STAGE_FLOW) {
      if (flow.parallel && (flow as any).tracks) {
        // Create one ApplicationStage per track for the parallel technical review
        for (const track of (flow as any).tracks) {
          stages.push({
            applicationId: app.id,
            stageName: flow.name,
            stageOrder: flow.order,
            status: 'pending',
            deadline: null,
            reviewTrack: track,
          });
        }
      } else {
        stages.push({
          applicationId: app.id,
          stageName: flow.name,
          stageOrder: flow.order,
          status: 'pending',
          deadline: null,
        });
      }
    }

    await prisma.$transaction([
      prisma.application.update({
        where: { id: applicationId },
        data: {
          applicationNo,
          status: APPLICATION_STATUS.SUBMITTED,
          submittedAt: new Date(),
        },
      }),
      prisma.applicationStage.createMany({ data: stages }),
    ]);

    // Auto-start first stage: acceptance
    const firstStage = await prisma.applicationStage.findFirst({
      where: { applicationId, stageName: STAGE_FLOW[0].name },
    });
    if (firstStage) {
      await this.startStage(firstStage.id, applicationId);
    }

    // Notify reviewers
    await notificationService.createForRole('reviewer', {
      applicationId: app.id,
      title: '新申请提交',
      message: `${app.applicant.realName} 提交了新的${this.getTypeLabel(app.type)}申请: ${app.drugName}（受理号: ${applicationNo}）`,
      type: 'stage_change',
    });

    return prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
  }

  /**
   * Start a specific review stage.
   */
  async startStage(stageId: number, applicationId: number) {
    const stage = await prisma.applicationStage.findFirst({
      where: { id: stageId, applicationId },
    });
    if (!stage) throw new AppError('审评阶段不存在', 404);

    const flowConfig = STAGE_FLOW.find(f => f.name === stage.stageName);
    if (!flowConfig) throw new AppError('未知的审评阶段');

    const deadline = dayjs().add(flowConfig.days, 'day').toDate();

    await prisma.applicationStage.update({
      where: { id: stageId },
      data: {
        status: STAGE_STATUS.IN_PROGRESS,
        startedAt: new Date(),
        deadline,
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: APPLICATION_STATUS.UNDER_REVIEW },
    });
  }

  /**
   * Advance NMPA review stage. Supports per-track advancement for the
   * technical_review stage. When all 3 technical review tracks are complete,
   * the stage as a whole advances to the next stage.
   */
  async advanceStage(
    applicationId: number,
    userId: number,
    action: string,
    notes?: string,
    track?: string,
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
    if (!app) throw new AppError('申请不存在', 404);

    // Find current in-progress stage(s)
    let currentStages = app.stages.filter(s => s.status === 'in_progress');
    if (currentStages.length === 0) {
      throw new AppError('没有正在进行的审评阶段');
    }

    // If a specific track is targeted (for parallel technical review)
    if (track) {
      const trackStage = currentStages.find(
        s => s.reviewTrack === track && s.stageName === STAGE_NAMES.TECHNICAL_REVIEW,
      );
      if (!trackStage) throw new AppError(`没有找到进行中的审评线: ${track}`);

      await prisma.applicationStage.update({
        where: { id: trackStage.id },
        data: {
          trackStatus: STAGE_STATUS.COMPLETED,
          completedAt: new Date(),
          notes: notes || null,
        },
      });

      // Check if all 3 tracks are now complete
      const techStages = await prisma.applicationStage.findMany({
        where: {
          applicationId,
          stageName: STAGE_NAMES.TECHNICAL_REVIEW,
        },
      });

      const allComplete = techStages.every(
        s => s.trackStatus === STAGE_STATUS.COMPLETED || s.status === STAGE_STATUS.COMPLETED,
      );

      if (allComplete) {
        // Mark all tech review stages as completed and advance to next stage
        for (const ts of techStages) {
          await prisma.applicationStage.update({
            where: { id: ts.id },
            data: { status: STAGE_STATUS.COMPLETED, completedAt: ts.completedAt || new Date() },
          });
        }

        return this.advanceToNextStage(applicationId, app, currentStages[0]);
      }

      return prisma.application.findUnique({
        where: { id: applicationId },
        include: { stages: true, applicant: true },
      });
    }

    // Standard (non-tracked) advancement: complete all in-progress stages
    // (handles sequential stages and parallel stages like onsite_inspection)
    for (const cs of currentStages) {
      await prisma.applicationStage.update({
        where: { id: cs.id },
        data: {
          status: STAGE_STATUS.COMPLETED,
          completedAt: new Date(),
          notes: notes || null,
        },
      });
    }

    if (action === 'reject') {
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.REJECTED },
      });

      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: '审评不通过',
        message: `您的申请 ${app.applicationNo}（${app.drugName}）在"${this.getStageLabel(currentStages[0].stageName)}"阶段未通过审评`,
        type: 'rejection',
      });

      return prisma.application.findUnique({
        where: { id: applicationId },
        include: { stages: true, applicant: true },
      });
    }

    if (action === 'request_supplement') {
      return this.requestSupplement(applicationId, currentStages[0], notes);
    }

    // action === 'approve' - advance to next stage
    return this.advanceToNextStage(applicationId, app, currentStages[0]);
  }

  /**
   * Advance to the next sequential stage after completing current stage(s).
   */
  private async advanceToNextStage(
    applicationId: number,
    app: any,
    currentStage: any,
  ) {
    const currentFlow = STAGE_FLOW.find(f => f.name === currentStage.stageName);
    const nextFlow = STAGE_FLOW.find(f => f.order === (currentFlow?.order || 0) + 1);

    if (!nextFlow) {
      // All 7 stages completed - approved!
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.APPROVED, approvedAt: new Date() },
      });

      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: '申请已批准',
        message: `恭喜！您的申请 ${app.applicationNo}（${app.drugName}）已通过全部7个审评阶段，获得药品注册证书`,
        type: 'approval',
      });

      return prisma.application.findUnique({
        where: { id: applicationId },
        include: { stages: true, applicant: true },
      });
    }

    // Start next stage(s): parallel stages create multiple records
    const nextStages = await prisma.applicationStage.findMany({
      where: { applicationId, stageName: nextFlow.name },
    });

    for (const ns of nextStages) {
      await this.startStage(ns.id, applicationId);
    }

    // Notify reviewers
    await notificationService.createForRole('reviewer', {
      applicationId: app.id,
      title: '审评阶段推进',
      message: `申请 ${app.applicationNo}（${app.drugName}）已进入"${nextFlow.label}"阶段`,
      type: 'stage_change',
    });

    // Notify applicant
    await notificationService.create({
      userId: app.applicantId,
      applicationId: app.id,
      title: '审评阶段更新',
      message: `您的申请 ${app.applicationNo}（${app.drugName}）已进入"${nextFlow.label}"阶段`,
      type: 'stage_change',
    });

    return prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
  }

  /**
   * Request supplement: create a DeficiencyLetter record with round number,
   * set clockStoppedAt on the stage, and pause the current stage.
   */
  private async requestSupplement(
    applicationId: number,
    currentStage: any,
    notes?: string,
    track?: string,
  ) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { applicant: true },
    });

    // Calculate round number: count existing deficiency letters for this stage + 1
    const existingLetters = await prisma.deficiencyLetter.count({
      where: { applicationId, stageId: currentStage.id },
    });
    const round = existingLetters + 1;

    if (round > DEFICIENCY_ROUNDS.MAX_ROUNDS) {
      throw new AppError(`已达到最大发补轮次（${DEFICIENCY_ROUNDS.MAX_ROUNDS}轮），请做出最终决定`);
    }

    const dueDate = dayjs().add(DEFICIENCY_ROUNDS.RESPONSE_DEADLINE_DAYS, 'day').toDate();

    // Create DeficiencyLetter
    await prisma.deficiencyLetter.create({
      data: {
        applicationId,
        stageId: currentStage.id,
        round,
        track: track || currentStage.reviewTrack || null,
        dueDate,
        status: 'issued',
        questions: JSON.stringify([{ notes: notes || '需要补充资料' }]),
      },
    });

    // Pause stage and set clock stopped
    await prisma.applicationStage.update({
      where: { id: currentStage.id },
      data: {
        status: STAGE_STATUS.PAUSED,
        clockStoppedAt: new Date(),
        notes: notes || '需要补充资料',
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: APPLICATION_STATUS.SUPPLEMENT_NEEDED },
    });

    await notificationService.create({
      userId: app!.applicantId,
      applicationId: app!.id,
      title: '需要补充资料',
      message: `您的申请 ${app!.applicationNo}（${app!.drugName}）在"${this.getStageLabel(currentStage.stageName)}"阶段需要补充资料（第${round}轮），截止日期: ${dayjs(dueDate).format('YYYY-MM-DD')}`,
      type: 'supplement_request',
    });

    return prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
  }

  /**
   * Resume review after supplement completion.
   * Sets clockRestartedAt on the paused stage and completes the open DeficiencyLetter.
   */
  async resumeReview(applicationId: number, userId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true },
    });
    if (!app) throw new AppError('申请不存在', 404);
    if (app.applicantId !== userId) throw new AppError('只能操作自己的申请', 403);
    if (app.status !== APPLICATION_STATUS.SUPPLEMENT_NEEDED) throw new AppError('当前状态不需要补充资料');

    const pausedStage = app.stages.find(s => s.status === STAGE_STATUS.PAUSED);
    if (!pausedStage) throw new AppError('没有找到需要补正的阶段');

    const flowConfig = STAGE_FLOW.find(f => f.name === pausedStage.stageName);
    const deadline = dayjs().add(flowConfig?.days || 30, 'day').toDate();

    // Set clockRestartedAt on stage
    await prisma.applicationStage.update({
      where: { id: pausedStage.id },
      data: {
        status: STAGE_STATUS.IN_PROGRESS,
        deadline,
        clockRestartedAt: new Date(),
        notes: `${pausedStage.notes}\n[${new Date().toISOString()}] 申请人已补正资料`,
      },
    });

    // Complete the open DeficiencyLetter for this stage
    const openLetter = await prisma.deficiencyLetter.findFirst({
      where: {
        applicationId,
        stageId: pausedStage.id,
        status: 'issued',
      },
      orderBy: { round: 'desc' },
    });

    if (openLetter) {
      await prisma.deficiencyLetter.update({
        where: { id: openLetter.id },
        data: {
          status: 'responded',
          responseDate: new Date(),
        },
      });
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: APPLICATION_STATUS.UNDER_REVIEW },
    });

    await notificationService.createForRole('reviewer', {
      applicationId: app.id,
      title: '补正已提交',
      message: `申请 ${app.applicationNo}（${app.drugName}）已补正资料，请继续审评`,
      type: 'stage_change',
    });

    return prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
  }

  /**
   * Assign a reviewer to a stage.
   */
  async assignReviewer(stageId: number, reviewerId: number) {
    const reviewer = await prisma.user.findUnique({ where: { id: reviewerId } });
    if (!reviewer || (reviewer.role !== 'reviewer' && reviewer.role !== 'approver')) {
      throw new AppError('指定的用户不是审评员或审批人');
    }

    return prisma.applicationStage.update({
      where: { id: stageId },
      data: { assignedReviewerId: reviewerId },
    });
  }

  /**
   * Get all deficiency letters for an application, ordered by round descending.
   */
  async getDeficiencyLetters(applicationId: number) {
    return prisma.deficiencyLetter.findMany({
      where: { applicationId },
      include: {
        stage: { select: { id: true, stageName: true, reviewTrack: true } },
      },
      orderBy: { round: 'desc' },
    });
  }

  /**
   * Get review clock status for an application.
   * Returns running/stopped state, total stopped days, and per-stage clock info.
   */
  async getReviewClockStatus(applicationId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true },
    });
    if (!app) throw new AppError('申请不存在', 404);

    let totalStoppedMs = 0;
    const stageClocks: Array<{
      stageName: string;
      track: string | null;
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

      stageClocks.push({
        stageName: stage.stageName,
        track: stage.reviewTrack || null,
        status: stage.status,
        stoppedAt: stoppedAt || null,
        restartedAt: restartedAt || null,
        stoppedDays,
      });
    }

    const isRunning = app.stages.some(s => s.status === 'in_progress');
    const isStopped = app.stages.some(s => s.status === 'paused');
    const totalStoppedDays = Math.ceil(totalStoppedMs / (1000 * 60 * 60 * 24));

    let clockStatus: 'running' | 'stopped' | 'completed';
    if (isStopped) {
      clockStatus = 'stopped';
    } else if (isRunning) {
      clockStatus = 'running';
    } else {
      clockStatus = 'completed';
    }

    return {
      applicationId,
      applicationNo: app.applicationNo,
      clockStatus,
      totalStoppedDays,
      stages: stageClocks,
    };
  }

  // ============================================================
  // FDA Workflow
  // ============================================================

  /**
   * Submit an FDA application - creates FDA review stages.
   */
  async submitFDAApplication(applicationId: number, userId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true, fdaInfo: true },
    });

    if (!app) throw new AppError('申请不存在', 404);
    if (app.applicantId !== userId) throw new AppError('只能提交自己的申请', 403);
    if (app.status !== 'draft') throw new AppError('只能提交草稿状态的申请');
    if (!app.fdaInfo) throw new AppError('请先填写FDA注册信息（DUNS/FEI/ESG）');

    const applicationNo = this.generateFDAApplicationNo(app.type);

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
          submittedAt: new Date(),
        },
      }),
      prisma.applicationStage.createMany({ data: stages }),
    ]);

    // Auto-start first FDA stage
    const firstFlow = FDA_REVIEW_FLOW[0];
    const stageRecord = await prisma.applicationStage.findFirst({
      where: { applicationId, stageName: firstFlow.name },
    });
    if (stageRecord) {
      const deadline = dayjs().add(firstFlow.days, 'day').toDate();
      await prisma.applicationStage.update({
        where: { id: stageRecord.id },
        data: {
          status: STAGE_STATUS.IN_PROGRESS,
          startedAt: new Date(),
          deadline,
        },
      });
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.UNDER_REVIEW },
      });
    }

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
    if (!app) throw new AppError('申请不存在', 404);

    const currentStage = app.stages.find(s => s.status === 'in_progress');
    if (!currentStage) throw new AppError('没有正在进行的FDA审评阶段');

    await prisma.applicationStage.update({
      where: { id: currentStage.id },
      data: {
        status: STAGE_STATUS.COMPLETED,
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
        data: { status: STAGE_STATUS.PAUSED, notes: notes || 'FDA: 需要补充资料' },
      });
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.SUPPLEMENT_NEEDED },
      });
      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: 'FDA需要补充资料',
        message: `您的FDA申请 ${app.applicationNo}（${app.drugName}）需要补充资料`,
        type: 'supplement_request',
      });
      return prisma.application.findUnique({
        where: { id: applicationId },
        include: { stages: true, applicant: true },
      });
    }

    // Advance to next FDA stage
    const currentFlow = FDA_REVIEW_FLOW.find(f => f.name === currentStage.stageName);
    const nextFlow = FDA_REVIEW_FLOW.find(f => f.order === (currentFlow?.order || 0) + 1);

    if (!nextFlow) {
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

    const nextStage = await prisma.applicationStage.findFirst({
      where: { applicationId, stageName: nextFlow.name },
    });
    if (nextStage) {
      const deadline = dayjs().add(nextFlow.days, 'day').toDate();
      await prisma.applicationStage.update({
        where: { id: nextStage.id },
        data: {
          status: STAGE_STATUS.IN_PROGRESS,
          startedAt: new Date(),
          deadline,
        },
      });
    }

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

  // ============================================================
  // EMA Workflow
  // ============================================================

  /**
   * Submit an EMA application - creates EMA review stages (CP by default).
   */
  async submitEMAApplication(applicationId: number, userId: number) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true, emaInfo: true },
    });

    if (!app) throw new AppError('申请不存在', 404);
    if (app.applicantId !== userId) throw new AppError('只能提交自己的申请', 403);
    if (app.status !== 'draft') throw new AppError('只能提交草稿状态的申请');
    if (!app.emaInfo) throw new AppError('请先填写EMA注册信息（程序类型/RMS/CMS）');

    const procedureType = app.emaInfo.procedureType || 'CP';
    const applicationNo = this.generateEMAApplicationNo(procedureType);

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
          submittedAt: new Date(),
        },
      }),
      prisma.applicationStage.createMany({ data: stages }),
    ]);

    // Auto-start first EMA stage
    const firstFlow = EMA_REVIEW_FLOW[0];
    const stageRecord = await prisma.applicationStage.findFirst({
      where: { applicationId, stageName: firstFlow.name },
    });
    if (stageRecord) {
      const deadline = dayjs().add(firstFlow.days, 'day').toDate();
      await prisma.applicationStage.update({
        where: { id: stageRecord.id },
        data: {
          status: STAGE_STATUS.IN_PROGRESS,
          startedAt: new Date(),
          deadline,
        },
      });
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.UNDER_REVIEW },
      });
    }

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
   */
  async advanceEMAStage(applicationId: number, userId: number, action: string, notes?: string) {
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { stages: true, applicant: true },
    });
    if (!app) throw new AppError('申请不存在', 404);

    const currentStage = app.stages.find(s => s.status === 'in_progress');
    if (!currentStage) throw new AppError('没有正在进行的EMA审评阶段');

    await prisma.applicationStage.update({
      where: { id: currentStage.id },
      data: {
        status: STAGE_STATUS.COMPLETED,
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
        data: { status: STAGE_STATUS.PAUSED, notes: notes || 'EMA: 问题列表(LoQ)' },
      });
      await prisma.application.update({
        where: { id: applicationId },
        data: { status: APPLICATION_STATUS.SUPPLEMENT_NEEDED },
      });
      await notificationService.create({
        userId: app.applicantId,
        applicationId: app.id,
        title: 'EMA需要补充资料（LoQ）',
        message: `您的EMA申请 ${app.applicationNo} 收到问题列表(LoQ)，请尽快回复`,
        type: 'supplement_request',
      });
      return prisma.application.findUnique({
        where: { id: applicationId },
        include: { stages: true, applicant: true },
      });
    }

    // Advance to next EMA stage
    const currentFlow = EMA_REVIEW_FLOW.find(f => f.name === currentStage.stageName);
    const nextFlow = EMA_REVIEW_FLOW.find(f => f.order === (currentFlow?.order || 0) + 1);

    if (!nextFlow) {
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

    const nextStage = await prisma.applicationStage.findFirst({
      where: { applicationId, stageName: nextFlow.name },
    });
    if (nextStage) {
      const deadline = dayjs().add(nextFlow.days, 'day').toDate();
      await prisma.applicationStage.update({
        where: { id: nextStage.id },
        data: {
          status: STAGE_STATUS.IN_PROGRESS,
          startedAt: new Date(),
          deadline,
        },
      });
    }

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

  // ============================================================
  // CTD Modules
  // ============================================================

  /**
   * Auto-create all 5 CTD modules and their sub-modules when an application is created.
   */
  async createCTDModules(applicationId: number) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new AppError('申请不存在', 404);

    // Check if modules already exist
    const existing = await prisma.cTDModule.findFirst({
      where: { applicationId },
    });
    if (existing) return { message: 'CTD模块已存在', applicationId };

    // Build all modules and sub-modules
    const createdModules: any[] = [];
    for (const moduleKey of Object.keys(CTD_MODULE_TREE)) {
      const template = CTD_MODULE_TREE[moduleKey as keyof typeof CTD_MODULE_TREE];

      const mod = await prisma.cTDModule.create({
        data: {
          applicationId,
          moduleNumber: template.number,
          moduleName: template.name,
          subModules: {
            create: template.subs.map(sub => ({
              subNumber: sub.number,
              subName: sub.name,
              isRequired: !sub.number.match(/^3\.2\.S\.(1|2|3|4|5|6|7)$/)
                ? true
                : ['3.2.S.1', '3.2.S.2', '3.2.S.3', '3.2.S.4', '3.2.S.5', '3.2.S.6', '3.2.S.7'].includes(sub.number),
            })),
          },
        },
        include: {
          subModules: true,
        },
      });

      createdModules.push(mod);
    }

    const totalSubs = createdModules.reduce((sum, m) => sum + m.subModules.length, 0);

    return {
      applicationId,
      moduleCount: createdModules.length,
      totalSubModules: totalSubs,
      modules: createdModules,
    };
  }

  // ============================================================
  // Private Helpers
  // ============================================================

  private generateApplicationNo(type: string): string {
    const prefix = type.toUpperCase();
    const year = dayjs().format('YYYY');
    const seq = Math.floor(Math.random() * 90000) + 10000;
    return `${prefix}${year}${seq}`;
  }

  private generateFDAApplicationNo(type: string): string {
    const prefix = type.toUpperCase() === 'NDA' ? 'NDA' : type.toUpperCase();
    const year = dayjs().format('YYYY');
    const seq = Math.floor(Math.random() * 900) + 100;
    return `${prefix}${year}${seq}`;
  }

  private generateEMAApplicationNo(procedureType: string): string {
    const prefix = procedureType === 'CP' ? 'EMEA/H/C' : 'EMEA/H/X';
    const year = dayjs().format('YYYY');
    const seq = Math.floor(Math.random() * 900) + 100;
    return `${prefix}/${seq}/${year}`;
  }

  private getTypeLabel(type: string): string {
    const map: Record<string, string> = {
      IND: '药物临床试验',
      NDA: '新药上市许可',
      ANDA: '仿制药',
      supplementary: '补充',
      renewal: '再注册',
      BLA: '生物制品许可',
      variation: '变更',
    };
    return map[type] || type;
  }

  private getStageLabel(name: string): string {
    const flow = STAGE_FLOW.find(f => f.name === name);
    return flow?.label || name;
  }

  private getFDAStageLabel(name: string): string {
    const flow = FDA_REVIEW_FLOW.find(f => f.name === name);
    return flow?.label || name;
  }

  private getEMAStageLabel(name: string): string {
    const flow = EMA_REVIEW_FLOW.find(f => f.name === name);
    return flow?.label || name;
  }
}

export const workflowService = new WorkflowService();
