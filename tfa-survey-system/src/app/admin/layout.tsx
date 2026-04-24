"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", icon: "◈", labelEn: "Overview", labelAr: "نظرة عامة", exact: true },
  { href: "/admin/questions", icon: "⊞", labelEn: "Question Builder", labelAr: "بناء الأسئلة" },
  { href: "/admin/logic", icon: "⋙", labelEn: "Logic Builder", labelAr: "منطق الشروط" },
  { href: "/admin/preview", icon: "◉", labelEn: "Survey Preview", labelAr: "معاينة الاستبيان" },
  { href: "/admin/analytics", icon: "◫", labelEn: "Analytics", labelAr: "التحليلات" },
  { href: "/admin/export", icon: "⤓", labelEn: "Export Center", labelAr: "مركز التصدير" },
  { href: "/admin/users", icon: "⊙", labelEn: "User Roles", labelAr: "أدوار المستخدمين" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const ar = lang === "ar";

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-60" : "w-16"
        } flex-shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 fixed top-0 bottom-0 z-30`}
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

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href) && item.href !== "/admin";
            const isAdminRoot = item.href === "/admin" && pathname === "/admin";
            const isActive = item.exact ? isAdminRoot : active;

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

        {/* Bottom controls */}
        <div className="p-3 border-t border-slate-200 space-y-2">
          <button
            onClick={() => setLang(ar ? "en" : "ar")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50"
          >
            <span>🌐</span>
            {sidebarOpen && <span>{ar ? "English" : "العربية"}</span>}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50"
          >
            <span>{sidebarOpen ? "◀" : "▶"}</span>
            {sidebarOpen && <span>{ar ? "طي القائمة" : "Collapse"}</span>}
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50"
          >
            <span>↩</span>
            {sidebarOpen && <span>{ar ? "الموقع العام" : "Public Site"}</span>}
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div
        className="flex-1 flex flex-col min-h-screen"
        style={{ [ar ? "marginRight" : "marginLeft"]: sidebarOpen ? "15rem" : "4rem" }}
      >
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">
              {NAV.find((n) =>
                n.exact ? pathname === n.href : pathname.startsWith(n.href)
              )?.[ar ? "labelAr" : "labelEn"] ?? (ar ? "لوحة الإدارة" : "Admin")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-xs text-slate-500">
              {ar ? "نشط" : "Live"}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
              SA
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
