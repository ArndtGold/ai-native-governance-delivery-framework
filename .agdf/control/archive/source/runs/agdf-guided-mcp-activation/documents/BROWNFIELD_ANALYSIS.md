# Brownfield Analysis: Geführte MCP-Aktivierung während der AGDF-Installation

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/agdf-guided-mcp-activation/BROWNFIELD_ANALYSIS.md`
- run: `agdf-guided-mcp-activation`
- revision: 2
- date: 2026-09-09
- based_on: approved TP Revision 2, SD Revision 2 and PRD Revision 2
- source_baseline: `5397df666b6e6384a13ba84325c78e70e639627c` plus the inventoried run-only worktree changes
- scope: Die Delta-Aufgaben GMA-19 bis GMA-28 für getrennte Scope-Auswahl, scopespezifische
  Preflights, native Priorität, ursprüngliches npm-Aufrufverzeichnis, Darstellung, Dokumentation
  und aktuelle Evidenz gegen die bestehenden Owner prüfen.
- evidence: Direkte Inspektion von `cli/application.js`, `parse-args.js`, `command-registry.js`,
  `lifecycle/`, `runtime-check-consent/`, `mcp-lifecycle/`, den vier Installationspfaden,
  `install-local-plugin.js`, der Locale-Registry, Dokumentation und bestehenden Tests.
- transparency: Die bestehende Umsetzung aus TP Revision 1 bleibt erhalten. Revision 2 erweitert
  den vorhandenen Setup-Vertrag, die vorhandene Interaktion, den Setup-Service, die Darstellung und
  den lokalen Wrapper. Sie benötigt keinen zweiten Installer, Host-Adapter, MCP-Lifecycle,
  Locale-Owner, Consent-Store oder Dispatcher.
- missing_evidence: Direkte geladene Host- und native Windows-Evidenz bleibt nach Repository- und
  Paketprüfung separat. Das blockiert die lokale Implementierung nicht und darf keine
  Supportaussage erzeugen.

## 1. Aktuelle Abdeckung und Wiederverwendung

| Freigegebener Bereich | Aktuelle Abdeckung | Strategie | Bestehender Owner und Folge |
|---|---|---|---|
| CLI-Optionen | `fully_done` für Revision 1 | `reuse` | Parser und Command Registry besitzen Setup-Optionen und Kombinationsfehler. Revision 2 transportiert nur einen validierten Parser-cwd aus dem lokalen Wrapper. |
| Vier Plugin-Installationen | `fully_done` | `reuse` | `plugin-installers.js` und `opencode.js` liefern und verifizieren bereits native Ergebnisse. Keine zweite Installationslogik. |
| Installations-Orchestrierung | `fully_done` für Revision 1 | `extend` | `application.js` verwendet bereits den injizierbaren Setup-Service für alle vier Oberflächen. Der Service erhält Scope-Auswahl und zwei read-only Statusabfragen. |
| Runtime-Check-Zustimmung | `fully_done` | `reuse` | Bestehende Entscheidung, Receipt, Host-Anwendung und Fehlerzustände bleiben getrennt. |
| Plugin-Lifecycle-Ergebnis | `fully_done` | `reuse` | Schema 1 bleibt unverändert und wird im Setup-Ergebnis eingebettet. |
| MCP-Lifecycle | `fully_done` | `reuse` | Schema 2, Adapter, Herkunft, Runtime, Referenzen und Rollback decken Status, Enable und Disable ab. |
| Gemeinsames Setup-Ergebnis | `partially_done` | `extend` | Schema 1 besitzt bereits den äußeren Zustand. Es benötigt `mcp_by_scope`, Invocation-Quelle und eindeutige Registrierungsmetadaten ohne Kopie der MCP-Semantik. |
| Setup-Interaktion | `partially_done` | `extend` | Die erste Auswahl `full | plugin_only | cancel` ist implementiert. Es fehlt die zweite Auswahl `project | user | back` ohne Default. |
| Sprache | `partially_done` | `extend` | Die Locale-Registry ist kanonisch und vollständig für Revision 1. Scope-Karte und neue Ergebnisfelder müssen in demselben vollständigen Paket ergänzt werden. |
| Status | `partially_done` | `extend` | `lifecycle/status.js` komponiert Plugin, Repository, Delivery und Runtime-Checks. Bei explizitem Ziel kann MCP read-only ergänzt werden. |
| Repository-Disable | `fully_done` für Plugin | `compose` | `lifecycle/operations.js` besitzt Plugin-Disable; MCP-Disable läuft davor über seinen bestehenden Owner. |
| Globaler Uninstall | `fully_done` für Plugin | `compose` | Preview, Confirm und Verifikation bestehen. Gekoppelte Entfernung ergänzt nur expliziten MCP-Scope und Reihenfolge. |
| Lokale Entwicklungsinstallation | `partially_done` | `extend` | Der Wrapper reicht Argumente weiter und besitzt lokale Paketowner. Er validiert und transportiert das ursprüngliche npm-`INIT_CWD` noch nicht. |
| Tests und Generation | `fully_done` als Infrastruktur | `extend` | Fokussierte Node-Skripte, `release:prepare`, Runtime Integrity und `smoke-test` sind vorhandene Owner. |

- current_coverage: TP Revision 1 ist implementiert. Für Revision 2 fehlen die zweite bewusste
  Scope-Auswahl, beide scopespezifischen Statuszeilen, die Darstellung nativer Priorität und der
  validierte Transport des ursprünglichen npm-Aufrufverzeichnisses.
- reuse_strategy: Bestehende Plugin-, Consent-, Lifecycle- und MCP-Resultate unverändert einbetten;
  reine Setup-Zustandsableitung ergänzen; Application auf injizierbare Operationen reduzieren.
- required_next_step: GMA-19 bis GMA-24 in der Reihenfolge Vertrag, Interaktion, Service,
  Darstellung und Wrapper umsetzen. Danach GMA-25 bis GMA-28 für Regression, Dokumentation,
  Kontextgraph, Reviews und QA ausführen.

## 2. Abhängigkeitsrichtung

```text
CLI Parser und Registry
  -> install-setup contract
  -> install-setup interaction
  -> install-setup service
       -> bestehender Plugin-Installer
       -> bestehender Runtime-Check-Owner
       -> bestehender MCP-Lifecycle
  -> install-setup presentation
       -> kanonische Locale-Registry
