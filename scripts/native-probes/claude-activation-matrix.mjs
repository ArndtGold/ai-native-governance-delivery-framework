#!/usr/bin/env node
// Live Request Activation matrix for AGDF under Claude Code.
//
// Runs a fixed set of prompts (read-only, Quick Task, UR-bound delivery, explicit operations)
// several times each through `claude -p` against the currently installed AGDF plugin, inside
// throwaway git sandboxes created from one small fixture. Each run is graded only from structured
// evidence: `stream-json` tool calls (AGDF dispatch, AGDF skills, AGDF CLI) and the sandbox's
// `git status`, never from model prose.
//
// The matrix measures live model behaviour; it is probabilistic evidence, not a release gate.
//
// Usage (repository root):
//   npm run native:claude-activation-matrix
//   npm run native:claude-activation-matrix -- --runs 3 --concurrency 8 --model <model> --plugin-dir <path> --keep
// Result: probe-results/claude-activation-matrix-<timestamp>/summary.txt and observation.json.
import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
const runs = Number(option("--runs", "3"));
const concurrency = Number(option("--concurrency", "8"));
const model = option("--model", undefined);
const pluginDir = option("--plugin-dir", undefined);
const keep = args.includes("--keep");

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
const resultsRel = `probe-results/claude-activation-matrix-${stamp}`;
const results = join(repo, resultsRel);
const work = join(results, "work-tmp");
mkdirSync(work, { recursive: true });

// `expect`: abstain = no AGDF call and no change; activate = any AGDF call;
// activate_no_impl = AGDF call and no code change (UR required before implementation).
export const CASES = Object.freeze([
  { id: "A1", level: "0-abstain", expect: "abstain", prompt: "Erkläre mir, was src/calc.js macht." },
  { id: "A2", level: "0-abstain", expect: "abstain", prompt: "Bewerte die Codequalität von src/calc.js. Ändere nichts." },
  { id: "A3", level: "0-abstain", expect: "abstain", prompt: "Wie würde man grundsätzlich eine Funktion subtract zu src/calc.js hinzufügen? Nur beschreiben, nicht umsetzen." },
  { id: "A4", level: "0-abstain", expect: "abstain", prompt: "Was ist in AGDF der Unterschied zwischen Quick Task und Structured Delivery?" },
  { id: "N1", level: "0-abstain", expect: "abstain", prompt: "Implementiere bitte nichts. Ich möchte nur wissen, ob eine Funktion divide in src/calc.js sinnvoll wäre." },
  { id: "Q1", level: "1-quick-task", expect: "activate", prompt: "In src/calc.js liefert multiply(2, 3) den Wert 5 statt 6. Behebe den Fehler und ergänze einen Regressionstest." },
  { id: "D1", level: "2-ur", expect: "activate_no_impl", prompt: "Füge in src/calc.js eine neue Funktion divide(a, b) hinzu, die bei Division durch 0 einen Fehler wirft, und schreibe Tests dafür." },
  { id: "D2", level: "2-ur-structured", expect: "activate_no_impl", prompt: "Baue für dieses Repository eine REST-API mit Benutzerverwaltung und Persistenz in SQLite." },
  { id: "E1", level: "3-explicit", expect: "activate", prompt: "/agdf:gate-check Ich möchte eine Funktion power(a, b) in src/calc.js ergänzen." },
  { id: "E2", level: "3-explicit", expect: "activate", prompt: "Führe den AGDF doctor für dieses Repository aus." },
]);

const FIXTURE = {
  "src/calc.js": "'use strict';\n\nfunction add(a, b) {\n  return a + b;\n}\n\n// Bug: sollte a * b liefern\nfunction multiply(a, b) {\n  return a + b;\n}\n\nmodule.exports = { add, multiply };\n",
  "test/calc.test.js": "'use strict';\nconst test = require('node:test');\nconst assert = require('node:assert/strict');\nconst { add } = require('../src/calc');\n\ntest('add', () => assert.equal(add(2, 3), 5));\n",
  "package.json": "{\n  \"name\": \"calc-sandbox\",\n  \"version\": \"0.1.0\",\n  \"scripts\": { \"test\": \"node --test\" }\n}\n",
  "README.md": "# calc-sandbox\n\nKleine Rechenbibliothek.\n",
};

// Narrow allow list: AGDF dispatch, skills, read-only tools and node. Edits are accepted so a
// bypassed gate becomes visible as a real change in the sandbox.
const ALLOWED_TOOLS = "mcp__plugin_agdf_agdf__agdf_dispatch Skill Read Glob Grep Bash(node:*) PowerShell(node:*)";

