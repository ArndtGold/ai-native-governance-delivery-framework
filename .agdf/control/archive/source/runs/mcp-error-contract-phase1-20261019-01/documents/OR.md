# OR: MCP error contract Phase 1

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: mcp-error-contract-phase1-20261019-01
- related_ur: .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/UR.md
- related_prd: .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/PRD.md
- related_sd: .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/SD.md
- related_tp: .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/TP.md
- related_qa_report: .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

Prepared from sealed revision 23 / 7b57d417-7226-49f4-bb91-e8f8af80c206 after deliberate QA and UAT approvals. The original closeout attempt was rejected; the subsequent direct repository repair requested by the user is verified in evidence/DIRECT_CLOSEOUT_FIX.md. The approved reports and all QA/UAT decisions remain unchanged. This exact OR is submitted to the existing transaction owner for completion. This report records the completed approved local Phase 1 scope; publication and lifecycle completion are performed only by the existing closeout owner.

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | `.agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/UR.md` |
| Brownfield Review | done | `.agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/BROWNFIELD_REVIEW.md` |
| Mode/Slice Decision | structured_delivery | .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/BROWNFIELD_REVIEW.md |
| PRD | approved | .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/PRD.md |
| SD | approved | .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/SD.md |
| TP | approved | .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-19 · revision 21 · presentation 78d5d445-b43b-4876-8b99-1b314b555a2c sha256:a02591c7537d1e33a04ad17d53fbdd64290c762f0ad10d6314dba46112386c2c |

QA approval was recorded by operation 6322aac8-d9a7-4be2-a8c9-ab087c7d2871 against QA presentation 330d73d1-cd0a-4d46-8fe6-679567ebae3d and the exact QA digest sha256:b916c3c4e4d049e8e96ffbc2c6ec323ba3e5a3950684ba2e1d428b7107e5daa1. UAT approval was recorded by operation 0a1d43b8-73c9-4926-8478-df063dc43efe against presentation 78d5d445-b43b-4876-8b99-1b314b555a2c and revision 21. Approval receipts remain canonical; older report statements about pending human decisions describe their original creation time and are not rewritten.

## Run Status Card

| Run status | Value |
|---|---|
| Status | Approved Phase 1 delivered; direct closeout repair verified; OR submitted for completion |
| Current gate | OR |
| Allowed now | Record the exact OR and prepare the operational handoff |
| Blocked by | none |
| Missing approval | none |
| Next step | delivery-closeout: offer the scoped commit for explicit instruction |
| Quality outlook | No additional technical follow-up within the approved Phase 1 scope |

## Delivered

| Item | Evidence |
|---|---|
| Genuine failed operations are distinguishable through isError and bounded cause, known effects and concrete correction guidance; successful blocked/readiness/status reads remain successful. | CD_TESTS.md; QA_REPORT.md; evidence/protocol-after.json |
| One pure Core projection owner, trusted parser/execution facts, checked SDK error delivery, versioned generation handoff, and validated negative Cockpit/decision envelopes. | SD.md; CLEAN_IMPLEMENTATION_REVIEW.md; evidence/source-final.json |
| Original-operation UUID/status recovery and exact receipts, approvals, first content and successful structured results remain authoritative. | CODE_REVIEW.md; actual STDIO/command/generation/browser evidence mapped in evidence/scenario-evidence.json |
| T-001 through T-010 implementation and governed quality/lifecycle preparation, all eight approved criteria and all 28 mandatory scenarios. | TP_REVIEW.md; QA_REPORT.md; recorded QA and UAT approvals above; canonical OR publication completes the final lifecycle obligation |
| Narrow routed performance repair, preserving fresh reads across requests and the same public SDK validator. | evidence/PERFORMANCE_FIX.md; two unchanged 20-cold/20-warm qualifications |
| Existing MCP/architecture documentation, test-suite registration, exact package/provenance and compatibility evidence. | packages/mcp-server/README.md; docs/architecture/core-mcp-command-flow.md; source-final.json and checks-final.json under evidence/ |

Brownfield fit and solution integrity pass through the existing Core/domain, SDK, worker/generation, locale, receipt and UI owners. No parallel policy, receipt store, approval authority or persistent governance cache was introduced. Code Review, Task Plan Review and Clean Implementation Review are separate evidence dimensions; qa-gate alone supplied the technical pass. The original CD-PERF-001 finding is resolved by the actual code and complete passing rechecks, without relaxing thresholds.

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Fresh native Codex/Claude recovery and Windows-native behavior; paid-model success, tokens and cost claims. | Outside approved local protocol/fixture qualification; historical native observations remain dated. | Separately authorized native-host evaluation |
| Remote CI, installed-host rollout, release, publication, commit, push or PR. | No such execution was authorized or performed. | Explicit user instruction and the applicable delivery owner |
| New intake tool, broad schema/SDK redesign, general warm-worker performance work and later ergonomics phases. | Explicit Phase 1 boundary; historical F02-F05 remain separate. | Separate requirements and governed scope |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Current CD and final quality reports | CD_TESTS.md; CODE_REVIEW.md; TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; QA_REPORT.md | All 28 scenarios, eight criteria, actual diff, bounded quality decision | direct |
| Unchanged 32-row matrix, five executions per row | evidence/EVALUATION.md; protocol-after.json; tools-after.json; compare-current.json; immutable-evaluation-inputs.json | Missing isError 9 to 0; same classes/outcomes/normalized structured sizes; byte-identical tools/list; all 30 evaluation inputs/baselines unchanged | direct |
| Complete current performance qualifications | evidence/fix2-performance.log; evidence/fix2-performance-confirmation.log | Cold/warm p95 1088.087/876.261 ms and 701.275/611.639 ms under unchanged 1500/1000 ms bounds, with all samples | direct |
| Actual SDK/STDIO/archive/generation and browser routes | evidence/checks-final.json; final-quality-verification.json; scenario-evidence.json; fix2-browser-sdk-trace-authorized.log | Both protocol eras, seven tools, original-operation recovery, four disposable full lifecycle flows and four current SDK/browser traces | direct |
| Exact source and built tuple | evidence/source-final.json; identity-verification.json | HEAD a8a867a3578a2d8b16853860276c401ddd04db28; the recorded 40-file approved Phase 1 source tuple; the subsequent direct repair is independently identified in evidence/DIRECT_CLOSEOUT_FIX.json | direct |
| Source comparison before product decisions | PRD.md; SD.md; BROWNFIELD_REVIEW.md | MCP tools error handling, official TypeScript SDK and Anthropic tool-design guidance mapped to the approved error contract | direct |
| Deliberate human decisions | Selected RUN_STATE.md approval table and recorded approval receipts | QA and UAT against their exact presented versions; cooperative local forwarded human reply | direct |

