# Implementation verification

Run: backlog-status-flow-clarity-20261009-01. Approved acceptance remains PRD.md; this file records evidence correspondence only. Source snapshot is SOURCE_DIGESTS.json and the increment after preserved opt-out work is IMPLEMENTATION.patch. All 2174 protected baseline artefacts/approved sources are unchanged (PROTECTED_SOURCES.json). No historical/foreign Run is rewritten.

Node: /usr/local/Cellar/node@22/22.22.3/bin/node, v22.22.3. Commands execute production owners in isolated fixtures. Initial old status expectations were corrected to the approved phase-specific labels; final retries are explicit, never overwritten as an original pass. Native evidence is missing and cannot be inferred from tests/build/protocol.

## Scenario correspondence

| criterion_id | design_decision_id | task_id | scenario_id | evidence status | actual evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | verified within source/browser/protocol scope | CORE_SUMMARY.json |
| AC-001 | SDD-002 | T-003 | SCN-002 | verified within source/browser/protocol scope | CODEC.json |
| AC-001 | SDD-006 | T-007 | SCN-003 | verified within source/browser/protocol scope | UI_BROWSER.json |
| AC-002 | SDD-001 | T-002 | SCN-004 | verified within source/browser/protocol scope | CORE_SUMMARY.json |
| AC-002 | SDD-001 | T-002 | SCN-005 | verified within source/browser/protocol scope | CORE_SUMMARY.json |
| AC-003 | SDD-001 | T-002 | SCN-006 | verified within source/browser/protocol scope | CORE_SUMMARY.json |
| AC-003 | SDD-005 | T-006 | SCN-007 | verified within source/browser/protocol scope | READ_PROTOCOL.json |
| AC-004 | SDD-003 | T-004 | SCN-008 | verified within source/browser/protocol scope | WRITER_TRANSITIONS.json |
| AC-004 | SDD-003 | T-004 | SCN-009 | verified within source/browser/protocol scope | WRITER_TRANSITIONS.json |
| AC-004 | SDD-003 | T-004 | SCN-010 | verified within source/browser/protocol scope | RECOVERY_CONCURRENCY.json |
| AC-004 | SDD-003 | T-004 | SCN-011 | verified within source/browser/protocol scope | RECOVERY_CONCURRENCY.json |
| AC-004 | SDD-003 | T-004 | SCN-012 | verified within source/browser/protocol scope | RECOVERY_CONCURRENCY.json |
| AC-004 | SDD-004 | T-005 | SCN-013 | verified within source/browser/protocol scope | WRITER_TRANSITIONS.json |
| AC-004 | SDD-004 | T-005 | SCN-014 | verified within source/browser/protocol scope | RECOVERY_CONCURRENCY.json |
| AC-005 | SDD-002 | T-003 | SCN-015 | verified within source/browser/protocol scope | CODEC.json |
| AC-005 | SDD-002 | T-003 | SCN-016 | verified within source/browser/protocol scope | CODEC.json |
| AC-005 | SDD-005 | T-006 | SCN-017 | verified within source/browser/protocol scope | READ_PROTOCOL.json |
| AC-005 | SDD-005 | T-006 | SCN-018 | verified within source/browser/protocol scope | READ_PROTOCOL.json |
| AC-006 | SDD-002 | T-003 | SCN-019 | verified within source/browser/protocol scope | CODEC.json |
| AC-006 | SDD-004 | T-005 | SCN-020 | verified within source/browser/protocol scope | WRITER_TRANSITIONS.json |
| AC-006 | SDD-005 | T-006 | SCN-021 | verified within source/browser/protocol scope | READ_PROTOCOL.json |
| AC-007 | SDD-005 | T-006 | SCN-022 | verified within source/browser/protocol scope | READ_PROTOCOL.json |
| AC-007 | SDD-006 | T-007 | SCN-023 | verified within source/browser/protocol scope | UI_BROWSER.json |
| AC-007 | SDD-006 | T-007 | SCN-024 | verified within source/browser/protocol scope | UI_BROWSER.json |
| AC-007 | SDD-006 | T-007 | SCN-025 | verified within source/browser/protocol scope | UI_BROWSER.json |
| AC-007 | SDD-006 | T-007 | SCN-026 | partial — fresh native evidence missing | NATIVE_OBSERVATION.md |
| AC-008 | SDD-001 | T-001 | SCN-027 | verified within source/browser/protocol scope | BASELINE.md |
| AC-008 | SDD-001 | T-008 | SCN-028 | verified within source/browser/protocol scope | CORE_SUMMARY.json |
| AC-008 | SDD-002 | T-008 | SCN-029 | verified within source/browser/protocol scope | CODEC.json |
| AC-008 | SDD-003 | T-008 | SCN-030 | verified within source/browser/protocol scope | RECOVERY_CONCURRENCY.json |
| AC-008 | SDD-004 | T-008 | SCN-031 | verified within source/browser/protocol scope | WRITER_TRANSITIONS.json |
| AC-008 | SDD-005 | T-008 | SCN-032 | verified within source/browser/protocol scope | READ_PROTOCOL.json |
| AC-008 | SDD-006 | T-008 | SCN-033 | verified within source/browser/protocol scope | UI_BROWSER.json |
| AC-008 | SDD-006 | T-009 | SCN-034 | reviews executed; QA revise recorded; native obligation remains open | ../CODE_REVIEW.md; ../TASK_PLAN_REVIEW.md; ../CLEAN_IMPLEMENTATION_REVIEW.md; ../QA_REPORT.md |

