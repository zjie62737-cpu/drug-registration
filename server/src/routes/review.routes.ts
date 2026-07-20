import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/tasks', roleMiddleware('reviewer', 'approver', 'admin'), (req, res, next) => reviewController.getMyTasks(req, res, next));
router.get('/pending-stages', roleMiddleware('reviewer', 'approver', 'admin'), (req, res, next) => reviewController.getPendingStages(req, res, next));
router.get('/applications/:id', (req, res, next) => reviewController.getByApplication(req, res, next));
router.post('/applications/:id', roleMiddleware('reviewer', 'approver', 'admin'), (req, res, next) => reviewController.create(req, res, next));

export default router;
