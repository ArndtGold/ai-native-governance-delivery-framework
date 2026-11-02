# CD+Tests: MCP contracts and bounded native observation

Decision: revise
Gate: CD+Tests
Date: 2026-10-25
Owner: Codex implementation and verification

## Source and candidate binding

Run mcp-contract-completeness-20261025-01; approved TP sha256:b928e629d5073e5faf23fb8bf869d73135314303f89411afc8aee8ae6331e2f6; approval operation 174e2045-53d0-48ce-ae24-21ec7928ee52. Renewed Brownfield Analysis is BROWNFIELD_ANALYSIS-02.md, recorded by f9cab124-934c-4c1e-88cc-d45dc7067138. UR/PRD/SD remain byte-identical to their approved sources. HEAD is c327c50deae6e5b4fd8071c9e03b1ef2803df6ae plus the retained scoped uncommitted diff. The isolated candidate is /private/tmp/agdf-contract-candidate-3ahp_a7h. Executable product sources and package contents are bound in evidence/implementation-02/source-manifest-renewed.json, actual discovery/protocol provenance and archive-consumer outputs. Later native-auditor/guard changes have their own implementation-03 manifest; no packaged MCP/Core source changed after functional verification.

## Actual deterministic results

- Canonical build:prepare and build passed in the isolated candidate using Node 22.22.3 and locked offline dependencies. UI resources were freshly built. The original checkout's foreign dependency leftovers and incomplete dist were preserved.
- All-profile generation and Copilot inventory passed: 397 files, exactly 3509461 bytes, zero headroom. Only the approved max_bytes baseline changed. All source mappings, profile exclusions and MCP budgets remain enforced.
- Twenty MCP test files passed, including dual-era wire behavior, full structured flows, eighteen source/phase revision cells, all seven tool-family errors/faults, generation, safety, worker lock/deadline, provenance, package and SDK digest. Current Core command/service/error/revision/lock tests passed. The complete ergonomics unit suite passed 45 tests; focused native-parser tests passed 22 after the observed verifier repair.
- Required CLI checks passed. A parallel-load facade deadline failure was retained; the unchanged test passed at lower concurrent load, including all five real facade termination cases. No timeout was raised.
- Compatibility recording passed 56 scenarios. An append-only new observation and the derived comparison were projected only after root/candidate source AND generated-payload fingerprints matched. Every protected historical/native input remained byte-identical. Root compatibility:check passed. This is deterministic adapter evidence, not new native host qualification.
- All three normal npm archives and their actual consumer checks passed: Core bytes, manifests, CLI/bootstrap/exports, blocked-network offline profiles and both MCP protocols. The first pack failed on the global npm cache's denied write; the successful run used a task-owned temporary cache. No global permissions were changed.
- Actual assembled tools/list for legacy and modern ordinary/decision compositions: all five command tools have eleven documented input fields and outputSchema. Largest command is 7083 bytes; ordinary aggregate 23343, decision aggregate 24509, against unchanged 8192/24576 limits. Input/result limits remain 65536/1048576.
- The first performance attempt accidentally overlapped the last package checks and failed cold p95 at 1564.830 ms; all its samples are retained. The subsequent prescribed quiescent final-candidate measurement retained all 20 cold and 20 warm samples and passed: cold p95 1011.622 ms, warm p95 670.668 ms, against unchanged 1500/1000 ms. No sample, threshold or fixture was changed.

Evidence and failed attempts are retained under evidence/implementation-02/. These passes establish the stated deterministic scope, not final QA or native acceptance.

## Native session and repair

Exactly one real model session ran: Codex CLI 0.163.0, gpt-6.1-sol, observed reasoning low. It correctly approved the presented fixture UR once after obtaining technical bindings through MCP. Nine MCP calls were observed: eight inspect and one approve, with five isError results including three SDK input rejections. Model execution took 44439 ms; reported usage was 290992 input tokens (251648 cached) and 1093 output tokens. Dollar cost is unavailable; normal account quota was used. No new API-key route, installation or credential copy occurred.

