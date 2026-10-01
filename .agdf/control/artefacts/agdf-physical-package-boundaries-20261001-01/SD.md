# SD: Physische Core-/CLI-/MCP-Paketstruktur

Status: draft
Gate: SD
Gate approval: open
Based on: PRD.md
Date: 2026-10-01
Owner: Codex; Architekturabnahme Arndt Gold
Run: agdf-physical-package-boundaries-20261001-01
Language: de
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Physische Trennung: Core besitzt Kontrolllogik, CLI besitzt Befehle/Installation, MCP besitzt Transport; drei bisherige npm-Pakete bleiben erhalten.

Die Software wird tatsächlich in drei Quellpakete zerlegt. `packages/core/`
besitzt Kontrollregeln, Zustandsoperationen, Validatoren und deren gemeinsame
Ressourcenverträge. `packages/cli/` besitzt Befehle, Installation, Setup und
Host-Komposition. `packages/mcp-server/` besitzt MCP-Transport, Toolregistrierung
und Worker-Komposition. `plugins/agdf/` bleibt die kanonische Pluginquelle;
Root `scripts/` besitzt übergreifenden Build und Release.

```text
repository/
├── plugins/agdf/                       kanonische Pluginquellen
│   ├── plugin.json, skills/, assets/
│   ├── meta/contracts/, control/templates/
│   └── host-templates/shared/hooks/    Buildvorlagen; siehe Profilentscheidung
├── packages/
│   ├── core/                          privates @agdf/core-Quellpaket
│   │   ├── lib/                       Kontrollimplementierung und Ressourcen-API
│   │   ├── generated/                 abgeleitete isolierte Core-Testressourcen
│   │   └── test/
│   ├── cli/                           create-agdf-Quellen und Komposition
│   │   ├── bin/, lib/, test/, generated/
│   │   └── distribution/agdf/          dünne @agdf/cli-Fassade und Manifest
│   └── mcp-server/                    @agdf/mcp-server-Quellen
│       ├── bin/, src/, test/
├── docs/
├── evals/                             bestehende Korpora und Evaluationswerkzeuge
└── scripts/                           kanonischer Build, Release und gemeinsame Checks
```

`generated/`, `dist/`, Runtimebundles und Archive sind abgeleitete Outputs, keine
zweiten gepflegten Quellpakete. Der Core wird privat gehalten und für die
bisherigen Veröffentlichungen reproduzierbar eingebettet. Es entstehen weiterhin
genau drei öffentliche npm-Identitäten. Der vorhandene Bericht der früheren
Pluginstruktur-Arbeit belegt diese neue physische Zerlegung nicht.

Der Dispatcher hat diesen Run an Revision 8 /
`c5cad918-c681-47c5-b18a-b920bbc51e9f`, Gate SD, mit genehmigter UR/PRD gebunden.
Die aktuelle MCP-Discovery-Reparatur ist ein gesonderter Ausgangsstand: Codex
entdeckt das portable Root `mcp.json`; ein Fallback-Pfad ersetzt diese Discovery
nicht. Sie ändert weder diesen PRD noch dessen Akzeptanzbedingungen.

## 2. Ownership And Source Of Truth

Alle 203 Softwaremodule sind Ziel-Ownern zugeordnet; kanonische Pluginquelle bleibt plugins/agdf, übergreifender Build liegt unter Root scripts.

Die Designinventur `evidence/SD_MODULE_OWNERSHIP.json` ordnet sämtliche 203
gegenwärtigen Softwaremodule aus den drei bestehenden Quellpaketen zu. Sie ist
eine gehashte Quellinventur mit geplanten Zielpfaden, kein Nachweis bereits
umgezogener Quellen oder erfüllter Abhängigkeitsgrenzen. Zwei gemischte Module
werden ausdrücklich zerlegt; weitere notwendige Provider-Extraktionen sind dort
markiert. Der Implementierungsstand wird vor Beginn erneut verglichen.

