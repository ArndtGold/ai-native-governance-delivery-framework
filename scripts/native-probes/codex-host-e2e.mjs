#!/usr/bin/env node
// Host end-to-end check for AGDF under Codex with exactly one recorded tuple:
// host version, model, discovery, one agdf_dispatch call, one defined failure case and removal.
//
// Everything runs in an isolated CODEX_HOME and AGDF_DATA_DIR inside probe-results/; the real ~/.codex
// is only read to copy auth.json for the short sessions, and the copy is deleted afterwards. Evidence is
// structured (`codex exec --json` items, session rollouts, CLI output), never model prose.
//
// Codex asks for approval before each MCP tool call and `codex exec` rejects unapproved calls. The check
// approves only agdf_dispatch, first as a per-session override (-c) and, if Codex ignores that for a
// plugin server, through the same key in the isolated config.toml; it records which path worked.
//
// Usage (repository root, macOS or Linux):
//   npm run native:codex-e2e
//   npm run native:codex-e2e -- --model <model> --keep
//   CODEX_BIN=/Applications/ChatGPT.app/Contents/Resources/codex npm run native:codex-e2e
// Result: probe-results/codex-host-e2e-<timestamp>/summary.txt and observation.json.
import { spawnSync } from "node:child_process";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, dirname, isAbsolute, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const SERVER = "agdf";
const TOOL = "agdf_dispatch";
const APPROVAL_KEY = `mcp_servers.${SERVER}.tools.${TOOL}.approval_mode`;
const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const model = option("--model", process.env.AGDF_E2E_MODEL || "gpt-6-astra");
const keep = args.includes("--keep");
const codex = process.env.CODEX_BIN || "codex";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
const resultsRel = `probe-results/codex-host-e2e-${stamp}`;
const results = join(repo, resultsRel);
const work = join(results, "work-tmp");
const codexHome = join(work, "codex-home");
const dataRoot = join(work, "agdf-data");
const target = join(work, "target-repo");
for (const dir of [codexHome, dataRoot, target]) mkdirSync(dir, { recursive: true });
// Own git root, so Codex does not load this repository's instructions into the session.
spawnSync("git", ["init", "-q"], { cwd: target });

// The AGDF CLI resolves `codex` from PATH; with CODEX_BIN the installer must use the same binary as the checks.
const env = { ...process.env, CODEX_HOME: codexHome, AGDF_DATA_DIR: dataRoot,
  ...(isAbsolute(codex) ? { PATH: `${dirname(codex)}${delimiter}${process.env.PATH ?? ""}` } : {}) };
const run = (command, argv, options = {}) => {
  const result = spawnSync(command, argv, { encoding: "utf8", env, timeout: 300000, maxBuffer: 64 * 1024 * 1024, ...options });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "", error: result.error?.message ?? null };
};
// Paths appear raw, with forward slashes and JSON-escaped (doubled backslashes) in tool results.
const redact = (text) => [work, work.replaceAll("\\", "/"), work.replaceAll("\\", "\\\\")]
  .reduce((value, path) => value.replaceAll(path, "<WORK>"), String(text));
const steps = [];
const step = (name, pass, evidence) => { steps.push({ name, status: pass ? "pass" : "fail", evidence }); return pass; };

// Collects structured MCP tool-call items for agdf_dispatch from `codex exec --json` output and the
// session rollouts; item shapes differ between those sources and Codex versions.
function mcpCalls(texts) {
  const calls = [];
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    const item = node.item ?? node.payload?.item;
    if (item && ["mcp_tool_call", "McpToolCall"].includes(item.type)) {
      const call = item.invocation ?? item;
      if (call.tool === TOOL && (!call.server || call.server === SERVER)) {
        const result = item.result ?? item.output ?? null;
        const text = typeof result === "string" ? result
          : Array.isArray(result?.content) ? result.content.map((part) => part.text ?? "").join("")
            : result?.structured_content ? JSON.stringify(result.structured_content) : "";
        const error = item.error?.message ?? (typeof item.error === "string" ? item.error : null);
        calls.push({ id: item.id ?? null, status: item.status ?? null, pluginId: item.pluginId ?? call.pluginId ?? null, text, error });
      }
    }
  };
  for (const text of texts) for (const line of text.split("\n")) { try { visit(JSON.parse(line)); } catch {} }
  // The same call can appear as started and completed and in exec output and rollout: keep the last per id.
  const byId = new Map();
  for (const call of calls) byId.set(call.id ?? `${byId.size}`, call);
  return [...byId.values()].map((call) => {
    let parsed = null;
    try { parsed = JSON.parse(call.text); } catch {}
    return { status: call.status, plugin_id: call.pluginId, outcome: parsed?.outcome ?? null, terminal: parsed?.terminal ?? null, authorizes: parsed?.authorizes ?? null,
      host_action: redact(parsed?.host_action?.text ?? call.error ?? call.text).slice(0, 160),
      approval_blocked: /requires approval/i.test(`${call.error ?? ""} ${call.text}`) };
  });
}

