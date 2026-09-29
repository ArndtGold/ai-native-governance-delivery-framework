#!/usr/bin/env bash
# Optional native probe on macOS: can AGDF keep all Codex state inside its plugin?
#
# Answers, for the installed Codex CLI, the questions that decide whether `codex plugin remove`
# can leave no AGDF traces, as `claude plugin uninstall` already does:
#   1. Which way of starting a plugin-bundled stdio MCP server works?
#      ${PLUGIN_ROOT} / ${CLAUDE_PLUGIN_ROOT} in args, a relative path, an env-based launcher,
#      or only an absolute path (control).
#   2. Which environment (PLUGIN_ROOT, PLUGIN_DATA, ...) and cwd do plugin MCP servers and hooks get?
#   3. Where is the plugin data directory, and is ${PLUGIN_DATA} expanded in MCP args?
#   4. What does `codex plugin remove` delete, and what stays behind?
#
# Everything runs in an isolated CODEX_HOME inside probe-results/; your real ~/.codex is only
# read to copy auth.json (needed for the one short `codex exec` session) and is never modified.
# The copied auth.json is deleted right after that session.
#
# Usage (from the repository root):
#   npm run native:codex-mcp-probe                       # full probe incl. one short session
#   npm run native:codex-mcp-probe -- --no-session       # install/list/remove only, no model call
#   npm run native:codex-mcp-probe -- --review-hooks     # pause so the probe hook can be trusted in /hooks
# CODEX_BIN selects another Codex binary, e.g. the one bundled with the ChatGPT app.
#   npm run native:codex-mcp-probe -- --keep             # keep the temporary Codex working directory
# Result: summary.txt and report.md in probe-results/codex-mcp-probe-<timestamp>/ in this checkout
# (git-ignored); both contain no credentials. The temporary Codex working directory is removed.

set -u
CODEX="${CODEX_BIN:-codex}"
NO_SESSION=0
REVIEW_HOOKS=0
KEEP=0
for arg in "$@"; do
  case "$arg" in
    --no-session) NO_SESSION=1 ;;
    --review-hooks) REVIEW_HOOKS=1 ;;
    --keep) KEEP=1 ;;
    *) echo "Unbekannte Option: $arg (erlaubt: --no-session, --review-hooks, --keep)"; exit 2 ;;
  esac
done
REPO="$(cd "$(dirname "$0")/../.." && pwd -P)"
RESULTS_REL="probe-results/codex-mcp-probe-$(date +%Y%m%d-%H%M%S)"
RESULTS="$REPO/$RESULTS_REL"

[ "$(uname -s)" = "Darwin" ] || { echo "Dieses Skript ist für macOS gedacht."; exit 2; }
command -v node >/dev/null || { echo "node fehlt."; exit 2; }
command -v "$CODEX" >/dev/null 2>&1 || [ -x "$CODEX" ] || { echo "Codex nicht gefunden: $CODEX (CODEX_BIN setzen)."; exit 2; }
# Resolve to a path first, otherwise the wrapper below would call itself.
CODEX="$(command -v "$CODEX")"
codex() { "$CODEX" "$@"; }

# The disposable Codex working directory lives next to the results, not in the system temp directory.
PROBE="$RESULTS/work-tmp"
mkdir -p "$PROBE" && PROBE="$(cd "$PROBE" && pwd -P)"
export CODEX_HOME="$PROBE/codex-home"
LOG="$PROBE/log"
MKT="$PROBE/marketplace"
PLUGIN="$MKT/plugins/codexprobe"
WORK="$PROBE/work"
REPORT="$RESULTS/report.md"
SUMMARY="$RESULTS/summary.txt"
# The copied auth.json must never outlive the probe, not even after Ctrl-C.
trap 'rm -f "$CODEX_HOME/auth.json"' EXIT INT TERM
mkdir -p "$RESULTS" "$CODEX_HOME" "$LOG" "$PLUGIN/.codex-plugin" "$PLUGIN/hooks" "$MKT/.agents/plugins" "$WORK"
# The session directory sits inside this checkout; its own git root keeps Codex from loading the
# AGDF repository's instructions and project configuration into the probe session.
git -C "$WORK" init -q

