# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: doctor-presentation-identity-parity
- lifecycle: active
- revision: 16
- revision_id: d7f79b27-a7d7-491d-9314-576f32ec2af5
- mode: structured_delivery
- current_gate: UAT
- decision: in_progress
- owner: agent

## Objective

Bring `doctor` to parity with the identity requirements the interaction-presentation layer enforces
(`run_id` format, `revision_id` presence) and make renderer validation failures diagnosable instead
of silently collapsing cards to `null`, so a state doctor reports as presentable is actually
presentable and an undeliverable card names its concrete defect.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Code inspection confirms the gap: `evaluateDoctor` checks neither `run_id` format nor `revision_id`; `buildApprovalOrientationSnapshot`/`validateApprovalOrientationSnapshot` require both; `renderApprovalOrientationSnapshot`/`renderOperationalStatusCard` discard validation errors and return bare `null`. |
| What is approved? | `Approval: UR`, `Approval: PRD`, `Approval: SD`, `Approval: TP` and `Approval: QA` accepted on 2026-09-01; Brownfield Review selected `structured_slice`. |
| What is missing? | Bounded UAT observation, then exact `Approval: UAT`. |
| What is the next allowed action? | Perform the bounded UAT observation (fresh doctor and gate-check against a defective legacy state), then request exact `Approval: UAT`. |
| What is explicitly forbidden right now? | QA or release claims before evidence; commit, push, PR without explicit instruction. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Review | done | `.agdf/control/artefacts/doctor-presentation-identity-parity/BROWNFIELD_REVIEW.md` 2026-09-01; existing-owner inventory, compact-path evaluation and Structured Depth Evidence complete. |
| Mode/Slice Decision | structured_slice | Bounded single-outcome parity fix inside `create-agdf/lib/**` with complete in-repo consumer inventory and deterministic tests; `quick_task` and `verified_change` ineligible (excluded code paths, multiple owner files, gate-verdict behavior impact); no evidenced full-depth trigger; primary_reason_code `bounded_structured_slice`; evidence in Brownfield Review §Structured Depth Evidence. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| SD | approved | Exact `Approval: SD` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| QA | approved | Exact `Approval: QA` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation; QA report revision 1 pass. |
| UAT | open | |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/doctor-presentation-identity-parity/UR.md` | approved | Revision 1 approved 2026-09-01; defines doctor/presentation identity-validation parity scope, non-goals and acceptance signals. |
| Brownfield Review | `.agdf/control/artefacts/doctor-presentation-identity-parity/BROWNFIELD_REVIEW.md` | done | 2026-09-01; post_ur_review with routing classification, compact-path evaluation and complete Structured Depth Evidence; Mode/Slice Decision `structured_slice`. |
| PRD | `.agdf/control/artefacts/doctor-presentation-identity-parity/PRD.md` | approved | Revision 1 approved 2026-09-01; encodes single identity owner (DIP-01), parse-boundary validation (DIP-02), `revise` findings with repair step (DIP-03) and caller-side error surfacing without signature breaks (DIP-04). |
| SD | `.agdf/control/artefacts/doctor-presentation-identity-parity/SD.md` | approved | Revision 1 approved 2026-09-01; new shared `run-identity.js` owner, parse-boundary `identity_findings`, exported precondition validators, additive `presentation_diagnostics`, sibling renderers excluded. |
| TP | `.agdf/control/artefacts/doctor-presentation-identity-parity/TP.md` | approved | Revision 1 approved 2026-09-01; nine tasks DIP-T1..DIP-T9 mapped to AC-01..AC-10 with full test plan and negative controls. |
| Brownfield Analysis | `.agdf/control/artefacts/doctor-presentation-identity-parity/BROWNFIELD_ANALYSIS.md` | done | 2026-09-01 pre_implementation_analysis pass (DIP-T1): single regex site confirmed, sync auto-propagation, existing CLI fallback anchor, legacy-template impact and fixture inventory recorded. |
| TP Review | `.agdf/control/artefacts/doctor-presentation-identity-parity/TP_REVIEW.md` | done | 2026-09-01 pass: 8/9 fully_done, DIP-T9 completes with reviews; two disclosed deviations (copilot baseline, fixture repair) and the unit-level AC-04 evidence note. |
| Clean Review | `.agdf/control/artefacts/doctor-presentation-identity-parity/CLEAN_REVIEW.md` | done | 2026-09-01 pass; guard/validator duplication found and removed in place (renderers consume the validators); three justified bounded fallbacks documented. |
| CR | `.agdf/control/artefacts/doctor-presentation-identity-parity/CODE_REVIEW.md` | done | 2026-09-01 pass; backtick-strip parity defect fixed during review; two advisories (extractField section scope, fail-closed locale behavior change) recorded. |
| QA | `.agdf/control/artefacts/doctor-presentation-identity-parity/QA_REPORT.md` | pass | Revision 1, 2026-09-01: all four quality dimensions pass; AC-01..AC-10 evidenced; live-host rendering and pre-existing native-Windows suite failures disclosed as missing evidence, not regressions. |
| CD+Tests | `.agdf/control/runs/doctor-presentation-identity-parity/RUN_STATE.md` | done | DIP-T2..T8 implemented 2026-09-01: `run-identity.js`, parser/presentation single-owner, `identity_findings` + doctor mapping, `presentation_diagnostics` + CLI fallback codes, IPP-1..4 and presentation IPP tests green; sync idempotent; `git diff --check` clean; pre-existing native-Windows failures (lifecycle, cli-modularization, local-validator, runtime-integrity CRLF, package-contents spawn) proven identical on clean main via stash comparison. Deviation: `plugin/meta/copilot-payload-baseline.json` consciously raised to 79 files / 568459 bytes (growth guard), outside TP §3 paths. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Doctor run-state checks limited to `current_gate`, `next_allowed_action`, evidence row | `create-agdf/lib/control-evaluation/doctor.js:97-132` | Missing identity validation in doctor | direct |
| Presentation requires `run_id` pattern and non-empty `revision_id` | `create-agdf/lib/interaction-presentation.js:552,631` | Presentation-side hard requirements | direct |
| Renderers return bare `null`, discarding `errors` | `create-agdf/lib/interaction-presentation.js:693-694,321-326` | Silent card loss without diagnosis | direct |
| Canonical parser validates `RUN_ID_PATTERN` and UUID `revision_id` only on canonical run records | `create-agdf/lib/control-state/run-state-parser.js:28-38` | Validation exists but not on doctor content path | direct |
| `gate-check` extracts `revision_id` without finding when missing | `create-agdf/lib/control-evaluation/gate-check.js:297` | Gap propagates into gate-check evidence | direct |
| UAT observation 2026-09-01: fresh doctor on defective legacy state shows both identity findings with run-migrate step; gate-check blocks with `AGDF_RUN_ID_INVALID`; healthy canonical run renders the status card without diagnostics | live CLI invocation | end-to-end fail-closed diagnosis | direct |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: Bounded single-outcome parity fix inside `create-agdf/lib/**`; compact paths ineligible (excluded code paths, multiple owner files, gate-verdict behavior impact); no evidenced full-depth trigger; all seven bounded-slice checks pass; primary_reason_code `bounded_structured_slice`; rejected alternatives `verified_change` and `structured_delivery`.
- evidence: `.agdf/control/artefacts/doctor-presentation-identity-parity/BROWNFIELD_REVIEW.md` 2026-09-01 §Structured Depth Evidence; renderer-consumer grep inventory; `create-agdf/lib/control-evaluation/doctor.js:97-132`; `create-agdf/lib/interaction-presentation.js:552,631,693-694`.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| UR | motivated_by | Silent card loss despite doctor `warn` verdict | Direct code inspection 2026-09-01 documented in UR section 1 and the Evidence table. |
| UR | scoped_by | Non-Goals section of UR | Excludes schema/gate changes, presentation-requirement relaxation, legacy-state migration and VCS actions. |
| Brownfield Review | sizes | UR | Existing-owner inventory, compact-path evaluation and Structured Depth Evidence in BROWNFIELD_REVIEW.md 2026-09-01. |
| Brownfield Review | selects_mode | structured_slice | All seven bounded-slice checks pass; compact paths ineligible; no full-depth trigger; primary_reason_code `bounded_structured_slice`. |
| PRD | approved_by | `Approval: PRD` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| PRD | derived_from | UR | PRD revision 1 encodes the UR scope items 1-6 as DIP-01..DIP-07 with acceptance criteria AC-01..AC-10. |
| SD | approved_by | `Approval: SD` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| SD | derived_from | PRD | SD revision 1 settles the three open PRD design questions: shared `run-identity.js` owner, additive `presentation_diagnostics`, sibling-renderer exclusion. |
| TP | approved_by | `Approval: TP` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| QA | approved_by | `Approval: QA` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| QA_REPORT | tests | TP | QA report revision 1 verifies AC-01..AC-10 against DIP-T1..DIP-T9 via TP Review coverage, Clean Review and Code Review evidence. |
| TP | derived_from | SD | TP revision 1 maps SD integration points to DIP-T1..DIP-T9 and SD §6 to the executable test plan. |

## Missing Evidence

A reproduced end-to-end case (legacy state without `revision_id` passing doctor with `warn` while the
card drops) as an automated test; to be produced within the run, not required for UR approval.

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Pattern divergence between presentation and canonical parser | medium; wrong authority choice bakes in drift | Brownfield Review decides the authoritative pattern |
| Raised severity blocks previously-passing legacy states | medium; disrupts active runs | Severity decision weighed in Brownfield Review |
| Renderer return-shape change ripples through call sites and generated copies | medium; regression surface | Consumer inventory in Brownfield Review; canonical sync for generated files |

## Next Step

Perform the bounded UAT observation: in a fresh evaluation, run doctor and gate-check against a
defective legacy state (invalid `run_id`, missing `revision_id`) and against a healthy canonical run,
record the observed outputs, then request exact `Approval: UAT` before delivery closeout.

- next_allowed_action: Perform the bounded UAT observation, then request exact `Approval: UAT`.
- quality_outlook: All four quality dimensions pass on the repository evidence plane; remaining openness is live-host rendering of the extended fallback lines and the disclosed pre-existing native-Windows suite failures.
