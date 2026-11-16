# TP: Companion shows planned URs instead of an empty state

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-11-16
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Core run view: shared `readUrFacts` reader used by `readRunNaming` and new `readPlannedView`; additive `planned` field in `projectRunView`; separate captured read in `readRunView` with `[]` fallback (`packages/core/lib/companion/run-view.js`) | Claude (agent) | none |
| T-002 | Catalog and validation: `companion.planned` texts and `companion.statusStates.planned` in de and en (`plugins/agdf/meta/agdf-interaction-locales.json`); add `planned` to the exact statusStates key set (`packages/core/lib/interaction-catalog-validation.js`) | Claude (agent) | none |
| T-003 | Host template snapshot and selection: `companionPlan` and snapshot field `planned` (`run-state.mjs`); `pickPlan` (`assignment.mjs`) | Claude (agent) | T-001 |
| T-004 | View model, pane and terminal: planned branch in `buildPanelView` and terminal text (`view.mjs`); `shownId`, note line and figure options in `register.mjs` | Claude (agent) | T-002, T-003 |
| T-005 | Status line: observed kind `planned` and its text (`notice.mjs`) | Claude (agent) | T-002, T-003 |
| T-006 | Refresh fingerprint for planned folders and their files (`register.mjs`) | Claude (agent) | T-003 |
| T-007 | Tests: Core run-view cases, companion unit cases, adapter cases as listed in the Test Plan | Claude (agent) | T-001 to T-006 |
| T-008 | Derived artefacts in order: `npm run build:mcp` (packages/control-ui), `node scripts/sync-package-assets.js`, exact `plugins/agdf/meta/copilot-payload-baseline.json` from the generated payload inventory, `node scripts/host-compatibility/run.mjs record`; then the full check list | Claude (agent) | T-002, T-004, T-005 |
| T-009 | Visual evidence: render the pane for draft working, draft resting and ready from the real code path (Core run view -> snapshot -> view -> figure) as PNG for the owner | Claude (agent) | T-004 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | `readRunView` of a project with one draft planned UR returns `planned` with plan_id, title, coverage `draft` and goal | packages/core/test/companion-run-view-test.js output |
| AC-001 | SDD-004 | T-003 | SCN-002 | `pickPlan` returns the newest planned UR when no Run is open, and when it changed after session start beside open Runs; returns null for an older one beside open Runs | packages/cli/scripts/claude-companion-test.js output |
| AC-001 | SDD-005 | T-004 | SCN-003 | pane and terminal show title, "UR planning · no run yet" / "UR-Planung · noch kein Run", goal, "Up next", gate bar and plan id; no empty-state text | claude-companion-test.js and claude-companion-adapter-test.js output |
| AC-002 | SDD-005 | T-004 | SCN-004 | during a turn the line reads "drafting the UR", block "One moment", figure markup has the UR clipboard with `dur="9s"`; after turn end the figure rests | claude-companion-adapter-test.js output |
| AC-003 | SDD-005 | T-004 | SCN-005 | coverage `ready` yields "UR ready for handover", "Handover to a run" and the handover hint in de and en | companion-run-view-test.js (ready entry) and claude-companion-test.js output |
| AC-004 | SDD-005 | T-004 | SCN-006 | coverage recovery_required, unconfirmed and unavailable each yield "UR planning needs clarification" with their own label and the clarify hint | claude-companion-test.js output |
| AC-005 | SDD-001 | T-001 | SCN-007 | after create-from-planned the transferred plan is absent from `planned` and the Run is listed | companion-run-view-test.js output |
| AC-006 | SDD-002 | T-001 | SCN-008 | with an unreadable planning store `readRunView` returns its Runs and `planned: []` without throwing | companion-run-view-test.js output |
| AC-007 | SDD-005 | T-004 | SCN-009 | note lines "Completed runs: n" and "More URs in planning: n" appear only for non-zero counts; German view contains no English catalog text | claude-companion-test.js output |
| AC-007 | SDD-007 | T-005 | SCN-010 | status line reads "AGDF · UR planning" / "AGDF · UR-Planung"; catalog validation accepts the catalog with `planned` | claude-companion-test.js, claude-companion-adapter-test.js and interaction-catalog-test.js output |
| AC-008 | SDD-006 | T-006 | SCN-011 | a new planned UR and a changed planned UR each cause exactly one additional run-view process; an unchanged project causes none | claude-companion-adapter-test.js output (process count) |
| AC-009 | SDD-003 | T-001 | SCN-012 | existing run naming cases (title from UR heading, localized goal) pass unchanged with the shared reader | companion-run-view-test.js and run-view-command-test.js output |
| AC-009 | SDD-004 | T-007 | SCN-013 | all existing companion, adapter, parity, integrity and catalog suites pass; projects without AGDF still show the invite view | full check list output |

## 3. Test Plan

