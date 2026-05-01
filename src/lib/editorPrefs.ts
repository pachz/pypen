const TAB_SIZE_KEY = "pypen.editor.tabSize";
const INSERT_SPACES_KEY = "pypen.editor.insertSpaces";

export function getTabSize(): number {
  if (typeof window === "undefined") {
    return 2;
  }
  const raw = window.localStorage.getItem(TAB_SIZE_KEY);
  const n = raw ? Number.parseInt(raw, 10) : 2;
  if (Number.isFinite(n) && n >= 1 && n <= 8) {
    return n;
  }
  return 2;
}

export function setTabSize(n: number): void {
  window.localStorage.setItem(
    TAB_SIZE_KEY,
    String(Math.min(8, Math.max(1, Math.round(n)))),
  );
}

export function getInsertSpaces(): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  const v = window.localStorage.getItem(INSERT_SPACES_KEY);
  if (v === null) {
    return true;
  }
  return v === "1" || v === "true";
}

export function setInsertSpaces(insertSpaces: boolean): void {
  window.localStorage.setItem(INSERT_SPACES_KEY, insertSpaces ? "1" : "0");
}
