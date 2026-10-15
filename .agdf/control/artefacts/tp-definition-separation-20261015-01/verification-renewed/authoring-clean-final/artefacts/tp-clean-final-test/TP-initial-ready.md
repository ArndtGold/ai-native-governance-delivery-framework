# TP: Personal named filter save and restore

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-15
Owner: Test plan owner
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Inspect the existing FilterService owner and node:test runner; retain the local baseline and evidence destination. Inspection completed during planning; no application or test changes made. | Test plan owner | Approved PRD and SD |
| T-002 | After TP approval, review save/restore against AC-001 and SDD-001; reuse FilterService and its user-keyed store. Make only necessary approved-scope changes; retain existing behavior when already conforming. | Fixture implementation agent | T-001; fresh TP approval |
| T-003 | After TP approval, retain the four existing tests and add focused missing-name and restore-result mutation regression cases in filter-service.test.mjs. | Fixture implementation agent | T-002 |
| T-004 | Execute the full local suite, capture command/exit/output and compare protected-source integrity; review each scenario and residual evidence gaps for QA. | Test verification agent | T-003 |

## 2. Verification Traceability

AC-001 remains the sole approved acceptance authority; SDD-001 retains service ownership. Boundary cases below protect that design and do not create new product criteria.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Same user/name restores the saved object including nested selected values after the caller mutates its original object. | filter-service.test.mjs existing test `save and restore values independently of later mutation`; captured TAP and exit status |
| AC-001 | SDD-001 | T-002 | SCN-002 | A different user cannot restore the saving user's named filter; RangeError is observed. | filter-service.test.mjs existing test `personal ownership`; captured TAP and exit status |
| AC-001 | SDD-001 | T-002 | SCN-003 | An empty/default filter object is restored as an empty object for its owner. | filter-service.test.mjs existing test `empty/default values`; captured TAP and exit status |
| AC-001 | SDD-001 | T-002 | SCN-004 | Existing invalid empty-user input is rejected with TypeError without creating a saved entry. | filter-service.test.mjs existing test `invalid input`, with post-approval assertion of unavailable saved entry; TAP and exit status |
| AC-001 | SDD-001 | T-003 | SCN-005 | Restoring an unknown name for an existing user raises RangeError and leaves the user's saved named filter unchanged. | Planned test `unknown name preserves saved filter` in filter-service.test.mjs; TAP and exit status |
| AC-001 | SDD-001 | T-003 | SCN-006 | Mutating the first restored object's nested values does not affect a subsequent restore of the same saved filter. | Planned test `restored values are independent copies` in filter-service.test.mjs; TAP and exit status |

## 3. Test Plan

All commands run from this exact fixture project using `/usr/local/Cellar/node@22/22.22.3/bin/node`. The package test script is `node --test filter-service.test.mjs`; direct invocation fixes the observed runner identity. For each route, the verification owner captures argv, cwd, stdout, stderr and exit status under `artefacts/tp-clean-final-test/verification/`, with a separate file per scenario and full-suite run. A failing assertion remains failed evidence. The final command is `/usr/local/Cellar/node@22/22.22.3/bin/node --test filter-service.test.mjs`, and its exit must be zero with all six scenarios accounted for. No external accounts, network, installation or credentials are prerequisites.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | node --test --test-name-pattern='save and restore values independently of later mutation' filter-service.test.mjs | Local Node 22.22.3; isolated in-memory fixture | Read fixture and execute local Node; contained evidence writes | Test verification agent | verification/SCN-001.json: TAP exact equality, argv and zero exit | Stop verification; report missing runner/file to Test plan owner; preserve gap before QA |
| AC-001 | SCN-002 | node --test --test-name-pattern='personal ownership' filter-service.test.mjs | Same local fixture; synthetic users a and b | Same local permissions; no real accounts | Test verification agent | verification/SCN-002.json: RangeError assertion and zero exit | Stop dependent ownership claim; Test plan owner resolves local fixture access before QA |
| AC-001 | SCN-003 | node --test --test-name-pattern='empty/default values' filter-service.test.mjs | Same local fixture; empty object | Same local permissions | Test verification agent | verification/SCN-003.json: empty-object equality and zero exit | Record explicit missing boundary evidence; Test plan owner restores local runner before QA |
| AC-001 | SCN-004 | node --test --test-name-pattern='invalid input' filter-service.test.mjs | Same local fixture; invalid empty user | TP approval before adding assertion; local execution and evidence writes | Test verification agent | verification/SCN-004.json: TypeError plus unavailable-entry assertions and zero exit | Do not count the current partial test as complete; Fixture implementation agent adds assertion after TP approval; block QA evidence completion meanwhile |
| AC-001 | SCN-005 | node --test --test-name-pattern='unknown name preserves saved filter' filter-service.test.mjs | Same local fixture; existing user and unknown name | TP approval before creating named case; local execution | Test verification agent | verification/SCN-005.json: named test present, RangeError and unchanged-value assertions, zero exit | A zero-test match is unavailable evidence; Fixture implementation agent adds case after TP approval; block QA evidence completion meanwhile |
| AC-001 | SCN-006 | node --test --test-name-pattern='restored values are independent copies' filter-service.test.mjs | Same local fixture; nested object and repeated restore | TP approval before creating named case; local execution | Test verification agent | verification/SCN-006.json: named test present, nested-copy equality and zero exit | A zero-test match is unavailable evidence; Fixture implementation agent adds case after TP approval; block QA evidence completion meanwhile |

