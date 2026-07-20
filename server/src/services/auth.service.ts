import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signToken } from '../utils/jwt';
import { AppError, ConflictError, NotFoundError, UnauthorizedError } from '../utils/errors';

const prisma = new PrismaClient();

export class AuthService {
  async register(data: {
    username: string;
    password: string;
    realName: string;
    organization: string;
    role?: string;
    email?: string;
    phone?: string;
  }) {
    const existing = await prisma.user.findUnique({ where: { username: data.username } });
    if (existing) {
      throw new ConflictError('用户名已存在');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        username: data.username,
        passwordHash,
        realName: data.realName,
        organization: data.organization,
        role: data.role || 'applicant',
        email: data.email,
        phone: data.phone,
      },
    });

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async login(username: string, password: string) {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('用户名或密码错误');
    }

    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async getCurrentUser(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }
    return this.sanitizeUser(user);
  }

  async changePassword(userId: number, oldPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('用户不存在');
    }

    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) {
      throw new AppError('原密码错误');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: '密码修改成功' };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

export const authService = new AuthService();
