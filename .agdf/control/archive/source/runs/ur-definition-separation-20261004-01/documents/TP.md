# TP: Eigenständige UR-Erstellung umsetzen und prüfen

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-04
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-000 | Bestehende Implementierungsvorbereitung durchführen: genehmigte Quellen, Eigentümer, Wiederverwendung, Arbeitsstand und Regressionen gegen diesen Plan prüfen; BROWNFIELD_ANALYSIS.md und Baseline festhalten. | Codex mit brownfield-analysis | Approval: TP |
| T-001 | ur-definition als fachlichen Skill und fokussierten UR-Vertrag erstellen, im kanonischen Katalog registrieren und konkurrierende UR-Fachanweisungen aus gate-check entfernen. | Codex; kanonische Pluginquellen | T-000 |
| T-002 | Bestehenden Intake und Dispatcher um die gebundene ur_definition-Fortsetzung, direkte Skill-Zulässigkeit und die strikt validierte ur_action: revise-Option für MCP/CLI ergänzen. | Codex; vorhandene Core-/Adapter-Eigentümer | T-000, T-001 |
| T-003 | Bedarfsfelder und explizite Klärung in der UR-Vorlage nachführen; lesende Gate-Bereitschaft mit Altformat-Kompatibilität sowie Erstregistrierung/Draft-Änderung über die bestehenden Operationen integrieren. | Codex; UR-Vorlage und bestehende Kontrolloperationen | T-000, T-001, T-002 |
| T-004 | Feste Skillanzahlen katalogbasiert ersetzen, Host-/Vertrags-/Paketprojektionen und betroffene Dokumentation konsistent erzeugen, Anweisungs- und Payloadgrößen messen und notwendige Deltas exakt belegen. | Codex; bestehende Projektoren und Budgetprüfer | T-001, T-002, T-003 |
| T-005 | Fachliche Auftrags-/Entwurfspaare und Klärungsszenarien kooperativ beobachten; positive, negative und Altformat-Regressionen für Routing, Bindung, Revision und bestehende Freigabe ausführen und dokumentieren. | Codex; bestehende Test- und Evaluationseigentümer | T-001, T-002, T-003 |
| T-006 | Den tatsächlich gebauten Kandidaten umfassend prüfen: Hostnamen, Aktivierung, Anweisungen, CLI/MCP-Verträge, Paketkonsumenten und Kompatibilität; versionierte Evidenz ohne Abschwächung aktualisieren. | Codex; bestehende Build-/Test-/Evidenzeigentümer | T-004, T-005 |
| T-007 | Abschließenden Code- und Struktur-/Architekturreview des finalen Diffs durchführen, normalisierte Findings beheben oder zu ihrem Eigentümer zurückführen und betroffene Nachweise nach Änderungen erneut prüfen. | Codex mit code-review und clean-implementation-review; kooperativ, keine unabhängige Review-Instanz | T-006 |

T-000 benennt die bereits bestehende interne Brownfield Analysis nach TP-Freigabe. Dieser Plan verlagert kein Framework-Gate. Nach T-007 folgen der vorhandene task-plan-review und der sole qa-gate; sie erhalten keine neue Freigabeformel oder parallele Entscheidungsautorität. Implementierung beginnt erst nach T-000 und vollständiger kanonischer Voraussetzung.

### Task Results

