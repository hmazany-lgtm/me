"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV } from "@/lib/nav";
import { Icon } from "./Icon";
import { useSession } from "@/lib/session";
import { can } from "@/lib/permissions";
import { USERS, SECURITY_ALERTS } from "@/data/seed";
import { ROLES } from "@/lib/permissions";

const GROUPS = ["Overview", "Content", "Delivery", "Trust", "Admin"] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, setUserById } = useSession();
  const [open, setOpen] = useState(false);

  // Candidate exam interface renders full-screen without the admin shell.
  if (pathname?.startsWith("/exam/")) return <>{children}</>;

  const visibleNav = NAV.filter((n) => {
    if (n.hideForRoles?.includes(user.roleKey)) return false;
    if (!n.perm) return true;
    return n.perm.some((p) => can(user.roleKey, p));
  });

  const openAlerts = SECURITY_ALERTS.filter((a) => a.status === "open").length;

  return (
    <div className="min-h-screen flex bg-navy-50">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-navy-900 text-navy-100 flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-teal-500 to-gold-500 grid place-items-center font-bold text-navy-900 text-sm">TFA</div>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-white">Financial Academy</p>
            <p className="text-[10px] text-navy-300">Examination Platform</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {GROUPS.map((group) => {
            const items = visibleNav.filter((n) => n.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-navy-400">{group}</p>
                <ul className="space-y-0.5">
                  {items.map((item) => {
                    const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                    return (
                      <li key={item.href}>
                        <Link href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${active ? "bg-white/10 text-white font-medium" : "text-navy-200 hover:bg-white/5 hover:text-white"}`}>
                          <Icon name={item.icon} className="w-[18px] h-[18px] shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-white/10 text-[10px] text-navy-400">
          Prototype · v0.1 · Security-first
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-navy-100 flex items-center gap-3 px-4 lg:px-6 sticky top-0 z-20">
          <button className="lg:hidden text-navy-600" onClick={() => setOpen(true)} aria-label="Menu">
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Icon name="search" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
              <input placeholder="Search certifications, questions, candidates…" className="w-full rounded-lg bg-navy-50 border border-navy-100 pl-9 pr-3 py-2 text-sm text-navy-700 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
            </div>
          </div>
          <div className="flex-1 md:hidden" />

          {/* Role switcher (auth placeholder) */}
          <div className="flex items-center gap-2">
            <label className="hidden sm:block text-[10px] uppercase tracking-wide text-navy-400">View as</label>
            <select value={user.id} onChange={(e) => setUserById(e.target.value)} className="rounded-lg border border-navy-200 bg-white text-sm text-navy-700 py-1.5 pl-2.5 pr-7 focus:outline-none focus:ring-2 focus:ring-teal-500/30 max-w-[190px]">
              {USERS.map((u) => (
                <option key={u.id} value={u.id}>{ROLES[u.roleKey].name}</option>
              ))}
            </select>
          </div>

          <Link href="/security" className="relative p-2 rounded-lg hover:bg-navy-50 text-navy-500" aria-label="Alerts">
            <Icon name="bell" className="w-5 h-5" />
            {openAlerts > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] grid place-items-center font-semibold">{openAlerts}</span>}
          </Link>

          <div className="flex items-center gap-2 pl-2 border-l border-navy-100">
            <div className="w-8 h-8 rounded-full bg-navy-800 text-white grid place-items-center text-xs font-semibold">
              {user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-medium text-navy-800 max-w-[130px] truncate">{user.fullName}</p>
              <p className="text-[10px] text-navy-400">{ROLES[user.roleKey].name}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
