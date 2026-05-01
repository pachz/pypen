import { useEffect, useState } from "react";
import {
  mergeCdnUrls,
  partitionCdnUrls,
} from "../lib/cdnList";
import {
  getAutoSave,
  getLivePreview,
  setAutoSave,
  setLivePreview,
} from "../lib/penBehaviorPrefs";
import {
  getInsertSpaces,
  getTabSize,
  setInsertSpaces,
  setTabSize,
} from "../lib/editorPrefs";
import { getViewportMetaSnippet } from "../lib/preview";

export type PenSettingsTab = "html" | "css" | "js" | "behavior" | "editor";

const TABS: { id: PenSettingsTab; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "js", label: "JS" },
  { id: "behavior", label: "Behavior" },
  { id: "editor", label: "Editor" },
];

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-850/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-white">{label}</p>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={[
            "relative h-7 w-12 shrink-0 rounded-full transition-colors",
            checked ? "bg-emerald-500" : "bg-slate-600",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform",
              checked ? "left-6" : "left-0.5",
            ].join(" ")}
          />
        </button>
      </div>
    </div>
  );
}

function HelpHint({ text }: { text: string }) {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/20 text-[10px] text-slate-500"
      title={text}
    >
      ?
    </span>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  penId: string;
  initialTab?: PenSettingsTab;
  title: string;
  onTitleChange: (v: string) => void;
  isPublic: boolean;
  onPublicChange: (v: boolean) => void;
  headSnippet: string;
  onHeadSnippetChange: (v: string) => void;
  htmlClass: string;
  onHtmlClassChange: (v: string) => void;
  cdnUrls: string[];
  onCdnUrlsChange: (urls: string[]) => void;
};

