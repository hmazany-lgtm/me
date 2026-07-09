import type { Locale } from "./types";

// ---------------------------------------------------------------------------
// Bilingual dictionary (Arabic default). Keys are dot-free flat identifiers.
// ---------------------------------------------------------------------------

type Dict = Record<string, { ar: string; en: string }>;

export const dict: Dict = {
  // App / brand
  appName: { ar: "مصطفى", en: "Mustafa" },
  appTagline: {
    ar: "المتدرب الافتراضي الذكي لتفعيل التدريب",
    en: "Virtual Trainee Engagement Agent",
  },
  academy: { ar: "الأكاديمية المالية", en: "The Financial Academy" },

  // Nav
  navHome: { ar: "الرئيسية", en: "Home" },
  navDashboard: { ar: "لوحة التحكم", en: "Dashboard" },
  navProgrammes: { ar: "البرامج", en: "Programmes" },
  navCreateProgramme: { ar: "إنشاء برنامج", en: "Create Programme" },
  navUpload: { ar: "رفع المحتوى", en: "Upload Content" },
  navAnalysis: { ar: "تحليل البرنامج", en: "Programme Analysis" },
  navPersonas: { ar: "شخصيات مصطفى", en: "Persona Builder" },
  navControlRoom: { ar: "غرفة إدارة الجلسة", en: "Session Control Room" },
  navSimulation: { ar: "المحاكاة المباشرة", en: "Live Simulation" },
  navInterventions: { ar: "التدخلات المقترحة", en: "Suggested Interventions" },
  navQuestionBank: { ar: "بنك الأسئلة", en: "Question Bank" },
  navActivities: { ar: "مولّد الأنشطة", en: "Activity Generator" },
  navReports: { ar: "التقارير", en: "Reports" },
  navAdmin: { ar: "إعدادات النظام", en: "Admin Settings" },
  navUsers: { ar: "إدارة المستخدمين", en: "User Management" },
  navHelp: { ar: "الذكاء المسؤول", en: "Responsible AI" },
  navLogin: { ar: "تسجيل الدخول", en: "Login" },
  logout: { ar: "تسجيل الخروج", en: "Logout" },

  // Common
  save: { ar: "حفظ", en: "Save" },
  cancel: { ar: "إلغاء", en: "Cancel" },
  create: { ar: "إنشاء", en: "Create" },
  edit: { ar: "تعديل", en: "Edit" },
  delete: { ar: "حذف", en: "Delete" },
  approve: { ar: "اعتماد", en: "Approve" },
  reject: { ar: "رفض", en: "Reject" },
  post: { ar: "نشر", en: "Post" },
  copy: { ar: "نسخ", en: "Copy" },
  copied: { ar: "تم النسخ", en: "Copied" },
  export: { ar: "تصدير", en: "Export" },
  exportPdf: { ar: "تصدير PDF", en: "Export PDF" },
  print: { ar: "طباعة", en: "Print" },
  back: { ar: "رجوع", en: "Back" },
  next: { ar: "التالي", en: "Next" },
  optional: { ar: "اختياري", en: "optional" },
  minutes: { ar: "دقيقة", en: "min" },
  all: { ar: "الكل", en: "All" },
  search: { ar: "بحث", en: "Search" },
  none: { ar: "لا يوجد", en: "None" },
  viewDetails: { ar: "عرض التفاصيل", en: "View details" },
  comingSoon: { ar: "قريبًا", en: "Coming soon" },

  // Roles
  role_admin: { ar: "مدير النظام", en: "Admin" },
  role_programme_manager: { ar: "مدير البرنامج", en: "Programme Manager" },
  role_trainer: { ar: "المدرّب", en: "Trainer" },
  role_coordinator: { ar: "منسق التدريب", en: "Coordinator" },
  role_viewer: { ar: "مطّلع", en: "Viewer" },

  // Landing
  heroBadge: { ar: "مُتدرّب افتراضي مدعوم بالذكاء الاصطناعي", en: "AI-powered virtual trainee" },
  heroTitle: {
    ar: "حوّل جلساتك التدريبية عن بُعد إلى تجربة تعلّم تفاعلية",
    en: "Turn passive online sessions into engaging learning experiences",
  },
  heroSubtitle: {
    ar: "مصطفى متدرّب افتراضي ذكي يثري النقاش، يُفعّل المشاركة، ويدعم المدرّب — دون أن يحل محله.",
    en: "Mustafa is an intelligent virtual trainee that enriches discussion, activates participation, and supports the trainer — without replacing them.",
  },
  ctaStart: { ar: "ابدأ الآن", en: "Get started" },
  ctaDemo: { ar: "شاهد سيناريو تجريبي", en: "See a demo scenario" },
  landingConceptTitle: { ar: "محفّز للتفاعل، وليس بديلاً عن المدرّب", en: "An engagement catalyst, not a trainer replacement" },
  landingConceptBody: {
    ar: "يساعد مصطفى المدرّب على بناء بيئة تعلّم نشطة من خلال طرح أسئلة ذكية، وتشجيع المشاركة، وتلخيص النقاط، واقتراح الأنشطة، وتحدي الافتراضات باحترام، وتذكير المدرّب بفرص التفاعل.",
    en: "Mustafa helps trainers build an active learning environment by asking smart questions, encouraging participation, summarizing key points, suggesting activities, respectfully challenging assumptions, and reminding the trainer of engagement opportunities.",
  },
  featuresTitle: { ar: "ماذا يفعل مصطفى؟", en: "What Mustafa does" },
  usersTitle: { ar: "لمن صُمّم؟", en: "Who it's for" },
  lifecycleTitle: { ar: "قبل، أثناء، وبعد الجلسة", en: "Before, during & after the session" },

  // Dashboard
  welcome: { ar: "مرحبًا", en: "Welcome" },
  dashSubtitle: { ar: "نظرة عامة على برامجك وتفاعل جلساتك", en: "An overview of your programmes and session engagement" },
  kpiProgrammes: { ar: "البرامج النشطة", en: "Active programmes" },
  kpiSessions: { ar: "الجلسات", en: "Sessions" },
  kpiSuggestions: { ar: "اقتراحات مصطفى", en: "Mustafa suggestions" },
  kpiEngagement: { ar: "متوسط التفاعل", en: "Avg. engagement" },
  quickActions: { ar: "إجراءات سريعة", en: "Quick actions" },
  recentProgrammes: { ar: "أحدث البرامج", en: "Recent programmes" },

  // Programme form
  progName: { ar: "اسم البرنامج", en: "Programme name" },
  progNameAr: { ar: "اسم البرنامج (عربي)", en: "Programme name (Arabic)" },
  progCode: { ar: "رمز البرنامج", en: "Programme code" },
  progDate: { ar: "التاريخ والوقت", en: "Date & time" },
  trainerName: { ar: "اسم المدرّب", en: "Trainer name" },
  coordinatorName: { ar: "اسم المنسق", en: "Coordinator name" },
  targetAudience: { ar: "الفئة المستهدفة", en: "Target audience" },
  sector: { ar: "القطاع", en: "Sector" },
  platform: { ar: "منصة التقديم", en: "Delivery platform" },
  sessionLanguage: { ar: "لغة الجلسة", en: "Session language" },
  level: { ar: "المستوى", en: "Level" },
  objectives: { ar: "أهداف البرنامج", en: "Programme objectives" },
  outcomes: { ar: "مخرجات التعلّم التفصيلية", en: "Detailed learning outcomes" },
  agenda: { ar: "الأجندة", en: "Agenda" },
  duration: { ar: "المدة (دقائق)", en: "Duration (minutes)" },
  participantProfile: { ar: "ملف المشاركين", en: "Participant profile" },
  sensitiveTopics: { ar: "مواضيع حساسة أو مقيّدة", en: "Sensitive or restricted topics" },
  engagementStyle: { ar: "أسلوب التفاعل المفضّل", en: "Preferred engagement style" },
  mustafaVisible: { ar: "ظهور مصطفى للمشاركين", en: "Mustafa visible to participants" },
  mustafaVisibleHint: { ar: "عند التفعيل يظهر مصطفى كمساعد افتراضي للجميع، وإلا يكون خاصًا بالمدرّب فقط.", en: "When on, Mustafa appears as a virtual assistant to everyone; otherwise private to the trainer only." },
  addLine: { ar: "إضافة سطر", en: "Add line" },
  addAgendaItem: { ar: "إضافة بند", en: "Add agenda item" },
  programmeCreated: { ar: "تم إنشاء البرنامج بنجاح", en: "Programme created successfully" },

  // Upload
  uploadTitle: { ar: "رفع محتوى البرنامج", en: "Upload programme content" },
  uploadHint: { ar: "PDF، Word، PowerPoint، Excel، أو نص. سيستخرج مصطفى المحتوى ويولّد التحليل.", en: "PDF, Word, PowerPoint, Excel, or text. Mustafa extracts the content and generates analysis." },
  dropHere: { ar: "اسحب الملفات هنا أو اضغط للاختيار", en: "Drop files here or click to browse" },
  pasteAgenda: { ar: "أو الصق نص الأجندة / مخطط البرنامج", en: "Or paste agenda text / programme outline" },
  analyze: { ar: "تحليل بواسطة مصطفى", en: "Analyze with Mustafa" },
  analyzing: { ar: "جارٍ التحليل…", en: "Analyzing…" },

  // Analysis
  analysisSummary: { ar: "ملخص البرنامج", en: "Programme summary" },
  analysisThemes: { ar: "المحاور الرئيسية", en: "Key themes" },
  analysisChallenges: { ar: "تحديات متوقعة للمشاركين", en: "Expected participant challenges" },
  analysisMoments: { ar: "لحظات تفاعل مقترحة", en: "Suggested engagement moments" },
  analysisQuestions: { ar: "أسئلة مقترحة", en: "Suggested questions" },
  analysisActivities: { ar: "أنشطة مقترحة", en: "Suggested activities" },
  buildScript: { ar: "إنشاء سيناريو تفاعل الجلسة", en: "Build session engagement script" },

  // Personas
  personasSubtitle: { ar: "اختر شخصية مصطفى المناسبة لجلستك", en: "Choose the Mustafa persona that fits your session" },
  personaSelected: { ar: "الشخصية المختارة", en: "Selected persona" },
  selectPersona: { ar: "اختيار", en: "Select" },
  sampleQuestions: { ar: "أمثلة على الأسئلة", en: "Sample questions" },

  // Control room / simulation / engine
  controlRoomSubtitle: { ar: "متابعة حية لصحة التفاعل وتدخلات مصطفى", en: "Live monitoring of engagement health and Mustafa's interventions" },
  currentTopic: { ar: "الموضوع الحالي", en: "Current topic" },
  engagementHealth: { ar: "مؤشر صحة التفاعل", en: "Engagement health" },
  nextIntervention: { ar: "التدخل المقترح التالي", en: "Suggested next intervention" },
  suggestedChat: { ar: "رسالة دردشة مقترحة", en: "Suggested chat message" },
  suggestedVerbal: { ar: "سؤال شفهي مقترح", en: "Suggested verbal question" },
  suggestedActivity: { ar: "نشاط مقترح", en: "Suggested activity" },
  sinceLastInteraction: { ar: "منذ آخر تفاعل", en: "Since last interaction" },
  participationLevel: { ar: "مستوى المشاركة", en: "Participation level" },
  energyLevel: { ar: "تقدير مستوى الطاقة", en: "Energy level estimate" },
  recommendedAction: { ar: "الإجراء الموصى به", en: "Recommended action" },
  low: { ar: "منخفض", en: "Low" },
  medium: { ar: "متوسط", en: "Medium" },
  high: { ar: "مرتفع", en: "High" },

  simTitle: { ar: "المحاكاة المباشرة", en: "Live Simulation" },
  simSubtitle: { ar: "صف ما يحدث الآن في الجلسة ودع مصطفى يقترح", en: "Describe what's happening now and let Mustafa suggest" },
  whatsHappening: { ar: "ماذا يحدث الآن في الجلسة؟", en: "What is happening in the session now?" },
  pasteChat: { ar: "الصق تعليقات الدردشة (اختياري)", en: "Paste chat comments (optional)" },
  currentSection: { ar: "بند الأجندة الحالي", en: "Current agenda section" },
  askMustafa: { ar: "اسأل مصطفى", en: "Ask Mustafa" },
  thinking: { ar: "مصطفى يفكّر…", en: "Mustafa is thinking…" },
  persona: { ar: "الشخصية", en: "Persona" },
  tone: { ar: "النبرة", en: "Tone" },
  selectProgramme: { ar: "اختر البرنامج", en: "Select programme" },
  minsElapsed: { ar: "الدقائق المنقضية", en: "Minutes elapsed" },

  // Suggestion card
  purpose: { ar: "الغرض", en: "Purpose" },
  delivery: { ar: "طريقة التقديم", en: "Delivery" },
  audience: { ar: "الجمهور", en: "Audience" },
  audience_participants: { ar: "المشاركون", en: "Participants" },
  audience_trainer_private: { ar: "المدرّب (خاص)", en: "Trainer (private)" },
  confidence: { ar: "الثقة", en: "Confidence" },
  statusPending: { ar: "بانتظار الاعتماد", en: "Pending" },
  statusApproved: { ar: "معتمد", en: "Approved" },
  statusRejected: { ar: "مرفوض", en: "Rejected" },
  statusPosted: { ar: "منشور", en: "Posted" },

  // Question bank
  qbSubtitle: { ar: "بنك أسئلة ديناميكي لكل برنامج", en: "A dynamic question bank for each programme" },
  category: { ar: "التصنيف", en: "Category" },
  timing: { ar: "التوقيت الأمثل", en: "Best timing" },
  difficulty: { ar: "المستوى", en: "Difficulty" },
  learningValue: { ar: "القيمة التعليمية", en: "Learning value" },

  // Activities
  actSubtitle: { ar: "أنشطة تفاعلية مقترحة حسب الموضوع", en: "Interactive activities suggested by topic" },

  // Reports
  reportTitle: { ar: "تقرير مصطفى للتفاعل", en: "Mustafa Engagement Report" },
  reportSubtitle: { ar: "ملخص شامل لتفاعل الجلسة وتوصيات التطوير", en: "A comprehensive summary of session engagement and improvement recommendations" },
  generateReport: { ar: "توليد التقرير", en: "Generate report" },
  sessionSummary: { ar: "ملخص الجلسة", en: "Session summary" },
  timeline: { ar: "الجدول الزمني للتدخلات", en: "Timeline of interventions" },
  bestMoments: { ar: "أبرز لحظات النقاش", en: "Best moments of discussion" },
  missedOpportunities: { ar: "فرص لم تُستثمر", en: "Missed opportunities" },
  recommendations: { ar: "توصيات للمدرّب", en: "Trainer recommendations" },
  followUp: { ar: "رسالة متابعة مقترحة للمشاركين", en: "Suggested follow-up message" },
  assignment: { ar: "تكليف تأملي مقترح", en: "Suggested reflective assignment" },
  interactions: { ar: "عدد التفاعلات", en: "Interactions" },
  improvementPlan: { ar: "خطة التحسين المقترحة", en: "Suggested improvement plan" },

  // Admin
  adminSubtitle: { ar: "التحكم في سلوك مصطفى، اللغة، والعلامة التجارية", en: "Control Mustafa's behavior, language, and branding" },
  defaultTone: { ar: "النبرة الافتراضية", en: "Default tone" },
  defaultLanguage: { ar: "اللغة الافتراضية", en: "Default language" },
  approvedTerminology: { ar: "المصطلحات المعتمدة", en: "Approved terminology" },
  restrictedWords: { ar: "كلمات مقيّدة", en: "Restricted words" },
  autoPost: { ar: "النشر التلقائي دون اعتماد", en: "Auto-post without approval" },
  maxInterventions: { ar: "حد أقصى للتدخلات كل 10 دقائق", en: "Max interventions per 10 min" },
  minBetween: { ar: "أدنى فاصل زمني بين التدخلات (دقائق)", en: "Min minutes between interventions" },
  allowDevils: { ar: "السماح بوضع محامي الشيطان", en: "Allow devil's advocate mode" },
  branding: { ar: "العلامة التجارية", en: "Branding" },
  settingsSaved: { ar: "تم حفظ الإعدادات", en: "Settings saved" },

  // Users
  usersSubtitle: { ar: "الأدوار والصلاحيات", en: "Roles and permissions" },

  // Help / Responsible AI
  helpTitle: { ar: "الذكاء المسؤول والخصوصية", en: "Responsible AI & Privacy" },
  helpSubtitle: { ar: "كيف يعمل مصطفى بشكل أخلاقي ومحترم", en: "How Mustafa works ethically and respectfully" },

  // Tones
  tone_formal: { ar: "رسمية", en: "Formal" },
  tone_friendly: { ar: "ودّية", en: "Friendly" },
  tone_executive: { ar: "تنفيذية", en: "Executive" },
  tone_youthful: { ar: "شبابية", en: "Youthful" },
  tone_practical: { ar: "عملية", en: "Practical" },
  tone_challenging: { ar: "تحدّي", en: "Challenging" },
  tone_reflective: { ar: "تأملية", en: "Reflective" },

  // Delivery methods
  delivery_chat: { ar: "دردشة", en: "Chat" },
  delivery_verbal: { ar: "شفهي", en: "Verbal" },
  delivery_poll: { ar: "تصويت", en: "Poll" },
  delivery_breakout: { ar: "مجموعات", en: "Breakout" },

  // Empty states
  noProgrammes: { ar: "لا توجد برامج بعد. أنشئ برنامجك الأول.", en: "No programmes yet. Create your first one." },
  selectProgrammeFirst: { ar: "اختر برنامجًا للبدء.", en: "Select a programme to begin." },
};