Existing baseline: `artefacts/tp-clean-final-test/02-baseline-tests.json` and `.stdout` contain the actual command and four passing tests (exit 0). This is preparation evidence only; the two planned tests and additional invalid-input assertion have not been implemented or executed. Future verification records must distinguish matching tests from skipped/absent cases.

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Local evidence destination | SD: Local evidence destination | resolved | Actual package.json and successful local node:test run establish stdout TAP plus process exit as the available runner evidence. Use contained project directory artefacts/tp-clean-final-test/ and its verification subdirectory for command/output/exit records. Existing baseline is 02-baseline-tests.json. No built-in report service or production account is required. | Test plan owner |
| Local evidence applicability | TP | resolved | The approved slice reuses the existing service. Synthetic user identifiers exercise its user-owned boundary entirely locally; the current plan has executable routes for every criterion/design scenario. Later QA must reject absent planned cases or unavailable runner evidence. | Test plan owner |

## 4. Brownfield Scope

Inspect `filter-service.mjs` (FilterService.save/restore; private user/name maps and structuredClone), `filter-service.test.mjs`, and `package.json`. The existing filter service remains the sole storage owner. Retain the supplied PRD, SD and Brownfield Review unchanged; approvals are established only by the bound fixture control state, not by their document status labels. Evidence remains cooperative local observation, not production or independent human validation.

## 5. Out Of Scope

Sharing, permissions changes, multi-user administration, browser/UI work, production accounts, deployments, persistence across process restarts, and changing approved PRD/SD are outside this slice. Existing named-filter semantics remain unchanged beyond the approved personal save/restore scope. This plan grants no implementation, QA or release approval.

## 6. Risks And Blockers

No material unanswered planning decision remains. Local runner access and the evidence path are observed. Current four-test baseline is insufficient for the complete future six-scenario verification obligation; missing planned assertions must block later QA evidence completion. In-memory service tests establish this fixture's boundary only and cannot claim UI or production behavior. Failed tests, zero matched scenario tests, changed approved source hashes, or an unavailable runner must be reported and resolved through the responsible owner before a QA readiness claim.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

Implementation and test changes remain pending a new deliberate TP approval bound to the fresh presentation.

## AGDF Approval Summary (de; source=en)

- Ziel: Einen benannten persönlichen Filter mit denselben gespeicherten Werten wiederherstellen.
- Umfang: Bestehenden Filterservice und lokale Tests verwenden; Teilen und Berechtigungsänderungen bleiben ausgeschlossen.
- Aufgaben: Bestand prüfen, erforderliche Änderungen nach TP-Freigabe ausführen, fehlende Prüfungen ergänzen und vollständige lokale Nachweise für QA sammeln.
- Prüfung: AC-001 und SDD-001 sind sechs Szenarien zugeordnet: Wiederherstellung, persönliche Zuordnung, leere Werte, ungültige Eingabe, unbekannter Name und unabhängige zurückgegebene Werte.
- Entscheidungen: Der tatsächlich verfügbare Node-Runner liefert TAP und Prozessstatus; Nachweise werden im enthaltenen Fixture-Verzeichnis artefacts/tp-clean-final-test/ gespeichert. Produktionskonten sind nicht erforderlich.
- Risiken: Vier Bestandstests bestehen; zwei zusätzliche Tests und eine ergänzende Fehlerprüfung sind erst nach Freigabe auszuführen. Fehlende oder fehlgeschlagene Nachweise blockieren später QA. Die lokale Prüfung belegt keine Produktions- oder Oberflächenfunktion.
- Freigabewirkung: Eine neue TP-Freigabe erlaubt die geplante Umsetzung und Testarbeit; QA und weitere Freigaben bleiben eigene Schritte.
