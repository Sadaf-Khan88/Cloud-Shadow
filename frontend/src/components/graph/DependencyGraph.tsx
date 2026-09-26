"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DependencyGraphData, DependencyEdge, ServiceDetail } from "@/types";
import { ZoomIn, ZoomOut, RotateCcw, ArrowRight, Activity, Server, Database, Layers, X } from "lucide-react";
import { HealthBadge } from "@/components/ui/Badge";

interface DependencyGraphProps {
  data: DependencyGraphData;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({ data }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedEdge, setSelectedEdge] = useState<DependencyEdge | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Layout positions for microservice topology
  const servicePositions: Record<string, { x: number; y: number }> = {
    "api-gateway": { x: 420, y: 60 },
    "order-api": { x: 320, y: 190 },
    "recommendation-service": { x: 580, y: 190 },
    "notification-service": { x: 130, y: 220 },
    "object-storage": { x: 130, y: 380 },
    "postgres-db": { x: 380, y: 390 },
    "payment-service": { x: 570, y: 310 },
    "redis-cache": { x: 320, y: 500 },
  };

  const getService = (id: string): ServiceDetail | undefined => {
    return data.services.find((s) => s.id === id);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 1.8));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.6));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedEdge(null);
    setSelectedServiceId(null);
  };

  const selectedService = selectedServiceId ? getService(selectedServiceId) : null;

  return (
    <div className="relative w-full h-[620px] bg-[#0A0D13] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden select-none">
      {/* Background Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <pattern id="dep-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#5B6574" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dep-grid)" />
      </svg>

      {/* Toolbar Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#11161D]/90 backdrop-blur border border-[rgba(255,255,255,0.1)] rounded p-1">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 rounded hover:bg-[#1C232E] text-[#8B949E] hover:text-[#F5F7FA] transition-colors"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 rounded hover:bg-[#1C232E] text-[#8B949E] hover:text-[#F5F7FA] transition-colors"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-[1px] h-4 bg-[rgba(255,255,255,0.1)]" />
        <button
          onClick={handleReset}
          title="Reset View"
          className="p-1.5 rounded hover:bg-[#1C232E] text-[#8B949E] hover:text-[#F5F7FA] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-[#5B6574] px-1.5">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Instructions Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-[#11161D]/90 backdrop-blur border border-[rgba(255,255,255,0.08)] px-3 py-1.5 rounded text-[11px] font-mono text-[#8B949E]">
        <Activity className="w-3.5 h-3.5 text-[#00F0FF]" />
        <span>Click any node or relationship link to inspect cross-service traffic</span>
      </div>

      {/* Transformed Content */}
      <div
        className="absolute inset-0 origin-center transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* SVG Edges with Clickable Hitboxes */}
        <svg className="w-full h-full absolute inset-0" style={{ minWidth: 800, minHeight: 650 }}>
          <defs>
            <marker
              id="dep-arrow-cyan"
              markerWidth="7"
              markerHeight="5"
              refX="7"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 7 2.5, 0 5" fill="#00F0FF" />
            </marker>
            <marker
              id="dep-arrow-red"
              markerWidth="7"
              markerHeight="5"
              refX="7"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 7 2.5, 0 5" fill="#EF4444" />
            </marker>
            <marker
              id="dep-arrow-dim"
              markerWidth="7"
              markerHeight="5"
              refX="7"
              refY="2.5"
              orient="auto"
            >
              <polygon points="0 0, 7 2.5, 0 5" fill="#4B5563" />
            </marker>
          </defs>

          {data.edges.map((edge) => {
            const p1 = servicePositions[edge.source];
            const p2 = servicePositions[edge.target];
            if (!p1 || !p2) return null;

            const x1 = p1.x;
            const y1 = p1.y + 25;
            const x2 = p2.x;
            const y2 = p2.y - 25;

            const isSelected = selectedEdge?.id === edge.id;
            const isHighCost = edge.cost_impact === "high";

            const stroke = isSelected
              ? "#00F0FF"
              : isHighCost
              ? "#EF4444"
              : "#4B5563";

            const marker = isSelected
              ? "url(#dep-arrow-cyan)"
              : isHighCost
              ? "url(#dep-arrow-red)"
              : "url(#dep-arrow-dim)";

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const pathD = `M ${x1} ${y1} Q ${midX + (y2 - y1) * 0.15} ${midY}, ${x2} ${y2}`;

            return (
              <g key={edge.id} className="cursor-pointer" onClick={() => setSelectedEdge(edge)}>
                {/* Thick invisible stroke for easy clicking */}
                <path d={pathD} fill="none" stroke="transparent" strokeWidth="16" />

                {/* Visible Edge */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isSelected ? 3 : isHighCost ? 2 : 1.2}
                  strokeDasharray={isHighCost ? "4,4" : undefined}
                  markerEnd={marker}
                />

                {/* Edge Request Pill */}
                <g transform={`translate(${midX}, ${midY})`}>
                  <rect
                    x="-40"
                    y="-10"
                    width="80"
                    height="20"
                    rx="4"
                    fill="#0D1117"
                    stroke={isSelected ? "#00F0FF" : isHighCost ? "#EF4444" : "rgba(255,255,255,0.12)"}
                    strokeWidth="1"
                  />
                  <text
                    textAnchor="middle"
                    dy="3.5"
                    fill={isSelected ? "#00F0FF" : isHighCost ? "#F87171" : "#8B949E"}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {edge.request_rate > 1000
                      ? `${(edge.request_rate / 1000).toFixed(1)}k/s`
                      : `${edge.request_rate}/s`}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {data.services.map((svc) => {
          const pos = servicePositions[svc.id] || { x: 300, y: 300 };
          const isSelected = selectedServiceId === svc.id;
          const isHovered = hoveredNodeId === svc.id;

          return (
            <div
              key={svc.id}
              onClick={() => {
                setSelectedServiceId(isSelected ? null : svc.id);
                setSelectedEdge(null);
              }}
              onMouseEnter={() => setHoveredNodeId(svc.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`absolute cursor-pointer -ml-24 -mt-8 w-48 p-2.5 rounded-lg border bg-[#11161D] transition-all select-none ${
                isSelected
                  ? "ring-2 ring-[#00F0FF] border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.25)] z-20"
                  : isHovered
                  ? "border-[#00F0FF]/60 z-10"
                  : svc.health === "degraded"
                  ? "border-amber-500/40"
                  : svc.health === "critical"
                  ? "border-red-500/50"
                  : "border-[rgba(255,255,255,0.08)]"
              }`}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8B949E] mb-0.5">
                <span className="truncate max-w-[90px] uppercase tracking-wider">{svc.tier}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    svc.health === "healthy"
                      ? "bg-emerald-400"
                      : svc.health === "degraded"
                      ? "bg-amber-400"
                      : "bg-red-400"
                  }`}
                />
              </div>

              <div className="text-xs font-bold font-mono text-[#F5F7FA] truncate">{svc.id}</div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#5B6574] mt-1 pt-1 border-t border-[rgba(255,255,255,0.04)]">
                <span>${svc.cost_hourly.toFixed(1)}/h</span>
                <span className={svc.cost_change_pct > 20 ? "text-red-400 font-bold" : "text-[#8B949E]"}>
                  +{svc.cost_change_pct.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edge Details Drawer */}
      {selectedEdge && (
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#11161D]/95 backdrop-blur border border-[#00F0FF]/40 rounded-lg p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
          <div className="space-y-1 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                Dependency Relationship
              </span>
              <span className="text-[#8B949E]">|</span>
              <span className="font-bold text-[#F5F7FA]">{selectedEdge.source}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="font-bold text-[#00F0FF]">{selectedEdge.target}</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[#8B949E] pt-1">
              <span>
                Throughput: <strong className="text-[#F5F7FA]">{selectedEdge.request_rate} req/s</strong>
              </span>
              <span>
                Latency: <strong className="text-[#F5F7FA]">{selectedEdge.latency_ms} ms</strong>
              </span>
              <span>
                Errors: <strong className="text-[#F5F7FA]">{selectedEdge.error_rate}%</strong>
              </span>
              <span>
                Cost Impact:{" "}
                <strong className={selectedEdge.cost_impact === "high" ? "text-red-400" : "text-[#8B949E]"}>
                  {selectedEdge.cost_impact.toUpperCase()}
                </strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedEdge(null)}
              className="p-1.5 rounded hover:bg-[#1C232E] text-[#8B949E] hover:text-[#F5F7FA]"
            >
              <X className="w-4 h-4" />
            </button>
            <Link
              href={`/services/${selectedEdge.target}`}
              className="px-3 py-1.5 rounded bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] font-mono text-xs font-semibold border border-[#00F0FF]/30 transition-colors"
            >
              Inspect Target Diagnostics →
            </Link>
          </div>
        </div>
      )}

      {/* Service Details Drawer */}
      {selectedService && (
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#11161D]/95 backdrop-blur border border-[#00F0FF]/40 rounded-lg p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
          <div className="space-y-1 font-mono text-xs">
            <div className="flex items-center gap-2">
              <HealthBadge health={selectedService.health} />
              <h4 className="font-bold text-sm text-[#F5F7FA]">{selectedService.name}</h4>
              <span className="text-[#8B949E]">({selectedService.id})</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[#8B949E] pt-1">
              <span>Cost: <strong className="text-[#F5F7FA]">${selectedService.cost_hourly}/hr</strong></span>
              <span>Traffic: <strong className="text-[#F5F7FA]">{selectedService.requests_per_sec} req/s</strong></span>
              <span>p95 Latency: <strong className="text-[#F5F7FA]">{selectedService.latency_p95_ms} ms</strong></span>
              <span>Anomalies: <strong className="text-amber-400">{selectedService.active_anomalies_count}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedServiceId(null)}
              className="p-1.5 rounded hover:bg-[#1C232E] text-[#8B949E] hover:text-[#F5F7FA]"
            >
              <X className="w-4 h-4" />
            </button>
            <Link
              href={`/services/${selectedService.id}`}
              className="px-3 py-1.5 rounded bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] font-mono text-xs font-semibold border border-[#00F0FF]/30 transition-colors"
            >
              View Full Diagnostics →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
