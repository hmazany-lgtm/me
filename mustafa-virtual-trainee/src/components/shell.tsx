
import Link from "@/components/link";
import { usePathname, useRouter } from "@/lib/router";
import { useState } from "react";
import { useAuth, useLang, type Permission } from "./providers";
import { Logo } from "./logo";

type NavItem = { href: string; key: string; icon: string; perm?: Permission };
type NavGroup = { titleKey: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    titleKey: "navDashboard",
    items: [
      { href: "/dashboard", key: "navDashboard", icon: "▚" },
    ],
  },
  {
    titleKey: "navProgrammes",
    items: [
      { href: "/programmes", key: "navProgrammes", icon: "▤" },
      { href: "/programmes/new", key: "navCreateProgramme", icon: "＋", perm: "manage_programmes" },
      { href: "/upload", key: "navUpload", icon: "⬆" },
      { href: "/analysis", key: "navAnalysis", icon: "◉" },
    ],
  },
  {
    titleKey: "navControlRoom",
    items: [
      { href: "/personas", key: "navPersonas", icon: "☺" },
      { href: "/control-room", key: "navControlRoom", icon: "◎", perm: "run_sessions" },
      { href: "/simulation", key: "navSimulation", icon: "⚡" },
      { href: "/interventions", key: "navInterventions", icon: "✦" },
    ],
  },
  {
    titleKey: "navQuestionBank",
    items: [
      { href: "/question-bank", key: "navQuestionBank", icon: "❓" },
      { href: "/activities", key: "navActivities", icon: "◆" },
      { href: "/reports", key: "navReports", icon: "▦" },
    ],
  },
  {
    titleKey: "navAdmin",
    items: [
      { href: "/admin", key: "navAdmin", icon: "⚙", perm: "manage_settings" },
      { href: "/users", key: "navUsers", icon: "☰", perm: "manage_users" },
      { href: "/help", key: "navHelp", icon: "🛡" },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, toggle, locale } = useLang();
  const { user, logout, can } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const NavLinks = () => (
    <nav className="flex flex-col gap-5">
      {groups.map((g) => {
        const items = g.items.filter((i) => !i.perm || can(i.perm));
        if (items.length === 0) return null;
        return (
          <div key={g.titleKey}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-ink-soft/60">{t(g.titleKey)}</p>
            <div className="flex flex-col gap-0.5">
              {items.map((i) => {
                const active = pathname === i.href;
                return (
                  <Link
                    key={i.href}
                    href={i.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      active ? "bg-brand-600 text-white shadow-sm" : "text-ink-soft hover:bg-brand-50 hover:text-brand-700"
                    }`}
                  >
                    <span className={`grid h-6 w-6 place-items-center rounded-lg text-xs ${active ? "bg-white/15" : "bg-brand-50"}`}>{i.icon}</span>
                    <span>{t(i.key)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen">
      {/* Topbar */}
      <header className="sticky top-0 z-30 border-b border-brand-100 bg-white/85 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="btn-ghost px-2 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="menu">☰</button>
            <Link href="/dashboard"><Logo /></Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="btn-outline px-3 py-1.5 text-xs" aria-label="language">
              {locale === "ar" ? "English" : "العربية"}
            </button>
            {user && (
              <div className="flex items-center gap-2">
                <div className="hidden text-end sm:block">
                  <p className="text-xs font-bold text-ink">{locale === "ar" ? user.nameAr : user.name}</p>
                  <p className="text-[10px] text-ink-soft">{t(`role_${user.role}`)}</p>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white" style={{ background: user.avatarColor }}>
                  {(locale === "ar" ? user.nameAr : user.name).charAt(0)}
                </div>
                <button
                  className="btn-ghost px-2 text-xs"
                  onClick={() => { logout(); router.push("/login"); }}
                  title={t("logout")}
                >⏻</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container-page flex gap-6 py-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24">
            <NavLinks />
          </div>
        </aside>

        {/* Sidebar (mobile drawer) */}
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
            <div className="absolute inset-0 bg-ink/40" />
            <div
              className={`absolute top-0 h-full w-72 overflow-y-auto bg-white p-4 shadow-xl ${locale === "ar" ? "right-0" : "left-0"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4"><Logo /></div>
              <NavLinks />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 animate-fade-up">{children}</main>
      </div>
    </div>
  );
}
