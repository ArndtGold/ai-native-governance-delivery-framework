# Native Codex-Prüfungen

Der [Wartungs- und Release-Vertrag](../../docs/maintenance/README.md) beschreibt den verpflichtenden
Linux-/Windows-CLI-Release-Test, CI-Secrets, commitgebundene Artefakte und die Paketbudget-Pflege.
Die interaktiven Desktop-/Hook-Probes weiter unten bleiben macOS-spezifisch.

## Standardtest: Codex CLI mit Luna

```bash
npm run native:codex-e2e -- --model gpt-6-luna
```

Das Skript installiert den aktuellen Stand mit ausdrücklicher Capability-Zustimmung in einem
isolierten CLI-Profil und prüft ihn ohne Desktop-Neustart. Es entfernt die Testinstallation danach
wieder. Ergebnis: `probe-results/codex-host-e2e-<Zeitstempel>/summary.txt`. Die ältere
`native:codex-probe` bleibt eine optionale Transport-Untersuchung (Teil C), nicht der Standardtest.

## Host-E2E Claude Code: ein Befehl, ein festes Tupel

```bash
npm run native:claude-e2e                               # Standardmodell claude-sonnet-5
npm run native:claude-e2e -- --model <modell> --keep    # anderes Modell, Arbeitsordner behalten
```

Prüft genau ein protokolliertes Tupel aus Claude-Code-Version, Modell, Betriebssystem, Node und
AGDF-Version in sechs Schritten: Host, Installation des aktuellen Checkouts über das AGDF-CLI,
Discovery (`claude mcp list` meldet `plugin:agdf:agdf` als verbunden), ein echter
`agdf_dispatch`-Aufruf mit erwartetem `control_result`, ein definierter Fehlerfall (relatives
`working_directory` ergibt `invalid_input`) und Entfernen nur über `claude plugin uninstall` ohne
Reste. Belege stammen aus `stream-json`-Ereignissen und CLI-Ausgaben, nie aus Modelltext.

Alles läuft in einem isolierten `CLAUDE_CONFIG_DIR` unter `probe-results/`; aus `~/.claude` wird nur
`.credentials.json` für die zwei kurzen Sitzungen kopiert und danach gelöscht. Unter macOS liegen die
Zugangsdaten im Schlüsselbund; dann werden die beiden Sitzungsschritte als übersprungen und damit
nicht bestanden gemeldet. Ergebnis: `probe-results/claude-host-e2e-<Zeitstempel>/summary.txt` und
`observation.json`.

## Live-Matrix Request Activation unter Claude Code

```bash
npm run native:claude-activation-matrix
npm run native:claude-activation-matrix -- --runs 3 --concurrency 8 --model <modell> --keep
```

Prüft, ob das installierte Plug-in in echten `claude -p`-Sitzungen je nach Stufe richtig reagiert:
still bei Lesefragen, aktiv bei jeder verlangten Änderung, auch bei kleinen Fixes, und ohne
Implementierung vor der UR. Pro Lauf ein Wegwerf-Git-Repo; bewertet werden nur `stream-json`-Toolaufrufe
und `git status`. Das Ergebnis ist probabilistische Live-Evidenz, kein Release-Gate.
Ergebnis: `probe-results/claude-activation-matrix-<Zeitstempel>/summary.txt` und `observation.json`.
Letzter Nachweis: [evidence/claude-activation-matrix-20260928.md](evidence/claude-activation-matrix-20260928.md).

## Live-Matrix Request Activation unter Codex CLI

```bash
npm run native:codex-activation-matrix -- --scope-run agdf-request-activation-boundary
npm run native:codex-activation-matrix -- --scope-run <run-id> --runs 3 --concurrency 2 --model <modell> --keep
```

