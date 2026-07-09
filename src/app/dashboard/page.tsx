
import Link from "@/components/link";
import { useEffect, useState } from "react";
import { useAuth, useLang } from "@/components/providers";
import { PageHeader, StatCard, Badge } from "@/components/ui";
import { store } from "@/lib/store";
import { label } from "@/lib/i18n";
import type { Programme } from "@/lib/types";

export default function DashboardPage() {
  const { t, locale } = useLang();
  const { user, can } = useAuth();
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  useEffect(() => setProgrammes(store.getProgrammes()), []);

  const quick = [
    { href: "/programmes/new", icon: "＋", key: "navCreateProgramme", perm: "manage_programmes" as const },
    { href: "/simulation", icon: "⚡", key: "navSimulation" },
    { href: "/question-bank", icon: "❓", key: "navQuestionBank" },
    { href: "/reports", icon: "▦", key: "navReports" },
  ].filter((q) => !q.perm || can(q.perm));

  return (
    <div>
      <PageHeader title={`${t("welcome")}، ${user ? (locale === "ar" ? user.nameAr : user.name) : ""}`} subtitle={t("dashSubtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("kpiProgrammes")} value={programmes.length} hint={t("navProgrammes")} />
        <StatCard label={t("kpiSessions")} value={programmes.length} accent="gold" />
        <StatCard label={t("kpiSuggestions")} value={128} hint="+18%" />
        <StatCard label={t("kpiEngagement")} value="72%" accent="gold" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Recent programmes */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">{t("recentProgrammes")}</h2>
            <Link href="/programmes" className="btn-ghost text-xs">{t("all")} →</Link>
          </div>
          <div className="space-y-3">
            {programmes.map((p) => (
              <Link key={p.id} href={`/programmes/${p.id}`} className="card card-pad flex items-center gap-4 transition hover:shadow-glow">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-xl">🎓</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-ink">{locale === "ar" ? p.nameAr : p.name}</p>
                  <p className="text-xs text-ink-soft">{p.code} · {label(p.sector, locale)} · {label(p.level, locale)}</p>
                </div>
                <div className="hidden gap-2 sm:flex">
                  <Badge color="brand">{label(p.platform, locale)}</Badge>
                  <Badge color="gold">{p.durationMinutes} {t("minutes")}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="section-title mb-3">{t("quickActions")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {quick.map((q) => (
              <Link key={q.href} href={q.href} className="card card-pad flex flex-col items-center gap-2 py-6 text-center transition hover:shadow-glow">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">{q.icon}</span>
                <span className="text-xs font-semibold text-ink">{t(q.key)}</span>
              </Link>
            ))}
          </div>

          <div className="card card-pad mt-4 bg-gradient-to-br from-gold-50 to-white">
            <p className="text-sm font-bold text-ink">🛡 {t("navHelp")}</p>
            <p className="mt-1 text-xs text-ink-soft">
              {locale === "ar"
                ? "مصطفى شفّاف، محترم، ولا يقيّم الأفراد بشكل غير عادل."
                : "Mustafa is transparent, respectful, and never evaluates individuals unfairly."}
            </p>
            <Link href="/help" className="btn-ghost mt-2 text-xs">{t("viewDetails")} →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
