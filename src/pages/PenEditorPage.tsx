import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { ChangeViewMenu } from "../components/ChangeViewMenu";
import {
  PenSettingsModal,
  type PenSettingsTab,
} from "../components/PenSettingsModal";
import { PenEditorPanels } from "../components/PenEditorPanels";
import { TopNav } from "../components/TopNav";
import type { EditorLayoutMode } from "../lib/editorLayout";
import {
  getStoredEditorLayout,
  setStoredEditorLayout,
} from "../lib/editorLayout";
import { getAutoSave, getLivePreview } from "../lib/penBehaviorPrefs";
import { getInsertSpaces, getTabSize } from "../lib/editorPrefs";
import { buildPreviewDocument } from "../lib/preview";

type SaveState = "idle" | "saving" | "saved" | "error";

export function PenEditorPage() {
  const { penId: penIdParam } = useParams<{ penId: string }>();
  const penId = penIdParam as Id<"pens"> | undefined;

  const pen = useQuery(api.pens.getPen, penId ? { penId } : "skip");
  const myUserId = useQuery(api.profiles.getMyUserId);
  const updatePen = useMutation(api.pens.updatePen);

  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [title, setTitle] = useState("");
  const [cdnUrls, setCdnUrls] = useState<string[]>([]);
  const [headSnippet, setHeadSnippet] = useState("");
  const [htmlClass, setHtmlClass] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<PenSettingsTab>("behavior");

  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(true);
  const [tabSize, setTabSize] = useState(2);
  const [insertSpaces, setInsertSpaces] = useState(true);

  const [frozenPreview, setFrozenPreview] = useState("");

  const hydratedId = useRef<string | null>(null);

  const [editorLayout, setEditorLayout] = useState<EditorLayoutMode>(() =>
    getStoredEditorLayout(),
  );

  const onLayoutChange = useCallback((mode: EditorLayoutMode) => {
    setEditorLayout(mode);
    setStoredEditorLayout(mode);
  }, []);

  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 1024px)").matches
      : true,
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (pen === undefined) {
      return;
    }
    if (pen === null) {
      document.title = "PyPen";
      return;
    }
    document.title = `${pen.title} · PyPen`;
    return () => {
      document.title = "PyPen";
    };
  }, [pen]);

  useEffect(() => {
    if (!penId) {
      return;
    }
    setAutoSaveEnabled(getAutoSave(penId));
    setLivePreviewEnabled(getLivePreview(penId));
    setTabSize(getTabSize());
    setInsertSpaces(getInsertSpaces());
  }, [penId]);

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
    setHeadSnippet(pen.headSnippet ?? "");
    setHtmlClass(pen.htmlClass ?? "");
    setIsPublic(pen.isPublic);
    const initialDoc = buildPreviewDocument(
      pen.html,
      pen.css,
      pen.js,
      pen.cdnUrls,
      {
        headSnippet: pen.headSnippet ?? "",
        htmlClass: pen.htmlClass ?? "",
      },
    );
    setFrozenPreview(initialDoc);
  }, [pen]);

  const builtLive = useMemo(
    () =>
      buildPreviewDocument(html, css, js, cdnUrls, {
        headSnippet,
        htmlClass,
      }),
    [html, css, js, cdnUrls, headSnippet, htmlClass],
  );

  const previewSrcDoc = livePreviewEnabled ? builtLive : frozenPreview;

  const syncPrefsAfterSettingsClose = useCallback(() => {
    setSettingsOpen(false);
    setTabSize(getTabSize());
    setInsertSpaces(getInsertSpaces());
    if (!penId) {
      return;
    }
    const lp = getLivePreview(penId);
    const as = getAutoSave(penId);
    setLivePreviewEnabled(lp);
    setAutoSaveEnabled(as);
    if (!lp) {
      setFrozenPreview(builtLive);
    }
  }, [penId, builtLive]);

  const saveNow = useCallback(async () => {
    if (!pen || readOnly) {
      return;
    }
    try {
      setSaveState("saving");
      await updatePen({
        penId: pen._id,
        html,
        css,
        js,
        title,
        cdnUrls,
        headSnippet,
        htmlClass,
        isPublic,
      });
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1500);
    } catch {
      setSaveState("error");
    }
  }, [
    pen,
    readOnly,
    updatePen,
    html,
    css,
    js,
    title,
    cdnUrls,
    headSnippet,
    htmlClass,
    isPublic,
  ]);

  useEffect(() => {
    if (!pen || readOnly || !autoSaveEnabled) {
      return;
    }
    if (
      html === pen.html &&
      css === pen.css &&
      js === pen.js &&
      title === pen.title &&
      isPublic === pen.isPublic &&
      headSnippet === (pen.headSnippet ?? "") &&
      htmlClass === (pen.htmlClass ?? "") &&
      cdnUrls.length === pen.cdnUrls.length &&
      cdnUrls.every((u, i) => u === pen.cdnUrls[i])
    ) {
      return;
    }

    const t = window.setTimeout(() => {
      void saveNow();
    }, 380);

    return () => window.clearTimeout(t);
  }, [
    pen,
    html,
    css,
    js,
    title,
    cdnUrls,
    headSnippet,
    htmlClass,
    isPublic,
    readOnly,
    autoSaveEnabled,
    saveNow,
  ]);

  const openSettings = useCallback((tab: PenSettingsTab = "behavior") => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  }, []);

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
              to={`/details/${penId}`}
              className="cursor-pointer text-xs text-slate-400 hover:text-white sm:text-sm"
            >
              Details
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

  const penToolbar = readOnly ? (
    <>
      <Link
        to={`/details/${pen._id}`}
        className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-400 hover:border-white/30 hover:text-white sm:text-sm"
      >
        Details
      </Link>
      <ChangeViewMenu
        layout={editorLayout}
        onLayoutChange={onLayoutChange}
      />
    </>
  ) : (
    <>
      {!livePreviewEnabled ? (
        <button
          type="button"
          onClick={() => setFrozenPreview(builtLive)}
          className="cursor-pointer rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25 sm:py-2 sm:text-sm"
        >
          Run
        </button>
      ) : null}
      {!autoSaveEnabled ? (
        <button
          type="button"
          onClick={() => void saveNow()}
          className="cursor-pointer rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white hover:border-white/40 sm:py-2 sm:text-sm"
        >
          Save
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => openSettings("behavior")}
        className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:border-emerald-500/40 hover:text-white sm:py-2 sm:text-sm"
      >
        Pen settings
      </button>
      <span className="text-xs text-slate-500">
        {saveState === "saving"
          ? "Saving…"
          : saveState === "saved"
            ? "Saved"
            : saveState === "error"
              ? "Save failed"
              : autoSaveEnabled
                ? "Autosave on"
                : "Autosave off"}
      </span>
      <Link
        to={`/details/${pen._id}`}
        className="cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs text-slate-400 hover:border-white/30 hover:text-white sm:py-2 sm:text-sm"
      >
        Details
      </Link>
      <ChangeViewMenu
        layout={editorLayout}
        onLayoutChange={onLayoutChange}
      />
    </>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <TopNav
        penTitle={title.trim() || pen.title}
        penToolbar={penToolbar}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <PenEditorPanels
          layout={editorLayout}
          isDesktop={isDesktop}
          html={html}
          css={css}
          js={js}
          readOnly={readOnly}
          onHtml={setHtml}
          onCss={setCss}
          onJs={setJs}
          previewSrcDoc={previewSrcDoc}
          tabSize={tabSize}
          insertSpaces={insertSpaces}
        />
      </div>

      {settingsOpen && penId ? (
        <PenSettingsModal
          open
          onClose={syncPrefsAfterSettingsClose}
          penId={penId}
          initialTab={settingsTab}
          title={title}
          onTitleChange={setTitle}
          isPublic={isPublic}
          onPublicChange={setIsPublic}
          headSnippet={headSnippet}
          onHeadSnippetChange={setHeadSnippet}
          htmlClass={htmlClass}
          onHtmlClassChange={setHtmlClass}
          cdnUrls={cdnUrls}
          onCdnUrlsChange={setCdnUrls}
        />
      ) : null}
    </div>
  );
}
