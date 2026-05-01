import Editor from "@monaco-editor/react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { PreviewFrame } from "./PreviewFrame";
import type { EditorLayoutMode } from "../lib/editorLayout";

type Props = {
  layout: EditorLayoutMode;
  /** When false, use stacked / simplified arrangement */
  isDesktop: boolean;
  html: string;
  css: string;
  js: string;
  readOnly: boolean;
  onHtml: (v: string) => void;
  onCss: (v: string) => void;
  onJs: (v: string) => void;
  previewSrcDoc: string;
  tabSize: number;
  insertSpaces: boolean;
};

function editorOptions(
  readOnly: boolean,
  indent: { tabSize: number; insertSpaces: boolean },
) {
  return {
    readOnly,
    minimap: { enabled: false },
    fontSize: 13,
    tabSize: indent.tabSize,
    insertSpaces: indent.insertSpaces,
    detectIndentation: false,
    wordWrap: "on" as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
  };
}

function HtmlPane(
  p: Pick<Props, "html" | "readOnly" | "tabSize" | "insertSpaces"> & {
    onHtml: (v: string) => void;
  },
) {
  return (
    <div className="flex h-full min-h-0 flex-col border-b border-white/10 bg-surface-900">
      <div className="shrink-0 bg-surface-850 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        HTML
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          defaultLanguage="html"
          theme="vs-dark"
          value={p.html}
          onChange={p.readOnly ? undefined : (v) => p.onHtml(v ?? "")}
          options={editorOptions(p.readOnly, {
            tabSize: p.tabSize,
            insertSpaces: p.insertSpaces,
          })}
        />
      </div>
    </div>
  );
}

function CssPane(
  p: Pick<Props, "css" | "readOnly" | "tabSize" | "insertSpaces"> & {
    onCss: (v: string) => void;
  },
) {
  return (
    <div className="flex h-full min-h-0 flex-col border-b border-white/10 bg-surface-900">
      <div className="shrink-0 bg-surface-850 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        CSS
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          defaultLanguage="css"
          theme="vs-dark"
          value={p.css}
          onChange={p.readOnly ? undefined : (v) => p.onCss(v ?? "")}
          options={editorOptions(p.readOnly, {
            tabSize: p.tabSize,
            insertSpaces: p.insertSpaces,
          })}
        />
      </div>
    </div>
  );
}

function JsPane(
  p: Pick<Props, "js" | "readOnly" | "tabSize" | "insertSpaces"> & {
    onJs: (v: string) => void;
  },
) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-900">
      <div className="shrink-0 bg-surface-850 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        JavaScript
      </div>
      <div className="min-h-0 flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={p.js}
          onChange={p.readOnly ? undefined : (v) => p.onJs(v ?? "")}
          options={editorOptions(p.readOnly, {
            tabSize: p.tabSize,
            insertSpaces: p.insertSpaces,
          })}
        />
      </div>
    </div>
  );
}

function PreviewPane({ previewSrcDoc }: { previewSrcDoc: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col border-t border-white/10 lg:border-l lg:border-t-0">
      <div className="shrink-0 bg-surface-850 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        Preview
      </div>
      <PreviewFrame srcDoc={previewSrcDoc} title="Preview" />
    </div>
  );
}

/** Vertical stack: HTML / CSS / JS */
function EditorsStack(p: Props) {
  return (
    <PanelGroup direction="vertical" className="h-full min-h-[200px]">
      <Panel defaultSize={34} minSize={15} className="min-h-0">
        <HtmlPane
          html={p.html}
          readOnly={p.readOnly}
          onHtml={p.onHtml}
          tabSize={p.tabSize}
          insertSpaces={p.insertSpaces}
        />
      </Panel>
      <PanelResizeHandle className="h-1 bg-white/10 hover:bg-accent/40" />
      <Panel defaultSize={33} minSize={15} className="min-h-0">
        <CssPane
          css={p.css}
          readOnly={p.readOnly}
          onCss={p.onCss}
          tabSize={p.tabSize}
          insertSpaces={p.insertSpaces}
        />
      </Panel>
      <PanelResizeHandle className="h-1 bg-white/10 hover:bg-accent/40" />
      <Panel defaultSize={33} minSize={15} className="min-h-0">
        <JsPane
          js={p.js}
          readOnly={p.readOnly}
          onJs={p.onJs}
          tabSize={p.tabSize}
          insertSpaces={p.insertSpaces}
        />
      </Panel>
    </PanelGroup>
  );
}

