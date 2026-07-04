/**
 * Deterministic sample-data store for the TFA-EMP prototype.
 *
 * Everything here is fictional. No real exam questions are included — question
 * stems are generic placeholders, and secure content is masked in the UI unless
 * the viewer holds the right permission. A tiny seeded PRNG keeps the generated
 * data identical on server and client (no hydration mismatch, no Math.random).
 */
import type {
  Certification, Question, ExamBlueprint, ExamForm, Candidate, ExamCenter,
  ExamSession, CandidateAttempt, Result, Certificate, Incident, Appeal,
  AuditLog, SecurityAlert, Committee, CommitteeDecision, Vendor, User,
  Notification, QuestionReview, Difficulty, CognitiveLevel, QuestionType,
} from "@/lib/types";

// ---- seeded PRNG (mulberry32) ---------------------------------------------
function rng(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20260704);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (a: number, b: number) => a + rand() * (b - a);
const intBetween = (a: number, b: number) => Math.floor(between(a, b + 1));

// ---- Users -----------------------------------------------------------------
export const USERS: User[] = [
  { id: "u-admin", fullName: "Nasser Al-Otaibi", email: "nasser.otaibi@tfa.gov.sa", mobile: "+966 55 000 0001", roleKey: "sys_admin", department: "Technology", status: "active", lastLoginAt: "2026-07-04T07:12:00Z", mfaEnabled: true, assignedCertifications: [], assignedCenters: [] },
  { id: "u-ops", fullName: "Huda Al-Zahrani", email: "huda.zahrani@tfa.gov.sa", mobile: "+966 55 000 0002", roleKey: "exam_ops_manager", department: "Exam Operations", status: "active", lastLoginAt: "2026-07-04T06:40:00Z", mfaEnabled: true, assignedCertifications: [], assignedCenters: ["c-ryd", "c-jed", "c-dmm", "c-abh"] },
  { id: "u-cert", fullName: "Faisal Al-Dossary", email: "faisal.dossary@tfa.gov.sa", mobile: "+966 55 000 0003", roleKey: "certification_manager", department: "Certification", status: "active", lastLoginAt: "2026-07-03T15:05:00Z", mfaEnabled: true, assignedCertifications: ["cert-cib", "cert-cma"], assignedCenters: [] },
  { id: "u-author", fullName: "Layla Al-Harbi", email: "layla.harbi@tfa.gov.sa", mobile: "+966 55 000 0004", roleKey: "question_author", department: "Item Development", status: "active", lastLoginAt: "2026-07-04T05:30:00Z", mfaEnabled: false, assignedCertifications: ["cert-cib"], assignedCenters: [] },
  { id: "u-reviewer", fullName: "Omar Al-Ghamdi", email: "omar.ghamdi@tfa.gov.sa", mobile: "+966 55 000 0005", roleKey: "question_reviewer", department: "Item Development", status: "active", lastLoginAt: "2026-07-03T12:00:00Z", mfaEnabled: false, assignedCertifications: ["cert-cib"], assignedCenters: [] },
  { id: "u-psych", fullName: "Dr. Sara Al-Qahtani", email: "sara.qahtani@tfa.gov.sa", mobile: "+966 55 000 0006", roleKey: "psychometrician", department: "Psychometrics", status: "active", lastLoginAt: "2026-07-04T04:10:00Z", mfaEnabled: true, assignedCertifications: [], assignedCenters: [] },
  { id: "u-committee", fullName: "Abdullah Al-Rashid", email: "abdullah.rashid@tfa.gov.sa", mobile: "+966 55 000 0007", roleKey: "committee_approver", department: "Exam Committee", status: "active", lastLoginAt: "2026-07-02T09:00:00Z", mfaEnabled: true, assignedCertifications: [], assignedCenters: [] },
  { id: "u-invig", fullName: "Mona Al-Shehri", email: "mona.shehri@tfa.gov.sa", mobile: "+966 55 000 0008", roleKey: "invigilator", department: "Center Operations", status: "active", lastLoginAt: "2026-07-04T06:55:00Z", mfaEnabled: false, assignedCertifications: [], assignedCenters: ["c-ryd"] },
  { id: "u-candidate", fullName: "Khalid Al-Mutairi", email: "khalid.mutairi@example.com", mobile: "+966 55 000 0009", roleKey: "candidate", department: "-", status: "active", lastLoginAt: "2026-07-01T10:00:00Z", mfaEnabled: false, assignedCertifications: [], assignedCenters: [] },
  { id: "u-auditor", fullName: "Reem Al-Subaie", email: "reem.subaie@tfa.gov.sa", mobile: "+966 55 000 0010", roleKey: "auditor", department: "Internal Audit", status: "active", lastLoginAt: "2026-07-03T11:20:00Z", mfaEnabled: true, assignedCertifications: [], assignedCenters: [] },
  { id: "u-exec", fullName: "Sultan Al-Faisal", email: "sultan.faisal@tfa.gov.sa", mobile: "+966 55 000 0011", roleKey: "executive", department: "Executive Office", status: "active", lastLoginAt: "2026-07-04T03:00:00Z", mfaEnabled: true, assignedCertifications: [], assignedCenters: [] },
  { id: "u-vendor", fullName: "Talal (SecureProctor Ltd)", email: "talal@secureproctor.com", mobile: "+966 55 000 0012", roleKey: "vendor", department: "External Vendor", status: "active", lastLoginAt: "2026-07-02T14:00:00Z", mfaEnabled: false, assignedCertifications: [], assignedCenters: ["c-jed"], vendorId: "v-secureproctor" },
];

