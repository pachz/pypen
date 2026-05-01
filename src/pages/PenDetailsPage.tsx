import { useQuery } from "convex/react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { TopNav } from "../components/TopNav";

function formatTime(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(ts));
}

export function PenDetailsPage() {
  const { penId: penIdParam } = useParams<{ penId: string }>();
  const penId = penIdParam as Id<"pens"> | undefined;

  const pen = useQuery(api.pens.getPen, penId ? { penId } : "skip");

  useEffect(() => {
    if (pen?.title) {
      document.title = `${pen.title} · PyPen`;
    }
    return () => {
      document.title = "PyPen";
    };
  }, [pen?.title]);

  if (penId === undefined) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TopNav />
        <p className="p-6 text-slate-400">Invalid pen URL.</p>
      </div>
    );
  }

  if (pen === undefined) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TopNav
          penToolbar={
            <Link
              to={`/pen/${penId}`}
              className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-400 hover:border-white/30 hover:text-white sm:text-sm"
            >
              Editor
            </Link>
          }
        />
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  if (pen === null) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <TopNav />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
          <p className="text-slate-400">This pen does not exist or is private.</p>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-accent hover:underline"
          >
            Back to your pens
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopNav
        penTitle={pen.title}
        penToolbar={
          <>
            <Link
              to={`/pen/${pen._id}`}
              className="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-surface-950 hover:bg-sky-300 sm:px-4 sm:py-2 sm:text-sm"
            >
              Editor
            </Link>
            <Link
              to={`/full/${pen._id}`}
              className="cursor-pointer rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white hover:border-white/40 sm:py-2 sm:text-sm"
            >
              Full page
            </Link>
          </>
        }
      />
      <div className="mx-auto max-w-2xl flex-1 space-y-8 overflow-y-auto px-4 py-8 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
            Pen details
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white">
            {pen.title}
          </h1>
          <p className="mt-2 text-slate-400">
            by{" "}
            <span className="font-medium text-slate-300">
              {pen.authorUsername}
            </span>
          </p>
        </div>

        <dl className="grid gap-4 rounded-2xl border border-white/10 bg-surface-900/50 p-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Visibility
            </dt>
            <dd className="mt-1 text-sm text-white">
              {pen.isPublic ? "Public" : "Private"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Last updated
            </dt>
            <dd className="mt-1 text-sm text-slate-300">
              {formatTime(pen.updatedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Created
            </dt>
            <dd className="mt-1 text-sm text-slate-300">
              {formatTime(pen.createdAt)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-xl px-5 py-2.5 text-sm text-slate-400 hover:text-white"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}
