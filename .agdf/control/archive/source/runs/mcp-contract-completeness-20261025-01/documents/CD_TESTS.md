# CD+Tests: guarded C2 completion

Decision: pass
Gate: CD+Tests
Date: 2026-10-25
Owner: Codex implementation and verification

## Binding and fulfilled implementation/test scope

Run mcp-contract-completeness-20261025-01. Renewed TP sha256:52f644123916ad5db5b102d8508d094db110a6e3d032e3ed23a2febdec7f0adb was approved by operation d0d35927-8826-4b89-a9bb-45cb08641285; BROWNFIELD_ANALYSIS-03.md and operation 9c889873-585f-4bd0-a77c-6f970645f3d5 establish the fresh preparation. UR/PRD/SD remain exact. Candidate HEAD c327c50deae6e5b4fd8071c9e03b1ef2803df6ae plus retained scoped diff, source/runtime/SDK/archive/harness identity and applicability are recorded in evidence/c2-prerequisites-01/.

T-001 through T-009 are fulfilled for implementation and tests. T-010 formal task/clean/code review and sole QA assessment remain the next work; this internal pass is not QA, UAT, release or VCS approval.

## Retained deterministic evidence, freshly assessed

BROWNFIELD_ANALYSIS-03.md and c2-prerequisites-01/source-freeze.json compare complete Core/CLI/MCP/UI source inventories, tested repaired harness/verifier, locked manifests, baseline and unchanged original native records. Runtime-freeze.json matches the assembled server/dispatcher/SDK to prior observed digests. Archive-applicability.json matches all three tarballs against the retained npm pack SHA-512 integrities. This establishes exact applicability under the renewed TP without claiming that unchanged broad tests were rerun.

Applicable evidence in implementation-02 records twenty passed MCP test files, relevant Core and CLI checks, 45 ergonomics unit tests, 56 deterministic compatibility scenarios, canonical prepare/build, actual normal archive consumers, all five command schemas/help and both protocol eras. Implementation-03 contains the repaired auditor/guard and model-free/argument guard regressions. Discovery maximum is 7083 bytes per command and 24509 aggregate including Decision against 8192/24576; input/result stay 65536/1048576. Qualified fixed-fixture 20 cold/20 warm p95 is 1011.622/670.668ms against unchanged 1500/1000ms. The accidentally contended failed measurement and original CLI/cache/build failures remain retained; none was discarded or concealed. This benchmark is the unchanged standalone MCP fixture, not end-to-end model response time.

The Copilot baseline remains exactly 397 files / 3509461 bytes with zero headroom. All original source mapping, profile exclusions, SDK/dependency versions and approval/effect boundaries remain fixed. No real installation or foreign evidence cleanup occurred.

## Two additional real sessions

Current model-free C2 preflight passed with zero model invocations, identical protected manifests and expected candidate/OS guard. Both additional T7 sessions are evidence_class native_host_observation, not mocks or preflight. Both used Codex CLI 0.163.0 on darwin-x64, observed gpt-6.1-sol and effort low, the same candidate/harness/verifier/guard, and the existing ChatGPT account. Each authoritative fixture predicate and strict trace verifier passed exactly one original, correctly bound UR approval after technical bindings were read through MCP; no detours/replay/foreign effects. Before/pre-session/after manifests are identical within each repetition and across the pair. Own temporary fixtures were removed; existing personal settings/session records and the old trust entry were not cleaned.

| C2 repetition | task / strict / isolation | MCP calls | SDK-invalid arguments | isError results | wall time ms | input tokens | cached input tokens | output tokens |
|---|---|---|---|---|---|---|---|---|
| 1 | pass / pass / unchanged | 13 | 8 | 9 | 85665 | 433790 | 396672 | 1805 |
| 2 | pass / pass / unchanged | 13 | 7 | 8 | 81495 | 397640 | 361344 | 1692 |

All corrected errors are retained. Task success does not mean error-free or efficient tool use. Reported C2 usage totals 831430 input tokens (758016 cached) and 3497 output tokens; dollar cost is unavailable, and normal account quota was consumed. No API-key fallback, additional API spending route, credential copy or installation was used. There are exactly three real invocations in this Run: the original failed-isolation session plus these two; no further model session was started.

Original C2 reports, events, rollouts, effective configuration and final texts are immutable under evidence/c2-native/repetition-01/ and repetition-02/, each with a retention manifest. Summary is evidence/SCN-020-native-summary.json. The original failed cohort remains unchanged and unqualified under evidence/native-01/; its derived auditor reanalysis does not waive its settings violation. Cohorts differ in the guard/verifier and are not compared causally or as an improvement/success-rate benchmark.

## Criteria and task disposition

The approved PRD remains the sole acceptance owner. All AC-001 through AC-008 and SCN-001 through SCN-020 now have applicable evidence in c2-prerequisites-01/criterion-evidence-assessment.json and the cited original logs/observations. T-001 preparation; T-002 SDK/transport; T-003 input/help; T-004 result checks; T-005 metadata/package baseline; T-006 functional/safety/provenance; T-007 unchanged budgets; T-008 tested native guard/verifier; and T-009 two additional guarded real sessions are fulfilled. T-010 is pending formal reviews and QA preparation, not silently marked complete here.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| F-003 | implementation_gap | CD+Tests | resolved | Tested Promise/SDK-error auditing and all-three-file direct/atomic write guard; both actual C2 observations qualify with complete trace and unchanged manifests | none |
| F-004 | emergent_risk | TP | resolved | earliest-owner assessment: TP. Direct owner C2 decision, approved renewed TP 52f644123916ad5db5b102d8508d094db110a6e3d032e3ed23a2febdec7f0adb, original failed cohort retained and total three real invocations respect the new exact allowance | none |
| E-001 | evidence_gap | evidence_obligation | resolved | Two current qualified C2 native observations and exact same-tuple/guard/immutable-settings proof in c2-native/summary.json; old failure retained | none |

## Remaining qualification limits and next step

These are two fixed synthetic presented-UR task repetitions on one exact macOS/Codex tuple. Several SDK argument mistakes and failed tool calls occurred before correct completion; no comparative ergonomics improvement, native cross-host/production qualification or independent human-origin proof is established. Standalone MCP performance and model-session wall time are separate measurements. The original failed fixture's personal trust entry remains untouched, as explicitly outside this scope.

Required next step: perform and record task-plan-review, clean-implementation-review and code-review using the actual current diff and this evidence, then let qa-gate alone decide final Quality Readiness. No QA/UAT/release/VCS action is inferred from this CD+Tests pass.