// ---- Certifications --------------------------------------------------------
const DOMAINS: Record<string, string[]> = {
  "cert-cib": ["Credit Analysis", "Risk Management", "Regulatory Framework", "Financial Statements", "Ethics & Conduct"],
  "cert-cma": ["Capital Markets", "Securities Regulation", "Portfolio Management", "Market Conduct", "Derivatives"],
  "cert-aml": ["AML Framework", "KYC & CDD", "Sanctions", "Transaction Monitoring", "Reporting Obligations"],
  "cert-ins": ["Insurance Principles", "Underwriting", "Claims", "Takaful", "Regulation"],
  "cert-fin": ["Financial Planning", "Investments", "Retirement", "Tax & Zakat", "Ethics"],
};

export const CERTIFICATIONS: Certification[] = [
  {
    id: "cert-cib", code: "TFA-CIB", name: "Certified Islamic Banker", description: "Foundational certification for professionals in Islamic banking and Shariah-compliant finance.",
    targetAudience: "Banking professionals, relationship managers, credit officers", regulatorOwner: "SAMA", validityMonths: 36, retakeWaitDays: 30,
    passingScore: 70, durationMinutes: 120, questionCount: 80, deliveryMethods: ["center", "remote"], languages: ["en", "ar"],
    allowedQuestionTypes: ["single", "multiple", "truefalse", "scenario"], requiredCompetencies: ["Credit Analysis", "Shariah Compliance", "Risk"],
    examFee: 1500, retakeFee: 750, relatedPrograms: ["Islamic Banking Foundation", "Credit Masterclass"], status: "active", version: 4,
    stats: { candidates: 0, passRate: 0, failRate: 0, noShowRate: 0, avgScore: 0, activeQuestions: 0, flaggedQuestions: 0, retiredQuestions: 0, revenue: 0 },
  },
  {
    id: "cert-cma", code: "TFA-CMA", name: "Certified Capital Markets Associate", description: "Certification covering capital markets operations, securities regulation, and portfolio management.",
    targetAudience: "Brokerage staff, investment analysts, compliance officers", regulatorOwner: "CMA", validityMonths: 24, retakeWaitDays: 45,
    passingScore: 65, durationMinutes: 150, questionCount: 100, deliveryMethods: ["center", "blended"], languages: ["en", "ar"],
    allowedQuestionTypes: ["single", "multiple", "scenario", "case", "numeric"], requiredCompetencies: ["Securities", "Portfolio Management"],
    examFee: 2000, retakeFee: 1000, relatedPrograms: ["Capital Markets Program"], status: "active", version: 3,
    stats: { candidates: 0, passRate: 0, failRate: 0, noShowRate: 0, avgScore: 0, activeQuestions: 0, flaggedQuestions: 0, retiredQuestions: 0, revenue: 0 },
  },
  {
    id: "cert-aml", code: "TFA-AML", name: "Certified Anti-Money-Laundering Specialist", description: "Specialist certification for AML/CFT professionals across the financial sector.",
    targetAudience: "Compliance, MLRO, risk & audit teams", regulatorOwner: "SAMA / SAFIU", validityMonths: 24, retakeWaitDays: 30,
    passingScore: 75, durationMinutes: 120, questionCount: 90, deliveryMethods: ["center", "remote", "blended"], languages: ["en", "ar"],
    allowedQuestionTypes: ["single", "multiple", "truefalse", "scenario", "case"], requiredCompetencies: ["AML Framework", "KYC", "Sanctions"],
    examFee: 1800, retakeFee: 900, relatedPrograms: ["AML Foundation", "Sanctions Screening"], status: "active", version: 5,
    stats: { candidates: 0, passRate: 0, failRate: 0, noShowRate: 0, avgScore: 0, activeQuestions: 0, flaggedQuestions: 0, retiredQuestions: 0, revenue: 0 },
  },
  {
    id: "cert-ins", code: "TFA-INS", name: "Certified Insurance Professional", description: "Certification for insurance and takaful practitioners.",
    targetAudience: "Insurance agents, underwriters, claims staff", regulatorOwner: "Insurance Authority", validityMonths: 36, retakeWaitDays: 30,
    passingScore: 60, durationMinutes: 90, questionCount: 70, deliveryMethods: ["center"], languages: ["en", "ar"],
    allowedQuestionTypes: ["single", "truefalse", "scenario"], requiredCompetencies: ["Underwriting", "Claims", "Takaful"],
    examFee: 1200, retakeFee: 600, relatedPrograms: ["Insurance Foundation"], status: "active", version: 2,
    stats: { candidates: 0, passRate: 0, failRate: 0, noShowRate: 0, avgScore: 0, activeQuestions: 0, flaggedQuestions: 0, retiredQuestions: 0, revenue: 0 },
  },
  {
    id: "cert-fin", code: "TFA-FIN", name: "Certified Financial Planner (KSA)", description: "Comprehensive financial-planning certification tailored to the Saudi market.",
    targetAudience: "Wealth advisors, financial planners", regulatorOwner: "CMA", validityMonths: 24, retakeWaitDays: 60,
    passingScore: 70, durationMinutes: 180, questionCount: 120, deliveryMethods: ["center", "blended", "third_party"], languages: ["en"],
    allowedQuestionTypes: ["single", "multiple", "scenario", "case", "numeric"], requiredCompetencies: ["Financial Planning", "Investments", "Tax & Zakat"],
    examFee: 2500, retakeFee: 1250, relatedPrograms: ["Financial Planning Diploma"], status: "draft", version: 1,
    stats: { candidates: 0, passRate: 0, failRate: 0, noShowRate: 0, avgScore: 0, activeQuestions: 0, flaggedQuestions: 0, retiredQuestions: 0, revenue: 0 },
  },
];