- T-000: BROWNFIELD_ANALYSIS.md, evidence/BASELINE.json mit geprüftem Commit, Dirty Paths, vorhandenen Eigentümern und unverändert zu erhaltenden Fremdänderungen. Bei Quell-/Planabweichung zum frühesten betroffenen Eigentümer zurückkehren.
- T-001: Ein Skill ur-definition und ein fokussierter Vertrag in plugins/agdf; vorhandene Aktivierungs- und Zielgrenzen referenzieren. Beim ersten tatsächlichen Erstellen zusätzlich die verfügbare skill-creator-Anleitung anwenden. Keine zweite fachliche UR-Prozedur in gate-check.
- T-002: Begrenzte UR-Continuation und ein gemeinsamer additiver Eingabevertrag. --ur-action revise entspricht exakt ur_action: revise; nur gebundener Resume-Intake mit erwarteter Revision. Fehlender direkter Run geht zum bestehenden Intake; kein AGDF_RUN_ID-Fallback.
- T-003: Neue URs verwenden Requirements clarification: open oder complete und explizite Bedarfsfelder. Offene Klärung und unvollständige neue Entwürfe werden nicht präsentiert. Alte URs ohne das Feld folgen dem bestehenden Vertrag. Registrierung nutzt run-step ur, Änderung einer registrierten Draft-UR run-update, anschließend frische Prüfung.
- T-004: evidence/PROJECTION_AND_BUDGET.json mit Kandidatenidentität, gemessenen normalisierten Anweisungen, Dateiinventar und exaktem Payloaddelta; keine abgeschaltete Prüfung und kein pauschales Wachstumspolster. Gleichheit mit dem kanonischen Katalog ersetzt harte Zehn-Skills-Annahmen.
- T-005: evidence/UR_BEHAVIOR_CASES.json und evidence/UR_BEHAVIOR_REVIEW.md mit Originalauftrag, bestätigtem Kontext, tatsächlich erzeugtem Entwurf oder Rückfrage, Erwartung, beobachtetem Ergebnis, Begründung und verwendeter Skillfassung. Kooperative Agentenbeobachtung ausdrücklich kennzeichnen. Dazu evidence/FOCUSED_CHECKS.json und zugehörige Testlogs.
- T-006: evidence/CANDIDATE_CHECKS.json und Logs für den gebauten Kandidaten; aktualisierte kanonische Fingerprints/Kompatibilitätsevidenz dort, wo die bestehende Prüfstrecke sie verlangt. Historische native Beobachtungen bleiben historisch. Tests, die dieselben generierten Verzeichnisse verändern, sequenziell ausführen.
- T-007: CODE_REVIEW.md und CLEAN_IMPLEMENTATION_REVIEW.md mit dem finalen Diff-/Kandidatenbezug, konkreten Findings und bestehenden normalisierten Routingzielen. Keine Selbstprüfung als unabhängige Review-Instanz darstellen.

## 2. Verification Traceability

