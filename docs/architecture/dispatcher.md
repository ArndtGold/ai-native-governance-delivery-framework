# Dispatcher: Architektur und Use Cases

**Stand: 30. September 2026, Repository-Quelle.** Dieses Dokument erklärt den implementierten
Dispatcher. Es belegt weder die Veröffentlichung eines Pakets noch das Verhalten einer geladenen
Host-Sitzung. Die [Architekturübersicht](README.md) ordnet ihn in das Gesamtsystem ein.

Der Dispatcher verbindet einen konkreten Agentenauftrag mit einem Zielprojekt, dem erforderlichen
Kontrollkontext und dem nächsten begrenzten Arbeitsschritt. Er führt diesen Arbeitsschritt nicht
selbst aus. **Jedes Ergebnis trägt `authorizes: false`.** Eine technische Prüfung, eine
Fortsetzung oder eine Vorschau erzeugt keine menschliche Freigabe.

Die Use-Case-Kennungen unten dienen der Orientierung in dieser Dokumentation. Sie sind keine
Runtime-Kennungen und definieren keine zusätzliche Policy. Maßgeblich bleiben der
[Werkzeugvertrag](../../create-agdf/lib/skill-dispatch/contract.js), der
[Dispatch-Service](../../create-agdf/lib/skill-dispatch/service.js) und die
[Runtime-Verträge](../../plugin/meta/contracts/).

## Zuständigkeiten und Aufrufwege

| Beteiligter | Verantwortung |
|---|---|
| Mensch | Beauftragt Ziel und Umfang und trifft die erforderlichen Gate-Entscheidungen. |
| Coding-Agent | Wendet den Aktivierungsvertrag an, vergleicht den Auftrag mit den referenzierten URs, führt zurückgegebene Schritte aus und zeigt die kanonische Antwort. |
| Skill-Bindung oder MCP-Adapter | Ruft die geprüfte Laufzeit mit dem kanonischen Eingabeschema auf. Der Adapter besitzt keine eigene Run-, Gate- oder Freigabelogik. |
| Dispatcher | Validiert Eingaben, bindet das Ziel, beschafft Zuordnungsbelege, ruft die Kontrollauswertung auf und liefert ein Ergebnis samt `host_action`. |
| Gate-Evaluator | Bestimmt den aktuellen Kontrollstand, Voraussetzungen und die zulässige nächste Operation aus dem kanonischen Zustand. |
| Benannter Skill | Bearbeitet den gelieferten Auftrag innerhalb seines Vertrags; beispielsweise Brownfield Analysis oder die QA-Entscheidung. |
| Kanonische Writer | Persistieren separat Run-Zustand, Revisionen und Präsentationsbindungen. Sie werden vom Agenten aufgerufen, nicht vom Dispatcher ausgeführt. |

![Dispatcher-Ablauf mit Run-Zuordnung, Gate-Auswertung und begrenzter Fortsetzung](diagrams/03-dispatch.svg)

*Logischer Ablauf; die Fortsetzungszweige gelten nur unter den jeweiligen Eingabe- und
Kontrollbedingungen. [Diagrammquelle](diagrams/03-dispatch.dot).*

Der agentennative Skill-Weg und MCP `agdf_dispatch` erreichen denselben Dispatch-Service.
`agdf_inspect` hat einen eigenen lesenden Vertrag und Service und verwendet die gemeinsamen
Kontrollevaluatoren. Inspect führt keine Delivery-Fortsetzung aus. Installation, MCP-Registrierung
und Repository-Migration gehören zu getrennten Services; sie sind keine Dispatcher-Freigaben.

## Bindung vor Fortsetzung

`working_directory` ist Aufrufkontext. Das Governance-Ziel benötigt eine belegte Herkunft aus
`explicit_target`, `continued_target` oder `current_repository`. Eine Belegquelle oder ein zufällig
gefundenes Repository wird dadurch nicht zum Ziel. Die Gesprächssprache wird explizit als
`presentation_language` übergeben; sie muss bereits vor der Zielauflösung validierbar sein.

Für `gate-check` unterscheidet der Vertrag drei Absichten:

| Eingabe | Bedeutung |
|---|---|
| Ohne `intake` und ohne `continue_delivery` | Kontrollstand anzeigen; keine automatische Delivery-Fortsetzung. |
| `intake: true` | Positiv beauftragter Delivery-Einstieg. Ohne Run-Bindung zunächst den Umfang zuordnen; danach den konkreten neuen oder fortgesetzten Run bearbeiten. |
| `continue_delivery: true` mit Run-ID | Einen gebundenen Delivery-Pfad anhand seines aktuellen Zustands fortsetzen. Nicht mit `intake` kombinierbar. |

