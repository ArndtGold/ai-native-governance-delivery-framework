import { readFileSync } from "node:fs";
import process from "node:process";
import { loadCockpitResource } from './cockpit-resource.js';

export async function runMcpServer({ surface, cockpitDir, cockpitMode, runtime, executor, ownedPublication, ownedPublisher, generationTransport, onClosed } = {}) {
  if (cockpitMode !== undefined && (cockpitMode !== 'plugin' || surface !== 'codex' || cockpitDir !== undefined)) throw Error('AGDF_COCKPIT_TARGET_INVALID');
  const defaultRuntime = runtime === undefined && cockpitDir === undefined && cockpitMode === undefined;
  // A supplied, bound runtime owns its resources. Do not load a second package
  // composition merely to run an explicit adapter/protocol fixture.
  const thin = defaultRuntime && !!ownedPublication;
  const dispatcherRuntime = runtime === undefined ? await import(thin ? 'create-agdf/mcp-protocol-runtime' : 'create-agdf/mcp-dispatch-runtime') : null;
  runtime ??= cockpitDir !== undefined || cockpitMode !== undefined ? await dispatcherRuntime.createMcpCockpitRuntime({ surface, cockpitDir, cockpitMode })
    : thin ? dispatcherRuntime.createMcpTransportRuntime({ surface }) : dispatcherRuntime.createMcpDispatchRuntime({ surface });
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
  if (ownedPublication) {
    // The serving protocol factory freshly inspects all selected source and SDK
    // bytes. Bind that actual producer to the parent's claimed expectation;
    // never treat a cross-thread/async observation as fresh inspection evidence.
    const producer = runtime.producerIdentity;
    if (!producer || producer.server_digest !== ownedPublication.digest
      || producer.dispatcher_digest !== ownedPublication.dispatcherDigest || producer.sdk_digest !== ownedPublication.sdkDigest)
      throw Error('AGDF_MCP_FACADE_IDENTITY_INVALID');
  }
  if (defaultRuntime && surface === 'codex') {
    const ui = { uri: dispatcherRuntime.DECISION_UI_URI, mimeType: 'text/html;profile=mcp-app', limit: 4 * 1024 ** 2, kind: 'decision' };
    // The thin front has no session/qualification consumer. Its facade loads
    // the resource for the real generation manifest; full runtimes need it here.
    if (!thin) ui.digest = loadCockpitResource(ui).digest;
    // A shipped resource does not qualify native App-only mediation. Production
    // actions remain disabled until exact package/host evidence is provided.
    runtime = thin ? await dispatcherRuntime.createMcpDecisionTransportRuntime({ runtime, ui })
      : await dispatcherRuntime.createMcpDecisionRuntime({ runtime, ui });
  }
  if (runtime.mode === 'cockpit') loadCockpitResource(runtime.ui);
  let transport;
  if (ownedPublication) {
    const { createOwnedGenerationFacade } = await import('./generation.js');
    if (!ownedPublisher) throw Error('runtime_publication_unowned');
    const publisher = ownedPublisher;
    let beginTransport;
    const claimed = new Promise(resolve => { beginTransport = resolve; });
    const starting = createOwnedGenerationFacade({ runtime, publisher, generationTransport, surface, cockpitDir, cockpitMode,
      onEvent: event => { if (event.kind === 'qualifying') beginTransport(); },
      createControlRuntime: async runtimeControl => {
        const full = thin ? await import('create-agdf/mcp-dispatch-runtime') : dispatcherRuntime;
        return full.createMcpDispatchRuntime({ surface, runtimeControl });
      } });
    // Only a claimed private-generation start releases the SDK import. A
    // pre-claim failure rejects starting without loading transport code. Its full
    // qualification and the facade SDK must both finish before public service.
    // Observe both promises so a transport failure cannot abandon a live child.
    const transportStarting = Promise.race([claimed, starting]).then(() => import('./server.js'));
    const [generation, loaded] = await Promise.allSettled([starting, transportStarting]);
    if (generation.status === 'rejected' || loaded.status === 'rejected') {
      if (generation.status === 'fulfilled') await generation.value.close();
      throw generation.status === 'rejected' ? generation.reason : loaded.reason;
    }
    runtime = generation.value; transport = loaded.value;
  } else transport = await import('./server.js');
  const { createAgdfWorkerExecutor, serveAgdfStdio } = transport;
  const dispatchExecutor = executor ?? (runtime.mode === 'cockpit' ? undefined
    : createAgdfWorkerExecutor(runtime, { releaseOwnedLock: dispatcherRuntime?.releaseAbandonedOwnedLock ?? null }));
  const handle = serveAgdfStdio({
    runtime,
    executor: dispatchExecutor,
    onerror(code) {
      process.stderr.write(`${code}\n`);
    },
  });
  let closing;
  const close = () => closing ??= handle.close().then(result => { onClosed?.(result); return result; });
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
  process.stdin.once("close", close);
  process.stdin.once("end", close);
  if (process.stdin.readableEnded || process.stdin.destroyed) void close();
  return Object.freeze({ close });
}
