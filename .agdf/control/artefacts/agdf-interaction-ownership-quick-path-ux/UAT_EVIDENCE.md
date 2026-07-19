# UAT Evidence: Lean Interaction Ownership and Local Validation

Status: ready_for_decision
Date: 2026-07-19

## User-Visible Acceptance Scope

- Gate-check delegates native-interaction behavior to the canonical interaction contract instead of
  maintaining a second detailed rule set.
- Compact Delivery makes the smallest safe governed path visible without removing durable evidence,
  exact approvals or fail-closed escalation.
- OpenCode installs one global boundary and keeps only focused runtime-contract references in skills.
- Routine OpenCode validation uses the installed exact-version local wrapper without registry access.
- The global OpenCode installer supplies an AGDF-owned ESM boundary and merges missing canonical
  `edit`, `bash`, `question` and skill permissions while preserving explicit user decisions.
- Release-OR rule numbering is sequential and protected by positive and negative integrity checks.

## Repository Evidence

- QA passed and was accepted through exact `Approval: QA` on 2026-07-19 after selected-run,
  same-gate, revision and durable-report revalidation.
- Task Plan Review records 12/12 tasks as fully done.
- Full `create-agdf` and `@agdf/cli` smoke suites, Runtime Integrity positive and negative tests,
  27/27 deterministic skill evaluations, byte-identical builds and package-content checks pass.
- Isolated OpenCode fixtures prove warning-free local validator execution, canonical missing-permission
  merge, preservation of explicit permission choices and fail-closed ownership collision handling.
- `git diff --check` passes.

## Explicit Evidence Limits

This run did not install a future released package into the authenticated OpenCode configuration,
restart an authenticated OpenCode session, observe its live stderr or UI, exercise native Windows,
publish a package, create a release, commit, push or open a pull request. Repository and isolated
fixture evidence therefore proves implementation conformance, not successful execution of those
external lifecycle actions.

The existing unowned `~/.config/opencode/opencode.jsonc` was intentionally not deleted. The installer
must not remove unrelated user configuration merely because another OpenCode configuration file has
precedence.

## Acceptance Checklist

1. Accept the single-owner interaction and OpenCode boundary behavior.
2. Accept Compact Delivery as reduced visible ceremony without weakened gate authority.
3. Accept the exact-version local validator and permission-merge behavior proven by isolated fixtures.
4. Accept that refreshed authenticated OpenCode installation and Windows execution remain unobserved.
5. Confirm that UAT approval permits OR preparation only; release and VCS actions remain separately
   user-controlled.

## Decision Requested

Accept the delivered repository behavior and the disclosed external-evidence limits with exact
`Approval: UAT`, or decline/revise and identify the additional observation required.
