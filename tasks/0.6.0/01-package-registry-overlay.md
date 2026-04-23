# 01 · Package-registry overlay

**Status**: planned

## Goal

Rank packages on npm / PyPI / Cargo / crates.io by the agent-friendliness of their source repo.

## Sketch

- For each package, resolve `repository` → run scorer.
- Surface score in a browser extension or CLI that overlays on the registry page.
- Dependency-choice signal for anyone evaluating libraries.
