import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { artifactReadinessFixture, readyPrd } from './fixtures/artifact-readiness.js';
import { treeBytes } from './control-cockpit-fixtures.js';
import { inspectArtifactReadiness } from '../lib/control-inspect/artifact-readiness.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { parseCockpitArguments } from '../lib/control-inspect/cockpit-contract.js';
const fixture = gate => { const f = artifactReadinessFixture(gate); f.root = fs.realpathSync(f.root); if (!gate || gate === 'PRD') fs.writeFileSync(f.path, readyPrd); return f; };
const input = f => ({ runId: f.runId, gate: f.gate, expectedRevisionId: f.revision, presentationLanguage: 'de' });

test('SCN-001/002/010/019: all supported unregistered drafts use the actual standalone evaluator, no writes', () => {
  for (const gate of ['UR', 'PRD', 'SD', 'TP']) {
    const f = fixture(gate);
    try {
      const reader = createCockpitReader(f.root), before = treeBytes(f.root), selected = reader.snapshot(f.runId);
      assert.equal(selected.state, 'available'); assert.equal(selected.data.run.draft_check.result, null);
      assert.equal(selected.data.run.draft_check.source.available, true);
      assert.equal(selected.data.run.resources.some(r => r.type === gate), false, 'Canonical unregistered draft is not a fabricated resource');
      const checked = reader.artifactReadiness(f.runId, selected.snapshot_id, gate, f.revision);
      assert.equal(checked.state, 'available'); assert.notEqual(checked.snapshot_id, selected.snapshot_id);
      assert.deepEqual(checked.data.run.draft_check.result, inspectArtifactReadiness(f.root, input(f)));
      assert.equal(checked.data.run.draft_check.result.authorizes, false);
      if (gate === 'PRD') assert.equal(checked.data.run.draft_check.display.state, 'passed');
      assert.deepEqual(treeBytes(f.root), before);
      for (const content of [readyPrd.replace('before_prd | resolved', 'before_prd | open'), readyPrd.replace('- AC-001: Die gewählte Quelle bleibt lesbar.\n', '')]) {
        if (gate !== 'PRD') continue;
        fs.writeFileSync(f.path, content);
        const fresh = reader.snapshot(f.runId), r = reader.artifactReadiness(f.runId, fresh.snapshot_id, gate, f.revision);
        assert.equal(r.data.run.draft_check.display.state, 'corrections_required');
        assert.deepEqual(r.data.run.draft_check.result, inspectArtifactReadiness(f.root, input(f)));
      }
    } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
  }
});

test('SCN-004/006: invalid selectors retain view; same-revision edit, atomic replace, removal and absent creation invalidate dependencies', () => {
  const f = fixture();
  try {
    const reader = createCockpitReader(f.root); let selected = reader.snapshot(f.runId);
    for (const [run, gate, rev] of [['foreign', 'PRD', f.revision], [f.runId, 'SD', f.revision], [f.runId, 'PRD', randomUUID()]]) {
      assert.throws(() => reader.artifactReadiness(run, selected.snapshot_id, gate, rev), /resource_denied/);
      assert.equal(reader.freshness(selected.snapshot_id).data.unchanged, true);
    }
    for (const mutation of [() => fs.writeFileSync(f.path, readyPrd.replace('Synthetic readiness', 'Synthetic readyness')),
      () => { fs.writeFileSync(f.path + '.tmp', readyPrd); fs.renameSync(f.path + '.tmp', f.path); },
      () => fs.rmSync(f.path)]) {
      selected = reader.snapshot(f.runId); mutation();
      assert.throws(() => reader.freshness(selected.snapshot_id), /source_changed/);
      fs.writeFileSync(f.path, readyPrd);
    }
    fs.rmSync(f.path); selected = reader.snapshot(f.runId);
    assert.equal(selected.data.run.draft_check.source.available, false);
    fs.writeFileSync(f.path, readyPrd); assert.throws(() => reader.freshness(selected.snapshot_id), /source_changed/);
    fs.rmSync(f.path); fs.symlinkSync(join(f.root, `${f.prefix}UR.md`), f.path);
    selected = reader.snapshot(f.runId); assert.equal(selected.data.run.draft_check.source.available, false);
    fs.rmSync(f.path); fs.writeFileSync(f.path, readyPrd); assert.throws(() => reader.freshness(selected.snapshot_id), /source_changed/);
  } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
});