// ---- Questions (100, generic placeholders only) ----------------------------
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];
const COGNITIVE: CognitiveLevel[] = ["recall", "understanding", "application", "analysis", "evaluation"];
const QTYPES: QuestionType[] = ["single", "multiple", "truefalse", "scenario", "case", "numeric"];
const STATUSES: Question["status"][] = ["active", "active", "active", "approved", "under_review", "draft", "suspended", "retired", "compromised"];

function makeOptions(type: QuestionType) {
  if (type === "truefalse") {
    const correct = rand() > 0.5;
    return [
      { label: "A", text: "True", isCorrect: correct, chosenPct: correct ? intBetween(45, 80) : intBetween(20, 55) },
      { label: "B", text: "False", isCorrect: !correct, chosenPct: correct ? intBetween(20, 55) : intBetween(45, 80) },
    ];
  }
  const n = type === "multiple" ? 5 : 4;
  const correctIdx = intBetween(0, n - 1);
  const secondCorrect = type === "multiple" ? (correctIdx + 1) % n : -1;
  return Array.from({ length: n }, (_, i) => ({
    label: String.fromCharCode(65 + i),
    text: `Answer option ${String.fromCharCode(65 + i)} — generic placeholder for demonstration.`,
    isCorrect: i === correctIdx || i === secondCorrect,
    chosenPct: i === correctIdx ? intBetween(35, 70) : intBetween(3, 30),
  }));
}

export const QUESTIONS: Question[] = Array.from({ length: 100 }, (_, i) => {
  const certId = pick(CERTIFICATIONS.map((c) => c.id));
  const domain = pick(DOMAINS[certId]);
  const type = pick(QTYPES);
  const status = pick(STATUSES);
  const usage = intBetween(0, 240);
  const dIdx = Number(between(0.15, 0.95).toFixed(2));
  const disc = Number(between(-0.15, 0.55).toFixed(2));
  const code = certId.split("-")[1].toUpperCase();
  const flagCount = rand() > 0.75 ? intBetween(1, 6) : 0;
  return {
    id: `Q-${code}-${String(i + 1).padStart(4, "0")}`,
    certificationId: certId,
    domain,
    competency: `${domain} — Competency ${intBetween(1, 4)}`,
    learningOutcome: `LO ${intBetween(1, 6)}: apply ${domain.toLowerCase()} principles`,
    difficulty: pick(DIFFICULTIES),
    cognitiveLevel: pick(COGNITIVE),
    type,
    stem: `Sample secure question content for ${domain}. This placeholder stem is shown only to authorized content roles; unauthorized users see a restricted view.`,
    options: makeOptions(type),
    explanation: `Rationale placeholder: the correct response reflects ${domain.toLowerCase()} best practice. Distractors represent common misconceptions.`,
    references: [`TFA ${domain} Handbook, ch. ${intBetween(1, 12)}`, `Regulatory circular ${intBetween(2019, 2025)}/${intBetween(1, 40)}`],
    authorId: "u-author",
    reviewerId: status === "draft" ? undefined : "u-reviewer",
    approverId: ["approved", "active", "suspended", "retired"].includes(status) ? "u-committee" : undefined,
    version: intBetween(1, 4),
    status,
    usageCount: usage,
    lastUsedAt: usage > 0 ? "2026-05-" + String(intBetween(10, 28)).padStart(2, "0") + "T09:00:00Z" : undefined,
    difficultyIndex: dIdx,
    discriminationIndex: disc,
    pointBiserial: Number((disc + between(-0.05, 0.05)).toFixed(2)),
    securityClassification: pick(["internal", "confidential", "restricted"] as const),
    exposureLimit: 150,
    flagCount,
    flagHistory: flagCount ? Array.from({ length: Math.min(flagCount, 3) }, () => ({ date: "2026-0" + intBetween(3, 6) + "-1" + intBetween(0, 9), by: "u-candidate", reason: pick(["Ambiguous wording", "Possible multiple answers", "Outdated reference", "Typo in stem"]) })) : [],
  };
});

