import type { CardProgress } from "./types";

export function loadProgress(
  _deckSlug: string,
): Record<string, CardProgress> {
  return {};
}

export function saveProgress(
  _deckSlug: string,
  _progress: Record<string, CardProgress>,
): void {
  // localStorage persistence added in a follow-up phase.
}
