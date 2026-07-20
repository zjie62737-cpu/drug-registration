export type RegulatorySystem = 'NMPA' | 'FDA' | 'EMA';

export type NmpaRegistrationClass =
  | 'chem_class_1'
  | 'chem_class_2'
  | 'chem_class_3'
  | 'chem_class_4'
  | 'chem_class_5'
  | 'bio_class_1'
  | 'bio_class_2'
  | 'bio_class_3'
  | 'bio_class_4'
  | 'tcm_class_1'
  | 'tcm_class_2'
  | 'tcm_class_3'
  | 'tcm_class_4'
  | 'tcm_class_5'
  | 'tcm_class_6'
  | 'tcm_class_7'
  | 'tcm_class_8'
  | 'tcm_class_9';

export type NmpaApplicationCategory =
  | 'clinical_trial'
  | 'marketing_auth'
  | 'supplementary'
  | 'renewal'
  | 'change';

export type FdaApplicationType = 'IND' | 'NDA' | 'BLA' | 'ANDA' | 'supplement' | 'pre_IND';
export type EmaProcedureType = 'CP' | 'DCP' | 'MRP' | 'INP';

export type DocumentUploadStatus = 'not_uploaded' | 'uploading' | 'uploaded' | 'rejected';

export interface CTDSubModule {
  key: string;
  code: string;
  name: string;
  documentCount: number;
  uploadedCount: number;
  uploadStatus: DocumentUploadStatus;
  children?: CTDSubModule[];
}

export interface CTDModule {
  key: string;
  code: string;
  name: string;
  description: string;
  documentCount: number;
  uploadedCount: number;
  uploadStatus: DocumentUploadStatus;
  children: CTDSubModule[];
}

export interface CTDDocumentTree {
  applicationId: number;
  modules: CTDModule[];
}

export interface EnterpriseInfo {
  businessLicenseNo: string;
  productionLicenseNo: string;
  gmpCertificate: string;
  legalRepresentative: string;
  contactPerson: string;
  contactPhone: string;
  contactMobile: string;
  contactEmail: string;
  contactFax: string;
  productionAddress: string;
  productionPostalCode: string;
  mailingAddress: string;
  mailingPostalCode: string;
  qualityDirector: string;
  qualityDirectorTitle: string;
}

export interface CROInfo {
  id: string;
  organizationName: string;
  responsiblePerson: string;
  contactInfo: string;
}

export interface PatentDeclaration {
  id: string;
  patentNumber: string;
  patentOwner: string;
  grantDate: string;
  isForeignPatent: boolean;
}

export interface NmpaApplicationFormData {
  // Step 1 - Basic Info
  registrationType: string;
  applicationCategory: NmpaApplicationCategory;
  registrationClass: NmpaRegistrationClass;
  drugNameGeneric: string;
  drugNameTrade: string;
  drugType: string;
  dosageForm: string;
  specification: string;
  indication: string;
  usageAndDosage: string;
  atcCode: string;
  isOverseasProduced: boolean;
  productionSite: string;

  // ANDA-specific fields
  rld: string;                // 参比制剂 (Reference Listed Drug)
  apiDmfReference: string;    // 原料药DMF备案号

  // Step 2 - Enterprise
  enterprise: EnterpriseInfo;
  croList: CROInfo[];

  // Step 3 - Patent & Declarations
  patentList: PatentDeclaration[];
  nonInfringementDeclared: boolean;
  isControlledSubstance: boolean;
  isPriorityReview: boolean;
  isBreakthroughTherapy: boolean;
  isOrphanDrug: boolean;
  isSmallEnterprise: boolean;
  feePayer: string;

  // Step 4 - CTD Docs (references by doc type key)
  ctdDocuments: Record<string, { fileName: string; status: DocumentUploadStatus }>;
}

export interface FDARegistration {
  applicationType: FdaApplicationType;
  drugName: string;
  proprietaryName: string;
  activeIngredient: string;
  dosageForm: string;
  routeOfAdministration: string;
  strength: string;
  applicantName: string;
  applicantAddress: string;
  usAgent: string;
  establishmentRegistrationNo: string;
  feeId: string;
  coverLetter?: string;
}

