import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  MCP_SDK_RUNTIME_ENTRIES,
  digestDirectory,
  digestMcpDispatcherPackage,
  digestMcpSdkRuntime,
} from "../../core/lib/runtime/plugin-provenance.js";
import { readDecisionUiBuild } from '../../../scripts/cockpit-ui-build.mjs';
import { ensurePluginMcpRuntime } from '../../cli/lib/mcp-lifecycle/plugin-runtime.js';
import { offlineNpm } from '../../../scripts/support/plugin-mcp-fixture.js';

const serverSourceRoot = resolve(fileURLToPath(new URL("../", import.meta.url)));
const defaultDispatcherSourceRoot = resolve(fileURLToPath(new URL("../../../dist/npm/create-agdf/", import.meta.url)));
const repositoryRoot = resolve(fileURLToPath(new URL("../../../", import.meta.url)));

// A hermetic control holds only the named runs and the control root files, so measurements do not
// grow with the repository's run history. The legacy AGDF_RUN.md projection points at an unrelated
// run and would report projection drift without it, so it is left out.
function copyHermeticControl(destination, runIds) {
  const source = join(repositoryRoot, ".agdf", "control");
  mkdirSync(destination, { recursive: true });
  for (const area of ['runs','artefacts']) mkdirSync(join(destination,area),{recursive:true});
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    if (entry.isFile() && entry.name !== "AGDF_RUN.md") cpSync(join(source, entry.name), join(destination, entry.name));
  }
  for (const runId of runIds) {
    for (const area of ["runs", "artefacts"]) cpSync(join(source, area, runId), join(destination, area, runId), { recursive: true });
  }
}

export function createOwnedRuntimeFixture({ dispatcherSourceRoot = process.env.AGDF_TEST_CANDIDATE_CLI_ROOT ?? defaultDispatcherSourceRoot,
  candidateServerRoot = process.env.AGDF_TEST_CANDIDATE_MCP_ROOT, controlRuns,
  pluginSourceRoot = process.env.AGDF_TEST_CANDIDATE_PLUGIN_ROOT } = {}) {
  if (pluginSourceRoot) {
    const work = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-plugin-owned-'))), frozen = join(work, 'plugin');
    let failed = false;
    try {
      cpSync(pluginSourceRoot, frozen, { recursive: true });
      const dataRoot = join(work, 'data');
      const runtime = ensurePluginMcpRuntime({ pluginRoot: frozen, dataRoot, exec: offlineNpm });
      const governanceTarget = join(work, 'governance-target');
      mkdirSync(join(governanceTarget,'.git'),{recursive:true});
      writeFileSync(join(governanceTarget,'.git/HEAD'),'ref: refs/heads/main\n');
      if (controlRuns) copyHermeticControl(join(governanceTarget,'.agdf/control'),controlRuns);
      else cpSync(join(repositoryRoot,'.agdf/control'),join(governanceTarget,'.agdf/control'),{recursive:true});
      return Object.freeze({ root:runtime.root, serverRoot:runtime.packageRoot, dispatcherRoot:runtime.dispatcherRoot,
        governanceTarget, command:process.execPath,
        args:[join(frozen,'mcp/agdf-mcp-launch.js'),'--surface','codex','--data',dataRoot],
        onFailure(){failed=true;},
        dispose(){
          if(failed && process.env.AGDF_TEST_EVIDENCE_DIR) {
            mkdirSync(process.env.AGDF_TEST_EVIDENCE_DIR,{recursive:true});
            writeFileSync(join(process.env.AGDF_TEST_EVIDENCE_DIR,`retained-${work.split('/').at(-1)}.json`),JSON.stringify({work,root:runtime.root,governance_target:governanceTarget,native_qualified:false,authorizes:false},null,2)+'\n');
          } else rmSync(work,{recursive:true,force:true});
        } });
    } catch(error) { rmSync(work,{recursive:true,force:true}); throw error; }
  }
  const root = realpathSync(mkdtempSync(join(tmpdir(), "agdf-mcp-owned-")));
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
  if (candidateServerRoot) {
    // Preserve the whole assembled payload, including its license and ownership
    // metadata. Selecting executable entries silently changes package identity.
    cpSync(candidateServerRoot, serverRoot, { recursive: true, filter(source) {
      const relative = source.slice(candidateServerRoot.length).replace(/^[/\\]/u, "");
      return relative !== "node_modules" && !relative.startsWith(`node_modules${process.platform === "win32" ? "\\" : "/"}`);
    } });
  } else {
    for (const entry of ["bin", "src", "package.json", "README.md", "NOTICE"]) {
      cpSync(join(serverSourceRoot, entry), join(serverRoot, entry), { recursive: true });
    }
    mkdirSync(join(serverRoot, 'ui'));
    for (const [name, bytes] of Object.entries(readDecisionUiBuild().files)) writeFileSync(join(serverRoot, 'ui', name), bytes);
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
  for (const name of candidateServerRoot ? [] : ["agdf-plugin.definition.json", "agdf-interaction-locales.json"]) {
    cpSync(
      join(repositoryRoot, "plugins", "agdf", "meta", name),
      join(dispatcherRoot, "generated", "plugins", "agdf", "meta", name),
    );
  }
  const governanceTarget = join(root, "governance-target");
  mkdirSync(join(governanceTarget, ".git"), { recursive: true });
  writeFileSync(join(governanceTarget, ".git", "HEAD"), "ref: refs/heads/main\n", "utf8");
  if (controlRuns) copyHermeticControl(join(governanceTarget, ".agdf", "control"), controlRuns);
  else cpSync(join(repositoryRoot, ".agdf", "control"), join(governanceTarget, ".agdf", "control"), { recursive: true });
  const manifest = JSON.parse(readFileSync(join(serverRoot, "package.json"), "utf8"));
  writeFileSync(join(root, ".agdf-mcp-owned.json"), `${JSON.stringify({
    schema_version: 1,
    owner: "create-agdf:mcp-runtime",
    version: manifest.version,
    node_executable: process.execPath,
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
