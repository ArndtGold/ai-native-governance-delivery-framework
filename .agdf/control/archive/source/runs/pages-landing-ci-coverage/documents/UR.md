# User Requirements: Pages Landing Test In GitHub Actions

Status: approved
Gate: UR
Date: 2026-08-20
Owner: Arndt Gold

## User Need

Ensure that the existing Pages landing-page regression test runs automatically in the repository's
standard GitHub Actions guardrail workflow instead of relying only on local execution.

## Required Outcome

- The existing `.github/workflows/agdf-guardrails.yml` workflow invokes
  `npm --prefix pages run test:landing` for pull requests and branch pushes.
- A landing-page regression fails the existing `verify` job.
- Existing Pages type/build and public-document checks remain active.
- The change reuses the existing workflow and test command; it creates no parallel workflow or test owner.

## Acceptance Criteria

- `agdf-guardrails.yml` contains an executable invocation of `npm --prefix pages run test:landing`
  after Pages dependencies are installed.
- `npm --prefix pages run test:landing` passes locally.
- `npm --prefix pages run test:public-documents` and `git diff --check` continue to pass.
- The workflow remains valid YAML and retains its existing pull-request and push triggers.

## Non-Goals

- Changing landing-page copy, test assertions or application behavior.
- Creating a new CI workflow or changing the package-publish workflow.
- Commit, push, pull-request, deployment or release actions.

## Constraints

- Preserve unrelated staged and unstaged work.
- Keep the workflow change to the smallest existing-owner extension.
- GitHub-hosted execution remains external evidence until a pushed workflow run exists.

## Approval

Approved with exact `Approval: UR` on 2026-08-20.
