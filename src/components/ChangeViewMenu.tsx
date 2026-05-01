import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import type { EditorLayoutMode } from "../lib/editorLayout";

type PenRouteParams = { penId: string };

function LayoutIcon({
  mode,
  active,
  onSelect,
  label,
}: {
  mode: EditorLayoutMode;
  active: boolean;
  onSelect: (m: EditorLayoutMode) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={() => onSelect(mode)}
      className={[
        "flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border transition",
        active
          ? "border-white/25 bg-white/15 text-white"
          : "border-white/10 bg-surface-950 text-slate-500 hover:border-white/20 hover:bg-white/5 hover:text-slate-300",
      ].join(" ")}
    >
      {mode === "left" ? <IconLeft /> : mode === "top" ? <IconTop /> : <IconRight />}
    </button>
  );
}

function IconLeft() {
  return (
    <svg width="40" height="28" viewBox="0 0 40 28" fill="none" aria-hidden>
      <rect x="2" y="2" width="16" height="24" rx="1" className="fill-slate-600" />
      <rect x="21" y="2" width="7" height="6.5" rx="0.5" className="fill-slate-500" />
      <rect x="21" y="10.25" width="7" height="6.5" rx="0.5" className="fill-slate-500" />
      <rect x="21" y="18.5" width="7" height="7.5" rx="0.5" className="fill-slate-500" />
    </svg>
  );
}

function IconTop() {
  return (
    <svg width="40" height="28" viewBox="0 0 40 28" fill="none" aria-hidden>
      <rect x="2" y="2" width="10.5" height="10" rx="0.5" className="fill-slate-500" />
      <rect x="14.75" y="2" width="10.5" height="10" rx="0.5" className="fill-slate-500" />
      <rect x="27.5" y="2" width="10.5" height="10" rx="0.5" className="fill-slate-500" />
      <rect x="2" y="15" width="36" height="11" rx="1" className="fill-slate-600" />
    </svg>
  );
}

function IconRight() {
  return (
    <svg width="40" height="28" viewBox="0 0 40 28" fill="none" aria-hidden>
      <rect x="2" y="2" width="7" height="6.5" rx="0.5" className="fill-slate-500" />
      <rect x="2" y="10.25" width="7" height="6.5" rx="0.5" className="fill-slate-500" />
      <rect x="2" y="18.5" width="7" height="7.5" rx="0.5" className="fill-slate-500" />
      <rect x="12" y="2" width="26" height="24" rx="1" className="fill-slate-600" />
    </svg>
  );
}

function ViewRow({
  href,
  pathLabel,
  title,
  description,
  active,
}: {
  href: string;
  pathLabel: string;
  title: string;
  description: string;
  active: boolean;
}) {
  return (
    <Link
      to={href}
      className={[
        "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition",
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
      ].join(" ")}
      title={description}
    >
      <span className="min-w-0 flex-1 font-medium">{title}</span>
      <code className="shrink-0 text-xs text-slate-500">{pathLabel}</code>
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/15 text-xs text-slate-500"
        title={description}
      >
        ?
      </span>
    </Link>
  );
}

export function ChangeViewMenu({
  layout,
  onLayoutChange,
}: {
  layout: EditorLayoutMode;
  onLayoutChange: (m: EditorLayoutMode) => void;
}) {
  const { penId } = useParams<PenRouteParams>();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!penId) {
    return null;
  }

  const base = "";
  const editorPath = `${base}/pen/${penId}`;
  const detailsPath = `${base}/details/${penId}`;
  const fullPath = `${base}/full/${penId}`;

  const viewMode =
    location.pathname.startsWith("/details/") ? "details"
    : location.pathname.startsWith("/full/") ? "full"
    : "editor";

  function selectLayout(m: EditorLayoutMode) {
    onLayoutChange(m);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="cursor-pointer rounded-lg border border-white/15 px-3 py-2 text-xs text-slate-300 transition hover:border-white/30 hover:text-white sm:text-sm"
      >
        Change View
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-white/10 bg-[#1e1f26] py-3 shadow-2xl shadow-black/50">
          <p className="px-4 pb-2 text-sm font-semibold text-white">Change View</p>

          <div className="px-3 pb-3">
            <div className="flex gap-2 rounded-lg bg-black/30 p-1.5">
              <LayoutIcon
                mode="left"
                active={layout === "left"}
                onSelect={(m) => {
                  selectLayout(m);
                }}
                label="Preview left, editors stacked on the right"
              />
              <LayoutIcon
                mode="top"
                active={layout === "top"}
                onSelect={(m) => {
                  selectLayout(m);
                }}
                label="Editors in a row on top, preview below"
              />
              <LayoutIcon
                mode="right"
                active={layout === "right"}
                onSelect={(m) => {
                  selectLayout(m);
                }}
                label="Editors stacked on the left, preview on the right"
              />
            </div>
          </div>

          <div className="border-t border-white/10 px-2 pt-2">
            <ViewRow
              href={editorPath}
              pathLabel="/pen/"
              title="Editor View"
              description="Edit HTML, CSS, and JavaScript with a live preview."
              active={viewMode === "editor"}
            />
            <ViewRow
              href={detailsPath}
              pathLabel="/details/"
              title="Details View"
              description="Pen information: author, visibility, and timestamps."
              active={viewMode === "details"}
            />
            <ViewRow
              href={fullPath}
              pathLabel="/full/"
              title="Full Page View"
              description="Run the pen preview full-screen without the editor chrome."
              active={viewMode === "full"}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