# A session that never started proves nothing about hooks or MCP servers; name the known causes.
exec_blocker() {
  if grep -q "requires a newer version of Codex" "$@" 2>/dev/null; then
    echo "Sitzung nicht gestartet: das in ~/.codex/config.toml eingestellte Modell braucht eine neuere Codex-Version (npm i -g @openai/codex@latest). Ergebnis NICHT aussagekräftig."
  elif grep -qiE "not logged in|401 Unauthorized|authentication" "$@" 2>/dev/null; then
    echo "Sitzung nicht gestartet: Codex ist nicht angemeldet. Ergebnis NICHT aussagekräftig."
  fi
}
# Portable timeout for macOS (no coreutils needed).
run_with_timeout() { local secs="$1"; shift; perl -e 'alarm shift; exec @ARGV' "$secs" "$@"; }

section() { printf '\n## %s\n\n' "$1" >> "$REPORT"; }
capture() {
  # capture <title> <command...>: record command, exit code and output in the report.
  local title="$1"; shift
  local out code
  out="$("$@" 2>&1)"; code=$?
  {
    printf '### %s\n\n`%s` -> exit %s\n\n```text\n%s\n```\n\n' "$title" "$*" "$code" "$(printf '%s' "$out" | sed "s#$PROBE#<PROBE>#g" | head -120)"
  } >> "$REPORT"
  return $code
}
tree_of() {
  # tree_of <dir>: probe-relevant files only. A fresh CODEX_HOME also receives curated remote plugins,
  # caches and system skills on the first session; listing them would bury the result.
  [ -e "$1" ] || { echo "(missing: ${1#$PROBE/})"; return; }
  find "$1" \( -name auth.json -o -name '*.sqlite*' -o -path "$1/plugins/cache/openai-curated*" \
    -o -path "$1/cache" -o -path "$1/skills" -o -path "$1/tmp" -o -path "$1/.tmp" \) -prune -o -print 2>/dev/null \
    | sed "s#$PROBE#<PROBE>#g" | sort | head -60
  echo "(ausgeblendet: plugins/cache/openai-curated-*, cache/, skills/, tmp/)"
}

# ---------------------------------------------------------------- probe plugin and marketplace
cat > "$MKT/.agents/plugins/marketplace.json" <<'JSON'
{
  "name": "codexprobe-mkt",
  "interface": { "displayName": "AGDF Codex probe" },
  "plugins": [
    {
      "name": "codexprobe",
      "source": { "source": "local", "path": "./plugins/codexprobe" },
      "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
      "category": "Productivity"
    }
  ]
}
JSON

# Node package boundaries are independent of Git roots. Keep these CommonJS probes
# isolated from the enclosing repository's `type: module`, including installed copies.
cat > "$PLUGIN/package.json" <<'JSON'
{ "private": true, "type": "commonjs" }
JSON

cat > "$PLUGIN/.codex-plugin/plugin.json" <<'JSON'
{
  "name": "codexprobe",
  "version": "0.0.1",
  "description": "AGDF probe for plugin-local MCP servers, plugin data and removal cleanup.",
  "mcpServers": "./.mcp.json"
}
JSON

# One server per start variant. Only variants that actually start leave a record in $LOG.
cat > "$PLUGIN/.mcp.json" <<JSON
{
  "mcpServers": {
    "probe_var":       { "command": "node", "args": ["\${PLUGIN_ROOT}/probe-mcp.js", "var", "\${PLUGIN_DATA}"] },
    "probe_claudevar": { "command": "node", "args": ["\${CLAUDE_PLUGIN_ROOT}/probe-mcp.js", "claudevar", "\${CLAUDE_PLUGIN_DATA}"] },
    "probe_rel":       { "command": "node", "args": ["./probe-mcp.js", "rel"] },
    "probe_env":       { "command": "node", "args": ["-e", "require(require('path').join(process.env.PLUGIN_ROOT || process.env.CLAUDE_PLUGIN_ROOT || '/nonexistent', 'probe-mcp.js'))", "env"] },
    "probe_abs":       { "command": "node", "args": ["$PLUGIN/probe-mcp.js", "abs"] },
    "probe_cache":     { "command": "node", "args": ["$CODEX_HOME/plugins/cache/codexprobe-mkt/codexprobe/0.0.1/probe-mcp.js", "cache"] }
  }
}
JSON

cat > "$PLUGIN/hooks/hooks.json" <<'JSON'
{ "hooks": { "SessionStart": [ { "hooks": [ { "type": "command", "command": "node \"${PLUGIN_ROOT}/probe-hook.js\"" } ] } ] } }
JSON

