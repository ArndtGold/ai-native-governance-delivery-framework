# Brownfield Analysis: control cockpit implementation preparation

- mode: pre_implementation_analysis
- decision: pass
- scope: approved TP tasks T-001 through T-010; original approved PRD/SD unchanged
- current_coverage: Core discovery, evaluation, seals, approvals, relationships, configuration and catalogs fully_done; snapshot/provider, browser resource projection, HTTP service and React UI not_done
- reuse_strategy: extend Core read helpers with request-scoped provider; reuse evaluators and parser directly; new private presentation/service package
- evidence: EVIDENCE/brownfield-preparation.json; static import traversal from control-inspect/service.js and run-state-reader.js, source digests and full read-only worktree baseline
- missing_evidence: implementation, mutation/isolation/parity tests, HTTP and browser evidence are planned TP execution evidence, not preparation claims
- required_next_step: record this completed preparation, re-evaluate the same run, implement CD+Tests only when canonically routed

## Owners and read boundary

The static read graph in the linked JSON identifies synchronous exists/read/directory/stat/realpath operations in discovery, configuration, doctor, gate-check dependencies, seals, approval proof, revision history, source readiness and document containment. Add a Core control-read/fs.js provider seam to these named operations; do not monkey-patch node:fs. AsyncLocalStorage carries a disposable immutable captured view. Default imports delegate unchanged to native fs when no context exists. Under context, reads of original target/control paths resolve only captured entries, absent entries produce native-style absence, and paths outside the captured control boundary fail closed. Preserve root/.agdf directory identity for containment and approval-command target resolution; reject root/control symlinks at capture.

The new projection calls discoverRuns, readRunState, evaluateDoctor and evaluateGateCheck explicitly, with environment run selection disabled by a bound explicit selector. It does not call dispatch, prepare presentations, control writers, Git observation or target discovery. Existing immutable runtime resource/catalog initialization occurs outside the captured read context; contract/target-orientation paths from the wider inspect service are not used by the cockpit. Core evaluation remains the only gate-policy owner. No copied permission interpretation is allowed.

Capture uses native fd reads with no-follow where available, verifies file/ancestor identity and high-resolution metadata before and after reads, then compares a second complete enumeration/read including digests. At most one retry; related calls revalidate the original target and entire observed membership before serving the old view. Entries/bytes remain private; provider returns copies to prevent consumer mutation. Run invalidity remains representable; a tree safety violation fails the capture rather than allowing an out-of-scope read.

## Minimal implementation path and compatibility

Implement snapshot and provider first with deterministic temporary fixtures and real-target parity; then project explicit DTOs/resources, build the private package, service and UI. Use separate state/navigation, document renderer and HTTP/worker modules. Core readers retain their native signatures/default behavior. No control schema, migration, approval format, policy or public CLI command change is required. Core runtime assets follow existing synchronization; UI dependencies/dist remain private. Preserve the baseline's independent language/config source changes, including overlap in resources/context.js and run-presentation-render.js, by changing only filesystem import ownership.

## Reuse and parallel-structure risk

| Finding | Classification | Treatment | Owner | Exit condition |
|---|---|---|---|---|
| Direct fs reads can bypass a coherent view | problem | Audit-derived provider seams and deny uncaptured reads; isolation/parity/mutation tests | Core reader owner | SCN-004/013/019/029/030 pass |
| New browser could copy Core governance semantics | problem | DTO projects existing Core reports, persisted values stay separately labeled | Core projection owner | SCN-004/005 pass and actual diff review |
| Snapshot observation can change after validation | trade-off | Approved bounded observation with provenance, freshness notices and explicit reload; no transaction claim | Core reader and UI owner | SCN-013/014/015 evidence and accurate documentation |
| Static graph includes unused inspection branches | trade-off | Cockpit invokes explicit evaluator read lane; tests verify effective read boundary and no children/writers | Core integration owner | Provider and HTTP byte-invariance scenarios pass |

No accepted technical debt waives these exit conditions. Conditional risks (symlink races, leaked secret, unsafe rendering, queue limits, stale publication) have executable TP scenarios and resolved SD owners. If any boundary cannot be implemented as designed, route to its existing revision owner.

## Context and knowledge

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- memory_target: scope_artifact
- memory_reason: run-specific audit and baseline retained here; implementation evidence will support later durable documentation, no global memory update
- memory_refs: EVIDENCE/brownfield-preparation.json

Preparation pass establishes a clear implementable path; it is not implementation success or final QA.
