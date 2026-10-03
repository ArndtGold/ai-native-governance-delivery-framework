# MCP-Schnittstellen im gemeinsamen Zielbild

**Dokumentrolle: ergänzende Schnittstellenfragen, nicht normativ.** Die ursprüngliche Diskussion
vom 30. September 2026 ist seit der redaktionellen Zusammenführung am 2. Oktober 2026 dem
[Gesamtkonzept zur Agentenkontrolle](03-agentenkontrolle-zielbild.md) zugeordnet. Dort stehen der gemeinsame
[Operationskatalog](03-agentenkontrolle-zielbild.md#7-mcp-operationskatalog-für-den-gesamten-lebenszyklus)
und die [Umsetzungsroadmap](03-agentenkontrolle-zielbild.md#10-abgleich-der-umfänge-und-umsetzungsroadmap).
Diese Seite ordnet die früheren fachlichen Gruppen ein und hält verbleibende MCP-Fragen fest.

Der [Architektur-Einstieg](README.md) zeigt die Zusammenhänge. Die
[Bestandsbeschreibung](01-systemarchitektur.md#32-mcp-werkzeugweg) und der
[Dispatcher-Katalog](02-dispatcher.md#use-case-katalog) erklären das implementierte Verhalten.
Eine Dokumentzuordnung beschließt keine neuen Tool-Namen, Schemata oder Schreibberechtigungen.

## Ausgangspunkt: bestehende Schnittstelle

Im untersuchten Quellstand bestehen die Werkzeugverträge `agdf_dispatch` und `agdf_inspect`.
Dispatch liefert nach Zielbindung eine Kontrollantwort oder begrenzte Fortsetzung; Inspect bietet
lesende Abfragen für `doctor`, `gate-check`, `delivery-map` und `contract`.
Der [Dispatch-Vertrag](../../packages/core/lib/skill-dispatch/contract.js),
[Inspect-Vertrag](../../packages/core/lib/control-inspect/contract.js) und die
[Inspect-Auswahl](../../packages/core/lib/control-inspect/selection.js) besitzen ihre Semantik.
Der [MCP-Server](../../packages/mcp-server/src/server.js) und die
[MCP-Laufzeit](../../packages/cli/lib/mcp-dispatch-runtime.js) vermitteln diese Verträge.

Der Dispatcher gibt Aufträge zurück; der Agent führt Schreibschritte separat über bestehende Writer
aus. Im nachgeführten Quellstand vom 3. Oktober 2026 kann eine ausdrücklich beauftragte,
gebundene Dispatch-Fortsetzung außerdem genau eine fehlende Beziehung aus bereits versiegeltem,
exakt geprüftem Beleg ergänzen. Dafür koordiniert die gemeinsame Core-Fortsetzungsorchestrierung
den bestehenden Korrekturdienst und ruft das lesende Dispatch-Routing anschließend frisch auf. Inspect und expliziter Status
bleiben lesend. Die Voraussetzungen und Fehlergrenzen stehen in der
[Dispatcher-Referenz](02-dispatcher.md#artefakterfassung-und-begrenzte-beziehungskorrektur).
Der MCP-Vertrag markiert `agdf_dispatch` deshalb mit `readOnlyHint: false`; diese Angabe
beschreibt die mögliche Wirkung des gesamten Werkzeugs, auch wenn sein Routing-Service lesend
bleibt. `agdf_inspect` behält `readOnlyHint: true`.
Das ist keine allgemeine MCP-Schreib- oder Approval-API. Quellcode, Paket, Installation und
frische Host-Sitzung benötigen getrennte Nachweise. Die ursprünglichen Quellenbeobachtungen vom
30. September werden durch diese redaktionelle Zusammenführung nicht zu neuen Host-Nachweisen.

Die Zuständigkeiten bleiben bei [Runtime-Verträgen](../../plugins/agdf/meta/contracts/),
[Kontrollauswertung](../../packages/core/lib/control-evaluation/) und
[Kontrollzustand](../../packages/core/lib/control-state/). Die Adaptergrenze ist außerdem unter
[CG-MCP-DISPATCH-ADAPTER](../../.agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter) festgehalten.
Die [Zuständigkeitsübersicht des Bestands](01-systemarchitektur.md#2-bausteine-und-verantwortlichkeiten)
ordnet diese Komponenten ein.

## Einordnung der früheren fachlichen Gruppen

Die Gruppen waren Nutzerabsichten, keine beschlossenen API-Namen. Ihre weitere Ausarbeitung folgt
den logischen Operations-IDs im gemeinsamen Zielbild:

| Frühere Gruppe | Zugehörige Operationen im Gesamtkonzept | Dort behandelte Verantwortung |
|---|---|---|
| Auftrag und Bindung | OP-03, OP-04 | Umfang zuordnen und gebundene Arbeit fortsetzen |
| Kontrollabfrage | OP-01, OP-02, OP-08 | Zustand, Artefakte und konkrete Aktionsberechtigung auswerten |
| Entscheidungsvorbereitung | OP-05 | Exakten Entscheidungsgegenstand vorbereiten und seine Bindung speichern |
| Zustandsänderung | OP-06, OP-07 | Menschliche Entscheidung oder internen Schritt über kanonische Writer aufzeichnen |
| Im Gesamtmodell ergänzte Ergebnisprüfung | OP-09 | Tatsächliche Änderungen und Nachweise erfassen und prüfen |
| Im Gesamtmodell ergänzte Signale | OP-10 | Änderung beziehungsweise Ungültigwerden signalisieren, ohne Berechtigung zu erteilen |

**Vorschau und Vorbereitung sind getrennt.** Die frühere Formulierung „Vorbereitung bleibt lesend“
war zu weit gefasst. Eine Vorschau des Evaluators ist lesend.
[`run-present`](../../packages/core/lib/control-state/run-presentation.js) speichert dagegen einen
Vorbereitungsbeleg mit einer Bindung an Run, Gate, Revision und Inhalt. Dies ist ein vorbereitender
Schreibzugriff, aber keine Freigabe. Die menschliche Entscheidung wird danach durch einen eigenen
Vorgang erfasst. Eine künftige MCP-Bereitstellung muss diese Wirkungen getrennt ausweisen.

Die damalige Forderung nach host-verifizierbarer menschlicher Eingabe ist eine Anforderung für einen
stärkeren Entscheidungsweg, kein Nachweis einer vorhandenen Fähigkeit. Das Gesamtkonzept benennt
den bestehenden kooperativen Weg und die Voraussetzungen für unabhängig bestätigte Eingaben.
Die [Entscheidungsdarstellung](03-agentenkontrolle-zielbild.md#5-menschliche-entscheidungen-und-gemeinsame-darstellung)
und [Host-Matrix](03-agentenkontrolle-zielbild.md#8-matrix-der-host-fähigkeiten-und-nachweise) gelten für diese Einordnung.

## Verbleibende Schnittstellenfragen

Diese Fragen betreffen die spätere konkrete Vertragsgestaltung innerhalb des Zielbilds.
Sie sind keine zweite Produktroadmap und setzen keine bereits festgelegte Kontrollpflicht außer Kraft.

| Zu klärende Frage | Bezug im Zielbild | Erforderliche Grundlage |
|---|---|---|
| Welche Operation bleibt Teil von Dispatch/Inspect, welche braucht einen eigenen Vertrag? | OP-01 bis OP-09; R-04 | Konkreter Konsument und Anwendungsfall; eine kanonische Zuständigkeit für Beschreibung, Schema und Semantik |
| Welche Inhalte erscheinen als Resource und wie bleiben Zugriff, Bindung und Aktualität sichtbar? | OP-01/OP-02; R-04 | Ressourcenidentität, Zugriffsgrenze, Herkunft und Kennzeichnung veralteter Stände |
| Welche Fehler-, Versions-, Wiederholungs- und Wiederherstellungsverträge gelten je Operation? | Operationskatalog; R-04 | Exakte Wirkungsgrenze, Operationsidentität, Nutzlastkonflikte und Behandlung unbekannter Ergebnisse |
| Wie wird eine menschliche Antwort an Darstellung und Entscheidungsgegenstand gebunden? | OP-05/OP-06; R-04/R-05 | Gewähltes Absicherungsniveau, qualifizierter Antwortkanal und Zurückweisung falscher oder veralteter Bindungen |
| Welche nativen Formulare, Resources, Prompts oder Ereignisse tragen die Zielhosts tatsächlich? | Host-Matrix; R-05/R-06 | Version, Konfiguration und getrennte Protokoll-, Installations- und Live-Nachweise |
| Wie werden unnötige Statuswiederholungen und fehlgeschlagene Darstellungen vermieden? | OP-04/OP-05; R-04/R-05 | Aktuelle nächste Operation, gültige Runtime-Bindung und Prüfung der erforderlichen Sprache/Zusammenfassung vor der Darstellung |

Die Rollen der MCP-Primitiven stehen im Operationskatalog: Tools vermitteln validierte Operationen;
Resources, Prompts, Elicitation und UI-Erweiterungen werden nach Bedarf und qualifizierter Fähigkeit
gewählt. Ereignisse signalisieren Änderungen und lösen erneute Zustandsprüfung aus. Ein Empfang
oder eine Transportbestätigung erteilt keine Arbeits- oder Gate-Freigabe.

Die Umsetzung folgt R-04 bis R-06 und ihren Abhängigkeiten zu R-01 bis R-03. Die bestehenden
Interfaces bleiben maßgeblich, bis ein eigener freigegebener Umsetzungsumfang ihren kanonischen
Vertrag und Kompatibilitätspfad ändert. Hier werden weder eine Migrationsfrist noch eine Umstellung
oder zusätzliche Runtime-Fähigkeiten festgelegt.

## Historischer Diskussionsinput vom 29. September 2026

Die folgenden Punkte stammen aus dem damaligen Dokumentationslauf und bleiben als historische
Beobachtungen erhalten. Sie sind Diskussionsinput, keine verbindlichen Architekturentscheidungen:

- **Fortsetzung:** Nach einer ausdrücklichen Fortsetzung sollte der Agent den angezeigten nächsten
  Schritt ausführen, statt dieselbe Statuskarte erneut aufzurufen.
- **Präsentations-Preflight:** Berichtssprache, Interaktionssprache und erforderliche lokalisierte
  Zusammenfassung sollten vor dem ersten Freigabeversuch gemeinsam validiert werden.
- **Einmalige Berichtrevision:** Der QA-Bericht sollte vor dem Speichern vollständig auf
  Pflichtfelder und Presenter-Kompatibilität geprüft werden, damit unnötige Revisionen und
  abgelehnte Präsentationen entfallen.
- **Konsistente Runtime-Bindung:** Die tatsächlich ausführbare CLI-Bindung sollte aus derselben
  verifizierten Runtime-Quelle stammen wie der Dispatcher; ein Pfadfehler führte hier zu einem
  zusätzlichen Aufruf.
- **Gespräch oder Dateiänderung:** Eine Bitte, etwas „in der Diskussion“ aufzugreifen, sollte im
  Gespräch beantwortet werden, solange kein Dokumentieren oder Ändern verlangt ist. Das verhindert
  unnötige Datei- und Kontrollpfade bei einer gewünschten Diskussion.
