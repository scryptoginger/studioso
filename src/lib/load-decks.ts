import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parseDeck } from "./parse-deck";
import type { Deck } from "./types";

const DECKS_DIR = path.join(process.cwd(), "decks");

async function readDeckFile(slug: string): Promise<Deck | null> {
  const filePath = path.join(DECKS_DIR, `${slug}.md`);
  try {
    const markdown = await readFile(filePath, "utf8");
    return parseDeck(slug, markdown);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function loadAllDecks(): Promise<Deck[]> {
  let entries: string[];
  try {
    entries = await readdir(DECKS_DIR);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const slugs = entries
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.slice(0, -3));

  const decks = await Promise.all(slugs.map((slug) => readDeckFile(slug)));
  return decks
    .filter((d): d is Deck => d !== null)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function loadDeck(slug: string): Promise<Deck | null> {
  return readDeckFile(slug);
}
