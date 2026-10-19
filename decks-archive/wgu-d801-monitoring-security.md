# D801 Monitoring and Security

## How does data drift differ from concept drift?

- **Data drift:** the distribution of the **inputs** changes (for example a new customer demographic), while the input-to-label relationship may still hold.
- **Concept drift:** the **relationship between inputs and the target** changes (for example fraud patterns evolve), so the same inputs now deserve different predictions.

Data drift can be detected without labels. Concept drift usually needs ground-truth labels to confirm.

---

## What are the four monitoring types of SageMaker Model Monitor?

- **Data quality:** drift in input feature statistics
- **Model quality:** drift in metrics such as accuracy or RMSE. It needs ground-truth labels.
- **Bias drift:** changes in fairness metrics of predictions
- **Feature attribution drift:** changes in which features drive predictions

Note: AWS has closed Model Monitor to new customers. The recommended replacement is CloudWatch plus AWS's open-source monitoring solutions (Evidently AI, MLflow).

---

## How does baseline-based drift detection work on a SageMaker endpoint?

1. Enable **data capture** on the endpoint to log requests and predictions to S3.
2. Run a **baselining job** on the training data. It computes statistics and suggests constraints.
3. A **monitoring schedule** compares the captured traffic against the baseline.
4. Violations are written to reports and emitted as **CloudWatch metrics**, where alarms can alert you or trigger retraining.

---

## How do Amazon CloudWatch, AWS CloudTrail, and AWS Config differ?

- **CloudWatch:** **performance**. Metrics, logs, alarms and dashboards (endpoint latency, errors, utilization).
- **CloudTrail:** **who did what**. An audit log of API calls, for example who called `CreateEndpoint` or deleted a model.
- **AWS Config:** **resource configuration** history and compliance rules, for example "every notebook must have direct internet access disabled".

---

## What is the SageMaker execution role, and how do you apply least privilege to it?

It is the IAM role that SageMaker **assumes** to act for your training jobs, processing jobs and endpoints. Through it, SageMaker reads data from S3, pulls images from ECR and writes logs.

Least privilege means scoping its policy to the specific S3 prefixes, ECR repositories and KMS keys the job needs, rather than attaching broad managed policies like `AmazonSageMakerFullAccess` in production.

---

## How do you encrypt SageMaker training data and artifacts?

- **At rest:** specify **AWS KMS** customer managed keys, such as `VolumeKmsKeyId` for the attached ML storage volume and `KmsKeyId` in the output config for model artifacts in S3. Encrypt the source S3 bucket too.
- **In transit between nodes:** enable **inter-container traffic encryption** for distributed training. It adds some training overhead.

---

## What does adding a VpcConfig to a SageMaker training job or model do?

SageMaker creates **elastic network interfaces in your subnets**, attached with your security groups, so the containers can reach resources **inside your VPC** (databases, internal APIs).

It does **not** give your VPC clients a private path *into* SageMaker. That direction needs an interface VPC endpoint.

---

## How do containers in private subnets with no internet access reach S3 and other services?

- **S3:** create an **S3 VPC endpoint** (gateway type) and add it to the subnet route tables. Optionally restrict it with an endpoint policy or bucket policy.
- **Other AWS services that support PrivateLink:** create **interface VPC endpoints**.
- **AWS services without interface endpoints, or anything outside AWS:** route through a **NAT gateway**.

---

## What does enabling network isolation (EnableNetworkIsolation) on a SageMaker job or model do?

The container **cannot make any outbound network calls**, not even to S3 or to resources in your VPC, and receives no AWS credentials. SageMaker still downloads inputs and uploads outputs **outside the container** using the execution role. Multi-instance training can still talk peer to peer.

Use it when untrusted code must not be able to exfiltrate data.

---

## How can an application inside a VPC invoke a SageMaker endpoint without traffic crossing the public internet?

Create an **interface VPC endpoint (AWS PrivateLink)** for the **SageMaker Runtime** service. With private DNS enabled, the standard runtime hostname resolves to the endpoint's private IPs in your subnets. You can also attach an endpoint policy, for example allowing `sagemaker:InvokeEndpoint` on a single endpoint only.

---

## What AWS tools manage and cap ML spend?

- **AWS Budgets:** set cost or usage thresholds and get alerts (or trigger actions) when they are crossed
- **AWS Cost Explorer:** analyze and forecast spend over time
- **Cost allocation tags:** attribute spend to teams, projects or models

---

## What purchasing and sizing choices lower SageMaker compute cost?

- **Managed Spot** for interruptible training, with checkpointing
- **SageMaker Savings Plans** for steady, committed usage
- **Right-size inference instances.** SageMaker Inference Recommender load-tests instance types for you.
- **Scale idle capacity down,** with serverless or async endpoints, auto scaling, and by deleting unused endpoints

---

## What safeguards does Amazon Bedrock Guardrails provide?

- **Content filters:** hate, insults, sexual, violence, misconduct and prompt attacks, with adjustable strength
- **Denied topics:** topics that are blocked in input or output
- **Word filters:** custom words, phrases and profanity
- **Sensitive information filters:** block or mask PII, plus custom regex
- **Contextual grounding checks:** flag responses not grounded in the source (for RAG hallucinations)
- **Automated Reasoning checks:** validate responses against logical rules

The `ApplyGuardrail` API applies a guardrail without invoking a Bedrock model.

---

## How do you catch vulnerable container images in an ML CI/CD pipeline?

Push images to **Amazon ECR** and enable **Amazon Inspector** scanning, which reports known vulnerabilities (CVEs) in OS packages and language libraries. Add a pipeline stage that **fails the build** on findings above a severity threshold, so vulnerable images never reach a training job or endpoint.

---
