import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";

export function EditorLayout() {
  return (
    <div className="flex h-screen min-h-0 flex-col bg-surface-950">
      <TopNav />
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