| Bereich | Bestehender Owner | Ziel und accountable owner |
|---|---|---|
| Gate-/Run-/Approval-/Revision-/Seal-/Transaktionslogik | `create-agdf/lib/control-state/`, `control-evaluation/` | Core: `packages/core/lib/control-state/`, `control-evaluation/`; bestehende Writer bleiben die einzigen Mutationsowner |
| Dispatch, Inspektion, Zielbindung, Interaktionsprojektion | `skill-dispatch/`, `control-inspect/`, `task-target-resolution.js`, `interaction-*`, `control-read-boundary.js` | Core: gleiche fachliche Module unter `packages/core/lib/`; keine MCP-SDK-Abhängigkeit |
| Kontrollwartung und Recovery | `control-maintenance/`, `control-state/run-recovery.js` | Core: Zustandsprüfung, Vorschlagsvalidierung und Writer; CLI: interaktive IO, Gitbeschaffung und Startup-Prozessaufruf |
| Ressourcen, Metadaten, Contracts | `runtime/control-context.js`, `cli/contract-command.js`, Plugin-Metadaten | Core: validierter Resource-Context und allowlist-basierter Reader unter `lib/resources/`; CLI: Paket-/Profilpfad und zulässige bisherige Override-Komposition; Quelle bleibt `plugins/agdf/meta/` |
| Provenance und Profilklassifikation | `runtime/plugin-provenance.js`, `runtime/distribution-profile-history.js` | Core: Hash-/Identitätsprüfung und gemeinsame reine Projektionen; Installation und Marker-Schreiben bleiben CLI |
| Delivery Path Search | `delivery-path-search/` | Core: Input-/Kandidaten-/Scoring-/Persistenz-/Suchlogik; CLI: Hostgeneratoren, Evaluatoren, Transports und Command-IO; Empfehlungen bleiben nicht autorisierend |
| Befehle, lokale Validatoren, öffentliche Kompatibilitätsfassaden | `cli/`, `runtime/validator-application.js`, `control-command.js`, `runtime/control-command-service.js`, `runtime/local-validator.js`, `bin/` | CLI: Parser, Registry, Handler und Default-Komposition verwenden Core-Services; unterstützte Exports bleiben dünne kompatible Einstiegspunkte |
| Installation, Setup, Lifecycle, Host/MCP-Verwaltung und Consent | `installers/`, `install-setup/`, `scaffold/`, `lifecycle/`, `host-adapters/`, `mcp-lifecycle/`, `runtime-check-consent/` | CLI: gleiche operativen Owner unter `packages/cli/lib/`; Kontrollentscheidung und kanonische Kontrollmutation bleiben Core |
| MCP-Runtime und Adapter | `agdf-mcp-server/src/`, `bin/`; `create-agdf/lib/mcp-dispatch-runtime.js` | MCP: Transport, Worker und SDK unter `packages/mcp-server/`; bestehender `create-agdf/mcp-dispatch-runtime`-Export bleibt CLI-Kompositionsfassade auf gemeinsame Core-Services ohne SDK/Transport |
| Plugin-Identität, Skills, Verträge, Assets und Templates | `plugins/agdf/` | Unverändert kanonische Pluginquelle; Build projiziert sie, keine handgepflegten Paketkopien |
| Generierung, öffentliche Profilprüfung und Release | `create-agdf/scripts/`, `lib/public-plugin/`, `lib/release/`, Rootwerkzeuge | Root `scripts/`: Generierung und Assembly; bisherige ausführbare Hilfslogik wird dorthin verschoben; Paket-Entrypoints delegieren |
| Benchmarks und Evaluations-Harness | `lib/skill-evals/`, `request-activation-evals/`, `proportionality-benchmark/` | `evals/lib/` und vorhandene Korpora; keine Aufnahme als Laufzeitabhängigkeit von Core/CLI/MCP |
| Architektur- und Ownerreferenzen | Aktuelle Docs, SoT und Context Graph | Bestehende Dokumentowner werden kuratiert aktualisiert; historische Reports/Tags bleiben unverändert |

Verbindliche Referenzen für Zustands- und Produktautorität bleiben die bestehenden
Pluginverträge, `.agdf/control/SOT_REGISTRY.md`, der ausgewählte Run und sein
genehmigter PRD. Diese SD-Inventur führt keine parallelen Regeln oder Kriterien ein.

## 3. Architecture Decisions

