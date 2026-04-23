# 01 · License

**Status**: done

## Goal

Commit a LICENSE file at the repo root.

## Pick

MIT by default — liberal, trivially compatible. Revisit if we add a commercial tier that needs a different arrangement.

## What shipped

- `LICENSE` at repo root — MIT, © 2026 Himanshu Singh.
- `package.json` gained `"license": "MIT"`.
- README already has a Licence section (`License` → "TBD") — leaving the README rewrite for when we touch that section next; the authoritative statement is the LICENSE file + package.json field.

## Acceptance

- `LICENSE` present at root. ✓
- `package.json` `license` field matches. ✓
- Running the scorer against this repo flips the `license` signal to pass=1. (Verified via `lib/scoring/signals/license.ts`.)
