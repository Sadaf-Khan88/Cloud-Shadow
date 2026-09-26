import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon, Info } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  subtext?: string;
  icon?: LucideIcon;
  variant?: "default" | "warning" | "critical" | "success" | "accent";
  badgeText?: string;
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel = "vs baseline",
  subtext,
  icon: Icon,
  variant = "default",
  badgeText,
  tooltip,
}) => {
  const getTrendIcon = (c?: number) => {
    if (c === undefined) return null;
    if (c > 0) return <ArrowUpRight className="w-3.5 h-3.5 text-red-400" />;
    if (c < 0) return <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />;
    return <Minus className="w-3.5 h-3.5 text-[#8B949E]" />;
  };

  const getTrendColor = (c?: number) => {
    if (c === undefined) return "text-[#8B949E]";
    if (c > 0) return "text-red-400";
    if (c < 0) return "text-emerald-400";
    return "text-[#8B949E]";
  };

  const borderAccent = {
    default: "border-[rgba(255,255,255,0.08)]",
    warning: "border-amber-500/30",
    critical: "border-red-500/30",
    success: "border-emerald-500/30",
    accent: "border-[#00F0FF]/30",
  }[variant];

  return (
    <div
      className={`bg-[#11161D] rounded-md p-4 border ${borderAccent} flex flex-col justify-between transition-all duration-150 hover:border-[rgba(255,255,255,0.16)]`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#8B949E]">
          {title}
          {tooltip && (
            <span title={tooltip} className="cursor-help text-[#5B6574] hover:text-[#8B949E]">
              <Info className="w-3 h-3" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {badgeText && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1C232E] text-[#8B949E] border border-[rgba(255,255,255,0.06)]">
              {badgeText}
            </span>
          )}
          {Icon && (
            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#161C26] text-[#8B949E]">
              <Icon className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      </div>

      <div className="my-1">
        <div className="text-2xl font-bold font-mono tracking-tight text-[#F5F7FA]">{value}</div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono mt-2 pt-2 border-t border-[rgba(255,255,255,0.04)]">
        {change !== undefined ? (
          <div className="flex items-center gap-1">
            {getTrendIcon(change)}
            <span className={`font-semibold ${getTrendColor(change)}`}>
              {change > 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`}
            </span>
            <span className="text-[#5B6574] text-[11px]">{changeLabel}</span>
          </div>
        ) : (
          <span className="text-[#5B6574] text-[11px]">{subtext || "Monitored continuous"}</span>
        )}

        {subtext && change !== undefined && (
          <span className="text-[11px] text-[#8B949E] truncate max-w-[120px]">{subtext}</span>
        )}
      </div>
    </div>
  );
};
