import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { approvalFixture, fixture, treeBytes } from './control-cockpit-fixtures.js';
import { createCockpitReader } from '../lib/control-inspect/cockpit.js';
import { createCockpitSessionService } from '../lib/control-inspect/cockpit-session.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { parseCockpitArguments } from '../lib/control-inspect/cockpit-contract.js';
import { replaceFirstScalar } from '../lib/control-state/run-state-edits.js';
import { sealRunState } from '../lib/control-state/run-seal.js';

test('current work inventory ignores retained foreign planning and unreferenced history bytes',()=>{
  const f=fixture();try{
    fs.writeFileSync(join(f.root,'.agdf/control/MASTER_BACKLOG.md'),'# Unrelated retained old planning\n');
    const history=join(f.root,'.agdf/control/runs/fixture-a/history');fs.mkdirSync(history,{recursive:true});fs.writeFileSync(join(history,'large.bin'),Buffer.alloc(65*1024**2,1));
    const before=treeBytes(f.root),reader=createCockpitReader(f.root),work=reader.snapshot();
    assert.equal(work.data.kind,'work');assert.ok(work.data.entries.some(row=>row.key==='fixture-a'));assert.equal(work.data.entries.some(row=>row.title?.includes('old planning')),false);
    assert.throws(()=>parseCockpitArguments({operation:'snapshot',session_id:randomUUID(),view:'legacy'}),/resource_denied/);
    assert.deepEqual(treeBytes(f.root),before);
  }finally{f.close();}
});

test('SCN-064: direct named Run needs no backlog membership and matches unchanged Core evaluation', () => {
  const f = fixture(); try {
    const before = treeBytes(f.root);
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
    const overview = await read(b, { operation: 'snapshot' }); assert.equal(overview.data.kind, 'work');
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

test('canonical approval advances only its Run and leaves retained foreign planning untouched',async()=>{
  const f=await approvalFixture();try{
    const old=join(f.root,'.agdf/control/MASTER_BACKLOG.md');fs.writeFileSync(old,'# Unrelated planning\n');const beforeBytes=fs.readFileSync(old),beforeRevision=f.revision();
    assert.equal(f.approve().outcome,'accepted');assert.notEqual(f.revision(),beforeRevision);assert.deepEqual(fs.readFileSync(old),beforeBytes);
    const before=treeBytes(f.root),expected=evaluateGateCheck(f.root,{runId:'fixture-a'}),run=createCockpitReader(f.root).snapshot('fixture-a').data.run;
    assert.equal(run.evaluation.current_gate,expected.current_gate);assert.equal(Object.hasOwn(run,'backlog_comparison'),false);assert.deepEqual(treeBytes(f.root),before);
  }finally{f.close();}
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

test('an artefact registered outside .agdf/control blocks only that resource and leaves the evaluation unconfirmed', () => {
  for (const exists of [false, true]) {
    const f = fixture(); try {
      if (exists) { fs.mkdirSync(join(f.root, 'docs')); fs.writeFileSync(join(f.root, 'docs/notes.md'), '# Notes\n'); }
      f.register('PRD', 'docs/notes.md');
      const before = treeBytes(f.root);
      const result = createCockpitReader(f.root).snapshot('fixture-a');
      assert.equal(result.state, 'available', JSON.stringify([result.state, result.code]));
      const { run } = result.data;
      assert.equal(run.resources.find(r => r.type === 'PRD').status, 'blocked');
      assert.equal(run.resources.find(r => r.type === 'UR').status, 'registered');
      assert.equal(run.evaluation.status, 'not_evaluated');
      assert.equal(run.evaluation.control_assessment.state, 'unconfirmed');
      assert.equal(run.evaluation.current_gate, 'UR');
      assert.equal(typeof run.evaluation.next_allowed_action, 'string');
      assert.deepEqual(run.evaluation.diagnostics.map(d => [d.code, d.path]), [['evaluation_out_of_scope', 'docs/notes.md']]);
      assert.deepEqual(treeBytes(f.root), before);
    } finally { f.close(); }
  }
});

test('current gate and next action are derived from typed facts without persisted control copies',async()=>{
  const f=await approvalFixture();try{
    const earlier=evaluateGateCheck(f.root,{runId:'fixture-a'});assert.equal(f.approve().outcome,'accepted');
    const before=treeBytes(f.root),run=createCockpitReader(f.root).snapshot('fixture-a').data.run,expected=evaluateGateCheck(f.root,{runId:'fixture-a'});
    assert.notEqual(expected.current_gate,earlier.current_gate);assert.equal(run.evaluation.current_gate,expected.current_gate);assert.equal(run.evaluation.next_allowed_action,expected.next_allowed_action);
    assert.doesNotMatch(fs.readFileSync(f.runPath,'utf8'),/^## (?:Current Control State|Approvals|Artefacts|Evidence|Artefact Chain)\s*$/mu);assert.deepEqual(treeBytes(f.root),before);
  }finally{f.close();}
});
