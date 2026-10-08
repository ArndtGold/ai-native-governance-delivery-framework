# TP: Stale next step after internal step recording

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-08
Owner: Arndt Gold
Run: status-card-stale-next-action-20261008-01
Traceability contract: criteria-chain-v1

## 1. Scope

Implement SDD-01 to SDD-08 of the approved SD in `packages/core/lib`, prove every PRD criterion with automated tests, compare the displayed next step for all repository runs before and after, propagate the generated copies and verify the stalled cockpit run. No change outside the SD's owners, no Git action and no release.

## 2. Task List

| task_id | task | owner | depends_on |
|---|---|---|---|
| T-001 | Before any code change, capture a read-only baseline for every run under `.agdf/control/runs` with the repository CLI (`node packages/cli/bin/create-agdf.js gate-check --dir . --run <id> --json` and `delivery-map --dir . --run <id> --json`). Record per run: lifecycle, stored and evaluated gate, report `next_allowed_action`, status-card next step and delivery-map next action. Store the result as `evidence/BASELINE_NEXT_ACTION.json` together with the harness script under `evidence/`. Run no `continue_delivery` and no writer over real runs. The baseline captured at 2026-10-08 before any code change stays valid after the SD revision, because it reflects the unchanged runtime. | implementing agent | none |
| T-002 | Add `packages/core/lib/control-evaluation/next-action.js` with `storedNextActionApplies` and `effectiveNextAllowedAction` (SDD-01). Add `packages/core/test/next-action-test.js` covering placeholder, completed run, completed legacy run with a non-OR evaluated gate, active same gate, active forward-moved gate, active backward-moved gate (stored QA, evaluated CD+Tests), unknown stored gate, backtick-quoted gate and same-gate custom CD+Tests text. Register it as `test:next-action` in `packages/cli/package.json`. | implementing agent | T-001 |
| T-003 | Integrate the helper into `gate-check.js` (SDD-02): keep the Verified Change and source-revision branch, use the helper as fallback and in `continuePostTpWork`. Extend `packages/cli/scripts/cli-gate-scenarios-test.js` with fixtures for a forward-moved active run, an equivalent never-stale run (identical text, JSON and status card expected), a same-gate custom run, a backward-moved run (stored QA; stored text kept, no implementation continuation), a completed run and a forward-moved run with an open blocker (blocker text wins). | implementing agent | T-002 |
| T-004 | Integrate the helper into `delivery-map.js` (SDD-03) without the gate-check exceptions. Extend the same scenario test with delivery-map assertions for the gate-moved and same-gate fixtures and a completed Verified Change fixture (unchanged). | implementing agent | T-002 |
| T-005 | Implement the `run-update` refresh in `recordRunRevision` (SDD-04). Add writer tests to the suite that already covers `run-update` (`packages/core/test/control-state-test.js`, or `run-revision-test.js` if the implementation-preparation Brownfield Analysis shows it owns these cases). Required cases: forward-moved active edit refreshes header and the four derived rows while "What is known?" stays authored; backward-moved active edit keeps the stored gate and next step; same-gate edit keeps the next step byte-identical; completed-run edit stays unchanged; an approval change is still rejected; the refreshed run passes seal, approval and binding validation and `doctor`. | implementing agent | T-002 |
| T-006 | Export `CD_TESTS_NEXT_ALLOWED_ACTION` from `gate-policy.js`, use it there and import it in `skill-dispatch/service.js` (SDD-05). Extend `packages/cli/scripts/skill-dispatch-test.js` so that `continue_delivery` returns the `implementation` continuation for a structured fixture with approved TP and recorded Brownfield Analysis, with both stale and current stored text, and returns the status card for a same-gate custom CD+Tests fixture. The existing backward-move safety case in `packages/core/test/artefact-recording-test.js:254-258` stays unchanged and must pass. | implementing agent | T-003 |
| T-007 | Add a cockpit regression assertion (SDD-06) in `packages/core/test/cockpit-scoped-read-test.js`: for the gate-moved fixture the cockpit evaluation shows the evaluated next step, while its `persisted` block still shows the stored values. | implementing agent | T-003 |
| T-008 | Run `npm run sync-package-assets` (SDD-07), then `node plugins/agdf/scripts/check-runtime-integrity.mjs` and the built-runtime integrity check from `scripts/verify-ci.mjs`. Never edit generated copies by hand. | implementing agent | T-003, T-004, T-005, T-006, T-007 |
| T-009 | Regression and comparison. Run `test:next-action`, `test:control-state`, `test:run-revision`, `test:cli-gates`, `test:skill-dispatch`, `test:interaction-presentation`, `test:run-step-transaction`, `smoke-test` (all in `packages/cli`), the cockpit test, `delivery-map --all-active` and `doctor` for the repository. Re-run the T-001 harness and diff against the baseline into `evidence/NEXT_ACTION_COMPARISON.md`. Only active runs whose gate moved forward may change, and `doctor` shows no new finding (SDD-08). | implementing agent | T-008 |
| T-010 | Verify `agdf-cockpit-claude-host-20261008-01` (no edit to its files). First use the repository CLI: gate-check status card and a `skill-dispatch --skill gate-check --continue-delivery` call for that run. Then, only with explicit user consent, reinstall the plugin (`npm --prefix packages/cli run install:claude`), restart Claude, and observe the status card and `continue_delivery` through the MCP dispatcher. Record both observations, the runtime digest and its unchanged approval rows in `evidence/COCKPIT_RUN_VERIFICATION.md`. | implementing agent with user consent for reinstall | T-009 |
| T-011 | After implementation evidence, update the Context Graph node `CG-RUN-STATUS-CARD` with the invariant "next step derives from the evaluated gate; stored text is only a same-gate refinement for active runs" and its evidence refs, before clean closeout. | implementing agent | T-009 |

