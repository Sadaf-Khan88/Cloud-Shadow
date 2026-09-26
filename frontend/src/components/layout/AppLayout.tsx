"use client";

import React from "react";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { AppProvider } from "@/context/AppContext";

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-[#080A0F] text-[#F5F7FA]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNav />
          <main className="flex-1 p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AppProvider>
  );
};
