# D803 Evaluation and Optimization

## When is accuracy a misleading metric for a sentiment classifier?

When the classes are **imbalanced**. If 85% of tweets are positive, a model that always predicts "positive" scores 85% accuracy and never detects a negative tweet. Accuracy hides per-class failure, so check per-class precision and recall too.

---

## What are the formulas for precision and recall?

```text
precision = TP / (TP + FP)    of everything predicted positive, how much was right
recall    = TP / (TP + FN)    of everything actually positive, how much was found
```

Precision falls with **false alarms**. Recall falls with **misses**. Each is computed per class, treating that class as the "positive" one.

---

## How is the F1 score computed, and why is it a harmonic mean?

```text
F1 = 2 * precision * recall / (precision + recall)
```

The harmonic mean is dragged toward the **smaller** value. Precision 1.0 with recall 0.0 gives F1 = 0, not 0.5, so a model can't score well by excelling at only one of the two.

---

## How do macro and weighted F1 differ for multi-class problems?

- **Macro:** computes F1 per class and takes the **unweighted mean**. Every class counts equally, so a poorly predicted minority class drags it down.
- **Weighted:** averages per-class F1 **weighted by support** (true count per class), so it is dominated by the large classes.

```python
from sklearn.metrics import f1_score, classification_report
f1_score(y_true, y_pred, average="macro")
print(classification_report(y_true, y_pred))
```

With imbalanced classes, macro F1 is the more honest summary.

---

## How do you read a scikit-learn confusion matrix?

**Rows are true labels and columns are predicted labels.** Entry `[i, j]` counts samples of true class i predicted as class j, so the diagonal holds the correct predictions.

```python
from sklearn.metrics import confusion_matrix
tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
```

For binary labels, `.ravel()` returns **tn, fp, fn, tp** in that order. Other tools may flip the axes, so check before reading.

---

## How can class imbalance be handled without resampling the data?

Use **class weights** so errors on the rare class cost more in the loss:

```python
from sklearn.linear_model import LogisticRegression
clf = LogisticRegression(class_weight="balanced", max_iter=1000)
```

`"balanced"` weights each class inversely to its frequency. In PyTorch, pass a `weight` tensor to `nn.CrossEntropyLoss`. Then judge the result with macro F1 or per-class recall, not accuracy.

---

## What is each data split used for: training, validation, and test?

- **Training:** fit the model's weights.
- **Validation:** compare models and tune hyperparameters, preprocessing choices and early-stopping points.
- **Test:** one final, unbiased estimate of performance on unseen data, after every decision is made.

---

## Why is the test set used only once?

Every time you look at test results and change something, you are tuning to the test set. The score becomes **optimistically biased**, because you've selected for what happens to work on those specific examples. Make all decisions on validation data, then evaluate on test once and report that number.

---

## How do you make a stratified train/validation/test split in scikit-learn?

Split twice, stratifying on the label each time so class proportions are preserved:

```python
from sklearn.model_selection import train_test_split

X_tmp, X_test, y_tmp, y_test = train_test_split(
    X, y, test_size=0.15, stratify=y, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(
    X_tmp, y_tmp, test_size=0.15, stratify=y_tmp, random_state=42)
```

---

## How does k-fold cross-validation work, and when is it worth using?

The training data is split into **k folds**. The model trains on k−1 folds and validates on the remaining one, rotating until each fold has been the validation set once. Report the **mean and spread** of the k scores.

It is worth it on **small datasets**, where a single validation split is noisy. Use `StratifiedKFold` for imbalanced classification. It costs k training runs.

---

## How do you cross-validate a text classifier without leaking vectorizer statistics?

Put the vectorizer **inside a Pipeline**, so it is re-fit on each training fold only:

```python
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, StratifiedKFold

pipe = make_pipeline(TfidfVectorizer(ngram_range=(1, 2)), LogisticRegression(max_iter=1000))
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipe, texts, labels, cv=cv, scoring="f1_macro")
```

---

## Why tune one variable at a time during manual experimentation?

If you change the learning rate, batch size and preprocessing together and the score moves, you **can't tell which change caused it**, or whether the changes cancelled each other out. Changing one thing per run against a fixed baseline makes each result attributable. Systematic searches (grid, random, Bayesian) are the scalable alternative.

---

## How should run-to-run variance affect how you compare two models?

Random seeds (weight initialization, data shuffling, dropout) make scores vary between identical runs. Train each configuration with **several seeds** and compare the **mean and standard deviation**. If the gap between two models is smaller than that run-to-run spread, you haven't shown a real difference.

---

## What are the signs that a model is overfitting?

- **Training** loss keeps falling while **validation** loss plateaus and then **rises**
- A large and growing gap between training and validation metrics
- Near-perfect training accuracy with much weaker validation accuracy

Remedies: more data, regularization (dropout, weight decay), a simpler model, or early stopping.

---

## How does early stopping use the validation set?

After each epoch, evaluate on validation. Keep the checkpoint with the **best validation score**, and stop once it hasn't improved for a set number of epochs (the patience).

In Hugging Face `TrainingArguments`, set `eval_strategy` and `save_strategy` to the same interval and `load_best_model_at_end=True`, then add `EarlyStoppingCallback`.

---
