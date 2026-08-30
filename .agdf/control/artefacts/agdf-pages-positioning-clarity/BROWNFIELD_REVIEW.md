# Brownfield Review: Sharpen AGDF Pages Positioning

- revision: 2
- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `verified_change`
- required_next_gate: `none`

## Scope And Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: The change refines explanatory copy without changing navigation, capability, primary action, working mode, effective state, activation, blocker or recovery behaviour.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing Owners And Coverage

- `pages/src/data/site.ts` is the single canonical landing-page content owner.
- `pages/scripts/landing-page-test.mjs` is the deterministic validation owner.
- The page already owns the thesis `Agent activity is not delivery progress.` and the single `Approved scope -> evidence -> gate -> transition` control loop.
- The requested category distinction and durable-control explanation are not yet explicit.
- current_coverage: `partially_done`
- reuse_strategy: `extend`

## Baseline Re-evaluation

The former candidate-path conflict is resolved. Copilot delivery was committed as `5b6ec9b`, tagged `agdf-v0.14.0`, followed by version alignment in `67eb3e6`. At baseline `67eb3e6`, both candidate paths are clean. The durable Copilot run still lacks exact UAT approval, but its committed candidate is independently identifiable and no longer shares an uncommitted file baseline with this run.

## Verified Change Selection

- exactly one canonical content owner: `pages/src/data/site.ts`
- allowed source paths: `pages/src/data/site.ts`; `pages/scripts/landing-page-test.mjs`
- prohibited impacts: gate, permission, security, persistence, architecture, API, CLI, runtime, installation, release and host behaviour
- deterministic propagation: not applicable
- deterministic validation: `npm --prefix pages run test:landing`
- baseline commit: `67eb3e6`
- baseline tracked paths: none
- baseline untracked paths: none
- escalation target: `structured_slice`

## Parallel-Structure And Drift Assessment

- Extend only the existing problem description. Do not add a comparison section.
- Preserve the current Hero, seven-section structure and one control-loop model.
- Do not name competitors or claim exclusive ownership of gates, artefacts, review or human approval.
- Keep the distinction bounded to AGDF's primary delivery-control purpose.

## Context Graph And Knowledge Persistence

- context_graph_impact: `none`
- context_graph_refs: none
- context_graph_reconciliation: `not_applicable`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The change clarifies an already-owned public thesis without adding a new architecture, runtime or policy decision.
- memory_target: `scope_artifact`
- memory_reason: The exact approved copy boundary remains specific to this delivery run.
- memory_refs: `.agdf/control/artefacts/agdf-pages-positioning-clarity/UR.md`; `.agdf/control/artefacts/agdf-pages-positioning-clarity/VERIFIED_CHANGE.md`.

## Required Next Step

Create the eligible Verified Change record, implement only the two declared paths, run the focused landing regression and record the exact changed-path snapshot.

