# Brownfield Review: Reliable internal gate continuation and actionable recovery

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
- decision: pass
- current_coverage: partially_done
- reuse_strategy: extend existing dispatch, readiness, interaction and evidence owners

## Run

- run_id: gate-internal-continuation-recovery-20261008-01
- related_ur: .agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-08
- approved_ur_revision: f52446ec-8009-49b6-a297-7089d6b59036
- approved_ur_digest: sha256:47b5049fcdc03dce6c2968e8f972a7122d1be195529d1d7242d09207941d55c1

## Objective

Size the approved outcome: complete already permitted internal prerequisites and QA-revise work without extra user restart prompts; identify exact failures and required actors; prepare version-specific host qualification before the necessary external handoff. Existing approvals, safety boundaries and writers remain authoritative.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Changes visible recovery and continuation states for one delivery capability across preparation, QA-revise, technical failure and external observation; no new approval or host capability.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready
- ux_intent_definition_evidence: .agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01/UX_INTENT_DEFINITION.md; internal analysis complete, no implementation or approval

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; gate-transition, interaction and quality contracts | Internal work and normalized gap ownership already exist; the observed handoffs fail to execute or communicate them | medium |
| Source of truth | Core control evaluation and control-state writers | run-recording.js preserves exact approval/presentation binding; normalized review gaps belong to quality.md | none; preserve |
| Runtime path | skill-dispatch/service.js, delivery-intake.js, prd-definition.js and contract.js | readDefinitionSources conflates missing UX and malformed readiness; QA next-skill routing excludes revise; invocation options are correctly skill-constrained | medium, bounded orchestration correction |
| UI / UX | interaction-presentation.js and locale registry | Canonical actor presentation is not currently conditioned on whether the returned dispatch actually ends the turn | medium, existing presentation owner |
| Persistence / data | Existing run-step, run-update, run-present and run-approve | Exact source and presentation digests already exist; evidence remains run-local | none; no schema or migration |
| Tests / QA | CLI skill-dispatch/function-contract suites, Core interaction and control-state suites | Existing isolated continuation, input rejection and QA-revise cases are reuse inputs; observed chained failure/recovery cases need explicit coverage | medium |
| Release / operations | Existing runtime/package preparation and host qualification | Reference EVIDENCE_RESPONSIVE-03.md shows separate source/package/native evidence planes | low; prepare a bounded evidence handoff, no new installer or coordinated rollout |

Source inspection is current to 2026-10-08. No implementation/test success is claimed. Inspected candidate dispatcher, interaction, plugin metadata and skill paths have no pre-existing working-tree modifications at this review; the repository contains unrelated cockpit/control work that must be preserved.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: Routing and recovery cross existing evaluator, skill and presentation boundaries. Local extension can preserve their authority and storage contracts.
- architecture_evidence: packages/core/lib/skill-dispatch/service.js (source checks and host-action binding); contract.js (declared fields and rejection); packages/core/lib/control-evaluation/gate-check.js (readiness); packages/core/lib/control-state/run-recording.js and run-presentation.js (canonical writes/bindings); plugins/agdf/meta/contracts/quality.md (gap types/routes).
- architecture_missing_evidence: none for proportional routing; exact implementation decisions and regression/installed-host proof belong to SD/TP and execution.
- architecture_next_owner_and_action: PRD defines observable continuation/recovery outcomes; SD maps them onto existing owners without a second scheduler, evaluator or policy table.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: missing prerequisite and authoring syntax share one terminal recovery | readDefinitionSources returns null for missing file or decision field; PRD path emits prd_authoring_inputs_invalid | warn | Existing dispatcher/readiness owner must expose the actual condition and eligible preparation owner; PRD specifies observable distinctions |
| problem: QA-revise continuation is excluded while internal work is permitted | service.js routeNextSkill condition; reference QA addendum identifies evidence_obligation | warn | Reuse quality.md gap classification and current evaluation; SD must distinguish allowed correction, upstream gap and external dependency |
| problem: visible agent-work promise can accompany a terminal host action | bindHostAction and interaction actor rendering; reference conversation | warn | Existing interaction owner aligns wording with actual dispatch result; no second renderer |
| problem: agent invokes undeclared options or writes malformed exact fields | contract.js and ur-readiness/readDefinitionSources; reference conversation | warn | Reuse declared schemas and owner-specific validation; invalid calls remain invalid, corrections bounded |
| problem: adjacent active scopes touch the same owners | Intake-after-UR, intermediate-card, actionable-card and stale-next-step URs | warn | Preserve their scope/approvals; implement only new prerequisite and QA-revise recovery increment; recheck baseline before CD+Tests |