function rolloutsSince(startMs) {
  const files = [];
  const visit = (dir) => {
    if (!existsSync(dir)) return;
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      const stats = statSync(path);
      if (stats.isDirectory()) visit(path);
      else if (name.endsWith(".jsonl") && stats.mtimeMs >= startMs) files.push(readFileSync(path, "utf8"));
    }
  };
  visit(join(codexHome, "sessions"));
  return files;
}

const prompt = (input) => `Call the MCP tool ${TOOL} from the ${SERVER} server exactly once with exactly these arguments and nothing else: ${JSON.stringify(input)}. `
  + "Do not run shell commands and do not call any other tool. After the call, reply with the single word DONE.";
const approvalOverride = ["-c", `${APPROVAL_KEY}="approve"`];
const configPath = join(codexHome, "config.toml");
const configSection = `\n[mcp_servers.${SERVER}.tools.${TOOL}]\napproval_mode = "approve"\n`;
let approvalPath = "cli_override";
const session = (input) => {
  const started = Date.now();
  const output = run(codex, ["exec", "--json", "--skip-git-repo-check", "--sandbox", "read-only", "-m", model,
    ...(approvalPath === "cli_override" ? approvalOverride : []), prompt(input)], { cwd: target });
  return { output, calls: mcpCalls([output.stdout, ...rolloutsSince(started - 1000)]) };
};

