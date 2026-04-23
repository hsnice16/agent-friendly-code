# 01 · Alternative recommender

**Status**: planned

## Goal

"You're considering X; Y does the same thing and scores 18 points higher for Claude Code."

## Sketch

- Cluster repos by topic/similarity (embeddings on README + deps).
- Within each cluster, surface the top-ranked repo per model.
- Show on the repo detail page as an "alternatives" strip.
