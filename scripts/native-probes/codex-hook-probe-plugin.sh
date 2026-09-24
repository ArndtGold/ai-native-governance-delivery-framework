#!/usr/bin/env bash
# Optional native probe on macOS for a possible split of the hook files. With a throwaway plugin it answers:
#   1. Do PLUGIN_ROOT and CLAUDE_PLUGIN_ROOT point to the same plugin root in Codex hooks?
#   2. Does a `hooks` entry in .codex-plugin/plugin.json replace hooks/hooks.json (as documented) or add to it?
# The hooks write their own evidence file, so the result does not depend on any model output.
# The probe plugin and its marketplace are removed at the end.
#
# Usage:  npm run native:codex-hook-probe   (from the repository root)
set -u

CODEX="${CODEX_BIN:-codex}"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="${TMPDIR:-/tmp}"; OUT="$(cd "$OUT" && pwd -P)/agdf-codex-hookprobe-$STAMP"
MARKETPLACE="$OUT/marketplace"
PLUGIN="$MARKETPLACE/plugins/hookprobe"
LOG="$OUT/probe-log.jsonl"
SUMMARY="$OUT/summary.txt"
MARKETPLACE_ID="agdf-hookprobe"
mkdir -p "$MARKETPLACE/.agents/plugins" "$PLUGIN/.codex-plugin" "$PLUGIN/hooks"

say() { printf '%s\n' "$*" | tee -a "$SUMMARY"; }
# Some Codex versions may not know `exec --json`; retry without it only for that specific error.
run_exec() {
  (cd "$1" && "$CODEX" exec --json --sandbox read-only "Antworte nur mit OK.") > "$2" 2> "$3"
  local rc=$?
  if [ $rc -ne 0 ] && grep -qiE "unexpected argument '--json'|unknown option.*--json|unrecognized.*--json" "$3"; then
    (cd "$1" && "$CODEX" exec --sandbox read-only "Antworte nur mit OK.") > "$2" 2>> "$3"
    rc=$?
  fi
  return $rc
}
pause() { printf '\n>>> %s\n    Weiter mit Enter ... ' "$1"; read -r _ < /dev/tty; }

[ "$(uname -s)" = "Darwin" ] || { echo "Dieses Skript ist für macOS gedacht."; exit 2; }
command -v node >/dev/null || { echo "node fehlt."; exit 2; }
command -v "$CODEX" >/dev/null 2>&1 || [ -x "$CODEX" ] || { echo "Codex nicht gefunden: $CODEX (CODEX_BIN setzen)."; exit 2; }

cat > "$MARKETPLACE/.agents/plugins/marketplace.json" <<EOF
{ "name": "$MARKETPLACE_ID", "interface": { "displayName": "AGDF hook probe" },
  "plugins": [ { "name": "hookprobe", "source": { "source": "local", "path": "./plugins/hookprobe" },
    "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" }, "category": "Productivity" } ] }
EOF
cat > "$PLUGIN/.codex-plugin/plugin.json" <<'EOF'
{ "name": "hookprobe", "version": "0.0.1", "description": "Throwaway probe for Codex hook loading semantics.",
  "hooks": "./hooks/codex-hooks.json",
  "interface": { "displayName": "AGDF hook probe", "shortDescription": "Throwaway hook probe.", "developerName": "AGDF", "category": "Productivity" } }
EOF
cat > "$PLUGIN/hooks/hooks.json" <<'EOF'
{ "hooks": { "SessionStart": [ { "hooks": [ { "type": "command", "command": "node \"$PLUGIN_ROOT/probe.js\" default-hooks-json" } ] } ] } }
EOF
cat > "$PLUGIN/hooks/codex-hooks.json" <<'EOF'
{ "hooks": { "SessionStart": [ { "hooks": [ { "type": "command", "command": "node \"$PLUGIN_ROOT/probe.js\" manifest-hooks-entry" } ] } ] } }
EOF
# macOS ships Bash 3.2, so the absolute log path is embedded by Node instead of Bash quoting features.
cat > "$PLUGIN/probe.js" <<'EOF'
const fs = require("node:fs");
const real = (value) => { try { return value ? fs.realpathSync(value) : null; } catch { return "unresolvable:" + value; } };
const pluginRoot = process.env.PLUGIN_ROOT || null;
const claudeRoot = process.env.CLAUDE_PLUGIN_ROOT || null;
fs.appendFileSync(__AGDF_PROBE_LOG__, JSON.stringify({ source: process.argv[2], PLUGIN_ROOT: pluginRoot, CLAUDE_PLUGIN_ROOT: claudeRoot,
  same_path: pluginRoot !== null && real(pluginRoot) === real(claudeRoot), script_dir: __dirname }) + "\n");