PRD bleibt die einzige fachliche Akzeptanzquelle. Die Tabelle ordnet ihre IDs den bestehenden SD-Entscheidungen, Aufgaben, Szenarien und konkreten Nachweisen zu.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | Genau ein registrierter UR-Skill mit fokussierten, auflösbaren Verträgen; keine konkurrierende Erstellung in gate-check. | Skill-Konformität und gezielte Quellprüfung; evidence/FOCUSED_CHECKS.json |
| AC-001 | SDD-002 | T-002 | SCN-002 | Fehlende UR nach kanonischer Run-Erstellung ergibt gebundene ur_definition-Fortsetzung mit richtigen Pfaden und Revision. | Erweiterter intake-continuation-test.js; evidence/FOCUSED_CHECKS.json |
| AC-002 | SDD-004 | T-005 | SCN-003 | Ein konkreter Auftrag erzeugt einen nachvollziehbaren Entwurf mit allen Bedarfsfeldern, Quellen und markierten Annahmen. | evidence/UR_BEHAVIOR_CASES.json: complete_request; evidence/UR_BEHAVIOR_REVIEW.md |
| AC-003 | SDD-004 | T-005 | SCN-004 | Eine wesentliche Bedarfsmehrdeutigkeit erzeugt eine gebündelte fachliche Rückfrage und keinen erfundenen vollständigen Bedarf. | evidence/UR_BEHAVIOR_CASES.json: material_gap; evidence/UR_BEHAVIOR_REVIEW.md |
| AC-003 | SDD-004 | T-005 | SCN-005 | Bereits beantwortete Informationen bleiben erhalten; unwesentliche Lücken erzwingen keine erneute Rückfrage. | evidence/UR_BEHAVIOR_CASES.json: answered_context und minor_gap; evidence/UR_BEHAVIOR_REVIEW.md |
| AC-003 | SDD-006 | T-003 | SCN-006 | Requirements clarification: open und unvollständige neue Entwürfe unterdrücken Bereitschaft und Freigabepräsentation. | Gezielte Core-Gate-Regression; bestehender Präsentations-/Gate-Test; evidence/FOCUSED_CHECKS.json |
| AC-004 | SDD-002 | T-002 | SCN-007 | Direkter UR-Skill ohne explizite Run-Bindung übergibt an den bestehenden Intake statt einen Umgebungs-Run zu wählen. | Erweiterter skill-dispatch-test.js und Run-Zuordnungstest; evidence/FOCUSED_CHECKS.json |
| AC-004 | SDD-006 | T-002 | SCN-008 | Fehlendes/falsches Ziel, fremder oder veralteter Run und Seal-Fehler verändern weder UR noch Freigaben anderer Runs. | Negative Dispatch-/Intake-Tests mit Vorher-/Nachher-Dateidigest; evidence/FOCUSED_CHECKS.json |
| AC-004 | SDD-006 | T-003 | SCN-009 | Zustandsänderung zwischen Snapshot und Schreiboperation scheitert an der aktuellen Revision, ohne stillen Ersatz-Run. | Bestehende Run-Revisionsprüfung im Ende-zu-Ende-UR-Szenario; evidence/FOCUSED_CHECKS.json |
| AC-005 | SDD-003 | T-002 | SCN-010 | Nur gate-check mit Resume-Intake, explizitem Run und erwarteter Revision akzeptiert ur_action: revise; ungültige Kombinationen scheitern vor Mutation. | Gemeinsamer Funktionsschema-, CLI- und MCP-Vertragstest; evidence/FOCUSED_CHECKS.json |
| AC-005 | SDD-005 | T-003 | SCN-011 | Registrierter zulässiger UR-Draft wird über run-update als neue Revision aufgezeichnet; alte Präsentation und Antwort sind ungültig. | Erweiterter intake-continuation-test.js und Run-Präsentations-/Revisionstest; evidence/FOCUSED_CHECKS.json |
| AC-005 | SDD-006 | T-003 | SCN-012 | Direkter oder Intake-Überarbeitungsauftrag einer freigegebenen UR oder an einem späteren Gate schreibt nichts und nennt den bestehenden Kontrollpfad. | Negative UR-Routingtests mit Fremd-/Freigabe-Digests; evidence/FOCUSED_CHECKS.json |
| AC-006 | SDD-005 | T-005 | SCN-013 | Erstentwurf wird durch run-step ur registriert; frische Prüfung liefert die aktuelle Präsentation, erst die spätere exakte Antwort führt zur Brownfield Review. | Ende-zu-Ende-Intake-/Präsentationstest; evidence/FOCUSED_CHECKS.json |
| AC-006 | SDD-006 | T-005 | SCN-014 | Entwurf, Rückfrage oder Aufruf allein erzeugt keine Freigabe; Registrierungs-/Präsentationsfehler nennen den passenden Recovery-Schritt. | Negative Antwort-/Fehler- und Bereitschaftstests; evidence/FOCUSED_CHECKS.json |
| AC-006 | SDD-005 | T-006 | SCN-015 | UR-Präsentation ist in jeder registrierten Sprache und beim gültigen Fallback vollständig und revisions-/digestgebunden. | Bestehende interaction-presentation-/operational-localization-Tests mit UR-Fällen; evidence/CANDIDATE_CHECKS.json |
| AC-007 | SDD-001 | T-004 | SCN-016 | Jeder vorhandene Host projiziert den neuen Skill unter seinem registrierten Namen mit auflösbaren Vertragsreferenzen. | skill-name-projection-test.mjs; Skillkonformität; evidence/PROJECTION_AND_BUDGET.json |
| AC-007 | SDD-007 | T-004 | SCN-017 | Der kanonische Katalog stimmt vollständig mit Projektionen und Prüfungen überein; gemessene Anweisungsgrenzen bleiben gewahrt und Payload wächst nur um das belegte Delta. | Instruction-footprint-/Payload-Prüfungen; evidence/PROJECTION_AND_BUDGET.json |
| AC-007 | SDD-007 | T-006 | SCN-018 | Tatsächlich gebaute CLI-/MCP-/Paketkonsumenten sehen denselben UR-Vertrag; Quell-/Paketfingerprints sind konsistent und bestehende Evaluationsfälle nicht abgeschwächt. | MCP-Suite, Paketkonsumenten, Kompatibilitäts- und Skills-Evaluation; evidence/CANDIDATE_CHECKS.json |
| AC-008 | SDD-008 | T-006 | SCN-019 | Bestehende PRD-/SD-/TP- und Qualitätsrouten sowie Beratung/Opt-out behalten ihr Verhalten. | CLI-Smoke und Aktivierungs-/Dispatch-Regressionssuite; evidence/CANDIDATE_CHECKS.json |
| AC-008 | SDD-008 | T-007 | SCN-020 | Finaler Diff erfüllt die begrenzte Trennung ohne parallele Kontrolle oder vorausgesetzten Folgeumbau; Review benennt echte Evidenzgrenzen und keine unabhängige Selbstprüfung. | CODE_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; finaler Scope-Diff |
| AC-003 | SDD-006 | T-003 | SCN-021 | Eine bestehende UR ohne neuen Klärungsmarker bleibt im bisherigen Freigabepfad; keine automatische Migration oder unbelegte Vollständigkeitsbehauptung. | Altformat-Regression in Gate-/Intake-Tests; evidence/FOCUSED_CHECKS.json |

