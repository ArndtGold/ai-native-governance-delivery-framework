# Brownfield Review: Sharpen AGDF Pages Positioning

- revision: 1
- mode: `post_ur_review`
- decision: `block`
- mode_slice_decision: `block`
- required_next_gate: `none`

## Scope And Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: The change refines explanatory copy without changing navigation, capability,
  primary action, working mode, effective state, activation, blocker or recovery behaviour.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing Owners And Coverage

- `pages/src/data/site.ts` is the canonical landing-page content owner.
- `pages/scripts/landing-page-test.mjs` is the deterministic first-reader regression owner.
- The current page already owns the approved thesis `Agent activity is not delivery progress.` and
  the single `Approved scope -> evidence -> gate -> transition` control loop.
- The requested distinction is not yet stated explicitly.
- Reuse strategy: `extend` the existing problem description and existing test owner.
- Current coverage: `partially_done`.

## Blocking Brownfield Conflict

Both candidate paths are already modified by the active
`agdf-copilot-plugin-integration` run, whose QA revision 2 is approved and whose current gate is UAT.
Changing either path now would alter that run's tested and awaiting-acceptance candidate after QA.
The new copy therefore cannot be implemented in the shared worktree without invalidating or
conflating the existing run's evidence boundary.

## Parallel-Structure And Drift Assessment

- No second landing-page owner, section or comparison model is permitted.
- No product-semantics drift is accepted beyond the approved UR wording.
- The new run remains separate from Copilot installation and compatibility scope.
- No Context Graph node is required while implementation is blocked.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: `complete`
- primary_reason_code: `depth_facts_conflicting`
- decisive_full_depth_triggers: none
- rejected_alternative: `quick_task` is rejected while the two candidate owners are dirty inside an
  active QA-approved run; `verified_change` is ineligible for the same baseline reason.
- missing_or_conflicting_facts: ownership is known, but the current candidate-path baseline belongs
  to an active run awaiting UAT.
- depth_evidence_refs: `git diff -- pages/src/data/site.ts pages/scripts/landing-page-test.mjs`;
  `.agdf/control/runs/agdf-copilot-plugin-integration/RUN_STATE.md` revision 14.

| Bounded-slice check | Result | Evidence |
|---|---|---|
| `coherent_outcome` | pass | One bounded public positioning clarification with explicit acceptance criteria. |
| `authority_boundary` | pass | `site.ts`, the approved UR and human approval remain the known owners. |
| `owner_consumer_coordination` | block | Candidate paths currently carry an unaccepted Copilot-run delta. |
| `full_depth_impacts_absent` | pass | No runtime, policy, persistence, API, CLI, release or cross-host behaviour changes. |
| `migration_propagation_bounded` | pass | One content owner and one deterministic Pages regression owner. |
| `failure_recovery_local` | pass | The copy-only change is locally reversible after a clean baseline exists. |
| `independently_acceptable` | block | Acceptance cannot currently be separated from the Copilot UAT candidate in this worktree. |

## Context Graph And Knowledge Persistence

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The approved scope introduces no reusable architecture, runtime or policy
  decision while implementation is blocked.
- memory_target: `scope_artifact`
- memory_reason: The approved wording and overlap finding are local to this delivery scope.
- memory_refs: `.agdf/control/artefacts/agdf-pages-positioning-clarity/UR.md`;
  `.agdf/control/artefacts/agdf-pages-positioning-clarity/BROWNFIELD_REVIEW.md`.

## Required Next Step

Resolve the candidate-path evidence boundary first. Complete or explicitly reopen the Copilot run,
then establish a non-conflicting baseline and repeat this Brownfield Review. Do not edit the Pages
owners before that re-evaluation.

