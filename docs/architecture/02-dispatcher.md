# Dispatcher: Architektur und Use Cases

**Stand: 3. Oktober 2026, Repository-Quelle.** Dieses Dokument erklärt den implementierten
Dispatcher. Es belegt weder die Veröffentlichung eines Pakets noch das Verhalten einer geladenen
Host-Sitzung. Der [Architektur-Einstieg](README.md) zeigt den durchgehenden Arbeitsablauf;
die [Bestandsbeschreibung](01-systemarchitektur.md) ordnet den Dispatcher in die Bausteine und
Aufrufwege ein. Dieses Dokument vertieft diesen Teil der bestehenden Architektur.
Weiterentwicklung, Kontrollkatalog und Roadmap stehen im [gemeinsamen Zielbild](03-agentenkontrolle-zielbild.md).

Der Dispatcher verbindet einen konkreten Agentenauftrag mit einem Zielprojekt, dem erforderlichen
Kontrollkontext und dem nächsten begrenzten Arbeitsschritt. Er führt diesen Arbeitsschritt nicht
selbst aus. **Jedes Ergebnis trägt `authorizes: false`.** Eine technische Prüfung, eine
Fortsetzung oder eine Vorschau erzeugt keine menschliche Freigabe.

Die Use-Case-Kennungen unten dienen der Orientierung in dieser Dokumentation. Sie sind keine
Runtime-Kennungen und definieren keine zusätzliche Policy. Maßgeblich bleiben der
[Werkzeugvertrag](../../packages/core/lib/skill-dispatch/contract.js), der
[Dispatch-Service](../../packages/core/lib/skill-dispatch/service.js), die
[Fortsetzungsorchestrierung](../../packages/core/lib/delivery-continuation/service.js) und die
[Runtime-Verträge](../../plugins/agdf/meta/contracts/).

## Zuständigkeiten und Aufrufwege

| Beteiligter | Verantwortung |
|---|---|
| Mensch | Beauftragt Ziel und Umfang und trifft die erforderlichen Gate-Entscheidungen. |
| Coding-Agent | Wendet den Aktivierungsvertrag an, vergleicht den Auftrag mit den referenzierten URs, führt zurückgegebene Schritte aus und zeigt die kanonische Antwort. |
| Skill-Bindung oder MCP-Adapter | Ruft die geprüfte Laufzeit mit dem kanonischen Eingabeschema auf. Der Adapter besitzt keine eigene Run-, Gate- oder Freigabelogik. |
| Dispatcher | Validiert Eingaben, bindet das Ziel, liest die Kontrollauswertung und liefert ein Ergebnis samt `host_action`. Verändert keinen Run-Zustand. |
| Fortsetzungsorchestrierung | Gemeinsamer Anwendungseinstieg für CLI und MCP. Verwendet die validierte Dispatcher-Route, koordiniert bei beauftragter gebundener Fortsetzung höchstens eine belegte Korrektur und ruft danach das Routing mit frischer Auswertung erneut auf. |
| Gate-Evaluator | Bestimmt den aktuellen Kontrollstand, Voraussetzungen und die zulässige nächste Operation aus dem kanonischen Zustand. |
| Benannter Skill | Bearbeitet den gelieferten Auftrag innerhalb seines Vertrags; beispielsweise Brownfield Analysis oder die QA-Entscheidung. |
| Kanonische Writer | Persistieren Run-Zustand, Revisionen, Artefaktbindungen und Präsentationen. Der Agent ruft die Erfassungs- und Freigabeschritte separat auf; die begrenzte Beziehungskorrektur wird innerhalb der gebundenen Fortsetzung durch die Fortsetzungsorchestrierung koordiniert. |

![Dispatcher-Ablauf mit Run-Zuordnung, Gate-Auswertung und begrenzter Fortsetzung](diagrams/03-dispatch.svg)

*Logischer Ablauf; die Fortsetzungszweige gelten nur unter den jeweiligen Eingabe- und
Kontrollbedingungen. [Diagrammquelle](diagrams/03-dispatch.dot).*

Der agentennative Skill-Weg und MCP `agdf_dispatch` erreichen denselben Dispatch-Service.
`agdf_inspect` hat einen eigenen lesenden Vertrag und Service und verwendet die gemeinsamen
Kontrollevaluatoren. Inspect führt keine Delivery-Fortsetzung aus. Installation, MCP-Registrierung
und Repository-Migration gehören zu getrennten Services; sie sind keine Dispatcher-Freigaben.

### Operationsabhängige Inspect-Eingaben

`agdf_inspect` veröffentlicht die bestehenden Auswahlregeln auch als JSON-Schema:
`all_active: true` gilt nur für `doctor` und `delivery-map`; `variant` nur für
`gate-check`; `module` ausschließlich und verpflichtend für `contract`.
`all_active: false` bleibt bei allen Operationen zulässig. Für ein Inventar aller
aktiven Runs wird `doctor` oder `delivery-map` gewählt. Ein `gate-check` wird nicht
automatisch umgedeutet. Schemawidrige Kombinationen erreichen den MCP-Executor
nicht; direkte Core-/CLI-Aufrufe behalten die gemeinsame Auswahlvalidierung.
Diese Grenze belegt keine fehlerfreie Operationswahl eines frisch geladenen Modells.

„Zeige die aktiven AGDF-Runs in diesem Projekt“ wählt nach dem
[Request-Activation-Vertrag](../../plugins/agdf/meta/contracts/request-activation.md)
`control.doctor`: `agdf_inspect` mit `operation: doctor` und `all_active: true`.
Der Bezug „in diesem Projekt“ bindet den verifizierten Repository-Pfad des Chats als
`primary_target` mit `target_source: current_repository`; das Arbeitsverzeichnis allein
bleibt ohne Zielautorität. Diese Inventur wählt keinen Run und fragt keine Freigabe an.

