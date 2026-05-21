import { parseDeck } from "../src/lib/parse-deck";

const sample = `# Sample Deck

## What is a tensor?

A tensor is a multi-dimensional array used as the core data structure in
modern ML frameworks. Scalars, vectors, and matrices are all tensors of
rank 0, 1, and 2 respectively.

---

## Gradient descent

An iterative optimization method that updates parameters in the direction
of the negative gradient of a loss function.

\`\`\`python
w -= lr * grad
\`\`\`

---

## Empty back card

---

## Multi-line back

Back has multiple paragraphs.

A second paragraph here.

- with a bullet
- and another
`;

const deck = parseDeck("sample", sample);
console.log("Title:", deck.title);
console.log("Card count:", deck.cardCount);
console.log("Slug:", deck.slug);
console.log();
for (const card of deck.cards) {
  console.log(`[${card.id}] front: ${card.front}`);
  console.log(`  back: ${card.back.slice(0, 60).replace(/\n/g, " ")}${card.back.length > 60 ? "..." : ""}`);
  console.log();
}

const issues: string[] = [];
if (deck.title !== "Sample Deck") issues.push(`title was "${deck.title}"`);
if (deck.cardCount !== 4) issues.push(`cardCount was ${deck.cardCount}, expected 4`);
if (deck.cards[0].front !== "What is a tensor?") issues.push(`first front wrong`);
if (!deck.cards[1].back.includes("```python")) issues.push("code block not preserved");
if (deck.cards[2].back !== "") issues.push("empty back not empty string");
if (deck.cards.some((c) => c.id.length !== 16)) issues.push("id length should be 16");
const ids = new Set(deck.cards.map((c) => c.id));
if (ids.size !== deck.cards.length) issues.push("duplicate ids");

const slugDeck = parseDeck("ml-fundamentals", "## Only card\n\nBack text.\n");
if (slugDeck.title !== "Ml Fundamentals") issues.push(`humanized title was "${slugDeck.title}"`);

if (issues.length) {
  console.error("FAIL:", issues.join("; "));
  process.exit(1);
}
console.log("OK — parser passed sanity test.");
