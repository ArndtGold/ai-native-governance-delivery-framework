import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  codexLocalInstallVersion,
  digestPluginSource,
  isCodexLocalInstallVersion,
  prepareLocalMarketplace,
} from "../lib/installers/local-marketplace.js";
import {
  prepareLocalOpenCodePackage,
  localNpmExecutable,
  validateLocalOpenCodePackageSource,
} from "../lib/installers/local-development.js";
import { inspectPluginSurface, installClaudeGlobalPlugin, installCodexGlobalPlugin } from "../lib/installers/plugin-installers.js";
import { resolveOpenCodeInstallPackageSource } from "../lib/installers/opencode.js";
import { pluginDefinition } from "../lib/cli/runtime-context.js";
import { runCli } from "../lib/cli/application.js";
import { installLocalPlugin } from "./install-local-plugin.js";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = dirname(packageRoot);
const builtPluginRoot = join(packageRoot, "generated", "plugins", "agdf");
const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-local-development-install-"));

function json(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function packExec(content = "local package\n", calls = [], result = {}) {
  return (executable, args, options = {}) => {
    calls.push({ executable, args: [...args], options });
    const destinationIndex = args.indexOf("--pack-destination");
    if (destinationIndex < 0) return "";
    const destination = args[destinationIndex + 1];
    const filename = result.filename ?? `create-agdf-${pluginDefinition.version}.tgz`;
    writeFileSync(join(destination, filename), content);
    return `${JSON.stringify([{ filename, files: result.files ?? [{ path: "package.json", mode: 420 }] }])}\n`;
  };
}

try {
  const sourceDigest = digestPluginSource(builtPluginRoot, pluginDefinition.version);
  const localVersion = codexLocalInstallVersion(pluginDefinition.version, sourceDigest);
  assert.match(localVersion, /^\d+\.\d+\.\d+\+codex\.local-[a-f0-9]{12}$/);
  assert.equal(isCodexLocalInstallVersion(pluginDefinition.version, localVersion, sourceDigest), true);
  assert.equal(isCodexLocalInstallVersion(pluginDefinition.version, `${pluginDefinition.version}+codex.local-000000000000`, sourceDigest), false);
  assert.equal(codexLocalInstallVersion(pluginDefinition.version, sourceDigest), localVersion, "same content must keep one Codex install identity");
  assert.notEqual(codexLocalInstallVersion(pluginDefinition.version, "f".repeat(64)), localVersion, "changed content must receive a new Codex install identity");
  for (const invalidVersion of [
    `${pluginDefinition.version}+codex.local-short`,
    `${pluginDefinition.version}+codex.local-zzzzzzzzzzzz`,
    `9.9.9+codex.local-${sourceDigest.slice(0, 12)}`,
    `${pluginDefinition.version}+arbitrary-${sourceDigest.slice(0, 12)}`,
  ]) {
    assert.equal(isCodexLocalInstallVersion(pluginDefinition.version, invalidVersion, sourceDigest), false);
  }

  const marketplaceDataRoot = join(fixtureRoot, "marketplace-data");
  const projected = prepareLocalMarketplace({
    dataRoot: marketplaceDataRoot,
    builtPluginRoot,
    codexInstallVersion: localVersion,
  });
  assert.equal(projected.codexInstallVersion, localVersion);
  assert.equal(json(join(projected.pluginRoot, ".codex-plugin", "plugin.json")).version, localVersion);
  assert.equal(json(join(projected.pluginRoot, ".claude-plugin", "plugin.json")).version, pluginDefinition.version);
  assert.equal(json(join(projected.pluginRoot, ".agdf-installation.json")).source_digest, sourceDigest);
  assert.equal(json(join(projected.pluginRoot, ".agdf-installation.json")).profile_id, "runtime-plugin");
  assert.equal(json(join(projected.root, ".agdf-owned.json")).codex_install_version, localVersion);
  projected.commit();

  const sameProjection = prepareLocalMarketplace({
    dataRoot: marketplaceDataRoot,
    builtPluginRoot,
    codexInstallVersion: localVersion,
  });
  assert.equal(sameProjection.changed, false, "same prepared content must keep one marketplace projection");
  sameProjection.commit();

  const installedIntegrity = spawnSync(process.execPath, [join(projected.pluginRoot, "scripts", "check-runtime-integrity.mjs")], {
    encoding: "utf8",
  });
  assert.equal(installedIntegrity.status, 0, `${installedIntegrity.stdout}\n${installedIntegrity.stderr}`);
  assert.match(installedIntegrity.stdout, /mode=installed/);

  const localMarkerPath = join(projected.pluginRoot, ".agdf-installation.json");
  const localCodexManifestPath = join(projected.pluginRoot, ".codex-plugin", "plugin.json");
  const localMarker = readFileSync(localMarkerPath, "utf8");
  const localCodexManifest = readFileSync(localCodexManifestPath, "utf8");
  writeFileSync(localMarkerPath, "{}\n");
  const missingEvidenceIntegrity = spawnSync(process.execPath, [join(projected.pluginRoot, "scripts", "check-runtime-integrity.mjs")], {
    encoding: "utf8",
  });
  assert.notEqual(missingEvidenceIntegrity.status, 0, "a Codex local version without its exact marker must fail integrity");
  writeFileSync(localMarkerPath, localMarker);

  const falseDigest = "f".repeat(64);
  writeFileSync(localMarkerPath, `${JSON.stringify({
    ...JSON.parse(localMarker),
    source_digest: falseDigest,
    codex_install_version: codexLocalInstallVersion(pluginDefinition.version, falseDigest),
  }, null, 2)}\n`);
  writeFileSync(localCodexManifestPath, `${JSON.stringify({
    ...JSON.parse(localCodexManifest),
    version: codexLocalInstallVersion(pluginDefinition.version, falseDigest),
  }, null, 2)}\n`);
  const falseDigestIntegrity = spawnSync(process.execPath, [join(projected.pluginRoot, "scripts", "check-runtime-integrity.mjs")], { encoding: "utf8" });
  assert.notEqual(falseDigestIntegrity.status, 0, "a self-consistent but false source digest must fail integrity");
  writeFileSync(localMarkerPath, localMarker);
  writeFileSync(localCodexManifestPath, localCodexManifest);

  writeFileSync(localCodexManifestPath, `${JSON.stringify({
    ...JSON.parse(localCodexManifest),
    version: `${pluginDefinition.version}+arbitrary-local`,
  }, null, 2)}\n`);
  const arbitrarySuffixIntegrity = spawnSync(process.execPath, [join(projected.pluginRoot, "scripts", "check-runtime-integrity.mjs")], { encoding: "utf8" });
  assert.notEqual(arbitrarySuffixIntegrity.status, 0, "an arbitrary local suffix must fail integrity");
  writeFileSync(localCodexManifestPath, localCodexManifest);

  const codexCalls = [];
  const installed = installCodexGlobalPlugin({
    prepare: (options) => prepareLocalMarketplace({
      ...options,
      dataRoot: marketplaceDataRoot,
      builtPluginRoot,
      codexInstallVersion: localVersion,
    }),
    exec(executable, args) {
      codexCalls.push(`${executable} ${args.join(" ")}`);
      if (args.join(" ") === "plugin marketplace list --json") {
        return JSON.stringify({ marketplaces: [{ name: "agdf", marketplaceSource: { sourceType: "local", source: projected.root } }] });
      }
      if (args.join(" ") === "plugin list") return `agdf@agdf ${localVersion}\n`;
      return "";
    },
  });
  assert.equal(installed.expectedVersion, localVersion);
  assert.equal(installed.canonicalVersion, pluginDefinition.version);
  assert.equal(installed.installedVersion, localVersion);
  assert.equal(installed.evidence.some((item) => item.startsWith("staged_plugin_root:")), true);
  assert.equal(installed.evidence.includes("staged_installation_provenance:matched"), true);
  assert.equal(installed.evidence.some((item) => item.startsWith("installed_plugin_root:")), false, "installer must not claim the host-loaded root from staged evidence");
  assert.equal(codexCalls.includes("codex plugin add agdf@agdf --json"), true);
  assert.equal(inspectPluginSurface("codex", () => `agdf@agdf ${localVersion}\n`, { dataRoot: marketplaceDataRoot }).status, "healthy");
  assert.equal(inspectPluginSurface("codex", () => `agdf@agdf ${localVersion}\n`, { dataRoot: join(fixtureRoot, "missing-marketplace") }).status, "degraded");
  assert.equal(inspectPluginSurface("codex", () => `agdf@agdf ${pluginDefinition.version}+codex.local-ffffffffffff\n`, { dataRoot: marketplaceDataRoot }).status, "degraded");

  let claudeListCalls = 0;
  const claudeInstalled = installClaudeGlobalPlugin({
    prepare: (options) => prepareLocalMarketplace({
      ...options,
      dataRoot: marketplaceDataRoot,
      builtPluginRoot,
      codexInstallVersion: localVersion,
    }),
    exec(executable, args) {
      if (args.join(" ") === "plugin marketplace list --json") {
        return JSON.stringify([{ name: "agdf", source: "directory", path: projected.root, installLocation: projected.root }]);
      }
      if (args.join(" ") === "plugin list") {
        claudeListCalls += 1;
        return `agdf@agdf ${pluginDefinition.version}\n`;
      }
      return "";
    },
  });
  assert.equal(claudeInstalled.installedVersion, pluginDefinition.version);
  assert.equal(claudeListCalls, 2);
  assert.equal(claudeInstalled.evidence.includes("staged_installation_provenance:matched"), true);
  assert.equal(json(join(projected.pluginRoot, ".codex-plugin", "plugin.json")).version, localVersion, "Claude must not replace the shared Codex projection");

  const codexLifecycleOutput = [];
  assert.equal(await runCli(["codex", "--json"], {
    io: { log(value) { codexLifecycleOutput.push(value); }, error(value) { codexLifecycleOutput.push(value); } },
    prepare: (options) => prepareLocalMarketplace({ ...options, dataRoot: marketplaceDataRoot, builtPluginRoot, codexInstallVersion: localVersion }),
    exec(executable, args) {
      if (args.join(" ") === "plugin marketplace list --json") {
        return JSON.stringify({ marketplaces: [{ name: "agdf", marketplaceSource: { sourceType: "local", source: projected.root } }] });
      }
      if (args.join(" ") === "plugin list") return `agdf@agdf ${localVersion}\n`;
      return "";
    },
  }), 0);
  const codexLifecycle = JSON.parse(codexLifecycleOutput.at(-1));
  assert.equal(codexLifecycle.version.expected, localVersion);
  assert.equal(codexLifecycle.restart.required, true);
  assert.match(codexLifecycle.verification.evidence.join("\n"), new RegExp(`canonical_version:${pluginDefinition.version}`));

  const claudeLifecycleOutput = [];
  assert.equal(await runCli(["claude", "--json"], {
    io: { log(value) { claudeLifecycleOutput.push(value); }, error(value) { claudeLifecycleOutput.push(value); } },
    prepare: (options) => prepareLocalMarketplace({ ...options, dataRoot: marketplaceDataRoot, builtPluginRoot, codexInstallVersion: localVersion }),
    exec(executable, args) {
      if (args.join(" ") === "plugin marketplace list --json") {
        return JSON.stringify([{ name: "agdf", source: "directory", path: projected.root, installLocation: projected.root }]);
      }
      if (args.join(" ") === "plugin list") return `agdf@agdf ${pluginDefinition.version}\n`;
      return "";
    },
  }), 0);
  const claudeLifecycle = JSON.parse(claudeLifecycleOutput.at(-1));
  assert.equal(claudeLifecycle.version.expected, pluginDefinition.version);
  assert.equal(claudeLifecycle.restart.required, true);

  const modifiedPluginRoot = join(fixtureRoot, "modified-plugin");
  cpSync(builtPluginRoot, modifiedPluginRoot, { recursive: true });
  writeFileSync(join(modifiedPluginRoot, "LICENSE"), `${readFileSync(join(modifiedPluginRoot, "LICENSE"), "utf8")}\nlocal fixture\n`);
  const modifiedSourceDigest = digestPluginSource(modifiedPluginRoot, pluginDefinition.version);
  const changedProjection = prepareLocalMarketplace({
    dataRoot: marketplaceDataRoot,
    builtPluginRoot: modifiedPluginRoot,
    codexInstallVersion: codexLocalInstallVersion(pluginDefinition.version, modifiedSourceDigest),
  });
  assert.equal(changedProjection.changed, true);
  assert.equal(json(join(changedProjection.pluginRoot, ".claude-plugin", "plugin.json")).version, pluginDefinition.version);
  changedProjection.rollback();

  const packageCalls = [];
  const localPackage = prepareLocalOpenCodePackage({
    dataRoot: join(fixtureRoot, "package-data"),
    packageRoot,
    expectedVersion: pluginDefinition.version,
    exec: packExec("same package\n", packageCalls),
  });
  assert.equal(localPackage.kind, "local_checkout");
  assert.equal(localPackage.version, pluginDefinition.version);
  assert.match(localPackage.digest, /^[a-f0-9]{64}$/);
  assert.match(localPackage.archiveDigest, /^[a-f0-9]{64}$/);
  assert.equal(validateLocalOpenCodePackageSource(localPackage).specifier, localPackage.specifier);
  assert.throws(() => validateLocalOpenCodePackageSource({ ...localPackage, root: dirname(localPackage.root) }), /outside its owned data root/);
  assert.equal(resolveOpenCodeInstallPackageSource(localPackage).specifier, localPackage.specifier);
  assert.equal(resolveOpenCodeInstallPackageSource().specifier, `${pluginDefinition.opencode.npmPackage}@${pluginDefinition.version}`);

  const samePackage = prepareLocalOpenCodePackage({
    dataRoot: join(fixtureRoot, "package-data"),
    packageRoot,
    expectedVersion: pluginDefinition.version,
    exec: packExec("same package\n"),
  });
  assert.equal(samePackage.root, localPackage.root, "same packed content must reuse one durable path");

  const changingPackageRoot = join(fixtureRoot, "changing-package");
  mkdirSync(changingPackageRoot);
  writeFileSync(join(changingPackageRoot, "package.json"), "{\"name\":\"fixture-a\"}\n");
  const changingDataRoot = join(fixtureRoot, "changing-package-data");
  const firstContentPackage = prepareLocalOpenCodePackage({
    dataRoot: changingDataRoot,
    packageRoot: changingPackageRoot,
    expectedVersion: pluginDefinition.version,
    exec: packExec("archive a\n"),
  });
  writeFileSync(join(changingPackageRoot, "package.json"), "{\"name\":\"fixture-b\"}\n");
  const secondContentPackage = prepareLocalOpenCodePackage({
    dataRoot: changingDataRoot,
    packageRoot: changingPackageRoot,
    expectedVersion: pluginDefinition.version,
    exec: packExec("archive b\n"),
  });
  assert.notEqual(firstContentPackage.root, secondContentPackage.root, "changed packed content must receive a new durable path");

  assert.throws(() => prepareLocalOpenCodePackage({
    dataRoot: join(fixtureRoot, "unsafe-package-data"),
    packageRoot,
    expectedVersion: pluginDefinition.version,
    exec: packExec("unsafe\n", [], { filename: "../unsafe.tgz" }),
  }), /unsafe tarball name/);
  assert.throws(() => prepareLocalOpenCodePackage({
    dataRoot: join(fixtureRoot, "failed-package-data"),
    packageRoot,
    expectedVersion: pluginDefinition.version,
    exec() { throw new Error("pack failed"); },
  }), /pack failed/);

  const realPackedPackage = prepareLocalOpenCodePackage({
    dataRoot: join(fixtureRoot, "real-package-data"),
    packageRoot,
    expectedVersion: pluginDefinition.version,
  });
  assert.equal(validateLocalOpenCodePackageSource(realPackedPackage).digest, realPackedPackage.digest);

  const packageMarkerPath = localPackage.markerPath;
  const packageMarker = readFileSync(packageMarkerPath, "utf8");
  writeFileSync(packageMarkerPath, "{}\n");
  assert.throws(() => validateLocalOpenCodePackageSource(localPackage), /unowned/);
  writeFileSync(packageMarkerPath, packageMarker);

  writeFileSync(localPackage.tarball, "tampered\n");
  assert.throws(() => validateLocalOpenCodePackageSource(localPackage), /missing or tampered/);

  assert.deepEqual(localNpmExecutable("linux", "/usr/bin/node"), { executable: "npm", prefix: [] });
  assert.deepEqual(localNpmExecutable("win32", "C:\\Node\\node.exe"), {
    executable: "C:\\Node\\node.exe",
    prefix: ["C:\\Node\\node_modules\\npm\\bin\\npm-cli.js"],
  });

  let cliCalls = 0;
  const orchestrationCalls = [];
  const orchestrationCode = await installLocalPlugin("codex", {
    dataRoot: join(fixtureRoot, "orchestration-data"),
    exec(executable, args) {
      orchestrationCalls.push(`${executable} ${args.join(" ")}`);
      return "";
    },
    async runCli(args, adapters) {
      cliCalls += 1;
      assert.deepEqual(args, ["codex"]);
      const transaction = adapters.prepare();
      assert.equal(transaction.codexInstallVersion, localVersion);
      transaction.rollback();
      return 0;
    },
  });
  assert.equal(orchestrationCode, 0);
  assert.equal(cliCalls, 1);
  assert.match(orchestrationCalls[0], /run release:prepare$/);

  const claudeCode = await installLocalPlugin("claude", {
    dataRoot: join(fixtureRoot, "claude-orchestration-data"),
    exec() { return ""; },
    async runCli(args, adapters) {
      assert.deepEqual(args, ["claude"]);
      const transaction = adapters.prepare();
      assert.equal(transaction.codexInstallVersion, localVersion, "Claude must preserve the shared Codex projection");
      transaction.rollback();
      return 4;
    },
  });
  assert.equal(claudeCode, 4, "the lifecycle exit code must be preserved");

  const openCodeDataRoot = join(fixtureRoot, "opencode orchestration data");
  const openCodeCode = await installLocalPlugin("opencode", {
    dataRoot: openCodeDataRoot,
    exec(executable, args, options) {
      if (args.includes("pack")) return packExec("opencode package\n")(executable, args, options);
      return "";
    },
    async runCli(args, adapters) {
      assert.deepEqual(args, ["opencode"]);
      assert.equal(adapters.openCodePackageSource.dataRoot, openCodeDataRoot);
      assert.equal(isAbsolute(adapters.openCodePackageSource.specifier), true);
      assert.match(adapters.openCodePackageSource.specifier, /opencode orchestration data/);
      return 0;
    },
  });
  assert.equal(openCodeCode, 0);

  let forbiddenCliCalls = 0;
  await assert.rejects(() => installLocalPlugin("claude", {
    exec() { throw new Error("preparation failed"); },
    async runCli() { forbiddenCliCalls += 1; return 0; },
  }), /preparation failed/);
  assert.equal(forbiddenCliCalls, 0, "failed preparation must prevent host lifecycle calls");

  let invalidExecCalls = 0;
  await assert.rejects(() => installLocalPlugin("all", {
    exec() { invalidExecCalls += 1; },
  }), /Unsupported AGDF local install surface/);
  assert.equal(invalidExecCalls, 0, "invalid surfaces must fail before preparation");

  const rootManifest = json(join(repoRoot, "package.json"));
  const packageManifest = json(join(packageRoot, "package.json"));
  for (const surface of ["codex", "claude", "opencode"]) {
    assert.equal(rootManifest.scripts[`install:${surface}`], `npm --prefix create-agdf run install:${surface}`);
    assert.equal(packageManifest.scripts[`install:${surface}`], `node ./scripts/install-local-plugin.js ${surface}`);
  }
  assert.deepEqual(Object.keys(rootManifest.scripts).filter((name) => name.startsWith("install:")).sort(), ["install:claude", "install:codex", "install:opencode"]);
  assert.deepEqual(Object.keys(packageManifest.scripts).filter((name) => name.startsWith("install:")).sort(), ["install:claude", "install:codex", "install:opencode"]);
  const contributing = readFileSync(join(repoRoot, "CONTRIBUTING.md"), "utf8");
  for (const command of ["npm run install:codex", "npm run install:claude", "npm run install:opencode"]) {
    assert.match(contributing, new RegExp(command.replaceAll(":", "\\:")));
  }
  assert.match(contributing, /fresh task/i);
  assert.match(contributing, /Node\.js 18 or later/);
  assert.match(contributing, /restart the selected host/i);
  assert.match(contributing, /does not prove restarted-host loading, repository activation or\s+UAT/i);

  console.log("Local development install tests passed");
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
