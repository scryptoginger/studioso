# D801 Model Development

## Which SageMaker built-in algorithm matches each unsupervised task: anomaly detection, clustering, dimensionality reduction, and topic modeling?

- **Anomaly detection:** Random Cut Forest (RCF)
- **IP-based anomaly detection:** IP Insights
- **Clustering:** K-Means
- **Dimensionality reduction:** PCA
- **Topic modeling:** LDA or Neural Topic Model (NTM)

None of these needs labeled data.

---

## Which SageMaker built-in algorithms handle text tasks, and what does each do?

- **BlazingText:** optimized Word2vec (word embeddings) and text classification
- **Sequence-to-Sequence:** machine translation and summarization
- **Object2Vec:** learns low-dimensional embeddings of high-dimensional objects, for example to find similar support tickets
- **Text Classification – TensorFlow:** transfer learning from pretrained models

---

## What is SageMaker script mode?

You write a normal training script (PyTorch, TensorFlow, scikit-learn, XGBoost…) and pass it as the `entry_point` of a framework estimator. SageMaker runs it inside an AWS-managed container for that framework, which supplies data channels, hyperparameters and the model output path through environment variables and arguments.

It is the middle ground between built-in algorithms (no code) and bring-your-own-container (full control).

---

## How are epochs, steps and batch size related?

```text
steps_per_epoch = ceil(num_training_examples / batch_size)
total_steps     = steps_per_epoch * num_epochs
```

One **step** is one gradient update on one batch. One **epoch** is one full pass over the training data. A larger batch means fewer, smoother updates per epoch. It often needs a learning-rate adjustment.

---

## How do bagging, boosting and stacking combine models differently?

- **Bagging:** trains many models in parallel on bootstrap samples and averages or votes. It mainly **reduces variance** (example: random forest).
- **Boosting:** trains models sequentially, each one correcting the previous errors. It mainly **reduces bias** (examples: XGBoost, LightGBM, CatBoost).
- **Stacking:** a meta-model learns how to combine the predictions of different base models.

---

## What is catastrophic forgetting, and how do you reduce it when fine-tuning?

When a pretrained model is fine-tuned on a narrow new task, it can **lose general capabilities** it had before. The weights drift too far from the pretrained values.

Mitigations:

- a lower learning rate
- freezing early layers
- mixing some general or original-task data into the fine-tuning set
- parameter-efficient methods (for example LoRA) that leave the base weights untouched

---

## How do the SageMaker automatic model tuning strategies differ: grid, random, Bayesian, and Hyperband?

- **Grid:** tries every combination of **categorical** values only.
- **Random:** samples independently. Each job ignores earlier results, so it parallelizes fully.
- **Bayesian:** treats tuning as a regression problem and uses earlier results to choose the next trial (explore vs. exploit).
- **Hyperband:** multi-fidelity. It reallocates epochs to promising configurations and **stops weak ones early**. Use it only for iterative algorithms that report metrics during training.

---

## What must you configure for managed spot training, and what is the main trap?

- Set `EnableManagedSpotTraining=True`.
- Set `MaxWaitTimeInSeconds` **larger than** `MaxRuntimeInSeconds`. The wait time includes time spent waiting for Spot capacity.
- Use **checkpointing to S3** so an interrupted job resumes instead of restarting.

Trap: managed spot training **never falls back to on-demand**. With no Spot capacity, the job waits until the max wait time and then stops.

---

## How does data-parallel distributed training differ from model-parallel training?

- **Data parallel:** every worker holds a **full copy of the model** and processes a different slice of each batch. Gradients are averaged across workers. Use it when the model fits on one device but you want faster training.
- **Model parallel:** the **model itself is split** across devices. Use it when the model is too large for one device's memory.

---

## How do RMSE and MAE differ as regression metrics?

```text
MAE  = mean(|y - y_hat|)
RMSE = sqrt(mean((y - y_hat)^2))
```

Both are in the target's units. RMSE squares errors first, so it **penalizes large errors more heavily**. Use RMSE when big misses are especially costly. MAE is more robust to outliers.

---

## Why can PR-AUC be more informative than ROC-AUC on a heavily imbalanced dataset?

ROC-AUC uses the false-positive rate, whose denominator is the (huge) number of negatives. Many false positives can therefore barely move it. PR-AUC uses **precision**, which drops sharply when false positives pile up. That makes it more sensitive to how well the model finds the rare positive class.

---

## How does SHAP explain an individual prediction?

SHAP (SHapley Additive exPlanations) assigns each feature a contribution value. The contributions sum to the difference between this prediction and a baseline (average) prediction. Positive values pushed the prediction up and negative values pushed it down. Averaging absolute SHAP values across many rows gives global feature importance.

SageMaker Clarify's explainability reports are based on Kernel SHAP.

---

## How does a SageMaker shadow variant differ from a production variant?

The shadow variant receives a **copy** of live inference requests on the same endpoint, but **only the production variant's responses go back to callers**. Shadow responses can be logged for offline comparison.

Use it to validate a new model, container or instance type against real traffic (latency, errors, outputs) with **no user impact**.

---

## When should you choose prompt engineering, RAG, fine-tuning, or continued pre-training to customize a foundation model?

- **Prompt engineering:** cheapest and fastest. It changes instructions and format, not knowledge.
- **RAG:** injects **current or private knowledge** at query time. The knowledge stays updatable without retraining.
- **Fine-tuning:** labeled examples teach a specific **task, style or format**.
- **Continued pre-training:** large amounts of unlabeled **domain text** adapt the model's general language (for example legal or medical vocabulary).

Escalate in that order. Each step costs more.

---

## How do BLEU and ROUGE differ as text-generation metrics?

Both measure n-gram overlap between generated text and reference text:

- **BLEU:** precision-oriented ("how much of what I generated appears in the reference?"). It is traditionally used for **machine translation**.
- **ROUGE:** recall-oriented ("how much of the reference did I cover?"). It is traditionally used for **summarization**.

Neither captures meaning well. BERTScore and semantic similarity compare embeddings instead.

---
