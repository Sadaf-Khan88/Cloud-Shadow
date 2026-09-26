"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  Server,
  GitFork,
  AlertTriangle,
  Search,
  Sparkles,
  Layers,
  Activity,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { backendStatus, toggleDemoMode } = useApp();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: "Costs & Trends",
      href: "/costs",
      icon: DollarSign,
      badge: "+38.4%",
      badgeVariant: "critical",
    },
    {
      name: "Services",
      href: "/services",
      icon: Server,
      badge: "8",
      badgeVariant: "default",
    },
    {
      name: "Dependencies",
      href: "/dependencies",
      icon: GitFork,
      badge: null,
    },
    {
      name: "Anomalies",
      href: "/anomalies",
      icon: AlertTriangle,
      badge: "8 active",
      badgeVariant: "amber",
    },
    {
      name: "Root Causes",
      href: "/root-causes",
      icon: Search,
      badge: "2 episodes",
      badgeVariant: "cyan",
    },
    {
      name: "Recommendations",
      href: "/recommendations",
      icon: Sparkles,
      badge: "5",
      badgeVariant: "green",
    },
  ];

  return (
    <aside className="w-64 bg-[#0D1117] border-r border-[rgba(255,255,255,0.08)] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div>
        {/* Product Brand Header */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.08)]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-md bg-[#11161D] border border-[rgba(0,240,255,0.4)] flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.15)] group-hover:border-[#00F0FF] transition-colors">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wider font-mono text-[#F5F7FA]">
                  CLOUD SHADOW
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                  AI
                </span>
              </div>
              <div className="text-[10px] text-[#8B949E] tracking-tight font-sans">
                Cost-Causality Observability
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="px-2 py-4">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-[#5B6574]">
            FinOps Observability
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/" || pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-[#161C26] text-[#00F0FF] border-l-2 border-[#00F0FF] font-semibold"
                      : "text-[#8B949E] hover:text-[#F5F7FA] hover:bg-[#11161D]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#00F0FF]" : "text-[#8B949E]"}`} />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        item.badgeVariant === "critical"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : item.badgeVariant === "amber"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : item.badgeVariant === "cyan"
                          ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                          : item.badgeVariant === "green"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-[#1E2530] text-[#8B949E]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info: Environment, Engine Status, Developer / Operator */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.08)] bg-[#0A0D13] space-y-3">
        {/* Engine Pipeline Status */}
        <div className="p-2.5 rounded bg-[#11161D] border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-[#8B949E] flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-[#00F0FF]" />
              ML Engine
            </span>
            <span className="flex items-center gap-1 font-mono text-[10px]">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  backendStatus.isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className={backendStatus.isConnected ? "text-emerald-400" : "text-amber-400"}>
                {backendStatus.isConnected ? "FastAPI Live" : "Demo Engine"}
              </span>
            </span>
          </div>

          <div className="text-[10px] text-[#5B6574] font-mono truncate">
            {backendStatus.isConnected ? "Connected: :8000" : "Auto-mock Fallback Active"}
          </div>

          <button
            onClick={() => toggleDemoMode()}
            className="w-full mt-2 text-[10px] font-mono py-1 px-2 rounded bg-[#161C26] hover:bg-[#1E2634] text-[#8B949E] hover:text-[#F5F7FA] border border-[rgba(255,255,255,0.08)] transition-colors flex items-center justify-between"
          >
            <span>{backendStatus.isDemoMode ? "Mode: Demo Data" : "Mode: Live Engine"}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Current Operator Profile */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#161C26] border border-[rgba(255,255,255,0.12)] flex items-center justify-center text-xs font-mono font-bold text-[#F5F7FA]">
              NK
            </div>
            <div>
              <div className="text-xs font-medium text-[#F5F7FA] leading-tight">FinOps SRE</div>
              <div className="text-[10px] text-[#5B6574] font-mono">Operator view</div>
            </div>
          </div>
          <span title="Security posture: active">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </span>
        </div>
      </div>
    </aside>
  );
};
