# Brownfield Review: Geführte MCP-Aktivierung während der AGDF-Installation

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`
Date: 2026-09-08

## Run

- run_id: `agdf-guided-mcp-activation`
- related_ur: `.agdf/control/artefacts/agdf-guided-mcp-activation/UR.md`
- reviewed_ur_revision: 1
- reviewer: Codex
- reviewed_at: 2026-09-08

## Ziel

Den freigegebenen Installationsbedarf in der bestehenden CLI-, Installer- und MCP-Architektur
verorten, vorhandene Owner wiederverwenden und den notwendigen Delivery-Pfad festlegen, ohne eine
zweite Installations-, Consent-, Lifecycle- oder Dispatch-Implementierung zu schaffen.

## UI-/UX-Auswirkung

- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: Die Änderung verbindet vier Installationsoberflächen mit einer neuen
  sicherheitsrelevanten Entscheidung über lokale ausführbare MCP-Registrierung. Sie verändert die
  primäre Installationsaktion, sichtbare Teilzustände, Nicht-TTY-Verhalten, Update, Neustart,
  Recovery und Entfernung über mehrere Hosts hinweg.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
- ux_intent_definition_evidence:
  `.agdf/control/artefacts/agdf-guided-mcp-activation/UX_INTENT_DEFINITION.md`

## Bestehendes System

| Bereich | Bestehender Owner oder Nachweis | Aktuelle Abdeckung | Bedeutung für diesen Run |
|---|---|---|---|
| Öffentliche CLI-Komposition | `create-agdf/lib/cli/application.js`, `parse-args.js`, `command-registry.js` | Plugin-Installationsbefehle und `mcp status/enable/disable` sind vorhanden, aber getrennt | Eine dünne gemeinsame Setup-Orchestrierung gehört in die bestehende CLI-Komposition. |
| Plugin-Installation | `create-agdf/lib/installers/`, `host-adapters/` | Codex, Claude Code, Copilot und OpenCode besitzen native Installationswege und Verifikation | Bestehende Installer aufrufen; keine MCP-Logik in Host-Installer kopieren. |
| Lokale Entwicklung | `create-agdf/scripts/install-local-plugin.js` | Führt `release:prepare` aus und delegiert danach an `runCli([surface])` | Zusätzliche Optionen können an denselben öffentlichen Handler weitergereicht werden. |
| MCP-Lebenszyklus | `create-agdf/lib/mcp-lifecycle/` | Status, Enable, Disable, exakte Runtime, Host-Adapter, Herkunft, Referenzen und Rollback existieren | Ausschließlich `runMcpLifecycle` wiederverwenden. |
| MCP-Semantik | `create-agdf/lib/skill-dispatch/contract.js`, `agdf-mcp-server/` | `agdf_dispatch` hat einen kanonischen semantischen Owner und zwei kontrollierte Protokollspuren | Keine Änderung oder Kopie der Tool-Semantik. |
| Installationsinteraktion | `create-agdf/lib/runtime-check-consent/`, Funktionen in `application.js` | Interaktive Auswahl, technische Details, Nicht-TTY-Default und Cancel existieren für automatische Checks | Interaktionsmechanik wiederverwenden; MCP-Zustimmung bleibt fachlich getrennt. |
| Installationsdarstellung | `create-agdf/lib/lifecycle/result.js`, `lifecycle/presentation.js` | Plugin-, Runtime-Check-, Restart- und Fehlerzustände werden gemeinsam ausgegeben | Das Ergebnis um einen getrennten MCP-Teilzustand erweitern statt einen zweiten Renderer zu bauen. |
| MCP-Darstellung | `create-agdf/lib/mcp-lifecycle/result.js`, `presentation.js` | Stabile Codes und lokalisierte Statusausgabe existieren | MCP-Ergebnis einbetten oder referenzieren, ohne seine Zustandsbedeutung umzubenennen. |
| Deaktivierung und Entfernung | `create-agdf/lib/lifecycle/operations.js`, `application.js`, MCP `disable` | Plugin- und MCP-Entfernung sind unabhängig und herkunftsgeprüft | PRD muss die Nutzerreise koppeln; SD muss beide bestehenden Transaktionen erhalten. |
| Cross-Host-Baseline | `agdf-cross-host-mcp-integration` | Server, Lifecycle, vier Adapter, Sprache, Dual-Protokoll und begrenzte Host-Evidenz sind geliefert | Dieser Run erweitert nur die Installationsreise. |
| Test- und Releasekette | CLI-, Runtime-Consent-, Lifecycle-, MCP- und lokale Installationstests sowie `smoke-test` | Starke getrennte Regressionen, noch keine gemeinsame Setup-Matrix | Gemeinsame Vertrags- und Orchestrierungstests plus getrennte direkte Host-Evidenz ergänzen. |

## Aktuelle Abdeckung und Wiederverwendung

| Anliegen | Abdeckung | Strategie |
|---|---|---|
| Plugin-Installation je Host | `fully_done` | `extend`: Handler komponieren, native Installer unverändert wiederverwenden. |
| MCP-Status, Aktivierung und Entfernung | `fully_done` | `extend`: vorhandenen Lifecycle-Service aufrufen und Ergebnis erhalten. |
| Ein gemeinsamer Installationsablauf | `not_done` | `new` nur als dünne Orchestrierung im bestehenden CLI-Owner. |
| Interaktive MCP-Auswahl | `partially_done` | `extend`: vorhandene Eingabe-/Detailmechanik nutzen, eigene MCP-Entscheidungssemantik definieren. |
| Nichtinteraktive MCP-Auswahl | `not_done` | `extend`: Parser und Command Registry um ausdrückliche Installationsoptionen ergänzen. |
| Gemeinsame effektive Statusausgabe | `partially_done` | `extend`: bestehendes Lifecycle-Ergebnis um MCP-Teilstatus ergänzen. |
| Teilfehler und Wiederaufnahme | `partially_done` | `extend`: bestehende Plugin- und MCP-Transaktionen durch einen sichtbaren Kompositionsvertrag verbinden. |
| Update mit versionsgleicher Runtime | `partially_done` | `extend`: MCP-Herkunft und Idempotenz wiederverwenden; Reihenfolge im SD festlegen. |
| Gekoppelte Entfernung | `partially_done` | `extend`: Plugin-Uninstall und MCP-Disable getrennt herkunftsprüfen und im UX-Vertrag zusammenführen. |
| Direkte Host-Evidenz | `partially_done` | `extend`: frühere MCP-Spuren nicht umdeuten; neue Installationsreise pro exaktem Host-Tupel beobachten. |

## Wiederverwendungsentscheidung

- reuse_strategy: `extend`
- selected_path: Eine neue Setup-Koordinationsfunktion im bestehenden CLI-Kompositionsbereich ruft
  zuerst die bestehende Installationsentscheidung und den nativen Plugin-Installer auf und danach,
  nur bei ausdrücklicher Auswahl, den bestehenden MCP-Lifecycle. Sie sammelt beide Ergebnisse in der
  vorhandenen Lifecycle-Darstellung.
- no_new_owner: Kein neuer MCP-Server, Dispatcher, Host-Konfigurationsadapter, Consent-Store,
  Lifecycle-Service oder Renderer.
- minimal_clean_next_step: Zuerst die UX-Absicht für Auswahl, Teilzustand, Retry, Restart und
  Entfernung definieren; danach ein PRD mit beobachtbaren Anforderungen erstellen.

## Risiko paralleler Strukturen und Drift

| Befund | Risiko | Verbindliche Behandlung |
|---|---|---|
| MCP-Entscheidung könnte in Runtime-Check-Consent aufgehen | Zweideutige technische Zustimmung und falsche Wiederverwendung gespeicherter Entscheidungen | Gemeinsame Interaktionsmechanik, getrennte Entscheidung und getrennte effektive Zustände. |
| Jeder Host-Handler könnte MCP selbst aktivieren | Vier abweichende Produktverträge und Rollback-Pfade | Eine gemeinsame Orchestrierung über dem vorhandenen Adapterregister. |
| Lifecycle-Ergebnis könnte MCP-Erfolg aus Plugin-Erfolg ableiten | Falsches "vollständig eingerichtet" und unbelegte Discovery | Plugin, Hook, Registrierung, Discovery und Restart getrennt projizieren. |
| Uninstall könnte MCP pauschal mitentfernen | Verlust fremder oder gemeinsam genutzter Zustände | Beide Lifecycle-Owner prüfen Herkunft und Referenzen selbst; Komposition darf Ergebnisse nicht erfinden. |
| Lokaler Entwicklungsinstaller könnte Sonderlogik erhalten | Abweichung zwischen Quelle und veröffentlichtem CLI-Pfad | Das Skript bleibt dünn und delegiert an denselben `runCli`-Vertrag. |
| Dokumentation könnte Marketplace und CLI gleichsetzen | Unerwartete native Konfigurationsmutation | Marketplace-Installation und nachgelagerte geführte Aktivierung als getrennte Fähigkeiten ausweisen. |

## Auswirkungsanalyse

- interfaces: öffentliche Befehle `codex`, `claude`, `copilot`, `opencode`; neue ausdrückliche
  Installationsoptionen; maschinenlesbares Installationsresultat;
- runtime: nach erfolgreicher Plugin-Installation kann derselbe Prozess den vorhandenen lokalen
  MCP-Lifecycle ausführen und eine Host-Konfiguration verändern;
- persistence: bestehende native MCP-Konfiguration und AGDF-Runtime-Referenzen, ohne neues Format;
- compatibility: bisherige unbeaufsichtigte Aufrufe müssen ohne ausdrückliche MCP-Option weiterhin
  Plugin-only bleiben; interaktive Aufrufe erhalten eine neue Auswahl;
- recovery: Plugin- und MCP-Operation bleiben getrennt auswertbar; gemeinsamer Erfolg darf erst bei
  erfüllten Teilbedingungen erscheinen;
- tests: Parser, Interaktion, vier Handler, lokale Entwicklung, Idempotenz, Konflikte, Teilfehler,
  Update, Disable/Uninstall, Paket und direkte Host-Beobachtung;
- release: Änderung am öffentlichen CLI- und Installationsvertrag für vier Hosts.

## Mode-/Slice-Entscheidung

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `external_contract_depth` ist entscheidend, weil sich der öffentliche CLI- und
  Installationsvertrag ändert. `architecture_runtime_depth` und `release_cross_host_depth` gelten
  zusätzlich, weil Plugin- und MCP-Transaktionen, Recovery und vier unabhängig versionierte Hosts
  koordiniert werden müssen.
- evidence: freigegebene UR Revision 1; bestehende CLI-Komposition, Installer, MCP-Lifecycle,
  Runtime-Check-Consent und Lifecycle-Darstellung; abgeschlossener Cross-Host-MCP-Ausgangsstand.
- transparency_note: Quick Task und Verified Change sind wegen neuer Produktsemantik, öffentlichem
  CLI-Vertrag und Runtime-Mutation ausgeschlossen. Structured Slice ist ungeeignet, weil ein lokal
  akzeptierter Teilpfad die gemeinsame Update-, Recovery-, Entfernungs- und Cross-Host-Zusage nicht
  unabhängig erfüllen würde.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `external_contract_depth`
- decisive_full_depth_triggers: `architecture_runtime_depth`; `external_contract_depth`;
  `release_cross_host_depth`
- rejected_alternative: `structured_slice` ist abgelehnt, weil öffentlicher CLI-Vertrag,
  ausführbare lokale Runtime, native Host-Konfiguration, Teilfehler, Updates und vier Host-Consumer
  gemeinsam spezifiziert, getestet und ausgerollt werden müssen.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: UR Revision 1; `create-agdf/lib/cli/`; `create-agdf/lib/installers/`;
  `create-agdf/lib/mcp-lifecycle/`; `create-agdf/lib/runtime-check-consent/`;
  `create-agdf/lib/lifecycle/`; `create-agdf/scripts/install-local-plugin.js`;
  `.agdf/control/artefacts/agdf-cross-host-mcp-integration/`

| Check ID | Ergebnis | Evidenz |
|---|---|---|
| `coherent_outcome` | `pass` | Eine zusammenhängende Einrichtung mit klarer Plugin-only-Alternative und getrennten Teilzuständen. |
| `authority_boundary` | `fail` | Native Host-Konfiguration, Trust und Berechtigungen sind technische Autoritäten; AGDF-Gate-Autorität muss getrennt bleiben. |
| `owner_consumer_coordination` | `fail` | CLI-Komposition, Installer, Lifecycle, Consent, Status und vier Host-Consumer müssen koordiniert werden. |
| `full_depth_impacts_absent` | `fail` | Öffentlicher CLI-, Runtime-, Persistenz-, Recovery-, Release- und Cross-Host-Effekt ist vorhanden. |
| `migration_propagation_bounded` | `fail` | Bestehende Plugin-only-Installationen, passende und abweichende MCP-Runtimes sowie Updates benötigen einen Kompatibilitätspfad. |
| `failure_recovery_local` | `fail` | Teilfehler überschreiten einen einzelnen Owner und betreffen unterschiedliche native Hostzustände. |
| `independently_acceptable` | `fail` | Ein einzelner Host- oder Installer-Slice würde die freigegebene gemeinsame Nutzerreise nicht vollständig erfüllen. |

## Offene PRD- und SD-Fragen

| Frage | Owner | Auswirkung |
|---|---|---|
| Wie sieht die genaue Auswahl für Neuinstallation, Update und bereits passende Zustände aus? | PRD und UX Intent | blockiert PRD-Bereitschaft bis UX Intent `ready` ist |
| Bedeutet Abbrechen "vor jeder Installation" oder nur "kein MCP"? | PRD und UX Intent | Produktentscheidung erforderlich |
| Welche Teilzustände bestimmen "vollständig eingerichtet"? | PRD | Akzeptanz- und Darstellungskriterium |
| Wie verhält sich ein interaktives Update mit bereits registriertem MCP? | PRD | Zustimmung, Idempotenz und sichtbarer Zustand |
| Welche Optionen und Namen bilden den stabilen öffentlichen CLI-Vertrag? | PRD | Kompatibilität und Migration |
| Wo liegt die Setup-Orchestrierung und in welcher Reihenfolge laufen die Transaktionen? | SD | verhindert doppelte Ownership und unklaren Rollback |
| Wie werden Plugin- und MCP-Ergebnisse maschinenlesbar zusammengeführt? | SD | Schema- und Rendererentscheidung |
| Wie werden Disable und Uninstall ohne verwaiste oder fremde MCP-Zustände komponiert? | SD | Herkunft, Referenzen und Recovery |

## Context-Graph-Auswirkung

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-MCP-DISPATCH-ADAPTER`;
  `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: Nach freigegebenem Design die bestehende CLI-Komposition um den
  geführten Setup-Owner und den MCP-Knoten um die getrennte Installationsprojektion ergänzen.
- context_graph_gate_effect: `warning`
- context_graph_evidence: Der neue Pfad komponiert bestehende Owner und ändert deren Semantik nicht.

## Fehlende Evidenz

- Der spätere genaue Maschinenvertrag der gemeinsamen Installationsausgabe.
- Direkte neue Installationsbeobachtungen je Host und Betriebssystem.
- Native Windows-Ausführung und nicht automatisierbare Desktop-Varianten.

Diese Lücken verhindern spätere Design- oder Supportaussagen, aber nicht den PRD-Entwurf. Die UX
Intent Definition ist `ready`; öffentliche CLI-, Runtime- und Cross-Host-Wirkung sind für die
Structured-Delivery-Entscheidung direkt belegt.

## Nächster zulässiger Schritt

PRD Revision 1 aus UR, Brownfield Review und UX Intent Definition entwerfen. SD, TP,
Implementierung, Host-Mutation, QA, UAT, Release und VCS-Aktionen bleiben gesperrt.
