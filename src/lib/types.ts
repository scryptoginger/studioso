export type Confidence = "unknown" | "learning" | "known";

export type Card = {
  id: string;
  deckSlug: string;
  front: string;
  back: string;
};

export type Deck = {
  slug: string;
  title: string;
  cardCount: number;
  cards: Card[];
};

export type CardProgress = {
  cardId: string;
  confidence: Confidence;
  lastReviewed: number;
};
