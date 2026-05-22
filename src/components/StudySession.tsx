"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Markdown from "./Markdown";
import type { Card, CardProgress, Confidence, Deck } from "@/lib/types";
import { loadProgress, saveProgress } from "@/lib/progress";

type Props = { deck: Deck };

function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function StudySession({ deck }: Props) {
  const [order, setOrder] = useState<string[]>(() =>
    deck.cards.map((c) => c.id),
  );
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [progress, setProgress] = useState<Record<string, CardProgress>>({});
  const [hydrated, setHydrated] = useState(false);

  // Shuffle and load saved progress on mount (client-only).
  useEffect(() => {
    setOrder(shuffle(deck.cards.map((c) => c.id)));
    setProgress(loadProgress(deck.slug));
    setHydrated(true);
  }, [deck.slug, deck.cards]);

  const cardsById = useMemo(() => {
    const m = new Map<string, Card>();
    for (const c of deck.cards) m.set(c.id, c);
    return m;
  }, [deck.cards]);

  const finished = hydrated && index >= order.length;
  const currentCard = !finished ? cardsById.get(order[index]) : undefined;

  function markConfidence(confidence: Confidence) {
    if (!currentCard) return;
    const next: Record<string, CardProgress> = {
      ...progress,
      [currentCard.id]: {
        cardId: currentCard.id,
        confidence,
        lastReviewed: Date.now(),
      },
    };
    setProgress(next);
    saveProgress(deck.slug, next);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  function restart() {
    setOrder(shuffle(deck.cards.map((c) => c.id)));
    setIndex(0);
    setFlipped(false);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6">
      <TopBar
        title={deck.title}
        index={index}
        total={order.length}
        finished={finished}
      />
      <ProgressBar value={finished ? order.length : index} total={order.length} />
      <div className="mt-4 flex flex-1 flex-col">
        {finished ? (
          <SessionSummary
            cards={deck.cards}
            progress={progress}
            onRestart={restart}
          />
        ) : currentCard ? (
          <CardView
            card={currentCard}
            flipped={flipped}
            onFlip={() => setFlipped((f) => !f)}
            onMark={markConfidence}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
            Loading…
          </div>
        )}
      </div>
    </main>
  );
}

function TopBar({
  title,
  index,
  total,
  finished,
}: {
  title: string;
  index: number;
  total: number;
  finished: boolean;
}) {
  const counterIndex = finished ? total : Math.min(index + 1, total);
  return (
    <header className="flex items-center gap-2">
      <Link
        href="/"
        aria-label="All decks"
        className="-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 active:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <svg
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
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>
      <h1 className="flex-1 truncate text-base font-semibold tracking-tight">
        {title}
      </h1>
      <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-500 dark:bg-slate-800 dark:text-slate-400">
        {counterIndex} / {total}
      </span>
    </header>
  );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
      <div
        className="h-full rounded-full bg-indigo-500 transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function CardView({
  card,
  flipped,
  onFlip,
  onMark,
}: {
  card: Card;
  flipped: boolean;
  onFlip: () => void;
  onMark: (c: Confidence) => void;
}) {
  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Answer — tap to hide" : "Question — tap to reveal answer"}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onFlip();
          }
        }}
        className="flex flex-1 cursor-pointer flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-transform active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        <div
          key={`${card.id}:${flipped ? "b" : "f"}`}
          className="animate-card-in flex flex-1 flex-col"
        >
          {flipped ? (
            <>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                <Markdown>{card.front}</Markdown>
              </div>
              <div className="my-4 h-px bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 overflow-y-auto text-[15px] leading-relaxed">
                <Markdown>{card.back}</Markdown>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                <Markdown>{card.front}</Markdown>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 min-h-[3.5rem]">
        {flipped ? (
          <div className="grid grid-cols-3 gap-2.5">
            <ConfidenceButton
              label="Don't know"
              tone="red"
              onClick={() => onMark("unknown")}
            />
            <ConfidenceButton
              label="Learning"
              tone="amber"
              onClick={() => onMark("learning")}
            />
            <ConfidenceButton
              label="Know it"
              tone="green"
              onClick={() => onMark("known")}
            />
          </div>
        ) : (
          <p className="py-3.5 text-center text-sm font-medium text-slate-400 dark:text-slate-500">
            Tap the card to reveal the answer
          </p>
        )}
      </div>
    </>
  );
}

const TONE_CLASSES: Record<"red" | "amber" | "green", string> = {
  red: "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700",
  amber: "bg-amber-400 text-amber-950 hover:bg-amber-500 active:bg-amber-600",
  green: "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700",
};

function ConfidenceButton({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "red" | "amber" | "green";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-2 py-3.5 text-sm font-semibold shadow-sm transition active:scale-[0.97] ${TONE_CLASSES[tone]}`}
    >
      {label}
    </button>
  );
}

function SessionSummary({
  cards,
  progress,
  onRestart,
}: {
  cards: Card[];
  progress: Record<string, CardProgress>;
  onRestart: () => void;
}) {
  const tiers: Record<Confidence, number> = {
    unknown: 0,
    learning: 0,
    known: 0,
  };
  for (const card of cards) {
    const p = progress[card.id];
    if (p) tiers[p.confidence] += 1;
  }
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-7 py-8 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <h2 className="text-2xl font-bold tracking-tight">Session complete</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You reviewed {cards.length} card{cards.length === 1 ? "" : "s"}.
        </p>
      </div>

      <ul className="grid w-full max-w-xs gap-2">
        <SummaryRow label="Know it" count={tiers.known} tone="green" />
        <SummaryRow label="Learning" count={tiers.learning} tone="amber" />
        <SummaryRow label="Don't know" count={tiers.unknown} tone="red" />
      </ul>

      <div className="flex w-full max-w-xs flex-col gap-2.5">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.98]"
        >
          Study again
        </button>
        <Link
          href="/"
          className="rounded-xl px-6 py-3 text-sm font-medium text-slate-500 transition hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          Back to all decks
        </Link>
      </div>
    </div>
  );
}

const DOT_TONES: Record<"red" | "amber" | "green", string> = {
  red: "bg-rose-500",
  amber: "bg-amber-400",
  green: "bg-emerald-500",
};

function SummaryRow({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "red" | "amber" | "green";
}) {
  return (
    <li className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <span className="flex items-center gap-2.5 text-sm font-medium">
        <span className={`h-2.5 w-2.5 rounded-full ${DOT_TONES[tone]}`} />
        {label}
      </span>
      <span className="text-base font-bold tabular-nums">{count}</span>
    </li>
  );
}
