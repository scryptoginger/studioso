import { createHash } from "node:crypto";
import type { Card, Deck } from "./types";

const TITLE_RE = /^#\s+(.+?)\s*$/m;
const SEPARATOR_RE = /^---+\s*$/;
const FRONT_RE = /^##\s+(.+?)\s*$/;

function humanizeSlug(slug: string): string {
  return slug
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function cardId(slug: string, front: string): string {
  return createHash("sha256").update(`${slug}:${front}`).digest("hex").slice(0, 16);
}

export function parseDeck(slug: string, markdown: string): Deck {
  const titleMatch = markdown.match(TITLE_RE);
  const title = titleMatch ? titleMatch[1].trim() : humanizeSlug(slug);

  const lines = markdown.split(/\r?\n/);
  const blocks: string[][] = [[]];
  for (const line of lines) {
    if (SEPARATOR_RE.test(line)) {
      blocks.push([]);
    } else {
      blocks[blocks.length - 1].push(line);
    }
  }

  const cards: Card[] = [];
  for (const block of blocks) {
    const frontIdx = block.findIndex((line) => FRONT_RE.test(line));
    if (frontIdx === -1) continue;
    const frontMatch = block[frontIdx].match(FRONT_RE);
    if (!frontMatch) continue;
    const front = frontMatch[1].trim();
    const back = block.slice(frontIdx + 1).join("\n").trim();
    if (back.length === 0) {
      console.warn(`[parse-deck] empty back for card "${front}" in deck "${slug}"`);
    }
    cards.push({
      id: cardId(slug, front),
      deckSlug: slug,
      front,
      back,
    });
  }

  return {
    slug,
    title,
    cardCount: cards.length,
    cards,
  };
}
