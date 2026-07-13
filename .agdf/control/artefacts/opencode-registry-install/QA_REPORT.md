# QA Report: OpenCode Registry Installation and Runtime Integrity

Status: pass
Gate: QA
Gate approval: approved on 2026-07-13
Based on: approved TP, CD+Tests, TP Review, Clean Implementation Review and Code Review
Date: 2026-07-13
Owner: QA gate

## QA Gate

- decision: `pass`
- evidence:
  - TP Review is `pass`: ORI-01 through ORI-10 are `fully_done`; no partial or missing task remains.
  - Brownfield Analysis is `pass`: implementation extends the existing installer, parser, transition, Runtime Contract, template, generator and test owners without parallel structures.
  - Clean Implementation Review is `pass`: the production path has no local/cache fallback, retained legacy heading compatibility is bounded, and post-review fixes preserve one owner per rule.
  - Code Review is `pass`: both P1 gate-bypass findings and the P2 cross-platform test-seam finding are resolved with targeted regression evidence.
  - Exact registry installation and real isolated migration from the observed npx-cache `file:` shape pass while preserving `@opencode-ai/plugin@1.17.11`.
  - Permanent source-removal regression proves the installed package remains loadable/current after the legacy `.npm/_npx` source is deleted.
  - Eleven CLI late-gate cases assert status, current gate, missing approval, allowed, forbidden and next action. Premature QA/UAT evidence cannot bypass earlier prerequisites; CD+Tests and mandatory CR cannot be skipped with `not_applicable` on an approved-TP path.
  - Canonical and legacy Mode/Slice parsing, QA approval/report vocabulary separation, global `agdf-global-*` guidance and dead-code removal are covered.
  - Final `npm --prefix create-agdf run smoke-test` passes, including generated sync, control-state, Delivery Path Search, generator and routing tests.
  - Runtime integrity passes (`9 skills and 14 control files checked`); release-bootstrap smoke passes with unchanged public command shape; `doctor --json` passes with 0 findings; `git diff --check` passes.
- missing_evidence:
  - Native Windows execution was not available in this session. The fake npm test path now selects `node <test-cli>` before platform-specific npm selection, removing the former PATH dependency by construction; this is a residual platform-validation gap, not a known defect.
  - The user's real global OpenCode installation has not been updated with the working source. This is intentionally reserved for UAT or separate explicit instruction and does not weaken isolated install/migration QA evidence.
- risks:
  - `low`: npm and OpenCode behavior should still be observed once through the real global UAT update, especially the resulting package/lock paths and visible version/status output.
  - `low`: legacy `Mode / Slice Decision` remains readable until legacy projection compatibility is formally retired; canonical output and precedence are tested.
- required_next_step: Request exact `Approval: QA`; after approval, perform UAT against the real global OpenCode installation before delivery closeout.
- impact_codes: `AGDF_STATUS_CARD_PARALLEL_RULE_MODEL` — satisfied. Gate/status output remains a projection of the single shared transition owner; Runtime Contract, CLI matrix and smoke evidence are present.
- context_graph_impact: `link_only`
- context_graph_refs: `CG-RUN-STATUS-CARD`; existing OpenCode global-install/runtime-integrity evidence.
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`

## 1. QA Decision

Decision: `pass`

The implementation is sufficiently evidenced for QA. No P0/P1 issue, partial TP task, Brownfield conflict, solution-integrity defect, SoT drift or blocking Context Graph action remains.

## 2. TP Coverage

- fully_done: 10/10 (`ORI-01` through `ORI-10`)
- partially_done: 0
- not_done: 0
- acceptance criteria: all `done`

## 3. Evidence

- `.agdf/control/artefacts/opencode-registry-install/CD_TESTS.md`
- `.agdf/control/artefacts/opencode-registry-install/TP_REVIEW.md`
- `.agdf/control/artefacts/opencode-registry-install/CLEAN_IMPLEMENTATION_REVIEW.md`
- `.agdf/control/artefacts/opencode-registry-install/CODE_REVIEW.md`
- final package smoke, runtime-integrity, release-bootstrap, doctor and diff-check outputs recorded on 2026-07-13.

## 4. Missing Evidence

Only the explicitly deferred UAT observations listed above remain. They do not change the QA decision.

## 5. Risks

Residual risks are low and UAT-observable. No release or real global mutation is authorized by this QA pass alone.

## 6. Required Next Step

Approve this QA decision only with:

`Approval: QA`

After approval, run UAT against the real global OpenCode installation. Do not claim UAT or release before that evidence exists.

## 7. Gate Approval

Gate approval: approved

Exact approval received on 2026-07-13:

`Approval: QA`
