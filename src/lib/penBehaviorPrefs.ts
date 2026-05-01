const autoSaveKey = (penId: string) => `pypen.behavior.${penId}.autoSave`;
const livePreviewKey = (penId: string) => `pypen.behavior.${penId}.livePreview`;

export function getAutoSave(penId: string): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  const v = window.localStorage.getItem(autoSaveKey(penId));
  if (v === null) {
    return true;
  }
  return v === "1" || v === "true";
}

export function setAutoSave(penId: string, enabled: boolean): void {
  window.localStorage.setItem(autoSaveKey(penId), enabled ? "1" : "0");
}

export function getLivePreview(penId: string): boolean {
  if (typeof window === "undefined") {
    return true;
  }
  const v = window.localStorage.getItem(livePreviewKey(penId));
  if (v === null) {
    return true;
  }
  return v === "1" || v === "true";
}

export function setLivePreview(penId: string, enabled: boolean): void {
  window.localStorage.setItem(livePreviewKey(penId), enabled ? "1" : "0");
}