Führt dieselben zehn Fälle je dreimal mit `codex exec --json` in frischen Wegwerf-Git-Repositories
aus. Vorher werden Codex-Version, aktives AGDF-MCP und Paketversion geprüft. Die Matrix verwendet
ein temporäres `CODEX_HOME` mit den aktiven Modell-/Reasoning-Einstellungen und einer isolierten Kopie
des installierten AGDF-Pakets; nur die MCP-Launcher- und Datapfade zeigen in den temporären Bereich.
Die Authentifizierungsdatei wird kurzzeitig mit restriktiven Rechten kopiert und am Ende entfernt.
Das echte Profil und der echte AGDF-Datenbestand bleiben unverändert. Codex führt die Sitzungen mit
seinem automatischen Reviewer im `workspace-write`-Sandbox aus. Bewertet werden strukturierte
AGDF-Aufrufe und `git status`, niemals Modelltext. Das Ergebnis ist probabilistische Host-Evidenz,
kein Release-Gate.
Ergebnis: `probe-results/codex-activation-matrix-<Zeitstempel>/summary.txt` und `observation.json`.
Letzter Nachweis: [evidence/codex-activation-matrix-20260928.md](evidence/codex-activation-matrix-20260928.md).

## Host-E2E Codex: ein Befehl, ein festes Tupel

Dies ist der Standardtest für AGDF unter Codex. Frische CLI-Prozesse prüfen den installierten
Teststand ohne Start oder Neustart der Desktop-App. Desktop-Prüfungen bleiben separat und sind
nur für Aussagen über die App-Oberfläche oder deren tatsächlich geladenen Pluginstand erforderlich.

Mit `--accept-plugin-capabilities` umfasst die bewusste Installationszustimmung den
mitgelieferten SessionStart-Hook und den MCP-Dispatcher. Diese Zustimmung gilt nicht
pauschal für andere Plugins, weitere Tools oder spätere geänderte Hook-Definitionen und erteilt
keine AGDF-Gate-Freigabe. Sie ist von der technisch wirksamen Codex-Freigabe zu unterscheiden:
MCP-Toolfreigaben sind pluginbezogen konfigurierbar; laut Codex-Vertrag vertraut eine Installation
den Hooks nicht automatisch. Die native Prüfung und Bestätigung der aktuellen Hook-Definition
bleibt erforderlich. Der Installer schreibt dafür keine nativen Hook-Vertrauens-Hashes.
Ein erfolgreicher MCP-Test darf deshalb keinen erfolgreichen Hook-Test behaupten.

Sind MCP-Freigabe und Plugin geprüft, aber die native Hook-Bestätigung noch offen, lautet der
Abschluss „MCP bereit – Hook-Bestätigung ausstehend“ (`effective_state:
 mcp_ready_hook_review_required`, `result: partial`, Exitcode 1). Die nächste Aktion ist
`review_codex_hook`, nicht ein pauschaler Desktop-Neustart. Der CLI-MCP-E2E akzeptiert ausschließlich
diesen benannten, fehlerfreien Zwischenstand zusätzlich zum vollständigen Installationserfolg;
andere Teilfehler bleiben Testfehler. Hook-Ausführung wird dadurch nicht als bestanden gewertet.

Lokale Installation mit gemeinsamer Zustimmung:

```bash
npm --prefix create-agdf run install:codex -- --accept-plugin-capabilities --json
```

Die Option ist nur für Codex-Installation erlaubt und nicht mit `--runtime-checks manual|cancel`
kombinierbar. Ohne diese Option bleibt das bisherige Einwilligungsverhalten unverändert.
Nach verifizierter Installation wird die Hook-Einwilligung gespeichert und ausschließlich
`plugins."agdf@agdf".mcp_servers.agdf.tools.agdf_dispatch.approval_mode` über Codex'
native `config/value/write`-Schnittstelle gesetzt und per `config/read` nachgelesen.
Vorhandene Plugin-/Server-/Toolsperren werden nicht überschrieben. Fehler oder nicht wirksame
Freigaben ergeben `partial`; `runtime_checks.mcp_approval` enthält den Befund. Native Hook-Prüfung
und Hook-Ausführung bleiben getrennte Nachweise. Globale Sandbox- und Approval-Einstellungen
bleiben unverändert. Zum Widerruf die pluginbezogene Toolfreigabe in Codex zurücknehmen;
`runtime-checks manual` betrifft nur die automatischen Prüfungen, nicht die MCP-Toolfreigabe.

