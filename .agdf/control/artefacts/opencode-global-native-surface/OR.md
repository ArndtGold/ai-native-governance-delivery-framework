# Orchestration Report: Global Native OpenCode Surface

## OR

- gate: `Approval: UAT`
- report_mode: `OR-full`
- artefact: `.agdf/control/artefacts/opencode-global-native-surface/OR.md`
- status: `pass`
- delivered:
  - global OpenCode npm plugin installation now includes nine canonical native adapters under the collision-safe `agdf-global-*` namespace;
  - global `AGDF.md`, Runtime Contract adapter, status reporting, ownership protection and fail-closed repository boundary;
  - preservation, collision-preflight, runtime discovery, documentation and integrity coverage;
  - full AGDF review chain: TP Review, Clean Implementation Review, Code Review, QA and UAT.
- intentionally_not_delivered:
  - global `.agdf/control/` state, second gate engine or duplicate policy owner;
  - OpenCode tool enforcement or capability upgrade beyond `instruction_only`;
  - commit, push, pull request, release or rollout execution.
- evidence:
  - TP Review: 12/12 tasks fully done;
  - Brownfield Analysis, Clean Implementation Review and renewed Code Review: pass;
  - QA Report: pass;
  - UAT Report: pass, including global-only and repository-active user journeys;
  - doctor, runtime integrity and diff checks: pass.
- missing_evidence: None for the scoped delivery.
- risks:
  - OpenCode remains `instruction_only`; native discovery and permissions are not enforcement evidence.
  - Full multi-file filesystem transactionality for unexpected low-level write failures is outside this slice; expected unowned-collision paths are preflighted before mutation.
- retained_fallbacks: None as target architecture. Fail-closed boundary guidance is an intentional safety control with repository-local `.agdf/control/` as the source of truth.
- required_next_step: `Delivery-Closeout`
- quality_outlook: `no further technical follow-up`; commit/push/PR remain explicit operational choices.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: existing OpenCode global-install ownership and repository-source-of-truth invariant
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `none`

