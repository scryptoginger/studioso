# D802 Deep Learning — Study Reference
*Built from first principles. These definitions are yours — don't memorize them, understand them.*

---

## The Big Picture

**Neural Network**
A system that learns from examples rather than explicit rules. Inspired by biological neurons. Adjusts internal weights through exposure to data until it can make accurate predictions.

**Deep Learning**
A subset of ML using neural networks with many layers. Each layer learns increasingly complex representations — from raw pixels to edges to shapes to features to classifications.

---

## How a Network Learns

**Forward Pass**
Data flows input → through layers → to output prediction. Just matrix math and activation functions at each step.

**Loss Function**
Converts "prediction vs reality" into a single number representing how wrong the network was. Bigger number = worse prediction. Gradient descent minimizes this number.

**Cross-Entropy Loss**
The standard loss function for classification problems. Punishes confident wrong answers much more harshly than uncertain wrong answers. Used with softmax output.

**Backpropagation**
Traces error backwards through every layer after the forward pass. Calculates how much each individual weight contributed to the loss. Uses the chain rule — proportional blame assigned to every weight.

**Gradient Descent**
Uses backpropagation's calculations to actually adjust weights in the direction that reduces loss. Like a blindfolded person on a hillside feeling for the downhill direction.

**Learning Rate**
The step size in gradient descent. Too small = crawls forever, gets stuck. Too large = overshoots the minimum.

**Chain Rule**
The mathematical tool backpropagation uses to assign proportional blame across millions of weights. Multiplies derivatives backwards layer by layer.

**Epoch**
One complete pass through the entire training dataset. Loss should decrease over many epochs if training is healthy.

---

## Activation Functions
*The non-linearity introducers. Without them, a deep network collapses into a single layer.*

**Why They Exist**
Pure matrix math is linear — just "add more salt." Real-world problems are non-linear. Activation functions allow each layer to produce genuinely different transformations rather than just rescaled versions of the same thing.

**ReLU** (Rectified Linear Unit)
- Below zero → output is exactly 0 (dead zone)
- Above zero → output equals input
- Fast and simple. Risk: neurons can die permanently if stuck in dead zone.

**Dying ReLU**
A neuron permanently stuck outputting zero. Gradient descent gets no signal from it, so weights never update, so it stays dead. Silent — you'd never know it's broken.

**Leaky ReLU**
ReLU with a heartbeat. Below zero outputs a tiny fraction (e.g. 0.01x) instead of exact zero. Keeps gradient descent aware the neuron exists. Prevents permanent death.

**tanh**
Smooth S-shaped curve. Always outputs between -1 and +1. Gradient exists everywhere — no dead zones. More computationally expensive than ReLU.

**Softmax**
Used in the final output layer for classification. Converts raw numbers into probabilities that sum to 1. Gives you "85% cat, 10% dog, 5% bird."

---

## CNN Architecture
*Convolutional Neural Networks — the right tool for image data.*

**Why CNN over MLP for images**
Images have spatial relationships — pixels only mean something relative to their neighbors. MLPs flatten images and lose that context. CNNs preserve it.

**Filter / Kernel**
A small grid of weights (e.g. 3x3) that slides across the image. Each filter is tuned to detect one specific pattern — horizontal edge, curve, texture. Only responds strongly to its specific pattern.

**Convolution**
Sliding a filter region-by-region across an image. At each position: multiply filter weights by pixel values, sum them up, apply activation function. Produces a map of "where was this feature detected?"

**Weight Sharing**
The same filter weights are reused at every position across the image. Means the network only needs to learn one set of weights to detect a feature anywhere — not one set per pixel position.

**Feature Map**
The output of one filter applied across the entire image. A spatial map showing where that filter's specific feature was detected strongly (high values) or not (low values).

**Convolutional Layer**
Uses many filters simultaneously. Produces one feature map per filter. Output is a 3D block — width × height × number of filters.

**Pooling Layer**
Reduces spatial dimensions while keeping strongest activations. Slides over regions and keeps the maximum value (max pooling). Throws away exact position, keeps "was this feature present in this region?"

**Translation Invariance**
The ability to recognize a feature regardless of exactly where it appears in the image. Pooling builds this in. "Pointy ear somewhere in upper region" not "pointy ear at pixel 47."

**Flatten**
Converts the 3D block of feature maps into a single long list of numbers. Required before dense layers. E.g. 4×4×256 becomes 4,096 numbers in a row.

**Dense Layer** (Fully Connected Layer)
Every neuron connected to every input. Takes flattened features and combines them into a final decision. Standard neural network layer.

**MLP** (Multi-Layer Perceptron)
Basic neural network — just dense layers. Treats every input independently. Loses spatial relationships. Not ideal for images.

**RNN** (Recurrent Neural Network)
Designed for sequential data where order matters — text, speech, time series. Has memory of previous inputs. Wrong tool for static images.

**CNN** (Convolutional Neural Network)
Designed for image data. Exploits spatial relationships through filters and pooling. Right tool for image classification.

---

## Overfitting and Regularization

**Overfitting**
Network memorizes training data including noise and quirks. Performs great on training data, fails on new data. Like a student memorizing answers instead of understanding concepts.

**Training Loss vs Validation Loss**
- Healthy training: both curves decrease together
- Overfitting: training loss keeps decreasing, validation loss starts increasing
- The gap between them is your signal

**Data Augmentation**
Showing the network modified versions of training images — rotated, flipped, zoomed, brightened. Prevents memorization of exact pixels. Forces learning of actual patterns.

**Dropout**
Randomly switches off neurons during training. Forces network to find multiple independent paths to correct answers. No single neuron becomes a crutch. Digital neuroplasticity.

**Early Stopping**
Stop training when validation loss stops improving and starts increasing. Prevents the network from overfitting further. Save the model at its best validation performance.

---

## The Full CNN Pipeline

```
Raw Image (32×32×3 = 3,072 numbers)
        ↓
Convolutional Layers (filters detect features, output grows deeper)
        ↓
Pooling Layers (shrink spatial size, build translation invariance)
        ↓
Flatten (3D block → 1D list)
        ↓
Dense Layers (combine features into decision)
        ↓
Softmax (convert to probabilities)
        ↓
Prediction ("cat" with 85% confidence)
```

---

*Last updated: D802 study sessions — built through Socratic dialogue, not memorization.*
