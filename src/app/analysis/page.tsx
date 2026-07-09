
import { useEffect, useState } from "react";
import Link from "@/components/link";
import { useLang } from "@/components/providers";
import { PageHeader, Badge } from "@/components/ui";
import { usePrograms, ProgrammePicker } from "@/components/programme-picker";
import { generateAnalysis } from "@/lib/analysis";
import type { ContentAnalysis } from "@/lib/types";

export default function AnalysisPage() {
  const { t, locale } = useLang();
  const { programmes, selectedId, setSelectedId, selected } = usePrograms();
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [pasted, setPasted] = useState(false);

  useEffect(() => {
    setPasted(typeof window !== "undefined" && new URLSearchParams(window.location.search).get("pasted") === "1");
  }, []);

  useEffect(() => {
    if (selected) setAnalysis(generateAnalysis(selected, locale, pasted ? "x" : undefined));
  }, [selected, locale, pasted]);

  const Block = ({ title, items, icon, color = "brand" }: { title: string; items: string[]; icon: string; color?: "brand" | "gold" | "amber" }) => (
    <div className="card card-pad">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50">{icon}</span>
        <h3 className="section-title">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2 text-sm text-ink"><span className={color === "gold" ? "text-gold-500" : color === "amber" ? "text-amber-500" : "text-brand-500"}>◆</span><span>{x}</span></li>
        ))}
      </ul>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={t("navAnalysis")}
        subtitle={selected ? (locale === "ar" ? selected.nameAr : selected.name) : ""}
        actions={
          <>
            <Link href="/question-bank" className="btn-outline text-sm">❓ {t("navQuestionBank")}</Link>
            <Link href="/simulation" className="btn-primary text-sm">⚡ {t("buildScript")}</Link>
          </>
        }
      />

      {programmes.length > 0 && (
        <div className="card card-pad mb-6 max-w-md"><ProgrammePicker programmes={programmes} value={selectedId} onChange={setSelectedId} /></div>
      )}

      {analysis && selected && (
        <div className="space-y-6">
          <div className="card card-pad bg-gradient-to-br from-brand-600 to-brand-800 text-white">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">{t("analysisSummary")}</h3>
              {pasted && <Badge color="gold">{locale === "ar" ? "يشمل المحتوى المرفوع" : "Incl. uploaded content"}</Badge>}
            </div>
            <p className="mt-2 text-brand-50">{analysis.summary}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Block title={t("analysisThemes")} items={analysis.themes} icon="🧩" />
            <Block title={t("analysisChallenges")} items={analysis.expectedChallenges} icon="⚠" color="amber" />
            <Block title={t("analysisMoments")} items={analysis.engagementMoments} icon="⏱" color="gold" />
            <Block title={t("analysisQuestions")} items={analysis.suggestedQuestions} icon="❓" />
            <Block title={t("analysisActivities")} items={analysis.suggestedActivities} icon="◆" />
          </div>
        </div>
      )}
    </div>
  );
}
