"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSurveyStore } from "@/lib/store";
import {
  RespondentRole,
  Sector,
  CompanySize,
  SurveyQuestion,
  ROLE_LABELS,
  SECTOR_LABELS,
  COMPANY_SIZE_LABELS,
  BLOCK_LABELS,
} from "@/lib/types";
import { INITIAL_QUESTIONS } from "@/data/questions";
import { getVisibleQuestions, calculateConfidenceScore } from "@/lib/logic-engine";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLES: RespondentRole[] = ["ld_hr", "finance", "business_leader", "regulator", "government", "vendor"];
const SECTORS: Sector[] = ["banking", "insurance", "capital_markets", "financing", "payments", "government", "training_provider", "other"];
const SIZES: CompanySize[] = ["under_100", "100_500", "500_2000", "over_2000"];

function t(obj: { en: string; ar: string }, lang: "en" | "ar") {
  return obj[lang];
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ current, total, lang }: { current: number; total: number; lang: "en" | "ar" }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-500 mb-2">
        <span>{lang === "ar" ? `السؤال ${current} من ${total}` : `Question ${current} of ${total}`}</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className="h-full rounded-full survey-progress" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Option Button ────────────────────────────────────────────────────────────

function OptionBtn({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`option-btn ${selected ? "selected" : ""}`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
            selected ? "border-blue-600 bg-blue-600" : "border-slate-300"
          }`}
        />
        {label}
      </span>
    </button>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

function QuestionCard({
  question,
  lang,
  answers,
  setAnswer,
}: {
  question: SurveyQuestion;
  lang: "en" | "ar";
  answers: Record<string, string | string[] | number>;
  setAnswer: (id: string, val: string | string[] | number) => void;
}) {
  const value = answers[question.id];
  const text = lang === "ar" ? question.textAr : question.textEn;
  const hint = lang === "ar" ? question.hintAr : question.hintEn;

  const blockLabel = BLOCK_LABELS[question.block][lang];

  const handleSingle = (optVal: string) => setAnswer(question.id, optVal);

  const handleMultiple = (optVal: string) => {
    const current = Array.isArray(value) ? (value as string[]) : [];
    const updated = current.includes(optVal)
      ? current.filter((v) => v !== optVal)
      : [...current, optVal];
    setAnswer(question.id, updated);
  };

  return (
    <div className="fade-in-up">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-4">
        {blockLabel}
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-1 leading-snug">{text}</h2>
      {hint && <p className="text-slate-500 text-sm mb-6">{hint}</p>}
      {!hint && <div className="mb-6" />}

      {/* Single Choice */}
      {question.type === "single_choice" && question.options && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <OptionBtn
              key={opt.id}
              label={lang === "ar" ? opt.labelAr : opt.labelEn}
              selected={value === opt.value}
              onClick={() => handleSingle(opt.value)}
            />
          ))}
        </div>
      )}

      {/* Multiple Choice */}
      {question.type === "multiple_choice" && question.options && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => {
            const sel = Array.isArray(value) && (value as string[]).includes(opt.value);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleMultiple(opt.value)}
                className={`option-btn ${sel ? "selected" : ""}`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      sel ? "border-blue-600 bg-blue-600" : "border-slate-300"
                    }`}
                  >
                    {sel && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {lang === "ar" ? opt.labelAr : opt.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Dropdown */}
      {question.type === "dropdown" && question.options && (
        <select
          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setAnswer(question.id, e.target.value)}
        >
          <option value="">
            {lang === "ar" ? "اختر..." : "Select..."}
          </option>
          {question.options.map((opt) => (
            <option key={opt.id} value={opt.value}>
              {lang === "ar" ? opt.labelAr : opt.labelEn}
            </option>
          ))}
        </select>
      )}

      {/* Rating Scale */}
      {question.type === "rating_scale" && (
        <div>
          <div className="flex gap-3 justify-center my-6">
            {Array.from({ length: (question.scaleMax ?? 5) - (question.scaleMin ?? 1) + 1 }, (_x, i) => {
              const v = (question.scaleMin ?? 1) + i;
              const sel = value === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAnswer(question.id, v)}
                  className={`w-12 h-12 rounded-xl border-2 font-bold text-base transition-all ${
                    sel
                      ? "border-blue-600 bg-blue-600 text-white scale-110"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-400"
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-400 px-1">
            <span>{lang === "ar" ? question.scaleMinLabelAr : question.scaleMinLabelEn}</span>
            <span>{lang === "ar" ? question.scaleMaxLabelAr : question.scaleMaxLabelEn}</span>
          </div>
        </div>
      )}

      {/* Short Answer */}
      {question.type === "short_answer" && (
        <textarea
          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none resize-none"
          rows={4}
          placeholder={lang === "ar" ? "اكتب إجابتك هنا..." : "Type your answer here..."}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => setAnswer(question.id, e.target.value)}
        />
      )}

      {/* Number Range */}
      {question.type === "number_range" && (
        <input
          type="number"
          min={question.minValue}
          max={question.maxValue}
          className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 text-sm focus:border-blue-500 focus:outline-none"
          placeholder={lang === "ar" ? "أدخل رقماً..." : "Enter a number..."}
          value={typeof value === "number" ? value : ""}
          onChange={(e) => setAnswer(question.id, Number(e.target.value))}
        />
      )}
    </div>
  );
}

// ─── Onboarding Steps ─────────────────────────────────────────────────────────

function OnboardingRole({
  lang,
  selected,
  onSelect,
}: {
  lang: "en" | "ar";
  selected: RespondentRole | null;
  onSelect: (r: RespondentRole) => void;
}) {
  return (
    <div className="fade-in-up">
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        {lang === "ar" ? "ما دورك في مؤسستك؟" : "What is your role in your organization?"}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        {lang === "ar"
          ? "سيُخصَّص الاستبيان بناءً على دورك"
          : "The survey will be personalized based on your role"}
      </p>
      <div className="flex flex-col gap-2">
        {ROLES.map((role) => (
          <OptionBtn
            key={role}
            label={t(ROLE_LABELS[role], lang)}
            selected={selected === role}
            onClick={() => onSelect(role)}
          />
        ))}
      </div>
    </div>
  );
}

function OnboardingSector({
  lang,
  selected,
  onSelect,
}: {
  lang: "en" | "ar";
  selected: Sector | null;
  onSelect: (s: Sector) => void;
}) {
  return (
    <div className="fade-in-up">
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        {lang === "ar" ? "ما القطاع الذي تعمل فيه مؤسستك؟" : "What sector does your organization operate in?"}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        {lang === "ar" ? "اختر القطاع الأقرب لطبيعة عملك" : "Choose the closest match to your business"}
      </p>
      <div className="flex flex-col gap-2">
        {SECTORS.map((s) => (
          <OptionBtn
            key={s}
            label={t(SECTOR_LABELS[s], lang)}
            selected={selected === s}
            onClick={() => onSelect(s)}
          />
        ))}
      </div>
    </div>
  );
}

function OnboardingSize({
  lang,
  selected,
  onSelect,
}: {
  lang: "en" | "ar";
  selected: CompanySize | null;
  onSelect: (s: CompanySize) => void;
}) {
  return (
    <div className="fade-in-up">
      <h2 className="text-xl font-bold text-slate-900 mb-2">
        {lang === "ar" ? "ما حجم قوة العمل في مؤسستك؟" : "What is the size of your organization's workforce?"}
      </h2>
      <p className="text-slate-500 text-sm mb-6">
        {lang === "ar" ? "عدد الموظفين التقريبي" : "Approximate number of employees"}
      </p>
      <div className="flex flex-col gap-2">
        {SIZES.map((s) => (
          <OptionBtn
            key={s}
            label={t(COMPANY_SIZE_LABELS[s], lang)}
            selected={selected === s}
            onClick={() => onSelect(s)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Survey Page ─────────────────────────────────────────────────────────

export default function SurveyPage() {
  const router = useRouter();
  const {
    language: lang,
    setLanguage,
    role,
    sector,
    companySize,
    currentStep,
    answers,
    setRole,
    setSector,
    setCompanySize,
    setAnswer,
    nextStep,
    prevStep,
    setComplete,
    setSubmitting,
  } = useSurveyStore();

  const [visibleQs, setVisibleQs] = useState<SurveyQuestion[]>([]);

  // Recompute visible questions when role/sector/answers change
  useEffect(() => {
    if (role && sector) {
      const qs = getVisibleQuestions(INITIAL_QUESTIONS, {
        role,
        sector,
        answers,
      });
      setVisibleQs(qs);
    }
  }, [role, sector, answers]);

  // STEP layout:
  // 0 = role onboarding
  // 1 = sector onboarding
  // 2 = size onboarding
  // 3..n = questions (index currentStep - 3)
  const ONBOARDING_STEPS = 3;
  const questionIndex = currentStep - ONBOARDING_STEPS;
  const currentQuestion = questionIndex >= 0 && questionIndex < visibleQs.length
    ? visibleQs[questionIndex]
    : null;
  const totalSteps = ONBOARDING_STEPS + visibleQs.length;

  const canNext = () => {
    if (currentStep === 0) return !!role;
    if (currentStep === 1) return !!sector;
    if (currentStep === 2) return !!companySize;
    if (currentQuestion) {
      if (!currentQuestion.required) return true;
      const val = answers[currentQuestion.id];
      if (val === undefined || val === null) return false;
      if (typeof val === "string") return val.trim().length > 0;
      if (Array.isArray(val)) return val.length > 0;
      return true;
    }
    return false;
  };

  const handleNext = async () => {
    if (currentStep === totalSteps - 1) {
      // Submit
      setSubmitting(true);
      try {
        const confidence = calculateConfidenceScore(answers, visibleQs);
        await fetch("/api/responses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role,
            sector,
            companySize,
            answers,
            confidenceScore: confidence,
            language: lang,
          }),
        });
      } catch {
        // Continue even on error
      } finally {
        setSubmitting(false);
        setComplete(true);
        router.push("/thank-you");
      }
      return;
    }
    nextStep();
  };

  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
            >
              TFA
            </div>
            <span className="text-sm font-semibold text-slate-700">
              {lang === "ar" ? "دراسة مشهد التدريب" : "Training Landscape Study"}
            </span>
          </div>
          <button
            onClick={() => setLanguage(lang === "en" ? "ar" : "en")}
            className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg"
          >
            {lang === "ar" ? "English" : "العربية"}
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="pt-20 pb-32 px-6">
        <div className="max-w-xl mx-auto">
          {/* Progress */}
          {role && sector && (
            <div className="mb-8">
              <ProgressBar
                current={Math.max(1, currentStep)}
                total={totalSteps}
                lang={lang}
              />
            </div>
          )}

          {/* Onboarding */}
          {currentStep === 0 && (
            <OnboardingRole lang={lang} selected={role} onSelect={setRole} />
          )}
          {currentStep === 1 && (
            <OnboardingSector lang={lang} selected={sector} onSelect={setSector} />
          )}
          {currentStep === 2 && (
            <OnboardingSize lang={lang} selected={companySize} onSelect={setCompanySize} />
          )}

          {/* Questions */}
          {currentQuestion && (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              lang={lang}
              answers={answers}
              setAnswer={setAnswer}
            />
          )}
        </div>
      </main>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
          >
            {lang === "ar" ? "← السابق" : "← Back"}
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(totalSteps, 7) }).map((_x, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i <= currentStep ? "bg-blue-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canNext()}
            className="px-6 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
          >
            {isLastStep
              ? lang === "ar"
                ? "إرسال ✓"
                : "Submit ✓"
              : lang === "ar"
              ? "التالي →"
              : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
