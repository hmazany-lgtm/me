
import { useMemo } from "react";
import { useLang } from "@/components/providers";
import { PageHeader, Badge } from "@/components/ui";
import { usePrograms, ProgrammePicker } from "@/components/programme-picker";
import { activitiesForSector } from "@/lib/data";

export default function ActivitiesPage() {
  const { t, locale } = useLang();
  const { programmes, selectedId, setSelectedId, selected } = usePrograms();

  const activities = useMemo(() => (selected ? activitiesForSector(selected.sector) : []), [selected]);

  const icons: Record<string, string> = {
    reflection_2min: "💭", poll: "📊", case_discussion: "🗂️", breakout: "👥", role_play: "🎭",
    scenario_analysis: "🧭", risk_identification: "⚠️", compliance_judgment: "⚖️", customer_journey: "🧑‍💼",
    debate: "🗣️", group_prioritization: "🔢", what_would_you_do: "🤔", before_after: "🔄", misconception_correction: "🧠",
  };

  return (
    <div>
      <PageHeader title={t("navActivities")} subtitle={t("actSubtitle")} />

      {programmes.length > 0 && (
        <div className="card card-pad mb-6 max-w-md"><ProgrammePicker programmes={programmes} value={selectedId} onChange={setSelectedId} /></div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((a) => (
          <div key={a.id} className="card card-pad transition hover:shadow-glow">
            <div className="flex items-start justify-between">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">{icons[a.type] || "◆"}</span>
              <Badge color="gold">{a.durationMinutes} {t("minutes")}</Badge>
            </div>
            <h3 className="mt-3 font-bold text-ink">{locale === "ar" ? a.titleAr : a.titleEn}</h3>
            <p className="mt-1 text-sm text-ink-soft">{locale === "ar" ? a.descriptionAr : a.descriptionEn}</p>
            <p className="mt-3 rounded-lg bg-brand-50/60 px-3 py-2 text-xs text-brand-700">
              <span className="font-semibold">{locale === "ar" ? "الأنسب" : "Best for"}: </span>
              {locale === "ar" ? a.bestForAr : a.bestForEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
