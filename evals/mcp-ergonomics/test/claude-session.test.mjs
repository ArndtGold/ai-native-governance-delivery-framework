import assert from "node:assert/strict";
import { test } from "node:test";
import { claudeSessionArgs, createRedactor, parseClaudeStream, summarizeToolSession } from "../../../scripts/native-probes/lib/claude-session.mjs";

const TOOL = "mcp__plugin_agdf_agdf__agdf_dispatch";
const SERVER = "plugin:agdf:agdf";
const WORK = "C:\\probe\\work-tmp";

function syntheticStream() {
  const events = [
    { type: "system", subtype: "init", model: "claude-sonnet-5", tools: [TOOL, "Read"], mcp_servers: [{ name: SERVER, status: "connected" }] },
    { type: "assistant", message: { content: [{ type: "tool_use", id: "t1", name: TOOL, input: { working_directory: WORK } }] } },
    { type: "user", message: { content: [{ type: "tool_result", tool_use_id: "t1", content: [{ type: "text",
      text: JSON.stringify({ outcome: "control_result", terminal: true, authorizes: false, host_action: { text: `Target ${WORK.replaceAll("\\", "\\\\")} ok` } }) }] }] } },
    { type: "assistant", message: { content: [{ type: "tool_use", id: "t2", name: "Read", input: { path: "x" } }] } },
    { type: "user", message: { content: [{ type: "tool_result", tool_use_id: "t2", is_error: true, content: "Input validation error: Invalid arguments for tool Read: x" }] } },
    { type: "result", subtype: "success", total_cost_usd: 0.12, usage: { input_tokens: 3, output_tokens: 5 }, duration_ms: 900 },
  ];
  return `${events.map(event => JSON.stringify(event)).join("\n")}\nnot json\n`;
}

// The probe's former inline parser, kept verbatim as the reference for the extraction (TP SCN-010).
function legacyParseSession(stdout, redact) {
  const events = stdout.split("\n").map((line) => { try { return JSON.parse(line); } catch { return null; } }).filter(Boolean);
  const init = events.find((event) => event.type === "system" && event.subtype === "init") ?? {};
  const calls = [];
  const results = new Map();
  for (const event of events) {
    for (const item of event.message?.content ?? []) {
      if (event.type === "assistant" && item.type === "tool_use" && item.name === TOOL) calls.push({ id: item.id, input: item.input });
      if (event.type === "user" && item.type === "tool_result") {
        const text = Array.isArray(item.content) ? item.content.map((part) => part.text ?? "").join("") : String(item.content ?? "");
        results.set(item.tool_use_id, text);
      }
    }
  }
  const dispatches = calls.map((call) => {
    let parsed = null;
    try { parsed = JSON.parse(results.get(call.id) ?? ""); } catch {}
    return { input: call.input, outcome: parsed?.outcome ?? null, terminal: parsed?.terminal ?? null, authorizes: parsed?.authorizes ?? null,
      host_action: redact(parsed?.host_action?.text ?? results.get(call.id) ?? "").slice(0, 160) };
  });
  return { model: init.model ?? null, server: (init.mcp_servers ?? []).find((server) => server.name === SERVER) ?? null,
    toolOffered: (init.tools ?? []).includes(TOOL), dispatches, result: events.find((event) => event.type === "result") ?? null };
}

test("the shared parser reproduces the probe's former session summary", () => {
  const legacyRedact = (text) => [WORK, WORK.replaceAll("\\", "/"), WORK.replaceAll("\\", "\\\\")].reduce((value, path) => value.replaceAll(path, "<WORK>"), String(text));
  const redact = createRedactor([{ path: WORK, token: "<WORK>" }]);
  const stdout = syntheticStream();
  assert.deepEqual(summarizeToolSession(parseClaudeStream(stdout), { tool: TOOL, server: SERVER, redact }), legacyParseSession(stdout, legacyRedact));
});

test("the generalized parser keeps every tool pair, error flag, init and result", () => {
  const parsed = parseClaudeStream(syntheticStream());
  assert.deepEqual(parsed.calls.map(call => [call.name, call.result.is_error]), [[TOOL, false], ["Read", true]]);
  assert.equal(parsed.init.model, "claude-sonnet-5");
  assert.equal(parsed.result.total_cost_usd, 0.12);
  assert.equal(parsed.eventTypes["system:init"], 1);
  assert.equal(parsed.eventTypes["result:success"], 1);
});

test("tool_reference parts of ToolSearch results are kept as references", () => {
  const stream = [
    { type: "assistant", message: { content: [{ type: "tool_use", id: "s1", name: "ToolSearch", input: { query: "status" } }] } },
    { type: "user", message: { content: [{ type: "tool_result", tool_use_id: "s1", content: [{ type: "tool_reference", tool_name: TOOL }] }] } },
  ].map(event => JSON.stringify(event)).join("\n");
  assert.deepEqual(parseClaudeStream(stream).calls[0].result.references, [TOOL]);
});

