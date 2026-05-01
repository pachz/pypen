import { useMutation, useQuery } from "convex/react";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ImportCodePenModal } from "../components/ImportCodePenModal";

function formatTime(ts: number) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ts));
}

export function DashboardPage() {
  const navigate = useNavigate();
  const pens = useQuery(api.pens.listMyPens, { limit: 48 });
  const createPen = useMutation(api.pens.createPen);
  const deletePen = useMutation(api.pens.deletePen);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<Id<"pens"> | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const onCreate = useCallback(async () => {
    setCreating(true);
    try {
      const id = await createPen({});
      navigate(`/pen/${id}`);
    } finally {
      setCreating(false);
    }
  }, [createPen, navigate]);

  const onCodePenImported = useCallback(
    (penId: Id<"pens">, warnings: string[]) => {
      if (warnings.length > 0) {
        window.alert(
          ["Imported with notes:", "", ...warnings.map((w) => `• ${w}`)].join(
            "\n",
          ),
        );
      }
      navigate(`/pen/${penId}`);
    },
    [navigate],
  );

  return (
    <div className="space-y-8">
      <ImportCodePenModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={onCodePenImported}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Your pens</h1>
          <p className="mt-1 text-sm text-slate-400">
            Create a new pen or jump back into an existing one.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <button
            type="button"
            disabled={creating}
            onClick={() => setImportOpen(true)}
            className="cursor-pointer rounded-xl border border-white/15 px-5 py-3 text-sm font-medium text-white transition hover:border-accent/50 hover:text-accent disabled:opacity-50"
          >
            Import from CodePen
          </button>
          <button
            type="button"
            disabled={creating}
            onClick={() => void onCreate()}
            className="cursor-pointer rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-surface-950 shadow-lg shadow-sky-500/15 transition hover:bg-sky-300 disabled:opacity-50"
          >
            {creating ? "Creating…" : "New pen"}
          </button>
        </div>
      </div>

      {pens === undefined ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl bg-surface-850/80"
            />
          ))}
        </div>
      ) : pens.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-surface-900/50 px-8 py-16 text-center">
          <p className="text-slate-400">You do not have any pens yet.</p>
          <button
            type="button"
            disabled={creating}
            onClick={() => void onCreate()}
            className="mt-4 text-sm font-medium text-accent hover:underline disabled:opacity-50"
          >
            Create your first pen
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {pens.map((pen) => (
            <li
              key={pen._id}
              className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface-900/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to={`/pen/${pen._id}`}
                  className="font-display text-lg font-semibold text-white hover:text-accent"
                >
                  {pen.title}
                </Link>
                <p className="mt-1 text-xs text-slate-500">
                  Updated {formatTime(pen.updatedAt)}
                  <span className="mx-2 text-slate-600">·</span>
                  <span
                    className={
                      pen.isPublic ? "text-emerald-400/90" : "text-slate-500"
                    }
                  >
                    {pen.isPublic ? "Public" : "Private"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  to={`/pen/${pen._id}`}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white transition hover:border-accent/50 hover:text-accent"
                >
                  Open
                </Link>
                <button
                  type="button"
                  disabled={deleting === pen._id}
                  className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300 transition hover:border-red-400 hover:bg-red-500/10 disabled:opacity-50"
                  onClick={() => {
                    if (!confirm("Delete this pen? This cannot be undone.")) {
                      return;
                    }
                    setDeleting(pen._id);
                    void deletePen({ penId: pen._id }).finally(() =>
                      setDeleting(null),
                    );
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
