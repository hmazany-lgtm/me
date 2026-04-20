"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  BookOpen,
  Bot,
  TrendingUp,
  Bell,
  Settings,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/centers", label: "Centers", icon: Building2 },
  { href: "/programs", label: "Programs", icon: BookOpen },
  { href: "/agents", label: "AI Agents", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col glass border-r border-slate-700/50 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-lg leading-none">TrainIQ</div>
            <div className="text-xs text-slate-400 mt-0.5">Management System</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
          Main Menu
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"}`} size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-blue-400/60" />}
              {label === "AI Agents" && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 ai-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Alerts badge */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800/60 cursor-pointer transition-colors">
          <Bell size={18} className="text-slate-500" />
          <span className="flex-1">Alerts</span>
          <span className="bg-red-500/90 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">3</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800/60 cursor-pointer transition-colors">
          <Settings size={18} className="text-slate-500" />
          <span>Settings</span>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-xs font-bold text-white">
            EX
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-200 truncate">Executive User</div>
            <div className="text-xs text-slate-500 truncate">admin@trainiq.sa</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
