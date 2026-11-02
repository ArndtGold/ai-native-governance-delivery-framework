# SD: Eigenständiger UR-Erstellungsskill

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-04
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Der kanonische Skill `ur-definition` übernimmt die fachliche Erstellung und Überarbeitung unfreigegebener URs. Der bestehende Intake ordnet weiterhin Auftrag, Ziel und Run zu und erstellt erforderlichenfalls den Run. Die gemeinsame Gate-Evaluation und der Dispatcher liefern anschließend eine begrenzte Übergabe an `ur-definition`. Dieser Skill erzeugt ausschließlich die gebundene UR und verwendet die vorhandenen Kontrolloperationen für Registrierung und Entwurfsänderung. Danach prüft gate-check frisch und bereitet die bestehende Freigabepräsentation vor.

Die fachliche Erstellung erhält einen Eigentümer, keinen neuen Kontrollservice. Der Dispatcher bleibt lesend und routend; der bestehende Continuation-Service behält seine begrenzte Kontrollkorrektur. Run-Schreiber, Revisions- und Freigabeoperationen werden wiederverwendet.

### Neuer Bedarf

1. Bestehende Request-Activation und Zielauflösung, dann kanonische Run-Zuordnung.
2. Falls notwendig bestehendes run-create, danach erneuter Intake mit der zurückgegebenen Revision.
3. Der bisherige Zustand ur_missing führt zu einer skill_continuation für ur-definition statt zum fachlichen write_ur-Schritt innerhalb von gate-check.
4. Der Skill klärt den ursprünglichen Auftrag und schreibt die UR nur am übergebenen Pfad. Bei wesentlicher fachlicher Lücke fragt er gebündelt nach und markiert diese Lücke; er erklärt den Bedarf nicht für fertig.
5. Erstregistrierung über run-step --step ur; bereits registrierte zulässige Entwurfsänderung über run-update. Beide liefern die Revision für die folgende Prüfung. Zur Wiederaufnahme wird der kanonische Zustand frisch geprüft.
6. Frischer gate-check-Intake entscheidet über Klärung, Fehler-Recovery oder bestehende Freigabepräsentation. Ein neuer run-present bindet die konkrete Fassung; nur die spätere menschliche Antwort darf run-approve erreichen.

### Ausdrückliche UR-Überarbeitung

Ein vorhandener Entwurf ist nicht allein wegen seiner Existenz ein neuer Schreibauftrag. Eine tatsächliche Überarbeitungsanweisung wird im gebundenen Intake durch die neue optionale Eingabe ur_action: revise kenntlich gemacht. Sie gilt nur für gate-check mit intake: true, intake_mode: resume, ausdrücklich ausgewähltem run_id und dessen expected_revision_id. CLI-Projektion: --ur-action revise. Ungebundene Anweisungen durchlaufen zuerst die vorhandene Run-Zuordnung; keine Auswahl nach Alter, Anzahl oder Umgebung.

Das Routing prüft die Überarbeitungsberechtigung vor der Präsentation des bisherigen Entwurfs. Ein zulässiger aktueller UR-Draft geht an ur-definition. Eine freigegebene UR oder ein späteres Gate ergibt den bestehenden konkreten Kontrollhinweis; der Erstellungsskill überschreibt nichts. ur_action ist eine Absicht zur begrenzten Entwurfsarbeit, keine Gate- oder Schreibfreigabe an sich.

### Direkter Skillaufruf

ur-definition führt wie andere Skills zuerst den gemeinsamen Dispatcher aus. Ohne explizit gebundenen Run wird die Tätigkeit in den bestehenden Intake zur Run-Zuordnung zurückgegeben; keine implizite Auswahl aus AGDF_RUN_ID. Mit gebundenem Run ist Erstellung oder Überarbeitung nur beim gültigen offenen UR-Gate ohne UR-Freigabe möglich. Der Dispatcher liefert die aktuelle Revision; die kanonische Schreiboperation prüft sie erneut vor Persistenz. Ein direkter Skillaufruf erlaubt keine spätere Gate-Arbeit und genehmigt keinen Run.

## 2. Ownership And Source Of Truth

