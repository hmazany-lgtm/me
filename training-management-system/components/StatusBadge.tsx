type Status = "excellent" | "good" | "warning" | "critical" | "active" | "completed" | "upcoming" | "paused" | "on_track" | "at_risk" | "achieved" | "missed";

const statusConfig: Record<Status, { label: string; classes: string }> = {
  excellent: { label: "Excellent", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  good: { label: "Good", classes: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  warning: { label: "Warning", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  critical: { label: "Critical", classes: "bg-red-500/15 text-red-400 border-red-500/30" },
  active: { label: "Active", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  completed: { label: "Completed", classes: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
  upcoming: { label: "Upcoming", classes: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  paused: { label: "Paused", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  on_track: { label: "On Track", classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  at_risk: { label: "At Risk", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  achieved: { label: "Achieved", classes: "bg-violet-500/15 text-violet-400 border-violet-500/30" },
  missed: { label: "Missed", classes: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status] ?? { label: status, classes: "bg-slate-500/15 text-slate-400 border-slate-500/30" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
}
