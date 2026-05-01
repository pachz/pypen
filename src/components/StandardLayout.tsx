import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";

export function StandardLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <TopNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        Built with React and Convex. Pens run in a sandboxed preview.
      </footer>
    </div>
  );
}
