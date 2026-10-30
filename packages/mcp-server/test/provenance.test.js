import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, readFileSync, readdirSync, statSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { tryLinkFile } from '../../../scripts/support/symlinks.js';
import { digestDirectory, digestMcpDispatcherPackage, digestMcpSdkRuntime, MCP_SDK_RUNTIME_ENTRIES, mcpDispatcherRuntimeEntries } from '../../core/lib/runtime/plugin-provenance.js';
import { createOwnedRuntimeFixture } from "./owned-runtime.js";
import { unresolvedArguments, withStdioClient } from "./helpers.js";

// Preserve the pre-optimization depth-first wire digest, including the subtle
// directory-vs-sibling ordering and Unicode names. Always read fresh file bytes.
const digestFixture = mkdtempSync(join(tmpdir(), 'agdf-live-digest-'));
try {
  mkdirSync(join(digestFixture, 'b'));
  for (const [path, text] of [['A.txt', 'alpha'], ['b/sub.txt', 'beta'], ['b.txt', 'gamma'], ['ä.txt', 'delta']])
    writeFileSync(join(digestFixture, path), text);
  const wire = 'A.txt\0alpha\0b/sub.txt\0beta\0b.txt\0gamma\0ä.txt\0delta\0';
  const expected = createHash('sha256').update(wire).digest('hex');
  assert.equal(digestDirectory(digestFixture), expected);
  writeFileSync(join(digestFixture, 'b.txt'), 'changed');
  assert.notEqual(digestDirectory(digestFixture), expected, 'same root and names never reuse prior byte digests');
  writeFileSync(join(digestFixture, 'b.txt'), 'gamma');
  const unknown = spawnSync(process.execPath, ['--input-type=module', '--eval', `
    import fs from 'node:fs'; import {syncBuiltinESMExports} from 'node:module';
    const original = fs.readdirSync;
    fs.readdirSync = (path, options) => {
      const entries = original(path, options);
      return options?.withFileTypes ? entries.map(entry => ({name: entry.name, isDirectory: () => false, isFile: () => false})) : entries;
    };
    syncBuiltinESMExports();
    const {digestDirectory} = await import(${JSON.stringify(new URL('../../core/lib/runtime/plugin-provenance.js', import.meta.url).href)});
    console.log(digestDirectory(${JSON.stringify(digestFixture)}));
  `], {encoding: 'utf8'});
  assert.equal(unknown.status, 0, unknown.stderr); assert.equal(unknown.stdout.trim(), expected);
  if (tryLinkFile(join(digestFixture, 'A.txt'), join(digestFixture, 'link.txt'), 'provenance-digest')) {
    const linkedWire = 'A.txt\0alpha\0b/sub.txt\0beta\0b.txt\0gamma\0link.txt\0alpha\0ä.txt\0delta\0';
    assert.equal(digestDirectory(digestFixture), createHash('sha256').update(linkedWire).digest('hex'),
      'links retain the original stat-following predicate; the optimization introduces no new link policy');
  }
} finally { rmSync(digestFixture, {recursive: true, force: true}); }

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