| Responsibility | Canonical owner | Change |
|---|---|---|
| Request-Activation und Operationen | plugins/agdf/meta/contracts/request-activation.md; kanonischer Projektor | Der neue direkte Skill wird aus dem Katalog abgeleitet; keine neue Aktivierungsregel oder Heuristik. |
| Skillidentität und Hostnamen | plugins/agdf/meta/agdf-plugin.definition.json; vorhandene Namens-/Hostprojektoren | Ein Eintrag ur-definition mit judgement_required und requiresControlSnapshot true. |
| Fachliche UR-Erstellung | plugins/agdf/skills/ur-definition/SKILL.md (neu) | Problem, Ziel, betroffene Nutzer, Umfang, Nicht-Ziele, Erfolgssignale, Quellen, Risiken und offene Fragen formulieren. |
| UR-Verfahrensvertrag | plugins/agdf/meta/contracts/ur-definition.md (neu) | Begrenzt die Übergabe, Klärung, Erstregistrierung, Entwurfsänderung und Rückgabe; verweist auf vorhandene Gate-/Ziel-/Interaktionsautorität. |
| Run-Zuordnung und Intake | packages/core/lib/skill-dispatch/delivery-run-assignment.js; delivery-intake.js | Bestehende Zuordnung und run_missing bleiben. UR-Übergabe ersetzt fachliches write_ur in gate-check. |
| Gate-Zustand und Routing | packages/core/lib/control-evaluation/gate-check.js; packages/core/lib/skill-dispatch/service.js und contract.js | Zulässige gebundene UR-Erstellung und explizite Überarbeitung liefern einen begrenzten Skill-Auftrag. |
| Run-Registrierung, Revision und Freigabe | packages/core/lib/control-state/run-steps.js; run-recording.js; run-state-writer.js; run-presentation.js | Vorhandene Operationen verwenden; kein neuer Schreiber, keine neue Persistenz oder Freigabeimplementierung. |
| UR-Struktur | plugins/agdf/control/templates/artefacts/UR.md | Betroffene Nutzer ausdrücklich erfassen und fachliche Klärung kenntlich machen; kein neues freigebendes Statusfeld. |
| Darstellung und menschliche Entscheidung | Bestehende Interaktionsverträge und run-presentation-render.js | Bestehende lokalisierte, digestgebundene Präsentation bleibt maßgeblich. |

Der neue UR-Verfahrensvertrag wird als fokussiertes Modul im bestehenden runtimeContract-Katalog registriert. ur-definition lädt ihn sowie die bestehenden benötigten Gate-/Interaktionsverträge. gate-check lädt die UR-Fachanweisungen nicht als zweite Erstellungskompetenz. Die UR-Datei bleibt die einzige fachliche Anforderungsquelle des Runs.

## 3. Architecture Decisions

