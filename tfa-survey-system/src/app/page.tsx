"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const ar = lang === "ar";

  const content = {
    badge: ar ? "دراسة مشهد التدريب 2025" : "Training Landscape Study 2025",
    headline: ar
      ? "شكّل مستقبل التدريب المالي في المملكة"
      : "Shape the Future of Financial Training in Saudi Arabia",
    subheadline: ar
      ? "نستطلع آراء قادة التعلم والمتخصصين الماليين لفهم احتياجات السوق وتوجيه استراتيجيتنا حتى 2031"
      : "We're surveying L&D leaders and financial professionals to understand market needs and shape our strategy through 2031.",
    cta: ar ? "شارك الآن — 4 دقائق فقط" : "Participate Now — 4 Minutes Only",
    ctaSub: ar ? "مجاني • سري • ذو أثر حقيقي" : "Free • Confidential • Real Impact",
    trustTitle: ar ? "لماذا مشاركتك مهمة؟" : "Why Your Input Matters",
    whatYouGet: ar ? "ما الذي ستحصل عليه؟" : "What You'll Receive",
    sectors: ar ? "القطاعات المستهدفة" : "Target Sectors",
    adminLink: ar ? "دخول المشرفين" : "Admin Dashboard",
  };

  const trustPoints = ar
    ? [
        { icon: "📊", title: "تقرير المقارنة المعيارية", desc: "احصل على تقرير مجاني يقارن مؤسستك بمنافسيها" },
        { icon: "🎯", title: "توجيه القرارات", desc: "إجابتك تؤثر مباشرة في برامجنا ومحتوانا لـ 2025–2031" },
        { icon: "🔒", title: "سرية تامة", desc: "بياناتك مجمّعة ومجهولة الهوية تماماً" },
        { icon: "⚡", title: "أقل من 4 دقائق", desc: "12–15 سؤالاً فقط، مصمم بعناية فائقة" },
      ]
    : [
        { icon: "📊", title: "Benchmark Report", desc: "Receive a free report comparing your institution to sector peers" },
        { icon: "🎯", title: "Shape Strategy", desc: "Your answers directly influence our programs and content for 2025–2031" },
        { icon: "🔒", title: "Fully Confidential", desc: "All data is aggregated and fully anonymized" },
        { icon: "⚡", title: "Under 4 Minutes", desc: "12–15 carefully designed questions only" },
      ];

  const sectors = [
    { icon: "🏦", en: "Banking", ar: "البنوك" },
    { icon: "🛡️", en: "Insurance", ar: "التأمين" },
    { icon: "📈", en: "Capital Markets", ar: "أسواق المال" },
    { icon: "💳", en: "FinTech & Payments", ar: "التقنية المالية" },
    { icon: "🏛️", en: "Regulatory Bodies", ar: "الجهات التنظيمية" },
    { icon: "🎓", en: "Training Providers", ar: "مزودو التدريب" },
  ];

  const stats = ar
    ? [
        { value: "+200", label: "مؤسسة مالية مستهدفة" },
        { value: "6", label: "قطاعات مالية" },
        { value: "2031", label: "أفق استراتيجي" },
        { value: "100%", label: "سري ومجاني" },
      ]
    : [
        { value: "200+", label: "Target Financial Institutions" },
        { value: "6", label: "Financial Sectors" },
        { value: "2031", label: "Strategic Horizon" },
        { value: "100%", label: "Free & Confidential" },
      ];

  return (
    <div dir={ar ? "rtl" : "ltr"} className={ar ? "font-[Noto_Kufi_Arabic,Inter,sans-serif]" : ""}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-tfa-gradient flex items-center justify-center text-white font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}>
              TFA
            </div>
            <span className="font-semibold text-slate-800 text-sm">
              {ar ? "الأكاديمية المالية" : "The Financial Academy"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(ar ? "en" : "ar")}
              className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
            >
              {ar ? "English" : "العربية"}
            </button>
            <Link
              href="/admin"
              className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              {content.adminLink} →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="pt-24 pb-20 px-6"
        style={{ background: "linear-gradient(160deg, #0a1628 0%, #1a3a6b 60%, #0f2d5a 100%)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs font-semibold mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
            {content.badge}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6 text-balance">
            {content.headline}
          </h1>

          <p className="text-lg text-blue-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            {content.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/survey"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #c8a84b, #e8c96b)" }}
            >
              {content.cta}
              <span className={ar ? "rotate-180 inline-block" : ""}>→</span>
            </Link>
          </div>

          <p className="text-blue-300/70 text-sm mt-4">{content.ctaSub}</p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="bg-slate-900 py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold text-amber-400">{s.value}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Points */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">
            {content.trustTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trustPoints.map((p, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{p.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-16 px-6" style={{ background: "#fafaf7" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800 text-center mb-10">
            {content.sectors}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sectors.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm"
              >
                <span className="text-xl">{s.icon}</span>
                {ar ? s.ar : s.en}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{content.whatYouGet}</h2>
          <div className="rounded-2xl p-8 border-2 border-amber-200 bg-amber-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              {(ar
                ? [
                    "📄 تقرير مقارنة مجاني يوضح موقع مؤسستك في السوق",
                    "🔍 رؤى حول الاتجاهات التدريبية في قطاعك",
                    "🤝 دعوة مبكرة للانضمام لمجموعة الشركاء الاستراتيجيين",
                  ]
                : [
                    "📄 Free benchmark report showing where your institution stands",
                    "🔍 Sector-specific training trend insights",
                    "🤝 Early invitation to the TFA Strategic Partners Group",
                  ]
              ).map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-left text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/survey"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
            >
              {ar ? "ابدأ المشاركة الآن" : "Start Participating Now"}
              <span className={ar ? "rotate-180 inline-block" : ""}>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-200 bg-slate-900">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ background: "linear-gradient(135deg, #c8a84b, #e8c96b)" }}
            >
              TFA
            </div>
            <span className="text-slate-400 text-sm">
              {ar
                ? "الأكاديمية المالية — مبادرة مشهد التدريب 2025"
                : "The Financial Academy — Training Landscape Initiative 2025"}
            </span>
          </div>
          <p className="text-slate-500 text-xs">
            {ar
              ? "جميع البيانات مجمّعة ومجهولة. لن تُشارك بيانات فردية مع أي طرف."
              : "All data is aggregated and anonymized. No individual data will be shared."}
          </p>
        </div>
      </footer>
    </div>
  );
}
