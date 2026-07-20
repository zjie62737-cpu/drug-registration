import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { applicationService } from '../services/application.service';
import { emaService } from '../services/ema.service';
import { fdaService } from '../services/fda.service';
import { REGULATORY_SYSTEMS } from '../utils/constants';

const prisma = new PrismaClient();

export class PortalController {
  /**
   * List all regulatory systems with basic info.
   */
  async getSystems(_req: Request, res: Response, next: NextFunction) {
    try {
      const systems = await prisma.regulatorySystem.findMany({
        orderBy: { id: 'asc' },
      });
      res.json(systems);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get detailed stats for a specific regulatory system.
   */
  async getSystemStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      const system = await prisma.regulatorySystem.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!system) {
        res.status(404).json({ error: '注册体系不存在' });
        return;
      }

      const stats = await applicationService.getStats(
        req.user!.userId,
        req.user!.role,
        system.id
      );

      const applications = await prisma.application.findMany({
        where: { regulatorySystemId: system.id },
        include: {
          applicant: { select: { id: true, realName: true, organization: true } },
          stages: {
            where: { status: 'in_progress' },
            select: { stageName: true, status: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      });

      res.json({
        system,
        stats,
        recentApplications: applications,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get EMA-specific info: procedure types and member states.
   */
  async getEMAInfo(_req: Request, res: Response, next: NextFunction) {
    try {
      const procedures = emaService.getProcedureTypes();
      const memberStates = emaService.getMemberStates();
      res.json({ procedures, memberStates });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get FDA-specific filing checklist for a given application type.
   */
  async getFDAChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.query;
      const checklist = fdaService.getFilingChecklist((type as string) || 'NDA');
      res.json(checklist);
    } catch (err) {
      next(err);
    }
  }
}

export const portalController = new PortalController();
