import Editor from "@monaco-editor/react";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { buildPreviewDocument } from "../lib/preview";

type SaveState = "idle" | "saving" | "saved" | "error";

export function PenEditorPage() {
  const { penId: penIdParam } = useParams<{ penId: string }>();
  const penId = penIdParam as Id<"pens"> | undefined;

  const pen = useQuery(
    api.pens.getPen,
    penId ? { penId } : "skip",
  );
  const myUserId = useQuery(api.profiles.getMyUserId);
  const updatePen = useMutation(api.pens.updatePen);

  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [title, setTitle] = useState("");
  const [cdnUrls, setCdnUrls] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cdnDraft, setCdnDraft] = useState("");
  const hydratedId = useRef<string | null>(null);

  const readOnly = Boolean(
    pen &&
      (myUserId === null ||
        (myUserId !== undefined && pen.userId !== myUserId)),
  );

  useEffect(() => {
    if (!pen) {
      return;
    }
    if (hydratedId.current === pen._id) {
      return;
    }
    hydratedId.current = pen._id;
    setHtml(pen.html);
    setCss(pen.css);
    setJs(pen.js);
    setTitle(pen.title);
    setCdnUrls([...pen.cdnUrls]);
    setIsPublic(pen.isPublic);
  }, [pen]);

  const previewSrcDoc = useMemo(
    () => buildPreviewDocument(html, css, js, cdnUrls),
    [html, css, js, cdnUrls],
  );

  useEffect(() => {
    if (!pen || readOnly) {
      return;
    }
    if (
      html === pen.html &&
      css === pen.css &&
      js === pen.js &&
      title === pen.title &&
      isPublic === pen.isPublic &&
      cdnUrls.length === pen.cdnUrls.length &&
      cdnUrls.every((u, i) => u === pen.cdnUrls[i])
    ) {
      return;
    }

    const t = window.setTimeout(() => {
      void (async () => {
        try {
          setSaveState("saving");
          await updatePen({
            penId: pen._id,
            html,
            css,
            js,
            title,
            cdnUrls,
            isPublic,
          });
          setSaveState("saved");
          window.setTimeout(() => setSaveState("idle"), 1500);
        } catch {
          setSaveState("error");
        }
      })();
    }, 380);

    return () => window.clearTimeout(t);
  }, [
    pen,
    html,
    css,
    js,
    title,
    cdnUrls,
    isPublic,
    readOnly,
    updatePen,
  ]);

  const applyCdnDraft = useCallback(() => {
    const lines = cdnDraft
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setCdnUrls(lines);
    setCdnDraft("");
  }, [cdnDraft]);

  if (penId === undefined) {
    return (
      <p className="p-6 text-slate-400">Invalid pen URL.</p>
    );
  }

  if (pen === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (pen === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-slate-400">This pen does not exist or is private.</p>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-accent hover:underline"
        >
          Back to your pens
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-white/10 bg-surface-900/80 px-3 py-2 sm:px-4">
        {readOnly ? (
          <p className="text-sm text-slate-400">
            Viewing{" "}
            <span className="font-medium text-white">{pen.title}</span>
            <span className="text-slate-600"> · </span>
            <span className="text-slate-500">{pen.authorUsername}</span>
          </p>
        ) : (
          <>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-[8rem] flex-1 rounded-lg border border-white/10 bg-surface-950 px-3 py-2 text-sm text-white outline-none focus:border-accent/50 sm:max-w-md"
              placeholder="Pen title"
            />
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border-white/20 bg-surface-950 text-accent focus:ring-accent"
              />
              Public
            </label>
            <button
              type="button"
              onClick={() => {
                setCdnDraft(cdnUrls.join("\n"));
                setSettingsOpen(true);
              }}
              className="rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-300 hover:border-white/30 hover:text-white sm:text-sm"
            >
              CDN &amp; packages
            </button>
            <span className="text-xs text-slate-500">
              {saveState === "saving"
                ? "Saving…"
                : saveState === "saved"
                  ? "Saved"
                  : saveState === "error"
                    ? "Save failed"
                    : "Autosave on"}
            </span>
          </>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <PanelGroup direction="horizontal" className="min-h-0 flex-1">
          <Panel defaultSize={55} minSize={30} className="min-h-0 min-w-0">
            <PanelGroup direction="vertical" className="h-full min-h-[200px]">
              <Panel defaultSize={34} minSize={15} className="min-h-0">
                <div className="flex h-full min-h-0 flex-col border-b border-white/10 bg-surface-900">
                  <div className="shrink-0 bg-surface-850 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    HTML
                  </div>
                  <div className="min-h-0 flex-1">
                    <Editor
                      height="100%"
                      defaultLanguage="html"
                      theme="vs-dark"
                      value={html}
                      onChange={readOnly ? undefined : (v) => setHtml(v ?? "")}
                      options={{
                        readOnly,
                        minimap: { enabled: false },
                        fontSize: 13,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="h-1 bg-white/10 hover:bg-accent/40" />
              <Panel defaultSize={33} minSize={15} className="min-h-0">
                <div className="flex h-full min-h-0 flex-col border-b border-white/10 bg-surface-900">
                  <div className="shrink-0 bg-surface-850 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    CSS
                  </div>
                  <div className="min-h-0 flex-1">
                    <Editor
                      height="100%"
                      defaultLanguage="css"
                      theme="vs-dark"
                      value={css}
                      onChange={readOnly ? undefined : (v) => setCss(v ?? "")}
                      options={{
                        readOnly,
                        minimap: { enabled: false },
                        fontSize: 13,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              </Panel>
              <PanelResizeHandle className="h-1 bg-white/10 hover:bg-accent/40" />
              <Panel defaultSize={33} minSize={15} className="min-h-0">
                <div className="flex h-full min-h-0 flex-col bg-surface-900">
                  <div className="shrink-0 bg-surface-850 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                    JavaScript
                  </div>
                  <div className="min-h-0 flex-1">
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      theme="vs-dark"
                      value={js}
                      onChange={readOnly ? undefined : (v) => setJs(v ?? "")}
                      options={{
                        readOnly,
                        minimap: { enabled: false },
                        fontSize: 13,
                        wordWrap: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="hidden w-1 bg-white/10 hover:bg-accent/40 lg:block" />
          <Panel
            defaultSize={45}
            minSize={25}
            className="min-h-[240px] min-w-0 lg:min-h-0"
          >
            <div className="flex h-full min-h-0 flex-col border-t border-white/10 lg:border-l lg:border-t-0">
              <div className="shrink-0 bg-surface-850 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                Preview
              </div>
              <iframe
                title="Preview"
                sandbox="allow-scripts"
                className="min-h-0 w-full flex-1 bg-white"
                srcDoc={previewSrcDoc}
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {settingsOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cdn-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-surface-900 p-6 shadow-2xl"
          >
            <h2
              id="cdn-title"
              className="font-display text-lg font-semibold text-white"
            >
              CDN scripts &amp; styles
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Add full <code className="text-accent">https://</code> URLs (one
              per line). Files ending in <code className="text-accent">.css</code>{" "}
              load as stylesheets; other URLs load as scripts before your JS.
            </p>
            <textarea
              value={cdnDraft}
              onChange={(e) => setCdnDraft(e.target.value)}
              rows={8}
              className="mt-4 w-full rounded-xl border border-white/10 bg-surface-950 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-accent/50"
              placeholder={
                "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
              }
            />
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white"
                onClick={() => setSettingsOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface-950 hover:bg-sky-300"
                onClick={() => {
                  applyCdnDraft();
                  setSettingsOpen(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
