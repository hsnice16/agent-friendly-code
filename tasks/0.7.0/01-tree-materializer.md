# 01 · Tree materializer

**Status**: done

## Goal

Given a public repo URL, produce a directory on disk that `scoreRepo()` scores **identically to `git clone`** — without a git binary, in ~1.5s for a typical repo.

## Approach

Every signal asks one of three questions: does this path exist, what is in this directory, or what are the bytes of this one file. Only the third is expensive, and only ~14 candidate paths ever need it. So reconstruct the repo from the host's tree API with every path present, and fetch real bytes for just those candidates.

```
1. List every entry from the host tree API
2. Walk the entries:
     directory / submodule → mkdirSync
     regular file          → writeFileSync(path, "")
     symlink               → placeholder, remembered for step 3
3. Per symlink: fetch its blob — the content IS the target path — and symlinkSync it
4. Per content candidate: resolveRelative() → realpathSync() → fetch that file's bytes
5. scoreRepo(dir)          ← unchanged
```

Step 4 is what keeps this honest: rather than guessing which filenames need bytes, ask the scorer's own `resolveRelative` against the materialized tree, then let the OS follow symlinks. No parallel resolution logic to drift.

**Content candidates** — derived from every `readSafe` / `readFileSync` call site in `lib/scoring/signals/` plus `lib/badge-adoption.ts`: the four `README` spellings, `AGENTS.md`, `CLAUDE.md`, `AGENT.md`, `.cursorrules`, `.cursor/rules`, `GEMINI.md`, `.openhands/setup.sh`, `package.json`, `pyproject.toml`, `.gitignore`.

## The rule: never be smarter than git

Every divergence found in validation came from the materializer improving on what git does. All five were silent — no error, just a wrong number on a public page.

| Rule | What broke it |
|---|---|
| A dangling symlink stays dangling | `cloudflare/vinext` ships `CLAUDE.md -> AGENTS.md` with no AGENTS.md. `raw` 404s, so resolution failed and the placeholder was counted as a real file. Fall back to the blob endpoint, which returns the stored target either way. |
| Never trim a link target | `vercel/ai` commits `"packages/ai/README.md\n"`. Git leaves it dangling and readme scores 0.3; `.trim()` repaired it and invented 7,061 chars — **6.7 points**. |
| Submodules are empty directories | `type: "commit"` / mode `160000`. A `--depth 1` clone leaves them as empty dirs; counting them as files inflated `size` by 2 on graphviz. |
| A cap must degrade, not drop | `MAX_SYMLINKS = 200` silently skipped 51 of `zed-industries/zed`'s 251 links. Write the placeholder first so a failed or capped resolution loses no entry. |
| Relativise against the resolved root | `realpathSync` resolves the base path too, so a `/tmp` dest returns `/private/tmp` on macOS and `relative()` emits `../../private/tmp/...` — every content fetch 404s and every file lands empty. |

## Substrates rejected, with numbers

- **Tarball** (`codeload`, GitLab `archive.tar.gz`) — the original design, and wrong. Those endpoints run `git archive`, which honors **`export-ignore`** in `.gitattributes`, so the archive omits whatever the maintainer excluded from releases. Measured over 231 repos: **17 scored differently, up to 40 points, in both directions**. composer excludes `/.github/`, `/tests/` and `/README.md`; pandas has 55 such rules. Unfixable — the bytes are not in the archive.
- **`git clone` in a Vercel function** — no git binary in the runtime.
- **`isomorphic-git`** (pure JS, no binary needed) — works, but inflates and checks out in JavaScript: `next.js` cost 20.1s wall, **21.6s CPU**, 851 MB RSS, 305 MB disk. Against Hobby's 4 CPU-hrs/month that is ~660 large repos. Still the right tool if a future signal needs **history** (commit dates, blame, maintenance activity), which the tree API cannot provide.
- **Vercel Sandbox** — real git in a Firecracker microVM, free on Hobby (5 CPU-hrs, 5,000 creations/month, repo downloads unbilled). Rejected only because fidelity is its selling point and the materializer already matches a clone; it costs VM-boot latency and caps at 10 concurrent sandboxes. See `tasks/1.0.0/03-benchmark-harness.md`, where it *is* the right primitive.
- **Always-on VM (EC2 etc.)** — the only option here whose free tier expires, bills for idle, and adds a deploy target that can drift from the site.

## Per-host cost

| Host | Tree listing | Symlink detection | Content | Verdict |
|---|---|---|---|---|
| GitHub | **1 call**, `?recursive=1` | mode `120000` | `raw.githubusercontent.com`, no quota | Ship |
| GitLab | paginated, 100/entry page | mode `120000` | `/repository/files/{path}/raw` | Guard by size |
| Bitbucket | paginated, 100/entry page | `attributes: ["link"]` | `/src/{sha}/{path}` | Needs auth |

**GitHub truncation**: `?recursive=1` sets `"truncated": true` on huge repos and stops mid-walk *in sorted order*, so root files can vanish — `JetBrains/kotlin` cut off at 46,620 entries and lost `gradlew`, `LICENSE`, `CONTRIBUTING.md` and `tests/`, worth **26.8 points**. Detect the flag and re-walk one top-level subtree at a time.

**GitLab pagination is the hard limit.** graphviz is 3,411 entries = 35 sequential calls / ~20s. `gitlab-org/gitlab` exceeded 20 minutes and never completed — 1,000+ calls for one score. Needs an entry-count guard that refuses rather than hangs.

**Bitbucket is 60 requests/hour unauthenticated** — exhausted immediately under real traffic. An app password raises it to 1,000/hr.

## Security

Materializing from a path list is safer than tar extraction, but not free:

- Reject absolute paths and any `..` segment; verify the resolved path stays under the destination.
- Only recreate symlinks whose target resolves inside the tree.
- Cap total entries, and `finally { rmSync }` on every exit path.

## Validation

`clone → scoreRepo` vs `tree materializer → scoreRepo`, both run fresh from the seed URL, the tree pinned to the SHA the clone actually fetched:

```
GitHub      341 seeds   340 identical   1 error (DefiLlama/defillama-app deleted upstream)
GitLab        3 tested    3 identical   (gitlab-org/cli, fdroidclient, graphviz)
Bitbucket     2 tested    2 identical   (snakeyaml, x265_git)
```

Untested: GitLab repos large enough to make pagination impractical — the reason task 03 ships GitHub-only.

## Acceptance

- Materializes a scoreable directory for GitHub, GitLab and Bitbucket.
- Every rule in the table above has a regression test.
- A tar-style traversal path (`../evil`, `/etc/passwd`) is rejected.
- Typical repo completes in ~1.5s excluding network.