/** Horizontal row: HTML | CSS | JS */
function EditorsRow(p: Props) {
  return (
    <PanelGroup direction="horizontal" className="h-full min-h-[140px]">
      <Panel defaultSize={34} minSize={18} className="min-h-0 min-w-0">
        <HtmlPane
          html={p.html}
          readOnly={p.readOnly}
          onHtml={p.onHtml}
          tabSize={p.tabSize}
          insertSpaces={p.insertSpaces}
        />
      </Panel>
      <PanelResizeHandle className="w-1 bg-white/10 hover:bg-accent/40" />
      <Panel defaultSize={33} minSize={18} className="min-h-0 min-w-0">
        <CssPane
          css={p.css}
          readOnly={p.readOnly}
          onCss={p.onCss}
          tabSize={p.tabSize}
          insertSpaces={p.insertSpaces}
        />
      </Panel>
      <PanelResizeHandle className="w-1 bg-white/10 hover:bg-accent/40" />
      <Panel defaultSize={33} minSize={18} className="min-h-0 min-w-0">
        <JsPane
          js={p.js}
          readOnly={p.readOnly}
          onJs={p.onJs}
          tabSize={p.tabSize}
          insertSpaces={p.insertSpaces}
        />
      </Panel>
    </PanelGroup>
  );
}

export function PenEditorPanels(p: Props) {
  const { layout, isDesktop, previewSrcDoc } = p;

  if (!isDesktop) {
    if (layout === "left") {
      return (
        <PanelGroup direction="vertical" className="min-h-0 flex-1">
          <Panel defaultSize={40} minSize={22} className="min-h-0">
            <PreviewPane previewSrcDoc={previewSrcDoc} />
          </Panel>
          <PanelResizeHandle className="h-1 w-full bg-white/10 hover:bg-accent/40" />
          <Panel defaultSize={60} minSize={30} className="min-h-0 min-w-0">
            <EditorsStack {...p} />
          </Panel>
        </PanelGroup>
      );
    }
    if (layout === "top") {
      return (
        <PanelGroup direction="vertical" className="min-h-0 flex-1">
          <Panel defaultSize={45} minSize={25} className="min-h-0 min-w-0">
            <EditorsStack {...p} />
          </Panel>
          <PanelResizeHandle className="h-1 w-full bg-white/10 hover:bg-accent/40" />
          <Panel defaultSize={55} minSize={25} className="min-h-0">
            <PreviewPane previewSrcDoc={previewSrcDoc} />
          </Panel>
        </PanelGroup>
      );
    }
    return (
      <PanelGroup direction="vertical" className="min-h-0 flex-1">
        <Panel defaultSize={55} minSize={30} className="min-h-0 min-w-0">
          <EditorsStack {...p} />
        </Panel>
        <PanelResizeHandle className="h-1 w-full bg-white/10 hover:bg-accent/40" />
        <Panel defaultSize={45} minSize={25} className="min-h-0">
          <PreviewPane previewSrcDoc={previewSrcDoc} />
        </Panel>
      </PanelGroup>
    );
  }

  if (layout === "top") {
    return (
      <PanelGroup direction="vertical" className="min-h-0 flex-1">
        <Panel defaultSize={48} minSize={22} className="min-h-0 min-w-0">
          <EditorsRow {...p} />
        </Panel>
        <PanelResizeHandle className="h-1 w-full bg-white/10 hover:bg-accent/40" />
        <Panel defaultSize={52} minSize={25} className="min-h-0">
          <PreviewPane previewSrcDoc={previewSrcDoc} />
        </Panel>
      </PanelGroup>
    );
  }

  if (layout === "left") {
    return (
      <PanelGroup direction="horizontal" className="min-h-0 flex-1">
        <Panel defaultSize={45} minSize={28} className="min-h-0 min-w-0">
          <PreviewPane previewSrcDoc={previewSrcDoc} />
        </Panel>
        <PanelResizeHandle className="w-1 bg-white/10 hover:bg-accent/40" />
        <Panel defaultSize={55} minSize={30} className="min-h-0 min-w-0">
          <EditorsStack {...p} />
        </Panel>
      </PanelGroup>
    );
  }

  return (
    <PanelGroup direction="horizontal" className="min-h-0 flex-1">
      <Panel defaultSize={55} minSize={30} className="min-h-0 min-w-0">
        <EditorsStack {...p} />
      </Panel>
      <PanelResizeHandle className="w-1 bg-white/10 hover:bg-accent/40" />
      <Panel defaultSize={45} minSize={25} className="min-h-[240px] min-w-0 lg:min-h-0">
        <PreviewPane previewSrcDoc={previewSrcDoc} />
      </Panel>
    </PanelGroup>
  );
}
