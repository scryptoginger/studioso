# DL: CNNs

## Why is a CNN better than an MLP for image classification?

Images have **spatial relationships**: a pixel only means something relative to its neighbors. An MLP flattens the image into independent numbers and loses that context. A CNN keeps it by sliding filters over local regions.

---

## When should you use a CNN vs. an RNN vs. an MLP?

- **CNN**: image data; exploits spatial relationships between pixels
- **RNN**: sequential data where order matters (text, speech, time series); carries memory of previous inputs
- **MLP**: plain dense layers; fine for simple tabular data but loses spatial and sequential structure

---

## What is a convolutional filter, and what does it detect?

A small grid of weights (e.g. 3×3) whose values determine the one pattern it responds to, like a tuning fork that vibrates at one frequency. A horizontal-edge filter produces high values where horizontal edges appear and low values elsewhere.

---

## Where do a filter's weights come from?

They start as random numbers and are learned during training: backpropagation nudges them, batch after batch, toward whatever patterns help lower the loss. Hand-picked weights like −1 / 0 / +1 are only for illustration.

---

## What does one convolutional filter compute at a single position?

It lays its 3×3 grid of weights over a 3×3 patch through all incoming channels, multiplies each value by the weight in the same spot, and adds every product plus the bias. That one score goes onto its output channel, then the filter slides to the next position and repeats.

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

## What is weight sharing in a CNN, and why does it matter?

The same filter weights are reused at **every position** in the image. The network learns one set of weights to detect a feature anywhere, instead of a separate set for each position, which means far fewer parameters.

---

## How does a filter differ from a channel?

A filter is a detector, a question like "is there a horizontal edge here?" A channel (also called a feature map) is that filter's answer sheet: a grid with one score per position. One filter produces exactly one output channel, so a layer's filter count equals its output channel count.

---

## What are the numbers a Conv1 filter multiplies, and how do they differ from what Conv2 multiplies?

Conv1 multiplies normalized pixel values: each pixel's 0–255 color value divided by 255, one number per color channel (0.1 ≈ dark, 0.9 ≈ bright). From Conv2 onward the inputs aren't pixels anymore; they're the scores the previous layer's filters wrote on their answer sheets.

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

Thinking it's a filter count. The first 3 is the input's RGB color channels, fixed by the data. The 16 is the number of filters, a design choice; nothing calculates 16 from 3.

---

## What does padding=1 do for a 3×3 convolution?

It adds a one-pixel border so the filter can be centered on edge pixels too. The output keeps the input's height and width, so only pooling shrinks the image.

---

## What does MaxPool2d(kernel_size=2, stride=2) keep and what does it lose?

It keeps the strongest score in each 2×2 tile and halves height and width (32 → 16 → 8 → 4). A strong edge survives as the max; only its exact position gets coarser. It's shrinking the photo, not folding it in half.

---

## How does max pooling build translation invariance?

Keeping only the strongest signal in each region throws away the feature's exact position. The network learns "pointy ear somewhere in the upper region" rather than "pointy ear at exactly pixel 47," so small shifts of the object don't change the result.

---

## Why does pooling help instead of just throwing information away?

After pooling, the same 3×3 filter covers more of the original photo, like zooming out on a phone map while the screen stays the same size. That's how late layers catch "the ear as a whole" instead of one edge of the ear. Each halving also cuts the work 4×.

---

## Why does the filter count grow 16 → 32 → 64?

Deeper layers detect combinations (edges → corners → parts), and there are more possible combinations than basic pieces, like letters → words. Pooling makes it affordable: each halving leaves 4× fewer positions, so doubling the filters keeps the work roughly flat.

---

## Why is the 4×4×64 output of the conv block not a "4×4 thumbnail"?

Each of the 16 positions covers a 22×22 region of the original photo and holds 64 numbers, one per learned feature detector. Spatial detail ("where") has been traded for feature detail ("what").

---

## What are the 1,024 numbers that come out of Flatten?

4×4 positions × 64 feature sheets = 1,024. Each number answers "how strongly did pattern #k show up in region (row, col)?" Flatten only rearranges them into one row; no values change and it has 0 parameters.

---

## Why must the data be flattened before a dense (Linear) layer?

Each dense neuron holds one weight per input in a single list, so it expects one flat list per image, not a grid of sheets. Flattening lays the 64 sheets end to end. Dense layers don't care about neighbors, because every neuron reads every input anyway.

---

## What other names refer to a "dense" layer?

Fully connected (FC) layer, Linear (PyTorch's `nn.Linear`), Dense (Keras), and affine layer. All mean every neuron connects to every input. A network built mostly from these layers is a multilayer perceptron (MLP).

---

## How does softmax differ from MaxPool?

MaxPool sits inside the conv block and keeps only the biggest number in each 2×2 tile of each sheet. Softmax runs once at the very end (inside PyTorch's `CrossEntropyLoss`) and turns all 10 class scores into 10 probabilities that sum to 100%, keeping every class.

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
