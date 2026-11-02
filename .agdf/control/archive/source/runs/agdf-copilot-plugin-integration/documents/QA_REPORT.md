# QA Report: Copilot Task-Target Binding

Status: done
Decision: revise
Revision: 16
Date: 2026-09-07
Run: `agdf-copilot-plugin-integration`
Based on: approved TP Revision 4, Brownfield Analysis Revision 4, refreshed implementation,
Task Plan Review Revision 15, Clean Implementation Review Revision 14 and Code Review Revision 14

## Quality Readiness

| Dimension | Status | Decisive evidence |
|---|---|---|
| Plan coverage | revise | Task Plan Review Revision 15 records 15/19 fully done; the corrected German `qa-gate` conversation-language path still needs one fresh loaded-host observation |
| Solution integrity | pass | one semantic function description, one target resolver and one renderer own language, target and presentation without a Copilot-only path |
| Code quality | pass | Code Review Revision 14 has no open correctness, security, compatibility or maintainability finding |
| QA decision | revise | `qa-gate` must consume the open evidence gap and non-verifiable visible Copilot rows without upgrading them |

Sole decision owner: `qa-gate`.

## QA Gate

- decision: revise
- evidence: the user-provided Copilot observation shows `qa-gate` still rendered its first canonical
  target card in English during a German conversation. The later model translation omitted the
  working directory and renamed fields. The correction makes the `presentation_language` function
  property the canonical owner, names `<current-conversation-language-tag>` in every binding and
  projects that exact description into all ten executable skills. The strengthened German
  `qa-gate` eval, function/binding tests, instruction footprint, Runtime Integrity, 83/83 evals and
  the complete remaining smoke suites pass. Installed Copilot 0.14.5 is Ready; generated and
  installed `qa-gate` and locale-registry bytes match, and the installed executable returns a complete German card.
  The installed selected Copilot run also renders a complete German QA-revise status with empty presentation
  diagnostics after its revised recovery and quality text were bound to the existing locale registry.
  The final installed edge matrix keeps a missing language as a pre-dispatch error, normalizes
  `de-DE` to `de`, renders unsupported `fr-FR` through the complete English pack for both unresolved
  and selected-run cards, and carries the normalized language into gate evaluation and skill continuation.
  One uninterrupted full smoke passes with 83/83 skill evals and 467 package files.
- missing_evidence: the corrected common behavior has not been observed after a full fresh Copilot
  restart. The repository-bound path and optional automatic SessionStart path remain unobserved;
  automatic checks remain Manual.
- risks: Copilot remains `instruction_only`; installed executable behavior and deterministic replay
  cannot prove that a freshly loaded model follows the target-preflight instruction. SessionStart
  output cannot be observed automatically until the user deliberately renews consent.
- required_next_step: fully restart GitHub Copilot, start a new repo-less GeneralChat in German and
  invoke `agdf-qa-gate`; it must immediately render the complete German `no_reliable_target` card,
  including `Arbeitsordner`, without requiring translation or reconstructing the table.
- impact_codes: `qa_revise_required`, `host_evidence_missing`

## Normalized Findings Consumed

| finding_id | gap_type | routing_target | gap_status | QA disposition |
|---|---|---|---|---|
| CPI-TPR11-01 | evidence_gap | evidence_obligation | open | prevents QA pass until the corrected common German `qa-gate` path and repository-bound path are observed |
| CPI-QA9-01 | implementation_gap | CD+Tests | resolved | review corrections for target-only options, current-repository membership, stale continuation and localized recovery values are present and green |
| CPI-QA10-01 | implementation_gap | CD+Tests | resolved | fresh host exposed prior-UR fall-through after correct unresolved classification; terminal early return, static contract checks and adversarial replay are now present and green |
| CPI-QA11-01 | implementation_gap | CD+Tests | resolved | second host run forced chat cwd into `current_repository`, omitted chat locale and added narration; separate no-target invocation, explicit locale and concise follow-up are now present and green |
| CPI-QA12-01 | implementation_gap | CD+Tests | resolved | third host run still emitted English; explicit user-conversation locale binding, literal German argument and same-language clarification were added to `gate-check` |
| CPI-QA14-01 | implementation_gap | CD+Tests | resolved | latest `qa-gate` host run exposed that the earlier precision was not common; the semantic function parameter, binding grammar and all ten skill projections now own the same rule and pass deterministic/installed verification |
| CPI-QA15-01 | implementation_gap | CD+Tests | resolved | selected-run revalidation exposed unregistered revised recovery and quality text; both values now come from the existing English/German locale registry, the regression passes and presentation diagnostics are empty |
| CPI-QA16-01 | implementation_gap | CD+Tests | resolved | an unsupported well-formed language tag originally terminated dispatch; the canonical resolver now selects the complete English pack, keeps missing input fail-closed and propagates the normalized locale through the complete dispatch path |

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

## 2026-09-05 Installer correction QA

| Dimension | Status | Decisive evidence |
|---|---|---|
| Plan coverage | revise | final correction coverage is 7/8; desktop discovery remains unobserved, alongside earlier task-target host gaps |
| Solution integrity | pass | one canonical managed Git marketplace and native discovery verification replace the temporary registration |
| Code quality | pass | actual diff reviewed; failed-recovery enablement regression corrected and tested |
| QA decision | revise | qa-gate consumes CPI-TPR12-02 and the unchanged CPI-TPR11-01 host obligations |

- decision: revise
- evidence: final normal installer succeeds; identical generated/staged/installed content; ten global and ten fresh-session skills; native 1.0.80/1.0.83-5 update/rollback matrices; full smoke and 83/83 evals
- missing_evidence: restarted desktop skill presentation, German repo-less/repository-bound model behavior and optional consented automatic SessionStart; native Windows remains unobserved
- risks: SDK discovery cannot establish rendered app or model conformance; no upstream directory-discovery fix is claimed
- required_next_step: fully restart GitHub Copilot and verify AGDF skill visibility in a fresh desktop session
- impact_codes: qa_revise_required, host_evidence_missing
- context_graph_impact: link_only
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-CREATE-AGDF-CLI-COMPOSITION
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none

Sole decision owner: qa-gate. Earlier report sections retain historical target-routing evidence; this dated addendum is the current installer assessment. QA and UAT approval are not requested.
