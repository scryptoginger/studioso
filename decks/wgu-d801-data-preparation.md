# D801 Data Preparation

## Why are columnar formats like Parquet and ORC usually preferred over CSV or JSON for ML training data on S3?

Columnar formats store each column together, so a job that needs only some columns reads only those columns. They also compress well and carry a schema. CSV and JSON are row-oriented text: every read scans whole rows and re-parses types.

**Rule of thumb:** row formats suit simple interchange and streaming records. Columnar formats suit large analytical reads and training.

---

## How do Amazon Kinesis Data Streams and Amazon Data Firehose differ for ingesting streaming data?

- **Kinesis Data Streams:** a durable stream that your own consumers read and process (Lambda, Flink, custom apps). Use it when you need custom real-time processing.
- **Amazon Data Firehose:** fully managed *delivery*. It buffers incoming records and loads them into destinations such as S3, Redshift or OpenSearch, with optional transformation. There are no consumers to write.

Exam cue: "load streaming data into S3 with no code" → Firehose.

---

## Which AWS tool fits each data-transformation need: Glue, Glue DataBrew, EMR, or SageMaker Data Wrangler?

- **AWS Glue:** serverless Spark ETL jobs, plus the Data Catalog
- **AWS Glue DataBrew:** visual, no-code data cleaning and profiling for analysts
- **Amazon EMR:** managed Spark/Hadoop clusters when you need full control of the cluster and frameworks
- **SageMaker Data Wrangler:** ML-focused data prep and feature engineering inside SageMaker Studio, which can export into a pipeline

---

## How do the SageMaker Feature Store online store and offline store differ?

- **Online store:** low-latency, real-time lookup of the latest feature values at **inference** time.
- **Offline store:** historical feature data in S3 for **training** and batch inference.

When both are enabled, they stay in sync. This avoids training/serving skew, where the model trains on features computed differently from the ones it sees in production.

---

## How do standardization and min-max normalization transform a feature?

```text
standardization:  z = (x - mean) / std          → mean 0, std 1
min-max:          x' = (x - min) / (max - min)  → range [0, 1]
```

Standardization suits algorithms that assume centered data (linear models, neural nets). Min-max is sensitive to outliers, because one extreme value squashes everything else.

---

## When does a log transform help a numeric feature?

It helps when the feature is **heavily right-skewed**, such as income, prices, or counts with a long tail. `log(x)` (or `log(1 + x)` when zeros are present) compresses large values. This makes the distribution more symmetric and reduces the pull of extreme values on linear models.

---

## What does binning a numeric feature do, and what does it cost?

Binning (discretization) replaces a continuous value with a bucket, for example age → `18–25`, `26–40`, `41+`. It can capture non-linear effects in linear models and reduce noise. The cost is lost precision: every value inside a bin looks identical to the model.

---

## How do label encoding and one-hot encoding represent a categorical feature?

- **Label (ordinal) encoding:** each category becomes one integer (`red=0, green=1, blue=2`). It is compact but **implies an order**.
- **One-hot encoding:** one binary column per category. There is no implied order, but it adds many columns when cardinality is high.

Use one-hot for nominal categories in linear or distance-based models. Label encoding is fine for truly ordinal data and for tree-based models.

---

## What is the leakage pitfall when imputing missing values or scaling features?

If you compute the mean, median or scaler statistics on the **full dataset** before splitting, information from the test set leaks into training, and evaluation looks better than reality.

Fix: split first. Fit imputers and scalers on the **training split only**, then apply the fitted transform to the validation and test splits.

---

## How does a scikit-learn ColumnTransformer keep preprocessing consistent between training and inference?

It bundles per-column transforms into one fitted object that you apply identically everywhere:

```python
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

pre = ColumnTransformer([
    ("num", StandardScaler(), ["price", "sqft"]),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["city"]),
])
X_train_t = pre.fit_transform(X_train)
X_test_t = pre.transform(X_test)
```

`handle_unknown="ignore"` stops unseen categories from crashing at inference time.

---

## What does AWS Glue Data Quality do?

It measures data quality by evaluating rules written in **DQDL** (Data Quality Definition Language). Examples are completeness, uniqueness and value ranges. It can **recommend rules** for a cataloged table and produces a data quality score. In Glue ETL jobs it can flag the records that failed, so bad data is caught *before* it reaches the data lake. It is serverless and built on the open-source Deequ framework.

---

## What are common remedies for class imbalance, and what is the key pitfall?

Remedies:

- **Oversample** the minority class (random duplication, or synthetic examples with SMOTE)
- **Undersample** the majority class
- **Class weights** that make minority-class errors cost more in the loss

Pitfall: resample **only the training split**. Resampling before the split leaks duplicated or synthetic rows into validation and test, which inflates scores.

---

## What do the SageMaker Clarify pre-training bias metrics Class Imbalance (CI) and Difference in Proportions of Labels (DPL) measure?

- **CI:** whether one facet (group) has far more *training samples* than another. It looks at counts, not outcomes.
- **DPL:** whether one facet has a higher *proportion of positive labels* than another.

Both are computed on raw data before any model exists, so they are model-agnostic.

Note: AWS has closed Clarify to new customers. Existing customers keep access, and the concepts still appear in exam questions.

---

## How can Amazon Comprehend help mask PII in text before it is used for ML?

Comprehend's PII detection works in two modes:

- **Locate:** returns each PII entity's type (NAME, EMAIL, SSN…), a confidence score and character offsets. It is available as real-time analysis of a single document or as an async batch job.
- **Redact:** an **asynchronous batch job** that returns a copy of the text with PII replaced by masking characters.

---

## What chunking strategies can Amazon Bedrock Knowledge Bases apply when preparing documents for RAG?

- **Default:** splits text into chunks of roughly a set token size while honoring sentence boundaries.
- **Fixed-size:** you set the max tokens per chunk and the overlap between chunks.
- **Hierarchical:** small child chunks are matched at retrieval, then swapped for their larger parent chunk to give more context.
- **Semantic:** splits on shifts in meaning, using a foundation model (adds cost).
- **No chunking:** each document is one chunk, so you pre-split the files yourself.

---
