"use client";

import React, { useEffect, useState } from "react";
import { DependencyGraphData } from "@/types";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { DependencyGraph } from "@/components/graph/DependencyGraph";
import { GitFork, Activity, ShieldCheck, ArrowRight, Server } from "lucide-react";

export default function DependenciesPage() {
  const { refreshKey } = useApp();
  const [data, setData] = useState<DependencyGraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getDependencies().then(({ data }) => {
      if (mounted) {
        setData(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [refreshKey]);

  if (loading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
        <div className="h-[600px] bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
      </div>
    );
  }

  const highImpactEdges = data.edges.filter((e) => e.cost_impact === "high");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
        <div>
          <h2 className="text-base font-bold font-mono text-[#F5F7FA] flex items-center gap-2">
            <GitFork className="w-4 h-4 text-[#00F0FF]" />
            <span>Distributed Microservices Dependency Graph</span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
            Real-time topology mapping cross-service calls, network throughput, latencies, and downstream cost propagation paths.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-[#8B949E]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>High Cost Impact Link ({highImpactEdges.length})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Healthy Telemetry</span>
          </span>
        </div>
      </div>

      {/* Interactive Topology Graph */}
      <section>
        <DependencyGraph data={data} />
      </section>

      {/* Relationships Table */}
      <section className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold font-mono text-[#F5F7FA] uppercase tracking-wider">
            Active Cross-Service Call Contracts ({data.edges.length})
          </h3>
          <span className="text-[11px] font-mono text-[#5B6574]">
            Ranked by network throughput
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] text-[#8B949E] bg-[#0D1117]/50">
                <th className="py-2.5 px-4 font-semibold">Source Caller</th>
                <th className="py-2.5 px-4 font-semibold">Target Service</th>
                <th className="py-2.5 px-4 font-semibold text-right">Throughput</th>
                <th className="py-2.5 px-4 font-semibold text-right">p95 Latency</th>
                <th className="py-2.5 px-4 font-semibold text-right">Error Rate</th>
                <th className="py-2.5 px-4 font-semibold text-right">Cost Impact</th>
                <th className="py-2.5 px-4 font-semibold text-right">Traffic Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {data.edges.map((edge) => (
                <tr key={edge.id} className="hover:bg-[#161C26] transition-colors">
                  <td className="py-2.5 px-4 font-semibold text-[#F5F7FA]">{edge.source}</td>
                  <td className="py-2.5 px-4 font-semibold text-[#00F0FF]">{edge.target}</td>
                  <td className="py-2.5 px-4 text-right text-[#CAD1D8]">
                    {edge.request_rate.toLocaleString()} req/s
                  </td>
                  <td className="py-2.5 px-4 text-right text-[#8B949E]">{edge.latency_ms} ms</td>
                  <td className="py-2.5 px-4 text-right text-[#8B949E]">{edge.error_rate}%</td>
                  <td className="py-2.5 px-4 text-right font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        edge.cost_impact === "high"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : edge.cost_impact === "medium"
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          : "bg-[#1E2530] text-[#8B949E]"
                      }`}
                    >
                      {edge.cost_impact.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-red-400">
                    +{edge.change_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
