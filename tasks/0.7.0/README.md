# 0.7.0 — score any repo on the fly

**Status**: released

Today the dashboard only answers "how agent-friendly is a repo we already indexed?". This version answers it for any public GitHub repo, on demand, in about a second — paste a URL, get the same score the GitHub Action and the local skill would produce.

The whole version is built around one constraint: it must stay free, and it must survive a traffic spike without a queue, a database, or a second deploy target. That rules out cloning (no `git` binary in a Vercel function) and rules out persistence (`lib/db.ts` copies the bundled SQLite to `/tmp` per instance, so a write lands on one lambda and vanishes). What's left is a directory materialized from the host's tree API, scored by the untouched `scoreRepo()`, served from an ISR page so repeat traffic never reaches a function.

Nothing here writes to `data/rank.db`. The live path and the leaderboard share `lib/scoring/` and nothing else.

GitLab and Bitbucket are implemented and validated but ship as "support coming" — see task 03 for why.

## Tasks

- [01-tree-materializer.md](./01-tree-materializer.md) — build a scoreable directory from a host tree API: every path present, real bytes only where a signal reads them. Records the substrates tested and rejected.
- [02-score-parity-harness.md](./02-score-parity-harness.md) — CI gate asserting the materializer scores identically to a real clone. The mechanism that keeps the live path honest as signals change.
- [03-live-score-pages.md](./03-live-score-pages.md) — `/score` entry page and the `/score/[host]/[owner]/[name]` result page.
- [04-release-announcement.md](./04-release-announcement.md) — once-per-release notice on the home page, driven by `lib/changelog.ts`.

Sequencing matters: 02 lands before 03. Every defect found while building 01 was silent — a plausible wrong score, never an error — so the gate has to exist before the page is public.