Beide Fortsetzungsoptionen gehören ausschließlich zu `gate-check`. Ein Urteilsskill wie `qa-gate`
erhält seinen eigenen Auftrag ohne `continue_delivery`. `expected_revision_id` bindet einen
Intake-Resume an die zuvor gelesene oder vom Writer zurückgegebene Revision; eine Abweichung liefert
frische Zuordnungsbelege. Sie darf nicht automatisch einen anderen oder neuen Run auswählen.

Die Ausgabefelder haben unterschiedliche Aufgaben:

| Feld | Bedeutung |
|---|---|
| `outcome`, `terminal` | Ergebnistyp und ob dieser Aufruf endet. |
| `control.gate_route` | Abgeleitete Route für das aktuelle Gate; keine Freigabe des nachfolgenden Gates. |
| `control.next_operation` | Vom Evaluator bestimmte nächste Operation, etwa `prepare_gate_artifact`. |
| `control.missing_approval` | Noch ausstehende menschliche Freigabe. |
| `continuation.phase` | Anlass der begrenzten Fortsetzung; kein zusätzlicher Ergebnistyp. |
| `host_action` | Verbindliche Behandlung des Ergebnisses durch den Aufrufer. |

## Use-Case-Katalog

Die Tabelle beschreibt den jeweiligen Einstieg und das erwartete Verhalten. Schreibende Schritte
in der letzten Spalte erfolgen **nach** dem Dispatch durch den Agenten über die zuständigen Writer.

