"use client";

import React, { useState, useRef, useEffect } from "react";
import { CausalNode, CausalEdge } from "@/types";
import { ZoomIn, ZoomOut, RotateCcw, AlertCircle, ArrowUpRight, CheckCircle2, Info } from "lucide-react";

interface CausalGraphProps {
  nodes: CausalNode[];
  edges: CausalEdge[];
  onSelectNode?: (node: CausalNode | null) => void;
  selectedNodeId?: string | null;
  interactive?: boolean;
}

export const CausalGraph: React.FC<CausalGraphProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId: propSelectedNodeId,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(propSelectedNodeId || null);

  useEffect(() => {
    if (propSelectedNodeId !== undefined) {
      setSelectedNodeId(propSelectedNodeId);
    }
  }, [propSelectedNodeId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    // Don't drag if clicking inside node
    if ((e.target as HTMLElement).closest(".graph-node")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.0));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNodeId(null);
    onSelectNode?.(null);
  };

  const handleNodeClick = (node: CausalNode) => {
    const next = selectedNodeId === node.id ? null : node.id;
    setSelectedNodeId(next);
    onSelectNode?.(next ? node : null);
  };

  // Helper to find node coordinates
  const nodeMap = new Map<string, CausalNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  // Determine connected edges and nodes for highlight
  const activeNodeId = hoveredNodeId || selectedNodeId;
  const isEdgeHighlighted = (edge: CausalEdge) => {
    if (!activeNodeId) return false;
    return edge.source === activeNodeId || edge.target === activeNodeId;
  };

  const isNodeHighlighted = (node: CausalNode) => {
    if (!activeNodeId) return false;
    if (node.id === activeNodeId) return true;
    return edges.some(
      (e) =>
        (e.source === activeNodeId && e.target === node.id) ||
        (e.target === activeNodeId && e.source === node.id)
    );
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative w-full h-[540px] bg-[#0A0D13] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      {/* Subtle Background Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
        <defs>
          <pattern id="graph-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#5B6574" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#graph-grid)" />
      </svg>

      {/* Floating Controls Toolbar */}
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
          title="Reset Zoom & Selection"
          className="p-1.5 rounded hover:bg-[#1C232E] text-[#8B949E] hover:text-[#F5F7FA] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="text-[10px] font-mono text-[#5B6574] px-1.5">{Math.round(zoom * 100)}%</span>
      </div>

      {/* Legend Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-[#11161D]/90 backdrop-blur border border-[rgba(255,255,255,0.08)] px-3 py-1.5 rounded text-[11px] font-mono text-[#8B949E]">
        <span className="flex items-center gap-1 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-400" />
          Critical Impact
        </span>
        <span className="flex items-center gap-1 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          Warning
        </span>
        <span className="flex items-center gap-1 text-[#00F0FF]">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
          Causal Pulse
        </span>
      </div>

      {/* Transformed Graph Content Canvas */}
      <div
        className="absolute inset-0 transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Render SVG Edges */}
        <svg className="w-full h-full absolute inset-0 pointer-events-none" style={{ minWidth: 800, minHeight: 600 }}>
          <defs>
            <marker
              id="arrowhead-cyan"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#00F0FF" />
            </marker>
            <marker
              id="arrowhead-red"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#EF4444" />
            </marker>
            <marker
              id="arrowhead-dim"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#4B5563" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const src = nodeMap.get(edge.source);
            const tgt = nodeMap.get(edge.target);
            if (!src || !tgt) return null;

            const x1 = src.x || 400;
            const y1 = (src.y || 100) + 35; // bottom of node box
            const x2 = tgt.x || 400;
            const y2 = (tgt.y || 200) - 35; // top of node box

            // Determine if reverse flow or direct
            const isReversed = y1 > y2;
            const startY = isReversed ? (src.y || 100) - 35 : y1;
            const endY = isReversed ? (tgt.y || 200) + 35 : y2;

            const isHighlighted = isEdgeHighlighted(edge);
            const strokeColor = isHighlighted
              ? "#00F0FF"
              : edge.impact === "high"
              ? "#EF4444"
              : "#374151";

            const markerEnd = isHighlighted
              ? "url(#arrowhead-cyan)"
              : edge.impact === "high"
              ? "url(#arrowhead-red)"
              : "url(#arrowhead-dim)";

            // Calculate bezier control points
            const midY = (startY + endY) / 2;
            const pathD = `M ${x1} ${startY} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${endY}`;

            return (
              <g key={edge.id}>
                {/* Edge path glow when active */}
                {isHighlighted && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#00F0FF"
                    strokeWidth="5"
                    strokeOpacity="0.25"
                    strokeLinecap="round"
                  />
                )}
                {/* Main line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  strokeDasharray={edge.animated ? "5,5" : undefined}
                  markerEnd={markerEnd}
                  className={edge.animated ? "animate-pulse" : ""}
                />
                {/* Edge label pill at midpoint */}
                {edge.label && (
                  <g transform={`translate(${(x1 + x2) / 2}, ${(startY + endY) / 2})`}>
                    <rect
                      x="-65"
                      y="-11"
                      width="130"
                      height="22"
                      rx="4"
                      fill="#0D1117"
                      stroke={isHighlighted ? "rgba(0,240,255,0.4)" : "rgba(255,255,255,0.1)"}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      dy="4"
                      fill={isHighlighted ? "#00F0FF" : "#8B949E"}
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Render Interactive Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;
          const isHighlighted = isNodeHighlighted(node);

          const statusColor =
            node.status === "critical"
              ? "border-red-500/60 bg-red-950/20 text-red-300"
              : node.status === "warning"
              ? "border-amber-500/60 bg-amber-950/20 text-amber-300"
              : "border-cyan-500/40 bg-[#11161D] text-cyan-300";

          return (
            <div
              key={node.id}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              className={`graph-node absolute cursor-pointer rounded-lg p-3 w-56 -ml-28 -mt-9 transition-all duration-150 border ${statusColor} ${
                isSelected
                  ? "ring-2 ring-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.3)] scale-105 z-20"
                  : isHovered
                  ? "scale-102 border-[#00F0FF] shadow-lg z-10"
                  : isHighlighted
                  ? "border-[#00F0FF]/50"
                  : "opacity-90"
              }`}
              style={{
                left: `${node.x || 400}px`,
                top: `${node.y || 200}px`,
              }}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8B949E] mb-1">
                <span className="truncate max-w-[120px] uppercase tracking-wider">{node.service}</span>
                <span
                  className={`px-1.5 py-0.2 rounded font-bold ${
                    node.change_pct > 50
                      ? "bg-red-500/20 text-red-400"
                      : node.change_pct > 0
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-[#1C232E] text-[#8B949E]"
                  }`}
                >
                  {node.change}
                </span>
              </div>

              <div className="text-xs font-semibold font-mono text-[#F5F7FA] truncate flex items-center justify-between">
                <span>{node.label}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
              </div>

              <div className="text-[10px] text-[#5B6574] font-mono truncate mt-0.5">
                {node.metric}: {node.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Drawer / Popout at Bottom */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 z-20 bg-[#11161D]/95 backdrop-blur-md border border-[#00F0FF]/40 rounded-lg p-4 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1C232E] text-[#8B949E] border border-[rgba(255,255,255,0.06)]">
                {selectedNode.service}
              </span>
              <h4 className="text-sm font-bold font-mono text-[#F5F7FA]">{selectedNode.label}</h4>
              <span className="text-xs font-mono font-bold text-red-400">{selectedNode.change}</span>
            </div>
            <p className="text-xs text-[#8B949E] font-sans">{selectedNode.detail}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedNodeId(null)}
              className="px-3 py-1.5 rounded bg-[#1C232E] hover:bg-[#252E3D] text-xs font-mono text-[#8B949E] hover:text-[#F5F7FA] border border-[rgba(255,255,255,0.08)]"
            >
              Close Inspector
            </button>
            <a
              href={`/services/${selectedNode.service}`}
              className="px-3 py-1.5 rounded bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-xs font-mono font-semibold text-[#00F0FF] border border-[#00F0FF]/40 transition-colors"
            >
              View Service Diagnostics →
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
