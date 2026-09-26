"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Sidebar from "../Sidebar";
import { cloudAnalysis, formatINR, formatLakhs } from "../cloudData";

const periods = ["7D", "30D", "90D"];

const services = cloudAnalysis.services;
const categories = cloudAnalysis.categories;
const trend = cloudAnalysis.trend;

export default function CostsPage() {
  const [period, setPeriod] = useState("30D");
  const [category, setCategory] = useState("All");
  const [selectedService, setSelectedService] = useState("Service A");
  const [showDetails, setShowDetails] = useState(false);

  const filteredServices = useMemo(() => {
    if (category === "All") return services;

    return services.filter((service) => service.category === category);
  }, [category]);

  const selected = services.find(
    (service) => service.name === selectedService
  );

  const periodLabel =
    period === "7D"
      ? "Last 7 days"
      : period === "90D"
        ? "Last 90 days"
        : "Last 30 days";

  const { overview } = cloudAnalysis;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <section className="lg:ml-[250px]">
        {/* HEADER */}
        <header className="border-b border-slate-200 bg-white">
          <div className="px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">
                    Financial intelligence
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Cost Analysis
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Explore spending patterns, identify cost drivers, and
                  understand what changed inside your cloud environment.
                </p>
              </div>

              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                {periods.map((item) => {
                  const active = period === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPeriod(item)}
                      className={
                        "rounded-lg px-4 py-2 text-xs font-bold transition " +
                        (active
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-500 hover:bg-white hover:text-slate-800")
                      }
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-7 p-5 sm:p-7 lg:p-10">
          {/* CONTEXT */}
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-teal-100 bg-teal-50/70 p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-teal-600 shadow-sm ring-1 ring-teal-100">
                ◈
              </span>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Analysis window
                </p>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Showing cloud spending for {periodLabel.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Analysis engine ready
            </div>
          </div>

          {/* SUMMARY */}
          <section>
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Financial overview
              </p>

              <h2 className="mt-1 text-sm font-semibold text-slate-700">
                Where your cloud spending stands
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {/* CURRENT COST */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    Current cost
                  </p>

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-600 ring-1 ring-teal-100">
                    ₹
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                  {formatLakhs(overview.currentCost)}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-600">
                    +{overview.overallChange}%
                  </span>

                  <span className="text-xs text-slate-400">
                    vs previous
                  </span>
                </div>
              </div>

              {/* PREVIOUS COST */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    Previous cost
                  </p>

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-500 ring-1 ring-slate-200">
                    ↙
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                  {formatLakhs(overview.previousCost)}
                </p>

                <p className="mt-3 text-xs text-slate-400">
                  Previous billing period
                </p>
              </div>

              {/* NETWORK */}
              <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    Network cost
                  </p>

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 font-bold text-red-600 ring-1 ring-red-100">
                    ⌁
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                  {formatLakhs(overview.networkCost)}
                </p>

                <p className="mt-3 text-xs font-bold text-red-600">
                  +{overview.networkChange}% increase
                </p>
              </div>

              {/* COMPUTE */}
              <div className="rounded-2xl border border-amber-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    Compute cost
                  </p>

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 font-bold text-amber-600 ring-1 ring-amber-100">
                    ◈
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
                  {formatLakhs(overview.computeCost)}
                </p>

                <p className="mt-3 text-xs font-bold text-amber-600">
                  +{overview.computeChange}% increase
                </p>
              </div>
            </div>
          </section>

          {/* TREND */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-start">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Cloud spending trend
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Daily spending movement • {periodLabel}
                </p>
              </div>

              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-[9px] font-bold text-teal-700 ring-1 ring-teal-100">
                LIVE VIEW
              </span>
            </div>

            <div className="p-6">
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Latest daily spend
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {formatINR(trend[trend.length - 1].cost)}
                  </p>
                </div>

                <span className="rounded-full bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-600">
                  Rising trend
                </span>
              </div>

              <div className="relative h-60">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                  {[1, 2, 3, 4, 5].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-slate-100"
                    />
                  ))}
                </div>

                <div className="relative flex h-full items-end gap-2 sm:gap-5">
                  {trend.map((item, index) => {
                    const active = index === trend.length - 1;

                    return (
                      <div
                        key={item.date}
                        className="group flex h-full flex-1 items-end justify-center"
                      >
                        <div className="relative flex h-full w-full max-w-12 items-end">
                          <div
                            className={
                              "w-full rounded-t-xl transition-all duration-300 " +
                              (active
                                ? "bg-teal-500 shadow-[0_0_18px_rgba(20,184,166,0.2)]"
                                : "bg-teal-100 group-hover:bg-teal-300")
                            }
                            style={{ height: item.value + "%" }}
                          />

                          <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-bold text-slate-700 opacity-0 shadow-lg transition group-hover:opacity-100">
                            {formatINR(item.cost)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex justify-between text-[9px] font-medium text-slate-400 sm:text-[10px]">
                {trend.map((item) => (
                  <span key={item.date}>{item.date}</span>
                ))}
              </div>
            </div>
          </section>

          {/* SERVICES + CATEGORIES */}
          <section className="grid gap-6 lg:grid-cols-3">
            {/* SERVICES */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Service-wise cost
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Select a service to investigate its spending behaviour
                  </p>
                </div>

                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-teal-400"
                >
                  <option value="All">All categories</option>
                  <option value="Compute">Compute</option>
                  <option value="Network">Network</option>
                  <option value="Database">Database</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4 font-bold">Service</th>
                      <th className="px-4 py-4 font-bold">Category</th>
                      <th className="px-4 py-4 font-bold">Current</th>
                      <th className="px-4 py-4 font-bold">Previous</th>
                      <th className="px-6 py-4 text-right font-bold">
                        Change
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredServices.map((service) => {
                      const active = selectedService === service.name;

                      return (
                        <tr
                          key={service.name}
                          onClick={() => {
                            setSelectedService(service.name);
                            setShowDetails(true);
                          }}
                          className={
                            "cursor-pointer border-b border-slate-100 transition " +
                            (active
                              ? "bg-teal-50/60"
                              : "hover:bg-slate-50")
                          }
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <span
                                className={
                                  "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold " +
                                  (active
                                    ? "bg-teal-100 text-teal-700"
                                    : "bg-slate-100 text-slate-500")
                                }
                              >
                                ◈
                              </span>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {service.name}
                                </p>

                                <div className="mt-2 h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-teal-500"
                                    style={{ width: service.width + "%" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-5">
                            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                              {service.category}
                            </span>
                          </td>

                          <td className="px-4 py-5 font-semibold text-slate-800">
                            {formatINR(service.current)}
                          </td>

                          <td className="px-4 py-5 text-slate-400">
                            {formatINR(service.previous)}
                          </td>

                          <td className="px-6 py-5 text-right">
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                              +{service.change}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredServices.length === 0 && (
                <div className="p-10 text-center text-sm text-slate-400">
                  No services found for this category.
                </div>
              )}
            </div>

            {/* CATEGORY */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900">
                Cost by category
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Current spending distribution
              </p>

              <div className="mt-7 space-y-6">
                {categories.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600">
                        {item.name}
                      </span>

                      <span className="text-sm font-bold text-slate-900">
                        {formatLakhs(item.cost)}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={"h-full rounded-full " + item.color}
                        style={{ width: item.percentage * 2.7 + "%" }}
                      />
                    </div>

                    <div className="mt-2 flex justify-between">
                      <span className="text-[10px] text-slate-400">
                        Share of total
                      </span>

                      <span className="text-[10px] font-bold text-slate-500">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-xl bg-teal-50 p-4 ring-1 ring-teal-100">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-600">
                  Largest category
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  Network
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Network represents the largest visible share of current
                  cloud spending.
                </p>
              </div>
            </div>
          </section>

          {/* SELECTED SERVICE */}
          {showDetails && selected && (
            <section className="rounded-2xl border border-teal-200 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 font-bold text-teal-600 ring-1 ring-teal-100">
                    ◈
                  </span>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-600">
                      Selected service
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      {selected.name}
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowDetails(false)}
                  className="w-fit rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
                >
                  Close
                </button>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-500">
                    Cost increase
                  </p>

                  <p className="mt-2 text-xl font-bold text-red-700">
                    +{selected.change}%
                  </p>
                </div>

                <div className="rounded-xl bg-teal-50 p-4 ring-1 ring-teal-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                    Traffic signal
                  </p>

                  <p className="mt-2 text-xl font-bold text-teal-700">
                    +{selected.traffic}%
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Impact
                  </p>

                  <p className="mt-2 text-xl font-bold text-amber-700">
                    {selected.impact}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  Intelligence signal
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selected.description}
                </p>
              </div>
            </section>
          )}

          {/* COST INTELLIGENCE */}
          <section className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-orange-50 p-6 shadow-sm sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 font-bold text-red-600 ring-1 ring-red-200">
                  !
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-600">
                    Cost intelligence
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-950">
                    Network spending is the strongest cost signal.
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Network cost increased by{" "}
                    <span className="font-bold text-red-600">
                      +{overview.networkChange}%
                    </span>
                    . The application behaviour behind this increase can be
                    investigated through Root Cause and Dependency analysis.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/root-causes"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                >
                  Investigate Root Cause →
                </Link>

                <Link
                  href="/recommendations"
                  className="rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  View Recommendations →
                </Link>
              </div>
            </div>
          </section>

          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[10px] text-slate-400 sm:flex-row">
            <span>CloudShadow • Cost Intelligence</span>

            <span>Tracking spending patterns &amp; billing signals</span>
          </footer>
        </div>
      </section>
    </main>
  );
}