# D801 Deployment and Orchestration

## What distinguishes the four SageMaker inference options?

- **Real-time:** a persistent endpoint on instances you choose, for interactive, low-latency requests.
- **Serverless:** no instances to manage. It scales with traffic, **down to zero** when idle, and suits spiky or infrequent traffic that **tolerates cold starts**.
- **Asynchronous:** queues requests, for **large payloads and long processing times** with near-real-time needs. It can scale to zero.
- **Batch transform:** **no persistent endpoint**. It runs a job over a whole dataset in S3, then shuts down.

---

## How does a request flow through a SageMaker asynchronous inference endpoint?

1. The client uploads the payload to **S3**.
2. The client calls `InvokeEndpointAsync` with a pointer to that S3 object.
3. SageMaker queues the request and immediately returns an identifier and an **output S3 location**.
4. After processing, the result is written to that S3 location. **Amazon SNS** can optionally notify you of success or error.

An endpoint config with `AsyncInferenceConfig` accepts only asynchronous invocations.

---

## Which features does SageMaker Serverless Inference not support?

Serverless endpoints do **not** support GPUs, VPC configuration, network isolation, multi-model endpoints, data capture, multiple production variants, Model Monitor, inference pipelines, Marketplace model packages, or private Docker registries.

Exam trap: a scenario that needs GPU inference or a private VPC connection rules out serverless.

---

## Why can a batch transform job leave most of its instances idle?

Batch transform assigns input **S3 objects (files)** to instances. With **one large input file** and several instances, only one instance processes it while the rest sit idle.

Fix: split the input into multiple files. Set `SplitType="Line"` to break files into mini-batches, and `AssembleWith="Line"` to join the output records with newlines.

---

## How do a multi-model endpoint, a multi-container endpoint, and a serial inference pipeline differ?

- **Multi-model endpoint:** **many models share one container type**. Models load from S3 on demand. It is a cost saver for many similar, infrequently used models.
- **Multi-container endpoint:** **different containers** (for example different frameworks) on one endpoint, each invoked directly.
- **Serial inference pipeline:** containers run **in sequence** on each request, for example preprocess → predict → postprocess.

---

## What are the SageMaker blue/green traffic-shifting modes, and what protects each one?

- **All at once:** shifts 100% of traffic in one step. It is fastest and cheapest, but a bad update hits every request.
- **Canary:** shifts a small slice first, then the rest. This limits the blast radius.
- **Linear:** shifts equal portions over several steps. It is the lowest risk and takes the longest.

A **baking period** watches the new (green) fleet. If a specified **CloudWatch alarm** trips, traffic **auto-rolls back** to blue.

---

## Which metric does SageMaker endpoint target-tracking auto scaling most commonly use?

`SageMakerVariantInvocationsPerInstance`, the average number of invocations per instance. Application Auto Scaling adds or removes instances to hold it near your target value.

You can also scale on custom CloudWatch metrics such as CPU or GPU utilization. Load-test first to find the per-instance throughput your target should be based on.

---

## When should you add provisioned concurrency to a serverless endpoint?

When traffic has **predictable bursts** and the cold-start latency of on-demand serverless is unacceptable. Provisioned concurrency keeps the configured amount of capacity warm, and you pay for it while it is provisioned. It can be scaled on a schedule or on a target metric with Application Auto Scaling.

---

## What does SageMaker Pipelines provide for ML workflows?

A managed way to define an ML workflow as a **DAG of steps**, such as processing, training, evaluation, a **condition** step (for example "only register if accuracy beats a threshold"), and model registration. Each run is tracked with lineage, which makes training reproducible and auditable. A pipeline can be triggered on a schedule, by events, or from CI/CD.

---

## How does the SageMaker Model Registry approval status drive CI/CD deployment?

A registered model version starts as `PendingManualApproval`. With the SageMaker project templates:

- → `Approved` **triggers CI/CD deployment** of that version
- → `Rejected` from pending: no action
- `Approved` → `Rejected` redeploys the **latest still-approved** version

The status can be set manually or by a pipeline condition step.

---

## What role does each AWS developer tool play in an ML CI/CD pipeline?

- **AWS CodePipeline:** orchestrates the stages (source → build → test → deploy)
- **AWS CodeBuild:** runs builds and tests, such as unit tests and building container images
- **AWS CodeDeploy:** automates deployments with rollback
- **AWS CodeConnections:** connects the pipeline to external Git providers such as GitHub

---

## How can model retraining be triggered automatically?

- **On a schedule:** an Amazon EventBridge rule starts the training pipeline periodically.
- **On a signal:** a CloudWatch alarm on a drift or quality metric, or new data landing in S3, emits an event that starts the pipeline.

The pipeline retrains, evaluates, and registers the new version, which still passes the approval gate before deployment.

---

## What are the options for deploying a model that was trained outside AWS?

- **SageMaker AI:** package the model artifacts (usually `model.tar.gz` in S3) and serve them with a prebuilt framework container or your own inference container.
- **Amazon Bedrock Custom Model Import:** import a customized open-weight model of a **supported architecture** and invoke it through Bedrock's managed APIs, without managing the infrastructure.

---

## Where should you check current SageMaker quotas and limits, such as payload sizes, timeouts, or concurrency?

Check the **Service Quotas** console for your account and Region, and the **"Amazon SageMaker AI endpoints and quotas"** page in the AWS General Reference. Limits differ by Region and change over time, and many can be raised through a quota increase request. Do not rely on memorized numbers.

---
