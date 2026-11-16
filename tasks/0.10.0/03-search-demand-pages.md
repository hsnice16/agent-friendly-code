# Pages for what people search

**Status**: in_progress

## Why

A Search Console and autocomplete study (2026-11-16) found:

- **Our best page type:** the AGENTS.md examples pages, at 5.8% CTR.
- **Underperforming pages:** the core hubs (/check/agents-md, /check/cursor-rules, /guide) rank poorly for the terms they're about.
- **Demand we don't serve:** steady demand for files and questions we have no page for.

Each page below answers one cluster of searches. Wherever we can, it uses data only we have: ~400 scored repos and the files in them.

## Pages

| Page | Searches it answers | Data behind it |
|---|---|---|
| `/guide/<slug>` articles | CLAUDE.md, copilot-instructions.md, AGENTS.md vs SKILL.md, monorepos, one file for every agent, Windsurf rules, llms.txt vs AGENTS.md, benchmarks vs readiness | Board counts, file census |
| `/compare/<a>-vs-<b>` | "claude code vs cursor" and the long-tail pairs | Per-agent scores |
| `/language/<slug>/agents` | "best ai coding agent for rust" and other languages | Per-agent scores by language |
| `/report/agents-md-size` | "agents md size limit / length" | Stored file lengths |
| `/report/ai-contribution-policy` | "rust ai contribution policy" and other projects | Policies classified by hand from the census |
| `/contribute` | "open source projects to contribute with ai" | Board signals, AI-policy census |
| `/agents-md-generator` | "agents md generator" | The starter AGENTS.md from a repo's checks |
| New framework examples pages | "agents md example spring boot" and other stacks | Board repos; new seeds where we had too few |
| Retitled or extended existing pages (`/agents`, `/check/*`) | Terms they already show for but don't win | — |

MCP config is out of scope for now.

## Rules

- **Measure set-up, not quality.** Scores measure how well a repo is set up for an agent, not which agent writes better code. Every comparison page says so.
- **Facts from official docs only.** Each guide lists its sources.
- **No unfilled numbers.** Numbers come from `getGuideStats()`, and the build fails on a `{{key}}` it can't fill (`tests/guides.test.ts`).

## What shipped

All pages above. The framework examples for Angular, Spring Boot, .NET, React Native and iOS, and the Swift, C# and Dart language pages, appear once a rescore scores the 30 new seeds.
