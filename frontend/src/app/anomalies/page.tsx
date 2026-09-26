"use client";

import React, { useEffect, useState } from "react";
import { Anomaly } from "@/types";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { AnomalyTable } from "@/components/anomalies/AnomalyTable";
import { AnomalyDetailDrawer } from "@/components/anomalies/AnomalyDetailDrawer";
import { MetricCard } from "@/components/ui/MetricCard";
import { AlertTriangle, ShieldAlert, Activity, CheckCircle2 } from "lucide-react";

export default function AnomaliesPage() {
  const { refreshKey } = useApp();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getAnomalies().then(({ data }) => {
      if (mounted) {
        setAnomalies(data);
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
          ))}
        </div>
        <div className="h-96 bg-[#11161D] rounded-md border border-[rgba(255,255,255,0.06)]" />
      </div>
    );
  }

  const criticalCount = anomalies.filter((a) => a.severity === "critical").length;
  const highCount = anomalies.filter((a) => a.severity === "high").length;
  const mediumCount = anomalies.filter((a) => a.severity === "medium").length;
  const lowCount = anomalies.filter((a) => a.severity === "low").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
        <div>
          <h2 className="text-base font-bold font-mono text-[#F5F7FA] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Statistical Telemetry Anomaly Detection</span>
          </h2>
          <p className="text-xs text-[#8B949E] mt-0.5 font-sans">
            Continuous anomaly detection across microservice network, CPU, memory, and query volumes.
          </p>
        </div>

        <div className="text-xs font-mono text-[#8B949E]">
          Total Active Flags: <span className="text-[#F5F7FA] font-bold">{anomalies.length}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Critical Anomalies"
          value={criticalCount}
          icon={AlertTriangle}
          variant="critical"
          badgeText="Urgent Action"
          subtext="Storage ingress & DB queries"
        />

        <MetricCard
          title="High Severity"
          value={highCount}
          icon={AlertTriangle}
          variant="warning"
          subtext="Order API traffic & DB CPU"
        />

        <MetricCard
          title="Medium / Low"
          value={mediumCount + lowCount}
          icon={Activity}
          variant="default"
          subtext="Gateway egress & Cache evictions"
        />

        <MetricCard
          title="Avg Confidence Score"
          value={`${(
            (anomalies.reduce((acc, a) => acc + a.score, 0) / Math.max(1, anomalies.length)) *
            100
          ).toFixed(0)}%`}
          icon={CheckCircle2}
          variant="accent"
          subtext="Engine z-score model"
        />
      </section>

      {/* Main Table with search, sorting, and pagination */}
      <section>
        <AnomalyTable
          anomalies={anomalies}
          onSelectAnomaly={(anom) => setSelectedAnomaly(anom)}
        />
      </section>

      {/* Drawer for inspected anomaly */}
      <AnomalyDetailDrawer
        anomaly={selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
      />
    </div>
  );
}
