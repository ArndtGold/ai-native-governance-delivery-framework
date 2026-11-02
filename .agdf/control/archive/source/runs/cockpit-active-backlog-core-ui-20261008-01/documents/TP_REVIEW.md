# TP Review
Date: 2026-10-08
Run: cockpit-active-backlog-core-ui-20261008-01
Reference: exact approved TP.md and approved PRD/SD criteria chain.
Decision: revise (evidence obligation; no changed product scope)

## TP Coverage
| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| T-001 | fully_done | BROWNFIELD_ANALYSIS.md, IMPLEMENTATION_BASELINE.json; exact source digests and baseline verified before implementation | none | Preparation satisfied; high confidence |
| T-002 | fully_done | Pure Core helper/declaration/parser reuse; EVIDENCE_CORE.md 63 passing cases; UI source-field presentation | none | AC-001/002/003/006/007 implementation covered; high confidence |
| T-003 | fully_done | Overview/CompactCockpit shared projection/rows and App view props; component parity and five-row/full-search browser journey | native proof belongs to T-007 | AC-002/004 implementation and browser coverage done; high confidence within scope |
| T-004 | fully_done | App/hook/reducer integration; title cancellation/cache, exact return/removal/preview/collision, deliberate stale reload, scoped capture barrier and retry tests | native proof belongs to T-007 | AC-003/006/007 covered; high confidence |
| T-005 | fully_done | Eight visually inspected browser width/theme captures, geometry and 44px/focus assertions, full disclosure suffix and Enter/return journey | actual native width belongs to T-007 | AC-005 browser coverage done; high confidence within scope |
| T-006 | fully_done | Typecheck, builds, projection byte/exclusion, payload/variant/config checks, runtime integrity and fresh stdio suites; focused docs | none | AC-008 packaging/regression covered; high confidence |
| T-007 | partially_done | Final owned local preparation, matching manifest/resource protocol results and project connection binding | Fresh native rendering, host display result/actual width and all-control-file app-only path/byte equality: SCN-010/014/024 | AC-004/005/008 partial; QA must not pass |
| T-008 | fully_done | Actual final diff reviewed; CR.md and CLEAN_IMPLEMENTATION_REVIEW.md; this task/UX matrix and explicit QA handoff | T-007 is deliberately open, not hidden as done | Review/evidence collation complete; no QA decision delegated |

## Summary
- fully_done: 7 of 8 tasks.
- partially_done: T-007.
- not_done: none.
- out_of_scope_changes: none in source; pre-existing current-run control work preserved. Local ignored runtime/config preparation is within T-007. No commit/push/PR/release.
- criteria: AC-001/002/003/006/007 done within their mapped observations; AC-004/005/008 partial because their required native edges are not yet verifiable.
- risks: browser/protocol success cannot establish Codex display or native no-write. Native evidence is QA-relevant regardless of absent numeric task priorities; no invented priority scheme.
- required_next_step: complete the fresh native T-007 qualification after reconnect and side-panel access.

## UX Intent Fidelity
| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | Active/planned/archive discovery | T-002/T-003 | Active membership, stored Completed and reverse source sequence in component and browser list | fulfilled | none |
| AC-002 | Compact and expanded same observation | T-002/T-003/T-006 | Component parity, same query/order before compact limit, both successful bundles | fulfilled | none |
| AC-003 | Stored-field search and source details | T-002/T-004 | Heading-only exclusion/metadata completion browser test; primary stored title and supplementary disclosure | fulfilled | none |
| AC-004 | Five-preview, search and host expansion | T-003/T-007 | Browser five-preview/full search/query-preserving expansion passes; actual host result absent | partial | evidence_gap |
| AC-005 | Readable long rows, details and keyboard | T-005/T-007 | Eight browser captures, 44px and no-overflow measurements, full suffix, Enter and focus; actual native width absent | partial | evidence_gap |
| AC-006 | Empty/partial/unavailable/stale/retry/expiry | T-002/T-004/T-006 | Component states and rendered light/dark deliberate-reload/retry views; no false exhaustive zero | fulfilled | none |
| AC-007 | Exact selected run and return route | T-004 | Browser Enter/return focus, preserved query, component removed/preview/collision cases, scoped capture barrier | fulfilled | none |
| AC-008 | Read-only bounded authority and native proof | T-006/T-007 | Fixture browser/protocol byte equality and package/session/security regressions; required native app-only window absent | partial | evidence_gap |

## Normalized Findings
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-001 | evidence_gap | evidence_obligation | open | EVIDENCE_NATIVE.md; missing SCN-010/014/024 fresh native rendering/width/expansion and app-only path-byte manifests | Execute approved T-007 qualification using a freshly loaded matching connection and accessible App surface |

## Evidence interpretation
The approved TP's SCN-021 barrier path is clarified to browser/scoped.spec.mjs, which actually owns and executes it. All criterion/decision edges have an implementation/evidence entry or the explicit TPR-001 gap. No missing requirement/design/plan is invented. Context graph impact none, reconciliation not_applicable, required action none; evidence remains in scope artefacts.
