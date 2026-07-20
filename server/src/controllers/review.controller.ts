import { Request, Response, NextFunction } from 'express';
import { reviewService } from '../services/review.service';

export class ReviewController {
  async getByApplication(req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewService.getByApplication(parseInt(req.params.id));
      res.json(reviews);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.create({
        applicationId: parseInt(req.params.id),
        stageId: req.body.stageId ? parseInt(req.body.stageId) : undefined,
        reviewerId: req.user!.userId,
        content: req.body.content,
        action: req.body.action,
        isInternal: req.body.isInternal,
      });
      res.status(201).json(review);
    } catch (err) {
      next(err);
    }
  }

  async getMyTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await reviewService.getReviewerTasks(req.user!.userId);
      res.json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async getPendingStages(_req: Request, res: Response, next: NextFunction) {
    try {
      const stages = await reviewService.getPendingStages();
      res.json(stages);
    } catch (err) {
      next(err);
    }
  }
}

export const reviewController = new ReviewController();
