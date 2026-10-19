# DL: Metrics

## Why is accuracy alone a misleading evaluation metric?

Accuracy measures overall correctness but hides **per-class failures**. On an imbalanced dataset (e.g. 990 cats, 10 dogs), a model that always predicts "cat" scores 99% accuracy while never identifying a single dog.

---

## What is an imbalanced dataset, and how does it bias a model?

A dataset where some classes have far more examples than others. A model trained on it learns to favor the majority classes, not because it understands them better, but because predicting the majority minimizes overall error.

---

## What does precision measure?

**"When I say yes, am I right?"** Of all the predictions the model made for a class, the fraction that were correct. It measures false alarms.

---

## What does recall measure?

**"When the answer is yes, do I say so?"** Of all the actual instances of a class, the fraction the model found. It measures missed cases.

---

## How does a precision failure differ from a recall failure?

- **Precision failure**: too many false alarms, e.g. healthy patients diagnosed as sick, or legitimate email sent to the spam folder
- **Recall failure**: real cases missed, e.g. sick patients sent home, or spam getting through the filter

They are different kinds of harm and need different fixes.

---

## An "always predict cat" model is scored on the dog class. What is its dog recall?

**0%.** Every actual dog in the dataset was missed.

---

## An "always predict cat" model is scored on the dog class. What is its dog precision?

**Undefined.** The model never predicts "dog," so there are zero dog predictions to check (0 ÷ 0).

---

## What is the F1 score, and why use a harmonic mean instead of a simple average?

F1 is the harmonic mean of precision and recall. If either one is near zero, F1 is dragged near zero too, so a model must do reasonably well at **both**.

```
F1 = 2 × precision × recall / (precision + recall)
precision 100%, recall 0%  →  F1 = 0%, not 50%
```

---

## Why is accuracy an acceptable primary metric for CIFAR-10?

CIFAR-10 is **balanced**: 6,000 images in each of its 10 classes, so the condition that makes accuracy misleading doesn't apply. Accuracy is also the standard benchmark metric for CIFAR-10, which allows direct comparison with published baselines.

---

## What role does F1 play when accuracy is the primary metric?

F1 is a **supporting metric** that catches per-class weaknesses accuracy smooths over. Even on a balanced dataset, a model can struggle with specific hard-to-separate classes (e.g. cats vs. dogs), and per-class F1 surfaces that.

---
