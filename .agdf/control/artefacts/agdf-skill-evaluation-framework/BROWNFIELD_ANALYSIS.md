# Brownfield Analysis — Skill Evaluation Framework

- mode: pre_implementation_analysis
- decision: pass
- run_id: agdf-skill-evaluation-framework
- approved_tp: .agdf/control/artefacts/agdf-skill-evaluation-framework/TP.md

## Fit And Reuse

- current_coverage: partially_done
- reuse_strategy: extend
- `plugin/meta/agdf-plugin.definition.json` remains the skill inventory owner.
- `create-agdf/lib/` remains the executable contract/runner owner; the new subsystem is isolated under `skill-evals/`.
- Existing disposable-directory patterns and the read-only repository-state guard are reused without importing Delivery Path Search scoring semantics.
- `create-agdf/package.json`, `agdf-guardrails.yml` and `publish-agdf.yml` remain the aggregate, CI and release validation owners.
- The root `evals/` corpus is new evidence data, not a second routing or gate authority.

## Clean Implementation Path

1. Implement contracts, safe loading, fingerprints, deterministic graders and reports as one cohesive `create-agdf/lib/skill-evals/` subsystem.
2. Add a repository-only offline runner and an explicit recording seam; do not add a public CLI command.
3. Add the versioned corpus and observations derived from the canonical nine-skill inventory.
4. Prove negative behavior before wiring aggregate smoke and workflows.
5. Keep live/replay provenance explicit and never substitute expected values for missing observations.

## Regression And Compatibility

- No production data migration or public CLI compatibility change.
- Cross-platform path normalization, line endings, timeouts and symlink behavior require focused tests.
- Existing runtime-integrity, smoke, package and Pages checks remain required and may not be weakened.
- CI integration must be additive inside existing workflow owners.

## Risks

- The initial corpus may be broad but shallow; case prompts must remain user-shaped and adversarial.
- Checked-in observations prove recorded behavior and freshness, not an execution in the current CI job.
- Live recording availability depends on installed/authenticated hosts and remains supporting evidence.

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: CG-DELIVERY-PATH-SEARCH; CG-NATIVE-INTERACTION-AUTHORITY; CG-DOCUMENTATION-CEREMONY-BOUNDARY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none

## Required Next Step

Implement TP-EVAL-001 through TP-EVAL-013 through the clean owner boundaries above, then run mandatory reviews before QA.
