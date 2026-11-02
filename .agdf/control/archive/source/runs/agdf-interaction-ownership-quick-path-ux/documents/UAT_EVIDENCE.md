# UAT Evidence: Lean Interaction Ownership and Local Validation

Status: approved
Date: 2026-07-19

Exact `Approval: UAT` accepted on `2026-08-19` after selected-run, same-gate and Revision 21
revalidation, with the released-package, authenticated-host and Windows evidence limits retained.

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

## Revision Request — 2026-07-19

UAT identified that the operational status data was deterministic while the gate-check skill still
permitted agent-side Markdown reconstruction. Acceptance is withdrawn until one code-owned
operational projection is consumed verbatim by the skill and CLI and the refreshed QA evidence passes.

## Revision Resolution — 2026-07-19

- Refreshed QA passed and was accepted through exact `Approval: QA` after selected-run, same-gate,
  revision-20 and durable-report revalidation.
- `gate-check --json` now exposes immutable additive `status_presentation` with run, revision, gate
  and locale identity; `--status-card` and gate-check skills consume its Markdown verbatim.
- The former skill table and private CLI field-selection path were removed. Runtime Integrity rejects
  reconstruction, and missing presentation returns a failing CLI exit status.
- The primary card remains compact; complete raw evidence stays in unchanged `status_card` JSON.
- Source/runtime/package tests pass, but the installed 0.10.2 plugin remains unchanged. Live
  consumption of this unreleased projection therefore remains explicitly unobserved.

The revision request is resolved. UAT may now accept the refreshed repository behavior and its
disclosed release/install evidence boundary.
