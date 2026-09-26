#!/usr/bin/env bash
# Native check on macOS: does the shared AGDF SessionStart hook (plugin/hooks/hooks.json) start under Codex
# with the command introduced in 4e414ab? Evidence comes from Codex's own hook metadata (app-server
# hooks/list) and the session rollout, not from a model self-report.
#
# Usage:  npm run native:codex-hook-check   (from the repository root)
#         CODEX_BIN=/Applications/ChatGPT.app/Contents/Resources/codex npm run native:codex-hook-check
set -u

REPO="$(cd "$(dirname "$0")/../.." && pwd -P)"
CODEX="${CODEX_BIN:-codex}"
STAMP="$(date +%Y%m%d-%H%M%S)"
# Results stay in this checkout (git-ignored probe-results/), not in the system temp directory.
OUT_REL="probe-results/codex-hook-check-$STAMP"
OUT="$REPO/$OUT_REL"
EXPECTED='node "${CLAUDE_PLUGIN_ROOT}/runtime/agdf-session-check.js"'
SUMMARY="$OUT/summary.txt"
mkdir -p "$OUT/backup"

say() { printf '%s\n' "$*" | tee -a "$SUMMARY"; }
result() { printf '%-34s %s\n' "$1" "$2" | tee -a "$SUMMARY"; }
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
hook_command() { node -e 'const h=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).hooks.SessionStart[0].hooks[0];console.log(h.command)' "$1"; }
observe() {
  node --input-type=module -e '
    const [lib, cwd, executable] = process.argv.slice(1);
    const { pathToFileURL } = await import("node:url");
    const { observeCodexHooks } = await import(pathToFileURL(lib).href);
    console.log(JSON.stringify(await observeCodexHooks({ cwd, executable, timeoutMs: 20000 }), null, 2));
  ' "$REPO/create-agdf/lib/runtime-check-consent/codex-hooks.js" "$TARGET" "$CODEX"
}
trust_of() { node -e 'const o=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));console.log(o.status==="observed"?`${o.hook.trust_status} enabled=${o.hook.enabled} hash=${o.hook.current_hash.slice(0,19)}`:`unavailable (${o.status})`)' "$1" 2>/dev/null || echo "unlesbar"; }

# 0. Preconditions --------------------------------------------------------------------------------
[ "$(uname -s)" = "Darwin" ] || { echo "Dieses Skript ist für macOS gedacht."; exit 2; }
command -v node >/dev/null || { echo "node fehlt."; exit 2; }
command -v "$CODEX" >/dev/null 2>&1 || [ -x "$CODEX" ] || { echo "Codex nicht gefunden: $CODEX (CODEX_BIN setzen)."; exit 2; }
git -C "$REPO" merge-base --is-ancestor 4e414ab HEAD 2>/dev/null || { echo "Der Checkout enthält 4e414ab nicht. Erst 'git pull'."; exit 2; }
[ "$(hook_command "$REPO/plugin/hooks/hooks.json")" = "$EXPECTED" ] || { echo "plugin/hooks/hooks.json enthält nicht die erwartete Hook-Zeile."; exit 2; }

say "AGDF Codex-Hook-Check ($STAMP)"
say "Ergebnisse: $OUT_REL/"
result "macOS" "$(sw_vers -productVersion) ($(uname -m))"
result "node" "$(node --version)"
result "codex" "$("$CODEX" --version 2>&1 | head -1)"
result "Repository" "$(git -C "$REPO" rev-parse --short HEAD)"
"$CODEX" plugin list > "$OUT/00-plugin-list-before.txt" 2>&1
before="$(grep -m1 -A1 'agdf@agdf' "$OUT/00-plugin-list-before.txt" | tr -s ' \n' ' ')"
result "AGDF vorher" "${before:-nicht installiert}"

# 1. Backups of the configuration AGDF and Codex touch ---------------------------------------------
cp -p "$HOME/.codex/config.toml" "$OUT/backup/" 2>/dev/null || true
cp -p "$HOME/Library/Application Support/agdf/runtime-checks/codex.json" "$OUT/backup/" 2>/dev/null || true
say "Sicherungen: $OUT/backup"

# 2. Install the local build with automatic runtime checks enabled --------------------------------
for attempt in 1 2; do
  (cd "$REPO/create-agdf" && node scripts/install-local-plugin.js codex --runtime-checks enable --verbose) > "$OUT/01-install-$attempt.log" 2>&1 && break
  say "Installationsversuch $attempt fehlgeschlagen (siehe 01-install-$attempt.log)."
