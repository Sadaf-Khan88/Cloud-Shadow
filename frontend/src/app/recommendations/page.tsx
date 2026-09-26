"use client";

import React, { useEffect, useState } from "react";
import { Recommendation } from "@/types";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { Sparkles, ShieldCheck, Filter, Search, Info } from "lucide-react";

export default function RecommendationsPage() {
  const { refreshKey, showNotification } = useApp();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getRecommendations().then(({ data }) => {
      if (mounted) {
        setRecommendations(data);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
          ))}
        </div>
      </div>
    );
  }

  const filtered = recommendations.filter((r) => {
    const matchesCat = categoryFilter === "all" || r.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesRisk = riskFilter === "all" || r.risk.toLowerCase() === riskFilter.toLowerCase();
    return matchesCat && matchesRisk;
  });

  const lowRiskCount = recommendations.filter((r) => r.risk === "Low").length;
  const quickFixCount = recommendations.filter((r) => r.effort === "Quick Fix").length;

  const handleApply = (id: string) => {
    showNotification(`Staged remediation recipe for recommendation: ${id}. Pending approval in CD pipeline.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
        <div>
          <h2 className="text-base font-bold font-mono text-[#F5F7FA] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00F0FF]" />
            <span>Safer Cost Optimization Opportunities</span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
            Prescribed engineering remediations tailored to active root-cause episodes with safety risk ratings.
          </p>
        </div>

        <div className="text-xs font-mono text-[#8B949E]">
          Total Opportunities: <span className="text-[#00F0FF] font-bold">{recommendations.length}</span>
        </div>
      </div>

      {/* Safety Policy Notice */}
      <div className="p-3.5 rounded-lg bg-[#11161D] border border-cyan-500/20 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#00F0FF] shrink-0 mt-0.5" />
        <p className="text-xs text-[#8B949E] font-sans leading-relaxed">
          <strong className="text-[#F5F7FA]">FinOps Reliability Guarantee:</strong> We do not claim guaranteed dollar amounts. Each recommendation specifies its expected architectural effect, causal reason, and operational risk to ensure production SLOs and latency are never compromised for arbitrary cost cuts.
        </p>
      </div>

      {/* KPI Section */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Optimization Opportunities"
          value={recommendations.length}
          icon={Sparkles}
          variant="accent"
          badgeText="Active"
          subtext="Storage, DB, Network, Compute"
        />

        <MetricCard
          title="Low Operational Risk"
          value={lowRiskCount}
          icon={ShieldCheck}
          variant="success"
          subtext="Zero downtime configurations"
        />

        <MetricCard
          title="Quick Fix Effort"
          value={quickFixCount}
          icon={Sparkles}
          variant="default"
          subtext="Can be resolved in &lt; 1 sprint"
        />
      </section>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11161D] p-3 rounded-lg border border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#0D1117] border border-[rgba(255,255,255,0.08)] rounded px-2.5 py-1.5 text-xs text-[#F5F7FA] font-mono outline-none cursor-pointer"
          >
            <option value="all">Category: All</option>
            <option value="Storage">Storage</option>
            <option value="Database">Database</option>
            <option value="Architecture">Architecture</option>
            <option value="Network">Network</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[#0D1117] border border-[rgba(255,255,255,0.08)] rounded px-2.5 py-1.5 text-xs text-[#F5F7FA] font-mono outline-none cursor-pointer"
          >
            <option value="all">Risk Level: All</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
          </select>
        </div>

        <div className="text-xs font-mono text-[#8B949E]">
          Showing <span className="text-[#F5F7FA] font-semibold">{filtered.length}</span> recommendations
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onApply={handleApply}
          />
        ))}
      </section>
    </div>
  );
}
