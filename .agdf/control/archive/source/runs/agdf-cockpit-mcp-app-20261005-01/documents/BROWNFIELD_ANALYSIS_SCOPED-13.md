# Brownfield Analysis: Scoped Cockpit Reads

Date: 2026-10-07
mode: pre_implementation_analysis
decision: pass
Run: agdf-cockpit-mcp-app-20261005-01
Preparation revision: 057ca356-9dae-4844-a475-caf88648c19a (90)
Scope: approved TP and SD, scoped immutable read capture and shared cockpit consumer revision
Evidence: IMPLEMENTATION_BASELINE_SCOPED-13.json, approved SD.md/TP.md, SCOPED_READ_IMPACT-09.md and inspected production owners below
Missing evidence: implementation tests, fresh build/protocol/native/parallel proof and required reviews remain future obligations; none blocks identification of the implementation path
Transparency: cooperative source inspection only; no independent review, QA/UAT or host success claim

## Current Coverage And Reuse

| Owner | Current coverage | Strategy and bounded impact |
|---|---|---|
| Core control-read/fs.js and snapshot.js | partially_done: AsyncLocalStorage seam, memo/sticky containment and bounded immutable full-tree capture exist; dependency recording/freeze/replay does not | Extend/refactor existing capture primitives; maintain broad capture API and default consumers; add actual dependency records without native fallback |
| Core control-inspect/cockpit.js | partially_done: evaluated detail, opaque manifest, passive document and graph/packet exist; snapshot discovers and fully evaluates all Runs | Reuse evaluation/manifest/document projection, replace all-Run inventory entry with backlog-only/direct Run and fresh scope transitions |
| control-evaluation/shared.js and run-state reader/resolver/evaluator | fully_done for policy/parser ownership; selected Core operation can need global metadata, source seals and pending checks | Reuse unchanged parser and selected-Run evaluation; record real closure, not imagined minimal data; no gate/policy/synchronization changes |
| Core cockpit-worker/pool/session/contract | partially_done: independent four-slot registry, owned release/completion, generation and budgets exist | Extend optional snapshot Run selector and discriminated replacement DTO/schema, rebind new snapshot/resources and honor cancellation/retirement limits |
| Shared UI App/api/types/state and document/context views | partially_done: Pages branding, display navigation, stable focus and immutable handoff ports exist; initial route still fetches all-Run inventory and accepts old envelope | Coordinate both transport/reducer DTOs with new parent bundles; keep shared rendering and current summary/sticky header/Pages surfaces; store captured orientation distinctly from Run evaluation |
| Browser service/pool wrappers | partially_done: shared Core worker, HTTP authentication and lifecycle exist | Preserve authentication/routes transport, map optional named capture and replacement scopes; no second reader or host capabilities |
| Private MCP/assembly/local preparation | fully_done as retained topology, not renewed qualification | Rebuild paired schema/HTML/owned tuple through existing preparation; retain exact SDK graph and default/public profiles |
| Canonical backlog writing | fully_done as retained transaction mechanics, partial synchronization by design | Keep Run/Backlog locks, byte/revision compare, atomic files and journal recovery unchanged. run-approve writes Run only; prepareBacklog may preserve prior status/report missing. Test stored pointer versus file freshness versus selected Run currentness; no writer expansion |

## Existing-System Findings And Boundaries

The current capture recursively loads all .agdf/control and rechecks the entire tree. The MCP per-view 64 MiB limit is below the diagnosed evidence-heavy repository size; raising it or removing history would retain the growth coupling. Actual scoped capture, parent/resource rebinding and shared adapter replacement implement the approved durable solution. Core resolution may enumerate/read unrelated Run metadata for its existing safety policies; only unrelated full gate evaluation and evidence body loading are excluded.

Containment owner is the existing filesystem seam/capture, including non-symlink ancestor and descriptor identity checks. Record observed files, absence and directory enumeration; frozen replay rejects any new dependency and cannot treat an unloaded file as absent. Revalidation concerns that exact closure. Unobserved subtree change must not stale a view. Retire old retained capture/selectors before constructing replacement; reject foreign incoming selectors first, fail interrupted candidates without resurrection and preserve other views. Packet ownership/host acknowledgement ordering remain under existing session/controller owners, never duplicated in a global UI queue.

The primary visible owner remains shared React reading state. App is already a substantial orchestration/render component: keep bridge/context publication in its existing focused controller, share DTO validation and use small projection helpers instead of adding a second cockpit. New overview is stored Master Backlog data, not evaluated inventory. A fresh file observation does not imply all pointers match current Run revisions. Initial failure must show requested identity/retry and suppress falsezero/empty selection. Use new matching parents and registration-based return focus, not an obsolete resource ID.

Trade-off: fresh immutable scopes reread genuine dependencies and require coordinated private DTO/UI updates. Rationale/owner: preserve provenance and bounded memory at existing Core/UI owners; mitigation/exit: scoped parity, read-set/limits/race tests and matched fresh native tuple before QA. No accepted debt waiver or parallel source/policy/store. Default governance APIs and canonical writers remain unchanged; old cockpit HTML is not claimed compatible.

## Baseline And Human Changes

The JSON baseline captures current commit/index digest, dirty/untracked status, exact approved source hashes and candidate/protected file hashes. Source capture/cockpit code and shared App/api/state/types are clean at this baseline. The browser journeys test and architecture documentation have retained dirty changes; the newly added document test is staged. Preserve these and integrate only scoped additions after inspecting their diff. The unrelated diagrams/06-mcp-lifecycle.dot stays untouched. Do not stage/reset/revert concurrent human changes. Current installed runtime retains full-tree reads and is historical evidence until rebuilt/activated/observed; project registration remains owned and separate from the installed governance plugin.

## Minimal Implementation And Verification Path

1. T-003: common bounded primitives plus dependency capture/freeze/replay and production read-set/race/parity fixtures; retain broad capture behavior.
2. T-004/T-005: backlog/direct Run/document/context projection, session/worker selector lifetime, strict discriminated schema and matching parents; minimal shared UI/HTTP/MCP route/error adaptation and paired resource build.
3. T-006: fresh owned native tuple and explicit established Run opening/backlog-only view with fixed bound, observed widths/two independent views; host gaps remain gaps. No automatically repeated synthetic questions.
4. T-007 to T-010: requalify graph, packet/publication boundary and finish shared reading/focus/error/navigation semantics. T-011 adds mapped boundaries, canonical transaction and default compatibility regressions plus required reviews. T-012 supplies current native journey/no-write/rollback/docs/knowledge evidence.

## Context Graph

context_graph_impact: update_existing_node
context_graph_reconciliation: open_gap
context_graph_required_action: update
context_graph_gate_effect: warning
context_graph_evidence: approved design and implementation-owner inspection; no implemented scoped fact yet
memory_target: context_graph
memory_reason: verified read ownership, dependency provenance, limits and recovery will be reusable architecture knowledge
memory_refs: existing cockpit/reader/architecture nodes through approved closeout ownership; resolve exact current nodes before curation

Do not curate proposed facts as implemented knowledge. Current run impact remains open until verified facts are reconciled before clean closeout.

required_next_step: record this complete internal analysis, redispatch gate-check for the same bound Run and continue the approved implementation route only when Core permits CD+Tests.
