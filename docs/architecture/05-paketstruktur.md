# Paketstruktur und verbindliche Zuständigkeiten

Diese Referenz ordnet die im [Architektur-Einstieg](README.md) beschriebenen Verantwortlichkeiten
konkreten Quell-, Build- und Auslieferungsgrenzen zu. Für das Zusammenwirken der Bausteine siehe
[Bestehende Systemarchitektur](01-systemarchitektur.md#2-bausteine-und-verantwortlichkeiten).
Die vorgeschlagene Weiterentwicklung steht im [gemeinsamen Zielbild](03-agentenkontrolle-zielbild.md);
der folgende Baum beschreibt die bestehende Struktur.

**Stand: 3. Oktober 2026, Repository-Quelle.** Eine Quellzuordnung belegt keine Veröffentlichung
oder Aktualisierung einer bestehenden Host-Installation.
Die private lokale Cockpit-Grenze ist zum 6. Oktober 2026 ergänzt; sie ist kein weiteres
öffentliches npm-Produkt.

Der Repository-Baum trennt installierbare Plugin-Inhalte, ausführbare Software und
Build-/Release-Komposition:

```text
repository/
├── plugins/
│   └── agdf/
│       ├── plugin.json
│       ├── skills/
│       ├── hooks/
│       ├── assets/
│       ├── meta/contracts/
│       └── control/templates/
├── packages/
│   ├── core/
│   │   ├── lib/
│   │   └── test/
│   ├── cli/
│   │   ├── bin/
│   │   ├── lib/
│   │   ├── scripts/
│   │   └── distribution/agdf/
│   ├── control-ui/
│   │   ├── src/
│   │   ├── server/
│   │   ├── scripts/
│   │   └── test/
│   └── mcp-server/
│       ├── bin/
│       ├── src/
│       └── test/
├── docs/
├── evals/
│   ├── lib/
│   └── scripts/
└── scripts/
    ├── public-plugin/
    ├── release/
    └── support/
```

| Grenze | Kanonischer Owner | Verantwortung |
|---|---|---|
| Plugin | `plugins/agdf/` | Identität, Skills, Contracts, Templates, Assets und Hostvorlagen |
| Core | `packages/core/lib/` | Kontrollzustand, Gate-/Freigabe-/Revisionsvalidierung, Seals, Locks, Transaktionen, Recovery, Dispatch und Inspektionslogik |
| CLI | `packages/cli/` | Befehle, Installation, Setup, Lifecycle, Hostkomposition, Git-/Runtime-/Terminalprovider |
| MCP | `packages/mcp-server/` | SDK, Worker und stdio; Werkzeuge delegieren an gemeinsame Core-Services |
| Private Cockpit-UI | `packages/control-ui/` | Geteilte React-Ansichten, lokaler HTTP-Zugang und MCP-UI-Build; Lese-/Sitzungssemantik bleibt im Core |
| Build/Release | `scripts/` | Ressourcen-/Profilprojektion, npm-Assembly, Release- und Historyprüfung |
| Evaluation | `evals/lib/`, `evals/scripts/` | Replay, Recorder und Benchmarks; keine Core-Laufzeitabhängigkeit |

`@agdf/core` ist privat. Es gibt weiterhin genau drei öffentliche npm-Produkte:
`create-agdf`, `@agdf/cli` und `@agdf/mcp-server`. Alle verwenden die gemeinsame
Version und Node.js >=22. `packages/cli/distribution/agdf/` ist der dünne
`@agdf/cli`-Wrapper; er importiert `create-agdf/cli`.

Das [Cockpit](06-agdf-cockpit.md) verwendet Pages-eigene Designquellen und getrennte lokale
Build-Ausgaben. React-Abhängigkeiten und UI-Assets bleiben außerhalb der öffentlichen
CLI-/Plugin-/MCP-Payloads. `scripts/prepare-cockpit-local.mjs` komponiert das separate,
projektbezogene Codex-Profil unter `dist/local/codex-cockpit/`; die reguläre Host-Installation
wird dadurch nicht um eine öffentlich ausgelieferte Cockpit-App erweitert.

## Ressourcen und Provider

Der unveränderliche Resource-Context lädt Definition, Locales und die erlaubten
Contracts aus einer expliziten Paketbindung. Der private Core besitzt eine
abgeleitete Ressourcenprojektion unter `packages/core/generated/`. CLI, npm- und
Offline-Komposition binden ihre eigenen Ressourcen. Ein MCP-Aufrufer kann weder
Resource-URLs noch geerbte Plugin-Pfade ersetzen.

`createCoreServices({ resources, observers, runtimeBinding })` komponiert Dispatch,
Inspektion und im nachgeführten Entwicklungsstand den begrenzten Befehlsdienst `command`.
Der [Befehlsfluss zwischen Core und MCP](core-mcp-command-flow.md) beschreibt dessen Bindungen,
Delegation an Writer und getrennte Decision-App-Sitzungen. Es gibt kein veränderliches globales
Providerregister. Gitabfragen,
Runtime-Probe, Startup-Prozess und Terminal-I/O gehören zur CLI. Recovery prüft die
Providerdaten im Core und übernimmt daraus keine historische Freigabeautorität.
Die öffentlichen synchronen `create-agdf/control-command`- und
`create-agdf/mcp-dispatch-runtime`-Exports bleiben erhalten.

### Quellbindungen und Schreibpfade im Core

Umsetzungsfortsetzung, Artefakterfassung und begrenzte Beziehungskorrektur verwenden bestehende
Paketgrenzen. Die CLI erweitert `run-step` um `--step artefact`; der Handler delegiert an den Core.
CLI und MCP verwenden dieselbe Fortsetzungsorchestrierung am gemeinsamen Core-Einstieg.
Sie umschließt den lesenden Dispatch-Service und koordiniert den bestehenden Korrektureigentümer;
der Dispatcher importiert oder ruft diesen Schreibdienst nicht auf.
Es entstehen kein weiterer MCP-Endpunkt und kein globales Register für Sichtbarkeit oder Freigaben.

| Core-Quelle | Verantwortung |
|---|---|
| [run-command-contract.js](../../packages/core/lib/control-state/run-command-contract.js) | Feste Befehlsgruppen, erlaubte Operationsarten, exakte Eingaben und Größenbudgets des Entwicklungsstands. |
| [run-command-service.js](../../packages/core/lib/control-state/run-command-service.js) | Gebundene Befehle prüfen und an zuständige Writer oder den eigenen Runtime-Controller delegieren; keine eigene Gate-Policy. |
| [skill-dispatch/service.js](../../packages/core/lib/skill-dispatch/service.js) | Eingaben validieren, Ziel binden, Kontrollzustand lesen und Route samt Präsentation bestimmen; keine Beziehungskorrektur. |
| [delivery-continuation/service.js](../../packages/core/lib/delivery-continuation/service.js) | Am gemeinsamen [Core-Einstieg](../../packages/core/lib/index.js) höchstens eine Korrektur einer validierten gebundenen Fortsetzung koordinieren, danach Routing mit frischer Auswertung aufrufen und das Ergebnis ausgeben. |
| [delivery-relationships.js](../../packages/core/lib/control-evaluation/delivery-relationships.js) | Gemeinsames Beziehungsregister und Anwendbarkeit anhand übergebener Policy-Fakten; keine Abhängigkeit von Writer, Siegel oder Gate-Policy. |
| [artefact-bindings.js](../../packages/core/lib/control-state/artefact-bindings.js) | Strikter Codec für den optionalen Abschnitt `Artefact Bindings`, eindeutige aktive Bindung und erhaltene Historie. |
| [artefact-binding-proof.js](../../packages/core/lib/control-state/artefact-binding-proof.js) | Enthaltene Dateipfade, genaue Quell-/Ziel-/Belegbytes und vollständige aufgezeichnete Quellfreigaben prüfen. |
| [run-artefact-recording.js](../../packages/core/lib/control-state/run-artefact-recording.js) | Artefaktzeiger, geprüfte Quellbindung, Beziehung und Audit als eine Änderung für den vorhandenen Writer vorbereiten. |
| [run-relationship-correction.js](../../packages/core/lib/control-state/run-relationship-correction.js) | Höchstens eine belegte fehlende Beziehung unter Run-Lock ergänzen; Revision prüfen, neue Revision samt Audit veröffentlichen und zulässigen Arbeitsumfang erhalten. |

[run-state-writer.js](../../packages/core/lib/control-state/run-state-writer.js),
[run-seal.js](../../packages/core/lib/control-state/run-seal.js) und
[run-step-transaction.js](../../packages/core/lib/control-state/run-step-transaction.js) bleiben die
Persistenz-, Integritäts- und Transaktionseigentümer. Der optionale Belegabschnitt ist Teil des
versiegelten Run-Zustands, keine zweite Datenbank oder Freigabequelle. Seine Abwesenheit ist für
Legacy-Runs gültig, erlaubt aber keine automatische Beziehungskorrektur.

Die vorhandenen generischen Dateisperren, atomaren Dateischreibvorgänge und Verzeichnis-Synchronisation
liegen gemeinsam in [owned-file-lock.js](../../packages/core/lib/owned-file-lock.js).
Der Run-Writer exportiert dieselben Funktionen kompatibel weiter. Der MCP-Paketstart importiert
diesen schlanken Eigentümer direkt, damit Dateisperren keine Run-Auswertung laden. Sperrtoken,
Wiederherstellung, Diagnosekanal und dauerhafte Schreibgrenzen bleiben beim selben Funktionsbestand.

Die operative Sichtbarkeit gehört dem
[Interaktionsvertrag](../../plugins/agdf/meta/contracts/interaction.md). Die bestehenden
[Locale-Ressourcen](../../plugins/agdf/meta/agdf-interaction-locales.json) und der
[Renderer](../../packages/core/lib/interaction-presentation.js) zeigen auch Korrektur und
widersprüchliche Beziehungen. Build-Projektionen übernehmen die kanonischen Quellen über den
bestehenden Sync. Die [Dispatcher-Referenz](02-dispatcher.md#artefakterfassung-und-begrenzte-beziehungskorrektur)
beschreibt Voraussetzungen, Fehlerfälle und die Grenze zum tatsächlichen Hostnachweis.

## Build und normale npm-Archive

```sh
npm ci
npm run build
npm run pack
```

Der Build erzeugt Profile unter `packages/cli/generated/` und drei installierbare
Assemblies unter `dist/npm/create-agdf`, `dist/npm/agdf` und
`dist/npm/agdf-mcp-server`. `npm run pack` erzeugt normale npm-Archive unter
`dist/tarballs/`. CLI/MCP-Archive enthalten keine private Core-Registry- oder
Workspace-Abhängigkeit. Der Core wird unter `runtime/core/` eingebettet; seine
Implementierungsbytes werden unverändert kopiert. Nur die ausdrücklich generierte
Ressourcenbindung und die Manifest-Aliase unterscheiden sich zwischen Quelle und
Ausgabe. Quellimporte verwenden `#agdf-core`; Archivimporte lösen denselben Alias
innerhalb des installierten Pakets auf.

Ein direktes Packen von `packages/cli/` wird abgelehnt, weil seine Entwicklungs-
importe den privaten Core verwenden. Paketbefehle delegieren gemeinsame
Build-/Release-Operationen an Root-Tools. Die npm-Assembly ersetzt alle drei
Ausgaben gemeinsam über eine vorbereitete Stufe und behält bei einem Fehler vor
der Veröffentlichung die vorherige vollständige Ausgabe. Lokale Hostvorbereitung
erzeugt die erforderliche Assembly unter `dist/local/<host>/npm/`; sie benötigt
keine fremden Hostausgaben. Diese Ausgaben werden ebenfalls atomar ersetzt.

## Profile und Discovery

| Profil | MCP/Hooks und Ressourcen |
|---|---|
| Source/public | Keine aktive MCP-/Hook-Laufzeit; öffentliche Skills-only-Ausgabe |
| Codex-Runtime | Root `mcp.json` mit `type: stdio`; Installer bindet absolute Plugin-/Datenpfade; Hooks bleiben deklarierte Fallback-Komposition |
| Claude-Runtime | `mcp/claude.mcp.json`, eigener Launcher und deklarierte Hooks |
| Copilot-Runtime | Präfixierte Skills, eigener Validator und MCP-Server mit SDK-Installationsdeskriptoren; keine privaten UI-Ressourcen; Host-Anbindung experimentell in 0.20.x |
| OpenCode | Eigene Konfigurationskomposition und das installierte `create-agdf`-Paket |

Source-, Runtime- und Installationsdigests haben unterschiedliche Aufgaben.
Runtime-/SDK- und Ressourcenänderungen werden in Provenance-Prüfungen erfasst;
Consent, Trust und Ownership bleiben unabhängige Fakten.

Die MCP-Fassade verwendet `packages/cli/lib/mcp-protocol-runtime.js` für dieselben
Werkzeugdefinitionen, Parser, Fehler-, Sprach- und Ressourcenprojektionen wie die
vollständige Runtime. Sie erzeugt keine zweite Core-, Diagnose- oder
Entscheidungssitzung. Die ausführende Generation konstruiert weiterhin ihre echte
Runtime und besteht die vollständige Manifest-/Provenance-Prüfung, bevor der
Server Anfragen annimmt. Seltene Steuerpfade der Fassade initialisieren ihren
Core einmalig bei Bedarf; Berechtigung, Ziel, Run und Revision werden dabei
weiterhin vom Core geprüft. Einzelne Befehle behalten isolierte Worker und die
vorhandene bestätigte Beendigung.

Strukturelle Befehlsschemata und Validatoren liegen ausschließlich in
`packages/core/lib/control-state/run-command-schema.js`.
`run-command-contract.js` erhält seine bisherigen Exporte als Fassade und ergänzt
die ausführliche Hilfe. Reine Protokollimporte laden dadurch keine Diagnose-,
Gate- oder Dokumentauswertung. Die Readiness-Auswertung und der Inspect-Vertrag
verwenden dieselben in `control-inspect/selection.js` definierten Gate-Selektoren.

Der kanonische Worker-Einstieg `packages/cli/lib/mcp-worker-runtime.js` delegiert
an dieselbe vollständige Runtime-Fabrik. `scripts/compile-mcp-worker-runtime.mjs`
erzeugt daraus im Pluginprofil und im npm-Staging einen einzelnen Node-Build.
Die vorhandenen Protokoll-/Schema-/Fehler-/Ressourcen- und Lesezustandsmodule
bleiben echte gemeinsame Imports; es entstehen keine zusätzlichen Regelquellen
oder Zustands-Singletons. Originale Modul-URLs erhalten Parser-, Ressourcen- und
Worker-Pfade auch nach Verschieben in ein beanspruchtes Image. Der bereits für die
UI gepinnte Rolldown-Compiler ist ausschließlich eine Root-Build-Abhängigkeit und
wird weder mit MCP ausgeliefert noch beim Aufruf gestartet. Die Core-Projektion
bleibt bytegleich. Bestehende Generator-/Assembly-Befehle erneuern den Build.

Der Server deklariert seine tatsächliche Worker-Schnittstelle in der Node-Importmap.
Ein neuer Server mit einem älteren Dispatcher gleicher Version scheitert bereits
an der Paketprüfung. Der neue deklarierte Worker gehört vollständig zum frischen
Digest; ältere Pakete behalten ihre bisherigen Eintragsmengen und Draht-Digests.
Alle Core-Dienste werden weiterhin tatsächlich konstruiert, jeder Aufruf behält
seinen isolierten Worker, seine frische Paketprüfung und das bestätigte Ende.

Die Worker-Fabrik liegt im bestehenden MCP-Modul `src/worker.js`; `server.js`
reexportiert dieselbe Funktion. Die private Core-Generation importiert dafür
keinen ungenutzten SDK-Server. Die Fassade lädt ihren tatsächlichen SDK parallel
zum bereits frisch beanspruchten privaten Generationsstart und wartet auf beide
Ergebnisse vor MCP-Bereitschaft.
Ein SDK-Ladefehler beendet die bereits qualifizierte Generation.
Die gemeinsame Paketprüfung liegt in Core `runtime/plugin-provenance.js`. Die
Protokollfassade verwendet denselben vollständigen frischen Prüfpfad mit festen
Paket-/Markerpfaden und allen drei Digests. Über asynchrone Importe werden keine
geprüften Beobachtungen wiederverwendet. Die zusätzliche frische Prüfung unter
der Publikationssperre erfolgt vor Generationsstart und SDK-Import; die Generation
prüft ihre Provenienz ebenfalls vollständig. Es gibt keinen dauerhaften Digest-Cache.
Der bestehende getrennte Aufsichtsprozess bootet bereits während der Launcher-
Vorbereitung. Ein begrenzter privater Ready-/Aktivierungsdialog hält ihn bis zur
geprüften Publikation wartend. Erst dann folgen dieselbe frische Claim-Prüfung
und der Fassadenstart. Bei fehlgeschlagener Vorbereitung wird der wartende Owner
geordnet beendet; SDK und öffentliche Bereitschaft bleiben vollständig gesperrt.
Der bestehende synchrone Vorschau-Renderer lädt die gepinnten HTML-/CSS-Parser
über deren mitgelieferte CommonJS-Einstiege erst beim Rendern. Die echte Core-
Servicekonstruktion und vollständige Provenienzprüfung bleiben vor Bereitschaft;
Parser-Versionen, synchrone Rückgaben und Ressourcen-/Sicherheitsgrenzen bleiben gleich.

Die optionale UI-Protokollkomposition liegt in
`packages/cli/lib/mcp-decision-protocol.js`. Vollständige und schlanke UI-Einstiege
laden dieselbe Definition nur bei Bedarf. Der Standardpfad des reduzierten
Copilot-Pakets importiert keine privaten UI-Core-Module.

`packages/core/lib/owner-placement.js` bindet feste interne Rollen an das
Verzeichnis und eine bereits vom jeweiligen Eigentümer erzeugte Metadatendatei.
Inodes werden verlustfrei gelesen. Gerätenummern prüfen laufende Zugriffe, dienen
aber in neuen Formaten nicht als dauerhafte Kennung über Neustarts hinweg. Der
gemeinsame Initialisierer erstellt Staging-Version 3 und Abschlussbeleg-Version 2
vor der atomaren Veröffentlichung; eine private Belegdatei ist noch kein
veröffentlichter Effekt. Der Marketplace-Eigentümer verwendet Journal-Version 2.
Alte Formate behalten ihre ursprünglichen Prüfregeln. Die gesonderte
Wiederherstellung einer alten offenen Veröffentlichung benötigt deren frühere
vollständige Nachweise, eine konkrete Vorschau und ausdrückliche Bestätigung;
Projektinitialisierung und Diagnose lösen sie nicht aus. Diese Quellzuordnung
belegt keine Aktualisierung oder Qualifikation einer bestehenden Installation.

Bestehende installierte Pfade wie `runtime/create-agdf`,
`node_modules/create-agdf` und versionierte MCP-Datenverzeichnisse bleiben gültig.
Sie bezeichnen erzeugte beziehungsweise installierte Artefakte. Alte aktive
Quellroots `create-agdf/`, `agdf/` und `agdf-mcp-server/` sind entfernt. Historische
Tags werden ausdrücklich über ihren damaligen eindeutigen Manifestpfad gelesen;
fehlende oder doppelte Owner werden abgelehnt.