- SDD-001: Drei physische Quellpakete mit einseitiger Runtime-Abhängigkeit CLI→Core und MCP-Komposition→Core über die bestehende CLI-Fassade; rationale: Zuständigkeit muss aus Quellen und Abhängigkeitskanten ersichtlich sein; consequence: alte aktive Quellbäume entfallen nach Cutover und jede Core-Rückkante ist ein Abschlussblocker.
- SDD-002: Core erhält expliziten Resource-Context und einen gemeinsamen allowlist-basierten Contract-Reader; rationale: die belegte Core→CLI-Reader-Kante und implizite relative Metadatenauflösung verhindern isolierte Verwendung; consequence: Komposition und Paketlayout müssen Ressourcen ausdrücklich binden und fehlende Ressourcen führen zur bestehenden Recovery statt zu einer stillen Checkout-Suche.
- SDD-003: Gitbeschaffung, Runtime-Probes, Prozessstart und Hostprovider werden außerhalb Core komponiert; rationale: Infrastruktur darf weder Kontrollautorität besitzen noch Core transitiv an CLI oder MCP binden; consequence: Observer-Ergebnisse werden weiterhin im Core validiert und fehlende Gitbeobachtung darf keinen positiven Kontrollnachweis erzeugen.
- SDD-004: Privates @agdf/core-Quellpaket wird in create-agdf-Artefakte eingebettet, @agdf/cli bleibt die dünne Fassade und @agdf/mcp-server behält seine exakte create-agdf-Abhängigkeit; rationale: drei bestehende npm-Namen müssen ohne zusätzliche öffentliche Installation funktionieren; consequence: der Build muss die eingebetteten Quellen, Imports, Ressourcen und Versionen gegenüber dem privaten Core deterministisch nachweisen.
- SDD-005: Unterstützte bin-/Export-/CLI-/MCP-Verträge bleiben unverändert und Fassaden delegieren allein; rationale: physische Owneränderung ist keine API- oder Kontrollsemantikänderung; consequence: öffentliche Importpfade und echte Verbraucher werden aus npm-Archiven geprüft, nicht aus Workspace-Symlinks.
- SDD-006: Offline-Profile enthalten die deterministisch ausgewählte Core-/CLI-Validatorclosure mit einem Ressourcenbestand pro benötigter Ressource und ihren bisherigen Ausschlüssen; rationale: Offlinebetrieb und Copilot-Payload dürfen keine Installer- oder MCP-SDK-Übernahme verstecken; consequence: geänderte Layout-Metadaten werden sichtbar bilanziert und bestehende Budget-/Integritätsregeln bleiben wirksam.
- SDD-007: Profilbedingte optionale MCP-/Hook-Einträge folgen der expliziten Matrix in §4, einschließlich Root mcp.json für portables Codex-Runtime-Profil; rationale: Quellprofil und skills-only Veröffentlichung dürfen durch den Zielbaum keine neue aktive Fähigkeit erhalten; consequence: fehlende optionale Quelldateien und Claude-/Copilot-Discoverypfade sind konkrete zur SD-Freigabe vorgelegte Zielbaumabweichungen.
- SDD-008: Root scripts besitzt Build-/Profil-/Release-Orchestrierung mit expliziten Quell- und Outputpfaden; rationale: relative Altpfade und mehrfach gepflegte Buildlogik würden die Paketgrenze wieder auflösen; consequence: paketlokale Befehle delegieren und Clean-Checkout-Checks prüfen die vollständige Voraussetzungskette.
- SDD-009: Laufzeitdaten, Installationsowner, Consent, Trust und bestehende Provenance-Verträge bleiben bestehen; rationale: Quellverschiebung rechtfertigt keine Daten- oder Berechtigungsmigration; consequence: neue Quell-/Bundledigests werden aus neuen Artefakten berechnet und historische Marker werden nur durch bestehende Lifecycle-Owner behandelt.
- SDD-010: Aktuelle Quellpfade und immutable historische Pfade werden getrennt aufgelöst; rationale: frühere Tags und Archive können die neue Struktur noch nicht enthalten; consequence: History-Reader bestimmen genau einen Pfad im jeweiligen Tag, während aktuelle Builds keine Altroot-Fallbacks erhalten.
- SDD-011: Cutover erfolgt über konsistente, belegte Zwischenstände ohne dauerhafte Parallelquellen; rationale: Quellen, generierte Profile und gekoppelte npm-Verbraucher müssen gemeinsam zurückführbar bleiben; consequence: TP muss Stop-/Rückwegpunkte konkretisieren und vor jeder Umsetzung Quellen sowie fremde Workspace-/Indexänderungen erneut binden.
- SDD-012: Der Abschluss wird gegen Zielbaum, Kriterien und getrennte Evidenzebenen geführt; rationale: eine erfolgreiche Quellprüfung oder Installation beweist weder ein npm-Archiv noch eine frische Hostsession; consequence: QA benötigt tatsächliche Endstruktur und Verbraucherbelege und weist ungetestete Hosts sowie Windows ausdrücklich aus.

## 4. Integration Points

CLI und MCP verwenden gemeinsame Core-Services; Ressourcen und Git-/Runtimeprovider werden ausdrücklich gebunden, öffentliche Fassaden bleiben kompatibel.

### Kontroll- und Providergrenze

Core erhält eine private Service-Komposition, konzeptionell
`createCoreServices({ resources, observers, runtimeBinding })`. Sie bindet
vorhandene Evaluatoren, Inspektion, Dispatch, Präsentation und Kontrollwriter.
Die internen Signaturen dürfen zugunsten expliziter Abhängigkeiten angepasst
werden; bestehende öffentliche Fassaden erhalten ihre synchronen oder asynchronen
Verträge. Es gibt keine globale veränderliche Provider-Registry.

Der Resource-Context enthält die geprüfte Plugindefinition, Locale-Registry,
gemeinsame Version und gebundene Contract-Quelle. Der Core besitzt Modul-Allowlist,
Skill→Contract-Zuordnung, Fehlervertrag und Inhaltsprüfung. CLI erstellt den
Context aus ihren paket-/profilgebundenen Ressourcen. Isolierter Corebetrieb
verwendet aus `plugins/agdf/` erzeugte private Core-Ressourcen und benötigt weder
CLI noch SDK oder Checkout. Diese Ressourcen sind abgeleitet und werden beim
Build gegen dieselbe kanonische Quelle geprüft.

