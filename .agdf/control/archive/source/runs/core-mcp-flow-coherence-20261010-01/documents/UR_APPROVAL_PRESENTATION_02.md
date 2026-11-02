## Nutzeranforderungen prüfen und entscheiden
Ausgewählter Run: UR: Consistent Core and MCP flow from artefact recording to closeout · `core-mcp-flow-coherence-20261010-01`
AGDF-Statuskarte: Bereit für deine Entscheidung
Aktuelles Gate: Nutzeranforderungen (`UR`)
Erforderliche Entscheidung: Freigabe der Nutzeranforderungen
Nächster Schritt: Prüfe das verlinkte Artefakt und wähle unten eine Option.

## AGDF-Statuskarte

| Statusfeld | Wert |
|---|---|
| Ausgewählter Run | UR: Consistent Core and MCP flow from artefact recording to closeout · `core-mcp-flow-coherence-20261010-01` |
| Pfad | ● UR |
| Status | offen |
| Aktuelles Gate | Nutzeranforderungen (`UR`) |
| Deine Entscheidung | Approval: UR · Überarbeiten · Ablehnen |
| Der Agent darf jetzt | den Nutzerbedarf klären<br>die Nutzeranforderungen formulieren und dauerhaft festhalten<br>Nachweise erfassen<br>die exakte UR-Freigabe anfordern |
| Aktuell verboten | Artefakte späterer Gates außerhalb des aktuell erlaubten Gates erstellen<br>die Brownfield-Analyse als Implementierungsvorbereitung durchführen<br>Code implementieren<br>QA- oder Veröffentlichungsbereitschaft behaupten |
| Wartet auf | Approval: UR |

## Kurzfassung · UR

Run: `core-mcp-flow-coherence-20261010-01` · Gate: `UR` · Revision: `f20105c0-a12d-4635-9f08-d81d1d254a33`

