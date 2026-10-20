# 0.9.1 — which file each agent reads

**Status**: released

Work shipped since 0.9.0, cut as a patch so [0.10.0](../0.10.0/README.md) stays the maintainer opt-out and registry release.

## Shipped

- Live Score pages get the repo page's section nav, agent instructions panel, collapsed "All checks" with file links, and the PR Action embed.
- Every page's footer lists every agent board, language, check and topic; the home page's preview cards are gone.
- Visitors from the EEA, UK and Switzerland are asked before Google Analytics sets cookies.
- Repo page titles name the host ("axios/axios GitHub repo: …"), and descriptions lead with the repo's own description when it fits beside the score.
- Repo pages link up to six repos in any language that share their most specific GitHub topics, under "Same topics, any language".
- /agents: which repo files each agent reads, from its own docs, with how many leaderboard repos have each file.
- /check/agents-md/vs-claude-md: which of the two files to use, which agents read each, and what Claude Code does when a repo has both.
- The AGENTS.md check page says what to put in the file and what to leave out, with the median file length on the leaderboard.
- The dev-env check accepts `docker-compose.yaml` and the contributing check `.github/CONTRIBUTING.adoc`; repos whose only such file has that name score higher.
- The AGENTS.md check takes the first of AGENTS.md, CLAUDE.md and AGENT.md with content, so an empty AGENTS.md no longer hides a full CLAUDE.md; those repos score higher.
- A directory named like a file (a workflow, a `.mdc` rule, a manifest, a type config) no longer passes the CI, Cursor-rules, dependency-manifest or type-config check.