The original run failed qualification because config.toml changed. A new trusted-project key matches the exact fresh fixture target hash. The original before-config bytes were not captured, so no complete textual configuration diff is claimed. The entry is left untouched. Original observation, events, rollouts, effective config and final text are preserved byte-identically in evidence/native-01/ with a retention manifest.

Two verifier defects were repaired from the observed trace: pure Promise .then projection was falsely classified as a detour, and plain-text SDK input rejection was wrongly required to be a JSON domain result. Focused regressions preserve forbidden-effect checks and reject unclassified unreadable failures. Derived-wrapper-reanalysis-02.json verifies complete trace, no detours and exactly one correctly bound approval; it explicitly retains overall_qualified=false for the original configuration violation.

The existing T7 owner now enforces an OS write-denial boundary for the three protected settings files across preflight and exec, with before/pre-session/after manifests and no guard fallback. Offline fake-host tests deny direct writes and atomic replacements for all three files, preserve the existing account-home route, bound invocations and keep T4/default behavior. A real-CLI --preflight-only run passed with zero model invocations and unchanged protected manifests (evidence/guarded-preflight-01/). Actual model execution under the repaired guard remains unverified.

The approved TP configuration C explicitly stops the second session after the first infrastructure/isolation failure. Accordingly, the old second repetition was not started, and no additional real model session was attempted after the repairs.

## Task and criterion disposition

| task_id | status | evidence or remaining obligation |
|---|---|---|
| T-001 | fully_done | Renewed approved-source Brownfield Analysis and canonical record |
| T-002 | fully_done | Public Transport seam; raw wire capture and dual-era gating/lifecycle tests |
| T-003 | fully_done | Shared expanded/compact input help; Core/SDK parity and actual discovery |
| T-004 | fully_done | Full result checks, compact output schemas, negative/fallback/fault and structured-flow results |
| T-005 | fully_done | Exact Copilot baseline, metadata/source/generated/archive consistency, canonical build and consumers |
| T-006 | fully_done | Twenty MCP test files and required Core/CLI checks; retained diagnostics and final passes |
| T-007 | fully_done | Four actual assembled discovery compositions and full quiescent 20+20 sample arrays |
| T-008 | fully_done | Focused parser/guard offline regression tests and real model-free guarded preflight; no claim of new native qualification |
| T-009 | partially_done | One functional native task completed but failed config isolation; two qualified repetitions remain absent |
| T-010 | not_done | Formal task/clean/code reviews and sole QA assessment remain blocked by incomplete native evidence and the required TP-owner decision |

AC-001 through AC-007 have their scoped deterministic evidence. AC-008 / SCN-020 remains open; no two-session native pass, QA pass, UAT, release, VCS handoff or installed-host qualification is claimed.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| F-003 | implementation_gap | CD+Tests | resolved | Observed pure Promise projection and SDK-input rejection auditing repaired with focused regressions; immutable settings enforced by macOS guard, direct/atomic writes tested for all three files; real model-free guarded preflight passed | none |
| F-004 | emergent_risk | TP | open | earliest-owner assessment: TP. Configuration C stopped after the actual personal_config:config.toml change; the exact native execution/evidence plan and any additional account-quota authority belong to TP. UR, PRD acceptance, SD ownership and MCP limits remain unchanged. NATIVE_FOLLOWUP_PROPOSAL-01.md specifies C2, two additional real invocations and retained failed cohort | Obtain the TP owner's substantive decision on the bounded C2 proposal before any approved-source revision or extra real session |
| E-001 | evidence_gap | evidence_obligation | open | evidence/native-01/ proves the task effect but preserves failed isolation; guarded-preflight-01/ is explicitly model-free. Two qualified T7 repetitions do not exist | Capture both qualified repetitions only after the execution plan is explicitly renewed and approved |

## Required next step

Resolve the concrete TP-owner decision in NATIVE_FOLLOWUP_PROPOSAL-01.md. Proposed C2 would permit two additional guarded fresh low-reasoning sessions, at most three real model invocations in total within this Run including the retained original failure, with no extra API spend or automatic retry. This report does not grant that authority. No personal trust-entry cleanup is included.
