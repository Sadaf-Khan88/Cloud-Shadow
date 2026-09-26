"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Recommendation } from "@/types";
import { RiskBadge } from "@/components/ui/Badge";
import { Sparkles, ArrowRight, Check, AlertCircle, Wrench, ShieldCheck } from "lucide-react";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onApply?: (id: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onApply,
}) => {
  const [applied, setApplied] = useState(recommendation.status === "applied");

  const handleApply = () => {
    setApplied(true);
    onApply?.(recommendation.id);
  };

  return (
    <div className="obs-card p-5 space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header badges */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1C232E] text-[#8B949E] uppercase tracking-wider">
              {recommendation.category}
            </span>
            <span className="text-xs font-mono font-bold text-[#F5F7FA]">
              {recommendation.service}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161C26] text-[#8B949E] border border-[rgba(255,255,255,0.06)]">
              {recommendation.effort}
            </span>
            <RiskBadge risk={recommendation.risk} />
          </div>
        </div>

        {/* Action Title */}
        <div>
          <h3 className="text-sm font-bold font-mono text-[#F5F7FA] leading-snug">
            {recommendation.title}
          </h3>
        </div>

        {/* Structured Spec */}
        <div className="space-y-2 text-xs font-mono">
          <div className="p-2.5 rounded bg-[#0A0D13] border border-[rgba(255,255,255,0.04)] space-y-1">
            <span className="text-[10px] text-[#5B6574] uppercase tracking-wider block">
              Prescribed Action
            </span>
            <p className="text-[#CAD1D8] font-sans text-xs leading-relaxed">
              {recommendation.action}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-[#5B6574] uppercase tracking-wider block">
              Observed Reason
            </span>
            <p className="text-[#8B949E] font-sans text-xs">{recommendation.reason}</p>
          </div>

          <div className="space-y-1 pt-1 border-t border-[rgba(255,255,255,0.04)]">
            <span className="text-[10px] text-cyan-400/80 uppercase tracking-wider block">
              Expected Effect (Non-guaranteed)
            </span>
            <p className="text-cyan-200/90 font-sans text-xs">{recommendation.expected_effect}</p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between gap-3">
        {recommendation.root_cause_id ? (
          <Link
            href={`/root-causes/${recommendation.root_cause_id}`}
            className="text-[11px] font-mono text-[#8B949E] hover:text-[#00F0FF] flex items-center gap-1 transition-colors"
          >
            <span>Linked Episode: {recommendation.root_cause_id}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <span className="text-[10px] font-mono text-[#5B6574]">General Best Practice</span>
        )}

        <button
          onClick={handleApply}
          disabled={applied}
          className={`px-3 py-1.5 rounded text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
            applied
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-default"
              : "bg-[#161C26] hover:bg-[#00F0FF]/15 text-[#F5F7FA] hover:text-[#00F0FF] border border-[rgba(255,255,255,0.1)] hover:border-[#00F0FF]/40"
          }`}
        >
          {applied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Applied / Staged</span>
            </>
          ) : (
            <>
              <Wrench className="w-3 h-3" />
              <span>Stage Remediation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
