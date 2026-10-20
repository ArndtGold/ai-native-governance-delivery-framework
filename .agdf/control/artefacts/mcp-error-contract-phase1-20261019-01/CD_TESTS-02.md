# CD+Tests: MCP error contract Phase 1 — scoped repair

Decision: pass
Date: 2026-10-19
Owner: Codex
Run: mcp-error-contract-phase1-20261019-01
Based on: approved UR/PRD/SD/TP and passing Brownfield Analysis

- decision: pass
- delivered_result: Failed MCP operations have a true error flag and bounded cause/effect/correction text; successful governance-blocker reports, exact presentations and original receipts retain their existing meaning. The unchanged 32-row matrix confirms 9 -> 0 AGDF failures missing isError. Both final unchanged 20/20 latency qualifications pass.
- missing_evidence: None for the mandatory scoped implementation/test scenarios; formal review and QA decisions follow their own owners.
- required_next_step: Perform and record the existing Code Review, TP Review and Clean Implementation Review, then invoke qa-gate. Human QA/UAT and release authority are not inferred.

## Supersession and source integrity

This report supersedes the CD+Tests revise result in CD_TESTS.md for current implementation qualification only. The registered old report is unchanged. Its contemporaneous source/identity/protocol/scenario/evaluation evidence is preserved under evidence/pre-performance-fix/. Later failed attempts retain their actual source identity and exit code. The final 40-file source set and all approved-input hashes are verified by evidence/source-final.json and identity-verification.json. HEAD remains a8a867a3578a2d8b16853860276c401ddd04db28; the original three staged artefacts and unrelated work are preserved. No index, branch, commit, PR, install or release action was performed.

| Current exact candidate | Identity |
|---|---|
| Dispatcher / real MCP test dependency | 06458476cf47fa77a3563eba4b8fcbd7d8e8455b4b368975f13b3d1d46aa2931 |
| MCP server package | 582e9481dff95e9a1284e2f5bd120a921bea723e3b0aafca4f40dc9b55446d8a |
| SDK closure / version / local runtime | b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb / 2.0.0 / Node 22.22.3, darwin-x64 |
| Cockpit UI | sha256:3bd59dc39ff946afacbd4806cfdf371f95f0808dbc62d549feba77b7e144d8ab |
| Decision UI | sha256:9fdd104eaaaf6c5793935717740dc1224fcfcb6385f522cc35e4b45db7136345 |

The UI builds remain byte-identical to the previously verified assets. The final canonical prepare/build, supported exact payload remeasurement, compatibility recording and fresh real dependency snapshot pass. The current package smoke executes the actual CLI/MCP npm archives with matching provenance. The installed chat runtime is a separate tuple and is not used as candidate execution proof.

## Implemented owners and scoped repair

The pure Core error projector, existing EN/DE copy, typed parse/execution facts, checked producing-runtime delivery, generation descriptor version and validated negative UI consumption remain the single solution described by the approved sources. Core outcomes, receipts, source/revision bindings and human authority remain with their existing owners.

The scoped performance repair removes a duplicate complete inventory/state validation inside one gate evaluation, reusing Doctor's exact selected observation only within that call. No state survives between calls; later changes and unsealed content are detected. The adapter defers schema compilation until actual validation using the same exported SDK Ajv provider/default options. SDK input validation still precedes execution, and successful output validation still follows exactly one execution. Both supported protocol eras now have actual STDIO first-input/first-output/repeated-input assertions. No worker pooling, general refactor, new policy, schema, validator implementation or persistent cache was introduced. See evidence/PERFORMANCE_FIX.md for the earliest-owner assessment and diagnostic limits.

## Actual verification

| Scope | Current or applicable evidence |
|---|---|
| Core/control freshness and governance | fix-control-state.log; current gate/missing-control, skill dispatch, inspect/readiness and parent-reconciliation suites pass. Fresh revisions, unsealed later changes, aggregate/missing selection and standalone Doctor parity are checked. |
| Error contract and SDK boundaries | Original unchanged pure/locale tests remain applicable; current full protocol file inventory passes by fix-protocol-disposition.json, including real owned seven-tool legacy/modern exchanges and first-use SDK validation faults. |
| Generations, isolation and provenance | Current actual owned generation replacement/old-view routing/retirement, safety/deadline/cancellation, provenance and SDK-digest suites pass. |
| Actual commands and complete delivery flows | Current structured-flow file passes all four real STDIO structured-delivery/slice flows through QA/UAT/OR and original-UUID replay on disposable fixtures. Current command group confinement, recording/replay/status and worker-uncertainty tests pass. Synthetic decisions grant no authority in this Run. |
| Actual packages and CI inventory | Current exact npm archives error/success smoke, package boundaries, verification/CI planner, host compatibility and source freshness pass. The 395-file distribution payload is exactly 3,439,607 bytes, without spare headroom. Evaluation baselines remain separate and immutable. |
| Visible UI | Applicable component/full-browser evidence retains its documented dispositions. Current SDK/browser trace is 4/4 passed with the required Chromium process permission; all UI assets are byte-identical. No native host/model qualification is claimed. |
| Immutable measurement | Current protocol/tools captures pass; current/historical comparison exits 1 are intended changed comparisons. Exactly nine errors gain isError/correction text, all semantic classes/outcomes and normalized structured sizes stay equal, tools/list stays identical. All 30 evaluation inputs/baseline files match HEAD. |
| Performance | Initial final cold/warm p95: 1088.087 / 876.261 ms. Independent confirmation: 701.275 / 611.639 ms. Existing 1500/1000 ms thresholds, all 20/20 calls and the test bytes are unchanged. |

The complete command/exit inventory is evidence/checks-final.json; scenario-evidence.json maps all 28 approved scenarios as passed. Source-scope reuse and historical failures are explicit. No earlier failed or cancelled command is relabeled as a pass.

## Task status and finding

T-001 through T-009 have their complete scoped implementation/test/evaluation evidence. T-010 remains in progress here: this actual CD+Tests result is complete; formal CR, TP Review, Clean Review and QA are the required next owners. This report grants no final Quality Readiness or approval.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CD-PERF-001 | emergent_risk | CD+Tests | resolved | evidence/PERFORMANCE_FIX.md; fix-causal-comparison.json; checks-fix2-build.json; fix2-performance.log; fix2-performance-confirmation.log; source-final.json | None for this routed finding; proceed to formal quality reviews. |

## Limits and Context Graph

- qualification_limits: Exact local source/Core/SDK/stdio/archive and synthetic browser evidence. No current native Codex/Claude recovery, Windows/native performance, paid model, remote CI, installation or release qualification.
- risks: Host scheduling still affects latency; the qualification is the measured existing p95 criterion, not a universal response-time guarantee. Unknown effects retain original-operation/UUID inspection and no blind retry. Unknown codes retain a bounded stop.
- memory_target: context_graph
- memory_reason: Preserve the measured error-channel improvement and the actual scoped latency repair, without changing the historical native findings.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- Situation: Phase 1 implementation and all 28 mandatory scenarios are locally qualified; formal quality and human lifecycle decisions remain separate.
- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Existing node entry mcp_error_contract_phase1_20261019, evidence/EVALUATION.md and this report.