// Sector / platform / level / language / category / type labels
export const enumLabels: Record<string, { ar: string; en: string }> = {
  // sectors
  banking: { ar: "المصرفية", en: "Banking" },
  insurance: { ar: "التأمين", en: "Insurance" },
  capital_market: { ar: "سوق المال", en: "Capital Market" },
  fintech: { ar: "التقنية المالية", en: "Fintech" },
  leadership: { ar: "القيادة", en: "Leadership" },
  compliance: { ar: "الالتزام", en: "Compliance" },
  risk: { ar: "المخاطر", en: "Risk" },
  sales: { ar: "المبيعات", en: "Sales" },
  operations: { ar: "العمليات", en: "Operations" },
  customer_experience: { ar: "تجربة العميل", en: "Customer Experience" },
  // platforms
  zoom: { ar: "Zoom", en: "Zoom" },
  teams: { ar: "Microsoft Teams", en: "Microsoft Teams" },
  webex: { ar: "Webex", en: "Webex" },
  google_meet: { ar: "Google Meet", en: "Google Meet" },
  lms: { ar: "نظام إدارة التعلّم", en: "LMS" },
  custom: { ar: "مخصص", en: "Custom" },
  // levels
  beginner: { ar: "مبتدئ", en: "Beginner" },
  intermediate: { ar: "متوسط", en: "Intermediate" },
  advanced: { ar: "متقدم", en: "Advanced" },
  executive: { ar: "تنفيذي", en: "Executive" },
  // session language
  bilingual: { ar: "ثنائي اللغة", en: "Bilingual" },
  // engagement styles
  interactive: { ar: "تفاعلي", en: "Interactive" },
  reflective: { ar: "تأملي", en: "Reflective" },
  case_based: { ar: "قائم على الحالات", en: "Case-based" },
  socratic: { ar: "سقراطي", en: "Socratic" },
  practical: { ar: "عملي", en: "Practical" },
  // question categories
  opening: { ar: "افتتاحية", en: "Opening" },
  icebreaker: { ar: "كسر الجليد", en: "Icebreaker" },
  concept_check: { ar: "فحص المفاهيم", en: "Concept check" },
  applied: { ar: "تطبيقية", en: "Applied practice" },
  devils_advocate: { ar: "محامي الشيطان", en: "Devil's advocate" },
  regulatory: { ar: "تنظيمية", en: "Regulatory" },
  customer_impact: { ar: "أثر العميل", en: "Customer impact" },
  closing: { ar: "ختامية", en: "Closing" },
  // difficulty
  easy: { ar: "سهل", en: "Easy" },
  hard: { ar: "صعب", en: "Hard" },
  // intervention types
  clarifying_question: { ar: "سؤال توضيحي", en: "Clarifying question" },
  deepening_question: { ar: "سؤال تعميقي", en: "Deepening question" },
  practical_example: { ar: "مثال عملي", en: "Practical example" },
  socratic_question: { ar: "سؤال سقراطي", en: "Socratic question" },
  poll: { ar: "تصويت", en: "Poll" },
  breakout: { ar: "مجموعات عمل", en: "Breakout" },
  reflection: { ar: "تأمّل", en: "Reflection" },
  case_study: { ar: "دراسة حالة", en: "Case study" },
  summary: { ar: "تلخيص", en: "Summary" },
  energy_booster: { ar: "منشّط طاقة", en: "Energy booster" },
  task_distribution: { ar: "توزيع مهام", en: "Task distribution" },
  trainer_reminder: { ar: "تذكير المدرّب", en: "Trainer reminder" },
  closing_question: { ar: "سؤال ختامي", en: "Closing question" },
  // activity types
  reflection_2min: { ar: "تأمّل دقيقتين", en: "2-minute reflection" },
  case_discussion: { ar: "مناقشة حالة", en: "Case discussion" },
  role_play: { ar: "لعب أدوار", en: "Role play" },
  scenario_analysis: { ar: "تحليل سيناريو", en: "Scenario analysis" },
  risk_identification: { ar: "تحديد المخاطر", en: "Risk identification" },
  compliance_judgment: { ar: "حكم التزامي", en: "Compliance judgment" },
  customer_journey: { ar: "رحلة العميل", en: "Customer journey" },
  debate: { ar: "مناظرة", en: "Debate" },
  group_prioritization: { ar: "ترتيب أولويات جماعي", en: "Group prioritization" },
  what_would_you_do: { ar: "ماذا ستفعل؟", en: "What would you do?" },
  before_after: { ar: "قبل / بعد", en: "Before / after" },
  misconception_correction: { ar: "تصحيح مفاهيم خاطئة", en: "Misconception correction" },
};

export function label(key: string, locale: Locale): string {
  const entry = dict[key] || enumLabels[key];
  if (!entry) return key;
  return entry[locale];
}
