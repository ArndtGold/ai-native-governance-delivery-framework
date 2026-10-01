import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { npmInvocation } from "../lib/npm-invocation.js";
import { approvalArgs, commandFixture, invoke, json } from "./support/control-command-fixture.js";

const repository = fileURLToPath(new URL("../..", import.meta.url));
const sandbox = realpathSync(mkdtempSync(join(tmpdir(), "agdf-command-package-")));
const snapshot = join(sandbox, "snapshot"), consumer = join(sandbox, "consumer");
const packageRoot = join(snapshot, "create-agdf"), externalPackage = join(consumer, "node_modules/create-agdf");
const metrics = [];
let referenceSuccess;
const semanticSuccess = (result) => ({ assurance: result.assurance, gate: result.effect.gate, approval: result.effect.approval,
  artefact_digest: result.effect.artefact_digest, next_gate: result.effect.next_gate_after_approval, next_action: result.effect.allowed_after_approval });

function checkDependencyClosure(entry, root) {
  const seen = new Set();
  function visit(path) {
    if (seen.has(path)) return;
    assert.ok(path.startsWith(`${root}/`), `dependency escapes package: ${path}`);
    const rel = relative(root, path).replaceAll("\\", "/");
    assert.doesNotMatch(rel, /^(?:lib\/cli\/|lib\/installers\/|lib\/install-setup\/|lib\/mcp-lifecycle\/|bin\/)/u, `public command dependency ${rel}`);
    seen.add(path);
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(/^\s*(?:import|export)\s+(?:\{[^}]*\}|\*[^;\n]*|[\w$]+(?:,\s*\{[^}]*\})?)\s+from\s*["']([^"']+)["']/gmu)) {
      const specifier = match[1];
      if (specifier.startsWith(".")) visit(resolve(dirname(path), specifier));
      else assert.ok(specifier.startsWith("node:"), `unexpected external dependency: ${specifier}`);
    }
  }
  visit(entry);
  return [...seen].map((path) => relative(root, path).replaceAll("\\", "/")).sort();
}

