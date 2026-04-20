"use client";

import { useState, useCallback } from "react";
import {
  Bot, Activity, TrendingDown, Lightbulb, Play, RefreshCw,
  ChevronDown, ChevronUp, AlertTriangle, Info, Zap, CheckCircle,
  Clock, Target, Building2
} from "lucide-react";
import PageHeader from "@/components/PageHeader";

type Severity = "low" | "medium" | "high" | "critical";

type Finding = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  centerId?: string;
  centerName?: string;
  recommendation: string;
};

type AgentResult = {
  agentId: string;
  agentName: string;
  status: "completed" | "running" | "idle";
  lastRun: string;
  findings: Finding[];
  summary: string;
};

type AgentsResponse = {
  agents: AgentResult[];
};

const agentMeta: Record<string, { icon: typeof Bot; color: string; bg: string; border: string; description: string; capabilities: string[] }> = {
  "performance-agent": {
    icon: Activity,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    description: "Continuously monitors KPIs, completion rates, and satisfaction scores across all training centers. Flags deviations from targets and generates actionable recommendations.",
    capabilities: ["Real-time KPI monitoring", "Target deviation detection", "Satisfaction analysis", "Benchmarking across centers"],
  },
  "slowdown-agent": {
    icon: TrendingDown,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    description: "Detects early signals of performance degradation by analyzing multi-month trends, trainee dropout patterns, and program disruptions before they become critical.",
    capabilities: ["Trend regression analysis", "Dropout acceleration detection", "Program health monitoring", "Early warning signals"],
  },
  "innovation-agent": {
    icon: Lightbulb,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    description: "Scans best practices from top-performing centers and industry data to surface high-impact innovation opportunities — from technology adoption to curriculum redesign.",
    capabilities: ["Best practice identification", "Technology opportunity mapping", "Satisfaction UX redesign", "Network-wide replication planning"],
  },
};

const severityConfig: Record<Severity, { label: string; color: string; bg: string; icon: typeof AlertTriangle }> = {
  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: AlertTriangle },
  high: { label: "High", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", icon: AlertTriangle },
  medium: { label: "Medium", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Info },
  low: { label: "Low", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: Lightbulb },
};

