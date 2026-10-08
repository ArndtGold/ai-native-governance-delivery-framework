import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fixture, treeBytes } from './control-cockpit-fixtures.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { parseCockpitArguments } from '../lib/control-inspect/cockpit-contract.js';

const storedFacts = data => ({ ...data, entries: data.entries.map(({ row_id, ...facts }) => facts) });

function backlog(f, rows = '| 1 | `fixture-a` | [framework-maintenance] Fixture document | In progress | [UR](artefacts/fixture-a/UR.md) | stored spec | Stored next step |') {
  fs.writeFileSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), `# AGDF Master Backlog\n\n## Active Backlog\n\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n${rows}\n\n## Planned / Parking Lot\n\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---|---|---|---|---|---|---|\n\n## Completed / Superseded Pointers\n\n| Key | Work item | Final status | Historical record | Outcome |\n|---|---|---|---|---|\n| old-key | Historical title | Superseded | [OR](artefacts/old/OR.md) | Historical outcome |\n`);
}

test('SCN-061/063/080: production overview reads only backlog even with >64 MiB unrelated history, and keeps original pointer facts', () => {
  const f = fixture(); try {
    backlog(f); const history = join(f.root, '.agdf/control/history'); fs.mkdirSync(history);
    const large = Buffer.alloc(24 * 1024 ** 2, 1);
    for (let i = 0; i < 3; i++) fs.writeFileSync(join(history, i + '.bin'), large);
    const reads = [], reader = createCockpitReader(f.root, { limits: { total: 64 * 1024 ** 2 }, checkpoint(stage, path) { if (stage === 'file_read') reads.push(path); } });
    const first = reader.snapshot();
    assert.equal(first.state, 'available'); assert.equal(first.data.kind, 'backlog'); assert.equal(first.data.file_count, 1);
    assert.deepEqual(reads, [join(f.root, '.agdf/control/MASTER_BACKLOG.md')]);
    assert.equal(first.data.entries[0].original_key, '`fixture-a`'); assert.equal(first.data.entries[0].stored_status, 'In progress');
    assert.equal(first.data.entries[1].stored_status, 'Superseded'); assert.equal(first.data.entries[0].stored_next_step, 'Stored next step');
    fs.writeFileSync(join(history, '0.bin'), 'unrelated'); assert.equal(reader.freshness(first.snapshot_id).data.unchanged, true);
    const again = reader.snapshot(); assert.deepEqual(storedFacts(again.data), storedFacts(first.data)); assert.notEqual(again.data.entries[0].row_id, first.data.entries[0].row_id); assert.notEqual(again.snapshot_id, first.snapshot_id);
    const direct = reader.snapshot('fixture-a'); assert.equal(direct.state, 'available'); assert.equal(direct.data.run.run_id, 'fixture-a');
  } finally { f.close(); }
});

test('SCN-062/083: duplicate/malformed pointers stay identifiable and nonselectable; missing/unsupported backlog never discovers Runs or writes', () => {
  const f = fixture(); try {
    backlog(f, '| 1 | `fixture-a` | Duplicate one | In progress | none | stored | next |\n| 2 | fixture-a | Duplicate two | In progress | none | stored | next |\n| 3 | malformed | Incomplete |');
    const before = treeBytes(f.root), reads = [], reader = createCockpitReader(f.root, { checkpoint(stage, path) { if (stage === 'file_read') reads.push(path); } });
    const partial = reader.snapshot(); assert.equal(partial.state, 'partial');
    assert.equal(partial.data.entries.filter(r => r.key === 'fixture-a').every(r => !r.selectable), true);
    assert.equal(partial.data.entries.find(r => r.key === 'malformed').selectable, false);
    assert.equal(reads.length, 1); assert.deepEqual(treeBytes(f.root), before);
    fs.writeFileSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md'), Buffer.from([255]));
    assert.equal(reader.snapshot().code, 'backlog_unsupported');
    fs.rmSync(join(f.root, '.agdf/control/MASTER_BACKLOG.md')); const missing = reader.snapshot();
    assert.equal(missing.code, 'backlog_missing'); assert.equal(missing.data, null);
  } finally { f.close(); }
});

test('SCN-064: direct named Run needs no backlog membership and matches unchanged Core evaluation', () => {
  const f = fixture(); try {
    backlog(f, ''); const before = treeBytes(f.root);
    const expected = evaluateGateCheck(f.root, { runId: 'fixture-a', ignoreRunIdEnv: true });
    const actual = createCockpitReader(f.root).snapshot('fixture-a');
    assert.equal(actual.data.kind, 'run'); assert.equal(actual.data.run.evaluation.current_gate, expected.current_gate);
    for (const key of ['status', 'blocking_reason', 'missing_approval', 'next_allowed_action', 'allowed', 'forbidden']) assert.deepEqual(actual.data.run.evaluation[key], expected[key]);
    assert.deepEqual(treeBytes(f.root), before);
    const missing = createCockpitReader(f.root).snapshot('unknown'); assert.equal(missing.code, 'run_missing'); assert.equal(missing.data.requested_run_id, 'unknown'); assert.equal(missing.data.run, null);
  } finally { f.close(); }
});

