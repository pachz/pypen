import { Outlet } from "react-router-dom";

export function EditorLayout() {
  return (
    <div className="flex h-screen min-h-0 flex-col bg-surface-950">
      <Outlet />
    </div>
  );
}
