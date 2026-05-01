import { useQuery } from "convex/react";
import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { PreviewFrame } from "../components/PreviewFrame";
import { buildPreviewDocument } from "../lib/preview";

export function PenFullPage() {
  const { penId: penIdParam } = useParams<{ penId: string }>();
  const penId = penIdParam as Id<"pens"> | undefined;

  const pen = useQuery(api.pens.getPen, penId ? { penId } : "skip");

  const previewSrcDoc = useMemo(() => {
    if (!pen) {
      return "";
    }
    return buildPreviewDocument(pen.html, pen.css, pen.js, pen.cdnUrls, {
      headSnippet: pen.headSnippet ?? "",
      htmlClass: pen.htmlClass ?? "",
    });
  }, [pen]);

  if (penId === undefined) {
    return <p className="p-6 text-slate-400">Invalid pen URL.</p>;
  }

  if (pen === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (pen === null) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-black p-8 text-center">
        <p className="text-slate-400">This pen does not exist or is private.</p>
        <Link
          to="/"
          className="text-sm font-medium text-accent hover:underline"
        >
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-black">
      <header className="flex shrink-0 items-center gap-4 border-b border-white/10 bg-surface-950/95 px-4 py-2.5 backdrop-blur-sm">
        <Link
          to={`/pen/${pen._id}`}
          className="shrink-0 text-sm font-medium text-accent hover:underline"
        >
          ← Editor view
        </Link>
        <span className="min-w-0 truncate text-sm font-medium text-white">
          {pen.title}
        </span>
        <Link
          to={`/details/${pen._id}`}
          className="ml-auto shrink-0 text-xs text-slate-400 hover:text-white"
        >
          Details
        </Link>
      </header>
      <PreviewFrame
        srcDoc={previewSrcDoc}
        title={pen.title}
        className="min-h-0 w-full flex-1"
      />
    </div>
  );
}