test('SCN-067/068/069/074: production transitions reissue matching parents/resources and old or foreign selectors cannot discard a valid view', () => {
  const f = fixture(); try {
    const reader = createCockpitReader(f.root), initial = reader.snapshot('fixture-a');
    const original = initial.data.run.resources.find(r => r.type === 'UR');
    assert.throws(() => reader.document(randomUUID(), initial.snapshot_id, 'fixture-a'), /resource_denied/);
    assert.equal(reader.freshness(initial.snapshot_id).data.unchanged, true);
    const source = reader.document(original.resource_id, initial.snapshot_id, 'fixture-a');
    assert.equal(source.data.kind, 'document'); assert.match(source.data.document.content, /日本語/);
    assert.notEqual(source.snapshot_id, initial.snapshot_id); assert.notEqual(source.data.document.resource.resource_id, original.resource_id);
    assert.equal(source.data.run.resources.some(r => r.resource_id === source.data.document.resource.resource_id), true);
    assert.throws(() => reader.document(original.resource_id, initial.snapshot_id, 'fixture-a'), /resource_denied/);
    const context = reader.context('fixture-a', source.snapshot_id); assert.equal(context.data.kind, 'context');
    assert.notEqual(context.snapshot_id, source.snapshot_id); assert.equal(context.data.document.resource.run_id, context.data.run.run_id);
    const packet = reader.prepareContext({ snapshot_id: context.snapshot_id, run_id: 'fixture-a', revision_id: context.data.run.revision_id,
      resource_id: context.data.document.resource.resource_id, graph_ids: [], excluded_ids: [], generation: 1 });
    assert.equal(packet.state, 'available'); assert.deepEqual(packet.data.packet.artefact, context.data.document);
    assert.equal(reader.validateContext(packet.data.packet.context_id, 1).data.current, true);
  } finally { f.close(); }
});

test('SCN-067/072: strict optional named snapshot and independent production workers retain only latest scoped selectors', async () => {
  const f = fixture(), service = createCockpitSessionService(f.root); try {
    const a = (await service.render({ run_id: 'fixture-a' }))._meta.agdf_cockpit.session_id;
    const b = (await service.render())._meta.agdf_cockpit.session_id;
    const read = (session_id, args) => service.read({ session_id, ...args });
    const first = await read(a, { operation: 'snapshot', run_id: 'fixture-a' });
    assert.equal(first.data.kind, 'run');
    const overview = await read(b, { operation: 'snapshot' }); assert.equal(overview.data.kind, 'backlog');
    const old = first.data.run.resources.find(r => r.type === 'UR');
    const invalid = await read(a, { operation: 'document', snapshot_id: first.snapshot_id, run_id: 'fixture-completed', resource_id: old.resource_id });
    assert.equal(invalid.code, 'resource_denied');
    assert.equal((await read(a, { operation: 'freshness', snapshot_id: first.snapshot_id })).data.unchanged, true);
    const doc = await read(a, { operation: 'document', snapshot_id: first.snapshot_id, run_id: 'fixture-a', resource_id: old.resource_id });
    assert.equal(doc.data.kind, 'document');
    assert.equal((await read(a, { operation: 'freshness', snapshot_id: first.snapshot_id })).code, 'resource_denied');
    assert.equal((await read(b, { operation: 'freshness', snapshot_id: overview.snapshot_id })).data.unchanged, true);
    assert.throws(() => parseCockpitArguments({ operation: 'snapshot', session_id: a, run_id: '../outside' }), /resource_denied/);
    assert.throws(() => parseCockpitArguments({ operation: 'snapshot', session_id: a, run_id: 'fixture-a', content: 'forged' }), /resource_denied/);
  } finally { await service.close(); f.close(); }
});

test('SCN-079/080/083: canonical approval without backlog membership leaves stored pointers unchanged; direct reading checks the new Run', async () => {
  const { approvalFixture } = await import('./control-cockpit-fixtures.js');
  const { createHash } = await import('node:crypto');
  const f = await approvalFixture(), service = createCockpitSessionService(f.root);
  try {
    // Fixture setup precedes capture and approval. The canonical writer updates only an
    // existing linked row; an unlinked Run is the legitimate Run-only approval case.
    const path = join(f.root,'.agdf/control/MASTER_BACKLOG.md'), digest = () => createHash('sha256').update(fs.readFileSync(path)).digest('hex');
    const setup = fs.readFileSync(path, 'utf8');
    const addressedRow = line => line.split('|')[2]?.trim().replaceAll('`', '') === 'fixture-a';
    assert.equal(setup.split('\n').filter(addressedRow).length, 1);
    fs.writeFileSync(path, setup.split('\n').filter(line => !addressedRow(line)).join('\n'));
    const previousRevision = f.revision(), previousDigest = digest(), reader = createCockpitReader(f.root), pointer = reader.snapshot();
    const previousCore = evaluateGateCheck(f.root,{runId:'fixture-a',ignoreRunIdEnv:true});
    assert.equal(f.approve().outcome,'approved'); assert.equal(digest(),previousDigest); assert.notEqual(f.revision(),previousRevision);
    assert.equal(reader.freshness(pointer.snapshot_id).data.unchanged,true);
    const before = treeBytes(f.root), stored = reader.snapshot(); assert.deepEqual(storedFacts(stored.data),storedFacts(pointer.data));
    const session = (await service.render())._meta.agdf_cockpit.session_id;
    const wire = await service.read({operation:'snapshot',session_id:session}); assert.deepEqual(storedFacts(wire.data),storedFacts(stored.data));
    const expected = evaluateGateCheck(f.root,{runId:'fixture-a',ignoreRunIdEnv:true});
    assert.notEqual(expected.next_allowed_action,previousCore.next_allowed_action);
    const checked = await service.read({operation:'run',session_id:session,snapshot_id:wire.snapshot_id,run_id:'fixture-a'});
    assert.equal(checked.data.run.revision_id,f.revision()); assert.equal(checked.data.run.evaluation.next_allowed_action,expected.next_allowed_action);
    assert.equal(checked.authorizes,false); assert.equal(stored.data.entries.some(row=>row.key==='fixture-a'),false);
    assert.deepEqual(treeBytes(f.root),before);
  } finally { await service.close(); f.close(); }
});

