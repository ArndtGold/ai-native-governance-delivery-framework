# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: install-repair-symlink-eperm-20261008-01
- lifecycle: completed
- revision: 6
- revision_id: 559d5ea3-c3a1-47ef-8a63-2c3d50cb7994
- content_seal: sha256:dd94c17aa261e5328d59c9baa91b2047e79d65f67746f3c54d2a020a6ef303eb
- approval_seal: sha256:f267638f89b133706131eb0cd4a79b24d7e1a11ca73f2e5c6d65191b48f2a1bd
- updated_at: 2026-10-08T11:40:55.395Z
- mode: quick_task
- current_gate: OR
- decision: completed
- owner: agent

## Objective

Describe the trustworthy outcome.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Quick task delivered; OR-lite at `.agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/OR.md`. |
| What is approved? | Approval: UR |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Use delivery closeout only when an operative VCS handoff is explicitly requested. |
| What is explicitly forbidden right now? | repeat Quick Task execution; commit, push, open PR or release automatically |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-08 · revision 3 · `.agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/UR.md` sha256:e4da77f94e037c08 · presentation ddce90bd-8d79-4b24-81a4-2f23c4c650d8 sha256:c4f4a71f9e95669c8b0891cc356ea2b7b61f5c64ecadf9266eb57ef5ad77a376 |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD |  | missing |  |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR |  | done | Code Review pass |
| QA |  | missing |  |
| OR | `.agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/OR.md` | done |  |

## Mode/Slice Decision

- decision: quick_task
- required_next_gate: Quick Task Execution
- scope_reason: Narrow local test-harness fix in one file (install-control-repair-test.js); no product semantics, architecture, policy, persistence or contract impact; Code Review stays mandatory
- evidence: .agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-08 · revision 3 · `.agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/UR.md` sha256:e4da77f94e037c08 · presentation ddce90bd-8d79-4b24-81a4-2f23c4c650d8 sha256:c4f4a71f9e95669c8b0891cc356ea2b7b61f5c64ecadf9266eb57ef5ad77a376 |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `quick_task` | direct |
| Code Review | code-review of packages/cli/scripts/install-control-repair-test.js | decision pass: Guard limited to win32 plus EPERM and rethrows every other error; only the symlink-dependent steps of the source-link and linked cases are skipped with a logged SKIPPED reason; the original-file assertion still runs; production repair logic unchanged; mirrors control-command-test.js SCN-011 and symlinkOrSkip | direct |
| OR-lite | `.agdf/control/artefacts/install-repair-symlink-eperm-20261008-01/OR.md` | quick task closeout | direct |

## Closeout

- next_allowed_action: Use delivery closeout only when an operative VCS handoff is explicitly requested.
- quality_outlook:
