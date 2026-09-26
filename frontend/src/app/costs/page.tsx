"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CostsData } from "@/types";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { MetricCard } from "@/components/ui/MetricCard";
import { CostChart } from "@/components/charts/CostChart";
import { ServiceBreakdownChart } from "@/components/charts/ServiceBreakdownChart";
import {
  DollarSign,
  TrendingUp,
  Server,
  Database,
  Layers,
  Globe,
  Info,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function CostsPage() {
  const { refreshKey, timeRange } = useApp();
  const [costs, setCosts] = useState<CostsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getCosts().then(({ data }) => {
      if (mounted) {
        setCosts(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [refreshKey, timeRange]);

  if (loading || !costs) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
          ))}
        </div>
        <div className="h-80 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
      </div>
    );
  }

  const { summary, hourly_trend, service_breakdown, resource_breakdown, region_breakdown } = costs;

  return (
    <div className="space-y-6">
      {/* Header & Architectural Distinction Notice */}
      <div className="p-4 rounded-lg bg-[#11161D] border border-blue-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-blue-500/10 text-cyan-400 mt-0.5 shrink-0">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold text-[#F5F7FA] uppercase tracking-wider">
              FinOps Principle: Cost Attribution vs. Root Causality
            </h3>
            <p className="text-xs text-[#8B949E] mt-0.5 font-sans leading-relaxed">
              <strong className="text-[#F5F7FA]">Cost Contribution</strong> shows where cloud dollars are being billed.{" "}
              <strong className="text-[#00F0FF]">Root Cause</strong> shows the upstream trigger or behavior that induced that spending.
              High-spend services (like storage or databases) are frequently victims of upstream application behavior.
            </p>
          </div>
        </div>

        <Link
          href="/root-causes"
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] text-xs font-mono font-medium border border-[#00F0FF]/30 transition-colors"
        >
          <span>Examine Root Causes</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* KPI Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <MetricCard
          title="Total Cost"
          value={`$${summary.total_spend.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          change={summary.cost_change_pct}
          changeLabel="vs baseline"
          icon={DollarSign}
          variant="critical"
          subtext={`Rolling ${timeRange}`}
        />

        <MetricCard
          title="Hourly Cost Rate"
          value={`$${summary.hourly_spend.toFixed(2)}/hr`}
          change={summary.cost_change_pct}
          changeLabel="rate delta"
          icon={TrendingUp}
          variant="critical"
          subtext="Peak: $84.60/hr at 10:00"
        />

        <MetricCard
          title="Baseline Cost"
          value={`$${summary.baseline_spend.toFixed(2)}`}
          icon={Layers}
          variant="default"
          subtext="30-day historical mean"
        />

        <MetricCard
          title="Dollar Delta"
          value={`+$${summary.cost_change.toFixed(2)}`}
          change={summary.cost_change_pct}
          icon={DollarSign}
          variant="critical"
          subtext="Unexplained surge"
        />

        <MetricCard
          title="Change Percentage"
          value={`+${summary.cost_change_pct}%`}
          icon={TrendingUp}
          variant="critical"
          subtext="Requires FinOps remediation"
        />
      </section>

      {/* Main Cost Trend Chart */}
      <section className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono text-[#F5F7FA]">
              24-Hour Expenditure Trajectory
            </h3>
            <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
              Continuous actual billing rate ($/hr) compared with trained seasonal baseline.
            </p>
          </div>
        </div>

        <CostChart data={hourly_trend} height={340} />
      </section>

      {/* Breakdowns Grid: By Service, By Resource, By Region */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Contribution Breakdown */}
        <div className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#00F0FF]" />
            <h4 className="text-xs font-bold font-mono text-[#F5F7FA] uppercase tracking-wider">
              Contribution By Service
            </h4>
          </div>
          <ServiceBreakdownChart services={service_breakdown} />
        </div>

        {/* Resource Contribution Breakdown */}
        <div className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#00F0FF]" />
            <h4 className="text-xs font-bold font-mono text-[#F5F7FA] uppercase tracking-wider">
              Contribution By Resource
            </h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#5B6574] pb-1 border-b border-[rgba(255,255,255,0.06)]">
              <span>Resource Component</span>
              <div className="flex items-center gap-4">
                <span>Cost</span>
                <span className="w-10 text-right">Share</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {resource_breakdown.map((res) => (
                <div key={res.resource} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-[#F5F7FA] truncate max-w-[160px]" title={res.resource}>
                      {res.resource}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#8B949E]">${res.cost.toFixed(1)}</span>
                      <span className="w-10 text-right font-bold text-[#F5F7FA]">
                        {res.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[#1C232E] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        res.category === "Storage"
                          ? "bg-[#00F0FF]"
                          : res.category === "Database"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                      }`}
                      style={{ width: `${res.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Region Contribution Breakdown */}
        <div className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00F0FF]" />
            <h4 className="text-xs font-bold font-mono text-[#F5F7FA] uppercase tracking-wider">
              Contribution By Cloud Region
            </h4>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#5B6574] pb-1 border-b border-[rgba(255,255,255,0.06)]">
              <span>AWS Region</span>
              <div className="flex items-center gap-4">
                <span>Cost</span>
                <span className="w-10 text-right">Share</span>
              </div>
            </div>

            <div className="space-y-3">
              {region_breakdown.map((reg) => (
                <div key={reg.region} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-medium text-[#F5F7FA] truncate max-w-[160px]">
                      {reg.region}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#8B949E]">${reg.cost.toFixed(1)}</span>
                      <span className="w-10 text-right font-bold text-[#F5F7FA]">
                        {reg.percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-[#1C232E] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${reg.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
