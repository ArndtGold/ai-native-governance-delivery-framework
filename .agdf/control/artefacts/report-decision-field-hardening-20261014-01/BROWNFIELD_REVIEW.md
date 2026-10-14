# Brownfield Review: Authored report result context

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: report-decision-field-hardening-20261014-01
- related_ur: .agdf/control/artefacts/report-decision-field-hardening-20261014-01/UR.md
- current_gate: Brownfield Review
- reviewer: coding agent, repository-source inspection
- reviewed_at: 2026-10-14

## Objective

Implement the approved UR's bounded correction: illustrative or quoted Markdown does not establish a technical report result, while genuine supported authored fields remain compatible. This is preparation, not implementation permission.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: none
- ui_ux_impact_reason: No UI, working mode, interaction, approval formula or recovery capability changes; correction is in the existing report observer.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Authored technical result, not illustrative prose | UR; quality.md Reported Technical Result section | low |
| Source of truth | Shared Core readReportDecision | control-evaluation/report-decision.js; 19 existing cases | low |
| Runtime path | QA registration, QA inspection and closeout | run-artefact-recording.js:47; qa-follow-up.js:68; closeout-readiness.js:48-52 | medium |
| UI / UX | Existing decision/status presentation | No presentation path in requested scope | none |
| Persistence / data | Existing bound reports, seals and approvals | Existing consumers validate exact recorded sources; no schema or approved-source mutation required | none |
| Tests / QA | Reader and integrated closeout tests | report-decision-test.js; run-closeout-command-test.js; structured-flow.test.js | medium |
| Release / operations | Supported local Codex install | Existing generator/assembly/installer; candidate qualification only | low |

QA_REPORT.md places Decision in section 1, while compatible authored reports also use top-level metadata or a dash field. Restricting every result to the document header would break the canonical template. Examples in fenced code are currently indistinguishable from result fields to the whole-text regex. Quoted lines with an explicit greater-than prefix already do not match, but lazy quote continuations can contain unprefixed lines. Indented code usually does not match; lists, HTML and labeled example contexts must be assessed in design rather than assumed safe.

The internal result registrar in control-state/run-steps.js also uses a whole-document regex for authored pass/revise/block/not_applicable results. This necessary-coupled validation touchpoint must be considered under the same approved examples/quotation exclusion; it must retain its existing not_applicable and eligibility rules and must not become a second divergent Markdown interpreter.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: low
- architecture_reason: Shared observer and gate-facing report consumers require compatible interpretation; no owner, public API, approval authority or execution boundary is added.
- architecture_evidence: report-decision.js imports from the three existing consumers; existing QA template and internal registrar noted above.
- architecture_missing_evidence: none for sizing; detailed Markdown context strategy belongs to SD.
- architecture_next_owner_and_action: Existing Core owner; specify authoritative contexts and compatibility in PRD/SD, then regression coverage in TP.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: whole-text regex admits illustrative results | readReportDecision code; previously reproduced fenced-example-only pass | revise | Core: harden one shared observer with explicit contexts and negative cases |
| problem: canonical template has section-level Decision | QA_REPORT.md section 1 | warn | PRD/SD: preserve that genuine field placement |
| problem: internal registrar has a separate report-result regex | run-steps.js internal branch | warn | SD: retain existing result domain and reuse hardened context interpretation for necessary-coupled validation |
| problem: loaded MCP generation differs from installed build | Dispatch runtime 4ade... versus installed cache 628d... | warn | TP: qualify the actual newly installed candidate with identity, not the chat namespace |

No debt is accepted; these are scoped correction and verification obligations.

## Mode / Slice Decision

- decision: structured_slice
- required_next_gate: PRD
- scope_reason: bounded_structured_slice: One compatible correction of authored report context across existing Core consumers; explicit result-context and regression obligations exceed a single-function Quick fix. Reject full delivery because no new authority, public schema, migration, non-local runtime boundary or cross-host rollout is required.
- evidence: This review, approved UR, current reader/consumer source, canonical QA template, existing parser and integrated tests.
- transparency_note: Use focused PRD, SD and TP for result-context semantics and compatibility, then existing QA/UAT/OR. No additional gate is introduced.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none; this corrects internal interpretation of existing authored result semantics, preserves report templates and approval/writer authority, and requires no external cutover.
- rejected_alternative: Quick Task fails the narrow one-function/one-production-file boundary once necessary-coupled internal validation and explicit field context are accounted for. Verified Change is ineligible because the observer is a gate-facing validation path and its candidate file is already untracked at baseline. Full delivery would add artefact depth without an evidenced full-depth effect.
- missing_or_conflicting_facts: none for route selection; SD must resolve concrete Markdown handling before TP.
- depth_evidence_refs: Approved UR; packages/core/lib/control-evaluation/report-decision.js; packages/core/lib/control-state/run-steps.js; packages/core/lib/control-state/run-artefact-recording.js; packages/core/lib/control-evaluation/qa-follow-up.js; packages/core/lib/control-evaluation/closeout-readiness.js; plugins/agdf/control/templates/artefacts/QA_REPORT.md; packages/core/test/report-decision-test.js.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | UR: only authored report fields count; installed qualification gives independent acceptance |
| authority_boundary | pass | Existing Core observer, canonical writers and human approvals retain authority; no new permission or trust owner |
| owner_consumer_coordination | pass | Existing Core consumers; one supported local candidate build; no external shared cutover |
| full_depth_impacts_absent | pass | No API/CLI/schema/approval change, durable migration, execution boundary or cross-host release in scope |
| migration_propagation_bounded | pass | Existing templates retained; normal local generation/install; no historical report rewriting |
| failure_recovery_local | pass | Unconfirmed reports fail closed under existing consumers; source/candidate restoration is local and reversible |
| independently_acceptable | pass | Positive authored-format compatibility and negative examples/quotation cases can be exercised independently |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which existing authored field contexts count while examples and quotations do not? | PRD | revise |
| What shared Markdown/context interpretation handles fences, quote continuation, indentation and examples without a parallel parser? | SD | revise |
| How is legacy internal not_applicable retained while context filtering is shared? | SD | revise |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-specific correction; ownership unchanged. Keep evidence in this Run, no reusable graph node needed.

## Next Permissible Step

- next_allowed_action: Draft focused PRD from the approved UR and this review, resolve before_prd decisions, present exact PRD.
- forbidden_until_then: Implementation, new approval inference, approved report mutation, VCS/release actions.

## Quality Outlook

- quality_outlook: Route evidence complete; detailed behavior/design/test decisions precede implementation. No QA or installed-fix claim yet.
