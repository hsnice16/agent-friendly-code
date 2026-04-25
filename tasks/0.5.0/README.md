# 0.5.0 — auto-refresh + smarter matching

**Status**: planned

Two moderate-effort items that need real infra (a webhook receiver + queue, an embedding model and a vector store) but don't yet need user accounts or registry crawls. Together they shift the product from a manual-seed snapshot to a self-updating dataset with smarter matching.

## Tasks

- [01-webhook-rescoring.md](./01-webhook-rescoring.md) — keep scores fresh on every push; detect regressions. Webhook receiver + signature verification + rescore queue.
- [02-alternatives-v2-embeddings.md](./02-alternatives-v2-embeddings.md) — sentence-transformer embeddings on the README; cosine-similar neighbors = alternatives. Lifts the v1 same-language SQL heuristic so cross-language alternatives surface correctly (e.g. `axios` → `requests`).
