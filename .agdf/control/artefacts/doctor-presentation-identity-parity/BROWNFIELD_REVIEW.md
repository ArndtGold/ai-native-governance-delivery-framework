# Brownfield Review: Doctor and Presentation Identity-Validation Parity

Mode: post_ur_review
Date: 2026-09-01
Decision: pass
Mode/Slice Decision: structured_slice
Required next gate: PRD
Owner: agent

## Routing Classification

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Deliverable changes deterministic CLI/JSON findings and makes silently dropped cards produce a visible finding or fallback text; no interactive surface, layout or card design changes, and product semantics are unambiguous (fail-closed diagnosis).
- ux_intent_definition_required: not_applicable

## Existing System View

| Concern | Owner | Coverage today |
|---|---|---|
| Doctor run-state content checks | `create-agdf/lib/control-evaluation/doctor.js:97-132` | partially_done — checks `current_gate`, `next_allowed_action`, evidence row; no `run_id` format or `revision_id` check |
| Selected-run content parsing | `create-agdf/lib/control-evaluation/run-state.js` (`readRunState` → `parseControlState`) | partially_done — no Run-Meta identity validation on the content path |
| `revision_id` consumption in gate-check | `create-agdf/lib/control-evaluation/gate-check.js:297` | partially_done — extracted via `extractField`, no finding when missing |
| Identity requirements on presentation side | `create-agdf/lib/interaction-presentation.js:552,631` | fully_done (requirements exist) but enforced silently |
| Renderer failure behavior | `create-agdf/lib/interaction-presentation.js:316-326,693-694` | not_done — bare `null`, `errors` discarded |
| Canonical identity validation | `create-agdf/lib/control-state/run-state-parser.js:28-38` (`RUN_ID_PATTERN`, UUID `revision_id`, codes `AGDF_RUN_ID_INVALID`/`AGDF_RUN_REVISION_ID_INVALID`) | fully_done, but only for canonical `.agdf/control/runs/<id>/` records |
| Renderer consumers | `create-agdf/lib/control-evaluation/gate-check.js:298,335`; `create-agdf/scripts/interaction-presentation-test.js` | complete inventory; only two in-repo consumers plus generated mirror |
| Generated-surface propagation | `create-agdf/scripts/sync-plugin-runtime.js` → `create-agdf/generated/plugins/agdf/runtime/create-agdf/lib/**` (mirrors `doctor.js`, `gate-check.js`, `run-state.js`, `interaction-presentation.js`) | fully_done, deterministic |
| Tests | `test:interaction-presentation`, `test:control-state`, `test:lifecycle`, `test:cli-modularization` (cover `evaluateDoctor` and renderers) | partially_done — no case for content-path identity defects or renderer error surfacing |

## Reuse Strategy

- `extend` `doctor.js` (or `readRunState`) with two identity findings reusing the existing canonical codes `AGDF_RUN_ID_INVALID` and `AGDF_RUN_REVISION_ID_INVALID`; no new code family, no new severity vocabulary.
- `extend` `interaction-presentation.js` so validation errors reach the caller (structured result or error channel) while keeping existing render semantics for valid input; `gate-check.js` maps a failed render to a visible finding/fallback instead of silent `null`.
- Reuse the single existing pattern owner: the authoritative pattern question (canonical `RUN_ID_PATTERN` vs presentation `/^[A-Za-z0-9._-]+$/`) is resolved by importing one shared definition — PRD/SD decide direction; no duplicated constant.
- Reuse existing test scripts as owners for new cases; reuse `sync-plugin-runtime.js` for generated copies; no hand-edits under `create-agdf/generated/`.

## Parallel-Structure Risk

Low if the identity requirement is defined once and consumed by doctor and presentation (UR scope item 4). Introducing a doctor-local second pattern would create exactly the drift this run fixes; the PRD must name the single owner module (candidate: `run-state-parser.js` exporting the pattern/requirements).

## SoT / Product-Semantics Drift

