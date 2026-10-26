# Lesestand, Entscheidungen und Nachweise verstehen

Diese Seite hilft, Aussagen aus den Architekturkapiteln richtig einzuordnen und die zugehörigen
Belege zu finden. **Redaktioneller Stand: 26. Oktober 2026.** Sie führt kein zweites
Kompatibilitäts- oder Freigaberegister. Aktuelle Run-Zustände, Verträge und Originalbelege bleiben
bei ihren bestehenden Ownern.

## Was bedeutet eine Aussage in der Doku?

| Kennzeichnung | Was sie aussagt | Was du zusätzlich prüfen musst |
|---|---|---|
| Bestand / Repository-Quelle | Die Beschreibung bezieht sich auf einen benannten Quellstand. | Ob dein Checkout und seine Build-Ausgabe diesem Stand entsprechen. |
| Zielbild / Ergänzung | Ein Verhalten ist vorgeschlagen oder ein Integrationsschritt noch erforderlich. | Welche Teile schon bestehen und welcher Umfang noch geplant ist. |
| Protokoll- oder Repository-Test | Ein bestimmter Vertrag oder Codepfad wurde geprüft. | Ob die Prüfung den relevanten Kandidaten und die betroffene Fehlergrenze abdeckt. |
| Native Host-Beobachtung | Ein Ablauf wurde in der benannten echten Host-Umgebung beobachtet. | Host, Version, Modell, Konfiguration und tatsächlich durchlaufene Aufgabe. |
| Nachweis offen | Für die behauptete Eigenschaft fehlt der passende Beleg. | Ob die Implementierung fehlt oder nur die Beobachtung; daraus folgt nicht automatisch Neubau. |
| Menschliche Abnahme | Ein Mensch hat den konkreten Entscheidungsgegenstand bewusst beurteilt. | Welche Fassung und welcher Umfang tatsächlich Gegenstand dieser Antwort waren. |

Ein Datum am Kapitel beschreibt dessen Abgleich. Ein späterer Nachtrag aktualisiert nur seinen
benannten Umfang. Das Datum einer redaktionellen Überarbeitung ist kein neues Testdatum.
Quellcode, installiertes Paket und live beobachtetes Host-Verhalten bleiben getrennte Nachweise.

## Wo finde ich Antwort und Originalbeleg?

| Deine Frage | Weg zur maßgeblichen Quelle |
|---|---|
| Warum ist der Dispatcher vom Writer getrennt? | [Architekturentscheidungen](01-systemarchitektur.md#9-architekturentscheidungen-grenzen-und-pflege) und die dort genannten Core-Owner. |
| Warum wurden Schema und Lesehinweise für Codex verändert? | [Ursache, Entscheidung und Owner](04-mcp-schnittstellen.md#ursache-entscheidung-und-bestehender-owner), dann die verlinkten Originalbeobachtungen und Tests. |
| Was belegen die Codex-Läufe tatsächlich? | [Nachweiskette und Qualifikationsgrenzen](04-mcp-schnittstellen.md#nachweiskette-und-qualifikationsgrenzen), getrennt nach Vorstudie und Produktkohorte. |
| Welchen Stand haben Entscheidungsansicht und Wiederherstellung? | [Befehlsfluss: Nachweise](core-mcp-command-flow.md#5-was-die-beschreibung-belegt-und-welche-grenzen-gelten) mit kandidatgebundenen Beobachtungen. |
| Was ist beim Cockpit implementiert oder noch offen? | [Technische Referenz](06-agdf-cockpit.md), [Bestandsabgleich des Konzepts](07-ui-konzept.md#9-bestand-und-erforderliche-weiterentwicklung) und die jeweiligen Host-Nachweise. |
| Was wurde als neue Architektur vorgeschlagen? | [Zielbild und Roadmap](03-agentenkontrolle-zielbild.md#10-abgleich-der-umfänge-und-umsetzungsroadmap), einschließlich eigener historischer Ausgangsbasis. |
| Wo bleiben Entscheidungen über mehrere Änderungen auffindbar? | [Context Graph](../../.agdf/control/CONTEXT_GRAPH.md) und [Source-of-Truth-Register](../../.agdf/control/SOT_REGISTRY.md); von dort zu den bestehenden Ownern und Run-Belegen. |

Die nachvollziehbare Kette lautet: **Problem → Ursache → Entscheidung → Owner-Code → Test →
Originalbeleg → Geltungsgrenze.** Eine spätere Zusammenfassung ersetzt dabei keinen Originalbeleg.

## Dokumentierter Entwicklungsstand und seine Grenzen

Die folgende Einordnung stand bisher auf der Architektur-Einstiegsseite. Sie bleibt als
Bestands- und Nachweisreferenz erhalten. Ihr Überblick war am 12. Oktober 2026 redaktionell
abgeglichen und wurde am 26. Oktober um den gebundenen Codex-Umfang ergänzt. Die einzelnen
verlinkten Kapitel und Originalbelege nennen ihre eigenen Stände. Dieser Umzug ist keine
erneute Prüfung der dort dokumentierten Fähigkeiten.


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