// ---- Question reviews (authoring workflow) ---------------------------------
export const QUESTION_REVIEWS: QuestionReview[] = QUESTIONS.filter((q) => ["under_review", "draft"].includes(q.status)).slice(0, 14).map((q, i) => ({
  id: `rev-${i + 1}`,
  questionId: q.id,
  stage: pick(["technical", "language", "psychometric", "regulatory", "committee"] as const),
  assignee: pick(["u-reviewer", "u-psych", "u-committee"]),
  status: pick(["pending", "changes_requested", "approved"] as const),
  comments: pick(["Clarify the stem wording.", "Distractor B is implausible.", "Aligns with blueprint — approve.", "Check regulatory reference year."]),
  dueDate: "2026-07-" + String(intBetween(8, 25)).padStart(2, "0"),
  escalated: rand() > 0.8,
}));

// ---- Blueprints ------------------------------------------------------------
export const BLUEPRINTS: ExamBlueprint[] = CERTIFICATIONS.map((c) => {
  const domains = DOMAINS[c.id];
  const weights = [30, 25, 20, 15, 10];
  return {
    id: `bp-${c.id}`,
    certificationId: c.id,
    version: c.version,
    status: c.status === "draft" ? "draft" : "approved",
    totalQuestions: c.questionCount,
    difficultyMix: { easy: 30, medium: 50, hard: 20 },
    cognitiveMix: { recall: 20, understanding: 25, application: 30, analysis: 15, evaluation: 10 },
    domains: domains.map((d, i) => {
      const qCount = Math.round((weights[i] / 100) * c.questionCount);
      const min = qCount * 3;
      const available = QUESTIONS.filter((q) => q.certificationId === c.id && q.domain === d && ["active", "approved"].includes(q.status)).length + intBetween(10, 60);
      return { name: d, weightPct: weights[i], questionCount: qCount, competencies: [`${d} C1`, `${d} C2`], learningOutcomes: [`${d} LO1`, `${d} LO2`], minActiveQuestions: min, availableActive: available };
    }),
    approvedBy: c.status === "draft" ? undefined : "u-committee",
    approvedAt: c.status === "draft" ? undefined : "2026-04-15T10:00:00Z",
  };
});

// ---- Exam forms ------------------------------------------------------------
export const EXAM_FORMS: ExamForm[] = CERTIFICATIONS.flatMap((c, ci) =>
  (c.status === "draft" ? [] : ["A", "B"]).map((f, fi) => {
    const status = pick(["approved", "locked", "review", "draft"] as const);
    const qs = QUESTIONS.filter((q) => q.certificationId === c.id && q.status === "active").slice(0, Math.min(c.questionCount, 20));
    const domains = DOMAINS[c.id];
    return {
      id: `form-${c.id}-${f}`,
      certificationId: c.id,
      blueprintId: `bp-${c.id}`,
      name: `${c.code} Form ${f}`,
      language: "en",
      status,
      isLocked: status === "locked",
      version: 1 + fi,
      createdBy: "u-ops",
      approvedBy: ["approved", "locked"].includes(status) ? "u-committee" : undefined,
      leakageRisk: pick(["low", "low", "medium", "high"] as const),
      questionIds: qs.map((q) => q.id),
      domainBalance: domains.map((d) => ({ domain: d, count: intBetween(3, 12) })),
    };
  })
);