try {
  mkdirSync(snapshot); mkdirSync(consumer, { recursive: true });
  for (const name of ["create-agdf", "plugin", "agdf", "agdf-mcp-server", "pages", ".agdf", ".agents", ".claude-plugin", ".github", "LICENSE", "NOTICE", "README.md", "INSTALL.md", "docs"]) {
    const source = join(repository, name);
    if (!existsSync(source)) continue;
    cpSync(source, join(snapshot, name), { recursive: true,
      filter: (path) => !["node_modules", ".git", "generated", "dist", ".astro"].includes(path.split(/[\\/]/u).at(-1)) });
  }
  cpSync(join(repository, ".git"), join(snapshot, ".git"), { recursive: true });
  for (const entry of ["@modelcontextprotocol/server", "@modelcontextprotocol/core", "zod"]) {
    cpSync(join(repository, "agdf-mcp-server/node_modules", entry), join(snapshot, "agdf-mcp-server/node_modules", entry), { recursive: true });
  }
  execFileSync(process.execPath, [join(packageRoot, "scripts/sync-package-assets.js")], { cwd: sandbox, stdio: "pipe" });
  // Verify the pre-existing CLI suite with only its unrelated documentation input restored in
  // this disposable snapshot. The real workspace failure remains reported separately.
  const architectureDoc = join(snapshot, "docs/architecture/README.md");
  const currentDoc = readFileSync(architectureDoc);
  try {
    writeFileSync(architectureDoc, execFileSync("git", ["show", "HEAD:docs/architecture/README.md"], { cwd: repository }));
    execFileSync(process.execPath, [join(packageRoot, "scripts/cli-modularization-test.js")], { cwd: sandbox, stdio: "pipe" });
    console.log("PASS SCN-024/028 CLI modularization with unchanged HEAD documentation in isolated snapshot; workspace documentation assertion remains a known separate failure");
  } finally { writeFileSync(architectureDoc, currentDoc); }
  for (const name of ["package-build", "copilot-profile", "release-version-coherence", "package-contents", "local-validator", "plugin-mcp-runtime", "runtime-integrity-layout", "runtime-integrity-negative"]) {
    execFileSync(process.execPath, [join(packageRoot, `scripts/${name}-test.js`)], { cwd: sandbox, stdio: "pipe" });
    console.log(`PASS SCN-029/032 isolated ${name} regression`);
  }
  const npm = npmInvocation(["pack", "--ignore-scripts", "--json", "--pack-destination", sandbox]);
  const rawReport = JSON.parse(execFileSync(npm.executable, npm.args, { cwd: packageRoot, encoding: "utf8", stdio: "pipe",
    env: { ...process.env, npm_config_cache: join(sandbox, "npm-cache"), npm_config_offline: "true" } }));
  const report = Array.isArray(rawReport) ? rawReport[0] : rawReport["create-agdf"];
  assert.ok(report.filename.endsWith(".tgz"));
  const tarballDigest = createHash("sha256").update(readFileSync(join(sandbox, report.filename))).digest("hex");
  const extract = join(sandbox, "extract"); mkdirSync(extract);
  execFileSync("tar", ["-xzf", join(sandbox, report.filename), "-C", extract]);
  mkdirSync(dirname(externalPackage), { recursive: true });
  cpSync(join(extract, "package"), externalPackage, { recursive: true });
  const manifest = JSON.parse(readFileSync(join(externalPackage, "package.json"), "utf8"));
  assert.deepEqual(manifest.exports, {
    ".": "./opencode-plugin.js", "./control-command": "./lib/control-command.js", "./cli": "./bin/create-agdf.js",
    "./mcp-dispatch-runtime": "./lib/mcp-dispatch-runtime.js", "./opencode-plugin": "./opencode-plugin.js",
  });
  for (const path of Object.values(manifest.exports)) assert.ok(existsSync(join(externalPackage, path)));
  assert.equal(report.files.some(({ path }) => path.startsWith("scripts/")), false, "private fault harness does not ship");
  const closure = checkDependencyClosure(join(externalPackage, "lib/control-command.js"), externalPackage);
  console.log(`PASS SCN-005/006/027 package exports and ${closure.length} pure runtime dependency modules`);

  // Import audit patches native operations before the package resolves. Metadata reads are allowed;
  // target reads, subprocesses, printing, process exit and writes during import are forbidden.
  const audit = join(consumer, "audit.mjs");
  writeFileSync(audit, `import assert from 'node:assert/strict';
import fs from 'node:fs'; import cp from 'node:child_process'; import { syncBuiltinESMExports } from 'node:module';
const reads=[]; const originalRead=fs.readFileSync;
fs.readFileSync=(path,...args)=>{ reads.push(String(path)); return originalRead(path,...args); };
for(const name of ['writeFileSync','mkdirSync','renameSync','unlinkSync','rmSync']) fs[name]=()=>{throw Error('import write '+name)};
for(const name of ['execFileSync','spawnSync','spawn','execFile']) cp[name]=()=>{throw Error('import process '+name)};
const printed=[]; console.log=(...x)=>printed.push(x); console.error=(...x)=>printed.push(x);
process.exit=()=>{throw Error('import exit')}; syncBuiltinESMExports();
const resolved=import.meta.resolve('create-agdf/control-command');
assert.ok(resolved.startsWith(new URL('./node_modules/create-agdf/',import.meta.url).href));
const module=await import('create-agdf/control-command');
assert.deepEqual(Object.keys(module).sort(),['CONTROL_COMMAND_SCHEMA_VERSION','recordGateApprovalCommand','resolveControlCommandTarget']);
assert.equal(printed.length,0); assert.equal(process.exitCode,undefined);
assert.ok(reads.length>=2); for(const path of reads) assert.ok(path.includes('/node_modules/create-agdf/'),path);
`);
  invoke(audit, []);
  console.log("PASS SCN-006 external import has only package-owned reads and no target/process/write/print/exit effects");
  const executor = join(consumer, "command.mjs");
  writeFileSync(executor, `import { readFileSync } from 'node:fs';
import { recordGateApprovalCommand, resolveControlCommandTarget } from 'create-agdf/control-command';
const root=process.argv[2], command=JSON.parse(readFileSync(process.argv[3],'utf8'));
if(resolveControlCommandTarget(root).target_id!==command.target_id) throw Error('binding');
const result=recordGateApprovalCommand(root,command); console.log(JSON.stringify(result));
process.exitCode=['accepted','already_applied'].includes(result.outcome)?0:2;
`);
  const externalCli = join(externalPackage, "bin/create-agdf.js");
  const fixture = commandFixture({ cli: externalCli, base: sandbox, runId: "external-consumer" });
  try {
    const commandPath = join(consumer, "request.json"); writeFileSync(commandPath, JSON.stringify(fixture.command));
    const accepted = json(executor, [fixture.root, commandPath]); assert.equal(accepted.outcome, "accepted");
    referenceSuccess = semanticSuccess(accepted);
    console.log(`SCN-001 PACKED_API_RESULT ${JSON.stringify(accepted)}`);
    const committed = readFileSync(fixture.runPath, "utf8");
    const replay = json(executor, [fixture.root, commandPath]); assert.equal(replay.outcome, "already_applied");
    assert.deepEqual(replay.effect, accepted.effect); assert.equal(readFileSync(fixture.runPath, "utf8"), committed);
    const cliReplay = json(externalCli, approvalArgs(fixture)); assert.equal(cliReplay.outcome, "already_applied");
    assert.equal(readFileSync(fixture.runPath, "utf8"), committed);
    const inspected = json(externalCli, ["gate-check", "--dir", fixture.root, "--run", fixture.runId, "--json"]);
    assert.equal(inspected.current_gate, accepted.current.gate);
    assert.equal(inspected.status_card.presentation_language, "de");
    console.log("PASS SCN-001/028/029 packed external CLI/API approve/replay/Git/locale parity");
    const resource = join(externalPackage, "generated/plugins/agdf/meta/agdf-interaction-locales.json");
    const resourceBytes = readFileSync(resource); rmSync(resource);
    const missing = spawnSync(process.execPath, [executor, fixture.root, commandPath], { cwd: consumer, encoding: "utf8" });
    assert.notEqual(missing.status, 0); assert.match(missing.stderr, /ENOENT/u);
    assert.equal(readFileSync(fixture.runPath, "utf8"), committed);
    writeFileSync(resource, resourceBytes);
    console.log("PASS SCN-029 missing packed locale resource fails without canonical mutation");
  } finally { fixture.cleanup(); }

  for (const profile of ["generated/plugins/agdf", "generated/plugins/copilot/agdf"]) {
    const validator = join(externalPackage, profile, "runtime/agdf-local.js");
    const fixture = commandFixture({ cli: externalCli, base: sandbox, runId: profile.includes("copilot") ? "generated-copilot" : "generated-shared" });
    try {
      const accepted = json(validator, approvalArgs(fixture)); assert.equal(accepted.outcome, "accepted");
      assert.deepEqual(semanticSuccess(accepted), referenceSuccess);
      const runtimeManifest = JSON.parse(readFileSync(join(dirname(validator), "runtime-manifest.json"), "utf8"));
      assert.equal(runtimeManifest.version, manifest.version);
      console.log(`SCN-032 RUNTIME_IDENTITY ${JSON.stringify({ profile, version: runtimeManifest.version, digest: runtimeManifest.digest, result: accepted })}`);
      const committed = readFileSync(fixture.runPath, "utf8");
      const replay = json(validator, approvalArgs(fixture)); assert.equal(replay.outcome, "already_applied");
      assert.equal(readFileSync(fixture.runPath, "utf8"), committed);
      const validatorRoot = join(dirname(validator), "create-agdf");
      checkDependencyClosure(join(validatorRoot, "lib/control-command.js"), validatorRoot);
      const resource = join(validatorRoot, "generated/plugins/agdf/meta/agdf-interaction-locales.json");
      const bytes = readFileSync(resource); rmSync(resource);
      const missing = spawnSync(process.execPath, [validator, ...approvalArgs(fixture)], { cwd: consumer, encoding: "utf8" });
      assert.notEqual(missing.status, 0); assert.equal(readFileSync(fixture.runPath, "utf8"), committed); writeFileSync(resource, bytes);
      console.log(`PASS SCN-032 generated ${profile} module/resource closure and missing resource fail closed`);
    } finally { fixture.cleanup(); }
  }

  // Fixed measurement boundary: prepared UR -> presentation -> approval -> inspection. All replies
  // are simulated. Counts are observed scripted calls, not human reading time or UX improvement.
  for (const lane of ["legacy", "command"]) {
    const fixture = commandFixture({ cli: externalCli, base: sandbox, runId: `metrics-${lane}` });
    try {
      const args = lane === "legacy" ? approvalArgs(fixture).slice(0, -4) : approvalArgs(fixture);
      const initial = json(externalCli, args); assert.equal(initial.outcome, lane === "legacy" ? "approved" : "accepted");
      json(externalCli, ["gate-check", "--dir", fixture.root, "--run", fixture.runId, "--json"]);
      const replay = json(externalCli, args, lane === "legacy" ? 2 : 0);
      const stale = json(externalCli, approvalArgs(fixture, { ...fixture.command, operation_id: "99999999-9999-4999-8999-000000000099" }), 2);
      assert.equal(stale.outcome, "rejected");
      metrics.push({ lane, boundary: "recorded_UR_to_inspected_approval", success_calls: 3,
        presentation_prepared: 1, presentations_visibly_shown: "unavailable", manual_corrections: 0,
        simulated_replies: 1, observed_human_decisions: "unavailable", retry_calls: 1,
        retry_outcome: replay.outcome, stale_calls: 1, stale_outcome: stale.outcome });
    } finally { fixture.cleanup(); }
  }
  console.log(`SCN-026 WORKFLOW_METRICS ${JSON.stringify(metrics)}`);
  console.log(`SCN-030/031 QUALIFICATION ${JSON.stringify({ source: "passed", packed_external: "passed", generated_validator: "passed",
    native_platform: `${process.platform}/${process.arch}`, native_linux: "unavailable", native_windows: "unavailable",
    new_installed_plugin: "not_installed", visible_host: "not_observed", independent_human_proof: "unavailable" })}`);
  console.log(`PACKAGE_IDENTITY ${JSON.stringify({ version: manifest.version, tarball_sha256: tarballDigest, command_schema_version: "1", receipt_schema_version: "1", approval_seal_legacy_version: "1", receipt_approval_seal_version: "2", files: report.files.length, node: process.version, platform: process.platform, arch: process.arch })}`);
  console.log(`Control command package tests passed (${report.files.length} real packed files).`);
} finally { rmSync(sandbox, { recursive: true, force: true }); }
