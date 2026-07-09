"use client";

import { useMemo } from "react";
import { useAuth, useLang } from "@/components/providers";
import { PageHeader, ScoreRing, StatCard, Badge } from "@/components/ui";
import { Logo } from "@/components/logo";
import { usePrograms, ProgrammePicker } from "@/components/programme-picker";
import { generateReport } from "@/lib/report";
import { label } from "@/lib/i18n";

export default function ReportsPage() {
  const { t, locale } = useLang();
  const { can } = useAuth();
  const { programmes, selectedId, setSelectedId, selected } = usePrograms();

  const report = useMemo(() => (selected ? generateReport(selected) : null), [selected]);

  const List = ({ title, items, icon, color = "brand" }: { title: string; items: string[]; icon: string; color?: "brand" | "gold" | "amber" }) => (
    <div className="card card-pad print-full">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">{icon} {title}</h3>
      <ul className="space-y-2">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink"><span className={color === "gold" ? "text-gold-500" : color === "amber" ? "text-amber-500" : "text-brand-500"}>◆</span>{x}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      <div className="no-print">
        <PageHeader
          title={t("reportTitle")} subtitle={t("reportSubtitle")}
          actions={can("export_reports") && (
            <button className="btn-primary text-sm" onClick={() => window.print()}>⇩ {t("exportPdf")} / {t("print")}</button>
          )}
        />
        {programmes.length > 0 && (
          <div className="card card-pad mb-6 max-w-md"><ProgrammePicker programmes={programmes} value={selectedId} onChange={setSelectedId} /></div>
        )}
      </div>

      {report && selected && (
        <div className="space-y-6" id="report">
          {/* Branded header */}
          <div className="card card-pad print-full flex items-center justify-between border-b-4 border-gold-400">
            <Logo />
            <div className="text-end">
              <p className="text-lg font-extrabold text-ink">{t("reportTitle")}</p>
              <p className="text-xs text-ink-soft">{locale === "ar" ? selected.nameAr : selected.name} · {selected.code}</p>
            </div>
          </div>

          {/* Summary band */}
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="card card-pad print-full flex items-center justify-center">
              <ScoreRing value={report.engagementScore} label={t("engagementHealth")} />
            </div>
            <StatCard label={t("interactions")} value={report.interactions} />
            <StatCard label={locale === "ar" ? "أسئلة (مولّدة/مستخدمة)" : "Questions (gen/used)"} value={`${report.questionsUsed}/${report.questionsGenerated}`} accent="gold" />
            <StatCard label={locale === "ar" ? "أنشطة (مقترحة/مستخدمة)" : "Activities (sug/used)"} value={`${report.activitiesUsed}/${report.activitiesSuggested}`} />
          </div>

          {/* Programme info */}
          <div className="card card-pad print-full">
            <h3 className="mb-3 section-title">{t("sessionSummary")}</h3>
            <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
              {[
                [t("trainerName"), selected.trainerName],
                [t("sector"), label(selected.sector, locale)],
                [t("level"), label(selected.level, locale)],
                [t("participationLevel"), t(report.participationLevel)],
                [t("platform"), label(selected.platform, locale)],
                [t("duration"), `${selected.durationMinutes} ${t("minutes")}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-brand-50/50 px-3 py-2">
                  <p className="text-[11px] text-ink-soft">{k}</p>
                  <p className="font-semibold text-ink">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="card card-pad print-full">
            <h3 className="mb-4 section-title">{t("timeline")}</h3>
            <ol className="relative space-y-4 border-s-2 border-brand-100 ps-5">
              {report.timeline.map((ev, i) => (
                <li key={i} className="relative">
                  <span className="absolute -start-[27px] grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[9px] font-bold text-white">{ev.minute}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge color="gold">{label(ev.type, locale)}</Badge>
                    <span className="text-sm text-ink">{locale === "ar" ? ev.labelAr : ev.labelEn}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Insights grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            <List title={t("bestMoments")} items={locale === "ar" ? report.bestMomentsAr : report.bestMoments} icon="⭐" color="gold" />
            <List title={t("missedOpportunities")} items={locale === "ar" ? report.missedOpportunitiesAr : report.missedOpportunities} icon="⚠" color="amber" />
            <List title={t("recommendations")} items={locale === "ar" ? report.trainerRecommendationsAr : report.trainerRecommendations} icon="🎯" />
            <List title={t("improvementPlan")} items={locale === "ar" ? report.trainerRecommendationsAr : report.trainerRecommendations} icon="📈" />
          </div>

          {/* Follow-up & assignment */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card card-pad print-full bg-brand-50/40">
              <h3 className="mb-2 text-sm font-bold text-ink">✉ {t("followUp")}</h3>
              <p className="text-sm text-ink">{locale === "ar" ? report.followUpMessageAr : report.followUpMessageEn}</p>
            </div>
            <div className="card card-pad print-full bg-gold-50/40">
              <h3 className="mb-2 text-sm font-bold text-ink">📝 {t("assignment")}</h3>
              <p className="text-sm text-ink">{locale === "ar" ? report.reflectiveAssignmentAr : report.reflectiveAssignmentEn}</p>
            </div>
          </div>

          <p className="text-center text-[11px] text-ink-soft">© 2026 {t("academy")} — {t("appName")} · {new Date(report.generatedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-GB")}</p>
        </div>
      )}
    </div>
  );
}
