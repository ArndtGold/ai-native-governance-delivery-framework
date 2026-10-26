# QA Report: AGDF Companion in the Claude Projection of the AGDF Plugin

Status: draft
Gate: QA
Gate approval: open
Based on: TP, implementation evidence, task-plan review
Date: 2026-10-26
Owner: Arndt Gold

## 1. QA Decision

Decision: `revise`

## 2. TP Coverage

- delivered_result: An opt-in AGDF companion panel in the Claude projection of the AGDF runtime plugin. `/agdf-companion` switches it on and off; the choice is stored in the AGDF plugin data directory. It shows the four run states with a figure, a single-line gate bar, the run origin, a one-line objective and the localized next step. Assignment follows the run changed in the session, then the remembered selection, otherwise "Kein Run zugeordnet". It runs on desktop with a terminal text fallback, reads only and keeps failures isolated. Superseded and abandoned runs are not yet handled as closed runs, and the missing-control message does not yet name the checked folder.

Seven of nine TP tasks are fully done: T-001, T-002, T-004, T-005, T-007, T-008 and T-009. T-003 and T-006 are partially done (TPR-F01, TPR-F02); see [TP Review](TP_REVIEW-input-01.md).

## 3. Evidence

- tp_review: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/TP_REVIEW-input-01.md`
- clean_implementation_review: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/CLEAN_IMPLEMENTATION_REVIEW-input-01.md`
- code_review: `.agdf/control/artefacts/agdf-begleiter-companion-20261025-01/CODE_REVIEW-input-02.md`

Quality Readiness (derived; `qa-gate` is the sole decision owner):

| Dimension | Source | Result |
|---|---|---|
| Plan coverage | TP Review | revise: T-003 and T-006 partially done |
| Solution integrity | Clean Implementation Review | revise: lifecycle vocabulary not bound to the core |
| Code quality | Code Review | pass: CR-F01 to CR-F11 resolved |
| QA decision | qa-gate | revise |

Further evidence:

- CD+Tests (`CD_TESTS-input-01.md`) and task evidence `T-001_HOST_PROBE*.md`, `T-002_EVIDENCE.md` to `T-009_EVIDENCE.md`.
- Live screenshots in `live/` and the byte-identity ledger `live/harness-ledger.json`.
- Brownfield Analysis pass (`BROWNFIELD_ANALYSIS-input-03.md`); the solution reuses the existing generation, integrity, Copilot exclusion, locale registry and CI plan owners.

UX Intent Fidelity: AC-001, AC-002, AC-005 and AC-007 to AC-010 are fulfilled with visible evidence. AC-003, AC-004 and AC-006 are partial.

## 4. Missing Evidence

- qualification_limits: No `npm run verify:ci` result exists for the current tree; the corrections will change it again. The installed desktop build predates the CR corrections. Linux and macOS run only in pull-request CI. The mobile surface is out of scope.

## 5. Risks

- delivery_risks: A project with superseded or abandoned runs shows them as unreadable instead of closed. A user who sees the missing-control message cannot tell which folder was checked. The companion lifecycle set can drift from the core again without a failing test.

Context graph:

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION, CG-RUN-STATUS-CARD
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: `BROWNFIELD_ANALYSIS.md` (update both nodes after implementation evidence); curation is due before OR.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-F01 | implementation_gap | CD+Tests | open | `TP_REVIEW-input-01.md`: core `run-state-parser.js:13` accepts `superseded` and `abandoned`; companion `run-state.mjs:10` rejects them as `format`; `assignment.mjs:8` treats every non-`completed` run as open | In CD+Tests, parse `superseded` and `abandoned` as valid, treat only `active` as open, never assign such a run, drop a remembered selection on it, and add parity tests with superseded and abandoned fixtures against the core reader |
| TPR-F02 | implementation_gap | CD+Tests | open | `TP_REVIEW-input-01.md`: the AC-006 missing-control message (`locales.json` `messages.noControl`) does not name the checked folder (owner clarification of 2026-10-26) | In CD+Tests, carry the project root in the `no_control` snapshot, show its last path part in the en and de message with the full path as a hint in the panel and terminal text, and cover it in the reader and view tests |
| TPR-F03 | evidence_gap | evidence_obligation | open | `TP_REVIEW-input-01.md`: `T-007_EVIDENCE.md` covers the T-007 tree only | Run `npm run verify:ci` on the tree after the TPR-F01 and TPR-F02 corrections and record the result in the CD+Tests evidence |
| CIR-F01 | implementation_gap | CD+Tests | open | `CLEAN_IMPLEMENTATION_REVIEW-input-01.md`: `run-state.mjs:10` keeps a private lifecycle set that is not bound to core `LIFECYCLES` | In CD+Tests, export the companion lifecycle set and assert in the logic suite that it equals the core `LIFECYCLES` |

## 6. Required Next Step

Resolve TPR-F01, TPR-F02 and CIR-F01 in CD+Tests and collect TPR-F03. Then record CD+Tests, Code Review, TP Review and Clean Implementation Review again and rerun QA. Do not request `Approval: QA` from this revise report.

## 7. Gate Approval

Approve this QA decision only with:

`Approval: QA`
