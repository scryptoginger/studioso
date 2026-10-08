# D802: One Batch Through a CNN

## What does a single neuron compute?

Each input is multiplied by its own weight, all the products are added together, and a bias is added. The result then goes through an activation function such as ReLU.

```
output = activation( (x1×w1) + (x2×w2) + ... + (xn×wn) + bias )
```

Many numbers in, one number out.

---

## What does one convolutional filter compute at a single position?

It lays its 3×3 grid of weights over a 3×3 patch through all incoming channels, multiplies each value by the weight in the same spot, adds every product plus the bias, and writes that one score onto its output channel. Then it slides to the next position and repeats.

---

## Work the filter math: patch columns 0.1 / 0.9 / 0.9, weights −1 / 0 / +1 (every row), bias −0.5.

Each row gives (0.1×−1) + (0.9×0) + (0.9×1) = 0.8.

```
3 rows × 0.8 = 2.4
2.4 + (−0.5) = 1.9
ReLU(1.9)    = 1.9   → "edge found"
```

A flat gray patch (all 0.5) gives 0 + (−0.5) = −0.5, so ReLU outputs 0: "nothing here."

---

## How does a filter differ from a channel?

A filter is a detector, a question like "is there a horizontal edge here?" A channel is that filter's answer sheet: a grid holding one score per position. One filter produces exactly one output channel, so a layer's filter count equals its output channel count.

---

## How deep is each filter in CIFAR10Net, and why?

Every filter is 3×3 wide but as deep as the number of channels coming in, because it reads all incoming sheets at once.

```
Conv1: 3×3×3   (RGB in)
Conv2: 3×3×16
Conv3: 3×3×32
```

---

## What's the common mistake about the 3 in nn.Conv2d(3, 16, kernel_size=3, padding=1)?

Thinking it's a filter count. The 3 is the input's RGB color channels, fixed by the data. The 16 is the number of filters, a design choice. Nothing calculates 16 from 3.

---

## Why does the filter count grow 16 → 32 → 64?

Deeper layers detect combinations (edges → corners → parts), and there are more possible combinations than basic pieces, like letters → words. Pooling makes it affordable: each halving leaves 4× fewer positions, so doubling the filters still keeps the work roughly flat.

---

## What does ReLU do?

```
ReLU(x) = max(0, x)
−3 → 0     0.4 → 0.4     2.7 → 2.7
```

A dimmer switch that stays off below zero: negative scores become 0, and positive scores pass through unchanged. It's cheap to compute and keeps the learning signal flowing back through every layer.

---

## What does padding=1 do for a 3×3 convolution?

It adds a one-pixel border so the filter can be centered on edge pixels, too. The output stays the same height and width as the input, so only pooling shrinks the image.

---

## What does MaxPool2d(kernel_size=2, stride=2) keep and what does it lose?

It keeps the strongest score in each 2×2 tile and halves height and width (32 → 16 → 8 → 4). A strong edge survives as the max; only its exact position gets coarser. It's shrinking the photo, not folding it in half.

---

## Why does pooling help instead of just throwing information away?

The same 3×3 filter now covers more of the original photo, like zooming out on a phone map while the screen stays the same size. That's how late layers catch "the ear as a whole instead of one edge of the ear." It also cuts the work 4× per halving.

---

## How does softmax differ from MaxPool?

MaxPool sits inside the conv block, works on each 2×2 tile of each sheet, keeps only the biggest number, and discards the rest. Softmax runs once at the very end (inside CrossEntropyLoss), takes all 10 class scores, and turns them into 10 probabilities that add up to 100%, keeping every class but giving the biggest score the biggest share.

---

## Write the softmax formula and work a 3-class example.

```
softmax(x_i) = exp(x_i) / sum_j(exp(x_j))

scores [2.0, 1.0, 0.1]
exp →  [7.39, 2.72, 1.11]   sum = 11.21
probs  [66%, 24%, 10%]
```

---

## Why is the 4×4×64 output of the conv block not a "4×4 thumbnail"?

Each of the 16 positions covers a 22×22 region of the original photo and holds 64 numbers, one per learned feature detector. Spatial detail ("where") has been traded for feature detail ("what").

---

## What are the 1,024 numbers that come out of Flatten?

4×4 positions × 64 feature sheets = 1,024. Each number answers "how strongly did pattern #k show up in region (row, col)?" Flatten only rearranges them into one row; no values change and it has 0 parameters.

---

## Why must the data be flattened before a dense (Linear) layer?

Each dense neuron is one weight per input, a single list, so it expects one flat list per image, not a grid of sheets. Flattening lays the 64 sheets end to end. Dense layers don't care about neighbors, because every neuron reads every input anyway.

---

## Why is it called a "convolutional" layer?

Convolution is the math operation of sliding a small grid (the filter) across a larger grid (the image), multiplying and summing at every position. The layer is named after that sliding multiply-and-add.

---

## Why is the same layer called "Linear" in PyTorch and "Dense" in Keras?

The names describe the same layer from two angles. "Linear" names the math: outputs = weights × inputs + bias, a straight-line relationship like y = mx + b, which is why ReLU is needed to bend it. "Dense" names the wiring: every neuron connects to every input.

---

## Trace the output shape of one batch through CIFAR10Net.

```
input        [64, 3, 32, 32]
conv1+pool   [64, 16, 16, 16]
conv2+pool   [64, 32, 8, 8]
conv3+pool   [64, 64, 4, 4]
flatten      [64, 1024]
linear       [64, 128]
linear       [64, 10]   ← 10 class scores per image
```

Format: [batch, channels, height, width], then [batch, values] after Flatten.

---

## What does cross-entropy loss measure, and why was the untrained model's loss about 2.3?

It measures how much probability the model gave the correct class: loss = −ln(p_correct). Confident and right gives about 0. An even 1-in-10 guess gives −ln(0.1) = 2.303, exactly what an untrained model should score.

---

## How do backpropagation and the optimizer split the job of learning?

Backpropagation works backward from the loss and figures out, for each of the 156,074 weights, which direction to nudge it ("go this way"). The optimizer (Adam) makes the nudge, sized by the learning rate ("this far"), and weight decay dulls every weight a tiny bit on each step.

---