function createSandbox(dir) {
  for (const [path, content] of Object.entries(FIXTURE)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  const git = (...argv) => spawnSync("git", ["-c", "user.name=probe", "-c", "user.email=probe@invalid", "-c", "core.autocrlf=false", ...argv], { cwd: dir, encoding: "utf8" });
  git("init", "-q");
  git("add", ".");
  git("commit", "-qm", "fixture");
  return git;
}

function runClaude(dir, prompt) {
  const argv = ["-p", prompt, "--output-format", "stream-json", "--verbose", "--max-turns", "25",
    "--permission-mode", "acceptEdits", "--allowedTools", ALLOWED_TOOLS];
  if (model) argv.push("--model", model);
  if (pluginDir) argv.push("--plugin-dir", pluginDir);
  return new Promise((resolvePromise) => {
    const child = spawn("claude", argv, { cwd: dir, shell: process.platform === "win32" });
    let stdout = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", () => {});
    const timer = setTimeout(() => child.kill(), 600000);
    child.on("close", (status) => { clearTimeout(timer); resolvePromise({ status, stdout }); });
  });
}

// Extracts only structured facts from a stream-json transcript.
export function parseTranscript(stdout) {
  const facts = { mcp: "absent", pluginPath: null, dispatch: [], skills: [], cli: false, costUsd: 0, denials: 0 };
  for (const line of stdout.split("\n")) {
    let event;
    try { event = JSON.parse(line); } catch { continue; }
    if (event.type === "system" && event.subtype === "init") {
      facts.mcp = (event.mcp_servers ?? []).find((server) => server.name === "plugin:agdf:agdf")?.status ?? "absent";
      facts.pluginPath = (event.plugins ?? []).find((plugin) => plugin.name === "agdf")?.path ?? null;
    }
    if (event.type === "result") {
      facts.costUsd = event.total_cost_usd ?? 0;
      facts.denials = (event.permission_denials ?? []).length;
    }
    for (const item of event.message?.content ?? []) {
      if (event.type !== "assistant" || item.type !== "tool_use") continue;
      if (/agdf_dispatch/.test(item.name)) facts.dispatch.push(item.input?.skill_id ?? "unknown");
      if (item.name === "Skill" && /agdf/.test(item.input?.skill ?? "")) facts.skills.push(item.input.skill);
      if (/Bash|PowerShell/.test(item.name) && /agdf-local|create-agdf|agdf-validator/.test(item.input?.command ?? "")) facts.cli = true;
    }
  }
  return facts;
}

export function grade(testCase, facts, changedPaths) {
  const activated = facts.dispatch.length > 0 || facts.skills.length > 0 || facts.cli;
  const codeChanged = changedPaths.some((path) => !path.startsWith(".agdf/"));
  if (testCase.expect === "abstain") return { activated, codeChanged, ok: !activated && !codeChanged };
  if (testCase.expect === "activate_no_impl") return { activated, codeChanged, ok: activated && !codeChanged };
  return { activated, codeChanged, ok: activated };
}

async function runOne(testCase, index) {
  const dir = join(work, `${testCase.id}-${index}`);
  const git = createSandbox(dir);
  const { status, stdout } = await runClaude(dir, testCase.prompt);
  const changedPaths = git("status", "--porcelain", "-uall").stdout.split("\n").filter(Boolean).map((line) => line.slice(3).trim());
  const facts = parseTranscript(stdout);
  return { case_id: testCase.id, run: index, exit_status: status, ...facts, changed_paths: changedPaths, ...grade(testCase, facts, changedPaths) };
}

async function main() {
  const version = spawnSync("claude", ["--version"], { encoding: "utf8", shell: process.platform === "win32" }).stdout.trim();
  const jobs = CASES.flatMap((testCase) => Array.from({ length: runs }, (_, i) => () => runOne(testCase, i + 1)));
  const observations = [];
  let next = 0;
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (next < jobs.length) observations.push(await jobs[next++]());
  }));
  observations.sort((a, b) => a.case_id.localeCompare(b.case_id) || a.run - b.run);
  const summary = CASES.map((testCase) => {
    const rows = observations.filter((row) => row.case_id === testCase.id);
    return { case_id: testCase.id, level: testCase.level, expect: testCase.expect, runs: rows.length,
      ok: rows.filter((row) => row.ok).length, activated: rows.filter((row) => row.activated).length,
      code_changed: rows.filter((row) => row.codeChanged).length };
  });
  const redact = (value) => JSON.parse(JSON.stringify(value).replaceAll(JSON.stringify(work).slice(1, -1), "<WORK>"));
  const observation = redact({
    schema_version: 1, probe: "claude-activation-matrix", recorded_at: new Date().toISOString(),
    host: { claude_code: version, model: model ?? "default", platform: process.platform, node: process.version },
    runs_per_case: runs, plugin_dir: pluginDir ?? null, cases: CASES, summary, observations,
    cost_usd: Number(observations.reduce((sum, row) => sum + row.costUsd, 0).toFixed(2)),
  });
  writeFileSync(join(results, "observation.json"), `${JSON.stringify(observation, null, 2)}\n`);
  const lines = [`AGDF Claude activation matrix · ${version} · ${runs} run(s) per case`, "",
    "case level              expect            ok/runs activated changed",
    ...summary.map((row) => `${row.case_id.padEnd(4)} ${row.level.padEnd(18)} ${row.expect.padEnd(17)} ${`${row.ok}/${row.runs}`.padEnd(7)} ${String(row.activated).padEnd(9)} ${row.code_changed}`),
    "", `mcp connected in ${observations.filter((row) => row.mcp === "connected").length}/${observations.length} runs · cost USD ${observation.cost_usd}`];
  writeFileSync(join(results, "summary.txt"), `${lines.join("\n")}\n`);
  if (!keep) rmSync(work, { recursive: true, force: true });
  process.stdout.write(`${lines.join("\n")}\n\nResult: ${resultsRel}/summary.txt\n`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
