# 0.10.0 — maintainer ownership + at-scale discovery

**Status**: in_progress

01 and 02 both add an external touchpoint — OAuth sessions with per-user DB writes, and a userscript probing registry pages — so they ship in one cut.

## Tasks

- [01-opt-out-claim-flow.md](./01-opt-out-claim-flow.md) — OAuth so maintainers can claim or opt out of their listing. First touchpoint that writes to the DB on behalf of a user.
- [02-package-registry-overlay.md](./02-package-registry-overlay.md) — per-registry leaderboards on the dashboard + a browser userscript that renders the badge inline on npmjs.com / PyPI / crates.io. Builds on the v0.3.0 lookup endpoint.
- [03-search-demand-pages.md](./03-search-demand-pages.md) — pages for what people search: guides, comparisons, reports, framework examples.

## Shipped since 0.9.4, owed a changelog line

- The leaderboards have a Badge filter that shows only repos displaying the Agent Friendly Code badge in their README (`?badge=1`).
- Repo pages are lighter: "Similar repos" also lists repos sharing the repo's GitHub topics (formerly a separate section), the badge and a link to the GitHub Action share one "Add to your repo" card (on Live Score pages too, in place of the workflow file), and the footer links the language and topic hubs instead of listing each one.
- A package its registry doesn't list now gets a "Package not found" page (404) instead of "no source repo listed", and `/api/package/<registry>/<name>` answers it with `status: "not_found"` and HTTP 404.
- Live Score opens the repo page for a GitLab repo that is already on the board, instead of turning it away.
- Eight guides at `/guide/<slug>`: CLAUDE.md, copilot-instructions.md, one instructions file for every agent, AGENTS.md vs skills, AGENTS.md in a monorepo, Windsurf (now Devin Desktop) rules, llms.txt vs AGENTS.md, and coding agent benchmarks, each with counts from the board and a whole-tree file census.
- `/compare/<a>-vs-<b>`: ten agent pairs compared by how the board's repos are set up for each, and `/language/<slug>/agents` for the seven largest languages.
- `/report/agents-md-size`: how long real AGENTS.md and CLAUDE.md files are, and how many exceed Devin's 16 KiB and Codex's 32 KiB limits.
- `/report/ai-contribution-policy`: what 120 projects' own policies say about AI-assisted contributions, classified by hand.
- `/contribute`: open source projects with a CONTRIBUTING guide, tests and CI, by language, leaving out those whose policy refuses AI contributions.
- `/agents-md-generator`; Live Score results now offer the starter AGENTS.md repo pages show, plus CLAUDE.md and Gemini CLI stubs.
- `/agents` answers "does <agent> read AGENTS.md?" for every agent, and covers Copilot, Antigravity, OpenCode, Devin Desktop and Kiro.
- AGENTS.md examples pages for React, Vue, Laravel, Android and Flutter, with Angular, Spring Boot, .NET, React Native and iOS (and Swift, C# and Dart language pages) once the 30 new seeds are scored.
- Check pages for tests, linter, pre-commit, dev setup and CI say how agents use each (hooks, devcontainers, CI); /check/agents-md and /check/cursor-rules explain the format and best practices.
