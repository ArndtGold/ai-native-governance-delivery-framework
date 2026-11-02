# Brownfield Analysis — Define UX Intent And Route Review Gaps Upstream

- mode: pre_implementation_analysis
- decision: pass
- run_id: prd-ux-intent-requirements
- approved_tp: .agdf/control/artefacts/prd-ux-intent-requirements/TP.md

## Scope And Current Coverage

- current_coverage: partially_done
- reuse_strategy: extend
- The canonical lifecycle already separates post-UR routing, PRD/SD/TP authority, implementation
  reviews and the sole QA decision. It lacks the shared UI/UX impact fields and explicit fidelity
  handoff approved by this run.
- `plugin/meta/agdf-plugin.definition.json` already owns the nine-skill inventory and all generated
  routing consumers derive from `skillSet`; add one entry instead of a parallel registry.
- `plugin/skills/brownfield-analysis/SKILL.md` already owns both post-UR and pre-implementation modes;
  extend its post-UR record instead of adding a Greenfield router.
- `plugin/control/templates/artefacts/PRD.md` is the canonical PRD template and is currently sparse;
  extend it in place. The new UX analysis template remains supporting input and is not recognized by
  the user-gate parser.
- `plugin/skills/task-plan-review/SKILL.md`, `plugin/skills/qa-gate/SKILL.md` and
  `plugin/meta/contracts/quality.md` already provide the review-to-QA chain; add fidelity evidence
  without adding a second review skill or QA decision owner.
- `create-agdf/scripts/sync-package-assets.js`, `create-agdf/lib/scaffold/plan.js`, the eval framework,
  Runtime Integrity and Pages data already own propagation and evidence.

## Owner And Reuse Decisions

| Concern | Existing owner | Decision |
|---|---|---|
| Impact classification and routing placement | `gate-transition.md` plus Brownfield `post_ur_review` | extend; one vocabulary and one router |
| Analytical UX procedure | no current owner | add one canonical bounded skill and help file |
| Durable analysis shape | no current owner | add one non-gate template through existing scaffold/sync owners |
| Product requirements | approved PRD and canonical PRD template | extend; remains sole product authority |
| Fidelity evidence | Task Plan Review | extend; never create requirements or decide QA |
| Final QA decision | QA Gate | extend inputs only; preserve sole decision authority |
| Discovery and routing projection | plugin definition and generated router surfaces | extend canonical inventory, then synchronize |
| Behavioral proof | existing versioned eval corpus and deterministic runner | add three cases and regenerated observations |
| Public evidence | Pages derived data | extend canonical catalogue; keep counts derived |

## Clean Implementation Path

1. Change normative source contracts and the new canonical skill/template first.
2. Extend PRD, Task Plan Review and QA owners without creating a second requirements or decision path.
3. Register the skill once in the plugin definition and propagate only through the sync owner.
4. Add fail-closed behavioral and integrity assertions before regenerating derived surfaces.
5. Update the two explicit `nine native skills` statements found in `create-agdf/README.md`; Pages
   totals remain data-derived.
6. Run focused tests, synchronization twice, package/Pages checks and the aggregate smoke chain.

## Regression And Compatibility

- Preserve `UR -> PRD -> SD -> TP -> QA -> UAT`, all exact approval values and current runtime parsers.
- No data migration, public CLI command or production runtime evaluator is required.
- The new template must be listed in all three existing scaffold arrays and Runtime Integrity expected
  control files, while remaining absent from recognized user-gate artefact types.
- Generated surface prefixes and installed/source layout behavior remain unchanged.
- Evaluation evidence increases from 9 to 10 canonical skills and from 27 to 30 deterministic cases;
  static wording and fingerprints must move atomically.
- Repository checks prove source/package behavior, not authenticated live-host rendering.

## Risks And Controls

- parallel_structure_risk: controlled — one router, one inventory, one PRD authority and one QA owner
  are explicit implementation constraints.
- sot_drift: none found — approved PRD/SD/TP agree with current canonical owners.
- generated_asset_risk: controlled — edit `plugin/` and root eval sources only, then synchronize.
- parser_authority_risk: controlled — supporting UX analysis has no gate/approval field and no parser role.
- visible_state_ownership: applicable to the skill contract and PRD prompts; product/system authority,
  presentation ownership and technical ownership remain distinct.
- ui_monolith_risk: not_applicable — no application UI component or state hook is changed.

## Context Graph

- context_graph_impact: new_node_required
- context_graph_refs: CG-UX-INTENT-BEFORE-PRD
- context_graph_reconciliation: resolved
- context_graph_required_action: create
- context_graph_gate_effect: none
- context_graph_evidence: CG-UX-INTENT-BEFORE-PRD now owns the reusable pre-PRD definition, PRD
  authority, fidelity review and QA-consumption invariant.

## Required Next Step

Implement UXI-T01 through UXI-T12 through the existing owners above, then run mandatory Task Plan,
Clean Implementation and Code reviews before QA.

## Revision 18 Addendum — Normalized Review Gaps

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: none
- scope: implementation preparation for approved UXI-T13..19 only
- evidence: `plugin/meta/contracts/quality.md` already owns UX Fidelity gap semantics;
  `task-plan-review` already consumes four related types; Clean Review and Code Review already own
  durable findings; QA already consumes review evidence; Runtime Integrity, deterministic evals and
  canonical sync are established validation/propagation owners
- current_coverage: partially_done; extend one normative contract and four existing consumers
- reuse_strategy: extend/refactor existing Markdown contracts and eval cases; do not add a skill,
  parser, JSON schema, finding store, CLI command, evaluator or Pages section
- primary_owners: Quality Contract for taxonomy; each review for its own evidence; QA for the final
  decision; `sync-package-assets` for derived surfaces; Runtime Integrity for deterministic drift
- regression_scope: skill behavior/discovery, compact output, Quality Readiness ownership, UX Intent
  Fidelity sentinel semantics, eval fingerprints/observations, generated package parity and smoke
- parallel_structure_risk: pass only if consumer skills reference the Quality Contract and do not
  carry a second complete type-to-route mapping
- visible_state_ownership: not_applicable; no public or host-rendered product behavior changes are planned
- context_graph_impact: update_required
- context_graph_refs: CG-UX-INTENT-BEFORE-PRD
- context_graph_reconciliation: open_gap until UXI-T19
- missing_evidence: implementation, focused negative cases, generated parity and mandatory reviews
- risks: overly terse consumer instructions could produce inconsistent fields; exact output shape and
  adversarial cases must remain local enough to execute while mappings remain single-source
- required_next_step: implement UXI-T13..19 in dependency order, then run mandatory reviews and QA
