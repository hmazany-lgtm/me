"use client";

import Link from "next/link";
import { useLang } from "@/components/providers";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  const { t, locale, toggle } = useLang();

  const features = locale === "ar"
    ? [
        { icon: "❓", title: "أسئلة ذكية", body: "أسئلة توضيحية وتعميقية وسقراطية تُطرح في اللحظة المناسبة." },
        { icon: "⚖️", title: "محامي الشيطان", body: "يتحدّى الافتراضات باحترام ليكشف المخاطر ونقاط العمى." },
        { icon: "🎧", title: "مساعد المدرّب", body: "تنبيهات خاصة تقترح متى تسأل، تصوّت، أو تلخّص." },
        { icon: "🏦", title: "أمثلة من القطاع المالي", body: "يربط التعلّم بأمثلة واقعية من المصرفية والتأمين والالتزام." },
        { icon: "🌱", title: "تفعيل الصامتين", body: "يوسّع المشاركة دون إحراج أي مشارك." },
        { icon: "▦", title: "تقرير تفاعل", body: "تقرير قابل للتصدير يوضّح صحة الجلسة وفرص التطوير." },
      ]
    : [
        { icon: "❓", title: "Smart questions", body: "Clarifying, deepening, and Socratic questions at the right moment." },
        { icon: "⚖️", title: "Devil's advocate", body: "Respectfully challenges assumptions to surface risks and blind spots." },
        { icon: "🎧", title: "Trainer co-pilot", body: "Private nudges on when to ask, poll, or summarize." },
        { icon: "🏦", title: "Financial-sector examples", body: "Connects learning to real banking, insurance, and compliance cases." },
        { icon: "🌱", title: "Activate quiet learners", body: "Widens participation without embarrassing anyone." },
        { icon: "▦", title: "Engagement report", body: "An exportable report of session health and improvement opportunities." },
      ];

  const users = locale === "ar"
    ? ["مدير البرنامج", "المدرّب", "منسق التدريب", "فريق جودة التجربة", "مدير النظام"]
    : ["Programme Manager", "Trainer", "Training Coordinator", "Learning Experience Team", "Admin"];

  const lifecycle = locale === "ar"
    ? [
        { tag: "قبل", title: "خطة تفاعل", body: "يحلّل الأهداف ويولّد سيناريو تفاعل الجلسة، الأسئلة، والأنشطة." },
        { tag: "أثناء", title: "تدخلات لحظية", body: "يقترح أسئلة، تصويتات، وأنشطة — يعتمدها المدرّب أو يعدّلها أو يرفضها." },
        { tag: "بعد", title: "تقرير وتوصيات", body: "يقيس التفاعل ويقترح تحسينات ورسائل متابعة للمشاركين." },
      ]
    : [
        { tag: "Before", title: "Engagement plan", body: "Analyzes objectives and generates a session engagement script, questions, and activities." },
        { tag: "During", title: "Real-time interventions", body: "Suggests questions, polls, and activities — the trainer approves, edits, or rejects." },
        { tag: "After", title: "Report & recommendations", body: "Measures engagement and suggests improvements and follow-up messages." },
      ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/85 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="btn-outline px-3 py-1.5 text-xs">{locale === "ar" ? "English" : "العربية"}</button>
            <Link href="/login" className="btn-primary text-sm">{t("navLogin")}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50/70 to-white" />
        <div className="absolute -top-24 start-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-200/30 blur-3xl" />
        <div className="container-page grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div className="animate-fade-up">
            <span className="chip bg-gold-50 text-gold-700 ring-1 ring-gold-200">✦ {t("heroBadge")}</span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-ink sm:text-5xl">{t("heroTitle")}</h1>
            <p className="mt-4 max-w-xl text-lg text-ink-soft">{t("heroSubtitle")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/login" className="btn-primary text-base">{t("ctaStart")} →</Link>
              <Link href="/login?demo=1" className="btn-outline text-base">{t("ctaDemo")}</Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-ink-soft">
              <span>🇸🇦 {locale === "ar" ? "نبرة سعودية مهنية" : "Professional Saudi tone"}</span>
              <span>•</span>
              <span>{locale === "ar" ? "عربي / إنجليزي" : "Arabic / English"}</span>
              <span>•</span>
              <span>{locale === "ar" ? "ذكاء مسؤول" : "Responsible AI"}</span>
            </div>
          </div>

          {/* Hero preview card */}
          <div className="animate-fade-up">
            <div className="card card-pad shadow-glow">
              <div className="flex items-center gap-3 border-b border-brand-100 pb-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-lg">🤝</div>
                <div>
                  <p className="text-sm font-bold text-ink">{t("appName")}</p>
                  <p className="text-[11px] text-ink-soft">{locale === "ar" ? "متدرّب افتراضي • وضع سقراطي" : "Virtual trainee • Socratic mode"}</p>
                </div>
                <span className="ms-auto h-2 w-2 animate-pulse-soft rounded-full bg-emerald-500" />
              </div>
              <div className="space-y-3 py-4">
                {[
                  locale === "ar" ? "ما الافتراضات التي نبني عليها هذا الاستنتاج؟" : "What assumptions are we building this conclusion on?",
                  locale === "ar" ? "في مصرف حقيقي، كيف يظهر هذا عند فتح حساب؟" : "In a real bank, how does this show up at account opening?",
                ].map((m, i) => (
                  <div key={i} className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-ink">{m}</div>
                ))}
                <div className="rounded-2xl border border-dashed border-gold-300 bg-gold-50/50 px-4 py-3 text-xs text-gold-700">
                  🎧 {locale === "ar" ? "خاص بالمدرّب: استمرت المحاضرة 12 دقيقة — فكّر في تصويت سريع." : "Trainer-private: lecture-heavy for 12 min — consider a quick poll."}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-brand-100 pt-3 text-xs">
                <span className="text-ink-soft">{t("engagementHealth")}</span>
                <span className="font-bold text-brand-700" dir="ltr">72 / 100</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Concept */}
      <section className="container-page py-14">
        <div className="card card-pad grid gap-6 bg-gradient-to-br from-brand-600 to-brand-800 text-white lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-extrabold">{t("landingConceptTitle")}</h2>
          </div>
          <p className="text-brand-50 lg:col-span-2">{t("landingConceptBody")}</p>
        </div>
      </section>

      {/* Features */}
      <section className="container-page py-8">
        <h2 className="section-title mb-6 text-center text-2xl">{t("featuresTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card card-pad transition hover:shadow-glow">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">{f.icon}</div>
              <h3 className="font-bold text-ink">{f.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lifecycle */}
      <section className="container-page py-14">
        <h2 className="section-title mb-6 text-center text-2xl">{t("lifecycleTitle")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {lifecycle.map((l) => (
            <div key={l.tag} className="card card-pad">
              <span className="chip bg-gold-50 text-gold-700 ring-1 ring-gold-200">{l.tag}</span>
              <h3 className="mt-3 font-bold text-ink">{l.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{l.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Users */}
      <section className="container-page py-8">
        <h2 className="section-title mb-5 text-center text-2xl">{t("usersTitle")}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {users.map((u) => (
            <span key={u} className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-100 text-sm">{u}</span>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16">
        <div className="card card-pad flex flex-col items-center gap-4 bg-gradient-to-br from-gold-50 to-white py-12 text-center">
          <h2 className="text-2xl font-extrabold text-ink">{t("heroTitle")}</h2>
          <Link href="/login" className="btn-gold text-base">{t("ctaStart")} →</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-100 bg-brand-50/40">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-8 text-sm text-ink-soft sm:flex-row">
          <Logo />
          <p>© 2026 {t("academy")} — {t("appName")}</p>
          <Link href="/help" className="hover:text-brand-700">{t("navHelp")}</Link>
        </div>
      </footer>
    </div>
  );
}
