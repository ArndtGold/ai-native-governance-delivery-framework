import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { createOwnedRuntimeFixture } from "./owned-runtime.js";
import { unresolvedArguments, withStdioClient } from "./helpers.js";

function waitForExit(child, timeoutMs = 5_000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("server did not exit after transport or signal close"));
    }, timeoutMs);
    child.once("exit", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal });
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function assertProvenanceFailure(fixture) {
  const mismatch = spawnSync(fixture.command, fixture.args, {
    cwd: fixture.root,
    encoding: "utf8",
    timeout: 5_000,
    input: "",
  });
  assert.equal(mismatch.status, 1);
  assert.equal(mismatch.stdout, "");
  assert.equal(mismatch.stderr, "AGDF_MCP_RUNTIME_PROVENANCE_INVALID\n");
}

const fixture = createOwnedRuntimeFixture();
try {
  await withStdioClient(fixture, async (client) => {
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map((tool) => tool.name), ["agdf_dispatch"]);
    const result = await client.callTool({ name: "agdf_dispatch", arguments: unresolvedArguments });
    assert.equal(result.structuredContent.outcome, "target_unresolved");
    assert.equal(result.structuredContent.runtime.provenance_status, "matched");
    assert.equal(result.structuredContent.authorizes, false);
    const semanticInvalid = await client.callTool({
      name: "agdf_dispatch",
      arguments: {
        ...unresolvedArguments,
        skill_id: "not-a-real-agdf-skill",
      },
    });
    assert.equal(semanticInvalid.structuredContent.outcome, "invalid_input");
    assert.equal(semanticInvalid.structuredContent.terminal, true);
    assert.equal(semanticInvalid.structuredContent.authorizes, false);
    assert.equal(semanticInvalid.structuredContent.diagnostics[0].code, "dispatch_input_invalid");
    assert.equal(semanticInvalid.structuredContent.diagnostics[0].field, "skill_id");
    assert.equal(semanticInvalid.structuredContent.host_action.text, "Ungültige Dispatcher-Eingabe für skill_id. Korrigieren und einmal erneut versuchen.");
  });

  const closedInput = spawn(fixture.command, fixture.args, {
    cwd: fixture.root,
    stdio: ["pipe", "pipe", "pipe"],
  });
  closedInput.stdin.end();
  const closedResult = await waitForExit(closedInput);
  assert.equal(closedResult.code, 0);

  const signalled = spawn(fixture.command, fixture.args, {
    cwd: fixture.root,
    stdio: ["pipe", "pipe", "pipe"],
  });
  await new Promise((resolve) => setTimeout(resolve, 100));
  signalled.kill("SIGTERM");
  const signalResult = await waitForExit(signalled);
  assert.ok(signalResult.code === 0 || signalResult.signal === "SIGTERM");

  appendFileSync(`${fixture.dispatcherRoot}/lib/skill-dispatch/contract.js`, "\n// tampered\n");
  assertProvenanceFailure(fixture);
} finally {
  fixture.dispose();
}

const sdkFixture = createOwnedRuntimeFixture();
try {
  appendFileSync(`${sdkFixture.root}/node_modules/@modelcontextprotocol/core/dist/index.mjs`, "\n// tampered\n");
  assertProvenanceFailure(sdkFixture);
} finally {
  sdkFixture.dispose();
}

console.log("AGDF MCP owned-runtime provenance, shutdown and tamper tests passed.");