// ---- Exam centers ----------------------------------------------------------
export const CENTERS: ExamCenter[] = [
  { id: "c-ryd", name: "Riyadh Main Center", city: "Riyadh", capacity: 120, devices: 120, rooms: 5, invigilatorPool: 12, status: "operational", satisfaction: 4.5, revenueYtd: 3_240_000, seatsBooked: 92, incidents: 4, deviceReady: 98 },
  { id: "c-jed", name: "Jeddah Center", city: "Jeddah", capacity: 90, devices: 88, rooms: 4, invigilatorPool: 9, status: "operational", satisfaction: 4.3, revenueYtd: 2_110_000, seatsBooked: 61, incidents: 3, deviceReady: 95 },
  { id: "c-dmm", name: "Dammam Center", city: "Dammam", capacity: 70, devices: 70, rooms: 3, invigilatorPool: 7, status: "operational", satisfaction: 4.1, revenueYtd: 1_480_000, seatsBooked: 44, incidents: 2, deviceReady: 90 },
  { id: "c-abh", name: "Abha Center", city: "Abha", capacity: 40, devices: 38, rooms: 2, invigilatorPool: 4, status: "operational", satisfaction: 4.0, revenueYtd: 640_000, seatsBooked: 18, incidents: 1, deviceReady: 88 },
  { id: "c-hal", name: "Hail Center (future)", city: "Hail", capacity: 0, devices: 0, rooms: 0, invigilatorPool: 0, status: "future", satisfaction: 0, revenueYtd: 0, seatsBooked: 0, incidents: 0, deviceReady: 0 },
];

// ---- Candidates (20) -------------------------------------------------------
const FIRST = ["Ahmed", "Sara", "Mohammed", "Noura", "Yousef", "Aisha", "Ali", "Fatima", "Saud", "Maha", "Turki", "Lina", "Bandar", "Reem", "Majed", "Hind", "Fahad", "Rana", "Ziad", "Dana"];
const LAST = ["Al-Otaibi", "Al-Harbi", "Al-Qahtani", "Al-Ghamdi", "Al-Zahrani", "Al-Dossary", "Al-Shehri", "Al-Mutairi", "Al-Rashid", "Al-Subaie"];
const EMPLOYERS = ["Al Rajhi Bank", "SNB", "Riyad Bank", "SABB", "Alinma Bank", "CMA", "Tadawul", "Bank Albilad"];
const SECTORS = ["Banking", "Capital Markets", "Insurance", "Compliance", "Wealth"];
const CITIES = ["Riyadh", "Jeddah", "Dammam", "Abha", "Makkah"];

export const CANDIDATES: Candidate[] = Array.from({ length: 20 }, (_, i) => ({
  id: `cand-${i + 1}`,
  fullName: `${FIRST[i]} ${pick(LAST)}`,
  nationalId: `1${intBetween(100000000, 999999999)}`,
  email: `${FIRST[i].toLowerCase()}.${i}@example.com`,
  mobile: `+966 5${intBetween(0, 9)} ${intBetween(100, 999)} ${intBetween(1000, 9999)}`,
  employer: pick(EMPLOYERS),
  sector: pick(SECTORS),
  city: pick(CITIES),
  accommodations: rand() > 0.85 ? [pick(["Extra time (+25%)", "Separate room", "Large-print paper"])] : [],
  certificationId: pick(CERTIFICATIONS.filter((c) => c.status === "active").map((c) => c.id)),
  attempts: intBetween(1, 3),
  eligibilityStatus: pick(["eligible", "eligible", "eligible", "pending", "ineligible"] as const),
  paymentStatus: pick(["paid", "paid", "pending", "waived"] as const),
  misconductHistory: rand() > 0.9 ? [{ date: "2025-11-02", note: "Late arrival — warning issued" }] : [],
}));

// ---- Exam sessions (5) -----------------------------------------------------
export const SESSIONS: ExamSession[] = [
  { id: "sess-1", certificationId: "cert-cib", formId: "form-cert-cib-A", date: "2026-07-06", startTime: "09:00", durationMinutes: 120, centerId: "c-ryd", room: "Room 1", seatCapacity: 30, deliveryMethod: "center", invigilatorIds: ["u-invig"], candidateIds: CANDIDATES.slice(0, 8).map((c) => c.id), status: "scheduled" },
  { id: "sess-2", certificationId: "cert-aml", formId: "form-cert-aml-A", date: "2026-07-04", startTime: "10:00", durationMinutes: 120, centerId: "c-ryd", room: "Room 2", seatCapacity: 25, deliveryMethod: "center", vendorId: "v-secureproctor", invigilatorIds: ["u-invig"], candidateIds: CANDIDATES.slice(8, 14).map((c) => c.id), status: "active" },
  { id: "sess-3", certificationId: "cert-cma", formId: "form-cert-cma-B", date: "2026-06-28", startTime: "13:00", durationMinutes: 150, centerId: "c-jed", room: "Room 1", seatCapacity: 30, deliveryMethod: "blended", vendorId: "v-secureproctor", invigilatorIds: ["u-invig"], candidateIds: CANDIDATES.slice(14, 20).map((c) => c.id), status: "completed" },
  { id: "sess-4", certificationId: "cert-ins", formId: "form-cert-ins-A", date: "2026-07-10", startTime: "09:00", durationMinutes: 90, centerId: "c-dmm", room: "Room 1", seatCapacity: 20, deliveryMethod: "center", invigilatorIds: ["u-invig"], candidateIds: CANDIDATES.slice(0, 5).map((c) => c.id), status: "scheduled" },
  { id: "sess-5", certificationId: "cert-cib", formId: "form-cert-cib-B", date: "2026-06-20", startTime: "11:00", durationMinutes: 120, centerId: "c-jed", room: "Room 3", seatCapacity: 25, deliveryMethod: "remote", vendorId: "v-secureproctor", invigilatorIds: ["u-invig"], candidateIds: CANDIDATES.slice(10, 18).map((c) => c.id), status: "under_investigation" },
];

