import assert from "node:assert/strict";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runCli } from "../lib/cli/application.js";
import { npmExecutable, npmInvocation } from "../lib/installers/npm-invocation.js";
import {
  createMcpRuntimeReferenceTransaction,
  createMcpRuntimeRetirementTransaction,
  inspectMcpServerPackage,
  mcpLegacyRuntimeDataRoot,
  mcpRuntimeDataRoot,
  prepareMcpServerPackage,
  updateMcpRuntimeReferences,
} from "../lib/mcp-lifecycle/package.js";
import {
  createMcpRegistrationSpec,
  createMcpRegistrationTransaction,
  inspectMcpRegistration,
  resolveMcpSources,
} from "../lib/mcp-lifecycle/host-config.js";
import { runMcpLifecycle } from "../lib/mcp-lifecycle/service.js";
import { mcpHostAdapters, validateMcpHostAdapter, validateMcpResolvedSources } from "../lib/mcp-lifecycle/adapter-contract.js";
import { projectMcpLifecycleResult, renderMcpLifecycleText } from "../lib/mcp-lifecycle/presentation.js";
import { validateMcpDirectEvidenceResult } from "../lib/mcp-lifecycle/evidence.js";
import { validateMcpCapabilityProfile } from "../lib/mcp-lifecycle/profile.js";
import { mcpCapabilityProfile } from "../lib/mcp-lifecycle/profile-context.js";
import { createMcpLifecycleResult } from "../lib/mcp-lifecycle/result.js";
import {
  MCP_DISPATCHER_RUNTIME_ENTRIES,
  MCP_SDK_RUNTIME_ENTRIES,
} from "../lib/runtime/plugin-provenance.js";

const VERSION = "0.14.5";
const CREATE_AGDF_ROOT = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const MCP_SERVER_ROOT = join(CREATE_AGDF_ROOT, "..", "agdf-mcp-server");

assert.deepEqual(validateMcpCapabilityProfile(mcpCapabilityProfile, { expectedVersion: VERSION }), { valid: true, errors: [] });
assert.equal(Object.hasOwn(mcpCapabilityProfile.tool, "description"), false, "semantic tool copy is forbidden");
assert.equal(validateMcpCapabilityProfile({ ...mcpCapabilityProfile, tool: {
  ...mcpCapabilityProfile.tool, description: "duplicate",
} }, { expectedVersion: VERSION }).valid, false);
assert.equal(validateMcpCapabilityProfile({ ...mcpCapabilityProfile, lifecycle: {
  ...mcpCapabilityProfile.lifecycle,
  states: { ...mcpCapabilityProfile.lifecycle.states,
    result: mcpCapabilityProfile.lifecycle.states.result.map((value, index) => index ? value : mcpCapabilityProfile.lifecycle.states.result[1]) },
} }, { expectedVersion: VERSION }).valid, false, "duplicated enums cannot hide a missing closed state");
assert.equal(validateMcpCapabilityProfile({ ...mcpCapabilityProfile, qualification: {
  ...mcpCapabilityProfile.qualification,
  records: [{ surface: "codex", capability: "supported", host_version: "0.145.0" }],
} }, { expectedVersion: VERSION }).valid, false, "partial host tuples cannot qualify support");
const qualification = {
  surface: "codex", capability: "supported", host_version: "0.145.0", client_variant: "cli",
  session_variant: "ephemeral:gpt-5.6-sol", configuration_variant: "toml", os: "darwin", arch: "x64",
  requested_scope: "project", native_scope: "project", configuration_source: "project",
  node_version: "22.22.3", server_version: VERSION, dispatcher_version: VERSION, sdk_version: "2.0.0",
  entrypoint_identity: `${VERSION}:${"a".repeat(64)}`,
  discovery_evidence_ref: ".agdf/control/artefacts/agdf-cross-host-mcp-integration/DIRECT_HOST_EVIDENCE.md",
  dispatch_evidence_ref: ".agdf/control/artefacts/agdf-cross-host-mcp-integration/DIRECT_HOST_EVIDENCE.md",
  failure_evidence_ref: ".agdf/control/artefacts/agdf-cross-host-mcp-integration/DIRECT_HOST_EVIDENCE.md",
  cleanup_evidence_ref: ".agdf/control/artefacts/agdf-cross-host-mcp-integration/DIRECT_HOST_EVIDENCE.md",
};
assert.equal(validateMcpCapabilityProfile({ ...mcpCapabilityProfile, qualification: {
  ...mcpCapabilityProfile.qualification, records: [qualification],
} }, { expectedVersion: VERSION }).valid, true);
const qualifiedEvidence = {
  schema_version: 1, surface: "codex", result: "qualified", authorizes: false,
  qualification, registration_status: "matched", discovery_status: "discovered",
  discovery_source: "direct_host", tool_name: "agdf_dispatch", dispatch_status: "passed",
  failure_status: "passed", cleanup_status: "restored", raw_log_sha256: ["b".repeat(64)],
};
assert.deepEqual(validateMcpDirectEvidenceResult(qualifiedEvidence, {
  expected: { surface: "codex", os: "darwin", server_version: VERSION },
}), { valid: true, errors: [] });
assert.equal(validateMcpDirectEvidenceResult({ ...qualifiedEvidence, surface: "claude" }).valid, false,
  "another host cannot fill the direct evidence tuple");
assert.equal(validateMcpDirectEvidenceResult({ ...qualifiedEvidence, cleanup_status: "residue" }).valid, false);
assert.equal(validateMcpDirectEvidenceResult({ ...qualifiedEvidence, failure_status: "not_tested" }).valid, false);
assert.deepEqual(validateMcpDirectEvidenceResult({
  schema_version: 1, surface: "claude", result: "unverified", authorizes: false,
  raw_log_sha256: ["c".repeat(64)], gaps: ["authentication_failed"],
}), { valid: true, errors: [] });
assert.deepEqual(Object.keys(mcpHostAdapters).sort(), ["claude", "codex", "copilot", "opencode"]);
for (const [surface, adapter] of Object.entries(mcpHostAdapters)) {
  assert.equal(validateMcpHostAdapter(adapter).valid, true);
  for (const scope of ["project", "user"]) {
    const sources = resolveMcpSources({ surface, scope, target: tmpdir(), env: {
      CODEX_HOME: join(tmpdir(), "agdf-adapter-codex"),
      OPENCODE_CONFIG_DIR: join(tmpdir(), "agdf-adapter-opencode"),
      COPILOT_HOME: join(tmpdir(), "agdf-adapter-copilot"),
    } });
    assert.deepEqual(validateMcpResolvedSources(sources), { valid: true, errors: [] });
    assert.equal(sources.filter(({ selected }) => selected).length, 1);
    assert.equal(adapter.nativeScope(scope), surface === "claude" && scope === "project" ? "local" : scope);
    assert.equal(adapter.permissionEffect({ scope }).code, "inherited_host_user");
  }
}
assert.equal(validateMcpResolvedSources([
  { id: "duplicate", path: "/one", priority: 1, selected: true },
  { id: "duplicate", path: "/two", priority: 1, selected: false },
]).valid, false);

