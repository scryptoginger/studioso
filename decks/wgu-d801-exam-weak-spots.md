# D801 Exam Weak Spots

## A nominal feature "color" (red, green, blue) feeds a linear model. Which encoding fits, and why?

**Choice:** one-hot encoding.

**Why:** a linear model treats an integer column as a magnitude. Label encoding (`red=0, green=1, blue=2`) would tell it blue is "twice" green. One-hot gives each color its own independent weight.

**Trap:** label encoding, which is compact but invents an order that isn't there.

---

## An ordinal feature "size" (S, M, L, XL) feeds a gradient-boosted tree model. Which encoding fits, and why?

**Choice:** label (ordinal) encoding in the true order, `S=0, M=1, L=2, XL=3`.

**Why:** the order is real, and trees split on thresholds (`size <= 1`), so a single column carries the information.

**Trap:** one-hot by reflex. It throws away the ordering and adds columns for no gain.

---

## A team predicts house sale prices. Which evaluation metric fits, and why?

**Choice:** RMSE (or MAE).

**Why:** price is a continuous target, so you measure the size of the error in dollars. RMSE penalizes large misses more. MAE treats all errors linearly.

**Trap:** accuracy or F1. Those are classification metrics and have no meaning for a continuous prediction.

---

## In a fraud dataset, 0.5% of transactions are fraud and a missed fraud is very costly. Which metric should drive model selection?

**Choice:** **recall** on the fraud class, watched together with precision, F1 or PR-AUC.

**Why:** a missed fraud is a false negative, and recall is the metric that measures false negatives.

**Trap:** accuracy. A model that predicts "not fraud" every time scores 99.5% and catches nothing.

---

## A retailer must forecast demand for thousands of related products from their sales histories. Which SageMaker built-in algorithm fits?

**Choice:** **DeepAR**.

**Why:** it is the built-in RNN-based forecaster. It trains **one global model across many related time series**, so products with short histories borrow patterns from similar ones.

**Trap:** Random Cut Forest, which is for anomaly detection, not forecasting.

---

## A tabular dataset has many high-cardinality categorical columns, and the team wants minimal manual encoding. Which SageMaker built-in algorithm fits?

**Choice:** **CatBoost**.

**Why:** it is gradient-boosted trees with built-in handling of categorical features (plus ordered boosting), so you don't one-hot dozens of columns by hand.

**Trap:** Linear Learner, which needs numeric inputs and would require heavy one-hot encoding of every category.

---

## IoT sensors stream readings with no labels, and the team must flag abnormal readings. Which SageMaker built-in algorithm fits?

**Choice:** **Random Cut Forest (RCF)**.

**Why:** it is an unsupervised algorithm that scores how anomalous each data point is, so no labels are required.

**Trap:** XGBoost. It is a supervised algorithm and needs labeled examples of anomalies.

---

## A chatbot needs predictions in milliseconds under steady, continuous traffic. Which SageMaker inference option fits?

**Choice:** **real-time endpoint**.

**Why:** persistent instances are always warm, so there are no cold starts. Steady traffic keeps them well used, and auto scaling handles growth.

**Trap:** serverless. It is cheaper only when there are idle gaps, and cold starts hurt latency.

---

## An internal tool gets a handful of unpredictable requests per day, cost must be minimal, and a slow first response is acceptable. Which inference option fits?

**Choice:** **serverless inference**.

**Why:** it scales to zero when idle, you pay per use, and the scenario explicitly tolerates cold starts.

**Trap:** a real-time endpoint, whose instances bill around the clock even when idle.

---

## Requests carry large payloads (such as high-resolution images or documents), each takes minutes to process, and results are needed soon but not instantly. Which inference option fits?

**Choice:** **asynchronous inference**.

**Why:** requests are queued, payloads are passed through S3, and processing can run long. Results land in S3 with optional SNS notification, and the endpoint can scale to zero between bursts.

**Trap:** real-time or serverless. Both are built for short synchronous calls with tighter payload and timeout limits.

---

## Every night, a team must score an entire dataset in S3 and no one queries the model during the day. Which inference option fits?

**Choice:** **batch transform**.

**Why:** it spins up instances, scores the whole dataset, writes results to S3 and shuts down. There is no persistent endpoint to pay for.

**Trap:** a real-time endpoint left running all day just to serve one nightly job.

---

## A training job in private subnets with no internet access fails to read its data from S3. What is the most direct fix?

**Choice:** add an **S3 gateway VPC endpoint** to the subnets' route tables.

**Why:** it gives private S3 access over the AWS network, with no internet path. An endpoint or bucket policy can restrict it further.

**Trap:** a NAT gateway or public subnets. They work, but they open an internet path, cost more, and violate the "no internet" requirement.

---

## A multi-instance training job inside a VPC hangs because its nodes can't communicate. What fixes it?

**Choice:** add a **security group rule allowing inbound traffic from the same security group**. For EFA instances, allow all inbound and outbound traffic within the group.

**Why:** distributed training needs the containers of one job to talk to each other.

**Trap:** opening the group to `0.0.0.0/0`. It "works" but throws away the isolation the VPC was there for.

---

## Compliance requires that a training container can make no outbound network calls at all, even within the VPC. Which setting fits?

**Choice:** **`EnableNetworkIsolation=True`**.

**Why:** the container gets no network access and no AWS credentials. SageMaker still moves the S3 input and output for it using the execution role.

**Trap:** a VPC without internet access alone. The container could still reach other resources inside the VPC.

---

## An application inside a VPC must call a SageMaker endpoint without traffic crossing the public internet. What do you configure?

**Choice:** an **interface VPC endpoint (AWS PrivateLink) for SageMaker Runtime**.

**Why:** invocations resolve to private IPs in your subnets and stay on the AWS network.

**Trap:** adding `VpcConfig` to the model. That controls the container's *outbound* access to your VPC, not how clients reach the endpoint.

---
