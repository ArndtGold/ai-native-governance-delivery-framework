export function environmentSessionCommand(surface, platform) {
  const [primary, fallback] = surface === "claude"
    ? ["CLAUDE_PLUGIN_ROOT", "PLUGIN_ROOT"]
    : ["PLUGIN_ROOT", "CLAUDE_PLUGIN_ROOT"];
  if (platform === "win32") {
    const primaryValue = `[Environment]::GetEnvironmentVariable('${primary}')`;
    const fallbackValue = `[Environment]::GetEnvironmentVariable('${fallback}')`;
    return `node \"$(if (${primaryValue}) { ${primaryValue} } else { ${fallbackValue} })\\runtime\\agdf-session-check.js\"`;
  }
  return `node \"\${${primary}:-\${${fallback}}}/runtime/agdf-session-check.js\"`;
}