const fixture = createOwnedRuntimeFixture({ controlRuns: [] });
try {
  // Compare the former buffered algorithm against every actual selected file,
  // including SDK source/maps and the generated worker, without pruning bytes.
  const bufferedDigest = (root, entries) => {
    const files = [];
    const visit = path => {
      if (statSync(path).isDirectory()) for (const name of readdirSync(path).sort()) visit(join(path, name));
      else if (statSync(path).isFile()) files.push({ path, bytes: readFileSync(path) });
    };
    for (const entry of entries) visit(join(root, entry));
    const hash = createHash('sha256');
    for (const file of files.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
      hash.update(file.path.slice(root.length + 1).replaceAll('\\', '/') + '\0').update(file.bytes).update('\0');
    return hash.digest('hex');
  };
  assert.equal(digestMcpSdkRuntime(fixture.root), bufferedDigest(fixture.root, MCP_SDK_RUNTIME_ENTRIES));
  assert.equal(digestMcpDispatcherPackage(fixture.dispatcherRoot),
    bufferedDigest(fixture.dispatcherRoot, mcpDispatcherRuntimeEntries(fixture.dispatcherRoot)));
  await withStdioClient(fixture, async (client) => {
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map((tool) => tool.name), ["agdf_dispatch", "agdf_inspect", "agdf_project", "agdf_run", "agdf_prepare", "agdf_record", "agdf_approve", "agdf_revise", "agdf_closeout"]);
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
    assert.equal(semanticInvalid.structuredContent.host_action.text, `Ungültiger Wert für skill_id. Erlaubt: ${semanticInvalid.structuredContent.diagnostics[0].allowed_values.join(", ")}. Korrigieren und einmal erneut versuchen.`);
    assert.ok(semanticInvalid.structuredContent.diagnostics[0].allowed_values.includes("agdf:gate-check"));
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

  appendFileSync(`${fixture.dispatcherRoot}/runtime/core/lib/skill-dispatch/contract.js`, "\n// tampered\n");
  assertProvenanceFailure(fixture);
} finally {
  fixture.dispose();
}

const sdkFixture = createOwnedRuntimeFixture({ controlRuns: [] });
try {
  appendFileSync(`${sdkFixture.root}/node_modules/@modelcontextprotocol/core/dist/index.mjs`, "\n// tampered\n");
  assertProvenanceFailure(sdkFixture);
} finally {
  sdkFixture.dispose();
}

const contractFixture = createOwnedRuntimeFixture({ controlRuns: [] });
try {
  appendFileSync(`${contractFixture.dispatcherRoot}/generated/plugins/agdf/meta/contracts/quality.md`, "\nTampered contract\n");
  assertProvenanceFailure(contractFixture);
} finally {
  contractFixture.dispose();
}

console.log("AGDF MCP owned-runtime provenance, shutdown and tamper tests passed.");

const gitFixture = createOwnedRuntimeFixture({ controlRuns: [] });
try {
  appendFileSync(`${gitFixture.dispatcherRoot}/lib/control-evaluation/git-observation.js`, '\n// tampered Git facts provider\n');
  assertProvenanceFailure(gitFixture);
  const dispatcherPath = `${gitFixture.dispatcherRoot}/lib/mcp-dispatch-runtime.js`;
  // This is a digest-selector fixture, not an executable historical runtime.
  // Remove both newer boundary references: the protocol composition itself now
  // owns the Git provider in its complete producer closure.
  writeFileSync(dispatcherPath, readFileSync(dispatcherPath, 'utf8').split('\n')
    .filter(line => !line.includes('./control-evaluation/git-observation.js') && !line.includes('./mcp-protocol-runtime.js')).join('\n'));
  const olderDigest = digestMcpDispatcherPackage(gitFixture.dispatcherRoot);
  appendFileSync(`${gitFixture.dispatcherRoot}/lib/control-evaluation/git-observation.js`, '\n// unimported historical CLI leaf\n');
  assert.equal(digestMcpDispatcherPackage(gitFixture.dispatcherRoot), olderDigest,
    'older facade packages retain their original digest projection without importing the new provider');
} finally { gitFixture.dispose(); }
console.log('Git observation provider tamper rejection and historical facade digest compatibility passed.');

for (const module of ['lib/mcp-protocol-runtime.js', 'lib/mcp-decision-protocol.js']) {
  const composed = createOwnedRuntimeFixture({ controlRuns: [] });
  try {
    appendFileSync(`${composed.dispatcherRoot}/${module}`, '\n// changed shared protocol producer\n');
    assertProvenanceFailure(composed);
  } finally { composed.dispose(); }
}
console.log('Both shared headless/optional UI protocol producers are covered by owned provenance.');
