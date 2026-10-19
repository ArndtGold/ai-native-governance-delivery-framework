// TP T-003 spike: verify the MCP-only configuration and inventory stream-json fields in Claude Code.
//   node evals/mcp-ergonomics/spike/claude-variant-spike.mjs [--model claude-sonnet-5-5] [--keep]
// Writes probe-results/mcp-ergonomics-spike-<stamp>/spike.json (structured, redacted).
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { AGDF_MCP_TOOL_PREFIX, createIsolatedClaudeHome, createRedactor, installAgdfForClaude, parseClaudeStream,
  repoRoot, runClaudeSession, runCommand, withCopiedCredentials } from "../../../scripts/native-probes/lib/claude-session.mjs";

const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const model = option("--model", "claude-sonnet-5-5");
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
const results = join(repoRoot, "probe-results", `mcp-ergonomics-spike-${stamp}`);
const work = join(results, "work-tmp");
const target = join(work, "target-repo");
mkdirSync(target, { recursive: true });
runCommand("git", ["init", "-q"], { cwd: target });
const home = createIsolatedClaudeHome(work);
const redact = createRedactor([{ path: work, token: "<WORK>" }, { path: repoRoot, token: "<REPO>" }]);
const spike = { schema_version: 1, kind: "agdf_mcp_ergonomics_variant_spike", recorded_at: new Date().toISOString(), model };

const keysOf = value => value && typeof value === "object" ? Object.keys(value).sort() : null;
function summarize(parsed) {
  const init = parsed.init ?? {};
  const names = Array.isArray(init.tools) ? init.tools : [];
  return {
    event_types: parsed.eventTypes,
    init_keys: keysOf(init),
    model: init.model ?? null,
    mcp_servers: (init.mcp_servers ?? []).map(server => ({ name: server.name, status: server.status })),
    agdf_mcp_tools: names.filter(name => name.startsWith(AGDF_MCP_TOOL_PREFIX)).map(name => name.slice(AGDF_MCP_TOOL_PREFIX.length)),
    skill_entries: (init.skills ?? []).filter(name => /agdf/i.test(String(name?.name ?? name))).length,
    slash_command_entries: (init.slash_commands ?? []).filter(name => /agdf/i.test(String(name))).length,
    plugins: (init.plugins ?? []).map(plugin => plugin.name ?? plugin),
    hook_mentions: parsed.events.filter(event => /hook/i.test(`${event.type}:${event.subtype ?? ""}`)).length,
    agdf_guard_in_context: parsed.events.some(event => JSON.stringify(event).includes("AGDF-REQUEST-ACTIVATION-GUARD")),
    result_keys: keysOf(parsed.result),
    usage_keys: keysOf(parsed.result?.usage),
    total_cost_usd: parsed.result?.total_cost_usd ?? null,
    duration_ms: parsed.result?.duration_ms ?? null,
    num_turns: parsed.result?.num_turns ?? null,
    is_error: parsed.result?.is_error ?? null,
    result_subtype: parsed.result?.subtype ?? null,
    tool_calls: parsed.calls.map(call => ({ name: call.name, is_error: call.result?.is_error ?? null, result_bytes: Buffer.byteLength(call.result?.text ?? "") })),
  };
}

try {
  const version = runCommand("claude", ["--version"]);
  spike.host = { version: version.stdout.trim().split(/\s+/)[0] || null, platform: process.platform, arch: process.arch, node: process.version };
  const install = installAgdfForClaude(home.env);
  spike.install = { status: install.status, result: install.report?.result ?? null, effective_state: install.report?.effective_state ?? null,
    stderr: redact(install.stderr).slice(0, 400) };
  const list = runCommand("claude", ["mcp", "list"], { env: home.env, cwd: target });
  spike.mcp_list = redact(list.stdout).split("\n").filter(line => /agdf/i.test(line)).map(line => line.trim());
  const prompt = "Nutze genau einmal das MCP-Tool agdf_inspect mit operation doctor, presentation_language de und working_directory dieses Verzeichnisses. Antworte danach nur mit FERTIG.";
  const allowed = [`${AGDF_MCP_TOOL_PREFIX}agdf_inspect`, `${AGDF_MCP_TOOL_PREFIX}agdf_dispatch`];
  spike.variants = withCopiedCredentials(home.claudeHome, ({ available }) => {
    if (!available) return { skipped: "no transferable ~/.claude/.credentials.json" };
    const withSkills = runClaudeSession({ prompt, model, allowedTools: [...allowed, "Skill", "Read", "Bash"], maxBudgetUsd: 1 }, { env: home.env, cwd: target });
    const mcpOnly = runClaudeSession({ prompt, model, allowedTools: [...allowed, "Read"], disableSkills: true, disableHooks: true, maxBudgetUsd: 1 }, { env: home.env, cwd: target });
    return {
      with_skills: { exit: withSkills.status, stderr: redact(withSkills.stderr).slice(0, 400), ...summarize(parseClaudeStream(withSkills.stdout)) },
      mcp_only: { exit: mcpOnly.status, stderr: redact(mcpOnly.stderr).slice(0, 400), ...summarize(parseClaudeStream(mcpOnly.stdout)) },
    };
  });
  const uninstall = runCommand("claude", ["plugin", "uninstall", "agdf@agdf"], { env: home.env });
  spike.uninstall = { status: uninstall.status };
} finally {
  mkdirSync(results, { recursive: true });
  writeFileSync(join(results, "spike.json"), `${redact(JSON.stringify(spike, null, 2))}\n`);
  if (!args.includes("--keep")) rmSync(work, { recursive: true, force: true });
}
process.stdout.write(`${redact(JSON.stringify(spike, null, 2))}\n`);