MCP erhält ausschließlich den verifizierten eigenen Paket-Context, mit dem
bisherigen `pluginRoot: null`-Verhalten für Contract-Lektüre. Clientargumente,
vererbte Pluginpfade oder executable-Werte wählen keine Ressource aus. Der
bestehende explizite CLI-Contract-Override bleibt nur in seiner bisherigen
CLI-Komposition; die Migration erweitert seine Zulässigkeit nicht.

Die vorhandene Gitbeobachtung und Git-Originalbeschaffung aus
`control-evaluation/git-observation.js`, `run-recovery.js` und
`control-maintenance/repair.js` werden CLI-Provider. Core validiert weiterhin
Pfad, Revision, Snapshot, Kandidaten und Recovery-Voraussetzungen. Git beweist
keine menschliche Freigabe. MCP-Inspektion behält den bisherigen eingeschränkten
Observerumfang; es wird keine künstliche Parität einer dort fehlenden
Gitbeobachtung behauptet.

`skill-dispatch/binding.js` wird entlang seiner Verantwortung zerlegt: reine
Binding-/Argumentgrammatikprüfung bleibt Core, executable-Probe und
Prozessumgebung werden CLI-Runtimeprovider. `control-maintenance/startup.js`
gehört mit seinem Validator-Prozessstart zu CLI. Offline-CLI enthält die
erforderlichen vorhandenen Git-/Runtimeprovider; Core selbst importiert keinen
Prozessstarter. Fehlender oder fehlerhafter Provider behält die bestehende
unavailable/Recovery-Semantik, keine positive Defaultentscheidung.

### Source- und Veröffentlichungsauflösung

Der private Core besitzt `name: @agdf/core`, `private: true`, Node >=22 und interne
ESM-Exports für seinen Entry und benannte Module. CLI verwendet den internen
Alias `#agdf-core` beziehungsweise `#agdf-core/*`. Im Quellmanifest verweisen
diese Imports auf das private, lokal verknüpfte Core-Paket; dessen Verknüpfung ist
Entwicklungs-/Buildvoraussetzung und keine veröffentlichte Runtime-Abhängigkeit.

Root Assembly kopiert die Core-Implementierung unverändert in
`dist/npm/create-agdf/runtime/core/lib/` und die CLI-Quellen in die bisherigen
öffentlichen `bin/`, `lib/` und Plugin-Assetpfade des create-agdf-Artefakts. Dessen
Imports-Mapping löst `#agdf-core/*` nach `./runtime/core/lib/*.js` auf. Lokale
Core-Imports bleiben innerhalb dieses eingebetteten Baums. Es braucht weder
Importtext-Rewrite noch ein viertes öffentliches npm-Paket. Die private Core-
Testressourcenprojektion wird nicht zusätzlich in jedes Profil kopiert: die
CLI-Komposition bindet dessen eigenen vorhandenen Ressourcenbestand.

`packages/cli/distribution/agdf/` enthält genau den bisherigen dünnen
`@agdf/cli`-Wrapper und dessen Manifestquelle. Assembly erzeugt
`dist/npm/agdf/`. `packages/mcp-server/` erzeugt `dist/npm/agdf-mcp-server/`.
Publish/Pack verwenden diese fertigen, geprüften Outputs. Die drei Manifeste
bleiben exakt versionsgebunden; `@agdf/cli` und MCP beziehen `create-agdf` in
derselben Version. Keine veröffentlichte Datei verweist auf `file:../core`,
Workspace-Symlinks oder Quellcheckout-Pfade.

Der Export `create-agdf/control-command` komponiert Ressourcen und CLI-Gitobserver
und delegiert an den Core-Approval-Service. Import selbst liest nur die bisher
zulässigen eigenen Metadaten, keine Zielzustände oder Gitdaten. Der Export
`create-agdf/mcp-dispatch-runtime` bleibt ein kompatibler Kompositionseinstieg
ohne SDK/Transport: Identitäts-/Digestprüfung verwendet den gemeinsamen
Provenance-Owner, Tools die gemeinsamen Core-Services. MCP-Server, Worker und
stdio bleiben im MCP-Paket. CLI importiert diesen MCP-Adapter nicht rückwärts.

### Profilmatrix und ausdrücklich vorgelegte optionale Abweichungen

