#!/bin/sh
# Stop-hook guard for agent-friendly-code.
#
# If the turn changed any watched source file AND the model has not yet
# been redirected this cycle, block the stop and tell the model to invoke
# `/post-change-check`. On the second Stop (`stop_hook_active: true`) the
# guard steps aside — the documented escape hatch that prevents infinite
# re-entry.

set -eu

input="$(cat)"

# Anti-loop: let the turn end if we already blocked once this cycle.
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

file_list="$(printf '%s\n' "$changed" | sed 's/^/  • /')"

# Build the reason text, then let python3 produce safely-escaped JSON.
printf '%s\n' \
  "Source files changed this turn:" \
  "$file_list" \
  "" \
  "Invoke the /post-change-check skill NOW (docs-sync audit + /code-review + /quality-check)." \
  "Do not close the turn until it has run. Continue and call the skill via the Skill tool." \
  | python3 -c 'import json,sys; print(json.dumps({"decision":"block","reason":sys.stdin.read().rstrip()}))'
