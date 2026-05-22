# D802 Evaluation Metrics

## Why is accuracy alone a misleading evaluation metric?

Accuracy measures overall correctness but hides **per-category failures**. On an imbalanced dataset (e.g. 990 cats, 10 dogs), a model that always predicts "cat" achieves 99% accuracy while completely failing to identify a single dog. Accuracy lies when categories are unequal in size.

---

## What is an imbalanced dataset and why does it matter?

A dataset where some categories have far more examples than others. Models trained on imbalanced data learn to favor majority categories — not because they understand them better, but because predicting the majority class minimizes overall error. Whose fault is this? The engineer's. Balanced training data is the engineer's responsibility.

---

## What does precision measure? (One-liner)

**When I say yes, am I right?**

Of every prediction the model made for a given class, what fraction were actually correct? Measures false alarms — how often the model cried wolf.

---

## What does recall measure? (One-liner)

**When the answer is yes, do I say so?**

Of every actual instance of a given class in the dataset, what fraction did the model correctly identify? Measures missed cases — how often the model let something slip through undetected.

---

## What is the difference between a precision failure and a recall failure?

- **Precision failure** — model raises too many false alarms. Healthy patients diagnosed as sick. Spam emails landing in inbox labeled as important.
- **Recall failure** — model misses real cases. Sick patients sent home undiagnosed. Actual spam getting through the filter.

These are different kinds of harm requiring different fixes.

---

## What would precision and recall look like for a "always predict cat" model on a dog category?

- **Precision:** Undefined — the model never predicts "dog," so there are zero dog predictions to evaluate
- **Recall:** 0% — every actual dog in the dataset was missed entirely

A 99% accurate model with undefined precision and 0% recall for dogs is completely useless for detecting dogs.

---

## What is the F1 score and why use it instead of averaging precision and recall?

F1 is the **harmonic mean** of precision and recall. Unlike a simple average, the harmonic mean punishes extreme imbalances — if either precision or recall is near zero, F1 is dragged close to zero regardless of the other.

A model with 100% precision and 0% recall gets ~0% F1, not 50%. This forces the model to perform reasonably well at **both**, not just one.

---

## Why is accuracy an acceptable primary metric for CIFAR-10?

CIFAR-10 is **balanced** — 6,000 images per category across 10 classes. The condition that makes accuracy misleading (one category dominating) doesn't apply. Additionally, accuracy is the standard benchmark metric for CIFAR-10 in published research, enabling **direct comparison** with baseline models — which is required by the task rubric.

---

## What role does F1 play when accuracy is the primary metric?

F1 serves as a **supporting metric** to catch per-class weaknesses that accuracy might hide. Even on a balanced dataset, a model might perform poorly on specific hard-to-distinguish categories (e.g. cats vs dogs). F1 surfaces those failures that overall accuracy smooths over.

---

## What are the four main evaluation metrics and when does each matter?

- **Accuracy** — overall correctness; reliable on balanced datasets, misleading on imbalanced ones
- **Precision** — trustworthiness of positive predictions; critical when false alarms are costly
- **Recall** — coverage of actual positives; critical when missing cases is costly
- **F1** — harmonic balance of precision and recall; use when both false alarms and missed cases matter

---

## What is the training vs validation loss curve, and what does it reveal?

Two curves tracked over epochs:
- **Training loss** — error on data the model is actively learning from
- **Validation loss** — error on data the model has never seen

**Healthy:** both curves decrease together
**Overfitting signal:** training loss keeps dropping while validation loss stops improving and starts rising

The gap between them is the overfitting detector.

---

## What is an epoch?

One complete pass through the entire training dataset. Loss should follow a **skateboard ramp** shape over many epochs — steep drop early when gradients are large and the model is far from the minimum, gradually flattening as it approaches the valley.

---