- Quellsprache: Englisch · Zusammenfassung in gewählter Sprache
- Problem: Die Kandidatensammlungen zeigen widersprüchliche Folgeschritte nach Freigaben, vermeidbare Suche nach Autorenformaten und Writer-Aufrufen, manuelle strukturierte Abschlüsse sowie unklare aktuelle und historische Nachweise. Einzelne neue MCP-Tools würden diese Ursachen nicht gemeinsam lösen. Die Architektur-/Flow-Bewertung wurde ohne AGDF erstellt und enthält Quellbefunde und historische Beobachtungen; sie ersetzt keine neue Laufzeitprüfung.
- Ziel und Betroffene: Nutzer, Agenten und Reviewer erhalten einen konsistenten Ablauf von Artefakt- und Nachweiserfassung über Darstellung, bewusste Freigabe und erlaubte Revision bis zum Governance-Abschluss. Core, CLI, MCP und Cockpit beschreiben denselben gebundenen aktuellen Zustand und erlaubten nächsten Vorgang. Weniger Suchaufwand soll auch schwächeren Modellen helfen; dieser Nutzen ist noch zu messen.
- Gemeinsamer Umfang: Vollständige Zustandsaufbereitung und maschinenlesbare Fortsetzung im Core; Autoren-/Operationsverträge mit konkreten Fehlerhinweisen; Verbindung vorhandener Writer für Analysen, Artefakte, Reviews, QA, Darstellung, Freigabe und unterstützte Revision. Wiederholung, Konkurrenz und Unterbrechungen werden je Schreibvorgang geklärt. Ein strukturierter Abschluss verbindet OR, Lebenszyklus und Backlog zuverlässig. MCP macht qualifizierte Core-Fähigkeiten zugänglich; die App zeigt deren aktuelle Ergebnisse und Nachweise. Eine begrenzte Entscheidungskarte ergänzt exakte Dokumentansicht, Diskussion und drei bewusste Aktionen; der vorhandene Textweg bleibt gleichwertig. Umsetzung erfolgt in abhängigen Etappen mit gemeinsamem Entwurf und Gesamtprüfung.
- AC-001: Writer, Inspect, Dispatcher, CLI/MCP, Backlog und Cockpit stimmen bei derselben Revision überein, auch nach Quellenrevision und erledigter UX-Analyse. Historische Belege bleiben von der aktuellen Lage unterscheidbar.
- AC-002: Andere gleichbedeutende Anzeigeformulierungen ändern keine technische Fortsetzung. Operationsbedeutung und Voraussetzungen gehören dem Core; veraltete oder unklare Bindungen bleiben abgewiesen oder ausdrücklich ungeklärt.
- AC-003: Definierte gültige UR-/PRD-/SD-/TP-Beispiele bestehen Autorenprüfung und Präsentationsvorbereitung übereinstimmend. Fehler nennen Quelle, Feld oder Form und passende Korrektur. Unterstützte Syntax ist ohne Suche im Parser nutzbar; Beschreibungen passen zur ausführenden Version.
- AC-004: Der Gesamtflow erfasst Analysen, Artefakte und Reviews in richtiger Reihenfolge, bereitet die gebundene Darstellung vor und erfasst eine neue bewusste Antwort über die vorhandene Freigabefunktion. Unterstützte Revision nutzt Vorschau und Anwendung. Routine-Handedits entfallen; ungültige Aufrufe erzeugen keine Freigabe oder QA-Aufwertung.
- AC-005: Jeder exponierte Schreibvorgang besitzt belegtes Verhalten für verlorene Antworten, Wiederholung, Nutzlastkonflikte soweit anwendbar, konkurrierende Änderungen und unterbrochene Speicherung. Beleg, aktuelle Lage oder konkrete Recovery lösen Unsicherheit; unbelegte Idempotenz wird nicht behauptet.
- AC-006: Quick Task und beide strukturierten Modi unterscheiden abgeschlossenen Governance-Stand von fehlendem OR. OR, Lebenszyklus und Backlog bleiben konsistent oder sichtbar wiederherstellbar. Ein erledigter Abschluss verlangt keinen weiteren OR und führt keine Git-Aktion aus.
- AC-007: Aktuelle QA-/UAT-Entscheidungsnachweise werden aus verfügbaren exakten Bindungen abgeleitet; ersetzte Historie und unbekannte Zuordnung bleiben erkennbar. Dokumentfassungen und gebundene Entwurfsbefunde behalten ihre Bedeutung. Refresh und Lebenszyklusfälle verwenden dieselbe Core-Policy; geänderte Darstellungen werden in allen registrierten Sprachen geprüft.
- AC-008: Echte MCP-Aufrufe entsprechen Core/CLI für positive, ungültige, veraltete und Recovery-Fälle. Bestehende Verträge bleiben kompatibel oder erhalten einen qualifizierten Übergang. Laufzeit-, Ressourcen- und Hostnachweise benennen die tatsächlich geprüfte Ausführung; keine unbeobachteten Host- oder stärkeren Herkunftszusagen.
- AC-009: Ein gemeinsamer freigegebener Entwurf klärt Eigentümer, Verträge, Formate, Nachweise, Abschluss und Kompatibilität vor Umsetzung. Keine Etappe ist fertig, solange andere Konsumenten widersprechen. Feste Vorher-/Nachher-Fälle messen Such-/Handschritte, Schemafehler, falsche Folgeangaben, unnötige Fortsetzungsimpulse und Recovery getrennt von notwendigen Entscheidungen und externen Aktionen.
- AC-010: Aktuelle Karte mit vollständiger Kurzfassung, relevanten Änderungen/offenen Punkten und Entscheidungswirkung; exaktes Dokument groß öffnen und zurückkehren. Freigeben, Änderung mit Kommentar und Ablehnen folgen bestehenden Owners. Diskussion bleibt möglich; die passende exakte Approval-Zeile kann später die noch aktuelle entscheidungsbereite Fassung freigeben. Fragen/Zitate/Beispiele/alte Antworten erteilen keine Freigabe.
- AC-011: Nutzerklick, Tool-Erlaubnis und Core-Freigabe sind getrennt. Keine modellgenerierte Entscheidung. Erst bestätigter Effekt bedeutet Erfolg; Doppelklick, gleichzeitige Text-/Klickantwort, verlorene Antwort und veraltete/abgelaufene Karten erhalten belegten Status/Recovery ohne doppelte Freigabe.
- AC-012: Exakte tatsächliche Codex-Karte, große Dokumentansicht, echte Nutzerhandlung und registriertes Ergebnis werden samt betroffenen Tastatur-/Fokus-/Layout-/Teardown-Fällen und allen Sprachen nachgewiesen. Textfallback bleibt erhalten, ersetzt aber keinen Klicknachweis.
- AC-013: Im aktiven strukturierten Run am SD-Gate mit freigegebener UR/PRD und verknüpfter, noch nicht freigegebener SD wird eine UR-Änderung im selben Run unterstützt. Vor Umsetzung: reine Auswirkungsvorschau, getrennte exakt gebundene Anwendung, Erhalt alter Fassungen und Belege, Entwertung betroffener aktueller Freigaben/Bindungen, erneute Analysen und neue UR-/PRD-/SD-Entscheidungen. Core/CLI/MCP stimmen überein; veraltete/fremde Aufrufe, Konkurrenz, Wiederholung und Unterbrechungen erhalten konkrete Fehler, Belege oder Recovery. Keine Freigabenübertragung, Ersatzruns oder Handedits; spätere Lebenszyklusfälle bleiben außerhalb dieser Erweiterung.
- Abgrenzung: Kein Tool je Kandidat, zusätzlicher Orchestrator, zweite Policy oder automatische Freigabe. Keine Änderung der Request Activation, stillen Fremdrun-Edits, Genehmigungsübertragung oder pauschalen Host-/Modellzusagen. Allgemeines Diagnose-/Testinventar, synthetische Produkt-Testprofile, Installer-/Neustartarbeit und Git/Veröffentlichung bleiben außerhalb. Die bisherige Button-Ausnahme entfällt nur für die konkrete gebundene Entscheidungskarte; keine allgemeine App-Schreibschnittstelle. Bestehende Dokumentzustands-/Entwurfsprüfungen werden als Regression geschützt.
- Eigentümer und offene Entwurfsfragen: Das vorhandene Agentenkontroll-Zielbild und R-04 bleiben maßgeblich; R-05-Nachweise gelten nur für tatsächlich qualifizierte Hosts. Core-Reader, Autoren-/Proof-Prüfung und vorhandene Writer tragen die Semantik; Adapter transportieren, App zeigt an. Brownfield klärt Reproduktion, Wiederverwendung und Überschneidungen mit aktiven Runs. PRD/SD klären genaue Szenarien, API-/Operationsform, Kriterieninterpretation, Evidenzzuordnung, Kompatibilität und Recovery. Mehrdatei-Abschluss darf keine unbelegte Atomizität behaupten; freie historische Evidenz und kooperative Antwortherkunft bleiben ehrlich begrenzt.
- Nächster Schritt: Diese zusammengeführte UR wird im selben Run als neuer Entwurf registriert und erneut zur Entscheidung vorgelegt. Die gesondert autorisierte und geprüfte Core-Erweiterung ermöglicht die kontrollierte Wiederöffnung; alte Fassungen, Freigaben und Belege bleiben Historie. Eine neue bewusste `Approval: UR` ist erforderlich. Danach folgen erneute Brownfield-/UX-Bewertung und abhängige PRD-/SD-Entscheidungen; die Ausnahme für den Core-Fix ersetzt keine weiteren Gates. Installierte Laufzeit und native Host-Nachweise sind getrennt zu betrachten.

## Prüfartefakt · UR

Run: `core-mcp-flow-coherence-20261010-01` · Gate: `UR` · Revision: `f20105c0-a12d-4635-9f08-d81d1d254a33`

Artefakt: [UR.md](</Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/.agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/UR.md>)

SHA-256: `sha256:b937eb29e750758c842d8abf42325cf3ada6869198b197247e31a7eefd9b2a1b`

Bitte öffne die verlinkte Fassung vor deiner Entscheidung.

Nutzeranforderungen · UR: Consistent Core and MCP flow from artefact recording to closeout · `core-mcp-flow-coherence-20261010-01`
[UR](.agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/UR.md) · PRD (noch nicht erstellt) · SD (noch nicht erstellt) · TP (noch nicht erstellt)
Bereit für deine Entscheidung

Jetzt freigeben
`Approval: UR` Bestehende Owner prüfen und den angemessenen Lieferweg wählen; die Implementierung bleibt gesperrt.

Danach
Agent führt Brownfield Review als Nächstes durch. Keine Nutzeraktion erforderlich.

Zur Freigabe exakt mit `Approval: UR` antworten; andernfalls Überarbeitung anfordern oder ablehnen.