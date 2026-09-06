# QA Report: Cross-surface Executable Skill Dispatcher

Revision: 15
Date: 2026-09-05
Decision: revise
Run: cross-surface-executable-skill-dispatcher
Scope: approved TP Revision 2. Prior reports remain historical Git evidence.

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | revise | TP Review Revision 13: 12/16 fully_done, TP-09/10/14/16 partial |
| Solution integrity | pass | one semantic function owner, one target-source value owner and checked projections; no alias shim or parallel policy |
| Code quality | pass | Code Review Revision 13; semantic, target and dispatcher corrections pass affected serial regression |
| QA decision | revise | required fresh loaded-host and native-OS evidence remains absent |

Decision owner: qa-gate.

## Semantic Function-owner Decision

`CSED-DISPATCH-14` is resolved at repository scope. `agdf_dispatch` now has one model-facing
definition for purpose, authority, terminal behavior and inputs. The three target-source values have
distinct meanings, the optional target fields are paired, and cwd is explicitly non-authorizing.
CLI/binding grammar and all ten skills consume checked projections of that owner.

The semantic contract test, 40 adapter cases, both Runtime Integrity layouts, instruction budgets,
public payload, byte-identical package build, 437-file package contents and 83/83 deterministic
replays pass. Copilot stays within its unchanged 91-file and 696486-byte limits.

This correction does not satisfy CSED-QA-01. No installed host was refreshed and no fresh model turn
proved that the host presents or follows the new descriptions.

## Typed Failure Decision

`CSED-CODEX-12` and `CSED-DISPATCH-13` are resolved at repository scope. Direct target-check now
distinguishes invalid source input from missing target evidence and exposes the canonical allowed
values. Dispatcher terminal errors distinguish target evaluation, target presentation, gate
evaluation, gate presentation, internal failure and output overflow. Visible recovery comes from
the requested locale, while raw downstream exception text remains hidden.

Focused and affected broader suites pass, including 40 adapter cases, 437-file packaging, both
Runtime Integrity paths, Agent Skills conformance, state/reconciliation checks, 83/83 reviewed
deterministic replays and source smoke. The replay fingerprints changed only because the additive
task-target contract is a recorded behavior owner; observations, thresholds and expected actions
were not rewritten.

This correction does not satisfy CSED-QA-01. No installed profile was refreshed and no fresh host
task observed the new failure paths.

## Target-source Recovery Decision

`CSED-CODEX-11` is resolved at repository scope. The public binding grammar now names the exact
canonical target-source values, contract diagnostics return the same allowed values, and terminal
recovery is rendered in the requested language. The unsupported alias `user` remains rejected.
Focused and serial aggregate stages pass, including the exact failing call and both Runtime Integrity
modes. The generated tree was rebuilt after a macOS File Provider conflict caused by concurrent test
mutation; its current canonical candidate and serial package checks pass.

This correction does not satisfy CSED-QA-01. It has not been installed into a fresh Codex task, and
the broader native-OS and four-host evidence matrix remains incomplete.

## Codex Follow-up Decision

`qa-gate` retains exactly `revise`. The earlier Codex task exposed two repository defects,
`CSED-CODEX-09` and `CSED-CODEX-10`, now corrected and regression-tested. The corrected source
replay returns the canonical German control result. `CSED-HOST-09` also proves that loaded profile,
current installation, full-turn latency and post-terminal model output need separate evidence.
The previous hook-trust diagnosis is not the cause of this renderer failure. Corrected native
installation and fresh-session behavior remain open under CSED-QA-01.

## QA Gate

- decision: revise
- evidence: approved SD2/TP2, Brownfield Analysis 5, CD+Tests 13, TP Review 13,
  Clean Review 13 and Code Review 13, green repository regression, 40 adapter cases,
  reviewed 83-case offline replay compatibility, isolated rollback and real Electron chain.
- missing_evidence: corrected user-host installation/restart, complete Codex/Claude/Copilot/OpenCode
  reference matrix, OpenCode inactive/ordinary-chat retests, native Windows/Linux process
  observations, first-visible latency and model adherence. CSED-RUNTIME-01 is not a fresh session.
- verification_limit: this turn's monolithic smoke invocation was interrupted first by sandboxed npm
  cache access. A concurrent retry against the same generated tree caused macOS File Provider
  conflict copies. After preserving and regenerating that ignored tree, all stages passed serially
  and the current package has one canonical candidate. Earlier isolated full-smoke evidence remains
  separate. See CD_TESTS.md for exact boundaries.
- risks: models can still ignore a supplied grammar or rewrite terminal text; unit and shell
  fixtures do not establish observed host compliance. Unsupported Node bootstrap module settings
  are deliberately unavailable rather than silently repaired.
- required_next_step: obtain separate bounded authorization for coherent installation/restart and
  collection of the missing host matrix.
- impact_codes: evidence_gap

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CSED-CODEX-09 | implementation_gap | CD+Tests | resolved | Exact canonical recovery locale entries, strict negative control and German ambiguous-run replay | Verify the corrected installed-host output under CSED-QA-01. |
| CSED-CODEX-10 | implementation_gap | CD+Tests | resolved | Correct native-marker precedence and generated host-shaped environment tests | Verify Codex surface in a fresh installed binding under CSED-QA-01. |
| CSED-CODEX-11 | implementation_gap | CD+Tests | resolved | Canonical target-source owner, explicit grammar, localized terminal recovery and exact failing-call regression | Verify the corrected installed host under CSED-QA-01. |
| CSED-CODEX-12 | implementation_gap | CD+Tests | resolved | distinct target-check reason, canonical typed allowed values and German exact replay | Verify the corrected installed host under CSED-QA-01. |
| CSED-DISPATCH-13 | implementation_gap | CD+Tests | resolved | stage-specific diagnostics, locale-owned recoveries, output-bound localization and raw-error suppression | Verify exact terminal transfer in the refreshed host matrix. |
| CSED-DISPATCH-14 | implementation_gap | CD+Tests | resolved | semantic function definition, derived grammar, ten exact skill projections and source/installed integrity checks | Verify description use in a fresh installed host under CSED-QA-01. |
| CSED-QA-01 | evidence_gap | evidence_obligation | open | CSED-TP-EVIDENCE-01 and HOST_EVIDENCE.md retain missing native and fresh-host observations | Obtain bounded lifecycle authorization and then collect the required matrix. |
| CSED-QA-07 | implementation_gap | CD+Tests | resolved | CSED-HOST-08 transport defect corrected by schema 2, explicit child env, canonical grammar, 40 adapter cases and CSED-RUNTIME-01 | Verify the repository correction in the fresh host matrix covered by CSED-QA-01. |

CSED-QA-02 through CSED-QA-06 are historical repository corrections, recorded at the baseline commit
and in HOST_EVIDENCE.md. They are not new host passes. Their earlier noncanonical routing label
implementation is not copied into current findings. Current routing uses the Quality Contract's
CD+Tests value without changing the earlier defect classifications.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY, CG-TASK-TARGET-AUTHORITY,
  CG-NATIVE-INTERACTION-AUTHORITY.
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: the transport node now distinguishes approved design, implemented
  repository behavior, real local process evidence and still-missing fresh loaded-host evidence.

## Authority Boundary

No Approval: QA is requested while CSED-QA-01 is open. This decision grants no UAT, installation,
restart, external model run, commit, push, PR or release authority.
