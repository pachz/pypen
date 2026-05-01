import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { TopNav } from "./TopNav";

type State = { error: Error | null };

/**
 * Catches render errors in the pen editor tree (e.g. Monaco) so a hard refresh
 * is not the only recovery path.
 */
export class EditorRouteErrorBoundary extends Component<
  { children: ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Editor route error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <TopNav />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <p className="max-w-md text-slate-300">
              Something went wrong while loading the editor. Try reloading the
              page.
            </p>
            <p className="max-w-md font-mono text-xs text-slate-500">
              {this.state.error.message}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => this.setState({ error: null })}
                className="cursor-pointer rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:border-white/40"
              >
                Try again
              </button>
              <Link
                to="/"
                className="cursor-pointer rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-surface-950 hover:bg-sky-300"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
