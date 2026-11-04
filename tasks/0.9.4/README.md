# 0.9.4 — guides for agent-ready repos

**Status**: released

Content and speed work since 0.9.3. Cut as a patch so [0.10.0](../0.10.0/README.md) stays the maintainer opt-out and registry release.

## Shipped

- Microsoft Clarity records heatmaps and visits, with typed text masked; visitors from the EEA, UK and Switzerland are asked first, and can change their answer on /privacy. Google Analytics also counts leaderboard searches, filter and sort changes, and "Score your repo" clicks; /privacy says so.
- AGENTS.md examples have a page per language with five or more files, linked from its language hub.
- A Live Score of a very large GitHub repo offers a retry when part of its file list fails to load, instead of scoring without those files.
- /guide groups every check into what to do to make a repo ready for AI coding agents, with pass rates.
- AGENTS.md examples have a page per framework (Next.js, FastAPI, Django, Rails) saying what to put in the file.
- Cursor rules and GEMINI.md each have a page comparing them with AGENTS.md.
- A repo page without a usable AGENTS.md offers a starter one to copy, built from the files the checks found.
- /report/agents-md: the share of leaderboard repos with an AGENTS.md or CLAUDE.md, from snapshots since April 2026; today's split by language and other agent files; and a CSV to download and cite.
- The leaderboards load faster and show 12 rows per page instead of 32. Search, the platform filter and sorting update instantly without reloading the page, and later pages have their own address (`/page/2`, `/model/<agent>/page/2`); old `?page=` and `?model=` links redirect.
- The Go, Python, TypeScript, Rust and Java AGENTS.md example pages say what to put in the file for that language: commands, layout and common agent mistakes, from the official docs.

## On deploy

Submit the new pages: `bun run indexnow`, then request indexing in Search Console for `/guide`, `/report/agents-md` and the framework and language AGENTS.md pages.
