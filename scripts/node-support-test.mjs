import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = new URL("../", import.meta.url);
const json = path => JSON.parse(readFileSync(new URL(path, root), "utf8"));
for (const name of ["create-agdf", "agdf", "agdf-mcp-server"]) {
  assert.equal(json(`${name}/package.json`).engines.node, ">=22");
}
assert.equal(json("agdf-mcp-server/package-lock.json").packages[""].engines.node, ">=22");
assert.equal(json("plugin/meta/agdf-mcp-capability.json").package.node, ">=22");

const actions = { "actions/checkout": "v7", "actions/setup-node": "v7",
  "actions/upload-artifact": "v7", "actions/download-artifact": "v8" };
for (const file of readdirSync(new URL(".github/workflows/", root))) {
  if (!file.endsWith(".yml")) continue;
  const workflow = parse(readFileSync(new URL(`.github/workflows/${file}`, root), "utf8"));
  for (const job of Object.values(workflow.jobs)) for (const step of job.steps ?? []) {
    const [name, version] = (step.uses ?? "").split("@");
    if (actions[name]) assert.equal(version, actions[name], `${file}: ${name}`);
    if (name === "actions/setup-node" && typeof step.with?.["node-version"] === "number") {
      assert.ok([22, 24].includes(step.with["node-version"]), file);
    }
  }
}
const guardrails = parse(readFileSync(new URL(".github/workflows/agdf-guardrails.yml", root), "utf8"));
assert.deepEqual(guardrails.jobs.verify.strategy.matrix.include.map(row => [row.os, row.node]),
  [["ubuntu-latest", 22], ["windows-latest", 22], ["ubuntu-latest", 24]]);

// Simulate only the version gate, not execution on another Node runtime.
for (const version of ["18.20.0", "20.19.0", "21.0.0"]) for (const path of [
  "create-agdf/bin/create-agdf.js", "agdf-mcp-server/bin/agdf-mcp.js",
]) {
  const source = `Object.defineProperty(process.versions, "node", {value: ${JSON.stringify(version)}}); await import(${JSON.stringify(new URL(path, root).href)});`;
  const result = spawnSync(process.execPath, ["--input-type=module", "-e", source], {
    cwd: fileURLToPath(root), encoding: "utf8", timeout: 10000,
  });
  assert.equal(result.status, 1, `${path} must reject ${version}`);
  assert.match(result.stderr, /AGDF_(?:MCP_)?NODE_UNSUPPORTED/);
}
console.log("Node support: package minimum, CI matrix, Action versions and legacy-runtime rejection passed.");
