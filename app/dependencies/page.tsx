"use client";

import { useMemo, useState } from "react";
import Sidebar from "../Sidebar";
import { cloudAnalysis } from "../cloudData";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
} from "reactflow";

import "reactflow/dist/style.css";

const serviceDetails: Record<
  string,
  {
    type: string;
    status: string;
    traffic: string;
    cost: string;
    latency: string;
    description: string;
  }
> = {
  api: {
    type: "ENTRY POINT",
    status: "Healthy",
    traffic: "+33%",
    cost: "₹96K",
    latency: "51 ms",
    description:
      "API Gateway receives incoming application traffic and routes requests into the service layer.",
  },
  "service-a": {
    type: "APPLICATION SERVICE",
    status: "Critical",
    traffic: "+62%",
    cost: "₹1.80L",
    latency: "82 ms",
    description:
      "Service A is the strongest upstream signal. Increased traffic is generating additional downstream requests.",
  },
  "service-b": {
    type: "DOWNSTREAM SERVICE",
    status: "Warning",
    traffic: "+48%",
    cost: "₹1.42L",
    latency: "76 ms",
    description:
      "Service B receives additional requests from Service A, increasing compute and network consumption.",
  },
  database: {
    type: "DATA LAYER",
    status: "Healthy",
    traffic: "+18%",
    cost: "₹1.24L",
    latency: "64 ms",
    description:
      "The database is downstream from Service B and shows increased workload as request volume propagates.",
  },
};