| Profil | Kanonische Eingaben | MCP-Datei/Discovery im Output | Hooks im Output | Owner und technische Auswirkung |
|---|---|---|---|---|
| Repository-Quellplugin | `plugins/agdf/plugin.json`, Definition, Skills, Assets, Verträge und Templates | kein ausführbares `plugins/agdf/mcp.json` | keine installierbaren Root-Hooks; Vorlagen unter `host-templates/shared/hooks/` | Plugin-/Build-Owner; Quelle ist kein aktives Runtime-Profil. Diese beiden fehlenden optionalen Root-Einträge sind ausdrücklich zur SD-Abnahme vorgelegt |
| Öffentliches skills-only Plugin | dieselbe Quelle, public projection | keine MCP-Deklaration | keine Hooks/Runtime | Public-Profil-/Build-Owner; vorhandene Veröffentlichungsgrenze bleibt bestehen |
| Lokales portables Codex-Runtime-Plugin | dieselbe Quelle plus CLI/Core-Runtimeclosure | Root `mcp.json`, portable Schema mit `stdio`; absolute Launcher-/Datenpfade durch bestehenden Installer | Root `hooks/` aus Buildvorlagen; vorhandene Fallback-Hookdeklaration | Codex-/CLI-/Build-Owner; Root-MCP-Discovery bleibt erhalten. Fallback kann portable Discovery nicht ersetzen |
| Lokales Claude-Runtime-Plugin | dasselbe generierte Runtime-Plugin | `mcp/claude.mcp.json` über bestehenden Claude-Manifestpfad; kein Root `.mcp.json` | vorhandene erzeugte Hookdateien/Claude-Deklaration | Claude-/CLI-/Build-Owner; explizit akzeptierter MCP-Pfad außerhalb des beispielhaften Root mcp.json. Gleiches Paket kann daneben die Codex-Datei tragen, ohne sie für Claude zu aktivieren |
| Copilot-Runtime-Profil | Copilot-Manifest, Skills-/Contractprojektion und Offline-Validatorclosure | keine neu hinzukommende Plugin-MCP-Datei oder SDK | nur bisher profilzulässige Dateien; keine Übernahme der allgemeinen Hooks | Copilot-/Build-Owner; vorhandene profilbezogene Aussparung optionaler Zielbaumeinträge, unter tatsächlicher Inhalts-/Budgetprüfung |
| OpenCode-Integration | vorhandene `.opencode`-/Agent-/Skill-/Configprojektion und lokale CLI-Komposition | bisher separat verwaltete MCP-Konfiguration, kein neuer portabler Plugin-MCP-Pfad | bisherige OpenCode-Integrationsmechanismen | OpenCode-/CLI-/Build-Owner; bestehende Discoveryform ist ausdrücklich profilbedingt abweichend, keine neue Pluginaktivierung |

Für Codex gibt es genau eine aktuelle portable MCP-Deklaration; die alte Datei
`mcp/codex.mcp.json` wird nicht wieder erzeugt. Historische Digestnormalisierung
bleibt verfügbar. Die MCP-/Hook-Abweichungen dieser Tabelle betreffen ausschließlich
optionale Pluginprofile, niemals die drei verbindlichen Softwarepakete. Owner,
Begründung und Auswirkung sind vorgelegt; SD-Freigabe akzeptiert diese konkrete
Matrix. Eine später nötige zusätzliche Abweichung muss vor ihrer Abnahme sichtbar
entschieden werden.

### Build- und Releasefluss

Root `scripts/` bestimmt explizit Repo-, Plugin-, Core-, CLI-, MCP- und Outputroots;
kein Core-Modul berechnet ein Repository aus der Anzahl seiner Parent-Verzeichnisse.
Die kanonische Reihenfolge ist Version-/Quellprüfung → Ressourcen und
Request-Activation-Projektionen → Software-/Profilassembly → Schemas,
Ressourcenclosure, Payload und Provenance → echte npm-Archive → Consumer-/Releasechecks.
Alle Artefakte werden aus derselben Quell-/Versionsbindung erzeugt.

Root und Paketbefehle delegieren in diese Orchestrierung. Bisherige
`create-agdf/scripts`-Generatoren und `lib/public-plugin`-/`lib/release`-Hilfslogik
haben künftig Root-Owner, nicht weiterhin einen gepflegten Altpfad. Fachliche
Unit-/Regressionsfälle wandern zum Code-Owner; gemeinsame Paket-/Release-/
Clean-Checkout-/Boundary-Checks liegen unter Root `scripts/`. Übergreifende
Evaluationsrunner delegieren in `evals/` und gehören nicht in Runtime-Payloads.

Bestehende Installerdatenroots, insbesondere die `create-agdf`-Paketnamen in
installierten `node_modules`, `runtime/create-agdf` sowie versionierte AGDF-
MCP-Datenpfade, sind erklärte kompatible Artefakt-/Installationspfade. Sie sind
keine alten aktiven Repositoryquellen. Die vorhandenen Lifecycle-Owner erwerben
und prüfen dieselben drei öffentlichen Pakete.

## 5. Constraints And Compatibility

Node >=22, öffentliche ESM-Exportpfade, bin-Namen, Flags, Exitcodes,
JSON-Schemas, Locale-/Interaktionsausgaben, MCP-Toolnamen/-Schemas sowie
Kontrollzustands-/Approval-/Sealformate bleiben gleich. Core verwendet nur
benötigte Node-Builtins und keine CLI-, Hostinstaller-, MCP-SDK-, Build- oder
Evalmodule. Transitive Kanten und dynamische Imports werden mitgeprüft.

