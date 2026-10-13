# Architektur von AGDF

AGDF steuert die Arbeit eines Coding-Agenten über einen gemeinsamen Ablauf: Auftrag zuordnen,
Voraussetzungen prüfen, Arbeit vorbereiten, menschliche Entscheidungen erfassen und Ergebnisse
prüfen. Der Agent läuft weiterhin in seinem Host, etwa Codex oder Claude Code. AGDF verbindet
Anweisungen, ausführbare Kontrollen und den dauerhaften Projektzustand unter `.agdf/control/`.

**Stand der redaktionellen Übersicht: 12. Oktober 2026, Repository-Quelle.** Die folgenden Seiten unterscheiden
bestehende Implementierung, vorgeschlagene Weiterentwicklung und noch offene Detailfragen.
Normative Regeln bleiben in den [Runtime-Verträgen](../../plugins/agdf/meta/contracts/).

## Das System in einem Ablauf

Der Core wertet den Kontrollzustand aus. Der Dispatcher verwendet diese Auswertung, um dem Agenten
den nächsten begrenzten Schritt zu liefern. Skills und MCP sind zwei Zugangswege zu denselben
Diensten. Der Agent führt die Arbeit mit den Werkzeugen seines Hosts aus; separate Writer speichern
Zustand und Entscheidungen. Der gemeinsame Core-Einstieg umschließt den lesenden Dispatcher
mit einer Fortsetzungsorchestrierung. Bei ausdrücklich beauftragter, gebundener Fortsetzung kann
sie vor der Ausgabe genau eine fehlende Beziehung aus bereits versiegeltem, exakt geprüftem
Zuordnungsbeleg über den bestehenden Korrekturdienst ergänzen. Anschließend ruft sie den Dispatcher
mit frischer Auswertung erneut auf. Reviews, Tests und menschliche Abnahme bewerten die Ergebnisse.

```text
Mensch beauftragt Arbeit
  -> Agent bindet Auftrag an Zielprojekt und Run
  -> Skill oder MCP ruft den Dispatcher auf
  -> Core prüft Zustand, Voraussetzungen und bestehende Freigaben
  -> Dispatcher liefert begrenzten nächsten Schritt
  -> Agent erstellt Artefakt, führt Arbeit aus oder bereitet Entscheidung vor
  -> zuständiger Writer hält Ergebnis oder bewusste menschliche Entscheidung fest
  -> erneute Kontrollauswertung, anschließend Reviews und Abnahme
```

Ein Run ist ein abgegrenzter Arbeitsumfang mit Artefakten, Revisionen und Freigaben. Der Host besitzt
Werkzeuge, Prozessrechte und Sandbox. **Der Dispatcher kontrolliert den kooperativen Ablauf;
er ist keine universelle Sperre vor jedem Datei-, Shell- oder Netzwerkzugriff.** Die Erweiterung um
Kontrolle tatsächlicher Aktionen und Prüfung ihrer Wirkungen ist Gegenstand des Zielbilds.

## Beispiel: Eine bestehende Funktion ändern

1. **Auftrag zuordnen.** Der Agent vergleicht die gewünschte Änderung mit dem Umfang vorhandener
   Runs. Eine eindeutige Fortsetzung wird an diesen Run gebunden; ein eigener Umfang beginnt mit
   einem neuen Auftrag. Arbeitsverzeichnis oder jüngster Run reichen zur Zuordnung nicht aus.
2. **Nächsten Schritt bestimmen.** Der Dispatcher lässt den Core Voraussetzungen und Freigaben
   prüfen. Fehlt etwa ein aktuelles Planungsartefakt, erhält der Agent den Auftrag, dieses zu erstellen.
3. **Entscheidung vorbereiten.** Eine lesende Vorschau zeigt, ob eine Entscheidung bereit ist.
   `run-present` speichert anschließend eine Bindung an die genaue Fassung und liefert den Text,
   den der Agent zeigt. Erst eine neue bewusste menschliche Antwort kann als Freigabe erfasst werden.
4. **Arbeit ausführen und prüfen.** Nach erfüllten Voraussetzungen bearbeitet der Agent die Funktion,
   führt relevante Tests und Reviews durch und hält die Ergebnisse fest. Im strukturierten Weg
   folgen die menschlichen QA-/UAT-Entscheidungen und der Abschluss.