test('SCN-080/082/083: linked canonical approval changes the stored pointer; both scoped readers invalidate the old backlog without repairing it', async () => {
  const { approvalFixture } = await import('./control-cockpit-fixtures.js');
  const f = await approvalFixture(), service = createCockpitSessionService(f.root);
  try {
    const path = join(f.root, '.agdf/control/MASTER_BACKLOG.md');
    const previousBytes = fs.readFileSync(path), previousRevision = f.revision();
    const reader = createCockpitReader(f.root), pointer = reader.snapshot();
    const session_id = (await service.render())._meta.agdf_cockpit.session_id;
    const wireBefore = await service.read({ operation: 'snapshot', session_id });
    assert.deepEqual(storedFacts(wireBefore.data), storedFacts(pointer.data));
    assert.equal(f.approve().outcome, 'approved');
    assert.notDeepEqual(fs.readFileSync(path), previousBytes);
    assert.notEqual(f.revision(), previousRevision);
    const before = treeBytes(f.root);
    assert.throws(() => reader.freshness(pointer.snapshot_id), { code: 'source_changed' });
    assert.equal((await service.read({ operation: 'freshness', session_id, snapshot_id: wireBefore.snapshot_id })).code, 'source_changed');
    const stored = reader.snapshot();
    const wire = await service.read({ operation: 'snapshot', session_id });
    assert.deepEqual(storedFacts(wire.data), storedFacts(stored.data));
    assert.notDeepEqual(storedFacts(stored.data), storedFacts(pointer.data));
    const expected = evaluateGateCheck(f.root, { runId: 'fixture-a', ignoreRunIdEnv: true });
    const checked = await service.read({ operation: 'run', session_id, snapshot_id: wire.snapshot_id, run_id: 'fixture-a' });
    assert.equal(checked.data.run.revision_id, f.revision());
    assert.equal(checked.data.run.evaluation.next_allowed_action, expected.next_allowed_action);
    assert.equal(checked.authorizes, false);
    assert.deepEqual(treeBytes(f.root), before);
  } finally { await service.close(); f.close(); }
});

test('UR readiness follows the configured project language exactly like the canonical gate-check', () => {
  const f = fixture(); try {
    const configPath = join(f.root, '.agdf/control/config.json');
    fs.writeFileSync(configPath, JSON.stringify({ ...JSON.parse(fs.readFileSync(configPath, 'utf8')), artifact_language: 'en', chat_language: 'en' }));
    const sections = ['Problem', 'Goal', 'Affected Users', 'Scope', 'Non-Goals', 'Acceptance Signals', 'Existing Source Of Truth', 'Risks And Unknowns', 'Next Step'];
    fs.writeFileSync(join(f.root, f.documentPath), `# UR: English fixture\n\nRequirements clarification: complete\n\n${sections.map(s => `## ${s}\n\nConcrete ${s.toLowerCase()} for the fixture.\n`).join('\n')}`);
    f.register('UR', f.documentPath);
    const expected = evaluateGateCheck(f.root, { runId: 'fixture-a', ignoreRunIdEnv: true });
    assert.notEqual(expected.blocking_reason, 'AGDF_UR_REQUIREMENTS_INCOMPLETE', 'English project needs no German approval summary');
    const actual = createCockpitReader(f.root).snapshot('fixture-a').data.run.evaluation;
    for (const key of ['status', 'blocking_reason', 'missing_approval', 'next_allowed_action']) assert.deepEqual(actual[key], expected[key]);
  } finally { f.close(); }
});

test('canonical Run State is a registered resource on every platform', () => {
  const f = fixture(); try {
    const runState = createCockpitReader(f.root).snapshot('fixture-a').data.run.resources.find(r => r.type === 'Run State');
    assert.equal(runState.status, 'registered');
    assert.equal(runState.path, '.agdf/control/runs/fixture-a/RUN_STATE.md');
  } finally { f.close(); }
});
