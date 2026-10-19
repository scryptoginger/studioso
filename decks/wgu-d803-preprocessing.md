# 1. D803 Preprocessing

## What is tokenization in NLP?

Splitting raw text into units (**tokens**) that a model can count or look up: words, subwords, characters or punctuation. Every later step (stopword removal, lemmatization, vectorizing) works on tokens, so tokenization choices propagate through the whole pipeline.

---

## How does word-level tokenization differ from subword tokenization on informal text like tweets?

- **Word-level:** each whitespace- or rule-delimited word is a token. Misspellings and slang ("sooo", "gr8") become rare or unknown words.
- **Subword (BPE, WordPiece):** rare words are broken into frequent pieces (for example, DistilBERT's uncased WordPiece tokenizer splits "unhappiness" into `un`, `##ha`, `##pp`, `##iness`; the exact split depends on the learned vocabulary). Unseen words still get a representation.

Subword tokenization is one reason transformers cope better with noisy social-media text.

---

## How can lowercasing help or hurt sentiment analysis?

- **Helps:** "Great", "GREAT" and "great" collapse into one feature, which shrinks the vocabulary and pools the evidence.
- **Hurts:** case can carry sentiment. "this is GREAT" vs "this is great" differ in intensity, and ALL CAPS often signals anger or excitement.

A middle ground: lowercase, but first add a feature such as "proportion of all-caps tokens".

---

## What sentiment signal is lost by stripping punctuation and special characters?

Emoticons and emoji (`:)`, `:(`, 😡), repeated marks (`!!!`, `?!`), and sometimes hashtags carry strong sentiment, and blanket removal deletes them.

Safer: remove true noise (HTML entities, stray symbols). Replace URLs and @mentions with placeholder tokens such as `URL` and `USER`, and keep or map emoticons and emoji to words.

---

## How can stopword removal destroy negation in sentiment analysis?

Standard English stopword lists, including spaCy's `STOP_WORDS` and scikit-learn's `ENGLISH_STOP_WORDS`, contain **"not", "no", "nor" and "never"**. Removing them turns "not good" into "good" and flips the sentiment of the text.

Fix: remove negations from the stopword list, or skip stopword removal for sentiment tasks.

---

## How do you remove stopwords with spaCy while keeping negations?

Check each token's stop flag, but let negation words through:

```python
import spacy

nlp = spacy.load("en_core_web_sm")
KEEP = {"not", "no", "nor", "never", "n't"}

def clean(text):
    doc = nlp(text)
    return [t.lemma_.lower() for t in doc
            if not t.is_punct and (not t.is_stop or t.lower_ in KEEP)]
```

spaCy splits "isn't" into "is" + "n't", so `"n't"` must be in the keep set.

---

## How do stemming and lemmatization differ?

- **Stemming:** chops suffixes with rules. It is fast but crude, and can produce non-words: Porter stems "studies" → "studi".
- **Lemmatization:** maps a word to its dictionary form using vocabulary and part of speech: "studies" → "study", "was" → "be".

Both shrink the vocabulary. Lemmatization keeps real words, which makes features easier to read. In spaCy it's `token.lemma_`.

---

## How should missing or empty text be handled before training a text classifier?

Drop rows whose **text or label is missing**. You can't meaningfully impute a tweet or its sentiment.

```python
df = df.dropna(subset=["text", "label"])
df = df[df["text"].str.strip() != ""]
```

Pitfall: calling `str()` on a missing value turns it into the literal token "nan", which the model then learns as a word.

---

## Why should duplicate texts be removed before splitting into train and test sets?

Retweets and copy-pasted posts produce identical texts. If one copy lands in training and another in test, the model is graded on examples it has effectively memorized, and test scores come out inflated.

Deduplicate first (for example `df.drop_duplicates(subset="text")`), then split.

---

## What is a text embedding?

A **numeric vector that represents a piece of text** (a word, sentence or document) so a model can compute with it. Texts with similar meaning should map to nearby vectors. Every classifier needs text turned into numbers in some form, whether sparse counts or dense learned vectors.

---

## How is a TF-IDF weight computed?

```text
tfidf(t, d) = tf(t, d) * idf(t)
idf(t)      = log(N / df(t))

tf(t, d)  = count of term t in document d
N         = number of documents
df(t)     = number of documents containing t
```

Words that appear in nearly every document get low weight. Words that are distinctive to a few documents get high weight. scikit-learn's `TfidfVectorizer` uses a smoothed idf by default.

---

## How do you configure TfidfVectorizer so negation survives as a feature?

Keep stopwords and add bigrams, so "not good" becomes its own feature:

```python
from sklearn.feature_extraction.text import TfidfVectorizer

vec = TfidfVectorizer(ngram_range=(1, 2), stop_words=None, min_df=2)
X_train = vec.fit_transform(train_texts)
X_test = vec.transform(test_texts)
```

`min_df=2` drops n-grams seen in only one document, which trims noise from typos.

---

## What is the leakage pitfall when fitting a vectorizer?

Calling `fit` or `fit_transform` on **all** the data (train plus test) lets the vocabulary and idf weights see the test set. Evaluation then looks better than it will in production.

Fit on training text only, then `transform` validation and test. Wrapping the vectorizer and model in a scikit-learn `Pipeline` enforces this, including inside cross-validation.

---

## How do sparse TF-IDF vectors differ from dense embeddings?

- **TF-IDF:** one dimension per vocabulary term, so very high-dimensional and mostly zeros. "good" and "great" are unrelated dimensions. It is fast, interpretable, and a strong baseline.
- **Dense embeddings** (word2vec, transformer outputs): a few hundred learned dimensions. Similar meanings get **similar vectors**, so knowledge transfers across synonyms. They are less interpretable and cost more to compute.

---

## How much traditional cleaning should text get before it goes into a pretrained transformer?

Very little. Pass near-raw text to the **model's own tokenizer**. These models were pretrained on natural text with punctuation and stopwords left in (uncased models lowercase inside their own tokenizer). Stripping them removes context the model knows how to use, such as "not" and "!".

Still do the basic hygiene: drop empty rows, deduplicate, and replace URLs and @mentions with placeholders.

---
