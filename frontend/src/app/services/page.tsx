"use client";

import React, { useEffect, useState } from "react";
import { ServiceDetail } from "@/types";
import { api } from "@/services/api";
import { useApp } from "@/context/AppContext";
import { ServiceTable } from "@/components/services/ServiceTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { Server, Activity, AlertTriangle, ShieldCheck, DollarSign } from "lucide-react";

export default function ServicesPage() {
  const { refreshKey } = useApp();
  const [services, setServices] = useState<ServiceDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api.getServices().then(({ data }) => {
      if (mounted) {
        setServices(data);
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

  const healthyCount = services.filter((s) => s.health === "healthy").length;
  const degradedCount = services.filter((s) => s.health === "degraded").length;
  const totalCost = services.reduce((acc, s) => acc + s.cost_hourly, 0);

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Monitored Services"
          value={services.length}
          icon={Server}
          variant="default"
          subtext="EKS, RDS, S3, ElastiCache"
        />

        <MetricCard
          title="Degraded Health"
          value={degradedCount}
          icon={AlertTriangle}
          variant="warning"
          badgeText="Anomalies detected"
          subtext="Storage, Postgres, Order API"
        />

        <MetricCard
          title="Healthy Services"
          value={healthyCount}
          icon={ShieldCheck}
          variant="success"
          subtext="Meeting SLO thresholds"
        />

        <MetricCard
          title="Combined Cost Rate"
          value={`$${totalCost.toFixed(2)}/hr`}
          icon={DollarSign}
          variant="critical"
          subtext="+38.4% above normal baseline"
        />
      </section>

      {/* Services Table */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-mono text-[#F5F7FA]">
            Microservices & Cloud Infrastructure Inventory
          </h2>
          <span className="text-xs font-mono text-[#8B949E]">
            Real-time telemetry & cost attribution
          </span>
        </div>

        <ServiceTable services={services} />
      </section>
    </div>
  );
}
