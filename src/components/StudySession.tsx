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
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-4 pb-6 pt-4 sm:px-6">
      <TopBar
        title={deck.title}
        index={index}
        total={order.length}
        finished={finished}
      />
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
          <div className="flex flex-1 items-center justify-center text-slate-500">
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
    <header className="flex items-center gap-3">
      <Link
        href="/"
        aria-label="Back to decks"
        className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </Link>
      <h1 className="flex-1 truncate text-lg font-medium tracking-tight">
        {title}
      </h1>
      <span className="text-sm tabular-nums text-slate-500 dark:text-slate-400">
        {counterIndex} / {total}
      </span>
    </header>
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
      <button
        type="button"
        onClick={onFlip}
        className="flex flex-1 select-text flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition active:scale-[0.995] dark:border-slate-800 dark:bg-slate-900 sm:p-8"
      >
        {flipped ? (
          <>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              <Markdown>{card.front}</Markdown>
            </div>
            <div className="h-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex-1 text-base leading-7">
              <Markdown>{card.back}</Markdown>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-center text-2xl font-medium leading-snug sm:text-3xl">
            <Markdown>{card.front}</Markdown>
          </div>
        )}
      </button>

      <div className="mt-4">
        {flipped ? (
          <div className="grid grid-cols-3 gap-2">
            <ConfidenceButton
              label="Don't know"
              tone="red"
              onClick={() => onMark("unknown")}
            />
            <ConfidenceButton
              label="Learning"
              tone="yellow"
              onClick={() => onMark("learning")}
            />
            <ConfidenceButton
              label="Know it"
              tone="green"
              onClick={() => onMark("known")}
            />
          </div>
        ) : (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Tap card to reveal
          </p>
        )}
      </div>
    </>
  );
}

const TONE_CLASSES: Record<"red" | "yellow" | "green", string> = {
  red: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
  yellow: "bg-amber-400 text-slate-900 hover:bg-amber-500 active:bg-amber-600",
  green: "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700",
};

function ConfidenceButton({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "red" | "yellow" | "green";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl px-3 py-3 text-sm font-medium shadow-sm transition active:scale-[0.98] ${TONE_CLASSES[tone]}`}
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
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">Session complete</h2>
      <ul className="grid w-full max-w-xs grid-cols-1 gap-2 text-left">
        <SummaryRow label="Know it" count={tiers.known} tone="green" />
        <SummaryRow label="Learning" count={tiers.learning} tone="yellow" />
        <SummaryRow label="Don't know" count={tiers.unknown} tone="red" />
      </ul>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition active:scale-[0.98] dark:bg-slate-100 dark:text-slate-900"
      >
        Study again
      </button>
    </div>
  );
}

const DOT_TONES: Record<"red" | "yellow" | "green", string> = {
  red: "bg-red-500",
  yellow: "bg-amber-400",
  green: "bg-emerald-500",
};

function SummaryRow({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "red" | "yellow" | "green";
}) {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
      <span className="flex items-center gap-3 text-sm">
        <span className={`h-2.5 w-2.5 rounded-full ${DOT_TONES[tone]}`} />
        {label}
      </span>
      <span className="text-base font-medium tabular-nums">{count}</span>
    </li>
  );
}
