import {
  DashboardOverview,
  CostsData,
  CostTrendPoint,
  ServiceDetail,
  DependencyGraphData,
  Anomaly,
  RootCause,
  Recommendation,
  EngineResult,
  BackendStatus,
  Severity,
} from "@/types";
import {
  mockDashboardOverview,
  mockCostsData,
  mockCostTrend,
  mockServices,
  mockDependencies,
  mockAnomalies,
  mockRootCauses,
  mockRecommendations,
  mockEngineResult,
} from "@/data/mockData";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const FORCE_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
let cachedEngineResult: EngineResult | null = null;

type EngineRecord = Record<string, unknown>;

const asRecord = (value: unknown): EngineRecord =>
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as EngineRecord : {};
const asNumber = (value: unknown, fallback = 0): number => typeof value === "number" ? value : fallback;
const asText = (value: unknown, fallback = ""): string => typeof value === "string" ? value : fallback;

const adaptEngineResult = (payload: EngineResult): EngineResult => {
  const raw = payload as unknown as EngineRecord;
  const cost = asRecord(raw.cost_summary);
  const engineAnomalies = Array.isArray(raw.anomalies) ? raw.anomalies as EngineRecord[] : [];
  const engineRoots = Array.isArray(raw.root_causes) ? raw.root_causes as EngineRecord[] : [];
  const engineRecommendations = Array.isArray(raw.recommendations) ? raw.recommendations as EngineRecord[] : [];
  const anomalies: Anomaly[] = engineAnomalies
    .sort((a, b) => asNumber(b.anomaly_score) - asNumber(a.anomaly_score))
    .slice(0, 20)
    .map((item, index): Anomaly => {
      const sample = mockAnomalies[index % mockAnomalies.length];
      const metric = asText(item.metric, sample.metric);
      const severity = asText(item.severity, sample.severity).toLowerCase() as Severity;
      const baseline = asNumber(item.baseline_value, sample.baseline);
      const current = asNumber(item.current_value, sample.current);
      const service = asText(item.service_id, sample.service);
      const change = asNumber(item.change_percent, sample.change_pct);
      return {
        id: asText(item.anomaly_id, `engine-anomaly-${index + 1}`),
        service,
        metric,
        metric_display_name: metric.replace(/_/g, " "),
        severity: ["critical", "high", "medium", "low"].includes(severity) ? severity : sample.severity,
        baseline,
        current,
        change_pct: change,
        score: asNumber(item.anomaly_score, sample.score),
        unit: asText(item.unit, metric === "cpu" || metric === "memory" ? "%" : ""),
        timestamp: asText(item.timestamp, new Date().toISOString()),
        status: "active",
        description: `${service} ${metric.replace(/_/g, " ")} changed by ${change}% (${baseline} to ${current}).`,
      };
    });
  const rootCauses: RootCause[] = engineRoots
    .sort((a, b) => asNumber(b.confidence) - asNumber(a.confidence))
    .slice(0, 5)
    .map((item, index): RootCause => {
      const service = asText(item.service_id, "unknown-service");
      const metric = asText(item.metric, "metric");
      const id = asText(item.episode_id, `engine-root-cause-${index + 1}`);
      const confidence = asNumber(item.confidence);
      const evidenceRecord = asRecord(item.evidence);
      const evidence = Object.entries(evidenceRecord)
        .filter(([, value]) => typeof value === "string" || typeof value === "number")
        .map(([key, value]) => `${key.replace(/_/g, " ")}: ${value}`);
      const related = anomalies.find((anomaly) => anomaly.service === service && anomaly.metric === metric);
      return {
        id,
        title: `Likely root cause candidate for ${service} ${metric} anomaly`,
        service,
        metric,
        evidence_score: confidence > 1 ? confidence / 100 : confidence,
        cost_impact:
          asNumber(item.estimated_cost_impact) >= 10
            ? "Critical"
            : asNumber(item.estimated_cost_impact) >= 5
              ? "High"
              : asNumber(item.estimated_cost_impact) > 0
                ? "Medium"
                : "Low",
        timestamp: asText(item.timestamp, new Date().toISOString()),
        status: "active",
        summary: "Ranked using engine evidence; confidence does not prove causality.",
        what_changed: related ? `${service} ${metric} changed by ${related.change_pct}% from baseline.` : `${service} was ranked for the ${metric} signal.`,
        evidence,
        causal_graph: {
          nodes: [{
            id,
            label: `${service} ${metric}`,
            service,
            metric,
            change: related ? `${related.change_pct}%` : "Observed",
            change_pct: related?.change_pct ?? 0,
            status: "warning",
            detail: "Engine-ranked candidate based on available evidence.",
          }],
          edges: [],
        },
        related_events: [],
        timeline: [],
        recommendation_ids: engineRecommendations
          .slice(0, 5)
          .map((recommendation, recommendationIndex) =>
            asText(recommendation.service_id) === service ? `engine-rec-${recommendationIndex + 1}` : null,
          )
          .filter((recommendationId): recommendationId is string => recommendationId !== null),
      };
    });
  const recommendations: Recommendation[] = engineRecommendations.slice(0, 5).map((item, index): Recommendation => {
    const sample = mockRecommendations[index % mockRecommendations.length];
    const service = asText(item.service_id, sample.service);
    const action = asText(item.action, sample.action);
    const riskText = asText(item.risk, sample.risk).toLowerCase();
    return {
      id: `engine-rec-${index + 1}`,
      service,
      title: action,
      action,
      reason: asText(item.reason, sample.reason),
      expected_effect: asText(item.expected_effect, sample.expected_effect),
      risk: riskText.includes("high") ? "High" : riskText.includes("medium") ? "Medium" : "Low",
      category: "Architecture",
      effort: "Medium",
      root_cause_id: rootCauses.find((rootCause) => rootCause.service === service)?.id,
      status: "pending",
    };
  });
  const currentSpend = asNumber(cost.current_hourly_cost, asNumber(cost.current_cost, mockEngineResult.cost_summary.total_spend));
  const baselineSpend = asNumber(cost.baseline_hourly_cost, asNumber(cost.baseline_cost, mockEngineResult.cost_summary.baseline_spend));

  return {
    analysis_id: asText(raw.analysis_id, mockEngineResult.analysis_id),
    status: raw.status === "running" || raw.status === "failed" ? raw.status : "completed",
    timestamp: new Date().toISOString(),
    cost_summary: {
      ...mockEngineResult.cost_summary,
      total_spend: currentSpend,
      baseline_spend: baselineSpend,
      cost_change: asNumber(cost.hourly_cost_change, asNumber(cost.absolute_increase, currentSpend - baselineSpend)),
      cost_change_pct: asNumber(cost.change_percent, asNumber(cost.increase_percent)),
      active_anomalies: asNumber(raw.total_anomalies, engineAnomalies.length),
      root_cause_episodes: asNumber(raw.total_root_causes, engineRoots.length),
      optimization_opportunities: asNumber(raw.total_recommendations, engineRecommendations.length),
    },
    anomalies,
    root_causes: rootCauses,
    recommendations,
    total_anomalies: asNumber(raw.total_anomalies, engineAnomalies.length),
    total_root_causes: asNumber(raw.total_root_causes, engineRoots.length),
    total_recommendations: asNumber(raw.total_recommendations, engineRecommendations.length),
  };
};

