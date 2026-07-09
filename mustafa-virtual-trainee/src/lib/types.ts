// ---------------------------------------------------------------------------
// Mustafa – Virtual Trainee Engagement Agent
// Core domain types (shared by frontend + engine + data layer)
// ---------------------------------------------------------------------------

export type Locale = "ar" | "en";

export type Role =
  | "admin"
  | "programme_manager"
  | "trainer"
  | "coordinator"
  | "viewer";

export interface User {
  id: string;
  name: string;
  nameAr: string;
  email: string;
  role: Role;
  avatarColor: string;
}

export type Sector =
  | "banking"
  | "insurance"
  | "capital_market"
  | "fintech"
  | "leadership"
  | "compliance"
  | "risk"
  | "sales"
  | "operations"
  | "customer_experience";

export type Platform =
  | "zoom"
  | "teams"
  | "webex"
  | "google_meet"
  | "lms"
  | "custom";

export type ProgrammeLevel = "beginner" | "intermediate" | "advanced" | "executive";

export type SessionLanguage = "ar" | "en" | "bilingual";

export type EngagementStyle =
  | "interactive"
  | "reflective"
  | "case_based"
  | "socratic"
  | "practical";

export interface Programme {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  date: string; // ISO
  trainerName: string;
  coordinatorName: string;
  targetAudience: string;
  sector: Sector;
  platform: Platform;
  language: SessionLanguage;
  level: ProgrammeLevel;
  objectives: string[];
  outcomes: string[];
  agenda: AgendaItem[];
  durationMinutes: number;
  participantProfile: string;
  sensitiveTopics: string;
  engagementStyle: EngagementStyle;
  mustafaVisible: boolean; // visible to participants vs private to trainer
  createdBy: string;
  createdAt: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  minutes: number;
}

export interface UploadedContent {
  id: string;
  programmeId: string;
  fileName: string;
  fileType: string;
  sizeKb: number;
  uploadedAt: string;
  analysis?: ContentAnalysis;
}

export interface ContentAnalysis {
  summary: string;
  themes: string[];
  expectedChallenges: string[];
  engagementMoments: string[];
  suggestedQuestions: string[];
  suggestedActivities: string[];
}

// --- Personas -------------------------------------------------------------

export type PersonaMode =
  | "curious"
  | "socratic"
  | "devils_advocate"
  | "engagement_coach"
  | "practitioner"
  | "quiet_activator";

export interface Persona {
  mode: PersonaMode;
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  description: string;
  descriptionAr: string;
  sampleQuestions: string[];
  visibility: "participants" | "trainer_private" | "both";
  icon: string;
}

// --- Interventions / Engagement Engine ------------------------------------

export type InterventionType =
  | "clarifying_question"
  | "deepening_question"
  | "practical_example"
  | "devils_advocate"
  | "socratic_question"
  | "poll"
  | "breakout"
  | "reflection"
  | "case_study"
  | "summary"
  | "energy_booster"
  | "task_distribution"
  | "trainer_reminder"
  | "closing_question";

export type DeliveryMethod = "chat" | "verbal" | "poll" | "breakout";

export type Tone =
  | "formal"
  | "friendly"
  | "executive"
  | "youthful"
  | "practical"
  | "challenging"
  | "reflective";

export type SuggestionStatus = "pending" | "approved" | "rejected" | "posted";

export interface Suggestion {
  id: string;
  type: InterventionType;
  persona: PersonaMode;
  textAr: string;
  textEn: string;
  purposeAr: string;
  purposeEn: string;
  delivery: DeliveryMethod;
  audience: "participants" | "trainer_private";
  confidence: number; // 0..1
  status: SuggestionStatus;
  createdAt: string;
}

export interface EngineInput {
  programme: Programme;
  currentAgendaSection?: string;
  transcript?: string;
  chatComments?: string;
  engagementLevel: "low" | "medium" | "high";
  minutesElapsed: number;
  minutesSinceLastInteraction: number;
  persona: PersonaMode;
  tone: Tone;
  locale: Locale;
}

export interface EngineResult {
  suggestions: Suggestion[];
  engagementScore: number; // 0..100
  energyLevel: "low" | "medium" | "high";
  headlineAr: string;
  headlineEn: string;
  recommendedActionAr: string;
  recommendedActionEn: string;
}

// --- Question Bank --------------------------------------------------------

export type QuestionCategory =
  | "opening"
  | "icebreaker"
  | "concept_check"
  | "applied"
  | "socratic"
  | "devils_advocate"
  | "regulatory"
  | "customer_impact"
  | "risk"
  | "closing";

export interface BankQuestion {
  id: string;
  category: QuestionCategory;
  textAr: string;
  textEn: string;
  purposeAr: string;
  purposeEn: string;
  timing: "opening" | "early" | "mid" | "late" | "closing";
  difficulty: "easy" | "medium" | "hard";
  delivery: DeliveryMethod;
  learningValueAr: string;
  learningValueEn: string;
}

// --- Activities -----------------------------------------------------------

export type ActivityType =
  | "reflection_2min"
  | "poll"
  | "case_discussion"
  | "breakout"
  | "role_play"
  | "scenario_analysis"
  | "risk_identification"
  | "compliance_judgment"
  | "customer_journey"
  | "debate"
  | "group_prioritization"
  | "what_would_you_do"
  | "before_after"
  | "misconception_correction";

export interface Activity {
  id: string;
  type: ActivityType;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  durationMinutes: number;
  bestForAr: string;
  bestForEn: string;
}

// --- Reports --------------------------------------------------------------

export interface EngagementReport {
  id: string;
  programmeId: string;
  generatedAt: string;
  participationLevel: "low" | "medium" | "high";
  engagementScore: number;
  interactions: number;
  questionsGenerated: number;
  questionsUsed: number;
  activitiesSuggested: number;
  activitiesUsed: number;
  timeline: { minute: number; type: InterventionType; labelAr: string; labelEn: string }[];
  bestMoments: string[];
  bestMomentsAr: string[];
  missedOpportunities: string[];
  missedOpportunitiesAr: string[];
  trainerRecommendations: string[];
  trainerRecommendationsAr: string[];
  followUpMessageAr: string;
  followUpMessageEn: string;
  reflectiveAssignmentAr: string;
  reflectiveAssignmentEn: string;
}

// --- Settings -------------------------------------------------------------

export interface AdminSettings {
  defaultTone: Tone;
  defaultLanguage: SessionLanguage;
  approvedTerminology: string[];
  restrictedWords: string[];
  autoPost: boolean; // post automatically vs approval required
  maxInterventionsPer10Min: number;
  minMinutesBetweenInterventions: number;
  allowDevilsAdvocate: boolean;
  mustafaVisibleDefault: boolean;
  organizationName: string;
  organizationNameAr: string;
  primaryColor: string;
}

// --- Audit ----------------------------------------------------------------

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}
