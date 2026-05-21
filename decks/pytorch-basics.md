# PyTorch Basics

## torch.Tensor

The core data structure — an n-dimensional array with autograd support
and CUDA acceleration. Create with `torch.tensor([...])`, `torch.zeros`,
`torch.randn`, etc.

---

## requires_grad

A flag on a tensor that tells autograd to track operations on it. When
set, the computational graph is built so `.backward()` can compute
gradients with respect to that tensor.

```python
x = torch.randn(3, requires_grad=True)
y = (x ** 2).sum()
y.backward()
print(x.grad)
```

---

## nn.Module

Base class for all neural network components. Subclass it, declare
submodules and parameters as attributes, and implement `forward`.
PyTorch tracks parameters automatically for the optimizer.

---

## DataLoader

Wraps a `Dataset` to provide batching, shuffling, and parallel workers.
The single most common training loop bottleneck — set `num_workers > 0`
and `pin_memory=True` when training on GPU.

---

## Optimizer.zero_grad()

Resets gradients to zero before each backward pass. PyTorch accumulates
gradients by default, so without this call gradients from previous
steps would contaminate the current update.

```python
optimizer.zero_grad()
loss.backward()
optimizer.step()
```

---

## torch.no_grad()

Context manager that disables gradient tracking. Use for inference and
evaluation to save memory and compute.
