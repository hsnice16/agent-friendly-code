# 0.9.5 — every language's own files count

**Status**: released

Scoring, Live Score and content work since 0.9.4, including [03-search-demand-pages.md](../0.10.0/03-search-demand-pages.md). Cut as a patch so [0.10.0](../0.10.0/README.md) stays the maintainer opt-out and registry release. The scorer changed, so the action and skill release 0.1.10 alongside.

## Shipped

- The dependency-manifest check counts a `.slnx` solution (the .NET 10 default) and `Directory.Packages.props`, so .NET repos laid out that way no longer fail it ([#20](https://github.com/hsnice16/agent-friendly-code/issues/20)).
- The leaderboards have a Badge filter that shows only repos displaying the Agent Friendly Code badge in their README (`?badge=1`).
- Repo pages are lighter: "Similar repos" also lists repos sharing the repo's GitHub topics (formerly a separate section), the badge and a link to the GitHub Action share one "Add to your repo" card (on Live Score pages too, in place of the workflow file), and the footer links the language and topic hubs instead of listing each one.
- A package its registry doesn't list now gets a "Package not found" page (404) instead of "no source repo listed", and `/api/package/<registry>/<name>` answers it with `status: "not_found"` and HTTP 404.
- Live Score opens the repo page for a GitLab or Bitbucket repo that is already on the board, instead of turning it away; the notes under the form and in its error say so.
- Eight guides at `/guide/<slug>`: CLAUDE.md, copilot-instructions.md, one instructions file for every agent, AGENTS.md vs skills, AGENTS.md in a monorepo, Windsurf (now Devin Desktop) rules, llms.txt vs AGENTS.md, and coding agent benchmarks, each with counts from the board and a whole-tree file census.
- `/compare/<a>-vs-<b>`: ten agent pairs compared by how the board's repos are set up for each, and `/language/<slug>/agents` for the seven largest languages.
- `/report/agents-md-size`: how long real AGENTS.md and CLAUDE.md files are, and how many exceed Devin's 16 KiB and Codex's 32 KiB limits.
- `/report/ai-contribution-policy`: what 120 projects' own policies say about AI-assisted contributions, classified by hand.
- `/contribute`: open source projects with a CONTRIBUTING guide, tests and CI, by language, leaving out those whose policy refuses AI contributions.
- `/agents-md-generator`; Live Score results now offer the starter AGENTS.md repo pages show, plus CLAUDE.md and Gemini CLI stubs.
- `/agents` answers "does <agent> read AGENTS.md?" for every agent, and covers Copilot, Antigravity, OpenCode, Devin Desktop and Kiro.
- AGENTS.md examples pages for React, Vue, Laravel, Android and Flutter, with Angular, Spring Boot, .NET, React Native and iOS (and Swift, C# and Dart language pages) once the 30 new seeds are scored.
- Check pages for tests, linter, pre-commit, dev setup and CI say how agents use each (hooks, devcontainers, CI); /check/agents-md and /check/cursor-rules explain the format and best practices.
- The linter check counts C#, F# and Kotlin configs: an `.editorconfig` with `dotnet_`, `csharp_`, `visual_basic_`, `fsharp_` or `ktlint_` keys, `.globalconfig`, `stylecop.json`, `fsharplint.json`, or a `Directory.Build.props` that sets `EnforceCodeStyleInBuild`, `AnalysisLevel` or `AnalysisMode` ([#21](https://github.com/hsnice16/agent-friendly-code/issues/21)).
- The checks recognise each language's standard files, so a well set-up repo passes whatever it is written in: every ESLint, Prettier and Biome config name, Checkstyle, Spotless, detekt and ktlint in Java and Kotlin builds, PHPStan and Psalm, Dart, C and C++ as typed languages, HLint, Zig's fmt step and more. The manifest, linter and type checks also look one folder down (`src/`, `dotnet/`). Tests kept beside the code earn full credit, and a language toolchain such as `Cargo.toml` or `go.mod` counts as one-command setup. README, license, CI and hook checks also take more names: README in `.github/` or `docs/` and AsciiDoc, `LICENCE` and REUSE `LICENSES/`, about twenty more CI systems, and prek, simple-git-hooks and other hook tools. A `setup.cfg` counts as a linter config only with a linter section.
- Live Score switches agents in "What to fix first" instantly, and the "Couldn't score this repo" page points private repos to the agent skill.

## On deploy

Run `scheduled-rescore.yml` by `workflow_dispatch` so stored scores pick up the new checks; its IndexNow step submits the pages that changed. Release `agent-friendly-action` and `agent-friendly-skill` 0.1.10.
