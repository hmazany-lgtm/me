
import { useLang } from "@/components/providers";
import { PageHeader } from "@/components/ui";
import { MUSTAFA_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export default function HelpPage() {
  const { t, locale } = useLang();

  const principles = locale === "ar"
    ? [
        { icon: "🪪", title: "الشفافية", body: "لا ينتحل مصطفى شخصية إنسان حقيقي. وعند ظهوره للمشاركين يُعرَّف بوضوح كمساعد افتراضي." },
        { icon: "🔒", title: "أقل البيانات", body: "لا يجمع مصطفى بيانات شخصية غير ضرورية، ويركّز على تفاعل الجلسة لا على المراقبة." },
        { icon: "🤝", title: "الاحترام", body: "لا يُحرج المشاركين الصامتين ولا يستهدف أحدًا. الدعوات للمشاركة مفتوحة ومنخفضة الضغط." },
        { icon: "⚖️", title: "لا تقييم جائر", body: "لا يقيّم مصطفى الأفراد بشكل ضار أو غير عادل." },
        { icon: "📋", title: "المراجعة البشرية", body: "كل محتوى يولّده مصطفى قابل لمراجعة المدرّب واعتماده أو تعديله أو رفضه." },
        { icon: "🚫", title: "ليس مرجعًا نهائيًا", body: "لا يقدّم مصطفى استشارات تنظيمية أو قانونية أو مالية كسلطة نهائية — بل كمحفّزات للنقاش." },
      ]
    : [
        { icon: "🪪", title: "Transparency", body: "Mustafa does not impersonate a real human. When visible to participants he is clearly presented as a virtual assistant." },
        { icon: "🔒", title: "Data minimization", body: "Mustafa collects no unnecessary personal data and focuses on session engagement, not surveillance." },
        { icon: "🤝", title: "Respect", body: "He never embarrasses quiet participants or singles anyone out. Invitations are open and low-pressure." },
        { icon: "⚖️", title: "No unfair evaluation", body: "Mustafa never evaluates individuals in a harmful or unfair way." },
        { icon: "📋", title: "Human review", body: "All AI-generated content is reviewable by the trainer to approve, edit, or reject." },
        { icon: "🚫", title: "Not a final authority", body: "Mustafa never gives regulatory, legal, or financial advice as final authority — only discussion prompts." },
      ];

  return (
    <div>
      <PageHeader title={t("helpTitle")} subtitle={t("helpSubtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {principles.map((p) => (
          <div key={p.title} className="card card-pad">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">{p.icon}</div>
            <h3 className="font-bold text-ink">{p.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="card card-pad mt-6">
        <h3 className="section-title mb-2">{locale === "ar" ? "منطق توجيه مصطفى (System Prompt)" : "Mustafa's system prompt"}</h3>
        <p className="mb-3 text-sm text-ink-soft">{locale === "ar" ? "هذا هو التوجيه الأساسي الذي يحكم سلوك مصطفى:" : "This is the core instruction governing Mustafa's behavior:"}</p>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-ink p-4 text-xs leading-relaxed text-brand-50">{MUSTAFA_SYSTEM_PROMPT}</pre>
      </div>
    </div>
  );
}
