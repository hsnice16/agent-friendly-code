# 04 · Opt-out / claim flow

**Status**: planned

## Goal

Respect maintainer preferences on a public dashboard.

## Pieces

- GitHub OAuth login.
- Verify repo ownership (GH permission check).
- Actions: claim (unlocks deep scan), opt out (hides from public listing but keeps the score computable for the API).
- Blacklist file for uncontested requests.
