# Brownfield Analysis: Bound PRD preview implementation path

Mode: pre_implementation_analysis
Date: 2026-10-18
Owner: Codex

## Decision

- decision: pass
- scope: Approved TP T-001 through T-010, with PRD and SD source bindings unchanged.
- evidence: evidence/implementation-baseline.json; approved PRD, SD and TP; source inspections below.
- missing_evidence: Implementation and tests have not executed. Native host qualification remains outside any unsupported claim. Dependency availability is an execution prerequisite, not assumed test success.
- required_next_step: Implement T-002 onward through the existing owners and collect TP evidence before reviews and QA.

## Existing Owners And Reuse

Source checks stay with definition-sources and UR/PRD readiness. The new preview fact/resolver helper must use the captured-read seam. Presentation version 5 extends run-presentation and its strict validator; existing versions 1–4, receipts and material hashing retain their predicates. run-recording already provides validateBeforeWrite and validateDuringTransaction hooks: extend those exact validation hooks rather than creating another approval transaction.

Version-sensitive consumers found in run-presentation, decision-session, artefact-binding-proof and run-revision must all be updated. Current history readers already retain raw binary bytes and a separate canonical digest; use raw byte readers for new preview snapshots without widening existing per-file history limits. The snapshot closure must archive new chunks and raw files.

The existing Core projection copies private source modules into CLI/generated runtimes. It does not automatically inherit Core production dependencies into every standalone package. Update the existing packaging owner explicitly for the approved exact parser dependencies, and verify production resolution without a dev tree. Do not use packages/control-ui/node_modules as a runtime dependency fallback.

DecisionCard/DecisionEntry own approval controls and document access; extend their current port and bootstrap with a separate read-only preview view. The existing MCP resource has an empty frame policy. Preserve actual capability detection and an honest unavailable result rather than weakening sandbox restrictions or claiming native rendering from tool metadata. Use the same safe standalone rendering when an actual supported route exists.

## Risks, Baseline And Test Fit

The baseline contains inherited documentation/evaluation/contract edits and unrelated .gitignore and foreign-run artifacts. Preserve these paths; do not infer permission from their presence. Existing source files for the planned runtime implementation are clean at this checkpoint.

Use real temporary files and command transactions for binding and race tests. Reuse current presentation-document, approval, source-revision and decision-browser fixture patterns. New tests must join the canonical verification execution. No replay fixture, mock receipt or prototype browser check is implementation proof.

No additional product or architecture choice was found that conflicts with the approved PRD/SD. Unsupported resource syntax must fail explicitly under the approved grammar; new required behavior or a changed trust boundary requires returning to its source owner. File locks remain cooperative assurance, not malicious-process isolation.

## Context And Exit

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- memory_reason: Run-specific implementation preparation and baseline, no personal memory update.
- reuse_strategy: extend existing owners with cohesive preview helpers, no parallel service or product authority.
- exit_condition: Source binding and canonical Brownfield recording complete; only then enter CD+Tests.
