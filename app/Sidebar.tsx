"use client";

const navigation = [
  { name: "Overview", key: "overview", icon: "⌂" },
  { name: "Cost Analysis", key: "costs", icon: "◈" },
  { name: "Services", key: "services", icon: "▦" },
  { name: "Root Cause", key: "root-causes", icon: "⌁" },
  { name: "Dependencies", key: "dependencies", icon: "◇" },
  { name: "Recommendations", key: "recommendations", icon: "✦" },
];

type SidebarProps = {
  activeSection?: string;
  onNavigate?: (section: string) => void;
};

export default function Sidebar({
  activeSection = "overview",
}: SidebarProps) {
  const handleNavigation = (key: string) => {
    const routes: Record<string, string> = {
      overview: "/",
      costs: "/costs",
      services: "/services",
      "root-causes": "/root-causes",
      dependencies: "/dependencies",
      recommendations: "/recommendations",
    };

    const route = routes[key];

    if (!route) return;

    window.location.href = route;
  };

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}

      <aside className="fixed left-0 top-0 z-[9999] hidden h-screen w-[250px] border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">

          {/* BRAND */}
          <div className="border-b border-slate-100 px-5 py-5">
            <button
              type="button"
              onClick={() => handleNavigation("overview")}
              className="flex w-full items-center gap-3 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 ring-1 ring-teal-100">
                <div className="h-3 w-3 rounded-full bg-teal-600 shadow-[0_0_12px_rgba(13,148,136,0.35)]" />
              </div>

              <div>
                <p className="text-[16px] font-bold tracking-tight text-slate-900">
                  CloudShadow
                </p>

                <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Cloud Intelligence
                </p>
              </div>
            </button>
          </div>

          {/* WORKSPACE */}
          <div className="px-4 pt-6">
            <p className="px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Workspace
            </p>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 space-y-1 px-3 py-3">
            {navigation.map((item) => {
              const isActive = activeSection === item.key;

              return (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => handleNavigation(item.key)}
                  className={
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-200 " +
                    (isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")
                  }
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-teal-600" />
                  )}

                  <span
                    className={
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition " +
                      (isActive
                        ? "bg-white text-teal-600 shadow-sm ring-1 ring-teal-100"
                        : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-slate-600")
                    }
                  >
                    {item.icon}
                  </span>

                  <span className="flex-1">
                    {item.name}
                  </span>

                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ENGINE STATUS */}
          <div className="px-4 pb-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">

              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.35)]" />

                <span className="text-[11px] font-bold text-emerald-700">
                  Analysis Engine
                </span>

                <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-emerald-600 ring-1 ring-emerald-100">
                  Active
                </span>
              </div>

              <p className="mt-2 text-[10px] leading-4 text-emerald-700/60">
                CloudShadow is monitoring your cloud environment.
              </p>

              <div className="mt-3 h-1 overflow-hidden rounded-full bg-emerald-100">
                <div className="h-full w-full rounded-full bg-emerald-500" />
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">

              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                CloudShadow
              </p>

              <span className="rounded-md bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-400">
                v1.0
              </span>

            </div>
          </div>

        </div>
      </aside>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}

      <div className="sticky top-0 z-[9999] border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-xl lg:hidden">

        <div className="flex items-center justify-between gap-3">

          <button
            type="button"
            onClick={() => handleNavigation("overview")}
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 ring-1 ring-teal-100">
              <div className="h-2.5 w-2.5 rounded-full bg-teal-600" />
            </div>

            <div className="text-left">
              <p className="text-sm font-bold tracking-tight text-slate-900">
                CloudShadow
              </p>

              <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Cloud Intelligence
              </p>
            </div>
          </button>

          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1.5 text-[9px] font-bold text-emerald-700 ring-1 ring-emerald-100">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            ACTIVE
          </span>

        </div>

        <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          {navigation.map((item) => {
            const isActive = activeSection === item.key;

            return (
              <button
                type="button"
                key={item.key}
                onClick={() => handleNavigation(item.key)}
                className={
                  "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-semibold transition " +
                  (isActive
                    ? "border-teal-100 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-500")
                }
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </>
  );
}