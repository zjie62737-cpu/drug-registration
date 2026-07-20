export const APPLICATION_TYPES: Record<string, string> = {
  IND: '药物临床试验申请',
  NDA: '新药上市许可申请',
  ANDA: '仿制药申请',
  supplementary: '补充申请',
  renewal: '再注册申请',
};

export const APPLICATION_STATUS: Record<string, { label: string; color: string }> = {
  draft: { label: '草稿', color: 'default' },
  submitted: { label: '已提交', color: 'blue' },
  under_review: { label: '审评中', color: 'processing' },
  supplement_needed: { label: '需补充资料', color: 'warning' },
  approved: { label: '已批准', color: 'success' },
  rejected: { label: '不予批准', color: 'error' },
};

export const STAGE_LABELS: Record<string, string> = {
  acceptance: '受理',
  formal_review: '形式审查',
  technical_review: '技术审评',
  onsite_inspection: '现场核查',
  sample_testing: '样品检验',
  administrative_approval: '行政审批',
  certificate_issuance: '制证送达',
};

export const STAGE_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: '待开始', color: 'default' },
  in_progress: { label: '进行中', color: 'processing' },
  paused: { label: '暂停中', color: 'warning' },
  completed: { label: '已完成', color: 'success' },
  skipped: { label: '已跳过', color: 'default' },
};

export const DRUG_TYPES = ['化学药品', '生物制品', '中药', '天然药物'];

export const DOCUMENT_TYPES = [
  '申请表',
  '药学资料',
  '药理毒理资料',
  '临床资料',
  '质量标准',
  '说明书',
  '检验报告',
  '委托书',
  '其他',
];

export const ROLE_LABELS: Record<string, string> = {
  admin: '系统管理员',
  reviewer: '审评员',
  approver: '审批人',
  applicant: '申请人',
};

export const REVIEW_ACTIONS: Record<string, string> = {
  approve: '通过',
  request_supplement: '要求补充资料',
  reject: '不通过',
  comment: '评论',
};

// ─── Theme ──────────────────────────────────────────────────────────
export const THEME_COLOR = '#1A5C9E';

// ─── NMPA Registration Classes ──────────────────────────────────────
export const NMPA_REGISTRATION_CLASSES: Record<string, string> = {
  chem_class_1: '化药1类 - 创新药',
  chem_class_2: '化药2类 - 改良型新药',
  chem_class_3: '化药3类 - 仿制境外已上市',
  chem_class_4: '化药4类 - 仿制境内已上市',
  chem_class_5: '化药5类 - 境外上市境内未上市',
  bio_class_1: '生物制品1类 - 创新型生物制品',
  bio_class_2: '生物制品2类 - 改良型生物制品',
  bio_class_3: '生物制品3类 - 生物类似药',
  bio_class_4: '生物制品4类 - 其他生物制品',
  tcm_class_1: '中药1类 - 中药创新药',
  tcm_class_2: '中药2类 - 中药改良型新药',
  tcm_class_3: '中药3类 - 经典名方',
  tcm_class_4: '中药4类 - 同名同方药',
  tcm_class_5: '中药5类 - 古代经典名方',
  tcm_class_6: '中药6类 - 中药复方制剂',
  tcm_class_7: '中药7类 - 已上市中药变更',
  tcm_class_8: '中药8类 - 天然药物',
  tcm_class_9: '中药9类 - 其他',
};

export const NMPA_APPLICATION_CATEGORIES: Record<string, string> = {
  clinical_trial: '临床试验申请',
  marketing_auth: '上市许可申请',
  supplementary: '补充申请',
  renewal: '再注册',
  change: '变更申请',
};

export const DOSAGE_FORMS = [
  '片剂', '胶囊剂', '颗粒剂', '注射剂', '口服液',
  '软膏剂', '乳膏剂', '凝胶剂', '贴剂', '气雾剂',
  '喷雾剂', '滴眼剂', '滴鼻剂', '栓剂', '丸剂',
  '散剂', '合剂', '糖浆剂', '酊剂', '洗剂',
];

export const ATC_CATEGORIES: Record<string, string> = {
  A: '消化道及代谢',
  B: '血液和造血器官',
  C: '心血管系统',
  D: '皮肤病用药',
  G: '泌尿生殖系统及性激素',
  H: '除性激素外的全身激素制剂',
  J: '全身用抗感染药',
  L: '抗肿瘤药及免疫调节剂',
  M: '肌肉-骨骼系统',
  N: '神经系统',
  P: '抗寄生虫药',
  R: '呼吸系统',
  S: '感觉器官',
  V: '其他',
};