function FindingCard({ finding }: { finding: Finding }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = severityConfig[finding.severity];
  const SeverityIcon = cfg.icon;

  return (
    <div className={`rounded-xl border ${cfg.bg} p-4 transition-all`}>
      <div className="flex items-start gap-3">
        <SeverityIcon size={15} className={`mt-0.5 flex-shrink-0 ${cfg.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-200">{finding.title}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800/60 ${cfg.color}`}>
                {cfg.label}
              </span>
              <button onClick={() => setExpanded(!expanded)} className="text-slate-500 hover:text-slate-300">
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">{finding.detail}</p>
          {finding.centerName && (
            <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
              <Building2 size={10} />
              {finding.centerName}
            </div>
          )}
          {expanded && (
            <div className="mt-3 pt-3 border-t border-slate-700/40">
              <div className="flex items-start gap-2">
                <Target size={13} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-emerald-400 mb-0.5">Recommendation</div>
                  <p className="text-xs text-slate-300">{finding.recommendation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentCard({ result, meta, onRun, running }: {
  result?: AgentResult;
  meta: typeof agentMeta[string];
  agentId: string;
  onRun: () => void;
  running: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const Icon = meta.icon;
  const criticalCount = result?.findings.filter((f) => f.severity === "critical").length ?? 0;
  const highCount = result?.findings.filter((f) => f.severity === "high").length ?? 0;

  return (
    <div className={`glass rounded-2xl border ${meta.border} overflow-hidden`}>
      {/* Agent header */}
      <div className={`${meta.bg} border-b ${meta.border} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center`}>
              <Icon size={20} className={meta.color} />
            </div>
            <div>
              <div className="font-semibold text-white">{result?.agentName ?? "..."}</div>
              <div className="flex items-center gap-2 mt-0.5">
                {running ? (
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <RefreshCw size={10} className="animate-spin" />
                    Running...
                  </span>
                ) : result ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400">
                    <CheckCircle size={10} />
                    Completed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock size={10} />
                    Idle
                  </span>
                )}
                {result?.lastRun && (
                  <span className="text-xs text-slate-600">
                    {new Date(result.lastRun).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <div className="flex items-center gap-1.5 text-xs">
                {criticalCount > 0 && <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md font-medium">{criticalCount} critical</span>}
                {highCount > 0 && <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-md font-medium">{highCount} high</span>}
              </div>
            )}
            <button
              onClick={onRun}
              disabled={running}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${running ? "bg-slate-700/50 text-slate-500 cursor-not-allowed" : `${meta.bg} ${meta.color} border ${meta.border} hover:opacity-80`}`}
            >
              {running ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
              {running ? "Running" : "Run Agent"}
            </button>
            <button onClick={() => setExpanded(!expanded)} className="text-slate-500 hover:text-slate-300 ml-1">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-6">
          {/* Description */}
          <p className="text-xs text-slate-400 mb-4">{meta.description}</p>

          {/* Capabilities */}
          <div className="flex flex-wrap gap-2 mb-5">
            {meta.capabilities.map((cap) => (
              <span key={cap} className="text-xs px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-400">
                {cap}
              </span>
            ))}
          </div>

          {/* Summary */}
          {result?.summary && (
            <div className="bg-slate-800/40 rounded-xl p-3 mb-5 flex items-start gap-2">
              <Zap size={14} className={`${meta.color} flex-shrink-0 mt-0.5`} />
              <p className="text-xs text-slate-300">{result.summary}</p>
            </div>
          )}

          {/* Findings */}
          {result?.findings && result.findings.length > 0 ? (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                Findings ({result.findings.length})
              </div>
              {result.findings.map((f) => (
                <FindingCard key={f.id} finding={f} />
              ))}
            </div>
          ) : !running && result ? (
            <div className="text-center py-6 text-slate-500 text-sm">No findings — all clear.</div>
          ) : !result ? (
            <div className="text-center py-6 text-slate-500 text-sm">Run the agent to see findings.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function AgentsPage() {
  const [results, setResults] = useState<AgentResult[]>([]);
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set());
  const [runningAll, setRunningAll] = useState(false);

  const runAgent = useCallback(async (agentId: string) => {
    setRunningAgents((prev) => new Set([...prev, agentId]));
    try {
      const res = await fetch("/api/agents/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      const data: AgentResult = await res.json();
      setResults((prev) => {
        const filtered = prev.filter((r) => r.agentId !== agentId);
        return [...filtered, data];
      });
    } finally {
      setRunningAgents((prev) => {
        const next = new Set(prev);
        next.delete(agentId);
        return next;
      });
    }
  }, []);

  const runAll = useCallback(async () => {
    setRunningAll(true);
    try {
      const res = await fetch("/api/agents/run");
      const data: AgentsResponse = await res.json();
      setResults(data.agents);
    } finally {
      setRunningAll(false);
    }
  }, []);

  const agentIds = ["performance-agent", "slowdown-agent", "innovation-agent"];

  const totalFindings = results.reduce((s, r) => s + r.findings.length, 0);
  const criticalTotal = results.reduce((s, r) => s + r.findings.filter((f) => f.severity === "critical").length, 0);

  return (
    <div className="p-8 min-h-screen">
      <PageHeader
        title="AI Agents"
        subtitle="Autonomous intelligence monitoring your training network"
        actions={
          <button
            onClick={runAll}
            disabled={runningAll}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${runningAll ? "bg-slate-700/50 text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:opacity-90 shadow-lg"}`}
          >
            {runningAll ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
            {runningAll ? "Running All Agents..." : "Run All Agents"}
          </button>
        }
      />

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Agents", value: "3", icon: Bot, color: "text-blue-400" },
          { label: "Total Findings", value: totalFindings || "—", icon: Activity, color: "text-amber-400" },
          { label: "Critical Issues", value: criticalTotal || "—", icon: AlertTriangle, color: "text-red-400" },
          { label: "Network Coverage", value: "100%", icon: CheckCircle, color: "text-emerald-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-xl border border-slate-700/50 p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center ${color}`}>
              <Icon size={16} />
            </div>
            <div>
              <div className={`text-lg font-bold ${color}`}>{value}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      <div className="space-y-6">
        {agentIds.map((id) => (
          <AgentCard
            key={id}
            agentId={id}
            result={results.find((r) => r.agentId === id)}
            meta={agentMeta[id]}
            onRun={() => runAgent(id)}
            running={runningAgents.has(id) || runningAll}
          />
        ))}
      </div>
    </div>
  );
}
