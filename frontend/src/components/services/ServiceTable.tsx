"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ServiceDetail } from "@/types";
import { HealthBadge } from "@/components/ui/Badge";
import {
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Search,
  Server,
  Activity,
  AlertTriangle,
} from "lucide-react";

interface ServiceTableProps {
  services: ServiceDetail[];
}

export const ServiceTable: React.FC<ServiceTableProps> = ({ services }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof ServiceDetail>("cost_hourly");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = services
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.tier.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") valA = (valA as string).toLowerCase();
      if (typeof valB === "string") valB = (valB as string).toLowerCase();
      if (valA! < valB!) return sortAsc ? -1 : 1;
      if (valA! > valB!) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleSort = (field: keyof ServiceDetail) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-4 bg-[#11161D] p-3 rounded-lg border border-[rgba(255,255,255,0.08)]">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6574]" />
          <input
            type="text"
            placeholder="Filter services by name, ID, or architectural tier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-[rgba(255,255,255,0.08)] rounded pl-8 pr-3 py-1.5 text-xs text-[#F5F7FA] placeholder-[#5B6574] outline-none font-mono"
          />
        </div>
        <div className="text-xs font-mono text-[#8B949E]">
          Total Monitored Services:{" "}
          <span className="text-[#F5F7FA] font-bold">{services.length}</span>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#0D1117]/60 text-[#8B949E]">
              <th
                onClick={() => handleSort("name")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Service</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold">Tier</th>
              <th
                onClick={() => handleSort("health")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Health</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("cost_hourly")}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Hourly Cost</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("cost_change_pct")}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Cost Delta</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("requests_per_sec")}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Traffic</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("latency_p95_ms")}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>p95 Latency</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("error_rate_pct")}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Errors</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-center">Anomalies</th>
              <th className="py-3 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
            {filtered.map((svc) => (
              <tr
                key={svc.id}
                className="hover:bg-[#161C26] transition-colors group"
              >
                <td className="py-3.5 px-4 font-semibold">
                  <Link
                    href={`/services/${svc.id}`}
                    className="text-[#F5F7FA] group-hover:text-[#00F0FF] transition-colors flex items-center gap-1.5"
                  >
                    <span>{svc.name}</span>
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <div className="text-[10px] text-[#5B6574] font-mono">{svc.id}</div>
                </td>

                <td className="py-3.5 px-4">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1C232E] text-[#8B949E]">
                    {svc.tier}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <HealthBadge health={svc.health} />
                </td>

                <td className="py-3.5 px-4 text-right font-bold text-[#F5F7FA]">
                  ${svc.cost_hourly.toFixed(2)}/hr
                </td>

                <td className="py-3.5 px-4 text-right">
                  <span
                    className={`inline-flex items-center gap-0.5 font-bold ${
                      svc.cost_change_pct > 20
                        ? "text-red-400"
                        : svc.cost_change_pct > 0
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {svc.cost_change_pct > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {svc.cost_change_pct > 0
                      ? `+${svc.cost_change_pct.toFixed(1)}%`
                      : `${svc.cost_change_pct.toFixed(1)}%`}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right text-[#CAD1D8]">
                  {svc.requests_per_sec.toLocaleString()} req/s
                </td>

                <td className="py-3.5 px-4 text-right text-[#8B949E]">
                  {svc.latency_p95_ms.toFixed(1)} ms
                </td>

                <td className="py-3.5 px-4 text-right">
                  <span
                    className={
                      svc.error_rate_pct > 0.3
                        ? "text-red-400 font-bold"
                        : "text-[#8B949E]"
                    }
                  >
                    {svc.error_rate_pct.toFixed(2)}%
                  </span>
                </td>

                <td className="py-3.5 px-4 text-center">
                  {svc.active_anomalies_count > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>{svc.active_anomalies_count}</span>
                    </span>
                  ) : (
                    <span className="text-[#5B6574]">—</span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <Link
                    href={`/services/${svc.id}`}
                    className="px-2.5 py-1 rounded bg-[#1C232E] hover:bg-[#00F0FF]/15 text-[#8B949E] hover:text-[#00F0FF] text-[11px] border border-[rgba(255,255,255,0.08)] transition-colors"
                  >
                    Inspect
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
