"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RootCause } from "@/types";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { RootCauseCard } from "@/components/root-causes/RootCauseCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { Search, ShieldAlert, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

export default function RootCausesPage() {
  const { refreshKey } = useApp();
  const [rootCauses, setRootCauses] = useState<RootCause[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getRootCauses().then(({ data }) => {
      if (mounted) {
        setRootCauses(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
          <div className="h-64 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
        <div>
          <h2 className="text-base font-bold font-mono text-[#F5F7FA] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#00F0FF]" />
            <span>Root Cause Investigation Episodes</span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
            Synthesized causal graphs linking cross-service anomalies with deployments, traffic bursts, and billing spikes.
          </p>
        </div>

        <div className="text-xs font-mono text-[#8B949E]">
          Active Episodes: <span className="text-[#00F0FF] font-bold">{rootCauses.length}</span>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Active Root Cause Episodes"
          value={rootCauses.length}
          icon={ShieldAlert}
          variant="critical"
          badgeText="Correlated"
          subtext="1 Primary Ingestion · 1 Cache Eviction"
        />

        <MetricCard
          title="Primary Episode Confidence"
          value={`${Math.round(rootCauses[0]?.evidence_score * 100 || 90)}%`}
          icon={Search}
          variant="accent"
          subtext="Strong multi-tier evidence correlation"
        />

        <MetricCard
          title="Unexplained Cost Attributed"
          value="94.2%"
          icon={Sparkles}
          variant="success"
          subtext="Accounted for by active episodes"
        />
      </section>

      {/* Root Cause Episodes Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#8B949E]">
            Corroborated Incident Episodes
          </h3>
          <span className="text-[11px] font-mono text-[#5B6574]">
            Select an episode to launch deep causal investigation
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {rootCauses.map((rc) => (
            <RootCauseCard key={rc.id} rootCause={rc} />
          ))}
        </div>
      </section>
    </div>
  );
}
