# Brownfield Analysis: Current Run Model Implementation Preparation

- decision: pass
- mode: pre_implementation_analysis
- scope: Approved TP tasks T-001 through T-012, without changing approved product or design decisions.
- evidence: Source/consumer inventory and exact approved-source observations below.
- missing_evidence: Implementation and actual tests/native qualification have not run; these remain the mapped CD+Tests obligations, not a preparation pass claim.
- risks: Coupled path/proof/projection changes, fixture propagation and preserving the frozen governing writer require sequential owner changes and original-condition verification.
- required_next_step: Canonically record this preparation, revalidate this Run and begin T-002 through the existing current owner seams.

## Approved Inputs And Protected Boundary

Run run-ee983b1f-abf5-42fa-b980-096c1eda647f; assigned worktree .agdf/worktrees/run-model-clean-cut; baseline c204ab67f3ab212238bfd9ad81de4ddbecacece8. The baseline has only this Run's control outputs and the frozen writer's MASTER_BACKLOG update; no product source edits were present. No AGENTS.md was found in the assigned repository. The primary checkout, other worktrees, installed caches and existing authored stores are not an implementation target.

Observed raw SHA-256 values match the exact current canonical sources: UR 3d8f1db643d8851719f9367e025d25f17b8643b3f2c96adafdcbf6995a833ac6; PRD e9f707c1a102f73a2e8e2e0b09951d06b0fac316c8f57adf806ced0d4a759064; SD 18e8718c42dd2b23f13038d8b1e0466146a0383fd336ef3c769fc9cd952c592a; TP 9cf034595bb202113c70697597532cff533e79d8f919834fc24dacd833a819d8. Preserve these bytes. Current recorded Brownfield Review and UX inputs also match their prior canonical digests.

The actual post-TP dispatcher is matched installed 0.20.2, dispatcher digest 486b2c484bd60f5ffa3545518374da00c7b75fdc3e70ad90faac06131e86cf0a. It governs the existing old-format Run under its unchanged target identity; it is not a test of source candidate code. Stop if that binding becomes unavailable rather than switching or resealing. The finite exception ends at OR as approved in SD.

## Existing Coverage And Reuse Path

| Boundary | Existing owners inspected | Coverage and required implementation treatment |
|---|---|---|
| Creation/paths/scaffold | run-state-reader.js, run-state-repository.js, run-store-inspection.js, canonical-initialization.js, canonical-init-plan.js and CLI scaffold plan | Partially done: current containment, atomic stage publication, exact creation replay and ownership primitives are reusable. Replace dual layout selection and all per-Run output paths; no legacy scaffold/projection requirement. |
| Canonical projection | run-state-document.js, run-state-parser.js, run-state-edits.js, run-state-writer.js, run-inventory.js and control-evaluation/run-state.js | Partially done: one parsed control-object seam exists. Current mutators and several direct consumers assume stored Approvals/Artefacts/Artefact Chain/Evidence tables. Derive those current views from records at that seam, adapt direct consumers, and serialize only canonical facts at the writer boundary. |
| Derivation/applicability | run-artefact-recording.js, artefact-bindings.js, artefact-binding-proof.js, evidence-bindings.js and run-operation-proof.js | Partially done: exact source/reviewer semantics and append-only family owners exist. Embed the reviewed attestation, remove external RECORD/REVIEW files, and reference canonical applicability bindings from effects rather than duplicating current mappings. Keep original request normalization and required historical proof. |
| Decisions/seals/history | approval-command.js, approval-operations.js, run-presentation-envelope.js, decision-material-contract.js, run-seal-compute.js, run-revision.js, run-source-revisions.js and run-revision-history.js | Partially done: exact presentation, policy-2 revision eligibility, immutability/invalidation, byte digests and guard ownership are reusable. Select new current codecs/path contracts/seal domains, remove older-policy/envelope variants and preserve actual present-day features. |
| Transactions/concurrency | run-step-transaction.js, run-step-pending.js, run-mutation.js, run-owned-outputs.js and owned-file-lock.js | Partially done: journal commit point, old/next verification and independent owned locks exist. Retain current crash/replay behavior in v7; remove Backlog outputs/locks, historical codecs and layout-cutover maintenance machinery. |
| Planning origin/handoff | planned-handoff.js, planned-origin.js, planned-inventory.js and current Run creation records | Partially done: existing explicit source-bound transfer and uniqueness guards are reusable. Move origin authority into the current creation record and immutable history/planning snapshot, retaining editable UR independence and stale-source/replay checks. |
| Public/read consumers | control-inspect Cockpit contract/projection/session/document readers, artifact-readiness/authoring-inputs, skill-dispatch definitions/intake, CLI handlers and control command service, MCP runtime and Control UI overview/API/types | Partially done: reuse normal scoped transport and passive UI boundaries. Remove old view/command shapes and propagate one current path/projection consistently; do not add an index or a fallback service. |
| Packages/tests/native | Existing sync/assembly/compatibility/CI owners, current shared fixtures and guarded Codex host runner | Existing scenario intent and harnesses can be reused. Fixtures currently copy old project control or construct raw-table state; convert them to fresh current inputs through existing writers. Extend the finite native case owner, not an installer/auth-copy cohort or another runtime manager. |

