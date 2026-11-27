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
- Guides, check pages and reports show who wrote them and when they last changed.
- Guides link each claim to the agent's docs; the coding agent benchmarks guide and the license check page are rewritten from sources and board data.
- Share images for guides, reports and AGENTS.md example pages.
- AGENTS.md vs CLAUDE.md covers the `@AGENTS.md` import and the symlink, with what popular repos do.
- New report: what the board's AGENTS.md and CLAUDE.md files contain, section by section (topics, test commands, links and imports, rules), with quoted examples and a CSV.
- Repo pages have an "On record" section: when the board first found each agent file, agent files below the root, which agents read them, and the project's AI contribution policy.
- New guide: why a coding agent ignores AGENTS.md, with per-agent load rules, limits and how to confirm the file loaded, each linked to the agent's docs.
- Agent boards end with a "Set up a repo for <agent>" panel: setup steps, the files it reads and how to check they loaded.
- Language hubs with enough repos answer which agent those repos are best set up for; `/language/<x>/agents` redirects there.
- `/about` lists the work behind the site and says how it is made, including where AI is used.
- Scoring fixes: a hostile `.gitignore`, folder links or thousands of folders can no longer stall Live Score, the Action or the skill; a folder named like an agent file, `LICENSE` or `CONTRIBUTING.md` no longer counts as that file; the dev-environment check counts each tool once.
- A page's "Updated" date moves only when its own text or the repos it lists change, not on every rescore.
- The pre-commit check page has copyable pre-commit, Husky and Lefthook configs and a Claude Code hook that blocks `--no-verify`.
- The agent skills check page lists every SKILL.md frontmatter field from the Agent Skills spec, with an example skill.
- Repo pages with an AGENTS.md or CLAUDE.md say what it covers against every file on the board: its sections and the common ones it lacks, whether it names a test command and how to run one test, what it links to, and its never / do not / avoid lines.
- The agent comparison pages are folded into `/agents` as one table of pair averages; `/compare` links redirect there.
- Reweights after a fresh docs audit: Cursor AGENTS.md 0.8 → 1.0, Devin AGENTS.md 0.6 → 0.9, Kimi Code CLI size 0.4 → 0.5.
