"use client";

import { useState } from "react";
import { SECTOR_LABELS, ROLE_LABELS, Sector, RespondentRole, AIInsight } from "@/lib/types";

// ─── Mock data (replaced by API in production) ────────────────────────────────

const MOCK_RESPONSES = 247;
const MOCK_COMPLETE = 198;

const SECTOR_DIST: { sector: Sector; count: number }[] = [
  { sector: "banking", count: 81 },
  { sector: "capital_markets", count: 52 },
  { sector: "insurance", count: 38 },
  { sector: "financing", count: 31 },
  { sector: "payments", count: 24 },
  { sector: "government", count: 14 },
  { sector: "training_provider", count: 7 },
];

const ROLE_DIST: { role: RespondentRole; count: number }[] = [
  { role: "ld_hr", count: 96 },
  { role: "business_leader", count: 62 },
  { role: "finance", count: 48 },
  { role: "regulator", count: 21 },
  { role: "government", count: 12 },
  { role: "vendor", count: 8 },
];

const DEMAND_HEATMAP: { sector: string; topic: string; score: number }[] = [
  { sector: "Banking", topic: "AI & Data", score: 92 },
  { sector: "Banking", topic: "Risk & Compliance", score: 88 },
  { sector: "Banking", topic: "Leadership", score: 71 },
  { sector: "Banking", topic: "Digital Finance", score: 85 },
  { sector: "Insurance", topic: "AI & Data", score: 78 },
  { sector: "Insurance", topic: "Risk & Compliance", score: 94 },
  { sector: "Insurance", topic: "Leadership", score: 62 },
  { sector: "Insurance", topic: "Digital Finance", score: 70 },
  { sector: "Capital Markets", topic: "AI & Data", score: 87 },
  { sector: "Capital Markets", topic: "Risk & Compliance", score: 76 },
  { sector: "Capital Markets", topic: "Leadership", score: 69 },
  { sector: "Capital Markets", topic: "Digital Finance", score: 91 },
  { sector: "FinTech", topic: "AI & Data", score: 95 },
  { sector: "FinTech", topic: "Risk & Compliance", score: 65 },
  { sector: "FinTech", topic: "Leadership", score: 58 },
  { sector: "FinTech", topic: "Digital Finance", score: 97 },
];

const AI_INSIGHTS: AIInsight[] = [
  {
    category: "launch",
    titleEn: "Launch AI Literacy Program for Finance Professionals",
    titleAr: "إطلاق برنامج محو الأمية الرقمية بالذكاء الاصطناعي للماليين",
    descriptionEn: "87% of respondents flagged AI readiness as a top-3 priority. No market leader currently offers a sector-specific AI program in Saudi Arabia. First-mover advantage is available.",
    confidence: 0.92,
    supportingData: ["q10: AI finance ranked #1 across all sectors", "q11: 68% said 'not ready' or 'exploring'"],
  },
  {
    category: "regulatory",
    titleEn: "Position TFA as the Default SAMA/CMA Compliance Provider",
    titleAr: "تموضع الأكاديمية كمزود إلزامي لمتطلبات ساما وهيئة السوق",
    descriptionEn: "72% of regulated institutions plan to rely on approved external providers for mandatory compliance training. TFA's regulatory relationships create direct leverage.",
    confidence: 0.88,
    supportingData: ["q12: 72% plan to use external approved providers", "q08: regulatory requirement cited as top reason"],
  },
  {
    category: "partnership",
    titleEn: "Co-design Programs with Top 5 Banks",
    titleAr: "تصميم مشترك مع أكبر 5 بنوك في المملكة",
    descriptionEn: "63% of banking respondents are open to co-designing programs. Sector-specific local content and international accreditations are the top two value drivers.",
    confidence: 0.81,
    supportingData: ["q13: 63% open to partnership", "q14: sector-specific content ranked #1 value"],
  },
  {
    category: "pricing",
    titleEn: "Executive Leadership Programs — Premium Pricing Opportunity",
    titleAr: "فرصة تسعير مرتفع للبرامج التنفيذية القيادية",
    descriptionEn: "Large institutions (500+ employees) show high demand for executive programs with international accreditations. Price sensitivity is low in this segment.",
    confidence: 0.77,
    supportingData: ["q14: executive programs ranked #3 value", "q04: 35% deliver 6-10 training days/year"],
  },
  {
    category: "stop",
    titleEn: "Reduce Investment in Generic Soft Skills Programs",
    titleAr: "تقليص الاستثمار في برامج المهارات الشخصية العامة",
    descriptionEn: "Soft skills ranked last in capability gap priorities. Resources should be reallocated to AI, compliance, and sector-specific technical programs.",
    confidence: 0.71,
    supportingData: ["q03: soft skills ranked 8th of 8 priorities"],
  },
];

