# MCP-Schnittstellen im gemeinsamen Zielbild

Diese Seite erklärt bestehende MCP-Zuständigkeiten, die belegten Codex-Erkenntnisse und
verbleibende Fragen zum gemeinsamen Zielbild. Sie ergänzt die bestehenden Verträge.

| Deine Frage | Weiter zu |
|---|---|
| Wie entwickle ich eine Schnittstelle? | [MCP-Integrationsrichtlinien](09-mcp-integrationsrichtlinien.md) |
| Wie ist der vorhandene Aufrufweg aufgebaut? | [Zuständigkeiten und Entwicklungsstand](#ausgangspunkt-und-nachgeführter-entwicklungsstand) |
| Was haben die echten Codex-Läufe gezeigt? | [Ursache und Lösung](#belegte-erkenntnisse-zur-codex-mcp-inspektion), danach [Nachweisgrenzen](#nachweiskette-und-qualifikationsgrenzen) |
| Welche Vertragsfragen bleiben offen? | [Verbleibende Schnittstellenfragen](#verbleibende-schnittstellenfragen) |

**Dokumentrolle:** ergänzende Erklärung, nicht normativ. Der
[datierte Dokumentbezug](#datierte-einordnung-und-quellenbezug) nennt ursprünglichen Umfang und
spätere Nachträge. Die redaktionelle Neuordnung vom 26. Oktober 2026 lässt deren Grenzen unverändert.

Der [Architektur-Einstieg](README.md) zeigt die Zusammenhänge. Die
[Bestandsbeschreibung](01-systemarchitektur.md#32-mcp-werkzeugweg) und der
[Dispatcher-Katalog](02-dispatcher.md#use-case-katalog) erklären das implementierte Verhalten.
Eine Dokumentzuordnung beschließt keine neuen Tool-Namen, Schemata oder Schreibberechtigungen.

## Gemeinsame Schnittstelle für UI Hosts

Die [Architekturentscheidung zur Host-Schnittstelle](07-ui-konzept.md#architekturentscheidung-zur-gemeinsamen-host-schnittstelle)
legt MCP für Werkzeuge, Daten und Ressourcen sowie MCP Apps für interaktive Oberflächen fest.
Fachliche Regeln und gebundene Entscheidungen bleiben über kompatible Hosts hinweg gleich;
Darstellung und Fortsetzung nutzen die jeweils bestätigten Fähigkeiten. CopilotKit ist eine
optionale Implementierung eines eigenen Webhosts, keine Voraussetzung für andere Hosts.
Die zentrale Entscheidung beschreibt auch die unterstützten Textwege und den Nachweis pro
Host und Fassung. Sie ist ein Portabilitätsziel und kein allgemeiner Kompatibilitätsnachweis.

Die nutzerseitige Ausgabe kennt dabei ausschließlich
[MCP-App-UI und Portable Markdown](07-ui-konzept.md#verbindliche-darstellungsformate).
`auto` bezeichnet nur die Auswahlstrategie. Protokollfähigkeit, vertrauenswürdige
Host-Präferenz, Qualifizierung des konkreten Hoststands und bestätigte Anzeige bleiben
getrennte Eingaben dieser Auswahl. Sie dürfen nicht durch ein gewöhnliches, vom Modell
befüllbares Werkzeugargument ersetzt werden. Ohne bestätigte MCP-App-Darstellung liefert der
Adapter die vollständige Portable-Markdown-Darstellung; dadurch entsteht weder eine native
Klickqualifizierung noch ein stärkerer Herkunftsnachweis für die Antwort.

## Ausgangspunkt und nachgeführter Entwicklungsstand

Der reguläre Server vermittelt Dispatch, Inspect und im Repository-Entwicklungsstand die
aktivierten begrenzten Befehlsgruppen. Sie teilen sich die Core-Dienste mit der CLI. Seit dem lokalen
Cockpit-Umsetzungsstand vom 6. Oktober 2026 besteht daneben eine separate private MCP-App mit
`agdf_cockpit`, `agdf_cockpit_read` und `ui://agdf/cockpit/v1.html`. Ihre
[Bestandsbeschreibung](06-agdf-cockpit.md) erklärt Run-Bindung, Leseansichten, Kontextübergabe
und offene native Host-Nachweise. Diese lokale Implementierung verwirklicht nicht automatisch
die übrigen Operationen des Zielbilds und ist keine allgemeine Schreib-/Approval-Schnittstelle.

Die Ausgangsverträge `agdf_dispatch` und `agdf_inspect` bleiben bestehen. Dispatch liefert nach
Zielbindung eine Kontrollantwort oder begrenzte Fortsetzung; Inspect liest Kontrollstand, Verträge,
Präsentationsdokumente und Operationsstatus. Hinzu kommen `agdf_prepare`, `agdf_record`,
`agdf_approve`, `agdf_revise` und `agdf_closeout` als konfigurierbare feste Befehlsgruppen.
Sie vermitteln exakte Operationen für Vorbereitung, Erfassung, Entscheidung, Revision und Abschluss.
Der [Befehlsvertrag](../../packages/core/lib/control-state/run-command-contract.js) besitzt ihre
Schemas und Wirkungsgrenzen; der [Befehlsdienst](../../packages/core/lib/control-state/run-command-service.js)
delegiert an die bestehenden Writer.
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
Die begrenzte Dispatch-Korrektur und die zusätzlichen Befehlsgruppen sind getrennte Aufrufwege.
Die Befehlsgruppen bieten keine beliebigen Datei-, Shell- oder Netzwerkaktionen. Der Codex-Decision-
Zweig vermittelt eine an das exakte Material gebundene Ansicht. Die aktuelle Karte bietet nur
den Freigabebutton; Änderungen und Ablehnung werden im Chat geklärt, obwohl die kanonischen
Entscheidungsverträge diese Wirkungen unterstützen. Klickentscheidungen erfordern
zusätzlich native Qualifizierung. Quellcode, Paket, Installation und frische Host-Sitzung benötigen
getrennte Nachweise. Die ursprünglichen Quellenbeobachtungen vom
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
Vorgang erfasst. Im nachgeführten Entwicklungsstand vermittelt `agdf_prepare` diese Vorbereitung;
`agdf_approve` erfasst die bewusste Freigabe separat. Die Wirkungen bleiben getrennt.

Die damalige Forderung nach host-verifizierbarer menschlicher Eingabe ist eine Anforderung für einen
stärkeren Entscheidungsweg, kein Nachweis einer vorhandenen Fähigkeit. Das Gesamtkonzept benennt
den bestehenden kooperativen Weg und die Voraussetzungen für unabhängig bestätigte Eingaben.
Die [Entscheidungsdarstellung](03-agentenkontrolle-zielbild.md#5-menschliche-entscheidungen-und-gemeinsame-darstellung)
und [Host-Matrix](03-agentenkontrolle-zielbild.md#8-matrix-der-host-fähigkeiten-und-nachweise) gelten für diese Einordnung.

## Belegte Erkenntnisse zur Codex-MCP-Inspektion

Diese Nachführung erläutert die bestehenden Entscheidungen SDD-001 bis SDD-009 aus dem
[Solution Design](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/SD.md#3-architecture-decisions).
Sie schafft keine zusätzliche Vertrags- oder Freigabeinstanz. Der vorhandene
[Context-Graph-Knoten CG-MCP-DISPATCH-ADAPTER](../../.agdf/control/CONTEXT_GRAPH.md#cg-mcp-dispatch-adapter)
verknüpft dieses Wissen mit denselben Ownern.

### Ursache, Entscheidung und bestehender Owner

**Gültiges Schema und sichtbare Eingaben sind verschiedene Nachweise.** Im installierten
Codex-Renderer verdeckte die Typ-Projektion des Wurzel-`allOf` die danebenstehenden `properties`:
Sichtbar blieben zwei Felder/zwei Operationswerte, weitere Teile erschienen als `unknown`.
Dieselben Bedingungsknoten unter `dependentSchemas.operation` zu verschieben macht alle 14 Felder
und elf Operationen sichtbar. Weil `operation` erforderlich bleibt, werden die Bedingungen für
jede zulässige Anfrage ausgewertet. [Ursachenbeobachtung](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/prestudy/agdf-inspect-evaluation/REPORT.md#ursache-und-lösung)
und [tatsächlicher Signaturmitschnitt](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/pair-guidance/renderer/capture/signature.ts)
belegen den konkreten Hoststand; die SDK-Parität prüft die Annahmesemantik separat.

**Sichtbarkeit allein reicht nicht.** Beide realen B-Läufe der isolierten Schema-Variante
beendeten die Aufgabe ohne die verlangte Freigabe. Beispielsweise war `gate-check` gültig,
mit dem dort unzulässigen `gate` aber vom SDK abgewiesen. Die Fehlermeldung lenkte auf den
Operationswert statt auf den Feldkonflikt. Ein späterer Produktlauf benötigte noch einen
Zusatzaufruf wegen `target_source` ohne `primary_target`. Klare Anwendbarkeit, ein sichtbares
Pflichtpaar und vollständige Leseangaben gehören deshalb zur Lösung. Die [A/B-Originale](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/prestudy/agdf-inspect-agent-ab/REPORT.md)
bleiben erhalten: Weniger Aufrufe durch einen Aufgabenabbruch sind kein Effizienzgewinn.

| Entscheidung | Konkrete Lösung und Grenze | Code und Prüfpfad |
|---|---|---|
| SDD-001: sichtbare Projektion, gleiche Validierung | Dieselben Bedingungen und Ablehnungen; gemeinsame Selektorabbildung. Kein privater SDK-Patch oder zweites Host-Schema. | [Inspect-Vertrag](../../packages/core/lib/control-inspect/contract.js), [Paritätsprüfung](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/validation/pair-contract-checks.mjs), [CLI-Regression](../../packages/cli/scripts/control-inspect-test.js) |
| SDD-002/004: gebundene Lesehinweise | Nur ausdrückliches Zielpaar/passender benannter Run. Kanonische Zielidentität, Revision, Befehlsdeskriptoren und Katalogargumente; bekannte exakte Dokumentbindung hat Vorrang. | [Inspect-Service](../../packages/core/lib/control-inspect/service.js), [Katalog-/Dokument-Owner](../../packages/core/lib/control-state/run-presentation.js), [SDK-/STDIO-Regression](../../packages/mcp-server/test/protocol.test.js) |
| SDD-003/008: Zusatzhinweis ohne Autorität | Optionales `navigation` außerhalb des ursprünglichen Berichts. Zusatzfehler lassen den Bericht intakt; ursprüngliche Evaluatorfehler werden nicht geschluckt. Writer und bewusste Freigabe bleiben maßgeblich. | [Inspect-Service](../../packages/core/lib/control-inspect/service.js), [Fehlerinjektion/Berichtsparität](../../packages/cli/scripts/control-inspect-test.js) |
| SDD-006/007: normale Produkt- und Budgetprüfung | Host-Signatur, SDK-Annahme, Aufgabenerfüllung und normale Build-/Profilprüfung getrennt nachweisen. Ein vollständig operationsweise verzweigtes Schema mit 6.630 Byte scheiterte an der unveränderten 5.000-Byte-Grenze. | [Verworfene Varianten](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/prestudy/agdf-inspect-evaluation/DECISION-NOTES.md), [Budget](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/pair-guidance/checks/budget.json) |

Die [konkrete Lesefolge](core-mcp-command-flow.md#gebundene-lesefolge-vor-einer-entscheidung)
zeigt eine gültige Anfrageform und sequenzielle Argumentübernahme. Historische Dokumente behalten
ihre ursprüngliche Revision; aktuelle Operationsverträge nutzen die aktuelle Revision. Der
Katalog legt Gate-Filter und Vollständigkeit offen; Eindeutigkeit innerhalb dieses Umfangs ist
keine globale Dokumenteindeutigkeit. Fehlende oder mehrdeutige Daten erzeugen kein Ersatzdokument.
Historische Lesbarkeit erteilt keine neue Freigabeberechtigung.

### Eine geerbte Schutzschicht für die native Qualifikation

Die zunächst verschachtelte Sandbox-Anwendung scheiterte auf dem geprüften macOS-Host mit
`sandbox_apply`, Exit 71, vor der Kontoprüfung. Das war kein Anmeldefehler. SDD-009 verwendet
deshalb den vorhandenen T7-Controller als einzige Stelle für eine kombinierte, an den gesamten
Worker-Prozessbaum vererbte OS-Policy. Der Run-Launcher liefert nur gebundene Pfade und bewahrt
Ergebnisse auf; er startet keine zweite Sandbox.

Geschützt sind der gesamte Original-ROOT und dieselben drei persönlichen Einstellungspfade,
auch bei fehlenden Dateien: `config.toml`, `plugins/installed_plugins.json` und
`plugins/known_marketplaces.json`. Vor Konto-, MCP- und Modellaktionen prüft der Worker Policy-/
Quellbindung, tatsächliche Ablehnung eines Append-Öffnens bestehender ROOT-/Config-Dateien ohne
Datenänderung und erlaubtes Schreiben/Lesen/Löschen einer eigenen temporären Kontrolldatei.
Ein Flag allein beweist keinen aktiven Schutz. Ein frischer Vorlauf reserviert keine Sitzung;
der Controller reserviert zwei Slots exklusiv vor dem Start. Aufbau, Sitzungen und Abbau sind
begrenzt; beendet werden nur eigene Prozessgruppen.

Für die normale Kohorte gelten zehn Minuten je Sitzung und 25 Minuten für das gesamte Fenster
aus Aufbau, zwei Sitzungen und Abbau, einschließlich fünf Sekunden Reserve für Beenden/Einholen.
Eine fehlgeschlagene Sitzung erneuert kein Budget. API-/Provider-Ausweichwege, Login,
Zugangsdatenkopie, globale Einstellungsänderung und automatische Ersatzläufe sind ausgeschlossen.

Owner und Nachweise: [T7-Einstieg](../../scripts/native-probes/codex-host-e2e.mjs),
[Guard-Modul](../../scripts/native-probes/lib/codex-command-guard.mjs),
[Schutz-/Timeout-Tests](../../scripts/native-probes/codex-command-task-test.mjs),
[SDD-009](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/SD.md#one-combined-native-qualification-guard)
und [integrierter Vorlauf](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/qualification/pair-guidance-01/preflight-summary.json).
Das ist die Absicherung dieses vertrauenswürdigen lokalen Testablaufs, kein allgemeiner
Sandbox-Nachweis für den regulären MCP-Server oder andere Hosts.

### Nachweiskette und Qualifikationsgrenzen

| Phase und Originalquelle | Tatsächliches Ergebnis | Grenze |
|---|---|---|
| [A/B-Untersuchung](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/prestudy/agdf-inspect-agent-ab/REPORT.md) | Baseline: 13/15 Aufrufe, 7/9 SDK-Fehler, beide Fixture-Effekte erzielt, nur 1/2 streng qualifiziert. Schema-Variante: 6/8 Aufrufe, 3/4 SDK-Fehler, 0/2 Aufgaben abgeschlossen. | Zwei Läufe je Variante; kürzere abgebrochene Aufgaben sind keine Verbesserung. |
| [Geführter Prototyp](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/prestudy/agdf-inspect-evaluation/REPORT.md) | Endgültiger Prototyp 4/4 streng erfolgreich, je vier Aufrufe/null SDK-Fehler. | Zwei unveränderte T7-Aufgaben plus zwei vorher festgelegte Formulierungsvarianten; kein Produktnachweis. |
| [Erste Produktkohorte](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/qualification/renewed/native-summary.json) | Beide ursprünglichen/strengen Prüfer bestanden; Vier-Aufruf-/Null-Fehler-Kriterium nur 1/2: fünf Aufrufe/ein Fehler gegenüber vier/null. | Vor der ausdrücklichen Paarbeschreibung; ein breites Erfolgssignal wird nicht in volle PRD-Erfüllung umgedeutet. |
| [Finale Produktkohorte](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/qualification/pair-guidance-01/native-summary.json) | 2/2 ursprüngliche/strenge Erfolge, je eine beabsichtigte UR-Freigabe, vier MCP-Aufrufe, null SDK-/sonstige Fehler, keine Shell-Umwege und vollständige Traces. | Genau der normale T7-Ablauf auf dem benannten eingefrorenen Laufzeitstand. |

Die finale Kombination umfasst Codex CLI **0.163.0**, **gpt-6.1-sol / Reasoning low**, Node
**22.22.3**, **darwin x64 / 24.6.0** und das bestehende ChatGPT-Konto. Vier reale Produktsitzungen
wurden über zwei freigegebene Kohorten verbraucht; Vorstudien bleiben separat. Zwei finale Erfolge
beweisen weder allgemeine Modellzuverlässigkeit noch alle elf Operationen, andere Hosts,
menschliche UI-Sichtung oder installierte Release-Qualifikation. Die [Primärquellen der damaligen Untersuchung](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/prestudy/agdf-inspect-evaluation/REPORT.md#anerkannte-quellen)
erklären ihre Quellenbasis; projektspezifische Wirkungen belegen unsere Originalbeobachtungen.

Geprüft wurden **247.003 SDK-Fälle ohne Annahmeunterschied**, **160 eingefrorene Core-Erwartungen**
und **24 Originaleingaben mit weiterhin abgelehnten 15 ursprünglichen SDK-Fehlern**. Absichtliche
Negativtests sind von null Fehlern im positiven T7-Ablauf zu unterscheiden. [Schema-/Replay-Ergebnisse](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/pair-guidance/checks/schema-parity.json),
[Szenariozuordnung](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/qualification/pair-guidance-01/applicability.json),
[QA-Bericht](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/QA_REPORT.md)
und [Abschlussbericht](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/OR.md)
verbinden Kriterien, Code, Prüfungen, bewusste QA/UAT-Freigaben und Grenzen.

Unveränderte Budgets: Inspect **4.993/5.000 Byte**, je Befehl höchstens **8.192 Byte**, Befehle
plus Decision-Fassade **24.509/24.576 Byte**, Ein-/Ausgabe **65.536/1.048.576 Byte**, Copilot
**397 Dateien / 3.509.461 Byte**, exakt an seiner Grenze. Die feste **20-Cold-/20-Warm-Prüfung**
misst p95 **701,422/426,184 ms** gegenüber **1.500/1.000 ms**. Kleinere Prototyp-Payloads und
dessen andere Cold-Stichprobe bleiben historische Messungen. [Budget](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/pair-guidance/checks/budget.json)
und [feste Leistungsmessung](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/pair-guidance/checks/performance.json)
belegen die Zahlen; diese Dokumentation erhöht keine Grenze.
Die feste Cold-Messung umfasst den neuen Client-/Server-Aufbau bis einschließlich `tools/list`;
Warm misst `agdf_dispatch` über einen bestehenden Client. Die Cold-RPC-Messung der Vorstudie
begann dagegen erst nach dem Handshake. Diese unterschiedlichen Messgrenzen erlauben keinen
direkten Geschwindigkeitsvergleich. Methodischer Owner bleibt der [bestehende Performance-Test](../../packages/mcp-server/test/performance.test.js).

Nach den nativen Läufen wurden ausschließlich zwei Testannahmen berichtigt: die negative Guard-
Prüfung erwartet die Meldung auf `stderr`; der spätere CI-Nachlauf aktualisiert veraltete
Beschreibungspins im [Funktionsvertragstest](../../packages/cli/scripts/skill-dispatch-function-contract-test.js).
[Direktkorrektur und Attribution](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/DIRECT_FIX_AUTHORIZATION_04.md)
sowie der [19.339-Pfade-Abgleich](../../.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/evidence/direct-fix-04/assessment.json)
gehören zur ersten Korrektur; der spätere [CI-Testcommit](https://github.com/ArndtGold/ai-native-governance-delivery-framework/commit/b7658fc17c57f2dab14a8d3f47046dadb37f31a0)
ändert nur die zweite Testdatei. Laufzeit-, Guard-, Aufgaben- und Auditquellen blieben gleich;
Originalmanifeste wurden nicht nachträglich angepasst und keine neuen nativen Läufe behauptet.
Der [PR-CI-Lauf](https://github.com/ArndtGold/ai-native-governance-delivery-framework/actions/runs/40227271511)
bestand; einschließlich Cloudflare waren 119/119 PR-Checks grün. Das ist keine neue native
Modellmessung und keine Release-Freigabe.

## Verbleibende Schnittstellenfragen

Diese Fragen stammen aus der Vertragsdiskussion des Zielbilds. Der
[Befehlsfluss](core-mcp-command-flow.md) beschreibt die inzwischen konkretisierte Teilmenge:
feste Befehlsgruppen, exakte Bindungen sowie Wiederholungs- und Wiederherstellungsregeln.
Die folgende Tabelle bleibt für darüber hinausgehende Operationen und noch offene Host-Fähigkeiten
relevant. Sie ist keine zweite Produktroadmap und setzt keine Kontrollpflicht außer Kraft.

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

Die Umsetzung folgt R-04 bis R-06 und ihren Abhängigkeiten zu R-01 bis R-03. Die kanonischen
Verträge und ihr Kompatibilitätspfad bleiben maßgeblich. Neue Entwicklungsoperationen bestätigen
für sich genommen keine veröffentlichte oder auf einem Host geladene Schnittstelle. Hier werden
weder eine Migrationsfrist noch eine Umstellung oder zusätzliche Runtime-Fähigkeiten festgelegt.

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

## Datierte Einordnung und Quellenbezug

**Dokumentrolle: ergänzende Schnittstellenfragen, nicht normativ.** Die ursprüngliche Diskussion
vom 30. September 2026 ist seit der redaktionellen Zusammenführung am 2. Oktober 2026 dem
[Gesamtkonzept zur Agentenkontrolle](03-agentenkontrolle-zielbild.md) zugeordnet. Dort stehen der gemeinsame
[Operationskatalog](03-agentenkontrolle-zielbild.md#7-mcp-operationskatalog-für-den-gesamten-lebenszyklus)
und die [Umsetzungsroadmap](03-agentenkontrolle-zielbild.md#10-abgleich-der-umfänge-und-umsetzungsroadmap).
Diese Seite ordnet die früheren fachlichen Gruppen ein und hält verbleibende MCP-Fragen fest.

**Abgleich: 12. Oktober 2026, Repository-Quelle.** Der konkrete Entwicklungsstand der begrenzten
Befehlsgruppen steht im [Befehlsfluss zwischen Core und MCP](core-mcp-command-flow.md).
Diese Ergänzung ersetzt weder den gemeinsamen Operationskatalog noch seine Roadmap.

**Nachführung vom 26. Oktober 2026:** Die [belegten Erkenntnisse zur Codex-MCP-Inspektion](#belegte-erkenntnisse-zur-codex-mcp-inspektion)
erklären den mit [PR #33](https://github.com/ArndtGold/ai-native-governance-delivery-framework/pull/33)
gemergten Umfang (`a41af840876bde1473618867d12218e63270ce9a`). Der frühere Schnittstellenabgleich
wird um diese Implementierungs- und Qualifikationsnachweise ergänzt.

Für weitere Schnittstellen bündeln die [MCP-Integrationsrichtlinien](09-mcp-integrationsrichtlinien.md)
die daraus abgeleiteten Entwicklungs- und Review-Kriterien. Der folgende historische Befund
bleibt deren konkrete Nachweisbasis; Host-Sonderfälle werden nicht zu allgemeinen MCP-Regeln.