assert.throws(() => runMcpLifecycle({
  action: "status",
  surface: "codex",
  target: join(tmpdir(), "agdf-mcp-target-does-not-exist"),
}), /AGDF_MCP_TARGET_INVALID/);

function installFixture(calls, version = VERSION) {
  return (executable, args, options = {}) => {
    if (executable === "codex") return args[0] === "--version" ? "codex-cli 0.145.0\n" : "{}\n";
    calls.push({ executable, args: [...args], cwd: options.cwd });
    if (executable !== "npm" || !args.includes(`@agdf/mcp-server@${version}`)) {
      throw new Error("unexpected fixture command");
    }
    const packageRoot = join(options.cwd, "node_modules", "@agdf", "mcp-server");
    const dispatcherRoot = join(options.cwd, "node_modules", "create-agdf");
    mkdirSync(join(packageRoot, "bin"), { recursive: true });
    mkdirSync(dispatcherRoot, { recursive: true });
    writeFileSync(join(packageRoot, "package.json"), `${JSON.stringify({
      name: "@agdf/mcp-server",
      version,
      engines: { node: ">=20" },
      dependencies: {
        "@modelcontextprotocol/server": "2.0.0",
        "create-agdf": version,
      },
    }, null, 2)}\n`);
    writeFileSync(join(packageRoot, "bin", "agdf-mcp.js"), "#!/usr/bin/env node\n");
    for (const entry of MCP_DISPATCHER_RUNTIME_ENTRIES) {
      const destination = join(dispatcherRoot, entry);
      mkdirSync(dirname(destination), { recursive: true });
      cpSync(join(CREATE_AGDF_ROOT, entry), destination, { recursive: true });
    }
    const dispatcherManifestPath = join(dispatcherRoot, "package.json");
    const dispatcherManifest = JSON.parse(readFileSync(dispatcherManifestPath, "utf8"));
    writeFileSync(dispatcherManifestPath, `${JSON.stringify({ ...dispatcherManifest, version }, null, 2)}\n`);
    const definitionPath = join(dispatcherRoot, "generated", "plugins", "agdf", "meta", "agdf-plugin.definition.json");
    const definition = JSON.parse(readFileSync(definitionPath, "utf8"));
    writeFileSync(definitionPath, `${JSON.stringify({ ...definition, version }, null, 2)}\n`);
    for (const entry of MCP_SDK_RUNTIME_ENTRIES) {
      const destination = join(options.cwd, entry);
      mkdirSync(dirname(destination), { recursive: true });
      cpSync(join(MCP_SERVER_ROOT, entry), destination, { recursive: true });
    }
  };
}

assert.deepEqual(npmExecutable({ platform: "linux", execPath: "/node", env: {} }), { executable: "npm", prefix: [] });
assert.deepEqual(npmExecutable({ platform: "win32", execPath: "C:\\Node\\node.exe", env: {} }), {
  executable: "C:\\Node\\node.exe",
  prefix: ["C:\\Node\\node_modules\\npm\\bin\\npm-cli.js"],
});
assert.deepEqual(npmInvocation(["install"], {
  platform: "linux", execPath: "/node", env: { NODE_ENV: "test", AGDF_TEST_NPM_CLI_PATH: "/fixture/npm.js" },
}), { executable: "/node", args: ["/fixture/npm.js", "install"] });

const packageData = mkdtempSync(join(tmpdir(), "agdf-mcp-package-"));
const npmCalls = [];
const prepared = prepareMcpServerPackage({
  dataRoot: packageData,
  expectedVersion: VERSION,
  execPath: "/exact/node",
  nodeVersion: "20.19.0",
  exec: installFixture(npmCalls),
  npmOptions: { platform: "linux", execPath: "/exact/node", env: {} },
});
assert.equal(prepared.status, "matched");
assert.equal(prepared.changed, true);
assert.equal(npmCalls.length, 1);
assert.ok(npmCalls[0].args.includes(`@agdf/mcp-server@${VERSION}`));
assert.equal(npmCalls[0].args.includes("--ignore-scripts"), true);
prepared.commit();
assert.equal(inspectMcpServerPackage({ dataRoot: packageData, expectedVersion: VERSION }).status, "matched");
const reused = prepareMcpServerPackage({
  dataRoot: packageData,
  expectedVersion: VERSION,
  execPath: "/exact/node",
  nodeVersion: "22.1.0",
  exec() { throw new Error("must not reacquire"); },
});
assert.equal(reused.changed, false);
writeFileSync(prepared.markerPath, "{invalid\n");
assert.equal(
  inspectMcpServerPackage({ dataRoot: packageData, expectedVersion: VERSION }).status,
  "mismatch",
  "corrupt owned runtime metadata must degrade without crashing lifecycle inspection",
);
assert.throws(() => prepareMcpServerPackage({ dataRoot: packageData, expectedVersion: VERSION, nodeVersion: "18.20.0" }), /NODE_UNSUPPORTED/);

const oldNodeRoot = mkdtempSync(join(tmpdir(), "agdf-mcp-node18-"));
let oldNodePrepared = false;
const oldNode = runMcpLifecycle({
  action: "enable", surface: "codex", target: oldNodeRoot,
  env: { AGDF_DATA_DIR: join(oldNodeRoot, "data") },
  nodeVersion: "18.20.8",
  prepare() { oldNodePrepared = true; },
});
assert.equal(oldNode.result, "not_configured");
assert.equal(oldNode.capability, "manual_compatible");
assert.equal(oldNode.schema_version, 2);
assert.equal(oldNode.contract_version, 2);
assert.match(renderMcpLifecycleText(oldNode, { language: "en" }), /Use Node\.js 20 or later/);
assert.match(renderMcpLifecycleText(oldNode, { language: "de" }), /Node\.js 20 oder neuer/);
assert.equal(oldNode.authorizes, false);
assert.equal(oldNode.effective_scope, null);
assert.deepEqual(oldNode.permission_effect, { code: "inherited_host_user", parameters: {} });
assert.equal(oldNode.discovery.source, "none");
assert.equal(projectMcpLifecycleResult(oldNode, { language: "de" }).next_action.text,
  "Node.js 20 oder neuer verwenden und erneut versuchen.");
assert.equal(oldNodePrepared, false);
assert.equal(existsSync(join(oldNodeRoot, "data")), false);

assert.throws(() => createMcpLifecycleResult({
  action: "status", result: "discovered_ready", surface: "codex", scope: "project",
  scopeEffect: "project", target: oldNodeRoot, capability: "unverified",
  runtime: { package_status: "matched" },
  registration: { status: "matched", selected_status: "matched", effective_status: "matched",
    selected_source: "project", effective_source: "project", native_scope: "project", sources: [] },
  discovery: { status: "discovered", source: "direct_host",
    evidence_ref: ".agdf/control/artefacts/agdf-cross-host-mcp-integration/DIRECT_HOST_EVIDENCE.md" },
  nextAction: { code: "none" },
}), /AGDF_MCP_LIFECYCLE_RESULT_INVALID/, "discovery cannot imply qualified support");

function lifecycleFixture(surface, scope = "project") {
  const root = mkdtempSync(join(tmpdir(), `agdf-mcp-${surface}-`));
  const targetPath = join(root, "target");
  const dataRoot = join(root, "data");
  mkdirSync(targetPath, { recursive: true });
  const target = realpathSync(targetPath);
  return { root, target, dataRoot, env: { AGDF_DATA_DIR: dataRoot }, scope };
}

