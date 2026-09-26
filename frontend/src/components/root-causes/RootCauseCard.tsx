"use client";

import React from "react";
import Link from "next/link";
import { RootCause } from "@/types";
import { ImpactBadge } from "@/components/ui/Badge";
import { ArrowRight, Calendar, GitFork, CheckCircle2, ShieldAlert } from "lucide-react";

interface RootCauseCardProps {
  rootCause: RootCause;
}

export const RootCauseCard: React.FC<RootCauseCardProps> = ({ rootCause }) => {
  return (
    <div className="obs-card p-5 space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Top Badges & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1C232E] text-[#8B949E] border border-[rgba(255,255,255,0.06)]">
              {rootCause.id}
            </span>
            <ImpactBadge impact={rootCause.cost_impact} />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#5B6574]">Confidence</span>
            <span className="text-sm font-bold font-mono text-[#00F0FF]">
              {Math.round(rootCause.evidence_score * 100)}%
            </span>
          </div>
        </div>

        {/* Title & Service */}
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#8B949E]">
            {rootCause.service} · {rootCause.metric}
          </div>
          <h3 className="text-base font-bold font-mono text-[#F5F7FA] mt-0.5">
            {rootCause.title}
          </h3>
          <p className="text-xs text-[#8B949E] mt-1.5 line-clamp-2 font-sans">
            {rootCause.summary}
          </p>
        </div>

        {/* Evidence Highlights */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#5B6574]">
            Key Corroborating Evidence:
          </div>
          <ul className="space-y-1 text-xs font-mono text-[#CAD1D8]">
            {rootCause.evidence.slice(0, 2).map((ev, idx) => (
              <li key={idx} className="flex items-start gap-1.5 line-clamp-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF] shrink-0 mt-0.5" />
                <span className="truncate">{ev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Footer Info & CTA */}
      <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] font-mono text-[#8B949E]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#5B6574]" />
            {rootCause.timestamp.slice(0, 10)}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-3 h-3 text-[#5B6574]" />
            {rootCause.causal_graph.nodes.length} nodes
          </span>
        </div>

        <Link
          href={`/root-causes/${rootCause.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161C26] hover:bg-[#00F0FF]/15 text-xs font-mono font-medium text-[#00F0FF] border border-[#00F0FF]/30 transition-colors"
        >
          <span>Investigate</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
