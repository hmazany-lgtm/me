import type {
  User,
  Programme,
  BankQuestion,
  Activity,
  AdminSettings,
  ActivityType,
  Sector,
} from "./types";

// ---------------------------------------------------------------------------
// Seed / sample data. In a production build this is replaced by the database
// (see prisma/schema.prisma). The client store hydrates from these seeds.
// ---------------------------------------------------------------------------

export const seedUsers: User[] = [
  { id: "u_admin", name: "Nada Al-Otaibi", nameAr: "ندى العتيبي", email: "admin@fa.gov.sa", role: "admin", avatarColor: "#0f7a62" },
  { id: "u_pm", name: "Faisal Al-Harbi", nameAr: "فيصل الحربي", email: "manager@fa.gov.sa", role: "programme_manager", avatarColor: "#c6902a" },
  { id: "u_trainer", name: "Dr. Sara Al-Qahtani", nameAr: "د. سارة القحطاني", email: "trainer@fa.gov.sa", role: "trainer", avatarColor: "#1f9878" },
  { id: "u_coord", name: "Yousef Al-Dossary", nameAr: "يوسف الدوسري", email: "coordinator@fa.gov.sa", role: "coordinator", avatarColor: "#87531f" },
  { id: "u_viewer", name: "Layla Al-Mutairi", nameAr: "ليلى المطيري", email: "viewer@fa.gov.sa", role: "viewer", avatarColor: "#38504a" },
];

export const sampleProgramme: Programme = {
  id: "p_compliance",
  name: "Compliance and Risk Awareness for Financial Institutions",
  nameAr: "الوعي بالالتزام والمخاطر للمؤسسات المالية",
  code: "FA-CRA-101",
  date: "2026-07-20T09:00:00",
  trainerName: "Dr. Sara Al-Qahtani",
  coordinatorName: "Yousef Al-Dossary",
  targetAudience: "Junior compliance officers",
  sector: "compliance",
  platform: "teams",
  language: "bilingual",
  level: "beginner",
  objectives: [
    "Understand the role of compliance in financial institutions",
    "Identify common compliance risks",
    "Apply practical questioning in real cases",
    "Understand the relationship between regulation, customer protection, and institutional governance",
  ],
  outcomes: [
    "Explain why compliance protects both the institution and the customer",
    "Recognize at least five common compliance red flags",
    "Structure a basic compliance judgment for a realistic scenario",
    "Describe how governance links regulation to daily operations",
  ],
  agenda: [
    { id: "a1", title: "The role of compliance in financial institutions", minutes: 40 },
    { id: "a2", title: "Common compliance risks and red flags", minutes: 45 },
    { id: "a3", title: "Practical questioning in real cases", minutes: 55 },
    { id: "a4", title: "Regulation, customer protection & governance", minutes: 40 },
  ],
  durationMinutes: 180,
  participantProfile:
    "Recently hired compliance officers with 0-2 years of experience across banks and finance companies.",
  sensitiveTopics: "Avoid referencing specific institutions by name or real ongoing cases.",
  engagementStyle: "case_based",
  mustafaVisible: true,
  createdBy: "u_pm",
  createdAt: "2026-07-01T08:00:00",
};

export const seedProgrammes: Programme[] = [sampleProgramme];