for (const surface of ["codex", "opencode"]) {
  const fixture = lifecycleFixture(surface);
  const calls = [];
  const install = installFixture(calls);
  const exec = (executable, args, options) => executable === "opencode"
    ? "1.18.3\n"
    : install(executable, args, options);
  if (surface === "codex") {
    mkdirSync(join(fixture.target, ".codex"), { recursive: true });
    writeFileSync(join(fixture.target, ".codex", "config.toml"), "[projects.\"/keep\"]\ntrust_level = \"trusted\"\n");
  } else {
    writeFileSync(join(fixture.target, "opencode.json"), `${JSON.stringify({
      permission: { bash: "deny", edit: "ask" },
      mcp: { other: { type: "remote", url: "https://example.invalid" } },
    }, null, 2)}\n`);
  }
  const enabled = runMcpLifecycle({
    action: "enable", surface, scope: "project", target: fixture.target,
    env: fixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec,
  });
  assert.equal(enabled.result, "configured_pending_restart");
  assert.equal(enabled.authorizes, false);
  assert.equal(enabled.scope, "project");
  assert.equal(enabled.registration.status, "matched");
  const status = runMcpLifecycle({
    action: "status", surface, target: fixture.target,
    env: fixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec,
  });
  assert.equal(status.result, "configured_unverified");
  assert.equal(calls.length, 1, "status must not acquire or update packages");
  if (surface === "codex") {
    const config = readFileSync(join(fixture.target, ".codex", "config.toml"), "utf8");
    assert.match(config, /\[projects\."\/keep"\]/);
    assert.match(config, /\[mcp_servers\.agdf\]/);
    assert.match(config, /# AGDF-OWNED-MCP:/);
  } else {
    const config = JSON.parse(readFileSync(join(fixture.target, "opencode.json"), "utf8"));
    assert.deepEqual(config.permission, { bash: "deny", edit: "ask" });
    assert.equal(config.mcp.other.url, "https://example.invalid");
    assert.deepEqual(config.mcp.agdf.command.slice(-2), ["--surface", "opencode"]);
    assert.equal(config.mcp.agdf.cwd, fixture.target);
  }
  const disabled = runMcpLifecycle({
    action: "disable", surface, target: fixture.target,
    env: fixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec,
  });
  assert.equal(disabled.result, "disabled");
  assert.equal(disabled.registration.status, "absent");
  const scopedRuntimeRoot = mcpRuntimeDataRoot({
    dataRoot: fixture.dataRoot,
    scope: "project",
    target: fixture.target,
    surface,
  });
  assert.equal(existsSync(join(scopedRuntimeRoot, VERSION)), false);
  if (surface === "opencode") {
    const config = JSON.parse(readFileSync(join(fixture.target, "opencode.json"), "utf8"));
    assert.equal(config.mcp.agdf, undefined);
    assert.equal(config.mcp.other.url, "https://example.invalid");
    assert.deepEqual(config.permission, { bash: "deny", edit: "ask" });
  }
}

const sharedFixture = lifecycleFixture("shared");
const sharedCalls = [];
const sharedInstall = installFixture(sharedCalls);
const sharedExec = (executable, args, options) => executable === "copilot"
  ? (args[0] === "--version" ? "0.0.401\n" : "{}\n")
  : sharedInstall(executable, args, options);
const sharedCodex = runMcpLifecycle({ action: "enable", surface: "codex", target: sharedFixture.target,
  env: sharedFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: sharedExec });
const sharedCopilot = runMcpLifecycle({ action: "enable", surface: "copilot", target: sharedFixture.target,
  env: sharedFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: sharedExec });
assert.equal(sharedCodex.result, "configured_pending_restart");
assert.equal(sharedCopilot.result, "configured_pending_restart");
assert.equal(sharedCalls.length, 1, "four-host lifecycle reuses one scope runtime");
assert.equal(sharedCopilot.runtime.entrypoint, sharedCodex.runtime.entrypoint);
const copilotPath = join(sharedFixture.target, ".github", "mcp.json");
const copilotConfig = JSON.parse(readFileSync(copilotPath, "utf8"));
assert.deepEqual(copilotConfig.mcpServers.agdf, {
  type: "local",
  command: "/exact/node",
  args: [sharedCopilot.runtime.entrypoint, "--surface", "copilot"],
  env: {
    AGDF_MCP_OWNER: "create-agdf:mcp-runtime",
    AGDF_MCP_VERSION: VERSION,
    AGDF_MCP_DIGEST: sharedCopilot.runtime.digest,
  },
  tools: ["agdf_dispatch"],
});
const sharedRoot = mcpRuntimeDataRoot({ dataRoot: sharedFixture.dataRoot, scope: "project", target: sharedFixture.target });
const sharedReferences = inspectMcpServerPackage({ dataRoot: sharedRoot, expectedVersion: VERSION }).references;
assert.equal(sharedReferences.length, 2);
assert.deepEqual(sharedReferences.map(({ surface }) => surface), ["codex", "copilot"],
  "shared runtime references must use a deterministic order");
assert.equal(runMcpLifecycle({ action: "disable", surface: "codex", target: sharedFixture.target,
  env: sharedFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: sharedExec }).result, "disabled");
assert.equal(inspectMcpServerPackage({ dataRoot: sharedRoot, expectedVersion: VERSION }).references.length, 1);
assert.equal(runMcpLifecycle({ action: "disable", surface: "copilot", target: sharedFixture.target,
  env: sharedFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: sharedExec }).result, "disabled");
assert.equal(existsSync(copilotPath), false, "Copilot disable removes an AGDF-created project config");
assert.equal(inspectMcpServerPackage({ dataRoot: sharedRoot, expectedVersion: VERSION }).status, "absent");

const copilotConflict = lifecycleFixture("copilot-conflict");
writeFileSync(join(copilotConflict.target, ".mcp.json"), `${JSON.stringify({
  mcpServers: { agdf: { type: "local", command: "/foreign", args: [], tools: ["*"] } },
}, null, 2)}\n`);
const conflictExec = (executable, args, options) => executable === "copilot"
  ? (args[0] === "--version" ? "0.0.401\n" : "{}\n")
  : installFixture([])(executable, args, options);
const conflictStatus = runMcpLifecycle({ action: "status", surface: "copilot", target: copilotConflict.target,
  env: copilotConflict.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: conflictExec });
assert.equal(conflictStatus.result, "degraded");
assert.equal(conflictStatus.registration.status, "precedence_conflict");
assert.equal(conflictStatus.registration.selected_source, "project");
assert.equal(conflictStatus.registration.effective_source, "project_override");
const conflictEnable = runMcpLifecycle({ action: "enable", surface: "copilot", target: copilotConflict.target,
  env: copilotConflict.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: conflictExec });
assert.equal(conflictEnable.result, "failed");
assert.equal(existsSync(join(copilotConflict.target, ".github", "mcp.json")), false);

const copilotScopes = lifecycleFixture("copilot-scopes");
copilotScopes.env.COPILOT_HOME = join(copilotScopes.root, "copilot-user");
const copilotScopeExec = (executable, args, options) => executable === "copilot"
  ? (args[0] === "--version" ? "0.0.401\n" : "{}\n")
  : installFixture([])(executable, args, options);
assert.equal(runMcpLifecycle({ action: "enable", surface: "copilot", scope: "user", target: copilotScopes.target,
  env: copilotScopes.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: copilotScopeExec }).result,
"configured_pending_restart");
assert.equal(runMcpLifecycle({ action: "enable", surface: "copilot", target: copilotScopes.target,
  env: copilotScopes.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: copilotScopeExec }).result,
"configured_pending_restart");
const projectDisabledWithUserRemaining = runMcpLifecycle({ action: "disable", surface: "copilot",
  target: copilotScopes.target, env: copilotScopes.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec: copilotScopeExec });
assert.equal(projectDisabledWithUserRemaining.result, "degraded",
  JSON.stringify(projectDisabledWithUserRemaining, null, 2));
assert.equal(projectDisabledWithUserRemaining.effective_scope, "user");
assert.equal(projectDisabledWithUserRemaining.registration.selected_status, "absent");
assert.equal(projectDisabledWithUserRemaining.registration.status, "owned_mismatch");
assert.equal(projectDisabledWithUserRemaining.next_action.code, "inspect_effective_scope");
assert.equal(runMcpLifecycle({ action: "disable", surface: "copilot", scope: "user", target: copilotScopes.target,
  env: copilotScopes.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: copilotScopeExec }).result,
"disabled");
assert.equal(existsSync(join(copilotScopes.env.COPILOT_HOME, "mcp-config.json")), false);

const openCodeInlineConflict = lifecycleFixture("opencode-inline-conflict");
openCodeInlineConflict.env.OPENCODE_CONFIG_CONTENT = JSON.stringify({
  mcp: { agdf: { type: "local", command: ["/foreign"], enabled: true } },
});
const inlineStatus = runMcpLifecycle({ action: "status", surface: "opencode", target: openCodeInlineConflict.target,
  env: openCodeInlineConflict.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec: (executable, args, options) => executable === "opencode" ? "1.18.3\n" : installFixture([])(executable, args, options) });
assert.equal(inlineStatus.result, "degraded");
assert.equal(inlineStatus.registration.status, "precedence_conflict");
assert.equal(inlineStatus.registration.effective_source, "inline");

const openCodeCustomConflict = lifecycleFixture("opencode-custom-conflict");
openCodeCustomConflict.env.OPENCODE_CONFIG = join(openCodeCustomConflict.root, "custom.json");
writeFileSync(openCodeCustomConflict.env.OPENCODE_CONFIG, `${JSON.stringify({
  mcp: { agdf: { type: "local", command: ["/foreign"], enabled: true } },
}, null, 2)}\n`);
const customStatus = runMcpLifecycle({ action: "status", surface: "opencode", target: openCodeCustomConflict.target,
  env: openCodeCustomConflict.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec: (executable, args, options) => executable === "opencode" ? "1.18.3\n" : installFixture([])(executable, args, options) });
assert.equal(customStatus.result, "degraded");
assert.equal(customStatus.registration.status, "precedence_conflict");
assert.equal(customStatus.registration.effective_source, "custom");

const legacyFixture = lifecycleFixture("legacy-codex");
const legacyRoot = mcpLegacyRuntimeDataRoot({ dataRoot: legacyFixture.dataRoot, scope: "project",
  target: legacyFixture.target, surface: "codex" });
const legacyInstall = installFixture([]);
const legacyRuntime = prepareMcpServerPackage({ dataRoot: legacyRoot, expectedVersion: VERSION,
  execPath: "/exact/node", nodeVersion: "22.1.0", exec: legacyInstall });
const legacySpec = createMcpRegistrationSpec({ surface: "codex", target: legacyFixture.target,
  runtime: legacyRuntime, execPath: "/exact/node" });
const legacyRegistration = createMcpRegistrationTransaction({ action: "enable", surface: "codex", scope: "project",
  target: legacyFixture.target, spec: legacySpec, env: legacyFixture.env });
legacyRegistration.apply();
const legacyVerified = inspectMcpRegistration({ surface: "codex", scope: "project", target: legacyFixture.target,
  spec: legacySpec, env: legacyFixture.env });
updateMcpRuntimeReferences(legacyRuntime, [{ surface: "codex", scope: "project", target: legacyFixture.target,
  path: legacyVerified.path }]);
legacyRuntime.commit();
const migrated = runMcpLifecycle({ action: "enable", surface: "codex", target: legacyFixture.target,
  env: legacyFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]) });