## Commands and outcomes

- Focused Core summary: tests/summary-final-bounds.json; eleven grouped cases plus encoded-source negative case through real policy/QA owners.
- Codec/Run-step/concurrency/source revisions: tests/metadata-boundary-results.json; decoded/input/output caps, exact captured recovery bytes, actual revision and two-worker markers.
- Existing writer/revision/recording/next-action/selected projection and recovery: tests/final-core-results.json. control-state-test initially failed its old generic In Progress expectation; tests/control-state-retry.json records the corrected expectation passing. Earlier source-revision generic-status failure is superseded by its explicit final/metadata passing result.
- Existing saved-only list/scoped read/title/read-provider lanes: tests/core-regression-results.json contains their successful outcomes. Its earlier source-revision failure is retained for audit; later individual final results are the authority for that retry.
- npm --prefix packages/control-ui run test: exit 0; 8 Service cases, 14 component files/134 tests. UI_BROWSER.json records the actual tool session and counts; READ_PROTOCOL.json records the added HTTP one-file/no-write/same-meaning case.
- npm --prefix packages/control-ui run typecheck, build, build:mcp: exit 0. Actual MCP resource identity is in READ_PROTOCOL.json; final browser fixed asset digests and seven passing results are in UI_BROWSER.json/tests/browser-final-report.json.
- Prepared current-source MCP cockpit legacy/modern, semantic contract and continuation; Copilot profile/payload budget: tests/protocol-package-results.json, all six commands exit 0. READ_PROTOCOL.json records the final verified prepared identity; tests/protocol-bounds-results.json records the two affected final passing checks after the last path guard; no installed/native claim follows.
- node scripts/verify-ci.mjs --stage transactions: exit 0, transaction/Backlog writer/new summary/new codec/Run-lock lanes. Additional metadata assertions were subsequently executed in their directly affected owner tests.
- git diff --check: exit 0. The existing architecture document/template point to real Core owners and the actual Run-local evidence, with no new acceptance or policy owner. Template vocabulary follows shared.js; payload budget remains exact, recorded in PACKAGING_ASSESSMENT.json. No full release or cross-host compatibility claim.

## Architecture and flow

Core is the sole descriptive summary owner; transition/next-action/QA route and human approval keep their original authority. Writers share row/marker planning and actual resulting revision, preserve the existing lock order and Run commit point, revalidate consumed review bytes and recover captured Backlog bytes. Exceptional relationship/recovery paths retain their existing journals, expose pending correspondence and require explicit scoped synchronization. Read lists remain Backlog-only; selected comparison uses the same immutable observation and valid seal, without following marker paths or changing control. UI/HTTP/MCP only validate/project/render.

Supported old layouts/aliases/DTOs retain original stored text and conservative provenance. Invalid/foreign/ambiguous records are diagnosed, never promoted to current or authoritative. No bulk backfill, automatic archive, list-wide Run/report scan, new SoT, UI evaluator, changed gate order or approval shortcut. Exact protected sources and prior opt-out changes remain separately evidenced.

## Remaining applicable evidence

BSC-NATIVE-001, evidence_gap -> evidence_obligation: SCN-026/T-007 fresh native resource/runtime/UI binding and visible narrow/wide/keyboard/scroll/retry sequence missing. NATIVE_OBSERVATION.md identifies the supported older stale view and prepared required sequence. The TP explicitly excludes installation/host configuration and foreign Finding closure. QA must remain revise until the current supported host observation and refreshed reviews establish that evidence.

- memory_target: scope_artifact
- memory_reason: run-specific evidence belongs in these artefacts; architecture owner remains the existing document/Core.
- memory_refs: this Run evidence directory; docs/architecture/06-agdf-cockpit.md
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: no new graph ownership, SoT or memory update is claimed; this TP excludes graph/memory changes.

## Final review/QA record

Code Review and Clean Implementation Review: pass evidence dimensions. Task Plan Review: revise, T-007/SCN-026 and AC-007 partial. qa-gate: revise; QA_REPORT.md is canonically tests-bound to the exact approved TP, recorded at revision 17 / e1f31de3-9808-43a4-ba6f-04787431bde2. T-009/SCN-034 review/assessment execution is complete; it preserves rather than resolves BSC-NATIVE-001. No human QA approval or native installation/qualification is claimed.
