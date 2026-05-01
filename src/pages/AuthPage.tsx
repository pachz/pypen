import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

type Mode = "signIn" | "signUp";

export function AuthPage() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const [mode, setMode] = useState<Mode>("signIn");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, from]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("flow", mode === "signUp" ? "signUp" : "signIn");
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  if (isLoading || isAuthenticated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-3xl border border-white/10 bg-surface-900/70 p-8 shadow-xl shadow-black/40">
        <h1 className="font-display text-2xl font-bold text-white">
          {mode === "signIn" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {mode === "signIn"
            ? "Sign in with email and password."
            : "We will generate a unique username from your email."}
        </p>

        <div className="mt-6 flex rounded-xl bg-surface-950 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === "signIn"
                ? "bg-surface-800 text-white shadow"
                : "text-slate-500 hover:text-white"
            }`}
            onClick={() => {
              setMode("signIn");
              setError(null);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              mode === "signUp"
                ? "bg-surface-800 text-white shadow"
                : "text-slate-500 hover:text-white"
            }`}
            onClick={() => {
              setMode("signUp");
              setError(null);
            }}
          >
            Sign up
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-400">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 w-full rounded-xl border border-white/10 bg-surface-950 px-4 py-3 text-sm text-white outline-none ring-accent/40 placeholder:text-slate-600 focus:border-accent/50 focus:ring-2"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-slate-400"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === "signUp" ? "new-password" : "current-password"
              }
              required
              minLength={8}
              className="mt-1 w-full rounded-xl border border-white/10 bg-surface-950 px-4 py-3 text-sm text-white outline-none ring-accent/40 placeholder:text-slate-600 focus:border-accent/50 focus:ring-2"
              placeholder="At least 8 characters"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-surface-950 transition hover:bg-sky-300 disabled:opacity-60"
          >
            {pending ? "Please wait…" : mode === "signIn" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          <Link to="/" className="text-accent hover:underline">
            Back to explore
          </Link>
        </p>
      </div>
    </div>
  );
}
