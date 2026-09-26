"use client";

import React from "react";
import Link from "next/link";
import { Anomaly } from "@/types";
import { SeverityBadge } from "@/components/ui/Badge";
import { X, ArrowRight, Activity, Calendar, ShieldAlert, Cpu, ArrowUpRight } from "lucide-react";

interface AnomalyDetailDrawerProps {
  anomaly: Anomaly | null;
  onClose: () => void;
}

export const AnomalyDetailDrawer: React.FC<AnomalyDetailDrawerProps> = ({ anomaly, onClose }) => {
  if (!anomaly) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#0D1117] border-l border-[rgba(255,255,255,0.12)] h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={anomaly.severity} />
              <span className="text-xs font-mono text-[#8B949E]">{anomaly.id}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#1E2530] text-[#8B949E] hover:text-[#F5F7FA] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Anomaly Title */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#8B949E]">
              {anomaly.service}
            </div>
            <h3 className="text-lg font-bold font-mono text-[#F5F7FA] mt-0.5">
              {anomaly.metric_display_name || anomaly.metric}
            </h3>
            <p className="text-xs text-[#8B949E] mt-2 leading-relaxed font-sans">
              {anomaly.description}
            </p>
          </div>

          {/* Metric Comparison Card */}
          <div className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-4 space-y-3 font-mono">
            <div className="text-xs text-[#8B949E] uppercase tracking-wider">
              Telemetry Deviation Breakdown
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-2.5 rounded bg-[#0A0D13] border border-[rgba(255,255,255,0.04)]">
                <div className="text-[10px] text-[#5B6574]">Historical Baseline</div>
                <div className="text-base font-bold text-[#8B949E]">
                  {anomaly.baseline.toLocaleString()} {anomaly.unit}
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#0A0D13] border border-red-500/20">
                <div className="text-[10px] text-red-400">Current Observed</div>
                <div className="text-base font-bold text-[#F5F7FA]">
                  {anomaly.current.toLocaleString()} {anomaly.unit}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)] text-xs">
              <span className="text-[#8B949E]">Percentage Delta:</span>
              <span className="font-bold text-red-400 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{anomaly.change_pct}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8B949E]">Anomaly Confidence Score:</span>
              <span className="font-bold text-[#00F0FF]">{(anomaly.score * 100).toFixed(0)}%</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8B949E]">Detected Timestamp:</span>
              <span className="text-[#CAD1D8]">{anomaly.timestamp}</span>
            </div>
          </div>

          {/* Root Cause Linkage */}
          {anomaly.root_cause_id && (
            <div className="bg-cyan-950/20 border border-cyan-500/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#00F0FF]">
                <ShieldAlert className="w-4 h-4" />
                <span>Linked to Root Cause Episode</span>
              </div>
              <p className="text-xs text-[#8B949E] font-sans">
                This anomaly has been attributed to causal episode{" "}
                <span className="font-mono text-[#F5F7FA]">{anomaly.root_cause_id}</span>.
              </p>
              <Link
                href={`/root-causes/${anomaly.root_cause_id}`}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#00F0FF] hover:underline"
              >
                <span>Open Root Cause Investigation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] flex items-center gap-3">
          <Link
            href={`/services/${anomaly.service}`}
            className="flex-1 py-2 px-3 rounded bg-[#161C26] hover:bg-[#1E2530] text-center text-xs font-mono text-[#F5F7FA] border border-[rgba(255,255,255,0.08)] transition-colors"
          >
            Service Diagnostics
          </Link>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded bg-[#11161D] hover:bg-[#1E2530] text-xs font-mono text-[#8B949E] hover:text-[#F5F7FA] border border-[rgba(255,255,255,0.08)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
