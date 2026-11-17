# OR: Companion shows planned URs instead of an empty state

Gate: OR
Type: Orchestration Report
Report mode: `OR-full`
Status: `done`

## Run

- run_id: run-9c609e83-5a41-4644-8892-3aed624a617d
- related_ur: .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/UR.md
- related_prd: .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/PRD.md
- related_sd: .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/SD.md
- related_tp: .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/TP.md
- related_qa_report: .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/QA_REPORT.md
- mode_slice_decision: structured_slice
- current_gate: OR
- decision: pass

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/UR.md |
| Brownfield Review | done | .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_slice | .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/BROWNFIELD_REVIEW.md |
| PRD | approved | .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/PRD.md |
| SD | approved | .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/SD.md |
| TP | approved | .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/TP.md |
| Brownfield Analysis | done | .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/CD_TESTS.md |
| CR | done | .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/CODE_REVIEW.md |
| QA | approved | .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/QA_REPORT.md |
| UAT | approved | Approval: UAT · 2026-11-16 · presentation 01ab2291-7d59-437c-9496-614e2f20c534 sha256:d4ecd42b016eb6b95ca31092f754e4255fe7d65540d73640310793bb3ea5880b |

## Run Status Card

| Run status | Value |
|---|---|
| Status | delivered, uncommitted |
| Current gate | OR |
| Allowed now | delivery closeout and, on explicit owner instruction, commit and PR |
| Blocked by | none |
| Missing approval | none |
| Next step | owner decides on commit and PR |
| Quality outlook | good; remaining gap is the unverified live Claude pane, CI pending until commit |

## Delivered

| Item | Evidence |
|---|---|
| Core run view lists non-transferred planned URs with goal and change time, empty list on failure | packages/core/lib/companion/run-view.js; Core run-view tests |
| Companion shows the newest planned UR instead of an empty state, with coverage-specific guidance, note, plan id and status line | plugins/agdf/host-templates/claude/companion/{assignment,run-state,view,register,notice}.mjs; companion and adapter tests; PNG render |
| Refresh on new or changed planned UR, read once | register.mjs fingerprint; adapter process-count test |
| Catalog texts de/en incl. untitled UR; validation key set | plugins/agdf/meta/agdf-interaction-locales.json; interaction-catalog-validation.js |
| Derived artefacts regenerated | copilot-payload-baseline.json 459 files / 4,826,070 bytes; docs/compatibility/**; observation 54804015 |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Commit, push, PR | VCS actions need explicit owner instruction | owner |
| Live check in the Claude companion pane | not possible inside this run | owner after merge or install |
| Selection UI for several planned URs | PRD non-goal | none |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| TP check list green after CR fixes | local runs on Windows (packages/cli suites, build:prepare, control-ui 353/353, compatibility check) | AC-001 to AC-009 | direct |
| CR-01 regression test red without fix, green with fix | adapter test | AC-008 | direct |
| Independent read-only code review | review subagent report, summarized in CODE_REVIEW.md | correctness, regressions | direct |
| PNG of four pane states from the real code path | scratchpad render via Playwright | AC-001 to AC-004, AC-007 visible | indirect |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Live Claude companion pane | warn | owner checks the pane after the change is installed |
| CI on the PR | warn | runs after commit and PR |
| control-ui browser tests | warn | outside TP; CI step does not run them either |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Readiness follows display language: a UR without German summary shows as draft in German | warn | accepted in PRD |
| "Drafting the UR" shown for any main-loop turn | warn | known limit of the companion |
| AGDF routed directly from Brownfield Review to PRD although the review declared ux_intent_definition_required: yes; the PRD defined the UX semantics directly | warn | AGDF maintainer: check how Core parses the routing field when its value is not a bare enum |
| CD_TESTS.md lists the pre-CR baseline (4,825,942 bytes) and observation 64ad0d2f; both were superseded during CR (4,826,070 bytes, observation 54804015) as recorded in CODE_REVIEW.md | warn | none; CR record is the current evidence |
| Earlier companion changes (PRs #73, #75) were delivered without an AGDF run and their PR texts overstate the owner's exemption | warn | owner decides whether to correct those PR descriptions |

## Parent Reconciliation Handoff

- outcome: not_applicable
- target_run_id: none
- disposition: not_applicable
- evidence: no OR reconciles_with relationship declared
- missing_evidence: none
- next_action: none

## Programme Aggregation Readiness

- startable: false
- final_ready: false
- acceptance_ref: none
- evidence: not a programme run
- missing_evidence: none
- next_action: none

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: extends existing companion and run-view behaviour without new SoT or owner

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: run-specific evidence stays in the run documents of this Run
- memory_refs: .agdf/control/runs/run-9c609e83-5a41-4644-8892-3aed624a617d/documents/

## Next Permissible Step

- next_allowed_action: delivery closeout; commit and PR only on explicit owner instruction
- required_approval: none
- forbidden_until_then: automatic commit, push, PR or release

## Approval

OR does not approve later gates. It records the next permissible step.

## AGDF Approval Summary (de; source=en)

- Ergebnis: Der Begleiter zeigt eine geplante UR statt einer Leer-Meldung; alle Gates von UR bis UAT sind freigegeben, Code Review mit vier behobenen Befunden, QA pass.
- Grenzen: Das echte Claude-Panel ist nicht geprüft, CI läuft erst nach Commit und PR.
- Risiken: Bereitschaft hängt von der Anzeigesprache ab; AGDF hat den verlangten UX-Intent-Schritt nicht geroutet (Hinweis an AGDF); frühere Begleiter-PRs (#73, #75) liefen ohne Run.
- Nächster Schritt: Commit und PR nur auf deine ausdrückliche Anweisung.
