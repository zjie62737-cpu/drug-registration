import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始播种数据...');

  // === 创建注册体系 ===
  const systems = await Promise.all([
    prisma.regulatorySystem.upsert({
      where: { code: 'NMPA' },
      update: {},
      create: {
        code: 'NMPA',
        name: '中国NMPA',
        fullName: '国家药品监督管理局 National Medical Products Administration',
      },
    }),
    prisma.regulatorySystem.upsert({
      where: { code: 'FDA' },
      update: {},
      create: {
        code: 'FDA',
        name: '美国FDA',
        fullName: '美国食品药品监督管理局 U.S. Food and Drug Administration',
      },
    }),
    prisma.regulatorySystem.upsert({
      where: { code: 'EMA' },
      update: {},
      create: {
        code: 'EMA',
        name: '欧盟EMA',
        fullName: '欧洲药品管理局 European Medicines Agency',
      },
    }),
  ]);
  console.log('✅ 注册体系: NMPA / FDA / EMA');

  // === 创建用户 ===
  const adminHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', passwordHash: adminHash, realName: '系统管理员', organization: '国家药品监督管理局', role: 'admin', email: 'admin@nmpa.gov.cn' },
  });
  console.log('✅ 管理员: admin / admin123');

  const reviewerHash = await bcrypt.hash('reviewer123', 10);
  await prisma.user.upsert({
    where: { username: 'reviewer1' },
    update: {},
    create: { username: 'reviewer1', passwordHash: reviewerHash, realName: '张审评', organization: '药品审评中心(CDE)', role: 'reviewer', email: 'zhang@cde.org.cn' },
  });

  await prisma.user.upsert({
    where: { username: 'reviewer2' },
    update: {},
    create: { username: 'reviewer2', passwordHash: reviewerHash, realName: '陈审评', organization: '药品审评中心(CDE)', role: 'reviewer', email: 'chen@cde.org.cn' },
  });

  const approverHash = await bcrypt.hash('approver123', 10);
  await prisma.user.upsert({
    where: { username: 'approver1' },
    update: {},
    create: { username: 'approver1', passwordHash: approverHash, realName: '李审批', organization: '国家药品监督管理局', role: 'approver', email: 'li@nmpa.gov.cn' },
  });

  const applicantHash = await bcrypt.hash('applicant123', 10);
  await prisma.user.upsert({
    where: { username: 'applicant1' },
    update: {},
    create: { username: 'applicant1', passwordHash: applicantHash, realName: '王注册', organization: '恒瑞医药股份有限公司', role: 'applicant', email: 'wang@hengrui.com' },
  });

  // FDA/EMA reviewers
  await prisma.user.upsert({
    where: { username: 'fda_reviewer' },
    update: {},
    create: { username: 'fda_reviewer', passwordHash: reviewerHash, realName: 'Sarah Chen', organization: 'FDA CDER', role: 'reviewer', email: 'sarah.chen@fda.hhs.gov' },
  });
  console.log('✅ FDA审评员: fda_reviewer / reviewer123');

  await prisma.user.upsert({
    where: { username: 'ema_reviewer' },
    update: {},
    create: { username: 'ema_reviewer', passwordHash: reviewerHash, realName: 'Marco Rossi', organization: 'EMA CHMP', role: 'reviewer', email: 'marco.rossi@ema.europa.eu' },
  });
  console.log('✅ EMA审评员: ema_reviewer / reviewer123');
  console.log('✅ 审批人: approver1 / approver123');
  console.log('✅ 申请人: applicant1 / applicant123');

  // === 创建示例NMPA NDA申请 ===
  const applicant = await prisma.user.findUnique({ where: { username: 'applicant1' } });
  const nmpaSystem = await prisma.regulatorySystem.findUnique({ where: { code: 'NMPA' } });
  const reviewer = await prisma.user.findUnique({ where: { username: 'reviewer1' } });

  if (applicant && nmpaSystem) {
    const app = await prisma.application.create({
      data: {
        applicationNo: 'NDA20240001',
        regulatorySystemId: nmpaSystem.id,
        type: 'NDA',
        applicationCategory: 'marketing_auth',
        registrationClass: 'class1_innovative',
        drugName: '盐酸莫西沙星片',
        genericName: '莫西沙星',
        tradeName: '倍美力',
        drugType: '化学药品',
        dosageForm: '片剂',
        specification: '0.4g/片',
        indication: '用于治疗成人(≥18岁)敏感菌所致的肺炎、慢性支气管炎急性发作等',
        usageDosage: '口服，每次0.4g，每日一次',
        atcCode: 'J01MA14',
        applicantId: applicant.id,
        manufacturer: '恒瑞医药股份有限公司',
        isOverseas: false,
        productionSite: '江苏省连云港市经济技术开发区',
        status: 'approved',
        priorityReview: true,
        breakthroughTherapy: false,
        orphanDrug: false,
        emergencyUse: false,
        isSmallEnterprise: false,
        feePayer: '申请人',
        submittedAt: new Date('2024-01-15'),
        approvedAt: new Date('2024-08-20'),
      },
    });
    console.log(`✅ 示例申请: ${app.applicationNo} - ${app.drugName} (已批准)`);

    // 企业信息
    await prisma.enterpriseInfo.create({
      data: {
        applicationId: app.id,
        businessLicense: '91320700MA1XXXXXX',
        productionLicense: '苏20160001',
        gmpCertificate: 'CN20230001',
        legalRepresentative: '孙飘扬',
        contactPerson: '王注册',
        contactPhone: '0518-8546XXXX',
        contactMobile: '138XXXXXXXX',
        contactEmail: 'wang@hengrui.com',
        productionAddress: '江苏省连云港市经济技术开发区黄河路38号',
        mailingAddress: '江苏省连云港市经济技术开发区黄河路38号',
        qualityDirector: '张质量',
      },
    });

    // 专利声明
    await prisma.patentDeclaration.create({
      data: {
        applicationId: app.id,
        patentNo: 'ZL20241000001.0',
        patentOwner: '恒瑞医药股份有限公司',
        grantDate: new Date('2023-06-01'),
        hasForeignPatent: true,
        nonInfringement: true,
      },
    });

    // CRO
    await prisma.cROInfo.create({
      data: {
        applicationId: app.id,
        orgName: '北京协和医院临床药理研究中心',
        responsiblePerson: '刘教授',
        contactInfo: '010-6915XXXX',
        studyPhase: 'III期临床试验',
      },
    });

    // CTD模块
    const ctdModuleData = [
      { number: '1', name: '行政信息和法规信息', subs: [
        { num: '1.1', name: '申请表' }, { num: '1.2', name: '专利声明' },
        { num: '1.3', name: '生产企业资质' }, { num: '1.4', name: '注册代理机构证明' },
        { num: '1.5', name: '加快上市注册程序申请' },
      ]},
      { number: '2', name: 'CTD总结', subs: [
        { num: '2.1', name: '通用技术文档目录' }, { num: '2.2', name: 'CTD前言' },
        { num: '2.3', name: '质量综述(QOS)' }, { num: '2.4', name: '非临床综述' },
        { num: '2.5', name: '临床综述' }, { num: '2.6', name: '非临床文字总结和列表总结' },
        { num: '2.7', name: '临床总结' },
      ]},
      { number: '3', name: '质量(CMC)', subs: [
        { num: '3.2.S.1', name: '原料药-基本信息' }, { num: '3.2.S.2', name: '原料药-生产' },
        { num: '3.2.S.3', name: '原料药-特性鉴定' }, { num: '3.2.S.4', name: '原料药-质量控制' },
        { num: '3.2.S.5', name: '原料药-对照品' }, { num: '3.2.S.6', name: '原料药-包装系统' },
        { num: '3.2.S.7', name: '原料药-稳定性' }, { num: '3.2.P.1', name: '制剂-处方' },
        { num: '3.2.P.2', name: '制剂-产品开发' }, { num: '3.2.P.3', name: '制剂-生产' },
        { num: '3.2.P.4', name: '制剂-辅料控制' }, { num: '3.2.P.5', name: '制剂-质量控制' },
        { num: '3.2.P.6', name: '制剂-对照品' }, { num: '3.2.P.7', name: '制剂-包装系统' },
        { num: '3.2.P.8', name: '制剂-稳定性' },
      ]},
      { number: '4', name: '非临床研究报告', subs: [
        { num: '4.1', name: '药理学报告' }, { num: '4.2', name: '药代动力学报告' },
        { num: '4.3', name: '毒理学报告' },
      ]},
      { number: '5', name: '临床研究报告', subs: [
        { num: '5.1', name: '生物等效性报告' }, { num: '5.2', name: '临床药理学报告' },
        { num: '5.3', name: '临床疗效报告' }, { num: '5.4', name: '临床安全性报告' },
      ]},
    ];

    for (const mod of ctdModuleData) {
      const ctdMod = await prisma.cTDModule.create({
        data: {
          applicationId: app.id,
          moduleNumber: mod.number,
          moduleName: mod.name,
        },
      });
      for (const sub of mod.subs) {
        await prisma.cTDSubModule.create({
          data: {
            ctdModuleId: ctdMod.id,
            subNumber: sub.num,
            subName: sub.name,
            isRequired: true,
          },
        });
      }
    }
    console.log('✅ CTD文档结构已创建 (5模块, 32子模块)');

    // 创建审评阶段（7核心CDE阶段 + 技术审评三线并行）
    const nmpaStages = [
      { name: 'acceptance', order: 1, label: '受理', days: 5 },
      { name: 'formal_review', order: 2, label: '形式审查', days: 10 },
      { name: 'technical_review', order: 3, label: '技术审评（三线并行）', days: 200 },
      { name: 'onsite_inspection', order: 4, label: '现场核查（并行）', days: 20 },
      { name: 'sample_testing', order: 5, label: '样品检验（并行）', days: 30 },
      { name: 'administrative_approval', order: 6, label: '行政审批', days: 20 },
      { name: 'certificate_issuance', order: 7, label: '制证送达', days: 10 },
    ];

    const reviewer2 = await prisma.user.findUnique({ where: { username: 'reviewer2' } });

    for (const stage of nmpaStages) {
      const startedDate = new Date('2024-01-15');
      startedDate.setDate(startedDate.getDate() + (stage.order - 1) * 30);
      const completedDate = new Date(startedDate);
      completedDate.setDate(completedDate.getDate() + stage.days);
      const deadlineDate = new Date(startedDate);
      deadlineDate.setDate(deadlineDate.getDate() + stage.days + 5);

      await prisma.applicationStage.create({
        data: {
          applicationId: app.id,
          stageName: stage.name,
          stageOrder: stage.order,
          status: 'completed',
          assignedReviewerId: reviewer?.id || null,
          startedAt: startedDate,
          completedAt: completedDate,
          deadline: deadlineDate,
          // 技术审评阶段标记平行三线（已全部完成）
          reviewTrack: stage.name === 'technical_review' ? 'pharmaceutical' : null,
        },
      });
    }

    // 技术审评阶段额外创建三条审评线的记录
    const techStage = await prisma.applicationStage.findFirst({
      where: { applicationId: app.id, stageName: 'technical_review' },
    });
    if (techStage) {
      const tracks = ['pharmaceutical', 'nonclinical', 'clinical'];
      for (const track of tracks) {
        await prisma.applicationStage.create({
          data: {
            applicationId: app.id,
            stageName: 'technical_review',
            stageOrder: 3,
            status: 'completed',
            reviewTrack: track,
            trackStatus: 'completed',
            assignedReviewerId: track === 'nonclinical' ? (reviewer2?.id || reviewer?.id) : reviewer?.id,
            startedAt: new Date('2024-03-15'),
            completedAt: new Date('2024-07-15'),
            deadline: new Date('2024-08-01'),
          },
        });
      }
    }
    console.log('✅ 12阶段审评流程已创建(全部已完成)');
  }

  console.log('');
  console.log('📋 测试账号:');
  console.log('  角色         用户名          密码');
  console.log('  管理员       admin            admin123');
  console.log('  审评员(NMPA) reviewer1        reviewer123');
  console.log('  审评员(NMPA) reviewer2        reviewer123');
  console.log('  审评员(FDA)  fda_reviewer     reviewer123');
  console.log('  审评员(EMA)  ema_reviewer     reviewer123');
  console.log('  审批人       approver1        approver123');
  console.log('  申请人       applicant1       applicant123');
  console.log('');
  console.log('🌱 数据播种完成!');
}

main()
  .catch((e) => { console.error('播种失败:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