// ─── Technical Review Tracks (平行三线审评) ────────────────────
// Matches server TR TECHNICAL_REVIEW_TRACKS
export const TECHNICAL_REVIEW_TRACKS: Record<string, string> = {
  pharmaceutical: '药学审评（CMC）',
  nonclinical: '非临床审评（Pharm-Tox）',
  clinical: '临床审评（Clinical）',
};

// ─── Deficiency Letter Labels ──────────────────────────────────
export const DEFICIENCY_LETTER_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: '待补正', color: 'warning' },
  responded: { label: '已补正', color: 'success' },
  overdue: { label: '逾期未补', color: 'error' },
};

export const DEFICIENCY_ROUNDS = {
  MAX_ROUNDS: 4,
  RESPONSE_DEADLINE_DAYS: 120,
  CLOCK_STOP_LABEL: '审评时钟暂停',
  CLOCK_RESTART_LABEL: '审评时钟恢复',
};

// ─── NMPA Review Timelines ─────────────────────────────────────
// 依据《药品注册管理办法》2020年版
export const NMPA_REVIEW_TIMELINES: Record<string, string> = {
  IND: '药物临床试验：60个工作日（第87条）',
  NDA: '新药上市许可：标准200个工作日 / 优先审评130个工作日（第96条）',
  ANDA: '仿制药上市许可：标准200个工作日（第96条）',
  supplementary: '补充申请：60个工作日（第98条）',
  renewal: '再注册：120个工作日（第100条）',
};
export const FDA_APPLICATION_TYPES: Record<string, string> = {
  IND: 'Investigational New Drug',
  NDA: 'New Drug Application',
  BLA: 'Biologics License Application',
  ANDA: 'Abbreviated New Drug Application',
  supplement: 'Supplement',
  pre_IND: 'Pre-IND Consultation',
};

// ─── EMA Procedure Types ────────────────────────────────────────────
export const EMA_PROCEDURE_TYPES: Record<string, string> = {
  CP: 'Centralised Procedure',
  DCP: 'Decentralised Procedure',
  MRP: 'Mutual Recognition Procedure',
  INP: 'Independent National Procedure',
};

// ─── FDA Review Timelines ───────────────────────────────────────────
export const FDA_REVIEW_TIMELINES: Record<string, string> = {
  IND: '30-day safety review',
  NDA: 'Standard: 10-12 months / Priority: 6-8 months',
  BLA: 'Standard: 10-12 months / Priority: 6-8 months',
  ANDA: '12-18 months (GDUFA)',
  pre_IND: '60-day response to meeting request',
};

// ─── EMA Review Timelines ───────────────────────────────────────────
export const EMA_REVIEW_TIMELINES: Record<string, string> = {
  CP: 'Active review: 210 days + EC decision: 67 days',
  DCP: '90 days assessment + national phase',
  MRP: '90 days assessment + national phase',
  INP: 'Varies by member state (~12-18 months)',
};

