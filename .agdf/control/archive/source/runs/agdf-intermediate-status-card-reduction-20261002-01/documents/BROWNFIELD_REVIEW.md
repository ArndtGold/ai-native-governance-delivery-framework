# Brownfield Review: Fewer intermediate status cards

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Date: 2026-10-02
Run: agdf-intermediate-status-card-reduction-20261002-01
Reviewer: Codex
Based on: approved UR, presentation 64424942-d080-486f-a42f-63916aaaa071

## Objective

Reduce individual intermediate cards within a permitted step, preserving meaningful changes, decisions, blockers, explicit status and complete control/evidence. This review sizes the work; it authorizes no implementation.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Changes when a bounded interaction communicates ongoing effective state and recovery rather than showing every internal evaluation.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready — UX_INTENT_DEFINITION.md, internal analysis completed 2026-10-02; product authority remains the PRD after approval.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Visible policy | plugins/agdf/meta/contracts/interaction.md | Status Presentation, ready-gate sequence, Task Target Orientation and Scope Classification sections | Sole normative interaction owner; preserve bound decision sequence and explicit status |
| Output discipline | plugins/agdf/meta/contracts/quality.md | Chat Output Discipline already compacts pass reviews and routine writes; Always visible lists gate transitions | Clarify internal-card economy consistently with interaction policy |
| Renderer and languages | packages/core/lib/interaction-presentation.js; plugins/agdf/meta/agdf-interaction-locales.json | Deterministic canonical blocks and localized registry | Reuse; no model-reconstructed cards or second renderer |
| Evaluation | packages/core/lib/control-evaluation/gate-check.js | Canonical status_card and additive status_presentation | Checks and machine/audit projections remain complete |
| Continuation | packages/core/lib/skill-dispatch/service.js | bindHostAction and nonterminal post_ur_review/required_gate_artifact branches | Already continues internal work without mandatory terminal cards; preserve terminal transmission rules |
| Dispatch regression evidence | packages/cli/scripts/skill-dispatch-test.js | read-only terminal result, nonterminal intake and artifact continuation, presentation_required cases | Protect status/terminal/continuation semantics |
| Rendering evidence | packages/core/test/interaction-presentation-test.js | Existing deterministic presentation tests | Reuse all registered-language checks for affected visible cases |
| Existing compaction | .agdf/control/artefacts/agdf-chat-noise-suppression/OR.md | Delivered compact reviews and surface-neutral tool batching; explicitly excluded host block visibility | Reuse existing discipline, avoid recreating its scope |
| Host projections | scripts/sync-package-assets.js; plugins/agdf/skills/gate-check/SKILL.md | Existing projection and focused orchestration | Source and generated instruction consumers must stay coherent |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: interaction-policy boundary and agent/dispatcher/host responsibility
- architecture_reason: Omitting cards must not omit evaluation or override a terminal host_action. The agent controls framework narration; the host controls tool-call block visibility.
- architecture_evidence: service.js nonterminal continuations, bindHostAction terminal verbatim contract; interaction.md canonical rendering ownership; quality.md surface-agnostic discipline.
- architecture_missing_evidence: No measured before/after baseline or post-change installed-host observation yet; these are later validation obligations, not unknown ownership.
- architecture_next_owner_and_action: SD owner Codex defines the minimal change inside existing interaction, output-discipline, renderer and projection owners after PRD approval.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: policy lacks an explicit event boundary for routine intermediate cards | quality.md compaction coexists with interaction.md mandatory projections | Agent may repeat canonical cards without new user value | Define visibility requirements in PRD; reconcile under existing normative interaction owner in SD |
| trade-off: full decision sequence is intentionally retained | interaction.md ready-gate sequence; UR non-goals | Approval points remain comparatively long | Accept this UR boundary; do not redesign approval cards |
| problem: naive suppression of terminal results would violate authority | bindHostAction requires transmit_presentation_verbatim_and_stop | Hidden blockers or unauthorized continuation | Preserve terminal contract; do not truncate dispatcher results in the agent |
| unresolved: observed redundancy depends on concrete workflow and host | No numerical baseline in UR; existing continuation already suppresses routine terminal output | Source changes alone may not reduce actual visible output | Capture a reproducible baseline and visible before/after evidence; separately report unverified hosts |

