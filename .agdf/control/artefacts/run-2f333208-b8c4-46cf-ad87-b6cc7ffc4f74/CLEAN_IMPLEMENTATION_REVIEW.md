# Clean Implementation Review: Planned URs and backlog-free Core

Decision: pass
Reviewer: Codex clean-implementation-review owner; AI self-review
Date: 2026-10-31
Run: run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74

## Clean Implementation Review

- decision: pass
- primary_solution: one canonical metadata-bearing planned UR per need, shared ur-definition content/template owner, exact source-bound handoff to the existing Run owner, derived inventory, and versioned backlog-free persistence. The optional package only organizes dialogue and delegates effects to Core.
- evidence: approved SD/TP, all 16 pages of current authoring manifest 366b9fb50f21131a44791782f6007aca82f252530a5af5423924f59d53ea452b, BROWNFIELD_ANALYSIS.md, CD_TESTS.md, CODE_REVIEW.md, actual source/diff and retrievable test/native/browser results described in IMPLEMENTATION_STATUS.md. The 2202-file QA source snapshot and all 33 native evidence files were rechecked without drift.
- fallbacks_retained: legacy v2 state and journals 1-5 retain exact old rules until deliberate supported cutover. New planned-urs-v1/v3/v6 never recreates or serializes through the backlog. This is explicit version compatibility, not an implicit dual-write fallback. Unknown, foreign or unsupported states refuse with actionable evidence.
- workaround_or_shim_risk: none evident in the implemented primary path. The compatibility Cockpit DTO retains an old kind name while Core supplies new-layout policy; it does not read a hidden backlog. MCP availability and journal binding were fixed in their existing owners, rather than masked in clients or tests.
- parallel_structure_risk: none evident. No editable central status/index, second UR template/engine, second MCP runtime/server, generic extension registry or independently stored priority/status policy was added. Entry operation receipts, immutable origin/snapshot, migration archives and admission claims have distinct proof/recovery roles; they do not replace current UR or Run authority.
- brownfield_fit: existing contained reads, atomic publication, owned locks, command/material/schema owners, Run parser/seals/revision/history, generator/assembly/installer, UI session/snapshot and canonical CI inventory are reused. Planning-mode effects and Run effects have explicit mutually exclusive bindings. Existing prerequisite routing work and foreign/primary checkout changes remain preserved.
- missing_evidence: none for this structural assessment. Native observations retain their exact tested Core 826ca9884801 identity; final package a679e02c1b68 is not asserted natively installed. The assessed reuse is bounded below. Remote CI, human QA/UAT, actual project migration and other native hosts remain separate obligations.
- required_next_step: finish TP coverage recording, then let qa-gate make the sole technical QA decision.

## Ownership and exit conditions

Ordinary claims are resource-local and do not create an exclusive project gate. Only explicit maintenance holds the rare epoch lock, freezes admission and drains original operations. Claims are retired only against exact owned bytes/proven outcomes; no liveness timeout guesses ownership. Same-Run/entry locks preserve CAS and recovery. Target state is backlog-free new layout; a legacy repository reaches it only through the reviewed snapshot-bound migration owner, never through a read, installation or hidden initialization. Historical ended v2 bytes remain history and are not promoted to current approvals.

Migration's extra storage is immutable accounting, not a competing master backlog. Every original row/unparsed span and old source remains recoverable, including unresolved association/priority. The confirmed epoch is bound to journal operation/request/preview/config. Closed bounded Run identities are checked against captured source state before locking or archiving. Unknown journal/output bytes are preserved for explicit recovery. Limits (256 Run locks and 32 MiB journal) are visible refusals with no truncated plan or silent fallback.

The optional package negotiates Core capability/template identity, and saves incomplete drafts without Runs. The single Core handoff owner preserves immutable provenance while active UR changes remain governed by existing Core revision rules. Passive UI navigation/reads neither transfer work nor approve it.

## Evidence reuse and resolved corrections

CODE_REVIEW.md retains normalized CR-001 through CR-004 as resolved with concrete re-verification: native-discovered MCP result classification, exact own-claim filtering, duplicate UI close and journal/epoch/closed-lock-set binding. This review does not reclassify them or maintain a second finding list.

Native feature tests used one unchanged Core candidate, both with and without the optional package. The later migration-only correction and generated worker changed only validateIntent; candidate-wide file comparison and worker AST in evidence/implementation/native-final-applicability.json establish unchanged exercised UR/material/schema/read/handoff/direct-Run entrypoints and unchanged optional package. Affected migration 17/17, process/version 10/10, actual assembled STDIO 2/2, package and compatibility 56/56 were rerun. Reuse their original feature observations under the TP invalidation rule, without claiming a model run or whole-package native qualification at the final digest. No redundant completed native case or additional proof registry was introduced.

## Context Graph

- memory_target: context_graph
- memory_reason: maintain the two existing inventory/closure ownership nodes
- memory_refs: .agdf/control/CONTEXT_GRAPH.md; run_inventory_20261030; run_closure_20261029
- context_graph_impact: update_existing_node
- context_graph_refs: run_inventory_20261030; run_closure_20261029
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: existing nodes now state versioned persistence, derived authority, immutable origin and exact native/actual-migration limits

No upstream product/design decision was invented. No independent human review, QA/UAT approval, persistent global update, VCS action or release is claimed. qa-gate alone owns final technical readiness.
