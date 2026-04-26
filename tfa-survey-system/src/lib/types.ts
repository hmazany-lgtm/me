// ─── Core Enumerations ────────────────────────────────────────────────────────

export type RespondentRole =
  | "ld_hr"
  | "finance"
  | "business_leader"
  | "regulator"
  | "government"
  | "vendor";

export type Sector =
  | "banking"
  | "insurance"
  | "capital_markets"
  | "financing"
  | "payments"
  | "government"
  | "training_provider"
  | "other";

export type SurveyBlock =
  | "market_demand"
  | "training_volume"
  | "external_providers"
  | "future_trends"
  | "strategic_partnership";

export type QuestionType =
  | "single_choice"
  | "multiple_choice"
  | "short_answer"
  | "number_range"
  | "rating_scale"
  | "dropdown"
  | "conditional";

export type QuestionStatus = "draft" | "review" | "published" | "archived";

export type AdminRole = "super_admin" | "strategy_editor" | "viewer";

// ─── Question Option ───────────────────────────────────────────────────────────

export interface QuestionOption {
  id: string;
  value: string;
  labelEn: string;
  labelAr: string;
  isOther?: boolean;
}

// ─── Conditional Logic Rule ───────────────────────────────────────────────────

export type ConditionOperator = "equals" | "not_equals" | "in" | "not_in";

export interface LogicCondition {
  id?: string;
  field: "role" | "sector" | "question";
  questionId?: string;
  operator: ConditionOperator;
  value: string | string[];
}

export interface LogicRule {
  id: string;
  conditions: LogicCondition[];
  conditionLogic: "AND" | "OR";
  action: "show" | "hide" | "skip_to";
  targetQuestionId?: string;
}

// ─── Survey Question ──────────────────────────────────────────────────────────

export interface SurveyQuestion {
  id: string;
  block: SurveyBlock;
  order: number;
  type: QuestionType;
  status: QuestionStatus;

  textEn: string;
  textAr: string;
  hintEn?: string;
  hintAr?: string;
  whyItMatters: string;

  options?: QuestionOption[];
  minValue?: number;
  maxValue?: number;
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabelEn?: string;
  scaleMaxLabelEn?: string;
  scaleMinLabelAr?: string;
  scaleMaxLabelAr?: string;

  visibleToRoles: RespondentRole[];
  visibleToSectors: Sector[];
  hiddenFromRoles?: RespondentRole[];

  required: boolean;
  logicRules?: LogicRule[];

  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  lastEditedBy?: string;
}

// ─── Survey Response ──────────────────────────────────────────────────────────

export interface ResponseAnswer {
  questionId: string;
  questionVersion: number;
  value: string | string[] | number;
  answeredAt: string;
}

export interface SurveyResponse {
  id: string;
  sessionId: string;
  respondentRole: RespondentRole;
  sector: Sector;
  companySize: CompanySize;
  answers: ResponseAnswer[];
  startedAt: string;
  completedAt?: string;
  confidenceScore?: number;
  isComplete: boolean;
  language: "en" | "ar";
}

export type CompanySize =
  | "under_100"
  | "100_500"
  | "500_2000"
  | "over_2000";

// ─── Analytics Types ──────────────────────────────────────────────────────────

export interface SegmentMetric {
  segment: string;
  count: number;
  percentage: number;
}

export interface HeatmapCell {
  row: string;
  col: string;
  value: number;
  label?: string;
}

export interface TrendSignal {
  signal: string;
  strength: "strong" | "moderate" | "weak";
  sectorRelevance: Sector[];
  questionIds: string[];
}

export interface AIInsight {
  category: "launch" | "stop" | "pricing" | "partnership" | "regulatory";
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  confidence: number;
  supportingData: string[];
}

// ─── Admin User ───────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  createdAt: string;
}

// ─── Store Types ──────────────────────────────────────────────────────────────

export interface SurveyState {
  currentStep: number;
  role: RespondentRole | null;
  sector: Sector | null;
  companySize: CompanySize | null;
  answers: Record<string, string | string[] | number>;
  language: "en" | "ar";
  sessionId: string;
}

// ─── Export Types ─────────────────────────────────────────────────────────────

export interface ExportOptions {
  format: "excel" | "csv" | "json" | "powerbi";
  dateFrom?: string;
  dateTo?: string;
  roles?: RespondentRole[];
  sectors?: Sector[];
  onlyComplete?: boolean;
}

// ─── Label Maps (for display) ─────────────────────────────────────────────────

export const ROLE_LABELS: Record<RespondentRole, { en: string; ar: string }> = {
  ld_hr: { en: "L&D / HR", ar: "التعلم والتطوير / الموارد البشرية" },
  finance: { en: "Finance", ar: "المالية" },
  business_leader: { en: "Business Leader", ar: "قيادة الأعمال" },
  regulator: { en: "Regulator", ar: "جهة تنظيمية" },
  government: { en: "Government Entity", ar: "جهة حكومية" },
  vendor: { en: "Vendor / Training Provider", ar: "مزود تدريب" },
};

export const SECTOR_LABELS: Record<Sector, { en: string; ar: string }> = {
  banking: { en: "Banking", ar: "البنوك" },
  insurance: { en: "Insurance", ar: "التأمين" },
  capital_markets: { en: "Capital Markets", ar: "أسواق المال" },
  financing: { en: "Financing", ar: "التمويل" },
  payments: { en: "Payments", ar: "المدفوعات" },
  government: { en: "Government", ar: "القطاع الحكومي" },
  training_provider: { en: "Training Provider", ar: "مزود تدريب" },
  other: { en: "Other", ar: "أخرى" },
};

export const BLOCK_LABELS: Record<SurveyBlock, { en: string; ar: string }> = {
  market_demand: { en: "Market Demand", ar: "الطلب السوقي" },
  training_volume: { en: "Training Volume & Intensity", ar: "حجم التدريب وكثافته" },
  external_providers: { en: "External Providers & Gaps", ar: "المزودون الخارجيون والفجوات" },
  future_trends: { en: "Future Trends", ar: "الاتجاهات المستقبلية" },
  strategic_partnership: { en: "Strategic Partnership", ar: "الشراكة الاستراتيجية" },
};

export const COMPANY_SIZE_LABELS: Record<CompanySize, { en: string; ar: string }> = {
  under_100: { en: "Under 100 employees", ar: "أقل من 100 موظف" },
  "100_500": { en: "100 – 500 employees", ar: "من 100 إلى 500 موظف" },
  "500_2000": { en: "500 – 2,000 employees", ar: "من 500 إلى 2000 موظف" },
  over_2000: { en: "Over 2,000 employees", ar: "أكثر من 2000 موظف" },
};
