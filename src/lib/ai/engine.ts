import type {
  EngineInput,
  EngineResult,
  InterventionType,
  Suggestion,
  DeliveryMethod,
  Sector,
} from "../types";

// ---------------------------------------------------------------------------
// Deterministic engagement engine. Runs fully offline and produces realistic,
// topic-aware interventions. The AI provider (provider.ts) uses this as its
// default/back-end so the product works without any external API key.
// ---------------------------------------------------------------------------

let counter = 0;
function id(prefix = "sg"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

const sectorExample: Record<Sector, { ar: string; en: string }> = {
  banking: { ar: "في فرع مصرفي عند فتح حساب لعميل جديد", en: "at a bank branch when opening an account for a new customer" },
  insurance: { ar: "في شركة تأمين عند تقييم مطالبة", en: "at an insurer when assessing a claim" },
  capital_market: { ar: "في وسيط أوراق مالية عند تنفيذ أمر عميل", en: "at a brokerage when executing a client order" },
  fintech: { ar: "في تطبيق مدفوعات رقمي عند التحقق من الهوية", en: "in a digital payments app during identity verification" },
  leadership: { ar: "عند قيادة فريق خلال تغيير تنظيمي", en: "when leading a team through organizational change" },
  compliance: { ar: "في إدارة الالتزام عند مراجعة عملية مشبوهة", en: "in a compliance unit reviewing a suspicious transaction" },
  risk: { ar: "في إدارة المخاطر عند تقييم منتج جديد", en: "in a risk unit assessing a new product" },
  sales: { ar: "مع مستشار مبيعات عند عرض منتج ائتماني", en: "with a sales advisor pitching a credit product" },
  operations: { ar: "في إدارة العمليات عند معالجة دفعة كبيرة", en: "in operations processing a large batch" },
  customer_experience: { ar: "عند نقطة خدمة العميل بعد شكوى", en: "at a customer service touchpoint after a complaint" },
};

const deliveryOf: Record<InterventionType, DeliveryMethod> = {
  clarifying_question: "verbal",
  deepening_question: "verbal",
  practical_example: "chat",
  devils_advocate: "verbal",
  socratic_question: "verbal",
  poll: "poll",
  breakout: "breakout",
  reflection: "chat",
  case_study: "chat",
  summary: "verbal",
  energy_booster: "chat",
  task_distribution: "breakout",
  trainer_reminder: "verbal",
  closing_question: "verbal",
};

type Template = {
  type: InterventionType;
  ar: (i: EngineInput) => string;
  en: (i: EngineInput) => string;
  purposeAr: string;
  purposeEn: string;
  audience?: "participants" | "trainer_private";
};

const firstObjective = (i: EngineInput) =>
  i.programme.objectives[0] || (i.locale === "ar" ? "الموضوع الحالي" : "the current topic");

const templates: Template[] = [
  {
    type: "clarifying_question",
    ar: (i) => `سؤال سريع للتأكد من الفهم: ماذا نعني تحديدًا بـ"${i.currentAgendaSection || firstObjective(i)}"؟`,
    en: (i) => `Quick check for understanding: what exactly do we mean by "${i.currentAgendaSection || firstObjective(i)}"?`,
    purposeAr: "التأكد من فهم مشترك قبل التعمّق",
    purposeEn: "Ensure shared understanding before going deeper",
  },
  {
    type: "deepening_question",
    ar: () => "ما الذي قد يتغيّر في هذا الاستنتاج لو تعاملنا مع مؤسسة كبيرة بدلًا من صغيرة؟",
    en: () => "What would change in this conclusion if we applied it to a large institution rather than a small one?",
    purposeAr: "تعميق التفكير عبر تغيير السياق",
    purposeEn: "Deepen thinking by shifting context",
  },
  {
    type: "practical_example",
    ar: (i) => `مثال عملي: تخيّلوا الموقف ${sectorExample[i.programme.sector].ar} — كيف ينطبق ما ناقشناه للتو؟`,
    en: (i) => `Practical example: imagine the situation ${sectorExample[i.programme.sector].en} — how does what we just discussed apply?`,
    purposeAr: "ربط المفهوم بالواقع العملي للقطاع",
    purposeEn: "Anchor the concept in the sector's real practice",
  },
  {
    type: "devils_advocate",
    ar: () => "لننظر للموضوع من زاوية أخرى: ماذا لو لم تنجح هذه الفرضية؟ ما أول ما سينكشف من مخاطر؟",
    en: () => "Let's look from another angle: what if this assumption fails? Which risk surfaces first?",
    purposeAr: "كشف المخاطر ونقاط العمى باحترام",
    purposeEn: "Surface risks and blind spots respectfully",
  },
  {
    type: "socratic_question",
    ar: () => "ما الافتراضات التي نبني عليها؟ وما الدليل الذي يدعمها؟ وماذا قد يتوقّع المنظّم هنا؟",
    en: () => "What assumptions are we making? What evidence supports them? And what would a regulator expect here?",
    purposeAr: "أسئلة متدرّجة تعمّق الاستدلال",
    purposeEn: "Layered questions that deepen reasoning",
  },
  {
    type: "poll",
    ar: () => "تصويت سريع: هل تشعرون أن هذا الإجراء (١) واضح تمامًا (٢) يحتاج مثالًا (٣) ما زال غامضًا؟",
    en: () => "Quick poll: is this procedure (1) fully clear (2) needs an example (3) still unclear?",
    purposeAr: "قياس الفهم وإعادة تنشيط المشاركة",
    purposeEn: "Gauge understanding and re-energize participation",
  },
  {
    type: "breakout",
    ar: () => "اقتراح: مجموعات من ٣-٤ لمدة ٥ دقائق لمناقشة كيف يطبّقون هذا في جهاتهم، ثم مشاركة نقطة واحدة.",
    en: () => "Suggestion: breakout groups of 3-4 for 5 minutes to discuss how they'd apply this at their institution, then share one point.",
    purposeAr: "تفعيل المشاركة الجماعية والتطبيق",
    purposeEn: "Activate group participation and application",
  },
  {
    type: "reflection",
    ar: () => "لحظة تأمّل: اكتبوا في الدردشة موقفًا واحدًا واجهتموه ويرتبط بهذه النقطة.",
    en: () => "Reflection moment: write in the chat one situation you've faced that relates to this point.",
    purposeAr: "تحويل المفهوم إلى تجربة شخصية",
    purposeEn: "Turn the concept into personal experience",
  },
  {
    type: "case_study",
    ar: (i) => `دراسة حالة مصغّرة: مؤسسة طبّقت هذا الإجراء دون حوكمة كافية ${sectorExample[i.programme.sector].ar}. ما الذي كان يجب فعله؟`,
    en: (i) => `Mini case: an institution applied this without adequate governance ${sectorExample[i.programme.sector].en}. What should have been done?`,
    purposeAr: "تدريب على الحكم في سياق واقعي",
    purposeEn: "Practice judgment in a realistic context",
  },
  {
    type: "summary",
    ar: () => "قبل الانتقال: لنلخّص أهم ثلاث نقاط ذكرناها في هذا الجزء — من يبدأ؟",
    en: () => "Before we move on: let's summarize the three key points from this section — who starts?",
    purposeAr: "ترسيخ التعلّم قبل الانتقال",
    purposeEn: "Consolidate learning before transitioning",
  },
  {
    type: "energy_booster",
    ar: () => "منشّط سريع: بكلمة واحدة في الدردشة — ما أكثر ما فاجأكم حتى الآن؟",
    en: () => "Quick energizer: in one word in the chat — what surprised you most so far?",
    purposeAr: "رفع مستوى الطاقة بعد فترة محاضرة",
    purposeEn: "Lift energy after a lecture-heavy stretch",
  },
  {
    type: "task_distribution",
    ar: () => "توزيع مهام: كل مجموعة تأخذ محورًا (المخاطر، الالتزام، تجربة العميل) وتعرض في دقيقتين.",
    en: () => "Task split: each group takes a lens (risk, compliance, customer experience) and presents in 2 minutes.",
    purposeAr: "توزيع الأدوار لتغطية أوسع",
    purposeEn: "Distribute roles for broader coverage",
  },
  {
    type: "trainer_reminder",
    ar: (i) => `تذكير خاص: استمر الجزء كمحاضرة منذ ${Math.max(1, i.minutesSinceLastInteraction)} دقيقة — لحظة مناسبة لسؤال تفاعلي.`,
    en: (i) => `Private reminder: this has been lecture-heavy for ${Math.max(1, i.minutesSinceLastInteraction)} min — a good moment for an interactive question.`,
    purposeAr: "الحفاظ على إيقاع تفاعلي",
    purposeEn: "Keep an interactive rhythm",
    audience: "trainer_private",
  },
  {
    type: "closing_question",
    ar: () => "سؤال ختامي: ما التغيير الأول الذي ستطبّقونه في عملكم بعد هذه الجلسة؟",
    en: () => "Closing question: what is the first change you'll apply at work after this session?",
    purposeAr: "تحويل التعلّم إلى التزام عملي",
    purposeEn: "Turn learning into a concrete commitment",
  },
];

// Which intervention types each persona prefers (ranked)
const personaPreference: Record<string, InterventionType[]> = {
  curious: ["clarifying_question", "practical_example", "reflection", "deepening_question"],
  socratic: ["socratic_question", "deepening_question", "clarifying_question", "summary"],
  devils_advocate: ["devils_advocate", "case_study", "socratic_question", "trainer_reminder"],
  engagement_coach: ["trainer_reminder", "poll", "breakout", "summary"],
  practitioner: ["practical_example", "case_study", "task_distribution", "deepening_question"],
  quiet_activator: ["reflection", "poll", "energy_booster", "practical_example"],
};

export function runEngine(input: EngineInput): EngineResult {
  const { engagementLevel, minutesElapsed, minutesSinceLastInteraction, persona } = input;

  // --- Engagement score model ---------------------------------------------
  let score = engagementLevel === "high" ? 82 : engagementLevel === "medium" ? 60 : 34;
  score -= Math.min(20, Math.max(0, minutesSinceLastInteraction - 4) * 2); // decay when quiet
  if (minutesElapsed > 90) score -= 6; // fatigue late in long sessions
  score = Math.max(8, Math.min(98, Math.round(score)));

  const energyLevel: EngineResult["energyLevel"] =
    score >= 70 ? "high" : score >= 45 ? "medium" : "low";

  // --- Choose intervention types ------------------------------------------
  const preferred = [...(personaPreference[persona] || [])];
  const picks = new Set<InterventionType>(preferred.slice(0, 2));

  // Context-driven additions
  if (minutesSinceLastInteraction >= 6) picks.add("trainer_reminder");
  if (engagementLevel === "low") {
    picks.add("poll");
    picks.add("energy_booster");
  }
  if (minutesElapsed >= (input.programme.durationMinutes || 180) - 20) picks.add("closing_question");
  if (engagementLevel === "high") picks.add("deepening_question");

  // Respect devil's advocate availability implicitly via persona choice.
  const chosenTypes = Array.from(picks).slice(0, 5);

  const suggestions: Suggestion[] = chosenTypes.map((type) => {
    const tpl = templates.find((t) => t.type === type)!;
    const confidence =
      0.6 +
      (preferred.includes(type) ? 0.2 : 0) +
      (engagementLevel === "low" && (type === "poll" || type === "energy_booster") ? 0.15 : 0);
    return {
      id: id(),
      type,
      persona,
      textAr: tpl.ar(input),
      textEn: tpl.en(input),
      purposeAr: tpl.purposeAr,
      purposeEn: tpl.purposeEn,
      delivery: deliveryOf[type],
      audience: tpl.audience || (persona === "engagement_coach" ? "trainer_private" : "participants"),
      confidence: Math.min(0.98, Number(confidence.toFixed(2))),
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  });

  const headlineAr =
    energyLevel === "low"
      ? "التفاعل منخفض — حان وقت تدخّل تنشيطي"
      : energyLevel === "medium"
      ? "التفاعل مستقر — فرصة لتعميق النقاش"
      : "التفاعل مرتفع — حافظ على الزخم";
  const headlineEn =
    energyLevel === "low"
      ? "Engagement is low — time for an activating intervention"
      : energyLevel === "medium"
      ? "Engagement is steady — an opportunity to deepen the discussion"
      : "Engagement is high — sustain the momentum";

  const rec = suggestions[0];
  return {
    suggestions,
    engagementScore: score,
    energyLevel,
    headlineAr,
    headlineEn,
    recommendedActionAr: rec ? rec.textAr : "تابع كما أنت مع مراقبة التفاعل.",
    recommendedActionEn: rec ? rec.textEn : "Continue while monitoring engagement.",
  };
}
