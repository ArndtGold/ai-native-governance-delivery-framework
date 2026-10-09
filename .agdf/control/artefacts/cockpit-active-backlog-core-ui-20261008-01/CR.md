# Code Review
Date: 2026-10-08
Run: cockpit-active-backlog-core-ui-20261008-01
Reviewer: Codex (same-agent review, not independent human assurance)

- decision: pass
- scope: actual tracked diff plus new cockpit-list.js/declaration, BacklogRows.tsx and focused Core tests; impacted App navigation/reducer, title cache, DTO/session/parser and package projection boundaries inspected.
- findings: no unresolved concrete code defect in the reviewed scope.
- resolved finding: a valid Run key equal to a view-control focus ID could restore focus to the search field instead of its row. App now restricts overview return focus to row actions. SCN-020 regression with key backlog-search passes in the final 129-component suite.
- evidence: one pure Core selected-area/order/search/completeness/identity owner; frozen-input and raw-index tests; per-field search does not concatenate fields or use supplementary headings; source-bound rows retain raw selectors; selected diagnostic scope and nonselectable duplicates remain conservative; unknown counts reject at adapters; stale/failed/expired actions disable; named-capture cancellation safeguard and document/context/session authority remain intact. Passive React output creates no HTML execution or writer path. Source/target/package boundaries and private exclusions reviewed.
- risks: five rows can be tall for pathological titles; titles intentionally remain readable. No host fixed-height assumption is made.
- missing_evidence: fresh actual native rendering and app-only canonical-byte qualification remain open in TPR-001, owned by the task/evidence dimension. CR pass does not close that obligation or decide QA.
- required_next_step: submit the reviewed implementation and explicit TPR-001 evidence gap to the sole QA owner.

## Normalized Findings
| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | App.tsx overview focus target restriction; compact.test.tsx SCN-020 valid run key colliding with search ID; final suite passes | Preserve the regression when changing focus restoration |

## Review scope and limits
Review prioritised identity/data integrity, asynchronous response replacement, cancellation, DTO compatibility and single ownership. All changed application files and adjacent impacted code were inspected, with actual test/build results rather than intent-only assessment. No release, remote host or independent reviewer claim is made. The approved scope, artefacts and human approvals were not changed. EVIDENCE_BUILD.md, EVIDENCE_UI.md and EVIDENCE_NATIVE.md distinguish automated, protocol, browser and missing native evidence.
