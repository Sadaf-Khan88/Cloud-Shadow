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
    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout("/analysis/run", { method: "POST" }, 5000);
        if (res.ok) {
          const data = await res.json();
          return data;
        }
      } catch (e) {
        console.warn("Backend /analysis/run unavailable, using mock analysis:", e);
      }
    }

    // Simulate analysis run delay
    await new Promise((r) => setTimeout(r, 800));
    return {
      ...mockEngineResult,
      analysis_id: `csa-engine-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }

  // GET /dashboard/overview
  public async getDashboardOverview(): Promise<{ data: DashboardOverview; isDemo: boolean }> {
    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout("/dashboard/overview");
        if (res.ok) {
          const data = await res.json();
          this.isConnected = true;
          return { data, isDemo: false };
        }
      } catch (e) {
        console.warn("Backend /dashboard/overview unavailable, falling back to demo data:", e);
      }
    }

    this.isDemoMode = true;
    return { data: mockDashboardOverview, isDemo: true };
  }

  // GET /costs
  public async getCosts(): Promise<{ data: CostsData; isDemo: boolean }> {
    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout("/costs");
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (e) {
        console.warn("Backend /costs unavailable, falling back to demo data:", e);
      }
    }

    return { data: mockCostsData, isDemo: true };
  }

  // GET /costs/trends
  public async getCostTrends(timeRange: string = "24h"): Promise<{ data: CostTrendPoint[]; isDemo: boolean }> {
    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout(`/costs/trends?time_range=${timeRange}`);
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (e) {
        console.warn("Backend /costs/trends unavailable, falling back to demo data:", e);
      }
    }

    return { data: mockCostTrend, isDemo: true };
  }

  // GET /services
  public async getServices(): Promise<{ data: ServiceDetail[]; isDemo: boolean }> {
    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout("/services");
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (e) {
        console.warn("Backend /services unavailable, falling back to demo data:", e);
      }
    }

    return { data: mockServices, isDemo: true };
  }

  // GET /services/{id}
  public async getService(id: string): Promise<{ data: ServiceDetail | null; isDemo: boolean }> {
    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout(`/services/${id}`);
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (e) {
        console.warn(`Backend /services/${id} unavailable, falling back to demo data:`, e);
      }
    }

    const found = mockServices.find((s) => s.id === id || s.id.toLowerCase() === id.toLowerCase()) || null;
    return { data: found, isDemo: true };
  }

  // GET /dependencies
  public async getDependencies(): Promise<{ data: DependencyGraphData; isDemo: boolean }> {
    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout("/dependencies");
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (e) {
        console.warn("Backend /dependencies unavailable, falling back to demo data:", e);
      }
    }

    return { data: mockDependencies, isDemo: true };
  }

  // GET /anomalies
  public async getAnomalies(filters?: {
    severity?: string;
    service?: string;
    metric?: string;
    search?: string;
  }): Promise<{ data: Anomaly[]; isDemo: boolean }> {
    if (!this.isDemoMode) {
      try {
        const queryParams = new URLSearchParams();
        if (filters?.severity) queryParams.set("severity", filters.severity);
        if (filters?.service) queryParams.set("service", filters.service);
        if (filters?.metric) queryParams.set("metric", filters.metric);
        if (filters?.search) queryParams.set("search", filters.search);

        const url = `/anomalies${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const res = await this.fetchWithTimeout(url);
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (e) {
        console.warn("Backend /anomalies unavailable, falling back to demo data:", e);
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

  // GET /root-causes
  public async getRootCauses(): Promise<{ data: RootCause[]; isDemo: boolean }> {
    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout("/root-causes");
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (e) {
        console.warn("Backend /root-causes unavailable, falling back to demo data:", e);
      }
    }

    return { data: mockRootCauses, isDemo: true };
  }

  // GET /root-causes/{id}
  public async getRootCause(id: string): Promise<{ data: RootCause | null; isDemo: boolean }> {
    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout(`/root-causes/${id}`);
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (e) {
        console.warn(`Backend /root-causes/${id} unavailable, falling back to demo data:`, e);
      }
    }

    const found = mockRootCauses.find((rc) => rc.id === id || rc.id.toLowerCase() === id.toLowerCase()) || null;
    return { data: found, isDemo: true };
  }

  // GET /recommendations
  public async getRecommendations(): Promise<{ data: Recommendation[]; isDemo: boolean }> {
    if (!this.isDemoMode) {
      try {
        const res = await this.fetchWithTimeout("/recommendations");
        if (res.ok) {
          const data = await res.json();
          return { data, isDemo: false };
        }
      } catch (e) {
        console.warn("Backend /recommendations unavailable, falling back to demo data:", e);
      }
    }

    return { data: mockRecommendations, isDemo: true };
  }
}

export const api = new ApiService();
export default api;
