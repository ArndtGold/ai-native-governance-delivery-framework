# Stand nach dem bestätigten Codex-Neustart

Run: `core-mcp-flow-coherence-20261010-01`  
Revision: `089a504e-29b4-42a9-8b1c-3558cfa34996`  
QA: offen; keine QA-Entscheidung oder formale Review-Erfüllung gespeichert.

## Parallelbefund behoben

Die gezielte Reproduktion zeigt bei exakter Präsentationswiederholung nur geänderte Run-Ordner-Zeitstempel durch die temporäre Lock-Datei. Die Run-Dateien bleiben unverändert. Reine Typ-/Containment-Prüfungen hatten versehentlich vollständige Ordner-Metadaten als Quellenabhängigkeit registriert.

Der bestehende FS-Leser unterscheidet jetzt Typ/Identität von vollständigen Stat-Metadaten. Run-Erkennung und Symlink-Prüfung nutzen die Typbeobachtung. Inhaltsänderungen, beobachtete Verzeichnislisten, Ordneraustausch, Dateisignaturen, Abwesenheit und Symlinks bleiben geschützt. Keine neue MCP-Funktion, kein anderer Lock-Owner, kein automatischer Retry und keine zusätzliche Freigabeautorität.

- 43/43 Prüfungen im erweiterten Leser-/Core-Lauf bestanden (`PARALLEL_READER_REGRESSION_01.json`).
- 32/32 Fälle über vier gleichzeitige MCP-Verbindungen bestanden: UR/UAT, Deutsch/Englisch, beide Protokollvarianten (`PARALLEL_MCP_MATRIX_01.json`).
- Zwei exakte deterministische Replay-Interleavings liefern nach der Korrektur das richtige Dokument; zuvor `source_changed` (`PARALLEL_DEPENDENCY_DIAGNOSIS_02/03.json`).
- Vollständige strukturierte Delivery-/Slice-Ketten bestehen einzeln in beiden Protokollvarianten (`PARALLEL_STRUCTURED_ISOLATED_01.json`). Quick-Kette und Revisionsprüfung bestanden im kombinierten Lauf.

Der erste kombinierte Transportlauf hatte bei einer synthetischen Freigabe ein Zeitlimit. Sein `effect_unknown` mit ursprünglicher Operations-ID bleibt dokumentiert (`PARALLEL_TRANSPORT_REGRESSION_01.json`). Der bestandene Einzellauf belegt die funktionale Kette; er ersetzt keine Garantie für beliebige parallele Systemlast.

## Pakete

Codex-Synchronisierung und Paketbau bestanden. Der paketübergreifende Build zeigte zunächst 594 zusätzliche Bytes im Copilot-Paket bei weiterhin 229 Dateien. Die bestehende Paketbaseline wurde auf exakt 2.004.898 Bytes angepasst, ohne Reserve oder neue Dateien. Vollständiger Build und Copilot-Prüfung auf Inventar, Quellabweichung, ausgeschlossene Inhalte und Wachstum bestehen (`PARALLEL_BUILD_ALL_02.json`, `PARALLEL_COPILOT_PROFILE_01.json`).

## Native Prüfung konkret blockiert

Der Neustart ist bestätigt und der neue Server geladen: Kandidat 05, Runtime `e41ff4f78db75cd7931fa7280815a4d0052486786ee0dff9157f398ec4815f2a`. Der tatsächliche Aufruf über Codex meldet jedoch `app_capability: unavailable`, `app_reason: host_ui_unsupported`. Keine interaktive Karte oder Entscheidungssitzung wurde geöffnet; die UI-Steuerung findet keine MCP-App-Ansicht. Nachweis: `NATIVE_RESTART_CAPABILITY_01.json`.

Damit sind aktuelle native Dokument-, Entscheidungs-, Tastatur-, Größen- und Teardown-Prüfungen in dieser Verbindung nicht ausführbar. Eine simulierte UI-Aushandlung würde diesen Nachweis nicht liefern. Der frühere Host-Teardown-Abbruch und die ungeklärte Prozesskontinuität der alten Ablaufbeobachtung bleiben offen. Kandidat 06 mit der Leser-Korrektur ist vorbereitet und synthetisch geprüft, aber nicht zusätzlich registriert oder als nativ geladen behauptet. Produktionskonfiguration und bestehende Einträge wurden in dieser Prüfung nicht verändert.

## Flow-Vergleich

`FLOW_COMPARISON_02.md` enthält die vollständige Liste der acht vorgesehenen Flows mit tatsächlichen Nachweisen und Grenzen. Neu verglichen: 48 identische Gate-Zustände, ein Zustand mit erneuerter UX-Quelle und zwei unveränderte historische Abschlussreferenzen. Die Baseline-Core-Dateien sind bis auf die vom Build erzeugte Ressourcenbindung exakt zugeordnet.

Diese Zustandsvergleiche ersetzen keinen vollständigen Vorher-/Nachher-Übergangslauf unter gleichen Modell-/Hostbedingungen. Dafür fehlen historische Transition-Traces und vollständige Zähler für Suchaufwand, manuelle Eingriffe, fehlerhafte Aufrufe und Rückfragen. Es gibt daher keine gemessene Aussage zur Verbesserung schwächerer Modelle und keine Behauptung von null Fehlern oder null Suchaufwand.

## Schutz und nächste Grenze

5.807 geschützte Kontroll-Dateien, alle vier freigegebenen Quellen, fremde Backlog-Zeilen und die gebundene Run-Revision bleiben unverändert (`PROTECTED_CHECKPOINT_REMAINING_CHECKS_03.json`). Der bereits bekannte Git-Index-Unterschied von 363 zusätzlichen Einträgen wird nicht verändert oder dieser Prüfung zugeschrieben. Keine Git-Aktion ausgeführt.

Für den QA-Abschluss fehlen weiterhin die aktuelle native Qualifikation, der vollständige kontrollierte Flow-Vergleich und die anschließenden formalen Reviews. Der konkrete nächste native Schritt setzt voraus, dass die tatsächliche Codex-Verbindung MCP-App-Unterstützung aushandelt; der Quellcode darf diese Host-Fähigkeit nicht vortäuschen.