Lokale Offline-Validatoren werden aus Core plus der schmalen bestehenden
CLI-Validator-/Providerclosure assembliert, mit genau dem notwendigen
Profil-Ressourcenbestand. Kein npm-/Netzzugriff wird als Ersatz zugelassen.
Installer, allgemeine Setup-/Lifecycle-Mutationen und MCP-SDK gelangen nicht
durch eine pauschale CLI-Paketkopie in Copilot. Neue Manifest-/Aliasbytes werden
gemessen; ein Budgetanstieg wäre eigens zu begründen und darf keinen Funktions-
 oder Dateizuwachs verstecken. Die Migration hebt keinen Budgetguard auf.

Source→Assembly-Dateikarten und Source-/Bundle-Digests bleiben getrennte
Nachweise. Die bestehenden Provenance-/Ownershipschema-Owner werden verwendet;
neue Layoutdigests werden nicht als alte Digests ausgegeben. Historische
Marker/Archive werden durch ihre bisherige Formatklassifikation verstanden,
nicht nachträglich umgeschrieben oder pauschal neu versiegelt.

Aktuelle History-/Versionsreader verwenden neue Quellmanifeste; immutable Tags
werden auf genau einen zeitgenössischen Paket-/Pluginpfad geprüft. Ein
Mehrfachfund oder fehlender historischer Owner führt zur bestehenden
History-Recovery. Aktive Builds erhalten keinen stillen Fallback nach
`create-agdf/`, `agdf/` oder `agdf-mcp-server/`.

## 6. Test And Evidence Strategy

TP bindet konkrete Tasks und Szenarien an die folgende Strategie. Dieses SD
behauptet keine bereits erfolgreiche Migration und führt keine Implementierungstests
allein für die reversible Dokumenterstellung aus.

| Nachweisebene | Technischer Nachweis und negative Grenze |
|---|---|
| Quelle und Core-Grenze | Endbaum, vollständige modulbezogene Ownerinventur, AST-/Export-/Manifestkanten und dynamische Auflösung; keine direkte/transitive Core-Rückkante, kein Paketzyklus, kein versteckter Child-Process-/Hostimport; isolierter Core mit eigenen abgeleiteten Ressourcen |
| Kontrollkompatibilität | Vorhandene Gate-/Run-/Revision-/Approval-/Seal-/Concurrency-/Recovery-/Dispatch-/Inspektionsfälle; gemeinsame Fixtures mit identischen zulässigen Observerdaten über CLI und MCP; bewusst fehlende MCP-Gitbeobachtung bleibt sichtbar begrenzt |
| Build und Profile | Clean Checkout ohne generierte Voraussetzungen; vollständige Buildreihenfolge, wiederholbare Assembly, Dateikarten, Schema-/Ressourcen-/Version-/Digest-/Payloadchecks; fehlende, zusätzliche oder manipulierte Dateien und alte aktuelle Rootpfade werden abgelehnt |
| Offlineverbraucher | Tatsächliche erzeugte lokale Validatoren außerhalb Checkout und ohne Netzwerk/npm; Commands, Locales und Fehler-/Recoveryfälle; Copilot-Inhaltsinventur ohne Installer/SDK |
| npm-Archive | Echte Archive aller drei öffentlichen Pakete; Dateien, Exports, bins, exakte Abhängigkeiten, interne Aliasauflösung und keine Workspace-/file:-Verweise; Import und Invocation aus extrahierten/installierten Archiven außerhalb Quellen |
| Lifecycle | Isolierte Install-/Update-/Repair-/Disable-/Consent-/Trust-/Ownership-/Cache-/Provenancefälle mit unveränderten Datenpaths; Marker-/Digest-/Versionsmanipulation bleibt fail-closed |
| Geschichte und Dokumentation | Tag-/Profilhistorie, aktive Referenzsuche und kuratierte SoT-/Context-Graph-/Docs-/CI-/Evalupdates; historische Verweise werden begründet statt pauschal ersetzt |
| Echte Hosts und Session | Nur später konkret beauftragte operative Nachweise; Quelle, Archiv, isolierte Installation, echte Installation, Discovery, Toolaufruf und frische Session getrennt berichten; keine implizite Windows-/Cross-Host-Abnahme |

## 7. Acceptance Traceability

