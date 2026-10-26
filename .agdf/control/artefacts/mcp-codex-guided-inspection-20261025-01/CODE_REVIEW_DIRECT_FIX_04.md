# Code Review: current MCP inspection delivery

Decision: pass
Date: 2026-10-25
Reviewer: Codex using code-review

## Reviewed scope

Actual diff against main 5046858826f3bca7922c14ef402b095feca8b6fb: packages/core/lib/control-inspect/contract.js and service.js; packages/cli/scripts/control-inspect-test.js; packages/mcp-server/test/protocol.test.js; scripts/native-probes/codex-host-e2e.mjs and codex-command-task-test.mjs; new scripts/native-probes/lib/codex-command-guard.mjs. Reviewed the relevant canonical selector/catalog/command composition, original report/presentation boundaries, SD decisions, current TP, Brownfield preparation, generated compatibility deltas and the contained qualification/reconciliation helpers. Foreign staged observations and unrelated control files are excluded from delivery scope and preserved, not attributed to this work.

## Correctness and regression assessment

The operation-dependent schema move preserves original condition objects while operation remains required; shared selector conversion preserves undefined-versus-present behavior. All 247,003 SDK matrix cases and 160 frozen Core outcomes agree; 15 original invalid SDK calls stay rejected. Installed CLI capture proves root field visibility rather than assuming schema validity proves renderer behavior. No change to input limits, detailed result validation or human approval semantics was found.

Navigation requires an explicit target pair and matching named Run. Current revision comes from the evaluated snapshot; target identity, command group and catalog read arguments come from existing owners. Unique complete discovery alone yields a document hint. Ambiguous, missing, corrupt or unavailable catalogs do not choose by timestamp or prepare replacement documents; catalog scope/completeness stay visible. Existing exact reads remain usable independently of hints. The current operation-contract revision and original document revision remain separate. Modern and legacy real STDIO regression cases invoke returned arguments, reject foreign/stale binding and verify byte-preserving reads/refusals. The advisory-only catch excludes primary evaluation and preserves full report/presentation parity.

The test guard validates canonical paths/settings aliases, source bindings, frozen inputs and fresh successful preflight before exclusive two-slot reservation. One inherited OS profile denies writes across original Root and all three personal setting literals, including absent settings. Worker negative append-open and owned positive controls run before account/MCP/model actions; direct unguarded flags, tampered binding and weaker actual profiles fail. Session events distinguish reservation/attempt/spawn, per-session execution is bounded and the outer controller terminates its owned group. Synthetic setup/worker/teardown deadline cases and unrelated-sentinel survival pass. Existing original task, prompt, parser, audit, account/API exclusion and normal repetition semantics are retained.

The post-qualification correction is exactly one test stream token, stderr replacing stdout, preserving both negative predicates. The actual full macOS synthetic suite and actual affected unsupported-platform branch simulation pass. direct-fix-04/assessment.json proves every other frozen candidate path unchanged and preserves raw observations/ledgers. No new native session or global account/config work was performed. A simulation is not reported as Linux qualification.

Canonical build/provenance, profile and fixed-performance evidence remains applicable to unchanged inputs. Derived compatibility files report 56 deterministic scenarios without implying fresh native cross-host support. Preserved original/native input hashes and 14 foreign staging entries are verified. Current Run evidence clarifies the explicit human-authorized deviation from the frozen test scope without rewriting approved TP bytes or claiming its unapplied revision proposal happened.

## Code Review

- findings: No concrete unresolved correctness, security, data-integrity or regression defect was identified in the reviewed scope.
- missing_evidence: none for the stated scope; other-host/native Linux, independent human review and release/installed-plugin qualification are not claimed.
- evidence_strength: high for deterministic invariants and actual named native T7 tuple; native behavior remains a two-sample bounded observation, not a statistical reliability guarantee.
- risks: Inspect has seven bytes of remaining discovery headroom and Copilot is exactly at its unchanged ceiling. Future source changes require normal budget checks. Guard proof assumes a trusted local controller and normal descendants, as designed; it is not certification against a malicious kernel or deliberately escaping native program.
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- required_next_step: let qa-gate evaluate the current TP/Clean/Code evidence and prepare the human QA decision if ready.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CGI-NATIVE-FINAL-01 | evidence_gap | evidence_obligation | resolved | Immutable exact-runtime native/controller proofs, two original/strict passes each four calls/zero errors; source applicability reverified after the test-only correction | none |
| CGI-TEST-STREAM-01 | implementation_gap | CD+Tests | resolved | Explicit human authorization, actual one-token stream fix, four macOS synthetic groups and simulated unsupported-platform branch pass; original snapshot retained | none |

This is cooperative agent review of the actual diff and evidence, not an independent human review and not final QA or gate approval.
