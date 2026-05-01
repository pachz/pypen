import { Outlet } from "react-router-dom";
import { EditorRouteErrorBoundary } from "./EditorRouteErrorBoundary";

/**
 * Pen routes need a stable flex height chain. `100dvh` avoids mobile browser
 * toolbars zeroing the editor area; inner `min-h-0` lets panels shrink correctly.
 */
export function EditorLayout() {
  return (
    <div className="flex h-[100dvh] min-h-0 flex-col bg-surface-950">
      <div className="flex min-h-0 flex-1 flex-col">
        <EditorRouteErrorBoundary>
          <Outlet />
        </EditorRouteErrorBoundary>
      </div>
    </div>
  );
}
