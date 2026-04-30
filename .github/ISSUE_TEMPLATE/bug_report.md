---
name: Bug report
about: The dashboard showed something wrong, an API returned the wrong shape, scoring looks off, or `bun run dev` broke locally.
title: "bug: <one-line summary>"
labels: bug
---

## What happened

_The behaviour you observed._

## What you expected

_What you thought would happen._

## Where

_Tick whichever applies:_

- [ ] Dashboard (visitor-facing — leaderboard, repo page, methodology, about, etc.)
- [ ] API route (`/api/repo/:id`, `/api/repos`, `/api/score`, `/api/badge/...`, `/api/package/...`, `/llms.txt`)
- [ ] Score / signal output (the score itself looks wrong for a specific repo)
- [ ] Local dev (`bun run dev`, `bun run seed`, `bun run score <url>`, `bun run test`)
- [ ] Other — please describe.

## Reproduction

- **URL or repo affected (if any)**: _e.g. `https://<deploy-host>/repo/123` or the repo being scored, like `vercel/next.js`._
- **Browser / OS** (for UI bugs): _e.g. Chrome 130 on macOS 15._
- **`bun --version` / Node version** (for local-dev bugs): _e.g. `bun 1.1.x`, `node 20.9.0`._
- **Steps**:
  1. _…_
  2. _…_
  3. _…_

### Logs / screenshots

_Console output, server logs, or screenshots. Use a `<details>` block for long logs._

## Anything else

_Anything that might be relevant — recent re-score, specific signal, model selection, fresh install vs upgrade, etc._