Doctor ergänzt im All-active-Bericht `inventory.state` (`complete`, `absent` oder
`incomplete`) und `inventory.active_count`, die Anzahl der sicher erkannten aktiven Runs.
Bei `incomplete` ist diese Anzahl keine Gesamtzahl. Inspect rendert daraus eine lokalisierte
Liste mit Prüfbefunden. Fehlende Siegel blenden Runs nicht aus; fehlender Kontrollbestand,
eine vollständige leere Liste und ein Prüfungsfehler bleiben unterschiedliche Ergebnisse.
Der JSON-Bericht entspricht weiterhin dem CLI-Bericht; die Darstellung erteilt keine Autorität.

## Bindung vor Fortsetzung

### Sichtbarer Skillname und stabile AGDF-ID

Der aus der [Plugin-Definition](../../plugins/agdf/meta/agdf-plugin.definition.json)
berechnete [Namenskatalog](../../packages/core/lib/skill-dispatch/contract.js) ordnet
exakt registrierte Hostnamen demselben kanonischen Skill-Katalogeintrag zu. Die
Produktionsinstanz erhält diese Definition aus ihrem bestehenden Resource Context;
das Modell kann keine Aliasliste oder Präfixregel übergeben.

| Oberfläche | Gültige Beispiele | Interne ID |
|---|---|---|
| Codex / Claude Code | `gate-check`, `agdf:gate-check` | `gate-check` |
| Copilot | `gate-check`, `agdf-gate-check` | `gate-check` |
| OpenCode lokal / global | `gate-check`, `agdf-gate-check`, `agdf-global-gate-check` | `gate-check` |

Die Beispiele werden für alle registrierten Skills aus ihren Slugs, der Plugin-ID
und den vorhandenen Hostpräfixen abgeleitet. Die aufrufende Oberfläche bestimmt die
erlaubten Formen; MCP bindet sie über den vertrauenswürdigen Runtime-Kontext.
Unbekannte Namen, fremde Formen und Alias-/ID-Kollisionen scheitern vor Ziel- oder
Kontrollevaluierung. Es gibt keine heuristische Präfixentfernung. Die Recovery nennt
gültige Eingaben aus dem aktiven Katalog, sofern dieser eindeutig ist.

Ergebnisse, Fortsetzungen, `skill_id`, CLI `--skill` und technische Contractreferenzen
tragen ausschließlich die stabile kanonische ID. Hostgeneratoren und globale Adapter
verwenden dieselbe Ableitung für Frontmatter und explizite sichtbare Aufrufreferenzen;
sie benennen keine bloßen ID-Erwähnungen oder Pfadsubstrings pauschal um.
Eine Namensauflösung ersetzt keine Ziel-, Run- oder Freigabebindung.

Die Tests belegen Quellcode-, Protokoll- und Paketverhalten. Installation und eine
frisch geladene Host-/Modellsitzung sind davon getrennte Nachweise.

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

`ur_action: revise` (CLI `--ur-action revise`) bezeichnet explizite Änderungsabsicht für einen
unfreigegebenen Entwurf. Es verlangt `gate-check`, Resume-Intake, Run und erwartete Revision.
Der neue Entwurf braucht eine neue Präsentation und Antwort. Genehmigte URs sind geschützt.
Neue Vorlagen kennzeichnen `Requirements clarification: open | complete`; offene Klärung
oder unvollständige Bedarfsfelder verhindern die Präsentation. URs ohne dieses Feld folgen
dem bisherigen Vertrag. Direkter `ur-definition`-Aufruf ohne Run liefert Umfangszuordnung,
auch wenn `AGDF_RUN_ID` gesetzt ist.

`prd-definition` erhält die fachliche PRD-Erstellung über `phase: prd_definition`.
Der Auftrag bindet das unfreigegebene PRD an Ziel, Run, Revision, freigegebene UR,
Brownfield-Quelle und erforderliche bereite UX-Analyse. Die reine Core-Routingfunktion
steht vor dem generischen Urteilsskillpfad; unzulässige Direktaufrufe fallen nicht in einen
Schreibauftrag durch. Offene Produktentscheidungen dürfen fachlich geklärt werden und
bleiben für die Freigabe gesperrt. Bereits bestätigte Antworten und UR-Grenzen bleiben maßgeblich.

`prd_action: revise` (CLI `--prd-action revise`) kennzeichnet ausdrücklich gewünschte
PRD-Entwurfsänderung ausschließlich bei `gate-check` mit Resume-Intake, Run und erwarteter
Revision. Die Option ist nicht mit `ur_action` oder `continue_delivery` kombinierbar.
Eine gewöhnliche Fortsetzung eines fertigen PRD führt zur Präsentation. Direkte Skillauswahl
ersetzt keine Änderungsabsicht; ohne Run liefert sie die vorhandene Umfangszuordnung,
unabhängig von `AGDF_RUN_ID`. Freigegebene PRDs bleiben geschützt.

Die vorhandene typisierte `run-step --step artefact --gate PRD`-Operation registriert
PRD `derived_from` UR. Eine zulässige Entwurfsänderung nutzt `update_draft: true` mit
neuen Mapping-/Eingabebelegen, behält alte Nachweise und benötigt eine neue Präsentation
mit neuer bewusster Antwort. `gate-check` prüft weiterhin Bereitschaft und Freigabe;
SD-Inhalt gehört nun sd-definition; TP und spätere Kontrollschritte behalten ihre Eigentümer.
Quell-, Paket- und Protokolltests sowie kooperative Fachbeobachtung belegen unterschiedliche
Ebenen; sie behaupten keine frische native Installation oder unabhängige Begutachtung.

`sd-definition` erhält nach freigegebenem PRD die fachliche Design-Erstellung über
`phase: sd_definition`. Die Übergabe enthält das bestätigte Ziel, Run, aktuelle Revision,
den kanonischen SD-Pfad sowie exakte freigegebene und erforderliche analytische Quellen.
Der Skill erstellt und klärt den Inhalt; `gate-check` prüft Voraussetzungen und Freigabereife.
Die vorhandene Registrierung erfasst `SD derived_from PRD`; eine neue bewusste
`Approval: SD` erlaubt anschließend den bestehenden Aufgaben- und Testplan.

