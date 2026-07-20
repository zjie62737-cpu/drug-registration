export const JWT_SECRET = process.env.JWT_SECRET || 'drug-registration-secret-key-2024';
export const JWT_EXPIRES_IN = '24h';

export const ROLES = {
  APPLICANT: 'applicant',
  REVIEWER: 'reviewer',
  APPROVER: 'approver',
  ADMIN: 'admin',
} as const;

export const APPLICATION_TYPES = {
  IND: 'IND',
  NDA: 'NDA',
  ANDA: 'ANDA',
  SUPPLEMENTARY: 'supplementary',
  RENEWAL: 'renewal',
} as const;

export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  SUPPLEMENT_NEEDED: 'supplement_needed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const STAGE_NAMES = {
  ACCEPTANCE: 'acceptance',
  FORMAL_REVIEW: 'formal_review',
  TECHNICAL_REVIEW: 'technical_review',
  ONSITE_INSPECTION: 'onsite_inspection',
  SAMPLE_TESTING: 'sample_testing',
  ADMINISTRATIVE_APPROVAL: 'administrative_approval',
  CERTIFICATE_ISSUANCE: 'certificate_issuance',
} as const;

export const STAGE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  SKIPPED: 'skipped',
} as const;

// NMPA审评阶段（仅保留CDE监管审查阶段，申报前准备已移至提交向导）
// 审评时限修正依据：《药品注册管理办法》2020年版
export const STAGE_FLOW = [
  { name: STAGE_NAMES.ACCEPTANCE, order: 1, label: '受理', days: 5 },
  { name: STAGE_NAMES.FORMAL_REVIEW, order: 2, label: '形式审查', days: 10 },
  // 技术审评采用平行三线架构（药学/非临床/临床），各自独立推进和发补
  // 审评时限依据《药品注册管理办法》第96条
  { name: STAGE_NAMES.TECHNICAL_REVIEW, order: 3, label: '技术审评', days: 200,
    priorityDays: 130, // 优先审评时限（第96条）
    indDays: 60,       // IND审评时限（第87条）
    parallel: true,     // 标记为平行审评
    tracks: ['pharmaceutical', 'nonclinical', 'clinical'] as const,
  },
  // 现场核查和样品检验与技术审评并行开展（独立由CFDI/NIFDC执行）
  { name: STAGE_NAMES.ONSITE_INSPECTION, order: 4, label: '现场核查（并行）', days: 20, parallel: true },
  { name: STAGE_NAMES.SAMPLE_TESTING, order: 5, label: '样品检验（并行）', days: 30, parallel: true },
  { name: STAGE_NAMES.ADMINISTRATIVE_APPROVAL, order: 6, label: '行政审批', days: 20 },
  { name: STAGE_NAMES.CERTIFICATE_ISSUANCE, order: 7, label: '制证送达', days: 10 },
];

// 技术审评三线并行结构定义
export const TECHNICAL_REVIEW_TRACKS = {
  pharmaceutical: { label: '药学审评（CMC）', icon: 'flask', reviewer: '药学审评员' },
  nonclinical: { label: '非临床审评（Pharm-Tox）', icon: 'microscope', reviewer: '药理毒理审评员' },
  clinical: { label: '临床审评（Clinical）', icon: 'heart', reviewer: '临床审评员' },
} as const;

// 发补轮次定义
export const DEFICIENCY_ROUNDS = {
  MAX_ROUNDS: 4,                    // 最多4轮发补
  RESPONSE_DEADLINE_DAYS: 120,      // 补正期限4个月
  CLOCK_STOP_LABEL: '审评时钟暂停',
  CLOCK_RESTART_LABEL: '审评时钟恢复',
} as const;

export const STAGE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  STAGE_FLOW.map(s => [s.name, s.label])
);

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

export const DRUG_TYPES = ['化学药品', '生物制品', '中药', '天然药物'];

export const REVIEW_ACTIONS = {
  APPROVE: 'approve',
  REQUEST_SUPPLEMENT: 'request_supplement',
  REJECT: 'reject',
  COMMENT: 'comment',
} as const;

// ============================================================
// 注册体系
// ============================================================
export const REGULATORY_SYSTEMS = {
  NMPA: { code: 'NMPA', name: '中国NMPA', fullName: '国家药品监督管理局' },
  FDA: { code: 'FDA', name: '美国FDA', fullName: '美国食品药品监督管理局' },
  EMA: { code: 'EMA', name: '欧盟EMA', fullName: '欧洲药品管理局' },
} as const;

