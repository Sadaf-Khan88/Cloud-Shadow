"use client";

import Sidebar from "./Sidebar";
import { cloudAnalysis, formatLakhs } from "./cloudData";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <Sidebar activeSection="overview" />

      <section className="lg:ml-[250px]">
        <Overview />
      </section>
    </main>
  );
}

function Overview() {
  const { overview, rootCause, costImpact } = cloudAnalysis;

  const serviceA = cloudAnalysis.services.find(
    (service) => service.id === "service-a"
  );

  const serviceB = cloudAnalysis.services.find(
    (service) => service.id === "service-b"
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      {/* HEADER */}
      <header className="border-b border-slate-200 bg-white">
        <div className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">
                  Cloud intelligence
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                CloudShadow Overview
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Understand what changed in your cloud bill, why it
                changed, and which application behaviour caused it.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-600">
                Analysis status
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-emerald-700">
                  Analysis complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-7 p-6 sm:p-8 lg:p-10">
        {/* KPI */}
        <section>
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Financial overview
            </p>

            <h2 className="mt-1 text-sm font-semibold text-slate-700">
              Current cloud environment
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="cloud-card cloud-card-hover p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current monthly cost
              </p>

              <p className="mt-4 text-3xl font-bold text-slate-950">
                {formatLakhs(overview.currentCost)}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">
                  +{overview.overallChange}%
                </span>

                <span className="text-[10px] text-slate-400">
                  vs previous period
                </span>
              </div>
            </div>

            <div className="cloud-card cloud-card-hover p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Previous cost
              </p>

              <p className="mt-4 text-3xl font-bold text-slate-950">
                {formatLakhs(overview.previousCost)}
              </p>

              <p className="mt-3 text-[10px] text-slate-400">
                Previous analysis period
              </p>
            </div>

            <div className="cloud-card cloud-card-hover p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Network spending
              </p>

              <p className="mt-4 text-3xl font-bold text-teal-600">
                {formatLakhs(overview.networkCost)}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-red-50 px-2 py-1 text-[9px] font-bold text-red-600">
                  +{overview.networkChange}%
                </span>

                <span className="text-[10px] text-slate-400">
                  strongest cost signal
                </span>
              </div>
            </div>

            <div className="cloud-card cloud-card-hover p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Compute spending
              </p>

              <p className="mt-4 text-3xl font-bold text-blue-600">
                {formatLakhs(overview.computeCost)}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-600">
                  +{overview.computeChange}%
                </span>

                <span className="text-[10px] text-slate-400">
                  usage increased
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ROOT CAUSE */}
        <section className="relative overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-teal-50 p-6 shadow-sm lg:p-8">
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
                Root cause detected
              </span>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                Confidence {rootCause.confidence}%
              </span>
            </div>

            <h2 className="mt-5 max-w-4xl text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
              Service A traffic is driving downstream infrastructure
              usage and cloud cost growth.
            </h2>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-600">
              CloudShadow connected the increase in Service A traffic
              with downstream requests, compute usage and network
              spending.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-red-100 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Service A traffic
                </p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  +{serviceA?.traffic}%
                </p>
              </div>

              <div className="rounded-xl border border-amber-100 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Service B requests
                </p>

                <p className="mt-2 text-2xl font-bold text-amber-600">
                  +{serviceB?.traffic}%
                </p>
              </div>

              <div className="rounded-xl border border-teal-100 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Network cost
                </p>

                <p className="mt-2 text-2xl font-bold text-teal-600">
                  +{costImpact.network}%
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/root-causes";
                }}
                className="rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white"
              >
                Investigate Root Cause →
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/dependencies";
                }}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-600"
              >
                View Dependency Graph →
              </button>
            </div>
          </div>
        </section>

        {/* FLOW */}
        <section className="cloud-card p-6 lg:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">
            CloudShadow intelligence
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            From application behaviour to cloud bill
          </h2>

          <div className="mt-7 grid gap-3 md:grid-cols-4">
            {[
              ["01", "Application Traffic", `+${costImpact.serviceTraffic}%`],
              ["02", "Downstream Requests", `+${serviceB?.traffic}%`],
              ["03", "Infrastructure Usage", `+${costImpact.compute}%`],
              ["04", "Cloud Spending", `+${overview.overallChange}%`],
            ].map(([number, title, value]) => (
              <div
                key={number}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <span className="text-[10px] font-bold text-slate-400">
                  {number}
                </span>

                <p className="mt-5 text-sm font-semibold text-slate-700">
                  {title}
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* NAVIGATION CARDS */}
        <section>
          <div className="mb-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Investigation workspace
            </p>

            <h2 className="mt-1 text-sm font-semibold text-slate-700">
              Explore the analysis
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <NavCard
              title="Cost Analysis"
              description="Break down spending by service, category and time period."
              href="/costs"
            />

            <NavCard
              title="Service Intelligence"
              description="Inspect traffic, CPU, latency and billing signals."
              href="/services"
            />

            <NavCard
              title="Root Cause"
              description="Trace the actual behaviour behind the bill increase."
              href="/root-causes"
            />

            <NavCard
              title="Dependencies"
              description="Explore the application traffic dependency graph."
              href="/dependencies"
            />

            <NavCard
              title="Recommendations"
              description="Review optimization opportunities and estimated savings."
              href="/recommendations"
            />
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-5 text-[10px] text-slate-400">
          CloudShadow • Analyze → Explain → Optimize
        </footer>
      </div>
    </div>
  );
}

function NavCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = href;
      }}
      className="cloud-card cloud-card-hover group p-5 text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            {title}
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <span className="rounded-lg bg-teal-50 px-2.5 py-2 text-sm font-bold text-teal-600">
          →
        </span>
      </div>
    </button>
  );
}