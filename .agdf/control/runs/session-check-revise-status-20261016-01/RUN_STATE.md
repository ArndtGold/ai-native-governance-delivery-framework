# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: session-check-revise-status-20261016-01
- lifecycle: completed
- revision: 7
- revision_id: 7f8b5990-b0c5-4afa-86ff-112cb6239a71
- content_seal: sha256:045be43f69242f4882bc380811dfb528fe39f1a934e59b1c1a840dc82afc47ca
- approval_seal: sha256:373d94ce83a790ce98087cfd0c3922f00592f846a52335060cf07046ef8c92a3
- updated_at: 2026-10-16T06:24:24.555Z
- mode: quick_task
- current_gate: OR
- decision: completed
- owner: agent

## Objective

A session started in a repository whose doctor status is `revise` shows `automatic_check.status: "revise"`; every doctor status is passed through unchanged, and only unexpected values fall back to `unknown`.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Quick task delivered; OR-lite at `.agdf/control/artefacts/session-check-revise-status-20261016-01/OR.md`. |
| What is approved? | Approval: UR |
| What is missing? | No approval is pending. |
| What is the next allowed action? | Run completed; prepare a VCS handoff only when explicitly requested. |
| What is explicitly forbidden right now? | repeat completed Run work; perform VCS or release actions automatically |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` · 2026-10-16 · revision 2 · `.agdf/control/artefacts/session-check-revise-status-20261016-01/UR.md` sha256:93ef49373831267e · presentation 7e11d610-1bfc-4f7b-8dcb-abcfb7adbd3a sha256:9d80190b8c7fea8a311e16c0de353834454a9476067fefc9b20bfa8917fc09ad |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/session-check-revise-status-20261016-01/UR.md` | approved |  |
| Brownfield Review | `.agdf/control/artefacts/session-check-revise-status-20261016-01/BROWNFIELD_REVIEW.md` | done |  |
| Verified Change |  | missing |  |
| PRD |  | missing |  |
| SD |  | missing |  |
| TP |  | missing |  |
| Brownfield Analysis |  | missing |  |
| CD+Tests |  | missing |  |
| CR |  | done | Code Review pass |
| QA |  | missing |  |
| OR | `.agdf/control/artefacts/session-check-revise-status-20261016-01/OR.md` | done |  |

## Mode/Slice Decision

- decision: quick_task
- required_next_gate: Quick Task Execution
- scope_reason: One-line allow-list correction in the existing session-check template plus a regression test; no new product semantics, architecture, policy, persistence or contract expansion; CR remains mandatory.
- evidence: .agdf/control/artefacts/session-check-revise-status-20261016-01/BROWNFIELD_REVIEW.md

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | `Approval: UR` · 2026-10-16 · revision 2 · `.agdf/control/artefacts/session-check-revise-status-20261016-01/UR.md` sha256:93ef49373831267e · presentation 7e11d610-1bfc-4f7b-8dcb-abcfb7adbd3a sha256:9d80190b8c7fea8a311e16c0de353834454a9476067fefc9b20bfa8917fc09ad |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Run creation | run-create | Control initialization | direct |
| UR draft | `.agdf/control/artefacts/session-check-revise-status-20261016-01/UR.md` | problem, goal, scope and acceptance signals | direct |
| Brownfield Review | `.agdf/control/artefacts/session-check-revise-status-20261016-01/BROWNFIELD_REVIEW.md` | Mode/Slice Decision `quick_task` | direct |
| .agdf/control/artefacts/session-check-revise-status-20261016-01/CD_TESTS.md | agent | quick task implementation and checks | direct |
| Code Review | .agdf/control/artefacts/session-check-revise-status-20261016-01/CODE_REVIEW.md | decision pass: allow-list equals doctor status contract; consumers unaffected; budgets held; red-green regression test; pinned counts replaced during review | direct |
| OR-lite | `.agdf/control/artefacts/session-check-revise-status-20261016-01/OR.md` | quick task closeout | direct |

## Closeout

- next_allowed_action: Run completed; prepare a VCS handoff only when explicitly requested.
- quality_outlook:
