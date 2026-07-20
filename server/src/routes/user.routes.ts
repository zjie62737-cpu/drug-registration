import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { roleMiddleware } from '../middleware/role.middleware';

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/', (req, res, next) => userController.list(req, res, next));
router.get('/:id', (req, res, next) => userController.getById(req, res, next));
router.post('/', (req, res, next) => userController.create(req, res, next));
router.put('/:id', (req, res, next) => userController.update(req, res, next));
router.delete('/:id', (req, res, next) => userController.delete(req, res, next));

export default router;
