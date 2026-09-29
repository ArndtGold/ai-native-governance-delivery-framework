# SD: Verlässlicher Delivery-Intake und Fortsetzung

Status: draft
Gate: SD
Gate approval: open
Revision: 1
Based on: PRD.md, freigegebene Fassung 1
Date: 2026-09-27
Owner: user
Run: agdf-intake-continuation-repair

## 1. Solution Overview

Bestehenden Dispatcher, Run-Writer und Präsentationsrenderer erweitern. Der Dispatcher bleibt lesend und nicht autorisierend. Er unterscheidet explizite Neuanlage, gebundene Fortsetzung und reine Statusprüfung. Schreibende Lifecycle-Befehle führen erlaubte Vorbereitung und Freigabepersistenz aus. Die vorbereitete Präsentation erhält eine dauerhafte, revisionsgebundene Identität; tatsächliche Sichtbarkeit und Nutzerursprung bleiben eine ausdrücklich benannte Host-/Agenten-Vertrauensgrenze.

Keine zweite Routing-Engine, kein zweiter Run-Store, kein paralleler Statusrenderer.

## 2. Ownership And Source Of Truth

| Verantwortung | Kanonischer Owner | Änderung |
|---|---|---|
| Aktivierung und Nutzerabsicht | plugin/meta/contracts/request-activation.md | Neuanlage von aktiver Fortsetzung und Status trennen |
| Gate- und Interaktionssemantik | plugin/meta/contracts/gate-transition.md; interaction.md | Begrenzte Fortsetzung und Präsentationsbindung beschreiben |
| Dispatch-Vertrag | create-agdf/lib/skill-dispatch/contract.js | Explizite Modusfelder und validierte Kombinationen; gemeinsame MCP-/CLI-Projektion |
| Intake/Fortsetzung | delivery-intake.js; service.js | Vorbereitende Schritte und erlaubte interne Skill-Fortsetzung ableiten |
| Run-Mutation | control-state/run-state-repository.js; run-recording.js; run-state-writer.js | Bestehende Erstellung, Revisionen, Locks und Freigabeprüfung wiederverwenden |
| Präsentation | control-evaluation/gate-check.js; interaction-presentation.js | Blockadebereinigung und Bindung an unveränderte kanonische Darstellung |
| Installierte Befehle | cli/validation-handlers.js; runtime/validator-application.js | Gemeinsame Handler für run-create und neue Präsentationsvorbereitung |
| Distribution | scripts/sync-plugin-runtime.js; sync-package-assets.js und vorhandene Host-Projektionen | Ausführbare Runtime und Anweisungen konsistent generieren |

RUN_STATE bleibt Autorität über Gates und Freigaben. Präsentationsbelege sind vorgelagerte Nachweise, keine zweite Genehmigungsquelle. Die bestehende UR/PRD/SD/TP-Kette bleibt bestehen.

## 3. Architecture Decisions

### D-01: Explizite Aufrufabsicht

Den bestehenden optionalen Intake-Schalter kompatibel erhalten und um `intake_mode: new | resume` ergänzen; CLI `--intake-mode`. Dieses Feld ist nur zusammen mit `intake: true` für gate-check gültig. `new` benötigt einen explizit gewählten neuen `run_id`, der zum vom Nutzer beauftragten neuen Umfang gehört. Die Agentenanweisung darf für diese Neuanlage eine geeignete ID wählen; sie darf dadurch keinen bestehenden Run übernehmen. `resume` benötigt einen eindeutig gebundenen Run.

Ohne neuen Modus gelten bisherige sichere Regeln: fehlender Run erlaubt Vorbereitung; bestehende Mehrdeutigkeit verlangt Auswahl. Ein bloßes `intake: true` bedeutet niemals automatisch Neuanlage. Ein einzelner vorhandener, fachlich fremder Run darf ebenfalls nicht als neuer Auftrag verwendet werden.

