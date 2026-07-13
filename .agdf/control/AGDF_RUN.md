<!-- AGDF LEGACY PROJECTION: NON-AUTHORITATIVE -->
<!-- canonical_source: .agdf\control\runs\agdf-run-scoped-control-state\RUN_STATE.md -->
<!-- run_id: agdf-run-scoped-control-state -->
<!-- revision_id: 7359cdcb-48e3-4902-80fb-ecb9e4874e86 -->
<!-- sha256: 1528e21b0e89e1c2564ef74f2eb3333be84e23c906b895c2aac37ec560035eb2 -->
# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: agdf-run-scoped-control-state
- lifecycle: active
- revision: 10
- revision_id: 7359cdcb-48e3-4902-80fb-ecb9e4874e86
- mode: structured_delivery
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Replace the single mutable `AGDF_RUN.md` authority with run-scoped control state so independent users,
machines and agent sessions can work concurrently without cross-run control-state conflicts.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Canonical mutable state is isolated at this run-scoped `RUN_STATE.md`; legacy `AGDF_RUN.md` is an explicit non-authoritative projection. Two UAT-preparation deltas on 2026-07-13 found and fixed real defects (Windows write-path `EPERM`; CLI crash on ambiguous multi-run selection), both with passing reviews and permanent regression coverage. |
| What is approved? | UR, PRD, SD and TP approvals were provided on 2026-07-11; `Approval: QA` on 2026-07-12 and again on 2026-07-13 for the delta fixes; `Approval: UAT` provided on 2026-07-13. |
| What is missing? | Explicit delivery authorization (commit/push/PR/release) if desired; OR is now recorded. |
| What is the next allowed action? | Offer delivery closeout (commit-ready handoff summary); VCS and release actions still require explicit separate instruction. |
| What is explicitly forbidden right now? | Release, commit, push and PR without separate explicit user instruction. |

## Source And Scope State

- normative_instruction_source: `AGENTS.md`; `plugin/meta/agdf-runtime-contract.md`
- multi_scope_state: clear
- active_scope_evidence: `.agdf/control/MASTER_BACKLOG.md`; `.agdf/control/artefacts/agdf-run-scoped-control-state/UR.md`
- competing_scope_lines: none; the unapproved `agdf-scaffold-gitattributes-default` draft is superseded by this scope
- branch_workspace_evidence: User explicitly selected the sustainable solution; durable UR and backlog now reflect that direction.
- branch_workspace_scope_effect: supports

## Run Status Card