| Fall | Auslöser und Bindung | Dispatcher-Ergebnis | Nächster Akteur und Grenze |
|---|---|---|---|
| **UC-D01 · Normale Hilfe / Opt-out** | Erklärung, Diagnose oder ausdrücklicher Verzicht auf AGDF ohne anderslautenden Auftrag. | Kein anfragebedingter Dispatch; Aktivierung wird davor entschieden. | Agent bearbeitet die Anfrage. Plugin-Entdeckung, Arbeitsverzeichnis und frühere Runs aktivieren keinen Delivery-Auftrag. |
| **UC-D02 · Kontrollstatus** | Explizite Kontrollabfrage mit belegtem Ziel, ohne Delivery-Fortsetzung. | `control_result`, terminal; bei unklarer Run-Auswahl kanonische Auswahl-/Statusdarstellung. | Agent zeigt den Text unverändert und beendet den Aufruf. Ein lesender Gate-Vorschautext ist keine gebundene Freigabefrage. |
| **UC-D03 · Ziel offen** | Gültige Eingabe, aber keine belastbare Zielbindung. | `target_unresolved`, terminal; keine Run- oder Gate-Auswertung. | Agent zeigt die kanonische Zielorientierung und stoppt. |
| **UC-D04 · Auftrag zuordnen** | Positiver Intake ohne bestätigten Run. | `intake_continuation`, Phase `resolve_delivery_run`; kanonische Kandidaten mit UR-Referenzen und Revisionen, noch kein einzelnes Gate-Ergebnis. | Agent liest die vollständigen referenzierten URs und vergleicht den Umfang. Anzahl und Aktualität der Runs sowie `AGDF_RUN_ID` ersetzen diesen Vergleich nicht. |
| **UC-D05 · Bestehenden Umfang fortsetzen** | Der Auftrag passt eindeutig in einen bestehenden UR. | Nach Resume mit Run-ID und `expected_revision_id`: aktuelle Gate-Auswertung oder passende Fortsetzung. | Agent arbeitet nur im gebundenen Umfang; frühere Freigaben werden nicht auf einen neuen Umfang übertragen. |
| **UC-D06 · Neuen Umfang beginnen** | Eigenständiger Auftrag; kein passender aktiver Umfang. Agent liefert eine neue, unbenutzte Run-ID mit Intake-Modus `new`. | `intake_continuation`, Phase `run_missing`; nach Erstellung und Resume gegebenenfalls `ur_missing`. | Agent ruft `run-create` auf, schreibt den UR und erfasst ihn mit `run-step`. Jede erneute Bindung verwendet die vom Writer zurückgegebene Revision. |
| **UC-D07 · Fachlich mehrdeutig** | Mehrere plausible UR-Umfänge oder unklare Abgrenzung. | Die Zuordnungsfortsetzung liefert Belege, keine semantisch ausgewählte Run-ID. | Agent stellt eine gezielte fachliche Frage. Der Dispatcher entscheidet die Umfangsübereinstimmung nicht. |
| **UC-D08 · Zuordnung veraltet / Bestand ungültig** | Intake-Revision geändert oder Run-Bestand unvollständig bzw. Integrität verletzt. | Veraltete Revision: frische `resolve_delivery_run`-Fortsetzung. Ungültiger Bestand: terminaler Kontrollbefund oder technische Recovery. | Agent vergleicht bei neuer Revision erneut. Fehlerhafte Bestände gelten nicht als leere Kandidatenliste und erlauben keinen Ersatz-Run. |
| **UC-D09 · Interne Brownfield-Schritte** | Intake oder Fortsetzung am Brownfield Review / Mode-Slice Decision; später strukturierter Pfad an Brownfield Analysis nach erfülltem TP. | `skill_continuation`, Phase `post_ur_review` bzw. `pre_implementation_analysis`, Skill `brownfield-analysis`. | Agent führt den benannten Skill aus und persistiert Review/Analyse und interne Schritte. Danach erneute Prüfung desselben Runs; unveränderter blockierter Zustand beendet die Fortsetzung. |
| **UC-D10 · Aktuelles Gate-Artefakt fehlt** | Gebundene Fortsetzung; Evaluator liefert `next_operation.type: prepare_gate_artifact`. | `skill_continuation`, Phase `required_gate_artifact`, mit Gate, Ausgabe- und Quellpfaden. | Agent erstellt das aktuelle Artefakt gemäß Vertrag und prüft danach erneut. Die Vorbereitung erlaubt weder ein späteres Artefakt noch eine vorgezogene Freigabefrage. |
| **UC-D11 · Menschliche Entscheidung vorbereiten** | Intake oder Fortsetzung; aktuelle Gate-Auswertung liefert eine gültige Approval-Präsentation. | `intake_continuation`, Phase `presentation_required`, lesende Vorschau und gebundener `run-present`-Schritt. | Agent ruft `run-present` auf, zeigt dessen Text unverändert und wartet auf eine **neue** bewusste Antwort. Der Dispatcher bindet oder persistiert keine Freigabe. |
| **UC-D12 · Benannten Skill ausführen** | Direkter Urteilsskill oder zulässige nächste Skill-Route bei gebundener Fortsetzung. | `skill_continuation` mit Skill, Ziel, Sprache und erforderlichem Kontroll-Snapshot. | Agent führt genau diesen Skill aus. Für unaufgelöste QA-Auswahl liefert der Evaluator die vollständige Kandidatenliste; der QA-Skill filtert nach QA und sucht nicht erneut in Run-Dateien. |
| **UC-D13 · QA-Nacharbeit / Blocker** | QA verlangt Nacharbeit, ist blockiert oder Voraussetzungen fehlen. | Aktuelle Kontroll-/Skill-Route gemäß Zustand; keine automatische Fortsetzung in spätere Gates. | Agent folgt dem konkreten Befund. Der Dispatcher trifft keine eigene QA-Entscheidung und wandelt `revise` nicht in `pass` um. |
| **UC-D14 · OR nach UAT** | Gebundene strukturierte Fortsetzung an OR, UAT erfüllt, keine offene Freigabe, OR noch nicht abgeschlossen. | `skill_continuation`, Phase `post_uat_closeout`, Skill `release-or`. | Agent erstellt und persistiert den Orchestration Report und prüft erneut. Commit, Push, PR oder Release werden dadurch nicht beauftragt. |
| **UC-D15 · Eingabe / Laufzeitfehler** | Ungültige Argumente, fehlender Vertrag oder technische Auswertung fehlgeschlagen. | `invalid_input` bzw. `evaluator_error`, terminal mit stabiler Recovery. | Agent zeigt die Recovery unverändert und stoppt. Kein alternativer Laufzeitpfad, keine Konfigurationsreparatur und keine Zustandsänderung allein aus diesem Ergebnis. |

## Drei typische Abläufe

**Neuer Auftrag:** Der erste Intake liefert `resolve_delivery_run`. Nach dem Vergleich mit den
referenzierten URs wählt der Agent bei eigenständigem Umfang eine unbenutzte Run-ID. Der nächste
Intake im Modus `new` liefert `run_missing`. Der Agent erstellt den Run und setzt mit dessen
Revision im Modus `resume` fort. `ur_missing` liefert die Schritte zum Schreiben und Erfassen des
UR. Erst die erneute Prüfung dieses Zustands kann `presentation_required` liefern. Auf
`run-present`, Anzeige und die neue menschliche Antwort folgt ein gesonderter Freigabevorgang.

**Bestehender Auftrag:** Der Agent liest die referenzierte vollständige UR-Fassung und bindet
den passenden Run mit ihrer aktuellen Revision. Hat sich die Revision geändert, folgt erneut der
Umfangsvergleich. Ein jüngerer Run oder ein ähnlicher Titel überspringt diesen Schritt nicht.

