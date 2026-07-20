import { Router } from 'express';
import { ctdController } from '../controllers/ctd.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authMiddleware);

// Get full CTD document tree for an application
router.get('/applications/:id/tree', (req, res, next) => ctdController.getTree(req, res, next));

// Get module status overview
router.get('/applications/:id/modules/status', (req, res, next) => ctdController.getModuleStatus(req, res, next));

// Get completion statistics
router.get('/applications/:id/modules/stats', (req, res, next) => ctdController.getCompletionStats(req, res, next));

// Upload document to a specific sub-module
router.post(
  '/applications/:id/modules/:subModuleId/upload',
  roleMiddleware('applicant', 'admin'),
  upload.single('file'),
  (req, res, next) => ctdController.uploadToSubModule(req, res, next)
);

// Get documents for a specific sub-module
router.get('/modules/:subModuleId/documents', (req, res, next) => ctdController.getSubModuleDocuments(req, res, next));

export default router;
