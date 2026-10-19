# 3. DL Training Loop

## Why do neural networks learn from examples instead of following explicit rules?

Some problems are too complex to write rules for. A neural network learns from **exposure to examples** rather than hand-crafted rules, the same way you learned to recognize a cat without anyone handing you a rulebook.

---

## What makes deep learning "deep," and what do its successive layers learn?

Deep learning uses neural networks with **many layers**. Each layer learns increasingly complex representations, from raw pixels to edges to shapes to features to a classification.

---

## What does a single neuron compute?

Each input is multiplied by its own weight, the products are summed, and a bias is added. The result then goes through an activation function such as ReLU.

```
output = activation( (x1×w1) + (x2×w2) + ... + (xn×wn) + bias )
```

---

## What is the forward pass?

Data flows from the input, through each layer, to the output prediction. At every layer it's just matrix math followed by an activation function.

---

## Why do neural networks need activation functions?

Without them, every layer only multiplies and adds, so any stack of layers collapses into one equivalent linear calculation. Activation functions add **non-linearity**, letting each layer produce a genuinely different transformation.

---

## What does ReLU do?

```
ReLU(x) = max(0, x)
−3 → 0     0.4 → 0.4     2.7 → 2.7
```

A dimmer switch that stays off below zero: negative scores become 0 and positive scores pass through unchanged. It's cheap to compute, and its gradient for positive inputs is 1, so the learning signal doesn't shrink as it flows back.

---

## What is the "dying ReLU" problem?

A neuron whose input stays below zero outputs exactly 0, so its gradient is 0 too. Gradient descent gets no signal from it, its weights never update, and it stays permanently silent without any visible error.

---

## How does Leaky ReLU prevent dying neurons?

Below zero it outputs a **tiny fraction** of the input (e.g. 0.01x) instead of exactly 0. That small slope keeps a gradient flowing, so gradient descent can still update and revive the neuron.

---

## How does tanh differ from ReLU as an activation function?

tanh is a smooth S-shaped curve with outputs between −1 and +1, and it has no flat zero region like ReLU's. Its gradient does get very small when inputs are large in either direction (saturation), and it costs more to compute than ReLU.

---

## What does softmax do, and where is it used?

Softmax turns the **final layer's** raw class scores into probabilities that sum to 1, e.g. cat 85%, dog 10%, bird 5%. The class with the highest probability is the prediction.

---

## Write the softmax formula and work a 3-class example.

```
softmax(x_i) = exp(x_i) / sum_j(exp(x_j))

scores [2.0, 1.0, 0.1]
exp →  [7.39, 2.72, 1.11]   sum = 11.21
probs  [66%, 24%, 10%]
```

---

## What does a loss function do?

It converts "prediction vs. reality" into a **single number** for how wrong the network was; bigger means worse. Training is the job of making that one number smaller.

---

## What does cross-entropy loss measure?

How much probability the model gave the **correct** class.

```
loss = −ln(p_correct)
```

Confident and right (p near 1) gives a loss near 0.

---

## Why does cross-entropy punish confident wrong answers so heavily?

Because −ln(p) grows without limit as the probability on the correct class approaches 0. A network that is 99% sure of the wrong class is hit far harder than one that is 51% sure, which pushes it toward appropriate confidence, not just correctness.

---

## Why does an untrained 10-class model start with a cross-entropy loss of about 2.3?

An untrained model spreads its guesses roughly evenly, giving each class about 1 in 10. That makes the loss −ln(0.1) ≈ 2.303, so a starting loss near 2.3 is a healthy sign.

---

## How do backpropagation and the optimizer split the job of learning?

**Backpropagation** works backward from the loss and calculates how much each weight contributed to it, which gives the direction to nudge each weight ("go this way"). The **optimizer** (gradient descent, or a variant such as Adam) makes the nudge, sized by the learning rate ("this far"). Backprop calculates; the optimizer acts.

---

## What role does the chain rule play in backpropagation?

It's the math that assigns each weight its share of the blame. Backpropagation multiplies derivatives backward, layer by layer, from the loss to every weight.

---

## What is the learning rate, and what goes wrong if it's too small or too large?

The learning rate is the **step size** of each weight update, like how far a blindfolded hiker steps downhill each time.

- Too small → training crawls and can stall
- Too large → updates overshoot the minimum

---

## What does weight decay do on each optimizer step?

It shrinks every weight a tiny bit toward zero on each step. That discourages large weights and acts as a form of regularization.

---

## What is an epoch?

One complete pass through the entire training dataset.

---

## What shape should the training loss curve take over many epochs?

A **skateboard ramp**: a steep drop early, while gradients are large and the model is far from the minimum, then a gradual flattening as it approaches the valley.

---

## What is overfitting?

The network memorizes the training data, including its noise and quirks, instead of learning general patterns. It performs well on training data but poorly on new data.

---

## How do training and validation loss curves reveal overfitting?

- **Training loss**: error on the data the model learns from
- **Validation loss**: error on data the model never trains on

Healthy training shows both falling together. Overfitting shows training loss still dropping while validation loss stops improving and starts to rise; the widening gap is the signal.

---

## How does data augmentation fight overfitting?

It trains on modified copies of the training images (rotated, flipped, zoomed, brightened). The network can't memorize exact pixels, so it has to learn the actual patterns.

---

## How does dropout fight overfitting?

It randomly switches off neurons during training. The network has to find several independent paths to the right answer, so no single neuron becomes a crutch.

---

## What is early stopping?

Halting training once validation loss stops improving and starts to climb, and keeping the model from its best validation point. It prevents the network from continuing into overfitting.

---

## How does a simpler architecture fight overfitting?

Fewer layers or neurons means less capacity, so the network has less room to memorize the training set and is pushed toward general patterns.

---