No newly retained technical debt is proposed. Existing adjacent scopes retain their owners and approvals.

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: the requested product behavior changes normative interaction/output policy consumed across governed agent surfaces. Reject structured_slice because the full-depth normative-policy trigger applies; Quick Task and Verified Change are ineligible for this policy change.
- evidence: This review Existing-System View and Structured Depth Evidence; installed continuation modes contract Structured Depth Decision trigger 1.
- transparency_note: This is an internal routing decision, not another user gate. Full route uses proportionate artefacts for this bounded outcome and does not add unrelated repair work.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- depth_reason_code: authority_policy_security_depth
- depth_rejected_alternative: structured_slice; normative policy changes are an explicit full-depth trigger. Quick Task and Verified Change cannot carry normative interaction-policy changes.
- full_depth_trigger: Authority, policy or security — normative presentation policy changes; security, permission and approval authority themselves remain unchanged.

| Check ID | Result | Evidence |
|---|---|---|
| coherent_outcome | pass | Approved UR sections 2–5 define fewer intermediate cards with unchanged controls |
| authority_boundary | fail | Existing authorities are known, but normative presentation policy changes; thus slice eligibility fails |
| owner_consumer_coordination | pass | Existing interaction, quality, dispatch, renderer and projection consumers identified above; no new authority |
| full_depth_impacts_absent | fail | Normative policy trigger applies; do not claim absence of all full-depth impact |
| migration_propagation_bounded | pass | Existing sync projection; no planned schema/data migration or installation in this scope |
| failure_recovery_local | pass | Preserve current blockers, recovery, fail-closed state and terminal result; source/generated policy can be reverted together |
| independently_acceptable | pass | Card-count comparison and protected decision/status cases can accept this outcome independently of adjacent scopes |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which visible events require cards versus brief progress? | PRD | Derive observable rules from approved UR, including interruption/resumption and explicit status |
| Which existing consumers need policy alignment or executable changes? | SD | Inspect minimal implementation without changing control/approval authority |
| Which workflow shows actual redundant cards before changes? | TP | Record exact baseline; do not assume a synthetic zero-card continuation proves improvement |
| How is actual host evidence separated from deterministic rendering? | TP | Evidence must identify host/session/version and retain unverified lanes |

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-native-interaction-authority; .agdf/control/CONTEXT_GRAPH.md#cg-executable-skill-dispatch-authority
- context_graph_required_action: link
- context_graph_reconciliation: resolved
- context_graph_gate_effect: none
- context_graph_evidence: Existing graph nodes preserve sole presentation ownership and non-authorizing continuation; this review links those owners. No new graph node or approved implementation knowledge is claimed.

## Next Permissible Step

- next_allowed_action: Internal UX Intent Definition, then PRD preparation and bound PRD presentation.
- forbidden_until_then: SD before PRD approval; TP before SD approval; implementation before TP approval and pre-implementation analysis; release claims.

## Quality Outlook

Required later evidence: concrete baseline and reduced card count/length, preserved meaningful events and explicit status, unchanged revision/approval rejection, complete state/evidence, all registered-language rendered cases, source/generated coherence and separately identified actual host observations. No post-change success is claimed here.

## PRD Revision 2 Impact Re-evaluation

Date: 2026-10-02. User requested PRD sharpening following the evidenced missing PRD-derived_from-UR row. Scope adds complete relationship recording and tightly bounded, evidenced clerical correction during permitted internal evidence maintenance; it does not add generic control recovery, change source/approval authority or relax any blocker. UR internal-evidence maintenance and AC-005 remain the source requirement; the new user request concretizes prevention/correction.

Existing affected owners additionally include packages/core/lib/control-evaluation/delivery-map.js (canonical relationship list and satisfied-gate requirement timing), packages/core/lib/control-state/run-recording.js (approval and sealed revision recording), run-steps.js (standard recording operation), run-state-writer.js (revision/locking/publication) and run-revision.js (explicit PRD reopening). These are evidence of existing ownership, not a prescribed implementation.

The current omission was introduced when PRD was linked without its derivation row. run-approve succeeded, then fresh dispatch returned AGDF_DELIVERY_RELATIONSHIP_MISSING because analyzeDeliveryMap requires the relationship only after the corresponding gate is satisfied. UR approval records its own approved_by row; other derivation rows remain supplied by the artefact/control author. These source facts establish the timing/recording gap without claiming that an artefact's header alone proves derivation.

Architecture relevance remains relevant; routing remains structured_delivery with authority_policy_security_depth. Canonical state-writing and local failure/concurrency boundaries now require explicit SD treatment as well. No new owner, schema, installation or non-local recovery is requested. UI/UX remains medium and UX Intent Definition remains required/ready after its revision addendum. No implementation is authorized. SD must decide evidence binding, an indivisible existing write operation, and pre-terminal orchestration; TP must cover exact-binding positives and ambiguous/stale/concurrent/write-failure negatives. No retained debt or new context graph node is proposed.
