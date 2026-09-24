# Native Codex-Prüfungen auf macOS

Diese Skripte erheben direkte Host-Evidenz auf einem Mac. Sie laufen nicht in CI, weil sie einen
angemeldeten Codex, eine echte Sitzung und eine manuelle Vertrauensprüfung in Codex brauchen.
AGDF umgeht diese Prüfung nie.

## Voraussetzungen

- macOS mit Node.js 18 oder neuer und angemeldetem Codex (CLI auf dem `PATH` oder `CODEX_BIN`)
- dieser Checkout mindestens auf Commit `4e414ab`
- ein zweites Terminal für den manuellen Schritt in Codex

Standardmäßig wird `codex` vom `PATH` verwendet. Für die in der ChatGPT-App gebündelte Version:
`CODEX_BIN=/Applications/ChatGPT.app/Contents/Resources/codex`.

## Teil A (Pflicht): startet der AGDF-Hook unter Codex?

```bash
bash scripts/native-probes/codex-macos-hook-check.sh
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
bash scripts/native-probes/codex-hook-probe-plugin.sh
```

Ein Wegwerf-Plugin `hookprobe` mit eigenem Marketplace prüft zwei Fragen, ohne AGDF anzufassen:
ob `PLUGIN_ROOT` und `CLAUDE_PLUGIN_ROOT` auf denselben Pfad zeigen, und ob ein `hooks`-Eintrag in
`.codex-plugin/plugin.json` die Datei `hooks/hooks.json` ersetzt. Die Hooks schreiben ihr Ergebnis
selbst in eine Datei; das Skript entfernt Plugin und Marketplace am Ende wieder.

## Ergebnis zurückgeben

Beide Skripte legen ihre Ergebnisse unter `$TMPDIR` ab und nennen am Ende eine `summary.txt`. Deren
Inhalt reicht als Rückmeldung. Die übrigen Dateien im selben Ordner enthalten die Rohdaten für eine
spätere Evidenz-Aufnahme. Sie können lokale Pfade enthalten und gehören nicht ungeprüft ins Repository.
