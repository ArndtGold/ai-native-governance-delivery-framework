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
  mcpRuntimeDataRoot,
  prepareMcpServerPackage,
  updateMcpRuntimeReferences,
} from "../lib/mcp-lifecycle/package.js";
import {
  createMcpRegistrationSpec,
  createMcpRegistrationTransaction,
  inspectMcpRegistration,
} from "../lib/mcp-lifecycle/host-config.js";
import { runMcpLifecycle } from "../lib/mcp-lifecycle/service.js";
import {
  MCP_DISPATCHER_RUNTIME_ENTRIES,
  MCP_SDK_RUNTIME_ENTRIES,
} from "../lib/runtime/plugin-provenance.js";

const VERSION = "0.14.5";
const CREATE_AGDF_ROOT = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const MCP_SERVER_ROOT = join(CREATE_AGDF_ROOT, "..", "agdf-mcp-server");

assert.throws(() => runMcpLifecycle({
  action: "status",
  surface: "codex",
  target: join(tmpdir(), "agdf-mcp-target-does-not-exist"),
}), /AGDF_MCP_TARGET_INVALID/);

function installFixture(calls, version = VERSION) {
  return (executable, args, options = {}) => {
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
assert.equal(oldNode.result, "manual_compatible");
assert.equal(oldNode.authorizes, false);
assert.equal(oldNodePrepared, false);
assert.equal(existsSync(join(oldNodeRoot, "data")), false);

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
assert.match(userEnabled.scope_effect, /across the current user's projects/);
assert.equal(userEnabled.registration.path, join(userFixture.env.OPENCODE_CONFIG_DIR, "opencode.json"));
assert.match(userEnabled.runtime.entrypoint, new RegExp(`/mcp/user/opencode/${VERSION}/`));
assert.equal(userEnabled.runtime.entrypoint.includes(userFixture.target), false);

const codexUser = lifecycleFixture("codex", "user");
codexUser.env.CODEX_HOME = join(codexUser.root, "codex-user");
const codexUserEnabled = runMcpLifecycle({
  action: "enable", surface: "codex", scope: "user", target: codexUser.target,
  env: codexUser.env, execPath: "/exact/node", nodeVersion: "22.1.0", exec: installFixture([]),
});
assert.equal(codexUserEnabled.scope, "user");
assert.equal(codexUserEnabled.registration.path, join(codexUser.env.CODEX_HOME, "config.toml"));
assert.match(codexUserEnabled.runtime.entrypoint, new RegExp(`/mcp/user/codex/${VERSION}/`));
assert.equal(runMcpLifecycle({
  action: "disable", surface: "codex", scope: "user", target: codexUser.target,
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
assert.equal(missingResult.result, "manual_compatible");
assert.equal(missingPrepared, false);

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
assert.match(claudeUserEnabled.runtime.entrypoint, new RegExp(`/mcp/user/claude/${VERSION}/`));
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
assert.equal(missingClaudeResult.result, "manual_compatible");
assert.equal(missingClaudePrepared, false);

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
      schema_version: 1, operation: "mcp.status", result: "not_configured", surface: "codex",
      scope: "project", target: cliTarget, authorizes: false, runtime: { status: "absent" },
      registration: { status: "absent" }, next_action: "Enable explicitly.",
    };
  },
  io: { log(value) { cliOutput.push(value); }, error(message) { throw new Error(message); } },
}), 0);
assert.equal(cliInput.action, "status");
assert.equal(cliInput.scope, "project");
assert.equal(JSON.parse(cliOutput.at(-1)).authorizes, false);

const errors = [];
assert.equal(await runCli(["mcp", "enable", "--surface", "copilot", "--dir", cliTarget], {
  parser: { cwd: cliTarget }, io: { log() {}, error(value) { errors.push(value); } },
}), 1);
assert.match(errors[0], /codex, claude or opencode/);

for (const surface of ["codex", "claude", "opencode"]) {
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
