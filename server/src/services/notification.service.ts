import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificationService {
  async create(data: {
    userId: number;
    applicationId?: number;
    title: string;
    message: string;
    type: string;
  }) {
    return prisma.notification.create({ data });
  }

  async createForRole(role: string, data: {
    applicationId?: number;
    title: string;
    message: string;
    type: string;
  }) {
    const users = await prisma.user.findMany({ where: { role } });
    const notifications = users.map(user =>
      prisma.notification.create({
        data: {
          userId: user.id,
          applicationId: data.applicationId,
          title: data.title,
          message: data.message,
          type: data.type,
        },
      })
    );
    return Promise.all(notifications);
  }

  async getByUser(userId: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { application: { select: { applicationNo: true, drugName: true } } },
    });
  }

  async getUnreadCount(userId: number) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: number, userId: number) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

export const notificationService = new NotificationService();
