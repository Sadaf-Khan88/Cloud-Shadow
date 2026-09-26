"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RootCause, Recommendation } from "@/types";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { ImpactBadge } from "@/components/ui/Badge";
import { CausalGraph } from "@/components/graph/CausalGraph";
import { TimelineView } from "@/components/root-causes/TimelineView";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  GitFork,
  DollarSign,
  AlertTriangle,
  History,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export default function RootCauseDetailPage() {
  const params = useParams();
  const rootCauseId = (params?.id as string) || "rc-001";
  const { refreshKey } = useApp();

  const [rootCause, setRootCause] = useState<RootCause | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([api.getRootCause(rootCauseId), api.getRecommendations()]).then(
      ([rcRes, recRes]) => {
        if (mounted) {
          setRootCause(rcRes.data);
          const recs = recRes.data.filter(
            (r) => r.root_cause_id === rootCauseId || rcRes.data?.recommendation_ids?.includes(r.id)
          );
          setRecommendations(recs);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
    };
  }, [rootCauseId, refreshKey]);

  if (loading || !rootCause) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
        <div className="h-64 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Link & Header */}
      <div className="space-y-3">
        <Link
          href="/root-causes"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8B949E] hover:text-[#00F0FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Root Cause Episodes</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[rgba(255,255,255,0.08)]">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1C232E] text-[#8B949E] border border-[rgba(255,255,255,0.06)]">
                {rootCause.id}
              </span>
              <ImpactBadge impact={rootCause.cost_impact} />
              <span className="text-xs font-mono text-[#8B949E] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#5B6574]" />
                {rootCause.timestamp}
              </span>
            </div>

            <h1 className="text-2xl font-bold font-mono text-[#F5F7FA] tracking-tight">
              {rootCause.title}
            </h1>

            <div className="flex items-center gap-3 text-xs font-mono text-[#8B949E]">
              <span>
                Originating Service: <strong className="text-[#00F0FF]">{rootCause.service}</strong>
              </span>
              <span>·</span>
              <span>
                Trigger Metric: <strong className="text-[#CAD1D8]">{rootCause.metric}</strong>
              </span>
            </div>
          </div>

          {/* Evidence Score Indicator Box */}
          <div className="bg-[#11161D] border border-cyan-500/30 p-4 rounded-lg text-center shrink-0 min-w-[200px]">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#8B949E]">
              Evidence Score
            </div>
            <div className="text-3xl font-bold font-mono text-[#00F0FF] mt-0.5">
              {Math.round(rootCause.evidence_score * 100)}%
            </div>
            <div className="text-[10px] text-[#5B6574] font-mono mt-1">
              Statistical Evidence Confidence
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: What Changed? */}
      <section className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 space-y-3">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#00F0FF] flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#00F0FF]" />
          <span>What Changed? (Incident Diagnosis)</span>
        </h3>
        <p className="text-sm font-sans text-[#F5F7FA] leading-relaxed">
          {rootCause.what_changed}
        </p>
      </section>

      {/* Section 2: Corroborating Evidence */}
      <section className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 space-y-3">
        <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
          <span>Corroborating Telemetry & Attribution Evidence</span>
        </h3>
        <ul className="space-y-2 pt-1 text-xs font-mono text-[#CAD1D8]">
          {rootCause.evidence.map((ev, idx) => (
            <li key={idx} className="flex items-start gap-2.5 p-2 rounded bg-[#0D1117] border border-[rgba(255,255,255,0.04)]">
              <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
              <span className="leading-relaxed">{ev}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Section 3: Dependency Chain Interactive Graph */}
      <section className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 space-y-4">
        <div>
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
            <GitFork className="w-4 h-4 text-[#00F0FF]" />
            <span>Causal Dependency Chain</span>
          </h3>
          <p className="text-xs text-[#8B949E] mt-1 font-sans">
            Interactive causal path showing the propagation from the root trigger through intermediate services to the final cloud bill increase.
          </p>
        </div>

        <CausalGraph
          nodes={rootCause.causal_graph.nodes}
          edges={rootCause.causal_graph.edges}
        />
      </section>

      {/* Section 4 & 5: Timeline & Related Events (Side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline of Incident (7 cols) */}
        <section className="lg:col-span-7 bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 space-y-4">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
            <History className="w-4 h-4 text-[#00F0FF]" />
            <span>Chronological Incident Timeline</span>
          </h3>
          <TimelineView steps={rootCause.timeline} />
        </section>

        {/* Related Events & Cost Impact (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Related Events */}
          <section className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-6 space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#F5F7FA] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Correlated Infrastructure Events</span>
            </h3>

            <div className="space-y-2.5">
              {rootCause.related_events.map((evt, idx) => (
                <div key={idx} className="p-3 rounded bg-[#0D1117] border border-[rgba(255,255,255,0.04)] space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#00F0FF] font-bold">{evt.time}</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-[#161C26] text-[#8B949E]">
                      {evt.type}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold font-mono text-[#F5F7FA]">{evt.title}</h5>
                  <p className="text-[11px] text-[#8B949E] font-sans">{evt.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Cost Impact Breakdown */}
          <section className="bg-[#11161D] border border-red-500/20 rounded-lg p-6 space-y-3 font-mono">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-400" />
              <span>Cost Impact Attribution</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#0D1117]">
                <span className="text-[#8B949E]">Baseline Cost Rate:</span>
                <span className="text-[#F5F7FA] font-bold">$52.00 / hour</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#0D1117]">
                <span className="text-[#8B949E]">Peak Observed Rate:</span>
                <span className="text-red-400 font-bold">$71.90 / hour</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-red-950/20 border border-red-500/20">
                <span className="text-red-300">Net Episode Deviation:</span>
                <span className="text-red-400 font-bold">+$1,340.50 / day</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Section 6: Actionable Recommendations */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-[#00F0FF] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00F0FF]" />
            <span>Targeted Remediations for this Episode</span>
          </h3>
          <span className="text-xs font-mono text-[#8B949E]">
            {recommendations.length} recommended action(s)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} recommendation={rec} />
          ))}
        </div>
      </section>
    </div>
  );
}