assert.equal(migrated.result, "configured_pending_restart");
assert.equal(inspectMcpServerPackage({ dataRoot: legacyRoot, expectedVersion: VERSION }).status, "absent");
assert.equal(inspectMcpServerPackage({ dataRoot: mcpRuntimeDataRoot({ dataRoot: legacyFixture.dataRoot,
  scope: "project", target: legacyFixture.target }), expectedVersion: VERSION }).status, "matched");
assert.equal(runMcpLifecycle({ action: "disable", surface: "codex", target: legacyFixture.target,
  env: legacyFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]) }).result, "disabled");

const generatedCodex = lifecycleFixture("codex");
assert.equal(existsSync(join(generatedCodex.target, ".codex")), false);
assert.equal(runMcpLifecycle({
  action: "enable", surface: "codex", target: generatedCodex.target,
  env: generatedCodex.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
}).result, "configured_pending_restart");
const generatedCodexPath = join(generatedCodex.target, ".codex", "config.toml");
assert.match(readFileSync(generatedCodexPath, "utf8"), /"created_config":true/);
assert.match(readFileSync(generatedCodexPath, "utf8"), /"created_directory":true/);
assert.equal(runMcpLifecycle({
  action: "disable", surface: "codex", target: generatedCodex.target,
  env: generatedCodex.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
}).result, "disabled");
assert.equal(existsSync(generatedCodexPath), false, "disable restores an originally absent Codex config");
assert.equal(existsSync(join(generatedCodex.target, ".codex")), false, "disable restores an originally absent Codex directory");

const existingCodexDirectory = lifecycleFixture("codex");
const existingCodexDirectoryPath = join(existingCodexDirectory.target, ".codex");
mkdirSync(existingCodexDirectoryPath, { recursive: true });
assert.equal(runMcpLifecycle({
  action: "enable", surface: "codex", target: existingCodexDirectory.target,
  env: existingCodexDirectory.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
}).result, "configured_pending_restart");
assert.equal(runMcpLifecycle({
  action: "disable", surface: "codex", target: existingCodexDirectory.target,
  env: existingCodexDirectory.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
}).result, "disabled");
assert.equal(existsSync(join(existingCodexDirectoryPath, "config.toml")), false);
assert.equal(existsSync(existingCodexDirectoryPath), true, "disable preserves a pre-existing Codex directory");

