# Architektur von AGDF

AGDF hilft einem Coding-Agenten, einen Softwareauftrag nachvollziehbar zu bearbeiten: Ziel und
Umfang klären, den nächsten erlaubten Schritt bestimmen, Entscheidungen einholen und Ergebnisse
prüfen. Der Agent arbeitet in seinem Host, etwa Codex oder Claude Code. AGDF ergänzt diesen
Arbeitsplatz um gemeinsame Regeln, Prüfungen und einen gespeicherten Projektzustand.

**Leseweg:** Hier das System verstehen → im [Entwicklereinstieg](entwickler-einstieg.md) den
Weg zum Code verfolgen → bei Bedarf [Entscheidungen und Nachweise](lesestand-und-nachweise.md)
prüfen. Du musst die Kapitel nicht vollständig oder in Dateireihenfolge lesen.

**Redaktioneller Stand: 26. Oktober 2026, Repository-Quelle.** Die Fachkapitel nennen ihre eigenen
Quell- und Prüfstände. [So sind diese Angaben zu lesen](lesestand-und-nachweise.md).

## Das System in einem Ablauf

Der Agent fragt AGDF, welcher Schritt für das ausgewählte Vorhaben ansteht. Der **Core** prüft
Projektzustand und Voraussetzungen. Der **Dispatcher** liefert daraus einen begrenzten Auftrag.
Der Agent führt die Arbeit mit seinen Host-Werkzeugen aus. Zuständige Schreibdienste halten
Ergebnisse und Entscheidungen fest; danach wird der Zustand erneut geprüft.

```text
Mensch beschreibt das Ziel
  → Agent ordnet Projekt und Vorhaben zu
  → AGDF prüft Voraussetzungen und bestimmt den nächsten Schritt
  → Agent bearbeitet diesen Schritt oder bereitet eine Entscheidung vor
  → Mensch entscheidet, wenn seine Freigabe erforderlich ist
  → Ergebnisse und Entscheidungen werden gespeichert und erneut geprüft
```

**Skills und MCP sind zwei Zugänge zu denselben Core-Diensten.** Skills geben dem Agenten
Arbeitsanweisungen. MCP verbindet ihn mit aufrufbaren Werkzeugen und Daten. Das Cockpit zeigt
Stand, Dokumente und Entscheidungen in einer Oberfläche im Host.

