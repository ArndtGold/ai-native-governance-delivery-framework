# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: pre-decision-status-card-visibility
- lifecycle: active
- revision: 10
- revision_id: f262782a-4aff-4c1f-96c3-c0bffbcedaaf
- mode: structured_delivery
- current_gate: CD+Tests
- decision: in_progress
- owner: agent

## Objective

Ensure every ready-gate approval request is preceded by, or visibly offers, the full canonical
operational Run Status Card, so users decide with complete authority context (path, allowed,
forbidden, blocker, quality outlook) without weakening exactly-once or non-authorizing semantics.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The interaction contract's approval sequence replaces the full status card with the compact projection; over a gate-to-gate run the user almost never sees the full card at decision time (observed 2026-09-01, `doctor-presentation-identity-parity`). |
| What is approved? | `Approval: UR`, `Approval: PRD`, `Approval: SD` and `Approval: TP` accepted on 2026-09-01; Brownfield Review selected `structured_slice`. |
| What is missing? | CD+Tests evidence for PDV-T2..PDV-T7, then reviews and QA. |
| What is the next allowed action? | Implement PDV-T2..PDV-T7 with tests and record CD+Tests evidence. |
| What is explicitly forbidden right now? | QA or release claims before evidence; commit, push, PR without explicit instruction. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| Brownfield Review | done | `.agdf/control/artefacts/pre-decision-status-card-visibility/BROWNFIELD_REVIEW.md` 2026-09-01; owner inventory, first-visible-line conflict named, compact-path evaluation and Structured Depth Evidence complete. |
| Mode/Slice Decision | structured_slice | Bounded presentation-sequence change across contract, skill text, envelope code and tests with all consumers in-repo; compact paths ineligible (excluded paths, multiple owners, user-visible behavior); no full-depth trigger; primary_reason_code `bounded_structured_slice`. |
| PRD | approved | Exact `Approval: PRD` accepted on 2026-09-01 via native gate question for revision 1 after same-run, same-gate, revision and durable-artefact revalidation. A premature `Approval: PRD` given before the artefact existed had been rejected fail-closed. |
| SD | approved | Exact `Approval: SD` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| TP | approved | Exact `Approval: TP` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| QA | open | |
| UAT | open | |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/pre-decision-status-card-visibility/UR.md` | approved | Revision 1 approved 2026-09-01; defines pre-decision status-card visibility scope, non-goals and acceptance signals. |
| Brownfield Review | `.agdf/control/artefacts/pre-decision-status-card-visibility/BROWNFIELD_REVIEW.md` | done | 2026-09-01 post_ur_review; Mode/Slice Decision `structured_slice`; PRD must decide always-render vs visible offer and the decision-title placement. |
| PRD | `.agdf/control/artefacts/pre-decision-status-card-visibility/PRD.md` | approved | Revision 1 approved 2026-09-01; decides always-render (offer rejected), fixes sequence compact → full card → transition card → interaction, keeps decision title first and scopes the once-only rule to the snapshot blocks. |
| SD | `.agdf/control/artefacts/pre-decision-status-card-visibility/SD.md` | approved | Revision 1 approved 2026-09-01; full card rendered from `status_presentation` outside the untouched snapshot, envelope as single composition point, diagnostics-based degradation, contract/skill/integrity wording amendments. |
| TP | `.agdf/control/artefacts/pre-decision-status-card-visibility/TP.md` | approved | Revision 1 approved 2026-09-01; eight tasks PDV-T1..PDV-T8 mapped to AC-01..AC-09 with test plan and negative controls. |
| Brownfield Analysis | `.agdf/control/artefacts/pre-decision-status-card-visibility/BROWNFIELD_ANALYSIS.md` | done | 2026-09-01 pre_implementation_analysis pass (PDV-T1): no integrity phrase to swap (add-only), smoke-test envelope count 2→3 disclosed as deviation, envelope unit fixtures need `status_presentation`, shared uncommitted `gate-check.js` regions disclosed. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Approval-time replacement of the full card is contract-mandated | `plugin/skills/gate-check/SKILL.md` §Output; `plugin/meta/contracts/interaction.md` approval sequence | Current designed behavior | direct |
| Full card appeared once in a complete six-gate run; user asked twice why | Session observation 2026-09-01, run `doctor-presentation-identity-parity` | User-visible gap at decision time | direct |
| Compact projection lacks path, forbidden actions, blocker and quality outlook | `APPROVAL_SEQUENCE` blocks in `create-agdf/lib/interaction-presentation.js` vs `renderOperationalStatusCard` fields | Missing decision context | direct |

## Missing Evidence

Design-level comparison (always-render vs visible offer) with chat-noise assessment; produced in
Brownfield Review, not required for UR approval.

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Reintroducing ceremony the compact design removed | medium | Brownfield Review weighs always-render vs localized offer |
| Sequence validators and envelope tests pin the three-block shape | medium | Scope item 4/5; canonical sync for mirrors |
| Two blocks claiming semantic id `run_status_card` | medium | Naming decision in SD; single semantic owner preserved |

## Mode/Slice Decision

- decision: `structured_slice`
- required_next_gate: PRD
- scope_reason: Bounded presentation-sequence change (contract wording, skill text, envelope rendering, tests, optional one locale key) with one coherent outcome and all consumers in-repo; compact paths ineligible (excluded paths, multiple owners, user-visible behavior); no evidenced full-depth trigger; primary_reason_code `bounded_structured_slice`; rejected alternatives `verified_change` and `structured_delivery`.
- evidence: `.agdf/control/artefacts/pre-decision-status-card-visibility/BROWNFIELD_REVIEW.md` 2026-09-01 §Structured Depth Evidence; `plugin/meta/contracts/interaction.md:141-158`; `create-agdf/lib/interaction-presentation.js:8,635,670`.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| UR | motivated_by | Full status card appeared once in a six-gate run; user asked twice | Session observation 2026-09-01 documented in UR §1 and the Evidence table. |
| UR | scoped_by | Non-Goals section of UR | Excludes gate/approval-value changes, card layout changes, status-only reporting and VCS actions. |
| Brownfield Review | sizes | UR | Owner inventory and Structured Depth Evidence in BROWNFIELD_REVIEW.md 2026-09-01. |
| Brownfield Review | selects_mode | structured_slice | All seven bounded-slice checks pass; compact paths ineligible; no full-depth trigger. |
| PRD | approved_by | `Approval: PRD` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| PRD | derived_from | UR | PRD revision 1 encodes the UR scope as PDV-01..PDV-06 with AC-01..AC-09 and decides always-render over the rejected offer variant. |
| SD | approved_by | `Approval: SD` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| SD | derived_from | PRD | SD revision 1 resolves PRD §7: plain separator, envelope composition outside the untouched snapshot, contract/skill/integrity amendments together. |
| TP | approved_by | `Approval: TP` | Exact approval provided on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation. |
| TP | derived_from | SD | TP revision 1 maps SD §4 integration points to PDV-T1..PDV-T8 and SD §6 to the executable test plan. |

## Next Step

Implement PDV-T2..PDV-T7 inside the TP §3 allowed paths (plus the disclosed `smoke-test.js`
deviation), run the test plan and record CD+Tests evidence before reviews and QA.

- next_allowed_action: Implement PDV-T2..PDV-T7 with tests and record CD+Tests evidence.
- quality_outlook: Contract, skill text and code-owned rendering must end up describing one identical sequence; main design tension is decision context vs chat noise.
