"use client";

import { useState, useEffect } from "react";
import { useAdminStore } from "@/lib/store";
import {
  RespondentRole,
  Sector,
  SurveyQuestion,
  ROLE_LABELS,
  SECTOR_LABELS,
  BLOCK_LABELS,
} from "@/lib/types";
import { getVisibleQuestions } from "@/lib/logic-engine";

const ROLES: RespondentRole[] = ["ld_hr", "finance", "business_leader", "regulator", "government", "vendor"];
const SECTORS: Sector[] = ["banking", "insurance", "capital_markets", "financing", "payments", "government", "training_provider", "other"];

function QuestionPreviewCard({
  question,
  lang,
  index,
}: {
  question: SurveyQuestion;
  lang: "en" | "ar";
  index: number;
}) {
  const text = lang === "ar" ? question.textAr : question.textEn;
  const blockLabel = BLOCK_LABELS[question.block][lang];

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5 fade-in-up"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
            {index + 1}
          </span>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {blockLabel}
          </span>
          {question.required && (
            <span className="text-xs text-red-400 font-medium">* Required</span>
          )}
        </div>
        <span className="text-xs text-slate-400 font-mono">{question.type}</span>
      </div>

      <p className="text-sm font-semibold text-slate-800 mb-4">{text}</p>

      {/* Options preview */}
      {question.options && ["single_choice", "multiple_choice", "dropdown"].includes(question.type) && (
        <div className="space-y-2">
          {question.options.map((opt) => (
            <div
              key={opt.id}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 flex items-center gap-2"
            >
              <span className="w-3 h-3 rounded-full border border-slate-300 flex-shrink-0"></span>
              {lang === "ar" ? opt.labelAr : opt.labelEn}
            </div>
          ))}
        </div>
      )}

      {question.type === "rating_scale" && (
        <div className="flex gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-xl border-2 border-slate-200 flex items-center justify-center text-sm font-bold text-slate-400"
            >
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {question.type === "short_answer" && (
        <div className="w-full h-16 rounded-lg border-2 border-slate-100 bg-slate-50"></div>
      )}

      <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-400 italic">
        {question.whyItMatters}
      </div>
    </div>
  );
}

export default function SurveyPreviewPage() {
  const { questions } = useAdminStore();
  const [previewRole, setPreviewRole] = useState<RespondentRole>("ld_hr");
  const [previewSector, setPreviewSector] = useState<Sector>("banking");
  const [previewLang, setPreviewLang] = useState<"en" | "ar">("en");
  const [visibleQs, setVisibleQs] = useState<SurveyQuestion[]>([]);

  useEffect(() => {
    const qs = getVisibleQuestions(questions, {
      role: previewRole,
      sector: previewSector,
      answers: {},
    });
    setVisibleQs(qs);
  }, [questions, previewRole, previewSector]);

  const blockGroups = [
    "market_demand",
    "training_volume",
    "external_providers",
    "future_trends",
    "strategic_partnership",
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Survey Preview</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Preview the adaptive survey as any respondent role
        </p>
      </div>

      {/* Preview Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Preview Role
            </label>
            <select
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
              value={previewRole}
              onChange={(e) => setPreviewRole(e.target.value as RespondentRole)}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r].en} — {ROLE_LABELS[r].ar}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Preview Sector
            </label>
            <select
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:border-blue-400 focus:outline-none"
              value={previewSector}
              onChange={(e) => setPreviewSector(e.target.value as Sector)}
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{SECTOR_LABELS[s].en}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">
              Language
            </label>
            <div className="flex gap-2">
              {(["en", "ar"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setPreviewLang(l)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    previewLang === l
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  {l === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
          <span>
            Showing <strong className="text-blue-600">{visibleQs.length}</strong> questions
            for <strong>{ROLE_LABELS[previewRole].en}</strong> in <strong>{SECTOR_LABELS[previewSector].en}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span>
            Hidden: <strong>{questions.filter((q) => q.status === "published").length - visibleQs.length}</strong> questions
          </span>
        </div>
      </div>

      {/* Block-by-block preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Question list */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
            Questions Visible to This Role
          </h2>
          {visibleQs.map((q, i) => (
            <QuestionPreviewCard
              key={q.id}
              question={q}
              lang={previewLang}
              index={i}
            />
          ))}
        </div>

        {/* Right: Block breakdown */}
        <div className="space-y-4">
          <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
            Block Coverage
          </h2>
          {blockGroups.map((block) => {
            const blockQs = visibleQs.filter((q) => q.block === block);
            const totalInBlock = questions.filter((q) => q.block === block && q.status === "published").length;
            return (
              <div key={block} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    {BLOCK_LABELS[block][previewLang]}
                  </span>
                  <span className="text-xs text-slate-500">
                    {blockQs.length} / {totalInBlock} questions
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: totalInBlock > 0 ? `${(blockQs.length / totalInBlock) * 100}%` : "0%",
                      background: "linear-gradient(90deg, #c8a84b, #e8c96b)",
                    }}
                  />
                </div>
                <div className="mt-2 space-y-1">
                  {blockQs.map((q) => (
                    <div key={q.id} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-green-400"></span>
                      <span className="line-clamp-1">{previewLang === "ar" ? q.textAr : q.textEn}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