export interface EMARegistration {
  procedureType: EmaProcedureType;
  drugName: string;
  inventedName: string;
  activeSubstance: string;
  pharmaceuticalForm: string;
  therapeuticArea: string;
  atcCode: string;
  applicantName: string;
  applicantAddress: string;
  rms?: string; // Reference Member State for DCP/MRP
  cmsList?: string[]; // Concerned Member States
  rapporteur?: string;
  coRapporteur?: string;
  orphanDesignation: boolean;
}

export interface StageConfig {
  key: string;
  name: string;
  description: string;
  estimatedDays: number;
  parallel?: boolean;
  tracks?: readonly string[];
  priorityDays?: number;
  indDays?: number;
}

export const STAGE_FLOW: Record<RegulatorySystem, StageConfig[]> = {
  NMPA: [
    { key: 'acceptance', name: '受理', description: '形式审查、受理通知', estimatedDays: 5 },
    { key: 'formal_review', name: '形式审查', description: '申报资料形式审查', estimatedDays: 10 },
    {
      key: 'technical_review', name: '技术审评',
      description: '药学/非临床/临床平行审评 — NDA标准200个工作日，优先审评130个工作日',
      estimatedDays: 200, priorityDays: 130, indDays: 60,
      parallel: true, tracks: ['pharmaceutical', 'nonclinical', 'clinical'],
    },
    { key: 'onsite_inspection', name: '现场核查（并行）', description: 'GMP符合性核查、研制现场核查（与技术审评并行）', estimatedDays: 20, parallel: true },
    { key: 'sample_testing', name: '样品检验（并行）', description: '注册检验、标准复核（与技术审评并行）', estimatedDays: 30, parallel: true },
    { key: 'administrative_approval', name: '行政审批', description: '综合审评、行政决策', estimatedDays: 20 },
    { key: 'certificate_issuance', name: '制证送达', description: '批准证明文件制作与发放', estimatedDays: 10 },
  ],
  FDA: [
    { key: 'pre_submission', name: 'Pre-Submission', description: 'Pre-IND meeting, initial consultation', estimatedDays: 60 },
    { key: 'filing_review', name: 'Filing Review', description: 'Application completeness check', estimatedDays: 60 },
    { key: 'substantive_review', name: 'Substantive Review', description: 'Clinical/Nonclinical/CMC review', estimatedDays: 180 },
    { key: 'advisory_committee', name: 'Advisory Committee', description: 'Advisory committee meeting (if needed)', estimatedDays: 90 },
    { key: 'labeling_negotiation', name: 'Labeling Review', description: 'Labeling and post-market commitments', estimatedDays: 30 },
    { key: 'facility_inspection', name: 'Facility Inspection', description: 'Pre-approval inspection (PAI)', estimatedDays: 60 },
    { key: 'final_decision', name: 'Final Decision', description: 'Complete Response / Approval', estimatedDays: 30 },
  ],
  EMA: [
    { key: 'pre_submission', name: 'Pre-Submission', description: 'Pre-submission meeting, appointment of rapporteurs', estimatedDays: 90 },
    { key: 'validation', name: 'Validation', description: 'Application validation (dossier check)', estimatedDays: 14 },
    { key: 'assessment_1', name: 'Assessment Phase I', description: 'CHMP assessment, Day 120 questions', estimatedDays: 120 },
    { key: 'clock_stop', name: 'Clock Stop', description: 'Applicant response period', estimatedDays: 90 },
    { key: 'assessment_2', name: 'Assessment Phase II', description: 'CHMP assessment, Day 180 opinion', estimatedDays: 60 },
    { key: 'opinion', name: 'CHMP Opinion', description: 'Positive/negative opinion', estimatedDays: 15 },
    { key: 'ec_decision', name: 'EC Decision', description: 'European Commission final decision', estimatedDays: 67 },
  ],
};
