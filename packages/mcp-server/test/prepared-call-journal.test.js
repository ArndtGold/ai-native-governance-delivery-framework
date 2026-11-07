import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { createPreparedCallTransport } from '../src/prepared-call-transport.js';
import { createPreparedCallJournal, inspectPreparedCallJournals, retirePreparedCallJournals } from '../../cli/lib/mcp-lifecycle/prepared-call-journal.js';
import { inspectPluginMcpDataRoot, retirePluginMcpDataRoot } from '../../cli/lib/mcp-lifecycle/plugin-runtime.js';
import { MCP_DISPATCHER_RUNTIME_ENTRIES, mcpDispatcherRuntimeEntries, digestMcpDispatcherPackage } from '../../core/lib/runtime/plugin-provenance.js';

const work = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-prepared-journal-')));
const identity = { surface: 'codex', version: '0.30.0', server_digest: '1'.repeat(64), dispatcher_digest: '2'.repeat(64), sdk_digest: '3'.repeat(64) };
const call = { tool: 'agdf_record', arguments: { working_directory: '/synthetic/project', primary_target: '/synthetic/project', target_source: 'explicit_target',
  target_id: 'immutable-target', run_id: 'immutable-run', expected_revision_id: 'immutable-revision',
  operation_id: '00000000-0000-4000-8000-000000000001', command: { kind: 'material.stage', payload: { action: 'put', files: [{ slot: 'UX Intent Definition' }] } } } };
const read = { tool: 'agdf_inspect', arguments: { operation: 'operation-status', working_directory: '/synthetic/project', primary_target: '/synthetic/project',
  target_source: 'explicit_target', run_id: 'immutable-run', expected_revision_id: 'immutable-revision', module: call.arguments.operation_id } };
const required = ['/command/payload/files/0/content'];
const original = { material_call: { call, required_inputs: required }, next_calls: [read] };
const options = publisherRoot => ({ publisherRoot, identity });
const make = (publisherRoot, extra = {}) => createPreparedCallTransport({ store: createPreparedCallJournal({ ...options(publisherRoot), ...extra }), validateRead: () => true, ...extra });
function files(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(join(root, entry.name)) : [join(root, entry.name)]);
}
const journalUrl = new URL('../../cli/lib/mcp-lifecycle/prepared-call-journal.js', import.meta.url).href;
const transportUrl = new URL('../src/prepared-call-transport.js', import.meta.url).href;
const program = `import {createPreparedCallJournal} from ${JSON.stringify(journalUrl)};
  import {createPreparedCallTransport} from ${JSON.stringify(transportUrl)};
  const {root,identity,original,maxEntries}=JSON.parse(process.argv[1]);
  const store=createPreparedCallJournal({publisherRoot:root,identity,...(maxEntries?{maxEntries}:{})});
  const transport=createPreparedCallTransport({store,validateRead:()=>true});
  console.log(JSON.stringify(transport.decorate(original)));transport.close();`;