// --- Sample question bank for the compliance programme --------------------
export const sampleQuestions: BankQuestion[] = [
  {
    id: "q1", category: "opening",
    textAr: "قبل أن نبدأ: ما أول ما يخطر في ذهنك عند سماع كلمة \"الالتزام\"؟",
    textEn: "Before we begin: what's the first thing that comes to mind when you hear the word \"compliance\"?",
    purposeAr: "كشف التصورات المسبقة", purposeEn: "Surface prior assumptions",
    timing: "opening", difficulty: "easy", delivery: "chat",
    learningValueAr: "يهيّئ المشاركين ويكشف الفهم الأولي", learningValueEn: "Primes participants and reveals baseline understanding",
  },
  {
    id: "q2", category: "icebreaker",
    textAr: "بكلمة واحدة: هل الالتزام عائق أم حماية؟ اكتبها في الدردشة.",
    textEn: "In one word: is compliance a barrier or a protection? Type it in the chat.",
    purposeAr: "كسر الجليد وتحفيز المشاركة المبكرة", purposeEn: "Break the ice and prompt early participation",
    timing: "opening", difficulty: "easy", delivery: "poll",
    learningValueAr: "يشرك الجميع دون ضغط", learningValueEn: "Engages everyone with low pressure",
  },
  {
    id: "q3", category: "concept_check",
    textAr: "ما الفرق العملي بين المخاطرة والمخالفة؟", textEn: "What is the practical difference between a risk and a violation?",
    purposeAr: "التأكد من وضوح المفاهيم الأساسية", purposeEn: "Confirm clarity of core concepts",
    timing: "early", difficulty: "medium", delivery: "verbal",
    learningValueAr: "يمنع الخلط المفاهيمي لاحقًا", learningValueEn: "Prevents conceptual confusion later",
  },
  {
    id: "q4", category: "applied",
    textAr: "لو وصلتك عملية تحويل كبيرة غير معتادة من حساب خامل، ما أول ثلاث خطوات ستتخذها؟",
    textEn: "If you received a large unusual transfer from a dormant account, what would your first three steps be?",
    purposeAr: "تطبيق المعرفة في موقف واقعي", purposeEn: "Apply knowledge to a realistic situation",
    timing: "mid", difficulty: "medium", delivery: "breakout",
    learningValueAr: "يربط النظرية بالإجراء", learningValueEn: "Bridges theory and procedure",
  },
  {
    id: "q5", category: "socratic",
    textAr: "ما الافتراض الذي نبني عليه أن \"العميل القديم أقل خطورة\"؟ وهل يصمد؟",
    textEn: "What assumption underlies \"a long-standing customer is lower risk\"? Does it hold?",
    purposeAr: "اختبار الافتراضات الخفية", purposeEn: "Test hidden assumptions",
    timing: "mid", difficulty: "hard", delivery: "verbal",
    learningValueAr: "يطوّر التفكير النقدي", learningValueEn: "Builds critical thinking",
  },
  {
    id: "q6", category: "devils_advocate",
    textAr: "ماذا لو طبّقت المؤسسة إجراءً التزاميًا صارمًا دون حوكمة — ما الخطأ المحتمل؟",
    textEn: "What if an institution applies a strict compliance step without governance — what could go wrong?",
    purposeAr: "كشف مخاطر التطبيق دون إطار", purposeEn: "Reveal risks of applying without a framework",
    timing: "mid", difficulty: "hard", delivery: "verbal",
    learningValueAr: "يبرز أهمية الحوكمة", learningValueEn: "Highlights the role of governance",
  },
  {
    id: "q7", category: "regulatory",
    textAr: "لو كنت المنظّم، ما أول سؤال ستطرحه على هذه المؤسسة؟", textEn: "If you were the regulator, what's the first question you'd ask this institution?",
    purposeAr: "تبنّي منظور الجهة التنظيمية", purposeEn: "Adopt the regulator's perspective",
    timing: "late", difficulty: "medium", delivery: "verbal",
    learningValueAr: "يوسّع الفهم التنظيمي", learningValueEn: "Broadens regulatory understanding",
  },
  {
    id: "q8", category: "customer_impact",
    textAr: "كيف يشعر العميل عندما يُرفض تحويله بسبب فحص التزامي؟ وكيف نوازن؟",
    textEn: "How does a customer feel when a transfer is held for a compliance check? How do we balance?",
    purposeAr: "ربط الالتزام بتجربة العميل", purposeEn: "Connect compliance to customer experience",
    timing: "late", difficulty: "medium", delivery: "chat",
    learningValueAr: "يعزّز التوازن بين الحماية والخدمة", learningValueEn: "Reinforces balance of protection and service",
  },
  {
    id: "q9", category: "risk",
    textAr: "رتّبوا هذه المخاطر حسب الأولوية: تبييض الأموال، الاحتيال الداخلي، خطأ بيانات العميل.",
    textEn: "Prioritize these risks: money laundering, internal fraud, customer data error.",
    purposeAr: "تدريب على تقدير المخاطر", purposeEn: "Practice risk prioritization",
    timing: "mid", difficulty: "hard", delivery: "breakout",
    learningValueAr: "يطوّر الحكم على الأولويات", learningValueEn: "Develops prioritization judgment",
  },
  {
    id: "q10", category: "closing",
    textAr: "ما التغيير الأول الذي ستطبّقه في عملك بعد هذه الجلسة؟", textEn: "What is the first change you will apply at work after this session?",
    purposeAr: "تحويل التعلّم إلى التزام", purposeEn: "Turn learning into commitment",
    timing: "closing", difficulty: "easy", delivery: "chat",
    learningValueAr: "يرسّخ الأثر العملي", learningValueEn: "Cements practical impact",
  },
];

