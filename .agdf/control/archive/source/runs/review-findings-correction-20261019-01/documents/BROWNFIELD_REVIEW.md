# Brownfield Review: Detect invalid review finding rows at recording and correct them at OR

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: review-findings-correction-20261019-01
- related_ur: .agdf/control/artefacts/review-findings-correction-20261019-01/UR.md (Approval: UR, revision 4)
- current_gate: Brownfield Review
- reviewer: Claude Code (agent), cooperative local review
- reviewed_at: 2026-10-19

## Objective

Size and route D5: normalized review finding rows are validated only at closeout, after every human approval, and a run at OR has no way to correct a recorded review. Two runs are stuck: `core-approval-lock-defects-20261017-01` (this branch) and `mcp-ergonomics-baseline-20261016-01` (main checkout, owner-recovered after merge).

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: Existing rejection results gain a more precise reason and recovery text; no new surface, interaction or wording outside the existing diagnostic channel.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Quality contract, section Normalized Review Gaps (`plugins/agdf/meta/contracts/quality.md`); review skills `task-plan-review`, `clean-implementation-review`, `code-review`, `qa-gate` | The contract forbids `none` in a normalized finding row and requires one executable `required_next_step`; the skills defer to the contract | Unchanged contract; enforcement moves earlier |
| Source of truth | `normalized-gaps.js` (`validNormalizedGap`, `declaredRoutes`); `qa-follow-up.js` (`inspectQaReports`, table parsing) | `validNormalizedGap` returns only a boolean; the table parser lives inside `inspectQaReports` | Extract one shared row inspector with field-level diagnostics; no second validator |
| Runtime path | `run-steps.js` (`recordRunStepLocked`: `internal`, `review`, `artefact`, `closeout`); `run-artefact-recording.js` (QA report); `run-operation-proof.js` (`internalStepEligibility`, D4 late path) | Recording reads the source and checks only the decision; closeout calls `inspectQaReports(..., 'pass')` after readiness | Early check at recording; correction branch in eligibility; closeout message names the path |
| Approval integrity | `presentation-decision.js` (`approvedMaterialFindings`, `approvalMaterialTypes`); `evidence-bindings.js` (`bindingSourceAssociation`, `evidenceApplicability`); `run-state.js` | QA and UAT approval receipts bind the exact review digests; the QA evidence binding binds them too; D4 added a narrow exception for unseen reviews | A corrected review must keep both approvals and the QA association valid without weakening any other change |
| Persistence / data | Run Operations receipts (`run-operations.js`, strict `exactObject` schema), Approval Operations, Evidence Bindings, owned outputs with seal | A new receipt field would make runs unreadable for older runtimes | Derive the correction proof from existing receipts; no schema change |
| Tests / QA | `approval-chain-defects-test.js` (D4 harness with QA and UAT approvals), `run-closeout-command-test.js`, `qa-deviation-acceptance-test.js`, `backlog-work-summary-test.js`, CLI `cli-gate-scenarios-test.js`, `tp-clarification-test.js` | Several fixtures author normalized rows; no direct unit test of `validNormalizedGap` or `inspectQaReports` exists | Fixture fallout possible from the earlier check; add direct tests |
| Release / operations | Installed plugin runtime 0.14.5; Copilot payload baseline; deterministic eval fingerprints; host-compatibility evidence | Runtime code growth changed the payload and evidence in the D1 to D4 run | Re-pin and re-record through the existing tools at the end |

## Architecture Impact

