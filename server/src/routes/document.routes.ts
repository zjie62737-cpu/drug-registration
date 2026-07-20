import { Router } from 'express';
import { documentController } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/applications/:id', (req, res, next) => documentController.getByApplication(req, res, next));
router.post(
  '/applications/:id',
  roleMiddleware('applicant', 'admin'),
  upload.single('file'),
  (req, res, next) => documentController.upload(req, res, next)
);
router.get('/:id/download', (req, res, next) => documentController.download(req, res, next));
router.delete('/:id', (req, res, next) => documentController.delete(req, res, next));

export default router;
