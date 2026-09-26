"use client";

import React from "react";
import Link from "next/link";
import { RootCause } from "@/types";
import { AlertTriangle, ArrowRight, CheckCircle2, ShieldAlert, Cpu, Network, Database } from "lucide-react";
import { Badge, ImpactBadge } from "@/components/ui/Badge";

interface RootCauseHeroProps {
  rootCause: RootCause;
}

export const RootCauseHero: React.FC<RootCauseHeroProps> = ({ rootCause }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#11161D] via-[#141B24] to-[#11161D] border border-cyan-500/30 rounded-lg p-6 shadow-xl">
      {/* Decorative accent light bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent opacity-80" />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Summary & Headline */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-cyan-500/15 text-[#00F0FF] border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
              ROOT CAUSE DETECTED
            </span>
            <ImpactBadge impact={rootCause.cost_impact} />
            <span className="text-xs font-mono text-[#8B949E]">Episode ID: {rootCause.id}</span>
          </div>

          <div>
            <h2 className="text-xl lg:text-2xl font-bold font-mono tracking-tight text-[#F5F7FA]">
              {rootCause.service.toUpperCase()} — {rootCause.metric}
            </h2>
            <p className="text-xs text-[#8B949E] mt-1 max-w-3xl leading-relaxed">
              {rootCause.summary}
            </p>
          </div>

          {/* Evidence Checklist */}
          <div className="pt-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#5B6574] mb-1.5">
              Correlated Evidence:
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-[#CAD1D8]">
              {rootCause.evidence.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Evidence Score Card & Action */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 bg-[#0A0D13]/80 border border-[rgba(255,255,255,0.08)] p-5 rounded-lg shrink-0 min-w-[240px] text-center">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#8B949E]">
              Evidence Score
            </div>
            <div className="text-3xl font-bold font-mono text-[#00F0FF] mt-0.5">
              {Math.round(rootCause.evidence_score * 100)}%
            </div>
            <div className="text-[10px] text-[#5B6574] font-mono mt-0.5">
              Statistical Evidence Confidence
            </div>
          </div>

          <Link
            href={`/root-causes/${rootCause.id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-[#00F0FF] hover:bg-[#38BDF8] text-[#080A0F] font-mono font-bold text-xs transition-colors shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            <span>View Root Cause</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
