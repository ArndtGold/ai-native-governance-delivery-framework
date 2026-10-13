# Native Verbindung: Befund und vorbereiteter Nachweis

Stand: 2026-10-11T12:04:33.149600+00:00. Run `core-mcp-flow-coherence-20261010-01`, Revision `089a504e-29b4-42a9-8b1c-3558cfa34996`. QA offen.

## Bestätigt

Die bestehende native Verbindung lieferte `host_ui_unsupported`; der Host konnte auch die Kartenressource nicht lesen (`resource_denied`). Dies ist kein Nachweis, dass Codex generell keine MCP Apps unterstützt.

Der gleiche installierte Codex-Client `0.162.0-alpha.17.2` gibt in einer flüchtigen Sitzung die bei App-Server-Initialize erklärte UI-Erweiterung an einen MCP-Server weiter. Dies wurde mit dem aktivierten Code-Mode-Host beobachtet: `NATIVE_CAPABILITY_THREAD_CODE_MODE_01.json` und unveränderte Initialize-Daten des ausschließlich lesenden Testservers.

Gegen den echten aktuellen AGDF-Testserver liefert derselbe Client in einer flüchtigen Sitzung alle sieben Tools einschließlich App-only-Aktion und die UI-Ressource. Das funktioniert mit `enable_mcp_apps=false`: `NATIVE_CAPABILITY_REAL_SERVER_01.json`. Ein bloßes Umschalten dieses Features ist deshalb kein belegter Fix und wurde nicht in die Nutzerkonfiguration geschrieben.

Vier separate MCP-Protokollfälle mit dem aktuellen Server und dem Beobachter bestehen: 2025- und 2026-Protokoll, jeweils mit/ohne UI-Erweiterung. Die deklarierte Erweiterung schaltet Ressource/Aktion frei; ohne sie bleiben sie gesperrt. Die gelesenen UI-Bytes entsprechen exakt dem Kandidatendigest. Nachweis: `NATIVE_CAPABILITY_OBSERVER_REGRESSION_01.json`. Es gab dabei keine Vorbereitung oder fachliche Entscheidung.

## Gezielte Vorbereitung

Nur die Startargumente des bereits genehmigten temporären Eintrags `agdf-decision-probe` wurden auf Kandidat 07 umgestellt. Dieser nutzt den aktuellen Core-Fix aus Kandidat 06 und einen privaten Beobachter. Alle Transportbytes werden unverändert weitergeleitet. Der Beobachter protokolliert Initialize-/Request-Fähigkeiten, Methode, Prozessidentität und Wire-Digest, keine fachlichen Aufrufargumente. Kein zusätzlicher MCP-Endpunkt, keine simulierte Host-Unterstützung, keine Änderung von Produktivservern, Feature-Schaltern oder Freigaberegeln.

Nachweise: `NATIVE_PROBE_CANDIDATE_GATE_MATRIX_07.json`, `NATIVE_CAPABILITY_OBSERVER_CONFIGURATION_01.json`. Die vorherige Konfiguration liegt als private Sicherung unter dem dort genannten temporären Pfad.

## Noch offen

Die echte laufende Verbindung verwendet weiter Kandidat 05. Der genaue Verlustpunkt ihrer UI-Erweiterung ist noch nicht durch deren Initialize-/Request-Daten nachgewiesen. Ein globaler Inventarabruf ohne Thread sendete im isolierten Vergleich keine UI-Erweiterung; das ist ein Diagnosehinweis, kein Beweis für den Pfad dieser nativen Verbindung.

Der Benutzer wurde um einen Neustart für die konkret geänderte Testkonfiguration gebeten. Danach müssen Beobachter-PID/Startzeit, Initialize-/Request-Fähigkeiten, tatsächlicher agdf_prepare-Aufruf, Ressourcenladen und sichtbares `ui/initialize` derselben Ansicht abgeglichen werden. Erst dann lässt sich ein Fix am tatsächlichen Verlustpunkt bestätigen. Ein Kartenklick in einer technischen Testverbindung ersetzt keine menschliche Freigabe oder native Bedienprüfung.

Die native Blockade ist noch nicht behoben. QA, Bedien-/Teardown-Nachweis und vollständiger historischer Flow-Vergleich bleiben offen. Die bisherigen Parallel- und Source-Prüfungen werden dadurch nicht in native Qualifikation umgedeutet.

Die offizielle Anleitung beschreibt App-Server-Initialize und MCP-Thread-Aufrufe: https://learn.chatgpt.com/docs/app-server . Die gemessenen Erweiterungsdaten und Feature-Wirkungen stammen aus der tatsächlichen lokalen Version, nicht aus einer pauschalen Dokumentationsannahme.
