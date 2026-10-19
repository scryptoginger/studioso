# D801 Cert: AWS ML

## A linear model needs a nominal feature "city" with no natural order. Which encoding fits, and why?

**One-hot encoding**: one binary column per city, so no city is numerically "bigger" than another. Trap: **label encoding** (city → 0, 1, 2 …) invents an order and distances the model will treat as real.

---

## When is label (ordinal) encoding the right choice for a categorical feature?

When the categories have a **genuine order**, such as small < medium < large, so the integer codes carry real meaning. For unordered categories, the codes imply a ranking that doesn't exist.

---

## Analysts query a few columns from very wide tables stored in S3. Which file format fits, and why?

A **columnar format such as Parquet or ORC**: a query reads only the columns it needs, and column-wise compression shrinks storage and scan cost. Trap: **CSV or JSON**, which are row-based, so every query reads every column.

---

## A feature like household income is heavily right-skewed. Which transformation helps, and why?

A **log transformation**: it compresses the long tail so a few huge values stop dominating, and the distribution becomes closer to symmetric. Trap: simply dropping the large values as outliers, which throws away real data.

---

## How does standardization differ from min-max normalization?

- **Standardization**: rescales a feature to mean 0 and standard deviation 1
- **Min-max normalization**: rescales a feature into a fixed range, usually 0 to 1

```
standardized = (x − mean) / std
normalized   = (x − min) / (max − min)
```

---

## A fraud dataset has very few positive examples. Which data-level fix fits, and what is the pitfall?

**Resample** (oversample the minority or undersample the majority) or **generate synthetic minority examples**, applied to the training split only. Pitfall: resampling before the train/test split leaks copies of the same examples into the test set and inflates the scores. Trap: training on the data as-is and reporting accuracy.

---

## A model predicts house prices. Which evaluation metric fits, and why?

**RMSE** (root mean square error): it measures the typical size of the prediction error in the target's own units (dollars) and penalizes large misses more heavily. Trap: **accuracy or F1**, which are classification metrics and don't apply to a continuous target.

---

## A disease-screening model must miss as few sick patients as possible. Which metric should drive model selection?

**Recall**: the fraction of actual positives the model catches, so it directly counts missed patients. Trap: **accuracy**, which can look excellent on rare-disease data while missing most positives.

---

## A team wants the best hyperparameters with a limited budget of training jobs. Which SageMaker AI tuning strategy fits, and why?

**Automatic model tuning with Bayesian optimization**: it uses the results of earlier training jobs to choose the next hyperparameter values, balancing exploration and exploitation. Trap: **grid search**, which tries every combination and only supports categorical hyperparameters in SageMaker AI.

---

## A retailer needs demand forecasts for thousands of related products. Which SageMaker AI built-in algorithm fits, and why?

**DeepAR**: a supervised RNN-based forecaster that trains **one model jointly across many related time series**, and AWS documents it outperforming ARIMA and ETS when there are hundreds of related series. It can also forecast new, similar series. Trap: fitting a separate classical model (ARIMA, ETS) to each product.

---

## What is CatBoost's distinguishing strength among SageMaker AI built-in tabular algorithms?

It's a gradient-boosted decision tree algorithm with a **built-in method for processing categorical features**, plus ordered boosting, which fights a target-leakage problem in standard boosting. It's used for tabular classification and regression.

---

## A team wants to test a new model on live production traffic without any user seeing its predictions. Which SageMaker AI option fits?

A **shadow test**: SageMaker AI sends a copy of each request to the shadow variant, but only the production variant's response goes back to the caller. Trap: **A/B testing**, which sends real responses from the new model to part of the users.

---

## An application needs an immediate prediction for each user request. Which SageMaker AI inference option fits?

A **real-time endpoint**: a persistent, fully managed endpoint built for interactive, low-latency inference, with optional auto scaling. Trap: batch transform, which processes a whole dataset offline and returns nothing per request.

---

## Every night a team needs predictions for a large dataset in S3, with no endpoint needed the rest of the day. Which option fits?

**Batch transform**: it starts compute, runs inference over the whole dataset, and shuts down, with no persistent endpoint. Trap: a **real-time endpoint**, which bills while it sits idle all day.

---

## Requests carry large payloads and take a long time to process, but callers can wait a bit for results. Which inference option fits?

**Asynchronous inference**: requests are queued, the payload comes from S3, results are written to S3 (with optional SNS notification), and the endpoint can scale to zero when idle. Trap: a **real-time endpoint**, which is built for quick request/response, not long-running jobs.

---

## Traffic is infrequent and unpredictable with long idle gaps, and occasional cold starts are acceptable. Which inference option fits?

**Serverless inference**: no instance types to choose, compute scales with traffic and down to zero when idle, and you pay per use. Trap: a **provisioned real-time endpoint**, which bills for instances even when no requests arrive.

---

## A SageMaker AI endpoint in private subnets with no internet access must read model artifacts from S3. What is needed?

Set the model's **VPC config** (subnets and security groups), and create an **S3 VPC endpoint** so the containers can reach S3 without the internet. Trap: adding an internet gateway or NAT, which breaks the "no internet" requirement; AWS documents NAT only for services without VPC endpoint support.

---

## A team wants new model versions to reach production gradually and roll back automatically if errors spike. Which SageMaker AI feature fits?

**Deployment guardrails**: blue/green deployment with **canary** or **linear** traffic shifting, watched by CloudWatch alarms during a baking period, with auto-rollback if an alarm trips. Trap: updating all traffic at once with no alarms, which leaves only manual recovery.

---

## How does SageMaker Model Monitor detect data drift in production?

You create a **baseline** of statistics and constraints from the training dataset, then a **monitoring schedule** compares captured live data against it. Values outside the constraints are reported as violations, with metrics and notifications in CloudWatch.

---

## A team wants to compare two production models on live traffic, with real users receiving each model's predictions. How is this set up in SageMaker AI?

Put both models behind one endpoint as **production variants**, and give each variant a **weight** that sets its share of traffic. Callers can also invoke a specific variant directly.

---

## A long training job is interruptible and must cost as little as possible. Which purchasing option fits, and what must the job do?

**Managed Spot Training**, with **checkpointing** to S3 so the job resumes from the last checkpoint after a Spot interruption instead of starting over. Trap: **Reserved Instances**, which are a long-term commitment and don't suit one-off jobs. Managed spot training doesn't fall back to On-Demand; it waits for Spot capacity.

---

## A SageMaker AI execution role was given AmazonSageMakerFullAccess and s3:* on every bucket. What's the least-privilege fix?

Scope the role to the **specific actions and bucket prefixes** the job actually uses, such as read on the training-data prefix and write on the output prefix. Trap: keeping broad managed policies "for convenience"; least privilege means granting only what the workload needs.

---

## An auditor asks who deleted a SageMaker AI endpoint last week. Which service answers that?

**AWS CloudTrail**: it records actions taken by users, roles, and AWS services through the console, CLI, SDKs, and APIs as events. Trap: **CloudWatch**, which holds metrics and logs about performance, not a record of who made each API call.

---

## A team must be alerted before monthly ML spend passes a set amount. Which tool fits?

**AWS Budgets**: set a cost budget and get alerts on actual or **forecasted** spend crossing a threshold, optionally with an automatic action. Trap: **Cost Explorer**, which is for visualizing and analyzing spending, not for budget-threshold alerts.

---
