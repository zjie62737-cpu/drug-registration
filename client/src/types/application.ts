export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'supplement_needed'
  | 'approved'
  | 'rejected';

export type ApplicationType = 'IND' | 'NDA' | 'ANDA' | 'supplementary' | 'renewal';

export type StageName =
  | 'acceptance'
  | 'formal_review'
  | 'technical_review'
  | 'onsite_inspection'
  | 'sample_testing'
  | 'administrative_approval'
  | 'certificate_issuance';

export type StageStatus = 'pending' | 'in_progress' | 'paused' | 'completed' | 'skipped';

export type TrackName = 'pharmaceutical' | 'nonclinical' | 'clinical';
export type TrackStatus = 'pending' | 'in_progress' | 'paused' | 'completed';

export interface DeficiencyLetter {
  id: number;
  applicationId: number;
  stageId?: number;
  round: number;
  content: string;
  issuedAt: string;
  responseDeadline?: string;
  respondedAt?: string;
  responseContent?: string;
  status: 'pending' | 'responded' | 'overdue';
}

export interface ApplicationStage {
  id: number;
  applicationId: number;
  stageName: StageName;
  stageOrder: number;
  status: StageStatus;
  assignedReviewerId?: number;
  assignedReviewer?: { id: number; realName: string };
  startedAt?: string;
  completedAt?: string;
  deadline?: string;
  clockStoppedAt?: string;
  trackStatuses?: Record<TrackName, TrackStatus>;
  notes?: string;
  reviews?: Review[];
  deficiencyLetters?: DeficiencyLetter[];
  createdAt: string;
}

export interface Application {
  id: number;
  applicationNo?: string;
  type: ApplicationType;
  drugName: string;
  drugType: string;
  specification?: string;
  applicantId: number;
  applicant?: {
    id: number;
    realName: string;
    organization: string;
    email?: string;
    phone?: string;
  };
  manufacturer?: string;
  status: ApplicationStatus;
  stages?: ApplicationStage[];
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  applicationId: number;
  stageId?: number;
  stage?: { id: number; stageName: string };
  reviewerId: number;
  reviewer?: { id: number; realName: string; role: string };
  content: string;
  action?: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Document {
  id: number;
  applicationId: number;
  documentType: string;
  fileName: string;
  filePath: string;
  uploadedById: number;
  uploadedBy?: { id: number; realName: string };
  uploadedAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  applicationId?: number;
  application?: { applicationNo: string; drugName: string };
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  total: number;
  draft: number;
  submitted: number;
  underReview: number;
  supplement: number;
  approved: number;
  rejected: number;
  unreadNotifications: number;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
  applicationId: number;
  applicationNo: string;
}
