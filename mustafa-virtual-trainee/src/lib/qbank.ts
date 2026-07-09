import type { Programme, BankQuestion, QuestionCategory, Locale } from "./types";
import { sampleQuestions, sampleProgramme } from "./data";
import { label } from "./i18n";

// Generate a dynamic question bank for any programme. For the seeded sample
// programme we return the hand-authored bank; for others we derive questions
// from the objectives, sector, and agenda.
export function generateQuestionBank(p: Programme): BankQuestion[] {
  if (p.id === sampleProgramme.id) return sampleQuestions;

  const topic = (l: Locale) => p.objectives[0] || (l === "ar" ? "الموضوع" : "the topic");
  const sec = (l: Locale) => label(p.sector, l);

  const mk = (
    id: string, category: QuestionCategory,
    ar: string, en: string, purposeAr: string, purposeEn: string,
    timing: BankQuestion["timing"], difficulty: BankQuestion["difficulty"], delivery: BankQuestion["delivery"],
    lvAr: string, lvEn: string,
  ): BankQuestion => ({ id, category, textAr: ar, textEn: en, purposeAr, purposeEn, timing, difficulty, delivery, learningValueAr: lvAr, learningValueEn: lvEn });

  return [
    mk("g1", "opening", `قبل أن نبدأ: ماذا يعني لكم «${topic("ar")}» عمليًا؟`, `Before we begin: what does "${topic("en")}" mean to you in practice?`, "كشف التصورات المسبقة", "Surface prior assumptions", "opening", "easy", "chat", "يهيّئ المشاركين", "Primes participants"),
    mk("g2", "icebreaker", "بكلمة واحدة في الدردشة: ما أول ما يخطر ببالكم عن هذا الموضوع؟", "In one word in the chat: what first comes to mind about this topic?", "كسر الجليد", "Break the ice", "opening", "easy", "poll", "يشرك الجميع دون ضغط", "Engages everyone with low pressure"),
    mk("g3", "concept_check", `ما الفرق العملي بين المفهومين الأساسيين في «${topic("ar")}»؟`, `What's the practical difference between the two core concepts in "${topic("en")}"?`, "التأكد من وضوح المفاهيم", "Confirm concept clarity", "early", "medium", "verbal", "يمنع الخلط لاحقًا", "Prevents later confusion"),
    mk("g4", "applied", `كيف ستطبّقون هذا في بيئة ${sec("ar")} حقيقية؟`, `How would you apply this in a real ${sec("en")} setting?`, "التطبيق الواقعي", "Real application", "mid", "medium", "breakout", "يربط النظرية بالإجراء", "Bridges theory and action"),
    mk("g5", "socratic", "ما الافتراضات التي نبني عليها؟ وما الدليل؟", "What assumptions are we making? And what's the evidence?", "اختبار الافتراضات", "Test assumptions", "mid", "hard", "verbal", "يطوّر التفكير النقدي", "Builds critical thinking"),
    mk("g6", "devils_advocate", "ماذا لو كان هذا النهج خاطئًا؟ ما أول ما سينكشف؟", "What if this approach is wrong? What surfaces first?", "كشف المخاطر", "Surface risks", "mid", "hard", "verbal", "يبرز نقاط العمى", "Reveals blind spots"),
    mk("g7", "regulatory", "لو كنتم الجهة التنظيمية، ما أول سؤال ستطرحونه؟", "If you were the regulator, what would you ask first?", "منظور المنظّم", "Regulator perspective", "late", "medium", "verbal", "يوسّع الفهم التنظيمي", "Broadens regulatory view"),
    mk("g8", "customer_impact", "كيف يؤثر هذا على تجربة العميل النهائية؟", "How does this affect the end customer's experience?", "ربط بتجربة العميل", "Connect to CX", "late", "medium", "chat", "يعزّز التوازن", "Reinforces balance"),
    mk("g9", "risk", "ما أكبر ثلاث مخاطر هنا، ورتّبوها بالأولوية؟", "What are the top three risks here — prioritize them?", "تقدير المخاطر", "Risk prioritization", "mid", "hard", "breakout", "يطوّر الحكم", "Develops judgment"),
    mk("g10", "closing", "ما التغيير الأول الذي ستطبّقونه بعد الجلسة؟", "What's the first change you'll apply after this session?", "تحويل التعلّم لالتزام", "Turn learning into commitment", "closing", "easy", "chat", "يرسّخ الأثر", "Cements impact"),
  ];
}
