import { Outlet } from "react-router-dom";

/** Minimal chrome for full-page pen preview (no main site nav). */
export function FullPageLayout() {
  return (
    <div className="min-h-0 bg-black">
      <Outlet />
    </div>
  );
}
