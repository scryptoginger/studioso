# Linear Algebra

## Dot product

For vectors `a` and `b` of equal length:

```python
a · b = sum(a_i * b_i for i in range(n))
```

Equals `|a| |b| cos(θ)`. Measures similarity — zero when orthogonal,
maximum when aligned. The fundamental operation behind matrix
multiplication and attention.

---

## Matrix multiplication

`(A · B)[i, j] = sum over k of A[i, k] * B[k, j]`. Requires inner
dimensions match: `(m × k) · (k × n) → (m × n)`. Not commutative:
`AB ≠ BA` in general.

---

## Eigenvector

A non-zero vector `v` such that `A v = λ v` for some scalar `λ` (the
eigenvalue). Geometrically: `A` stretches `v` along its own direction
without rotating it. Foundational for PCA, spectral methods, and
stability analysis.

---

## Rank

The dimension of the column space of a matrix — the number of linearly
independent columns. A full-rank `n × n` matrix is invertible. Rank
deficiency means the matrix collapses some directions of the input
space.

---

## Singular value decomposition (SVD)

Factor any matrix `A` as `U Σ Vᵀ` where `U` and `V` are orthogonal and
`Σ` is diagonal with non-negative singular values. The workhorse behind
PCA, matrix approximation, and pseudoinverses.

```python
U, S, Vt = torch.linalg.svd(A)
```
