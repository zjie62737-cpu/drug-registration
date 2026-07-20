import { Router } from 'express';
import { portalController } from '../controllers/portal.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// List all regulatory systems (public)
router.get('/systems', (req, res, next) => portalController.getSystems(req, res, next));

router.use(authMiddleware);

// Get stats for a specific regulatory system
router.get('/systems/:code/stats', (req, res, next) => portalController.getSystemStats(req, res, next));

// Get EMA-specific info (procedures, member states)
router.get('/ema/info', (req, res, next) => portalController.getEMAInfo(req, res, next));

// Get FDA filing checklist
router.get('/fda/checklist', (req, res, next) => portalController.getFDAChecklist(req, res, next));

export default router;