EOF
node -e 'const fs=require("fs");const [file,log]=process.argv.slice(1);fs.writeFileSync(file,fs.readFileSync(file,"utf8").replace("__AGDF_PROBE_LOG__",JSON.stringify(log)))' "$PLUGIN/probe.js" "$LOG"

say "AGDF Codex-Hook-Probe ($STAMP), Codex: $("$CODEX" --version 2>&1 | head -1)"
say "Ergebnisse: $OUT"
"$CODEX" plugin marketplace add "$MARKETPLACE" --json > "$OUT/01-marketplace-add.json" 2>&1 || say "marketplace add fehlgeschlagen (siehe 01-marketplace-add.json)"
"$CODEX" plugin add "hookprobe@$MARKETPLACE_ID" --json > "$OUT/02-plugin-add.json" 2>&1 || say "plugin add fehlgeschlagen (siehe 02-plugin-add.json)"

WORK="$OUT/session-dir"; mkdir -p "$WORK" && WORK="$(cd "$WORK" && pwd -P)"
git -C "$WORK" init -q
pause "Manueller Schritt:
    1. Zweites Terminal:  cd '$WORK' && $CODEX
    2. '/hooks' eingeben und NOTIEREN, wie viele SessionStart-Hooks von hookprobe@$MARKETPLACE_ID gelistet sind
       (1 = der Manifest-Eintrag ersetzt hooks/hooks.json, 2 = beide Dateien werden geladen).
    3. Nur die hookprobe-Hooks als vertrauenswürdig bestätigen, dann Codex beenden."
printf '    Anzahl gelisteter hookprobe-Hooks in /hooks: '; read -r listed < /dev/tty
say "In /hooks gelistet: ${listed:-keine Angabe}"

run_exec "$WORK" "$OUT/03-exec.jsonl" "$OUT/03-exec.err"
say "codex exec: exit=$?"

if [ -s "$LOG" ]; then
  node -e '
    const rows = require("fs").readFileSync(process.argv[1], "utf8").trim().split("\n").map((line) => JSON.parse(line));
    const sources = [...new Set(rows.map((row) => row.source))];
    console.log(`Ausgeführte Hook-Dateien: ${sources.join(", ")}`);
    console.log(sources.length === 1 && sources[0] === "manifest-hooks-entry"
      ? "=> Manifest-Eintrag ERSETZT hooks/hooks.json (wie dokumentiert)."
      : sources.includes("default-hooks-json") && sources.includes("manifest-hooks-entry")
        ? "=> BEIDE Dateien laufen: Manifest-Eintrag ergänzt nur."
        : "=> Nur hooks/hooks.json lief: Manifest-Eintrag wird ignoriert.");
    for (const row of rows) {
      console.log(`[${row.source}] PLUGIN_ROOT        = ${row.PLUGIN_ROOT}`);
      console.log(`[${row.source}] CLAUDE_PLUGIN_ROOT = ${row.CLAUDE_PLUGIN_ROOT}`);
    }
    console.log(rows.every((row) => row.same_path)
      ? "=> Beide Variablen zeigen in jedem Hook-Aufruf auf denselben Pfad."
      : "=> ACHTUNG: In mindestens einem Hook-Aufruf zeigen die Variablen auf verschiedene Pfade oder fehlen.");
  ' "$LOG" | tee -a "$SUMMARY"
else
  say "Kein Hook hat geschrieben ($LOG fehlt). Vertrauen in /hooks bestätigt? Details: 03-exec.err"
fi

say ""
say "Aufräumen:"
"$CODEX" plugin remove "hookprobe@$MARKETPLACE_ID" > "$OUT/04-plugin-remove.txt" 2>&1 && say "- Probe-Plugin entfernt" || say "- Probe-Plugin entfernen fehlgeschlagen (04-plugin-remove.txt)"
"$CODEX" plugin marketplace remove "$MARKETPLACE_ID" --json > "$OUT/05-marketplace-remove.json" 2>&1 && say "- Probe-Marketplace entfernt" || say "- Probe-Marketplace entfernen fehlgeschlagen (05-marketplace-remove.json)"
say "Bitte den Inhalt von $SUMMARY an Claude zurückgeben."
