#!/usr/bin/env bash
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"
: "${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}"
: "${EVIDENCE_BASE_SHA:?EVIDENCE_BASE_SHA is required}"
: "${EVIDENCE_PATCH:?EVIDENCE_PATCH is required}"

branch=codex/host-compatibility-evidence
gh auth setup-git
git fetch origin main
if [[ "$(git rev-parse origin/main)" != "$EVIDENCE_BASE_SHA" ]]; then
  echo "main advanced; discard this update. The newer main run will refresh evidence."
  exit 0
fi
git checkout --detach "$EVIDENCE_BASE_SHA"
git apply --index "$EVIDENCE_PATCH"

# The publication job accepts only the generated report and immutable fixture observations.
while IFS= read -r -d '' path; do
  case "$path" in
    docs/compatibility/HOST_COMPATIBILITY.md|docs/compatibility/.agdf-compatibility-owned.json|docs/compatibility/evidence/facts.json|docs/compatibility/evidence/snapshot.json) ;;
    *)
      if [[ ! "$path" =~ ^evals/host-compatibility/observations/[a-f0-9]{64}\.json$ ]]; then
        echo "Unexpected evidence update path: $path" >&2
        exit 1
      fi
      ;;
  esac
done < <(git diff --cached --name-only -z)
git diff --cached --check
if git diff --cached --quiet; then
  echo "No evidence changes to publish."
  exit 0
fi

# Capture the remote head before replacing this workflow-owned branch.
previous=$(git ls-remote --heads origin "refs/heads/$branch" | cut -f1)
git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git checkout -B "$branch"
git commit -m 'docs: refresh host compatibility evidence'
git push --force-with-lease="refs/heads/$branch:$previous" origin "HEAD:refs/heads/$branch"

body=$(mktemp)
trap 'rm -f "$body"' EXIT
cat > "$body" <<EOF
Refresh the generated host compatibility report for source commit $EVIDENCE_BASE_SHA.

The workflow reran all 56 isolated adapter scenarios and verified compatibility and community health before publishing this patch. Fixture evidence retains its recorded execution OS and runtime; native host coverage and human UAT remain separate.

Validation: release:prepare, test:host-compatibility, compatibility:check, test:community-health, check:community-health.
EOF
number=$(gh pr list --repo "$GITHUB_REPOSITORY" --head "$branch" --base main --state open --json number --jq '.[0].number // empty')
if [[ -n "$number" ]]; then
  gh pr edit "$number" --repo "$GITHUB_REPOSITORY" --title 'docs: refresh host compatibility evidence' --body-file "$body"
else
  gh pr create --repo "$GITHUB_REPOSITORY" --head "$branch" --base main --title 'docs: refresh host compatibility evidence' --body-file "$body"
fi

# Explicit dispatch starts checks for the token-created branch without an extra PAT or App secret.
gh workflow run agdf-guardrails.yml --repo "$GITHUB_REPOSITORY" --ref "$branch"