const OLD_VERSION = "0.14.4";
for (const surface of ["codex", "claude", "opencode"]) {
  const fixture = lifecycleFixture(surface);
  let claudeState = null;
  const oldInstall = installFixture([], OLD_VERSION);
  const currentInstall = installFixture([], VERSION);
  const exec = (executable, args, options = {}) => {
    if (executable === "npm") {
      return args.includes(`@agdf/mcp-server@${OLD_VERSION}`)
        ? oldInstall(executable, args, options)
        : currentInstall(executable, args, options);
    }
    if (executable === "codex") return args[0] === "--version" ? "codex-cli 0.145.0\n" : "{}\n";
    if (executable === "opencode") return "2.0.1\n";
    if (executable !== "claude") throw new Error("unexpected update fixture command");
    if (args[0] === "--version") return "2.1.193 (Claude Code)\n";
    if (args[1] === "get") {
      if (!claudeState) throw Object.assign(new Error("missing"), {
        status: 1,
        stdout: 'No MCP server named "agdf". Run `claude mcp add` to add one.\n',
      });
      return [
        "agdf:",
        "  Scope: Local config (private to you in this project)",
        "  Status: connected",
        "  Type: stdio",
        `  Command: ${claudeState[0]}`,
        `  Args: ${claudeState.slice(1).join(" ")}`,
      ].join("\n");
    }
    if (args[1] === "add") {
      claudeState = args.slice(args.indexOf("--") + 1);
      return "added";
    }
    if (args[1] === "remove") {
      claudeState = null;
      return "removed";
    }
    throw new Error("unexpected Claude update fixture command");
  };
  const runtimeDataRoot = mcpRuntimeDataRoot({
    dataRoot: fixture.dataRoot,
    scope: "project",
    target: fixture.target,
    surface,
  });
  const oldRuntime = prepareMcpServerPackage({
    dataRoot: runtimeDataRoot,
    expectedVersion: OLD_VERSION,
    execPath: "/old/node",
    nodeVersion: "20.19.0",
    exec,
  });
  const oldSpec = createMcpRegistrationSpec({
    surface,
    target: fixture.target,
    runtime: oldRuntime,
    execPath: "/old/node",
    host: surface === "opencode" ? { config_variant: "flat_v1" } : null,
  });
  const oldRegistration = createMcpRegistrationTransaction({
    action: "enable",
    surface,
    scope: "project",
    target: fixture.target,
    spec: oldSpec,
    env: fixture.env,
    exec,
  });
  oldRegistration.apply();
  const oldVerified = inspectMcpRegistration({
    surface,
    scope: "project",
    target: fixture.target,
    spec: oldSpec,
    env: fixture.env,
    exec,
  });
  assert.equal(oldVerified.status, "matched");
  updateMcpRuntimeReferences(oldRuntime, [{
    surface,
    scope: "project",
    target: fixture.target,
    path: oldVerified.path,
  }]);
  oldRuntime.commit();

  const updated = runMcpLifecycle({
    action: "enable",
    surface,
    target: fixture.target,
    env: fixture.env,
    execPath: "/exact/node",
    nodeVersion: "22.1.0",
    exec,
  });
  assert.equal(updated.result, "configured_pending_restart", `${surface} owned update must succeed`);
  assert.equal(inspectMcpServerPackage({ dataRoot: runtimeDataRoot, expectedVersion: OLD_VERSION }).status, "absent");
  assert.equal(inspectMcpServerPackage({ dataRoot: runtimeDataRoot, expectedVersion: VERSION }).status, "matched");
  if (surface === "opencode") {
    const config = JSON.parse(readFileSync(join(fixture.target, "opencode.json"), "utf8"));
    assert.equal(config.mcp.agdf, undefined);
    assert.equal(config.mcp.servers.agdf.disabled, false);
  }
  assert.equal(runMcpLifecycle({
    action: "disable",
    surface,
    target: fixture.target,
    env: fixture.env,
    execPath: "/exact/node",
    nodeVersion: "22.1.0",
    exec,
  }).result, "disabled");
}

const transactionFixture = mkdtempSync(join(tmpdir(), "agdf-mcp-runtime-transactions-"));
const transactionRuntime = prepareMcpServerPackage({
  dataRoot: transactionFixture,
  expectedVersion: VERSION,
  execPath: "/exact/node",
  nodeVersion: "22.1.0",
  exec: installFixture([]),
});
transactionRuntime.commit();
const markerBefore = readFileSync(transactionRuntime.markerPath, "utf8");
const referenceTransaction = createMcpRuntimeReferenceTransaction(transactionRuntime, [{
  surface: "codex", scope: "project", target: "/target", path: "/config",
}]);
referenceTransaction.apply();
assert.notEqual(readFileSync(transactionRuntime.markerPath, "utf8"), markerBefore);
referenceTransaction.rollback();
assert.equal(readFileSync(transactionRuntime.markerPath, "utf8"), markerBefore);
const retirementTransaction = createMcpRuntimeRetirementTransaction(transactionRuntime);
retirementTransaction.apply();
assert.equal(existsSync(transactionRuntime.root), false);
assert.equal(existsSync(retirementTransaction.retiredRoot), true);
retirementTransaction.rollback();
assert.equal(existsSync(transactionRuntime.root), true);
assert.equal(existsSync(retirementTransaction.retiredRoot), false);

const foreign = lifecycleFixture("codex");
mkdirSync(join(foreign.target, ".codex"), { recursive: true });
const foreignConfig = "[mcp_servers.agdf]\ncommand = \"/foreign\"\nargs = []\n";
writeFileSync(join(foreign.target, ".codex", "config.toml"), foreignConfig);
const foreignResult = runMcpLifecycle({
  action: "enable", surface: "codex", target: foreign.target,
  env: foreign.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
});
assert.equal(foreignResult.result, "failed");
assert.deepEqual(readFileSync(join(foreign.target, ".codex", "config.toml"), "utf8"), foreignConfig);
assert.equal(existsSync(join(foreign.dataRoot, "mcp", VERSION)), false, "failed registration must roll back a new runtime");

const rollbackFailure = runMcpLifecycle({
  action: "enable", surface: "codex", target: foreign.target,
  env: foreign.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
  prepare() {
    return { status: "matched", version: VERSION, digest: "digest",
      entrypoint: "/runtime/agdf-mcp.js", references: [], changed: true,
      commit() {}, rollback() { throw new Error("rollback failed"); } };
  },
});
assert.equal(rollbackFailure.result, "failed");
assert.deepEqual(rollbackFailure.diagnostics, [{ code: "rollback_incomplete" }, { code: "agdf_mcp_registration_foreign" }]);
assert.match(projectMcpLifecycleResult(rollbackFailure, { language: "de" }).diagnostics[0].text, /Rollback/);

