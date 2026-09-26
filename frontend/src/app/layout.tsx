import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "Cloud Shadow AI — Intelligent Cloud Cost-Causality Observability",
  description:
    "Connects cloud spending with application behaviour and service dependencies to explain unexpected cost increases and recommend safer optimizations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080A0F] text-[#F5F7FA] min-h-screen antialiased">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