```bash
npm install -g @openai/codex@latest                     # einmalig: aktuelle Codex-CLI
npm run native:codex-e2e -- --model gpt-6-luna          # Modell explizit festhalten
npm run native:codex-e2e -- --model <modell> --keep     # anderes Modell, Arbeitsordner behalten
```

Die Prüfung deckt den MCP-Lebenszyklus und die Skill-Fortsetzung ab. Sie legt ein isoliertes
AGDF-Testziel mit einem expliziten Run an. Danach folgen: Host, Installation des aktuellen Checkouts
über das AGDF-CLI, Discovery (`codex mcp get agdf` zeigt den Launcher aus dem Plugin), ein echter
`agdf_dispatch`-Aufruf mit erwartetem `control_result`, der Fehlerfall `invalid_input` und Entfernen
über `agdf uninstall --surface codex --scope global --confirm` ohne MCP-Server, `config.toml`-Eintrag,
Plugin-Cache oder MCP-Runtime. Dazu gehört auch die vom Installer gesetzte Tool-Freigabe
`plugins."agdf@agdf".mcp_servers.agdf.tools.agdf_dispatch.approval_mode` (Feld `plugin_tool_policy`);
AGDF entfernt sie über `config/value/write` und meldet `partial`, wenn Codex sie behält. Belege stammen aus `codex exec --json` und den Sitzungsprotokollen;
Codex vermerkt dort auch die `pluginId`, die `agdf@agdf` lauten muss.

Zusätzlich prüft eine dritte Luna-Sitzung `code-review`: Der Dispatcher muss `skill_continuation`
mit den Modulen `quality` und `context-graph` samt gültiger Inhaltsprüfsumme liefern. Eine
Hook-Bindung ist dafür nicht erforderlich. Der Protokolltest `npm --prefix agdf-mcp-server run
test:continuation` prüft dieselbe Eigenschaft für alle neun Skills mit Fortsetzung und vergleicht
die gelieferten Texte mit den gepackten Verträgen. Er führt keine Modellbewertung dieser Skills durch.

Der Modulbestand steht je Skill in `runtimeContractModules` der Plugin-Definition. MCP liefert
diese Module in `continuation.runtime_contracts`. Die Dateien sind Teil der geprüften
Runtime-Provenienz. Fehlende Module brechen die Fortsetzung ab. Bei CLI-Aufrufen bleibt die
gelieferte Schema-2-Bindung der Leseweg; fehlt auch sie, dürfen die im Skill referenzierten
Dateien direkt gelesen werden. Ein nicht lesbarer Pflichtvertrag beendet die Skill-Ausführung.

Nach einem Plugin-Update kann der separate SessionStart-Hook in Codex `modified` melden.
Ein Neustart ersetzt die Vertrauensprüfung nicht: Unter `/hooks` den aktuellen AGDF-Hook prüfen
und bestätigen, anschließend eine neue Sitzung starten. Gespeicherte Vertrauens-Hashes werden
nicht automatisch ersetzt. Eine veraltete AGDF-Einwilligung für automatische Laufzeitprüfungen
muss ebenfalls erneuert werden. Der MCP-Fortsetzungspfad benötigt diese Hook-Freigabe nicht.