// ---- Live attempts (for the active session invigilation board) -------------
export const ATTEMPTS: CandidateAttempt[] = SESSIONS.find((s) => s.id === "sess-2")!.candidateIds.map((cid, i) => ({
  id: `att-${cid}`,
  candidateId: cid,
  sessionId: "sess-2",
  formId: "form-cert-aml-A",
  seat: `A-${i + 1}`,
  loginStatus: pick(["in_progress", "in_progress", "in_progress", "verifying", "submitted"] as const),
  identityVerified: rand() > 0.15,
  progress: intBetween(10, 95),
  timeRemainingMin: intBetween(20, 110),
  connection: pick(["stable", "stable", "stable", "unstable", "disconnected"] as const),
  isLocked: false,
  flags: rand() > 0.7 ? [pick(["Rapid answer changes", "Multiple login attempts", "Unusual idle time", "Repeated disconnects"])] : [],
}));

// ---- Results ---------------------------------------------------------------
export const RESULTS: Result[] = CANDIDATES.map((cand, i) => {
  const cert = CERTIFICATIONS.find((c) => c.id === cand.certificationId)!;
  const scaled = intBetween(45, 95);
  const passed = scaled >= cert.passingScore;
  const status = pick<Result["status"]>(i < 6 ? ["released", "released", "approved"] : ["pending", "approved", "held", "released"]);
  return {
    id: `res-${i + 1}`,
    attemptId: `att-hist-${i + 1}`,
    candidateId: cand.id,
    certificationId: cand.certificationId,
    rawScore: scaled - intBetween(0, 4),
    scaledScore: scaled,
    passingScore: cert.passingScore,
    passed,
    domainScores: DOMAINS[cand.certificationId].map((d) => ({ domain: d, score: intBetween(40, 98) })),
    status,
    approvedBy: ["approved", "released"].includes(status) ? "u-committee" : undefined,
    releasedBy: status === "released" ? "u-cert" : undefined,
    releasedAt: status === "released" ? "2026-06-30T12:00:00Z" : undefined,
  };
});

// ---- Certificates (5) ------------------------------------------------------
export const CERTIFICATES: Certificate[] = RESULTS.filter((r) => r.passed && r.status === "released").slice(0, 5).map((r, i) => ({
  id: `crt-${i + 1}`,
  resultId: r.id,
  candidateId: r.candidateId,
  certificationId: r.certificationId,
  certificateNo: `TFA-${r.certificationId.split("-")[1].toUpperCase()}-2026-${String(1000 + i)}`,
  issuedAt: "2026-06-30",
  validFrom: "2026-06-30",
  validTo: "2029-06-30",
  status: pick(["valid", "valid", "valid", "revoked"] as const),
  renewalStatus: pick(["current", "current", "due"] as const),
}));

// ---- Incidents (10) --------------------------------------------------------
const INC_TYPES: Incident["type"][] = ["identity", "technical", "suspected_cheating", "behavior", "late_arrival", "wrong_exam", "system_interruption", "emergency", "other"];
export const INCIDENTS: Incident[] = Array.from({ length: 10 }, (_, i) => {
  const sess = pick(SESSIONS);
  const type = INC_TYPES[i % INC_TYPES.length];
  return {
    id: `inc-${i + 1}`,
    sessionId: sess.id,
    candidateId: pick(sess.candidateIds),
    type,
    severity: pick(["low", "medium", "high", "critical"] as const),
    description: pick(["Candidate ID mismatch flagged at check-in.", "Workstation froze; candidate moved to backup device.", "Two candidates observed exchanging glances.", "Disruptive behavior reported by invigilator.", "Candidate arrived 20 minutes late.", "Wrong exam form loaded; corrected before start.", "Brief power interruption in room."]),
    evidence: rand() > 0.5 ? ["cctv-clip.mp4", "invigilator-note.pdf"] : [],
    reportedBy: "u-invig",
    recommendedAction: pick(["Escalate to committee", "Warning issued", "Continue with monitoring", "Void attempt pending review"]),
    resolutionStatus: pick(["open", "investigating", "resolved", "closed"] as const),
    createdAt: "2026-0" + intBetween(5, 7) + "-" + String(intBetween(10, 28)).padStart(2, "0") + "T" + String(intBetween(8, 15)).padStart(2, "0") + ":30:00Z",
  };
});

