# ML Fundamentals

## Supervised learning

A learning paradigm where the model is trained on input–output pairs.
The goal is to learn a function `f(x) → y` that generalizes to unseen
inputs. Classification (discrete `y`) and regression (continuous `y`)
are the two canonical tasks.

---

## Bias–variance tradeoff

The tension between a model that is too simple (high bias, underfits)
and one that is too flexible (high variance, overfits). Generalization
error decomposes into bias² + variance + irreducible noise.

---

## Cross-entropy loss

The standard loss for classification. For a true label `y` and a
predicted distribution `p`:

```python
loss = -sum(y_i * log(p_i) for i in range(num_classes))
```

Penalizes confident wrong predictions far more than uncertain ones.

---

## Overfitting

When a model memorizes training data and fails to generalize. Symptoms:
training loss keeps falling while validation loss rises. Mitigations:
more data, regularization, dropout, early stopping, simpler models.

---

## Train / val / test split

Three disjoint datasets:

- **train** — fit the model parameters
- **validation** — tune hyperparameters and pick checkpoints
- **test** — final, single-use estimate of generalization

Touching the test set during development invalidates it as an estimate.

---

## Regularization

Any technique that biases a model toward simpler solutions to reduce
overfitting. Examples: L1/L2 weight penalties, dropout, data
augmentation, early stopping.
