# 01 · Badge endpoint

**Status**: planned

## Goal

`GET /badge/:host/:owner/:name.svg` → shields.io-style badge with overall (or per-model) score.

## Details

- Query param `?model=<id>` for per-model badge.
- Cache for ~1h; re-fetch on stale.
- Document embed snippet in repo detail page.
