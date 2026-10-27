# Brownfield Review: Proportionate tests and evidence

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: risk-based-test-strategy-20261027-01
- related_ur: .agdf/control/artefacts/risk-based-test-strategy-20261027-01/UR.md @ sha256:680afdfada2f352cb010db4d0305629c8faa26846e5c5729aa6693b0907c6f0d
- current_gate: Brownfield Review
- reviewer: Codex; source-based cooperative review, not independent assurance
- reviewed_at: 2026-10-27

## Objective

Size the approved central test/evidence-policy change, including effective checks,
finding re-verification, a verification stop condition, discoverable ownership and
consistent routine-pass output. No production policy or executable behavior is changed
by this review.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Resolve conflicting routine-pass text guidance within the existing quality result and interaction owners. No new action, gate, authority, activation, recovery path or primary working mode is introduced. PRD can directly specify concise pass versus actionable revise/block output.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | plugins/agdf/meta/contracts/quality.md | Existing evidence-gap routing and QA boundaries; test sufficiency, effectiveness and stopping rules need explicit policy | high |
| Source of truth | quality.md; .agdf/control/CONTEXT_GRAPH.md; SOT_REGISTRY.md; docs/architecture/ | Runtime manifest names Quality; graph nests its routing authority in UX; registry lists only general runtime contracts | medium |
| Runtime path | SD/TP definition contracts; review skills; qa-gate; agdf-plugin.definition.json | Existing skills load canonical contracts; no additional command, parser or persistence service is needed for this policy slice | low |
| UI / UX | quality.md Quality Readiness Projection and Skill output compaction; qa-gate/SKILL.md | pass projection is both required and prohibited; qa-gate also asks for the projection before detail | low |
| Persistence / data | gate-artifact-preparation.md; control-scaffold.md; interaction.md | Technical receipts, history and presentation binding have existing owners and remain protected | none |
| Tests / QA | canonical package scripts; scripts/ci-plan.mjs; ci-plan-test.mjs; SD/TP/review guidance | CI derives complete partitions and checks inventory equality; new policy must refer to that source rather than replace it | medium |
| Release / operations | .github/workflows/agdf-guardrails.yml; verify-agdf.yml | PR/main coverage already partitioned; no scheduled nightly trigger is declared; this slice does not relocate jobs or qualify installed hosts | none |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: Normative policy and cross-skill source-of-truth ownership are affected. Existing technical owners are preserved; the main risk is introducing parallel quality rules or confusing evidence reuse with approval authority.
- architecture_evidence: approved UR sections 3-6; quality.md; sd-definition.md; tp-definition.md; review/QA skills; context and SoT files; docs/architecture/02-dispatcher.md and 03-agentenkontrolle-zielbild.md.
- architecture_missing_evidence: none for sizing/routing; actual behavior and source propagation remain later TP/QA obligations.
- architecture_next_owner_and_action: PRD defines bounded behavior and acceptance; SD chooses references, consumer integration and proportionate verification within existing owners.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: duplicate quality policy | quality.md is already canonical; SD/TP and reviews have dedicated semantic owners | revise | Extend quality.md; consumers reference it and retain only phase-specific application. PRD/SD own this boundary. |
| problem: misleading pass output | quality.md requires compact pass rows but also prohibits the pass projection; qa-gate guidance requests it | revise | PRD selects one bounded output behavior; SD reconciles existing consumers without creating another presentation owner. |
| problem: invalid evidence reuse or endless rechecking | Existing required-evidence/normalized-finding rules, CI inventory and protected receipts | revise | Apply reuse validity, re-verification and stop conditions through existing planning/review records; leave receipt/history semantics intact. |
| problem: weak quality-contract discoverability | Context Graph headings and UX node; generic Runtime contracts SoT entry; scattered architecture references | revise | Curate graph/registry/architecture references to quality.md; explain consumer and decision roles, without copying the rules. |

These are identified delivery obligations with approved direction, not unresolved
route facts or accepted debt. No deliberate debt retention is proposed.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth — this changes normative shared quality policy across authoring and review consumers. That effect, rather than file/owner count, requires full structured delivery.
- evidence: approved UR; quality.md; modes.md Structured Depth Decision; the owner and policy findings above.
- transparency_note: Quick/Compact and Verified Change are ineligible because normative policy changes. Structured Slice is rejected because policy impact is a decisive full-depth trigger. Keep PRD/SD/TP concise but retain their existing approvals and post-TP analysis/reviews.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: authority_policy_security_depth
- decisive_full_depth_triggers: authority_policy_security_depth; approved UR changes the shared quality-policy obligations, their consumer application and the interpretation of sufficient evidence.
- rejected_alternative: structured_slice; bounded implementation and reversible files do not remove the normative-policy trigger. Quick/Compact and Verified Change are also ineligible for this effect.
- missing_or_conflicting_facts: none for the delivery-depth decision
- depth_evidence_refs: approved UR sections 3-6; plugins/agdf/meta/contracts/quality.md; plugins/agdf/meta/contracts/modes.md; this review Existing-System View and Architecture Impact.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One outcome: sufficient, effective and reusable quality evidence through a discoverable central contract. |
| authority_boundary | fail | New normative quality obligations are introduced even though their existing authoritative owner is retained. |
| owner_consumer_coordination | pass | Known SD/TP/review/QA and documentation consumers; no external coordinated cutover. |
| full_depth_impacts_absent | fail | Normative policy impact is explicitly present; no persistence, protocol or release change is claimed. |
| migration_propagation_bounded | pass | Canonical policy/guidance and derived package propagation; historical approved records remain unchanged. |
| failure_recovery_local | pass | Planned textual changes are reversible; no data migration or destructive cleanup is included. |
| independently_acceptable | pass | This policy slice can be accepted without implementing a nightly scheduler, a new evidence system or a broad runtime enforcement project. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which single routine-pass presentation rule replaces the contradiction? PRD author must make the proposed behavior explicit before presentation. | PRD | warn |
| Which minimal consumer references and source-propagation checks establish consistent application? SD owns this execution/design detail. | SD | warn |
| How are representative policy scenarios checked without inventing a second validator or per-proof registry? SD/TP use existing checks and source review. | SD | warn |

## Context Graph Impact

- context_graph_impact: new_node_required
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-ux-intent-before-prd; proposed general quality-contract node under that same graph; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: open_gap
- context_graph_required_action: create
- context_graph_gate_effect: warning
- context_graph_evidence: Existing node inventory has no general quality-contract node; only the UX node identifies its exclusive gap-routing role. A curated general node is justified by the approved reusable policy/ownership scope, with the UX node linking to it. It will be created only during approved implementation; this review does not mutate the graph.
- memory_target: context_graph
- memory_reason: The policy ownership and consumer boundaries are reusable project knowledge; run-specific review/test evidence remains in this Run.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md; .agdf/control/SOT_REGISTRY.md; plugins/agdf/meta/contracts/quality.md

## Next Permissible Step

- next_allowed_action: Record this review and its structured_delivery route atomically, then author the PRD from the exact approved UR.
- forbidden_until_then: Production contract/template/doc changes, CI restructuring, evidence deletion and implementation before the existing approved TP and prerequisite analysis.

## Quality Outlook

- quality_outlook: Existing owners and the delivery route are clear. No blocking sizing fact remains; PRD must resolve the output choice. Later verification must assess policy meaning, consumer consistency and propagation separately from machine enforcement or live-host claims. No tests, installed-host qualification or independent review were performed at this planning step.
