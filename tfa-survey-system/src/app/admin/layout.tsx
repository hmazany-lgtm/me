"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/admin", icon: "◈", labelEn: "Overview", labelAr: "نظرة عامة", exact: true, roles: ["super_admin", "strategy_editor", "viewer"] },
  { href: "/admin/questions", icon: "⊞", labelEn: "Question Builder", labelAr: "بناء الأسئلة", roles: ["super_admin", "strategy_editor"] },
  { href: "/admin/logic", icon: "⋙", labelEn: "Logic Builder", labelAr: "منطق الشروط", roles: ["super_admin", "strategy_editor"] },
  { href: "/admin/preview", icon: "◉", labelEn: "Survey Preview", labelAr: "معاينة الاستبيان", roles: ["super_admin", "strategy_editor", "viewer"] },
  { href: "/admin/analytics", icon: "◫", labelEn: "Analytics", labelAr: "التحليلات", roles: ["super_admin", "strategy_editor", "viewer"] },
  { href: "/admin/export", icon: "⤓", labelEn: "Export Center", labelAr: "مركز التصدير", roles: ["super_admin", "strategy_editor", "viewer"] },
  { href: "/admin/users", icon: "⊙", labelEn: "User Roles", labelAr: "أدوار المستخدمين", roles: ["super_admin"] },
];

const ROLE_BADGE: Record<string, string> = {
  super_admin: "Super Admin",
  strategy_editor: "Editor",
  viewer: "Viewer",
};

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const ar = lang === "ar";

  // Fetch current session user
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => data && setUser(data.user))
      .catch(() => null);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-60" : "w-16"} flex-shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 fixed top-0 bottom-0 z-30`}
        style={{ [ar ? "right" : "left"]: 0 }}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-slate-200 gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
          >
            TFA
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-slate-800 text-sm truncate">
              {ar ? "لوحة الإدارة" : "Admin Panel"}
            </span>
          )}
        </div>

        {/* Nav — filtered by role */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV.filter((item) => !user || item.roles.includes(user.role)).map((item) => {
            const isAdminRoot = item.href === "/admin" && pathname === "/admin";
            const isActive = item.exact
              ? isAdminRoot
              : pathname.startsWith(item.href) && item.href !== "/admin";

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sidebarOpen && (
                  <span className="truncate">{ar ? item.labelAr : item.labelEn}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: user card + controls */}
        <div className="p-3 border-t border-slate-200 space-y-1">
          {/* User card */}
          {user && sidebarOpen && (
            <div className="px-3 py-2 rounded-lg bg-slate-50 mb-1">
              <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                {ROLE_BADGE[user.role] ?? user.role}
              </span>
            </div>
          )}

          <button
            onClick={() => setLang(ar ? "en" : "ar")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
          >
            <span>🌐</span>
            {sidebarOpen && <span>{ar ? "English" : "العربية"}</span>}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
          >
            <span>{sidebarOpen ? "◀" : "▶"}</span>
            {sidebarOpen && <span>{ar ? "طي القائمة" : "Collapse"}</span>}
          </button>

          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-100"
          >
            <span>↩</span>
            {sidebarOpen && <span>{ar ? "الموقع العام" : "Public Site"}</span>}
          </Link>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <span>⏻</span>
            {sidebarOpen && <span>{loggingOut ? "Signing out..." : ar ? "تسجيل الخروج" : "Sign Out"}</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ [ar ? "marginRight" : "marginLeft"]: sidebarOpen ? "15rem" : "4rem" }}
      >
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <span className="text-sm font-semibold text-slate-700">
            {NAV.find((n) =>
              n.exact ? pathname === n.href : pathname.startsWith(n.href)
            )?.[ar ? "labelAr" : "labelEn"] ?? (ar ? "لوحة الإدارة" : "Admin")}
          </span>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-slate-400">{ar ? "نشط" : "Live"}</span>
            </div>

            {user && (
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                  style={{ background: "linear-gradient(135deg, #0a1628, #1a3a6b)" }}
                  title={`${user.name} — ${ROLE_BADGE[user.role] ?? user.role}`}
                >
                  {initials}
                </div>
                <span className="text-xs text-slate-500 hidden md:block">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
