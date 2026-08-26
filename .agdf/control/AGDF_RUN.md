<!-- AGDF LEGACY PROJECTION: NON-AUTHORITATIVE -->
<!-- canonical_source: .agdf/control/runs/activation-diagnosis-determinism/RUN_STATE.md -->
<!-- run_id: activation-diagnosis-determinism -->
<!-- revision_id: 3DFDD78F-4143-4C4B-8311-54B63AED89A0 -->
<!-- sha256: 09b11b1181e327eb5195e348e8d5165969051639e67f6b1b5102222dfeff7563 -->
# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: activation-diagnosis-determinism
- lifecycle: completed
- revision: 5
- revision_id: 3DFDD78F-4143-4C4B-8311-54B63AED89A0
- mode: verified_change
- current_gate: OR
- decision: completed
- owner: agent

## Objective

Make AGDF repository-activation diagnosis deterministic and tool-shell-safe so that an agent in any
context (interactive shell, tool shell, scripted CI, fresh session) can determine AGDF activation
through one canonical, code-owned probe, and skill/contract guidance does not silently rely on
shell-env propagation or relative-path resolution.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The Verified Change is executed, its deterministic activation-diagnosis checks pass, and the Mini-Closeout OR records the final result. |
| What is approved? | `Approval: UR` was provided on 2026-07-20; Brownfield Review selected `verified_change`; the executed record and OR are complete. |
| What is missing? | Nothing within the approved Verified Change scope. |
| What is the next allowed action? | No run work remains; commit, push, PR, release or install-cache mutation requires separate explicit user instruction. |
| What is explicitly forbidden right now? | Automatic commit, push, PR, release, publication or install-cache mutation. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-20 after same-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Review | done | `.agdf/control/artefacts/activation-diagnosis-determinism/BROWNFIELD_REVIEW.md` 2026-07-20; UR premise refined (skills already point to `doctor --json`; gap is missing explicit forbidden-list + boundary). |
| Mode/Slice Decision | verified_change | Scope is single-owner additive guidance + Runtime Integrity assertions; bounded clean-at-baseline; no prohibited impact; deterministic validation; structured escalation target is PRD if pre-implementation Brownfield Analysis finds prose-assertion non-deterministic. |
| PRD | not_applicable | Verified Change path skips PRD/SD/TP/QA/UAT when eligibility is proven; escalates to PRD only if record becomes `escalated`. |
| SD | not_applicable | see PRD |
| TP | not_applicable | see PRD |
| QA | not_applicable | see PRD |
| UAT | not_applicable | see PRD |
| OR | done | `.agdf/control/artefacts/activation-diagnosis-determinism/OR.md` mini-closeout; verified_change record `executed`. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/activation-diagnosis-determinism/UR.md` | approved | Revision 1 approved on 2026-07-20; defines the deterministic-activation-diagnosis scope, non-goals and acceptance signals. UR premise refined in Brownfield Review. |
| Brownfield Review | `.agdf/control/artefacts/activation-diagnosis-determinism/BROWNFIELD_REVIEW.md` | done | 2026-07-20; refined UR premise (gap is missing prohibition, not wrong promotion); Mode/Slice Decision `verified_change`. |
| Verified Change | `.agdf/control/artefacts/activation-diagnosis-determinism/VERIFIED_CHANGE.md` | executed | 2026-07-20; four scoped changes implemented; Runtime Integrity, routing, lifecycle, negative tests, sync idempotence and git diff --check all pass. |
| OR | `.agdf/control/artefacts/activation-diagnosis-determinism/OR.md` | pass | Mini-closeout recorded; delivery closeout offered. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| `evaluateOpenCodeRepositoryActivation` source | `create-agdf/lib/installers/opencode-activation.js` | Activation logic correctness | direct |
| `shell.env` hook implementation | `create-agdf/opencode-plugin.js:48-55` | Env-var propagation contract | direct |
| Observed `<unset>` for `AGDF_CONTROL_DIR` and `AGDF_OPENCODE_REPOSITORY_ACTIVATION` in tool shell | Windows OpenCode Desktop App session, 2026-07-19 | Tool-shell env propagation gap | direct |
| False negative despite existing config.json | Observed glob miss vs absolute read success on Windows | Relative-glob unreliability in tool shells | direct |
| Existing skill references env vars as diagnostic anchors | `plugin/skills/gate-check/SKILL.md`; `plugin/meta/contracts/control-scaffold.md` | Guidance drift to be corrected | direct |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-20 after same-run, same-gate, revision and durable-artefact revalidation. |
| UR | motivated_by | Windows OpenCode Desktop App tool-shell diagnosis gap | Observed env-var `<unset>` plus relative-glob false negative on 2026-07-19 documented in UR section 1. |
| UR | scoped_by | Non-Goals section of UR | Excludes `shell.env` host behavior, schema changes, and VCS/release; keeps scope to AGDF-owned guidance and Runtime Integrity. |
| Brownfield Review | sizes | UR | Refined UR premise: skills already point to `doctor --json`; gap is missing explicit forbidden-list + boundary, not a wrong promotion. |
| Brownfield Review | selects_mode | verified_change | Single-owner additive guidance + Runtime Integrity assertions; bounded clean-at-baseline; no prohibited impact; deterministic validation; structured escalation target PRD. |
| Brownfield Review | cites_prior | `opencode-global-install-visibility/OR.md` Limitations | Prior run already disclosed "Active OpenCode session detection can only be proven from a process that sees the hook-set environment variables." This run extends, does not duplicate. |

## Missing Evidence

None within the approved Verified Change scope. Updating installed plugin versions, host behaviour and
release state remains intentionally outside this run.

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| AGDF tries to "fix" OpenCode host behavior | high; scope creep and unfalsifiable claim | Explicit non-goal: shell.env propagation is OpenCode-owned |
| Runtime Integrity assertions for guidance prose produce false positives | medium; blocks legitimate edits | Brownfield Analysis must validate assertion mechanism |
| Re-scaffolding risk remains for users who follow current guidance | high; data loss in valid `.agdf/control/` | This run's deliverable addresses root cause; disclosure not a fix for past risk |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: none; the invariant is persisted in the canonical skill and runtime contract owners
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: `.agdf/control/artefacts/activation-diagnosis-determinism/OR.md`

## Knowledge Persistence Decision

- memory_target: canonical_runtime_owners
- memory_reason: The "shell-env propagation is not ground truth; canonical CLI probe is the only diagnosis" invariant is reusable across surfaces and future AGDF skills.
- memory_refs: `plugin/skills/gate-check/SKILL.md`; `plugin/meta/contracts/control-scaffold.md`; Runtime Integrity assertions

## Next Step

Lifecycle closeout completed on 2026-08-19. VCS actions (commit, push, PR, release) and install-cache
mutation require separate explicit user instruction. The installed plugin referenced by the original
run remains unchanged until a separate release action.

- next_allowed_action: No run work remains; commit, push, PR, release or install-cache mutation requires separate explicit user instruction.
