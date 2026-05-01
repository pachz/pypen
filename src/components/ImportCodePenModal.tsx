import { useAction } from "convex/react";
import { useCallback, useState, type MouseEvent } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

function stop(e: MouseEvent) {
  e.stopPropagation();
}

export function ImportCodePenModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: (penId: Id<"pens">, warnings: string[]) => void;
}) {
  const importAction = useAction(api.codepenImport.importFromCodePen);
  const [urlOrId, setUrlOrId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUrlOrId("");
    setError(null);
    setBusy(false);
  }, []);

  const handleClose = useCallback(() => {
    if (!busy) {
      reset();
      onClose();
    }
  }, [busy, onClose, reset]);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const raw = urlOrId.trim();
      if (!raw) {
        setError("Paste a CodePen URL or pen id.");
        return;
      }
      setBusy(true);
      try {
        const result = await importAction({ urlOrId: raw });
        reset();
        onImported(result.penId, result.warnings);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed.");
      } finally {
        setBusy(false);
      }
    },
    [importAction, onClose, onImported, reset, urlOrId],
  );

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-900 p-6 shadow-2xl"
        role="dialog"
        aria-labelledby="import-codepen-title"
        onClick={stop}
      >
        <h2
          id="import-codepen-title"
          className="font-display text-xl font-semibold text-white"
        >
          Import from CodePen
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Paste a{" "}
          <a
            href="https://codepen.io/"
            target="_blank"
            rel="noreferrer"
            className="text-accent underline-offset-2 hover:underline"
          >
            CodePen
          </a>{" "}
          URL (editor, full, or details view) or the pen’s short id. Only{" "}
          <strong className="text-slate-300">public</strong> pens can be
          fetched. External CSS and JS from CodePen settings are added as CDN
          links.
        </p>

        <form onSubmit={(e) => void onSubmit(e)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="codepen-url" className="sr-only">
              CodePen URL or id
            </label>
            <input
              id="codepen-url"
              type="text"
              value={urlOrId}
              onChange={(e) => setUrlOrId(e.target.value)}
              placeholder="https://codepen.io/username/pen/abcdE"
              disabled={busy}
              autoComplete="off"
              className="w-full rounded-xl border border-white/15 bg-surface-950 px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={handleClose}
              className="cursor-pointer rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-300 transition hover:border-white/30 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="cursor-pointer rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-surface-950 transition hover:bg-sky-300 disabled:opacity-50"
            >
              {busy ? "Importing…" : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