test("redaction removes raw, forward-slash and JSON-escaped path forms (SCN-015)", () => {
  const redact = createRedactor([{ path: WORK, token: "<WORK>" }, { path: "C:\\probe", token: "<PROBE>" }]);
  const text = `${WORK}|${WORK.replaceAll("\\", "/")}|${WORK.replaceAll("\\", "\\\\")}|C:\\probe\\other`;
  assert.equal(redact(text), "<WORK>|<WORK>|<WORK>|<PROBE>\\other");
  // JSON text inside a JSON string doubles the escaping once more.
  assert.equal(redact(JSON.stringify(JSON.stringify({ root: WORK }))), JSON.stringify(JSON.stringify({ root: "<WORK>" })));
  const triple = JSON.stringify(JSON.stringify(JSON.stringify({ root: `${WORK}\\x` })));
  assert.equal(redact(triple).includes("probe"), false);
  assert.equal(redact("cd /c/probe/work-tmp/x && ls"), "cd <WORK>/x && ls");
  assert.equal(redact("c:\\PROBE\\Work-Tmp\\y"), "<WORK>\\y");
});

test("the credential copy exists during sync and async callbacks and is removed afterwards", async () => {
  const { mkdtempSync, writeFileSync, existsSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { withCopiedCredentials } = await import("../../../scripts/native-probes/lib/claude-session.mjs");
  const source = mkdtempSync(join(tmpdir(), "agdf-cred-source-")), home = mkdtempSync(join(tmpdir(), "agdf-cred-home-"));
  const previous = process.env.CLAUDE_CONFIG_DIR_SOURCE;
  try {
    writeFileSync(join(source, ".credentials.json"), "{}");
    process.env.CLAUDE_CONFIG_DIR_SOURCE = source;
    const copy = join(home, ".credentials.json");
    assert.equal(withCopiedCredentials(home, ({ available }) => available && existsSync(copy)), true);
    assert.equal(existsSync(copy), false);
    const seen = await withCopiedCredentials(home, async () => { await new Promise(done => setTimeout(done, 5)); return existsSync(copy); });
    assert.equal(seen, true);
    assert.equal(existsSync(copy), false);
    assert.throws(() => withCopiedCredentials(home, () => { throw new Error("boom"); }), /boom/u);
    assert.equal(existsSync(copy), false);
    // A terminating signal removes the copy; with another handler present the process is not ended here.
    const { TERMINATION_SIGNALS } = await import("../../../scripts/native-probes/lib/claude-session.mjs");
    const keepAlive = () => {};
    process.on("SIGINT", keepAlive);
    try {
      await withCopiedCredentials(home, async () => {
        assert.equal(existsSync(copy), true);
        process.emit("SIGINT", "SIGINT");
        assert.equal(existsSync(copy), false);
      });
    } finally { process.off("SIGINT", keepAlive); }
    assert.ok(TERMINATION_SIGNALS.every(signal => process.listenerCount(signal) === 0), "signal handlers are released");
    // A long-lived token in the environment replaces the copy entirely.
    const previousToken = process.env.CLAUDE_CODE_OAUTH_TOKEN;
    process.env.CLAUDE_CODE_OAUTH_TOKEN = "test-token-value";
    try {
      assert.deepEqual(withCopiedCredentials(home, value => ({ ...value, copied: existsSync(copy) })), { available: true, mode: "oauth_token_env", copied: false });
    } finally { if (previousToken === undefined) delete process.env.CLAUDE_CODE_OAUTH_TOKEN; else process.env.CLAUDE_CODE_OAUTH_TOKEN = previousToken; }
    assert.equal(withCopiedCredentials(home, ({ mode }) => mode), "credentials_copy");
  } finally {
    if (previous === undefined) delete process.env.CLAUDE_CONFIG_DIR_SOURCE; else process.env.CLAUDE_CONFIG_DIR_SOURCE = previous;
    rmSync(source, { recursive: true, force: true }); rmSync(home, { recursive: true, force: true });
  }
});

test("mcp list parsing and installed plugin root lookup", async () => {
  const { parseMcpList, installedPluginRoot } = await import("../../../scripts/native-probes/lib/claude-session.mjs");
  const servers = parseMcpList("Checking MCP server health...\n\nplugin:agdf:agdf: node C:/x/mcp/agdf-mcp-launch.js - ✓ Connected\n"
    + "plugin:agdf:agdf-cockpit: node C:/x/mcp/agdf-mcp-launch.js --cockpit-dir C:/r - ✗ Failed to connect\nother: npx y - ⚠ Needs authentication\n");
  assert.deepEqual(servers.map(server => [server.name, server.status]),
    [["plugin:agdf:agdf", "connected"], ["plugin:agdf:agdf-cockpit", "failed"], ["other", "other"]]);
  assert.equal(installedPluginRoot({ plugins: { "agdf@agdf": [{ scope: "user", installPath: "C:/home/plugins/cache/agdf" }] } }), "C:/home/plugins/cache/agdf");
  assert.equal(installedPluginRoot({ plugins: {} }), null);
});

test("session arguments keep the probe's flag order and add variant flags", () => {
  assert.deepEqual(claudeSessionArgs({ prompt: "p", model: "m", allowedTools: [TOOL] }),
    ["-p", "p", "--model", "m", "--output-format", "stream-json", "--verbose", "--allowedTools", TOOL]);
  const mcpOnly = claudeSessionArgs({ prompt: "p", disableSkills: true, disableHooks: true, maxBudgetUsd: 1.5 });
  assert.ok(mcpOnly.includes("--disable-slash-commands"));
  assert.equal(mcpOnly[mcpOnly.indexOf("--settings") + 1], JSON.stringify({ disableAllHooks: true }));
  assert.equal(mcpOnly[mcpOnly.indexOf("--max-budget-usd") + 1], "1.5");
  const limited = claudeSessionArgs({ prompt: "p", tools: ["Read", "ToolSearch"] });
  assert.equal(limited[limited.indexOf("--tools") + 1], "Read,ToolSearch");
});
