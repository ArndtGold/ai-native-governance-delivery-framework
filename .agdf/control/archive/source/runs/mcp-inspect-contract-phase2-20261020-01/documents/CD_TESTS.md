# CD+Tests: self-describing inspection and exact document evidence

Decision: pass
Date: 2026-10-20
Run: mcp-inspect-contract-phase2-20261020-01
Owner: Codex
Approved TP: sha256:e6cedc82d181424cdc8e3751f77fbfef3acb0529e5f205b0e12670ed4d176ed6

## Scope and implementation

The implementation and deterministic results are described in the preserved CD_TESTS.md checkpoint. Core owns parameter descriptions, derived help and selector validation; the existing run-presentation owner provides bounded catalog discovery and reuses the existing immutable-document reader. Existing agdf_* tool names, error/status distinctions, original historical read bindings and effective SDK input/output validation are retained. No generic filesystem API, catalog index, new tool, second reader or parallel native runner was added.

Actual discovered definition: 4998 bytes. Exact Copilot payload: 395 files / 3440927 bytes, below the prior cap and with no headroom. Only the existing selected locale projection is compacted, with exact parsed-value preservation and an explicit compact_json inventory rule. No tests were removed and no timeouts raised.

## Checks

The retained evidence-manifest.json binds the build, full MCP suite including actual packed CLI/MCP archives, both protocol eras, Core document/preview and CLI contract tests, package boundaries, local installation, integrity negatives, 56 host adapter fixture scenarios, 68 compatibility evidence checks and protocol ergonomics. These checks passed for the shipped product candidate. The later changes affect only the native harness/evaluator; the final deterministic evaluator suite passes 44/44, with no skipped tests. Compatibility freshness remains passing after the harness-only changes. No fresh remote CI or native qualification of another host is claimed.

The original taskset, fixture builder, T4 prompt/predicate and historical baseline remain unchanged. Protocol ergonomics observed 32 calls with all 9 SDK validation failures and 9 AGDF failures flagged; zero protocol errors, unclassified tool errors or failures without isError.

## Native replacement and honest provenance

The first authorized session failed before MCP because the harness disabled its Code Mode host. Its original report, traces and NATIVE_TEST_POSTMORTEM.md remain unchanged. The immediate direct human reply `fix it` to the explicit one-replacement-test question is recorded in NATIVE_REPLACEMENT_AUTHORIZATION-01.md and canonical operation 51d1fee5-235a-41bc-9439-0790395b7e20. No gate approval was inferred and approved source bytes were not rewritten.

Exactly one replacement codex exec was issued. It used the corrected existing single-T4 owner with Codex CLI 0.163.0, Node 22.22.3, darwin-x64 and observed gpt-6.1-sol/high. The retained session records span 2026-10-20T08:53:59.879Z through 08:58:25.196Z. The process exited 0 without timeout or output-cap violation. Original T4 predicate: success. Three ordered pages contain exactly 77796 bytes, sha256:2191669a88137efcb281bb8bf428260c41a49e45d2697763c1c214895b2ac04f; the complete same document appears contiguously in the final user output.

The original replacement report's strict result was false because the evaluator mishandled real telemetry: exec and rollout streams use different IDs for the same calls; exec omits isError but retains failed status; rollout text can contain a nested/truncated serialized result; and the AST audit incorrectly rejected the literal MCP argument key module. All original bytes remain untouched. The corrected evaluator reconciles ordered complete invocation sequences, preserves genuine repeated calls, rejects missing/conflicting mirror evidence, recovers complete results only from a matching invocation, and rejects shell, filesystem, resource reads, evaluation and unknown helpers. Two empty host resource-catalog listings are explicitly retained as metadata-only discovery: they supplied no document, identifier or binding; nonempty or parameterized listings fail qualification. This implements the approved metadata/discovery allowance, not a new data-access path.

