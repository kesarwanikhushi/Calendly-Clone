import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="bg-white border-b border-border px-6 py-4">
        <h1 className="text-lg font-bold text-primary tracking-tight">Calendly</h1>
      </header>
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-5xl">
          <Outlet />
        </div>
      </main>
      <footer className="text-center py-4 text-xs text-text-secondary border-t border-border">
        Powered by Calendly Clone
      </footer>
    </div>
  );
}
