import Link from "next/link";
import { loadAllDecks } from "@/lib/load-decks";

export default async function Home() {
  const decks = await loadAllDecks();

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="text-4xl font-semibold tracking-tight">Studioso</h1>
        <p className="mt-2 text-base text-slate-600 dark:text-slate-400">
          Tap a deck to study.
        </p>
      </header>

      {decks.length === 0 ? <EmptyState /> : <DeckGrid decks={decks} />}
    </main>
  );
}

function DeckGrid({
  decks,
}: {
  decks: Awaited<ReturnType<typeof loadAllDecks>>;
}) {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {decks.map((deck) => (
        <li key={deck.slug}>
          <Link
            href={`/study/${deck.slug}`}
            className="block w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition active:scale-[0.98] active:shadow-none hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <h2 className="text-lg font-medium tracking-tight">{deck.title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {deck.cardCount} card{deck.cardCount === 1 ? "" : "s"}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <p className="font-medium text-slate-900 dark:text-slate-100">
        No decks yet.
      </p>
      <p className="mt-2">
        Add a markdown file at{" "}
        <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
          decks/your-deck.md
        </code>{" "}
        and commit it. Cards are separated by{" "}
        <code className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
          ---
        </code>{" "}
        on its own line:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-xs text-slate-100">
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
