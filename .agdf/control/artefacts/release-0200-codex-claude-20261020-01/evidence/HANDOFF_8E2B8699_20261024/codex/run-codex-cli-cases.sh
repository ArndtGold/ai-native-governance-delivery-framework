#!/usr/bin/env bash
# Runs preflight and the five Codex CLI release cases for candidate 8e2b8699 on macOS once each and
# packs the returnable bundle. Run it from this handoff directory inside a clone of the repository.
# Optional: MODEL (default gpt-6-luna), CODEX_BIN (Codex inside the ChatGPT app), WT (worktree path).
set -u
COMMIT=460027fabc58fe0da041bbabe117519dd1f696b7
CANDIDATE_ID=8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692
MODEL="${MODEL:-gpt-6-luna}"
HANDOFF="$(cd "$(dirname "$0")" && pwd)"
REPO="$(git -C "$HANDOFF" rev-parse --show-toplevel)" || exit 1
WT="${WT:-$HOME/agdf-rc-${COMMIT:0:8}}"
[ "$(uname -s)" = Darwin ] || { echo "Run this on macOS." >&2; exit 2; }

if [ ! -d "$WT" ]; then
  git -C "$REPO" fetch origin || exit 1
  git -C "$REPO" worktree add --detach "$WT" "$COMMIT" || exit 1
  (cd "$WT" && npm ci --ignore-scripts && npm run build:prepare && npm --prefix packages/mcp-server ci --ignore-scripts) || exit 1
fi
cd "$WT" || exit 1
[ "$(git rev-parse HEAD)" = "$COMMIT" ] || { echo "Worktree $WT is not at $COMMIT." >&2; exit 1; }
cp "$HANDOFF/candidate.json" .release-candidate.json
mkdir -p probe-results
# .release-candidate.json and probe-results/ are git-ignored, so the checkout must stay clean.
[ -z "$(git status --porcelain)" ] || { echo "Worktree $WT is not clean:" >&2; git status --porcelain >&2; exit 1; }
[ -e probe-results/codex-cli-tuple.json ] && { echo "A tuple already exists; remove it only if no case ran with it." >&2; exit 1; }

LOG="$WT/probe-results/codex-cli-run.log"
{
  echo "started $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  git rev-parse HEAD; node --version; "${CODEX_BIN:-codex}" --version
  echo "=== preflight ==="
  node scripts/native-probes/release-evidence.mjs preflight --candidate .release-candidate.json --host codex --surface cli --model "$MODEL" --output probe-results/codex-cli-tuple.json
  echo "exit preflight: $?"
  if [ -e probe-results/codex-cli-tuple.json ]; then
    for S in dispatch failure_case skill_continuation upgrade recovery; do
      echo "=== $S ==="
      node scripts/native-probes/codex-host-e2e.mjs --candidate .release-candidate.json --tuple probe-results/codex-cli-tuple.json --model "$MODEL" --scenario "$S"
      echo "exit $S: $?"
    done
  fi
  echo "finished $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} 2>&1 | tee "$LOG"

# Only records, their referenced captures, summaries, the tuple, the candidate and the log leave this Mac.
# work-tmp may still hold the copied Codex auth.json after a failed removal and is never packed.
BUNDLE="$HOME/codex-cli-bundle-${CANDIDATE_ID:0:8}.tar.gz"
FILES=$(find probe-results -path '*/work-tmp' -prune -o -type f -path 'probe-results/codex-host-e2e-*/*' \
  \( -name release-records.json -o -name '*-process.json' -o -name '*-primary.json' -o -name observation.json -o -name summary.txt \) -print)
[ -e probe-results/codex-cli-tuple.json ] && FILES="$FILES probe-results/codex-cli-tuple.json"
# shellcheck disable=SC2086
tar -czf "$BUNDLE" .release-candidate.json probe-results/codex-cli-run.log $FILES || exit 1
echo "Bundle: $BUNDLE"
if find probe-results -type d -name work-tmp | grep -q .; then
  echo "Note: a work-tmp folder remained (failed removal). Delete it after checking; it may contain a copy of auth.json."
fi