// ---- Appeals ---------------------------------------------------------------
export const APPEALS: Appeal[] = Array.from({ length: 6 }, (_, i) => {
  const cand = pick(CANDIDATES);
  return {
    id: `app-${i + 1}`,
    appealNo: `APL-2026-${String(200 + i)}`,
    candidateId: cand.id,
    sessionId: pick(SESSIONS).id,
    category: pick(["result", "technical", "center", "misconduct", "accommodation", "certificate"] as const),
    description: pick(["Requesting re-score of the risk-management domain.", "Reporting a technical disconnect during the exam.", "Complaint about center temperature and noise.", "Disputing a flagged misconduct note.", "Requesting extra-time accommodation for next attempt."]),
    evidence: rand() > 0.5 ? ["screenshot.png"] : [],
    assignedTo: "u-cert",
    slaDue: "2026-07-" + String(intBetween(10, 28)).padStart(2, "0"),
    status: pick(["submitted", "in_review", "decided", "closed"] as const),
    decision: rand() > 0.5 ? pick(["Upheld — re-score confirmed original result.", "Partially upheld — accommodation granted.", "Rejected — no evidence of technical fault."]) : undefined,
    communications: [{ date: "2026-06-29", from: "candidate", note: "Submitted appeal with supporting details." }, { date: "2026-06-30", from: "reviewer", note: "Acknowledged; SLA clock started." }],
  };
});

// ---- Vendors ---------------------------------------------------------------
export const VENDORS: Vendor[] = [
  { id: "v-secureproctor", name: "SecureProctor Ltd", type: "proctoring", slaTarget: 99.5, slaActual: 99.1, status: "active", assignedCenters: ["c-jed", "c-ryd"] },
  { id: "v-examhost", name: "ExamHost Cloud", type: "platform", slaTarget: 99.9, slaActual: 99.7, status: "active", assignedCenters: [] },
  { id: "v-testpoint", name: "TestPoint Centers", type: "center", slaTarget: 98.0, slaActual: 96.4, status: "review", assignedCenters: ["c-dmm"] },
];

// ---- Committees ------------------------------------------------------------
export const COMMITTEES: Committee[] = [
  { id: "com-exam", name: "Exam Committee", mandate: "Approve questions, exam forms, and result release.", members: ["u-committee", "u-cert", "u-psych"] },
  { id: "com-sec", name: "Security & Integrity Committee", mandate: "Review incidents, compromised questions, and access controls.", members: ["u-committee", "u-admin", "u-auditor"] },
];
export const COMMITTEE_DECISIONS: CommitteeDecision[] = [
  { id: "cd-1", committeeId: "com-exam", meetingDate: "2026-06-25", agenda: "Approve TFA-AML Form A and batch of 30 new questions.", decision: "Approved with 2 questions returned for revision.", documents: ["minutes-2026-06-25.pdf"], status: "approved", actionOwners: ["u-author"], dueDate: "2026-07-10" },
  { id: "cd-2", committeeId: "com-sec", meetingDate: "2026-06-27", agenda: "Review flagged question Q-CIB-0042 for possible compromise.", decision: "Question suspended pending investigation.", documents: ["security-review.pdf"], status: "approved", actionOwners: ["u-psych"], dueDate: "2026-07-05" },
  { id: "cd-3", committeeId: "com-exam", meetingDate: "2026-06-30", agenda: "Result release for CMA session sess-3.", decision: "Deferred pending item analysis of 3 flagged items.", documents: [], status: "deferred", actionOwners: ["u-psych"], dueDate: "2026-07-08" },
];

// ---- Security alerts -------------------------------------------------------
export const SECURITY_ALERTS: SecurityAlert[] = [
  { id: "al-1", type: "exposure", severity: "high", subjectType: "question", subjectId: "Q-CIB-0007", message: "Usage count (238) exceeds exposure limit (150). Recommend retirement.", status: "open", createdAt: "2026-07-03T08:00:00Z" },
  { id: "al-2", type: "discrimination", severity: "medium", subjectType: "question", subjectId: "Q-AML-0031", message: "Negative discrimination index (-0.12). Flag for psychometric review.", status: "open", createdAt: "2026-07-02T14:00:00Z" },
  { id: "al-3", type: "pass_rate", severity: "high", subjectType: "certification", subjectId: "cert-cma", message: "Pass rate for CMA Form B spiked to 94% (baseline 61%). Possible leakage.", status: "acknowledged", createdAt: "2026-07-01T09:00:00Z" },
  { id: "al-4", type: "behavior", severity: "critical", subjectType: "session", subjectId: "sess-5", message: "Multiple candidates with rapid identical answer patterns. Session under investigation.", status: "open", createdAt: "2026-06-20T12:30:00Z" },
  { id: "al-5", type: "access", severity: "low", subjectType: "user", subjectId: "u-author", message: "Answer-key views (18) above weekly average. Routine review.", status: "resolved", createdAt: "2026-06-28T10:00:00Z" },
  { id: "al-6", type: "leakage", severity: "high", subjectType: "form", subjectId: "form-cert-cma-B", message: "Leakage-risk indicator elevated: overlapping items with a retired form.", status: "open", createdAt: "2026-07-02T16:00:00Z" },
];