## 3. Test Plan

### Fokussierte Prüfung während der Umsetzung

Vorhandene Testeigentümer erweitern; neue Tests nur für zusätzliche bedeutungsvolle Zustands-/Vertragsfälle, nicht als Spiegel des Codes. Zuordnung:

- packages/cli/scripts/intake-continuation-test.js: UR-Delegation, Wiederaufnahme, Registrierung, Draft-Überarbeitung, normale Präsentation und Freigabe.
- packages/cli/scripts/skill-dispatch-test.js und skill-dispatch-function-contract-test.js sowie vorhandene Run-Zuordnungs-/Bindungstests: direkte Auswahl, zulässige Routen, Schema, fehlende/veraltete Bindung und unveränderte Fremdartefakte.
- packages/core/test/control-state-test.js, run-revision-test.js und interaction-presentation-test.js beziehungsweise ein fokussierter zusätzlicher UR-Test im selben Core-Testbereich: fachliche Klärung, Altformat, Revision, Präsentationsfehler und ungültige alte Antwort.
- scripts/skill-name-projection-test.mjs und vorhandene Skillkonformitäts-/Aktivierungsprüfungen: Katalog, Hostnamen, Verträge und unveränderte Aktivierungsgrenzen.
- packages/mcp-server/test/: gemeinsamer MCP-Eingabevertrag, UR-Delegation und revise-Option gegen den gebauten Kandidaten.

T-005 erzeugt vier nachvollziehbare fachliche Fälle (complete_request, material_gap, answered_context, minor_gap) aus der tatsächlich umgesetzten Skillfassung. Eingaben und tatsächliche Ausgaben sowie die kooperative Inhaltsbewertung werden gespeichert. Kein bloß erwarteter Fixture-Text wird als realer Hostlauf bezeichnet. Falls eine geforderte Verhaltensbeobachtung fehlt, bleibt eine evidence_gap offen.

### Abschlussprüfung des Kandidaten

Nach fokussiertem Bestehen einmal die geeignete gemeinsame Regression ausführen:

1. npm run build; kanonische Quellen und erzeugte Ressourcen prüfen.
2. npm --prefix packages/cli run smoke-test; enthält die vorhandenen relevanten Gate-, Intake-, Aktivierungs-, Skill-, Paket- und Kontrollprüfungen.
3. npm --prefix packages/mcp-server test nur zusätzlich, falls nicht durch den vorigen Lauf für dieselbe Kandidatenfassung bereits vollständig bestanden oder neue Änderungen dies rechtfertigen.
4. npm run test:maintenance-contracts, npm run test:host-compatibility und npm run compatibility:check; bei legitimer Quelländerung zuerst die zugehörige exakte neue Kompatibilitätsevidenz über den bestehenden Recorder erzeugen. Nicht native Plattformnachweise behaupten.
5. Geeignete Community-/Paketgrenzenprüfung und finalen Scope-Diff; neue Fehler dauerhaft im genehmigten Umfang beheben. Vollständige bestandene Läufe nur bei Änderungen oder offenen Bedenken wiederholen.