// --- Activity library ------------------------------------------------------
const activityMeta: Record<ActivityType, { titleAr: string; titleEn: string; descAr: string; descEn: string; mins: number; forAr: string; forEn: string }> = {
  reflection_2min: { titleAr: "تأمّل دقيقتين", titleEn: "2-Minute Reflection", descAr: "توقف قصير يكتب فيه المشاركون فكرة واحدة تعلّموها.", descEn: "A short pause where participants write one thing they learned.", mins: 2, forAr: "بعد جزء نظري مكثّف", forEn: "After a dense theory section" },
  poll: { titleAr: "تصويت سريع", titleEn: "Quick Poll", descAr: "سؤال متعدد الخيارات لقياس الفهم أو الرأي.", descEn: "A multiple-choice question to gauge understanding or opinion.", mins: 3, forAr: "لإعادة تنشيط المشاركة", forEn: "To re-energize participation" },
  case_discussion: { titleAr: "مناقشة حالة", titleEn: "Case Discussion", descAr: "حالة واقعية مصغّرة يناقشها المشاركون معًا.", descEn: "A realistic mini-case the group discusses together.", mins: 10, forAr: "لربط المفاهيم بالواقع", forEn: "To connect concepts to reality" },
  breakout: { titleAr: "مجموعات عمل", titleEn: "Breakout Rooms", descAr: "تقسيم لمجموعات صغيرة لمهمة محدّدة ثم العرض.", descEn: "Split into small groups for a defined task, then present.", mins: 8, forAr: "للتطبيق الجماعي", forEn: "For collaborative application" },
  role_play: { titleAr: "لعب أدوار", titleEn: "Role Play", descAr: "محاكاة موقف (مثلاً موظف التزام وعميل).", descEn: "Simulate a situation (e.g. compliance officer and customer).", mins: 12, forAr: "لتدريب المهارات التطبيقية", forEn: "To practice applied skills" },
  scenario_analysis: { titleAr: "تحليل سيناريو", titleEn: "Scenario Analysis", descAr: "تحليل سيناريو متدرّج واتخاذ قرار.", descEn: "Analyze a branching scenario and make a decision.", mins: 12, forAr: "لتنمية الحكم", forEn: "To build judgment" },
  risk_identification: { titleAr: "تحديد المخاطر", titleEn: "Risk Identification", descAr: "فرز مخاطر من وصف موقف واقعي.", descEn: "Spot the risks in a described situation.", mins: 7, forAr: "لموضوعات المخاطر", forEn: "For risk topics" },
  compliance_judgment: { titleAr: "حكم التزامي", titleEn: "Compliance Judgment", descAr: "اتخاذ قرار التزامي وتبريره.", descEn: "Make and justify a compliance decision.", mins: 10, forAr: "لموضوعات الالتزام", forEn: "For compliance topics" },
  customer_journey: { titleAr: "تحليل رحلة العميل", titleEn: "Customer Journey Analysis", descAr: "رسم رحلة العميل وتحديد نقاط الأثر.", descEn: "Map the customer journey and mark impact points.", mins: 12, forAr: "لموضوعات تجربة العميل", forEn: "For CX topics" },
  debate: { titleAr: "مناظرة", titleEn: "Debate", descAr: "فريقان يدافعان عن موقفين متعارضين.", descEn: "Two teams argue opposing positions.", mins: 15, forAr: "لمواضيع الجدل", forEn: "For debatable topics" },
  group_prioritization: { titleAr: "ترتيب أولويات", titleEn: "Group Prioritization", descAr: "ترتيب قائمة عناصر حسب الأولوية مع تبرير.", descEn: "Rank a list of items by priority with justification.", mins: 8, forAr: "لصنع القرار", forEn: "For decision making" },
  what_would_you_do: { titleAr: "ماذا ستفعل؟", titleEn: "What Would You Do?", descAr: "موقف قصير وقرار فوري من كل مشارك.", descEn: "A short dilemma with an on-the-spot decision from each participant.", mins: 6, forAr: "لتحفيز التفكير السريع", forEn: "To spark quick thinking" },
  before_after: { titleAr: "قبل / بعد", titleEn: "Before / After", descAr: "مقارنة الحالة قبل التطبيق وبعده.", descEn: "Compare the state before and after applying the concept.", mins: 8, forAr: "لإظهار الأثر", forEn: "To show impact" },
  misconception_correction: { titleAr: "تصحيح مفاهيم", titleEn: "Misconception Correction", descAr: "عرض مفهوم خاطئ شائع وتصحيحه جماعيًا.", descEn: "Present a common misconception and correct it together.", mins: 6, forAr: "لإزالة الالتباس", forEn: "To remove confusion" },
};

