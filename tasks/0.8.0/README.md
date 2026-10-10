# 0.8.0 — find repos by language, at addresses that last

**Status**: released

Search Console showed most repo pages known to Google but never crawled: they were reachable only through deep leaderboard pagination, at numeric URLs that said nothing about the repo. This version gives every repo more ways in and an address that survives a rename, and stops the tracked set rotting quietly.

The two heavier items first planned here, the opt-out / claim flow and the at-scale package overlay, moved to [0.9.0](../0.9.0/README.md): they need auth and a browser extension, and nothing in this version depends on them.

## Tasks

- [01-language-hubs.md](./01-language-hubs.md) — per-language hub pages and near-score Similar repos.

## Also shipped

- **Slug repo URLs** — `/repo/<host>/<owner>/<name>`; numeric and differently-cased addresses redirect.
- **Seed freshness** — `bun run seed` renames moved repos in place and deletes rows that left `scripts/seed-list.ts`; `repo_alias` keeps old page, badge and `/api/score` URLs answering; a weekly audit files an issue for seeds that are gone, renamed, archived or stale. Steps in CONTRIBUTING.md.
- **AGENTS.md / CLAUDE.md check** no longer passes on Cursor rule files. Vendored by both siblings in their 0.1.6.
- **Copy** — the site, READMEs and sibling repos describe one score reached four ways (ranked repos, Live Score, agent skill, GitHub Action) instead of a leaderboard.