Build und Tests mit gemeinsam beschriebenen Generated-Verzeichnissen werden sequenziell ausgeführt. Read-only-Prüfungen können gebündelt werden; keine parallel schreibenden Builds. Keine neue Dependency, wenn vorhandene Eigentümer ausreichen; erforderliche technische Hostberechtigungen bleiben Hostentscheidungen.

### Nachweise und Prüfbedeutung

Die Prüfung qualifiziert die kanonische Quelle, generierten Hostprojektionen und tatsächlichen lokalen Paket-/Protokollkonsumenten. Fachliche Fälle belegen die konkret dokumentierte kooperative Agentenbeobachtung. Frische native Installation und Nutzung auf Codex, Claude, Copilot oder OpenCode ist außerhalb dieses automatisch ausgeführten Plans und wird nicht behauptet. Falls die Umsetzung solche Betriebsnachweise benötigt oder eine Behauptung daraus ableitet, bleibt die entsprechende evidence_gap bis zum tatsächlichen Nachweis offen.

Logs erhalten Befehle, Exitstatus und Kandidaten-/Quellbezug; summaries nennen nur tatsächlich bestandene Prüfungen. Finaler Review/QA bezieht sich auf dieselbe Kandidatenfassung. Nach Fixes erforderliche Nachweise aktualisieren.

## 4. Brownfield Scope

T-000 prüft die genehmigte SD/PRD gegen kanonische Plugindefinition, gate-check- und künftige UR-Skillquelle, Request-Activation, UR-Vorlage, Core-Intake und Dispatch, bestehende Run-Schreiber und Präsentation, CLI-/MCP-Adapter sowie Projektoren und Größen-/Evidenzprüfer.

Wiederverwenden: delivery-run-assignment, vorhandene Run-Registrierung/-Revision, gemeinsame Gate-Evaluation, vorhandene Interaktions- und Hostnamenprojektion, Paket-/Protokolltests. Keine zweite Run-Auswahl, Persistenz, Freigabe, semantische Registry oder MCP-Endpoint. Der genehmigte UR-Schritt endet vor Änderungen an späteren Erstellungskompetenzen oder Gate-Reihenfolgen.

Vorhandene staged Dateien docs/compatibility/.agdf-compatibility-owned 4.json und HOST_COMPATIBILITY 4.md gehören nicht zu diesem Run. Ihre Inhalte und Indexzustände bleiben erhalten. Die eigene Baseline und Scope-Prüfung unterscheiden Fremdänderungen von diesem Run; keine pauschale Git-Aufnahme oder Löschung.

## 5. Out Of Scope

Keine Neuordnung von PRD-, SD- oder TP-Erstellung, keine Verschiebung der bestehenden Brownfield-/Review-Gates, keine neue QA-/UAT-/Closeout-Autorität. Keine Run-Migration, neue Persistenz-/Freigabearchitektur, neue MCP-Endpunkte, React-Oberfläche oder Mock. Keine automatische Hostinstallation, Veröffentlichung, Versionsveröffentlichung, Git-Aktion oder fremde Dateibereinigung.

## 6. Risks And Blockers

- Unzulässige UR-/Run-/Freigabeänderung, zweiter Eigentümer oder Schreiben außerhalb des gebundenen Umfangs: block; zum bestehenden frühesten fachlichen oder technischen Eigentümer zurückführen.
- Semantischer oder vertraglicher Bedarf außerhalb der genehmigten PRD/SD: keine stille Implementierungsentscheidung; entsprechender requirements_gap oder design_gap.
- Fehlende Kriterien-/Entscheidungszuordnung, relevante Negativtests, vollständige Klärung oder aktuelle Kandidaten-/Budgetevidenz: revise beziehungsweise evidence_gap bis erledigt.
- Reines Statusfeld, Fixture oder alte Hostbeobachtung als tatsächlichen Verhaltens-/Hostbeweis ausgeben: evidence_gap; Nachweis oder behaupteten Umfang korrekt begrenzen.
- Unscharfe Budgeterhöhung, abgeschaltete Integritätsprüfung oder historische Evidenzüberschreibung: revise; exakte Ursache und notwendiges Delta dokumentieren.
- Review-Befund nach T-007: beheben oder normalisiert zu UR, PRD, SD, TP, CD+Tests oder evidence_obligation zurückführen. Alle betroffenen Nachweise erneut prüfen; QA bleibt sole pass/revise/block-Eigentümer.

