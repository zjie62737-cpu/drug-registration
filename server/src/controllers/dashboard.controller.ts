import { Request, Response, NextFunction } from 'express';
import { applicationService } from '../services/application.service';
import { notificationService } from '../services/notification.service';

export class DashboardController {
  async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationStats = await applicationService.getStats(
        req.user!.userId,
        req.user!.role
      );
      const unreadCount = await notificationService.getUnreadCount(req.user!.userId);

      res.json({
        ...applicationStats,
        unreadNotifications: unreadCount,
      });
    } catch (err) {
      next(err);
    }
  }

  async activities(req: Request, res: Response, next: NextFunction) {
    try {
      const activities = await applicationService.getRecentActivities(
        req.user!.userId,
        req.user!.role
      );
      res.json(activities);
    } catch (err) {
      next(err);
    }
  }

  async notifications(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await notificationService.getByUser(req.user!.userId);
      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }

  async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAsRead(parseInt(req.params.id), req.user!.userId);
      res.json({ message: '已标记为已读' });
    } catch (err) {
      next(err);
    }
  }

  async markAllNotificationsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      res.json({ message: '全部标记为已读' });
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();
