import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/stats', (req, res, next) => dashboardController.stats(req, res, next));
router.get('/activities', (req, res, next) => dashboardController.activities(req, res, next));
router.get('/notifications', (req, res, next) => dashboardController.notifications(req, res, next));
router.put('/notifications/:id/read', (req, res, next) => dashboardController.markNotificationRead(req, res, next));
router.put('/notifications/read-all', (req, res, next) => dashboardController.markAllNotificationsRead(req, res, next));

export default router;