// ─── CTD Module Tree ────────────────────────────────────────────────
export const CTD_MODULE_TREE_DATA = [
  {
    key: 'mod1',
    code: 'Module 1',
    name: '行政信息和法规信息',
    description: 'Administrative Information and Prescribing Information',
    documentCount: 8,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm1-1', code: '1.1', name: '申请表', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-2', code: '1.2', name: '证明性文件（注册证、GMP证书）', documentCount: 2, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-3', code: '1.3', name: '专利信息及权属声明', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-4', code: '1.4', name: '说明书', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-5', code: '1.5', name: '包装标签', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-6', code: '1.6', name: '质量标准', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-7', code: '1.7', name: '检验报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod2',
    code: 'Module 2',
    name: '通用技术文件摘要',
    description: 'Quality Overall Summaries',
    documentCount: 7,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm2-1', code: '2.1', name: 'CTD目录', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-2', code: '2.2', name: 'CTD引言', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-3', code: '2.3', name: '质量综述 (QOS)', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-4', code: '2.4', name: '非临床综述', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-5', code: '2.5', name: '临床综述', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-6', code: '2.6', name: '非临床总结', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-7', code: '2.7', name: '临床总结', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod3',
    code: 'Module 3',
    name: '质量',
    description: 'Quality (CMC Information)',
    documentCount: 5,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm3-1', code: '3.1', name: '原料药信息', documentCount: 3, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-2', code: '3.2', name: '制剂信息（处方、工艺）', documentCount: 2, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-3', code: '3.3', name: '辅料信息', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-4', code: '3.4', name: '质量标准（放行/货架期）', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-5', code: '3.5', name: '稳定性研究', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod4',
    code: 'Module 4',
    name: '非临床研究报告',
    description: 'Nonclinical Study Reports',
    documentCount: 4,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm4-1', code: '4.1', name: '药理学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm4-2', code: '4.2', name: '药代动力学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm4-3', code: '4.3', name: '毒理学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm4-4', code: '4.4', name: '其他非临床研究', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod5',
    code: 'Module 5',
    name: '临床研究报告',
    description: 'Clinical Study Reports',
    documentCount: 5,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm5-1', code: '5.1', name: '临床研究报告列表', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-2', code: '5.2', name: '生物利用度/生物等效性', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-3', code: '5.3', name: '药代动力学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-4', code: '5.4', name: '药效学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-5', code: '5.5', name: '有效性/安全性报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
];

// ─── FDA CTD Module Tree (English labels) ──────────────────────────
export const FDA_MODULE_TREE_DATA = [
  {
    key: 'mod1',
    code: 'Module 1',
    name: 'Administrative Information & Prescribing Information',
    description: 'FDA-specific administrative forms and labeling',
    documentCount: 8,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm1-1', code: '1.1', name: 'Form FDA 356h (Application Form)', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-2', code: '1.2', name: 'Cover Letter & Table of Contents', documentCount: 2, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-3', code: '1.3', name: 'Patent Information & Certifications', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-4', code: '1.4', name: 'Prescribing Information (Labeling)', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-5', code: '1.5', name: 'Container Labels & Carton Labeling', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-6', code: '1.6', name: 'Environmental Assessment', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-7', code: '1.7', name: 'User Fee Cover Sheet (Form FDA 3397)', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod2',
    code: 'Module 2',
    name: 'CTD Summaries / 通用技术文件摘要',
    description: 'Quality Overall Summaries',
    documentCount: 7,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm2-1', code: '2.1', name: 'CTD Table of Contents / CTD目录', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-2', code: '2.2', name: 'CTD Introduction / CTD引言', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-3', code: '2.3', name: 'Quality Overall Summary (QOS) / 质量综述', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-4', code: '2.4', name: 'Nonclinical Overview / 非临床综述', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-5', code: '2.5', name: 'Clinical Overview / 临床综述', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-6', code: '2.6', name: 'Nonclinical Summaries / 非临床总结', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-7', code: '2.7', name: 'Clinical Summaries / 临床总结', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod3',
    code: 'Module 3',
    name: 'Quality / 质量',
    description: 'Quality (CMC Information)',
    documentCount: 5,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm3-1', code: '3.1', name: 'Drug Substance / 原料药信息', documentCount: 3, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-2', code: '3.2', name: 'Drug Product / 制剂信息', documentCount: 2, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-3', code: '3.3', name: 'Excipients / 辅料信息', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-4', code: '3.4', name: 'Specifications / 质量标准', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-5', code: '3.5', name: 'Stability / 稳定性研究', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod4',
    code: 'Module 4',
    name: 'Nonclinical Study Reports / 非临床研究报告',
    description: 'Nonclinical Study Reports',
    documentCount: 4,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm4-1', code: '4.1', name: 'Pharmacology / 药理学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm4-2', code: '4.2', name: 'Pharmacokinetics / 药代动力学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm4-3', code: '4.3', name: 'Toxicology / 毒理学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm4-4', code: '4.4', name: 'Other Nonclinical Studies / 其他非临床研究', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod5',
    code: 'Module 5',
    name: 'Clinical Study Reports / 临床研究报告',
    description: 'Clinical Study Reports',
    documentCount: 5,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm5-1', code: '5.1', name: 'Clinical Study Report List / 临床研究报告列表', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-2', code: '5.2', name: 'Bioavailability/Bioequivalence / 生物利用度/生物等效性', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-3', code: '5.3', name: 'Pharmacokinetics Reports / 药代动力学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-4', code: '5.4', name: 'Pharmacodynamics Reports / 药效学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-5', code: '5.5', name: 'Efficacy/Safety Reports / 有效性/安全性报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
];

// ─── EMA CTD Module Tree (English labels with EU-specific Module 1) ──
export const EMA_MODULE_TREE_DATA = [
  {
    key: 'mod1',
    code: 'Module 1',
    name: 'Administrative Information (EU-Specific)',
    description: 'EU Module 1 — Administrative and Prescribing Information',
    documentCount: 8,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm1-1', code: '1.0', name: 'Cover Letter & Application Form', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-2', code: '1.2', name: 'SmPC, Labelling & Package Leaflet', documentCount: 2, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-3', code: '1.3', name: 'GMP Certificates & QP Declaration', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-4', code: '1.4', name: 'Expert Reports (Quality/Nonclinical/Clinical)', documentCount: 3, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-5', code: '1.5', name: 'Environmental Risk Assessment (ERA)', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-6', code: '1.6', name: 'Risk Management Plan (RMP)', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm1-7', code: '1.7', name: 'PIP Compliance Statement & Orphan Designation', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod2',
    code: 'Module 2',
    name: 'CTD Summaries / 通用技术文件摘要',
    description: 'Quality Overall Summaries',
    documentCount: 7,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm2-1', code: '2.1', name: 'CTD Table of Contents / CTD目录', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-2', code: '2.2', name: 'CTD Introduction / CTD引言', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-3', code: '2.3', name: 'Quality Overall Summary (QOS) / 质量综述', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-4', code: '2.4', name: 'Nonclinical Overview / 非临床综述', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-5', code: '2.5', name: 'Clinical Overview / 临床综述', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-6', code: '2.6', name: 'Nonclinical Summaries / 非临床总结', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm2-7', code: '2.7', name: 'Clinical Summaries / 临床总结', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod3',
    code: 'Module 3',
    name: 'Quality / 质量',
    description: 'Quality (CMC Information)',
    documentCount: 5,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm3-1', code: '3.1', name: 'Drug Substance / 原料药信息', documentCount: 3, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-2', code: '3.2', name: 'Drug Product / 制剂信息', documentCount: 2, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-3', code: '3.3', name: 'Excipients / 辅料信息', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-4', code: '3.4', name: 'Specifications / 质量标准', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm3-5', code: '3.5', name: 'Stability / 稳定性研究', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod4',
    code: 'Module 4',
    name: 'Nonclinical Study Reports / 非临床研究报告',
    description: 'Nonclinical Study Reports',
    documentCount: 4,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm4-1', code: '4.1', name: 'Pharmacology / 药理学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm4-2', code: '4.2', name: 'Pharmacokinetics / 药代动力学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm4-3', code: '4.3', name: 'Toxicology / 毒理学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm4-4', code: '4.4', name: 'Other Nonclinical Studies / 其他非临床研究', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
  {
    key: 'mod5',
    code: 'Module 5',
    name: 'Clinical Study Reports / 临床研究报告',
    description: 'Clinical Study Reports',
    documentCount: 5,
    uploadedCount: 0,
    uploadStatus: 'not_uploaded' as const,
    children: [
      { key: 'm5-1', code: '5.1', name: 'Clinical Study Report List / 临床研究报告列表', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-2', code: '5.2', name: 'Bioavailability/Bioequivalence / 生物利用度/生物等效性', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-3', code: '5.3', name: 'Pharmacokinetics Reports / 药代动力学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-4', code: '5.4', name: 'Pharmacodynamics Reports / 药效学报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
      { key: 'm5-5', code: '5.5', name: 'Efficacy/Safety Reports / 有效性/安全性报告', documentCount: 1, uploadedCount: 0, uploadStatus: 'not_uploaded' as const },
    ],
  },
];

export const NMPA_REGISTRATION_TYPES_OPTIONS = [
  { value: 'IND', label: 'IND - 药物临床试验申请' },
  { value: 'NDA', label: 'NDA - 新药上市许可申请' },
  { value: 'ANDA', label: 'ANDA - 仿制药申请' },
  { value: 'supplementary', label: '补充申请' },
  { value: 'renewal', label: '再注册申请' },
];

export const NMPA_REG_CLASS_OPTIONS = [
  { value: 'chem_class_1', label: '化药1类 - 创新药' },
  { value: 'chem_class_2', label: '化药2类 - 改良型新药' },
  { value: 'chem_class_3', label: '化药3类 - 仿制境外已上市' },
  { value: 'chem_class_4', label: '化药4类 - 仿制境内已上市' },
  { value: 'chem_class_5', label: '化药5类 - 境外上市境内未上市' },
  { value: 'bio_class_1', label: '生物制品1类 - 创新型生物制品' },
  { value: 'bio_class_2', label: '生物制品2类 - 改良型生物制品' },
  { value: 'bio_class_3', label: '生物制品3类 - 生物类似药' },
  { value: 'bio_class_4', label: '生物制品4类 - 其他生物制品' },
  { value: 'tcm_class_1', label: '中药1类 - 中药创新药' },
  { value: 'tcm_class_3', label: '中药3类 - 经典名方' },
  { value: 'tcm_class_4', label: '中药4类 - 同名同方药' },
];
