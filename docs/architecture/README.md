# Architektur von AGDF

AGDF steuert die Arbeit eines Coding-Agenten über einen gemeinsamen Ablauf: Auftrag zuordnen,
Voraussetzungen prüfen, Arbeit vorbereiten, menschliche Entscheidungen erfassen und Ergebnisse
prüfen. Der Agent läuft weiterhin in seinem Host, etwa Codex oder Claude Code. AGDF verbindet
Anweisungen, ausführbare Kontrollen und den dauerhaften Projektzustand unter `.agdf/control/`.

**Stand der redaktionellen Übersicht: 3. Oktober 2026, Repository-Quelle.** Die folgenden Seiten unterscheiden
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

Für den ersten Durchgang: diese Seite, dann die Bestandsbeschreibung und anschließend das Zielbild.
Dispatcher und Paketstruktur vertiefen konkrete Teile. Die MCP-Seite ergänzt das Zielbild um offene
Schnittstellenfragen; sie besitzt keinen zweiten Operationskatalog und keine eigene Roadmap.

## Bestehender Stand und Weiterentwicklung

| Verantwortung | Bestehender Stand | Vorgeschlagene Ergänzung im Zielbild |
|---|---|---|
| Ablaufsteuerung | Core bewertet den kanonischen Zustand; Dispatcher liefert den nächsten Schritt | Bessere Prüfung der Grundlagen für kürzere Wege und bedingte Schritte |
| Ausführungskontrolle | Host-Berechtigungen und Validierung kanonischer Operationen; vollständige Bindung aller Werkzeuge an den Arbeitsumfang nicht nachgewiesen | Qualifizierte Kontrolle konkreter Datei-, Shell-, Kindprozess- und Netzwerkaktionen |
| Ergebnisprüfung | Tests, Reviews, Nachweisaufzeichnung und menschliche Abnahme | Vergleich tatsächlicher Wirkungen mit freigegebener Arbeit und ausdrücklich belegte Unabhängigkeit |
| Menschliche Entscheidung | Gebundene Darstellung und exakte Antwort im kooperativen Weg | Qualifizierte native Auswahlfelder und gegebenenfalls stärkere Herkunftsnachweise |
| MCP | Zwei Werkzeuge vermitteln Dispatch und lesende Inspektion | Zusammenhängende Operationen aus dem Zielbild, erst nach Klärung von Wirkung, Autorisierung und Kompatibilität |

MCP-Werkzeuge: `agdf_dispatch`, `agdf_inspect`.

Die vorgeschlagenen Ergänzungen sind durch die Dokumentation noch nicht implementiert. Maßgeblich
für ihre weitere Planung sind der [Operationskatalog](03-agentenkontrolle-zielbild.md#7-mcp-operationskatalog-für-den-gesamten-lebenszyklus)
und die [gemeinsame Roadmap](03-agentenkontrolle-zielbild.md#10-abgleich-der-umfänge-und-umsetzungsroadmap).
Quellcode, installiertes Paket und live beobachtetes Host-Verhalten bleiben getrennte Nachweise.

Bedienung erklärt das [Handbuch](../handbook/de/README.md), Einrichtung die
[Installationsanleitung](../../INSTALL.md), Befehle die [CLI-Referenz](../../packages/cli/README.md).
