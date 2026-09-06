import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MCP_SDK_RUNTIME_ENTRIES,
  digestDirectory,
  digestMcpDispatcherPackage,
  digestMcpSdkRuntime,
} from "../../create-agdf/lib/runtime/plugin-provenance.js";

const serverSourceRoot = resolve(fileURLToPath(new URL("../", import.meta.url)));
const dispatcherSourceRoot = resolve(fileURLToPath(new URL("../../create-agdf/", import.meta.url)));
const repositoryRoot = resolve(fileURLToPath(new URL("../../", import.meta.url)));

export function createOwnedRuntimeFixture() {
  const root = mkdtempSync(join(tmpdir(), "agdf-mcp-owned-"));
  const nodeModules = join(root, "node_modules");
  mkdirSync(nodeModules, { recursive: true });
  for (const entry of MCP_SDK_RUNTIME_ENTRIES) {
    const destination = join(root, entry);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(join(serverSourceRoot, entry), destination, { recursive: true, dereference: true });
  }
  const serverRoot = join(nodeModules, "@agdf", "mcp-server");
  rmSync(serverRoot, { recursive: true, force: true });
  mkdirSync(serverRoot, { recursive: true });
  for (const entry of ["bin", "src", "package.json", "README.md", "NOTICE"]) {
    cpSync(join(serverSourceRoot, entry), join(serverRoot, entry), { recursive: true });
  }
  const dispatcherRoot = join(nodeModules, "create-agdf");
  rmSync(dispatcherRoot, { recursive: true, force: true });
  cpSync(dispatcherSourceRoot, dispatcherRoot, {
    recursive: true,
    filter(source) {
      const relative = source.slice(dispatcherSourceRoot.length).replace(/^[/\\]/u, "");
      return relative !== "node_modules" && !relative.startsWith(`node_modules${process.platform === "win32" ? "\\" : "/"}`);
    },
  });
  for (const name of ["agdf-plugin.definition.json", "agdf-interaction-locales.json"]) {
    cpSync(
      join(repositoryRoot, "plugin", "meta", name),
      join(dispatcherRoot, "generated", "plugins", "agdf", "meta", name),
    );
  }
  const governanceTarget = join(root, "governance-target");
  mkdirSync(join(governanceTarget, ".git"), { recursive: true });
  writeFileSync(join(governanceTarget, ".git", "HEAD"), "ref: refs/heads/main\n", "utf8");
  cpSync(join(repositoryRoot, ".agdf", "control"), join(governanceTarget, ".agdf", "control"), { recursive: true });
  const manifest = JSON.parse(readFileSync(join(serverRoot, "package.json"), "utf8"));
  writeFileSync(join(root, ".agdf-mcp-owned.json"), `${JSON.stringify({
    schema_version: 1,
    owner: "create-agdf:mcp-runtime",
    version: manifest.version,
    server_digest: digestDirectory(serverRoot),
    dispatcher_digest: digestMcpDispatcherPackage(dispatcherRoot),
    sdk_digest: digestMcpSdkRuntime(root),
    references: [],
  }, null, 2)}\n`);
  return Object.freeze({
    root,
    serverRoot,
    dispatcherRoot,
    governanceTarget,
    command: process.execPath,
    args: [join(serverRoot, "bin", "agdf-mcp.js"), "--surface", "codex"],
    dispose() { rmSync(root, { recursive: true, force: true }); },
  });
}
