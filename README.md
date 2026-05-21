# Studioso

A personal flashcard PWA. Decks are markdown files committed to this repo;
the app reads them at build time and renders a mobile-first study UI on
Vercel. New deck → `git push` → live within ~30 seconds.

## Adding a deck

Drop a markdown file in `/decks/`, commit, push. Vercel rebuilds
automatically.

```bash
$EDITOR decks/transformers.md
git add decks/transformers.md
git commit -m "decks: transformers"
git push
```

## Card format

Each file is one deck. The first `# ` line is the deck title (otherwise
the slug is humanized). Cards are separated by `---` on its own line.
Within a card, the first `## ` heading is the front; everything after,
up to the next separator, is the back.

````markdown
# Deck Title

## Card front

Card back. Supports **markdown**, including:

- bullet lists
- `inline code`
- code blocks

```python
print("hello")
```

---

## Next card front

Next card back.
````

The back is parsed as full GitHub-flavored markdown, so links, tables,
nested lists, and fenced code blocks all render. Cards with no `## `
heading are skipped; cards with empty backs are kept but logged at
build time.

## Running locally

```bash
npm install
npm run dev   # http://localhost:3000
```

Production build (also what Vercel runs):

```bash
npm run build
npm run start
```

Both commands pass `--webpack` because the PWA plugin hooks the webpack
build pipeline; Turbopack is not used.

## Deployment

Connect this GitHub repo to Vercel and accept the defaults. Every push
to `main` triggers a rebuild and the new deck list is live within the
build window (~30 seconds for this codebase).

## Progress persistence

Card confidence (Don't know / Learning / Know it) is stored in
`localStorage` keyed by deck slug — `studioso:progress:{slug}`. Clearing
browser storage resets progress. There's no server, no sync, no auth.

## Replace the placeholder icons

`public/icon-192.png` and `public/icon-512.png` are auto-generated
placeholders (dark slate, white "S"). To regenerate after editing
`scripts/generate-icons.ts`:

```bash
npx tsx scripts/generate-icons.ts
```

Drop in real artwork at the same paths to replace them.

## Layout

- `decks/` — deck source files
- `src/app/` — Next.js App Router pages
- `src/components/` — client components (`StudySession`, `Markdown`)
- `src/lib/` — parser, deck loader, types, progress persistence
- `scripts/` — one-off TS helpers (parser sanity test, icon generator)
