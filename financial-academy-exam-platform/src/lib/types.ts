/**
 * TFA-EMP domain types. These mirror the PostgreSQL schema in DATA_MODEL.md.
 * In the prototype they type the in-repo sample data store (src/data).
 */

export type RoleKey =
  | "sys_admin"
  | "exam_ops_manager"
  | "certification_manager"
  | "question_author"
  | "question_reviewer"
  | "psychometrician"
  | "committee_approver"
  | "invigilator"
  | "candidate"
  | "auditor"
  | "executive"
  | "vendor";

export type PermissionKey =
  | "view_question"
  | "view_correct_answer"
  | "edit_question"
  | "approve_question"
  | "export_question"
  | "generate_exam_form"
  | "approve_exam_form"
  | "view_candidate"
  | "edit_candidate"
  | "release_result"
  | "view_reports"
  | "download_reports"
  | "run_invigilation"
  | "manage_users"
  | "view_audit"
  | "governance_decision"
  | "view_security"
  | "sit_exam";

export interface Role {
  key: RoleKey;
  name: string;
  description: string;
  isSystem: boolean;
}

export interface Permission {
  key: PermissionKey;
  name: string;
  category: "content" | "assembly" | "candidate" | "results" | "reports" | "admin" | "security";
  sensitivity: "low" | "medium" | "high";
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  roleKey: RoleKey;
  department: string;
  status: "active" | "suspended" | "disabled";
  lastLoginAt: string;
  mfaEnabled: boolean;
  assignedCertifications: string[];
  assignedCenters: string[];
  vendorId?: string;
}

export type CertStatus = "draft" | "active" | "suspended" | "retired";

export interface Certification {
  id: string;
  code: string;
  name: string;
  description: string;
  targetAudience: string;
  regulatorOwner: string;
  validityMonths: number;
  retakeWaitDays: number;
  passingScore: number;
  durationMinutes: number;
  questionCount: number;
  deliveryMethods: DeliveryMethod[];
  languages: string[];
  allowedQuestionTypes: QuestionType[];
  requiredCompetencies: string[];
  examFee: number;
  retakeFee: number;
  relatedPrograms: string[];
  status: CertStatus;
  version: number;
  // rolled-up stats for dashboards
  stats: {
    candidates: number;
    passRate: number;
    failRate: number;
    noShowRate: number;
    avgScore: number;
    activeQuestions: number;
    flaggedQuestions: number;
    retiredQuestions: number;
    revenue: number;
  };
}

export type DeliveryMethod = "center" | "remote" | "blended" | "third_party";

export type QuestionType =
  | "single"
  | "multiple"
  | "truefalse"
  | "scenario"
  | "case"
  | "matching"
  | "ordering"
  | "numeric"
  | "short"
  | "simulation";

export type QuestionStatus =
  | "draft"
  | "under_review"
  | "approved"
  | "active"
  | "suspended"
  | "retired"
  | "compromised";

export type Difficulty = "easy" | "medium" | "hard";
export type CognitiveLevel =
  | "recall"
  | "understanding"
  | "application"
  | "analysis"
  | "evaluation";

export interface QuestionOption {
  label: string;
  text: string;
  isCorrect: boolean;
  chosenPct: number;
}

export interface Question {
  id: string;
  certificationId: string;
  domain: string;
  competency: string;
  learningOutcome: string;
  difficulty: Difficulty;
  cognitiveLevel: CognitiveLevel;
  type: QuestionType;
  stem: string;
  options: QuestionOption[];
  explanation: string;
  references: string[];
  authorId: string;
  reviewerId?: string;
  approverId?: string;
  version: number;
  status: QuestionStatus;
  usageCount: number;
  lastUsedAt?: string;
  difficultyIndex: number; // p-value 0..1
  discriminationIndex: number; // -1..1
  pointBiserial: number;
  securityClassification: "internal" | "confidential" | "restricted";
  exposureLimit: number;
  flagCount: number;
  flagHistory: { date: string; by: string; reason: string }[];
}

export type ReviewStage =
  | "technical"
  | "language"
  | "psychometric"
  | "regulatory"
  | "committee";

export interface QuestionReview {
  id: string;
  questionId: string;
  stage: ReviewStage;
  assignee: string;
  status: "pending" | "approved" | "rejected" | "changes_requested";
  comments: string;
  dueDate: string;
  escalated: boolean;
}

export interface BlueprintDomain {
  name: string;
  weightPct: number;
  questionCount: number;
  competencies: string[];
  learningOutcomes: string[];
  minActiveQuestions: number;
  availableActive: number; // for readiness calc
}

export interface ExamBlueprint {
  id: string;
  certificationId: string;
  version: number;
  status: "draft" | "approved";
  totalQuestions: number;
  difficultyMix: Record<Difficulty, number>;
  cognitiveMix: Record<CognitiveLevel, number>;
  domains: BlueprintDomain[];
  approvedBy?: string;
  approvedAt?: string;
}

export interface ExamForm {
  id: string;
  certificationId: string;
  blueprintId: string;
  name: string;
  language: string;
  status: "draft" | "review" | "approved" | "locked";
  isLocked: boolean;
  version: number;
  createdBy: string;
  approvedBy?: string;
  leakageRisk: "low" | "medium" | "high";
  questionIds: string[];
  domainBalance: { domain: string; count: number }[];
}