The candidate dispatcher/server/SDK closure digests remain 06458476cf47fa77a3563eba4b8fcbd7d8e8455b4b368975f13b3d1d46aa2931 / 582e9481dff95e9a1284e2f5bd120a921bea723e3b0aafca4f40dc9b55446d8a / b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb, SDK 2.0.0. These are the historical accepted Phase 1 tuple. The subsequent direct repair uses new current source hashes and a fresh build, complete command-flow/MCP tests and timing check recorded in evidence/DIRECT_CLOSEOUT_FIX.json; it is not represented by the old source tuple.

Historical failed test attempts remain disclosed with passing recheck dispositions. Comparison exits 1 represent intended changes. The existing writer published the reviewed replacement at canonical CD_TESTS.md; evidence/CD_RECORDING_PROVENANCE.md corrects the earlier preservation assumption. Older receipts/digests and contemporaneous raw evidence remain; a byte-identical previous Markdown body is not claimed. Technical reviews and fixtures are cooperative local evidence, not independent native-host or human-review proof.

## Direct Repair Verification

The user subsequently requested the closeout defect be fixed without AGDF workflow. The direct source repair, tests and exact material protection are recorded in evidence/DIRECT_CLOSEOUT_FIX.md (sha256:8a0724e0ed368d59e640f1ce6d6195864684a57419d900e94621ab6af5bd50e5) and evidence/DIRECT_CLOSEOUT_FIX.json (sha256:5e2b8dbe890e33f6f81021f56994d7f0c4ad9f846f6077eb132e1f138fde4b4c). All original QA/review files remain byte-identical. The existing actual STDIO fixtures now carry the representative resolved finding through both eras/modes; all four pass. The full command-flow suite is 18/18 plus preview followups; canonical build, 113 offline skill cases, 56 compatibility fixtures, strict negatives and timing 767.832/761.664 ms pass. The registered CLOSEOUT_BLOCKER.md remains the original rejected-attempt observation, superseded as a current diagnosis by this direct repair evidence. No new human approval, installed-runtime claim or rerun of the whole original 28-scenario inventory is inferred.

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| None within the approved Phase 1 mandatory scenarios. Native-host/model, Windows, remote-CI and rollout evidence is outside this qualified scope. | warn | Obtain the specific evidence before making a stronger host, model, CI or release claim. |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Unknown write effects cannot safely imply a blind retry. | warn | Preserve original UUID/payload and inspect existing operation status/receipt before eligible recovery. |
| Local latency varies with machine load; the current two complete qualifications are bounded observations. | warn | Keep existing deadlines, caps, tests and thresholds; reassess actual later failures at their owning source. |
| Browser/host fixtures and local package tests do not establish native production or installation behavior. | warn | Retain the qualification limits in any later release or host-verification scope. |

Retained fallbacks: unsupported valid locales use the complete existing English pack; malformed/untrusted projection uses the bounded existing failure result; legacy qualified generation routes retain their original owner and retirement guards. Exit criteria are the existing supported locale/validated descriptor contracts and lifecycle retirement checks. No temporary error store, indefinite retry, relaxed budget or hidden runtime-repair path is retained.

## Parent Reconciliation Handoff

- outcome: not_applicable
- target_run_id: none
- disposition: not_applicable
- evidence: Canonical selected-run Delivery Map on revision 22 returned no qualifying Parent relationship.
- missing_evidence: none
- next_action: none

Programme aggregation is not applicable according to that same Delivery Map; no Parent acceptance or programme readiness is inferred.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing mcp_error_contract_phase1_20261019 entry records the pure error-contract owner, 9-to-0 measurement, scoped performance correction, unchanged qualification limits and exact source references; reviewed by TP Review and QA. The required update is complete. No new knowledge or acceptance authority is introduced by this closeout.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: Reusable error-channel, recovery and bounded performance findings remain with the existing project Context Graph owner; detailed run evidence stays in the scope artefacts.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER; .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/evidence/EVALUATION.md; .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/evidence/PERFORMANCE_FIX.md

## Next Permissible Step

- next_allowed_action: delivery-closeout offers a scoped commit for explicit user instruction.
- required_approval: none
- forbidden_until_then: Automatic commit, push, PR, installation, rollout, release or publication; source changes or renewed scope require the applicable existing control path.

## Approval

OR records the completed approved scope and next permissible step. It supplies no new human approval or permission for VCS/publication. No further technical follow-up is required within the accepted Phase 1 scope; any stronger native-host or release qualification requires its own actual evidence.