// ============================================================
// 申请分类
// ============================================================
export const APPLICATION_CATEGORIES = {
  CLINICAL_TRIAL: 'clinical_trial',
  MARKETING_AUTH: 'marketing_auth',
  SUPPLEMENT: 'supplement',
  RENEWAL: 'renewal',
  API_REGISTRATION: 'api_registration',
  EXCIPIENT_REGISTRATION: 'excipient_registration',
  PACKAGE_REGISTRATION: 'package_registration',
  VARIATION: 'variation',
} as const;

// ============================================================
// NMPA注册分类
// ============================================================
export const REGISTRATION_CLASSES = {
  CLASS1_INNOVATIVE: 'class1_innovative',
  CLASS2_IMPROVED: 'class2_improved',
  CLASS3_GENERIC: 'class3_generic',
  CLASS4_GENERIC: 'class4_generic',
  CLASS5_OVERSEAS: 'class5_overseas',
} as const;

export const NMPA_CHEMICAL_CLASSES: Record<string, string> = {
  class1_innovative: '化药1类（创新药）',
  class2_improved: '化药2类（改良型新药）',
  class3_generic: '化药3类（境内仿制药）',
  class4_generic: '化药4类（境外仿制药）',
  class5_overseas: '化药5类（境外上市药品）',
};

// ============================================================
// 剂型
// ============================================================
export const DOSAGE_FORMS = [
  'tablet',
  'capsule',
  'injection',
  'cream',
  'ointment',
  'solution',
  'suspension',
  'powder',
  'granule',
  'patch',
  'spray',
  'inhaler',
  'suppository',
  'drop',
  'gel',
] as const;

export const DOSAGE_FORM_LABELS: Record<string, string> = {
  tablet: '片剂',
  capsule: '胶囊',
  injection: '注射剂',
  cream: '乳膏剂',
  ointment: '软膏剂',
  solution: '口服液',
  suspension: '混悬剂',
  powder: '散剂',
  granule: '颗粒剂',
  patch: '贴剂',
  spray: '喷雾剂',
  inhaler: '吸入剂',
  suppository: '栓剂',
  drop: '滴剂',
  gel: '凝胶剂',
};

// ============================================================
// FDA审评流程
// ============================================================
export const FDA_REVIEW_FLOW = [
  { name: 'pre_submission', order: 1, label: 'Pre-Submission', days: 60 },
  { name: 'filing_review', order: 2, label: 'Filing Review', days: 60 },
  { name: 'plan_review', order: 3, label: 'Plan Review', days: 30 },
  { name: 'conduct_review', order: 4, label: 'Conduct Review', days: 180 },
  { name: 'advisory_committee', order: 5, label: 'Advisory Committee', days: 30 },
  { name: 'official_action', order: 6, label: 'Official Action', days: 60 },
  { name: 'post_action_feedback', order: 7, label: 'Post-Action Feedback', days: 30 },
];

// ============================================================
// EMA审评流程 (Centralised Procedure)
// ============================================================
export const EMA_REVIEW_FLOW = [
  { name: 'pre_submission', order: 1, label: 'Pre-Submission', days: 30 },
  { name: 'validation', order: 2, label: 'Validation', days: 14 },
  { name: 'chmp_assessment_day120', order: 3, label: 'CHMP Assessment (D120)', days: 120 },
  { name: 'chmp_assessment_day180', order: 4, label: 'CHMP Assessment (D180)', days: 60 },
  { name: 'chmp_opinion', order: 5, label: 'CHMP Opinion', days: 15 },
  { name: 'ec_decision', order: 6, label: 'EC Decision', days: 67 },
  { name: 'national_implementation', order: 7, label: 'National Implementation', days: 30 },
];

