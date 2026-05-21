import type { CardProgress } from "./types";

const KEY_PREFIX = "studioso:progress:";

function key(deckSlug: string): string {
  return `${KEY_PREFIX}${deckSlug}`;
}

export function loadProgress(
  deckSlug: string,
): Record<string, CardProgress> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(key(deckSlug));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, CardProgress>;
  } catch {
    return {};
  }
}

export function saveProgress(
  deckSlug: string,
  progress: Record<string, CardProgress>,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key(deckSlug), JSON.stringify(progress));
  } catch {
    // Quota exceeded, private browsing, etc — silently drop.
  }
}
