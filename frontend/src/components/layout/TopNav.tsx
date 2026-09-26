"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  RotateCw,
  Play,
  Clock,
  Globe,
  Bell,
  CheckCircle2,
  AlertCircle,
  Database,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export const TopNav: React.FC = () => {
  const pathname = usePathname();
  const {
    timeRange,
    setTimeRange,
    backendStatus,
    triggerRefresh,
    isAnalyzing,
    triggerAnalysis,
    environment,
    setEnvironment,
    notificationMessage,
  } = useApp();

  const getPageTitle = (path: string) => {
    if (path === "/" || path === "/dashboard") return "Cost & Causal Overview";
    if (path.startsWith("/costs")) return "Cloud Cost & Breakdown Analysis";
    if (path.startsWith("/services")) return "Microservices & Resource Health";
    if (path.startsWith("/dependencies")) return "Service Dependency Topology";
    if (path.startsWith("/anomalies")) return "Anomaly Detection Feed";
    if (path.startsWith("/root-causes")) return "Root Cause Investigation Episodes";
    if (path.startsWith("/recommendations")) return "Safer Optimization Recommendations";
    return "Cloud Shadow Observability";
  };

  const getBreadcrumbs = (path: string) => {
    const parts = path.split("/").filter(Boolean);
    if (parts.length === 0) return ["Overview"];
    return parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " "));
  };

  return (
    <header className="h-14 bg-[#0D1117]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Page Title & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#5B6574]">
            <span>Cloud Shadow</span>
            <span>/</span>
            {getBreadcrumbs(pathname).map((crumb, idx) => (
              <span key={idx} className="text-[#8B949E]">
                {crumb}
              </span>
            ))}
          </div>
          <h1 className="text-sm font-semibold text-[#F5F7FA] font-sans tracking-tight">
            {getPageTitle(pathname)}
          </h1>
        </div>
      </div>

      {/* Right: Controls & Actions */}
      <div className="flex items-center gap-2.5">
        {/* Environment Selector */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-[#11161D] border border-[rgba(255,255,255,0.08)] text-xs text-[#8B949E] font-mono">
          <Globe className="w-3.5 h-3.5 text-[#00F0FF]" />
          <select
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="bg-transparent text-[#F5F7FA] outline-none text-xs cursor-pointer"
          >
            <option value="Production (AWS us-east-1)" className="bg-[#11161D]">
              prod (us-east-1)
            </option>
            <option value="Staging (AWS us-west-2)" className="bg-[#11161D]">
              stage (us-west-2)
            </option>
            <option value="Demo Benchmark Sandbox" className="bg-[#11161D]">
              demo-sandbox
            </option>
          </select>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-[#11161D] border border-[rgba(255,255,255,0.08)] rounded p-0.5 text-xs font-mono">
          <span className="pl-1.5 text-[#5B6574]">
            <Clock className="w-3 h-3" />
          </span>
          {["1h", "6h", "24h", "7d", "30d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                timeRange === range
                  ? "bg-[#1E2634] text-[#00F0FF] font-semibold"
                  : "text-[#8B949E] hover:text-[#F5F7FA]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Live Backend / Demo Mode Indicator Pill */}
        <div
          title={
            backendStatus.isConnected
              ? `Connected to FastAPI at ${backendStatus.apiUrl}`
              : "Demo Mode Active (Fallback mock data matching EngineResult schema)"
          }
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border ${
            backendStatus.isConnected
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-300 border-amber-500/20"
          }`}
        >
          <Database className="w-3 h-3" />
          <span className="hidden sm:inline">
            {backendStatus.isConnected ? "Live API" : "Demo Mode"}
          </span>
        </div>

        {/* Refresh Button */}
        <button
          onClick={triggerRefresh}
          title="Refresh metrics"
          className="p-1.5 rounded bg-[#11161D] hover:bg-[#161C26] text-[#8B949E] hover:text-[#F5F7FA] border border-[rgba(255,255,255,0.08)] transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        {/* Trigger ML Engine Analysis Button */}
        <button
          onClick={() => triggerAnalysis()}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#00F0FF]/15 hover:bg-[#00F0FF]/25 text-[#00F0FF] border border-[#00F0FF]/40 text-xs font-mono font-medium transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)] disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-current" />
              <span>Run Analysis</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            title="Active Notifications"
            className="p-1.5 rounded bg-[#11161D] text-[#8B949E] hover:text-[#F5F7FA] border border-[rgba(255,255,255,0.08)]"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00F0FF]" />
        </div>
      </div>

      {/* Pop-up Toast Notification Bar */}
      {notificationMessage && (
        <div className="absolute top-16 right-6 z-50 bg-[#161C26] border border-[#00F0FF]/40 text-[#F5F7FA] px-4 py-2.5 rounded-md shadow-2xl flex items-center gap-2.5 text-xs font-mono animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#00F0FF]" />
          <span>{notificationMessage}</span>
        </div>
      )}
    </header>
  );
};
