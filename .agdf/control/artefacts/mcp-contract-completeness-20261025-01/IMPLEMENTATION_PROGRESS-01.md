# MCP contract implementation progress

Decision: revise
Gate: CD+Tests
Date: 2026-10-25
Owner: Codex implementation and verification

## Binding and result limits

Run mcp-contract-completeness-20261025-01 remains in CD+Tests. TP approval 8b5c895f-0889-4655-a6f0-f7c51ebed698 binds TP.md @ sha256:586f4228a3cf5e178889798659e8d0bc73f53363910f26c2a3c024d7d4c1c272. Brownfield Analysis was recorded pass by 56b7cdd1-de06-4a0f-a069-823c3012495e, advancing to fe4b8dec-6619-4b16-a0de-b11c7adb796e. This progress evidence does not mark CD+Tests complete or decide any review/QA gate. Approved sources and the original Copilot baseline remain unedited.

## Implemented scope

- Public SDK connect/Transport composition now sends valid modern missing-UI tool calls as -32021 with requiredCapabilities; protected resources use the typed protocol callback. Legacy, malformed metadata/input, unknown resources/tools, truthful request-local capability handling and supported text/App behavior retain their owners. The decorator preserves callbacks/context/options, optional transport properties, SDK pending-id/drain and out-of-band send errors without new framing, dispatch, queue or timer ownership.
- Expanded Core command descriptors now supply direct help for eleven fields on each of five tools, payload purpose, detailed operation-contract help and deterministic local-reference discovery. Core input validation stays on expanded schemas; no caller schema, ref interpreter or new validation dependency is introduced.
- One full structural result model and an essential public output projection cover normal/minimal/fallback/postprocessed command results. The existing finite checker handles the needed constructs. Full checks compose with the existing producing/consuming error boundary before serialization and after postprocessing, including isError paths skipped by SDK; the descriptor projector remains dependency-free and pure. Invalid outputs retain original-operation recovery and cannot replay effects or manufacture receipts/independent human proof.
- Capability manifest and lifecycle validation now compare read_only to the canonical dispatch hint. The MCP README retains historical/development/payload-identity distinctions and removes the obsolete current 0.14.5 claim. Tests include deliberately inconsistent profile metadata.
- A focused T7 mode at the existing Codex owner and task/verifier infrastructure plans exactly two fresh gpt-6.1-sol/low account sessions with candidate-only process configuration, no plugin install/auth-file copy/API fallback, complete trace auditing and original binding retrieval. Historical T1-T6/default matrix and T4 boundaries remain intact. Offline test reports identify mock-host evidence; real model sessions have not been run.

## Retained verification

The exact modified source hashes and disposable candidate path are in evidence/implementation-01/source-manifest.json. The candidate was built through the canonical Codex-specific generator/assembler; a test copy of those exact package payloads was used where current tests expect dist/npm. That is scoped synthetic package evidence, not successful all-profile generation, installation or native host qualification.