Die Prüfung verwendet die neue Installeroption und prüft deren Ergebnis; sie injiziert selbst
keine Freigabe. Der Installer gibt nur `agdf_dispatch` über die Plugin-Einstellung
`plugins."agdf@agdf".mcp_servers.agdf.tools.agdf_dispatch.approval_mode = "approve"` frei.
Der Transport bleibt beim Plugin. Grundlage ist die
Benutzerkonfiguration: Der Installer prüft mit `config/read` die aktive Basisebene `user`
und schreibt mit `config/value/write` ausschließlich deren Datei samt `expectedVersion`.
Eine Projekt- oder Profilfreigabe ersetzt den Benutzer-Nachweis nicht; fehlende Ebenen,
Versionskonflikte und bestehende Deaktivierungen führen nicht zu einer Erfolgsmeldung.
Offene Hook-Zustände ergeben `partial`: `hook_review_required` verlangt Bestätigung,
`hook_disabled` Aktivierung, `host_unverified` Inspektion und
`hook_trusted_session_unverified` einen Ausführungsnachweis in einer neuen Sitzung.
Der CLI-Test akzeptiert nur diese genau zugeordneten Teilzustände ohne weiteren Fehler.
Sie sind kein Nachweis einer erfolgreichen Hook-Ausführung. Siehe auch die
[offizielle Plugin-Dokumentation](https://developers.openai.com/plugins/build/plugins#bundled-mcp-servers-and-lifecycle-hooks).
Die Sitzungen verwenden die Read-only-Sandbox. Der Prompt erlaubt die Tool-Suche über den
Codex-Code-Wrapper, damit Luna auch verzögert geladene MCP-Tools findet. Gezählt wird genau ein
Aufruf je Sitzung mit bestätigter `pluginId = agdf@agdf`.

Alles läuft in einem isolierten `CODEX_HOME`; nur `~/.codex/auth.json` wird für die Sitzungen
kopiert und danach gelöscht. Der Test benötigt Netzwerkzugriff für die Modellaufrufe.
`dispatch-process.json`, `failure-process.json`, `continuation-process.json` und `uninstall-process.json` enthalten die
Prozessausgaben zur Diagnose. `Reading additional input from stdin` allein ist kein Fehlernachweis.
Mit `CODEX_BIN` nutzen Installation und Prüfung dieselbe Codex-Binärdatei. Die deterministischen
Kompatibilitätsfälle ersetzen diesen echten Hostlauf nicht.

Verifizierter Lauf vom 26.09.2026: Codex CLI 0.157.1, `gpt-6-luna`, macOS x64, Node v22.22.3,
AGDF 0.14.5. Installation, Kontrollziel, Discovery, positiver Dispatch, Fehlerfall und Entfernung
bestanden. Beide Sitzungsprotokolle bestätigen das Modell und `pluginId = agdf@agdf`.
Der [strukturierte Nachweis](../../docs/compatibility/evidence/codex-luna-e2e-20260926.json)
belegt den CLI-MCP-Lauf. Desktop-Oberfläche und SessionStart-Hook wurden damit nicht geprüft.

Der [Nachtest der Wartungs- und Sicherheitskorrekturen](evidence/codex-security-fixes-20260926.json)
vom selben Tag bestätigt mit demselben Host-/Modelltupel zusätzlich die Benutzerfreigabe
über den korrigierten Installer und die dritte Sitzung für die Skill-Fortsetzung.
Projektfreigaben, restriktive Einstellungen, fehlerhafte Konfigurationsebenen und alle offenen
Hook-Zustände sind durch Regressionstests abgedeckt. Windows-Shims wurden simuliert getestet;
ein nativer Windows-Lauf steht aus.

## Weitere Prüfungen (mit manuellem Schritt)

Diese Skripte erheben direkte Host-Evidenz zu Hooks. Sie laufen nicht in CI, weil sie einen
angemeldeten Codex, eine echte Sitzung und eine manuelle Vertrauensprüfung in Codex brauchen.
AGDF umgeht diese Prüfung nie.

## Voraussetzungen

- macOS mit Node.js 18 oder neuer und angemeldetem Codex (CLI auf dem `PATH` oder `CODEX_BIN`)
- dieser Checkout mindestens auf Commit `4e414ab`
- für Teil A und B ein zweites Terminal für den manuellen Schritt in Codex

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