## 3. Sequencing And Dependencies

- T-001 must finish before any code change, because the baseline is only valid from the unchanged runtime.
- T-002 comes first in code; T-003, T-004 and T-005 build on it, and T-006 and T-007 build on T-003.
- T-008 runs after all code tasks; T-009 after propagation; T-010 and T-011 last.
- The plugin reinstall in T-010 changes the user's Claude environment and requires explicit consent. Without consent, the repository-CLI observation is recorded and the host observation stays open as evidence for UAT.

## 4. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-04 | T-005 | SCN-001 | After `run-update` of a gate-moved active edit the run names CD+Tests (or CR after recorded CD+Tests), the evaluated next step and refreshed derived rows; "What is known?" is unchanged | Writer test output |
| AC-002 | SDD-04 | T-005 | SCN-002 | After `run-update` of a same-gate edit the stored next step is byte-identical | Writer test output |
| AC-003 | SDD-01 | T-002 | SCN-003 | Helper returns the evaluated text for an active run with a moved gate | `test:next-action` output |
| AC-003 | SDD-02 | T-003 | SCN-004 | Gate-check text, JSON and status card of the gate-moved fixture equal those of the never-stale fixture; an open blocker's text still wins | `test:cli-gates` output |
| AC-003 | SDD-03 | T-004 | SCN-005 | Delivery-map next action of the gate-moved fixture is the evaluated text | `test:cli-gates` output |
| AC-003 | SDD-06 | T-007 | SCN-006 | Cockpit evaluation shows the evaluated next step; its `persisted` block shows the stored values | Cockpit test output |
| AC-004 | SDD-01 | T-002 | SCN-007 | Helper keeps stored text for an active run whose gate did not move | `test:next-action` output |
| AC-004 | SDD-01 | T-009 | SCN-008 | The five evidenced same-gate active runs show identical next steps before and after | `evidence/NEXT_ACTION_COMPARISON.md` |
| AC-005 | SDD-01 | T-002 | SCN-009 | Helper keeps stored text for completed runs, including a legacy run whose evaluated gate is not OR | `test:next-action` output |
| AC-005 | SDD-01 | T-009 | SCN-010 | Every completed repository run shows the identical next step before and after | `evidence/NEXT_ACTION_COMPARISON.md` |
| AC-006 | SDD-02 | T-003 | SCN-011 | For the gate-moved fixture at CD+Tests the gate-check effective next step equals the CD+Tests text and `continuePostTpWork` holds | `test:cli-gates` output |
| AC-006 | SDD-05 | T-006 | SCN-012 | `continue_delivery` returns the `implementation` continuation for both stale and current stored text | `test:skill-dispatch` output |
| AC-007 | SDD-01 | T-002 | SCN-013 | Helper keeps same-gate custom CD+Tests text | `test:next-action` output |
| AC-007 | SDD-05 | T-006 | SCN-014 | `continue_delivery` returns the status card, not the `implementation` continuation, for the same-gate custom CD+Tests fixture | `test:skill-dispatch` output |
| AC-008 | SDD-01 | T-010 | SCN-015 | With the repository CLI, the cockpit run's status card shows the CD+Tests next step and `continue_delivery` returns the `implementation` continuation; its `RUN_STATE.md` and approval rows are unchanged | `evidence/COCKPIT_RUN_VERIFICATION.md` |
| AC-008 | SDD-07 | T-010 | SCN-016 | After sync and consented reinstall, the MCP dispatcher in Claude shows the same result with the new runtime digest | `evidence/COCKPIT_RUN_VERIFICATION.md` |
| AC-009 | SDD-07 | T-008 | SCN-017 | Generated copies regenerated by the sync script; both runtime integrity checks pass | Integrity check output |
| AC-002 | SDD-04 | T-005 | SCN-019 | After `run-update` of a backward-moved active edit the stored gate and next step are unchanged | Writer test output |
| AC-007 | SDD-01 | T-003 | SCN-020 | A backward-moved fixture (stored QA, evaluated CD+Tests) keeps its stored text in gate-check and delivery-map, and `continue_delivery` does not return the `implementation` continuation | `test:cli-gates` output |
| AC-007 | SDD-05 | T-009 | SCN-021 | The existing backward-move safety case in `artefact-recording-test.js` stays terminal without any change to that test | `test:control-state` output |
| AC-009 | SDD-08 | T-009 | SCN-018 | All listed suites pass, `delivery-map --all-active` and `doctor` show no new finding compared with the baseline | Test, delivery-map and doctor output; `evidence/NEXT_ACTION_COMPARISON.md` |

