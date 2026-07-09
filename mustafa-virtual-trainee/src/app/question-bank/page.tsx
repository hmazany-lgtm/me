
import { useMemo, useState } from "react";
import { useLang } from "@/components/providers";
import { PageHeader, Badge, CopyButton } from "@/components/ui";
import { usePrograms, ProgrammePicker } from "@/components/programme-picker";
import { generateQuestionBank } from "@/lib/qbank";
import { label } from "@/lib/i18n";
import type { QuestionCategory } from "@/lib/types";

const categories: QuestionCategory[] = ["opening", "icebreaker", "concept_check", "applied", "socratic", "devils_advocate", "regulatory", "customer_impact", "risk", "closing"];

export default function QuestionBankPage() {
  const { t, locale } = useLang();
  const { programmes, selectedId, setSelectedId, selected } = usePrograms();
  const [cat, setCat] = useState<QuestionCategory | "all">("all");

  const questions = useMemo(() => (selected ? generateQuestionBank(selected) : []), [selected]);
  const filtered = cat === "all" ? questions : questions.filter((q) => q.category === cat);

  return (
    <div>
      <PageHeader title={t("navQuestionBank")} subtitle={t("qbSubtitle")} />

      {programmes.length > 0 && (
        <div className="card card-pad mb-4 max-w-md"><ProgrammePicker programmes={programmes} value={selectedId} onChange={setSelectedId} /></div>
      )}

      {/* Category filter */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button onClick={() => setCat("all")} className={`chip ${cat === "all" ? "bg-brand-600 text-white" : "bg-white ring-1 ring-brand-100 text-ink-soft"}`}>{t("all")}</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={`chip ${cat === c ? "bg-brand-600 text-white" : "bg-white ring-1 ring-brand-100 text-ink-soft"}`}>{label(c, locale)}</button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((q) => (
          <div key={q.id} className="card card-pad">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="brand">{label(q.category, locale)}</Badge>
              <Badge color="gold">{label(`delivery_${q.delivery}`, locale)}</Badge>
              <Badge color="gray">{label(q.difficulty, locale)}</Badge>
              <span className="ms-auto"><CopyButton text={locale === "ar" ? q.textAr : q.textEn} labelCopy={t("copy")} labelCopied={t("copied")} /></span>
            </div>
            <p className="mt-3 text-[15px] font-semibold leading-relaxed text-ink">{locale === "ar" ? q.textAr : q.textEn}</p>
            <dl className="mt-3 space-y-1.5 text-xs">
              <div className="flex gap-2"><dt className="font-semibold text-ink-soft">{t("purpose")}:</dt><dd className="text-ink">{locale === "ar" ? q.purposeAr : q.purposeEn}</dd></div>
              <div className="flex gap-2"><dt className="font-semibold text-ink-soft">{t("timing")}:</dt><dd className="text-ink">{q.timing}</dd></div>
              <div className="flex gap-2"><dt className="font-semibold text-ink-soft">{t("learningValue")}:</dt><dd className="text-ink">{locale === "ar" ? q.learningValueAr : q.learningValueEn}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
