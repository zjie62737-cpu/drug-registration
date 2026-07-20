import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { documentService } from '../services/document.service';
import { AppError } from '../utils/errors';

export class DocumentController {
  async getByApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await documentService.getByApplication(parseInt(req.params.id));
      res.json(docs);
    } catch (err) {
      next(err);
    }
  }

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('请选择要上传的文件');
      }

      const doc = await documentService.upload({
        applicationId: parseInt(req.params.id),
        documentType: req.body.documentType || '其他',
        fileName: req.file.originalname,
        filePath: req.file.path,
        uploadedById: req.user!.userId,
      });

      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  }

  async download(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.getById(parseInt(req.params.id));
      const absPath = path.resolve(doc.filePath);
      res.download(absPath, doc.fileName);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await documentService.delete(
        parseInt(req.params.id),
        req.user!.userId,
        req.user!.role
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const documentController = new DocumentController();
