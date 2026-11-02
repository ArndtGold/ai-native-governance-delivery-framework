# QA Report: Cross-Surface Skill Target Preflight

- revision: 1
- decision: `pass`
- gate_approval: `missing`
- date: 2026-09-03

## Evidence

- TP Review: pass, 12/12 tasks fully done.
- Brownfield Analysis: pass, existing owners reused without a parallel resolver or renderer.
- Clean Implementation Review: pass, no workaround, shim or parallel host structure.
- Code Review: pass, no correctness, security, compatibility or maintainability finding.
- Runtime Integrity: pass for ten skills and sixteen control files; negative boundary tests pass.
- Deterministic Skill Evals: 83/83 across ten skills; deterministic replay is not live-host evidence.
- Agent Skills Conformance: pass across source and four generated surfaces.
- Copilot profile: pass at 82 files and reviewed 612679 bytes.
- Package build and complete `create-agdf` smoke: pass.
- Context Graph: existing target and interaction authority nodes updated and reconciled.

## Missing Evidence

- No current source change was installed into Codex, Claude Code, GitHub Copilot or OpenCode.
- No fresh-session repo-less or resolved-repository invocation was observed on those hosts.
- These gaps prevent loaded-host claims but do not invalidate the source, generated-profile or
  package implementation decision.

## Risks

- A host may retain stale skill bytes or route a direct invocation without loading a referenced
  contract. This remains visible and belongs to later explicitly authorized host observation.
- The existing broader operational status-card localization finding belongs to its current owner;
  this QA pass covers the new direct-skill locale binding and does not claim that unrelated card
  state is installed or freshly observed.

## Decision

`pass`: the approved source and generated-profile scope is fully implemented, reviews are clean,
required deterministic evidence is green and every unavailable host plane is represented honestly.

## Required Next Step

Review QA Revision 1 and provide exact `Approval: QA`, request revision or decline. Installation,
fresh-session UAT and VCS actions remain separate and unperformed.

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Direct-skill and QA ownership extensions in `.agdf/control/CONTEXT_GRAPH.md`

No normalized finding is open.
