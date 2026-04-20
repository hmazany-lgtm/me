import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  color?: "blue" | "green" | "red" | "purple" | "amber";
  className?: string;
};

const colorMap = {
  blue: {
    icon: "bg-blue-500/15 text-blue-400",
    accent: "text-blue-400",
    glow: "glow-blue",
    border: "border-blue-500/20",
  },
  green: {
    icon: "bg-emerald-500/15 text-emerald-400",
    accent: "text-emerald-400",
    glow: "glow-green",
    border: "border-emerald-500/20",
  },
  red: {
    icon: "bg-red-500/15 text-red-400",
    accent: "text-red-400",
    glow: "glow-red",
    border: "border-red-500/20",
  },
  purple: {
    icon: "bg-violet-500/15 text-violet-400",
    accent: "text-violet-400",
    glow: "glow-purple",
    border: "border-violet-500/20",
  },
  amber: {
    icon: "bg-amber-500/15 text-amber-400",
    accent: "text-amber-400",
    glow: "",
    border: "border-amber-500/20",
  },
};

export default function KPICard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue", className = "" }: Props) {
  const c = colorMap[color];
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor = trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-400";

  return (
    <div className={`glass rounded-2xl p-5 border ${c.border} ${c.glow} ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={13} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <div className={`text-3xl font-bold text-white mb-1`}>{value}</div>
      <div className="text-sm font-medium text-slate-300">{title}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
    </div>
  );
}