## 7. Next Step

Mit Approval: TP folgt T-000 als bestehende Implementierungsvorbereitung, dann die abhängigen Aufgaben. Nach T-007 führt task-plan-review die Erfüllungsprüfung durch; qa-gate trifft die finale Qualitätsentscheidung. QA- und UAT-Freigaben werden nicht aus dieser Planfreigabe abgeleitet.

## AGDF Approval Summary (de; source=en)

- Aufgaben: T-000 prüft nach der TP-Freigabe die vorhandenen Eigentümer und den Arbeitsstand als bestehende Brownfield-Vorbereitung.
- Aufgaben: T-001 erstellt ur-definition und seinen fokussierten Vertrag; gate-check erhält keine konkurrierende UR-Fachanweisung.
- Aufgaben: T-002 ergänzt die gebundene UR-Übergabe, direkte Skill-Zulässigkeit und die strikt revisionsgebundene revise-Option für den gemeinsamen MCP-/CLI-Vertrag.
- Aufgaben: T-003 integriert Bedarfsfelder und offene Klärung mit Altformat-Kompatibilität sowie bestehende Erstregistrierung und Draft-Änderung. Freigegebene URs bleiben geschützt.
- Aufgaben: T-004 erzeugt konsistente katalogbasierte Projektionen und Dokumentation; vorhandene Größen-/Integritätsprüfungen bleiben erhalten und notwendige Deltas werden exakt gemessen.
- Aufgaben: T-005 beobachtet vollständigen Auftrag, wesentliche Lücke, beantworteten Kontext und unwesentliche Lücke kooperativ; positive und negative Routing-, Bindungs-, Revisions- und Freigabetests folgen.
- Aufgaben: T-006 prüft den tatsächlichen gebauten Kandidaten über bestehende CLI-/MCP-/Paket-, Aktivierungs-, Hostnamen-, Budget- und Kompatibilitätsstrecken. Historische Hostbeobachtungen bleiben historisch.
- Aufgaben: T-007 führt Code- und Struktur-/Architekturreview des finalen Diffs durch und behandelt Findings. Danach folgen vorhandener TP-Review und sole QA-Entscheidung, ohne neue Gates.
- Tests: 21 konkrete Szenarien bilden alle acht PRD-Kriterien und die jeweils zugeordneten acht SD-Entscheidungen auf Aufgaben, beobachtbare Ergebnisse und konkrete Nachweise ab.
- Abhängigkeiten: T-000 ist Voraussetzung der Umsetzung; Skill, Routing und Bereitschaft gehen den Projektionen und Abschlussprüfungen voraus. Reviews beziehen sich auf denselben finalen Kandidaten.
- Abgrenzung: Spätere Erstellungskompetenzen und Gate-Reihenfolgen bleiben unverändert. Keine neue Persistenz, Freigabeautorität, Oberfläche, automatische Hostinstallation, Veröffentlichung oder Git-Aktion; fremde staged Dateien bleiben erhalten.
- Evidenzgrenzen: Quell-/Projektions- und lokale Paket-/Protokollprüfung sowie dokumentierte kooperative Fachfälle sind getrennte Nachweise. Ohne tatsächlichen frischen nativen Hostlauf wird kein solcher behauptet; notwendige fehlende Evidenz bleibt offen.
- Risiken: Fremde oder veraltete Bindung, freigegebene UR, alte Präsentationsantwort, offene Klärung und Altformat werden ausdrücklich geprüft. Zweite Eigentümer, unbelegte Bereitschaft oder abgeschaltete Prüfungen verhindern einen sauberen Abschluss.
- Nächster Schritt: Approval: TP erlaubt die bestehende Brownfield-Vorbereitung und anschließend die genehmigte Umsetzung mit Tests. QA und UAT benötigen weiterhin ihre eigenen späteren Entscheidungen.
