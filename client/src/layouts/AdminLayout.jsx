import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { path: "/", label: "Event Types", icon: "M4 4h8v2H4V4zm0 4h12v2H4V8zm0 4h10v2H4v-2z" },
  { path: "/availability", label: "Availability", icon: "M8 1a7 7 0 110 14A7 7 0 018 1zm0 2a5 5 0 100 10A5 5 0 008 3zm-.5 2h1v3.5l2.5 1.5-.5.87-3-1.87V5z" },
  { path: "/meetings", label: "Meetings", icon: "M2 3h12a1 1 0 011 1v8a1 1 0 01-1 1H2a1 1 0 01-1-1V4a1 1 0 011-1zm0 3v6h12V6H2zm2-4h1v2H4zm7 0h1v2h-1z" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <div
        className={`fixed inset-0 bg-black/30 z-30 lg:hidden transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-60 bg-white border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-5 py-5 border-b border-border">
          <h1 className="text-lg font-bold text-primary tracking-tight">Calendly</h1>
          <p className="text-xs text-text-secondary mt-0.5">Scheduling made simple</p>
        </div>


        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-light text-primary border-l-3 border-primary"
                    : "text-text-secondary hover:bg-surface hover:text-text-primary"
                }`
              }
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Admin</p>
              <p className="text-xs text-text-secondary">admin@calendly.com</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 bg-white border-b border-border px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-text-secondary hover:text-text-primary rounded-md hover:bg-surface cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
