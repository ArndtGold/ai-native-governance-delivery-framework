// A directly owned private child. It never reads or writes public MCP STDIO.
import process from 'node:process';
import { createAgdfWorkerExecutor } from './server.js';
import { loadCockpitResource } from './cockpit-resource.js';
import { generationMessage, validGenerationMessage, generationManifest, generationFailureReason } from './generation-protocol.js';
import { createMcpDispatchRuntime, createMcpDecisionRuntime, createMcpCockpitRuntime, DECISION_UI_URI,
  inspectMcpDispatcherRuntime, releaseAbandonedOwnedLock } from 'create-agdf/mcp-dispatch-runtime';
const epoch = process.argv[2], generation = Number(process.argv[3]);
let runtime, executor, starting = false, closing = false, inflight = 0, serverDigest, sdkDigest, uiDigest;
const observed = new Set(), unknown = new Set();
function status() {
  const owned = runtime?.inspectOwnership?.() ?? { views: 0 };
  return { ...owned, inflight: inflight + (starting ? 1 : 0) + (owned.inflight ?? 0),
    executor: executor?.active ? 1 : 0, uncertain: unknown.size + (owned.uncertain ?? 0), closing };
}
function send(input, kind, payload) {
  const reply = generationMessage(epoch, generation, kind, payload, {}, input.original_operation_id, input.request_id);
  if (validGenerationMessage(reply, { epoch, generation, reply: true })) process.send?.(reply);
  else process.send?.(generationMessage(epoch, generation, 'failure', { reason: 'generation_result_limit' }, {}, input.original_operation_id, input.request_id));
}
process.on('message', async input => {
  if (!validGenerationMessage(input, { epoch, generation }) || observed.has(input.request_id)) return;
  if (observed.size >= 8192) { send(input, 'failure', { reason: 'generation_request_capacity' }); return; }
  observed.add(input.request_id);
  try {
    if (input.kind === 'qualify') {
      if (runtime || starting || closing) throw Error('generation_already_initialized');
      starting = true;
      const { surface, commandGroups, cockpitDir } = input.payload;
      const inspected = inspectMcpDispatcherRuntime();
      if (inspected.provenanceStatus !== 'matched') throw Error('runtime_provenance_invalid');
      runtime = cockpitDir ? await createMcpCockpitRuntime({ surface, cockpitDir, inspected })
        : createMcpDispatchRuntime({ surface, commandGroups, inspected });
      if (!cockpitDir && surface === 'codex') {
        const ui = { uri: DECISION_UI_URI, mimeType: 'text/html;profile=mcp-app', limit: 4 * 1024 ** 2, kind: 'decision' };
        ui.digest = loadCockpitResource(ui).digest;
        runtime = await createMcpDecisionRuntime({ runtime, ui });
      }
      if (runtime.ui) uiDigest = loadCockpitResource(runtime.ui).digest;
      // Inspect reports package-owned immutable identities, not caller evidence.
      sdkDigest = inspected.generationIdentity.sdk_digest; serverDigest = inspected.generationIdentity.server_digest;
      executor = runtime.mode === 'cockpit' ? null : createAgdfWorkerExecutor(runtime, { releaseOwnedLock: releaseAbandonedOwnedLock });
      const support = { ui: Boolean(runtime.ui), app_mediation: runtime.mode === 'decision'
        && runtime.trustedContext.decisionQualification(input.context.client, uiDigest) === true };
      starting = false;
      send(input, 'qualified', { manifest: generationManifest(runtime, uiDigest, sdkDigest),
        producer: { server_digest: serverDigest, dispatcher_digest: inspected.generationIdentity.dispatcher_digest, sdk_digest: sdkDigest }, support });
    } else if (input.kind === 'session_inspect') {
      send(input, 'status', status());
    } else if (input.kind === 'shutdown') {
      if (closing || starting || inflight || unknown.size) throw Error('generation_work_protected');
      closing = true;
      await executor?.close(); await runtime?.close?.();
      const remaining = status();
      if (remaining.views || remaining.inflight || remaining.executor || remaining.uncertain) throw Error('generation_cleanup_unconfirmed');
      send(input, 'closed', remaining);
      process.disconnect(); // Natural exit, no kill, after all owned work is closed.
    } else {
      if (!runtime || closing) throw Error('generation_unavailable');
      const { name, arguments: args } = input.payload, tool = runtime.tool?.(name) ?? runtime.tools.find(t => t.name === name);
      if (!tool || tool.requiresUi && input.context.uiSupported !== true) throw Error('resource_denied');
      ++inflight;
      let result;
      try {
        result = tool.parentOwned || !executor ? await tool.execute(tool.parse(args), undefined, input.context)
          : await executor.execute(args, { toolName: name });
        if (runtime.postprocessToolResult) result = await runtime.postprocessToolResult(name, args, result, input.context);
        if (input.original_operation_id && result.outcome === 'effect_unknown') unknown.add(input.original_operation_id);
        if (name === 'agdf_inspect' && args.operation === 'operation-status' && result.report?.status === 'recorded'
          && result.report.receipt?.operation_id === args.module) unknown.delete(args.module);
        send(input, 'result', result);
      } catch (error) {
        if (input.original_operation_id && error.dispatch !== 'not_dispatched') unknown.add(input.original_operation_id);
        send(input, 'result', runtime.failure(error.code ?? error.message ?? 'dispatch_worker_failed', name, args,
          { dispatch: error.dispatch ?? 'unknown' }));
      } finally { --inflight; }
    }
  } catch (error) { if (input.kind === 'qualify') starting = false; send(input, 'failure', { reason: generationFailureReason(error) }); }
});
process.on('disconnect', () => {
  // Loss of the facade does not cancel or replay business effects. Timers and
  // existing worker/view owners retain their bounds; no process-wide force kill.
  if (!closing) { void executor?.close().catch(() => {}); void runtime?.close?.().catch(() => {}); }
});
