# 0.10.0 — maintainer ownership + at-scale discovery

**Status**: in_progress

01 and 02 both add an external touchpoint — OAuth sessions with per-user DB writes, and a userscript probing registry pages — so they ship in one cut.

## Tasks

- [01-opt-out-claim-flow.md](./01-opt-out-claim-flow.md) — OAuth so maintainers can claim or opt out of their listing. First touchpoint that writes to the DB on behalf of a user.
- [02-package-registry-overlay.md](./02-package-registry-overlay.md) — per-registry leaderboards on the dashboard + a browser userscript that renders the badge inline on npmjs.com / PyPI / crates.io. Builds on the v0.3.0 lookup endpoint.

## Shipped since 0.9.5, owed a changelog line

- New report: which popular repos ship agent skills (`.agents/skills`, `.claude/skills`), with a trend and a CSV.
- `/agents`: a support matrix of which agent reads which instructions file, each cell linked to its docs, with how many repos have each file.
- `/changelog.xml`: an Atom feed of releases.
- AGENTS.md examples: the hub leads with languages and offers every file as a CSV; each language's page opens with a real file to start from and a one-line `curl` to copy it.
- Agent boards open with the ranking right after a one-line summary with a dated AGENTS.md figure; later pages hold 50 rows. Summaries name the best repo with 100+ stars.
- The AGENTS.md generator is linked from the home page, check pages, AGENTS.md example pages and framework guides; repo pages and Live Score results without an AGENTS.md open their starter draft in place.
- Repo pages: each summary tile opens the board page, agent board, check or language hub it describes; the AGENTS.md row says how its length compares with the rest of the board.
- Topic pages open with the top repo and list the checks their repos most often miss.
- Guides, check pages, comparisons and reports show who wrote them and when they last changed.
- Share images for guides, agent comparisons, reports and AGENTS.md example pages.
- AGENTS.md vs CLAUDE.md covers the `@AGENTS.md` import and the symlink, with what popular repos do.
- The pre-commit check page has copyable pre-commit, Husky and Lefthook configs and a Claude Code hook that blocks `--no-verify`.
