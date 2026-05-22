import Link from "next/link";
import { loadAllDecks } from "@/lib/load-decks";
import type { Deck } from "@/lib/types";

const ACCENTS = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
];

function accentFor(slug: string): string {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

export default async function Home() {
  const decks = await loadAllDecks();

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-[max(2.25rem,env(safe-area-inset-top))]">
      <header className="mb-7">
        <h1 className="text-3xl font-bold tracking-tight">Studioso</h1>
        <p className="mt-1.5 text-[15px] text-slate-500 dark:text-slate-400">
          {decks.length > 0
            ? "Tap a deck to start studying."
            : "Personal flashcards from markdown."}
        </p>
      </header>

      {decks.length === 0 ? <EmptyState /> : <DeckGrid decks={decks} />}
    </main>
  );
}

function DeckGrid({ decks }: { decks: Deck[] }) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {decks.map((deck) => {
        const initial = deck.title.trim().charAt(0).toUpperCase() || "?";
        return (
          <li key={deck.slug}>
            <Link
              href={`/study/${deck.slug}`}
              className="group flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0 active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${accentFor(deck.slug)}`}
              >
                {initial}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold tracking-tight">
                  {deck.title}
                </span>
                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                  {deck.cardCount} card{deck.cardCount === 1 ? "" : "s"}
                </span>
              </span>
              <svg
                className="shrink-0 text-slate-300 transition-colors group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
      <p className="font-semibold">No decks yet</p>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        Add a markdown file at{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] dark:bg-slate-800">
          decks/your-deck.md
        </code>{" "}
        and commit it. Cards are separated by a line containing{" "}
        <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] dark:bg-slate-800">
          ---
        </code>
        :
      </p>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-100 dark:bg-black/40">
        {`# Deck Title

## Card front

Card back, supports **markdown**.

---

## Next card front

Next card back.`}
      </pre>
    </div>
  );
}
