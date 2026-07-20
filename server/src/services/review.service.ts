import { PrismaClient } from '@prisma/client';
import { AppError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export class ReviewService {
  async getByApplication(applicationId: number) {
    return prisma.review.findMany({
      where: { applicationId },
      include: {
        reviewer: { select: { id: true, realName: true, role: true } },
        stage: { select: { id: true, stageName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    applicationId: number;
    stageId?: number;
    reviewerId: number;
    content: string;
    action?: string;
    isInternal?: boolean;
  }) {
    if (!data.content.trim()) {
      throw new AppError('审评意见不能为空');
    }

    const app = await prisma.application.findUnique({ where: { id: data.applicationId } });
    if (!app) throw new NotFoundError('申请不存在');

    return prisma.review.create({
      data: {
        applicationId: data.applicationId,
        stageId: data.stageId || null,
        reviewerId: data.reviewerId,
        content: data.content,
        action: data.action || 'comment',
        isInternal: data.isInternal || false,
      },
      include: {
        reviewer: { select: { id: true, realName: true, role: true } },
      },
    });
  }

  async getReviewerTasks(reviewerId: number) {
    // 获取分配给审评员的所有待处理阶段
    const stages = await prisma.applicationStage.findMany({
      where: {
        assignedReviewerId: reviewerId,
        status: { in: ['in_progress', 'paused'] },
      },
      include: {
        application: {
          include: {
            applicant: { select: { id: true, realName: true, organization: true } },
          },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    return stages;
  }

  async getPendingStages() {
    // 获取所有未分配的进行中阶段（审评员可以认领）
    return prisma.applicationStage.findMany({
      where: {
        status: 'in_progress',
        assignedReviewerId: null,
      },
      include: {
        application: {
          include: {
            applicant: { select: { id: true, realName: true, organization: true } },
          },
        },
      },
      orderBy: { deadline: 'asc' },
    });
  }
}

export const reviewService = new ReviewService();