Die [Dispatcher-Referenz](02-dispatcher.md#drei-typische-abläufe) erläutert die konkreten Fortsetzungen
und die kürzeren Wege. Der [Kontrollkatalog im Zielbild](03-agentenkontrolle-zielbild.md#4-kontrollkatalog-und-bindung-konkreter-aktionen)
beschreibt, wie direkte Umgehungswege künftig verhindert oder ihre Wirkungen erkannt werden sollen.

Innerhalb bereits erlaubter strukturierter Umsetzung liefert der Dispatcher
`skill_continuation` mit der Phase `implementation`. Routineprüfungen brauchen dabei keine eigene
Zwischenkarte; Entscheidungen, Blocker, relevante Änderungen und wesentliche Ergebnisse bleiben
sichtbar. Expliziter Status wird immer frisch und lesend ausgewertet. Die
[Artefakterfassung und begrenzte Beziehungskorrektur](02-dispatcher.md#artefakterfassung-und-begrenzte-beziehungskorrektur)
erklärt die gemeinsamen Nachweise und Schreibgrenzen. Diese Beschreibung belegt den Quellstand,
keine aktualisierte Installation oder bereits beobachtete Verbesserung in einer frischen Host-Sitzung.

## So gehören die Dokumente zusammen

| Lesen für | Dokument | Rolle |
|---|---|---|
| Das implementierte System verstehen | [Bestehende Systemarchitektur](01-systemarchitektur.md) | Bausteine, Laufzeit, Installation, Verteilung, Nachweise und Grenzen des Bestands |
| Einen Auftrag durch den Ablauf verfolgen | [Dispatcher und Use Cases](02-dispatcher.md) | Vertiefung des Bestands: Bindung, Schritte, Fortsetzungen und Ergebnisbehandlung |
| Die Weiterentwicklung als Ganzes verstehen | [Gesamtkonzept zur Agentenkontrolle](03-agentenkontrolle-zielbild.md) | Gemeinsames vorgeschlagenes Zielbild für Ablaufsteuerung, Ausführungskontrolle und Ergebnisprüfung; mit einer Roadmap |
| Offene MCP-Details klären | [MCP-Schnittstellen im gemeinsamen Zielbild](04-mcp-schnittstellen.md) | Ergänzende Fragen und Zuordnung zum Operationskatalog des Gesamtkonzepts |
| Code und Auslieferung zuordnen | [Paket- und Quellstruktur](05-paketstruktur.md) | Referenz der Implementierungs- und Build-Grenzen |
| Kontrollstand und Quellen im Cockpit verstehen | [Lokale MCP-App](06-agdf-cockpit.md) | Implementierte Ansichten, Run-Bindung, gemeinsames Pages-Design, Aktualität und getrennte Host-Nachweise |
| Hub, Run-Cockpit und menschliche Entscheidungen aus Anwendersicht verstehen | [AGDF Hub und Run Cockpit](07-ui-konzept.md) | UI-Zielkonzept mit fünf Mockups, verständlichen Aufgaben und Entscheidungsfragen: Ziel und Umfang klären, Verhalten festlegen, Lösung planen; klare Codex-Grenzen und technische Zuordnung in Details |
| Ansichten konsistent gestalten und prüfen | [UI Richtlinien](08-ui-richtlinien.md) | Gemeinsame Anforderungen an Sprache, Orientierung, Entscheidungen, Aktionen, Host-Grenzen, Gestaltung und Bedienbarkeit; mit Beispielen und prüfbaren Kriterien |
| Artefakte, Entscheidungen, Revisionen und Abschluss über MCP verfolgen | [Befehlsfluss zwischen Core und MCP](core-mcp-command-flow.md) | Vertiefung des Entwicklungsstands: durchgehendes Beispiel, fünf Befehlsgruppen, Decision App und Wiederherstellung; native Qualifikation separat |

Für den ersten Durchgang: diese Seite, dann die Bestandsbeschreibung und anschließend das Zielbild.
Dispatcher und Paketstruktur vertiefen konkrete Teile. Die MCP-Seite ergänzt das Zielbild um offene
Schnittstellenfragen; sie besitzt keinen zweiten Operationskatalog und keine eigene Roadmap.
Wer eine konkrete Erfassung oder Entscheidung nachvollziehen will, liest nach dem Dispatcher den
[Befehlsfluss zwischen Core und MCP](core-mcp-command-flow.md). Die Cockpit-Seite erklärt dazu die
allgemeine Leseansicht; der Befehlsfluss die getrennte Entscheidungsansicht und ihre Schreibgrenzen.
Das [UI-Zielkonzept](07-ui-konzept.md) führt diese Grundlagen zu einem Arbeitsbereich für den
Anwender zusammen. Es beschreibt die weitere Bedienung, ohne den bestehenden Implementierungs-
oder Host-Qualifizierungsstand umzudeuten.

Die [UI-Richtlinien](08-ui-richtlinien.md) ergänzen das Bedienkonzept um gemeinsame Regeln
für neue und überarbeitete Ansichten. Sie sind Gestaltungs- und Prüfkriterien, keine neue
Quelle für Gate-Regeln oder technische Berechtigungen.

Die [Architekturentscheidung zur Host-Schnittstelle](07-ui-konzept.md#architekturentscheidung-zur-gemeinsamen-host-schnittstelle)
legt MCP/MCP Apps als gemeinsame Grundlage für das Cockpit fest. Regeln und Entscheidungen
bleiben gleich; verfügbare Darstellung und Fortsetzung werden je Host geprüft. CopilotKit
bleibt eine optionale Host-Implementierung.

## Bestehender Stand und Weiterentwicklung

MCP-Werkzeuge des regulären Servers: `agdf_dispatch`, `agdf_inspect`, `agdf_prepare`, `agdf_record`, `agdf_approve`, `agdf_revise`, `agdf_closeout`.

Das Inventar beschreibt die Standardkonfiguration im Repository; deaktivierte Befehlsgruppen und
hostabhängige App-Werkzeuge verändern die konkrete Liste einer Verbindung.

| Verantwortung | Bestehender Stand | Vorgeschlagene Ergänzung im Zielbild |
|---|---|---|
| Ablaufsteuerung | Core bewertet den kanonischen Zustand; Dispatcher liefert den nächsten Schritt | Bessere Prüfung der Grundlagen für kürzere Wege und bedingte Schritte |
| Ausführungskontrolle | Host-Berechtigungen und Validierung kanonischer Operationen; vollständige Bindung aller Werkzeuge an den Arbeitsumfang nicht nachgewiesen | Qualifizierte Kontrolle konkreter Datei-, Shell-, Kindprozess- und Netzwerkaktionen |
| Ergebnisprüfung | Tests, Reviews, Nachweisaufzeichnung und menschliche Abnahme | Vergleich tatsächlicher Wirkungen mit freigegebener Arbeit und ausdrücklich belegte Unabhängigkeit |
| Menschliche Entscheidung | Gebundene Darstellung und exakte Antwort im kooperativen Weg | Qualifizierte native Auswahlfelder und gegebenenfalls stärkere Herkunftsnachweise |
| MCP | Repository-Entwicklungsstand: Dispatch, lesende Inspektion und fünf konfigurierbare Befehlsgruppen über gemeinsame Core-Dienste | Weitere Ausführungskontrollen und Host-Fähigkeiten aus dem Zielbild benötigen eigene Umsetzung und Nachweise |

Im Repository-Entwicklungsstand bietet der reguläre Server `agdf_dispatch`, `agdf_inspect` und die
aktivierten Gruppen `agdf_prepare`, `agdf_record`, `agdf_approve`, `agdf_revise`, `agdf_closeout`.
Der Codex-Decision-Zweig ergänzt eine gebundene MCP-App und, abhängig von UI-Unterstützung und
aktivierten Gruppen, eine ausschließlich für die App sichtbare Entscheidungsfassade.
Diese Implementierung bestätigt keine Installation oder native Host-Abnahme; der
[Befehlsfluss](core-mcp-command-flow.md) beschreibt die Voraussetzungen und Grenzen.
Sein [Nachweisabschnitt](core-mcp-command-flow.md#konkrete-nachweise-aus-dem-coherence-run) zeigt
außerdem die kandidatgebundenen nativen Freigabe-/Fortsetzungsfälle, den deutschen iPad-Chatfall,
die generierten Transport-/Prozessprüfungen und die noch offene Gesamtqualifizierung.
Der Dokumentationssnapshot vom 12. Oktober nennt Revision 80 und QA `revise`;
spätere Fortschritte müssen aus dem jeweiligen Run und seinen genauen Nachweisen gelesen werden.
Die Diagramme trennen erlaubten Ablauf
und tatsächlich belegten Umfang.
Die separate lokale Cockpit-Verbindung bietet `agdf_cockpit`, `agdf_cockpit_read` und eine
eingebettete UI-Resource. Ihr [Umsetzungsstand](06-agdf-cockpit.md) ist eine private
Entwicklungsintegration; sie erteilt keine Freigabe und ist kein Nachweis nativer Host-Abnahme.

Die nachgeführten Entwicklungsoperationen setzen nicht das gesamte Zielbild um.
Weitere vorgeschlagene Ergänzungen werden durch ihre Dokumentation nicht implementiert. Maßgeblich
für ihre weitere Planung sind der [Operationskatalog](03-agentenkontrolle-zielbild.md#7-mcp-operationskatalog-für-den-gesamten-lebenszyklus)
und die [gemeinsame Roadmap](03-agentenkontrolle-zielbild.md#10-abgleich-der-umfänge-und-umsetzungsroadmap).
Quellcode, installiertes Paket und live beobachtetes Host-Verhalten bleiben getrennte Nachweise.

Bedienung erklärt das [Handbuch](../handbook/de/README.md), Einrichtung die
[Installationsanleitung](../../INSTALL.md), Befehle die [CLI-Referenz](../../packages/cli/README.md).
