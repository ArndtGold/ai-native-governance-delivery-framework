// AGDF-owned CLI sessions need the actual server tool catalog before the first
// turn. Wait within each existing server startup timeout instead of sampling
// the optional-server catalog after Codex's one-second grace period. This is
// an invocation override; it changes no user config, permissions or timeouts.
export const CODEX_MCP_STARTUP_ARGS = Object.freeze(['-c', 'mcp_optional_startup_grace_ms=0']);

export function independentCodexEnvironment(env) {
  const result = { ...env };
  // These identify the invoking session or its connector pipe, not host policy.
  // Preserve sandbox, network, approval, executable and authentication settings.
  for (const key of ['CODEX_THREAD_ID', 'CODEX_SESSION_ID', 'CODEX_TOOL_CALL_ID',
    'CODEX_APP_TOOLS_PIPE_PATH', 'CODEX_INTERNAL_ORIGINATOR_OVERRIDE']) delete result[key];
  return result;
}