- SDD-001: ur-definition ist ein eigener kanonischer judgement_required-Skill mit fokussiertem UR-Vertrag; rationale: Die fachliche Bedarfsformulierung benötigt Modellurteil und einen eindeutigen Eigentümer; consequence: Ein zusätzlicher Skill und ein gezielt geladenes Vertragsmodul müssen auf allen vorhandenen Projektionen konsistent erscheinen.
- SDD-002: Die bestehenden Intake- und Dispatch-Eigentümer liefern eine gebundene ur_definition-Fortsetzung statt write_ur in gate-check; rationale: Run-Zuordnung und Kontrolle bleiben an einer Stelle, während fachliche Erstellung delegiert wird; consequence: UR-Erstellung und ihre direkte Auswahl benötigen explizite Zulässigkeitsprüfung vor allgemeinen Präsentations- und Judgement-Routen.
- SDD-003: Eine ausdrücklich verlangte Draft-Überarbeitung verwendet ur_action: revise ausschließlich im revisionsgebundenen Resume-Intake; rationale: Der Router muss Überarbeitungsabsicht von einer normalen Freigabepräsentation unterscheiden können, ohne Anzeigetext als Routingcode auszuwerten; consequence: Der gemeinsame MCP-/CLI-Eingabevertrag und seine Schema-2-Bindungsprojektion erhalten eine strikt begrenzte optionale Eingabe.
- SDD-004: Der UR-Skill formuliert aus dem Originalauftrag und gebundenen Kontext, mit gebündelter wesentlicher Klärung und markierten Annahmen; rationale: Vollständigkeit darf nicht durch erfundene Angaben oder wiederholte Fragen entstehen; consequence: Fachliche Vollständigkeit benötigt nachvollziehbare Verhaltensbeobachtung und Review, die Quelltests allein nicht ersetzen.
- SDD-005: Erstentwürfe werden mit run-step ur registriert, Änderungen registrierter unfreigegebener Entwürfe mit run-update, danach folgt frische Prüfung und Präsentation; rationale: Die bestehenden Seal-, Revisions- und Präsentationsoperationen besitzen diese Zustände bereits; consequence: Der Skill muss Erstregistrierung und Änderung unterscheiden und jede zurückgegebene Revision verwenden, statt dieselbe run-step-Operation unbesehen zu wiederholen.
- SDD-006: Fremde, ungültige, veraltete oder freigegebene Zustände bleiben beim vorhandenen Kontrollpfad; rationale: Der neue Skill besitzt weder Ziel-/Run-Zuordnung noch Freigabeautorität; consequence: Seine Fortsetzung enthält nur den zulässigen runlokalen UR-Pfad und es gibt keinen stillen Fallback auf einen anderen Run oder späteres Artefakt.
- SDD-007: Katalogbasierte vollständige Projektion ersetzt feste Zehn-Skills-Annahmen bei erhaltenen gemessenen Budgets und Integritätsprüfungen; rationale: Die Aufnahme eines fachlichen Skills darf keinen zweiten Katalog oder pauschales Wachstumspolster schaffen; consequence: Aggregate Anweisungen werden innerhalb vorhandener Grenzen kompakt gehalten, notwendige Payload-Deltas exakt gemessen und dokumentiert, Evidenzfingerprints ohne Abschwächung der Fälle aktualisiert.
- SDD-008: Akzeptanz bleibt ausschließlich in der genehmigten PRD; rationale: Dieser Umbau muss eigenständig prüfbar bleiben und darf spätere Verantwortungsschritte nicht vorwegnehmen; consequence: SD und TP referenzieren dieselben Kriterien und bestehenden Review-/QA-Eigentümer, mit getrennten Quell-, Paket-, Protokoll- und tatsächlichen Hostnachweisen.

## 4. Integration Points

### Begrenzte UR-Fortsetzung

Der bestehende gemeinsame Dispatch-Ergebnisvertrag bleibt bestehen. Die UR-Tätigkeit nutzt skill_continuation mit phase: ur_definition und skill_id: ur-definition. Sie enthält governance_target, run_id, revision_id, presentation_language, artifact_path, template_path, draft_registered und die fokussierten runtime_contracts. Die Pfade stammen aus dem bestätigten Run und der bestehenden UR-Vorlage. Sie sind keine vom Nutzer frei wählbaren Schreibziele.

operation_id: delivery.start darf den ursprünglichen Intake-Kontext bezeichnen, erteilt aber keine Berechtigung. outcome bleibt nichtterminal und authorizes bleibt false. Das Feld draft_registered bestimmt ausschließlich die vorhandene Registrierungsoperation; die kanonische Revision und der aktuelle Gate-Zustand werden vor dem Schreiben erneut geprüft. Es gibt keine freie Liste fachlicher Schreibbefehle in der gate-check-Fortsetzung.

Run-Erstellung und erneuter Dispatch bleiben bestehende Intake-Schritte. Beim fehlenden UR delegiert gate-check den Fachauftrag. Beim normalen vorhandenen Entwurf ohne Überarbeitungsabsicht bleibt die bestehende Freigabepräsentation zuständig.

### Fachliche Bereitschaft

Der Skill prüft alle erforderlichen Bedarfsfelder und macht fehlende wesentliche Angaben in der UR kenntlich. Eine kleine lesende UR-Bereitschaftsprüfung innerhalb der bestehenden Gate-Evaluation erkennt explizit offene fachliche Klärung und verhindert dann eine Freigabepräsentation. Sie erfindet keine Semantik und bewertet weder technische Lösungen noch Gate-Zustimmung. Die inhaltliche Beurteilung verbleibt beim UR-Skill und dem menschlichen Review.

