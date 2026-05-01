export type EditorLayoutMode = "top" | "left" | "right";

const STORAGE_KEY = "pypen.editorLayout";

export function getStoredEditorLayout(): EditorLayoutMode {
  if (typeof window === "undefined") {
    return "right";
  }
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "top" || v === "left" || v === "right") {
    return v;
  }
  return "right";
}

export function setStoredEditorLayout(mode: EditorLayoutMode): void {
  window.localStorage.setItem(STORAGE_KEY, mode);
}