const authSource = join(homedir(), ".codex", "auth.json");
const authCopy = join(codexHome, "auth.json");
const observation = { schema_version: 1, kind: "agdf_codex_host_e2e", recorded_at: new Date().toISOString(), requested_model: model };
try {
  // 1. Host tuple
  const version = run(codex, ["--version"]);
  observation.host = { client: "codex-cli", version: version.stdout.trim().split(/\s+/).at(-1) || null, os: process.platform, arch: process.arch, node: process.version };
  step("host", version.status === 0, { version: observation.host.version });

  // 2. Install the current checkout through the AGDF CLI into the isolated host
  const install = run(process.execPath, [join(repo, "create-agdf", "bin", "create-agdf.js"), "codex", "--json"]);
  let installReport = null;
  try { installReport = JSON.parse(install.stdout); } catch {}
  observation.agdf = { version: installReport?.plugin?.version?.installed ?? null };
  step("install", install.status === 0 && installReport?.result === "success",
    { result: installReport?.result ?? null, effective_state: installReport?.effective_state ?? null, stderr: redact(install.stderr).slice(0, 300) });

  // 3. Discovery: the plugin server is listed and points at the plugin-local launcher
  const get = run(codex, ["mcp", "get", SERVER, "--json"], { cwd: target });
  let entry = null;
  try { entry = JSON.parse(get.stdout); } catch {}
  const launcherArgs = entry?.transport?.args ?? [];
  step("discovery", Boolean(entry?.enabled !== false && String(launcherArgs[0] ?? "").endsWith("/mcp/agdf-mcp-launch.js")
    && launcherArgs[1] === "--surface" && launcherArgs[2] === "codex"), { command: entry?.transport?.command ?? null, args: redact(JSON.stringify(launcherArgs)) });

  const hasAuth = existsSync(authSource);
  if (hasAuth) copyFileSync(authSource, authCopy);

  // 4. One real agdf_dispatch call on an explicit target: a non-authorizing terminal control result
  let good = hasAuth ? session({ skill_id: "gate-check", presentation_language: "de", working_directory: target,
    target_source: "explicit_target", primary_target: target }) : null;
  if (good && good.calls.some((call) => call.approval_blocked)) {
    // Codex ignored the per-session override for the plugin server: approve the one tool in the isolated config.
    approvalPath = "config_toml";
    appendFileSync(configPath, configSection);
    good = session({ skill_id: "gate-check", presentation_language: "de", working_directory: target, target_source: "explicit_target", primary_target: target });
  }
  const call = good?.calls?.at(-1);
  if (good && !call) approvalPath = "unknown";
  observation.approval_path = hasAuth ? approvalPath : null;
  // pluginId, where Codex records it, must name the AGDF plugin: the server came from the plugin declaration.
  step("dispatch", Boolean(call && call.outcome === "control_result" && call.terminal === true && call.authorizes === false
    && (call.plugin_id === null || call.plugin_id === "agdf@agdf")),
    hasAuth ? { approval_path: approvalPath, calls: good.calls.length, plugin_id: call?.plugin_id ?? null, outcome: call?.outcome ?? null, terminal: call?.terminal ?? null,
      authorizes: call?.authorizes ?? null, approval_blocked: call?.approval_blocked ?? null, host_action: call?.host_action ?? null,
      exec_status: good.output.status, exec_stderr: redact(good.output.stderr).slice(0, 200) } : { skipped: "no ~/.codex/auth.json to copy" });

  // 5. Defined failure: a relative working directory yields invalid_input, not a crash
  const bad = hasAuth ? session({ skill_id: "gate-check", presentation_language: "de", working_directory: "relative/dir" }) : null;
  const failure = bad?.calls?.at(-1);
  step("failure_case", Boolean(failure && failure.outcome === "invalid_input" && failure.terminal === true && failure.authorizes === false),
    hasAuth ? { calls: bad.calls.length, outcome: failure?.outcome ?? null, host_action: failure?.host_action ?? null } : { skipped: "no ~/.codex/auth.json to copy" });
  rmSync(authCopy, { force: true });

  // 6. Removal: the documented AGDF uninstall runs `codex plugin remove` and removes the owned runtime.
  // The approval section this check may have written is test state and is removed first.
  if (existsSync(configPath)) writeFileSync(configPath, readFileSync(configPath, "utf8").replace(configSection, ""));
  const uninstall = run(process.execPath, [join(repo, "create-agdf", "bin", "create-agdf.js"), "uninstall", "--surface", "codex", "--scope", "global", "--confirm", "--json"]);
  const after = run(codex, ["mcp", "list"], { cwd: target });
  const config = existsSync(configPath) ? readFileSync(configPath, "utf8") : "";
  const leftovers = {
    mcp_listed: /^agdf\s/m.test(after.stdout),
    config_mcp_section: /\[mcp_servers\.agdf[\].]/.test(config),
    plugin_cache: existsSync(join(codexHome, "plugins", "cache", "agdf", "agdf")),
    mcp_runtime: existsSync(join(dataRoot, "mcp", "codex-plugin")),
  };
  step("removal", uninstall.status === 0 && Object.values(leftovers).every((value) => value === false),
    { uninstall_status: uninstall.status, ...leftovers, kept_by_design: "agdf marketplace registration and directory",
      stderr: redact(uninstall.stderr).slice(0, 200) });
} finally {
  rmSync(authCopy, { force: true });
}

observation.steps = steps;
observation.result = steps.every((entry) => entry.status === "pass") ? "pass" : "fail";
writeFileSync(join(results, "observation.json"), `${JSON.stringify(observation, null, 2)}\n`);
const summary = [
  `AGDF Codex-Host-E2E (${observation.recorded_at})`,
  `Tupel: Codex ${observation.host?.version ?? "?"}, Modell ${observation.requested_model}, ${observation.host?.os}/${observation.host?.arch}, Node ${observation.host?.node}, AGDF ${observation.agdf?.version ?? "?"}`,
  `Freigabe agdf_dispatch: ${observation.approval_path ?? "nicht geprüft"}`,
  `ERGEBNIS: ${observation.result.toUpperCase()}`,
  ...steps.map((entry) => `  ${entry.status === "pass" ? "ok  " : "FAIL"} ${entry.name}: ${JSON.stringify(entry.evidence)}`),
].join("\n");
writeFileSync(join(results, "summary.txt"), `${summary}\n`);
if (!keep && work.includes(join("probe-results", "codex-host-e2e-"))) rmSync(work, { recursive: true, force: true });
console.log(summary);
console.log(`\nErgebnisse: ${resultsRel}/ (summary.txt, observation.json)`);
process.exitCode = observation.result === "pass" ? 0 : 1;
