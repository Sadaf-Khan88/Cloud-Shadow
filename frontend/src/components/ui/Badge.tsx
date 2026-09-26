import React from "react";
import { Severity, HealthStatus, CostImpact, RiskLevel } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "default"
    | "critical"
    | "high"
    | "warning"
    | "medium"
    | "low"
    | "success"
    | "info"
    | "purple"
    | "outline";
  size?: "sm" | "md";
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "md",
  className = "",
  dot = false,
}) => {
  const sizeStyles = {
    sm: "px-1.5 py-0.5 text-[10px]",
    md: "px-2 py-0.5 text-xs",
  };

  const variantStyles = {
    default: "bg-[#1E2530] text-[#8B949E] border border-[rgba(255,255,255,0.08)]",
    critical: "bg-red-500/10 text-red-400 border border-red-500/20",
    high: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    medium: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
    low: "bg-blue-500/10 text-blue-300 border border-blue-500/20",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    info: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
    purple: "bg-purple-500/10 text-purple-300 border border-purple-500/20",
    outline: "bg-transparent text-[#8B949E] border border-[rgba(255,255,255,0.12)]",
  };

  const dotColors = {
    default: "bg-[#8B949E]",
    critical: "bg-red-400",
    high: "bg-orange-400",
    warning: "bg-amber-400",
    medium: "bg-amber-300",
    low: "bg-blue-400",
    success: "bg-emerald-400",
    info: "bg-cyan-400",
    purple: "bg-purple-400",
    outline: "bg-[#8B949E]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  switch (severity) {
    case "critical":
      return (
        <Badge variant="critical" dot>
          CRITICAL
        </Badge>
      );
    case "high":
      return (
        <Badge variant="high" dot>
          HIGH
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="medium" dot>
          MEDIUM
        </Badge>
      );
    case "low":
      return (
        <Badge variant="low" dot>
          LOW
        </Badge>
      );
    default:
      return <Badge variant="default">{severity}</Badge>;
  }
};

export const HealthBadge: React.FC<{ health: HealthStatus }> = ({ health }) => {
  switch (health) {
    case "healthy":
      return (
        <Badge variant="success" dot>
          HEALTHY
        </Badge>
      );
    case "degraded":
      return (
        <Badge variant="warning" dot>
          DEGRADED
        </Badge>
      );
    case "critical":
      return (
        <Badge variant="critical" dot>
          CRITICAL
        </Badge>
      );
  }
};

export const ImpactBadge: React.FC<{ impact: CostImpact }> = ({ impact }) => {
  switch (impact) {
    case "Critical":
      return <Badge variant="critical">CRITICAL IMPACT</Badge>;
    case "High":
      return <Badge variant="high">HIGH IMPACT</Badge>;
    case "Medium":
      return <Badge variant="medium">MEDIUM IMPACT</Badge>;
    case "Low":
      return <Badge variant="low">LOW IMPACT</Badge>;
  }
};

export const RiskBadge: React.FC<{ risk: RiskLevel }> = ({ risk }) => {
  switch (risk) {
    case "High":
      return <Badge variant="critical">High Risk</Badge>;
    case "Medium":
      return <Badge variant="warning">Medium Risk</Badge>;
    case "Low":
      return <Badge variant="success">Low Risk</Badge>;
  }
};