PRD bleibt alleiniger Produkt-Akzeptanzowner. Jede ID erscheint hier einmal;
die Tabelle beschreibt ausschließlich technische Realisierung und Risiken.

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Physische Pakete und vollständige Modul-/Splitzuordnung nach §1–2, alte aktive Roots nach Cutover entfernen | Bestehende Module und SD_MODULE_OWNERSHIP.json; Core-/CLI-/MCP-Owner | SDD-001 | Alte Roots nur immutable Geschichte oder erklärte Artefaktpfade; unzugeordneter aktiver Owner blockiert Abschluss |
| AC-002 | Gemeinsame Core-Services und kanonische Writer, Fassaden/Transport delegieren | control-state, control-evaluation, skill-dispatch, control-inspect; Core-Owner | SDD-001, SDD-005 | Provider oder Adapter dürfen kein zweites Approval-/Gateurteil erzeugen; gemeinsame positive/negative Fixtures |
| AC-003 | Core-Resource-Context/Reader und explizite Observer; Metadaten-, CLI-Reader- und Prozesskopplung auflösen | runtime/control-context, cli/contract-command, Git-/Binding-/Recoverymodule; Core-/CLI-Owner | SDD-002, SDD-003 | Isolierter Core und transitive Kanten inklusive dynamischer Auflösung prüfen; fehlende Daten bleiben unavailable |
| AC-004 | Parser, Registry, Handler, Setup und Hostkomposition unter CLI mit Core-Delegation | cli, installers, install-setup, scaffold, host-adapters; CLI-Owner | SDD-003, SDD-005 | Alle betroffenen bisherigen Commands/Flags/Exit-/JSON-/Localeverträge aus Quellen und Archiven prüfen |
| AC-005 | MCP-Transport/Worker/SDK getrennt, Toolausführung verwendet dieselben Core-Services | agdf-mcp-server/src und mcp-dispatch-runtime-Fassade; MCP-/Core-/CLI-Owner | SDD-001, SDD-005 | Read-/write-/Ziel-/Provenancegrenzen bewahren; späterer UI-Verbraucher erhält keine zusätzliche Autorität |
| AC-006 | Privater Core, Alias-Mapping und eingebettete Assembly; drei bisherige npm-Namen und öffentliche Exports | Drei bestehende Paketmanifeste, control-command und MCP-Fassade; Paket-/Release-Owner | SDD-004, SDD-005 | Keine öffentliche vierte Dependency oder file:/Workspace-Verweise; echte externe Archive/Consumer erforderlich |
| AC-007 | Profilgenaue Core-/Validator-/Providerclosure mit einem erforderlichen Ressourcenbestand | sync-plugin-runtime und Copilot-Payload/Integrity-Owner; Build-/CLI-/Core-Owner | SDD-002, SDD-006 | Manifestbytes messen, keine Budgetlockerung als Ersatz für Ausschlüsse; npm-/Netz-freie Verbraucher prüfen |
| AC-008 | Pluginquellen unverändert kanonisch, alle Projektionen mit Sourcekarte und gebundener Version/Provenance | plugins/agdf, plugin-provenance, Profilbuilder; Plugin-/Build-/Core-Owner | SDD-008, SDD-009 | Keine manuell gepflegte Contract-/Skillkopie; Bundle-/Source-/Marker-Tamper und Versionabweichung prüfen |
| AC-009 | Explizite Profil-/Discoverymatrix und optionale Zielbaumabweichungen nach §4 | Plugindefinition, Manifeste, MCP-Renderer und Hookvorlagen; Profil-/Build-/CLI-Owner | SDD-007 | Root mcp.json für Codex, deklarierter Claude-Pfad, skills-only ohne MCP/Hooks; keine fehlenden Softwarepakete als Ausnahme |
| AC-010 | Root-Orchestrierung mit expliziten Roots, Paketbefehle nur Delegation, buildabhängige CI-Reihenfolge | Bestehende Generatoren, public-plugin, release und Workflows; Root-Build-/Release-Owner | SDD-008 | Clean Checkout und Archivvoraussetzungen prüfen; keine zweite lokal gepflegte Buildlogik |
| AC-011 | Daten-/Installationspfade und bestehende Mutations-/Consent-/Trust-/Marker-Owner erhalten | installers, lifecycle, mcp-lifecycle, runtime-check-consent, plugin-provenance; CLI-/Core-Owner | SDD-009 | Codeumzug darf Benutzerdateien oder Approvalbindung nicht migrieren; isolierte Lifecycle-/Tamperfälle |
| AC-012 | Aktuelle Manifest-/Versionroots ändern, Tags auf ihre damaligen Pfade eindeutig lesen | release/profile-history, version-coherence und immutable Tags; Release-Owner | SDD-010 | Historische Mehrfachfunde oder fehlende Ressourcen nicht durch aktuelle Fallbacks verdecken |
| AC-013 | Aktive Dokument-/SoT-/Graph-/Test-/Eval-/CI-Referenzen zu neuen Ownern kuratieren | Docs, SOT_REGISTRY, CONTEXT_GRAPH und aktive Verbraucher; jeweilige Maintainer | SDD-008, SDD-010 | Suchinventur trennt historische/API-/Artefaktfälle von aktiven Altquellen; keine pauschalen History-Rewrites |
| AC-014 | Konsistente Zwischenstände und begrenzter scoped Rückweg; Implementation-Baseline neu binden | BASELINE.json, Modulhashes und kanonischer Run; Implementierungs-/Build-Owner | SDD-011 | Keine dauerhafte Parallelquelle, kein reset fremder Workspace-/Indexänderungen und keine Übernahme anderer Runfreigaben |
| AC-015 | Kriterien-/Zielbaum-/Profilvergleich und getrennte Quellen-, Build-, Archiv-, Install-/Sessionbelege | Dieser PRD, spätere CD+Tests-/QA-/OR-Artefakte; qa-gate und Closeout-Owner | SDD-012 | Unverifizierte Hosts/Windows/Session ausdrücklich begrenzen; kein Quellenpass als Live-Host-Beweis |

