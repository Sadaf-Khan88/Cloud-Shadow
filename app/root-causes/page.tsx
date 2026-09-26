"use client";

import Link from "next/link";
import Sidebar from "../Sidebar";
import { cloudAnalysis } from "../cloudData";

function SignalBar({
  label,
  value,
  width,
  tone,
}: {
  label: string;
  value: string;
  width: string;
  tone: "red" | "orange" | "amber";
}) {
  const styles = {
    red: {
      text: "text-red-600",
      bg: "bg-red-500",
      track: "bg-red-50",
    },
    orange: {
      text: "text-orange-600",
      bg: "bg-orange-500",
      track: "bg-orange-50",
    },
    amber: {
      text: "text-amber-600",
      bg: "bg-amber-500",
      track: "bg-amber-50",
    },
  };

  const style = styles[tone];

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className={`font-bold ${style.text}`}>{value}</span>
      </div>

      <div
        className={`mt-2 h-2 overflow-hidden rounded-full ${style.track}`}
      >
        <div
          className={`h-full rounded-full ${style.bg}`}
          style={{ width }}
        />
      </div>
    </div>
  );
}

export default function RootCausePage() {
  const rootCause = cloudAnalysis.rootCause;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <Sidebar />

      <section className="lg:ml-[250px]">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/90 px-6 py-7 backdrop-blur-xl lg:px-10">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                AI-powered investigation
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
                Root Cause Analysis
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Trace the cloud bill back to the application behavior that
                triggered the increase.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70">
                  Analysis engine
                </p>
                <p className="text-sm font-semibold text-emerald-700">
                  Investigation complete
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-7 p-6 lg:p-10">
          {/* Root Cause Hero */}
          <section className="relative overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-teal-50 p-6 shadow-sm lg:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-100 blur-3xl" />

            <div className="relative grid gap-8 xl:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
                    Root cause detected
                  </span>

                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                    Automated analysis
                  </span>
                </div>

                <h2 className="mt-5 max-w-3xl text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
                  {rootCause.title}
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                  CloudShadow detected a strong relationship between increased
                  traffic from Service A, downstream requests, compute usage,
                  and network spending.
                </p>

                {/* Quick signals */}
                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Traffic
                    </p>
                    <p className="mt-1 text-2xl font-bold text-red-600">
                      +62%
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Service A</p>
                  </div>

                  <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Downstream
                    </p>
                    <p className="mt-1 text-2xl font-bold text-amber-600">
                      +48%
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Service B requests
                    </p>
                  </div>

                  <div className="rounded-xl border border-teal-100 bg-white p-4 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Network
                    </p>
                    <p className="mt-1 text-2xl font-bold text-teal-600">
                      +52%
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Cost increase
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence / Impact */}
              <div className="flex gap-3 xl:flex-col">
                <div className="flex min-w-[145px] flex-col justify-center rounded-2xl border border-red-100 bg-white p-5 text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Confidence
                  </p>

                  <p className="mt-2 text-4xl font-bold text-red-600">
                    {rootCause.confidence}%
                  </p>

                  <div className="mx-auto mt-3 h-1.5 w-full max-w-[90px] overflow-hidden rounded-full bg-red-100">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${rootCause.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="flex min-w-[145px] flex-col justify-center rounded-2xl border border-red-100 bg-white p-5 text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Impact
                  </p>

                  <p className="mt-2 text-2xl font-bold text-red-600">
                    {rootCause.impact}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Cost signal
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Causal Chain */}
          <section className="cloud-card p-6 lg:p-8">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">
                  Causal chain
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  How the cost increase propagated
                </h2>
              </div>

              <span className="text-xs font-medium text-slate-400">
                Application → Infrastructure → Bill
              </span>
            </div>

            <div className="mt-8">
              {cloudAnalysis.chain.map((item, index) => (
                <div key={item.step} className="relative">
                  <div className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition hover:border-teal-200 hover:bg-white hover:shadow-sm sm:flex-row sm:items-center">
                    {/* Step */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-sm font-bold text-teal-700">
                      {item.step}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">
                          {item.title}
                        </h3>

                        {index === 0 && (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-600">
                            Trigger
                          </span>
                        )}

                        {index === cloudAnalysis.chain.length - 1 && (
                          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-700">
                            Cost impact
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    {/* Change */}
                    <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-center">
                      <p className="text-xl font-bold text-red-600">
                        {item.change}
                      </p>
                      <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Change
                      </p>
                    </div>
                  </div>

                  {index < cloudAnalysis.chain.length - 1 && (
                    <div className="relative ml-[21px] h-7 border-l border-dashed border-slate-300">
                      <span className="absolute -bottom-1 -left-[4px] h-2 w-2 rotate-45 border-r border-b border-slate-300 bg-[#f6f8fb]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Evidence + Impact */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Evidence */}
            <section className="cloud-card p-6 lg:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                Evidence
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Signals supporting the analysis
              </h2>

              <div className="mt-6 space-y-3">
                {cloudAnalysis.evidence.map((item, index) => (
                  <div
                    key={item}
                    className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:border-emerald-200 hover:bg-white"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600">
                      {index + 1}
                    </div>

                    <div>
                      <p className="text-sm leading-6 text-slate-700">
                        {item}
                      </p>

                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Verified signal
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Impact */}
            <section className="cloud-card p-6 lg:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">
                Estimated impact
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                Where the increase appeared
              </h2>

              <div className="mt-7 space-y-6">
                <SignalBar
                  label="Network"
                  value="+52%"
                  width="78%"
                  tone="red"
                />

                <SignalBar
                  label="Compute"
                  value="+31%"
                  width="55%"
                  tone="orange"
                />

                <SignalBar
                  label="Service traffic"
                  value="+62%"
                  width="90%"
                  tone="amber"
                />
              </div>

              <div className="mt-7 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Strongest signal
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Service traffic
                  </span>

                  <span className="text-lg font-bold text-amber-600">
                    +62%
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* Explanation */}
          <section className="relative overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-blue-50 p-6 shadow-sm lg:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-teal-100 blur-3xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  CloudShadow Explanation
                </span>

                <span className="text-xs font-medium text-slate-400">
                  Behavior-aware cost analysis
                </span>
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                The bill increase is connected to application behavior.
              </h2>

              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                Instead of treating the higher cloud bill as an isolated
                infrastructure problem, CloudShadow traces the change through
                service dependencies. The strongest signal starts with Service
                A traffic, followed by increased downstream requests and
                higher compute and network usage.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600">
                  Service A
                </span>

                <span className="text-slate-300">→</span>

                <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600">
                  Service B
                </span>

                <span className="text-slate-300">→</span>

                <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600">
                  Compute
                </span>

                <span className="text-slate-300">→</span>

                <span className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2 font-semibold text-teal-700">
                  Network Cost
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/dependencies"
                  className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                >
                  View dependency graph →
                </Link>

                <Link
                  href="/recommendations"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                >
                  See recommendations
                </Link>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
            <span>CloudShadow • Root Cause Intelligence</span>
            <span>Detect → Trace → Explain</span>
          </div>
        </div>
      </section>
    </main>
  );
}