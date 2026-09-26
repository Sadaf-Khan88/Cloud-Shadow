"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "../Sidebar";
import { cloudAnalysis, formatINR } from "../cloudData";

const recommendations = cloudAnalysis.recommendations;

export default function RecommendationsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const totalSaving = recommendations.reduce(
    (sum, item) => sum + item.saving,
    0
  );

  const selectedRecommendation = recommendations.find(
    (item) => item.id === selectedId
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <Sidebar />

      <section className="min-h-screen lg:ml-[250px]">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur-xl lg:px-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Optimization Engine
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Cost Recommendations
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                AI-driven actions to reduce cloud spending safely.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70">
                Analysis status
              </p>

              <div className="mt-1 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]" />

                <span className="text-sm font-semibold text-emerald-700">
                  Complete
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-7 p-6 lg:p-10">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-blue-50 p-7 shadow-sm lg:p-9">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-100 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-blue-100 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 shadow-sm">
                  <span className="text-teal-600">✦</span>
                  CloudShadow Intelligence
                </div>

                <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight text-slate-900 lg:text-4xl">
                  Turn cloud waste into
                  <span className="text-teal-600"> actionable savings.</span>
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                  CloudShadow analyzed your application behavior, service
                  dependencies, traffic patterns and cloud spending to identify
                  optimization opportunities.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                    Cost aware
                  </span>

                  <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    Performance aware
                  </span>

                  <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    Reliability aware
                  </span>
                </div>
              </div>

              <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-md lg:min-w-[240px]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Potential monthly saving
                </p>

                <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
                  {formatINR(totalSaving)}
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
                    ✓
                  </span>
                  Without reducing reliability
                </div>
              </div>
            </div>
          </section>

          {/* SUMMARY */}
          <section className="grid gap-4 md:grid-cols-3">
            <div className="cloud-card cloud-card-hover p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Opportunities
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-bold text-slate-900">
                  {String(recommendations.length).padStart(2, "0")}
                </p>

                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                  Detected
                </span>
              </div>
            </div>

            <div className="cloud-card cloud-card-hover p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Potential Saving
              </p>

              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-3xl font-bold text-slate-900">
                  {formatINR(totalSaving)}
                </p>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  / month
                </span>
              </div>
            </div>

            <div className="cloud-card cloud-card-hover p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Reliability Risk
              </p>

              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-bold text-slate-900">Low</p>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Protected
                </span>
              </div>
            </div>
          </section>

          {/* RECOMMENDATIONS */}
          <section>
            <div className="mb-5 flex flex-col justify-between gap-2 md:flex-row md:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">
                  Recommended actions
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  Optimization opportunities
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ranked by estimated impact and confidence.
                </p>
              </div>

              <div className="text-xs font-medium text-slate-400">
                Based on current cloud behavior
              </div>
            </div>

            <div className="space-y-5">
              {recommendations.map((item) => (
                <article
                  key={item.id}
                  className={`cloud-card relative overflow-hidden transition-all duration-200 ${
                    selectedId === item.id
                      ? "border-teal-300 shadow-md"
                      : "cloud-card-hover"
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 w-1 ${
                      item.priority === "HIGH"
                        ? "bg-red-500"
                        : "bg-amber-500"
                    }`}
                  />

                  <div className="p-6 lg:p-7">
                    <div className="grid gap-7 lg:grid-cols-[auto_1fr_auto]">
                      {/* NUMBER */}
                      <div className="hidden lg:block">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-400">
                          {item.id}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              item.priority === "HIGH"
                                ? "border border-red-100 bg-red-50 text-red-600"
                                : "border border-amber-100 bg-amber-50 text-amber-600"
                            }`}
                          >
                            {item.priority} Priority
                          </span>

                          <span className="rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
                            {item.confidence}% confidence
                          </span>
                        </div>

                        <h3 className="mt-4 text-xl font-bold tracking-tight text-slate-900">
                          {item.title}
                        </h3>

                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                          {item.reason}
                        </p>

                        {/* METRICS */}
                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Performance
                            </p>

                            <p className="mt-1 text-sm font-semibold text-emerald-600">
                              {item.performance}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Reliability
                            </p>

                            <p className="mt-1 text-sm font-semibold text-emerald-600">
                              {item.reliability}
                            </p>
                          </div>

                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Expected impact
                            </p>

                            <p className="mt-1 text-sm font-semibold text-slate-700">
                              {item.impact}
                            </p>
                          </div>
                        </div>

                        {/* CONFIDENCE */}
                        <div className="mt-5 max-w-xl">
                          <div className="mb-2 flex justify-between text-[11px]">
                            <span className="font-medium text-slate-400">
                              AI confidence
                            </span>

                            <span className="font-semibold text-slate-600">
                              {item.confidence}%
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-700"
                              style={{
                                width: `${item.confidence}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* SAVING PANEL */}
                      <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:min-w-[205px]">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Estimated saving
                          </p>

                          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                            {formatINR(item.saving)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            per month
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedId(
                              selectedId === item.id ? null : item.id
                            )
                          }
                          className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                            selectedId === item.id
                              ? "border border-teal-200 bg-teal-50 text-teal-700"
                              : "border border-teal-100 bg-white text-teal-700 shadow-sm hover:border-teal-200 hover:bg-teal-50"
                          }`}
                        >
                          {selectedId === item.id
                            ? "Hide analysis"
                            : "View analysis"}

                          <span
                            className={`transition-transform ${
                              selectedId === item.id ? "rotate-90" : ""
                            }`}
                          >
                            →
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EXPANDED ANALYSIS */}
                  {selectedId === item.id && (
                    <div className="border-t border-teal-100 bg-teal-50/50 px-6 py-5 lg:px-7">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-600">
                            Recommendation analysis
                          </p>

                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            CloudShadow estimates{" "}
                            <span className="font-bold text-slate-900">
                              {formatINR(item.saving)}
                            </span>{" "}
                            in monthly savings by addressing the identified
                            behavior while maintaining the current reliability
                            profile.
                          </p>
                        </div>

                        <Link
                          href="/root-causes"
                          className="shrink-0 rounded-xl border border-teal-200 bg-white px-4 py-2.5 text-xs font-semibold text-teal-700 shadow-sm transition hover:bg-teal-50"
                        >
                          Trace root cause →
                        </Link>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          {/* INTELLIGENCE */}
          <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-teal-50 p-7 shadow-sm lg:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-100 blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-violet-600">
                  ✦
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">
                    CloudShadow Intelligence
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Optimize behavior, not blindly reduce resources.
                  </h2>
                </div>
              </div>

              <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-500">
                These recommendations are connected to the detected root cause.
                Instead of simply removing infrastructure, CloudShadow looks
                at traffic patterns, service dependencies, performance and
                reliability before suggesting an optimization.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                  Cost aware
                </span>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                  Performance aware
                </span>

                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">
                  Reliability aware
                </span>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
            <span>CloudShadow • Intelligent Cloud Cost Analysis</span>

            <span>Analyze → Explain → Optimize</span>
          </footer>
        </div>
      </section>
    </main>
  );
}