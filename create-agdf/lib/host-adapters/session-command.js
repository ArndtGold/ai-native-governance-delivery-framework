export function environmentSessionCommand(platform) {
  return platform === "win32"
      ? "node \"$([Environment]::GetEnvironmentVariable('PLUGIN_ROOT') + [Environment]::GetEnvironmentVariable('CLAUDE_PLUGIN_ROOT'))\\runtime\\agdf-session-check.js\""
      : "node \"${PLUGIN_ROOT:-${CLAUDE_PLUGIN_ROOT}}/runtime/agdf-session-check.js\"";
}
