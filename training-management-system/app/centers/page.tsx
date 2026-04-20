"use client";

import { useState } from "react";
import {
  Building2, Users, Target, Star, TrendingUp, TrendingDown,
  Minus, Search, Filter, MapPin, User, BookOpen
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { centers, targets } from "@/lib/mockData";
import type { Center } from "@/lib/mockData";

const regionFilters = ["All", "Central", "Western", "Eastern", "Southern", "Northern"];
const statusFilters = ["All", "excellent", "good", "warning", "critical"];

export default function CentersPage() {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("All");
  const [status, setStatus] = useState("All");
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);

  const filtered = centers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.manager.toLowerCase().includes(search.toLowerCase());
    const matchRegion = region === "All" || c.region === region;
    const matchStatus = status === "All" || c.status === status;
    return matchSearch && matchRegion && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => b.score - a.score);

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="Training Centers"
        subtitle={`${centers.length} centers across the network`}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 text-sm font-medium cursor-pointer hover:bg-blue-600/30 transition-colors">
            <Building2 size={15} />
            Add Center
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search centers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-500" />
          <div className="flex gap-1.5">
            {regionFilters.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${region === r ? "bg-blue-600/30 border border-blue-500/40 text-blue-300" : "bg-slate-800/60 border border-slate-700/50 text-slate-400 hover:text-slate-200"}`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5">
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

      <div className="grid grid-cols-12 gap-6">
        {/* Center cards */}
        <div className={`${selectedCenter ? "col-span-8" : "col-span-12"} grid grid-cols-1 ${selectedCenter ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-4`}>
          {sorted.map((center) => {
            const TrendIcon = center.trend === "up" ? TrendingUp : center.trend === "down" ? TrendingDown : Minus;
            const trendColor = center.trend === "up" ? "text-emerald-400" : center.trend === "down" ? "text-red-400" : "text-slate-400";
            const scoreColor = center.score >= 90 ? "text-emerald-400" : center.score >= 75 ? "text-blue-400" : center.score >= 65 ? "text-amber-400" : "text-red-400";
            const scoreBarColor = center.score >= 90 ? "bg-emerald-500" : center.score >= 75 ? "bg-blue-500" : center.score >= 65 ? "bg-amber-500" : "bg-red-500";
            const isSelected = selectedCenter?.id === center.id;

            return (
              <div
                key={center.id}
                onClick={() => setSelectedCenter(isSelected ? null : center)}
                className={`glass rounded-2xl border p-5 cursor-pointer transition-all duration-200 hover:border-blue-500/30 ${isSelected ? "border-blue-500/50 ring-1 ring-blue-500/20" : "border-slate-700/50"}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Building2 size={18} className="text-blue-400" />
                  </div>
                  <StatusBadge status={center.status} />
                </div>

                <h3 className="font-semibold text-white text-sm mb-1">{center.name}</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                  <MapPin size={11} />
                  <span>{center.region} Region</span>
                </div>

                {/* Score */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Performance Score</span>
                    <div className={`flex items-center gap-1 text-xs font-bold ${scoreColor}`}>
                      <TrendIcon size={12} className={trendColor} />
                      <span>{center.score}/100</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-700/60 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${scoreBarColor}`} style={{ width: `${center.score}%` }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-base font-bold text-white">{center.traineeCount.toLocaleString()}</div>
                    <div className="text-xs text-slate-500">Trainees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-white">{center.completionRate}%</div>
                    <div className="text-xs text-slate-500">Completion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-bold text-white flex items-center justify-center gap-0.5">
                      <Star size={12} className="text-amber-400" />
                      {center.satisfactionScore}
                    </div>
                    <div className="text-xs text-slate-500">Satisfaction</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
                  <User size={11} />
                  <span>{center.manager}</span>
                  <span className="ml-auto flex items-center gap-1">
                    <BookOpen size={11} />
                    {center.programs} programs
                  </span>
                </div>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-500 text-sm">No centers match your filters.</div>
          )}
        </div>

        {/* Detail panel */}
        {selectedCenter && (
          <div className="col-span-4 glass rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-sm">Center Detail</h3>
              <button onClick={() => setSelectedCenter(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕ Close</button>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
              <Building2 size={22} className="text-blue-400" />
            </div>
            <h2 className="font-bold text-white text-lg mb-0.5">{selectedCenter.name}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
              <MapPin size={13} />
              <span>{selectedCenter.region} Region</span>
              <StatusBadge status={selectedCenter.status} />
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Score", value: `${selectedCenter.score}/100`, color: "text-blue-400" },
                { label: "Trainees", value: selectedCenter.traineeCount.toLocaleString(), color: "text-white" },
                { label: "Completion", value: `${selectedCenter.completionRate}%`, color: "text-emerald-400" },
                { label: "Satisfaction", value: `${selectedCenter.satisfactionScore}/5`, color: "text-amber-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <div className={`text-xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              ))}
            </div>

            {/* Trend */}
            <div className="mb-5">
              <div className="text-xs text-slate-500 font-medium mb-3">6-Month Score Trend</div>
              <div className="flex items-end gap-1.5 h-20">
                {selectedCenter.monthlyData.map((d) => {
                  const height = `${(d.score / 100) * 100}%`;
                  const color = d.score >= 90 ? "bg-emerald-500" : d.score >= 75 ? "bg-blue-500" : d.score >= 65 ? "bg-amber-500" : "bg-red-500";
                  return (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end" style={{ height: "60px" }}>
                        <div className={`w-full rounded-sm ${color} opacity-80`} style={{ height }} />
                      </div>
                      <span className="text-xs text-slate-600">{d.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Targets */}
            <div>
              <div className="text-xs text-slate-500 font-medium mb-3">Targets</div>
              <div className="space-y-2">
                {targets.filter((t) => t.centerId === selectedCenter.id).map((t) => {
                  const pct = Math.min((t.current / t.target) * 100, 100);
                  const barColor = t.status === "on_track" || t.status === "achieved" ? "bg-emerald-500" : t.status === "at_risk" ? "bg-amber-500" : "bg-red-500";
                  return (
                    <div key={t.id} className="bg-slate-800/40 rounded-lg p-3">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-300 font-medium">{t.metric}</span>
                        <span className="text-slate-400">{t.current}{t.unit} / {t.target}{t.unit}</span>
                      </div>
                      <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {targets.filter((t) => t.centerId === selectedCenter.id).length === 0 && (
                  <div className="text-xs text-slate-600 text-center py-2">No targets set.</div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
              <User size={11} />
              <span>Manager: {selectedCenter.manager}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
