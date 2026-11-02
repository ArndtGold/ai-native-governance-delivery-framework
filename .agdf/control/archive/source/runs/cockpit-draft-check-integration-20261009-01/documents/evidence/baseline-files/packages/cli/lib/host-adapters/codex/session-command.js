import { environmentSessionCommand } from "../session-command.js";

// Shared hooks.json: Claude Code runs `command` everywhere (PowerShell on Windows resolves only plain
// ${CLAUDE_PLUGIN_ROOT}); Codex aliases it to PLUGIN_ROOT and uses commandWindows on Windows.
export const sessionCommand = (_root, platform) => platform === "win32"
  ? environmentSessionCommand("codex", platform)
  : "node \"${CLAUDE_PLUGIN_ROOT}/runtime/agdf-session-check.js\"";
