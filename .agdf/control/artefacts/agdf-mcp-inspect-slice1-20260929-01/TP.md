# Task/Test Plan: Lesende AGDF-Operationen über MCP statt Shell

Status: draft
Gate: TP
Gate approval: open
Based on: approved SD revision 9
Date: 2026-09-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## Task List

| task_id | task |
|---|---|
| T-INSPECT-CONTRACT | Das Modul `create-agdf/lib/control-inspect/` anlegen: Tool-Definition `agdf_inspect` mit `operation`-Enum, Argument-Parsing über die vorhandenen Dispatcher-Helfer für Sprache und Ziel, den aus `command-registry.js` herausgelösten gemeinsamen Auswahl-Validator `selection.js`, und einen Execute-Service, der je Operation den bestehenden Evaluator aufruft und das unveränderte CLI-`--json`-Objekt samt kanonischem Markdown zurückgibt. Die CLI-Optionsprüfung nutzt denselben Validator. |
| T-RUNTIME-SERVER | Die eigene MCP-Runtime um eine `tools`-Liste (dispatch, inspect) mit je `parse`/`execute`/`serialize` erweitern und `definition`/`parse`/`execute` für den Dispatcher beibehalten; Server und Worker-Eintrag registrieren jedes gelistete Tool über denselben Worker-Executor, dieselben Vertrauensprüfungen und dieselbe Ergebnis-Serialisierung. |
| T-DISPATCH-PREVIEW | Im Dispatcher bei `presentation_required` das vorhandene Feld `presentation` mit `semantic_block: approval_preview`, dem read-only `preview_markdown`, den Digests, Run, Gate, Revision und `authorizes: false` füllen; `outputSchema` beschreibt das Feld; bei fehlender oder ungültiger Zusammenfassung bleibt `presentation` null und die vorhandene Recovery wird geliefert. |
| T-SKILLS-CONTRACTS | In den zehn Skills und in `interaction.md`, `gate-transition.md` und `quality.md` jeden lesenden Prozessschritt auf die Inspect-Operation als primären Weg mit Binding-Fallback umstellen; `interaction.md` Schritt 3 regelt, dass die Vorschau vor der Bindung gezeigt werden darf und die Gate-Frage erst nach `run-present` gestellt wird; Fingerprint-gesperrte Blöcke bleiben unverändert, gate-check bleibt unter 6900 Bytes. |
| T-REGRESSION-PACKAGE | Regressionsnachweise an den zuständigen bestehenden Teststellen ergänzen (Paritäts-, Safety-, Protokoll-, Dispatch- und Kontrollzustandstests), danach `sync-package-assets` ausführen und Paket-, Footprint-, Smoke-, Eval- und Budgetprüfungen laufen lassen; das gemessene Profilwachstum über `payload:budget --accept` mit Begründung erfassen. |
| T-MEASUREMENT | Die serialisierte Tool-Definition auf höchstens 2048 Bytes prüfen und den Small-Path-Baseline vom 2026-09-25 mit gelistetem MCP-Server in einem Wegwerf-Repository wiederholen; Schritte, Runden, Kosten und Schema-Kontextpreis datiert unter `scripts/native-probes/evidence/` festhalten und als Run-Nachweis verlinken. |

## Dependencies And Risks

