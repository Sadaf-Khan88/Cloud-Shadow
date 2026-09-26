"use client";

import React from "react";
import { TimelineStep } from "@/types";
import { Clock, AlertTriangle, ArrowUpRight, CheckCircle2, ChevronRight } from "lucide-react";
import { SeverityBadge } from "@/components/ui/Badge";

interface TimelineViewProps {
  steps: TimelineStep[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ steps }) => {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-[rgba(255,255,255,0.12)]">
      {steps.map((step, idx) => (
        <div key={idx} className="relative group">
          {/* Timeline node marker */}
          <div
            className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-[#0D1117] transition-all ${
              step.severity === "critical"
                ? "border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                : step.severity === "high"
                ? "border-amber-400"
                : "border-[#00F0FF]"
            }`}
          />

          <div className="bg-[#11161D] border border-[rgba(255,255,255,0.06)] group-hover:border-[rgba(255,255,255,0.14)] p-4 rounded-lg transition-colors space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#00F0FF] bg-[#161C26] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.08)]">
                  {step.time} UTC
                </span>
                <h4 className="text-xs font-bold font-mono text-[#F5F7FA]">{step.title}</h4>
              </div>

              <SeverityBadge severity={step.severity} />
            </div>

            <p className="text-xs text-[#8B949E] font-sans leading-relaxed">
              {step.description}
            </p>

            <div className="pt-2 border-t border-[rgba(255,255,255,0.04)] flex items-center gap-1.5 text-[11px] font-mono text-amber-300/90">
              <span className="text-[#5B6574]">Impact:</span>
              <span>{step.impact}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
