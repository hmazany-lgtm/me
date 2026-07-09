import type { Programme, EngagementReport, InterventionType } from "./types";
import { sampleInterventions } from "./data";

// Build a Mustafa Engagement Report for a programme. Deterministic so the demo
// is reproducible; in production these numbers come from recorded session data.
export function generateReport(p: Programme): EngagementReport {
  const timeline = sampleInterventions.map((i) => ({
    minute: i.minute,
    type: i.type as InterventionType,
    labelAr: i.ar,
    labelEn: i.en,
  }));

  const score = 74;
  return {
    id: `rep_${p.id}`,
    programmeId: p.id,
    generatedAt: new Date().toISOString(),
    participationLevel: "high",
    engagementScore: score,
    interactions: 42,
    questionsGenerated: 24,
    questionsUsed: 15,
    activitiesSuggested: 8,
    activitiesUsed: 4,
    timeline,
    bestMoments: [
      "Strong debate on governance vs. speed of execution.",
      "A participant shared a real dormant-account red flag.",
      "The breakout groups surfaced 3 unexpected risks.",
    ],
    bestMomentsAr: [
      "نقاش قوي حول الموازنة بين الحوكمة وسرعة التنفيذ.",
      "أحد المشاركين شارك مؤشر اشتباه واقعيًا لحساب خامل.",
      "أبرزت مجموعات العمل ثلاث مخاطر غير متوقعة.",
    ],
    missedOpportunities: [
      "No poll was used in the first 40 minutes.",
      "Two quiet participants were never activated.",
      "The regulatory perspective could have been deepened.",
    ],
    missedOpportunitiesAr: [
      "لم يُستخدم أي تصويت في أول 40 دقيقة.",
      "لم يتم تفعيل مشاركَيْن صامتَيْن.",
      "كان يمكن تعميق المنظور التنظيمي أكثر.",
    ],
    trainerRecommendations: [
      "Introduce an interactive check within the first 15 minutes.",
      "Use a poll before dense theory sections.",
      "Close each section with a one-line summary from a participant.",
    ],
    trainerRecommendationsAr: [
      "أدخل تفاعلًا خلال أول 15 دقيقة.",
      "استخدم تصويتًا قبل الأجزاء النظرية المكثفة.",
      "اختم كل جزء بتلخيص من أحد المشاركين.",
    ],
    followUpMessageAr:
      `شكرًا لمشاركتكم الفاعلة في «${p.nameAr}». نرفق ملخص أبرز النقاط، وندعوكم لتطبيق فكرة واحدة تعلّمتموها هذا الأسبوع ومشاركتنا الأثر.`,
    followUpMessageEn:
      `Thank you for your active participation in "${p.name}". Attached is a summary of the key points — we invite you to apply one idea you learned this week and share the impact with us.`,
    reflectiveAssignmentAr:
      "اكتب في صفحة واحدة: موقف واقعي واجهته يرتبط بموضوع الجلسة، وكيف ستتعامل معه الآن بشكل مختلف.",
    reflectiveAssignmentEn:
      "In one page: describe a real situation you faced related to the session topic, and how you would now handle it differently.",
  };
}
