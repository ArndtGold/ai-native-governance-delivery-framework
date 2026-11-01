# Brownfield Analysis: Planned URs and master backlog replacement

Decision: pass
Gate: Brownfield Analysis
Type: Brownfield Analysis
Mode: `pre_implementation_analysis`
Status: done

## Run

- run_id: run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74
- reviewer: Codex
- reviewed_at: 2026-10-31
- source_revision_id: 2c12c5f7-fd65-4578-ae02-28f59bbe2cb8
- decision: pass

## Objective

Verify the reuse and regression path for approved TP tasks T001–T013 before CD+Tests. This is preparation after TP, not a new post-UR sizing decision. The approved structured_delivery route, UR/PRD/SD/TP and ready UX intent remain binding. No implementation or test success is claimed by this report.

## Existing-System View

| Area | Existing owner and observed evidence | Coverage and implementation strategy |
|---|---|---|
| Ordinary Run writes | packages/core/lib/control-state/run-backlog-writer.js nests the selected Run lock and shared backlog lock, rejects unrelated pending transactions, and prepares backlog updates | partially_done: retain this exact legacy path; extend with layout-aware resource-local version-6 transactions |
| Transaction recovery | control-state/run-step-transaction.js validates exact journal versions 1–5 and uses sealed Run revision as commit point, owned output plans, archive publication and rollback/rollforward | partially_done: preserve old decoders; add a separate exact version-6 schema without a backlog member |
| Filesystem durability | packages/core/lib/owned-file-lock.js supplies bounded ownership records, atomic replacement, fsync and lock reclamation; unsafe paths are rejected | partially_done: reuse these primitives; new semantic commit points still need their own fault tests |
| Run creation | control-state/run-create-command.js and run-state-repository.js derive run-UUID, lock creation, stage and publish a Run directory, and replay a sealed initial receipt | partially_done: extend this owner for planned handoff and protected origin artefacts; do not create another Run writer |
| Version and receipt integrity | control-state/run-state-parser.js currently accepts version 2 only; run-operations.js has a closed operation registry; run-seal-compute.js seals listed source artefacts and approval history | partially_done: add version 3 and strict migration/handoff variants without relaxing historical forms; retain actual pre-feature runtime for rejection checks |
| Command and material contracts | control-state/run-command-schema.js has closed permission groups, strict discriminated payloads, Run-bound material slots and fixed byte limits | partially_done: extend the same groups with explicit planning/target scopes and a distinct bounded planning transfer; do not make Run fields optional globally |
| Planning source | No canonical planned entry owner exists | not_done: new contained entry module with one metadata-bearing UR.md, CAS, entry-local receipts/intent; shared ur-definition owns semantics |
| Maintenance | control-maintenance/service.js verifies target identity before and after interactive callbacks and delegates migration/repair to existing owners | partially_done: add explicit snapshot preview/apply/recover for planned layout; never invoke live cutover on this delivery Run |
| Initialization and doctor | required-files.js, canonical-init-plan.js, canonical-initialization.js, CLI scaffold/plan.js and doctor.js require/read the legacy backlog | partially_done: layout-aware requirements; new projects use planned-urs-v1 while unchanged legacy projects remain supported until explicit migration |
| Inventory and visible state | run-inventory-reader.js is a pure Run reader; cockpit-backlog.js/cockpit-list.js currently derive row identity/order/sections from shared Markdown | partially_done: combined derived inventory and versioned DTO/session identities; no persisted parallel index or UI-owned policy |
| Optional plugin and installation | CLI host-adapters/codex/plugin.js already owns marketplace publication, native install verification and MCP preparation | partially_done: extend explicit composition/packaging for optional plugins/agdf-planning; Core keeps runtime, UR template and gate ownership |
| Tests and generation | Existing core, CLI, MCP and UI test/generation owners are present; planned-feature scenarios and package are absent | not_done for feature evidence: add the approved eight shared groups to existing script/CI inventories |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Required action |
|---|---|---|
| problem: shared status-write bottleneck | run-backlog-writer and direct source-revision/recovery paths still acquire or inspect the backlog | trace all supported mutators into layout admission; preserve legacy semantics and remove unrelated-Run blocking only for new-layout journals |
| problem: maintenance versus ordinary mutation race | Current maintenance owns target identity but has no planned-layout independent admission-claim protocol | implement SD admission claims and maintenance epoch freeze/drain; unknown claims remain visible, never TTL-deleted |
| problem: handoff spans entry, artefacts and Run | Existing Run publication owns only the staged Run directory | use the approved entry → deterministic creation → Run lock order, intent before outputs and Run-directory commit point; recover only enumerated owned effects |
| problem: parser, source receipts and journal schemas are closed | Explicit version/operation registries and listed-source seals | extend explicit variants and verify historical fixtures unchanged; no broad permissive decoder |
| problem: UI row identity currently depends on shared Markdown | cockpit-list.js and cockpit session owners | derive immutable resource identity/source digest from combined inventory, invalidate stale selectors and keep unavailable/partial states explicit |
| problem: optional planning could duplicate UR or delivery authority | existing shared ur-definition dispatch and Core-owned templates | optional package delegates to capability-negotiated Core planning mode; missing Core fails before mutation |
| problem: migration can lose unparsed legacy material | legacy backlog reader serves presentation, not a lossless cutover format | snapshot raw bytes and disposition every row/span; preserve ambiguity without guessed associations or approvals |

These are addressed implementation obligations under approved SD, not accepted debt or claims of completed mitigation. No blocking conflict with the approved design was found. If native optional-plugin delegation proves infeasible, stop that path and return the concrete finding to SD rather than adding a shell-writing fallback.

## Test Impact And Minimal Clean Path

Implement T002 admission/version foundations, then T003–T006 entry/shared authoring/backlog-free transactions/handoff; T007–T009 inventory/migration/interfaces; T010–T011 optional package/generation. Reuse existing owner tests and add focused scenarios through G01–G07. Run changed-group feedback during editing; execute complete critical obligations before final quality claims. Keep new semantic ownership, commit and recovery fault injection, without duplicating unchanged primitive coverage.

G08 is Codex CLI only: Core-only and Core plus optional planning on the same exact candidate, disposable fixture projects, existing authentication only. Record actual client/runtime/OS/source identity. No native Desktop/Cockpit qualification is planned or implied. Automated UI checks and mandatory exact-head CI remain required. Missing evidence remains a named gap.

Preserve the existing five prerequisite routing-repair source/test changes. No product feature implementation exists yet. Do not migrate this worktree's legacy control or the primary checkout; actual-worktree migration exercise is read-only preview. Destructive recovery/concurrency/migration cases use disposable copies. Commit/push/PR/merge and global release/installation authority are not inferred from TP approval.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: run_inventory_20261030; run_closure_20261029
- context_graph_required_action: update verified implemented ownership/compatibility facts at closeout
- context_graph_gate_effect: none
- evidence: existing inventory/closure ownership changes; do not create a generic review-log node

## Next Permissible Step

- next_allowed_action: record this preparation through the canonical internal-step writer, re-evaluate gate-check, then CD+Tests if eligible
- forbidden_until_then: no implementation before preparation is accepted; no inferred human gate approvals
- quality_outlook: substantial compatibility and failure-recovery work; source inspection establishes reuse feasibility only, not feature correctness or host acceptance
