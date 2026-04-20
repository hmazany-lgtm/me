"use client";

import { useState, useEffect } from "react";
import {
  Users, Building2, BookOpen, TrendingUp, TrendingDown,
  AlertTriangle, Lightbulb, ChevronRight, Award, Target,
  Activity, Bot, ArrowUpRight, Minus, Zap, Star
} from "lucide-react";
import KPICard from "@/components/KPICard";
import StatusBadge from "@/components/StatusBadge";
import { centers, alerts, kpiSummary, innovationPipeline, programs } from "@/lib/mockData";
import Link from "next/link";

const alertIconMap: Record<string, { icon: typeof AlertTriangle; color: string; bg: string }> = {
  critical: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  performance: { icon: Activity, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  slowdown: { icon: TrendingDown, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  innovation: { icon: Lightbulb, color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20" },
};

const pipelineStageColor: Record<string, string> = {
  Research: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Pilot: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Implementation: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Completed: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

const impactColor: Record<string, string> = {
  High: "text-emerald-400",
  Medium: "text-amber-400",
  Low: "text-slate-400",
};

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
  const sortedCenters = [...centers].sort((a, b) => b.score - a.score);
  const unreadAlerts = alerts.filter((a) => !a.isRead);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">
            {time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <h1 className="text-3xl font-bold text-white">Executive Dashboard</h1>
          <p className="text-slate-400 mt-1 text-sm">AI-powered overview of your training network</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 ai-pulse" />
          All AI Agents Active
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          title="Total Trainees"
          value={kpiSummary.totalTrainees.toLocaleString()}
          subtitle="Across all centers"
          icon={Users}
          trend="up"
          trendValue="+8.2%"
          color="blue"
        />
        <KPICard
          title="Active Centers"
          value={kpiSummary.totalCenters}
          subtitle="6 regions covered"
          icon={Building2}
          trend="stable"
          trendValue="No change"
          color="purple"
        />
        <KPICard
          title="Avg. Completion Rate"
          value={`${kpiSummary.avgCompletionRate}%`}
          subtitle="Network-wide average"
          icon={Target}
          trend="up"
          trendValue="+3.1%"
          color="green"
        />
        <KPICard
          title="Active Programs"
          value={kpiSummary.activePrograms}
          subtitle={`${kpiSummary.alertsCount} active alerts`}
          icon={BookOpen}
          trend="down"
          trendValue="1 paused"
          color="amber"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Leaderboard */}
        <div className="col-span-12 lg:col-span-5 glass rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Award className="text-amber-400" size={18} />
              <h2 className="font-semibold text-white">Centers Leaderboard</h2>
            </div>
            <Link href="/centers" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>

          <div className="space-y-3">
            {sortedCenters.map((center, idx) => {
              const TrendIcon = center.trend === "up" ? TrendingUp : center.trend === "down" ? TrendingDown : Minus;
              const trendColor = center.trend === "up" ? "text-emerald-400" : center.trend === "down" ? "text-red-400" : "text-slate-400";
              const rankLabels = ["🥇", "🥈", "🥉", "#4", "#5", "#6"];
              const scoreBarColor = center.score >= 90 ? "bg-emerald-500" : center.score >= 75 ? "bg-blue-500" : center.score >= 65 ? "bg-amber-500" : "bg-red-500";

              return (
                <div key={center.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className="w-6 text-center font-bold text-sm text-slate-400">
                    {rankLabels[idx] ?? `#${idx + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-200 truncate">{center.name}</span>
                      <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
                        <TrendIcon size={11} />
                        <span className="font-semibold">{center.score}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${scoreBarColor}`} style={{ width: `${center.score}%` }} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{center.region}</span>
                      <StatusBadge status={center.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* AI Alerts */}
          <div className="glass rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Bot className="text-violet-400" size={18} />
                <h2 className="font-semibold text-white">AI Alerts</h2>
                {unreadAlerts.length > 0 && (
                  <span className="bg-red-500/80 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {unreadAlerts.length}
                  </span>
                )}
              </div>
              <Link href="/agents" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View agents <ChevronRight size={12} />
              </Link>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => {
                const cfg = alertIconMap[alert.type] ?? alertIconMap.performance;
                const AlertIcon = cfg.icon;
                return (
                  <div key={alert.id} className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.bg} ${!alert.isRead ? "ring-1 ring-inset ring-white/5" : "opacity-70"}`}>
                    <div className={`mt-0.5 flex-shrink-0 ${cfg.color}`}>
                      <AlertIcon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-slate-200">{alert.title}</span>
                        {!alert.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{alert.message}</p>
                      <div className="text-xs text-slate-600 mt-1">{alert.centerName}</div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-600 flex-shrink-0 mt-0.5" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Innovation Pipeline */}
          <div className="glass rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Zap className="text-amber-400" size={18} />
                <h2 className="font-semibold text-white">Innovation Pipeline</h2>
              </div>
              <span className="text-xs text-slate-500">{innovationPipeline.length} initiatives</span>
            </div>

            <div className="space-y-2.5">
              {innovationPipeline.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={15} className="text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-200 truncate">{item.title}</div>
                    <div className="text-xs text-slate-500">{item.centerName}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium flex items-center gap-1 ${impactColor[item.impact]}`}>
                      <Star size={10} />
                      {item.impact}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${pipelineStageColor[item.stage] ?? "bg-slate-500/20 text-slate-400"}`}>
                      {item.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Programs snapshot */}
        <div className="col-span-12 glass rounded-2xl border border-slate-700/50 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BookOpen className="text-blue-400" size={18} />
              <h2 className="font-semibold text-white">Programs Snapshot</h2>
            </div>
            <Link href="/programs" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-700/50">
                  <th className="text-left pb-3 font-medium">Program</th>
                  <th className="text-left pb-3 font-medium">Center</th>
                  <th className="text-left pb-3 font-medium">Category</th>
                  <th className="text-right pb-3 font-medium">Enrolled</th>
                  <th className="text-right pb-3 font-medium">Completion</th>
                  <th className="text-right pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {programs.slice(0, 5).map((prog) => (
                  <tr key={prog.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 font-medium text-slate-200">{prog.name}</td>
                    <td className="py-3 text-slate-400 text-xs">{prog.centerName}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-700/50 text-slate-400 text-xs">{prog.category}</span>
                    </td>
                    <td className="py-3 text-right text-slate-300">{prog.enrolledCount}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${prog.completionRate >= 80 ? "bg-emerald-500" : prog.completionRate >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${prog.completionRate}%` }}
                          />
                        </div>
                        <span className="text-slate-300 w-8 text-right">{prog.completionRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <StatusBadge status={prog.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