# Shared recorder: writes one JSON record per start into $LOG and a marker into the data dir.
cat > "$PLUGIN/probe-record.js" <<JS
const fs = require("fs"), path = require("path");
module.exports = function record(kind, variant, dataArg) {
  const env = {};
  for (const key of ["PLUGIN_ROOT", "PLUGIN_DATA", "CLAUDE_PLUGIN_ROOT", "CLAUDE_PLUGIN_DATA", "CODEX_HOME", "PWD"]) env[key] = process.env[key] ?? null;
  // Every other variable Codex may provide under a name we did not guess.
  for (const key of Object.keys(process.env)) if (/PLUGIN|CODEX|MCP/i.test(key) && !(key in env)) env[key] = process.env[key];
  const dataDir = [process.env.PLUGIN_DATA, dataArg].find((value) => value && !value.includes("\${")) || null;
  const info = { kind, variant, at: new Date().toISOString(), argv: process.argv.slice(1), cwd: process.cwd(), dirname: __dirname, env, dataDir, dataMarker: null };
  if (dataDir) {
    try { fs.mkdirSync(dataDir, { recursive: true }); const marker = path.join(dataDir, kind + "-" + variant + ".marker"); fs.writeFileSync(marker, info.at); info.dataMarker = marker; }
    catch (error) { info.dataMarker = "write failed: " + error.message; }
  }
  fs.writeFileSync(path.join("$LOG", kind + "-" + variant + ".json"), JSON.stringify(info, null, 1));
  return info;
};
JS

cat > "$PLUGIN/probe-mcp.js" <<'JS'
const record = require("./probe-record.js");
const known = ["var", "claudevar", "rel", "env", "abs", "cache", "user"];
const args = process.argv.slice(1);
const variant = args.find((value) => known.includes(value)) || "unknown";
const info = record("mcp", variant, args[args.indexOf(variant) + 1]);
let buffer = "";
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let index;
  while ((index = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, index); buffer = buffer.slice(index + 1);
    if (!line.trim()) continue;
    let message; try { message = JSON.parse(line); } catch { continue; }
    const reply = (result) => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: message.id, result }) + "\n");
    if (message.method === "initialize") reply({ protocolVersion: message.params?.protocolVersion ?? "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "probe_" + variant, version: "0.0.1" } });
    else if (message.method === "tools/list") reply({ tools: [{ name: "probe_ping_" + variant, description: "Return AGDF probe start data", inputSchema: { type: "object", properties: {} } }] });
    else if (message.method === "tools/call") reply({ content: [{ type: "text", text: JSON.stringify(info) }] });
    else if (message.id !== undefined) reply({});
  }
});
JS

cat > "$PLUGIN/probe-hook.js" <<'JS'
require("./probe-record.js")("hook", "sessionstart");
console.log("AGDF codex probe hook ran");
JS

# ---------------------------------------------------------------- report header
{
  echo "# AGDF Codex plugin probe"
  echo
  echo "- date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "- codex: $(codex --version 2>&1 | head -1)"
  echo "- node: $(node --version)"
  echo "- os: $(sw_vers -productVersion 2>/dev/null || uname -sr) $(uname -m)"
  echo "- CODEX_HOME (isolated): <PROBE>/codex-home"
} > "$REPORT"

# ---------------------------------------------------------------- install
section "Install"
capture "marketplace add" codex plugin marketplace add "$MKT" --json
capture "plugin add" codex plugin add codexprobe@codexprobe-mkt --json
capture "plugin list" codex plugin list
capture "mcp list" codex mcp list
capture "mcp get probe_var" codex mcp get probe_var --json
# Control without any plugin: a plain user-scope server in the same isolated CODEX_HOME. If it starts
# and the plugin servers do not, Codex skips plugin MCP servers specifically.
capture "mcp add probe_user (control, no plugin)" codex mcp add probe_user -- node "$PLUGIN/probe-mcp.js" user
section "CODEX_HOME after install"
printf '```text\n%s\n```\n' "$(tree_of "$CODEX_HOME")" >> "$REPORT"

# ---------------------------------------------------------------- one short session
section "Session"
if [ "$NO_SESSION" = 1 ]; then
  echo "Skipped (--no-session)." >> "$REPORT"