| Run status | Value |
|---|---|
| Status | OR complete (pass); ready for delivery closeout |
| Current gate | OR |
| Allowed now | Offer delivery closeout (commit-ready handoff summary) |
| Blocked by | none |
| Missing approval | none (release/commit/push/PR still require separate explicit instruction) |
| Next step | Offer delivery closeout; commit/push/PR only on separate explicit user instruction |
| Quality outlook | Prevent parallel sources of truth by making migration and legacy precedence mechanically enforceable; keep platform-specific durability assumptions (Windows directory-fsync) and ambiguous-run-selection handling explicit so they are not silently reintroduced |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided on 2026-07-11 |
| PRD | approved | Valid post-artefact `Approval: PRD` provided on 2026-07-11 |
| SD | approved | `Approval: SD` provided on 2026-07-11 |
| TP | approved | `Approval: TP` provided on 2026-07-11 |
| QA | approved | `Approval: QA` provided on 2026-07-12; renewed `Approval: QA` for the delta provided on 2026-07-13 |
| UAT | approved | `Approval: UAT` provided on 2026-07-13 |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/agdf-run-scoped-control-state/UR.md | approved | `Approval: UR` provided on 2026-07-11 |
| Brownfield Review | .agdf/control/artefacts/agdf-run-scoped-control-state/BROWNFIELD_REVIEW.md | done | Passed; selected `structured_delivery` and existing owners mapped |
| PRD | .agdf/control/artefacts/agdf-run-scoped-control-state/PRD.md | approved | Valid post-artefact `Approval: PRD` provided on 2026-07-11 |
| SD | .agdf/control/artefacts/agdf-run-scoped-control-state/SD.md | approved | `Approval: SD` provided on 2026-07-11 |
| TP | .agdf/control/artefacts/agdf-run-scoped-control-state/TP.md | approved | `Approval: TP` provided on 2026-07-11; twenty traceable tasks |
| Brownfield Analysis | .agdf/control/artefacts/agdf-run-scoped-control-state/BROWNFIELD_ANALYSIS.md | done | Passed; clean reuse path and worktree/index boundary confirmed |
| TP Review | .agdf/control/artefacts/agdf-run-scoped-control-state/TP_REVIEW.md | done | Pass; 20/20 original; 2026-07-13 delta section reaffirms RSC-06/12/13 `fully_done`, RSC-19 `partially_done` (unrelated pre-existing Codex CLI gap) |
| Clean Review | .agdf/control/artefacts/agdf-run-scoped-control-state/CLEAN_IMPLEMENTATION_REVIEW.md | done | Pass; original plus 2026-07-13 delta section, both pass |
| Review | .agdf/control/artefacts/agdf-run-scoped-control-state/CODE_REVIEW.md | done | Pass; original plus 2026-07-13 delta section (one non-blocking advisory finding) |
| QA | .agdf/control/artefacts/agdf-run-scoped-control-state/QA_REPORT.md | pass | Original QA passed with `Approval: QA` on 2026-07-12; section 9 records the 2026-07-13 delta decision `pass` with renewed `Approval: QA` on 2026-07-13 |
| OR | .agdf/control/artefacts/agdf-run-scoped-control-state/OR.md | pass | OR-full; records original delivery plus both 2026-07-13 UAT-preparation deltas |

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: Durable state ownership, migration, CLI/CI selection, Delivery Path Search, package scaffolding and cross-surface behavior are affected.
- evidence: `.agdf/control/artefacts/agdf-run-scoped-control-state/BROWNFIELD_REVIEW.md`
- transparency_note: A focused PRD is required; implementation remains forbidden.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| User direction | supersedes | `agdf-scaffold-gitattributes-default` | User selected the sustainable run-scoped solution on 2026-07-11 |
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-11 |
| Brownfield Review | sizes | UR | Passed and selected `structured_delivery`; focused PRD required |
| PRD | derived_from | UR | Draft derived from approved UR and Brownfield Review |
| PRD | approved_by | `Approval: PRD` | Valid post-artefact approval provided on 2026-07-11 |
| SD | derived_from | PRD | Draft implements approved PRD behavior through one shared state core |
| SD | approved_by | `Approval: SD` | Exact approval provided on 2026-07-11 |
| TP | derived_from | SD | Draft maps approved SD and PRD AC 1-22 to twenty tasks and evidence |
| TP | approved_by | `Approval: TP` | Exact approval provided on 2026-07-11 |
| Brownfield Analysis | verifies | TP | Passed; CD+Tests may begin with RSC-01 |
| TP Review | verifies | TP | Passed 20/20 on final implementation and evidence |
| Clean Review | verifies | implementation | Passed; no workaround or parallel-owner finding remains |
| Code Review | verifies | implementation | Passed; no actionable finding remains |
| QA Report | verifies | TP and implementation | QA decision passed with complete evidence |
| QA_REPORT | tests | TP | QA Report section 2 records 20/20 TP coverage; section 3 records the complete validation suite |
| QA Report | approved_by | `Approval: QA` | Exact approval provided on 2026-07-12 |
| delivery-map --all-active | discovered | `AGDF_LEGACY_PROJECTION_DRIFT` | Live UAT-preparation verification on 2026-07-13 surfaced a blocking finding the original QA evidence had not caught |
| Code Review (delta) | verifies | `run-state-writer.js` fix | 2026-07-13; pass, one non-blocking advisory |
| Clean Review (delta) | verifies | `run-state-writer.js` fix | 2026-07-13; pass, root-cause-aligned, no workaround |
| TP Review (delta) | verifies | RSC-06, RSC-12, RSC-13, RSC-19 | 2026-07-13; RSC-06/12/13 fully_done, RSC-19 partially_done (unrelated pre-existing gap) |
| QA Report (delta) | verifies | delta fix and reviews | 2026-07-13; QA-gate decision `pass`, section 9 of QA_REPORT.md |
| QA Report (delta) | approved_by | `Approval: QA` | Renewed exact approval provided on 2026-07-13 |
| UAT demonstration | discovered | `AGDF_ACTIVE_RUN_AMBIGUOUS` crash | 2026-07-13; `doctor`/`gate-check`/`delivery-map` crashed with a raw stack trace on ambiguous multi-run selection instead of a structured finding |
| QA Report (delta 2) | verifies | `readRunState`/`evaluateDoctor` fix and new regression test | 2026-07-13; QA-gate decision `pass`, section 10 of QA_REPORT.md |
| UAT | approved_by | `Approval: UAT` | Exact approval provided on 2026-07-13 |
| OR | verifies | full run (original delivery plus both deltas) | 2026-07-13; OR-full, status `pass` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Legacy union mitigation was superseded | `.gitignore`; `plugin/control/README.md`; canonical run state implementation | Structural solution selection | direct |
| Runtime, CLI and Delivery Path Search consume selected canonical state | `plugin/meta/agdf-runtime-contract.md`; `create-agdf/bin/create-agdf.js`; state adapter | Final ownership | direct |
| Full final validation suite passes | control-state/DPS tests; both package smoke suites; Pages check/build; runtime integrity; package dry-run; `git diff --check` | RSC-01 through RSC-20 | direct |
| Fresh two-run CLI fixture evaluates both runs and rejects unselected single-run gate-check | temp-repository subprocess evidence on 2026-07-12 | Selection and CI aggregation | direct |
| QA gate decision passes | `.agdf/control/artefacts/agdf-run-scoped-control-state/QA_REPORT.md` | Formal QA decision | direct |
| `delivery-map --all-active` transitions from `block` (`AGDF_LEGACY_PROJECTION_DRIFT`) to `pass`, 0 findings | live CLI run on 2026-07-13, before and after the `fsyncDirectory` fix | Delta fix correctness | direct |
| `test:control-state` completes end-to-end for the first time on this native Windows environment | live run on 2026-07-13, after both the `run-state-writer.js` and `control-state-test.js` fixes | RSC-06, RSC-12, RSC-13 delta evidence | direct |
| `check-runtime-integrity.mjs` ok; `@agdf/cli` smoke-test passed; `git diff --check` clean | live runs on 2026-07-13 | Delta regression safety | direct |
| `doctor`/`gate-check`/`delivery-map` transition from an uncaught crash to a structured `AGDF_ACTIVE_RUN_AMBIGUOUS` finding on ambiguous multi-run selection; permanent regression test added | live CLI reproduction before/after the `readRunState`/`evaluateDoctor` fix on 2026-07-13; new assertions in `control-state-test.js` | RSC-09, RSC-10 delta 2 evidence | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| `create-agdf` full smoke-test aggregate completion in an environment with the Codex CLI installed | low; unrelated to control-state write logic, pre-existing before this delta | Run the aggregate on a machine/CI with Codex CLI on PATH, or accept as a known, disclosed, out-of-scope gap |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| PRD/SD never stated an explicit Windows/cross-platform acceptance criterion | medium; a future change could silently reintroduce a POSIX-only assumption | Persist the invariant in Context Graph (see Context Graph Impact below) |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: `CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: `CG-RUN-SCOPED-CONTROL-STATE` now records the Windows directory-fsync and symlink-fixture-fallback invariants alongside the 2026-07-13 delta finding, fix and re-verification (see QA_REPORT.md section 9), plus a third invariant on graceful ambiguous-run-selection handling in CLI entry points (see QA_REPORT.md section 10).

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The two invariants surfaced by this delta (Windows directory-fsync unsupported; symlink-dependent test fixtures need an EPERM fallback) are reusable across future control-state and test-harness work, not run-specific evidence.
- memory_refs: `.agdf/control/CONTEXT_GRAPH.md` node `CG-RUN-SCOPED-CONTROL-STATE`

## Closeout

- delivered: Approved TP implementation complete; TP Review 20/20 pass; Clean and Code reviews pass; QA decision pass and QA approval recorded on 2026-07-12. 2026-07-13 delta 1: a real Windows write-path defect and an unrelated test-harness gap found during UAT preparation, both fixed, all delta reviews (CR, Clean, TP, QA-gate) pass, renewed `Approval: QA` recorded. 2026-07-13 delta 2: a CLI crash on ambiguous multi-run selection (`doctor`/`gate-check`/`delivery-map`) found while demonstrating UAT, fixed at its single root cause with a permanent regression test; QA-gate decision `pass` (QA_REPORT.md section 10).
- not_delivered: commit, push, PR or release.
- verification_performed: Control-state, selector, CLI, migration, projection, concurrency and Git-conflict tests; DPS suites; both package smoke suites; Pages check/build; runtime integrity; two-run aggregate probe; tarball inspection; diff check; 2026-07-13 delta re-verification of all of the above via `delivery-map --all-active`, `check-runtime-integrity.mjs`, `test:control-state`, `@agdf/cli` smoke-test and `git diff --check`; UAT accepted with `Approval: UAT` on 2026-07-13; OR produced and recorded pass.
- unverified: `create-agdf` full smoke-test aggregate in an environment with the Codex CLI installed; downstream release behavior; whether CI runs on native Windows.
- next_allowed_action: Offer delivery closeout; VCS and release actions still require separate explicit instruction.
- quality_outlook: Run-scoped authority removes cross-run contention by construction while preserving deterministic gate legality and explicit legacy migration safety; platform-specific durability assumptions and ambiguous-run-selection handling are now explicit and Context-Graph-durable rather than implicit.