Neue SD-Entwürfe deklarieren `Design Decisions contract: sd-decisions-v1` und führen genau
eine `Design Decisions`-Tabelle im selben Artefakt. Wesentliche `before_sd`-Entscheidungen
brauchen bestätigte Auflösung und benannten Verantwortlichen. Offene oder fehlerhafte Einträge
sperren Präsentation und Freigabe (`AGDF_SD_DECISIONS_OPEN`). `later_tp` darf nur konkrete
Ausführungs-/Test-/Nachweisdetails verschieben; Produktkonflikte gehören zur bestehenden
UR-/PRD-Revision. Altbestände ohne Deklaration und Tabelle behalten ihre bisherigen Prüfungen.
Deklarierte Vollständigkeit beweist keine ungenannten Designfragen; die fachliche Ableitung
bleibt Gegenstand des Reviews.

`sd_action: revise` (CLI `--sd-action revise`) verlangt einen tatsächlichen Änderungsauftrag
und revisionsgebundenes `gate-check`-Resume-Intake. Die Aktion ist exklusiv gegenüber
UR-/PRD-Aktionen und `continue_delivery`. Normale Fortsetzung eines fertigen Entwurfs
präsentiert dessen aktuelle Fassung. Der gemeinsame Writer erhält Beleggeschichte und
freigegebene Quellen; eine geänderte Fassung braucht eine neue Freigabepräsentation.

Die Ausgabefelder haben unterschiedliche Aufgaben:

| Feld | Bedeutung |
|---|---|
| `outcome`, `terminal` | Ergebnistyp und ob dieser Aufruf endet. |
| `control.gate_route` | Abgeleitete Route für das aktuelle Gate; keine Freigabe des nachfolgenden Gates. |
| `control.next_operation` | Vom Evaluator bestimmte nächste Operation, etwa `prepare_gate_artifact`. |
| `control.missing_approval` | Noch ausstehende menschliche Freigabe. |
| `continuation.phase` | Anlass der begrenzten Fortsetzung; kein zusätzlicher Ergebnistyp. |
| `host_action` | Verbindliche Behandlung des Ergebnisses durch den Aufrufer. |

## Schrittklassen

Ein Run besteht aus drei Arten von Schritten. Sie unterscheiden sich darin, wer entscheidet.

| Art | Schritte | Wer entscheidet |
|---|---|---|
| **Gate mit Freigabe** | UR, PRD, SD, TP, QA, UAT | Nur der Mensch. |
| **Pflichtschritt** | Brownfield Review mit Mode/Slice Decision, Brownfield Analysis, CD+Tests, Task Plan Review, Clean Implementation Review, Code Review, OR | Der Agent. Er führt den Schritt aus und hält das Ergebnis fest. |
| **Bedingter Schritt** | UX Intent Definition | Der Agent, aber nur wenn die Bedingung zutrifft. |

![Ablauf von UR bis OR mit den drei Schrittarten und den kurzen Wegen Quick Task und Verified Change](diagrams/07-gate-steps.svg)

*Die Mode/Slice Decision wählt den Weg. Nur der strukturierte Weg führt durch PRD, SD, TP,
Brownfield Analysis, die Reviews, QA und UAT. Quick Task und Verified Change enden mit einem kurzen
Abschluss. Verified Change kann in den strukturierten Weg wechseln.
[Diagrammquelle](diagrams/07-gate-steps.dot).*

Die fachliche Beschreibung jedes Schritts steht in [02 - Gates](../02-gates.md). Dort heißen UR,
PRD, SD und TP auch G-00 bis G-03.

**Gate mit Freigabe.** Der Agent bereitet die Entscheidung vor und zeigt sie mit `run-present` an.
`run-present` speichert die vorbereitete Bindung; die Vorschau des Evaluators ist dagegen lesend.
Danach wartet der Agent auf eine neue Antwort des Menschen. Erst diese Antwort gibt das Gate frei. Der
Skill `qa-gate` bewertet die Qualität mit `pass`, `revise` oder `block`. Die Freigabe `Approval: QA`
erteilt trotzdem der Mensch. Im Dispatcher: UC-D10, UC-D11 und UC-D13.

**Pflichtschritt.** Der Agent muss den Schritt ausführen. Er gibt damit nichts frei und erhält
keine Erlaubnis zur Umsetzung. Danach prüft der Dispatcher den Run erneut. Wann ein Pflichtschritt
dran ist:

- Brownfield Review: immer nach der Freigabe des UR.
- Brownfield Analysis: nach der Freigabe des TP. Ist sie bestanden, darf die Umsetzung beginnen
  (in 02 - Gates: G-04 Implementation Entry).
- CD+Tests, danach Task Plan Review, Clean Implementation Review und Code Review: vor QA.
- OR: nach der Freigabe der UAT.

Im Dispatcher: UC-D09, UC-D12 und UC-D14.

**Bedingter Schritt.** Der Brownfield Review bewertet, wie stark der Auftrag die Bedienung betrifft
(`ui_ux_impact`):

- `medium` oder `high`: Die UX Intent Definition ist Pflicht, bevor das PRD als fertig gelten darf.
- `low`: Sie ist nur Pflicht, wenn für das PRD noch unklar ist, wie sich die Bedienung verhalten soll.
- `none`: Der Schritt entfällt.

Die UX Intent Definition endet mit `ready`, `blocked` oder `not_applicable`. Sie gibt nichts frei.
Bei `blocked` darf das PRD nicht als fertig gelten. Der Dispatcher hat für diesen Schritt keinen
eigenen Fall.