Neuanlage prüft Ziel, kanonisches Kontrollgerüst und Nichtvorhandensein der gewünschten ID. Fehler in anderen Runs verleihen keine Autorität und werden nicht repariert; nur die für neue Run-Erstellung relevanten Gerüstbedingungen entscheiden deren Vorbereitung. Bei Kollision meldet der Dispatcher Konflikt statt Übernahme oder neuer Zufalls-ID. Wiederaufnahme verwendet `resume` mit der bereits zurückgegebenen ID nach Prüfung des Auftragsbezugs.

### D-02: Keine Mutation im Dispatcher

agdf_dispatch behält readOnlyHint und authorizes:false. Neuanlage liefert nichtterminal die geordneten Schritte run-create, UR schreiben, run-step ur, erneute Prüfung. Die Ausführung liegt beim Agenten mit vorhandener Nutzerautorisierung. Fehler stoppen vor späteren Schritten. Ein ausdrücklich lesender Statusaufruf erzeugt weder Präsentationsbelege noch Runs.

`run-create` wird aus cli/application.js in einen gemeinsam verwendeten Handler überführt. Vollständige CLI und lokaler Validator rufen denselben createRun-Owner auf. Kein Import interner Funktionen durch den Agenten. Keine pauschale Freischaltung sonstiger Lifecycle-Befehle im Validator.

### D-03: Begrenzte interne Fortsetzung

Optional `continue_delivery: true` (CLI `--continue-delivery`) erlaubt eine Abfrage für aktiv autorisierte, gebundene Fortsetzung. Es ist mit Intake-Modi unvereinbar und benötigt run_id. Status-, allgemeine nächste-Schritt- und reine Informationsfragen setzen es nicht.

Nur wenn die kanonische Prüfung offen ist, die UR gültig freigegeben ist und das aktuelle interne Gate Brownfield Review oder dessen Mode/Slice-Recovery ist, liefert der Dispatcher `skill_continuation`, terminal:false, begrenzt auf brownfield-analysis/post_ur_review mit Ziel und aktueller Revision. Der Steuerungsbericht und die Fortsetzungsanweisung müssen dasselbe Gate benennen. Die Rückgabe erteilt keine neue Autorität.

Der Agent führt Review und Routenwahl aus und prüft danach erneut. Ein bereites Nutzer-Gate, eine Blockade, fehlende Freigabe oder ein nicht unterstützter interner Zustand bleibt terminal. Kein allgemeiner automatischer Ausführungsschleifer und keine Erweiterung auf Implementierung. Bestehende benannte Skill-Aufrufe bleiben möglich. Der Vertrag enthält eine explizite Stop-Regel für unveränderte Zustände nach erfolgloser Fortsetzung, um Wiederholungsschleifen zu verhindern.

### D-04: Blockadekarten vor Freigabereife

Bei fehlender/mehrdeutiger/ungültiger Run-Auswahl `missing_approval: none`, keine Aktion „request exact UR approval“, keine suggerierte Nach-Freigabe-Fortsetzung. Stattdessen kanonische Auswahl-/Intake-Recovery mit vorhandenen Kandidaten. Bereite Gate-Präsentationen werden weiterhin ausschließlich vom vorhandenen Renderer abgeleitet. Alle unterstützten Sprachprojektionen erhalten dieselbe Semantik.

### D-05: Vorbereitete Präsentation dauerhaft binden

Neuer explizit schreibender Befehl `run-present --run <id> --gate <gate> --revision <uuid>` bereitet eine entscheidungsreife Präsentation vor. Er nutzt die kanonische Gate-Prüfung und den vorhandenen Renderer. Er erzeugt unter dem ausgewählten Run einen unveränderlichen Präsentationsbeleg mit schema_version, zufälliger presentation_id, Run, Gate, revision_id, Artefaktdigest beziehungsweise gate-spezifischem Evidenzdigest, Darstellungsdigest, Sprache und Erstellungszeit. Bei UAT wird die vorhandene kanonische Gate-Evidenz statt eines erfundenen Pflichtartefakts gebunden.