const INTENSITY_BY_SECTOR = [
  { sector: "Banking", avgDays: 7.2, externalPct: 61 },
  { sector: "Capital Markets", avgDays: 8.1, externalPct: 68 },
  { sector: "Insurance", avgDays: 5.8, externalPct: 54 },
  { sector: "FinTech", avgDays: 9.4, externalPct: 72 },
  { sector: "Financing", avgDays: 4.9, externalPct: 48 },
  { sector: "Government", avgDays: 3.8, externalPct: 35 },
];

// ─── Heatmap Cell ─────────────────────────────────────────────────────────────

function HeatCell({ score }: { score: number }) {
  const bg =
    score >= 90
      ? "#1d4ed8"
      : score >= 80
      ? "#2563eb"
      : score >= 70
      ? "#60a5fa"
      : score >= 60
      ? "#93c5fd"
      : "#dbeafe";
  const textColor = score >= 70 ? "white" : "#1e3a8a";
  return (
    <div
      className="w-full h-10 rounded flex items-center justify-center text-xs font-bold transition-transform hover:scale-105"
      style={{ background: bg, color: textColor }}
    >
      {score}
    </div>
  );
}

// ─── Bar chart row ────────────────────────────────────────────────────────────

function BarRow({
  label,
  value,
  max,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 text-sm text-slate-600 truncate flex-shrink-0">{label}</div>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
      <div className="w-10 text-xs font-semibold text-slate-700 text-right">
        {value}{suffix}
      </div>
    </div>
  );
}