```

Der Setup-Service erhält Owner als Funktionen und entscheidet keine hostnativen Details. Weder
Plugin- noch MCP-Lifecycle importieren den Setup-Service. Damit bleibt die Abhängigkeit azyklisch.

## 3. OpenCode-`--dir`-Prüfung

`application.js` verwendet ein explizites `--dir` heute als OpenCode-Konfigurationsverzeichnis.
Andere Installationsoberflächen nutzen es nicht als Plugin-Ziel. Die freigegebene Lösung kann die
Kompatibilität ohne Migration erhalten:

- ohne neue Full-Setup-Option bleibt `--dir` OpenCode-Konfigurationspfad;
- mit neuem `--with-mcp` bindet `--dir` das MCP-Projektziel;
- der OpenCode-Konfigurationspfad kommt dann aus `OPENCODE_CONFIG_DIR` oder dem Standard;
- im interaktiven Full-Setup ohne Option bleibt der bisherige Plugin-Konfigurationspfad erhalten
  und das sichtbare aktuelle Arbeitsverzeichnis wird erst durch die Auswahl zum MCP-Ziel.

Da `--with-mcp` neu ist, wird kein bestehender gültiger Aufruf umgedeutet. Positive und negative
Parser- sowie End-to-End-Fixtures sind verpflichtend.

## 4. Parallelstruktur- und Driftprüfung

| Risiko | Bewertung | Kontrolle |
|---|---|---|
| zweiter Installer | kontrolliert | Setup erhält bestehende Installer als injizierte Operationen. |
| zweiter MCP-Lifecycle | klar | Nur `runMcpLifecycle` besitzt Status, Enable und Disable. |
| zweite Host-Registry | klar | Setup verwendet die Oberfläche nur als Schlüssel für bestehende Owner. |
| zweiter Consent-Store | klar | Setup speichert keine Auswahl und verwendet vorhandene Runtime-Check-Receipts unverändert. |
| zweites Ergebnismodell für Teilzustände | kontrolliert | Setup kapselt vollständige validierte Lifecycle-Resultate und kopiert keine inneren Codes. |
| gemischte Sprache | kontrolliert, erneut zu prüfen | Neue Scope-Texte kommen vollständig aus demselben Locale-Paket; fehlende oder nicht unterstützte Sprache fällt vollständig auf Englisch zurück. |
| OpenCode-Zieldrift | kontrolliert | Bestehende `--dir`-Semantik bleibt erhalten; Parser-cwd ist nur sichtbarer interaktiver Projektvorschlag. |
| npm-Wrapper-Zieldrift | offen, klar begrenzt | `INIT_CWD` vor `release:prepare` validieren, per `realpath` normalisieren und ausschließlich als Parser-cwd injizieren. |
| stiller Benutzerscope | offen, klar begrenzt | Zweite Interaktion besitzt keinen Default; `back`, leer, ungültig und EOF mutieren nichts. |
| doppelte Prioritätslogik | kontrolliert | Setup zeigt ausschließlich vom bestehenden MCP-Lifecycle gelieferte Quellen und Konflikte. |
| falsche Atomarität | kontrolliert | Getrennte Transaktionsgrenzen und sichtbares `partial`; kein cross-lifecycle Rollback. |
| Repositorytest als Hostbeweis | kontrolliert | CD+Tests, direkte Hostspur und UAT bleiben getrennt. |

Die Produktsemantik ist durch freigegebene PRD und SD geklärt. Der aktuelle Runtime-Stand besitzt
keine widersprechende persistente Autorität.

## 5. Änderungswirkung

| Dimension | Wirkung | Kontrolle |
|---|---|---|
| öffentliche CLI | additive Optionen und ausdrücklich kombinierter Status/Entfernungspfad | Parsermatrix und unveränderte Legacy-Aufrufe |
| Ergebnisse | neues äußeres Setup-Schema, bestehende innere Schemas unverändert | Contract- und Projektionstests |
| Hostkonfiguration | keine neue Schreiblogik | injizierte bestehende Plugin- und MCP-Owner |
| Fehler und Recovery | neue Aggregation über getrennte Teilfehler | reine Zustandsmatrix und Phasentests |
| Sprache | neuer vollständiger Registry-Bereich | Pack-Parität, Fallback und unbekannter-Code-Test |
| Sicherheit | neue Mutation nur nach ausdrücklicher Full-Auswahl | Nullmutations-, Reihenfolge- und Fremdzustandstests |
| Migration | keine Datenmigration; ältere eigene MCP-Runtime bleibt Lifecycle-Aufgabe | bestehende MCP-Migrationssuiten |
| Release | neue Module, Locale-Felder, Tests und Dokumentation gehen durch bestehende Generierung | Release-, Paket- und Runtime-Integrity-Prüfung |

## 6. Test- und Evidenzwirkung

Die vorhandenen fokussierten Tests decken Vertrag, Interaktion und Service für Revision 1 ab. Sie
werden um `mcp_by_scope`, `project | user | back`, native Priorität, Nullmutation und gültige sowie
ungültige `INIT_CWD`-Varianten erweitert. Bestehende CLI-, Lifecycle-, Runtime-Check-, MCP-,
OpenCode-, lokale Installer-, Locale-, Paket- und Smoke-Suiten bleiben verbindlich.

Direkte Hosttests beginnen erst nach lokaler Qualitätsprüfung. Ein fehlender Login, Trust-Dialog,
Desktop-Schritt oder native Windows-Lauf bleibt `unverified` und wird nicht aus Fixtures ersetzt.

## 7. Kontextgraph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-MCP-DISPATCH-ADAPTER`;
  `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_required_action: Nach Implementierung und Prüfung die neue Setup-Komposition,
  getrennten Zustimmungen, Kompatibilitätsgrenze und direkten Evidenzgrenzen ergänzen.
- no_new_node_reason: Die drei vorhandenen Knoten besitzen CLI-Komposition, MCP-Adapter und native
  Interaktionsautorität bereits vollständig.

## 8. Entscheidung

Die Analyse entscheidet `pass`. Die bestehenden Owner sind ausreichend verstanden, die zwei direkt
beobachteten Lücken liegen innerhalb ihrer heutigen Grenzen und kein zweiter Source of Truth ist
erforderlich. CD+Tests darf für den freigegebenen TP Revision 2 beginnen.