## 8. Risks And Open Questions

Designfragen sind entschieden; die profilbedingten MCP-/Hook-Abweichungen in §4 sind zur SD-Abnahme vorgelegt. Umsetzung und Verbraucherbelege folgen erst nach TP.

Alle im PRD an SD delegierten Designfragen sind mit SDD-001–010 und der
Profilmatrix entschieden. Kein Produktentscheid bleibt verdeckt offen.
Die zur SD-Abnahme vorgelegten optionalen Zielbaumabweichungen sind ausschließlich
die in §4 aufgeführten profilabhängigen MCP-/Hookpfade beziehungsweise fehlenden
Dateien. Die Softwarepakete werden vollständig umgesetzt.

Die umfassende Provider-/Resource-Context-Umstellung betrifft bestehende
Default-Komposition. Das ist kein bloßer Dateiumzug. TP muss die schrittweise
Extraktion und die benötigten Regressionen konkret binden; ungewollte Änderungen
an Ausgaben oder Recoveryverhalten werden als Defekt behandelt. Eine tatsächliche
Unvereinbarkeit mit dem genehmigten PRD löst eine PRD-Revision aus, keine stille
SD-Ausnahme.

Package-Imports und eingebettete Core-Struktur verschieben interne Dateipfade.
Die öffentliche Export-/Paket-/Resourceprobe aus echten Archiven ist deshalb
Pflicht. Das private Core-Paket darf in keinem veröffentlichten Dependencygraph
als zusätzlich zu installierendes öffentliches Paket auftreten. Root Assembly
weist sowohl Quellhashes als auch vollständige Archiveinhalte nach.

Die Ressourcenauflösung darf weder eine zweite Locale-/Contractquelle noch eine
unbemerkte Payloadkopie erzeugen. Ownership-/Digest-/Boundaryprüfungen bleiben
Blocker. Buildhelpers und Evaluationsmodule dürfen über transitive Imports nicht
in eine Runtimeclosure zurückkehren.

Der frühere Pluginstruktur-Run bleibt separat aktiv und benötigt nach seiner
MCP-Reparatur neue Quality-Readiness-Evidenz. Dessen bereits genehmigtes SD/TP und
historische QA-Ausgaben autorisieren hier keine Implementierung. Fremde Änderungen,
insbesondere die fünf bereits gestagten entfernten Duplikate, bleiben unangetastet.

TP legt die genaue Folge, Task-/Szenario-IDs, Fehler-/Rollbackpunkte und Befehle
fest. Architektonisch werden zunächst private Core-Services und Providergrenzen
gewonnen, danach sämtliche Verbraucher/Builds an neue Quellen umgestellt und
zuletzt Altquellen entfernt und Archive/Profile geprüft. Jeder Zwischenstand muss
eine erklärte konsistente Quell-/Outputbindung haben; temporäre Delegation hat
einen endlichen Cutover und ist kein akzeptierter Dauerzustand. Es werden keine
aktiven Installationen oder Kontrollzustände automatisch zurückgesetzt.

### Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION, CG-NATIVE-INTERACTION-AUTHORITY, CG-TASK-TARGET-AUTHORITY; SOT_REGISTRY.md
- context_graph_reconciliation: planned
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: SDD-008/010/012; aktive Ownerpfade erst nach tatsächlichem Cutover aktualisieren, bestehenden Discovery- und Zustandsautoritätsinhalt erhalten.
- memory_target: scope_artifact
- memory_reason: Modulzuordnung, konkrete Paketlayout- und Assemblyentscheidung bleiben prüfbare rungebundene Designartefakte; wiederverwendbare tatsächliche Owner werden bei Implementierung im bestehenden Graph/SoT versöhnt.
- memory_refs: dieses SD; evidence/SD_MODULE_OWNERSHIP.json

## 9. Next Step

SD kanonisch verknüpfen, Revision aufzeichnen und über den Dispatcher samt
frischer Präsentationsbindung zur SD-Abnahme vorlegen. Eine neue `Approval: SD`
erlaubt TP-Erstellung. Umsetzung erfolgt erst nach einer neuen `Approval: TP`
und positiver Implementierungsvorbereitung für genau diesen Run.
