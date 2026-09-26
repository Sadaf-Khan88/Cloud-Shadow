"use client";

import React from "react";
import { ServiceCostContribution } from "@/types";
import { ArrowUpRight } from "lucide-react";

interface ServiceBreakdownChartProps {
  services: ServiceCostContribution[];
}

export const ServiceBreakdownChart: React.FC<ServiceBreakdownChartProps> = ({ services }) => {
  const maxCost = Math.max(...services.map((s) => s.cost), 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[11px] font-mono text-[#5B6574] pb-1 border-b border-[rgba(255,255,255,0.06)]">
        <span>Service Name</span>
        <div className="flex items-center gap-6">
          <span>Cost (24h)</span>
          <span className="w-12 text-right">Share</span>
        </div>
      </div>

      <div className="space-y-2.5">
        {services.map((svc) => {
          const widthPct = (svc.cost / maxCost) * 100;
          return (
            <div key={svc.service} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <a
                  href={`/services/${svc.service}`}
                  className="font-medium text-[#F5F7FA] hover:text-[#00F0FF] flex items-center gap-1 transition-colors"
                >
                  <span>{svc.service}</span>
                  <ArrowUpRight className="w-3 h-3 text-[#5B6574]" />
                </a>

                <div className="flex items-center gap-6">
                  <span className="text-[#8B949E]">${svc.cost.toFixed(2)}</span>
                  <span className="w-12 text-right font-bold text-[#F5F7FA]">
                    {svc.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#1C232E] rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    svc.change_pct > 50
                      ? "bg-red-400"
                      : svc.change_pct > 20
                      ? "bg-amber-400"
                      : "bg-[#00F0FF]"
                  }`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