for (const phase of ["prepare", "registration_apply", "registration_readback", "reference_apply"]) {
  const fixture = lifecycleFixture(`fault-${phase}`);
  const input = {
    action: "enable", surface: "codex", target: fixture.target,
    env: fixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
  };
  if (phase === "prepare") input.prepare = () => { throw new Error("AGDF_MCP_PACKAGE_ACQUISITION_FAILED"); };
  if (phase === "registration_apply") input.createRegistrationTransaction = () => ({
    status: "changed", path: join(fixture.target, ".codex", "config.toml"),
    apply() { throw new Error("registration apply failed"); }, rollback() {},
  });
  if (phase === "registration_readback") {
    let inspections = 0;
    input.inspectRegistration = (options) => {
      inspections += 1;
      if (inspections === 2) throw new Error("AGDF_MCP_REGISTRATION_VERIFICATION_FAILED");
      return inspectMcpRegistration(options);
    };
  }
  if (phase === "reference_apply") input.createReferenceTransaction = () => ({
    apply() { throw new Error("reference apply failed"); }, commit() {}, rollback() {},
  });
  const result = runMcpLifecycle(input);
  assert.equal(result.result, "failed", phase);
  assert.equal(existsSync(join(fixture.target, ".codex", "config.toml")), false,
    `${phase} must restore registration bytes and presence`);
  assert.equal(inspectMcpServerPackage({ dataRoot: mcpRuntimeDataRoot({
    dataRoot: fixture.dataRoot, scope: "project", target: fixture.target,
  }), expectedVersion: VERSION }).status, "absent", `${phase} must restore runtime presence`);
}

const retirementFailureFixture = lifecycleFixture("retirement-commit-failure");
const retirementLegacyRoot = mcpLegacyRuntimeDataRoot({ dataRoot: retirementFailureFixture.dataRoot,
  scope: "project", target: retirementFailureFixture.target, surface: "codex" });
const retirementLegacyRuntime = prepareMcpServerPackage({ dataRoot: retirementLegacyRoot,
  expectedVersion: VERSION, execPath: "/old/node", nodeVersion: "22.1.0", exec: installFixture([]) });
const retirementLegacySpec = createMcpRegistrationSpec({ surface: "codex", target: retirementFailureFixture.target,
  runtime: retirementLegacyRuntime, execPath: "/old/node" });
const retirementLegacyRegistration = createMcpRegistrationTransaction({ action: "enable", surface: "codex",
  scope: "project", target: retirementFailureFixture.target, spec: retirementLegacySpec, env: retirementFailureFixture.env });
retirementLegacyRegistration.apply();
const retirementLegacyVerified = inspectMcpRegistration({ surface: "codex", scope: "project",
  target: retirementFailureFixture.target, spec: retirementLegacySpec, env: retirementFailureFixture.env });
updateMcpRuntimeReferences(retirementLegacyRuntime, [{ surface: "codex", scope: "project",
  target: retirementFailureFixture.target, path: retirementLegacyVerified.path }]);
retirementLegacyRuntime.commit();
const retirementConfigBefore = readFileSync(retirementLegacyVerified.path, "utf8");
const retirementMarkerBefore = readFileSync(retirementLegacyRuntime.markerPath, "utf8");
const retirementFailureResult = runMcpLifecycle({
  action: "enable", surface: "codex", target: retirementFailureFixture.target,
  env: retirementFailureFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
  createRetirementTransaction(runtime) {
    const actual = createMcpRuntimeRetirementTransaction(runtime);
    return { apply: actual.apply, rollback: actual.rollback,
      commit() { throw new Error("AGDF_MCP_RUNTIME_RETIRE_INVALID"); } };
  },
});
assert.equal(retirementFailureResult.result, "failed");
assert.equal(readFileSync(retirementLegacyVerified.path, "utf8"), retirementConfigBefore);
assert.equal(readFileSync(retirementLegacyRuntime.markerPath, "utf8"), retirementMarkerBefore);
assert.equal(inspectMcpServerPackage({ dataRoot: retirementLegacyRoot, expectedVersion: VERSION }).status, "matched");
assert.equal(inspectMcpServerPackage({ dataRoot: mcpRuntimeDataRoot({ dataRoot: retirementFailureFixture.dataRoot,
  scope: "project", target: retirementFailureFixture.target }), expectedVersion: VERSION }).status, "absent");

for (const invalidConfig of [
  "[mcp_servers.agdf]\ncommand = \"/one\"\nargs = []\n\n[mcp_servers.agdf]\ncommand = \"/two\"\nargs = []\n",
  "[[mcp_servers.agdf]]\ncommand = \"/foreign\"\nargs = []\n",
  "[mcp_servers.agdf.environment]\nowner = \"foreign\"\n",
  "[mcp_servers.\"agdf\"]\ncommand = \"/foreign\"\nargs = []\n",
  "mcp_servers.agdf = { command = \"/foreign\", args = [] }\n",
  "[mcp_servers]\nagdf = { command = \"/foreign\", args = [] }\n",
]) {
  const invalid = lifecycleFixture("codex");
  mkdirSync(join(invalid.target, ".codex"), { recursive: true });
  const invalidPath = join(invalid.target, ".codex", "config.toml");
  writeFileSync(invalidPath, invalidConfig);
  const invalidResult = runMcpLifecycle({
    action: "enable", surface: "codex", target: invalid.target,
    env: invalid.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
  });
  assert.equal(invalidResult.result, "failed", invalidConfig);
  assert.equal(readFileSync(invalidPath, "utf8"), invalidConfig);
  assert.equal(existsSync(join(invalid.dataRoot, "mcp", VERSION)), false);
}

const userFixture = lifecycleFixture("opencode", "user");
userFixture.env.OPENCODE_CONFIG_DIR = join(userFixture.root, "opencode-user");
const userEnabled = runMcpLifecycle({
  action: "enable", surface: "opencode", scope: "user", target: userFixture.target,
  env: userFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec: (executable, args, options) => executable === "opencode"
    ? "1.18.3\n"
    : installFixture([])(executable, args, options),
});
assert.equal(userEnabled.scope, "user");
assert.equal(userEnabled.scope_effect, "user");
assert.equal(userEnabled.registration.path, join(userFixture.env.OPENCODE_CONFIG_DIR, "opencode.json"));
assert.match(userEnabled.runtime.entrypoint, new RegExp(`/mcp/user/${VERSION}/`));
assert.equal(userEnabled.runtime.entrypoint.includes(userFixture.target), false);
const userSecondTarget = join(userFixture.root, "second-target");
mkdirSync(userSecondTarget);
assert.equal(runMcpLifecycle({
  action: "status", surface: "opencode", scope: "user", target: userSecondTarget,
  env: userFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec: (executable, args, options) => executable === "opencode"
    ? "1.18.3\n" : installFixture([])(executable, args, options),
}).result, "configured_unverified", "user registration identity must ignore the incidental target");
assert.equal(runMcpLifecycle({
  action: "disable", surface: "opencode", scope: "user", target: userSecondTarget,
  env: userFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec: (executable, args, options) => executable === "opencode"
    ? "1.18.3\n" : installFixture([])(executable, args, options),
}).result, "disabled");

const codexUser = lifecycleFixture("codex", "user");
codexUser.env.CODEX_HOME = join(codexUser.root, "codex-user");
const codexUserEnabled = runMcpLifecycle({
  action: "enable", surface: "codex", scope: "user", target: codexUser.target,
  env: codexUser.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
});
assert.equal(codexUserEnabled.scope, "user");
assert.equal(codexUserEnabled.registration.path, join(codexUser.env.CODEX_HOME, "config.toml"));
assert.match(codexUserEnabled.runtime.entrypoint, new RegExp(`/mcp/user/${VERSION}/`));
const codexSecondTarget = join(codexUser.root, "second-target");
mkdirSync(codexSecondTarget);
assert.equal(runMcpLifecycle({
  action: "status", surface: "codex", scope: "user", target: codexSecondTarget,
  env: codexUser.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
}).result, "configured_unverified");
assert.equal(runMcpLifecycle({
  action: "disable", surface: "codex", scope: "user", target: codexSecondTarget,
  env: codexUser.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
}).result, "disabled");

