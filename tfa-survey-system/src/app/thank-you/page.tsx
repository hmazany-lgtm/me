"use client";

import Link from "next/link";
import { useSurveyStore } from "@/lib/store";
import { ROLE_LABELS, SECTOR_LABELS } from "@/lib/types";

export default function ThankYouPage() {
  const { role, sector, language: lang, reset } = useSurveyStore();

  const ar = lang === "ar";

  const roleLabel = role ? (ar ? ROLE_LABELS[role].ar : ROLE_LABELS[role].en) : "";
  const sectorLabel = sector ? (ar ? SECTOR_LABELS[sector].ar : SECTOR_LABELS[sector].en) : "";

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-20">
      <div className="max-w-lg w-full text-center">
        {/* Check animation */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl"
          style={{ background: "linear-gradient(135deg, #c8a84b, #e8c96b)" }}
        >
          ✓
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {ar ? "شكراً جزيلاً!" : "Thank You!"}
        </h1>

        <p className="text-slate-600 leading-relaxed mb-2">
          {ar
            ? "مشاركتك قيّمة وستساعدنا على تشكيل مستقبل التدريب المالي في المملكة."
            : "Your participation is valuable and will help us shape the future of financial training in Saudi Arabia."}
        </p>

        {role && sector && (
          <p className="text-slate-500 text-sm mb-8">
            {ar
              ? `تم تسجيل إجابتك بصفتك ${roleLabel} في قطاع ${sectorLabel}`
              : `Your response as ${roleLabel} in the ${sectorLabel} sector has been recorded.`}
          </p>
        )}

        {/* Rewards */}
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-6 mb-8 text-left">
          <h3 className="font-semibold text-slate-800 mb-4 text-center">
            {ar ? "ما ستحصل عليه" : "What you'll receive"}
          </h3>
          <ul className="space-y-3 text-sm text-slate-700">
            {(ar
              ? [
                  "📄 تقرير المقارنة المعيارية — سيُرسل إليك حال اكتمال الدراسة",
                  "🔍 رؤى مخصصة لقطاعك حول الاتجاهات التدريبية",
                  "🤝 دعوة حصرية للمشاركة في منتدى شركاء الأكاديمية",
                ]
              : [
                  "📄 Benchmark Report — sent to you once the study is complete",
                  "🔍 Sector-specific training trend insights",
                  "🤝 Exclusive invitation to the TFA Strategic Partners Forum",
                ]
            ).map((item, i) => (
              <li key={i} className="flex items-start gap-2">{item}</li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            {ar ? "العودة للرئيسية" : "Back to Home"}
          </Link>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
          >
            {ar ? "مشاركة جهة أخرى" : "Submit Another Response"}
          </button>
        </div>
      </div>
    </div>
  );
}