Die neue Vorlage und der Skill verwenden dafür einen nichtfreigebenden Feldwert Requirements clarification: open oder complete. Neue URs müssen diesen Wert und ausgefüllte Bedarfsabschnitte aufweisen. Für bereits bestehende URs ohne dieses Feld gilt die bisherige Darstellung weiter; der Umbau migriert oder entwertet keine historischen Runs. Nach einer zulässigen Überarbeitung setzt der Skill den Wert für die neue Fassung. Ein fehlendes Feld in einer alten Fassung wird nicht als automatisch geprüfte fachliche Vollständigkeit ausgegeben.

### Projektion und Ressourcen

Die vorhandenen Generatoren erzeugen Hostnamen, Runtime-Vertragsreferenzen, portable Skills und Paketressourcen aus den kanonischen Quellen. Feste Skillanzahlen werden auf Gleichheit mit dem kanonischen Katalog und eindeutige vollständige Reihenfolge geprüft. Die Anweisungssummen bleiben gemessen; bestehende Beschreibungen können ohne Änderung ihrer fachlichen Aktivierung und Grenze kompakter formuliert werden, falls der neue Skill sonst das vorhandene Aggregatbudget überschreitet.

Copilot-Payload und erzeugte Ressourcen erhalten nur das tatsächlich notwendige exakt gemessene Delta. Aktuelle Kompatibilitäts- und Evaluationsevidenz wird auf die neue Quelle gebunden; historische Beobachtungen werden nicht als neue Hostbeobachtung umgedeutet. Kein neues MCP-Tool, kein separater Server, keine automatische Installation oder Veröffentlichung.

## 5. Constraints And Compatibility

- Bestehende sechs Nutzer-Gates, Freigabeformel, Ziel-/Run-Zuordnung, Seal und Freigabepräsentation bleiben unverändert.
- ur_action ist ausschließlich eine additive begrenzte Routingoption. Ungültige Kombinationen scheitern vor fachlicher Arbeit; bestehende Aufrufe ohne das Feld bleiben kompatibel.
- Es wird keine neue Persistenzstruktur, kein neuer Run-Schreiber und keine neue Genehmigungsautorität eingeführt. Die UR bleibt runlokal und kanonisch.
- Ein direkter UR-Skillaufruf überspringt keine Intake-Zuordnung oder Gate-Voraussetzung. Selbst bei bereitstehender Präsentation benötigt ein Schreibauftrag die ausdrückliche fachliche Änderung und aktuelle Zulässigkeit.
- Beim regulären Kontrollstatus bleibt Dispatch lesend. Erstellung, Registrierung und Präsentationsvorbereitung sind separate ausdrücklich erlaubte Tätigkeiten.
- Ein Requirements-clarification-Feld ist fachliche Bereitschaftsevidenz, kein Gate-Pass, keine Freigabe und keine unabhängige Prüfung. Abwärtskompatibilität für alte URs wird ausdrücklich getestet.
- Vorhandene nicht zum Run gehörende staged Kompatibilitätskopien bleiben unangetastet. Kein automatischer Commit, Push, Release oder Hostwechsel.

## 6. Test And Evidence Strategy

TP legt konkrete Szenarien für alle Kriterien und Entscheidungen fest. Wesentliche Gruppen sind Erstentwurf, direkte und Intake-Auswahl, wesentliche Lücke, vollständiger Auftrag, bereits beantwortete Frage, registrierte Draft-Änderung, offene Klärung, falsche/fehlende/veraltete Bindung, freigegebene UR, spätere Gates und bestehende Freigabe bis Brownfield Review.

Negativszenarien prüfen unveränderte Fremdartefakte und Freigaben sowie fehlende nachgelagerte Arbeit. Darstellung wird für die vorhandenen registrierten Sprachen und gültigen Fallback geprüft. Fachliche Auftrag-/Entwurfspaare und Rückfragen werden separat bewertet und als kooperative Verhaltensnachweise bezeichnet; strukturelle Skillprüfungen beweisen dies nicht.

