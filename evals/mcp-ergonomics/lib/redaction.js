// Fail-closed redaction check before promote (SDD-012, PRD AC-010).
import { homedir, userInfo } from "node:os";

const PATTERNS = Object.freeze([
  // Drive paths raw, with forward slashes and with backslashes JSON-escaped to any depth.
  ["windows_absolute_path", /\b[A-Za-z]:(?:\\+|\/)(?=[A-Za-z0-9._-])/u],
  ["unc_path", /(?:^|[\s"'(=])\\{2,}[A-Za-z0-9._-]+\\+[A-Za-z0-9$._-]+/u],
  ["git_bash_drive_path", /(?<![\w.:/-])\/[A-Za-z]\/[A-Za-z0-9._-]+\//u],
  ["posix_home_path", /\/(?:Users|home)\/[A-Za-z0-9._-]+/u],
  ["posix_temp_path", /(?<![\w.-])\/(?:tmp|var\/folders|private\/var|root)\//u],
  ["email_address", /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/u],
  // Connector server names ("claude.ai <Name>") and their tool prefixes; plain prose such as "claude.ai connectors" passes.
  ["connector_name", /claude\.ai [A-Z]|mcp__claude_ai_/u],
  ["anthropic_key", /sk-ant-[A-Za-z0-9_-]{8,}/u],
  ["bearer_token", /Bearer\s+[A-Za-z0-9._~+/-]{12,}/u],
  ["credential_field", /"(?:accessToken|refreshToken|access_token|refresh_token|claudeAiOauth)"/u],
]);

function userMarkers() {
  const markers = [];
  try { const name = userInfo().username; if (name && name.length > 2) markers.push(name); } catch {}
  const home = homedir();
  if (home) markers.push(home, home.replaceAll("\\", "/"), home.replaceAll("\\", "\\\\"));
  return markers;
}

export function redactionViolations(text, { extraMarkers = [] } = {}) {
  const value = String(text ?? "");
  const violations = PATTERNS.filter(([, pattern]) => pattern.test(value)).map(([name]) => name);
  for (const marker of [...userMarkers(), ...extraMarkers]) if (marker && value.includes(marker)) violations.push("local_identity_marker");
  return [...new Set(violations)];
}

// Claude Code names its per-project directories after the working directory with every character
// outside [A-Za-z0-9] replaced by "-"; transcripts carry that form too.
export const claudeProjectSlug = path => String(path).replace(/[^A-Za-z0-9]/gu, "-");

// Native transcripts stay in gitignored probe-results, but they are still cleaned: path roots go
// through `redact`, MCP servers that are not AGDF (for example organization connectors loaded with
// the account) become <CONNECTOR-n> in their names and tool prefixes, the local user name becomes
// <USER> and the given identities (for example the git author a model copies into an artefact) <IDENTITY>.
export function sanitizeTranscript(stdout, redact = value => value, { identities = [] } = {}) {
  let text = redact(String(stdout ?? ""));
  let init = null;
  for (const line of text.split("\n")) {
    try { const event = JSON.parse(line); if (event?.type === "system" && event.subtype === "init") { init = event; break; } } catch {}
  }
  const servers = [...new Set((init?.mcp_servers ?? []).map(server => String(server?.name ?? "")).filter(name => name && !/agdf/iu.test(name) && !/^<CONNECTOR-\d+>$/u.test(name)))]
    .sort((left, right) => right.length - left.length);
  servers.forEach((name, index) => {
    const token = `<CONNECTOR-${index + 1}>`;
    text = text.replaceAll(`mcp__${name.replace(/[^A-Za-z0-9_-]/gu, "_")}__`, `mcp__${token}__`);
    text = text.replaceAll(JSON.stringify(name).slice(1, -1), token);
  });
  for (const identity of identities) if (identity && identity.length > 2) text = text.replaceAll(identity, "<IDENTITY>");
  let user = null;
  try { user = userInfo().username; } catch {}
  return user && user.length > 2 ? text.replaceAll(user, "<USER>") : text;
}