export interface Candidate {
  id: string;
  fullName: string;
  nationalId: string;
  email: string;
  mobile: string;
  employer: string;
  sector: string;
  city: string;
  accommodations: string[];
  certificationId: string;
  attempts: number;
  eligibilityStatus: "eligible" | "pending" | "ineligible";
  paymentStatus: "paid" | "pending" | "waived";
  misconductHistory: { date: string; note: string }[];
}

export interface ExamCenter {
  id: string;
  name: string;
  city: string;
  capacity: number;
  devices: number;
  rooms: number;
  invigilatorPool: number;
  status: "operational" | "maintenance" | "future";
  satisfaction: number;
  revenueYtd: number;
  seatsBooked: number;
  incidents: number;
  deviceReady: number; // %
}

export type SessionStatus =
  | "scheduled"
  | "active"
  | "completed"
  | "cancelled"
  | "under_investigation";

export interface ExamSession {
  id: string;
  certificationId: string;
  formId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  centerId: string;
  room: string;
  seatCapacity: number;
  deliveryMethod: DeliveryMethod;
  vendorId?: string;
  invigilatorIds: string[];
  candidateIds: string[];
  status: SessionStatus;
}

export interface CandidateAttempt {
  id: string;
  candidateId: string;
  sessionId: string;
  formId: string;
  seat: string;
  loginStatus: "not_logged_in" | "verifying" | "in_progress" | "submitted";
  identityVerified: boolean;
  progress: number; // %
  timeRemainingMin: number;
  connection: "stable" | "unstable" | "disconnected";
  isLocked: boolean;
  flags: string[];
}

export type ResultStatus = "pending" | "approved" | "held" | "released" | "invalidated";

export interface Result {
  id: string;
  attemptId: string;
  candidateId: string;
  certificationId: string;
  rawScore: number;
  scaledScore: number;
  passingScore: number;
  passed: boolean;
  domainScores: { domain: string; score: number }[];
  status: ResultStatus;
  approvedBy?: string;
  releasedBy?: string;
  releasedAt?: string;
}

export interface Certificate {
  id: string;
  resultId: string;
  candidateId: string;
  certificationId: string;
  certificateNo: string;
  issuedAt: string;
  validFrom: string;
  validTo: string;
  status: "valid" | "expired" | "revoked";
  renewalStatus: "current" | "due" | "overdue";
}

export type IncidentType =
  | "identity"
  | "technical"
  | "suspected_cheating"
  | "behavior"
  | "late_arrival"
  | "wrong_exam"
  | "system_interruption"
  | "emergency"
  | "other";

export interface Incident {
  id: string;
  sessionId: string;
  candidateId?: string;
  type: IncidentType;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence: string[];
  reportedBy: string;
  recommendedAction: string;
  resolutionStatus: "open" | "investigating" | "resolved" | "closed";
  createdAt: string;
}

export interface Appeal {
  id: string;
  appealNo: string;
  candidateId: string;
  sessionId: string;
  category:
    | "result"
    | "technical"
    | "center"
    | "misconduct"
    | "accommodation"
    | "certificate";
  description: string;
  evidence: string[];
  assignedTo: string;
  slaDue: string;
  status: "submitted" | "in_review" | "decided" | "closed";
  decision?: string;
  communications: { date: string; from: string; note: string }[];
}

export type AuditAction =
  | "login"
  | "failed_login"
  | "question_viewed"
  | "answer_viewed"
  | "question_edited"
  | "question_exported"
  | "question_approved"
  | "question_retired"
  | "form_generated"
  | "form_approved"
  | "candidate_registered"
  | "exam_started"
  | "exam_submitted"
  | "result_changed"
  | "result_released"
  | "incident_created"
  | "report_downloaded"
  | "permission_changed";

export interface AuditLog {
  id: string;
  userId: string;
  roleKey: RoleKey;
  action: AuditAction;
  objectType: string;
  objectId: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress: string;
  device: string;
  riskLevel: "low" | "medium" | "high";
  notes: string;
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  type: "exposure" | "pass_rate" | "discrimination" | "leakage" | "behavior" | "access";
  severity: "low" | "medium" | "high" | "critical";
  subjectType: string;
  subjectId: string;
  message: string;
  status: "open" | "acknowledged" | "resolved";
  createdAt: string;
}

export interface Committee {
  id: string;
  name: string;
  mandate: string;
  members: string[];
}

export interface CommitteeDecision {
  id: string;
  committeeId: string;
  meetingDate: string;
  agenda: string;
  decision: string;
  documents: string[];
  status: "approved" | "rejected" | "deferred";
  actionOwners: string[];
  dueDate: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: "platform" | "proctoring" | "center";
  slaTarget: number;
  slaActual: number;
  status: "active" | "review" | "suspended";
  assignedCenters: string[];
}

export interface Notification {
  id: string;
  channel: "email" | "sms" | "whatsapp" | "in_app";
  template: string;
  subject: string;
  body: string;
  status: "queued" | "sent" | "read";
  createdAt: string;
}