## 5. Evidence Plan

- `evidence/BASELINE_NEXT_ACTION.json` and the harness script (T-001).
- Test outputs of the focused suites and `smoke-test` (T-002 to T-007, T-009).
- Integrity check outputs (T-008).
- `evidence/NEXT_ACTION_COMPARISON.md` with the per-run diff (T-009).
- `evidence/COCKPIT_RUN_VERIFICATION.md` with the repository-CLI and, if consented, host observation (T-010).
- Updated `CG-RUN-STATUS-CARD` node (T-011).

## 6. Risks

- A baseline captured after a code change would hide regressions. T-001 must run first.
- Refreshing inside `run-update` could break seal or binding validation. T-005 tests validation and `doctor` explicitly.
- The comparison harness reads 115 runs. Legacy runs with resolution errors are recorded as such and must stay identical.
- Without consent for the reinstall, the host observation in SCN-016 stays open. UAT then decides whether the repository-CLI evidence suffices.

## 7. Next Step

Review this TP and approve only with `Approval: TP`. Valid approval permits implementation-preparation Brownfield Analysis and then CD+Tests.

## AGDF Approval Summary (de; source=en)

Der Aufgaben- und Testplan setzt die revidierten Designentscheidungen SDD-01 bis SDD-08 (Regel nur bei Sprung nach vorn) in elf Aufgaben um. Diese Fassung ersetzt die erste TP-Freigabe. Jedes PRD-Kriterium ist mit mindestens einem Testszenario belegt.

- Ausgangsmessung (T-001): Die schon vor jeder Codeänderung erfasste Messung bleibt gültig. Sie hält für alle Runs nur lesend fest, welchen nächsten Schritt Gate-Check, Statuskarte und Delivery-Map heute zeigen. Über echte Runs laufen dabei weder `continue_delivery` noch Schreiber.
- Regel (T-002): Das neue Modul `next-action.js` erhält eigene Unit-Tests für Platzhalter, abgeschlossene Runs, Altbestände, gleiches Gate, Sprung nach vorn, Rücksprung, unbekanntes Gate und eigenen Text bei CD+Tests, registriert als `test:next-action`.
- Lesepfade (T-003, T-004, T-007): Gate-Check, Delivery-Map und Cockpit werden angepasst beziehungsweise abgesichert. Die Tests vergleichen einen veralteten mit einem nie veralteten Run und erwarten identische Ausgabe. Eigener Text, Rücksprünge, abgeschlossene Runs und Blocker bleiben unverändert.
- Schreibpfad (T-005): `run-update` frischt die abgeleiteten Felder nur bei einem Sprung nach vorn auf. Tests prüfen Gleichbleiben bei gleichem Gate, bei Rücksprung und bei abgeschlossenen Runs, die weiterhin abgewiesene Freigabeänderung sowie Siegel, Bindungen und Doctor nach dem Auffrischen.
- Dispatcher (T-006): Die Konstante ersetzt den doppelten Text. Tests zeigen die Implementierungs-Fortsetzung bei veraltetem und aktuellem Text und weiterhin die Statuskarte bei eigenem Text. Der bestehende Sicherheitstest für den Rücksprung bleibt unverändert und muss bestehen.
- Verteilung und Regression (T-008, T-009): `npm run sync-package-assets`, beide Integritätsprüfungen, alle betroffenen Suiten samt `smoke-test`, `delivery-map --all-active` und Doctor. Ein Vorher-Nachher-Vergleich muss zeigen, dass sich nur aktive Runs ändern, deren Gate nach vorn gesprungen ist.
- Cockpit-Run (T-010): Zuerst wird mit der Repository-CLI geprüft, ob Statuskarte und `continue_delivery` stimmen, ohne seine Dateien zu ändern. Danach folgt nur mit deiner ausdrücklichen Zustimmung die Plugin-Neuinstallation samt Claude-Neustart und eine Beobachtung über den MCP-Dispatcher.
- Kontextgraph (T-011): Der Knoten `CG-RUN-STATUS-CARD` erhält die neue Invariante.
- Risiken: Die Ausgangsmessung muss vor jeder Codeänderung laufen. Das Auffrischen darf Siegel und Bindungen nicht brechen. Ohne Zustimmung zur Neuinstallation bleibt die Host-Beobachtung offen, und die UAT entscheidet, ob der CLI-Nachweis genügt.
