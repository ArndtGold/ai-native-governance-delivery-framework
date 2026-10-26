# Richtlinien für neue und überarbeitete MCP-Schnittstellen

**Stand: 26. Oktober 2026.** Diese Seite ist der gemeinsame Entwicklungs- und Review-Leitfaden
für weitere MCP-Schnittstellen in AGDF. Sie überträgt die
[belegten Codex-Erkenntnisse](04-mcp-schnittstellen.md#belegte-erkenntnisse-zur-codex-mcp-inspektion)
auf wiederverwendbare Prüfkriterien. Entwickler und LLM-Agenten sollen sie vor einer
Schnittstellenänderung lesen und die anwendbaren Kriterien in deren Nachweisen zuordnen.

**Dokumentrolle:** Architektur- und Prüfleitfaden. Fachliche Semantik, Berechtigungen und Gates
bleiben bei den bestehenden [Runtime-Verträgen](../../plugins/agdf/meta/contracts/) und
Core-Ownern. Diese Seite führt keine neue Freigabe, automatische technische Sperre oder
zweite Vertragsregistrierung ein. Abweichungen und nicht anwendbare Kriterien sind konkret zu
begründen; die Dokumentation allein belegt keine Umsetzung oder Host-Unterstützung.

**Leseweg:** Für den ersten Code-Einstieg lies [Auftrag und Komponenten](entwickler-einstieg.md).
Für eine MCP-Änderung beginne mit den [zehn Kriterien](#2-wiederverwendbare-integrationskriterien)
und der [Arbeitsfolge](#5-arbeitsfolge-für-entwickler-und-llm-agenten). Die
[Nachweis-Lesehilfe](lesestand-und-nachweise.md) erklärt die Grenzen von Quell- und Host-Prüfungen.

## 1 Gemeinsame Verantwortung vor dem Transport festlegen

Für jede Operation zuerst festhalten: Nutzeraufgabe, lesende oder schreibende Wirkung,
verantwortlicher Fachdienst, erforderliche Bindungen, Berechtigungen und überprüfbares Ergebnis.
Vorhandene Dienste und Writer wiederverwenden. CLI, MCP und UI vermitteln denselben Vertrag;
ein Adapter darf keine eigene fachliche Validierung, Freigabelogik oder Zustandsquelle erfinden.
Schemas und Beschreibungen kommen aus einem kanonischen Owner; abgeleitete Host-Dateien werden
über den bestehenden Build erzeugt.

Im Bestand besitzen der [Inspect-Vertrag](../../packages/core/lib/control-inspect/contract.js),
der [Dispatch-Vertrag](../../packages/core/lib/skill-dispatch/contract.js) und der
[Befehlsvertrag](../../packages/core/lib/control-state/run-command-contract.js) ihre jeweilige
Semantik. Der [MCP-Server](../../packages/mcp-server/src/server.js) vermittelt diese Verträge.
Der [Befehlsfluss](core-mcp-command-flow.md) erklärt die vorhandenen Writer- und Entscheidungswege.

## 2 Wiederverwendbare Integrationskriterien

Die folgenden Kriterien sind aus unseren Implementierungs- und Evaluationserfahrungen abgeleitet.
Sie sind keine Behauptung, dass jeder genannte Mechanismus Bestandteil des MCP-Standards ist.

| ID | Kriterium für die Implementierung | Erwarteter Nachweis |
|---|---|---|
| MCP-01 | Ein kanonischer Owner für Schema, fachliche Regeln und Effekte. Transport und Darstellung delegieren dorthin. | Owner-Pfade, Ableitungsweg und gleiche fachliche Ergebnisse über die betroffenen Zugänge. |
| MCP-02 | Schema-Gültigkeit und tatsächlich modellseitig sichtbare Signatur getrennt prüfen. Pflichtfelder, Operationswerte und bedingte Regeln müssen im Zielhost verständlich bleiben. | Tatsächliches `tools/list`, sichtbare Host-Projektion sowie gültige und ungültige SDK-Aufrufe. Bei einer Umformung zusätzlich Annahme- und Ergebnisparität. |
| MCP-03 | Zweck, Parameterbedeutung, Pflichtpaare und operationsabhängig unzulässige Felder ausdrücklich beschreiben. Serverbekannte Werte aus kanonischen Quellen liefern. | Positive Beispiele und Negativfälle für fehlende Paare, fremde Selektoren und widersprüchliche Felder. |
| MCP-04 | Folgeaufrufe mit vollständigen, validierten Argumenten anbieten, wenn der Server ihre Bindung kennt. Fehlende oder mehrdeutige Auswahl offen ausweisen. | Keine erfundenen IDs, kein stiller Zielwechsel und keine Ersatzdokumente bei unvollständigem Katalog. Bekannte exakte Bindungen bleiben vorrangig. |
| MCP-05 | Identität, Kontext, Revision und Vollständigkeit über die gesamte Aufrufkette erhalten. Abhängige Leseaufrufe geordnet ausführen; alle benötigten Seiten lesen. | Mehrseitenfall, historische Quelle, veraltete Revision und mehrdeutige Auswahl. Unabhängige Aufrufe nur gemäß bestätigtem Nebenläufigkeitsvertrag parallelisieren. |
| MCP-06 | Transport-, SDK-, fachliche und Berechtigungsfehler unterscheiden. Fehler müssen ihre Ursache und den zulässigen Korrekturweg erkennen lassen. | Fehler über den echten SDK-/Transportpfad auslösen; betroffene Felder, stabile fachliche Fehlerklasse und tatsächliche Wirkung prüfen. |
| MCP-07 | Optionale Navigation darf bei eigenem Fehler das gültige Hauptergebnis nicht zerstören. Fehler der Hauptauswertung müssen sichtbar bleiben. | Gezielter Ausfall der Zusatzkomposition mit unverändertem Hauptbericht; ursprünglicher Evaluatorfehler wird weitergegeben. Ohne Zusatzfunktion: begründet nicht anwendbar. |
| MCP-08 | Rechte, Schreibgrenzen und erforderliche menschliche Entscheidungen an den zuständigen Stellen durchsetzen. Hinweise und Tool-Metadaten verleihen keine Berechtigung. | Unzulässiges Ziel, fehlende Berechtigung und veraltete Entscheidungsbindung werden ohne verbotene Wirkung zurückgewiesen. Schutzbehauptungen durch tatsächliche Positiv-/Negativkontrollen belegen. |
| MCP-09 | Den tatsächlich ausgelieferten und geladenen Stand prüfen. Quelle, Build, Paket, Registrierung und frische Host-Sitzung getrennt zuordnen. | Quellen-/Paketbindung, geladene Laufzeit und exakte Kombination aus Host, Version, Modell, Reasoning, Laufzeit und Betriebssystem. Nur beobachtete Eigenschaften als unterstützt benennen. |
| MCP-10 | Erfüllte Nutzeraufgaben und Wiederherstellung messen. Aufruf-, Fehler-, Größen- und Laufzeitbudgets vor dem Vergleich festlegen. | Gleiche Aufgaben und Erfolgskriterien vor/nach Änderung, erhaltene Fehlläufe, vollständige Traces und unveränderte Limits. Schnellere Abbrüche zählen nicht als Verbesserung. |

### Hostbefund und allgemeine Regel auseinanderhalten

Das Verschieben unveränderter Bedingungen von Wurzel-`allOf` unter
`dependentSchemas.operation` war eine passende Lösung für den beobachteten Codex-Renderer,
weil `operation` erforderlich blieb und die Parität nachgewiesen wurde. Daraus folgt kein
allgemeines Verbot von `allOf` und keine pauschale Empfehlung zum Schema-Umbau. Ein anderes
Schema oder ein anderer Host braucht seine eigene Sichtbarkeits- und Validierungsprüfung.

`navigation.next_calls`, `target_source`, `primary_target`, `run_id` und
`expected_revision_id` sind AGDF-Vertragsbegriffe. Andere Schnittstellen benötigen die fachlich
passenden Bindungen; sie sollen nicht blind diese Feldnamen kopieren. Gleiches gilt für das
beobachtete `dispatch_busy`: Es begründet die geordnete abhängige Lesefolge, kein allgemeines
Parallelisierungsverbot für MCP.

Die konkrete Anwendung mit unterschiedlicher aktueller Vertragsrevision und ursprünglicher
Dokumentrevision steht in der
[gebundenen Lesefolge](core-mcp-command-flow.md#gebundene-lesefolge-vor-einer-entscheidung).

## 3 Protokoll- und Fehlergrenzen explizit prüfen

MCP definiert Eingabeschemas, strukturierte Ergebnisse und Fehlerdarstellung. Bei vorhandenem
`outputSchema` muss die strukturierte Ausgabe dazu passen. Fachliche Ausführungsfehler werden
mit `isError: true` gemeldet; ungültige Protokollanfragen sind davon zu unterscheiden.
Tool-Annotationen sind keine Zugriffskontrolle. Grundlage:
[MCP Tools, Revision 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/server/tools).

Zusätzlich den tatsächlich verwendeten SDK-Pfad prüfen: Eine Eingabe kann vor dem eigenen
Tool-Callback abgewiesen werden. Ein eigener Fehlertext im Callback verbessert diesen Fall dann
nicht. Schema, Beschreibungen und Korrekturhinweise am erreichbaren Owner verbessern; die
Validierung weder abschalten noch durch einen privaten SDK-Patch umgehen. Unsere getrennten
Nachweise dazu stehen in der
[Ursachen- und Entscheidungskette](04-mcp-schnittstellen.md#ursache-entscheidung-und-bestehender-owner).

Für unbekannte Schreibergebnisse nach Timeout oder Verbindungsabbruch gilt der vorhandene
Operations-/Wiederherstellungsvertrag: den ursprünglichen Vorgang prüfen, bevor ein weiterer
Schreibversuch erwogen wird. Eine erfolgreiche Übertragung oder ein Navigationshinweis ist
keine menschliche Freigabe. Die bestehenden
[Wiederherstellungsregeln](core-mcp-command-flow.md) bleiben maßgeblich.

## 4 Transport, Installation und Schutz getrennt qualifizieren

Transport und Protokollrevision ausdrücklich benennen. MCP beschreibt STDIO und Streamable HTTP;
die jeweilige Revision legt Metadaten, Nachrichtenfluss und Abbruch fest. Eine ältere
Handshake-Annahme nicht ungeprüft auf eine andere Revision übertragen. Grundlage:
[MCP Transports, Revision 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports).
Der reguläre AGDF-Server bleibt der dokumentierte lokale STDIO-Adapter; diese Richtlinie erweitert
seinen Transportumfang nicht.

Bei STDIO bleibt `stdout` den Protokollnachrichten vorbehalten; Diagnoseausgaben gehören auf
`stderr`. Start, EOF und Beenden des eigenen Prozessbaums prüfen.
[MCP STDIO](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/stdio)
beschreibt die Transportgrenze. Ein gesonderter HTTP-Kandidat braucht zusätzlich passende
Authentifizierung, Origin-Prüfung und Netzwerkbindung gemäß
[MCP Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http).

Eine Registrierung oder Versionsnummer beweist weder den geladenen Inhalt noch erfolgreiche
Ausführung. Für betroffene Installationswege Discovery, echten Aufruf, kontrollierten Fehler und
Entfernung im passenden Host getrennt belegen. Zugangsdaten und persönliche Einstellungen
schützen; eine Test-Sandbox nur nach tatsächlicher Schreibablehnung und erlaubter eigener
Kontrollaktion als wirksam bezeichnen. Die
[T7-Schutzschicht](04-mcp-schnittstellen.md#eine-geerbte-schutzschicht-für-die-native-qualifikation)
ist ein konkreter lokaler Testschutz, keine Schutzgarantie des normalen MCP-Servers.

## 5 Arbeitsfolge für Entwickler und LLM-Agenten

1. Nutzeraufgabe, Wirkung, bestehende Owner und geltenden Vertrag lesen und benennen.
2. Betroffene Hosts, Protokollrevisionen, Bindungen und unveränderte Budgets festlegen.
3. Gültige Beispiele, relevante Ablehnungen und Wiederherstellung vor der Änderung bestimmen.
4. Am kanonischen Owner ändern und betroffene Ableitungen über den vorhandenen Build erzeugen.
5. SDK-/Protokollprüfungen, sichtbare Host-Signatur, Bindungen, Fehler und Budgets getrennt prüfen.
6. Relevante reale Agentenaufgaben auf dem gebundenen Kandidaten mit vorher festgelegtem
   Sitzungsbudget ausführen, soweit dieser Umfang beauftragt ist. Ein Fehlversuch schafft kein
   zusätzliches Budget und keine Erlaubnis für Login, Installation oder Provider-Wechsel.
7. Beobachtete Aufgabenerfüllung, Fehler und Messgrenzen mit der unveränderten Referenz vergleichen.
   Fehlende native Nachweise als offen führen; aus Repository-Tests keine Host-Abnahme ableiten.
8. Erkenntnis am vorhandenen Architektur-/Context-Graph-Owner nachführen:
   **Problem → Ursache → Entscheidung → Owner-Code → Test → Originalbeleg → Geltungsgrenze.**

Für MCP-01 bis MCP-10 im bestehenden Änderungsnachweis jeweils Ergebnis, Beleg und Grenze
angeben; nicht anwendbare Punkte begründen. Die Liste ist ein Review-Raster und führt kein
zusätzliches Run-Artefakt oder neues Gate ein. Bei einer reinen Dokumentationsänderung wie dieser
genügen die Prüfung der Quellen, Verweise und Konsistenz; daraus entsteht kein neuer Modelllauf.

Die Evaluation anhand realistischer Aufgaben und messbarer Ergebnisse entspricht der
Methodik von [Anthropic: Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents).
Die hier beschriebenen AGDF-Bindungen, Owner und festen Grenzen stammen dagegen aus unseren
eigenen Verträgen und Originalnachweisen.

## 6 Aktueller Beleg und Grenzen der Übertragung

Die [finale Codex-Produktkohorte](04-mcp-schnittstellen.md#nachweiskette-und-qualifikationsgrenzen)
umfasst zwei echte normale T7-Sitzungen mit je vier MCP-Aufrufen, null SDK-/sonstigen Fehlern und
der beabsichtigten Freigabe. Das belegt den dort benannten Kandidaten und Ablauf. Es belegt keine
allgemeine Erfolgsquote, andere Modelle/Hosts oder eine aktualisierte Installation.

Weitere Schnittstellen übernehmen die nachvollziehbare Entwicklungs- und Prüfmethode.
Eigene Vertrags-, Sicherheits-, Größen- und Host-Nachweise bleiben erforderlich. Historische
Run-Artefakte und Originalmanifeste werden durch spätere Erkenntnisse nicht umgeschrieben.
Der [Context-Graph](../../.agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter) verweist auf
dieselben Owner und hält die Erkenntnisse auffindbar.