function CustomNode({
  data,
}: {
  data: {
    label: React.ReactNode;
    selected?: boolean;
  };
}) {
  return (
    <div
      className={`group min-w-[220px] rounded-2xl border px-5 py-4 transition-all duration-200 ${
        data.selected
          ? "border-teal-300 bg-teal-50 shadow-lg shadow-teal-100/60"
          : "border-slate-200 bg-white shadow-md hover:border-teal-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!h-2 !w-2 !border-0 !bg-teal-500"
      />

      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
              data.selected ? "bg-teal-100" : "bg-slate-100"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                data.selected ? "bg-teal-600" : "bg-slate-400"
              }`}
            />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            Service
          </span>
        </div>

        {data.selected && (
          <span className="rounded-full bg-teal-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-teal-700">
            Selected
          </span>
        )}
      </div>

      {data.label}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!h-2 !w-2 !border-0 !bg-teal-500"
      />
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export default function DependenciesPage() {
  const [selectedId, setSelectedId] = useState("service-a");

  const nodes = useMemo<Node[]>(
    () =>
      cloudAnalysis.dependencies.nodes.map((node, index) => ({
        id: node.id,
        position: {
          x: 380,
          y: index * 145 + 40,
        },
        data: {
          label: (
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {node.label}
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {node.description}
              </p>
            </div>
          ),
          selected: node.id === selectedId,
        },
        type: "custom",
      })),
    [selectedId]
  );

  const edges = useMemo<Edge[]>(
    () =>
      cloudAnalysis.dependencies.edges.map((edge, index) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: true,
        style: {
          stroke: index === 1 ? "#14b8a6" : "#94a3b8",
          strokeWidth: index === 1 ? 3 : 2,
        },
      })),
    []
  );

  const selected = serviceDetails[selectedId];

  const selectedNode = cloudAnalysis.dependencies.nodes.find(
    (node) => node.id === selectedId
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <Sidebar />

      <section className="min-h-screen lg:ml-[250px]">
        {/* HEADER */}
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-6 py-5 backdrop-blur-xl lg:px-10">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                Application topology
              </div>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Dependency Intelligence
              </h1>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                Explore how application traffic propagates across services and
                contributes to cloud spending.
              </p>
            </div>

            <div className="flex gap-3">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nodes
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">04</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Connections
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">03</p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70">
                  Status
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-700">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="space-y-7 p-6 lg:p-10">
          {/* GRAPH + DETAILS */}
          <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
            {/* GRAPH */}
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center lg:p-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">
                      Live topology
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-bold text-slate-900">
                    Application traffic flow
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Click any service to inspect its infrastructure impact.
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                  Click nodes to inspect
                </div>
              </div>

              <div className="h-[620px] bg-slate-50">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  fitView
                  fitViewOptions={{
                    padding: 0.25,
                  }}
                  onNodeClick={(_, node) => setSelectedId(node.id)}
                  attributionPosition="bottom-left"
                >
                  <Background
                    color="#cbd5e1"
                    gap={24}
                    size={1}
                  />

                  <Controls
                    className="!overflow-hidden !rounded-xl !border !border-slate-200 !bg-white [&>button]:!border-slate-100 [&>button]:!bg-white [&>button]:!fill-slate-500"
                  />

                  <MiniMap
                    nodeColor="#14b8a6"
                    maskColor="rgba(241,245,249,0.75)"
                    className="!overflow-hidden !rounded-xl !border !border-slate-200 !bg-white"
                  />
                </ReactFlow>
              </div>
            </div>

            {/* SELECTED SERVICE PANEL */}
            <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
                  Selected service
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    selected.status === "Critical"
                      ? "bg-red-50 text-red-600"
                      : selected.status === "Warning"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {selected.status}
                </span>
              </div>

              <div className="mt-7">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {selected.type}
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  {selectedNode?.label}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {selected.description}
                </p>
              </div>

              <div className="my-7 h-px bg-slate-200" />

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Traffic change
                  </p>

                  <p className="mt-2 text-xl font-bold text-teal-600">
                    {selected.traffic}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Cloud cost
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {selected.cost}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Latency
                  </p>

                  <p className="mt-2 text-xl font-bold text-slate-900">
                    {selected.latency}
                  </p>
                </div>
              </div>

              {selectedId === "service-a" && (
                <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                    Root cause signal
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Service A is currently the strongest upstream signal in
                    the dependency chain.
                  </p>
                </div>
              )}
            </aside>
          </section>

          {/* PATH */}
          <section className="rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 via-white to-blue-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-600">
                  Dependency path
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-900">
                  Primary traffic propagation
                </h2>
              </div>

              <span className="text-xs font-medium text-slate-400">
                Application → infrastructure
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600">
                API Gateway
              </span>

              <span className="text-teal-500">→</span>

              <span className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
                Service A +62%
              </span>

              <span className="text-teal-500">→</span>

              <span className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-600">
                Service B +48%
              </span>

              <span className="text-teal-500">→</span>

              <span className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600">
                Database +18%
              </span>
            </div>
          </section>

          {/* SIGNALS */}
          <section className="grid gap-5 md:grid-cols-3">
            <div className="cloud-card cloud-card-hover p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-600">
                Traffic signal
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">+62%</p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Service A traffic is the strongest upstream change.
              </p>
            </div>

            <div className="cloud-card cloud-card-hover p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
                Compute signal
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">+31%</p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Additional requests increased compute consumption.
              </p>
            </div>

            <div className="cloud-card cloud-card-hover p-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                Network signal
              </p>

              <p className="mt-3 text-3xl font-bold text-slate-900">+52%</p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Service-to-service traffic increased network spending.
              </p>
            </div>
          </section>

          {/* INTELLIGENCE */}
          <section className="relative overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-teal-50 p-7 shadow-sm lg:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-100 blur-3xl" />

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
                    The dependency graph explains the cost chain.
                  </h2>
                </div>
              </div>

              <p className="mt-5 max-w-4xl text-sm leading-7 text-slate-600">
                Increased traffic enters through the API Gateway, propagates
                through Service A and Service B, and creates additional
                downstream workload. CloudShadow connects this behavior to
                higher compute and network consumption.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
                  Trigger: Service A
                </span>

                <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600">
                  Propagation: Service B
                </span>

                <span className="rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                  Cost: Network
                </span>
              </div>
            </div>
          </section>

          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-6 text-xs text-slate-400 sm:flex-row">
            <span>CloudShadow • Dependency Intelligence</span>
            <span>Trace → Connect → Explain</span>
          </footer>
        </div>
      </section>
    </main>
  );
}