done
installed_hooks="$(ls -t "$HOME"/.codex/plugins/cache/agdf/agdf/*/hooks/hooks.json 2>/dev/null | head -1)"
if [ -n "$installed_hooks" ]; then
  installed_command="$(hook_command "$installed_hooks")"
  [ "$installed_command" = "$EXPECTED" ] && result "Installierte Hook-Zeile" "neu (ok)" || result "Installierte Hook-Zeile" "UNERWARTET: $installed_command"
else
  result "Installierte Hook-Zeile" "hooks.json im Codex-Cache nicht gefunden"
fi

# 3. Disposable target repository (physical path: Codex reports realpaths) -------------------------
TARGET="$OUT/target-repo"
mkdir -p "$TARGET" && TARGET="$(cd "$TARGET" && pwd -P)"
git -C "$TARGET" init -q && printf 'export const add = (a, b) => a + b;\n' > "$TARGET/math.js"
git -C "$TARGET" add . && git -C "$TARGET" -c user.name=probe -c user.email=probe@example.invalid commit -qm init

# 4. Native hook metadata before review ------------------------------------------------------------
observe > "$OUT/02-hooks-before-review.json" 2>&1
result "Hook-Status vor Prüfung" "$(trust_of "$OUT/02-hooks-before-review.json")"

pause "Manueller Schritt (AGDF umgeht die Codex-Vertrauensprüfung nie):
    1. Zweites Terminal öffnen:  cd '$TARGET' && $CODEX
    2. In Codex '/hooks' eingeben.
    3. Den SessionStart-Hook von agdf@agdf ansehen. Der Befehl muss lauten:
         $EXPECTED
    4. Nur diesen Hook als vertrauenswürdig bestätigen (kein 'trust all'), dann Codex beenden."

observe > "$OUT/03-hooks-after-review.json" 2>&1
result "Hook-Status nach Prüfung" "$(trust_of "$OUT/03-hooks-after-review.json")"

# 5. Fresh non-interactive session ------------------------------------------------------------------
touch "$OUT/session.marker"
run_exec "$TARGET" "$OUT/04-exec.jsonl" "$OUT/04-exec.err"
result "codex exec" "exit=$?"
rollouts="$(find "$HOME/.codex/sessions" -type f -name '*.jsonl' -newer "$OUT/session.marker" 2>/dev/null)"
evidence="$OUT/05-evidence.txt"
: > "$evidence"
for file in "$OUT/04-exec.jsonl" "$OUT/04-exec.err" $rollouts; do
  [ -f "$file" ] || continue
  for marker in "AGDF-REQUEST-ACTIVATION-GUARD:START" "AGDF dispatcher binding:" "AGDF automatic runtime check" "plugin_root_mismatch" "agdf-session-check"; do
    count="$(grep -c -F "$marker" "$file" 2>/dev/null || true)"
    [ "${count:-0}" -gt 0 ] && printf '%s\t%s\t%s\n' "$marker" "$count" "$file" >> "$evidence"
  done
done
has() { grep -q -F "$1" "$evidence"; }
result "Aktivierungs-Guard im Kontext" "$(has 'AGDF-REQUEST-ACTIVATION-GUARD:START' && echo ja || echo nein)"
result "Dispatcher-Bindung im Kontext" "$(has 'AGDF dispatcher binding:' && echo ja || echo nein)"
result "plugin_root_mismatch" "$(has 'plugin_root_mismatch' && echo 'JA (Alias zeigt woanders hin)' || echo nein)"

if has 'AGDF-REQUEST-ACTIVATION-GUARD:START' && ! has 'plugin_root_mismatch'; then
  say "ERGEBNIS: PASS. Der Hook startet unter Codex mit der neuen Zeile und liefert AGDF-Kontext."
elif grep -q '"trust_status": "trusted"' "$OUT/03-hooks-after-review.json" 2>/dev/null; then
  say "ERGEBNIS: UNKLAR. Hook ist vertraut, aber kein AGDF-Kontext in exec-Ausgabe oder Rollout gefunden."
  say "         Prüfe 04-exec.err und ob 'codex exec' Plugin-Hooks ausführt; alternativ eine TUI-Sitzung testen."
else
  say "ERGEBNIS: FAIL/OFFEN. Hook nicht vertraut oder nicht beobachtbar (siehe 03-hooks-after-review.json)."
fi

say ""
say "Zurück zur veröffentlichten Version:  npx --yes @agdf/cli@0.14.5 codex"
say "Bitte den Inhalt von $OUT_REL/summary.txt an Claude zurückgeben."
