import { Router } from 'express';
import { applicationController } from '../controllers/application.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);

// CRUD
router.get('/', (req, res, next) => applicationController.list(req, res, next));
router.post('/', roleMiddleware('applicant', 'admin'), (req, res, next) => applicationController.create(req, res, next));
router.get('/:id', (req, res, next) => applicationController.getById(req, res, next));
router.put('/:id', roleMiddleware('applicant', 'admin'), (req, res, next) => applicationController.update(req, res, next));
router.delete('/:id', roleMiddleware('applicant', 'admin'), (req, res, next) => applicationController.delete(req, res, next));

// NMPA Workflow
router.post('/:id/submit', roleMiddleware('applicant', 'admin'), (req, res, next) => applicationController.submit(req, res, next));
router.put('/:id/advance-stage', roleMiddleware('reviewer', 'approver', 'admin'), (req, res, next) => applicationController.advanceStage(req, res, next));
router.post('/:id/resume', roleMiddleware('applicant', 'admin'), (req, res, next) => applicationController.resumeReview(req, res, next));

// FDA Workflow
router.post('/:id/fda/submit', roleMiddleware('applicant', 'admin'), (req, res, next) => applicationController.submitFDA(req, res, next));
router.put('/:id/fda/advance-stage', roleMiddleware('reviewer', 'approver', 'admin'), (req, res, next) => applicationController.advanceFDAStage(req, res, next));

// EMA Workflow
router.post('/:id/ema/submit', roleMiddleware('applicant', 'admin'), (req, res, next) => applicationController.submitEMA(req, res, next));
router.put('/:id/ema/advance-stage', roleMiddleware('reviewer', 'approver', 'admin'), (req, res, next) => applicationController.advanceEMAStage(req, res, next));

// CTD Modules
router.post('/:id/ctd/create', roleMiddleware('applicant', 'admin'), (req, res, next) => applicationController.createCTDModules(req, res, next));

export default router;
