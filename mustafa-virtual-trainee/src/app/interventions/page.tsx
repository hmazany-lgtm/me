
import { useMemo } from "react";
import { useLang } from "@/components/providers";
import { PageHeader, Badge } from "@/components/ui";
import { usePrograms, ProgrammePicker } from "@/components/programme-picker";
import { SuggestionCard } from "@/components/suggestion-card";
import { runEngine } from "@/lib/ai/engine";
import { store } from "@/lib/store";
import { label } from "@/lib/i18n";
import type { InterventionType, PersonaMode } from "@/lib/types";

const taxonomy: InterventionType[] = [
  "clarifying_question", "deepening_question", "practical_example", "devils_advocate", "socratic_question",
  "poll", "breakout", "reflection", "case_study", "summary", "energy_booster", "task_distribution",
  "trainer_reminder", "closing_question",
];

export default function InterventionsPage() {
  const { t, locale } = useLang();
  const { programmes, selectedId, setSelectedId, selected } = usePrograms();

  // Generate a spread of suggestions across personas & session points
  const suggestions = useMemo(() => {
    if (!selected) return [];
    const points: { persona: PersonaMode; min: number; eng: "low" | "medium" | "high" }[] = [
      { persona: "curious", min: 12, eng: "medium" },
      { persona: "practitioner", min: 35, eng: "medium" },
      { persona: "quiet_activator", min: 55, eng: "low" },
      { persona: "devils_advocate", min: 78, eng: "high" },
      { persona: "socratic", min: 110, eng: "medium" },
      { persona: "engagement_coach", min: 150, eng: "low" },
    ];
    return points.flatMap((pt) =>
      runEngine({
        programme: selected, engagementLevel: pt.eng, minutesElapsed: pt.min,
        minutesSinceLastInteraction: pt.eng === "low" ? 8 : 3, persona: pt.persona, tone: "formal", locale,
        currentAgendaSection: selected.agenda[Math.min(selected.agenda.length - 1, Math.floor(pt.min / 45))]?.title,
      }).suggestions.slice(0, 2),
    );
  }, [selected, locale]);

  return (
    <div>
      <PageHeader title={t("navInterventions")} subtitle={locale === "ar" ? "تصنيف التدخلات ومقترحات جاهزة للجلسة" : "Intervention taxonomy and ready session suggestions"} />

      {/* Taxonomy */}
      <div className="card card-pad mb-6">
        <h3 className="section-title mb-3">{locale === "ar" ? "أنواع التدخلات" : "Intervention types"}</h3>
        <div className="flex flex-wrap gap-2">
          {taxonomy.map((ty) => <Badge key={ty} color="brand">{label(ty, locale)}</Badge>)}
        </div>
      </div>

      {programmes.length > 0 && (
        <div className="card card-pad mb-6 max-w-md"><ProgrammePicker programmes={programmes} value={selectedId} onChange={setSelectedId} /></div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {suggestions.map((s) => (
          <SuggestionCard key={s.id} s={s} onDecision={(id, st) => store.setDecision(id, st)} />
        ))}
      </div>
    </div>
  );
}
