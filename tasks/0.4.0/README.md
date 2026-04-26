# 0.4.0 — credible scores + better discoverability

**Status**: done

The credibility cut. Two related items make the per-model scores defensible: rationale strings sourced from each agent's official docs (instead of the "illustrative" hedge that has shipped since 0.3.0), and a new family of agent-specific instruction-file signals discovered during the docs verification (`.cursor/rules/`, `GEMINI.md`, `.openhands/setup.sh`, `.aider.conf.yml`). The third item lifts the dashboard's discoverability — an About page (E-E-A-T), `/llms.txt` for LLM crawlers, and per-repo Open Graph images — capturing the SEO / discoverability work that landed alongside the rationale audit.

The release does not add measurement (that's still v1.0.0's benchmark harness). It removes a credibility tax: today's per-model rationales are claims like "Cursor weighs type configs and READMEs highly" with no source — half of them turn out to be unsupported once you read the official docs. After this release, every claim cites a URL.

## Tasks

- [01-sourced-agent-rationales.md](./01-sourced-agent-rationales.md) — rewrite each agent's `rationale` in `lib/scoring/weights.ts` with a docs-cited claim, add a `sources` field per model, render the URLs in a "Sources" panel on `/methodology`, and replace the page's "illustrative" language with "documented preferences." Reweight Devin (CI 1.0 → 0.7, dev_env stays at 1.0) and Cursor (lift `agents_md` and add `cursor_rules` weight) per the docs verification.
- [02-agent-specific-signals.md](./02-agent-specific-signals.md) — new signals for each agent's canonical instruction file beyond AGENTS.md: `cursor_rules` (`.cursor/rules/*.mdc`), `gemini_md` (`GEMINI.md`), `openhands_setup` (`.openhands/setup.sh`), `aider_conf` (`.aider.conf.yml`). Each weighted on the relevant model only; other models default to 0 (deliberate, not absent).
- [03-discoverability.md](./03-discoverability.md) — `/about` page (who built this and why — SEO E-E-A-T), `/llms.txt` markdown manifest for Perplexity / Claude / ChatGPT search, and per-repo Open Graph images via the `next/og` convention (`app/repo/[id]/opengraph-image.tsx`). Mostly already in flight on this branch — task captures scope and acceptance.
