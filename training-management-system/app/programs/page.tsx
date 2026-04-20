"use client";

import { useState } from "react";
import {
  BookOpen, Search, Users, Clock, Star, DollarSign,
  Filter, ChevronRight, Calendar, User, TrendingUp
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { programs } from "@/lib/mockData";

const categoryFilters = ["All", "Technology", "Leadership", "Management", "Marketing"];
const statusFilters = ["All", "active", "completed", "upcoming", "paused"];

const categoryColor: Record<string, string> = {
  Technology: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Leadership: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  Management: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Marketing: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function ProgramsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [view, setView] = useState<"grid" | "table">("grid");

  const filtered = programs.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.instructor.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "All" || p.category === category;
    const matchStatus = status === "All" || p.status === status;
    return matchSearch && matchCategory && matchStatus;
  });

  const totalEnrolled = filtered.reduce((s, p) => s + p.enrolledCount, 0);
  const avgCompletion = filtered.length ? Math.round(filtered.reduce((s, p) => s + p.completionRate, 0) / filtered.length) : 0;
  const totalBudget = filtered.reduce((s, p) => s + p.budget, 0);

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Programs"
        subtitle={`${programs.length} total programs across all centers`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 rounded-lg p-1">
              {(["grid", "table"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors capitalize ${view === v ? "bg-blue-600/30 text-blue-300 border border-blue-500/30" : "text-slate-400 hover:text-slate-200"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-medium cursor-pointer hover:bg-blue-600/30 transition-colors">
              <BookOpen size={15} />
              Add Program
            </div>
          </div>
        }
      />

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Enrolled", value: totalEnrolled.toLocaleString(), icon: Users, color: "text-blue-400" },
          { label: "Avg. Completion", value: `${avgCompletion}%`, icon: TrendingUp, color: "text-emerald-400" },
          { label: "Total Budget", value: `SAR ${(totalBudget / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-amber-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-xl border border-slate-700/50 p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search programs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <div className="flex gap-1.5 flex-wrap">
            {categoryFilters.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${category === c ? "bg-blue-600/30 border border-blue-500/40 text-blue-300" : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${status === s ? "bg-violet-600/30 border border-violet-500/40 text-violet-300" : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((prog) => {
            const budgetPct = prog.budget > 0 ? Math.round((prog.spent / prog.budget) * 100) : 0;
            return (
              <div key={prog.id} className="glass rounded-2xl border border-slate-700/50 p-5 hover:border-blue-500/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${categoryColor[prog.category] ?? "bg-slate-500/15 text-slate-400"}`}>
                    {prog.category}
                  </span>
                  <StatusBadge status={prog.status} />
                </div>

                <h3 className="font-semibold text-white text-sm mb-1 leading-snug">{prog.name}</h3>
                <p className="text-xs text-slate-500 mb-4">{prog.centerName}</p>

                {/* Completion bar */}
                {prog.status !== "upcoming" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Completion</span>
                      <span className={`font-medium ${prog.completionRate >= 80 ? "text-emerald-400" : prog.completionRate >= 60 ? "text-amber-400" : "text-red-400"}`}>
                        {prog.completionRate}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${prog.completionRate >= 80 ? "bg-emerald-500" : prog.completionRate >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                        style={{ width: `${prog.completionRate}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-white flex items-center justify-center gap-1">
                      <Users size={11} className="text-blue-400" />
                      {prog.enrolledCount}
                    </div>
                    <div className="text-xs text-slate-500">Enrolled</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-white flex items-center justify-center gap-1">
                      <Clock size={11} className="text-amber-400" />
                      {prog.duration}h
                    </div>
                    <div className="text-xs text-slate-500">Duration</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-white flex items-center justify-center gap-1">
                      <Star size={11} className="text-amber-400" />
                      {prog.satisfactionScore > 0 ? prog.satisfactionScore : "—"}
                    </div>
                    <div className="text-xs text-slate-500">Rating</div>
                  </div>
                </div>

                {/* Budget */}
                {prog.budget > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Budget Utilization</span>
                      <span className="text-slate-400">SAR {(prog.spent / 1000).toFixed(0)}K / {(prog.budget / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="h-1 bg-slate-700/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${budgetPct > 90 ? "bg-red-500" : budgetPct > 70 ? "bg-amber-500" : "bg-violet-500"}`}
                        style={{ width: `${budgetPct}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
                  <User size={11} />
                  <span className="truncate">{prog.instructor}</span>
                  <span className="ml-auto flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(prog.endDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-500 text-sm">No programs match your filters.</div>
          )}
        </div>
      ) : (
        <div className="glass rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700/50">
                <tr className="text-xs text-slate-500">
                  <th className="text-left px-5 py-3 font-medium">Program</th>
                  <th className="text-left px-4 py-3 font-medium">Center</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-right px-4 py-3 font-medium">Enrolled</th>
                  <th className="text-right px-4 py-3 font-medium">Completion</th>
                  <th className="text-right px-4 py-3 font-medium">Rating</th>
                  <th className="text-right px-4 py-3 font-medium">Budget</th>
                  <th className="text-right px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filtered.map((prog) => (
                  <tr key={prog.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-200">{prog.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <User size={10} />
                        {prog.instructor}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{prog.centerName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${categoryColor[prog.category] ?? ""}`}>
                        {prog.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-300">{prog.enrolledCount}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-12 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                          <div className={`h-full ${prog.completionRate >= 80 ? "bg-emerald-500" : prog.completionRate >= 60 ? "bg-amber-500" : "bg-red-500"} rounded-full`} style={{ width: `${prog.completionRate}%` }} />
                        </div>
                        <span className="w-8 text-slate-300">{prog.completionRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-amber-400">
                      {prog.satisfactionScore > 0 ? (
                        <span className="flex items-center justify-end gap-1">
                          <Star size={11} />
                          {prog.satisfactionScore}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-xs">
                      SAR {(prog.budget / 1000).toFixed(0)}K
                    </td>
                    <td className="px-5 py-3 text-right">
                      <StatusBadge status={prog.status} />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-slate-500 text-sm">No programs match your filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
