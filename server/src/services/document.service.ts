import { PrismaClient } from '@prisma/client';
import { AppError, NotFoundError } from '../utils/errors';

const prisma = new PrismaClient();

export class DocumentService {
  async getByApplication(applicationId: number) {
    return prisma.document.findMany({
      where: { applicationId },
      include: {
        uploadedBy: { select: { id: true, realName: true } },
      },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async upload(data: {
    applicationId: number;
    documentType: string;
    fileName: string;
    filePath: string;
    uploadedById: number;
  }) {
    const app = await prisma.application.findUnique({ where: { id: data.applicationId } });
    if (!app) throw new NotFoundError('申请不存在');

    return prisma.document.create({
      data: {
        applicationId: data.applicationId,
        documentType: data.documentType,
        fileName: data.fileName,
        filePath: data.filePath,
        uploadedById: data.uploadedById,
      },
      include: {
        uploadedBy: { select: { id: true, realName: true } },
      },
    });
  }

  async getById(id: number) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundError('文件不存在');
    return doc;
  }

  async delete(id: number, userId: number, role: string) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundError('文件不存在');

    const app = await prisma.application.findUnique({ where: { id: doc.applicationId } });
    if (!app) throw new NotFoundError('申请不存在');

    // 只有文件上传者、申请人和管理员可以删除
    if (doc.uploadedById !== userId && app.applicantId !== userId && role !== 'admin') {
      throw new AppError('无权限删除此文件', 403);
    }

    await prisma.document.delete({ where: { id } });
    return { message: '删除成功' };
  }
}

export const documentService = new DocumentService();
