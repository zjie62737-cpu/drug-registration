import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError, NotFoundError, ConflictError } from '../utils/errors';

const prisma = new PrismaClient();

export class UserController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          realName: true,
          organization: true,
          role: true,
          email: true,
          phone: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      res.json(users);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(req.params.id) },
        select: {
          id: true,
          username: true,
          realName: true,
          organization: true,
          role: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      });
      if (!user) throw new NotFoundError('用户不存在');
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password, realName, organization, role, email, phone } = req.body;

      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) throw new ConflictError('用户名已存在');

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          passwordHash,
          realName,
          organization,
          role: role || 'applicant',
          email,
          phone,
        },
        select: {
          id: true,
          username: true,
          realName: true,
          organization: true,
          role: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      });

      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { realName, organization, role, email, phone } = req.body;
      const userId = parseInt(req.params.id);

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError('用户不存在');

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          realName: realName ?? user.realName,
          organization: organization ?? user.organization,
          role: role ?? user.role,
          email: email ?? user.email,
          phone: phone ?? user.phone,
        },
        select: {
          id: true,
          username: true,
          realName: true,
          organization: true,
          role: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id);
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError('用户不存在');

      // 不允许删除自己
      if (userId === req.user!.userId) {
        throw new AppError('不能删除自己');
      }

      await prisma.user.delete({ where: { id: userId } });
      res.json({ message: '删除成功' });
    } catch (err) {
      next(err);
    }
  }
}

export const userController = new UserController();
