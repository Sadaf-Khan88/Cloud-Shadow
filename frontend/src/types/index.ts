export type Severity = "critical" | "high" | "medium" | "low";
export type HealthStatus = "healthy" | "degraded" | "critical";
export type CostImpact = "Critical" | "High" | "Medium" | "Low";
export type RiskLevel = "Low" | "Medium" | "High";

export interface CostSummary {
  total_spend: number;
  baseline_spend: number;
  cost_change: number;
  cost_change_pct: number;
  currency: string;
  time_range: string;
  hourly_spend: number;
  active_anomalies: number;
  root_cause_episodes: number;
  optimization_opportunities: number;
}

export interface CostTrendPoint {
  timestamp: string;
  actual_cost: number;
  baseline_cost: number;
  change_pct: number;
  has_anomaly?: boolean;
  anomaly_id?: string;
  service?: string;
}

export interface ServiceCostContribution {
  service: string;
  cost: number;
  baseline: number;
  percentage: number;
  change_pct: number;
}

export interface ResourceCostContribution {
  resource: string;
  category: "Compute" | "Storage" | "Database" | "Networking" | "Analytics";
  cost: number;
  percentage: number;
  change_pct: number;
}

export interface RegionCostContribution {
  region: string;
  cost: number;
  percentage: number;
}

export interface CostsData {
  summary: CostSummary;
  hourly_trend: CostTrendPoint[];
  service_breakdown: ServiceCostContribution[];
  resource_breakdown: ResourceCostContribution[];
  region_breakdown: RegionCostContribution[];
}

export interface Anomaly {
  id: string;
  service: string;
  metric: string;
  metric_display_name: string;
  severity: Severity;
  baseline: number;
  current: number;
  change_pct: number;
  score: number; // 0 to 1 confidence
  unit: string;
  timestamp: string;
  status: "active" | "investigating" | "resolved";
  description: string;
  root_cause_id?: string;
}

export interface CausalNode {
  id: string;
  label: string;
  service: string;
  metric: string;
  change: string;
  change_pct: number;
  status: "critical" | "warning" | "info" | "normal";
  detail: string;
  x?: number;
  y?: number;
}

export interface CausalEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  impact: "high" | "medium" | "low";
  animated?: boolean;
}

export interface RelatedEvent {
  time: string;
  type: "deployment" | "traffic_spike" | "config_change" | "alert";
  title: string;
  description: string;
  service: string;
}

export interface TimelineStep {
  time: string;
  title: string;
  description: string;
  impact: string;
  severity: Severity;
}

export interface RootCause {
  id: string;
  title: string;
  service: string;
  metric: string;
  evidence_score: number; // e.g. 0.90 for 90%
  cost_impact: CostImpact;
  timestamp: string;
  status: "active" | "investigating" | "resolved";
  summary: string;
  what_changed: string;
  evidence: string[];
  causal_graph: {
    nodes: CausalNode[];
    edges: CausalEdge[];
  };
  related_events: RelatedEvent[];
  timeline: TimelineStep[];
  recommendation_ids: string[];
}

export interface Recommendation {
  id: string;
  service: string;
  title: string;
  action: string;
  reason: string;
  expected_effect: string;
  risk: RiskLevel;
  category: "Storage" | "Compute" | "Database" | "Network" | "Architecture";
  effort: "Quick Fix" | "Medium" | "Major Change";
  root_cause_id?: string;
  status?: "pending" | "applied" | "dismissed";
}

export interface ServiceMetricPoint {
  timestamp: string;
  requests_per_sec: number;
  latency_ms: number;
  cpu_pct: number;
  memory_pct: number;
  cost_rate: number;
}

export interface ServiceDetail {
  id: string;
  name: string;
  health: HealthStatus;
  tier: "Frontend" | "API" | "Data" | "Cache" | "Storage" | "Third-party";
  description: string;
  cost_hourly: number;
  cost_monthly_projected: number;
  cost_change_pct: number;
  requests_per_sec: number;
  latency_p95_ms: number;
  error_rate_pct: number;
  active_anomalies_count: number;
  cpu_pct: number;
  memory_pct: number;
  network_mbps: number;
  db_queries_sec?: number;
  expensive_reason?: string;
  dependencies: string[];
  dependents: string[];
  metrics_history: ServiceMetricPoint[];
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  request_rate: number;
  latency_ms: number;
  error_rate: number;
  cost_impact: "high" | "medium" | "low";
  change_pct: number;
}

export interface DependencyGraphData {
  services: ServiceDetail[];
  edges: DependencyEdge[];
}

export interface DashboardOverview {
  summary: CostSummary;
  primary_root_cause: RootCause;
  recent_anomalies: Anomaly[];
  cost_trend: CostTrendPoint[];
  top_expensive_services: ServiceDetail[];
  recommendations: Recommendation[];
}

export interface EngineResult {
  analysis_id: string;
  status: "completed" | "running" | "failed";
  timestamp: string;
  cost_summary: CostSummary;
  anomalies: Anomaly[];
  root_causes: RootCause[];
  recommendations: Recommendation[];
  total_anomalies: number;
  total_root_causes: number;
  total_recommendations: number;
}

export interface BackendStatus {
  isConnected: boolean;
  isDemoMode: boolean;
  apiUrl: string;
  lastChecked: string;
  engineStatus: "online" | "demo_fallback" | "offline";
}
