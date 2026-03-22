#!/bin/bash
# Runs coverage before git push and blocks if changed files have gaps.

CMD=$(jq -r '.tool_input.command' 2>/dev/null)

# Only intercept git push commands
if ! echo "$CMD" | grep -qE 'git push'; then
  exit 0
fi

# Get files changed vs main (TS only, excluding tests and excluded config files)
CHANGED=$(git diff --name-only "$(git merge-base HEAD origin/main)..HEAD" 2>/dev/null \
  | grep -E '\.(ts|tsx)$' \
  | grep -v '\.test\.' \
  | grep -v '__tests__' \
  | grep -v 'src/types\.ts' \
  | grep -v 'src/consts/index\.ts' \
  | grep -v 'src/content/config\.ts' \
  | grep -v 'src/utils/behaviors/index\.ts' \
  || true)

if [ -z "$CHANGED" ]; then
  exit 0
fi

echo "Running coverage check on changed files..."
npm run test:coverage -- --coverage.reporter=json-summary --silent 2>/dev/null

if [ ! -f "coverage/coverage-summary.json" ]; then
  echo "Warning: no coverage report generated, skipping gap check"
  exit 0
fi

GAPS=""
while IFS= read -r FILE; do
  ABS="$(pwd)/$FILE"
  RESULT=$(jq -r --arg f "$ABS" \
    '.[$f] // empty | select(.lines.pct < 100 or .branches.pct < 100) | "  lines \(.lines.pct)%, branches \(.branches.pct)%"' \
    coverage/coverage-summary.json 2>/dev/null || true)
  if [ -n "$RESULT" ]; then
    GAPS="$GAPS\n$FILE:$RESULT"
  fi
done <<< "$CHANGED"

if [ -n "$GAPS" ]; then
  echo ""
  echo "Coverage gaps in changed files — fill before pushing:"
  printf "%b\n" "$GAPS"
  echo ""
  echo '{"continue": false, "stopReason": "Coverage gaps found in changed files. Fill them before pushing."}'
  exit 1
fi

exit 0
