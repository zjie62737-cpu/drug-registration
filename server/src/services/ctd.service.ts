import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../utils/errors';
import { CTD_MODULE_TREE, getAllCTDSubs } from '../utils/constants';

const prisma = new PrismaClient();

export class CTDService {
  /**
   * Get the full CTD document tree for an application,
   * including all modules, sub-modules, and uploaded documents.
   */
  async getTree(applicationId: number) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        ctdModules: {
          include: {
            subModules: {
              include: {
                documents: {
                  include: {
                    uploadedBy: { select: { id: true, realName: true } },
                  },
                  orderBy: { uploadedAt: 'desc' },
                },
              },
              orderBy: { subNumber: 'asc' },
            },
          },
          orderBy: { moduleNumber: 'asc' },
        },
      },
    });

    if (!application) throw new NotFoundError('申请不存在');

    // Build full tree with template structure
    const tree: any[] = [];
    for (const moduleKey of Object.keys(CTD_MODULE_TREE)) {
      const template = CTD_MODULE_TREE[moduleKey as keyof typeof CTD_MODULE_TREE];
      const dbModule = application.ctdModules.find(m => m.moduleNumber === template.number);

      const subModules = template.subs.map(tplSub => {
        const dbSub = dbModule?.subModules.find(s => s.subNumber === tplSub.number);
        return {
          id: dbSub?.id || null,
          subNumber: tplSub.number,
          subName: tplSub.name,
          isRequired: tplSub.number.includes('3.2.S')
            ? ['3.2.S.1', '3.2.S.2', '3.2.S.3', '3.2.S.4', '3.2.S.5', '3.2.S.6', '3.2.S.7'].includes(tplSub.number)
            : true,
          documentCount: dbSub?.documents.length || 0,
          documents: dbSub?.documents || [],
        };
      });

      tree.push({
        id: dbModule?.id || null,
        moduleNumber: template.number,
        moduleName: template.name,
        subModuleCount: subModules.length,
        uploadedDocCount: subModules.reduce((sum, s) => sum + s.documentCount, 0),
        subModules,
      });
    }

    return {
      applicationId,
      modules: tree,
    };
  }

  /**
   * Get completion statistics for CTD modules.
   */
  async getCompletionStats(applicationId: number) {
    const modules = await prisma.cTDModule.findMany({
      where: { applicationId },
      include: {
        subModules: {
          include: {
            documents: { select: { id: true } },
          },
        },
      },
    });

    const allSubs = getAllCTDSubs();
    const requiredSubs = allSubs.filter(s => s.isRequired);

    let totalRequired = requiredSubs.length;
    let completedRequired = 0;

    const moduleStats: Array<{
      moduleNumber: string;
      moduleName: string;
      totalSubs: number;
      completedSubs: number;
      totalDocs: number;
    }> = [];

    for (const moduleKey of Object.keys(CTD_MODULE_TREE)) {
      const template = CTD_MODULE_TREE[moduleKey as keyof typeof CTD_MODULE_TREE];
      const dbModule = modules.find(m => m.moduleNumber === template.number);

      const subKeys = template.subs.map(s => s.number);
      const requiredInModule = requiredSubs.filter(s => s.moduleNumber === template.number);
      let moduleCompleted = 0;
      let moduleTotalDocs = 0;

      if (dbModule) {
        for (const sub of dbModule.subModules) {
          if (sub.documents.length > 0) {
            moduleCompleted++;
            if (requiredInModule.some(r => r.subNumber === sub.subNumber)) {
              completedRequired++;
            }
          }
          moduleTotalDocs += sub.documents.length;
        }
      }

      moduleStats.push({
        moduleNumber: template.number,
        moduleName: template.name,
        totalSubs: template.subs.length,
        completedSubs: moduleCompleted,
        totalDocs: moduleTotalDocs,
      });
    }

    const completionPercentage = totalRequired > 0
      ? Math.round((completedRequired / totalRequired) * 100)
      : 0;

    return {
      applicationId,
      totalRequiredSubs: totalRequired,
      completedRequiredSubs: completedRequired,
      completionPercentage,
      moduleStats,
    };
  }

  /**
   * Get status of all modules for an application.
   */
  async getModuleStatus(applicationId: number) {
    const modules = await prisma.cTDModule.findMany({
      where: { applicationId },
      include: {
        subModules: {
          include: {
            documents: {
              select: { id: true, docStatus: true, fileName: true },
            },
          },
        },
      },
      orderBy: { moduleNumber: 'asc' },
    });

    if (modules.length === 0) {
      throw new NotFoundError('该申请尚未创建CTD模块');
    }

    return modules.map(mod => ({
      id: mod.id,
      moduleNumber: mod.moduleNumber,
      moduleName: mod.moduleName,
      subModules: mod.subModules.map(sub => ({
        id: sub.id,
        subNumber: sub.subNumber,
        subName: sub.subName,
        isRequired: sub.isRequired,
        documentCount: sub.documents.length,
        hasAcceptedDoc: sub.documents.some(d => d.docStatus === 'accepted'),
        documents: sub.documents,
      })),
    }));
  }

  /**
   * Create all CTD modules and sub-modules for an application.
   */
  async createCTDModules(applicationId: number) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) throw new NotFoundError('申请不存在');

    // Check if modules already exist
    const existing = await prisma.cTDModule.findFirst({
      where: { applicationId },
    });
    if (existing) return { message: 'CTD模块已存在', applicationId };

    const allSubs = getAllCTDSubs();

    // Group subs by module number
    const subsByModule = new Map<string, typeof allSubs>();
    for (const sub of allSubs) {
      const existing = subsByModule.get(sub.moduleNumber) || [];
      existing.push(sub);
      subsByModule.set(sub.moduleNumber, existing);
    }

    // Create each module with its sub-modules
    const createdModules: any[] = [];
    for (const [moduleNumber, subs] of subsByModule) {
      const template = CTD_MODULE_TREE[`module${moduleNumber}` as keyof typeof CTD_MODULE_TREE];
      const moduleName = template?.name || `模块${moduleNumber}`;

      const mod = await prisma.cTDModule.create({
        data: {
          applicationId,
          moduleNumber,
          moduleName,
          subModules: {
            create: subs.map(sub => ({
              subNumber: sub.subNumber,
              subName: sub.subName,
              isRequired: sub.isRequired,
            })),
          },
        },
        include: {
          subModules: true,
        },
      });

      createdModules.push(mod);
    }

    return {
      applicationId,
      moduleCount: createdModules.length,
      totalSubModules: allSubs.length,
      modules: createdModules,
    };
  }

  /**
   * Upload a document to a specific sub-module.
   */
  async uploadToSubModule(params: {
    applicationId: number;
    subModuleId: number;
    documentType: string;
    fileName: string;
    filePath: string;
    uploadedById: number;
  }) {
    const subModule = await prisma.cTDSubModule.findUnique({
      where: { id: params.subModuleId },
      include: { ctdModule: true },
    });

    if (!subModule) throw new NotFoundError('CTD子模块不存在');
    if (subModule.ctdModule.applicationId !== params.applicationId) {
      throw new NotFoundError('子模块不属于该申请');
    }

    return prisma.document.create({
      data: {
        applicationId: params.applicationId,
        ctdSubModuleId: params.subModuleId,
        documentType: params.documentType,
        fileName: params.fileName,
        filePath: params.filePath,
        uploadedById: params.uploadedById,
      },
      include: {
        uploadedBy: { select: { id: true, realName: true } },
        ctdSubModule: { select: { id: true, subNumber: true, subName: true } },
      },
    });
  }

  /**
   * Get documents for a specific sub-module.
   */
  async getSubModuleDocuments(subModuleId: number) {
    const subModule = await prisma.cTDSubModule.findUnique({
      where: { id: subModuleId },
      include: {
        documents: {
          include: {
            uploadedBy: { select: { id: true, realName: true } },
          },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!subModule) throw new NotFoundError('子模块不存在');
    return subModule;
  }
}

export const ctdService = new CTDService();