Die Ablage liegt unter `.agdf/control/runs/<id>/presentations/`; sie wird durch einen kleinen unterstützenden Owner im bestehenden control-state-Bereich verwaltet. Schreiben nutzt exklusive Anlage und bestehende Pfad-/Symlink-Prüfprinzipien. Der Beleg ändert die Run-Revision nicht und verleiht keine Freigabe. Die Ausgabe liefert presentation_id und exakt die zugehörige Darstellung. Vor Ausgabe erfolgt eine erneute Zustandsprüfung; spätere Rennen werden beim Approval durch Revisions-/Digestprüfung abgefangen.

Der Agent präsentiert genau diese Darstellung und behält deren Bindung für die nachfolgende Nutzerantwort. Er darf nach Eingang einer Antwort keinen fehlenden Beleg erzeugen und diese alte Antwort daran binden. Ohne bereits zugeordnete Präsentation muss er einen neuen Vorschlag vorlegen und auf eine neue Entscheidung warten.

`run-approve` verlangt zusätzlich `--presentation <id>`. Es prüft Beleg, Run, Gate, Revision, aktuellen Digest und aktuelle Gate-Reife; fehlende, fremde, manipulierte oder überholte Bindung wird zurückgewiesen. Der persistierte Approval-Nachweis referenziert den Beleg und seinen Digest. Nach erfolgreicher Freigabe verhindert die fortgeschrittene Run-Revision ein erneutes Anwenden. Kein separater Verbrauchsmarker mit zweiter Commit-Transaktion erforderlich.

Technische Grenze: Die Runtime prüft eine vorbereitete Bindung, keinen menschlichen Sehvorgang. Auch eine lokale Zeitangabe beweist nicht, wann eine Chatantwort einging. Korrekte Reihenfolge und deliberate Nutzerantwort sind deshalb zusätzlich durch Host-/Agentenvertrag und einen sichtbaren Mehrturn-Test nachzuweisen. Kein manipulationssicherer Beweis gegenüber einem böswilligen Aufrufer mit Schreibzugriff wird behauptet.

### D-06: Kompatibilität und Wiederaufnahme

Bestehende gespeicherte Freigaben werden weder ungültig gemacht noch nachträglich mit Präsentationsbelegen versehen. Für neue run-approve-Aufrufe wird die fehlende Präsentationsbindung jedoch sicher zurückgewiesen; die konkrete Recovery lautet run-present, neue Darstellung zeigen, neue Antwort abwarten. Dies ist eine bewusste Verhaltensänderung, die in CLI-Hilfe, Contracts und Release-Hinweisen sichtbar sein muss.

Optional neue Dispatch-Eingaben verändern keine bisherigen Standardaufrufe. Neue Clients gegen alte Runtime scheitern an unbekannten Feldern und müssen eine passende Version verlangen; keine stille Wiederholung ohne Autoritätsfelder. Neue Runtime, Skills und Host-Schemata werden zusammen ausgeliefert. Das SD legt keine konkrete Versionsnummer fest; die Versionierung folgt dem bestehenden Release-Prozess vor Veröffentlichung.

Unterbrechung nach Run-Erstellung: bekannten Run prüfen und gebunden wiederaufnehmen. Unterbrechung nach Präsentation: nur unveränderte, im Gespräch belegte Bindung verwenden, sonst erneut präsentieren. Unterbrechung nach Approval: gespeicherten Zustand prüfen und interne Restarbeit fortsetzen. Datei-Locks und erwartete Revisionen bleiben maßgeblich; konkurrierende Antworten dürfen höchstens eine Revision erfolgreich ändern.

## 4. Integration Points

MCP-Funktionsschema, CLI-Parser und Argumentvalidierung, Skill-Projektionen und deren Beschreibungen müssen neue Absichten identisch transportieren. Der MCP-Server erhält keine schreibende Präsentationsoperation über den bestehenden lesenden Dispatcher. Schreibende Befehle bleiben ausdrücklich auf der vorhandenen CLI-/Validator-Schiene.