export function activitiesForSector(sector: Sector): Activity[] {
  // A sensible default set, tuned slightly by sector
  const base: ActivityType[] = [
    "reflection_2min", "poll", "case_discussion", "breakout",
    "scenario_analysis", "what_would_you_do", "group_prioritization",
    "role_play", "debate", "before_after", "misconception_correction",
  ];
  const sectorExtra: Partial<Record<Sector, ActivityType[]>> = {
    compliance: ["compliance_judgment", "risk_identification"],
    risk: ["risk_identification", "scenario_analysis"],
    customer_experience: ["customer_journey"],
    banking: ["risk_identification", "customer_journey"],
    insurance: ["scenario_analysis", "customer_journey"],
  };
  const types = Array.from(new Set([...(sectorExtra[sector] || []), ...base]));
  return types.map((t) => {
    const m = activityMeta[t];
    return {
      id: `act_${t}`,
      type: t,
      titleAr: m.titleAr, titleEn: m.titleEn,
      descriptionAr: m.descAr, descriptionEn: m.descEn,
      durationMinutes: m.mins,
      bestForAr: m.forAr, bestForEn: m.forEn,
    };
  });
}

export const defaultSettings: AdminSettings = {
  defaultTone: "formal",
  defaultLanguage: "ar",
  approvedTerminology: ["الالتزام", "الحوكمة", "المخاطر التشغيلية", "حماية العميل", "العناية الواجبة"],
  restrictedWords: ["مضمون", "استثمار مربح", "نصيحة قانونية"],
  autoPost: false,
  maxInterventionsPer10Min: 3,
  minMinutesBetweenInterventions: 3,
  allowDevilsAdvocate: true,
  mustafaVisibleDefault: true,
  organizationName: "The Financial Academy",
  organizationNameAr: "الأكاديمية المالية",
  primaryColor: "#0f7a62",
};

// Sample Mustafa interventions for the demo scenario (compliance programme)
export const sampleInterventions = [
  { minute: 8, type: "clarifying_question", ar: "سؤال سريع: ماذا نعني بالضبط بـ\"العناية الواجبة\"؟", en: "Quick check: what exactly do we mean by \"due diligence\"?" },
  { minute: 22, type: "practical_example", ar: "تخيّلوا عميلاً يطلب تحويلاً كبيراً من حساب خامل — كيف تطبّقون ما ناقشناه؟", en: "Imagine a customer requesting a large transfer from a dormant account — how would you apply what we discussed?" },
  { minute: 41, type: "poll", ar: "تصويت: هل مؤشرات الاشتباه واضحة (١) نعم (٢) تحتاج مثالاً (٣) غامضة؟", en: "Poll: are the red flags clear? (1) yes (2) need an example (3) unclear" },
  { minute: 63, type: "devils_advocate", ar: "ماذا لو طبّقنا الإجراء دون حوكمة؟ ما أول خطر سيظهر؟", en: "What if we apply the step without governance? Which risk surfaces first?" },
  { minute: 88, type: "breakout", ar: "مجموعات ٥ دقائق: كل مجموعة تحدّد ٣ مؤشرات اشتباه في الحالة المعروضة.", en: "5-min breakout: each group identifies 3 red flags in the case shown." },
  { minute: 132, type: "socratic_question", ar: "ما الافتراض وراء اعتبار العميل القديم أقل خطورة؟ وهل يصمد؟", en: "What assumption makes a long-standing customer lower risk? Does it hold?" },
  { minute: 168, type: "closing_question", ar: "ما التغيير الأول الذي ستطبّقه في عملك غدًا؟", en: "What is the first change you'll apply at work tomorrow?" },
];
