"use client";

import React from "react";

export function Badge({ children, color = "brand" }: { children: React.ReactNode; color?: "brand" | "gold" | "gray" | "green" | "red" | "amber" }) {
  const map: Record<string, string> = {
    brand: "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
    gold: "bg-gold-50 text-gold-700 ring-1 ring-gold-200",
    gray: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    red: "bg-red-50 text-red-700 ring-1 ring-red-200",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  };
  return <span className={`chip ${map[color]}`}>{children}</span>;
}

export function ScoreRing({ value, size = 96, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const color = value >= 70 ? "#1f9878" : value >= 45 ? "#c6902a" : "#dc2626";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e6f2ee" strokeWidth={8} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={8} fill="none"
          strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold text-ink">{value}</span>
        {label && <span className="text-[10px] font-semibold text-ink-soft">{label}</span>}
      </div>
    </div>
  );
}

export function Meter({ value, color = "#1f9878" }: { value: number; color?: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-50">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  );
}

export function StatCard({ label, value, hint, accent = "brand" }: { label: string; value: React.ReactNode; hint?: string; accent?: "brand" | "gold" }) {
  return (
    <div className="card card-pad">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-soft">{label}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${accent === "gold" ? "bg-gold-400" : "bg-brand-400"}`} />
      </div>
      <p className="mt-2 text-3xl font-extrabold text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="card card-pad flex flex-col items-center gap-3 py-14 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-2xl">🗂️</div>
      <p className="text-sm text-ink-soft">{text}</p>
      {action}
    </div>
  );
}

export function CopyButton({ text, labelCopy, labelCopied }: { text: string; labelCopy: string; labelCopied: string }) {
  const [done, setDone] = React.useState(false);
  return (
    <button
      className="btn-ghost text-xs"
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* ignore */ }
      }}
    >
      {done ? "✓ " + labelCopied : "⧉ " + labelCopy}
    </button>
  );
}

export function Select({ value, onChange, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className="input" value={value} onChange={onChange} {...props}>
      {children}
    </select>
  );
}