// ---- Audit logs ------------------------------------------------------------
const AUDIT_ACTIONS: AuditLog["action"][] = ["login", "failed_login", "question_viewed", "answer_viewed", "question_edited", "question_exported", "question_approved", "form_generated", "form_approved", "candidate_registered", "exam_started", "exam_submitted", "result_changed", "result_released", "incident_created", "report_downloaded", "permission_changed"];
export const AUDIT_LOGS: AuditLog[] = Array.from({ length: 60 }, (_, i) => {
  const user = pick(USERS);
  const action = pick(AUDIT_ACTIONS);
  const highRisk = ["answer_viewed", "question_exported", "result_changed", "permission_changed", "failed_login"].includes(action);
  return {
    id: `aud-${i + 1}`,
    userId: user.id,
    roleKey: user.roleKey,
    action,
    objectType: action.includes("question") || action === "answer_viewed" ? "Question" : action.includes("form") ? "ExamForm" : action.includes("result") ? "Result" : action.includes("candidate") ? "Candidate" : action.includes("exam") ? "Attempt" : "System",
    objectId: action.includes("question") || action === "answer_viewed" ? pick(QUESTIONS).id : action.includes("form") ? pick(EXAM_FORMS).id : "—",
    beforeValue: action === "result_changed" ? "score: 68" : action === "permission_changed" ? "role: reviewer" : undefined,
    afterValue: action === "result_changed" ? "score: 72" : action === "permission_changed" ? "role: approver" : undefined,
    ipAddress: `10.20.${intBetween(1, 40)}.${intBetween(2, 250)}`,
    device: pick(["Chrome / Windows", "Edge / Windows", "Safari / macOS", "Chrome / Android"]),
    riskLevel: highRisk ? pick(["medium", "high"] as const) : "low",
    notes: highRisk ? "Sensitive action — watermark applied." : "",
    createdAt: "2026-07-0" + intBetween(1, 4) + "T" + String(intBetween(6, 18)).padStart(2, "0") + ":" + String(intBetween(0, 59)).padStart(2, "0") + ":00Z",
  };
}).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

// ---- Notifications ---------------------------------------------------------
export const NOTIFICATIONS: Notification[] = [
  { id: "n-1", channel: "email", template: "result_available", subject: "Your TFA-CIB result is available", body: "Your result has been released. Log in to view your score report.", status: "sent", createdAt: "2026-06-30T12:05:00Z" },
  { id: "n-2", channel: "sms", template: "exam_reminder", subject: "Exam reminder", body: "Reminder: your TFA-AML exam is tomorrow at 10:00, Riyadh Main Center.", status: "sent", createdAt: "2026-07-03T18:00:00Z" },
  { id: "n-3", channel: "in_app", template: "committee_approval", subject: "Approval requested", body: "TFA-AML Form A awaits your committee approval.", status: "read", createdAt: "2026-06-24T09:00:00Z" },
  { id: "n-4", channel: "whatsapp", template: "certificate_issued", subject: "Certificate issued", body: "Congratulations — your certificate TFA-CIB-2026-1000 has been issued.", status: "queued", createdAt: "2026-06-30T13:00:00Z" },
  { id: "n-5", channel: "email", template: "appeal_received", subject: "Appeal received", body: "We have received your appeal APL-2026-200. SLA: 10 business days.", status: "sent", createdAt: "2026-06-29T10:00:00Z" },
];

// ---- Roll up certification stats from the generated data -------------------
for (const cert of CERTIFICATIONS) {
  const certResults = RESULTS.filter((r) => r.certificationId === cert.id);
  const certCands = CANDIDATES.filter((c) => c.certificationId === cert.id);
  const passed = certResults.filter((r) => r.passed).length;
  const certQs = QUESTIONS.filter((q) => q.certificationId === cert.id);
  cert.stats = {
    candidates: certCands.length,
    passRate: certResults.length ? Math.round((passed / certResults.length) * 100) : 0,
    failRate: certResults.length ? Math.round(((certResults.length - passed) / certResults.length) * 100) : 0,
    noShowRate: intBetween(3, 12),
    avgScore: certResults.length ? Math.round(certResults.reduce((s, r) => s + r.scaledScore, 0) / certResults.length) : 0,
    activeQuestions: certQs.filter((q) => q.status === "active").length,
    flaggedQuestions: certQs.filter((q) => q.flagCount > 0).length,
    retiredQuestions: certQs.filter((q) => q.status === "retired").length,
    revenue: certCands.length * cert.examFee,
  };
}