The same retained session was deterministically re-audited, with zero further model invocations. Supplemental strict_t4_document_flow_v1: pass; original target/run/gate/revision/presentation binding, ordered UTF-8 bytes, digest, final completion, full user delivery and absence of data-access detours are verified. The newly captured trace shapes and adversarial mismatches are covered by the 44 passing tests. Original reports are historical evidence; the separately named re-audit binds the original traces and final verifier hashes.

Actual replacement metrics: 10 AGDF calls, of which 5 were erroneous and recovered, plus 2 empty host metadata listings. Usage: 312269 input tokens, including 265600 cached, 15376 output tokens, 232 reasoning output tokens. Actual USD cost unavailable. Existing ChatGPT-account login, no API-key fallback or separately authorized API expenditure. Temporary credentials and roots were removed; personal config and repository control manifests were unchanged. Across both attempts there were two actual sessions: one original failed attempt and one explicitly authorized replacement. No third session or Claude test occurred. One successful replacement is not a success-rate or broad host-support claim.

## Evidence and disposition

- Historical deterministic checkpoint: CD_TESTS.md, unchanged.
- Original failed attempt: probe-results/codex-t4-2026-10-20T08-32-25-376Z/.
- Replacement original observation/traces/final output: probe-results/codex-t4-2026-10-20T08-53-36-748Z/.
- Final supplemental native evidence: probe-results/mcp-inspect-contract-phase2/native-replacement-reaudit.json @ sha256:d815791fa4336d5629d1e8636ad5b6742f086f021102a4132f0a2dadb1c8325a.
- Final deterministic evaluator log: probe-results/mcp-inspect-contract-phase2/checks/agdf-phase2-eval-unit-reaudit.log.

T-001 through T-008 have their implementation/evidence obligations fulfilled, including the expressly authorized replacement. T-009 proceeds to formal TP, Clean and Code reviews, followed by the sole QA decision. This CD+Tests decision grants neither QA approval nor UAT, release, commit or merge authority.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CD-NATIVE-001 | evidence_gap | evidence_obligation | resolved | Native replacement supplemental re-audit proves all three original pages and contiguous exact full user delivery, with no data-access detours | Consume this source-bound evidence in the required reviews and QA. |
| CD-HARNESS-001 | implementation_gap | CD+Tests | resolved | Corrected Code Mode host configuration reached real MCP; readiness and full trace normalization are covered by 44 deterministic tests and re-audit of the same real session | Review the final harness/evaluator diff and qualification limits in CR. |

This table explicitly supersedes the earlier incomplete checkpoint's noncanonical explanatory gap_status cell for CD-HARNESS-001; the historical file is retained rather than silently repaired. No open applicable implementation or native evidence finding remains at this checkpoint. Protected foreign artefacts remain untouched.

## Final verifier and explicit recording authorization

The final stricter verifier confirmation is probe-results/mcp-inspect-contract-phase2/native-replacement-verifier-final.json @ sha256:3d008888b99189f83e1f8e19555933d284657fda618513f17a649479ef35afac, registered as factual evidence through operation 6a93264a-ec48-4950-a79e-16b1bb140f62. It additionally rejects contradictory success/error flags across the two telemetry streams. The final deterministic regression log is probe-results/mcp-inspect-contract-phase2/checks/agdf-phase2-eval-unit-final-verified.log @ sha256:8690af2536beb2e5fa50d79bed6fcfe12fbee5f0b54425e8723c40c0b12c5def. All 44 tests and the stricter same-session audit pass; no extra model session occurred.

The prior attempt to record CD+Tests pass was rejected by automatic approval review for insufficient explicit authorization. No alternative writer bypassed it. The assistant then asked exactly: "Darf ich `CD+Tests` als bestanden verbuchen und die Reviews fortsetzen?" The direct human reply is "ja". This newly explicit authorization permits recording this technical CD+Tests result and continuing required reviews. It is not QA, UAT, release or merge approval and does not authorize another native session. Historical rejection and original native reports remain preserved.
