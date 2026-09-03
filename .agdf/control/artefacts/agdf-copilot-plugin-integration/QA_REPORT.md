# QA Report: Copilot Task-Target Binding

Status: done
Decision: revise
Revision: 12
Date: 2026-09-03
Run: `agdf-copilot-plugin-integration`
Based on: approved TP Revision 4, Brownfield Analysis Revision 4, refreshed implementation,
Task Plan Review Revision 11, Clean Implementation Review Revision 10 and Code Review Revision 10

## Quality Readiness

| Dimension | Status | Decisive evidence |
|---|---|---|
| Plan coverage | revise | Task Plan Review Revision 11 records 16/19 fully done; the explicit German conversation-locale path still needs a fourth host observation |
| Solution integrity | pass | one target resolver and one physical repository-context owner remove cwd authority without parallel governance |
| Code quality | pass | Code Review Revision 10 has no open correctness, security, compatibility or maintainability finding |
| QA decision | revise | `qa-gate` must consume the open evidence gap and non-verifiable visible Copilot rows without upgrading them |

Sole decision owner: `qa-gate`.

## QA Gate

- decision: revise
- evidence: the third restarted GeneralChat proves terminal stopping, suppression of prior gate
  context, non-authorizing chat cwd and one concise question. It remains English in a German
  conversation. The final correction resolves language from the user's natural-language context,
  requires literal `--language de` and requires the question to match the canonical card language.
  The exact corrected command returns `no_reliable_target` with a fully German canonical card.
  Runtime Integrity, 70/70 evals and the complete 389-file smoke suite pass. Installed Copilot 0.14.5
  is Ready with an exact 82-file, 604901-byte profile.
- missing_evidence: the locale-corrected behavior has not been observed after a fourth fresh Copilot
  restart. The repository-bound path and optional automatic SessionStart path remain unobserved;
  automatic checks remain Manual.
- risks: Copilot remains `instruction_only`; installed executable behavior and deterministic replay
  cannot prove that a freshly loaded model follows the target-preflight instruction. SessionStart
  output cannot be observed automatically until the user deliberately renews consent.
- required_next_step: fully restart GitHub Copilot, start a new repo-less GeneralChat in German and invoke
  `/agdf-gate-check`; it must render the German `no_reliable_target` card and ask exactly one short
  target question without process narration or examples.
- impact_codes: `qa_revise_required`, `host_evidence_missing`

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | QA disposition |
|---|---|---|---|---|
| CPI-TPR11-01 | evidence_gap | evidence_obligation | open | prevents QA pass until the literal German conversation-locale path and repository-bound path are observed |
| CPI-QA9-01 | implementation_gap | CD+Tests | resolved | review corrections for target-only options, current-repository membership, stale continuation and localized recovery values are present and green |
| CPI-QA10-01 | implementation_gap | CD+Tests | resolved | fresh host exposed prior-UR fall-through after correct unresolved classification; terminal early return, static contract checks and adversarial replay are now present and green |
| CPI-QA11-01 | implementation_gap | CD+Tests | resolved | second host run forced chat cwd into `current_repository`, omitted chat locale and added narration; separate no-target invocation, explicit locale and concise follow-up are now present and green |
| CPI-QA12-01 | implementation_gap | CD+Tests | resolved | third host run still emitted English; explicit user-conversation locale binding, literal German argument and same-language clarification are now present, green and installed |

## Evidence Boundaries

- Previous QA approvals remain historical evidence for earlier revisions only.
- Full smoke, exact package and installed-root evidence do not prove loaded Copilot behavior.
- The user-observed 37 `doctor --all-active` findings remain portfolio governance evidence across
  17 runs, not a plugin defect.
- No QA approval is requested while the QA decision is `revise`.
- No publication, release, commit or push was performed.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-TASK-TARGET-RESOLUTION`; `CG-PUBLIC-PLUGIN-DISTRIBUTION`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
