# 4a. NLP Embeddings

## What is the distributional hypothesis?

**Words that occur in similar contexts tend to have similar meanings.** "Flight", "plane", and "aircraft" keep appearing next to words like "delayed", "boarded", and "gate", so a model that learns from context will place them close together.

Every learned word embedding method (Word2Vec, GloVe, BERT) is built on this idea.

---

## How do Word2Vec's CBOW and skip-gram objectives differ?

Both train a shallow network on a sliding context window, and the learned weights become the word vectors.

- **CBOW (continuous bag of words):** predict the center word from its surrounding context words. Faster to train.
- **Skip-gram:** predict the surrounding context words from the center word. Slower, but tends to do better on rare words.

---

## How does GloVe differ from Word2Vec in what it learns from?

- **Word2Vec** learns from **local** context windows, one window at a time, as a prediction task.
- **GloVe** first builds a **global word-word co-occurrence matrix** over the whole corpus, then learns vectors whose dot products fit the (log) co-occurrence counts.

Both produce one fixed vector per word.

---

## What limitation of static word embeddings do contextual embeddings fix?

Static embeddings (Word2Vec, GloVe) give a word **one vector regardless of context**, so "bank" in "river bank" and "bank account" gets the same representation. Contextual models like BERT compute each token's vector from the whole sentence, so the same word gets different vectors in different contexts.

This matters for sentiment: "sick" in "the turbulence made me sick" vs "that landing was sick".

---

## What is cosine similarity, and why is it preferred over Euclidean distance for comparing text vectors?

It measures the **angle** between two vectors, ignoring their length: 1 means same direction, 0 means unrelated (orthogonal).

```
cos(a, b) = (a · b) / (‖a‖ × ‖b‖)
```

A long document has bigger counts than a short one about the same thing. Euclidean distance treats them as far apart; cosine sees the same direction and scores them as similar. Example: `[2, 0, 1]` and `[4, 0, 2]` have cosine 1.0 but Euclidean distance about 2.24.

---

## How does byte-pair encoding (BPE) build a subword vocabulary?

1. Start with a vocabulary of single characters (or bytes).
2. Count every adjacent pair of symbols in the training corpus.
3. Merge the **most frequent pair** into a new symbol and add it to the vocabulary.
4. Repeat until the vocabulary reaches a chosen size.

Common words end up as single tokens; rare words are spelled out from smaller learned pieces, so nothing is ever fully out-of-vocabulary.

---

## How does WordPiece differ from BPE?

Both grow a subword vocabulary by merging pieces, but **BPE merges the most frequent pair**, while **WordPiece picks the merge that most increases the likelihood** of the training data under the vocabulary. WordPiece (used by BERT and DistilBERT) marks pieces that continue a word with a `##` prefix, as in `play`, `##ing`.

---

## What do BERT's special tokens [CLS], [SEP], [PAD], [UNK], and [MASK] do?

- **[CLS]:** added at the start of every input; its final hidden state is used as the summary for classification.
- **[SEP]:** marks the end of a sentence or separates two segments.
- **[PAD]:** fills shorter sequences to the batch length (ignored via the attention mask).
- **[UNK]:** stands in for a token not in the vocabulary.
- **[MASK]:** hides a token during masked-language-model pretraining.

---

## How do encoder-only, decoder-only, and encoder-decoder transformers differ, and which fits classification?

- **Encoder-only (BERT, DistilBERT):** every token attends to the whole input in both directions. Best for understanding tasks like **classification** and NER.
- **Decoder-only (GPT family):** each token attends only to earlier tokens. Built for generating text.
- **Encoder-decoder (T5, BART):** an encoder reads the input and a decoder generates output from it. Built for sequence-to-sequence tasks like translation and summarization.

---

## How does masked language modeling differ from causal language modeling as a pretraining objective?

- **Masked LM (BERT):** hide some tokens (BERT masks 15%) and predict them using context on **both sides**. Produces strong bidirectional representations for understanding tasks.
- **Causal LM (GPT):** predict the **next** token using only the tokens to the left. Matches how text is generated, one token at a time.

---

## What is knowledge distillation, and what does it buy DistilBERT?

A small **student** model is trained to reproduce a large **teacher** model's output probability distributions, not just the hard labels, so it learns the teacher's "soft" judgments. DistilBERT (Sanh et al., 2019) halves BERT-base's 12 layers to 6, is about **40% smaller and 60% faster**, and keeps about **97%** of BERT's language-understanding performance.

That trade is why it's a realistic choice for fine-tuning on a CPU.

---

## How do you see exactly how a Hugging Face tokenizer splits a sentence?

```python
from transformers import AutoTokenizer
tok = AutoTokenizer.from_pretrained("distilbert-base-uncased")
enc = tok("The flight was unbelievably late")
tok.convert_ids_to_tokens(enc["input_ids"])
# starts with '[CLS]', ends with '[SEP]'; rare words may split into '##' pieces
```

Inspecting a few of your own tweets this way shows how hashtags, emoji, and slang actually reach the model.

---
