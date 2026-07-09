import type { Persona, PersonaMode } from "./types";

export const personas: Record<PersonaMode, Persona> = {
  curious: {
    mode: "curious",
    name: "Mustafa the Curious Trainee",
    nameAr: "مصطفى المتدرّب الفضولي",
    tagline: "Asks practical questions from a motivated learner's view",
    taglineAr: "يطرح أسئلة عملية من منظور متعلّم متحفّز",
    description:
      "Asks practical, grounded questions as an engaged learner to model curiosity and invite others to join in.",
    descriptionAr:
      "يطرح أسئلة عملية وواقعية بصفته متعلمًا متفاعلاً ليكون نموذجًا للفضول ويشجّع الآخرين على المشاركة.",
    sampleQuestions: [
      "كيف يمكن تطبيق هذه الفكرة في بيئة مصرفية حقيقية؟",
      "ما أكثر خطأ شائع يقع فيه الموظفون الجدد هنا؟",
      "هل هناك مثال بسيط يوضّح هذه النقطة؟",
    ],
    visibility: "participants",
    icon: "🙋",
  },
  socratic: {
    mode: "socratic",
    name: "Mustafa the Socratic Questioner",
    nameAr: "مصطفى السقراطي",
    tagline: "Layered questions that deepen thinking",
    taglineAr: "أسئلة متدرّجة تعمّق التفكير",
    description:
      "Uses layered questioning — definitions, assumptions, evidence, application, and consequences — to deepen reasoning.",
    descriptionAr:
      "يستخدم الأسئلة المتدرّجة — التعريفات والافتراضات والأدلة والتطبيق والنتائج — لتعميق التفكير.",
    sampleQuestions: [
      "ماذا نعني تحديدًا بهذا المفهوم؟",
      "ما الافتراضات التي نبني عليها هذا الاستنتاج؟",
      "ما الدليل الذي يدعم هذا؟ وكيف سيطبّقه بنك حقيقي؟",
      "ماذا قد يتوقّع الجهة التنظيمية هنا؟",
    ],
    visibility: "participants",
    icon: "🧭",
  },
  devils_advocate: {
    mode: "devils_advocate",
    name: "Mustafa the Devil's Advocate",
    nameAr: "مصطفى محامي الشيطان",
    tagline: "Respectfully challenges assumptions",
    taglineAr: "يتحدّى الافتراضات باحترام",
    description:
      "Respectfully challenges the group to surface risks, blind spots, and failure modes before they become real problems.",
    descriptionAr:
      "يتحدّى المجموعة باحترام لإبراز المخاطر ونقاط العمى وأوجه الفشل المحتملة قبل أن تتحوّل إلى مشكلات فعلية.",
    sampleQuestions: [
      "هل هناك طريقة أخرى للنظر إلى هذا الأمر؟",
      "ماذا لو كان هذا الافتراض خاطئًا؟",
      "هل يمكن أن يخلق هذا مخاطر تشغيلية؟",
      "ماذا يحدث لو طبّقت المؤسسة ذلك دون حوكمة؟",
    ],
    visibility: "both",
    icon: "⚖️",
  },
  engagement_coach: {
    mode: "engagement_coach",
    name: "Mustafa the Engagement Coach",
    nameAr: "مصطفى مدرّب التفاعل",
    tagline: "Private nudges that support the trainer",
    taglineAr: "تنبيهات خاصة تدعم المدرّب",
    description:
      "Privately co-pilots the trainer — suggesting when to ask, poll, pause, group, or summarize to keep energy high.",
    descriptionAr:
      "يرافق المدرّب بشكل خاص — يقترح متى يسأل، أو يصوّت، أو يتوقّف، أو يقسّم المجموعات، أو يلخّص للحفاظ على الطاقة.",
    sampleQuestions: [
      "استمرت الجلسة كمحاضرة لمدة 12 دقيقة — فكّر في طرح سؤال تأملي.",
      "هذا الموضوع مناسب لتصويت سريع.",
      "قد يستفيد المشاركون من مثال واقعي الآن.",
      "فكّر في تقسيم المشاركين إلى مجموعات لخمس دقائق.",
    ],
    visibility: "trainer_private",
    icon: "🎧",
  },
  practitioner: {
    mode: "practitioner",
    name: "Mustafa the Financial Sector Practitioner",
    nameAr: "مصطفى الممارس في القطاع المالي",
    tagline: "Connects learning to real sector examples",
    taglineAr: "يربط التعلّم بأمثلة واقعية من القطاع",
    description:
      "Connects learning points to concrete banking, insurance, capital market, fintech, compliance, and risk examples.",
    descriptionAr:
      "يربط نقاط التعلّم بأمثلة واقعية من المصرفية والتأمين وسوق المال والتقنية المالية والالتزام والمخاطر.",
    sampleQuestions: [
      "في مصرف حقيقي، كيف يظهر هذا المبدأ في إجراءات فتح الحساب؟",
      "كيف تتعامل شركة تأمين مع هذا الموقف عمليًا؟",
      "ما أثر ذلك على تجربة العميل عند نقطة الخدمة؟",
    ],
    visibility: "participants",
    icon: "🏦",
  },
  quiet_activator: {
    mode: "quiet_activator",
    name: "Mustafa the Quiet Participant Activator",
    nameAr: "مصطفى مُنشّط المشاركين الصامتين",
    tagline: "Widens participation without pressure",
    taglineAr: "يوسّع المشاركة دون إحراج",
    description:
      "Encourages broader participation with open, low-pressure invitations — never singling out or embarrassing anyone.",
    descriptionAr:
      "يشجّع مشاركة أوسع عبر دعوات مفتوحة ومنخفضة الضغط — دون استهداف أي شخص أو إحراجه.",
    sampleQuestions: [
      "هل يمكن أن نسمع مثالًا من أحد الزملاء حول هذه النقطة؟",
      "من لديه تجربة مختلفة يودّ مشاركتها في الدردشة؟",
      "اكتبوا في الدردشة كلمة واحدة تصف رأيكم في هذه الفكرة.",
    ],
    visibility: "participants",
    icon: "🌱",
  },
};

export const personaList = Object.values(personas);