const openCodeV2 = lifecycleFixture("opencode");
writeFileSync(join(openCodeV2.target, "opencode.json"), `${JSON.stringify({
  permission: { bash: "deny" },
  mcp: { servers: { other: { type: "remote", url: "https://example.invalid" } } },
}, null, 2)}\n`);
const v2Install = installFixture([]);
const v2Exec = (executable, args, options) => executable === "opencode"
  ? "2.0.1\n"
  : v2Install(executable, args, options);
const v2Enabled = runMcpLifecycle({
  action: "enable", surface: "opencode", target: openCodeV2.target,
  env: openCodeV2.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: v2Exec,
});
assert.equal(v2Enabled.result, "configured_pending_restart");
const v2Config = JSON.parse(readFileSync(join(openCodeV2.target, "opencode.json"), "utf8"));
assert.equal(v2Config.mcp.agdf, undefined);
assert.equal(v2Config.mcp.servers.agdf.disabled, false);
assert.equal(v2Config.mcp.servers.agdf.enabled, undefined);
assert.equal(v2Config.mcp.servers.other.url, "https://example.invalid");
assert.deepEqual(v2Config.permission, { bash: "deny" });
const v2Disabled = runMcpLifecycle({
  action: "disable", surface: "opencode", target: openCodeV2.target,
  env: openCodeV2.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: v2Exec,
});
assert.equal(v2Disabled.result, "disabled");
assert.equal(JSON.parse(readFileSync(join(openCodeV2.target, "opencode.json"), "utf8")).mcp.servers.other.url, "https://example.invalid");

const generatedOpenCode = lifecycleFixture("opencode");
const generatedOpenCodeExec = (executable, args, options) => executable === "opencode"
  ? "1.18.3\n"
  : installFixture([])(executable, args, options);
assert.equal(existsSync(join(generatedOpenCode.target, "opencode.json")), false);
const generatedOpenCodeEnabled = runMcpLifecycle({
  action: "enable", surface: "opencode", target: generatedOpenCode.target,
  env: generatedOpenCode.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: generatedOpenCodeExec,
});
assert.equal(generatedOpenCodeEnabled.result, "configured_pending_restart");
const generatedOpenCodePath = join(generatedOpenCode.target, "opencode.json");
const generatedOpenCodeConfig = JSON.parse(readFileSync(generatedOpenCodePath, "utf8"));
assert.equal(generatedOpenCodeConfig.mcp.agdf.environment.AGDF_MCP_CREATED_CONFIG, "true");
writeFileSync(generatedOpenCodePath, `${JSON.stringify({
  $schema: "https://opencode.ai/config.json",
  ...generatedOpenCodeConfig,
}, null, 2)}\n`);
assert.equal(runMcpLifecycle({
  action: "disable", surface: "opencode", target: generatedOpenCode.target,
  env: generatedOpenCode.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: generatedOpenCodeExec,
}).result, "disabled");
assert.equal(existsSync(generatedOpenCodePath), false, "disable restores an originally absent OpenCode config after host schema insertion");

const emptyOpenCode = lifecycleFixture("opencode");
const emptyOpenCodePath = join(emptyOpenCode.target, "opencode.json");
writeFileSync(emptyOpenCodePath, "{}\n");
const emptyOpenCodeExec = (executable, args, options) => executable === "opencode"
  ? "1.18.3\n"
  : installFixture([])(executable, args, options);
assert.equal(runMcpLifecycle({
  action: "enable", surface: "opencode", target: emptyOpenCode.target,
  env: emptyOpenCode.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: emptyOpenCodeExec,
}).result, "configured_pending_restart");
assert.equal(runMcpLifecycle({
  action: "disable", surface: "opencode", target: emptyOpenCode.target,
  env: emptyOpenCode.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: emptyOpenCodeExec,
}).result, "disabled");
assert.equal(readFileSync(emptyOpenCodePath, "utf8"), "{}\n", "disable preserves a pre-existing empty OpenCode config");

const missingOpenCode = lifecycleFixture("opencode");
let missingPrepared = false;
const missingResult = runMcpLifecycle({
  action: "enable", surface: "opencode", target: missingOpenCode.target,
  env: missingOpenCode.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec() { throw Object.assign(new Error("missing"), { code: "ENOENT" }); },
  prepare() { missingPrepared = true; },
});
assert.equal(missingResult.result, "not_configured");
assert.equal(missingResult.capability, "unavailable");
assert.equal(missingPrepared, false);

const missingCodex = lifecycleFixture("codex-missing");
let missingCodexPrepared = false;
const missingCodexResult = runMcpLifecycle({
  action: "enable", surface: "codex", target: missingCodex.target,
  env: missingCodex.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec() { throw Object.assign(new Error("missing"), { code: "ENOENT" }); },
  prepare() { missingCodexPrepared = true; },
});
assert.equal(missingCodexResult.result, "not_configured");
assert.equal(missingCodexResult.capability, "unavailable");
assert.equal(missingCodexPrepared, false);

for (const surface of ["codex", "opencode"]) {
  const missingHostStatus = lifecycleFixture(`${surface}-missing-status`);
  const configPath = surface === "codex"
    ? join(missingHostStatus.target, ".codex", "config.toml")
    : join(missingHostStatus.target, "opencode.json");
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, surface === "codex"
    ? "[mcp_servers.agdf]\ncommand = \"/foreign\"\nargs = []\n"
    : '{"mcp":{"agdf":{"type":"local","command":["/foreign"]}}}\n');
  const observed = runMcpLifecycle({
    action: "status", surface, target: missingHostStatus.target,
    env: missingHostStatus.env, execPath: "/exact/node", nodeVersion: "22.1.0",
    exec() { throw Object.assign(new Error("missing"), { code: "ENOENT" }); },
  });
  assert.equal(observed.capability, "unavailable");
  assert.equal(observed.result, "degraded");
  assert.equal(observed.registration.status, "foreign",
    "missing file-based host must still inspect configuration read-only");
  assert.equal(existsSync(missingHostStatus.dataRoot), false);
}

const unsupportedOpenCode = lifecycleFixture("opencode-unsupported");
let unsupportedPrepared = false;
const unsupportedResult = runMcpLifecycle({
  action: "enable", surface: "opencode", target: unsupportedOpenCode.target,
  env: unsupportedOpenCode.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec() { return "3.0.0\n"; }, prepare() { unsupportedPrepared = true; },
});
assert.equal(unsupportedResult.result, "not_configured");
assert.equal(unsupportedResult.capability, "unsupported");
assert.equal(unsupportedPrepared, false);

