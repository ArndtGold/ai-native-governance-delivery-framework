# Brownfield Analysis: Repository-specific migration and repair

- mode: pre_implementation_analysis
- decision: pass
- scope: Approved TP T-001 through T-009; implementation and fixture/package validation may proceed after canonical recording. Fresh installed Codex evidence remains a separate obligation.
- evidence: Approved PRD/SD/TP; current installer maintenance, CLI/validator, generator, consent, canonical recovery and test owners inspected on 2026-09-30.
- missing_evidence: New direct/startup integration and refreshed installed/fresh Codex execution do not exist yet; these are execution obligations, not unresolved design facts.
- required_next_step: Extract existing maintenance implementation to its shared owner, preserving compatibility imports and canonical transaction boundaries.

## Baseline And Source Binding

HEAD: `81ff3d58a543a9d2b1e74cba65e516ae0611df11`. Before source changes, `/private/tmp/agdf-repository-maintenance-baseline-20260930` captures 2767 tracked/nonignored untracked file snapshots, a SHA-256 manifest, status, index patch and worktree patch. It preserves extensive previous work and permits attributable-delta review without staging, resetting or committing. The selected canonical run is `repository-control-compatibility-20260930-01`; UR/PRD/SD/TP digests remain those presented and approved.

## Existing Coverage And Reuse

| Concern | Coverage | Existing evidence / reuse strategy |
|---|---|---|
| Compatibility inventory | fully_done | `install-setup/control-migration.js` already separates compatibility from Doctor, retains historical records and handles planned missing outputs; refactor ownership only |
| Migration proof and write boundary | fully_done | Reviewed batch snapshots call `control-state/run-recovery.js`; locks, private originals, stale rejection and approval resets are canonical; reuse |
| Repair proof and rollback | fully_done | `install-setup/control-repair.js` validates checkpoint/exact Git sources and delegates canonical locked writers; preserve unsupported/manual cases; refactor ownership only |
| Maintenance text/interaction | partially_done | Existing shared EN/DE renderer and migration/repair callbacks exist; extract them, add common entry and numeric details without copying policy |
| Direct installed-runtime entry | not_done | Validator allowlist and command registry lack the entry; extend dedicated adapter and minimum dependencies |
| Startup compatibility hint | not_done | Generator currently emits Doctor/config/language facts; extend permitted fixed runtime read with independent compact compatibility facts |
| Host execution evidence | partially_done | Existing hook/consent/provenance fixtures exist; candidate-specific fresh Codex remains unobserved and cannot be inferred |

## Ownership And Architecture Findings

| Finding | Classification | Owner / treatment |
|---|---|---|
| Installer-owned maintenance cannot be shipped by importing the whole installer | problem | Shared `control-maintenance` capability; thin installer/runtime adapters under SDD-001/007 |
| Shared migration/repair remain distinct transactions with partial outcomes | trade-off | Canonical control-state/recovery owners; rationale: preserve proven local locks/backups and independently eligible runs; mitigation: actual reinspection and explicit remaining causes; exit condition: all conflict/partial scenarios pass before QA |
| Startup bounded deadline can yield unavailable compatibility | trade-off | Generator/runtime owner; rationale: startup must remain bounded; mitigation: honest unavailable state and explicit manual command; exit condition: injected timeout and manual retry scenarios pass |
| Runtime/source identity changes invalidate previous automatic-check consent | compatibility constraint | Existing consent/provenance owner remains authoritative; test renewal without changing permission policy |
| Prior work overlaps implementation files | regression risk | Codex uses captured byte baseline and scoped diffs; preserve index and unrelated bytes, never checkout-wide cleanup |

No accepted technical debt, parallel classifier/state store or unresolved ownership decision is introduced. Product intent/criteria are unchanged. Interfaces are the additive direct CLI and compact startup facts already decided in the SD. Control format remains version 2; migration/repair safety and approval provenance do not move into the new command adapter.

## Minimal Implementation And Test Path

Extract compatibility/migration/repair and their presentation/interaction with compatibility re-exports first. Add contract/service and dedicated command adapter. Extend consent-bound generated startup and its minimum dependency list. Run preserved installer/recovery tests and meaningful direct/startup negatives in temporary roots. Generate complete supported profiles and review dependency/payload differences. Complete CD+Tests and existing review/QA routes, retaining the live-host evidence limitation until observed.

Fixtures use Node 22, Git and temporary directories; no external documentation assumption or network is needed to implement the existing local owners. New tests must execute actual emitted CLI/hook output. Real historical runs are not fixtures. Host provisioning/install/restart/publication/VCS remain outside automatic implementation authority.

## Context Graph And Knowledge Persistence

- context_graph_impact: link_only
- context_graph_refs: CG-CREATE-AGDF-CLI-COMPOSITION; CG-NATIVE-INTERACTION-AUTHORITY; CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Existing nodes linked by completed Brownfield Review; shared implementation retains their authority boundaries.
- memory_target: scope_artifact
- memory_reason: Baseline and execution-specific inspection belong in this run; no new authority registry or user memory update.
- memory_refs: This analysis and approved SD/TP.
