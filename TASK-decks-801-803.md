# Task: add D801 and D803 decks to Studioso

## Context

Studioso is a Next.js flashcard PWA. Each deck is one markdown file in `/decks/`. The deck list is read at build time and Vercel rebuilds on push. I am a WGU MS AI/ML student. Two courses have no decks yet:

- **D801:** AWS Certified Machine Learning Engineer – Associate prep (exam MLA-C01, possibly now MLA-C02).
- **D803:** Natural Language Processing. My tasks are sentiment classification on tweets with Python, spaCy, scikit-learn, PyTorch and Hugging Face Transformers.

Existing D802 decks (for example `wgu-d802-cnn-foundations.md`) show the house style. Read one or two. Do not modify them.

## Ground rules

1. Before writing anything, read `CLAUDE.md`, `AGENTS.md`, the README, and the deck parser in `src/lib`. If any of them conflicts with this doc, follow them and tell me.
2. Touch only `/decks/`, and only add new files. No app code changes, no dependency changes, no `sudo`, no global installs.
3. Do not invent. Every card must be correct. If you are unsure of a fact, leave the card out and list the topic under "Needs verification" in your final report.
4. Do not state numeric service limits, quotas, sizes, latencies or prices unless you verified them against current official AWS documentation in this session. Otherwise describe the behavior qualitatively and add one card on where to check current limits.
5. Commit locally, one commit per deck, with the message `decks: <slug>`. **Do not push.** I will review the diff and push myself.

## Deck format (must match exactly)

- The file opens with a single `# Deck Title` line.
- Each card front is an H2 (`## `).
- The back is everything after the H2, up to the next separator.
- Cards are separated by `---` on its own line, with a blank line above and below. The last card also ends with `---`.
- Card IDs come from a hash of `deckSlug:front`, so fronts must be unique within a deck.
- No `$$` math. Put formulas in plain-text fenced blocks. Use language-tagged fences for code.

## Card quality (every card must pass)

- **Atomic:** one concept per card. When in doubt, split.
- **Specific front:** it asks for exactly one piece of information.
- **No yes/no fronts.**
- **Concise back:** 1–4 sentences, plus an optional fenced block. A longer back means two cards.
- **Mixed types:** definition, comparison, mechanism, formula, code, pitfall. A deck that is mostly definitions is lazy; rebalance it.
- **Order:** foundational to advanced.
- **Ladders:** do not use them by default. At most one ladder per deck, only for a genuinely dense topic. Front format: `## Topic — L2: Mechanism`. Back ends with the blockquote `> Ladder: **Topic** (2/4) → next: Compare`.
- **Size:** 12–15 cards per deck.

## Part A: D801 (5 decks)

First, determine the current exam version. Check the official AWS exam guide for the Machine Learning Engineer – Associate certification and report whether MLA-C01 or MLA-C02 is current and whether the domains or weights differ. If you cannot reach the guide, use the four MLA-C01 domains below, and flag that in your report.

| Slug | Covers |
| --- | --- |
| `wgu-d801-data-preparation` | Domain 1: ingesting, transforming, cleaning and engineering data for ML on AWS |
| `wgu-d801-model-development` | Domain 2: choosing algorithms, training, tuning, evaluating models |
| `wgu-d801-deployment-orchestration` | Domain 3: deploying models, endpoints, pipelines, CI/CD for ML |
| `wgu-d801-monitoring-security` | Domain 4: monitoring, drift, cost, security, IAM, encryption, networking |
| `wgu-d801-exam-weak-spots` | Scenario cards on the priority topics below |

**Priority topics for `wgu-d801-exam-weak-spots`** (past students reported these as hard):

- Networking, VPC and subnet scenarios for SageMaker.
- Label encoding vs. one-hot encoding.
- Matching the metric to the business problem (for example RMSE for price prediction vs. accuracy or F1 for classification).
- Algorithm use cases (CatBoost, DeepAR, and similar).
- SageMaker endpoint types: real-time, serverless, asynchronous and batch, and what each is for.

Exam-style fronts are short scenarios. For example: "A team needs X under constraint Y. Which option fits, and why?" The back states the choice, a one- or two-sentence reason, and the trap (the tempting wrong answer).

## Part B: D803 (3 decks)

I will use these alongside hands-on morning sessions and extend them later with my own examples, so keep the cards generic and do not tie them to a specific dataset. Use general knowledge plus the official docs for spaCy, scikit-learn and Hugging Face. Verify API names against current docs when you can reach them.

| Slug | Covers |
| --- | --- |
| `wgu-d803-preprocessing` | Tokenization, lowercasing, punctuation and special-character removal, stopword removal (including how it can destroy negation, as in "not good"), stemming vs. lemmatization, handling missing data, what a text embedding is (TF-IDF vs. dense vectors), and how each step can help or hurt sentiment analysis |
| `wgu-d803-sequence-models` | Why bag-of-words loses word order, RNNs, vanishing gradients in long sequences, LSTM gates, attention, the transformer, pretrained models and fine-tuning, and why transformers bring their own tokenizers |
| `wgu-d803-evaluation-optimization` | Accuracy, precision, recall, F1 (macro vs. weighted), reading a confusion matrix, class imbalance, train/validation/test splits, why the test set is used once, cross-validation, tuning one variable at a time, run-to-run variance, and signs of overfitting |

## Validation (all must pass before you report done)

1. Run the repo's build (`npm run build`), plus any lint or test script the repo defines. Use only npm scripts.
2. Write a small throwaway check, outside `/decks/`, and delete it afterward. It confirms that for every new deck:
   - there is exactly one H1;
   - every card has an H2 front;
   - the file ends with `---`;
   - there are no duplicate fronts within the deck;
   - there is no `$$`;
   - there are 12–15 cards.
3. Confirm `git status` shows only new files under `/decks/`, and that `git log` shows one `decks: <slug>` commit per deck.

## Final report

Give me a table with: deck, card count, what it was verified against, and anything under "Needs verification". Also state the exam version finding for D801. Finish with the exact commands to review the diff and push.
