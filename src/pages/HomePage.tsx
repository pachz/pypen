import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "../../convex/_generated/api";

function formatTime(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

export function HomePage() {
  const pens = useQuery(api.pens.listPublicPens, { limit: 24 });

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface-850 via-surface-900 to-surface-950 px-8 py-14 sm:px-12">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          Front-end playground
        </p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
          Sketch HTML, CSS, and JavaScript with a live preview.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-400">
          PyPen is a focused editor for quick UI experiments—split panes, instant
          preview, and optional CDN scripts when you need a library.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/auth"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-surface-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-300"
          >
            Create an account
          </Link>
          <a
            href="#pens"
            className="rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white transition hover:border-white/40"
          >
            Browse public pens
          </a>
        </div>
      </section>

      <section id="pens" className="scroll-mt-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold text-white">
              Public pens
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Recently updated pens from the community.
            </p>
          </div>
        </div>

        {pens === undefined ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-surface-850/80"
              />
            ))}
          </div>
        ) : pens.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-surface-900/50 px-8 py-16 text-center">
            <p className="text-slate-400">
              No public pens yet. Be the first to publish one.
            </p>
            <Link
              to="/auth"
              className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
            >
              Sign up to create a pen
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pens.map((pen) => (
              <li key={pen._id}>
                <Link
                  to={`/pen/${pen._id}`}
                  className="group block rounded-2xl border border-white/10 bg-surface-900/60 p-5 transition hover:border-accent/40 hover:bg-surface-850/80"
                >
                  <h3 className="font-display font-semibold text-white group-hover:text-accent">
                    {pen.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    <span className="text-slate-400">{pen.authorUsername}</span>
                    <span className="mx-2 text-slate-600">·</span>
                    {formatTime(pen.updatedAt)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
