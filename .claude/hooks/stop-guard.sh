#!/bin/sh
# Blocks Stop once per distinct uncommitted diff under watched paths and asks
# for /post-change-check. Uncommitted work outlives the turn that made it, so
# the diff is fingerprinted; `stop_hook_active` lets the redirected Stop through.

set -eu

input="$(cat)"

if printf '%s' "$input" | grep -qE '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

paths="app components lib scripts .claude biome.json lefthook.yml package.json tsconfig.json next.config.ts"
modified="$(git diff --name-only HEAD -- $paths 2>/dev/null || true)"
untracked="$(git ls-files --others --exclude-standard -- $paths 2>/dev/null || true)"
changed="$(printf '%s\n%s' "$modified" "$untracked" | sed '/^$/d')"

if [ -z "$changed" ]; then
  printf '\n✓ Turn finished. No source-file changes detected.\n'
  exit 0
fi

# In .git so it is never committed and is per-clone.
marker="$(git rev-parse --git-dir)/post-change-check.fingerprint"
fingerprint="$(
  {
    git diff HEAD -- $paths
    printf '%s\n' "$untracked" | sed '/^$/d' | while IFS= read -r f; do
      printf '%s %s\n' "$f" "$(git hash-object -- "$f")"
    done
  } | git hash-object --stdin
)"

if [ -f "$marker" ] && [ "$(cat "$marker")" = "$fingerprint" ]; then
  exit 0
fi

file_list="$(printf '%s\n' "$changed" | sed 's/^/  • /')"

printf '%s\n' \
  "Uncommitted source changes:" \
  "$file_list" \
  "" \
  "Invoke the /post-change-check skill NOW (docs-sync audit + /code-review + /quality-check)." \
  "Do not close the turn until it has run. Continue and call the skill via the Skill tool." \
  | python3 -c 'import json,sys; print(json.dumps({"decision":"block","reason":sys.stdin.read().rstrip()}))'

# Only once the block is out, or a failed python3 would mark the diff as handled.
printf '%s\n' "$fingerprint" > "$marker"