elif [ ! -f "$HOME/.codex/auth.json" ]; then
  echo "Skipped: no ~/.codex/auth.json to copy (credentials may live in the keychain). Rerun after \`CODEX_HOME=$CODEX_HOME codex login\` or use --no-session." >> "$REPORT"
else
  cp "$HOME/.codex/auth.json" "$CODEX_HOME/auth.json" && chmod 600 "$CODEX_HOME/auth.json"
  if [ "$REVIEW_HOOKS" = 1 ]; then
    printf '\n>>> Zweites Terminal öffnen und ausführen:\n    CODEX_HOME="%s" %s\n    Dort unter /hooks nur den Hook des Plugins codexprobe bestätigen und Codex beenden.\n    Weiter mit Enter ... ' "$CODEX_HOME" "$CODEX"
    read -r _ < /dev/tty
  fi
  # Hook count and trust straight from Codex (app-server hooks/list), independent of the model.
  node "$REPO/scripts/native-probes/codex-hooks-list.mjs" "$WORK" codexprobe@codexprobe-mkt "$CODEX" > "$LOG/hooks-list.out" 2>&1
  printf '### hooks/list (codexprobe)\n\n```json\n%s\n```\n\n' "$(sed "s#$PROBE#<PROBE>#g" "$LOG/hooks-list.out")" >> "$REPORT"
  # Plugin MCP servers start with the session; calling a tool is not required for the start record.
  prompt="List the exact names of every tool available to you whose name contains probe, including any MCP server or namespace prefix. Then call the probe_ping_abs and probe_ping_cache tools once each (under whatever prefix they have) and print their raw results. Do not modify any files."
  (cd "$WORK" && run_with_timeout 240 "$CODEX" exec --skip-git-repo-check --sandbox read-only "$prompt" > "$LOG/exec.out" 2>&1; echo $? > "$LOG/exec.code")
  printf '### codex exec\n\nexit %s\n\n```text\n%s\n```\n\n' "$(cat "$LOG/exec.code")" "$(sed "s#$PROBE#<PROBE>#g" "$LOG/exec.out" | head -80)" >> "$REPORT"
  rm -f "$CODEX_HOME/auth.json"
  echo "Copied auth.json removed after the session." >> "$REPORT"
  # Preserve complete diagnostics before cleanup. The short excerpt is navigation only;
  # neither rollout text nor a missing marker alone proves why startup failed.
  sed "s#$PROBE#<PROBE>#g" "$LOG/exec.out" > "$RESULTS/exec.log"
  find "$CODEX_HOME/sessions" -type f -name '*.jsonl' -exec cat {} + 2>/dev/null \
    | sed "s#$PROBE#<PROBE>#g" > "$RESULTS/rollout.jsonl"
  find "$CODEX_HOME/sessions" -type f -name '*.jsonl' -exec grep -h -i -E 'mcp|probe_|plugin' {} + 2>/dev/null \
    | grep -v -F "$prompt" | cut -c1-600 | head -60 | sed "s#$PROBE#<PROBE>#g" > "$RESULTS/rollout-mcp.txt"
  printf '### session rollout (lines mentioning mcp, probe_ or plugin)\n\n```text\n%s\n```\n\n' \
    "$(cat "$RESULTS/rollout-mcp.txt")" >> "$REPORT"
  # Only structured MCP tool-call items count; names in prompts, prose or tool-search
  # code are not evidence that a tool was exposed. No call does not prove no tools.
  node - "$RESULTS/rollout.jsonl" > "$LOG/tools-called.txt" <<'JS'
const fs = require("fs");
const names = new Set();
for (const line of fs.readFileSync(process.argv[2], "utf8").split("\n")) {
  let entry; try { entry = JSON.parse(line); } catch { continue; }
  const item = entry.payload?.item;
  if (item && ["mcp_tool_call", "McpToolCall"].includes(item.type)) {
    const call = item.invocation || item;
    if (typeof call.tool === "string" && call.tool.startsWith("probe_ping_")) names.add(`${call.server}.${call.tool}`);
  }
}
for (const name of [...names].sort()) console.log(name);
JS
fi

section "Start records (MCP variants and hook)"
for variant in var claudevar rel env abs cache user; do
  if [ -f "$LOG/mcp-$variant.json" ]; then
    printf -- '- **probe_%s: started**\n\n```json\n%s\n```\n\n' "$variant" "$(sed "s#$PROBE#<PROBE>#g" "$LOG/mcp-$variant.json")" >> "$REPORT"
  else
    printf -- '- probe_%s: **no start record** (not proof that no process was launched)\n\n' "$variant" >> "$REPORT"
  fi