test('SCN-006: changes during captured/replay/published check never publish success', () => {
  for (const boundary of ['captured', 'replay', 'published']) {
    const f = fixture();
    try {
      let armed = false, changed = false;
      const reader = createCockpitReader(f.root, { checkpoint(stage) { if (armed && !changed && stage === boundary) { changed = true; fs.writeFileSync(f.path, readyPrd + '\nChanged during check.\n'); } } });
      const selected = reader.snapshot(f.runId); armed = true;
      const result = reader.artifactReadiness(f.runId, selected.snapshot_id, 'PRD', f.revision);
      assert.equal(result.code, 'source_changed'); assert.equal(result.data, null);
    } finally { fs.rmSync(f.root, { recursive: true, force: true }); }
  }
});

test('SCN-003/004/005/007/020: real worker/session replacement adopts sources/resources, rejects old selectors and schema extras', async () => {
  const f = fixture(), service = createCockpitSessionService(f.root);
  try {
    const session_id = (await service.render())._meta.agdf_cockpit.session_id;
    const selected = await service.read({ operation: 'snapshot', session_id, run_id: f.runId });
    const request = { operation: 'artifact_readiness', session_id, snapshot_id: selected.snapshot_id, run_id: f.runId, gate: 'PRD', expected_revision_id: f.revision };
    for (const wrong of [{ ...request, run_id: 'foreign' }, { ...request, gate: 'SD' }, { ...request, expected_revision_id: randomUUID() }]) {
      assert.equal((await service.read(wrong)).code, 'resource_denied');
      assert.equal((await service.read({ operation: 'freshness', session_id, snapshot_id: selected.snapshot_id })).data.unchanged, true);
    }
    for (const bad of [{ ...request, path: f.path }, { ...request, gate: 'QA' }, { ...request, expected_revision_id: 'bad' }]) assert.throws(() => parseCockpitArguments(bad), /resource_denied/);
    const before = treeBytes(f.root), checked = await service.read(request);
    assert.equal(checked.data.run.draft_check.display.state, 'passed'); assert.equal(checked.authorizes, false);
    assert.equal((await service.read({ operation: 'freshness', session_id, snapshot_id: selected.snapshot_id })).code, 'resource_denied');
    const oldUr = selected.data.run.resources.find(r => r.type === 'UR');
    assert.equal((await service.read({ operation: 'document', session_id, snapshot_id: checked.snapshot_id, run_id: f.runId, resource_id: oldUr.resource_id })).code, 'resource_denied');
    assert.deepEqual(treeBytes(f.root), before);
    const waiting = service.read({ operation: 'changes', session_id, snapshot_id: checked.snapshot_id });
    fs.writeFileSync(f.path, readyPrd + '\nNew bytes at unchanged revision.\n');
    assert.equal((await waiting).data.changed, true);
    assert.equal((await service.read({ operation: 'freshness', session_id, snapshot_id: checked.snapshot_id })).code, 'source_changed');
    await service.read({ operation: 'close', session_id }); assert.equal((await service.read(request)).code, 'session_expired');
  } finally { await service.close(); fs.rmSync(f.root, { recursive: true, force: true }); }
});

test('SCN-005/007/009: new check cannot replace an owned publication or bypass uncertain cleanup', async () => {
  const f = fixture(), service = createCockpitSessionService(f.root);
  try {
    const a = (await service.render())._meta.agdf_cockpit.session_id;
    const b = (await service.render())._meta.agdf_cockpit.session_id;
    const call = (session_id, args) => service.read({ session_id, ...args });
    let selected = await call(a, { operation: 'snapshot', run_id: f.runId });
    const ur = selected.data.run.resources.find(r => r.type === 'UR');
    selected = await call(a, { operation: 'document', run_id: f.runId, snapshot_id: selected.snapshot_id, resource_id: ur.resource_id });
    const prepared = await call(a, { operation: 'prepare_context', run_id: f.runId, snapshot_id: selected.snapshot_id,
      resource_id: selected.data.document.resource.resource_id, revision_id: f.revision, graph_ids: [], excluded_ids: [], generation: 1 });
    assert.equal(prepared.state, 'available');
    const check = { operation: 'artifact_readiness', run_id: f.runId, snapshot_id: selected.snapshot_id, gate: 'PRD', expected_revision_id: f.revision };
    assert.equal((await call(a, check)).code, 'busy');
    assert.equal((await call(a, { operation: 'validate_context', context_id: prepared.data.packet.context_id, generation: 1 })).data.current, true);
    const other = await call(b, { operation: 'snapshot', run_id: f.runId });
    await call(a, { operation: 'close' });
    assert.equal((await call(b, { ...check, snapshot_id: other.snapshot_id })).code, 'context_cleanup_uncertain');
    assert.equal((await call(b, { operation: 'freshness', snapshot_id: other.snapshot_id })).data.unchanged, true);
  } finally { await service.close(); fs.rmSync(f.root, { recursive: true, force: true }); }
});