try {
  // Selecting consumer bytes, not existence of the new helper, define the
  // immutable image. Historical digests ignore the unrelated extra file.
  const historical = join(work, 'historical-dispatcher'), journalEntry = 'lib/mcp-lifecycle/prepared-call-journal.js';
  for (const entry of MCP_DISPATCHER_RUNTIME_ENTRIES.filter(value => value !== journalEntry)) {
    const target = join(historical, entry);
    if (/\.(?:js|json)$/u.test(entry)) { mkdirSync(dirname(target), { recursive: true }); writeFileSync(target, 'historical fixture\n'); }
    else { mkdirSync(target, { recursive: true }); writeFileSync(join(target, 'fixture.txt'), 'historical fixture\n'); }
  }
  writeFileSync(join(historical, 'package.json'), JSON.stringify({ name: 'create-agdf', version: identity.version,
    exports: { './mcp-worker-runtime': './lib/mcp-worker-runtime.js', './mcp-owner-protocol': './lib/mcp-owner-protocol.js' } }));
  writeFileSync(join(historical, 'lib/mcp-dispatch-runtime.js'), "import './mcp-protocol-runtime.js';\n");
  writeFileSync(join(historical, 'lib/mcp-protocol-runtime.js'), 'const resolveMcpInput = true;\n');
  const packageSource = join(historical, 'lib/mcp-lifecycle/package.js');
  writeFileSync(packageSource, 'export const historical = true;\n');
  const oldEntries = mcpDispatcherRuntimeEntries(historical), oldDigest = digestMcpDispatcherPackage(historical);
  assert.ok(!oldEntries.includes(journalEntry));
  writeFileSync(join(historical, journalEntry), 'export const journal = true;\n');
  assert.equal(digestMcpDispatcherPackage(historical), oldDigest, 'Unselected new files do not migrate historical owned digests.');
  writeFileSync(packageSource, "import { journal } from './prepared-call-journal.js';\n");
  assert.ok(mcpDispatcherRuntimeEntries(historical).includes(journalEntry));
  const newDigest = digestMcpDispatcherPackage(historical);
  assert.notEqual(newDigest, oldDigest);
  rmSync(join(historical, journalEntry));
  assert.ok(mcpDispatcherRuntimeEntries(historical).includes(journalEntry), 'Deleting a required dependency never selects a historical image.');
  assert.throws(() => digestMcpDispatcherPackage(historical), /ENOENT/);

  const dataRoot = join(work, 'data'); mkdirSync(dataRoot, { mode: 0o700 });
  const publisherRoot = join(dataRoot, 'mcp'); mkdirSync(publisherRoot, { mode: 0o700 });
  make(publisherRoot);
  assert.deepEqual(readdirSync(publisherRoot), [], 'Constructing a store/server creates no persistent state.');
  const unknown = { prepared_call_id: '00000000-0000-4000-8000-000000000099', inputs: {} };
  assert.throws(() => make(publisherRoot).resolve('agdf_record', unknown), /prepared_call_unknown/);
  assert.deepEqual(readdirSync(publisherRoot), [], 'An unknown lookup does not create journal state.');

  // Process one exits completely after offering both exact calls. Process two
  // recreates all memory and restores the same IDs, bindings, UUID and inputs.
  const offered = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '--eval', program,
    JSON.stringify({ root: publisherRoot, identity, original })], { encoding: 'utf8' }));
  const resumed = make(publisherRoot), content = 'AUTHORED_INPUT_NOT_PERSISTED_`Approval`_😀';
  const args = { ...offered.material_call.call.arguments, inputs: { content } };
  assert.deepEqual(resumed.resolve('agdf_record', args), { ...call.arguments,
    command: { ...call.arguments.command, payload: { action: 'put', files: [{ slot: 'UX Intent Definition', content }] } } });
  assert.deepEqual(resumed.resolve('agdf_inspect', offered.next_calls[0].arguments), read.arguments);
  assert.deepEqual(resumed.resolve('agdf_record', args), resumed.resolve('agdf_record', args), 'Exact retries retain the original operation.');
  assert.throws(() => resumed.resolve('agdf_approve', args), /command_schema_invalid/);
  assert.throws(() => resumed.resolve('agdf_record', { ...args, expected_revision_id: 'new' }), /command_schema_invalid/);
  assert.throws(() => resumed.resolve('agdf_record', { ...args, inputs: { content, run_id: 'another' } }), /command_schema_invalid/);
  assert.ok(files(publisherRoot).every(file => !readFileSync(file).includes(Buffer.from(content))), 'Supplied author/review/reply inputs are never stored.');
  assert.equal(inspectPreparedCallJournals(publisherRoot), 'owned');
  assert.equal(inspectPluginMcpDataRoot(dataRoot), 'owned');
  const otherSurface = createPreparedCallTransport({ store: createPreparedCallJournal({ publisherRoot, identity: { ...identity, surface: 'claude' } }) });
  assert.throws(() => otherSurface.resolve('agdf_record', args), /prepared_call_unknown/);
  for (const surface of ['copilot', 'opencode']) {
    const surfaceStore = createPreparedCallJournal({ publisherRoot, identity: { ...identity, surface } });
    assert.equal(surfaceStore.load(offered.material_call.call.arguments.prepared_call_id).state, 'reference_unknown', 'Existing factory surfaces remain separate; construction grants no host qualification.');
  }
  const otherRuntime = createPreparedCallTransport({ store: createPreparedCallJournal({ publisherRoot, identity: { ...identity, server_digest: '4'.repeat(64) } }) });
  assert.throws(() => otherRuntime.resolve('agdf_record', args), /prepared_call_unknown/);
  resumed.close(); assert.deepEqual(make(publisherRoot).resolve('agdf_record', args), { ...call.arguments,
    command: { ...call.arguments.command, payload: { action: 'put', files: [{ slot: 'UX Intent Definition', content }] } } });
  const generations = join(publisherRoot, 'generations'); mkdirSync(generations);
  const journalSnapshot = () => Object.fromEntries(files(join(publisherRoot, 'prepared-calls')).sort().map(file => [file,
    createHash('sha256').update(readFileSync(file)).digest('hex')]));
  const beforeConcurrentWrite = make(publisherRoot).resolve('agdf_record', args);
  const beforeConcurrentPreparation = journalSnapshot();
  assert.throws(() => retirePreparedCallJournals(publisherRoot), /AGDF_MCP_RUNTIME_RETAINED/,
    'A newly recreated generations directory conservatively retains journal bytes even before its preparer publishes a runtime.');
  assert.deepEqual(journalSnapshot(), beforeConcurrentPreparation, 'The under-lock retirement check precedes the first journal deletion.');
  assert.deepEqual(make(publisherRoot).resolve('agdf_inspect', offered.next_calls[0].arguments), read.arguments,
    'The resumed owner can still resolve its original read reference after refused cleanup.');
  assert.deepEqual(make(publisherRoot).resolve('agdf_record', args), beforeConcurrentWrite,
    'The original write reference retains every binding and UUID after refused cleanup.');
  rmdirSync(generations);
  assert.equal(retirePluginMcpDataRoot(dataRoot), true, 'Normal uninstall removes only verified owned journals after retiring runtimes.');
  assert.equal(existsSync(dataRoot), false);

  // Cleanup covers every verified namespace (e.g. old and new runtime after an
  // upgrade) and a root whose first namespace never fit the byte budget.
  const multiData = join(work, 'multi-data'); mkdirSync(multiData, { mode: 0o700 });
  const multiPublisher = join(multiData, 'mcp'); mkdirSync(multiPublisher, { mode: 0o700 });
  for (const server_digest of ['4'.repeat(64), '5'.repeat(64)])
    assert.ok(createPreparedCallTransport({ store: createPreparedCallJournal({ publisherRoot: multiPublisher, identity: { ...identity, server_digest } }) })
      .decorate({ material_call: original.material_call }).material_call.call);
  assert.equal(readdirSync(join(multiPublisher, 'prepared-calls')).length, 3, 'Two namespaces plus the owner marker.');
  assert.equal(inspectPluginMcpDataRoot(multiData), 'owned');
  assert.equal(retirePluginMcpDataRoot(multiData), true, 'Every verified namespace and the owner marker are removed together.');
  assert.equal(existsSync(multiData), false);
  const emptyData = join(work, 'empty-data'); mkdirSync(emptyData, { mode: 0o700 });
  const emptyPublisher = join(emptyData, 'mcp'); mkdirSync(emptyPublisher, { mode: 0o700 });
  assert.equal(createPreparedCallTransport({ store: createPreparedCallJournal({ publisherRoot: emptyPublisher, identity, maxBytes: 64 }) })
    .decorate({ material_call: original.material_call }).material_call.call, null);
  assert.deepEqual(readdirSync(join(emptyPublisher, 'prepared-calls')), ['owner.json'], 'Only the owned root marker was published.');
  assert.equal(retirePluginMcpDataRoot(emptyData), true, 'An owned root without namespaces is removed as well.');
  assert.equal(existsSync(emptyData), false);

  // The original issue time survives reconnect; a reconnect never restarts TTL.
  const expiryRoot = join(work, 'expiry'); mkdirSync(expiryRoot, { mode: 0o700 }); let time = 1000;
  const expiring = make(expiryRoot, { now: () => time, lifetimeMs: 10, maxEntries: 1 });
  const first = expiring.decorate({ material_call: original.material_call }).material_call.call;
  const secondCall = structuredClone(call); secondCall.arguments.operation_id = '00000000-0000-4000-8000-000000000002';
  const full = make(expiryRoot, { now: () => time, lifetimeMs: 10, maxEntries: 1 }).decorate({ material_call: { call: secondCall, required_inputs: required } });
  assert.equal(full.material_call.call, null, 'A new connection cannot evade the global store capacity.');
  time = 1010;
  assert.throws(() => make(expiryRoot, { now: () => time, lifetimeMs: 10, maxEntries: 1 }).resolve('agdf_record', { ...first.arguments, inputs: { content } }), /session_expired/);
  const replacement = make(expiryRoot, { now: () => time, lifetimeMs: 10, maxEntries: 1 }).decorate({ material_call: { call: secondCall, required_inputs: required } });
  assert.ok(replacement.material_call.call.arguments.prepared_call_id);
  assert.equal(files(expiryRoot).filter(file => file.endsWith(first.arguments.prepared_call_id + '.json')).length, 1, 'Bounded signed expiry tombstones distinguish expired from unknown.');

  // Independent publishers contend for one bounded namespace; only two active
  // slots can be offered even though each process starts with an empty Map.
  const concurrentRoot = join(work, 'concurrent'); mkdirSync(concurrentRoot, { mode: 0o700 });
  const runs = Array.from({ length: 5 }, (_, index) => new Promise((resolve, reject) => {
    const each = structuredClone(original.material_call); each.call.arguments.operation_id = `00000000-0000-4000-8000-${String(index + 11).padStart(12, '0')}`;
    const child = spawn(process.execPath, ['--input-type=module', '--eval', program,
      JSON.stringify({ root: concurrentRoot, identity, maxEntries: 2, original: { material_call: each } })], { stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '', error = ''; child.stdout.on('data', bytes => { output += bytes; }); child.stderr.on('data', bytes => { error += bytes; });
    child.once('error', reject); child.once('exit', code => code === 0 ? resolve(JSON.parse(output)) : reject(Error(error)));
  }));
  const competing = await Promise.all(runs);
  assert.equal(competing.filter(row => row.material_call.call).length, 2);
  assert.equal(competing.filter(row => row.material_call.state === 'transport_unavailable').length, 3);

  // Corruption refuses restoration and new offers without hiding a completed
  // outer operation. Its exact recovery template remains available as data.
  const entry = files(concurrentRoot).find(file => /[0-9a-f-]{36}\.json$/u.test(file));
  const before = JSON.parse(readFileSync(entry)); before.value += 'tamper'; writeFileSync(entry, JSON.stringify(before));
  const broken = make(concurrentRoot);
  assert.throws(() => broken.resolve('agdf_record', { prepared_call_id: before.id, inputs: { content } }), /runtime_provenance_invalid/);
  const receipt = broken.decorate({ outcome: 'accepted', operation_id: 'successful-original-receipt', material_call: original.material_call });
  assert.equal(receipt.outcome, 'accepted'); assert.equal(receipt.operation_id, 'successful-original-receipt');
  assert.equal(receipt.material_call.call, null); assert.equal(receipt.material_call.transport_reason, 'runtime_provenance_invalid');
  assert.deepEqual(receipt.material_call.recovery_only.original_call, call);
  assert.equal(inspectPreparedCallJournals(concurrentRoot), 'foreign');
  const foreign = join(work, 'foreign'); mkdirSync(foreign, { mode: 0o700 });
  const linkRoot = join(work, 'linked'); mkdirSync(linkRoot, { mode: 0o700 });
  symlinkSync(foreign, join(linkRoot, 'prepared-calls'), process.platform === 'win32' ? 'junction' : 'dir');
  const denied = make(linkRoot).decorate({ material_call: original.material_call });
  assert.equal(denied.material_call.call, null); assert.equal(denied.material_call.transport_reason, 'runtime_provenance_invalid');
  assert.deepEqual(readdirSync(foreign), [], 'Foreign symlink targets are neither adopted nor written.');

  // Publish initialization directories atomically. A failed initializer cannot
  // strand a partial visible namespace or adopt a pre-existing foreign folder.
  for (const point of ['root_staged', 'namespace_staged']) {
    const faultRoot = join(work, point); mkdirSync(faultRoot, { mode: 0o700 });
    const interrupted = make(faultRoot, { checkpoint: stage => { if (stage === point) throw Error('synthetic_initializer_fault'); } })
      .decorate({ outcome: 'accepted', operation_id: 'receipt-before-store-fault', material_call: original.material_call });
    assert.equal(interrupted.outcome, 'accepted'); assert.equal(interrupted.operation_id, 'receipt-before-store-fault');
    assert.equal(interrupted.material_call.call, null); assert.equal(interrupted.material_call.transport_reason, 'prepared_call_store_unavailable');
    assert.ok(!readdirSync(faultRoot).some(name => name.startsWith('.agdf-prepared-stage-')), 'Only our freshly owned stage is rolled back.');
    assert.ok(make(faultRoot).decorate({ material_call: original.material_call }).material_call.call, 'A normal retry can publish the missing complete namespace.');
  }
  const foreignData = join(work, 'foreign-data'); mkdirSync(foreignData, { mode: 0o700 });
  const foreignPublisher = join(foreignData, 'mcp'); mkdirSync(foreignPublisher, { mode: 0o700 });
  mkdirSync(join(foreignPublisher, 'prepared-calls'), { mode: 0o700 });
  writeFileSync(join(foreignPublisher, 'prepared-calls/foreign.txt'), 'retain this unrelated file', { mode: 0o600 });
  const refused = make(foreignPublisher).decorate({ material_call: original.material_call });
  assert.equal(refused.material_call.call, null); assert.equal(inspectPluginMcpDataRoot(foreignData), 'foreign');
  assert.throws(() => retirePluginMcpDataRoot(foreignData), /AGDF_MCP_RUNTIME_RETAINED/);
  assert.equal(readFileSync(join(foreignPublisher, 'prepared-calls/foreign.txt'), 'utf8'), 'retain this unrelated file');

  // Bound candidate churn as well as rows. Keep all still-live candidate
  // references; only verified old namespaces past the tombstone horizon retire.
  const churn = join(work, 'candidate-churn'); mkdirSync(churn, { mode: 0o700 }); let clock = 2000;
  for (let index = 0; index < 16; index++) {
    const store = createPreparedCallJournal({ publisherRoot: churn, identity: { ...identity, server_digest: index.toString(16).padStart(64, '0') }, now: () => clock });
    const current = createPreparedCallTransport({ store, now: () => clock }).decorate({ material_call: original.material_call });
    assert.ok(current.material_call.call, 'Each bounded candidate namespace is published before its first offer.');
  }
  const nextIdentity = { ...identity, server_digest: 'f'.repeat(64) };
  const blockedChurn = createPreparedCallTransport({ store: createPreparedCallJournal({ publisherRoot: churn, identity: nextIdentity, now: () => clock }), now: () => clock });
  assert.equal(blockedChurn.decorate({ material_call: original.material_call }).material_call.call, null);
  assert.equal(readdirSync(join(churn, 'prepared-calls')).length, 17, 'The seventeenth live namespace is not created.');
  clock += 2 * 30 * 60_000;
  assert.ok(blockedChurn.decorate({ material_call: original.material_call }).material_call.call, 'Verified namespaces beyond both lifetimes can be pruned.');
  assert.equal(readdirSync(join(churn, 'prepared-calls')).length, 2);

  const byteRoot = join(work, 'byte-budget'); mkdirSync(byteRoot, { mode: 0o700 });
  const byteStore = createPreparedCallJournal({ publisherRoot: byteRoot, identity, maxBytes: 1800 });
  const byteTransport = createPreparedCallTransport({ store: byteStore });
  const byteRef = byteTransport.decorate({ material_call: original.material_call }).material_call.call;
  assert.ok(byteRef, 'The first real template fits the deliberately narrowed global byte budget.');
  const overflowBytes = createPreparedCallTransport({ store: createPreparedCallJournal({ publisherRoot: byteRoot,
    identity: { ...identity, server_digest: 'f'.repeat(64) }, maxBytes: 1800 }) });
  assert.equal(overflowBytes.decorate({ material_call: original.material_call }).material_call.call, null,
    'Another runtime namespace cannot evade the global byte budget.');
  assert.deepEqual(byteTransport.resolve('agdf_record', { ...byteRef.arguments, inputs: { content } }), { ...call.arguments,
    command: { ...call.arguments.command, payload: { action: 'put', files: [{ slot: 'UX Intent Definition', content }] } } }, 'A full budget never evicts a still-live call.');

  const hardKillData = join(work, 'kill-data'); mkdirSync(hardKillData, { mode: 0o700 });
  const hardKillRoot = join(hardKillData, 'mcp'); mkdirSync(hardKillRoot, { mode: 0o700 });
  const killProgram = `import {createPreparedCallJournal} from ${JSON.stringify(journalUrl)};
    import {createPreparedCallTransport} from ${JSON.stringify(transportUrl)};
    const {root,identity,original}=JSON.parse(process.argv[1]);
    const store=createPreparedCallJournal({publisherRoot:root,identity,checkpoint(point){if(point==='namespace_staged'){process.send({ready:true});Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,30000);}}});
    createPreparedCallTransport({store}).decorate(original);`;
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--input-type=module', '--eval', killProgram,
      JSON.stringify({ root: hardKillRoot, identity, original: { material_call: original.material_call } })], { stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(Error('initialization_kill_fixture_not_ready')); }, 10000);
    child.once('message', () => child.kill('SIGKILL')); child.once('error', reject);
    child.once('exit', (code, signal) => { clearTimeout(timer); assert.ok(signal === 'SIGKILL' || process.platform === 'win32'); resolve(); });
  });
  const stranded = readdirSync(hardKillRoot).filter(name => name.startsWith('.agdf-prepared-stage-'));
  assert.equal(stranded.length, 1);
  assert.ok(make(hardKillRoot).decorate({ material_call: original.material_call }).material_call.call,
    'A killed unpublished sibling stage cannot prevent publishing the real namespace after the verified dead lock is reclaimed.');
  assert.equal(inspectPluginMcpDataRoot(hardKillData), 'foreign', 'Unconfirmed crash remnants retain data for deliberate inspection.');
  assert.throws(() => retirePluginMcpDataRoot(hardKillData), /AGDF_MCP_RUNTIME_RETAINED/);
  assert.ok(existsSync(join(hardKillRoot, stranded[0])), 'No speculative cleanup of a prior process stage.');
  console.log('Prepared call journal: process resumption, exact bindings, no saved inputs, TTL/capacity, concurrency, corruption, receipt preservation and owned cleanup passed.');
} finally { rmSync(work, { recursive: true, force: true }); }