Reuse: the existing companion and run-view suites already cover Run naming, Run views, the invite view, figure rules and the terminal; new cases are added only for the planned state. All commands run locally on this Windows host in this Run before CR; CI on the PR repeats them. Known unrelated host limit: symlink tests fail with EPERM on this host and are not part of this list. Sufficiency: every scenario below passes and the full check list in SCN-013 is green.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | `npm run test:companion-run-view` in packages/cli | local Node, Windows | generated catalog synced (T-008 sync) | Claude (agent) | test passes with planned draft case | stop and report; no CR |
| AC-001 | SCN-002 | `npm run test:claude-companion` in packages/cli | local Node, Windows | none | Claude (agent) | pickPlan cases pass | stop and report |
| AC-001 | SCN-003 | `npm run test:claude-companion` and the adapter test in packages/cli | local Node, Windows | none | Claude (agent) | view, pane and terminal cases pass in de and en | stop and report |
| AC-002 | SCN-004 | adapter test `packages/cli/scripts/claude-companion-adapter-test.js` | local Node, Windows | none | Claude (agent) | figure markup assertions pass | stop and report |
| AC-003 | SCN-005 | `npm run test:companion-run-view` and `npm run test:claude-companion` | local Node, Windows | none | Claude (agent) | ready cases pass | stop and report |
| AC-004 | SCN-006 | `npm run test:claude-companion` | local Node, Windows | none | Claude (agent) | three coverage cases pass | stop and report |
| AC-005 | SCN-007 | `npm run test:companion-run-view` | local Node, Windows | planned fixtures with create-from-planned | Claude (agent) | handover case passes | stop and report |
| AC-006 | SCN-008 | `npm run test:companion-run-view` | local Node, Windows | none | Claude (agent) | unreadable-store case passes | stop and report |
| AC-007 | SCN-009 | `npm run test:claude-companion` | local Node, Windows | none | Claude (agent) | note and language-purity cases pass | stop and report |
| AC-007 | SCN-010 | `npm run test:claude-companion`, adapter test, `node scripts/interaction-catalog-test.js` | local Node, Windows | catalog synced | Claude (agent) | status-line and catalog cases pass | stop and report |
| AC-008 | SCN-011 | adapter test | local Node, Windows | none | Claude (agent) | process-count assertions pass | stop and report |
| AC-009 | SCN-012 | `npm run test:companion-run-view`, `node scripts/run-view-command-test.js` | local Node, Windows | none | Claude (agent) | existing naming cases pass unchanged | stop and report |
| AC-009 | SCN-013 | full list: `test:claude-companion`, `test:companion-run-view`, interaction-catalog, payload-budget, copilot-profile, package-contents, `test:skill-evals`, `eval:skills`, `test:operational-localization`, `test:interaction-presentation`, host-compatibility-test, run-view-command-test, `test:planned-urs`, control-ui typecheck and `npm test`, `npm run build:prepare`, `node scripts/check-community-health.mjs`, `node scripts/host-compatibility/run.mjs check` | local Node, Windows | T-008 chain completed in order | Claude (agent) | every listed check passes | record the failing check with output; QA cannot pass |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Reuse of the existing candidate code | SD: Reuse of the existing candidate code | resolved | The uncommitted candidate on feat/companion-planned-ur is the starting point for T-001 to T-007. Implementation-preparation Brownfield Analysis compares each changed file with SDD-001 to SDD-007; parts that match are kept, deviations are corrected, nothing counts as done until its scenarios pass in this Run. The derived artefacts of T-008 are regenerated in this Run, not reused. | Arndt Gold |
| Visual evidence format | TP | resolved | PNG renders from the real code path via the existing Playwright setup in packages/control-ui; the live Claude pane stays a stated gap. | Arndt Gold |

## 4. Brownfield Scope

- `packages/core/lib/companion/run-view.js` and its callers; `packages/core/lib/control-state/planned-inventory.js` (read-only use).
- `plugins/agdf/host-templates/claude/companion/` (`assignment.mjs`, `run-state.mjs`, `view.mjs`, `register.mjs`, `notice.mjs`, `figure.mjs` unchanged).
- `plugins/agdf/meta/agdf-interaction-locales.json`, `packages/core/lib/interaction-catalog-validation.js`.
- Derived: `plugins/agdf/meta/copilot-payload-baseline.json`, `docs/compatibility/**`, `evals/host-compatibility/observations/`.
- The uncommitted candidate diff on `feat/companion-planned-ur` (15 files).

## 5. Out Of Scope

- Cockpit, Codex companion and Copilot behaviour.
- Any write path from the companion, planning semantics, readiness rules, `run.create_from_planned`.
- A selection UI for several planned URs; translation of UR titles.
- Commit, push and PR creation (handled after QA/UAT only on owner request).

## 6. Risks And Blockers

- Candidate code was written without a Run; Brownfield Analysis and CR must review it like new code (revise if deviations are found).
- The catalog change chain must run in order; a stale MCP UI build makes `sync-package-assets.js` fail.
- Live Claude pane not verified (warn, stated in QA).
- Readiness depends on the display language (known PRD risk, warn).

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Ziel: Aufgaben und Tests für die Anzeige geplanter URs im Begleiter festlegen.
- Aufgaben: T-001 Core-Run-Ansicht mit gemeinsamem UR-Leser und Feld `planned`; T-002 Katalogtexte de/en und Validierung; T-003 Schnappschuss und Auswahl `pickPlan`; T-004 Ansicht, Panel und Terminal; T-005 Statuszeile; T-006 Fingerabdruck für Planungsordner; T-007 Tests; T-008 abgeleitete Dateien in fester Reihenfolge (MCP-UI-Build, Asset-Sync, Payload-Baseline, Kompatibilitätsaufzeichnung) und vollständige Prüfliste; T-009 gerenderte Bilder aus dem echten Codepfad.
- Prüfung: 13 Szenarien decken AC-001 bis AC-009 und SDD-001 bis SDD-007 ab; alle Prüfungen laufen lokal vor dem Code Review, CI wiederholt sie.
- Entscheidungen: Der vorhandene Kandidatencode ist Ausgangspunkt; die Brownfield-Analyse vergleicht jede Datei mit dem SD, Abweichungen werden korrigiert, und nichts gilt als erledigt, bevor seine Szenarien in diesem Run bestehen. Abgeleitete Dateien werden neu erzeugt. Sichtnachweis als PNG; das echte Claude-Panel bleibt eine benannte Lücke.
- Nicht enthalten: Cockpit, Codex, Copilot, Schreibzugriffe, Auswahl-UI, Commit/Push/PR.
