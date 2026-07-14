# Brownfield Analysis

## Analysis Meta

- mode: `pre_implementation_analysis`
- decision: `pass`
- artefact: `.agdf/control/artefacts/verified-change-path/BROWNFIELD_ANALYSIS.md`
- related_tp: `.agdf/control/artefacts/verified-change-path/TP.md`

## Verified Owners And Reuse Path

| Area | Verified owner | Reuse decision |
|---|---|---|
| Canonical policy | `plugin/meta/agdf-runtime-contract.md` | Extend the existing Trivial Change, Quick Task and transition sections; do not create a separate Verified Change policy file. |
| Run parsing | `create-agdf/lib/control-state/run-state-parser.js` | Extend existing mode/artefact vocabulary only; preserve canonical/legacy heading behavior. |
| Gate/doctor behavior | `create-agdf/bin/create-agdf.js` | Add one shared record evaluator consumed by existing `doctor` and `gate-check`; no new public command. |
| Installed templates | `plugin/control/templates/**` plus file manifests in `create-agdf/bin/create-agdf.js` and integrity lists | Add one template and register it in every existing propagation/required-file list. |
| Generated surfaces | `create-agdf/scripts/sync-package-assets.js` | Reuse recursive control-directory propagation; no special generator branch is needed. |
| Regression harness | `create-agdf/scripts/control-state-test.js` and package smoke commands | Extend the established fixtures with valid and fail-closed records; retain legacy fixtures. |
| Boundary knowledge | `CG-DOCUMENTATION-CEREMONY-BOUNDARY` | Update this existing node after the final contract and worked-example tests exist. |

## Worktree Baseline Findings

- Current tracked dirty path: `.agdf/control/MASTER_BACKLOG.md`.
- Current untracked paths: only this scope’s existing artefacts under `.agdf/control/artefacts/verified-change-path/`.
- No candidate runtime source, template or test path is currently dirty.
- Implementation tests can therefore construct isolated temporary repository fixtures for baseline behavior without interpreting unrelated repository worktree state.

## Current Coverage

- `fully_done`: canonical transition owner, parse/control-state infrastructure, doctor/gate-check reporting, template propagation, runtime-integrity enforcement and legacy regression tests.
- `partially_done`: Quick Task has compact output but no durable eligibility record or scoped dirty-worktree baseline semantics.
- `not_done`: Verified Change record evaluator, transition states, template registration, policy/guidance, baseline tests, deterministic escalation and Context Graph update.

## Reuse Strategy

- strategy: `extend`
- primary path: add one canonical mode and one record template; centralize record evaluation in the existing CLI command owner; reuse the current temporary-fixture test style and generated-surface sync.
- no parallel structures: no new policy file, CLI command, control root, skill family, approval type or gate table.

## Regression And Risk Assessment

- High risk: a malformed record could accidentally permit implementation. Mitigation: evaluator returns fail-closed findings and transition denies implementation until `eligible`.
- High risk: baseline logic could reject unrelated prior work or accept an already-dirty candidate. Mitigation: persist tracked/untracked baseline lists; reject candidate paths dirty at baseline; compare new paths against declared scope only.
- Medium risk: generated template omissions. Mitigation: add template to existing required-file and runtime-integrity lists, then run package sync/smoke.
- Medium risk: mode drift between parser, contract and guidance. Mitigation: shared fixtures and runtime-integrity anchors; no duplicated full transition table.
- Compatibility risk: existing modes/legacy records. Mitigation: retain current fixture assertions unchanged and add new coverage beside them.

## SoT And Context Graph

- source_of_truth: canonical Runtime Contract for policy; `create-agdf/bin/create-agdf.js` for executable enforcement; template for record shape.
- context_graph_impact: `update_existing_node`.
- context_graph_required_action: update `CG-DOCUMENTATION-CEREMONY-BOUNDARY` after tests prove the exact eligibility/baseline/escalation contract.
- context_graph_gate_effect: none before implementation; unresolved after implementation blocks clean closeout.

## Required Next Step

Proceed with TP tasks VCP-01 through VCP-12 in CD+Tests. No later QA/UAT claim is permitted until implementation, reviews and formal QA are complete.
