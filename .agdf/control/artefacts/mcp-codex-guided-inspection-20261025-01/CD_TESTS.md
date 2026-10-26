# CD+Tests: final runtime qualified and direct test correction verified

Decision: pass
Gate: CD+Tests
Date: 2026-10-25
Owner: Codex

## Current scope and authorization

Approved TP sha256:094ac6cef506aa40ccfb04cfc88056420c15f65963d650847f27d1c3bdcd04bb, exact UR/PRD/SD and post-UR Review remain unchanged. Current implementation preparation is BROWNFIELD_ANALYSIS_PAIR_03.md, recorded at revision 25. This report supersedes the current CD_TESTS_PAIR_03.md result, retaining it as historical evidence; it is implementation/test evidence, not QA or human approval.

The user expressly authorized the already diagnosed one-line test repair outside AGDF, then requested evidence reconciliation, reviews and QA. DIRECT_FIX_AUTHORIZATION_04.md records the exact scope and sequencing. This is a disclosed human-authorized post-qualification test-only exception to the TP freeze; no renewed TP approval, applied source revision or extra model allowance is claimed. There is no changed product/design/acceptance source to invent or backfill.

## Actual test completion and source applicability

The sole post-native source change is result.stdout to result.stderr in the existing unsupported-platform negative test. Both nonzero exit and exact T7_GUARD_APPLICATION_UNAVAILABLE assertions remain. The runtime correctly reports the early unsupported-platform exception to stderr. No assertion is skipped or weakened.

evidence/direct-fix-04/darwin.log records all four existing test groups passing in 119,405.023 ms on actual macOS with synthetic hosts, including settings write/atomic-replace denial, two fresh mock fixtures, account-home/API exclusion, flag/tamper refusal, positive controls, application classification and setup/worker/teardown deadlines. evidence/direct-fix-04/platform.log records the actual affected branch passing with a process.platform override inherited by its Node children. This is explicitly a simulation on macOS, not Linux qualification. These checks invoked zero real models and do not consume or replenish the native ledger.

evidence/direct-fix-04/assessment.json rechecks all 19,339 historical frozen paths and confirms that only the test assertion file changed. It verifies all 14 root/candidate bound sources, all 53 evidence references for the 24 mapped scenarios, 626 prestudy original/retained pairs and 10 current-native original/retained pairs. A separate post-fix-candidate.json records current bytes; the original frozen manifest, native bindings, raw traces and ledgers remain untouched. Runtime/guard/task/audit, locked dependencies, assembled Core and UI bytes are unchanged, so the two native runtime observations remain applicable after this explicit assessment. No new native execution on the changed test snapshot is claimed.

## Retained qualification and unchanged limits

The current pair-* checks and exact-source assessment retain 247,003 SDK acceptance comparisons with zero differences, 160 frozen Core outcomes, 24 original input replay cases with all 15 original SDK errors still rejected, actual installed-host visibility of 14 fields/11 operations, current CLI and modern/legacy STDIO protocols, normal build, 56 deterministic compatibility cases and unchanged writer/recovery suites. Complete earlier MCP/Core suites remain evidence only for the assessed unchanged subpaths. Their passing labels are not transferred to a different runtime.

Inspect is 4,993 <=5,000 bytes; command aggregate 23,254 and command/decision aggregate 24,509 <=24,576; command/input/output ceilings remain 8,192/65,536/1,048,576. Copilot is 397 files/3,509,461 bytes at its unchanged ceiling. The original fixed performance route remains cold p95 701.422 <=1,500 ms and warm p95 426.184 <=1,000 ms. A test-stream-only edit does not change these inputs; no favorable resampling or redundant model/build run was performed.

The retained pair-guidance-01 native-summary.json reports two qualified normal T7 sessions, each original/strict pass, one intended UR approval, four MCP calls and zero SDK/other errors or shell detours, with complete traces and observed gpt-6.1-sol/low on CLI 0.163.0, Node 22.22.3, darwin x64. Actual model times are 29,679 and 28,541 ms. Integrated controller/preflight, guard controls, complete Root/control/settings/staging comparisons and frozen candidate preservation passed. The prior cohort remains two consumed sessions, including its 1/2 PRD outcome. Exactly four real sessions exist across both cohorts, zero additional since qualification; no retry/resume/replacement was executed.

evidence/checks/preservation-direct-fix-04.json confirms unchanged HEAD, exact index, 14 foreign staged files, five foreign untracked files, 11,129 other control files and the three protected settings. No credentials, global settings, installed runtime or foreign data were handled. The final scope and evidence are reconciled in evidence/direct-fix-04/final-scope.json.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CGI-NATIVE-FINAL-01 | evidence_gap | evidence_obligation | resolved | Immutable pair-guidance-01 native-summary and raw manifests: two current-runtime original/strict successes, four calls/zero errors each; post-fix assessment proves unchanged runtime inputs | none |
| CGI-TEST-STREAM-01 | implementation_gap | CD+Tests | resolved | Explicit direct human authorization; exact one-line stderr correction; four actual macOS test groups and the simulated unsupported-platform branch pass; assessment.json and preserved original native manifests | none |

## Next required step

Complete current Task Plan, Clean Implementation and Code Reviews, then let qa-gate alone decide pass, revise or block. No QA/UAT approval, Git handoff, installation, release or other-host/native Linux qualification is claimed.
