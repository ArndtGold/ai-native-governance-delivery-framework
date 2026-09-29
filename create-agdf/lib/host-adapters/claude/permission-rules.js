// Earlier releases wrote one exact Bash or PowerShell permission rule that runs the plugin-relative
// agdf-session-check.js through a PLUGIN_ROOT variable. Claude Code runs plugin hooks without any
// permission rule, so these rules are only recognised and revoked, never written.
const LEGACY_RUNTIME_CHECK_RULE = /^(?:Bash|PowerShell)\(node "[^"]*PLUGIN_ROOT[^"]*[\\/]runtime[\\/]agdf-session-check\.js"\)$/u;

export function ownedRuntimeCheckRules(settings) {
  const allow = settings?.permissions?.allow;
  return Array.isArray(allow) ? allow.filter((rule) => typeof rule === "string" && LEGACY_RUNTIME_CHECK_RULE.test(rule)) : [];
}

export function revokeClaudeExactRule(settings, rule) {
  const next = structuredClone(settings);
  if (Array.isArray(next.permissions?.allow)) {
    next.permissions.allow = next.permissions.allow.filter((entry) => entry !== rule);
    // A block emptied by revocation means nothing; dropping it lets uninstall leave no AGDF trace.
    if (next.permissions.allow.length === 0) delete next.permissions.allow;
    if (Object.keys(next.permissions).length === 0) delete next.permissions;
  }
  return next;
}
