"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Overview", href: "/" },
  { name: "Cost Analysis", href: "/costs" },
  { name: "Services", href: "/services" },
  { name: "Root Cause", href: "/root-causes" },
  { name: "Dependencies", href: "/dependencies" },
  { name: "Recommendations", href: "/recommendations" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-800 bg-slate-950 lg:block">
      <div className="flex h-full flex-col">

        {/* Logo */}
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-2xl font-bold text-white">
            CloudShadow
          </h1>

          <p className="mt-1 text-xs text-slate-400">
            Intelligent Cloud Cost Analysis
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-800 p-4">
          <p className="text-xs text-slate-500">
            Cloud Intelligence Platform
          </p>
        </div>

      </div>
    </aside>
  );
}