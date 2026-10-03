# Paketstruktur und verbindliche Zuständigkeiten

Diese Referenz ordnet die im [Architektur-Einstieg](README.md) beschriebenen Verantwortlichkeiten
konkreten Quell-, Build- und Auslieferungsgrenzen zu. Für das Zusammenwirken der Bausteine siehe
[Bestehende Systemarchitektur](01-systemarchitektur.md#2-bausteine-und-verantwortlichkeiten).
Die vorgeschlagene Weiterentwicklung steht im [gemeinsamen Zielbild](03-agentenkontrolle-zielbild.md);
der folgende Baum beschreibt die bestehende Struktur.

**Stand: 3. Oktober 2026, Repository-Quelle.** Eine Quellzuordnung belegt keine Veröffentlichung
oder Aktualisierung einer bestehenden Host-Installation.

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
| Build/Release | `scripts/` | Ressourcen-/Profilprojektion, npm-Assembly, Release- und Historyprüfung |
| Evaluation | `evals/lib/`, `evals/scripts/` | Replay, Recorder und Benchmarks; keine Core-Laufzeitabhängigkeit |

`@agdf/core` ist privat. Es gibt weiterhin genau drei öffentliche npm-Produkte:
`create-agdf`, `@agdf/cli` und `@agdf/mcp-server`. Alle verwenden die gemeinsame
Version und Node.js >=22. `packages/cli/distribution/agdf/` ist der dünne
`@agdf/cli`-Wrapper; er importiert `create-agdf/cli`.

## Ressourcen und Provider

Der unveränderliche Resource-Context lädt Definition, Locales und die erlaubten
Contracts aus einer expliziten Paketbindung. Der private Core besitzt eine
abgeleitete Ressourcenprojektion unter `packages/core/generated/`. CLI, npm- und
Offline-Komposition binden ihre eigenen Ressourcen. Ein MCP-Aufrufer kann weder
Resource-URLs noch geerbte Plugin-Pfade ersetzen.

`createCoreServices({ resources, observers, runtimeBinding })` komponiert Dispatch
und Inspektion. Es gibt kein veränderliches globales Providerregister. Gitabfragen,
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
| Copilot-Runtime | Fokussierter Offline-Validator, Contracts unter `copilot-skills/contracts`; keine Installer-/SDK-/MCP-Payload |
| OpenCode | Eigene Konfigurationskomposition und das installierte `create-agdf`-Paket |

Source-, Runtime- und Installationsdigests haben unterschiedliche Aufgaben.
Runtime-/SDK- und Ressourcenänderungen werden in Provenance-Prüfungen erfasst;
Consent, Trust und Ownership bleiben unabhängige Fakten.

Bestehende installierte Pfade wie `runtime/create-agdf`,
`node_modules/create-agdf` und versionierte MCP-Datenverzeichnisse bleiben gültig.
Sie bezeichnen erzeugte beziehungsweise installierte Artefakte. Alte aktive
Quellroots `create-agdf/`, `agdf/` und `agdf-mcp-server/` sind entfernt. Historische
Tags werden ausdrücklich über ihren damaligen eindeutigen Manifestpfad gelesen;
fehlende oder doppelte Owner werden abgelehnt.