- architecture_relevance: `relevant`
- architecture_impact: `low`
- architecture_reason: The change stays inside existing Core owners: one validator gains diagnostics and new callers, one eligibility branch is added, and the approval-material and association checks gain a receipt-derived exception analogous to D4. No new command, schema, package boundary or host behaviour.
- architecture_evidence: `normalized-gaps.js` lines 18-25; `qa-follow-up.js` lines 25-80; `run-steps.js` lines 205-240 and 305-330; `run-operation-proof.js` lines 41-65; `presentation-decision.js` lines 74-103; `evidence-bindings.js` lines 74-110; `run-operations.js` lines 14-44.
- architecture_missing_evidence: `none` for routing. How approvals recognise a correction and the exact eligibility conditions are SD decisions.
- architecture_next_owner_and_action: SD decides the shared row inspector, the correction eligibility and the receipt-derived correction proof; TP plans the two acceptance cases and the negative cases.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: validation exists only at closeout | `inspectQaReports` is the only caller of `validNormalizedGap`; recording checks only the decision | `revise` | Call the same inspector at recording; no second rule set |
| problem: no correction after UAT | `internalStepEligibility` refuses after QA approval; `sourceRevisionBoundary` refuses after UAT approval | `revise` | One narrow eligibility branch at OR for recorded reviews with invalid rows |
| problem: re-recording changes the digests that QA and UAT approvals and the QA binding saw | `approvedMaterialFindings`, `bindingSourceAssociation` | `revise` | Exempt exactly a proven correction, derived from the existing step receipts, like the D4 unseen-review exception |
| risk: a correction proof stored in a new receipt field | `validRecord` uses `exactObject` | `warn` | Do not change the receipt schema |
| risk: a second table parser or validator | the parser is inside `inspectQaReports` | `warn` | Extract it once and reuse it from closeout, QA follow-up and recording |
| trade-off: the earlier check refuses sources that recorded without error before | review skills show the table but rely on the contract for values | `warn` | Refusal names the finding, the field and the expected value |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: bounded_structured_slice. One defect class in existing Core recording, eligibility, approval-material and association owners, with two concrete stuck runs as reproduction. It touches approval integrity, so it needs explicit acceptance criteria and an SD decision, but no new authority, schema or external contract.
- evidence: this review; UR revision 4; source references in Existing-System View; Structured Depth Evidence below.
- transparency_note: PRD and SD stay at slice depth: criteria for detection, correction, approval validity, refusal message and the two acceptance cases; SD decides the inspector, the eligibility conditions and the correction proof.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `bounded_structured_slice`
- decisive_full_depth_triggers: none
- rejected_alternative: `structured_delivery` — no new authority, persistence schema, external contract, release or cross-host effect; the correction keeps every existing approval semantics and adds no command. `quick_task` — the change alters what keeps a human approval valid, which needs approved acceptance criteria and a design decision.
- missing_or_conflicting_facts: none
- depth_evidence_refs: Existing-System View rows; Architecture Impact evidence; UR sections 3 to 7.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | `pass` | One outcome: invalid finding rows surface at recording, and stuck runs can close without renewed approvals. |
| authority_boundary | `pass` | Approvals keep their meaning; the correction can change neither a decision nor a finding classification. |
| owner_consumer_coordination | `pass` | Consumers are in-repository recording, gate policy, closeout and status surfaces; the second stuck run is recovered later by its owner with the released runtime. |
| full_depth_impacts_absent | `pass` | No receipt, approval or binding schema change; no public command or external API change. |
| migration_propagation_bounded | `pass` | Propagation only through the generated runtime copies; no data migration; existing runs are read unchanged. |
| failure_recovery_local | `pass` | Earlier refusals fail closed with precise recovery; a refused correction leaves the run unchanged. |
| independently_acceptable | `pass` | Detection and correction each have their own tests and acceptance signals. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Exact eligibility for a correction (gates, review types, decision and classification equality, alias rows) | `SD` | `revise` |
| How QA and UAT approvals and the QA association recognise a correction without a receipt schema change, and how older runtimes read a corrected run | `SD` | `revise` |
| Which recordings run the early check (internal reviews, quick-task review step, QA report) and the refusal shape | `PRD` | `warn` |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: The fix refines the control-state invariants recorded for the D4 late-review rule; closeout adds one entry to the existing node.

## Next Permissible Step

- next_allowed_action: Draft the PRD at slice depth for the approved UR.
- forbidden_until_then: SD, TP, implementation and code changes before the PRD is approved.

## Quality Outlook

- quality_outlook: Main risks are keeping the correction narrow enough that it cannot launder other evidence changes, and fixture fallout from the earlier check; both are addressed by reusing the existing validator and receipt history and by explicit negative tests.
