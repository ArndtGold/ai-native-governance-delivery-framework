# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: pages-landing-ci-coverage
- lifecycle: completed
- revision: 3
- revision_id: a97a0f0e-5084-451d-b68f-c0bfb606ad23
- mode: quick_task
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Run the existing Pages landing-page regression test in the standard GitHub Actions guardrail job.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The standard PR/push guardrail now runs the existing landing regression; all declared local checks pass. |
| What is approved? | UR approved by exact approval on 2026-08-20; Brownfield Review selects Compact Delivery and OR-lite passes. |
| What is missing? | GitHub-hosted execution remains external evidence until commit and push. |
| What is the next allowed action? | Use delivery closeout only when commit, push or pull-request handoff is explicitly requested. |
| What is explicitly forbidden right now? | Automatic commit, push, PR, deployment and release. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` received from the user on 2026-08-20; durable UR is approved. |
| PRD | missing |  |
| SD | missing |  |
| TP | missing |  |
| QA | missing |  |
| UAT | missing |  |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/pages-landing-ci-coverage/UR.md` | approved | Exact approval received on 2026-08-20. |
| Brownfield Review | `.agdf/control/artefacts/pages-landing-ci-coverage/BROWNFIELD_REVIEW.md` | done | `post_ur_review` passes and selects Compact Delivery. |
| OR | `.agdf/control/artefacts/pages-landing-ci-coverage/OR.md` | done | OR-lite records the one-line workflow extension, passing checks and external hosted-run evidence. |

## Mode/Slice Decision

- decision: `quick_task`
- required_next_gate: none
- scope_reason: One clean canonical workflow owner, one existing deterministic test command, no new product semantics or cross-owner impact; structured paths are unnecessary.
- evidence: `.agdf/control/artefacts/pages-landing-ci-coverage/BROWNFIELD_REVIEW.md`; `.github/workflows/agdf-guardrails.yml`; `pages/package.json`.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| User request | captured_by | UR | `.agdf/control/artefacts/pages-landing-ci-coverage/UR.md` |
| User approval | approves | UR | Exact `Approval: UR` received on 2026-08-20 |
| UR | approved_by | Approval: UR | Exact `Approval: UR` received on 2026-08-20 |
| Brownfield Review | sizes | Mode/Slice Decision | `.agdf/control/artefacts/pages-landing-ci-coverage/BROWNFIELD_REVIEW.md` |
| Quick Task Execution | implements | UR | `.github/workflows/agdf-guardrails.yml` |
| OR | summarizes | Run | `.agdf/control/artefacts/pages-landing-ci-coverage/OR.md` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Existing guardrail workflow | `.github/workflows/agdf-guardrails.yml` | PR/push triggers and current Pages commands | direct repository evidence |
| Existing landing test command | `pages/package.json` | Reusable `test:landing` entry | direct repository evidence |
| Prior approved slice | `.agdf/control/artefacts/agent-skills-conformance-portability/TP.md` | CI workflow work was outside the completed slice | direct approved-scope evidence |
| Pages landing regression | `npm --prefix pages run test:landing` | Existing landing behavior and approved compatibility copy | direct deterministic evidence |
| Pages public documents | `npm --prefix pages run test:public-documents` | Existing public routes and documents | direct deterministic evidence |
| Workflow and diff checks | YAML parse; `git diff --check` | Workflow syntax and patch hygiene | direct deterministic evidence |

## Closeout

- next_allowed_action: Use `delivery-closeout` only when an operative commit, push or pull-request handoff is explicitly requested.
- quality_outlook: Confirm the first GitHub-hosted guardrail run after push; no further repository change is currently indicated.
