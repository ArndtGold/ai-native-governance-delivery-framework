# Brownfield Analysis: guarded C2 native continuation

Decision: pass
Gate: Brownfield Analysis
Mode: pre_implementation_analysis
Date: 2026-10-25
Owner: Codex brownfield-analysis

## Approved scope and binding

Run mcp-contract-completeness-20261025-01 at revision ba59c3c8-1ec5-4679-a06a-64c9538adb21. TP approval operation d0d35927-8826-4b89-a9bb-45cb08641285 binds TP.md @ sha256:52f644123916ad5db5b102d8508d094db110a6e3d032e3ed23a2febdec7f0adb and the exact retained UR/PRD/SD. C2 allows two additional fresh gpt-6.1-sol/low T7 sessions under the existing guarded Codex owner; at most three real invocations within this Run including the retained failed original. The original second repetition is canceled. A new first-session infrastructure/isolation failure prevents the second; no retry/resume or extra host/model/account/API spending.

## Current system and reuse owners

| Boundary | Existing owner/evidence | Reuse decision and remaining obligation |
|---|---|---|
| MCP product behavior | Core run-command-contract.js, CLI mcp-dispatch-runtime.js, MCP server.js/ui-capability.js and existing SDK 2.0.0 | Retain tested implementations. No product code, schema/approval/effect boundary, SDK/dependency or ownership changes are needed for C2 |
| Generated/package behavior | Current sync/assembly owners; evidence/implementation-02/ build, all-profile generation, archive consumers and consistency checks | Retain exact 397-file / 3509461-byte Copilot baseline and all profile exclusions/mappings; every MCP budget remains fixed |
| C2 verifier | Existing evals/mcp-ergonomics/lib/native-run.js and native.test.mjs | Retain tested pure-Promise and classified-SDK-rejection corrections, strict binding/single-effect checks and complete failure accounting. Do not turn the original config violation into a pass |
| C2 host/config boundary | Existing scripts/native-probes/codex-host-e2e.mjs T7 branch, macOS sandbox-exec guard, before/pre-session/after manifests and model-free preflight; focused offline checks in implementation-03 | Use this existing branch only. OS denial covers direct/atomic replacement of three protected settings files; guard unavailability/change aborts without fallback. No credential copy, installation, global config edit or existing trust-entry cleanup |
| Native evidence | Immutable failed original in evidence/native-01/; separate derived reanalysis; model-free guarded-preflight-01/ | Preserve all originals. Create unique C2 observations; two real guarded repetitions remain unperformed and must both qualify |

## Exact applicability assessment

Fresh evidence/c2-prerequisites-01/source-freeze.json compares every file and inventory in Core lib, CLI lib, MCP src/bin and control-ui src between the actual checkout and isolated candidate /private/tmp/agdf-contract-candidate-3ahp_a7h. All retained product source hashes are unchanged from implementation-02; all repaired harness/verifier hashes match the tested implementation-03. Package/dependency locks and baseline match. HEAD remains c327c50deae6e5b4fd8071c9e03b1ef2803df6ae with the scoped uncommitted change. Original native retention-manifest hashes remain exact; NODE_TEST_CONTEXT is absent for forthcoming real execution.

Fresh runtime-freeze.json verifies assembled server, dispatcher and SDK digests match the previously observed candidate: server 2fcf3e21353f4179432f2b3656f88f1e00e241adad2294a89d5fc4619c7795ba; dispatcher b66ff4174d50335d3ae5becc3f3fb7facd9c71aa931f1fc267d01d1c923b4d65; SDK b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb. Archive-applicability.json independently matches all three current archives against retained npm pack SHA-512 integrity and SHA-1 identifiers, linking the passed actual consumer check.

Consequently the retained twenty MCP test files, relevant Core/CLI checks, canonical build, 56 deterministic compatibility scenarios, archive consumers, four actual discovery compositions and fixed-fixture 20+20 performance samples remain applicable to unchanged product/runtime inputs. Discovery maxima remain 7083 bytes/tool and 24509 combined, within 8192/24576; qualified cold/warm p95 remains 1011.622/670.668ms within 1500/1000ms. Input/result limits stay 65536/1048576. Historical failed/contended attempts are retained and not discarded or reclassified. This is a current applicability assessment under the renewed TP, not a claim that those tests were newly rerun. Native verifier/guard changes are separately checked by implementation-03 regressions and model-free real preflight. No affected packaged product input was found that would justify repeating unchanged broad checks before C2.

## Risks and minimal safe next path

Real execution of the guarded model pair is still unqualified. Recheck the exact executable/account/model/low/allowed tools/OS guard via --preflight-only after this preparation; it must report zero model invocations and unchanged manifests. Freeze and verify its candidate/source/harness/verifier tuple, then run the approved T7 --repetitions 2 pair once. Preserve new first-session failure and stop its second on infrastructure/isolation failure. No repaired parser or successful preflight waives any actual config mutation, missing trace, wrong model/effort/candidate, extra tool or repeated effect. Any new upstream ambiguity returns to its existing owner.

The two cohorts have different harness/guard inputs. Report all attempts separately and make no causal or success-rate comparison. Preserve foreign worktree data, historical observations, incomplete root dist and the existing failed fixture trust entry. The isolated candidate already has freshly built UI and successful canonical build/archives; no real host installation is needed.

## Scope and knowledge

No new source of truth, dispatcher, validation engine, writer, persistence format, accepted debt or product authority is introduced. The temporary OS policy is an enforced evaluation boundary owned by the existing native probe. No unresolved existing-system fact blocks this bounded continuation.

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: candidate-specific applicability and execution preparation; existing owners and graph routing remain unchanged
- memory_target: scope_artifact
- memory_reason: retain exact source/tuple and evidence assessment in this Run
- memory_refs: this report, approved TP and evidence/c2-prerequisites-01/

## Next permissible step

Record this analysis through the existing internal writer, redispatch gate-check, perform the fresh guarded model-free preflight and execute exactly the two additional approved sessions. No additional model session, native qualification, final review, QA, UAT or completion is claimed by this preparation pass.
