import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link, NavLink } from "react-router-dom";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-white/10 text-white"
      : "text-slate-400 hover:bg-white/5 hover:text-white",
  ].join(" ");

export function TopNav() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();

  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-white/10 bg-surface-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between px-3 sm:h-16 sm:px-4">
        <Link
          to="/"
          className="font-display text-lg font-semibold tracking-tight text-white sm:text-xl"
        >
          PyPen
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" className={navLinkClass} end>
            Explore
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Your pens
              </NavLink>
              <button
                type="button"
                className="ml-1 rounded-lg border border-white/15 px-2 py-1.5 text-xs text-slate-300 transition-colors hover:border-white/25 hover:text-white sm:ml-2 sm:px-3 sm:py-2 sm:text-sm"
                onClick={() => void signOut()}
              >
                Sign out
              </button>
            </>
          ) : !isLoading ? (
            <NavLink
              to="/auth"
              className="ml-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface-950 transition hover:bg-sky-300 sm:ml-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              Sign in
            </NavLink>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
