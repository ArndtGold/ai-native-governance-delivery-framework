import { readFileSync, appendFileSync, existsSync, unlinkSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import assert from 'node:assert/strict';

const evidenceDir = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(resolve(evidenceDir, 'NATIVE_OBSERVATION.json'), 'utf8'));
const packageDir = dirname(dirname(manifest.runtime.entrypoint));
const modules = resolve(packageDir, '../../');
const { createMcpCockpitRuntime } = await import(pathToFileURL(resolve(modules, 'create-agdf/lib/mcp-dispatch-runtime.js')));
const { runMcpServer } = await import(pathToFileURL(resolve(packageDir, 'src/main.js')));
const events = resolve(evidenceDir, 'NATIVE_PROBE_EVENTS.jsonl');
const arm = resolve(evidenceDir, 'NATIVE_PROBE_BUSY_ONCE');
const invocation = randomUUID();
const runtime = await createMcpCockpitRuntime({ surface: 'codex', cockpitDir: manifest.observation_target });
assert.equal(runtime.trustedContext.provenanceStatus, 'matched');
assert.equal(runtime.trustedContext.expectedVersion, manifest.runtime.version);
const invoke = async (name, input, signal) => {
  const tool = runtime.tools.find(t => t.name === name);
  assert.ok(tool);
  return tool.execute(tool.parse(input), signal);
};
const coreRead = input => invoke('agdf_cockpit_read', input);
function log(event) {
  appendFileSync(events, JSON.stringify({at:new Date().toISOString(),invocation,...event})+'\n');
}
function summary(r) {
  return {
    target:r.target, session:r._meta?.agdf_cockpit?.session_id,
    snapshot:r.snapshot_id,state:r.state,code:r.code,data:r.data?.closed!==undefined?r.data:
      r.data?.completed!==undefined?r.data:r.data?.invalidated!==undefined?r.data:
      r.data?.run?.draft_check ?? null, authorizes:r.authorizes
  };
}
async function reserve() {
  const rendered = await invoke('agdf_cockpit',{run_id:manifest.run_id});
  const session_id=rendered._meta.agdf_cockpit.session_id;
  try {
    let r=await coreRead({operation:'snapshot',session_id,run_id:manifest.run_id});
    assert.equal(r.state,'available');
    const ur=r.data.run.resources.find(x=>x.type==='UR');
    assert.ok(ur);
    r=await coreRead({operation:'document',session_id,run_id:manifest.run_id,snapshot_id:r.snapshot_id,resource_id:ur.resource_id});
    assert.equal(r.state,'available');
    const prepared=await coreRead({operation:'prepare_context',session_id,run_id:manifest.run_id,
      snapshot_id:r.snapshot_id,resource_id:r.data.document.resource.resource_id,
      revision_id:manifest.expected_revision_id,graph_ids:[],excluded_ids:[],generation:1});
    assert.equal(prepared.state,'available');
    log({event:'test_reservation',session_id,core_prepared:true,host_publication:false});
    return session_id;
  } catch(e) {
    await coreRead({operation:'close',session_id}); throw e;
  }
}
async function release(session_id) {
  // This test-owned packet was never published to any host.
  const invalid=await coreRead({operation:'invalidate_context',session_id});
  assert.equal(invalid.state,'available');
  if(invalid.data.host_publication_required) {
    const done=await coreRead({operation:'complete_context_invalidation',session_id,invalidation_id:invalid.data.invalidation_id});
    assert.equal(done.data?.completed,true);
  }
  const closed=await coreRead({operation:'close',session_id});
  assert.equal(closed.data?.closed,true);
  log({event:'test_reservation_released',session_id,closed:true});
}
const executor={
  async execute(input,{toolName,signal}={}) {
    let reserved;
    try {
      if(toolName==='agdf_cockpit_read' && input.operation==='artifact_readiness' && existsSync(arm)) {
        unlinkSync(arm);
        reserved=await reserve();
      }
      const r=await invoke(toolName,input,signal);
      if(reserved) assert.equal(r.code,'busy','The real Core publication guard must produce the transient result');
      log({event:'tool',tool:toolName,input,result:summary(r),actual_core_busy:!!reserved});
      return r;
    } finally { if(reserved) await release(reserved); }
  },
  close:()=>runtime.close?.()
};
log({event:'start',profile:'isolated-native-observation-probe',
  original_runtime:manifest.runtime.entrypoint,ui_digest:manifest.runtime.ui.digest,
  probe_digest:'sha256:'+createHash('sha256').update(readFileSync(fileURLToPath(import.meta.url))).digest('hex'),
  target_id:manifest.target_id,run_id:manifest.run_id,provenance:'matched',authorizes:false});
if(process.argv.includes('--self-test')) {
  const rendered=await invoke('agdf_cockpit',{run_id:manifest.run_id});
  const session_id=rendered._meta.agdf_cockpit.session_id;
  const selected=await coreRead({operation:'snapshot',session_id,run_id:manifest.run_id});
  const request={operation:'artifact_readiness',session_id,snapshot_id:selected.snapshot_id,
    run_id:manifest.run_id,gate:manifest.gate,expected_revision_id:manifest.expected_revision_id};
  assert.equal(existsSync(arm),false);
  writeFileSync(arm,'self-test\n');
  const busy=await executor.execute(request,{toolName:'agdf_cockpit_read'});
  assert.equal(busy.code,'busy');
  assert.equal(existsSync(arm),false);
  const passed=await executor.execute(request,{toolName:'agdf_cockpit_read'});
  assert.equal(passed.data.run.draft_check.display.state,'passed');
  assert.equal(passed.data.run.draft_check.result.authorizes,false);
  const closed=await coreRead({operation:'close',session_id});
  assert.equal(closed.data.closed,true);
  const expired=await coreRead({operation:'freshness',session_id,snapshot_id:passed.snapshot_id});
  assert.equal(expired.code,'session_expired');
  log({event:'self_test',busy:'busy',retry:'passed',closed:true,post_close:'session_expired',proof_level:'Core/runtime preparation; not native UI'});
  await runtime.close();
  process.stdout.write('Native probe preflight: actual Core busy/retry/close/expired passed.\n');
} else {
  await runMcpServer({surface:'codex',cockpitDir:manifest.observation_target,runtime,executor});
}

