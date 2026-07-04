import Link from "next/link";
import { titleCase } from "@/lib/format";

/* ---- Card ---------------------------------------------------------------- */
export function Card({ children, className = "", as: As = "div" }: { children: React.ReactNode; className?: string; as?: any }) {
  return <As className={`rounded-xl bg-white shadow-card border border-navy-100/70 ${className}`}>{children}</As>;
}

export function CardHeader({ title, subtitle, action }: { title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3 border-b border-navy-100">
      <div>
        <h3 className="text-sm font-semibold text-navy-800">{title}</h3>
        {subtitle && <p className="text-xs text-navy-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---- KPI ----------------------------------------------------------------- */
export function Kpi({ label, value, delta, hint, tone = "navy" }: { label: string; value: React.ReactNode; delta?: string; hint?: string; tone?: "navy" | "teal" | "gold" | "green" | "red" }) {
  const tones: Record<string, string> = {
    navy: "text-navy-800", teal: "text-teal-600", gold: "text-gold-600", green: "text-emerald-600", red: "text-rose-600",
  };
  const up = delta?.startsWith("+");
  return (
    <Card className="p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-navy-400">{label}</p>
      <div className="mt-1 flex items-end gap-2">
        <span className={`text-2xl font-semibold tabular-nums ${tones[tone]}`}>{value}</span>
        {delta && <span className={`text-xs font-medium mb-1 ${up ? "text-emerald-600" : "text-rose-600"}`}>{delta}</span>}
      </div>
      {hint && <p className="text-[11px] text-navy-400 mt-1">{hint}</p>}
    </Card>
  );
}

/* ---- Badge --------------------------------------------------------------- */
type BadgeTone = "gray" | "green" | "red" | "amber" | "blue" | "teal" | "purple" | "gold";
const BADGE: Record<BadgeTone, string> = {
  gray: "bg-navy-100 text-navy-600",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-rose-50 text-rose-700 ring-rose-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  teal: "bg-teal-50 text-teal-600 ring-teal-500/20",
  purple: "bg-purple-50 text-purple-700 ring-purple-600/20",
  gold: "bg-gold-300/20 text-gold-600 ring-gold-500/30",
};
export function Badge({ children, tone = "gray" }: { children: React.ReactNode; tone?: BadgeTone }) {
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap ${BADGE[tone]}`}>{children}</span>;
}

/** Status → tone maps used across the platform for consistency. */
const STATUS_TONE: Record<string, BadgeTone> = {
  active: "green", approved: "green", released: "green", valid: "green", operational: "green", resolved: "green", paid: "green", eligible: "green", passed: "green", current: "green", stable: "green", sent: "green", closed: "gray",
  draft: "gray", pending: "amber", under_review: "amber", review: "amber", held: "amber", investigating: "amber", scheduled: "blue", queued: "amber", in_review: "amber", submitted: "blue", verifying: "amber", unstable: "amber", due: "amber", maintenance: "amber", deferred: "amber", acknowledged: "amber",
  suspended: "red", retired: "gray", compromised: "red", cancelled: "red", under_investigation: "red", revoked: "red", failed: "red", ineligible: "red", disconnected: "red", open: "red", overdue: "red", locked: "purple", decided: "teal", future: "gray",
};
export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? "gray"}>{titleCase(status)}</Badge>;
}

export function RiskBadge({ level }: { level: "low" | "medium" | "high" | "critical" }) {
  const tone: Record<string, BadgeTone> = { low: "green", medium: "amber", high: "red", critical: "red" };
  return <Badge tone={tone[level]}>{titleCase(level)} risk</Badge>;
}

/* ---- Table --------------------------------------------------------------- */
export function Table({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full text-sm">{children}</table></div>;
}
export function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`text-left font-medium text-navy-400 text-[11px] uppercase tracking-wide px-4 py-2.5 border-b border-navy-100 ${className}`}>{children}</th>;
}
export function Td({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 border-b border-navy-50 text-navy-700 align-middle ${className}`}>{children}</td>;
}

/* ---- Page header --------------------------------------------------------- */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-semibold text-navy-900">{title}</h1>
        {subtitle && <p className="text-sm text-navy-400 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Button({ children, variant = "primary", href, onClick, type, className = "", disabled }: { children: React.ReactNode; variant?: "primary" | "secondary" | "ghost" | "danger"; href?: string; onClick?: () => void; type?: "button" | "submit"; className?: string; disabled?: boolean }) {
  const styles: Record<string, string> = {
    primary: "bg-navy-800 text-white hover:bg-navy-700",
    secondary: "bg-white text-navy-700 ring-1 ring-inset ring-navy-200 hover:bg-navy-50",
    ghost: "text-navy-600 hover:bg-navy-100",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
  };
  const cls = `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition disabled:opacity-50 ${styles[variant]} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button type={type ?? "button"} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

/* ---- Empty / restricted -------------------------------------------------- */
export function Restricted({ message = "You do not have permission to view this content." }: { message?: string }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 text-rose-500 grid place-items-center mb-3">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-6 h-6"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
      </div>
      <p className="text-sm font-medium text-navy-800">Restricted view</p>
      <p className="text-xs text-navy-400 mt-1 max-w-sm mx-auto">{message}</p>
    </Card>
  );
}

export function InfoBanner({ children, tone = "blue" }: { children: React.ReactNode; tone?: "blue" | "amber" | "teal" | "rose" }) {
  const tones: Record<string, string> = {
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    teal: "bg-teal-50 text-teal-700 border-teal-100",
    rose: "bg-rose-50 text-rose-800 border-rose-200",
  };
  return <div className={`rounded-lg border px-4 py-2.5 text-xs ${tones[tone]}`}>{children}</div>;
}