const claudeFixture = lifecycleFixture("claude");
let claudeState = null;
const claudeCalls = [];
const claudeExec = (executable, args, options = {}) => {
  claudeCalls.push({ executable, args: [...args], cwd: options.cwd });
  if (executable === "npm") return installFixture([])(executable, args, options);
  assert.equal(executable, "claude");
  if (args[0] === "--version") return "2.1.193 (Claude Code)\n";
  if (args[1] === "get") {
    if (!claudeState) throw Object.assign(new Error("missing"), {
      status: 1,
      stdout: 'No MCP server named "agdf". Run `claude mcp add` to add one.\n',
    });
    return [
      "agdf:",
      `  Scope: ${claudeState.scope === "local" ? "Local config (private to you in this project)" : "User config (available in all your projects)"}`,
      "  Status: connected",
      "  Type: stdio",
      `  Command: ${claudeState.command[0]}`,
      `  Args: ${claudeState.command.slice(1).join(" ")}`,
      "  Environment:",
    ].join("\n");
  }
  if (args[1] === "add") {
    claudeState = {
      scope: args[args.indexOf("--scope") + 1],
      command: args.slice(args.indexOf("--") + 1),
    };
    return "added";
  }
  if (args[1] === "remove") {
    claudeState = null;
    return "removed";
  }
  throw new Error("unexpected Claude fixture command");
};
const claudeEnabled = runMcpLifecycle({
  action: "enable", surface: "claude", target: claudeFixture.target,
  env: claudeFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: claudeExec,
});
assert.equal(claudeEnabled.result, "configured_pending_restart");
const addCall = claudeCalls.find((call) => call.args[1] === "add");
assert.deepEqual(addCall.args.slice(0, 8), ["mcp", "add", "--transport", "stdio", "--scope", "local", "agdf", "--"]);
assert.equal(addCall.cwd, claudeFixture.target);
const claudeDisabled = runMcpLifecycle({
  action: "disable", surface: "claude", target: claudeFixture.target,
  env: claudeFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: claudeExec,
});
assert.equal(claudeDisabled.result, "disabled");

const claudeUserEnabled = runMcpLifecycle({
  action: "enable", surface: "claude", scope: "user", target: claudeFixture.target,
  env: claudeFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: claudeExec,
});
assert.equal(claudeUserEnabled.result, "configured_pending_restart");
assert.equal(claudeUserEnabled.scope, "user");
assert.match(claudeUserEnabled.runtime.entrypoint, new RegExp(`/mcp/user/${VERSION}/`));
const userAddCall = claudeCalls.filter((call) => call.args[1] === "add").at(-1);
assert.equal(userAddCall.args[userAddCall.args.indexOf("--scope") + 1], "user");
assert.equal(runMcpLifecycle({
  action: "disable", surface: "claude", scope: "user", target: claudeFixture.target,
  env: claudeFixture.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: claudeExec,
}).result, "disabled");

const missingClaude = lifecycleFixture("claude");
let missingClaudePrepared = false;
const missingClaudeResult = runMcpLifecycle({
  action: "enable", surface: "claude", target: missingClaude.target,
  env: missingClaude.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec() { throw Object.assign(new Error("missing"), { code: "ENOENT" }); },
  prepare() { missingClaudePrepared = true; },
});
assert.equal(missingClaudeResult.result, "not_configured");
assert.equal(missingClaudeResult.capability, "unavailable");
assert.equal(missingClaudePrepared, false);

const maskedClaude = lifecycleFixture("claude-masked");
const maskedClaudeResult = runMcpLifecycle({
  action: "status", surface: "claude", scope: "user", target: maskedClaude.target,
  env: maskedClaude.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec(executable, args) {
    if (args[0] === "--version") return "2.1.193 (Claude Code)\n";
    return ["agdf:", "  Scope: Project config (shared via .mcp.json)", "  Type: stdio",
      "  Command: /foreign", "  Args: /foreign --surface claude"].join("\n");
  },
});
assert.equal(maskedClaudeResult.result, "degraded");
assert.equal(maskedClaudeResult.registration.status, "precedence_conflict");
assert.equal(maskedClaudeResult.registration.effective_source, "shared_project");

const brokenClaude = lifecycleFixture("claude");
const brokenClaudeResult = runMcpLifecycle({
  action: "status", surface: "claude", target: brokenClaude.target,
  env: brokenClaude.env, execPath: "/exact/node", nodeVersion: "22.1.0",
  exec(executable, args) {
    assert.equal(executable, "claude");
    if (args[0] === "--version") return "2.1.193 (Claude Code)\n";
    throw Object.assign(new Error("broken config"), { status: 1, stdout: "Configuration invalid\n" });
  },
});
assert.equal(brokenClaudeResult.result, "failed");
assert.deepEqual(brokenClaudeResult.diagnostics, [{ code: "registration_inspection_failed" }]);

const cliTarget = mkdtempSync(join(tmpdir(), "agdf-mcp-cli-"));
const cliOutput = [];
let cliInput;
assert.equal(await runCli(["mcp", "status", "--surface", "codex", "--dir", cliTarget, "--json"], {
  parser: { cwd: cliTarget },
  env: {},
  mcpLifecycle(input) {
    cliInput = input;
    return {
      schema_version: 2, contract_version: 2, operation: "mcp.status", result: "not_configured",
      capability: "unverified", surface: "codex", scope: "project", target: cliTarget,
      authorizes: false, runtime: { package_status: "absent" }, registration: { status: "absent" },
      discovery: { status: "not_checked", source: "none", evidence_ref: null }, diagnostics: [],
      permission_effect: { code: "inherited_host_user" }, next_action: { code: "enable_scope" },
      fallback: { code: "version_matched_cli_dispatch" },
    };
  },
  io: { log(value) { cliOutput.push(value); }, error(message) { throw new Error(message); } },
}), 0);
assert.equal(cliInput.action, "status");
assert.equal(cliInput.scope, "project");
assert.equal(JSON.parse(cliOutput.at(-1)).authorizes, false);

let copilotInput;
assert.equal(await runCli(["mcp", "enable", "--surface", "copilot", "--dir", cliTarget], {
  parser: { cwd: cliTarget },
  mcpLifecycle(input) {
    copilotInput = input;
    return { schema_version: 2, operation: "mcp.enable", result: "configured_pending_restart",
      capability: "unverified", surface: "copilot", scope: "project", scope_effect: "project", target: cliTarget,
      authorizes: false, runtime: { package_status: "matched" }, registration: { status: "matched" },
      discovery: { status: "pending_restart" }, next_action: { code: "restart_host" },
      fallback: { code: "version_matched_cli_dispatch" } };
  },
  io: { log() {}, error(value) { throw new Error(value); } },
}), 0);
assert.equal(copilotInput.surface, "copilot");

for (const surface of ["codex", "claude", "copilot", "opencode"]) {
  let invoked = false;
  const scopeErrors = [];
  assert.equal(await runCli(["mcp", "status", "--surface", surface, "--scope", "global", "--dir", cliTarget], {
    parser: { cwd: cliTarget },
    mcpLifecycle() { invoked = true; },
    io: { log() {}, error(value) { scopeErrors.push(value); } },
  }), 1);
  assert.equal(invoked, false);
  assert.match(scopeErrors[0], /project and user scopes are supported only by mcp|mcp --scope must be project or user/);
}

console.log("AGDF MCP lifecycle, package acquisition and host adapter tests passed.");
