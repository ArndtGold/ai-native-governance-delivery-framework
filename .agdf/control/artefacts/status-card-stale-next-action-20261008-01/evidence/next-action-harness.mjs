// Read-only next-step snapshot over every run, via the repository CLI.
// Usage: node next-action-harness.mjs <repo> <out.json>
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const repo = resolve(process.argv[2] ?? ".");
const out = process.argv[3];
const cli = join(repo, "packages", "cli", "bin", "create-agdf.js");
const field = (content, name) => content.match(new RegExp(`^- ${name}:[^\\S\\r\\n]*(.*)$`, "m"))?.[1]?.trim() ?? "";

function cliJson(args) {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd: repo, encoding: "utf8", env: { ...process.env, AGDF_RUN_ID: "" }, maxBuffer: 64 * 1024 * 1024 });
  try { return { ok: true, value: JSON.parse(result.stdout) }; }
  catch { return { ok: false, error: (result.stderr || result.stdout || "").trim().split("\n")[0].slice(0, 200), status: result.status }; }
}

const runs = {};
for (const runId of readdirSync(join(repo, ".agdf", "control", "runs")).sort()) {
  let content = "";
  try { content = readFileSync(join(repo, ".agdf", "control", "runs", runId, "RUN_STATE.md"), "utf8"); } catch { /* recorded as missing */ }
  const gate = cliJson(["gate-check", "--dir", repo, "--run", runId, "--json"]);
  const map = cliJson(["delivery-map", "--dir", repo, "--run", runId, "--json"]);
  runs[runId] = {
    lifecycle: field(content, "lifecycle"),
    stored_gate: field(content, "current_gate"),
    stored_next: field(content, "next_allowed_action"),
    gate_check: gate.ok ? {
      current_gate: gate.value.current_gate ?? null,
      next_allowed_action: gate.value.next_allowed_action ?? null,
      status_card_next_step: gate.value.status_card?.next_step ?? null,
      status: gate.value.status ?? null,
    } : { error: gate.error, exit: gate.status },
    delivery_map: map.ok ? {
      current_gate: map.value.current_gate ?? null,
      next_allowed_action: map.value.next_allowed_action ?? null,
      status: map.value.status ?? null,
    } : { error: map.error, exit: map.status },
  };
}
writeFileSync(out, JSON.stringify({ schema_version: "1", captured_at: new Date().toISOString(), run_count: Object.keys(runs).length, runs }, null, 2) + "\n");
console.log(`captured ${Object.keys(runs).length} runs -> ${out}`);