The defect itself is the drift: doctor's verdict ("presentable enough, `warn`") contradicts the presentation contract's hard requirements. No separate product-direction decision is needed beyond the severity choice (`revise` vs `block`) for the two identity findings, which is a PRD-level product decision inside this run's approved UR scope.

## Compact-Path Evaluation (unchanged rules first)

- `quick_task`: ineligible — diff lands in `create-agdf/lib/**` (excluded path) and changes governance-relevant verdict behavior.
- `verified_change`: ineligible — more than one canonical owner file (`doctor.js`, `gate-check.js`, `interaction-presentation.js`, plus test owners) and the change affects gate-relevant verdict behavior (doctor status can move from `warn` to `revise`/`block`), violating the "no gate behavior impact" eligibility condition.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none evidenced
- rejected_alternative: `verified_change` (ineligible per compact-path evaluation above); `structured_delivery` (no evidenced full-depth trigger: no authority/security boundary change, no runtime/persistence/migration impact, JSON schema_version stays 1 with additive findings reusing existing codes, no rollout/cross-host activation beyond the routine deterministic sync, consumers fully inventoried in-repo)
- missing_or_conflicting_facts: none
- depth_evidence_refs: `create-agdf/lib/control-evaluation/doctor.js:97-132`; `create-agdf/lib/interaction-presentation.js:316-326,552,631,693-694`; `create-agdf/lib/control-state/run-state-parser.js:28-38`; `create-agdf/lib/control-evaluation/gate-check.js:297-335`; grep inventory of renderer consumers (gate-check.js, interaction-presentation-test.js, generated mirror); `create-agdf/scripts/sync-plugin-runtime.js`

| Check ID | Result | Evidence |
|---|---|---|
| `coherent_outcome` | pass | One outcome: doctor/presentation identity parity plus visible renderer diagnostics; acceptance boundary is UR §5 signals 1–6. |
| `authority_boundary` | pass | Gate order, approval values and authority model untouched (UR non-goal); identity requirement SoT already exists in `run-state-parser.js`; no new trust/permission boundary. |
| `owner_consumer_coordination` | pass | All renderer consumers are in-repo: `gate-check.js` and `interaction-presentation-test.js`; generated mirror updates via canonical sync; no external cutover. |
| `full_depth_impacts_absent` | pass | No persistence/schema change (`schema_version` stays `1`), findings array is additive with existing codes; no runtime/orchestration change; no release plan beyond normal version flow; cross-host copies are deterministic sync outputs. |
| `migration_propagation_bounded` | pass | Propagation limited to `sync-plugin-runtime.js` regeneration; no data migration; legacy states are diagnosed, not rewritten (UR non-goal). |
| `failure_recovery_local` | pass | Pure functions with deterministic tests; rollback is a local revert of the same files plus re-sync. |
| `independently_acceptable` | pass | Acceptance signals are testable inside the slice (doctor findings for both defects, non-silent renderer outcome); no hidden prerequisite work. |

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Pattern-authority choice (canonical vs presentation pattern) taken implicitly | medium | Explicit PRD decision with one shared definition; divergence itself documented as part of the defect |
| Raised severity newly blocks previously `warn`-passing legacy states | medium | Severity decision (`revise` vs `block`) made in PRD with fail-closed rationale; `run-migrate` named as repair step in the finding |
| Renderer return-shape change breaks a consumer | low | Consumer inventory complete (2 in-repo + mirror); regression via `test:interaction-presentation`, `test:control-state`, `test:lifecycle` |
| Sibling renderers (`renderTaskTargetOrientation`, `renderScopeClassificationCard`) share the silent-`null` defect | low | Scope decision recorded in PRD: in scope only if the same error-surfacing mechanism covers them without extra design |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_required_action: none — the parity invariant will live in the canonical code owners and their tests; no new node created by this review.

## Required Next Step

Draft the PRD for the approved UR scope (pattern authority, finding severity, error-surfacing shape, sibling-renderer scope decision) and request exact `Approval: PRD`.
