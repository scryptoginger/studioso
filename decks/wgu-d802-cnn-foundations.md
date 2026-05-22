# D802 CNN Foundations

## Why do neural networks exist instead of explicit rule-based programs?

Some problems are too complex to write rules for. A neural network learns from **exposure to examples** rather than being programmed with hand-crafted rules — the same way you learned to recognize a cat without anyone handing you a rulebook.

---

## What is a neural network minimizing during training?

**Error** — the gap between what the network predicted and what the correct answer actually was. The entire training process is an optimization problem: make a guess, measure the error, adjust, repeat.

---

## What does a loss function do?

Converts "prediction vs reality" into a **single number** representing how wrong the network was. Gradient descent needs one number to minimize — one hillside to navigate. Bigger number = worse prediction.

---

## Why is cross-entropy loss used for classification instead of raw gap measurement?

Cross-entropy punishes **confident wrong answers exponentially more** than uncertain wrong answers. A network saying "99% sure it's a dog" when it's a cat gets hammered far harder than one saying "51% sure." This pushes the network toward appropriate confidence, not just correctness.

---

## What does gradient descent do, and what is the learning rate?

Gradient descent adjusts weights in the direction that reduces loss — like a blindfolded person on a hillside feeling for the downhill direction and stepping that way.

The **learning rate** is the step size:
- Too small → crawls forever, gets stuck
- Too large → overshoots the minimum

---

## How do backpropagation and gradient descent differ?

They work together but do different things:

- **Backpropagation** — traces error backwards through every layer, calculating how much each weight *contributed* to the loss (blame assignment)
- **Gradient descent** — uses those calculations to actually *adjust* the weights (correction)

Backprop calculates. Gradient descent acts.

---

## Why do neural networks need activation functions?

Without them, every layer just does linear math — multiplying and adding. No matter how many layers you stack, the entire network collapses into a single equivalent calculation. Activation functions introduce **non-linearity**, allowing each layer to produce genuinely different transformations rather than just rescaled versions of the same thing.

---

## How does ReLU work, and what is its main risk?

- Below zero → output is exactly **0** (dead zone)
- Above zero → output equals the input

Risk: **dying ReLU**. A neuron stuck in the dead zone outputs zero forever. Gradient descent gets no signal from it, weights never update, neuron stays permanently silent.

---

## How does Leaky ReLU solve the dying neuron problem?

Instead of outputting exactly zero below the threshold, it outputs a **tiny fraction** of the input (e.g. 0.01x). Like a watchdog heartbeat — not enough signal to dominate, but enough that gradient descent can still find and potentially revive the neuron. It never goes completely silent.

---

## How does tanh differ from ReLU as an activation function?

tanh is a smooth S-shaped curve that always outputs between -1 and +1. Unlike ReLU, it has **no dead zone** — gradient descent can always get a signal from it everywhere. Tradeoff: more computationally expensive per neuron than ReLU.

---

## What does softmax do and where is it used?

Softmax is the activation function for the **final output layer** in classification networks. It converts raw numbers into probabilities that sum to 1:

```
softmax(x_i) = exp(x_i) / sum_j(exp(x_j))
```

Output example: cat 85%, dog 10%, bird 5%. The highest probability is the network's prediction.

---

## Why is a CNN better than an MLP for image classification?

Images have **spatial relationships** — pixels only mean something relative to their neighbors. An MLP flattens the image into independent numbers and destroys that context. A CNN preserves spatial relationships through filters that slide across local regions, detecting patterns like edges and shapes in context.

---

## What is a convolutional filter, and what does it detect?

A filter is a small grid of weights (e.g. 3×3 = 9 weights). Its shape determines what pattern it responds to — like a tuning fork that only vibrates at one frequency. A horizontal edge filter produces high values only where horizontal edges appear; low values everywhere else.

The weights are learned through training — the network discovers what features are useful, it isn't told.

---

## What is weight sharing in a CNN, and why does it matter?

The same filter weights are reused at **every position** across the image. This means the network only needs to learn one set of weights to detect a feature anywhere in the image — not one set per pixel position (which would be 3,072 sets for a 32×32 image). Dramatically fewer parameters to learn.

---

## What does a pooling layer do, and why is max pooling used?

Pooling reduces spatial dimensions while keeping the strongest activations. Max pooling takes a small region (e.g. 2×2) and keeps only the **maximum value** — the strongest feature detection signal.

This builds **translation invariance**: the network learns "pointy ear somewhere in the upper region" rather than "pointy ear at exactly pixel 47." The cat is recognizable regardless of where it appears in the frame.

---

## What is the full CNN pipeline from image to prediction?

```
Raw image (32×32×3 = 3,072 numbers)
        ↓
Convolutional layers (filters detect features, output grows deeper)
        ↓
Pooling layers (shrink spatial size, build translation invariance)
        ↓
Flatten (3D block → 1D list of numbers)
        ↓
Dense layers (combine features into a decision)
        ↓
Softmax (convert to probabilities)
        ↓
Prediction ("cat" with 85% confidence)
```

---

## What is overfitting, and how do you detect it?

Overfitting is when a network memorizes training data — including noise and quirks — rather than learning general patterns. It performs great on training data but fails on new data.

**Detection:** training loss keeps decreasing while validation loss stops improving and starts increasing. The gap between them is the signal.

---

## What are the four main techniques to combat overfitting?

- **Data augmentation** — show modified versions of training images (rotated, flipped, zoomed) so the network can't memorize exact pixels
- **Dropout** — randomly switch off neurons during training, forcing the network to find multiple independent paths to correct answers
- **Early stopping** — halt training the moment validation loss starts climbing; save the model at its best point
- **Simpler architecture** — reduce capacity so the network literally can't memorize everything

---

## When should you use CNN vs RNN vs MLP?

- **CNN** — image data; exploits spatial relationships between pixels
- **RNN** — sequential data where order matters (text, speech, time series); has memory of previous inputs
- **MLP** — basic dense network; fine for simple tabular data but loses spatial/sequential structure

Wrong tool for the job means the network fights the data's structure instead of learning from it.

---

## What is an epoch, and what should happen to loss over many epochs?

One **epoch** = one complete pass through the entire training dataset.

Over many epochs in healthy training, loss should follow a **skateboard ramp shape**: steep drop early (large gradients, far from minimum), gradually flattening as the network approaches the valley (smaller gradients, near minimum). It never goes perfectly to zero.

---
