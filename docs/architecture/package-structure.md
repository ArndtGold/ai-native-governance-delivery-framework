# Paketstruktur und verbindliche Zuständigkeiten

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
| Copilot-Runtime | Agent Plugins 1.0, fokussierter Offline-Validator, Contracts unter `skills/contracts`, Copilot-Hook unter `com.github.copilot/hooks` und pluginverwalteter MCP-Server mit gelocktem SDK |
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
