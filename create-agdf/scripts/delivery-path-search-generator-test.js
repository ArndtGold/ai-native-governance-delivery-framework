import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { codexGenerator } from "../lib/delivery-path-search/generators/codex.js";
import { claudeGenerator } from "../lib/delivery-path-search/generators/claude.js";
import { guardedExecFileSync } from "../lib/delivery-path-search/transports/read-only-guard.js";

const request = {
  contract_version: "1", scope_key: "generator-test", objective: "Choose a safe path", scope_summary: "Approved scope", current_gate: "CD+Tests",
  allowed_actions: ["implement approved task"], forbidden_actions: ["release"], artefact_refs: ["TP.md"], evidence: ["tests"], missing_evidence: [], risks: [], constraints: [],
  enforcement: { level: "tool_enforced", evidence: ["fixture"] }, budgets: { max_calls: 1, max_proposals: 5, max_duration_ms: 3000, max_cost_units: 5 },
};
const response = {
  contract_version: "1", cost_units: 1, proposals: [{
    proposal_id: "p1", gate_action: "implement approved task", intent: "extend the existing owner", expected_evidence: ["tests"], tests: ["fixture"], assumptions: [],
    affected_boundaries: ["core"], risk_strategy: "reuse", reversibility: "additive",
  }],
};

const temp = mkdtempSync(join(tmpdir(), "agdf-generator-test-"));
try {
  execFileSync("git", ["init", "-q"], { cwd: temp });
  guardedExecFileSync(process.execPath, ["-e", "process.stdout.write('ok')"], { cwd: temp, timeout: 1000 });
  assert.throws(
    () => guardedExecFileSync(process.execPath, ["-e", "require('fs').writeFileSync('mutation.txt','x'); process.exit(1)"], { cwd: temp, timeout: 1000 }),
    (error) => error.code === "GENERATOR_MUTATION_DETECTED",
  );
  rmSync(join(temp, "mutation.txt"), { force: true });
  assert.throws(
    () => guardedExecFileSync(process.execPath, ["-e", "setTimeout(()=>{},10000)"], { cwd: temp, timeout: 50 }),
    (error) => error.code === "GENERATOR_TIMEOUT",
  );

  const codex = codexGenerator({ cwd: temp, runtime: "fake-codex", execute(_bin, args) {
    const outputPath = args[args.indexOf("--output-last-message") + 1];
    writeFileSync(outputPath, JSON.stringify(response), "utf8");
    return "";
  } });
  assert.equal((await codex.generate(request)).proposals.length, 1);

  const claude = claudeGenerator({ cwd: temp, runtime: "fake-claude", execute() {
    return JSON.stringify({ is_error: false, result: JSON.stringify(response) });
  } });
  assert.equal((await claude.generate(request)).cost_units, 1);

  const unauthenticated = claudeGenerator({ cwd: temp, runtime: "fake-claude", execute() {
    const error = new Error("failed");
    error.stdout = JSON.stringify({ is_error: true, result: "Not logged in" });
    throw error;
  } });
  await assert.rejects(() => unauthenticated.generate(request), (error) => error.code === "GENERATOR_AUTHENTICATION_FAILED");
} finally {
  rmSync(temp, { recursive: true, force: true });
}

console.log("Delivery Path Search generator tests passed.");