| Check | Observed result | Retained evidence |
|---|---|---|
| Core contract and SDK parity | pass: every supported kind, 70 positive/negative parity cases, strict input/accessor rejection, eleven direct descriptions, full/minimal/malformed result variants and five valid advertised output schemas | core-contract.log; source unit assertions also reject missing uncertainty identity/recovery and malformed current/assurance |
| Core command service | pass: target/group confinement, source recording, historical replay/conflict, lost-result acknowledgement, bound language and protected sources | core-service.log |
| Modern/legacy capability STDIO | pass: exact missing code/data, original IDs, request-local no/yes/no alternation, malformed metadata, bad input/unknown routes/wrong MIME priority, supported case and zero denied execution; EOF drains one response per request | capability-stdio.log |
| Transport and semantic contracts | pass: public callback/context/options/session/version/close/error forwarding; denied requests never enter normal dispatch | transport-contract.log |
| Error/fault boundary | pass: actual owned STDIO in both eras, seven tool families, typed parse and malformed producer failures, independent negative checking, bounded fallback and single-effect uncertainty behavior | tool-errors.log |
| Protocol, decision and generation | pass in scoped candidate: protocol matrix assertions, decision resource/private nonce/model versus App/unqualified enforcement, current source/immutable presentation and generation incompatibility/producer ownership | protocol.log; decision-resource.log; generation.log |
| Safety/lifecycle/provenance | pass in the scoped validation sequence: safety, worker lock release/deadline, provenance and package/host lifecycle checks; tests exercise fixtures, not real host installation | safety.log; worker-lock-release.log; worker-deadline.log; provenance.log; package.log; lifecycle.log |
| Metadata and docs | pass: modularization/documentation assertions and lifecycle mismatch regression; generated/package comparisons in the scoped candidate | docs.log; lifecycle.log; package.log |
| Actual discovery sizes | pass for both eras, ordinary and UI/decision compositions: 23343 ordinary bytes; 24509 including decision versus limit 24576. Five command sizes 3357/7083/3389/5517/3997, each below 8192; all five have outputSchema and 11 documented top-level fields | discovery-sizes.json |
| Fixed-fixture performance | pass, Node v22.22.3 darwin-x64, unchanged hermetic fixture and 20 cold plus 20 warm samples: cold p95 711.920ms <=1500; warm p95 476.049ms <=1000 | performance.json |
| Native evaluator offline | pass: 22 existing/extended metric/parser/verifier unit cases and two command-mode tests, including two fresh synthetic approval fixtures, low overrides, existing account-home reuse, no credential copy/plugin install/API fallback and auth failure stopping before a session | native-units.log; native-offline.log |
| Full canonical package generation | fail: AGDF_COPILOT_PAYLOAD_GROWTH, exact 397 files/3509461 bytes versus allowed 397/3495133 | full-generation-failed.log |
| Root environment build preparation | fail separately: npm ci ENOTEMPTY in preexisting UI node_modules/entities/dist 3/esm. Root dist/npm also lacks its assembly ownership marker, so it was preserved | root-build-prepare-failed.log; clean temporary candidate records |

Performance is a scoped budget result, not a causal improvement over a historical environment. Only 67 discovery bytes remain under the aggregate cap; further interface changes require remeasurement. No limit or assertion was raised, skipped or weakened to produce these results. Full required regression flow/matrix/profile checks still need completion after the package prerequisite is resolved; there is no blanket CI-green claim.

## Open planning blocker and concrete proposal

The original Copilot baseline has zero headroom. The required new runtime content increases it by 14328 bytes, about 0.41 percent, without adding files. The approved TP explicitly forbids threshold changes and changed limits. This is a previously missed planning constraint, not permission to rebaseline automatically. COPILOT_PAYLOAD_GROWTH_PROPOSAL.md and COPILOT_PAYLOAD_BASELINE_PROPOSED.json provide the exact un-applied proposal: max_bytes 3495133 -> 3509461, max_files stays 397, mapped/digested contents and guard behavior remain mandatory. MCP definition/input/result/performance limits stay unchanged.

Obtain the user's substantive direction first, then use the existing TP source-revision preview/apply/renewed approval owner if the proposal is accepted. No approved source is silently edited, and no current approval is transferred. Broad payload removal, minification to hide growth, disabled checks, new API spending and additional host installation remain outside this authority.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| F-002 | plan_gap | TP | open | The no-threshold-change TP cannot finish its required full-profile generation with the measured 397/3509461 payload under the zero-headroom 397/3495133 Copilot ceiling | Obtain Arndt Gold's substantive decision on the exact Copilot baseline proposal, then use the existing TP source-revision owner before changing the threshold |

## Outstanding evidence and next step

Real Codex repetitions are unperformed: offline mocks are not native success. Full-profile build, remaining required end-to-end/matrix checks and formal TP/Clean/Code reviews/QA are not complete. Do not record CD+Tests done, ask for QA approval, claim host qualification or release, or start native execution while its candidate prerequisites remain unresolved. Record this bounded progress evidence and request the concrete TP planning decision. Preserve all prior failed attempts, original baselines, foreign untracked files, the root incomplete assembly and completed native evidence.

## Knowledge scope

- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- memory_reason: candidate-specific implementation, failed check and pending source-bound decision
- memory_refs: this progress report, retained evidence and the concrete baseline proposal
