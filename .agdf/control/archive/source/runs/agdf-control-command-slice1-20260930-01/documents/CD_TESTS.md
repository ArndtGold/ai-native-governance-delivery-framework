# CD+Tests: Explicit Local Approval Command

Status: done
Based on: approved TP.md; approved SD.md; BROWNFIELD_ANALYSIS.md
Traceability contract: criteria-chain-v1
Date: 2026-10-01

## Delivered behavior

CLI --operation and create-agdf/control-command share locked approval preparation, canonical policy and writing. One approval and append-only receipt commit in the same sealed Run revision. Matching replay synchronizes and acknowledges history without writing; conflicting payload, stale binding, stronger assurance and unresolved canonical evidence cannot become a new approval. Legacy CLI/seal behavior remains with explicit cooperative assurance. Shared metadata/locale context no longer belongs to the CLI dependency of the public API. MCP retains its read-only tool boundary.

## Source and execution identity

- source commit: 15af7ff6e2133fdb1707db7711355014521f1c7a
- changed-source sha256: 8181d52a5530f3d9522ccee9ba48ff1cd152f516a80fcbe4db67e94092474e34
- packed tarball sha256: d2f82e8789a2f2e833f384496e322586b3507aa7b4b9ba090677359fbf9828f3
- package version: 0.14.5; development source, no release/publication claim
- command schema: 1; receipt schema: 1; receipt-free approval seal: 1; receipt-bearing approval seal: 2
- Node v22.22.3, process platform darwin/x64
- SOURCE_IDENTITY.json names every changed-source hash and unchanged installed runtime identity.
- EXECUTION_EVIDENCE.json binds dated commands, evidence log hashes, package identity and measurements.

## Executed scenario families

| criterion_id | design_decision_id | task_id | scenario_id | status | actual evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-005 | SCN-001 | pass | control-command.log |
| AC-001 | SDD-002 | T-002 | SCN-002 | pass | control-command.log |
| AC-001 | SDD-003 | T-003 | SCN-003 | pass | control-command.log |
| AC-001 | SDD-008 | T-002 | SCN-004 | pass | control-command.log |
| AC-001 | SDD-009 | T-007 | SCN-005 | pass | control-command-package.log |
| AC-001 | SDD-010 | T-005 | SCN-006 | pass | control-command-package.log |
| AC-002 | SDD-001 | T-008 | SCN-007 | pass | control-command.log |
| AC-002 | SDD-002 | T-002 | SCN-008 | pass | control-command.log |
| AC-003 | SDD-002 | T-002 | SCN-009 | pass | control-command.log |
| AC-003 | SDD-008 | T-008 | SCN-010 | pass | control-command.log |
| AC-004 | SDD-002 | T-002 | SCN-011 | pass | control-command.log |
| AC-004 | SDD-005 | T-006 | SCN-012 | pass | control-command-process.log |
| AC-005 | SDD-003 | T-006 | SCN-013 | pass | control-command-process.log |
| AC-005 | SDD-004 | T-006 | SCN-014 | pass | control-command-process.log |
| AC-005 | SDD-005 | T-006 | SCN-015 | pass | control-command-process.log |
| AC-006 | SDD-003 | T-006 | SCN-016 | pass | control-command-process.log |
| AC-006 | SDD-004 | T-004 | SCN-017 | pass | control-command.log |
| AC-006 | SDD-007 | T-006 | SCN-018 | pass | control-command.log |
| AC-006 | SDD-008 | T-004 | SCN-019 | pass | control-command.log |
| AC-007 | SDD-003 | T-006 | SCN-020 | pass | control-command.log |
| AC-007 | SDD-005 | T-006 | SCN-021 | pass | control-command-process.log |
| AC-007 | SDD-006 | T-006 | SCN-022 | pass | control-command.log |
| AC-007 | SDD-007 | T-006 | SCN-023 | pass | control-command.log |
| AC-008 | SDD-001 | T-008 | SCN-024 | pass | cli-gate-scenarios.log; run-revision.log; control-inspect.log; mcp-server.log; isolated CLI suite in control-command-package.log |
| AC-008 | SDD-007 | T-003 | SCN-025 | pass | control-command.log |
| AC-008 | SDD-008 | T-008 | SCN-026 | pass | control-command-package.log; control-command-process.log |
| AC-008 | SDD-009 | T-007 | SCN-027 | pass | control-command-package.log |
| AC-008 | SDD-010 | T-005 | SCN-028 | pass | control-command-package.log |
| AC-008 | SDD-011 | T-007 | SCN-029 | pass | control-command-package.log |
| AC-009 | SDD-002 | T-008 | SCN-030 | pass | control-command-package.log |
| AC-009 | SDD-008 | T-009 | SCN-031 | pass | control-command-package.log |
| AC-009 | SDD-011 | T-007 | SCN-032 | pass | control-command-package.log |

All 32 families use executable state/result assertions. SCN-012 also runs real children with artefact, presentation, revision and eligibility changes at the final checkpoint. Faults span temp open/write/flush, rename, directory sync, response and lock-release boundaries. Actual child termination and observed exit precede abandoned-lock reclamation; child JSON/checkpoints are preserved in the process log. Receipt codec/version/identity/encoding negatives and generic write/recovery/supersession preservation are asserted.

## Regression and build results

