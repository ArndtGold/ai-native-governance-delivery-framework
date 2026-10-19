import { readFileSync } from "node:fs";
import process from "node:process";
import { createAgdfWorkerExecutor, serveAgdfStdio } from "./server.js";
import { loadCockpitResource } from './cockpit-resource.js';

export async function runMcpServer({ surface, cockpitDir, cockpitMode, runtime, executor, ownedPublication, ownedPublisher } = {}) {
  if (cockpitMode !== undefined && (cockpitMode !== 'plugin' || surface !== 'codex' || cockpitDir !== undefined)) throw Error('AGDF_COCKPIT_TARGET_INVALID');
  const defaultRuntime = runtime === undefined && cockpitDir === undefined && cockpitMode === undefined;
  // A supplied, bound runtime owns its resources. Do not load a second package
  // composition merely to run an explicit adapter/protocol fixture.
  const dispatcherRuntime = runtime === undefined ? await import('create-agdf/mcp-dispatch-runtime') : null;
  runtime ??= cockpitDir !== undefined || cockpitMode !== undefined ? await dispatcherRuntime.createMcpCockpitRuntime({ surface, cockpitDir, cockpitMode }) : dispatcherRuntime.createMcpDispatchRuntime({ surface });
  const serverVersion = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
  if (runtime.trustedContext.expectedVersion !== serverVersion) {
    process.stderr.write("AGDF_MCP_VERSION_MISMATCH\n");
    process.exitCode = 1;
    return null;
  }
  if (runtime.trustedContext.provenanceStatus !== "matched") {
    process.stderr.write("AGDF_MCP_RUNTIME_PROVENANCE_INVALID\n");
    process.exitCode = 1;
    return null;
  }
  if (defaultRuntime && surface === 'codex' && dispatcherRuntime?.createMcpDecisionRuntime) {
    const ui = { uri: dispatcherRuntime.DECISION_UI_URI, mimeType: 'text/html;profile=mcp-app', limit: 4 * 1024 ** 2, kind: 'decision' };
    ui.digest = loadCockpitResource(ui).digest;
    // A shipped resource does not qualify native App-only mediation. Production
    // actions remain disabled until exact package/host evidence is provided.
    runtime = await dispatcherRuntime.createMcpDecisionRuntime({ runtime, ui });
  }
  if (runtime.mode === 'cockpit') loadCockpitResource(runtime.ui);
  if (ownedPublication) {
    const { createOwnedGenerationFacade } = await import('./generation.js');
    if (!ownedPublisher) throw Error('runtime_publication_unowned');
    const publisher = ownedPublisher;
    runtime = await createOwnedGenerationFacade({ runtime, publisher, surface, cockpitDir, cockpitMode,
      createControlRuntime: runtimeControl => dispatcherRuntime.createMcpDispatchRuntime({ surface, runtimeControl }) });
  }
  const dispatchExecutor = executor ?? (runtime.mode === 'cockpit' ? undefined
    : createAgdfWorkerExecutor(runtime, { releaseOwnedLock: dispatcherRuntime?.releaseAbandonedOwnedLock ?? null }));
  const handle = serveAgdfStdio({
    runtime,
    executor: dispatchExecutor,
    onerror(code) {
      process.stderr.write(`${code}\n`);
    },
  });
  const close = async () => {
    await handle.close();
  };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
  process.stdin.once("close", close);
  return handle;
}