**Nächstes Gate vorbereiten:** `gate-check` mit `continue_delivery` prüft den gebundenen Run.
Wenn der Evaluator beispielsweise das aktuelle PRD zur Vorbereitung benennt, erstellt der Agent
dieses Artefakt aus den gelieferten Quellpfaden. Eine erneute Prüfung entscheidet, ob weitere Arbeit
oder `presentation_required` folgt. Die menschliche Freigabe bleibt ein eigener Schritt.

## Ergebnisbehandlung

Der Werkzeugvertrag besitzt genau sechs Ergebnistypen:

| `outcome` | `terminal` | Behandlung |
|---|---|---|
| `invalid_input` | `true` | Kanonische Recovery unverändert zeigen und stoppen. |
| `target_unresolved` | `true` | Kanonische Zielorientierung unverändert zeigen und stoppen. |
| `control_result` | `true` | Kanonische Präsentation oder Recovery unverändert zeigen und stoppen. |
| `evaluator_error` | `true` | Kanonische Recovery unverändert zeigen und stoppen. |
| `intake_continuation` | `false` | Die konkrete Zuordnung, Intake-Schritte oder Präsentationsvorbereitung ausführen. |
| `skill_continuation` | `false` | Den benannten Skill mit der gelieferten Bindung und dessen Vertrag ausführen. |

Ein terminaler Text bildet die gesamte Antwort auf diesen Dispatch: ohne angehängte Frage,
Übersetzung oder weitere Aktion. Bei Fortsetzungen bestimmt `host_action` den Auftrag; das Feld
`terminal: false` ist keine allgemeine Erlaubnis zum Weiterarbeiten. Insbesondere ist
`presentation_required` eine Phase von `intake_continuation` und `prepare_gate_artifact` eine
Evaluator-Operation, kein siebter oder achter Ergebnistyp.

## Quellen und Verifikation

| Thema | Maßgebliche Implementierung / Vertrag | Bestehender Test-Einstieg |
|---|---|---|
| Eingabe, Ergebnisse, Host-Aktion und Routing | [Vertrag](../../create-agdf/lib/skill-dispatch/contract.js), [Service](../../create-agdf/lib/skill-dispatch/service.js) | [Dispatch-Tests](../../create-agdf/scripts/skill-dispatch-test.js), [Funktionsvertrag](../../create-agdf/scripts/skill-dispatch-function-contract-test.js) |
| Aktivierung und Interaktion | [Request Activation](../../plugin/meta/contracts/request-activation.md), [Interaktion](../../plugin/meta/contracts/interaction.md) | [Dispatch-Tests](../../create-agdf/scripts/skill-dispatch-test.js) für Runtime-Verhalten; die anfragebezogene Aktivierung durch den Agenten braucht eigene Host-Evidenz. |
| Run-Zuordnung und Intake | [Zuordnung](../../create-agdf/lib/skill-dispatch/delivery-run-assignment.js), [Intake](../../create-agdf/lib/skill-dispatch/delivery-intake.js) | [Zuordnungs-Tests](../../create-agdf/scripts/delivery-run-assignment-test.js) |
| Gate-Routing und Artefaktvorbereitung | [Gate-Evaluator](../../create-agdf/lib/control-evaluation/gate-check.js), [Vorbereitungsvertrag](../../plugin/meta/contracts/gate-artifact-preparation.md), [Gate-Übergang](../../plugin/meta/contracts/gate-transition.md) | [Dispatch-Tests](../../create-agdf/scripts/skill-dispatch-test.js) |
| Präsentationsbindung und Freigabeprüfung | [Präsentations-Writer](../../create-agdf/lib/control-state/run-presentation.js), [Approval-Validator](../../create-agdf/lib/control-state/gate-approval-validator.js) | [Dispatch-Tests](../../create-agdf/scripts/skill-dispatch-test.js) für die Übergabe an den Writer |
| MCP-Projektion | [MCP-Laufzeit](../../create-agdf/lib/mcp-dispatch-runtime.js), [Server](../../agdf-mcp-server/src/server.js) | [Protokoll](../../agdf-mcp-server/test/protocol.test.js), [Fortsetzungen](../../agdf-mcp-server/test/continuation.test.js) |

Quellcode und lokale Tests belegen Vertrags- und Routingverhalten. Ob ein bestimmter Host die
Bindung lädt, den richtigen Aufruf ausführt, eine Fortsetzung beachtet und den Text unverändert
anzeigt, benötigt zusätzlich einen frischen Host-Test. Der Katalog ist keine Behauptung, dass jeder
Fall bereits in jeder Host-/Modellkombination beobachtet wurde.

Bei Änderungen an Ergebnisfeldern, Routing, Phasen oder Writer-Grenzen sind Katalog,
[Übersicht](README.md) und DOT/SVG gemeinsam zu prüfen. Die fachliche Regel bleibt bei ihrem
verlinkten Owner; dieses Dokument erklärt ihre Wirkung.
