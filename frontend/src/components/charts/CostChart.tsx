"use client";

import React from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { CostTrendPoint } from "@/types";
import { AlertCircle } from "lucide-react";

interface CostChartProps {
  data: CostTrendPoint[];
  height?: number;
  onSelectAnomaly?: (anomalyId: string) => void;
}

export const CostChart: React.FC<CostChartProps> = ({ data, height = 320, onSelectAnomaly }) => {
  const anomalyPoints = data.filter((d) => d.has_anomaly);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const current = payload.find((p: any) => p.dataKey === "actual_cost")?.value;
    const baseline = payload.find((p: any) => p.dataKey === "baseline_cost")?.value;
    const pointData: CostTrendPoint = payload[0]?.payload;
    const changePct = pointData?.change_pct ?? (baseline ? ((current - baseline) / baseline) * 100 : 0);

    return (
      <div className="bg-[#11161D] border border-[rgba(255,255,255,0.12)] p-3 rounded-md shadow-2xl text-xs font-mono space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between text-[#8B949E] border-b border-[rgba(255,255,255,0.06)] pb-1">
          <span>Time (UTC)</span>
          <span className="text-[#F5F7FA] font-semibold">{label}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#00F0FF]">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
            Actual Cost:
          </span>
          <span className="text-[#F5F7FA] font-bold">${Number(current).toFixed(2)}/hr</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[#8B949E]">
            <span className="w-2 h-2 rounded-full bg-[#5B6574]" />
            Baseline:
          </span>
          <span className="text-[#8B949E]">${Number(baseline).toFixed(2)}/hr</span>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[rgba(255,255,255,0.06)]">
          <span className="text-[#8B949E]">Deviation:</span>
          <span className={`font-bold ${changePct > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {changePct > 0 ? `+${changePct.toFixed(1)}%` : `${changePct.toFixed(1)}%`}
          </span>
        </div>

        {pointData?.has_anomaly && (
          <div className="mt-1 pt-1 border-t border-amber-500/20 text-amber-300 flex items-center gap-1.5 text-[10px]">
            <AlertCircle className="w-3 h-3 text-amber-400" />
            <span>Anomaly Event Detected</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs font-mono text-[#8B949E]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#00F0FF]" />
            <span className="text-[#F5F7FA]">Actual Spend</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#5B6574] border-t border-dashed border-[#8B949E]" />
            <span>Historical Baseline</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Anomaly Flag</span>
          </span>
        </div>
        <div className="text-[11px] text-[#5B6574]">Hourly granularity</div>
      </div>

      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="timestamp"
              stroke="#5B6574"
              tick={{ fill: "#8B949E", fontSize: 10, fontFamily: "monospace" }}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
            />
            <YAxis
              stroke="#5B6574"
              tick={{ fill: "#8B949E", fontSize: 10, fontFamily: "monospace" }}
              tickFormatter={(v) => `$${v}`}
              axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
              tickLine={false}
              domain={["dataMin - 5", "dataMax + 10"]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Baseline Reference Line (Dashed) */}
            <Line
              type="monotone"
              dataKey="baseline_cost"
              stroke="#6B7280"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />

            {/* Actual Cost Line with Area Gradient */}
            <Area
              type="monotone"
              dataKey="actual_cost"
              stroke="#00F0FF"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#costGradient)"
              isAnimationActive={true}
            />

            {/* Anomaly markers */}
            {anomalyPoints.map((pt, idx) => (
              <ReferenceDot
                key={idx}
                x={pt.timestamp}
                y={pt.actual_cost}
                r={5}
                fill="#EF4444"
                stroke="#11161D"
                strokeWidth={2}
                className="cursor-pointer"
                onClick={() => pt.anomaly_id && onSelectAnomaly?.(pt.anomaly_id)}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
