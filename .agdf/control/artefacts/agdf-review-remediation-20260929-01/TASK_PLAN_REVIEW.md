# Task Plan Review: Review v2 remediation

Status: revise
Decision: revise
Date: 2026-09-29
Run: `agdf-review-remediation-20260929-01`
Based on: approved TP revision 12, Brownfield Analysis, local CD+Tests and the actual worktree diff
Evidence confidence: high for local source/fixtures; low for external CI, registry and loaded-host behavior

## TP Coverage

| task_id | status | AC coverage and evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | AC-001/003/004: baseline commit `737457b` temp archive reproduced C1–C6, including two child processes whose successful C2 Run writes lost one Backlog row; C7 has a postcommit-like durable-state counterexample. Direct-reader and neighboring-run boundaries are in CD+Tests | C7 cleanup error itself was not injected; its indistinguishable durable residue was checked | Baseline requirement met with a bounded C7 counterexample; final regressions are independently tested |
| T-002 | fully_done | AC-001: intent, OR, Run and Backlog failpoints, existing listed OR, concurrent writers and out-of-band Backlog conflict pass `test:run-step-transaction` | none locally | no implementation gap evident |
| T-003 | partially_done | AC-002: owner metadata, live/dead/ambiguous lock cases, invalid/missing seal and approval rejection pass focused suites on macOS | Actual Windows owner-process recovery and exact CI log | prevents cross-platform QA pass |
| T-004 | partially_done | AC-003: shared path predicate rejects drive-relative, UNC/device, absolute, traversal and symlink escapes in Run, Verified Change and seal fixtures on macOS | Execute the same path matrix on Windows CI | prevents cross-platform QA pass |
| T-005 | fully_done | AC-004: atomic config replacement, plan/apply digest checks, symlink/marker swap and replaced runtime tree pass lifecycle/OpenCode tests | none within temporary-host scope | no implementation gap evident |
| T-006 | fully_done | AC-005: prepared/committed transaction, cleanup failure, stable digest, backup identity and missing-prior-backup fixtures pass | Live installed-host behavior is outside the approved temporary-root test | no implementation gap evident |
| T-007 | fully_done | AC-006: only coupled `agdf-v*` workflow remains; 44 version surfaces, stale-lock fixtures and local `npm ci` pass; workflow validation order is checked | CI execution belongs to T-013 | no source-level release-route gap evident |
| T-008 | fully_done | AC-007: all three package sources contain LICENSE/NOTICE; dry-run tarball inventory and removal negatives pass | none locally | no package-content gap evident |
| T-009 | fully_done | AC-008: registry classifier tests all-absent, all-published, partial and unknown; workflow preflight/complete/failure readback and `RELEASE.md` require operator decision | Live registry observation is a separate release evidence obligation | no automatic unpublish or false complete claim evident |
| T-010 | fully_done | AC-009: canonical installed path, 12 generated projections, packed layout and drift negatives pass | Fresh loaded-host behavior is outside the projection claim | no source-projection gap evident |
| T-011 | partially_done | AC-010: each curated replay has its own checked fingerprint; `eval:skills` passes 90/90; README/INSTALL/privacy/terms/site copy separates local and host evidence | Exact tagged public-package comparison and dated loaded-host observation for any host claim | limits public-version claims |
| T-012 | partially_done | AC-011: full SHA action pins, least-privilege workflow declarations, declared dependencies and simulated registry classifier pass static tests | Exact affected CI run and registry-side credential/provenance observation | prevents release-readiness claim |
| T-013 | partially_done | AC-001–011: focused suites, final full local aggregate smoke, package/website builds, maintenance contracts and diff check pass | Clean Linux/Windows job logs and publish validation for one candidate commit | prevents QA pass |

## Summary

- fully_done: 8/13 tasks
- partially_done: 5/13 tasks
- not_done: 0/13 tasks
- out_of_scope_changes: preexisting MCP inspect README, INSTALL, architecture and protocol-test edits belong to `agdf-mcp-inspect-slice1-20260929-01`; no C8–C10 or broad package-payload decision is claimed here
- risks: local macOS fixtures and static workflows cannot prove Windows lock/path behavior or a registry publish
- required_next_step: Obtain exact Linux/Windows CI and release operator readbacks for one candidate commit before requesting a QA pass.

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | Run/OR/Backlog commit or recovery | T-002 | Run-step JSON and four fault-boundary readbacks name committed/recovered state | fulfilled | none |
| AC-002 | live/dead lock and seal authority | T-003 | Local lock and seal rejection fixtures; no Windows process observation | partial | evidence_gap |
| AC-003 | Run/Verified Change path evaluation | T-004 | Local path matrix and status-card negatives; no Windows execution | partial | evidence_gap |
| AC-004 | host file write/removal | T-005 | Temporary config parseability and ownership-conflict result JSON | fulfilled | none |
| AC-005 | marketplace prepared/committed recovery | T-006 | Temporary stable/backup provenance and result readbacks | fulfilled | none |
| AC-006 | coupled npm release | T-007, T-013 | Static workflow route, lock checks and local package build; no exact CI publish validation | partial | evidence_gap |
| AC-007 | package inventory | T-008 | Three exact dry-run tarball listings and missing-file negatives | fulfilled | none |
| AC-008 | partial publication | T-009 | Simulated machine-readable `published/absent/unknown` report and documented operator decision | fulfilled | none |
| AC-009 | installed guard projection | T-010 | Packed temporary-install path/fingerprint and drift negatives; no fresh loaded-host transcript | partial | evidence_gap |
| AC-010 | Eval and public copy | T-011 | 90 curated replay cases and source/website diff; no exact tagged-package/host comparison | partial | evidence_gap |
| AC-011 | CI and release permissions | T-012, T-013 | Workflow parse/static checks; no affected CI or registry-side credential readback | partial | evidence_gap |

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| R2-TPR-02 | evidence_gap | evidence_obligation | open | No exact candidate Linux/Windows CI job logs for SCN-004/006/015/023/024 | Run affected CI jobs on one committed candidate and attach OS, commit, job ID and result. |
| R2-TPR-03 | evidence_gap | evidence_obligation | open | No exact registry credential/readback or tagged public package comparison; no fresh loaded-host observation | Record registry/package/host observations for the precise version before making the matching release or host claim. |

Context Graph: `link_only` to `CG-RUN-SCOPED-CONTROL-STATE`, `CG-PUBLIC-PLUGIN-DISTRIBUTION` and `CG-REQUEST-ACTIVATION-AUTHORITY`; CD+Tests and this review are the visible run-specific evidence. No new node or policy owner is introduced.
