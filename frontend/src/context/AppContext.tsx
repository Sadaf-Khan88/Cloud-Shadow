"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BackendStatus, EngineResult } from "@/types";
import { api } from "@/services/api";

interface AppContextType {
  timeRange: string;
  setTimeRange: (range: string) => void;
  backendStatus: BackendStatus;
  refreshBackendStatus: () => Promise<void>;
  toggleDemoMode: (val?: boolean) => void;
  isAnalyzing: boolean;
  triggerAnalysis: () => Promise<EngineResult | null>;
  refreshKey: number;
  triggerRefresh: () => void;
  environment: string;
  setEnvironment: (env: string) => void;
  lastAnalysis: EngineResult | null;
  notificationMessage: string | null;
  showNotification: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [environment, setEnvironment] = useState<string>("Production (AWS us-east-1)");
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(api.getStatus());
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [lastAnalysis, setLastAnalysis] = useState<EngineResult | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const refreshBackendStatus = useCallback(async () => {
    const status = await api.checkBackendHealth();
    setBackendStatus({ ...status });
  }, []);

  const toggleDemoMode = useCallback((val?: boolean) => {
    const nextVal = val !== undefined ? val : !backendStatus.isDemoMode;
    api.setDemoMode(nextVal);
    setBackendStatus((prev) => ({
      ...prev,
      isDemoMode: nextVal,
      engineStatus: nextVal ? "demo_fallback" : prev.isConnected ? "online" : "demo_fallback",
    }));
  }, [backendStatus.isDemoMode]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    refreshBackendStatus();
  }, [refreshBackendStatus]);

  const showNotification = useCallback((msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 4500);
  }, []);

  const triggerAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const result = await api.runAnalysis();
      setLastAnalysis(result);
      showNotification(`Analysis ${result.analysis_id} completed: ${result.total_root_causes} root cause(s) identified.`);
      triggerRefresh();
      return result;
    } catch (err) {
      console.error("Failed to run analysis:", err);
      showNotification("Analysis failed. Reverted to cached state.");
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [showNotification, triggerRefresh]);

  useEffect(() => {
    refreshBackendStatus();
    const interval = setInterval(refreshBackendStatus, 30000);
    return () => clearInterval(interval);
  }, [refreshBackendStatus]);

  return (
    <AppContext.Provider
      value={{
        timeRange,
        setTimeRange,
        backendStatus,
        refreshBackendStatus,
        toggleDemoMode,
        isAnalyzing,
        triggerAnalysis,
        refreshKey,
        triggerRefresh,
        environment,
        setEnvironment,
        lastAnalysis,
        notificationMessage,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
