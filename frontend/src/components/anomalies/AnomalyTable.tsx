"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Anomaly } from "@/types";
import { SeverityBadge } from "@/components/ui/Badge";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

interface AnomalyTableProps {
  anomalies: Anomaly[];
  onSelectAnomaly?: (anomaly: Anomaly) => void;
}

export const AnomalyTable: React.FC<AnomalyTableProps> = ({ anomalies, onSelectAnomaly }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [sortField, setSortField] = useState<keyof Anomaly>("timestamp");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Unique services list
  const uniqueServices = useMemo(() => {
    return Array.from(new Set(anomalies.map((a) => a.service))).sort();
  }, [anomalies]);

  // Filtered & Sorted Anomalies
  const filtered = useMemo(() => {
    return anomalies
      .filter((a) => {
        const matchesSearch =
          searchTerm === "" ||
          a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesSeverity = severityFilter === "all" || a.severity === severityFilter;
        const matchesService = serviceFilter === "all" || a.service === serviceFilter;

        return matchesSearch && matchesSeverity && matchesService;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === "string") valA = (valA as string).toLowerCase();
        if (typeof valB === "string") valB = (valB as string).toLowerCase();

        if (valA! < valB!) return sortAsc ? -1 : 1;
        if (valA! > valB!) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [anomalies, searchTerm, severityFilter, serviceFilter, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (field: keyof Anomaly) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#11161D] p-3 rounded-lg border border-[rgba(255,255,255,0.08)]">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6574]" />
            <input
              type="text"
              placeholder="Search anomalies by ID, service, metric..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0D1117] border border-[rgba(255,255,255,0.08)] rounded pl-8 pr-3 py-1.5 text-xs text-[#F5F7FA] placeholder-[#5B6574] outline-none focus:border-[#00F0FF]/50 font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B6574] hover:text-[#F5F7FA]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0D1117] border border-[rgba(255,255,255,0.08)] rounded px-2.5 py-1.5 text-xs text-[#F5F7FA] font-mono outline-none cursor-pointer"
          >
            <option value="all">Severity: All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Service Dropdown */}
          <select
            value={serviceFilter}
            onChange={(e) => {
              setServiceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0D1117] border border-[rgba(255,255,255,0.08)] rounded px-2.5 py-1.5 text-xs text-[#F5F7FA] font-mono outline-none cursor-pointer"
          >
            <option value="all">Service: All</option>
            {uniqueServices.map((svc) => (
              <option key={svc} value={svc}>
                {svc}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs font-mono text-[#8B949E]">
          Showing <span className="text-[#F5F7FA] font-semibold">{filtered.length}</span> anomaly events
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.08)] bg-[#0D1117]/60 text-[#8B949E]">
              <th
                onClick={() => handleSort("severity")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Severity</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("service")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Service</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("metric")}
                className="py-3 px-4 font-semibold cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Metric</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th className="py-3 px-4 font-semibold text-right">Baseline</th>
              <th className="py-3 px-4 font-semibold text-right">Current</th>
              <th
                onClick={() => handleSort("change_pct")}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Change</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("score")}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Score</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th
                onClick={() => handleSort("timestamp")}
                className="py-3 px-4 font-semibold text-right cursor-pointer hover:text-[#F5F7FA] select-none"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Timestamp</span>
                  <ArrowUpDown className="w-3 h-3 text-[#5B6574]" />
                </div>
              </th>
              <th className="py-3 px-4 text-center font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[#8B949E]">
                  No anomalies match the selected filters.
                </td>
              </tr>
            ) : (
              paginated.map((anomaly) => (
                <tr
                  key={anomaly.id}
                  onClick={() => onSelectAnomaly?.(anomaly)}
                  className="hover:bg-[#161C26] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4">
                    <SeverityBadge severity={anomaly.severity} />
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#F5F7FA] group-hover:text-[#00F0FF] transition-colors">
                    {anomaly.service}
                  </td>
                  <td className="py-3 px-4 text-[#CAD1D8]">
                    {anomaly.metric_display_name || anomaly.metric}
                  </td>
                  <td className="py-3 px-4 text-right text-[#8B949E]">
                    {anomaly.baseline.toLocaleString()} {anomaly.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#F5F7FA]">
                    {anomaly.current.toLocaleString()} {anomaly.unit}
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        anomaly.change_pct > 0 ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {anomaly.change_pct > 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      {anomaly.change_pct > 0 ? `+${anomaly.change_pct}%` : `${anomaly.change_pct}%`}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-[#00F0FF] font-semibold">
                    {(anomaly.score * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-4 text-right text-[#8B949E]">
                    {anomaly.timestamp.slice(11, 19)} UTC
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAnomaly?.(anomaly);
                      }}
                      className="px-2 py-1 rounded bg-[#1C232E] hover:bg-[#00F0FF]/15 text-[#8B949E] hover:text-[#00F0FF] text-[11px] border border-[rgba(255,255,255,0.08)] transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[rgba(255,255,255,0.08)] bg-[#0D1117]/60 text-xs font-mono text-[#8B949E]">
          <div>
            Page <span className="text-[#F5F7FA] font-bold">{currentPage}</span> of{" "}
            <span className="text-[#F5F7FA] font-bold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded bg-[#161C26] hover:bg-[#1E2530] text-[#8B949E] hover:text-[#F5F7FA] border border-[rgba(255,255,255,0.08)] disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded bg-[#161C26] hover:bg-[#1E2530] text-[#8B949E] hover:text-[#F5F7FA] border border-[rgba(255,255,255,0.08)] disabled:opacity-40 transition-colors flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