No deliberate debt-retaining trade-off is accepted. The findings are the problems this increment addresses, not unresolved permission or ownership facts preventing preparation. PRD resolves product decisions, SD resolves mechanics, TP binds proof. No independent orchestration state, recovery classifier, approval gate or presentation authority is needed.

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice: one independently acceptable continuation/recovery outcome using current canonical owners, bounded compatible propagation and local failure handling. Quick Task and Verified Change fail their unchanged eligibility because the increment alters product-visible routing/recovery across existing owners. structured_delivery is rejected because no new authority boundary, public input/outcome/schema, persistent format, host integration, coordinated release or non-local runtime cutover is required.
- evidence: .agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01/BROWNFIELD_REVIEW.md#structured-depth-evidence
- transparency_note: Focused PRD, SD and TP are required to distinguish corrective work from unauthorized changes. They do not need a broader architecture replacement or extra user gate.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: quick_task and verified_change are ineligible for this product/routing increment; structured_delivery has no evidenced full-depth trigger
- missing_or_conflicting_facts: none for route selection
- depth_evidence_refs: approved UR; source checks and routing in service.js; exact contract.js schemas; gate-transition.md, interaction.md, quality.md; existing canonical writers; reference responsive evidence

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | Approved UR AC-001 through AC-008 define reliable internal continuation, precise stopping and version-specific external handoff for one delivery capability |
| authority_boundary | pass | Existing Core gate evaluation, normalized gap owners and exact approvals remain unchanged; no new trust or permission source |
| owner_consumer_coordination | pass | Shared Core/CLI/MCP/skill/locale projections use current in-repository contracts and sync owners; no independent consumer cutover |
| full_depth_impacts_absent | pass | Existing six outcome variants, declared inputs and host actions suffice; diagnostic details stay compatible with existing result members; no public schema/CLI flag/approval change, new process, store, host or release behavior is necessary |
| migration_propagation_bounded | pass | Current asset/runtime sync and package checks can propagate compatible source changes; no canonical-data migration or global installation repair |
| failure_recovery_local | pass | Missing authority, malformed/unchanged failures, invalid integrity and inaccessible hosts stop through existing result/owner paths; no autonomous retry service or cross-run mutation |
| independently_acceptable | pass | Fixed pre-PRD and QA-revise cases plus negative boundaries can prove the increment; related runs provide reusable baseline, not prerequisite future fixes or transferred approvals |

Reevaluate depth if design requires new externally consumed outcome/CLI/schema semantics, changed authority, persistent execution, new host capability or coordinated rollout. This evidence does not authorize those extensions.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which observed conditions lead to internal preparation, bounded correction, human decision or external observation? | PRD | revise until product table is resolved |
| How are exact failure evidence and actual stopping/continuation represented through existing result members? | SD | revise before SD presentation |
| How are normalized QA gaps checked without a second mapping or inferred upstream authority? | SD | revise before SD presentation |
| Which fixed chains, baseline counts and installed observation sequence prove the result? | TP | revise before TP presentation |

No new user requirement is needed to draft the PRD. These are owned downstream preparation decisions, not an extra user approval or a missing route fact.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing owners retained; findings and acceptance preparation remain in this run's artefacts.
- memory_target: scope_artifact
- memory_reason: Run-specific cause analysis and routing evidence; no external memory update requested.
- memory_refs: this review, approved UR and reference cockpit evidence

## Next Permissible Step

- next_allowed_action: Record this completed review and structured_slice route together; required UX input is ready. Obtain bound PRD drafting continuation.
- forbidden_until_then: PRD approval without ready inputs; SD/TP/implementation; approval transfer; installation, release or VCS actions.

## Quality Outlook

- quality_outlook: Existing owners, bounded route and UX preparation are evidenced; PRD/SD/TP, implementation, tests, installed-host evidence and QA remain due. No delivery readiness claimed.