Welche Schritte zu welcher Art gehören, steht im Code: `userGateOrder`, `internalStepArtefacts` und
`closeoutArtefacts` in [`run-state.js`](../../packages/core/lib/control-evaluation/run-state.js).
Die Regeln, wann ein Schritt nötig ist, stehen im
[Gate-Übergangsvertrag](../../plugins/agdf/meta/contracts/gate-transition.md).

## Bekannte Grenzen: Wo der Agent sich selbst kontrolliert

Die folgenden Grenzen erklären das aktuelle Routing. Sie werden im
[Kontrollkatalog](03-agentenkontrolle-zielbild.md#4-kontrollkatalog-und-bindung-konkreter-aktionen)
als C-05 bis C-09 aufgegriffen. Lösungsmechanismen und Abhängigkeiten stehen dort und in der
[gemeinsamen Roadmap](03-agentenkontrolle-zielbild.md#10-abgleich-der-umfänge-und-umsetzungsroadmap).

| Grenze im bestehenden Ablauf | Maßgebliche Quelle | Verbindung zum Zielbild |
|---|---|---|
| Der Agent trifft die Mode/Slice Decision. Der Evaluator verarbeitet die gespeicherte Quick-Task-Entscheidung; Verified Change hat zusätzliche Eignungsprüfungen. | [Gate-Übergang](../../plugins/agdf/meta/contracts/gate-transition.md), [Gate-Policy](../../packages/core/lib/control-evaluation/gate-policy.js), [Verified Change](../../packages/core/lib/control-evaluation/verified-change.js) | C-07: Grundlagen eines leichteren Ablaufs prüfen; R-01 |
| Reviews können vom umsetzenden Agenten stammen. Ein aufgezeichnetes Reviewergebnis allein belegt keine unabhängige Prüfung. | [Qualitätsvertrag](../../plugins/agdf/meta/contracts/quality.md) | C-08/C-09: tatsächliche Ergebnisse und Unabhängigkeit belegen; R-03 |
| Die bedingte UX Intent Definition und die Bewertung der Architecture Impact verlangen fachliche Einordnung durch den Agenten; universelle technische Durchsetzung ist nicht nachgewiesen. | [Brownfield-Vertrag](../../plugins/agdf/skills/brownfield-analysis/SKILL.md), [UX-Solution-Design](../../.agdf/control/artefacts/prd-ux-intent-requirements/SD.md), [dokumentiertes Risiko](../../.agdf/control/artefacts/prd-ux-intent-requirements/OR.md) | C-07: bedingte Anforderungen prüfen; R-01 |
| Direkte Werkzeuge des Hosts können außerhalb des Dispatcher-Pfads wirken. | [Bestandsbeschreibung der Durchsetzungsgrenzen](01-systemarchitektur.md#5-regel-prüfung-und-durchsetzung) | C-05: tatsächliche Aktionswege kontrollieren; R-02 |

Die QA-Bewertung verlangt vollständige Anforderungen und behandelte Befunde. Daraus folgt keine
universelle technische Erkennung einer ausgelassenen Prüfung. Ebenso bietet ein Reviewer mit neuem
Kontext eine zusätzliche Perspektive, aber allein noch keine unabhängige Vertrauensgrenze. Diese
Unterscheidungen erläutert die [Ergebnisprüfung im Zielbild](03-agentenkontrolle-zielbild.md#6-prüfung-der-tatsächlichen-arbeit-und-unabhängigkeit).

## Use-Case-Katalog

Die Tabelle beschreibt den jeweiligen Einstieg und das erwartete Verhalten. Zurückgegebene
Schreibschritte führt der Agent **nach** dem Dispatch über die zuständigen Writer aus. UC-D17
beschreibt die eng begrenzte Beziehungskorrektur **vor** der Ausgabe; sie ist kein eigener Ergebnistyp.

| Fall | Auslöser und Bindung | Dispatcher-Ergebnis | Nächster Akteur und Grenze |
|---|---|---|---|
| **UC-D01 · Normale Hilfe / Opt-out** | Erklärung, Diagnose oder ausdrücklicher Verzicht auf AGDF ohne anderslautenden Auftrag. | Kein anfragebedingter Dispatch; Aktivierung wird davor entschieden. | Agent bearbeitet die Anfrage. Plugin-Entdeckung, Arbeitsverzeichnis und frühere Runs aktivieren keinen Delivery-Auftrag. |
| **UC-D02 · Kontrollstatus** | Explizite Kontrollabfrage mit belegtem Ziel, ohne Delivery-Fortsetzung. | `control_result`, terminal; bei unklarer Run-Auswahl kanonische Auswahl-/Statusdarstellung. | Agent zeigt den Text unverändert und beendet den Aufruf. Ein lesender Gate-Vorschautext ist keine gebundene Freigabefrage. |
| **UC-D03 · Ziel offen** | Gültige Eingabe, aber keine belastbare Zielbindung. | `target_unresolved`, terminal; keine Run- oder Gate-Auswertung. | Agent zeigt die kanonische Zielorientierung und stoppt. |
| **UC-D04 · Auftrag zuordnen** | Positiver Intake ohne bestätigten Run. | `intake_continuation`, Phase `resolve_delivery_run`; kanonische Kandidaten mit UR-Referenzen und Revisionen, noch kein einzelnes Gate-Ergebnis. | Agent liest die vollständigen referenzierten URs und vergleicht den Umfang. Anzahl und Aktualität der Runs sowie `AGDF_RUN_ID` ersetzen diesen Vergleich nicht. |
| **UC-D05 · Bestehenden Umfang fortsetzen** | Der Auftrag passt eindeutig in einen bestehenden UR. | Nach Resume mit Run-ID und `expected_revision_id`: aktuelle Gate-Auswertung oder passende Fortsetzung. | Agent arbeitet nur im gebundenen Umfang; frühere Freigaben werden nicht auf einen neuen Umfang übertragen. |
| **UC-D06 · Neuen Umfang beginnen** | Eigenständiger Auftrag; kein passender aktiver Umfang. Agent liefert eine neue, unbenutzte Run-ID mit Intake-Modus `new`. | `intake_continuation`, Phase `run_missing`; nach Erstellung und Resume gegebenenfalls `ur_definition`. | Agent ruft `run-create` auf; `ur-definition` entwirft den UR und erfasst ihn mit `run-step`. Jede erneute Bindung verwendet die vom Writer zurückgegebene Revision. |
| **UC-D07 · Fachlich mehrdeutig** | Mehrere plausible UR-Umfänge oder unklare Abgrenzung. | Die Zuordnungsfortsetzung liefert Belege, keine semantisch ausgewählte Run-ID. | Agent stellt eine gezielte fachliche Frage. Der Dispatcher entscheidet die Umfangsübereinstimmung nicht. |
| **UC-D08 · Zuordnung veraltet / Bestand ungültig** | Intake-Revision geändert oder Run-Bestand unvollständig bzw. Integrität verletzt. | Veraltete Revision: frische `resolve_delivery_run`-Fortsetzung. Ungültiger Bestand: terminaler Kontrollbefund oder technische Recovery. | Agent vergleicht bei neuer Revision erneut. Fehlerhafte Bestände gelten nicht als leere Kandidatenliste und erlauben keinen Ersatz-Run. |
| **UC-D09 · Interne Brownfield-Schritte** | Intake oder Fortsetzung am Brownfield Review / Mode-Slice Decision; später strukturierter Pfad an Brownfield Analysis nach erfülltem TP. | `skill_continuation`, Phase `post_ur_review` bzw. `pre_implementation_analysis`, Skill `brownfield-analysis`. | Agent führt den benannten Skill aus und persistiert Review/Analyse und interne Schritte. Danach erneute Prüfung desselben Runs; unveränderter blockierter Zustand beendet die Fortsetzung. |
| **UC-D10 · Aktuelles Gate-Artefakt fehlt** | Gebundene Fortsetzung; Evaluator liefert `next_operation.type: prepare_gate_artifact`. | `skill_continuation`, Phase `required_gate_artifact`, mit Gate, Ausgabe- und Quellpfaden. | Agent erstellt das aktuelle Artefakt gemäß Vertrag, erfasst PRD/SD/TP/QA samt geprüftem Quellbezug atomar und prüft danach erneut. Die Vorbereitung erlaubt weder ein späteres Artefakt noch eine vorgezogene Freigabefrage. |
| **UC-D11 · Menschliche Entscheidung vorbereiten** | Intake oder Fortsetzung; aktuelle Gate-Auswertung liefert eine gültige Approval-Präsentation. | `intake_continuation`, Phase `presentation_required`, lesende Vorschau und gebundener `run-present`-Schritt. | Agent ruft `run-present` auf, zeigt dessen Text unverändert und wartet auf eine **neue** bewusste Antwort. Der Dispatcher bindet oder persistiert keine Freigabe. |
| **UC-D12 · Benannten Skill ausführen** | Direkter Urteilsskill oder zulässige nächste Skill-Route bei gebundener Fortsetzung. | `skill_continuation` mit Skill, Ziel, Sprache und erforderlichem Kontroll-Snapshot. | Agent führt genau diesen Skill aus. Für unaufgelöste QA-Auswahl liefert der Evaluator die vollständige Kandidatenliste; der QA-Skill filtert nach QA und sucht nicht erneut in Run-Dateien. |
| **UC-D13 · QA-Nacharbeit / Blocker** | QA verlangt Nacharbeit, ist blockiert oder Voraussetzungen fehlen. | Aktuelle Kontroll-/Skill-Route gemäß Zustand; keine automatische Fortsetzung in spätere Gates. | Agent folgt dem konkreten Befund. Der Dispatcher trifft keine eigene QA-Entscheidung und wandelt `revise` nicht in `pass` um. |
| **UC-D14 · OR nach UAT** | Gebundene strukturierte Fortsetzung an OR, UAT erfüllt, keine offene Freigabe, OR noch nicht abgeschlossen. | `skill_continuation`, Phase `post_uat_closeout`, Skill `release-or`. | Agent erstellt und persistiert den Orchestration Report und prüft erneut. Commit, Push, PR oder Release werden dadurch nicht beauftragt. |
| **UC-D15 · Eingabe / Laufzeitfehler** | Ungültige Argumente, fehlender Vertrag oder technische Auswertung fehlgeschlagen. | `invalid_input` bzw. `evaluator_error`, terminal mit stabiler Recovery. | Agent zeigt die Recovery unverändert und stoppt. Kein alternativer Laufzeitpfad, keine Konfigurationsreparatur und keine Zustandsänderung allein aus diesem Ergebnis. |
| **UC-D16 · Erlaubte Umsetzung fortsetzen** | Gebundenes `continue_delivery`, strukturierter Pfad an offenem `CD+Tests`, TP erfüllt, keine fehlende Freigabe und kanonische Umsetzungs-/Testaktion. | `skill_continuation`, Phase `implementation`, mit Ziel, Run, aktueller Revision und Runtime-Verträgen. | Agent setzt nur den genehmigten TP-Umfang um, führt Tests und Evidenzpflege aus und prüft nach aufgezeichneten Kontrolländerungen erneut. Routinearbeit braucht keine zusätzliche Statuskarte; Entscheidungen und Blocker bleiben sichtbar. |
| **UC-D17 · Eine fehlende Beziehung korrigieren** | Beauftragte gebundene Fortsetzung; genau eine fehlende Beziehung als entscheidender Befund, unveränderter versiegelter Zuordnungsbeleg und keine unabhängigen Blocker. | Die Fortsetzungsorchestrierung koordiniert höchstens einen Korrekturversuch über den Core-Dienst vor Ausgabe; bei Erfolg neue Revision, Audit und frisches Routing. Das Ergebnis folgt der danach gültigen Route und enthält `relationship_correction`. | Agent nennt die belegte Korrektur im nächsten knappen Ergebnis. Fehlender oder unklarer Beleg bleibt ein konkreter Blocker. Keine Freigabe, Umfangsänderung oder allgemeine Reparatur wird daraus abgeleitet. |

## Drei typische Abläufe

**Neuer Auftrag:** Der erste Intake liefert `resolve_delivery_run`. Nach dem Vergleich mit den
referenzierten URs wählt der Agent bei eigenständigem Umfang eine unbenutzte Run-ID. Der nächste
Intake im Modus `new` liefert `run_missing`. Der Agent erstellt den Run und setzt mit dessen
Revision im Modus `resume` fort. `ur_definition` delegiert den gebundenen Entwurf an `ur-definition`. Der Skill
klärt materielle Lücken und erfasst den unfreigegebenen UR über die bestehenden Writer. Erst die erneute Prüfung dieses Zustands kann `presentation_required` liefern. Auf
`run-present`, Anzeige und die neue menschliche Antwort folgt ein gesonderter Freigabevorgang.

**Bestehender Auftrag:** Der Agent liest die referenzierte vollständige UR-Fassung und bindet
den passenden Run mit ihrer aktuellen Revision. Hat sich die Revision geändert, folgt erneut der
Umfangsvergleich. Ein jüngerer Run oder ein ähnlicher Titel überspringt diesen Schritt nicht.

**Nächstes Gate vorbereiten:** `gate-check` mit `continue_delivery` prüft den gebundenen Run.
Wenn der Evaluator beispielsweise das aktuelle PRD zur Vorbereitung benennt, erstellt der Agent
dieses Artefakt aus den gelieferten Quellpfaden. Eine erneute Prüfung entscheidet, ob weitere Arbeit
oder `presentation_required` folgt. Die menschliche Freigabe bleibt ein eigener Schritt.

### Routinearbeit und sichtbare Ereignisse

UC-D16 hält bereits erlaubte Umsetzung im laufenden Arbeitsablauf. Die Zahl der Karten bestimmt
nicht, welche Kontrollen stattfinden: Ziel-/Run-Bindung, Tests und Evidenzpflege bleiben Pflicht.
Der Agent zeigt kurze Fortschrittsmeldungen und ein überprüfbares Ergebnis. Entscheidungen,
konkrete Blocker, relevante Risiken oder Unsicherheit, Änderungen an Ziel, Run, Umfang oder
Berechtigung sowie wesentliche Ergebnisse werden vor davon abhängiger Arbeit sichtbar.

Eine ausdrückliche Statusabfrage verwendet den lesenden Pfad ohne `continue_delivery` und liefert
frischen vollständigen Status. Nach einer Unterbrechung wird die Bindung erneut geprüft;
unveränderte Wiederaufnahme benötigt keine doppelte Karte. Geänderte Voraussetzungen müssen
sichtbar werden. Es gibt keinen dauerhaften Karten-Cache und keinen zweiten Renderer. Owner
dieser Regel bleibt der [Interaktionsvertrag](../../plugins/agdf/meta/contracts/interaction.md).

### Artefakterfassung und begrenzte Beziehungskorrektur

Das [gemeinsame Beziehungsregister](../../packages/core/lib/control-evaluation/delivery-relationships.js)
wird von Kontrollauswertung, Belegprüfung und Erfassung verwendet. Es enthält URs bestehende
Freigabebeziehung, die Quellbezüge PRD → UR, SD → PRD und TP → SD sowie
`QA_REPORT tests TP`. Der QA-Bericht steht dabei im Artefaktfeld `QA`, seine logische
Beziehungskennung ist `QA_REPORT`. URs Freigabebeziehung entsteht erst durch die bewusste
Freigabe; `not_applicable`-Ausnahmen bleiben erhalten.

Für ein erfasstes, ansonsten geeignetes aktuelles Artefakt wird die erforderliche Beziehung
bereits vor Präsentation und Freigabe geprüft. Ein noch fehlendes Artefakt bleibt entwerfbar.
Eine fehlende Beziehung zu einem vorhandenen Artefakt ist kein Auftrag, dieses erneut zu entwerfen.

Der Agent erfasst PRD, SD, TP oder einen bereits bewerteten QA-Bericht über die bestehende Operation:

```text
run-step --dir <target> --run <run_id> --revision <revision_id>
         --step artefact --gate <PRD|SD|TP|QA> --evidence <recording-input.json>
```

Die [Erfassung im Core](../../packages/core/lib/control-state/run-artefact-recording.js) prüft
das strikte Eingabeschema, Ziel/Run/Revision, kanonische enthaltene Dateipfade, vollständige
Quell-/Ziel-Digests, genaue Quellfreigaben und eine separate geprüfte Zuordnung. Sie veröffentlicht
Artefaktzeiger, `Artefact Bindings`-Beleg, Beziehung und Audit in einer versiegelten Run-Revision.
Die bestehenden Run-/Backlog-Locks und das Transaktionsjournal bleiben zuständig. Der Writer
erzeugt den Beleg; vorhandene Belege und explizite Entwurfsersetzungen behalten ihre Historie.
Die Operation setzt keine Freigabe und trifft keine QA-Entscheidung. Eingabe- und Belegdetails
stehen ausschließlich im [Artefaktvorbereitungsvertrag](../../plugins/agdf/meta/contracts/gate-artifact-preparation.md).

UC-D17 wird von der [Fortsetzungsorchestrierung](../../packages/core/lib/delivery-continuation/service.js)
am [gemeinsamen Core-Einstieg](../../packages/core/lib/index.js) koordiniert. Der Dispatcher
bleibt auch mit `continue_delivery` lesend. Die Orchestrierung verwendet nur eine erfolgreich
validierte Route mit gebundenem Ziel, Run und Revision; ungültige Eingaben, offene Ziele,
veraltete Intake-Zuordnungen, Status und Urteilsskills können keine Korrektur auslösen.
Ein internes Routing-Ergebnis wird erst nach Abschluss dieses Anwendungsschritts ausgegeben.
Ablehnung beendet den einzigen Versuch; es gibt keine Reparaturschleife.

Der [Core-Korrektureigentümer](../../packages/core/lib/control-state/run-relationship-correction.js)
prüft unter dem Run-Lock Revision, Siegel, genau einen aktiven bereits versiegelten
Zuordnungsbeleg, unveränderte Artefakt-/Belegbytes und vollständige Freigabeintegrität erneut.
Er ergänzt nur die fehlende Beziehung und das Audit mit alter/neuer Revision; der bestehende
zulässige Arbeitsumfang bleibt gleich. Anschließend ruft die Orchestrierung das lesende Routing für dasselbe Ziel und denselben Run
mit frischer Kontrollauswertung genau einmal erneut auf. Die Korrekturmetadaten werden an
das Ergebnis dieser Auswertung gebunden.
Der Beleg ist eine kooperative lokale Prüfaussage, kein unabhängiger Nachweis einer menschlichen
Prüfung oder der fachlichen Ableitung.

Status, `doctor`, Gate-Auswertung, Delivery Map, `agdf_inspect` und `run-present` korrigieren nichts.
Legacy-Zeilen bleiben gültig, begründen aber ohne strikten Beleg keine automatische Korrektur.
Veraltete oder fremde Bindungen, widersprüchliche Zeilen, mehrere fehlende Beziehungen,
Beleg-/Artefaktdrift, ungültige Siegel, offene Transaktionen und unabhängige Blocker bleiben
ausgeschlossen. Bereits ausgegebener terminaler Text wird nicht nachträglich abgefangen.

Fehler vor dem Commit lassen den alten akzeptierten Zustand bestehen. Nach dem Commit bleibt
die veröffentlichte Revision maßgeblich: Die Erfassung nutzt das bestehende Journal zur Recovery;
die Korrektur bestätigt dieselbe Revision über den bestehenden Persistenzpfad. Scheitert diese
Bestätigung, meldet sie `correction_commit_unconfirmed` samt bereits veröffentlichter Revision,
und der Anwendungseinstieg stoppt mit `evaluator_error`. Es gibt keinen stillen zweiten Schreibversuch.

## Späte Quellenrevision

Die begrenzte Revision nach freigegebenem TP gehört dem bestehenden Core-Lifecycle-Owner
`run-revision.js`. Ein gültiger aktiver strukturierter Run an `CD+Tests` kann über den lokalen
CLI-Auftrag `run-revise --preview` und ausdrücklich gebundenes `--apply` zu UR, PRD, SD oder
TP zurückkehren. Nur exakte unveränderte vorgelagerte Freigaben bleiben wirksam. Alte Quellen,
Präsentationen und Zuordnungsbelege werden vor dem Run-Commit als genaue Bytes archiviert.
Die versiegelte Run-Sektion `Source Revisions` hält die unveränderlichen Revisionsbelege;
die Archive sind historische Nachweise und kein weiterer Workflow oder Akzeptanzkatalog.

Dispatcher und bestehende MCP-Inspektion sehen dieselben aktuellen Freigaben, fehlenden
Voraussetzungen und Historienreferenzen. Historische Zuordnungen können keine fehlende aktuelle
Beziehung reparieren. Analysebedarf geht vor abhängigen Entwürfen an bestehende Brownfield-
oder UX-Verantwortliche. Ein erneuter TP benötigt neue Vorbereitung und aktuelle Test-/Review-
Nachweise. Es entstehen weder neue User-Gates noch MCP-Schreibargumente. Die genaue CLI-
Vorschlagsstruktur und die explizite Inspektion/Recovery beschreibt
[die CLI-Dokumentation](../../packages/cli/README.md#late-source-revision).

Der bestehende Run/Backlog-Transaktionspfad besitzt dafür eine streng gebundene Version 2.
Archivierung erfolgt vor dem atomaren Run-Commit. Unterbrechungen bleiben geschlossen, bis
explizite Recovery den alten Zustand oder genau einen Commit nachweist; normale Inspektion
repariert nichts. Ein identischer Vorgang kann sein historisches Ergebnis ohne neuen Commit
zurückgeben und unterscheidet dieses von der inzwischen aktuellen Revision.

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
Auch `implementation` und die Korrekturmetadaten erweitern nur vorhandene Ergebnisse;
sie führen keinen weiteren Ergebnistyp, kein Gate und keine Freigabeautorität ein.

## Quellen und Verifikation

| Thema | Maßgebliche Implementierung / Vertrag | Bestehender Test-Einstieg |
|---|---|---|
| Eingabe, Ergebnisse, Host-Aktion und Routing | [Vertrag](../../packages/core/lib/skill-dispatch/contract.js), [Service](../../packages/core/lib/skill-dispatch/service.js) | [Dispatch-Tests](../../packages/cli/scripts/skill-dispatch-test.js), [Funktionsvertrag](../../packages/cli/scripts/skill-dispatch-function-contract-test.js) |
| Aktivierung und Interaktion | [Request Activation](../../plugins/agdf/meta/contracts/request-activation.md), [Interaktion](../../plugins/agdf/meta/contracts/interaction.md) | [Dispatch-Tests](../../packages/cli/scripts/skill-dispatch-test.js) für Runtime-Verhalten; die anfragebezogene Aktivierung durch den Agenten braucht eigene Host-Evidenz. |
| Run-Zuordnung und Intake | [Zuordnung](../../packages/core/lib/skill-dispatch/delivery-run-assignment.js), [Intake](../../packages/core/lib/skill-dispatch/delivery-intake.js) | [Zuordnungs-Tests](../../packages/cli/scripts/delivery-run-assignment-test.js) |
| Schrittklassen und Regeln für bedingte Schritte | [Run-Zustand](../../packages/core/lib/control-evaluation/run-state.js), [Gate-Übergang](../../plugins/agdf/meta/contracts/gate-transition.md) | Bedingte Schritte, Wegwahl und Reviews: keine Prüfung durch Software, siehe [bekannte Grenzen](#bekannte-grenzen-wo-der-agent-sich-selbst-kontrolliert) |
| Gate-Routing und Artefaktvorbereitung | [Gate-Evaluator](../../packages/core/lib/control-evaluation/gate-check.js), [Vorbereitungsvertrag](../../plugins/agdf/meta/contracts/gate-artifact-preparation.md), [Gate-Übergang](../../plugins/agdf/meta/contracts/gate-transition.md) | [Dispatch-Tests](../../packages/cli/scripts/skill-dispatch-test.js) |
| Umsetzungsfortsetzung, Quellbindungen und Korrektur | [Fortsetzungsorchestrierung](../../packages/core/lib/delivery-continuation/service.js), [Beziehungsregister](../../packages/core/lib/control-evaluation/delivery-relationships.js), [Erfassung](../../packages/core/lib/control-state/run-artefact-recording.js), [Korrektur](../../packages/core/lib/control-state/run-relationship-correction.js), [Interaktion](../../plugins/agdf/meta/contracts/interaction.md) | [Integrierte Erfassungs-/Korrekturtests](../../packages/core/test/artefact-recording-test.js), eingebunden in [Core-Kontrolltests](../../packages/core/test/control-state-test.js) |
| Präsentationsbindung und Freigabeprüfung | [Präsentations-Writer](../../packages/core/lib/control-state/run-presentation.js), [Approval-Validator](../../packages/core/lib/control-state/gate-approval-validator.js) | [Dispatch-Tests](../../packages/cli/scripts/skill-dispatch-test.js) für die Übergabe an den Writer |
| MCP-Projektion | [MCP-Laufzeit](../../packages/cli/lib/mcp-dispatch-runtime.js), [Server](../../packages/mcp-server/src/server.js) | [Protokoll](../../packages/mcp-server/test/protocol.test.js), [Fortsetzungen](../../packages/mcp-server/test/continuation.test.js) |

Quellcode und lokale Tests belegen Vertrags- und Routingverhalten. Ob ein bestimmter Host die
Bindung lädt, den richtigen Aufruf ausführt, eine Fortsetzung beachtet und den Text unverändert
anzeigt, benötigt zusätzlich einen frischen Host-Test. Der Katalog ist keine Behauptung, dass jeder
Fall bereits in jeder Host-/Modellkombination beobachtet wurde.

Für die Zwischenkartenreduktion sind Quellvergleich, gerenderte Locale-Fälle und tatsächliche
Codex-Beobachtung getrennte Nachweise. Der [Hostnachweis des zugehörigen Runs](../../.agdf/control/artefacts/agdf-intermediate-status-card-reduction-20261002-01/HOST_EVIDENCE.md)
weist den noch fehlenden tatsächlichen Vorher-/Nachher-Ablauf ausdrücklich aus. Aus dem
Quellstand folgt weder eine aktualisierte Installation noch ein QA-Pass.

Bei Änderungen an Ergebnisfeldern, Routing, Phasen oder Writer-Grenzen sind Katalog,
[Übersicht](README.md) und DOT/SVG gemeinsam zu prüfen. Die fachliche Regel bleibt bei ihrem
verlinkten Owner; dieses Dokument erklärt ihre Wirkung.

### Validierte Transportverträge und Zieldiagnosen

Der Dispatcher veröffentlicht die Abhängigkeiten von `intake_mode`, `expected_revision_id` und `continue_delivery` im Eingabeschema. Eine Revision benötigt `intake: true`, `intake_mode: resume` und `run_id`; eine aktive Fortsetzung benötigt `run_id` und schließt Intake aus. Explizites `false` bleibt zulässig. Die katalogbasierte Skill-Auflösung und die Laufzeitprüfung bleiben maßgeblich für die Skill-Berechtigung dieser Optionen.

Inspect-Ausgaben typisieren Bericht, Präsentation, Recovery und Host-Aktion. Präsentationen enthalten Markdown, Recovery enthält einen Handlungstext; terminale Übermittlungsaktionen benötigen Text und verbieten Begleittext. Operationsspezifische Berichtsinhalte bleiben beim jeweiligen Evaluator.

Die Zielauflösung meldet ungültige Arbeitsordner, relative Zielpfade, Ziele außerhalb eines verifizierten Repositorys, ersetzte Fortsetzungsziele sowie falsche Wurzel- und Kontextbindungen separat. Jede Diagnose besitzt eine deutsche und englische Rückmeldung. Der bisherige Grund `target_content_mismatch` bleibt für ältere Ergebnisse darstellbar. Keine Diagnose leitet ein Ziel aus dem Arbeitsordner ab oder erteilt eine Freigabe.

### Inspect-Ergebnis und Stop-Semantik

Ein erfolgreiches `inspect_result` hat `terminal: false` und `consume_report_and_continue`: Der Host verarbeitet den Bericht und kann die Antwort formulieren. Zielklärungen und Fehler haben `terminal: true` und eine passende Übermittlungsaktion; deren Text wird unverändert ausgegeben, anschließend endet die Antwort.

Das Ausgabeschema bindet Erfolg an einen Bericht, eine bekannte Operation und ein Ziel ohne Recovery. Zielklärungen benötigen eine Präsentation, Fehler eine Recovery. Host-Modus, Quelle, Begleittext und Stop-Flag müssen zur Ergebnisart passen. Die Textgleichheit zwischen Host-Aktion und ihrer Quelle erzeugt der gemeinsame Laufzeit-Owner; JSON Schema prüft die Struktur, nicht die Gleichheit zweier dynamischer Texte.
