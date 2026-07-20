import { Request, Response, NextFunction } from 'express';
import { applicationService } from '../services/application.service';
import { workflowService } from '../services/workflow.service';

export class ApplicationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, type, regulatorySystemId, applicationCategory, registrationClass, search, page, pageSize } = req.query;
      const result = await applicationService.list({
        userId: req.user!.userId,
        role: req.user!.role,
        status: status as string,
        type: type as string,
        regulatorySystemId: regulatorySystemId ? parseInt(regulatorySystemId as string) : undefined,
        applicationCategory: applicationCategory as string,
        registrationClass: registrationClass as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await applicationService.getById(
        parseInt(req.params.id),
        req.user!.userId,
        req.user!.role
      );
      res.json(app);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await applicationService.create({
        ...req.body,
        applicantId: req.user!.userId,
      });
      res.status(201).json(app);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await applicationService.update(
        parseInt(req.params.id),
        req.user!.userId,
        req.body
      );
      res.json(app);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await applicationService.delete(
        parseInt(req.params.id),
        req.user!.userId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // ============================================================
  // NMPA Workflow
  // ============================================================

  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await workflowService.submitApplication(
        parseInt(req.params.id),
        req.user!.userId
      );
      res.json(app);
    } catch (err) {
      next(err);
    }
  }

  async advanceStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, notes } = req.body;
      const app = await workflowService.advanceStage(
        parseInt(req.params.id),
        req.user!.userId,
        action,
        notes
      );
      res.json(app);
    } catch (err) {
      next(err);
    }
  }

  async resumeReview(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await workflowService.resumeReview(
        parseInt(req.params.id),
        req.user!.userId
      );
      res.json(app);
    } catch (err) {
      next(err);
    }
  }

  // ============================================================
  // FDA Workflow
  // ============================================================

  async submitFDA(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await workflowService.submitFDAApplication(
        parseInt(req.params.id),
        req.user!.userId
      );
      res.json(app);
    } catch (err) {
      next(err);
    }
  }

  async advanceFDAStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, notes } = req.body;
      const app = await workflowService.advanceFDAStage(
        parseInt(req.params.id),
        req.user!.userId,
        action,
        notes
      );
      res.json(app);
    } catch (err) {
      next(err);
    }
  }

  // ============================================================
  // EMA Workflow
  // ============================================================

  async submitEMA(req: Request, res: Response, next: NextFunction) {
    try {
      const app = await workflowService.submitEMAApplication(
        parseInt(req.params.id),
        req.user!.userId
      );
      res.json(app);
    } catch (err) {
      next(err);
    }
  }

  async advanceEMAStage(req: Request, res: Response, next: NextFunction) {
    try {
      const { action, notes } = req.body;
      const app = await workflowService.advanceEMAStage(
        parseInt(req.params.id),
        req.user!.userId,
        action,
        notes
      );
      res.json(app);
    } catch (err) {
      next(err);
    }
  }

  // ============================================================
  // CTD Modules
  // ============================================================

  async createCTDModules(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workflowService.createCTDModules(parseInt(req.params.id));
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const applicationController = new ApplicationController();
