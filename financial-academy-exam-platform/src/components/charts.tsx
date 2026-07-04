/**
 * Lightweight, dependency-free SVG charts. Deterministic and print-safe.
 * Palette follows the TFA identity (navy/teal/gold + status colours).
 */
const PALETTE = ["#0e7c86", "#1f3a5c", "#c9a24b", "#2fa3a8", "#4f719b", "#a9853a"];

export function BarChart({ data, height = 180, unit = "", color = "#0e7c86" }: { data: { label: string; value: number }[]; height?: number; unit?: string; color?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="w-full">
      <div className="flex items-end gap-3" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0">
            <span className="text-[11px] font-semibold text-navy-700 tabular-nums">{d.value}{unit}</span>
            <div className="w-full rounded-t-md transition-all" style={{ height: `${(d.value / max) * (height - 40)}px`, background: color, minHeight: 4 }} />
            <span className="text-[10px] text-navy-400 truncate w-full text-center" title={d.label}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Grouped bars (e.g. pass vs fail per certification). */
export function GroupedBar({ data, height = 200, series }: { data: { label: string; values: number[] }[]; height?: number; series: { name: string; color: string }[] }) {
  const max = Math.max(...data.flatMap((d) => d.values), 1);
  return (
    <div>
      <div className="flex items-end gap-4" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0">
            <div className="flex items-end gap-1 w-full justify-center" style={{ height: height - 24 }}>
              {d.values.map((v, i) => (
                <div key={i} className="rounded-t w-4" style={{ height: `${(v / max) * (height - 30)}px`, background: series[i].color, minHeight: 3 }} title={`${series[i].name}: ${v}`} />
              ))}
            </div>
            <span className="text-[10px] text-navy-400 truncate w-full text-center" title={d.label}>{d.label}</span>
          </div>
        ))}
      </div>
      <Legend series={series} />
    </div>
  );
}

export function Legend({ series }: { series: { name: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-4 mt-3 justify-center">
      {series.map((s) => (
        <span key={s.name} className="inline-flex items-center gap-1.5 text-[11px] text-navy-500">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }} />{s.name}
        </span>
      ))}
    </div>
  );
}

export function Donut({ data, size = 150, thickness = 22, centerLabel, centerValue }: { data: { label: string; value: number; color?: string }[]; size?: number; thickness?: number; centerLabel?: string; centerValue?: string }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * c;
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color ?? PALETTE[i % PALETTE.length]} strokeWidth={thickness} strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={-offset} />
          );
          offset += dash;
          return el;
        })}
        {centerValue && <text x="50%" y="50%" className="rotate-90" textAnchor="middle" dominantBaseline="middle" style={{ transformOrigin: "center" }} fontSize="20" fontWeight="600" fill="#0f2138">{centerValue}</text>}
      </svg>
      <div className="space-y-1.5">
        {centerLabel && <p className="text-xs font-medium text-navy-500 mb-1">{centerLabel}</p>}
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color ?? PALETTE[i % PALETTE.length] }} />
            <span className="text-navy-600">{d.label}</span>
            <span className="text-navy-400 tabular-nums ml-auto">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ data, height = 180, color = "#0e7c86", unit = "" }: { data: { label: string; value: number }[]; height?: number; color?: string; unit?: string }) {
  const w = 520;
  const max = Math.max(...data.map((d) => d.value)) * 1.1 || 1;
  const min = Math.min(...data.map((d) => d.value), 0) * 0.9;
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);
  const pts = data.map((d, i) => [i * step, height - 30 - ((d.value - min) / range) * (height - 45)]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${pts[pts.length - 1][0]},${height - 30} L0,${height - 30} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ maxHeight: height }}>
      <defs>
        <linearGradient id={`g-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g-${color})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r={2.6} fill="#fff" stroke={color} strokeWidth={1.6} />
          <text x={p[0]} y={height - 12} textAnchor="middle" fontSize="9" fill="#7f9bbd">{data[i].label}</text>
        </g>
      ))}
      <text x={pts[pts.length - 1][0] - 6} y={pts[pts.length - 1][1] - 8} textAnchor="end" fontSize="10" fontWeight="600" fill={color}>{data[data.length - 1].value}{unit}</text>
    </svg>
  );
}

/** Horizontal progress meter used for readiness / utilization / health. */
export function Meter({ value, tone = "teal", label }: { value: number; tone?: "teal" | "green" | "amber" | "red" | "navy"; label?: string }) {
  const colors: Record<string, string> = { teal: "#0e7c86", green: "#059669", amber: "#d97706", red: "#e11d48", navy: "#1f3a5c" };
  return (
    <div>
      {label && <div className="flex justify-between text-[11px] text-navy-500 mb-1"><span>{label}</span><span className="tabular-nums">{Math.round(value)}%</span></div>}
      <div className="h-2 rounded-full bg-navy-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, value)}%`, background: colors[tone] }} />
      </div>
    </div>
  );
}

export function Sparkline({ data, color = "#0e7c86", width = 90, height = 28 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const step = width / (data.length - 1);
  const path = data.map((v, i) => `${i === 0 ? "M" : "L"}${i * step},${height - ((v - min) / range) * height}`).join(" ");
  return <svg width={width} height={height} className="overflow-visible"><path d={path} fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" /></svg>;
}

export { PALETTE };