AGDF prüft die von ihm vermittelten Operationen. Die Rechte für Dateien, Prozesse und Netzwerk
liegen beim Host. Eine umfassende Sperre aller direkten Agentenaktionen ist im bestehenden System
nicht nachgewiesen. Die [Systemarchitektur](01-systemarchitektur.md#5-regel-prüfung-und-durchsetzung)
erklärt diese Grenze, das [Zielbild](03-agentenkontrolle-zielbild.md) die vorgeschlagene Erweiterung.

## Beispiel: Eine bestehende Funktion ändern

Angenommen, ein Nutzer beauftragt: „Ergänze einen CSV-Export; die bestehende API soll gleich bleiben.“
Das Beispiel erläutert den Ablauf, ohne einen bestimmten Delivery-Pfad vorwegzunehmen.

1. **Zuordnen.** Der Agent klärt Zielprojekt und Umfang. Er prüft, ob die Arbeit zu einem bestehenden
   Vorhaben gehört oder einen eigenen Run braucht.
2. **Vorbereiten.** AGDF bestimmt aus dem gewählten Arbeitsweg und Zustand die nächste Aufgabe.
   Der Agent untersucht beispielsweise den Bestand oder beschreibt das gewünschte Verhalten.
3. **Entscheiden.** Wenn eine Freigabe erforderlich ist, wird die konkrete Fassung zur Entscheidung
   vorgelegt. Erst die bewusste menschliche Antwort wird als Freigabe gespeichert.
4. **Umsetzen und prüfen.** Der Agent ändert den freigegebenen Umfang und prüft Export und
   API-Kompatibilität. Ergebnisse, Reviews und erforderliche Abnahme werden nachvollziehbar erfasst.
5. **Abschließen.** AGDF prüft die Abschlussvoraussetzungen. Commit, PR oder Veröffentlichung
   erfolgen als gesondert beauftragte Auslieferungsschritte.

Der [Entwicklereinstieg](entwickler-einstieg.md#ein-auftrag-vom-chat-bis-zum-ergebnis) verfolgt
diesen Auftrag durch Komponenten und Quellcode. Die [drei typischen Dispatcher-Abläufe](02-dispatcher.md#drei-typische-abläufe)
zeigen die genaue Zuordnung; der [Befehlsfluss](core-mcp-command-flow.md) erklärt Speicherung und Entscheidung.

## Die wichtigsten Begriffe

| Begriff | Bedeutung in dieser Architektur |
|---|---|
| Host | Anwendung, die den Agenten ausführt und Werkzeuge, Rechte und Darstellung bereitstellt. |
| Run | Abgegrenztes Vorhaben mit Anforderungen, Zustand, Revisionen und Nachweisen; kein Git-Branch. |
| Gate | Entscheidungspunkt im gewählten Arbeitsweg. Eine menschliche Freigabe bezieht sich auf eine konkrete Fassung. |
| Core | Gemeinsame Fachlogik für Zustand, Prüfung und zulässige Operationen. |
| Dispatcher | Ermittelt den nächsten begrenzten Arbeitsschritt aus Auftrag und geprüftem Zustand. |
| Writer | Zuständiger Schreibdienst, der eine erlaubte Änderung und ihren Beleg speichert. |
| Kanonischer Owner | Die maßgebliche Quelle beziehungsweise Komponente für eine Regel oder Wirkung. Andere Zugänge verwenden sie mit. |
| Bindung | Geprüfter Bezug auf genau das gemeinte Projekt, den Run und gegebenenfalls Revision oder Dokument. |

Die Kürzel **UR**, **PRD**, **SD** und **TP** bezeichnen Anforderung, Produktbeschreibung,
Lösungsentwurf und Aufgabenplan. **QA** ist die Qualitätsentscheidung, **UAT** die menschliche
Abnahme. Welche davon erforderlich sind, bestimmt der gewählte Arbeitsweg; die genaue Bedeutung
steht in den [Gate-Regeln](../02-gates.md) und [Runtime-Verträgen](../../plugins/agdf/meta/contracts/).

## So gehören die Dokumente zusammen

| Deine Frage | Passender Einstieg |
|---|---|
| Wie funktioniert AGDF grundsätzlich? | Diese Seite, danach [Systemkontext und Bausteine](01-systemarchitektur.md#1-systemkontext) |
| Wo beginne ich als Entwickler? | [Entwicklereinstieg: Auftrag, Code und Prüfungen](entwickler-einstieg.md) |
| Welcher Code gehört zu meiner Änderung? | [Paketstruktur](05-paketstruktur.md) und [Code-Einstiege nach Aufgabe](entwickler-einstieg.md#code-einstiege-nach-aufgabe) |
| Wie findet der Agent den nächsten Schritt? | [Dispatcher und Use Cases](02-dispatcher.md) |
| Wie werden Dokumente und Entscheidungen gespeichert? | [Befehlsfluss zwischen Core und MCP](core-mcp-command-flow.md) |
| Wie entwickle oder überarbeite ich ein MCP-Werkzeug? | [MCP-Integrationsrichtlinien](09-mcp-integrationsrichtlinien.md) |
| Wie funktioniert das vorhandene Cockpit? | [Technische Cockpit-Referenz](06-agdf-cockpit.md) |
| Wie soll sich die Oberfläche bedienen lassen? | [Hub und Run-Cockpit: Nutzerweg zuerst](07-ui-konzept.md#1-nutzerabsicht-und-einstieg), dann [UI-Richtlinien](08-ui-richtlinien.md) |
| Welche Weiterentwicklung ist vorgeschlagen? | [Zielbild der Agentenkontrolle](03-agentenkontrolle-zielbild.md) und [offene MCP-Fragen](04-mcp-schnittstellen.md#verbleibende-schnittstellenfragen) |
| Warum wurde etwas so gebaut, und was ist belegt? | [Lesestand und Nachweise](lesestand-und-nachweise.md) mit Verweisen auf Entscheidungen und Originalbelege |

## Bestehender Stand und Weiterentwicklung

MCP-Werkzeuge des regulären Servers: `agdf_dispatch`, `agdf_inspect`, `agdf_prepare`, `agdf_record`, `agdf_approve`, `agdf_revise`, `agdf_closeout`.

Das Inventar beschreibt die Standardkonfiguration im Repository. Aktivierte Befehlsgruppen
und hostabhängige App-Werkzeuge bestimmen die tatsächlich sichtbare Liste einer Verbindung.

Die Fachkapitel unterscheiden **Bestand** (im benannten Quellstand vorhanden), **Zielbild**
(vorgeschlagenes Verhalten) und **Nachweis** (tatsächlich geprüfte Eigenschaft). Ein vorhandener
Codepfad kann noch offene Host-Nachweise haben. Ein Zielbild ist keine Lieferzusage.

Quellcode, installiertes Paket und live beobachtetes Host-Verhalten bleiben getrennte Nachweise.
Die [Einordnung der dokumentierten Entwicklungsstände](lesestand-und-nachweise.md#dokumentierter-entwicklungsstand-und-seine-grenzen)
hält die bisherigen Bestands- und Qualifikationsangaben zugänglich. Die
[MCP-Erkenntnisse](04-mcp-schnittstellen.md#belegte-erkenntnisse-zur-codex-mcp-inspektion) verbinden
Ursache, Entscheidung, Code, Tests und Originalbeobachtung für den dort benannten Codex-Ablauf.

Für die Anwendung helfen das [Handbuch](../handbook/de/README.md), zur Einrichtung die
[Installationsanleitung](../../INSTALL.md). Verbindliche Semantik bleibt bei den
[Runtime-Verträgen](../../plugins/agdf/meta/contracts/) und ihren Core-Diensten.