Katalog-, Skillnamen-, Konformitäts-, Request-Activation-, Intake-/Dispatch-, CLI/MCP-Vertrags-, Projektions-, Anweisungsbudget-, Paket- und Integritätsprüfungen verwenden die vorhandenen Testeigentümer. Exact-version-Paket-/Protokollnachweise und frische native Hostbeobachtung bleiben getrennt. Keine alte Kompatibilitätsbeobachtung wird neu datiert, um frische Evidenz vorzutäuschen.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Eigenständiger UR-Skill und begrenzte Delegation statt konkurrierender Fachanweisungen in gate-check | Kanonischer Katalog; neuer UR-Skill; Core-Intake/Dispatcher | SDD-001, SDD-002 | Neue konsumierte Fortsetzung; bestehende Run-Zuordnung und Präsentationsroute bleiben geschützt. |
| AC-002 | Verbindliche Bedarfsfelder, Nutzerbezug, Originalauftrag und markierte Annahmen | UR-Skill, UR-Vorlage und fokussierter UR-Vertrag | SDD-004 | Inhaltliche Qualität ist semantisch; repräsentative Verhaltensnachweise und menschlicher Review erforderlich. |
| AC-003 | Gebündelte wesentliche Klärung mit sichtbarem Zustand und lesender Bereitschaftsprüfung | UR-Skill und bestehende Gate-Evaluation | SDD-004, SDD-006 | Neue URs nutzen explizite Klärung; alte URs werden nicht automatisch migriert oder für semantisch geprüft erklärt. |
| AC-004 | Aktuelle gebundene UR-Zulässigkeit, kanonische Run-Zuordnung und erneute Revisionsprüfung beim Schreiber | Core-Intake/Dispatch und vorhandene Run-Operationen | SDD-002, SDD-006 | Kein Umgebungs-Fallback; negative Bindungsfälle bleiben ohne fremde Änderungen. |
| AC-005 | Explizite revise-Option, begrenzte Draft-Änderung und kanonische neue Revision | Gemeinsamer Eingabevertrag, Intake und run-update | SDD-003, SDD-005, SDD-006 | Additive Option strikt validieren; freigegebene URs und alte Präsentationsantworten sind ausgeschlossen. |
| AC-006 | Erstregistrierung oder Draft-Aufzeichnung, frische Prüfung, bestehende lokalisierte Präsentation und menschliche Freigabe | run-step ur, run-update, run-present und run-approve; gate-check | SDD-005, SDD-006 | Keine Übertragung von Antwort oder Präsentation auf neue Fassung; offene Klärung unterdrückt Bereitschaft. |
| AC-007 | Ein katalogbasierter Projektionspfad, fokussierte Vertragsladung und exakt gemessene Größen | Kanonische Definition und vorhandene Projektoren/Budget-/Paketprüfer | SDD-001, SDD-007 | Zehn-Skills-Annahmen ersetzen, Integritäts- und Budgetprüfungen erhalten, keine historische Evidenz als frisch ausgeben. |
| AC-008 | PRD-basierte Kriterienkette und unveränderte nachgelagerte Erstellung, Reviews und QA | Genehmigte PRD und vorhandene Qualitäts-/Gate-Verträge | SDD-008 | Kein Folgeumbau als Voraussetzung, keine parallele Akzeptanzquelle oder unbelegte Hostbereitschaft. |

## 8. Risks And Open Questions

Keine offene Produkt- oder Architekturentscheidung verhindert die Taskplanung. Fachliche Beurteilung bleibt eine kooperative Modellleistung mit menschlichem Review, keine semantische Sicherheit durch ein Statusfeld. TP muss diesen Unterschied in den Nachweisen abbilden.

Die konkrete Messung von Aggregat- und Payloadgrößen erfolgt nach Umsetzung; die Entscheidung ist, vorhandene Grenzen und Prüfungen zu erhalten und notwendige Deltas exakt zu begründen. Regressionen könnten in generischen Judgement-Routen, UR-Präsentationsfehlern oder alten Run-Formaten liegen; entsprechende Negativ- und Kompatibilitätsszenarien sind verpflichtend. Das alte installierte Plugin versteht den neuen Skill noch nicht; neue Paket-/Protokolltests müssen den tatsächlich gebauten Kandidaten verwenden.

