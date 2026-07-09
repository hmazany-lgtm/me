import type { Programme, ContentAnalysis, Locale } from "./types";
import { label } from "./i18n";

// Deterministic content analysis generator. Given a programme (and optionally
// pasted text), produces a structured analysis used by the Upload & Analysis
// pages. Mirrors what a hosted model would return.
export function generateAnalysis(p: Programme, locale: Locale, pasted?: string): ContentAnalysis {
  const sector = label(p.sector, locale);
  const ar = locale === "ar";

  const summary = ar
    ? `برنامج «${p.nameAr}» موجّه إلى ${p.targetAudience} في قطاع ${sector} بمستوى ${label(p.level, "ar")}. يمتد على ${p.durationMinutes} دقيقة ويركّز على ${p.objectives.length} أهداف رئيسية، أبرزها ${p.objectives[0] || "بناء الوعي المهني"}. الأسلوب المفضّل: ${label(p.engagementStyle, "ar")}.`
    : `"${p.name}" targets ${p.targetAudience} in the ${sector} sector at ${label(p.level, "en")} level. It runs for ${p.durationMinutes} minutes across ${p.objectives.length} core objectives, chiefly "${p.objectives[0] || "building professional awareness"}". Preferred style: ${label(p.engagementStyle, "en")}.`;

  const themes = p.agenda.length
    ? p.agenda.map((a) => a.title)
    : p.objectives.slice(0, 4);

  const expectedChallenges = ar
    ? [
        "ميل المشاركين للاستماع السلبي دون مشاركة.",
        "صعوبة ربط المفاهيم النظرية بالممارسة اليومية.",
        "تفاوت مستوى الخبرة بين المشاركين.",
        `حساسية بعض المواضيع${p.sensitiveTopics ? ` (${p.sensitiveTopics})` : ""}.`,
      ]
    : [
        "Tendency toward passive listening without participation.",
        "Difficulty connecting theory to daily practice.",
        "Uneven experience levels across participants.",
        `Sensitivity of some topics${p.sensitiveTopics ? ` (${p.sensitiveTopics})` : ""}.`,
      ];

  const engagementMoments = p.agenda.map((a, i) =>
    ar
      ? `عند «${a.title}» (~الدقيقة ${p.agenda.slice(0, i).reduce((s, x) => s + x.minutes, 5)}): لحظة مناسبة لسؤال تطبيقي أو تصويت.`
      : `At "${a.title}" (~min ${p.agenda.slice(0, i).reduce((s, x) => s + x.minutes, 5)}): a good moment for an applied question or poll.`,
  );

  const suggestedQuestions = ar
    ? [
        `كيف يظهر «${themes[0] || p.objectives[0]}» في عملكم اليومي؟`,
        "ما أكبر تحدٍّ تتوقعونه عند التطبيق؟",
        "لو كنتم مسؤولي التزام، ما أول سؤال ستطرحونه هنا؟",
      ]
    : [
        `How does "${themes[0] || p.objectives[0]}" show up in your daily work?`,
        "What's the biggest challenge you expect in applying this?",
        "If you were a compliance officer, what would you ask first?",
      ];

  const suggestedActivities = ar
    ? ["تصويت سريع لقياس الفهم", "مجموعات عمل لتحليل حالة", "تأمّل دقيقتين قبل الانتقال", "مناظرة قصيرة حول قرار"]
    : ["Quick poll to gauge understanding", "Breakout groups to analyze a case", "2-minute reflection before transitioning", "Short debate on a decision"];

  return {
    summary: pasted ? `${summary} ${ar ? "(تم دمج المحتوى المرفوع.)" : "(Uploaded content incorporated.)"}` : summary,
    themes,
    expectedChallenges,
    engagementMoments,
    suggestedQuestions,
    suggestedActivities,
  };
}
