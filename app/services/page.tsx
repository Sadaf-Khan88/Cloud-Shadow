"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Sidebar from "../Sidebar";
import { cloudAnalysis, formatINR } from "../cloudData";

const services = cloudAnalysis.services;

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Critical"
      ? "bg-red-50 text-red-700 ring-red-100"
      : status === "Warning"
        ? "bg-amber-50 text-amber-700 ring-amber-100"
        : "bg-emerald-50 text-emerald-700 ring-emerald-100";

  const dot =
    status === "Critical"
      ? "bg-red-500"
      : status === "Warning"
        ? "bg-amber-500"
        : "bg-emerald-500";

  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold ring-1 " +
        styles
      }
    >
      <span className={"h-1.5 w-1.5 rounded-full " + dot} />
      {status}
    </span>
  );
}

function ServiceIcon({ name }: { name: string }) {
  const label =
    name === "Service A"
      ? "A"
      : name === "Service B"
        ? "B"
        : name === "Database"
          ? "DB"
          : "API";

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-700 ring-1 ring-teal-100">
      {label}
    </span>
  );
}

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedName, setSelectedName] = useState("Service A");
  const [showDetails, setShowDetails] = useState(true);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        service.name.toLowerCase().includes(search.toLowerCase()) ||
        service.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || service.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const selectedService = services.find(
    (service) => service.name === selectedName
  );

  const criticalCount = services.filter(
    (service) => service.status === "Critical"
  ).length;

  const warningCount = services.filter(
    (service) => service.status === "Warning"
  ).length;

  const healthyCount = services.filter(
    (service) => service.status === "Healthy"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Sidebar />

      <section className="lg:ml-[250px]">
        {/* HEADER */}
        <header className="border-b border-slate-200 bg-white">
          <div className="px-5 py-7 sm:px-7 lg:px-10 lg:py-9">
            <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">
                    Cloud intelligence
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Service Intelligence
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Monitor service behaviour, infrastructure usage and the
                  signals driving your cloud spending.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-600">
                  Monitoring status
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />

                  <span className="text-xs font-bold text-emerald-700">
                    {services.length} services monitored
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-7 p-5 sm:p-7 lg:p-10">
          {/* SUMMARY */}
          <section>
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Environment health
              </p>

              <h2 className="mt-1 text-sm font-semibold text-slate-700">
                Service status at a glance
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => setStatusFilter("All")}
                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                    Total services
                  </p>

                  <span className="rounded-full bg-teal-50 px-2 py-1 text-[9px] font-bold text-teal-700">
                    LIVE
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold text-slate-950">
                  {String(services.length).padStart(2, "0")}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  Click to show all services
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("Critical")}
                className="rounded-2xl border border-red-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  Critical
                </p>

                <div className="mt-4 flex items-end justify-between">
                  <p className="text-3xl font-bold text-red-600">
                    {String(criticalCount).padStart(2, "0")}
                  </p>

                  <span className="rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-bold text-red-600">
                    Attention
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Click to filter
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("Warning")}
                className="rounded-2xl border border-amber-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  Warning
                </p>

                <div className="mt-4 flex items-end justify-between">
                  <p className="text-3xl font-bold text-amber-600">
                    {String(warningCount).padStart(2, "0")}
                  </p>

                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-bold text-amber-700">
                    Monitor
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Click to filter
                </p>
              </button>

              <button
                type="button"
                onClick={() => setStatusFilter("Healthy")}
                className="rounded-2xl border border-emerald-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                  Healthy
                </p>

                <div className="mt-4 flex items-end justify-between">
                  <p className="text-3xl font-bold text-emerald-600">
                    {String(healthyCount).padStart(2, "0")}
                  </p>

                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                    Stable
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Click to filter
                </p>
              </button>
            </div>
          </section>

          {/* TOOLBAR */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">
                  Service telemetry
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Infrastructure signals
                </h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    ⌕
                  </span>

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search services..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs text-slate-700 outline-none placeholder:text-slate-400 transition focus:border-teal-300 focus:bg-white sm:w-56"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-700 outline-none focus:border-teal-300"
                >
                  <option value="All">All statuses</option>
                  <option value="Critical">Critical</option>
                  <option value="Warning">Warning</option>
                  <option value="Healthy">Healthy</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-[10px] text-slate-400">
                Showing {filteredServices.length} of {services.length} services
              </p>

              {statusFilter !== "All" && (
                <button
                  type="button"
                  onClick={() => setStatusFilter("All")}
                  className="text-[10px] font-bold text-teal-600 hover:text-teal-700"
                >
                  Clear filter
                </button>
              )}
            </div>
          </section>

          {/* SERVICES + DETAIL */}
          <section className="grid gap-6 xl:grid-cols-3">
            <div className="grid gap-5 xl:col-span-2">
              {filteredServices.map((service) => {
                const active = selectedName === service.name;

                return (
                  <button
                    key={service.name}
                    type="button"
                    onClick={() => {
                      setSelectedName(service.name);
                      setShowDetails(true);
                    }}
                    className={
                      "group relative overflow-hidden rounded-2xl border p-6 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md " +
                      (active
                        ? "border-teal-200 bg-teal-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300")
                    }
                  >
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <ServiceIcon name={service.name} />

                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            {service.category}
                          </p>

                          <h3 className="mt-1 text-lg font-bold text-slate-900">
                            {service.name}
                          </h3>
                        </div>
                      </div>

                      <StatusBadge status={service.status} />
                    </div>

                    <div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                          Current monthly cost
                        </p>

                        <span className="text-[10px] font-semibold text-slate-400">
                          {service.impact} impact
                        </span>
                      </div>

                      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                        {formatINR(service.current)}
                      </p>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-slate-100 bg-white p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Traffic
                        </p>

                        <p className="mt-2 text-lg font-bold text-red-600">
                          +{service.traffic}%
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-white p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          CPU
                        </p>

                        <p className="mt-2 text-lg font-bold text-slate-800">
                          {service.cpu}%
                        </p>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-teal-500"
                            style={{ width: service.cpu + "%" }}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-white p-3">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Latency
                        </p>

                        <p className="mt-2 text-lg font-bold text-slate-800">
                          {service.latency}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          Intelligence signal
                        </p>

                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {service.signal}
                        </p>
                      </div>

                      <span className="text-xs font-bold text-teal-600 opacity-0 transition group-hover:opacity-100">
                        Inspect →
                      </span>
                    </div>
                  </button>
                );
              })}

              {filteredServices.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm xl:col-span-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 ring-1 ring-slate-200">
                    ⌕
                  </div>

                  <p className="mt-4 text-sm font-bold text-slate-700">
                    No services found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try another search or clear the status filter.
                  </p>
                </div>
              )}
            </div>

            {/* DETAIL PANEL */}
            <div className="xl:sticky xl:top-6 xl:self-start">
              {showDetails && selectedService ? (
                <div className="rounded-2xl border border-teal-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <ServiceIcon name={selectedService.name} />

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-teal-600">
                          Selected service
                        </p>

                        <h2 className="mt-1 text-xl font-bold text-slate-950">
                          {selectedService.name}
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDetails(false)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-700"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mt-6">
                    <StatusBadge status={selectedService.status} />
                  </div>

                  <div className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Monthly cost
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-950">
                      {formatINR(selectedService.current)}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-100">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-red-500">
                        Traffic
                      </p>

                      <p className="mt-2 text-xl font-bold text-red-700">
                        +{selectedService.traffic}%
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Latency
                      </p>

                      <p className="mt-2 text-xl font-bold text-slate-800">
                        {selectedService.latency}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                      Why it matters
                    </p>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {selectedService.reason}
                    </p>
                  </div>

                  <div className="mt-4 rounded-xl bg-red-50 p-4 ring-1 ring-red-100">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-600">
                        Cost signal
                      </p>
                    </div>

                    <p className="mt-2 text-sm font-medium text-slate-600">
                      {selectedService.signal}
                    </p>
                  </div>

                  <Link
                    href="/root-causes"
                    className="mt-5 flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    Investigate Root Cause →
                  </Link>

                  <Link
                    href="/dependencies"
                    className="mt-2 flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                  >
                    View Dependencies →
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <p className="text-sm font-bold text-slate-700">
                    Select a service
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Choose any service card to inspect its cost and behaviour
                    signals.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* MAIN INSIGHT */}
          <section className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-teal-50 p-6 shadow-sm lg:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-red-100 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-red-700 ring-1 ring-red-200">
                CloudShadow Insight
              </span>

              <span className="rounded-full bg-white px-3 py-1 text-[9px] font-bold text-slate-500 ring-1 ring-slate-200">
                Confidence {cloudAnalysis.rootCause.confidence}%
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-950">
              {cloudAnalysis.rootCause.title}.
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Service A traffic increased by{" "}
              <span className="font-bold text-slate-800">
                +{services.find((service) => service.name === "Service A")?.traffic}%
              </span>
              , followed by a{" "}
              <span className="font-bold text-slate-800">
                +{services.find((service) => service.name === "Service B")?.traffic}%
              </span>{" "}
              increase in requests to Service B. The dependency pattern
              suggests that application traffic is propagating downstream and
              increasing infrastructure usage.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-medium text-slate-400">
                  Traffic increase
                </p>

                <p className="mt-1 text-xl font-bold text-red-600">
                  +{cloudAnalysis.costImpact.serviceTraffic}%
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-medium text-slate-400">
                  Downstream requests
                </p>

                <p className="mt-1 text-xl font-bold text-amber-600">
                  +{services.find((service) => service.name === "Service B")?.traffic}%
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-medium text-slate-400">
                  Network cost
                </p>

                <p className="mt-1 text-xl font-bold text-teal-600">
                  +{cloudAnalysis.costImpact.network}%
                </p>
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[10px] text-slate-400 sm:flex-row">
            <span>CloudShadow • Service Intelligence</span>
            <span>Application behaviour → Infrastructure → Cost</span>
          </footer>
        </div>
      </section>
    </main>
  );
}