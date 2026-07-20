import { Request, Response, NextFunction } from 'express';
import { ctdService } from '../services/ctd.service';
import { AppError } from '../utils/errors';

export class CTDController {
  async getTree(req: Request, res: Response, next: NextFunction) {
    try {
      const tree = await ctdService.getTree(parseInt(req.params.id));
      res.json(tree);
    } catch (err) {
      next(err);
    }
  }

  async getModuleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const status = await ctdService.getModuleStatus(parseInt(req.params.id));
      res.json(status);
    } catch (err) {
      next(err);
    }
  }

  async getCompletionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ctdService.getCompletionStats(parseInt(req.params.id));
      res.json(stats);
    } catch (err) {
      next(err);
    }
  }

  async uploadToSubModule(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('请选择要上传的文件');
      }

      const doc = await ctdService.uploadToSubModule({
        applicationId: parseInt(req.params.id),
        subModuleId: parseInt(req.params.subModuleId),
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

  async getSubModuleDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const docs = await ctdService.getSubModuleDocuments(parseInt(req.params.subModuleId));
      res.json(docs);
    } catch (err) {
      next(err);
    }
  }
}

export const ctdController = new CTDController();
