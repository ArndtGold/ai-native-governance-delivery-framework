# Paket- und Quellstruktur

Die kanonischen Plugin-Inhalte liegen unter `plugins/agdf/`. Sie folgen dem portablen
Agent-Plugins-Format 1.0.0: `plugin.json` beschreibt die Identität, `skills/` enthält die
Skills. Host-Konfigurationen werden aus derselben Definition erzeugt. Ein Maintainer
ändert die [Definition](../../plugins/agdf/meta/agdf-plugin.definition.json) und die
kanonischen Inhalte; erzeugte Manifeste sind Projektionen dieser Quellen.

| Bestandteil | Kanonischer Ort | Zuständigkeit |
|---|---|---|
| Plugin | `plugins/agdf/` | Identität, Skills, Verträge, Assets und Control-Vorlagen |
| Control-Kern | `create-agdf/lib/control-evaluation/`, `control-state/`, `skill-dispatch/` | Regeln prüfen, Run-/Gate-/Revisionsbindung und Freigaben validieren |
| CLI und Installation | `agdf/`, `create-agdf/bin/`, `create-agdf/lib/installers/`, `host-adapters/` | Befehle, Paketinstallation, Host-Komposition und Wiederherstellung |
| MCP | `agdf-mcp-server/`, `create-agdf/lib/mcp-lifecycle/` | Read-only Werkzeugadapter und dessen Lebenszyklus; Entscheidungen bleiben beim Control-Kern |
| Build und Prüfung | `create-agdf/scripts/`, `create-agdf/lib/public-plugin/` | Profile erzeugen, reale Ausgaben prüfen und Paketnachweise erstellen |

Es bleiben die drei npm-Pakete `create-agdf`, `@agdf/cli` und `@agdf/mcp-server` mit
ihren bisherigen Befehlen, Exports und exakten Versionsbindungen. Der Control-Kern
ist eine logische Modulgrenze innerhalb der vorhandenen Implementierung. Er bekommt
kein zusätzliches veröffentlichtes Paket ohne einen unabhängigen Verbraucher.

## Profile und Discovery

| Profil | OpenAI-Einstellungen | Automatische Fähigkeiten |
|---|---|---|
| Quellbaum | `plugin.json` → `extensions.com.openai` | Skills; keine ausführbaren Hooks und kein MCP. Als Entwicklungsquelle nicht installierbar. |
| Öffentliches Skills-Paket | `plugin.json` → `extensions.com.openai` | Skills; keine Hooks, MCP- oder App-Konfiguration |
| Lokales Codex-/Claude-Runtime-Paket | Vollständige `.codex-plugin/plugin.json`; keine Inline-OpenAI-Erweiterung im portablen Root | Erzeugte Hooks und bestehende hostgebundene MCP-Deklarationen unter `mcp/` |
| Copilot / OpenCode | Bisherige eigene Formate | Bestehende hostgebundene Komponenten und Consent-Regeln |

Inline-OpenAI-Einstellungen ersetzen das gesamte Fallback-Objekt. Der lokale Runtime-
Build lässt Inline-Einstellungen deshalb weg und enthält einen vollständigen Fallback
mit Präsentation, Skills, Hooks und MCP-Pfad. Eine Mischung beider Objekte wäre falsch.
Copilots Root-`plugin.json` bleibt ein Copilot-Manifest und wird nicht durch das portable
Manifest ersetzt. Ein allgemeiner portabler MCP-Launcher ist nicht Teil dieser Migration.

Die gemeinsamen Hook-Vorlagen liegen unter
[`host-templates/shared/hooks/`](../../plugins/agdf/host-templates/shared/hooks/).
Nur Runtime-Builder materialisieren sie als `hooks/`. Die Vorlagen selbst gehören
nicht in verteilte Profile. Der gemeinsame
[Quellpfad-Resolver](../../create-agdf/lib/public-plugin/source-root.js) wird von
Repository-Buildern verwendet; installierte Runtime-Pfade behalten ihren eigenen Owner.

## Erzeugen, prüfen und wiederherstellen

Im Repository zuerst `npm ci --ignore-scripts`, dann
`npm --prefix create-agdf run release:prepare` ausführen. Die gehashten Schemata liegen
unter [`meta/schemas/agent-plugins/1.0.0/`](../../plugins/agdf/meta/schemas/agent-plugins/1.0.0/).
Ajv ist exakt im privaten Repository als Entwicklungsabhängigkeit gebunden. Es wird
weder im Offline-Validator importiert noch als Runtime-Abhängigkeit veröffentlicht.

Schema-, Profil-, Discovery- und Ressourcenprüfungen laufen auf den erzeugten Dateien,
bevor ein öffentliches Paket seine Repository-Readiness erhält. Der öffentliche Builder
erzeugt zunächst ein temporäres Paket und ersetzt die bisherige Ausgabe erst nach
erfolgreicher Prüfung. Bei Fehlern bleibt der bisherige Kandidat erhalten. Für lokale
Hosts erzeugt `prepare-local-plugin.js <host>` nur die erforderlichen Profile; Installation
und Recovery laufen weiter über die vorhandenen Installations-Owner.

Bei einer lokalen Codex-Installation tragen Root-`plugin.json` und Codex-Fallback
dieselbe aus dem Quellinhalt abgeleitete Kennung `+codex.local-…`. Die kanonische
Paketversion und das Claude-Manifest behalten ihre Release-Version. Provenance
normalisiert ausschließlich die beiden projizierten Versionsfelder; eine abweichende
Installationskennung oder andere Inhaltsänderung schlägt weiterhin fehl.

Die Ausgaben bleiben unter `create-agdf/generated/`: gemeinsames Runtime-Plugin,
Copilot-Profil, OpenCode-Konfiguration und öffentlicher Kandidat. Ein gültiger Build
beweist noch keine Installation oder Host-Erkennung. Tatsächliche npm-Tarballs,
isolierte Installationsfixtures und frische Host-Sitzungen haben getrennte Nachweise.
Die [Installationsanleitung](../../INSTALL.md) und der
[Compatibility-Bericht](../compatibility/HOST_COMPATIBILITY.md) erklären diese Grenzen.

Die Migration wurde in zwei Stufen geprüft: zuerst Format und Profilzusammensetzung,
dann der Quellpfad. Der alte Quellbaum wird nicht als Spiegel oder Symlink erhalten.
Historische Tags und freigegebene Artefakte behalten ihre damaligen Pfade. Der
Release-History-Owner unterstützt solche Tag-Pfade ausdrücklich als Archivkompatibilität
und weist zwei konkurrierende Quellwurzeln innerhalb eines Tags zurück.
