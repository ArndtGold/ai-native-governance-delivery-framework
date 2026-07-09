# QA Report: Human-readable AGDF Master Backlog

Run: `master-backlog-human-readable`
Gate: QA
Status: pass
Date: 2026-07-09

## Decision

- qa_decision: pass
- scope: Compact human-readable Master Backlog, Markdown links, stable status/path normalization, legacy compatibility, skill/runtime guidance and generated assets
- basis: Approved TP, pre-implementation Brownfield Analysis, complete TP coverage, clean implementation review, code review and passing targeted regression evidence

## Evidence

| Evidence | Result | Covers |
|---|---|---|
| `node plugin/scripts/check-runtime-integrity.mjs` | pass | Canonical template, runtime, skills and generated-source integrity |
| `npm --prefix create-agdf run smoke-test` | pass | Compact and legacy parsing, statuses, links, invalid findings, package sync and routing |
| Live `delivery-map --json` | pass with declared warnings | Human backlog parses to stable repository-relative JSON paths |
| `git diff --check` | pass | Patch hygiene |
| TP Review | pass | T1–T7 fully done |
| Clean Implementation Review | pass | Single owner and bounded compatibility adapter |
| Code Review | pass | No correctness, security or maintainability findings |

## Acceptance Coverage

| Acceptance criterion | Status | Evidence |
|---|---|---|
| Canonical compact template | done | T1 |
| Generated assets match sources | done | T2, T5 |
| Compact links normalize to paths | done | T3, T7 |
| Human statuses normalize stably | done | T3, T7 |
| Legacy wide rows remain supported | done | T3, T7 |
| Unknown compact values create findings | done | T4, T7 |
| Gate-check and delivery-map consume normalized state | done | T3, T6 |
| Integrity, smoke and routing checks pass | done | T5, T7 |

## Risks

| Risk | Status | Mitigation |
|---|---|---|
| Markdown syntax leaks into JSON | resolved | Link targets normalize at the parser boundary and tests reject Markdown syntax in output |
| Human/machine status drift | resolved | One canonical mapping with complete status fixtures |
| Legacy repositories regress | resolved | Legacy fixture and existing delivery-map chain test remain green |
| Compact Artefacts cell wraps | acceptable | Links remain readable and navigable; no data is hidden |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-OPERATING-MODEL-SHARPENING
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: QA confirms the human presentation and machine projection remain one governed model.

## Next Permissible Step

- next_allowed_action: Produce OR and request `Approval: UAT`.
- quality_outlook: Validate compact backlog readability in the next generated consumer repository.