| command family | result | evidence |
|---|---|---|
| control-command | pass | evidence/control-command.log |
| control-command-process | pass | evidence/control-command-process.log |
| control-command-package | pass | evidence/control-command-package.log |
| run-lock | pass | evidence/run-lock.log |
| run-revision | pass | evidence/run-revision.log |
| run-recovery | pass | evidence/run-recovery.log |
| run-step-transaction | pass | evidence/run-step-transaction.log |
| cli-gate-scenarios | pass | evidence/cli-gate-scenarios.log |
| control-state | pass | evidence/control-state.log |
| control-inspect | pass | evidence/control-inspect.log |
| interaction-presentation | pass | evidence/interaction-presentation.log |
| operational-localization | pass | evidence/operational-localization.log |
| prd-readiness | pass | evidence/prd-readiness.log |
| mcp-server | pass | evidence/mcp-server.log |
| mcp-contract | pass | evidence/mcp-contract.log |
| mcp-continuation | pass | evidence/mcp-continuation.log |
| mcp-safety | pass | evidence/mcp-safety.log |
| cli-modularization | known_baseline_failure | evidence/cli-modularization.log |

The isolated package test also passes package-build, copilot-profile, release-version-coherence, package-contents, local-validator, plugin-mcp-runtime, runtime-integrity-layout and runtime-integrity-negative. The actual tarball external import/execution is separate from generated shared/Copilot validator execution. Missing locale resources fail with no canonical Run mutation. Existing export targets remain present; the public command closure has 38 modules and excludes CLI, installers and MCP initialization. Import instrumentation permits package-owned reads only.

## Workflow observations

Boundary: recorded eligible UR -> prepare presentation -> submit simulated reply -> inspect current state. Events are scripted CLI/API calls, not human reading time.

| lane | success calls | presentations prepared | manual corrections | exact retry calls/result | stale calls/result |
|---|---|---|---|---|---|
| legacy | 3 | 1 | 0 | 1: rejected | 1: rejected |
| command | 3 | 1 | 0 | 1: already_applied | 1: rejected |

Real interrupted legacy CLI and new-command child calls each use one interrupted attempt plus one retry. Before rename both complete exactly one revision on retry. After rename legacy retry rejects; the new command acknowledges the saved original effect as already_applied with byte-identical state. Detailed event counts and child results are in EXECUTION_EVIDENCE.json and the process log. No percentage or time-saving claim follows from these fixtures.

## Evidence classes and scope limits

| lane | qualification |
|---|---|
| Repository source and deterministic assertions | passed |
| Actual packed npm external ESM consumer and CLI | passed, tarball/version/hash recorded |
| Generated shared and Copilot local validators | passed; separate manifests/digests/results recorded |
| Currently installed plugin | observed unchanged identity; new behavior not installed or qualified |
| Native darwin/x64 Node execution | passed selected scenarios |
| Native Linux / Windows | unavailable, no qualification claim |
| Visible host / actual human reading or decision | not observed for the new behavior; fixtures use simulated replies |
| Independent human verification | unavailable by contract |

The pre-existing current-workspace CLI documentation assertion remains a separate baseline failure. Current changed code passes that suite in a disposable snapshot with only its HEAD documentation input restored. The unrelated architecture documentation, diagrams and pre-review backlog bytes were verified unchanged; no source test was weakened. The source is ready for mandatory reviews within this selected slice, not a whole-workspace smoke/release claim.

## Documentation and ownership

README documents the exact public command, assurance ceiling, compatibility and retry/recovery behavior. Runtime inventory includes six new modules; the shared context is included in MCP provenance. The measured Copilot ceiling is exactly 136 files / 1274410 bytes, 23303 bytes above baseline with no spare headroom; exclusion/provenance/growth guards still pass. No package extraction, public identity service, mutating MCP tool, installation, publication or project VCS action was introduced.

- context_graph_impact: link_only
- context_graph_refs: CG-RUN-SCOPED-CONTROL-STATE; CG-MCP-DISPATCH-ADAPTER
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: BROWNFIELD_ANALYSIS.md ownership and this report/source evidence link the unchanged canonical state/adapter owners.
- memory_target: scope_artifact
- memory_reason: run-specific source/process/package measurements and qualification boundaries
- memory_refs: CD_TESTS.md; SOURCE_IDENTITY.json; EXECUTION_EVIDENCE.json

## Review corrections and final execution

CR-001 found that a rejected accessor-bearing JavaScript object could invoke getters while validating assurance or constructing diagnostic binding/operation fields. The closed contract now reads only own data descriptors in those diagnostic paths. The final SCN-002 matrix checks throwing getters on all ten command fields, zero invocations and unchanged canonical bytes.

CR-002 found missing explicit safe-action feedback for a live lock/precommit transient failure and an unknown owner. The result now names identical retry with retained UUID/payload or canonical/lock-owner inspection without inferred approval. Final unit assertions and nine executable consumer JSON observations cover this feedback.

The final command/unit, real process, actual packed/generated consumer and MCP contract/continuation/safety checks were rerun after these changes. EXECUTION_EVIDENCE.json identifies their review-final log paths and hashes; they supersede earlier corresponding executions. The remaining relevant regression owners were unchanged by these two diagnostics/feedback corrections. Source digest uses the explicitly documented sorted compact JSON algorithm in SOURCE_IDENTITY.json. Reports TP_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md and CR.md retain the evidence and resolved findings.

## Required next step

Invoke qa-gate for the sole QA decision using the final linked reviews and evidence.
