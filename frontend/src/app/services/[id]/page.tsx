"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ServiceDetail, Anomaly } from "@/types";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { HealthBadge, SeverityBadge } from "@/components/ui/Badge";
import { MetricCard } from "@/components/ui/MetricCard";
import {
  Server,
  DollarSign,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Clock,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  GitFork,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function ServiceDetailPage() {
  const params = useParams();
  const serviceId = (params?.id as string) || "object-storage";
  const { refreshKey } = useApp();

  const [service, setService] = useState<ServiceDetail | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([api.getService(serviceId), api.getAnomalies({ service: serviceId })]).then(
      ([svcRes, anomRes]) => {
        if (mounted) {
          setService(svcRes.data);
          setAnomalies(anomRes.data);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
    };
  }, [serviceId, refreshKey]);

  if (loading || !service) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Back Link & Header */}
      <div className="space-y-3">
        <Link
          href="/services"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#8B949E] hover:text-[#00F0FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Services Inventory</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(255,255,255,0.08)]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-mono text-[#F5F7FA]">{service.name}</h2>
              <HealthBadge health={service.health} />
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1C232E] text-[#8B949E]">
                {service.tier} Tier
              </span>
            </div>
            <p className="text-xs text-[#8B949E] mt-1 font-sans max-w-3xl">
              {service.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dependencies"
              className="px-3 py-1.5 rounded bg-[#11161D] hover:bg-[#161C26] text-xs font-mono text-[#8B949E] hover:text-[#F5F7FA] border border-[rgba(255,255,255,0.08)] transition-colors flex items-center gap-1.5"
            >
              <GitFork className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Topology Map</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Prominent Section: "Why is this service expensive?" */}
      {service.expensive_reason && (
        <section className="bg-gradient-to-r from-red-950/20 via-[#161C26] to-[#11161D] border border-red-500/30 rounded-lg p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-red-400" />
            <span>Why is this service expensive?</span>
          </div>
          <p className="text-sm font-sans text-[#F5F7FA] leading-relaxed">
            {service.expensive_reason}
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs font-mono text-cyan-300">
            <span>Hourly Burn: <strong>${service.cost_hourly}/hr</strong></span>
            <span>·</span>
            <span>Projected Monthly: <strong>${service.cost_monthly_projected.toLocaleString()}</strong></span>
            <span>·</span>
            <span className="text-red-400 font-bold">+{service.cost_change_pct}% over historical budget</span>
          </div>
        </section>
      )}

      {/* Core Telemetry Grid (6 Metrics) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          title="Hourly Cost"
          value={`$${service.cost_hourly.toFixed(2)}`}
          change={service.cost_change_pct}
          icon={DollarSign}
          variant="critical"
        />

        <MetricCard
          title="Throughput"
          value={`${service.requests_per_sec.toLocaleString()} req/s`}
          icon={Activity}
          variant="default"
        />

        <MetricCard
          title="p95 Latency"
          value={`${service.latency_p95_ms} ms`}
          icon={Clock}
          variant={service.latency_p95_ms > 100 ? "warning" : "default"}
        />

        <MetricCard
          title="CPU Usage"
          value={service.cpu_pct > 0 ? `${service.cpu_pct}%` : "Serverless / Managed"}
          icon={Cpu}
          variant={service.cpu_pct > 60 ? "warning" : "default"}
        />

        <MetricCard
          title="Network In/Out"
          value={`${service.network_mbps} MB/s`}
          icon={Network}
          variant={service.network_mbps > 500 ? "critical" : "default"}
        />

        <MetricCard
          title="Error Rate"
          value={`${service.error_rate_pct}%`}
          icon={AlertTriangle}
          variant={service.error_rate_pct > 0.3 ? "warning" : "success"}
        />
      </section>

      {/* Metric History & Trend */}
      <section className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold font-mono text-[#F5F7FA]">
              Telemetry & Cost Burn History
            </h3>
            <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
              Correlation between request rate (req/s) and hourly cost burn ($/hr).
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart data={service.metrics_history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="timestamp" stroke="#5B6574" tick={{ fill: "#8B949E", fontSize: 10 }} />
              <YAxis yAxisId="cost" stroke="#00F0FF" tick={{ fill: "#00F0FF", fontSize: 10 }} tickFormatter={(v) => `$${v}`} />
              <YAxis yAxisId="req" orientation="right" stroke="#8B949E" tick={{ fill: "#8B949E", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#11161D", borderColor: "rgba(255,255,255,0.12)", fontSize: "11px", fontFamily: "monospace" }}
              />
              <Line yAxisId="cost" type="monotone" dataKey="cost_rate" stroke="#00F0FF" strokeWidth={2} name="Cost ($/hr)" />
              <Line yAxisId="req" type="monotone" dataKey="requests_per_sec" stroke="#F59E0B" strokeWidth={1.5} name="Requests/sec" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Upstream & Downstream Dependencies */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 space-y-3">
          <h4 className="text-xs font-bold font-mono text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
            <GitFork className="w-4 h-4 text-[#00F0FF]" />
            <span>Downstream Dependencies (Calls outgoing to)</span>
          </h4>
          {service.dependencies.length === 0 ? (
            <div className="text-xs text-[#8B949E] py-4">No downstream dependencies (leaf node).</div>
          ) : (
            <div className="space-y-2">
              {service.dependencies.map((dep) => (
                <Link
                  key={dep}
                  href={`/services/${dep}`}
                  className="flex items-center justify-between p-2.5 rounded bg-[#0D1117] hover:bg-[#161C26] border border-[rgba(255,255,255,0.06)] text-xs font-mono text-[#F5F7FA] hover:text-[#00F0FF] transition-colors"
                >
                  <span>{dep}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5B6574]" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 space-y-3">
          <h4 className="text-xs font-bold font-mono text-[#F5F7FA] uppercase tracking-wider flex items-center gap-2">
            <GitFork className="w-4 h-4 text-amber-400 rotate-180" />
            <span>Upstream Dependents (Called by)</span>
          </h4>
          {service.dependents.length === 0 ? (
            <div className="text-xs text-[#8B949E] py-4">No upstream dependents recorded.</div>
          ) : (
            <div className="space-y-2">
              {service.dependents.map((dep) => (
                <Link
                  key={dep}
                  href={`/services/${dep}`}
                  className="flex items-center justify-between p-2.5 rounded bg-[#0D1117] hover:bg-[#161C26] border border-[rgba(255,255,255,0.06)] text-xs font-mono text-[#F5F7FA] hover:text-[#00F0FF] transition-colors"
                >
                  <span>{dep}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#5B6574]" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Active Anomalies for this service */}
      {anomalies.length > 0 && (
        <section className="bg-[#11161D] border border-amber-500/20 rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-bold font-mono text-[#F5F7FA] uppercase tracking-wider">
                Active Anomalies on this Service ({anomalies.length})
              </h4>
            </div>
            <Link
              href="/anomalies"
              className="text-xs font-mono text-[#00F0FF] hover:underline"
            >
              All Anomalies →
            </Link>
          </div>

          <div className="space-y-2">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-3 rounded bg-[#0D1117] border border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={anom.severity} />
                    <span className="font-bold text-[#F5F7FA]">
                      {anom.metric_display_name || anom.metric}
                    </span>
                    <span className="text-red-400 font-bold">+{anom.change_pct}%</span>
                  </div>
                  <p className="text-[#8B949E] font-sans">{anom.description}</p>
                </div>

                {anom.root_cause_id && (
                  <Link
                    href={`/root-causes/${anom.root_cause_id}`}
                    className="shrink-0 px-2.5 py-1 rounded bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF]/25 border border-[#00F0FF]/30 transition-colors"
                  >
                    View Root Cause →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
