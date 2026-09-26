# Native Codex-Prüfungen auf macOS

Diese Skripte erheben direkte Host-Evidenz auf einem Mac. Sie laufen nicht in CI, weil sie einen
angemeldeten Codex, eine echte Sitzung und eine manuelle Vertrauensprüfung in Codex brauchen.
AGDF umgeht diese Prüfung nie.

## Voraussetzungen

- macOS mit Node.js 18 oder neuer und angemeldetem Codex (CLI auf dem `PATH` oder `CODEX_BIN`)
- dieser Checkout mindestens auf Commit `4e414ab`
- ein zweites Terminal für den manuellen Schritt in Codex

Alle Prüfungen werden aus dem Repository-Wurzelverzeichnis über npm gestartet. Standardmäßig wird
`codex` vom `PATH` verwendet. Für die in der ChatGPT-App gebündelte Version davor setzen:
`CODEX_BIN=/Applications/ChatGPT.app/Contents/Resources/codex npm run native:codex-hook-check`.

## Teil A (Pflicht): startet der AGDF-Hook unter Codex?

```bash
npm run native:codex-hook-check
```

Das Skript sichert `~/.codex/config.toml` und die AGDF-Einwilligung, installiert den lokalen Stand
mit aktivierten automatischen Prüfungen und liest den Hook-Status über Codex' eigenes
`app-server`-Protokoll. Dann bittet es dich, den geänderten AGDF-Hook in Codex unter `/hooks` zu
prüfen und nur diesen Hook zu bestätigen. Danach startet es eine kurze Sitzung mit `codex exec` und
sucht den AGDF-Kontext in der Ausgabe und im Sitzungsprotokoll unter `~/.codex/sessions`.

Erwartet wird `ERGEBNIS: PASS` mit Aktivierungs-Guard und Dispatcher-Bindung im Kontext und ohne
`plugin_root_mismatch`. Die Installation ersetzt deine bisherige Codex-Installation von AGDF durch
den lokalen Stand. Zurück zur veröffentlichten Version: `npx --yes @agdf/cli@0.14.5 codex`.

## Teil B (optional): Grundlage für eine spätere Trennung der Hook-Dateien

```bash
npm run native:codex-hook-probe
```

Ein Wegwerf-Plugin `hookprobe` mit eigenem Marketplace prüft zwei Fragen, ohne AGDF anzufassen:
ob `PLUGIN_ROOT` und `CLAUDE_PLUGIN_ROOT` auf denselben Pfad zeigen, und ob ein `hooks`-Eintrag in
`.codex-plugin/plugin.json` die Datei `hooks/hooks.json` ersetzt. Die Hooks schreiben ihr Ergebnis
selbst in eine Datei; das Skript entfernt Plugin und Marketplace am Ende wieder. Anzahl und
Freigabestatus der Hooks liest es vor und nach deiner Freigabe in `/hooks` direkt aus Codex
(`app-server` `hooks/list` über `codex-hooks-list.mjs`), du musst nichts abzählen. Sind nicht alle
Hooks freigegeben, weist die Kurzfassung ausdrücklich darauf hin.

## Teil C (optional): kann AGDF unter Codex alles im Plugin halten?

```bash
npm run native:codex-mcp-probe
npm run native:codex-mcp-probe -- --no-session     # ohne Modellaufruf
npm run native:codex-mcp-probe -- --review-hooks   # mit Pause für die Hook-Freigabe in /hooks
```

Unter Claude Code entfernt `claude plugin uninstall` inzwischen alles, weil MCP-Server,
Runtime und Einwilligung im Plugin liegen. Diese Probe klärt, ob das unter Codex genauso geht. Ein
Wegwerf-Plugin `codexprobe` deklariert sechs MCP-Server, die sich nur im Startweg unterscheiden
(`${PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_ROOT}`, relativer Pfad, Start über die Umgebung, absoluter Pfad
als Kontrolle und absoluter Pfad in Codex' eigene Plugin-Kopie unter `plugins/cache`), und einen
SessionStart-Hook. Jeder Prozess, der wirklich startet, protokolliert
Argumente, Arbeitsverzeichnis, `PLUGIN_ROOT`, `PLUGIN_DATA` und legt einen Marker im Datenordner an.
Danach entfernt das Skript Plugin und Marketplace und listet, was übrig bleibt.

Alles läuft in einem isolierten `CODEX_HOME` unter `probe-results/`; `~/.codex` wird nicht verändert. Für
die eine kurze `codex exec`-Sitzung wird nur `~/.codex/auth.json` kopiert und sofort danach wieder
gelöscht, auch bei Abbruch. Liegen die Zugangsdaten im Schlüsselbund, überspringt das Skript die
Sitzung und nennt den Befehl zum Anmelden im isolierten Ordner. Ohne `--review-hooks` bleibt der
Hook ungeprüft und läuft nicht. Weil Codex 0.145.0 MCP-Servern weder `PLUGIN_ROOT` noch
`PLUGIN_DATA` gibt, klärt nur der Hook, wo Codex Plugin-Daten ablegt und ob `plugin remove` sie
löscht; für diese Frage `--review-hooks` verwenden. Der Bericht blendet die kuratierten
Remote-Plugins, Caches und System-Skills aus, die Codex bei der ersten Sitzung selbst anlegt.

Der temporäre Codex-Arbeitsordner (`work-tmp/` neben den Ergebnissen) wird am Ende gelöscht;
`--keep` behält ihn zur Fehlersuche.

## Ergebnis zurückgeben

Alle drei Prüfungen legen ihre Ergebnisse direkt in diesem Checkout ab, nicht im Temp-Verzeichnis
des Systems:

| Prüfung | Ordner |
|---|---|
| Teil A | `probe-results/codex-hook-check-<Zeitstempel>/` |
| Teil B | `probe-results/codex-hook-probe-<Zeitstempel>/` |
| Teil C | `probe-results/codex-mcp-probe-<Zeitstempel>/` |

`probe-results/` ist git-ignoriert. Jede Prüfung nennt am Ende den Pfad ihrer `summary.txt`; deren
Inhalt reicht als Rückmeldung. Die übrigen Dateien im selben Ordner enthalten die Rohdaten für eine
spätere Evidenz-Aufnahme. Sie können lokale Pfade enthalten und gehören nicht ungeprüft ins Repository.
