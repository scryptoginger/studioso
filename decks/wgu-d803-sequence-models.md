# D803 Sequence Models

## Why does a bag-of-words representation lose meaning that depends on word order?

Bag-of-words keeps only **which words appear and how often**, not where. "The food was good, not bad" and "The food was bad, not good" have identical bags but opposite sentiment. N-grams recover some local order. Sequence models read the tokens in order instead.

---

## How does a recurrent neural network (RNN) process a sentence?

It reads one token at a time and updates a **hidden state** that summarizes everything seen so far, reusing the same weights at every step:

```text
h_t = tanh(W_x · x_t + W_h · h_(t-1) + b)
```

For classification, the final hidden state (or a pooling of all states) feeds an output layer.

---

## Why do vanilla RNNs struggle with long sequences?

**Vanishing gradients.** Backpropagation through time multiplies the gradient by a factor for every step it travels back. When those factors are mostly below 1, the signal from early tokens shrinks toward zero, so the network can't learn that a word 30 tokens back mattered.

---

## How do you guard against exploding gradients when training an RNN in PyTorch?

Clip the gradient norm after `backward()` and before the optimizer step:

```python
loss.backward()
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
optimizer.step()
optimizer.zero_grad()
```

Clipping rescales oversized gradients so one bad batch can't blow up the weights. It does **not** fix vanishing gradients.

---

## What do the three gates of an LSTM control?

An LSTM adds a **cell state**, a memory lane updated mostly by addition, which lets gradients flow over long spans:

- **Forget gate:** what to erase from the cell state
- **Input gate:** what new information to write into it
- **Output gate:** how much of the cell state to expose as the hidden state

Each gate is a sigmoid (0–1) that scales the information passing through.

---

## How does a GRU differ from an LSTM?

A GRU merges the gating into **two gates (update and reset)** and has **no separate cell state**. It has fewer parameters and trains faster, and it often performs comparably. An LSTM's extra gate and cell state can help on tasks with very long dependencies.

---

## What does a bidirectional RNN add?

It runs one RNN **left-to-right** and another **right-to-left**, then combines their hidden states. Each position sees both past and future context. In "not bad at all", the representation of "bad" then knows about the "not" before it and the "at all" after it.

It needs the whole sequence up front, so it suits classification, not live generation.

---

## What problem does attention solve in sequence models?

Instead of squeezing a whole sentence into one final hidden state, attention lets the model **look back at every token** and take a **weighted average**. The weights are learned per query and show how relevant each token is. Long-range information no longer has to survive many recurrent steps.

---

## What is the scaled dot-product attention formula?

```text
Attention(Q, K, V) = softmax( Q · K^T / sqrt(d_k) ) · V
```

Queries are compared with keys by dot product. Softmax turns the scores into weights, and the weights mix the values. Dividing by `sqrt(d_k)` keeps the scores from growing with dimension and saturating the softmax.

---

## Why can a transformer train faster than an RNN on the same sequences?

An RNN must compute step t before step t+1, so it is sequential. A transformer's **self-attention processes all positions at once** with matrix operations, which parallelizes well on GPUs. It also gives every token a **direct path** to every other token, rather than a chain of recurrent steps.

---

## Why does a transformer need positional encodings?

Self-attention by itself is **order-blind**: shuffle the tokens and each one gets the same attention output, just shuffled. Positional encodings (fixed sinusoids or learned vectors) are added to the token embeddings so the model can tell "dog bites man" from "man bites dog".

---

## How do pretraining and fine-tuning divide the work for a transformer classifier?

- **Pretraining:** the model learns general language from huge unlabeled corpora with a self-supervised objective, for example predicting masked words.
- **Fine-tuning:** a small, **newly initialized classification head** is added on top, and the whole model is trained briefly on your labeled data at a low learning rate.

Most of the knowledge comes from pretraining, which is why modest labeled datasets can still work well.

---

## Why must you use the tokenizer that matches a pretrained transformer?

The model's embedding table is indexed by **that tokenizer's vocabulary IDs**. A different tokenizer splits text differently and maps tokens to different IDs, so the model receives the wrong embeddings and the input is effectively scrambled.

Load both from the **same checkpoint name** with `AutoTokenizer` and `AutoModel…`.

---

## What does the attention_mask returned by a Hugging Face tokenizer do?

When a batch is padded to equal length, the mask marks **real tokens with 1 and padding with 0**, so attention ignores the pad positions. The tokenizer creates it alongside `input_ids` when you pass `padding=True`. `truncation=True` cuts inputs longer than the model's maximum length.

---

## How do you load a pretrained transformer for sentiment classification and get a prediction?

```python
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

name = "distilbert/distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(name)
model = AutoModelForSequenceClassification.from_pretrained(name, num_labels=2)

inputs = tokenizer(["what a great day"], padding=True, truncation=True, return_tensors="pt")
with torch.no_grad():
    logits = model(**inputs).logits
pred = logits.argmax(dim=-1)
```

The classification head is newly initialized, so predictions are meaningless until you fine-tune.

---