## 9. Next Step

Dieses SD prüfen und revisionsgebunden mit Approval: SD freigeben. Danach ist der Task-/Testplan erlaubt; Implementierung bleibt bis zu seiner Freigabe und den bestehenden Voraussetzungen gesperrt.

## AGDF Approval Summary (de; source=en)

- Lösung: Der neue kanonische Skill ur-definition formuliert und überarbeitet UR-Entwürfe. Intake ordnet Ziel und Run zu, Dispatcher übergibt die Tätigkeit und gate-check prüft frisch. Die vorhandenen Kontrollschreiber und Freigaben bleiben maßgeblich.
- SDD-001: Eigener judgement_required-Skill und fokussierter UR-Vertrag; keine zweite Erstellungskompetenz innerhalb von gate-check. Ein zusätzlicher Skill und ein gezielt geladenes Vertragsmodul werden konsistent projiziert.
- SDD-002: Die gebundene Fortsetzung ur_definition ersetzt write_ur im gate-check-Intake. Direkte Aufrufe durchlaufen ebenfalls die vorhandene Kontrolle und ohne explizite Run-Bindung den Intake; keine Auswahl aus der Umgebung.
- SDD-003: Ausdrücklich verlangte Entwurfsänderung nutzt ur_action: revise nur im gebundenen Resume-Intake mit aktueller Revision. MCP und CLI erhalten diese begrenzte additive Option; normale Aufrufe präsentieren weiter den bestehenden Entwurf.
- SDD-004: Der Skill klärt die Bedarfsfelder, markiert Annahmen und bündelt nur wesentliche Rückfragen. Requirements clarification: open verhindert bei neuen URs eine verfrühte Präsentation; complete ist keine Freigabe. Alte URs werden nicht migriert oder automatisch als semantisch geprüft ausgegeben.
- SDD-005: Erstregistrierung mit run-step ur, spätere zulässige Draft-Änderung mit run-update. Danach frische Prüfung und neue Präsentationsbindung; eine alte Antwort gilt nicht für die geänderte Fassung.
- SDD-006: Fremde, fehlende, veraltete, freigegebene oder spätere Gate-Zustände gehen zum vorhandenen Kontrollpfad. Der Skill überschreibt keine freigegebene UR und erstellt kein späteres Artefakt.
- SDD-007: Zehn-Skills-Annahmen durch katalogbasierte Vollständigkeit ersetzen. Anweisungsgrenzen und Integritätsprüfungen erhalten; zusätzliche Payload exakt messen und begründen. Keine pauschale Budgetreserve, kein neuer Server oder automatische Installation.
- SDD-008: Die PRD bleibt einzige Akzeptanzquelle. SD bildet AC-001 bis AC-008 jeweils genau einmal ab; spätere Erstellungskompetenzen, Reviews und QA behalten ihre Funktion.
- Integration und Nachweise: Gemeinsame Eingabe-/Ergebnisverträge, vorhandene Intake-, Gate-, Registrierungs- und Präsentationseigentümer sowie die kanonischen Hostprojektoren verwenden. Erstentwurf, Rückfragen, Draft-Änderung, Bindungsfehler, offene Klärung, Altformat und Freigabe prüfen; tatsächliche Verhaltens- und Hostevidenz getrennt benennen.
- Risiken: Semantische Qualität entsteht durch nachvollziehbare Formulierung und menschlichen Review, nicht allein durch ein Bereitschaftsfeld. Generische Skill-Routen, Altformate und Projektionen benötigen Regressionsevidenz; die neue Implementierung wird gegen den gebauten Kandidaten geprüft.
- Entscheidung: Keine offene Architekturentscheidung verhindert die Planung. Approval: SD erlaubt den Task-/Testplan; Implementierung bleibt bis zur genehmigten Planung und ihren bestehenden Voraussetzungen gesperrt.