// ─── AI Insight Card ──────────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: AIInsight }) {
  const colors: Record<string, { bg: string; badge: string; icon: string }> = {
    launch: { bg: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700", icon: "🚀" },
    stop: { bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700", icon: "🛑" },
    pricing: { bg: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700", icon: "💰" },
    partnership: { bg: "bg-blue-50 border-blue-200", badge: "bg-blue-100 text-blue-700", icon: "🤝" },
    regulatory: { bg: "bg-purple-50 border-purple-200", badge: "bg-purple-100 text-purple-700", icon: "⚖️" },
  };
  const c = colors[insight.category];

  return (
    <div className={`rounded-2xl border p-5 ${c.bg}`}>
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{c.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${c.badge} text-xs`}>
              {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
            </span>
            <span className="text-xs text-slate-400">
              {Math.round(insight.confidence * 100)}% confidence
            </span>
          </div>
          <h3 className="font-semibold text-slate-800 text-sm">{insight.titleEn}</h3>
        </div>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-3">{insight.descriptionEn}</p>
      <div className="space-y-1">
        {insight.supportingData.map((d, i) => (
          <div key={i} className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-mono text-slate-400">{d.split(":")[0]}:</span>
            <span>{d.split(":").slice(1).join(":")}</span>
          </div>
        ))}
      </div>
      {/* Confidence bar */}
      <div className="mt-3 h-1 bg-white/60 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-current opacity-50"
          style={{ width: `${insight.confidence * 100}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "heatmap" | "intensity" | "ai">("overview");

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "heatmap", label: "Demand Heatmap" },
    { id: "intensity", label: "Training Intensity" },
    { id: "ai", label: "AI Insights" },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Market intelligence from {MOCK_RESPONSES} responses ({MOCK_COMPLETE} complete)
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Responses", value: MOCK_RESPONSES, icon: "◈", color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Complete", value: `${Math.round((MOCK_COMPLETE / MOCK_RESPONSES) * 100)}%`, icon: "✓", color: "text-green-600", bg: "bg-green-50" },
          { label: "Avg. Confidence", value: "84%", icon: "◎", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Sectors Covered", value: "7 / 8", icon: "⊙", color: "text-purple-600", bg: "bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.color} mb-3 text-lg`}>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Responses by Sector</h3>
            <div className="space-y-3">
              {SECTOR_DIST.map((s) => (
                <BarRow
                  key={s.sector}
                  label={SECTOR_LABELS[s.sector].en}
                  value={s.count}
                  max={SECTOR_DIST[0].count}
                  color="linear-gradient(90deg, #1a3a6b, #2563eb)"
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Responses by Role</h3>
            <div className="space-y-3">
              {ROLE_DIST.map((r) => (
                <BarRow
                  key={r.role}
                  label={ROLE_LABELS[r.role].en}
                  value={r.count}
                  max={ROLE_DIST[0].count}
                  color="linear-gradient(90deg, #c8a84b, #e8c96b)"
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Training Demand Level</h3>
            <div className="space-y-3">
              {[
                { label: "High & Growing", value: 38, color: "#22c55e" },
                { label: "High & Stable", value: 29, color: "#3b82f6" },
                { label: "Moderate", value: 21, color: "#f59e0b" },
                { label: "Low", value: 8, color: "#ef4444" },
                { label: "Not Tracked", value: 4, color: "#94a3b8" },
              ].map((item) => (
                <BarRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  max={38}
                  color={item.color}
                  suffix="%"
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Top Capability Gaps</h3>
            <div className="space-y-3">
              {[
                { label: "AI & Data Analytics", value: 74 },
                { label: "Risk & Compliance", value: 71 },
                { label: "Digital Finance", value: 68 },
                { label: "Regulatory Updates", value: 62 },
                { label: "ESG & Sustainability", value: 55 },
                { label: "Leadership", value: 48 },
                { label: "Technical Finance", value: 41 },
                { label: "Soft Skills", value: 22 },
              ].map((item) => (
                <BarRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  max={74}
                  color="linear-gradient(90deg, #7c3aed, #8b5cf6)"
                  suffix="%"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Heatmap */}
      {activeTab === "heatmap" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 overflow-x-auto">
          <h3 className="font-semibold text-slate-800 mb-2">Market Demand Heatmap — Sector × Topic</h3>
          <p className="text-xs text-slate-400 mb-5">Score = % of respondents in that sector flagging the topic as top-3 priority</p>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 pb-3 pr-4 w-32">Sector</th>
                {["AI & Data", "Risk & Compliance", "Leadership", "Digital Finance"].map((t) => (
                  <th key={t} className="text-xs font-semibold text-slate-500 pb-3 px-2 text-center">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["Banking", "Insurance", "Capital Markets", "FinTech"].map((sector) => (
                <tr key={sector}>
                  <td className="text-sm font-medium text-slate-700 pr-4 py-1.5">{sector}</td>
                  {["AI & Data", "Risk & Compliance", "Leadership", "Digital Finance"].map((topic) => {
                    const cell = DEMAND_HEATMAP.find((c) => c.sector === sector && c.topic === topic);
                    return (
                      <td key={topic} className="px-2 py-1.5">
                        <HeatCell score={cell?.score ?? 0} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
            <span>Low</span>
            {["#dbeafe", "#93c5fd", "#60a5fa", "#2563eb", "#1d4ed8"].map((c, i) => (
              <span key={i} className="w-6 h-3 rounded inline-block" style={{ background: c }}></span>
            ))}
            <span>High</span>
          </div>
        </div>
      )}

      {/* Training Intensity */}
      {activeTab === "intensity" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Avg Training Days / Employee / Year</h3>
            <div className="space-y-3">
              {INTENSITY_BY_SECTOR.sort((a, b) => b.avgDays - a.avgDays).map((s) => (
                <BarRow
                  key={s.sector}
                  label={s.sector}
                  value={s.avgDays}
                  max={10}
                  color="linear-gradient(90deg, #0a1628, #2563eb)"
                  suffix=" days"
                />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">External Provider Dependency</h3>
            <div className="space-y-3">
              {INTENSITY_BY_SECTOR.sort((a, b) => b.externalPct - a.externalPct).map((s) => (
                <BarRow
                  key={s.sector}
                  label={s.sector}
                  value={s.externalPct}
                  max={100}
                  color="linear-gradient(90deg, #c8a84b, #e8c96b)"
                  suffix="%"
                />
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-4">
              Average external dependency: <strong>{Math.round(INTENSITY_BY_SECTOR.reduce((a, b) => a + b.externalPct, 0) / INTENSITY_BY_SECTOR.length)}%</strong>
            </p>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {activeTab === "ai" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            AI Insight Engine — {AI_INSIGHTS.length} strategic signals detected from response data
          </div>
          {AI_INSIGHTS.map((insight, i) => (
            <InsightCard key={i} insight={insight} />
          ))}
        </div>
      )}
    </div>
  );
}
