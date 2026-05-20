# tasks/

Per-version work breakdown, readable by any agent (Claude Code, Cursor, Codex, Devin, etc.).

## Structure

```text
tasks/
  README.md               <- this file
  <MAJOR.MINOR.PATCH>/    <- one folder per version, e.g. 0.1.0, 0.2.0
    README.md             <- version overview
    NN-<slug>.md          <- one task per file, numbered by intended order
```

## Statuses

Each task file has a `**Status**: …` line:

- `done` — shipped; file is a record of what happened.
- `in_progress` — being worked on now.
- `planned` — scheduled for this version, not yet started.
- `deferred` — considered for this version's release but postponed before shipping. The file stays as a future reference with the rationale; may or may not return in a later version.

## How to use in a session

Starting a session, point the agent at a specific task:

```text
Work on tasks/0.2.0/01-tests.md.
```

The agent reads:

1. That task file for the goal + acceptance criteria.
2. The version's `README.md` for scope.
3. `AGENTS.md` at the repo root for conventions.

## Versioning

`0.x` while the product is still finding its shape; `1.0` once the benchmark harness is in place and weights are empirically derived.

Current version: see `lib/version.ts`. Released versions: see `lib/changelog.ts`. Planned versions: see `lib/roadmap.ts`.