The checked inventory found 34 relevant layout/version references, 54 path consumers and 59 state/projection consumer files across these groups. These counts describe search coverage only; they did not determine route or design. Concrete direct table reads include run-seal-compute.js, run-inventory.js and planned-origin.js. Layout migration files also read those tables but are removed, not adapted as supported consumers. Current metadata/table mutation helpers in run-steps.js, run-recording and approval/revision writers must no longer make persisted derived rows necessary for truth.

## Implementation Boundaries

1. Extend the existing validated Run-path boundary first; then select run-folders-v1/v4 and route all owned document/control/history/evidence outputs through it. Preserve project-wide template/config roots and do not relocate generic lifecycle or foreign data paths merely because they contain the word artefacts.
2. Keep the existing parser/domain interface. Its current control view may be materialized in memory for existing evaluator/edit consumers, but only canonical records/facts are stored and sealed. A projection is not a legacy decoder and cannot serve as an independently editable source. Preserve authored non-derived relationships (for example explicit parent/programme links) with one canonical Run-state owner; only their derived chain view is reconstructed.
3. Treat proof, normalization, receipts and transaction bytes as a coupled current contract. Raw CLI entry points must converge on the same current canonical command/record owners rather than retain an unrecorded table-only write path. Internal test setup must use that current path or explicitly synthetic current records, never restore positive old-format acceptance.
4. Keep the existing transaction commit/recovery checkpoints, containment and original-UUID semantics. Update pending paths and current payloads before broad propagation; verify targeted interruption/replay/foreign-owner behavior at its actual failure conditions.
5. Remove unreachable legacy/migration modules, imports, registry cases, help/templates and old-positive matrices together. Retain only representative rejection cases and necessary current feature variants. Historical documentation/Run evidence is not executable support and stays protected.
6. Generate candidate assets only through the existing ordered build owners. Fresh current fixtures and native targets are isolated from this governing store. Do not run a current candidate against the governing old store and then repair it to obtain a green result.

No new product/architecture choice is required to follow the approved SD. If implementation reveals a fact that contradicts that assessment, stop the affected task and route the exact normalized gap to its existing source owner rather than silently changing the approved design.

## Regression, Evidence And Dependencies

Use the approved TP's 24 scenarios and existing local command groups. Prioritize fresh setup/path containment, canonical projection/proof consistency, current transaction interruption/replay/concurrency, planning transfer and exact approval/history. Update shared fixture owners before dependent suites. Source-only structural assertions do not qualify packages, actual model use or UI behavior.

The worktree currently has no local root, Control UI or MCP node_modules. Install only the relevant locked dependencies in this worktree, using a task-local writable npm cache as needed; do not share mutable dependency trees with another checkout. UI resources and generated CLI payload must exist before package-dependent MCP SDK/tests. No test dependency installation is an update to the personal AGDF plugin.

Node 22.22.3 and Codex CLI 0.163.0 availability were observed during planning. Authentication/native execution and generated candidate identities are not yet proven. Existing native command-task guard/trace owners provide the finite process-only case boundary; the RUN_MODEL case is still an implementation task. No credentials, model session or install are needed to complete this preparation.

Mandatory reviews and QA follow actual execution. Required exact-head CI remains a later merge condition after separately authorized VCS work; no automatic full local or multi-host native run is introduced. Preserve actual failed observations and qualification limits.

## Context And Next Step

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: T-008 reconciles the existing node when current ownership is implemented and verified; this preparation creates no new registry.
- memory_target: scope_artifact
- memory_reason: Keep this exact preparation with the governing Run; no Codex memory update.
- memory_refs: BROWNFIELD_ANALYSIS.md

The existing-system view, reuse path, current data/interface boundaries and minimal implementation sequence are sufficiently concrete to start the approved work after canonical recording. This pass is preparation readiness only, not a passing implementation/test/QA result or an extra human approval.
