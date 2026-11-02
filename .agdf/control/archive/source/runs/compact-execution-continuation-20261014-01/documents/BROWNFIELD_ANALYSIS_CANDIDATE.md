# Brownfield Analysis: Compact execution implementation path

- mode: pre_implementation_analysis
- decision: pass
- run_id: compact-execution-continuation-20261014-01
- related_tp: .agdf/control/artefacts/compact-execution-continuation-20261014-01/TP.md
- reviewed_at: 2026-10-14
- reviewer: Codex

## Scope And Current State

Approved UR, PRD, SD and TP bind the repair of Quick Task Execution and eligible Verified Change handoffs, retained refusal/re-entry boundaries and actual local installation qualification. Fresh source inspection shows no implementation edits since SD/TP preparation; current worktree changes are this Run's control artefacts/backlog only. Existing eligible compact policy still falls back to resolve_control_state, and the dispatcher has only the structured implementation handoff. The retained installed-code unit baseline remains applicable to the pre-change build.

## Existing Owners And Reuse

- gate-policy.js selects effective compact permission and can use isInternalStepSatisfied for current evidence applicability. Completion remains governed by its existing completed-run proof.
- gate-check.js overlays integrity/readiness blockers and supplies the final next_operation. The dispatcher must consume this final operation, not text or an earlier policy result.
- service.js can add compact_implementation and compact_closeout packets to the existing gate-check/release-or owners, retaining structured implementation and verified_change_record preparation.
- verified-change.js and contained-file.js already supply normalized record facts and protected contained access. Current CLI observes Git; MCP does not inject those observations and retains baseline-unavailable refusals.
- run-steps.js publishes actual Quick Task review and OR-lite through existing bounded operations. run-recording.js recordRunRevision preserves approved rows and publishes the existing Verified Change record/mini-closeout through run-update. No mutation group or Run schema extension is required by the design.
- Current generators and install:codex provide content-derived local distributions and installed identity. Direct cache/marketplace editing is unnecessary and disallowed by this plan.

## Compatibility And Regression Boundaries

Preserve current gate names, exact approvals, schema envelopes, CLI flags, Request Activation, validated target/Run/revision and source/evidence ownership. Only additive semantic operation/continuation values are planned. Quick Task completed current review must route closeout instead of implementation; unknown/superseded evidence must not prove completion. Verified Change's eligible/executed and baseline checks remain strict. Unavailable Git observations remain unavailable.

No new authority, second execution store, persistent retry marker, exactly-once claim, new skill or autonomous VCS action is introduced. Existing duplicate Delivery Map calculation is outside scope. If code inspection or tests show an approved design obligation cannot fit the current owners, record the concrete design_gap before widening the patch.

## Evidence And Test Impact

TP maps all six criteria and design decisions to 23 scenarios. Existing dispatcher, verified-change, canonical state/writer, MCP and localization tests cover the touched owners. Run fresh generation/assembly before package consumers; retain source, packaged, installed CLI/STDIO and native-model evidence separately. The old-build installed baseline is not new-build proof. Disposable installed scenarios must use the actual supported launcher and CLI, retain exact identities and preserve refusal behavior.

## Minimal Permitted Implementation Path

Implement T-001/T-002 in existing policy/dispatcher owners, then T-003/T-004 regressions/contracts and normal generated output. Qualify the source/package candidate before supported local Codex installation. Execute T-005 with exact installed identities and retained disposable CLI/STDIO evidence. Record the required implementation/review/QA observations under T-006 and stop at actual QA/UAT decisions.

## Risks And Next Step

- risk: A compact gate alone does not prove unfinished execution; current recorded evidence must select implementation or closeout.
- risk: A stale or foreign source/record or old serving generation cannot count as current permission/proof.
- missing_evidence: New-code tests and installed qualification are intentionally not yet performed.
- required_next_step: Record this actual pre-implementation analysis canonically, then fresh bound dispatch may permit CD+Tests.
