# Entwicklereinstieg: vom Auftrag zum Code

Diese Seite führt durch einen typischen Änderungsauftrag und zeigt, wo du dafür im Code beginnst.
Grundbegriffe und Gesamtzusammenhang stehen im [Architektur-Einstieg](README.md).
**Redaktioneller Stand: 26. Oktober 2026.** Die verlinkten Fachkapitel behalten ihre eigenen
Quell- und Prüfstände; die [Nachweis-Lesehilfe](lesestand-und-nachweise.md) erklärt deren Bedeutung.

## Drei Wege durch die Architektur

| Du möchtest … | Lies gezielt … | Danach solltest du erklären können … |
|---|---|---|
| Das System technisch verstehen | [Systemkontext](01-systemarchitektur.md#1-systemkontext), [Bausteine](01-systemarchitektur.md#2-bausteine-und-verantwortlichkeiten), dann das Beispiel unten | Wer ausführt, wer prüft und wo Zustand gespeichert wird. |
| Eine Änderung entwickeln | Das Beispiel unten, [Code-Einstiege](#code-einstiege-nach-aufgabe), dann das betroffene Fachkapitel | Welcher Owner geändert wird und welche Prüfungen den Effekt zeigen. |
| Einen Entwurf oder ein Ergebnis beurteilen | [Nachweis-Lesehilfe](lesestand-und-nachweise.md), die passende Architekturentscheidung und deren Originalbelege | Was implementiert, was beobachtet und was noch offen ist. |

Das [Zielbild](03-agentenkontrolle-zielbild.md) brauchst du, wenn du eine geplante Erweiterung
beurteilst. Für eine erste Änderung am Bestand ist es keine erforderliche Vorlektüre.

## Ein Auftrag vom Chat bis zum Ergebnis

**Beispiel:** „Ergänze einen CSV-Export; die bestehende API soll gleich bleiben.“ Das ist ein
illustrativer Auftrag für das bearbeitete Zielprojekt, keine vorhandene Exportfunktion von AGDF.
Die folgende Folge zeigt die Verantwortlichkeiten; die erforderlichen Schritte und Gates ergeben
sich aus dem gewählten Delivery-Pfad.

### 1 Auftrag und Vorhaben zuordnen

Der Agent klärt den gewünschten Effekt und vergleicht ihn mit vorhandenen Anforderungen. Das
Arbeitsverzeichnis allein reicht zur Zielwahl nicht aus. Ein neuer Umfang erhält einen neuen Run;
eine Fortsetzung muss zu dem ausdrücklich gemeinten bestehenden Run passen.

Im Code beginnt die Suche beim
[Dispatch-Vertrag](../../packages/core/lib/skill-dispatch/contract.js) und
[Dispatch-Service](../../packages/core/lib/skill-dispatch/service.js).
[Delivery Run Assignment](../../packages/core/lib/skill-dispatch/delivery-run-assignment.js)
liefert die Zuordnungsbelege. Die
[Dispatcher-Referenz](02-dispatcher.md#bindung-vor-fortsetzung) erläutert Ziel und Fortsetzungsargumente.

### 2 Den nächsten Arbeitsschritt bestimmen

Der Core liest Zustand, Voraussetzungen und vorhandene Freigaben. Der Dispatcher liefert daraus
beispielsweise einen Auftrag zur Anforderungsklärung, zur Untersuchung des Bestands oder zur
Umsetzung. Ein Rückgabewert beschreibt, was als Nächstes zu tun ist; der Dispatcher schreibt die
CSV-Funktion nicht selbst.

Die Kontrollprüfung liegt unter
[`control-evaluation/`](../../packages/core/lib/control-evaluation/), das Routing unter
[`skill-dispatch/`](../../packages/core/lib/skill-dispatch/).
[Schrittklassen](02-dispatcher.md#schrittklassen) und
[Use Cases](02-dispatcher.md#use-case-katalog) helfen beim Zuordnen eines konkreten Ergebnisses.

### 3 Material erfassen und eine Entscheidung vorbereiten

Der Agent erstellt die verlangten Artefakte. Die zuständigen Writer speichern deren geprüfte
Bezüge. Für eine erforderliche menschliche Entscheidung wird genau die gemeinte Fassung an
Projekt, Run, Gate und Revision gebunden. Der Mensch sieht den Entscheidungsgegenstand und
antwortet bewusst; die Freigabe wird durch einen eigenen Vorgang gespeichert.

Der [Befehlsvertrag](../../packages/core/lib/control-state/run-command-contract.js) und
[Befehlsdienst](../../packages/core/lib/control-state/run-command-service.js) vermitteln die
Operationen. [`run-presentation.js`](../../packages/core/lib/control-state/run-presentation.js)
besitzt die Präsentationsbindung. Das
[PRD-Beispiel im Befehlsfluss](core-mcp-command-flow.md#beispiel-einen-prd-entwurf-zur-entscheidung-bringen)
zeigt die Folge von Lesen, Erfassen, Vorbereiten und Entscheiden.

### 4 Die beauftragte Änderung ausführen und prüfen

Der Agent ändert den CSV-Export mit den Werkzeugen seines Hosts. Im Beispiel gehören ein
funktionierender Export und die unveränderte bestehende API zu den zu prüfenden Wirkungen.
Tests und Reviews müssen diese Wirkungen zeigen. Ein erfolgreicher Tool-Aufruf allein genügt nicht.

Der Zustand des Vorhabens liegt im Zielprojekt unter `.agdf/control/runs/<run_id>/RUN_STATE.md`,
zugehörige Artefakte unter `.agdf/control/artefacts/<run_id>/`. Die
[Writer](../../packages/core/lib/control-state/) besitzen die Speicherung. Erforderliche
Qualitätsentscheidungen, menschliche Abnahme und Abschluss bleiben eigene Schritte.

### 5 Den tatsächlichen Lieferstand benennen

Ein abgeschlossenes Vorhaben und ein gemergter oder veröffentlichter Stand sind unterschiedliche
Ergebnisse. Berichte genau, welche Fassung geprüft, aufgezeichnet und gegebenenfalls ausgeliefert
wurde. Die [Abschlussanleitung](../handbook/de/05-abschluss-und-auslieferung.md) erklärt diese
Unterscheidung aus Anwendersicht.

## Code-Einstiege nach Aufgabe

Die Tabelle ist eine Wegweisung zu bestehenden Ownern, kein zusätzliches Zuständigkeitsregister.
Die [Paketstruktur](05-paketstruktur.md) vertieft Build- und Auslieferungsgrenzen.

| Deine Änderung betrifft … | Beginne hier | Relevante Vertiefung oder Prüfung |
|---|---|---|
| Tool-Parameter, Dispatch-Ergebnis oder nächsten Schritt | [Dispatch-Vertrag](../../packages/core/lib/skill-dispatch/contract.js), [Service](../../packages/core/lib/skill-dispatch/service.js) | [Dispatcher](02-dispatcher.md), [Dispatch-Tests](../../packages/cli/scripts/skill-dispatch-test.js) |
| Lesende Kontrollabfragen oder Dokumentnavigation | [Inspect-Vertrag](../../packages/core/lib/control-inspect/contract.js), [Service](../../packages/core/lib/control-inspect/service.js) | [MCP-Richtlinien](09-mcp-integrationsrichtlinien.md), [Inspect-Tests](../../packages/cli/scripts/control-inspect-test.js) |
| Registrierung, Entscheidung, Revision oder Abschluss eines Runs | [Befehlsvertrag](../../packages/core/lib/control-state/run-command-contract.js), [Service](../../packages/core/lib/control-state/run-command-service.js) | [Befehlsfluss](core-mcp-command-flow.md), [Core-Service-Tests](../../packages/core/test/run-command-service-test.js) |
| MCP-Nachrichten, SDK-Validierung oder Worker | [Server](../../packages/mcp-server/src/server.js), [Worker](../../packages/mcp-server/src/worker.js) | [Paket-README](../../packages/mcp-server/README.md#repository-test-dependencies), [Protokolltests](../../packages/mcp-server/test/protocol.test.js) |
| Host-Registrierung und gemeinsame MCP-Laufzeit | [Lifecycle-Service](../../packages/cli/lib/mcp-lifecycle/service.js), [Adapter](../../packages/cli/lib/mcp-lifecycle/adapters/) | [MCP-Lebenszyklus](01-systemarchitektur.md#4-der-mcp-lebenszyklus) |
| Plugin-Installation oder geführte Einrichtung | [Installer](../../packages/cli/lib/installers/), [Setup](../../packages/cli/lib/install-setup/) | [Geführte Einrichtung](01-systemarchitektur.md#34-geführte-einrichtung-verbindet-getrennte-lebenszyklen) |
| Cockpit-Daten, Sitzung oder Zugriff | [Core-Inspektion](../../packages/core/lib/control-inspect/), [Cockpit-Vertrag](../../packages/core/lib/control-inspect/cockpit-contract.js) | [Technische Cockpit-Referenz](06-agdf-cockpit.md) |
| Cockpit-Darstellung und Bedienung | [Control UI](../../packages/control-ui/src/), [UI-Paket-README](../../packages/control-ui/README.md) | [Nutzerweg](07-ui-konzept.md#1-nutzerabsicht-und-einstieg), [UI-Richtlinien](08-ui-richtlinien.md) |

CLI, MCP und UI verwenden dieselbe Fachlogik. Ändert sich eine Regel oder ein Effekt, beginne am
zuständigen Core-Owner. Ändert sich allein die Übertragung oder Darstellung, bleibe an dieser
Grenze. Generierte Host-Dateien und installierte Caches sind keine primären Bearbeitungsquellen.

## Eine Änderung überprüfbar machen

Vor der Umsetzung sollten vier Fragen beantwortet sein:

1. **Welcher Effekt soll sich ändern?** Eine konkrete Eingabe und das erwartete Verhalten nennen.
2. **Wer besitzt diesen Effekt?** Maßgeblichen Vertrag oder Dienst und betroffene Zugänge bestimmen.
3. **Was muss gleich bleiben?** Relevante Ablehnungen, Bindungen, Schnittstellen und Budgets festhalten.
4. **Woran ist das Ergebnis erkennbar?** Passende Tests und gegebenenfalls eine echte Host-Beobachtung wählen.

Die verlinkten Tests sind Orientierung, keine universelle Testliste. Für MCP beschreibt das
[Paket-README](../../packages/mcp-server/README.md#repository-test-dependencies) die benötigte
Assembly und Abhängigkeiten. Ein Test gegen eine alte Build-Ausgabe prüft nicht automatisch den
geänderten Quellstand. Für neue oder überarbeitete MCP-Schnittstellen gelten zusätzlich die
[zehn Integrationskriterien](09-mcp-integrationsrichtlinien.md#2-wiederverwendbare-integrationskriterien).

## Details erst lesen, wenn sie deine Frage beantworten

Die [begrenzte Beziehungskorrektur](02-dispatcher.md#artefakterfassung-und-begrenzte-beziehungskorrektur)
erklärt einen speziellen Fortsetzungsfall. Die
[Wiederherstellung nach Unterbrechung](core-mcp-command-flow.md#4-was-bei-einer-fehlenden-antwort-oder-unterbrechung-gilt)
erklärt unbekannte Operationsergebnisse. Die
[Host- und Abnahmenachweise](01-systemarchitektur.md#7-protokoll--host--und-abnahmenachweise)
erklären, wie weit ein geprüfter Stand tatsächlich gilt.

So bleibt der Weg vom normalen Ablauf zur Ausnahme sichtbar. Regeln und Freigaben stammen
weiterhin aus den vorhandenen Verträgen; diese Seite erleichtert den Zugang zu ihnen.