done
if [ -f "$LOG/hook-sessionstart.json" ]; then
  printf -- '- **SessionStart hook: ran**\n\n```json\n%s\n```\n\n' "$(sed "s#$PROBE#<PROBE>#g" "$LOG/hook-sessionstart.json")" >> "$REPORT"
else
  printf -- '- SessionStart hook: **did not run** (untrusted hooks may need review in /hooks first)\n\n' >> "$REPORT"
fi
section "CODEX_HOME after session"
printf '```text\n%s\n```\n' "$(tree_of "$CODEX_HOME")" >> "$REPORT"

# ---------------------------------------------------------------- remove and look for leftovers
capture "mcp remove probe_user (control)" codex mcp remove probe_user
section "Remove"
capture "plugin remove" codex plugin remove codexprobe@codexprobe-mkt --json
capture "plugin list after remove" codex plugin list
capture "mcp list after remove" codex mcp list
codex mcp list > "$LOG/mcp-after-remove.txt" 2>&1
section "Leftovers after plugin remove"
{
  echo '```text'
  echo "# files mentioning codexprobe or probe markers under CODEX_HOME:"
  find "$CODEX_HOME" \( -iname '*codexprobe*' -o -name '*.marker' \) 2>/dev/null | sed "s#$PROBE#<PROBE>#g"
  echo "# data markers written by probe processes and whether they still exist:"
  for file in "$LOG"/*.json; do
    [ -f "$file" ] || continue
    marker="$(node -e 'const r=require(process.argv[1]);process.stdout.write(String(r.dataMarker||""))' "$file")"
    [ -n "$marker" ] && { [ -e "$marker" ] && echo "STILL PRESENT: $marker" || echo "removed: $marker"; } | sed "s#$PROBE#<PROBE>#g"
  done
  echo "# config.toml mentioning codexprobe:"
  grep -n -i codexprobe "$CODEX_HOME/config.toml" 2>/dev/null || echo "(none)"
  echo '```'
} >> "$REPORT"

capture "marketplace remove" codex plugin marketplace remove codexprobe-mkt --json
section "CODEX_HOME after marketplace remove"
printf '```text\n%s\n# config.toml mentioning codexprobe:\n%s\n```\n' "$(tree_of "$CODEX_HOME")" \
  "$(grep -n -i codexprobe "$CODEX_HOME/config.toml" 2>/dev/null || echo "(none)")" >> "$REPORT"

rm -f "$CODEX_HOME/auth.json"

# ---------------------------------------------------------------- short summary for the reply
{
  echo "AGDF Codex MCP-Probe ($(codex --version 2>&1 | head -1), $(date -u +%Y-%m-%dT%H:%M:%SZ))"
  # One-line verdicts first: what AGDF can build on this Codex version.
  echo "FAZIT:"
  if [ -f "$LOG/mcp-var.json" ]; then
    echo "  Start: Variante mit \${PLUGIN_ROOT} hat einen Startnachweis; Expansion und Datenpfade anhand des Records prüfen."
  elif [ -f "$LOG/mcp-cache.json" ]; then
    echo "  Start: absoluter Pfad in Codex' Plugin-Kopie funktioniert; übrige Varianten siehe DETAILS."
  elif [ -f "$LOG/mcp-abs.json" ]; then
    echo "  Start: absoluter Pfad im Marketplace funktioniert; übrige Varianten siehe DETAILS."
  elif [ "$NO_SESSION" = 1 ] || [ ! -f "$LOG/exec.code" ]; then
    echo "  Start: nicht geprüft (keine Sitzung)."
  else
    echo "  Start: in der codex-exec-Sitzung fehlt jeder Plugin-MCP-Startnachweis, auch mit absolutem Pfad (Ursache nicht aus fehlenden Startmarkern ableitbar; siehe exec.log und rollout.jsonl)."
  fi
  if [ -f "$LOG/exec.code" ]; then
    plugin_started=0
    for variant in var claudevar rel env abs cache; do [ -f "$LOG/mcp-$variant.json" ] && plugin_started=1; done
    if [ -f "$LOG/mcp-user.json" ] && [ "$plugin_started" = 0 ]; then
      echo "  Kontrolle: normaler MCP-Server mit Startnachweis; bei Plugin-Servern fehlt er. Ursache gesondert prüfen."
    elif [ -f "$LOG/mcp-user.json" ]; then
      echo "  Kontrolle: ein normaler MCP-Server (codex mcp add) startet ebenfalls."
    else
      echo "  Kontrolle: auch beim Kontrollserver fehlt der Startnachweis; Prozessstart oder früher Absturz bleiben ungeklärt."
    fi
  fi
  if grep -qi "No MCP servers" "$LOG/mcp-after-remove.txt" 2>/dev/null; then
    echo "  Entfernen: codex plugin remove nimmt die MCP-Server des Plugins mit."
  else
    echo "  Entfernen: nach codex plugin remove sind noch MCP-Server eingetragen (siehe report.md)."
  fi
  echo "DETAILS:"
  for variant in var claudevar rel env abs cache user; do
    if [ -f "$LOG/mcp-$variant.json" ]; then echo "MCP probe_$variant: gestartet"; else echo "MCP probe_$variant: kein Startnachweis"; fi
  done
  if [ -f "$LOG/hook-sessionstart.json" ]; then echo "SessionStart-Hook: gelaufen"; else echo "SessionStart-Hook: nicht gelaufen"; fi
  if [ -f "$LOG/hooks-list.out" ]; then
    node -e 'let r;try{r=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))}catch{r={status:"unlesbar"}}
      console.log("Hooks laut Codex: "+(r.status!=="observed"?`nicht lesbar (${r.status})`:`${r.count}: ${r.hooks.map((h)=>h.event+"/"+h.trust).join(", ")||"keine"}`))' "$LOG/hooks-list.out"
  fi
  if [ -f "$LOG/exec.code" ]; then
    echo "codex exec: exit $(cat "$LOG/exec.code")"
    exec_blocker "$LOG/exec.out"
    # Report only structured calls, never names found in model prose.
    offered="$(tr '\n' ' ' < "$LOG/tools-called.txt" 2>/dev/null)"
    echo "Strukturiert protokollierte MCP-Aufrufe (kein vollständiges Tool-Inventar): ${offered:-keine}"
  fi
  for file in "$LOG"/*.json; do
    [ -f "$file" ] || continue
    node -e '
      const r = require(process.argv[1]);
      const has = (key) => (r.env[key] ? "gesetzt" : "fehlt");
      console.log(`${r.kind}-${r.variant}: PLUGIN_ROOT=${has("PLUGIN_ROOT")} PLUGIN_DATA=${has("PLUGIN_DATA")} CLAUDE_PLUGIN_ROOT=${has("CLAUDE_PLUGIN_ROOT")} args_ersetzt=${!r.argv.join(" ").includes("${")} datenordner=${r.dataDir ? "ja" : "nein"}`);
      if (r.dataMarker && !String(r.dataMarker).startsWith("write failed")) {
        console.log(`  Daten-Marker nach plugin remove: ${require("fs").existsSync(r.dataMarker) ? "NOCH DA" : "entfernt"}`);
      }' "$file"
  done
  echo "Dateien mit codexprobe im Namen nach marketplace remove: $(find "$CODEX_HOME" -iname '*codexprobe*' 2>/dev/null | sed "s#$CODEX_HOME/##" | tr '\n' ' ')"
  lines="$(grep -c -i codexprobe "$CODEX_HOME/config.toml" 2>/dev/null)"; echo "config.toml-Zeilen mit codexprobe nach marketplace remove: ${lines:-0}"
} 2>&1 | sed "s#$PROBE#<PROBE>#g" > "$SUMMARY"
cp "$LOG"/*.json "$RESULTS/" 2>/dev/null
if [ "$KEEP" = 1 ]; then
  echo "Temporärer Codex-Arbeitsordner behalten: $RESULTS_REL/work-tmp"
else
  # Only the working directory created above is ever removed; results stay.
  # A Codex background process can still write briefly after exit, so remove twice.
  case "$PROBE" in */probe-results/codex-mcp-probe-*/work-tmp) rm -rf "$PROBE"; sleep 2; rm -rf "$PROBE" ;; esac
fi
echo
cat "$SUMMARY"
echo
echo "Ergebnisse im Repository (git-ignoriert): $RESULTS_REL/"
echo "  summary.txt  Kurzfassung für die Rückmeldung"
echo "  report.md    ausführlicher Bericht"