class ApiService {
  private isDemoMode: boolean = FORCE_DEMO;
  private isConnected: boolean = false;
  private lastChecked: string = new Date().toISOString();

  private async fetchWithTimeout(endpoint: string, options: RequestInit = {}, timeoutMs = 1200): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  }

  public async checkBackendHealth(): Promise<BackendStatus> {
    if (this.isDemoMode && FORCE_DEMO) {
      this.isConnected = false;
      return this.getStatus();
    }

    try {
      const res = await this.fetchWithTimeout("/health", { method: "GET" }, 1500);
      if (res.ok) {
        this.isConnected = true;
        this.isDemoMode = false;
      } else {
        this.isConnected = false;
        this.isDemoMode = true;
      }
    } catch {
      this.isConnected = false;
      this.isDemoMode = true;
    }

    this.lastChecked = new Date().toISOString();
    return this.getStatus();
  }

  public getStatus(): BackendStatus {
    return {
      isConnected: this.isConnected,
      isDemoMode: this.isDemoMode,
      apiUrl: API_BASE_URL,
      lastChecked: this.lastChecked,
      engineStatus: this.isConnected ? "online" : "demo_fallback",
    };
  }

  public setDemoMode(force: boolean) {
    this.isDemoMode = force;
  }

  // POST /analysis/run
  public async runAnalysis(): Promise<EngineResult> {
    if (cachedEngineResult) {
      return cachedEngineResult;
    }

    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout("/analysis/run", { method: "POST" }, 5000);
        if (!res.ok) {
          throw new Error(`Analysis request failed with status ${res.status}`);
        }

        const data: EngineResult = await res.json();
        cachedEngineResult = adaptEngineResult(data);
        this.isConnected = true;
        this.isDemoMode = false;
        return cachedEngineResult;
      } catch (e) {
        console.warn("Backend /analysis/run unavailable, using mock analysis:", e);
        this.isConnected = false;
        this.isDemoMode = true;
      }
    }

    await new Promise((r) => setTimeout(r, 800));
    cachedEngineResult = {
      ...mockEngineResult,
      analysis_id: `csa-engine-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    return cachedEngineResult;
  }

  private async getEngineResult(): Promise<EngineResult> {
    if (cachedEngineResult) {
      return cachedEngineResult;
    }

    return this.runAnalysis();
  }

  // Compose the dashboard from the cached analysis and curated UI data.
  public async getDashboardOverview(): Promise<{ data: DashboardOverview; isDemo: boolean }> {
    if (this.isDemoMode) {
      return { data: mockDashboardOverview, isDemo: true };
    }

    const result = await this.getEngineResult();
    if (!this.isDemoMode) {
      return {
        data: {
          ...mockDashboardOverview,
          summary: result.cost_summary,
          primary_root_cause: result.root_causes[0] ?? mockDashboardOverview.primary_root_cause,
          recent_anomalies: result.anomalies.slice(0, 5),
          recommendations: result.recommendations,
        },
        isDemo: false,
      };
    }

    return { data: mockDashboardOverview, isDemo: true };
  }

  // Adapt the engine cost summary to the existing costs view model.
  public async getCosts(): Promise<{ data: CostsData; isDemo: boolean }> {
    if (this.isDemoMode) {
      return { data: mockCostsData, isDemo: true };
    }

    const result = await this.getEngineResult();
    if (!this.isDemoMode) {
      return {
        data: { ...mockCostsData, summary: result.cost_summary },
        isDemo: false,
      };
    }

    return { data: mockCostsData, isDemo: true };
  }

  // Detailed cost trends are not included in EngineResult, so keep the mock series.
  public async getCostTrends(timeRange: string = "24h"): Promise<{ data: CostTrendPoint[]; isDemo: boolean }> {
    void timeRange;
    return { data: mockCostTrend, isDemo: true };
  }

  // GET /services
  public async getServices(): Promise<{ data: ServiceDetail[]; isDemo: boolean }> {
    return { data: mockServices, isDemo: true };
  }
  // Service detail is not included in EngineResult; keep the existing mock fallback.
  public async getService(id: string): Promise<{ data: ServiceDetail | null; isDemo: boolean }> {
    const found = mockServices.find((s) => s.id === id || s.id.toLowerCase() === id.toLowerCase()) || null;
    return { data: found, isDemo: true };
  }

  // GET /dependencies
  public async getDependencies(): Promise<{ data: DependencyGraphData; isDemo: boolean }> {
    return { data: mockDependencies, isDemo: true };
  }

  // Adapt a curated subset of engine anomalies for the existing anomalies view.
  public async getAnomalies(filters?: {
    severity?: string;
    service?: string;
    metric?: string;
    search?: string;
  }): Promise<{ data: Anomaly[]; isDemo: boolean }> {
    if (!this.isDemoMode) {
      const result = await this.getEngineResult();
      if (!this.isDemoMode) {
        return { data: this.filterAnomalies(result.anomalies, filters), isDemo: false };
      }
    }

    let filtered = [...mockAnomalies];
    if (filters?.severity && filters.severity !== "all") {
      filtered = filtered.filter((a) => a.severity.toLowerCase() === filters.severity?.toLowerCase());
    }
    if (filters?.service && filters.service !== "all") {
      filtered = filtered.filter((a) => a.service.toLowerCase() === filters.service?.toLowerCase());
    }
    if (filters?.metric && filters.metric !== "all") {
      filtered = filtered.filter((a) => a.metric.toLowerCase() === filters.metric?.toLowerCase());
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.id.toLowerCase().includes(q) ||
          a.service.toLowerCase().includes(q) ||
          a.metric.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }

    return { data: filtered, isDemo: true };
  }

  private filterAnomalies(
    anomalies: Anomaly[],
    filters?: { severity?: string; service?: string; metric?: string; search?: string },
  ): Anomaly[] {
    let filtered = [...anomalies];
    if (filters?.severity && filters.severity !== "all") {
      filtered = filtered.filter((anomaly) => anomaly.severity.toLowerCase() === filters.severity?.toLowerCase());
    }
    if (filters?.service && filters.service !== "all") {
      filtered = filtered.filter((anomaly) => anomaly.service.toLowerCase() === filters.service?.toLowerCase());
    }
    if (filters?.metric && filters.metric !== "all") {
      filtered = filtered.filter((anomaly) => anomaly.metric.toLowerCase() === filters.metric?.toLowerCase());
    }
    if (filters?.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter((anomaly) =>
        [anomaly.id, anomaly.service, anomaly.metric, anomaly.description]
          .some((value) => value.toLowerCase().includes(query)),
      );
    }
    return filtered;
  }

  // Adapt a curated subset of engine root causes for the existing root-cause view.
  public async getRootCauses(): Promise<{ data: RootCause[]; isDemo: boolean }> {
    if (!this.isDemoMode) {
      const result = await this.getEngineResult();
      if (!this.isDemoMode) {
        return { data: result.root_causes, isDemo: false };
      }
    }

    return { data: mockRootCauses, isDemo: true };
  }

  // Find a root-cause detail in the cached engine result, then use the mock fallback.
  public async getRootCause(id: string): Promise<{ data: RootCause | null; isDemo: boolean }> {
    if (!this.isDemoMode) {
      const result = await this.getEngineResult();
      if (!this.isDemoMode) {
        const found = result.root_causes.find((rootCause) => rootCause.id === id) ?? null;
        if (found) return { data: found, isDemo: false };
      }
    }

    const found = mockRootCauses.find((rc) => rc.id === id || rc.id.toLowerCase() === id.toLowerCase()) || null;
    return { data: found, isDemo: true };
  }

  // Adapt engine recommendations to the existing recommendations view model.
  public async getRecommendations(): Promise<{ data: Recommendation[]; isDemo: boolean }> {
    if (!this.isDemoMode) {
      const result = await this.getEngineResult();
      if (!this.isDemoMode) {
        return { data: result.recommendations, isDemo: false };
      }
    }

    return { data: mockRecommendations, isDemo: true };
  }
}

export const api = new ApiService();
export default api;
