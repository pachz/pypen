import { useEffect, useRef, useState } from "react";

type Props = {
  srcDoc: string;
  /** Shown in iframe title attribute */
  title?: string;
  className?: string;
};

/**
 * Preview iframe with PyPen-branded loading overlay.
 * Overlay appears only if reload takes longer than a short threshold (avoids flicker).
 */
export function PreviewFrame({
  srcDoc,
  title = "Preview",
  className = "",
}: Props) {
  const [showOverlay, setShowOverlay] = useState(false);
  const pendingIdRef = useRef(0);
  const loadedIdRef = useRef(0);

  useEffect(() => {
    pendingIdRef.current += 1;
    const id = pendingIdRef.current;
    setShowOverlay(false);
    const delayMs = 110;
    const t = window.setTimeout(() => {
      if (
        pendingIdRef.current === id &&
        loadedIdRef.current < id
      ) {
        setShowOverlay(true);
      }
    }, delayMs);
    return () => window.clearTimeout(t);
  }, [srcDoc]);

  function handleLoad() {
    loadedIdRef.current = pendingIdRef.current;
    setShowOverlay(false);
  }

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col ${className}`}>
      {showOverlay ? (
        <div
          className="preview-loading-overlay absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 bg-surface-950/92 backdrop-blur-[2px]"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="preview-loading-mark flex flex-col items-center gap-3">
            <span className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-white via-sky-200 to-accent bg-clip-text text-transparent">
                PyPen
              </span>
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
              Live preview
            </span>
          </div>
          <div className="preview-loading-bar h-1 w-40 overflow-hidden rounded-full bg-white/10">
            <div className="preview-loading-bar-inner h-full w-1/3 rounded-full bg-gradient-to-r from-accent-dim via-accent to-sky-300" />
          </div>
          <p className="text-sm text-slate-500">Rendering…</p>
        </div>
      ) : null}
      <iframe
        title={title}
        sandbox="allow-scripts"
        className="relative z-0 h-full min-h-[120px] w-full border-0 bg-white"
        srcDoc={srcDoc}
        onLoad={handleLoad}
      />
    </div>
  );
}
