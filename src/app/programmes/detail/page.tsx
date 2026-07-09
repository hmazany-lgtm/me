
import Link from "@/components/link";
import { useEffect, useState } from "react";
import { useParams } from "@/lib/router";
import { useLang } from "@/components/providers";
import { PageHeader, Badge } from "@/components/ui";
import { store } from "@/lib/store";
import { label } from "@/lib/i18n";
import type { Programme } from "@/lib/types";

export default function ProgrammeDetailPage() {
  const { t, locale } = useLang();
  const params = useParams();
  const [p, setP] = useState<Programme | undefined>();

  useEffect(() => {
    const id = String(params.id);
    setP(store.getProgramme(id));
  }, [params.id]);

  if (!p) return <div className="card card-pad">{t("selectProgrammeFirst")}</div>;

  const langLabel =
    p.language === "bilingual" ? label("bilingual", locale) : p.language === "ar" ? (locale === "ar" ? "العربية" : "Arabic") : locale === "ar" ? "الإنجليزية" : "English";

  const info: [string, string][] = [
    [t("progCode"), p.code],
    [t("trainerName"), p.trainerName],
    [t("coordinatorName"), p.coordinatorName],
    [t("sector"), label(p.sector, locale)],
    [t("platform"), label(p.platform, locale)],
    [t("level"), label(p.level, locale)],
    [t("sessionLanguage"), langLabel],
    [t("duration"), `${p.durationMinutes} ${t("minutes")}`],
    [t("targetAudience"), p.targetAudience],
    [t("engagementStyle"), label(p.engagementStyle, locale)],
  ];

  return (
    <div>
      <PageHeader
        title={locale === "ar" ? p.nameAr : p.name}
        subtitle={p.code}
        actions={
          <>
            <Link href={`/analysis?p=${p.id}`} className="btn-outline text-sm">◉ {t("navAnalysis")}</Link>
            <Link href={`/simulation?p=${p.id}`} className="btn-primary text-sm">⚡ {t("navSimulation")}</Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card card-pad">
            <h2 className="section-title mb-3">{t("objectives")}</h2>
            <ul className="space-y-2">
              {p.objectives.map((o, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink"><span className="text-brand-500">◆</span>{o}</li>
              ))}
            </ul>
          </div>

          <div className="card card-pad">
            <h2 className="section-title mb-3">{t("outcomes")}</h2>
            <ul className="space-y-2">
              {p.outcomes.map((o, i) => (
                <li key={i} className="flex gap-2 text-sm text-ink"><span className="text-gold-500">✓</span>{o}</li>
              ))}
            </ul>
          </div>

          <div className="card card-pad">
            <h2 className="section-title mb-3">{t("agenda")}</h2>
            <div className="space-y-2">
              {p.agenda.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl bg-brand-50/60 px-4 py-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-white text-xs font-bold text-brand-700">{i + 1}</span>
                  <span className="flex-1 text-sm text-ink">{a.title}</span>
                  <Badge color="gold">{a.minutes} {t("minutes")}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card card-pad">
            <h2 className="section-title mb-3">{t("participantProfile")}</h2>
            <p className="text-sm text-ink-soft">{p.participantProfile}</p>
          </div>
          <div className="card card-pad">
            <h3 className="mb-3 text-sm font-bold text-ink">{t("viewDetails")}</h3>
            <dl className="space-y-2 text-sm">
              {info.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-brand-50 pb-2 last:border-0">
                  <dt className="text-ink-soft">{k}</dt>
                  <dd className="text-end font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          {p.sensitiveTopics && (
            <div className="card card-pad border-amber-200 bg-amber-50/50">
              <h3 className="mb-1 text-sm font-bold text-amber-800">⚠ {t("sensitiveTopics")}</h3>
              <p className="text-sm text-amber-700">{p.sensitiveTopics}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