// ============================================================
// CTD模块树结构 (ICH M4)
// ============================================================
export const CTD_MODULE_TREE = {
  module1: {
    number: '1',
    name: '行政信息与处方信息',
    subs: [
      { number: '1.1', name: '申请表与封面信' },
      { number: '1.2', name: '综合目录' },
      { number: '1.3', name: '行政信息' },
      { number: '1.3.1', name: '申请人/上市许可持有人信息' },
      { number: '1.3.2', name: '药品名称与处方组成' },
      { number: '1.3.3', name: '生产商信息' },
      { number: '1.3.4', name: 'GMP证书' },
      { number: '1.4', name: '专家信息' },
      { number: '1.4.1', name: '质量专家声明' },
      { number: '1.4.2', name: '非临床专家声明' },
      { number: '1.4.3', name: '临床专家声明' },
      { number: '1.5', name: '产品信息' },
      { number: '1.5.1', name: '说明书' },
      { number: '1.5.2', name: '标签' },
      { number: '1.5.3', name: '包装样品' },
      { number: '1.6', name: '环境风险评估' },
      { number: '1.7', name: '药品上市后管理信息' },
      { number: '1.8', name: '其他行政信息' },
    ],
  },
  module2: {
    number: '2',
    name: '研究内容概要',
    subs: [
      { number: '2.1', name: 'CTD总目录' },
      { number: '2.2', name: '引言' },
      { number: '2.3', name: '质量总体概要(QOS)' },
      { number: '2.4', name: '非临床综述' },
      { number: '2.5', name: '临床综述' },
      { number: '2.6', name: '非临床概要' },
      { number: '2.6.1', name: '药理学概要' },
      { number: '2.6.2', name: '药代动力学概要' },
      { number: '2.6.3', name: '毒理学概要' },
      { number: '2.6.4', name: '综合评估概要' },
      { number: '2.7', name: '临床概要' },
      { number: '2.7.1', name: '生物药剂学概要' },
      { number: '2.7.2', name: '临床药理学概要' },
      { number: '2.7.3', name: '临床有效性概要' },
      { number: '2.7.4', name: '临床安全性概要' },
      { number: '2.7.5', name: '获益风险评估' },
    ],
  },
  module3: {
    number: '3',
    name: '质量研究资料',
    subs: [
      { number: '3.1', name: '模块3目录' },
      { number: '3.2', name: '主体数据' },
      { number: '3.2.S', name: '原料药' },
      { number: '3.2.S.1', name: '基本信息' },
      { number: '3.2.S.1.1', name: '命名' },
      { number: '3.2.S.1.2', name: '结构' },
      { number: '3.2.S.1.3', name: '基本性质' },
      { number: '3.2.S.2', name: '生产' },
      { number: '3.2.S.2.1', name: '生产商' },
      { number: '3.2.S.2.2', name: '工艺描述与过程控制' },
      { number: '3.2.S.2.3', name: '物料控制' },
      { number: '3.2.S.2.4', name: '关键步骤与中间体控制' },
      { number: '3.2.S.2.5', name: '工艺验证/评价' },
      { number: '3.2.S.2.6', name: '生产工艺开发' },
      { number: '3.2.S.3', name: '特性鉴定' },
      { number: '3.2.S.3.1', name: '结构确证' },
      { number: '3.2.S.3.2', name: '杂质' },
      { number: '3.2.S.4', name: '原料药控制' },
      { number: '3.2.S.4.1', name: '质量标准' },
      { number: '3.2.S.4.2', name: '分析方法' },
      { number: '3.2.S.4.3', name: '分析方法验证' },
      { number: '3.2.S.4.4', name: '批分析' },
      { number: '3.2.S.4.5', name: '质量标准制定依据' },
      { number: '3.2.S.5', name: '标准品/对照品' },
      { number: '3.2.S.6', name: '包装容器与密闭系统' },
      { number: '3.2.S.7', name: '稳定性' },
      { number: '3.2.P', name: '制剂' },
      { number: '3.2.P.1', name: '剂型及产品组成' },
      { number: '3.2.P.2', name: '产品开发' },
      { number: '3.2.P.2.1', name: '处方组成' },
      { number: '3.2.P.2.2', name: '辅料' },
      { number: '3.2.P.2.3', name: '产品开发' },
      { number: '3.2.P.3', name: '生产' },
      { number: '3.2.P.3.1', name: '生产商' },
      { number: '3.2.P.3.2', name: '批处方' },
      { number: '3.2.P.3.3', name: '工艺描述' },
      { number: '3.2.P.3.4', name: '关键步骤控制' },
      { number: '3.2.P.3.5', name: '工艺验证' },
      { number: '3.2.P.4', name: '辅料控制' },
      { number: '3.2.P.4.1', name: '质量标准' },
      { number: '3.2.P.4.2', name: '分析方法' },
      { number: '3.2.P.4.3', name: '分析方法验证' },
      { number: '3.2.P.5', name: '制剂控制' },
      { number: '3.2.P.5.1', name: '质量标准' },
      { number: '3.2.P.5.2', name: '分析方法' },
      { number: '3.2.P.5.3', name: '分析方法验证' },
      { number: '3.2.P.5.4', name: '批分析' },
      { number: '3.2.P.5.5', name: '杂质特性鉴定' },
      { number: '3.2.P.5.6', name: '质量标准制定依据' },
      { number: '3.2.P.6', name: '标准品/对照品' },
      { number: '3.2.P.7', name: '包装容器与密闭系统' },
      { number: '3.2.P.8', name: '稳定性' },
      { number: '3.2.A', name: '附录' },
      { number: '3.2.A.1', name: '设施与设备' },
      { number: '3.2.A.2', name: '外源因子安全性评价' },
      { number: '3.2.A.3', name: '辅料' },
      { number: '3.3', name: '参考文献' },
    ],
  },
  module4: {
    number: '4',
    name: '非临床研究资料',
    subs: [
      { number: '4.1', name: '模块4目录' },
      { number: '4.2', name: '药效学研究' },
      { number: '4.2.1', name: '主要药效学' },
      { number: '4.2.2', name: '次要药效学' },
      { number: '4.2.3', name: '安全药理学' },
      { number: '4.3', name: '药代动力学' },
      { number: '4.3.1', name: '分析方法及验证' },
      { number: '4.3.2', name: '吸收' },
      { number: '4.3.3', name: '分布' },
      { number: '4.3.4', name: '代谢' },
      { number: '4.3.5', name: '排泄' },
      { number: '4.3.6', name: '相互作用' },
      { number: '4.4', name: '毒理学' },
      { number: '4.4.1', name: '单次给药毒性' },
      { number: '4.4.2', name: '重复给药毒性' },
      { number: '4.4.3', name: '遗传毒性' },
      { number: '4.4.4', name: '致癌性' },
      { number: '4.4.5', name: '生殖毒性' },
      { number: '4.4.6', name: '局部耐受性' },
      { number: '4.4.7', name: '其他毒性研究' },
      { number: '4.5', name: '参考文献' },
    ],
  },
  module5: {
    number: '5',
    name: '临床研究资料',
    subs: [
      { number: '5.1', name: '模块5目录' },
      { number: '5.2', name: '所有临床研究列表' },
      { number: '5.3', name: '临床研究报告' },
      { number: '5.3.1', name: '生物药剂学研究报告' },
      { number: '5.3.1.1', name: '生物利用度研究报告' },
      { number: '5.3.1.2', name: '生物等效性研究报告' },
      { number: '5.3.1.3', name: '体外-体内相关性报告' },
      { number: '5.3.2', name: '药代动力学相关研究报告' },
      { number: '5.3.3', name: '人药效学研究报告' },
      { number: '5.3.4', name: '有效性研究报告' },
      { number: '5.3.5', name: '安全性研究报告' },
      { number: '5.3.6', name: '上市后经验' },
      { number: '5.3.7', name: '病例报告表与患者列表' },
      { number: '5.4', name: '参考文献' },
    ],
  },
};

// Flatten all modules into sub-module list for database seeding
export function getAllCTDSubs(): Array<{ moduleNumber: string; subNumber: string; subName: string; isRequired: boolean }> {
  const results: Array<{ moduleNumber: string; subNumber: string; subName: string; isRequired: boolean }> = [];
  for (const moduleKey of Object.keys(CTD_MODULE_TREE)) {
    const mod = CTD_MODULE_TREE[moduleKey as keyof typeof CTD_MODULE_TREE];
    for (const sub of mod.subs) {
      results.push({
        moduleNumber: mod.number,
        subNumber: sub.number,
        subName: sub.name,
        isRequired: !sub.number.includes('3.2.S') || ['3.2.S.1', '3.2.S.2', '3.2.S.3', '3.2.S.4', '3.2.S.5', '3.2.S.6', '3.2.S.7'].includes(sub.number),
      });
    }
  }
  return results;
}
