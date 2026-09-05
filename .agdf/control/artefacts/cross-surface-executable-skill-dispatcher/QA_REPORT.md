# QA Report: Cross-surface Executable Skill Dispatcher

Revision: 12
Date: 2026-09-05
Decision: revise
Run: cross-surface-executable-skill-dispatcher
Scope: approved TP Revision 2. Prior reports remain historical Git evidence.

## Quality Readiness

| Dimension | Result | Decisive evidence |
|---|---|---|
| Plan coverage | revise | TP Review: 12/16 fully_done, TP-09/10/14/16 partial |
| Solution integrity | pass | existing generator and locale owners; no permissive fallback or parallel governance policy |
| Code quality | pass | reviewed Codex correction, German ambiguous-run and native-environment regressions |
| QA decision | revise | required fresh loaded-host and native-OS evidence remains absent |

Decision owner: qa-gate.

## Codex Follow-up Decision

`qa-gate` retains exactly `revise`. The actual Codex task exposes two repository defects,
`CSED-CODEX-09` and `CSED-CODEX-10`, now corrected and regression-tested. The corrected source
replay returns the canonical German control result. `CSED-HOST-09` also proves that loaded profile,
current installation, full-turn latency and post-terminal model output need separate evidence.
The previous hook-trust diagnosis is not the cause of this renderer failure. Corrected native
installation and fresh-session behavior remain open under CSED-QA-01.

## QA Gate

- decision: revise
- evidence: approved SD2/TP2, Brownfield Analysis 5, CD+Tests 10, TP Review 10,
  Clean Review 10 and Code Review 10, green repository regression, 40 adapter cases,
  reviewed 83-case offline replay compatibility, isolated rollback and real Electron chain.
- missing_evidence: corrected user-host installation/restart, complete Codex/Claude/Copilot/OpenCode
  reference matrix, OpenCode inactive/ordinary-chat retests, native Windows/Linux process
  observations, first-visible latency and model adherence. CSED-RUNTIME-01 is not a fresh session.
- verification_limit: generated Copilot duplicates reappeared in the shared checkout after canonical
  regeneration; the complete source suite passed in an isolated exact snapshot (1088 source files matched).
  Current shared-checkout packaging is not declared ready. See CD_TESTS.md for exact logs.
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