- T-INSPECT-CONTRACT verwendet ausschließlich die bestehenden Evaluatoren `evaluateDoctor`, `evaluateGateCheck`, `evaluateDeliveryMap` und `readRuntimeContract` sowie die bestehende Lesegrenze. Es entsteht kein zweiter Evaluator und kein zweiter Regelsatz; die CLI-Fehlertexte bleiben identisch.
- Die Evaluatoren laufen im MCP-Kontext ohne Git-Kindprozess. Für `verified_change`-Runs kann das CLI-Ergebnis mit `cliGitObservation` zusätzliche Baseline-Felder liefern. Paritätsnachweise halten die Evaluator-Abhängigkeit auf beiden Seiten gleich; die Grenze wird in Tool-Beschreibung und Vertrag benannt.
- T-RUNTIME-SERVER ändert den Protokolltest von einem auf zwei Tools; der Safety-Quellscan muss `control-inspect/` mit abdecken. Der Worker-Executor bleibt seriell mit 10-Sekunden-Timeout.
- T-DISPATCH-PREVIEW ändert nur die Belegung eines vorhandenen optionalen Feldes; `schema_version` bleibt 1. `run-present` und `run-approve` bleiben unverändert die einzigen Schreiber.
- T-SKILLS-CONTRACTS steht unter Budgetdruck im gate-check-Skill; verankerte Smoke-Test-Phrasen werden bei Bedarf in derselben Änderung nachgezogen.
- T-REGRESSION-PACKAGE setzt eine grüne `control-state-test.js` voraus. Die Suite ist auf `main` seit Commit 62e4140 an Zeile 279 rot und gehört zum Run `agdf-actionable-card-ux-20260928-01`. Dieser Slice weicht die Assertion nicht auf; CD+Tests beginnt erst, wenn der zuständige Run sie grün gemacht hat.
- T-MEASUREMENT hängt von einer Host-Sitzung ab. Ein nicht reproduzierbarer Messlauf wird als offene Evidenzlücke geführt und blockiert QA nicht allein, weil das Schrittziel per Nutzerentscheidung Messverpflichtung ist.
- Codex verlangt pro MCP-Aufruf eine Freigabe; Copilot und OpenCode haben keine belegte MCP-Nutzung. Der Fallback bleibt vollständig und wird unverändert nachgewiesen.

## Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-INSPECT-CONTRACT | SCN-INSPECT-PARITY | Für jede Operation (`doctor`, `gate-check` mit Varianten `status-card` und `approval-envelope`, `delivery-map`, `contract`) und beide registrierten Sprachen sind `report` und `presentation.markdown` des Inspect-Ergebnisses byteweise gleich dem CLI-`--json`-Ergebnis derselben Fixture bei gleicher Evaluator-Abhängigkeit. | Paritätsassertionen in `create-agdf/scripts/control-state-test.js` und `create-agdf/scripts/interaction-presentation-test.js`; Fixture-Vergleich über `JSON.stringify`. |
| AC-001 | SDD-001 | T-RUNTIME-SERVER | SCN-TWO-TOOLS-PROTOCOL | `listTools` liefert genau zwei Tools mit den Definitionen aus der Runtime; ein Aufruf von `agdf_inspect` über stdio liefert dasselbe `structuredContent` wie der direkte Service-Aufruf; der Worker routet nach Tool-Namen. | `agdf-mcp-server/test/protocol.test.js` mit Zwei-Tool-Pin; neuer Worker-Routing-Test in `agdf-mcp-server/test/`. |
| AC-001 | SDD-002 | T-INSPECT-CONTRACT | SCN-SHARED-SELECTION | Jede heute von der CLI abgelehnte Feldkombination (`module` außerhalb `contract`, `all_active` außerhalb doctor/delivery-map, `variant` außerhalb gate-check) wird über CLI und MCP mit identischem Grundtext abgelehnt; eine `verified_change`-Fixture zeigt, dass CLI ohne Git-Beobachtung und MCP gleich sind und die Abweichung nur Git-abhängige Felder betrifft. | Negativfälle in `create-agdf/scripts/cli-gates-test.js` oder der zuständigen CLI-Suite und im Inspect-Servicetest; dokumentierter Diff der Git-Fixture. |
| AC-002 | SDD-001 | T-REGRESSION-PACKAGE | SCN-READ-ONLY-SNAPSHOT | Ein Snapshot des Kontrollbaums vor und nach jeder Operation und jedem abgelehnten Aufruf ist unverändert; ein unbekannter `operation`-Wert scheitert an der Schema-Validierung ohne Governance-Ergebnis; der Safety-Quellscan über `control-inspect/` findet keine verbotene Fähigkeit; die Lesegrenze lehnt einen Symlink-Baum ab. | Snapshot- und Schema-Assertionen in `agdf-mcp-server/test/safety.test.js`; Enum-Assertion im Funktionsvertragstest. |
| AC-003 | SDD-003 | T-DISPATCH-PREVIEW | SCN-PREVIEW-DIGEST | Ein `presentation_required`-Ergebnis enthält `presentation.semantic_block: approval_preview`, dessen Markdown und Digests gleich dem `run-present`-Text und -Digest derselben Revision sind; `run-approve` ohne `presentation_id` wird weiterhin abgelehnt; bei ungültiger Zusammenfassung ist `presentation` null und die Recovery enthalten; `host_action.mode` bleibt `continue_delivery_intake`. | Assertionen in `create-agdf/scripts/skill-dispatch-test.js` und `create-agdf/scripts/control-state-test.js`; Digest-Vergleich gegen `run-present`. |
| AC-004 | SDD-004 | T-SKILLS-CONTRACTS | SCN-SKILL-ROUTING | Eine Textsuche über `plugin/skills` und `plugin/meta/contracts` findet keinen lesenden Shell-Aufruf als primären Weg; Instruction-Footprint, Smoke-Test, Skill-Evals und Aktivierungskorpus bestehen; gate-check bleibt unter 6900 Bytes; Fingerprints sind unverändert gültig. | Protokollierte Suche; `test:instruction-footprint`, `smoke-test`, `eval:skills`, `test:request-activation`. |
| AC-005 | SDD-001 | T-INSPECT-CONTRACT | SCN-ENVELOPE-LOCALE | Jedes Inspect- und Vorschau-Ergebnis trägt `authorizes: false`; die Sprachmatrix (gültig, ungültig, nicht unterstützt) verhält sich wie beim Dispatch inklusive vollständigem englischen Fallback; `Approval: <Gate>`, Run-IDs, Pfade und Diagnosecodes sind byteweise unverändert. | Envelope- und Sprachassertionen in `agdf-mcp-server/test/protocol.test.js`, `create-agdf/scripts/interaction-catalog-test.js` und `operational-localization-test.js`. |
| AC-006 | SDD-004 | T-SKILLS-CONTRACTS | SCN-FALLBACK-UNCHANGED | Ohne gelistetes Tool nutzen die Skills unverändert Binding-Schema 2; der Fallback-Text ist bis auf die Nennung des primären Weges identisch; Skill-Evals und Aktivierungskorpus bestehen unverändert; das Copilot-Profil wächst nur um die gemessenen Ergänzungen. | `eval:skills`, `test:request-activation`, `test:copilot-profile`, `test:payload-budget` mit Eintrag in `payload-budget-history.md`. |
| AC-007 | SDD-005 | T-MEASUREMENT | SCN-DEFINITION-SIZE-AND-BASELINE | Die serialisierte Definition von `agdf_inspect` ist höchstens 2048 Bytes; das Budget ist mit Begründung akzeptiert; ein datierter Messlauf des Small-Path-Szenarios mit gelistetem MCP-Server nennt Schritte, Runden, Kosten und Schema-Kontextpreis gegen die Baseline von 45 Schritten. | Größenassertion im Funktionsvertragstest; `payload-budget-history.md`; Nachweis unter `scripts/native-probes/evidence/` und Evidenzzeile im Run. |

## Execution Order

1. Nach Freigabe dieses TP die Brownfield-Analyse als Implementierungsvorbereitung durchführen.
2. T-INSPECT-CONTRACT: Validator herauslösen, Definition, Parsing und Service anlegen; CLI auf den gemeinsamen Validator umstellen; bestehende CLI-Suiten grün halten.
3. T-RUNTIME-SERVER und T-DISPATCH-PREVIEW: Runtime, Server, Worker und Dispatcher anpassen; Protokoll- und Dispatch-Tests aktualisieren.
4. T-SKILLS-CONTRACTS: Skills und Verträge umstellen; Footprint und Smoke prüfen.
5. T-REGRESSION-PACKAGE: Paritäts-, Safety- und Snapshot-Tests ergänzen; Assets synchronisieren; Paket- und Budgetprüfungen; Voraussetzung ist eine grüne `control-state-test.js`.
6. T-MEASUREMENT: Größenassertion und datierter Messlauf; Nachweis im Run verlinken.

## Approval

Dieser Aufgaben- und Testplan leitet sich aus dem freigegebenen SD Revision 9 und dessen PRD-Traceability ab. Implementierung und geplante Prüfungen dürfen erst nach Freigabe dieser TP-Revision beginnen. Zur Freigabe dieser konkreten Revision:

`Approval: TP`