run-present teilt Renderer und Gate-Prüfung mit gate-check. gate-check und --approval-envelope bleiben reine Lese-/Darstellungsfunktionen und sind allein kein gespeicherter Präsentationsbeleg. Neu erzeugte Skill-Anweisungen müssen den expliziten Vorbereitungsschritt vor jeder neuen Nutzerentscheidung verwenden.

## 5. Constraints And Compatibility

Kein fremder Run wird zur Reparatur automatisch verändert. Keine alten Chatantworten oder Freigaben werden übertragen. Kein Patch direkt im Plugin-Cache. Lokale Tests erzeugen getrennte temporäre Kontrollgerüste. Ausgelieferte Artefakte werden über bestehende Generatoren und Installationswege geprüft. Ein Rollback der Software darf bereits aufgezeichnete Freigaben nicht verändern; bei fehlender Bindungsunterstützung werden neue Freigaben bis zur konsistenten Installation ausgesetzt statt über alte Semantik abgewickelt.

## 6. Test And Evidence Strategy

| PRD | Nachweis |
|---|---|
| IC-01/02 | Neuer Auftrag bei null, einem fremden und mehreren Runs; explizite ID-Kollision; unklare Fortsetzung; Fremdrun-Digests unverändert; deutsche/englische Blockadekarten |
| IC-03 | Gepackte lokale Runtime aus frischem temporärem Installationsverzeichnis: ausgegebene run-create/run-step/run-present/run-approve-Befehle tatsächlich ausführbar |
| IC-04 | Gültiger Beleg; fehlender/fremder/veralteter/tamperter Beleg; Artefaktänderung; Revisionsrennen; doppelte Antwort; UAT-Evidenzbindung |
| IC-05/06 | Berechtigte Fortsetzung nach UR, terminales nächstes Nutzer-Gate; keine Freigabe/Blockade bleibt terminal; Statusaufrufe hinterlassen identischen Dateibestand |
| IC-07/08 | Unterbrechungen nach jedem Persistenzschritt; Wiederaufnahme; revise/decline/cancel/empty; keine Doppelanlage oder unzulässige Fortsetzung |
| Gesamtablauf | E2E über installierbares Paket sowie sichtbarer realer Codex-Verlauf mit zeitlich vorher präsentierter Bindung; verbleibende Host-Grenzen separat |

Bestehende relevante Dispatch-, CLI-, Kontrollzustands-, Präsentations- und Pakettests bleiben bestehen; Assertions werden nicht bloß zur Anpassung an den Fix abgeschwächt. TP muss neue negative Autoritätsfälle ausdrücklich zuordnen. Quelltests, Pakettests und Live-Host-Nachweise sind separate Evidenzstufen.

## 7. Risks And Open Questions

- Vorbereitete Präsentation ist kein Beweis tatsächlicher Sichtbarkeit: benannte Vertrauensgrenze und Mehrturn-Nachweis, kein gegenteiliger Sicherheitsclaim.
- Neue obligatorische Belegreferenz bricht alte schreibende Clients bewusst sicher; konsistente Auslieferung und klare Recovery erforderlich.
- Lock-/Pfadprüfungen müssen auch neuen Belegspeicher abdecken; keine unkontrollierte Pfadableitung aus Beleg-IDs.
- Der aktuelle Reparaturlauf verwendet bis zur ausgelieferten Änderung das bestehende Verfahren mit im Chat explizit präsentierter Revision; keine selbst nachträglich erzeugten Belege für schon erteilte Freigaben.
- Keine offenen Produktentscheidungen für TP. Konkrete Testfälle und Patch-Reihenfolge folgen im TP; zusätzliche Autoritäts-/Schemasemantik muss vor Umsetzung zurück ins SD.

## 8. Next Step

SD Fassung 1 prüfen. `Approval: SD` erlaubt den Aufgaben- und Testplan. Keine Implementierungsfreigabe durch dieses Dokument.