export function PenSettingsModal({
  open,
  onClose,
  penId,
  initialTab = "behavior",
  title,
  onTitleChange,
  isPublic,
  onPublicChange,
  headSnippet,
  onHeadSnippetChange,
  htmlClass,
  onHtmlClassChange,
  cdnUrls,
  onCdnUrlsChange,
}: Props) {
  const [tab, setTab] = useState<PenSettingsTab>(initialTab);
  const [draftCss, setDraftCss] = useState<string[]>([]);
  const [draftJs, setDraftJs] = useState<string[]>([]);
  const [autoSave, setAutoSaveState] = useState(true);
  const [livePreview, setLivePreviewState] = useState(true);
  const [insertSpaces, setInsertSpacesState] = useState(true);
  const [indentWidth, setIndentWidth] = useState(2);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const p = partitionCdnUrls(cdnUrls);
    setDraftCss(p.stylesheets.length ? [...p.stylesheets] : [""]);
    setDraftJs(p.scripts.length ? [...p.scripts] : [""]);
    setAutoSaveState(getAutoSave(penId));
    setLivePreviewState(getLivePreview(penId));
    setInsertSpacesState(getInsertSpaces());
    setIndentWidth(getTabSize());
  }, [open, penId, cdnUrls]);

  function handleClose() {
    const css = draftCss.map((s) => s.trim()).filter(Boolean);
    const js = draftJs.map((s) => s.trim()).filter(Boolean);
    onCdnUrlsChange(mergeCdnUrls(css, js));
    setAutoSave(penId, autoSave);
    setLivePreview(penId, livePreview);
    setInsertSpaces(insertSpaces);
    setTabSize(indentWidth);
    onClose();
  }

  function insertViewportMeta() {
    const snippet = getViewportMetaSnippet();
    if (/viewport/i.test(headSnippet)) {
      return;
    }
    onHeadSnippetChange(
      headSnippet.trim()
        ? `${headSnippet.trim()}\n${snippet}`
        : snippet,
    );
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pen-settings-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1e1f26] shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2
              id="pen-settings-title"
              className="font-display text-lg font-semibold text-white"
            >
              Pen Settings
            </h2>
            <div className="mt-1 h-0.5 w-24 rounded-full bg-emerald-500" />
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto border-b border-white/10 px-2 py-2 md:w-44 md:flex-col md:border-b-0 md:border-r md:px-0 md:py-3">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={[
                  "whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm font-medium transition md:rounded-none md:px-4",
                  tab === t.id
                    ? "bg-white/10 text-white md:border-l-4 md:border-emerald-500 md:bg-white/5"
                    : "text-slate-400 hover:bg-white/5 hover:text-white md:border-l-4 md:border-transparent",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {tab === "html" ? (
              <div className="space-y-6">
                <section className="rounded-xl border border-white/10 bg-surface-900/50 p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="font-medium text-white">
                      Add class(es) to <code className="text-accent">&lt;html&gt;</code>
                    </h3>
                    <HelpHint text="Space-separated CSS classes on the root HTML element." />
                  </div>
                  <input
                    type="text"
                    value={htmlClass}
                    onChange={(e) => onHtmlClassChange(e.target.value)}
                    placeholder="e.g. theme-dark antialiased"
                    className="w-full rounded-lg border border-white/15 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none ring-emerald-500/30 placeholder:text-slate-600 focus:border-emerald-500/50 focus:ring-2"
                  />
                </section>

                <section className="rounded-xl border border-white/10 bg-surface-900/50 p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="font-medium text-white">
                      Stuff for <code className="text-accent">&lt;head&gt;</code>
                    </h3>
                    <HelpHint text="Extra tags injected before your CSS in the document head (meta, link, script)." />
                  </div>
                  <textarea
                    value={headSnippet}
                    onChange={(e) => onHeadSnippetChange(e.target.value)}
                    rows={6}
                    placeholder="e.g. &lt;meta&gt;, &lt;link&gt;, &lt;script&gt;"
                    className="w-full rounded-lg border border-white/15 bg-surface-950 px-3 py-2.5 font-mono text-xs text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={insertViewportMeta}
                    className="mt-3 rounded-lg border border-white/15 bg-surface-850 px-3 py-2 text-xs text-slate-300 hover:border-white/25 hover:text-white"
                  >
                    ↑ Insert common viewport meta tag
                  </button>
                </section>
              </div>
            ) : null}

            {tab === "css" ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Stylesheet URLs are loaded as{" "}
                  <code className="text-emerald-400/90">&lt;link&gt;</code> tags in
                  order (before your editor CSS).
                </p>
                <div className="space-y-2">
                  {draftCss.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const next = [...draftCss];
                          next[i] = e.target.value;
                          setDraftCss(next);
                        }}
                        placeholder="https://cdn.jsdelivr.net/npm/...css"
                        className="min-w-0 flex-1 rounded-lg border border-white/15 bg-surface-950 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        className="shrink-0 rounded-lg px-2 text-slate-500 hover:bg-red-500/10 hover:text-red-300"
                        aria-label="Remove URL"
                        onClick={() =>
                          setDraftCss(draftCss.filter((_, j) => j !== i))
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                  onClick={() => setDraftCss([...draftCss, ""])}
                >
                  + Add stylesheet
                </button>
              </div>
            ) : null}

            {tab === "js" ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-400">
                  Script URLs load as{" "}
                  <code className="text-emerald-400/90">&lt;script src&gt;</code>{" "}
                  before your pen JavaScript.
                </p>
                <div className="space-y-2">
                  {draftJs.map((url, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const next = [...draftJs];
                          next[i] = e.target.value;
                          setDraftJs(next);
                        }}
                        placeholder="https://cdn.jsdelivr.net/npm/...js"
                        className="min-w-0 flex-1 rounded-lg border border-white/15 bg-surface-950 px-3 py-2 font-mono text-xs text-slate-200 outline-none focus:border-emerald-500/50"
                      />
                      <button
                        type="button"
                        className="shrink-0 rounded-lg px-2 text-slate-500 hover:bg-red-500/10 hover:text-red-300"
                        aria-label="Remove URL"
                        onClick={() =>
                          setDraftJs(draftJs.filter((_, j) => j !== i))
                        }
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                  onClick={() => setDraftJs([...draftJs, ""])}
                >
                  + Add script
                </button>
              </div>
            ) : null}

            {tab === "behavior" ? (
              <div className="space-y-4">
                <section className="rounded-xl border border-white/10 bg-surface-900/50 p-4">
                  <label className="block text-sm font-medium text-white">
                    Pen name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/15 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50 focus:ring-2"
                  />
                </section>

                <div className="rounded-xl border border-white/10 bg-surface-900/50 p-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => onPublicChange(e.target.checked)}
                      className="rounded border-white/20 bg-surface-950 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span className="text-sm text-white">Public pen</span>
                  </label>
                  <p className="mt-2 text-xs text-slate-500">
                    Public pens appear on Explore. Private pens are only visible to
                    you.
                  </p>
                </div>

                <Toggle
                  checked={autoSave}
                  onChange={setAutoSaveState}
                  label="Auto save"
                  description="When on, your pen saves automatically after you stop typing. When off, use Save in the toolbar."
                />
                <Toggle
                  checked={livePreview}
                  onChange={setLivePreviewState}
                  label="Auto-updating preview"
                  description="When on, the preview updates as you edit. When off, use Run to refresh the preview."
                />
              </div>
            ) : null}

            {tab === "editor" ? (
              <div className="space-y-6">
                <section className="rounded-xl border border-white/10 bg-surface-900/50 p-4">
                  <h3 className="font-medium text-white">Code indentation</h3>
                  <div className="mt-3 flex gap-6">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                      <input
                        type="radio"
                        name="indent"
                        checked={insertSpaces}
                        onChange={() => setInsertSpacesState(true)}
                        className="border-white/30 text-emerald-500"
                      />
                      Spaces
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                      <input
                        type="radio"
                        name="indent"
                        checked={!insertSpaces}
                        onChange={() => setInsertSpacesState(false)}
                        className="border-white/30 text-emerald-500"
                      />
                      Tabs
                    </label>
                  </div>
                </section>

                <section className="rounded-xl border border-white/10 bg-surface-900/50 p-4">
                  <label className="block text-sm font-medium text-white">
                    Indent width
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={indentWidth}
                    onChange={(e) =>
                      setIndentWidth(
                        Math.min(
                          8,
                          Math.max(1, Number.parseInt(e.target.value, 10) || 2),
                        ),
                      )
                    }
                    className="mt-2 w-24 rounded-lg border border-white/15 bg-surface-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-500/50"
                  />
                </section>

                <p className="text-xs text-slate-500">
                  Editor preferences apply to all three panes and are stored in this
                  browser.
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <footer className="flex shrink-0 justify-end border-t border-white/10 bg-[#16181d] px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg bg-emerald-500 px-8 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
