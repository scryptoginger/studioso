# 1a. NLP Foundations

## What is the difference between tokens and types in a corpus?

**Tokens** are every occurrence of a unit in the text; **types** are the distinct units (the vocabulary). "the cat sat on the mat" has 6 tokens but 5 types, because "the" appears twice.

Vocabulary size is a count of types; corpus size is a count of tokens.

---

## What does Zipf's law say about word frequencies, and why does it matter for NLP?

A word's frequency is roughly **inversely proportional to its frequency rank**: the 2nd most common word appears about half as often as the 1st, the 3rd about a third as often, and so on.

Consequence: a handful of words (mostly stopwords) dominate the token count, while most types sit in a long tail seen only once or twice. That long tail is why text features are so sparse and why rare words are hard to learn from.

---

## How does CountVectorizer turn documents into a document-term matrix?

It learns a vocabulary (one column per type) from the training documents, then counts how often each type appears in each document (one row per document). The result is a **sparse** matrix because most documents contain only a tiny fraction of the vocabulary.

```python
from sklearn.feature_extraction.text import CountVectorizer
docs = ["the flight was late", "the crew was great", "late again"]
cv = CountVectorizer()
X = cv.fit_transform(docs)        # scipy sparse matrix, shape (3, 7)
cv.get_feature_names_out()        # ['again' 'crew' 'flight' 'great' 'late' 'the' 'was']
```

---

## What is the tradeoff when you increase n in n-gram features?

An **n-gram** is a run of n consecutive tokens ("not good" is a bigram). Larger n captures more local word order and phrasing, but the number of possible n-grams explodes and most appear only once, so features get **sparser** and the model has fewer examples per feature.

In practice, unigrams plus bigrams (`ngram_range=(1, 2)`) is the common sweet spot for short texts.

---

## How do min_df and max_df prune a vectorizer's vocabulary?

- **min_df:** drop terms that appear in fewer than N documents (integer) or a fraction of documents (float). Removes typos and one-off noise.
- **max_df:** drop terms that appear in more than a fraction of documents. Removes corpus-specific stopwords (in airline tweets, an airline name might appear almost everywhere).

```python
CountVectorizer(min_df=2, max_df=0.9)
```

---

## What happens to an out-of-vocabulary word when a fitted CountVectorizer transforms new text?

It is **silently ignored**: the vocabulary is fixed at `fit` time, so unseen words get no column and contribute nothing. No error is raised.

```python
cv.transform(["the wifi was awful"])   # only 'the' and 'was' are counted
```

This is a quiet failure mode: if the test data uses new slang, the classifier simply can't see it.

---

## What is part-of-speech (POS) tagging, and why does lemmatization depend on it?

POS tagging labels each token with its grammatical role (noun, verb, adjective, and so on). The correct lemma depends on that role: "meeting" as a verb lemmatizes to "meet", but as a noun it stays "meeting".

Pitfall: NLTK's `WordNetLemmatizer` assumes every word is a noun unless you pass `pos=`, so `lemmatize("running")` returns "running". spaCy's English pipelines tag POS first, so its `token.lemma_` gets this right.

---

## What is named entity recognition (NER)?

NER finds spans of text that name real-world things and labels their type, such as a person, organization, location, or date.

```python
doc = nlp("Delta lost my bag in Atlanta on Friday")
[(ent.text, ent.label_) for ent in doc.ents]
# e.g. [('Delta', 'ORG'), ('Atlanta', 'GPE'), ('Friday', 'DATE')]
```

Labels come from the model's training data, so a small pipeline can mislabel informal text.

---

## What does dependency parsing produce, and how can it help with negation?

It links each word to the word it grammatically depends on (its **head**) and labels the relation, producing a tree for the sentence. In spaCy, `token.head` and `token.dep_` expose it.

That tree shows **what a negation attaches to**: in "the crew was not helpful", "not" attaches with a `neg` relation to the verb "was", the same head that "helpful" attaches to, so you can tell the negation governs that description. A flat bag of words cannot show this.

---

## What is "naive" about Naive Bayes for text classification?

It assumes every word is **conditionally independent** of every other word given the class, so a document's probability is just the product of each word's probability under that class. The assumption is plainly false ("not" and "good" interact), yet the classifier is fast, needs little data, and is a strong baseline for text.

```
P(class | doc) ∝ P(class) × Π P(word_i | class)
```

---

## Why does Naive Bayes need Laplace (add-one) smoothing?

If a word never appeared with a class in training, its estimated probability for that class is 0, and multiplying by 0 wipes out the whole document's score no matter what the other words say. Smoothing adds a small count (alpha) to every word-class pair so nothing is ever exactly 0.

In scikit-learn, `MultinomialNB(alpha=1.0)` is the default add-one smoothing.

---

## Why is logistic regression on TF-IDF features a popular text baseline?

It trains fast on sparse features, handles large vocabularies well, and is **interpretable**: each word or n-gram gets a learned coefficient per class.

```python
clf.coef_   # shape (n_classes, n_features)
```

Sorting a class's coefficients shows which features push hardest toward or away from that class, which is useful evidence when you explain a model's behavior.

---

## How does a lexicon-based sentiment tool like VADER differ from a trained classifier?

- **Lexicon-based (VADER):** scores text from a hand-built dictionary of word sentiment plus rules for intensifiers, negation, ALL CAPS, punctuation, and emoticons. Needs no training data and was designed for social-media text.
- **Trained classifier:** learns which features matter from labeled examples, so it can pick up domain-specific signals (like "delayed" in airline tweets) that a general lexicon misses.

VADER's `compound` score runs from -1 (most negative) to +1 (most positive).

---

## Why is sarcasm a hard case for sentiment models?

The surface words carry the **opposite** sentiment of the intent. "Great, another 3-hour delay. Love it." is full of positive words but is a complaint.

Lexicon and bag-of-words models are most easily fooled because they count words, not intent; context-aware models do better but still miss many cases. Expect sarcastic tweets among your misclassified examples.

---

## What does topic modeling with LDA do?

Latent Dirichlet Allocation is an **unsupervised** method that treats each document as a mixture of topics and each topic as a probability distribution over words. You choose the number of topics; the model learns which words cluster into each topic and how much of each topic each document contains.

It needs no labels, so it's used for exploring what a corpus talks about, not for predicting sentiment.

---

## What is a language model?

A model that assigns probabilities to sequences of tokens, usually by predicting the **next token given the tokens before it**.

```
P(w_1 ... w_n) = Π P(w_i | w_1 ... w_(i-1))
```

N-gram language models estimate those probabilities from counts over the previous n-1 words; neural language models (RNNs, transformers) learn them.

---

## What does perplexity measure, and what is its main pitfall?

How "surprised" a language model is by held-out text: the exponential of the average negative log-probability per token. **Lower is better**. Intuitively it is the effective number of equally likely next-token choices: a model that gives every actual next token probability 0.25 has perplexity 4.

```
perplexity = exp( -(1/N) × Σ log P(w_i | previous tokens) )
```

Pitfall: it is only comparable between models that share the same tokenizer and vocabulary, because the per-token count changes with how text is split.

---
