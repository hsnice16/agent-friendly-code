# 05 · Package registries discovery (lookup)

**Status**: done

## What shipped

- `lib/clients/registries.ts` — resolver per registry (npm / PyPI / Cargo). Normalizes `git+https://...` / `git://...` / `ssh://` prefixes before handing to `parseRepoUrl`.
- `lib/utils/contact.ts` — builds a `REPO_URL/issues/new?title=...&body=...&labels=score-request` URL with a pre-filled template that names the package and what we resolved.
- `lib/db.ts` — additive `package_alias(registry, name, repo_url, resolved_at)` table + `getPackageAlias` / `putPackageAlias` / `getRepoByUrl` helpers. Cache is populated on first resolve.
- `lib/package-lookup.ts` — shared discriminated-union lookup used by both the API and the page, so the two can't drift.
- `app/api/package/[registry]/[name]/route.ts` — JSON route, three statuses (`scored` / `not_scored` / `unresolved`), `Cache-Control: public, max-age=3600`.
- `app/package/page.tsx` — explainer page with an interactive lookup form (registry dropdown + name input + "Look up" button → `/package/:registry/:name`), JSON-API hint, four clickable examples (`npm/react`, `npm/axios`, `pypi/requests`, `cargo/serde`), and "what happens when it's not scored" section.
- `components/PackageLookupForm.tsx` — client form used by `/package`, posts via `router.push` after `encodeURIComponent`.
- `app/package/[registry]/[name]/page.tsx` — result page rendering the three lookup states.
- `app/layout.tsx` — "Packages" link surfaced in the footer (secondary nav); header keeps Methodology / Roadmap / Changelog.
- `app/page.tsx` — one-line callout above the leaderboard pointing at `/package`, link styled with a dotted underline for affordance.

## Acceptance — verified live

- ✓ `curl /api/package/npm/react` → scored, overall 70.8, per-model breakdown, badge URL.
- ✓ `curl /api/package/npm/lodash` → `not_scored`, resolved repo `lodash/lodash`, pre-filled contact URL.
- ✓ `curl /api/package/npm/<gibberish>` → `unresolved`, contact URL, HTTP 200.
- ✓ `/package`, `/package/npm/react`, `/package/npm/lodash`, `/package/npm/<gibberish>` all render the expected state.
- ✓ Nav link visible; homepage callout visible.

## Out of scope (stays in v0.7.0)

- Per-registry leaderboards ("top 100 npm packages by agent-friendliness").
- Browser userscript for inline badges on registry pages.
- `overrides.yml` for monorepo packages with wrong `repository.url`.
- Auto-scoring on lookup (no POST API; requests flow through the GitHub-issue template).

## Goal

Developers pick dependencies in registry UIs (npmjs.com, PyPI, crates.io) — not on GitHub. This task adds the lookup half of the package-registry overlay: given a package name, resolve it to its source repo and surface the score (or invite scoring via a pre-filled GitHub issue).

The at-scale side — per-registry leaderboards + browser userscript for inline badges — stays in v0.7.0 as a follow-up.

## Public surface

1. **`GET /api/package/:registry/:name`** — JSON, three shapes:
   - `{ status: "scored", registry, package, repo: { host, owner, name, id }, overall, per_model, badge_url }`
   - `{ status: "not_scored", registry, package, repo: { host, owner, name }, contact_url }`
   - `{ status: "unresolved", registry, package, contact_url }`
   - Cache: `Cache-Control: public, max-age=3600`.
2. **`/package/:registry/:name`** — page rendering the same three states.
   - Scored: mini repo card with overall score + link to `/repo/:id` + badge embed snippet.
   - Not scored: "This package maps to `owner/name` — not scored yet. [Open a GitHub issue](…) to request it."
   - Unresolved: "Couldn't find a source repo. [Open an issue](…) with the correct URL."
3. **`/package`** — explainer page: what this is, URL pattern, deep-link examples (`npm/axios`, `npm/react`, `pypi/requests`, `cargo/serde`).

## Discovery

- Footer secondary nav (Home / Methodology / Roadmap / Changelog / Packages), Packages last.
- One-line callout above the leaderboard on `/` pointing at `/package` (dotted-underline affordance).
- README + changelog entry at release time.

## Under the hood

- `lib/clients/registries.ts` — one resolver per registry:
  - npm: `https://registry.npmjs.org/:name` → `.repository.url`
  - PyPI: `https://pypi.org/pypi/:name/json` → `.info.project_urls.Source || .info.home_page`
  - Cargo: `https://crates.io/api/v1/crates/:name` → `.crate.repository`
  - Normalize the URL through `parseRepoUrl`.
- `lib/db.ts` — `package_alias(registry, name, repo_url, resolved_at)` cache table. Additive migration pattern matching `language`.
- `lib/utils/contact.ts` — builds a `REPO_URL/issues/new?title=...&body=...` link with a pre-filled template naming the package + what we resolved.

## Out of scope (v0.7.0 follow-up)

- Per-registry leaderboards ("top 100 npm packages").
- Browser userscript for inline badges on registry pages.
- `overrides.yml` for monorepos with wrong `repository.url`.
- Auto-score on lookup (no POST API, per the task's own constraint).

## Acceptance

- `curl /api/package/npm/react` returns scored JSON for a package we track.
- `curl /api/package/npm/<unscored-package>` returns `not_scored` with a contact URL.
- `curl /api/package/npm/<random-gibberish>` returns `unresolved` with a contact URL, HTTP 200 (so it's safe to embed).
- `/package/:registry/:name` renders all three states visually.
- Header link visible; `/package` explainer page reachable.
