import assert from 'node:assert/strict';
import { test } from 'node:test';
import { randomUUID } from 'node:crypto';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, realpathSync, readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, symlinkSync, existsSync, renameSync, lstatSync, cpSync, linkSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { validateRunCommandResult } from '../lib/control-state/run-command-contract.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { inspectCanonicalProject, initializeCanonicalProject, initializeCanonicalControl } from '../lib/control-state/canonical-initialization.js';
import { canonicalInitPlan } from '../lib/resources/canonical-init-plan.js';
import { inspectProjectState } from '../lib/control-inspect/project-state.js';
import { cliGitObservation } from '../../cli/lib/control-evaluation/git-observation.js';
import { ownerPlacement, assertOwnerPlacement } from '../lib/owner-placement.js';
import { canonicalJson, digest } from '../lib/control-state/approval-command-contract.js';

function fixture(work) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-project-init-')));
  execFileSync('git', ['init', '-q', root]);
  const input = { schema_version: '1', assurance: 'cooperative_local', presentation_language: 'de',
    working_directory: root, primary_target: root, target_source: 'explicit_target',
    target_id: resolveControlCommandTarget(root).target_id, operation_id: randomUUID(),
    command: { kind: 'project.initialize', payload: { language: 'en' } } };
  const run = (value = input, checkpoint) => createRunCommandService({ packageVersion: '0.20.2', gitObservation: cliGitObservation, checkpoint })('agdf_project', value);
  try { return work({ root, input, run }); } finally { rmSync(root, { recursive: true, force: true }); }
}
const files = root => Object.fromEntries(readdirSync(root, { recursive: true, withFileTypes: true }).filter(e => e.isFile())
  .map(e => [join(e.parentPath, e.name).slice(root.length), readFileSync(join(e.parentPath, e.name), 'utf8')]));

test('prospective receipt is private until the same directory and anchor are atomically published', () => fixture(({ root, input }) => {
  const original = { operationId: input.operation_id, requestDigest: digest('prospective'), targetId: input.target_id, language: 'en', producer: 'test' };
  let directoryInode, anchorInode;
  const done = initializeCanonicalProject(root, original, {
    beforePublish({ stagePath }) {
      const receipt = JSON.parse(readFileSync(join(stagePath, '.agdf-canonical-init.json')));
      const marker = JSON.parse(readFileSync(join(stagePath, '.agdf-canonical-init-stage.json')));
      assert.equal(receipt.schema_version, 2); assert.equal(marker.schema_version, 3);
      directoryInode = String(lstatSync(stagePath, { bigint: true }).ino);
      anchorInode = String(lstatSync(join(stagePath, '.agdf-canonical-init.json'), { bigint: true }).ino);
      assert.equal(receipt.control.directory_ino, directoryInode); assert.equal(receipt.control.anchor.ino, anchorInode);
      assert.equal(marker.receipt_digest, receipt.receipt_digest);
      const observed = inspectCanonicalProject(root, { operationId: input.operation_id });
      assert.equal(observed.operation_status, 'pending'); assert.equal(observed.receipt, null);
      assert.equal(existsSync(join(root, '.agdf/control')), false);
    },
    afterPublish() {
      const observed = inspectCanonicalProject(root, { operationId: input.operation_id });
      assert.equal(observed.status, 'pending'); assert.equal(observed.operation_status, 'recorded');
      assert.equal(observed.reason, 'published_pending_finalization');
      assert.equal(observed.receipt.control.directory_ino, directoryInode);
      assert.equal(observed.receipt.control.anchor.ino, anchorInode);
    },
  });
  assert.equal(done.receipt.control.anchor.ino, anchorInode);
  assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), []);
}));

for (const phase of ['beforeProspectiveReceipt', 'afterProspectiveReceipt', 'beforeWrite'])
  test(`interruption before a valid marker at ${phase} preserves unclaimed bytes without recovery authority`, () => fixture(({ root, input }) => {
    const original = { operationId: input.operation_id, requestDigest: digest('unclaimed'), targetId: input.target_id, language: 'en', producer: 'test' };
    assert.throws(() => initializeCanonicalProject(root, original, { [phase]: () => { throw Error('early-loss'); } }), /early-loss/);
    const before = files(join(root, '.agdf'));
    assert.equal(inspectCanonicalProject(root, { operationId: input.operation_id }).operation_status, 'unknown');
    assert.throws(() => initializeCanonicalProject(root, original));
    assert.equal(existsSync(join(root, '.agdf/control')), false);
    assert.deepEqual(files(join(root, '.agdf')), before);
  }));

test('fixed owner anchors reject copied objects, links, absent/rounded identifiers and preserve exact rename identity', () => fixture(({ root, run }) => {
  assert.equal(run().outcome, 'accepted');
  const path = join(root, '.agdf/control'), binding = ownerPlacement(path, 'canonical-control');
  const copy = path + '-copy'; cpSync(path, copy, { recursive: true });
  assert.throws(() => assertOwnerPlacement(binding, copy, 'canonical-control', path), /owner_placement_changed/);
  for (const value of [0, Number(binding.directory_ino), '0', '', '9007199254740993.0'])
    assert.throws(() => assertOwnerPlacement({ ...binding, directory_ino: value }, path, 'canonical-control'), /owner_placement_changed/);
  const moved = path + '-moved'; renameSync(path, moved);
  assert.deepEqual(assertOwnerPlacement(binding, moved, 'canonical-control', path), binding);
  const anchor = join(moved, '.agdf-canonical-init.json'), hard = join(root, 'external-link');
  linkSync(anchor, hard); assert.throws(() => ownerPlacement(moved, 'canonical-control', path), /owner_placement_unsafe/); unlinkSync(hard);
  const saved = anchor + '.saved'; renameSync(anchor, saved); symlinkSync(saved, anchor);
  assert.throws(() => ownerPlacement(moved, 'canonical-control', path), /owner_placement_unsafe/);
}));

test('device-only remount simulation preserves new receipts while legacy receipt predicates reject drift', () => fixture(({ root, run, input }) => {
  assert.equal(run().outcome, 'accepted');
  const module = new URL('../lib/control-state/canonical-initialization.js', import.meta.url).href;
  const observe = () => spawnSync(process.execPath, ['--input-type=module', '--eval', `
    import fs from 'node:fs'; import { syncBuiltinESMExports } from 'node:module';
    const root = process.argv[1];
    for (const name of ['lstatSync', 'fstatSync']) {
      const original = fs[name]; fs[name] = (...args) => { const stat = original(...args); return Object.assign(Object.create(stat), { dev: stat.dev + (typeof stat.dev === 'bigint' ? 91n : 91) }); };
    }
    syncBuiltinESMExports();
    const { inspectCanonicalProject } = await import(${JSON.stringify(module)});
    console.log(JSON.stringify(inspectCanonicalProject(root, { operationId: process.argv[2] })));
  `, root, input.operation_id], { encoding: 'utf8' });
  const newer = observe(); assert.equal(newer.status, 0, newer.stderr);
  assert.equal(JSON.parse(newer.stdout).operation_status, 'recorded');
  const control = join(root, '.agdf/control'), path = join(control, '.agdf-canonical-init.json');
  const receipt = JSON.parse(readFileSync(path)), stat = lstatSync(control);
  const legacy = { schema_version: 1, owner: receipt.owner, kind: receipt.kind, operation: receipt.operation,
    target_id: receipt.target_id, control: { realpath: control, dev: String(stat.dev), ino: String(stat.ino) },
    status: 'recorded', created_run: false, created_gate_approval: false };
  writeFileSync(path, JSON.stringify({ ...legacy, receipt_digest: digest(canonicalJson(legacy)) }, null, 2) + '\n');
  assert.equal(inspectCanonicalProject(root, { operationId: input.operation_id }).operation_status, 'recorded');
  const before = readFileSync(path, 'utf8'), older = observe(); assert.equal(older.status, 0, older.stderr);
  assert.equal(JSON.parse(older.stdout).status, 'blocked');
  assert.equal(JSON.parse(older.stdout).operation_status, 'unknown');
  assert.equal(JSON.parse(older.stdout).reason, 'AGDF_CANONICAL_INIT_LEGACY_PLACEMENT_UNCONFIRMED');
  assert.equal(readFileSync(path, 'utf8'), before);
}));

test('completed schema-3 markers cannot repair a subsequently removed seed or copied receipt anchor', () => {
  for (const change of ['missing-seed', 'copied-anchor']) fixture(({ root, input }) => {
    const original = { operationId: input.operation_id, requestDigest: digest(change), targetId: input.target_id, language: 'en', producer: 'test' };
    assert.throws(() => initializeCanonicalProject(root, original, { beforePublish: () => { throw Error('owned-stage'); } }), /owned-stage/);
    const stage = join(root, '.agdf', `.control-stage-${input.operation_id}`);
    if (change === 'missing-seed') unlinkSync(join(stage, 'config.json'));
    else {
      const anchor = join(stage, '.agdf-canonical-init.json'), saved = join(root, 'saved-receipt');
      renameSync(anchor, saved); cpSync(saved, anchor);
    }
    const before = files(stage);
    assert.equal(inspectCanonicalProject(root, { operationId: input.operation_id }).status, 'blocked');
    assert.throws(() => initializeCanonicalProject(root, original));
    assert.deepEqual(files(stage), before); assert.equal(existsSync(join(root, '.agdf/control')), false);
  });
});

test('the existing caller stage2 format completes through its original receipt1 branch without conversion', () => fixture(({ root, input }) => {
  const original = { operationId: input.operation_id, requestDigest: digest('legacy-stage'), targetId: input.target_id, language: 'en', producer: 'test' };
  assert.throws(() => initializeCanonicalProject(root, original, { beforePublish: () => { throw Error('owned-stage'); } }), /owned-stage/);
  const stage = join(root, '.agdf', `.control-stage-${input.operation_id}`), path = join(stage, '.agdf-canonical-init-stage.json');
  const current = JSON.parse(readFileSync(path)), target = lstatSync(root), agdf = lstatSync(join(root, '.agdf'));
  const legacy = { schema_version: 2, operation: current.operation, owner: current.owner, stage_name: current.stage_name, mode: current.mode,
    target: { realpath: root, dev: String(target.dev), ino: String(target.ino) },
    agdf: { realpath: join(root, '.agdf'), dev: String(agdf.dev), ino: String(agdf.ino) },
    plan_fingerprint: current.plan_fingerprint, staged_files: current.staged_files };
  unlinkSync(join(stage, '.agdf-canonical-init.json')); writeFileSync(path, JSON.stringify(legacy, null, 2) + '\n');
  assert.equal(inspectCanonicalProject(root, { operationId: input.operation_id }).status, 'pending');
  const result = initializeCanonicalProject(root, original);
  assert.equal(result.receipt.schema_version, 1); assert.equal(result.status, 'created');
  assert.deepEqual(result.receipt.control, { realpath: join(root, '.agdf/control'), dev: String(agdf.dev), ino: String(lstatSync(join(root, '.agdf/control')).ino) });
}));

test('full-width filesystem inode values remain strings above Number precision', () => fixture(({ root, run }) => {
  assert.equal(run().outcome, 'accepted');
  const control = join(root, '.agdf/control'), actual = lstatSync(control, { bigint: true }).ino;
  const helper = new URL('../lib/owner-placement.js', import.meta.url).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', `
    import fs from 'node:fs'; import { syncBuiltinESMExports } from 'node:module';
    for (const name of ['lstatSync', 'fstatSync']) {
      const original = fs[name]; fs[name] = (...args) => { const stat = original(...args); return Object.assign(Object.create(stat), { ino: stat.ino + (typeof stat.ino === 'bigint' ? 9007199254740993n : 9007199254740993) }); };
    }
    syncBuiltinESMExports();
    const { ownerPlacement, assertOwnerPlacement } = await import(${JSON.stringify(helper)});
    const binding = ownerPlacement(process.argv[1], 'canonical-control');
    assertOwnerPlacement(binding, process.argv[1], 'canonical-control'); console.log(JSON.stringify(binding));
  `, control], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).directory_ino, String(actual + 9007199254740993n));
}));

test('legacy CLI stage1 remains CLI-owned and cannot become a caller-bound setup receipt', () => fixture(({ root, input }) => {
  const original = { operationId: input.operation_id, requestDigest: digest('legacy-cli'), targetId: input.target_id, language: 'en', producer: 'test' };
  assert.throws(() => initializeCanonicalProject(root, original, { beforePublish: () => { throw Error('owned-stage'); } }), /owned-stage/);
  const stage = join(root, '.agdf', `.control-stage-${input.operation_id}`), path = join(stage, '.agdf-canonical-init-stage.json');
  const current = JSON.parse(readFileSync(path)), target = lstatSync(root), agdf = lstatSync(join(root, '.agdf'));
  const legacy = { schema_version: 1, owner: current.owner, stage_name: current.stage_name, mode: current.mode,
    target: { realpath: root, dev: String(target.dev), ino: String(target.ino) },
    agdf: { realpath: join(root, '.agdf'), dev: String(agdf.dev), ino: String(agdf.ino) },
    plan_fingerprint: current.plan_fingerprint, staged_files: current.staged_files };
  unlinkSync(join(stage, '.agdf-canonical-init.json')); writeFileSync(path, JSON.stringify(legacy, null, 2) + '\n');
  assert.equal(inspectCanonicalProject(root, { operationId: input.operation_id }).status, 'blocked');
  assert.throws(() => initializeCanonicalProject(root, original));
  const done = initializeCanonicalControl(root, canonicalInitPlan(current.operation.language_preference));
  assert.equal(done.status, 'created'); assert.equal(existsSync(join(root, '.agdf/control/.agdf-canonical-init.json')), false);
}));

test('explicit pre-Run project setup publishes one fixed scaffold and original receipt; replay and authored observation preserve bytes', () => fixture(({ root, input, run }) => {
  const absent = inspectProjectState(root, input, cliGitObservation);
  assert.equal(absent.status, 'absent'); assert.equal(existsSync(join(root, '.agdf')), false);
  assert.equal(absent.repository.root, root); assert.match(absent.plan.plan_digest, /^sha256:[a-f0-9]{64}$/);
  assert.equal(absent.plan.version, '0.20.2'); assert.equal(absent.plan.file_count, 15);
  assert.equal(absent.setup.binding.target_id, input.target_id); assert.equal(absent.setup.requires_explicit_intent, true);
  assert.deepEqual(absent.setup.required_agent_fields, ['operation_id']);
  const created = run();
  assert.deepEqual(validateRunCommandResult(created), [], JSON.stringify(created));
  assert.equal(created.outcome, 'accepted', JSON.stringify(created));
  assert.equal(created.family_result.status, 'created');
  assert.equal(created.receipt.kind, 'project.initialize');
  assert.equal(created.receipt.operation.operation_id, input.operation_id);
  assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), []);
  assert.equal(Buffer.byteLength(JSON.stringify(created)) < 16384, true);
  const control = join(root, '.agdf/control'), config = join(control, 'config.json');
  const authored = JSON.parse(readFileSync(config, 'utf8')); authored.chat_language = 'de';
  writeFileSync(config, JSON.stringify(authored, null, 2) + '\n');
  for (const name of ['MASTER_BACKLOG.md', 'CONTEXT_GRAPH.md', 'SOT_REGISTRY.md'])
    writeFileSync(join(control, name), readFileSync(join(control, name), 'utf8') + '\nHuman authored context retained.\n');
  const before = files(control), replay = run();
  assert.equal(replay.outcome, 'already_applied', JSON.stringify(replay));
  assert.deepEqual(replay.receipt, created.receipt);
  const unchanged = run({ ...input, operation_id: randomUUID() });
  assert.equal(unchanged.family_result.status, 'unchanged'); assert.equal(unchanged.receipt, null);
  assert.deepEqual(files(control), before);
  const conflict = run({ ...input, command: { kind: 'project.initialize', payload: { language: 'de' } } });
  assert.equal(conflict.outcome, 'rejected'); assert.equal(conflict.reason, 'operation_payload_conflict');
  assert.deepEqual(files(control), before);
}));

for (const phase of ['project_after_publish', 'project_after_receipt', 'project_before_marker_cleanup', 'before_result'])
  test(`original setup identity survives actual publication response loss at ${phase}`, () => fixture(({ root, input, run }) => {
    const lost = run(input, p => { if (p === phase) throw Error('injected_response_loss'); });
    assert.deepEqual(validateRunCommandResult(lost), []);
    assert.equal(lost.outcome, 'effect_unknown', JSON.stringify(lost));
    const observed = inspectCanonicalProject(root, { operationId: input.operation_id });
    assert.equal(['pending', 'initialized'].includes(observed.status), true, JSON.stringify(observed));
    assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), []);
    const done = run(); assert.equal(['accepted', 'already_applied'].includes(done.outcome), true, JSON.stringify(done));
    assert.equal(done.receipt.operation.operation_id, input.operation_id);
    assert.equal(inspectCanonicalProject(root, { operationId: input.operation_id }).operation_status, 'recorded');
    assert.equal(existsSync(join(root, '.agdf/.canonical-init.lock')), false);
  }));

test('foreign partial state, dangling control links and generic write arguments reject without adopting data', () => fixture(({ root, input, run }) => {
  mkdirSync(join(root, '.agdf/control'), { recursive: true });
  writeFileSync(join(root, '.agdf/control/foreign.txt'), 'retain');
  assert.equal(run().outcome, 'rejected');
  assert.equal(readFileSync(join(root, '.agdf/control/foreign.txt'), 'utf8'), 'retain');
  assert.equal(run({ ...input, command: { kind: 'project.initialize', payload: { force: true } } }).reason, 'command_schema_invalid');
  rmSync(join(root, '.agdf/control'), { recursive: true });
  symlinkSync(join(root, 'missing-foreign'), join(root, '.agdf/control'));
  assert.equal(run().outcome, 'rejected');
  assert.equal(existsSync(join(root, 'missing-foreign')), false);
}));

test('original completion remains observable when later current configuration is invalid; acknowledgement is not a repair', () => fixture(({ root, input, run }) => {
  const created = run(); assert.equal(created.outcome, 'accepted');
  const config = join(root, '.agdf/control/config.json'); writeFileSync(config, '{invalid current config');
  const observed = inspectCanonicalProject(root, { operationId: input.operation_id });
  assert.equal(observed.status, 'blocked'); assert.equal(observed.operation_status, 'recorded');
  assert.deepEqual(observed.receipt, created.receipt);
  const replay = run(); assert.equal(replay.outcome, 'already_applied');
  assert.equal(replay.current.setup.status, 'blocked');
  assert.equal(readFileSync(config, 'utf8'), '{invalid current config');
  assert.equal(run({ ...input, operation_id: randomUUID() }).outcome, 'rejected');
}));

test('owned recovery retains the originally resolved language configuration across process-locale drift', () => fixture(({ root, input, run }) => {
  const originalLocale = process.env.LC_ALL;
  try {
    process.env.LC_ALL = 'en_US.UTF-8';
    const lost = run(input, p => { if (p === 'project_after_publish') throw Error('lost-before-receipt'); });
    assert.equal(lost.outcome, 'effect_unknown');
    const originalConfig = readFileSync(join(root, '.agdf/control/config.json'), 'utf8');
    process.env.LC_ALL = 'de_DE.UTF-8';
    const recovered = run(); assert.equal(recovered.outcome, 'accepted', JSON.stringify(recovered));
    assert.equal(readFileSync(join(root, '.agdf/control/config.json'), 'utf8'), originalConfig);
    assert.equal(recovered.receipt.operation.language_preference.detected_locale, 'en_US.UTF-8');
  } finally { if (originalLocale === undefined) delete process.env.LC_ALL; else process.env.LC_ALL = originalLocale; }
}));

test('a foreign GIT_DIR/work-tree environment cannot turn an invalid local .git directory into a confirmed project', () => fixture(({ root, run }) => {
  const foreign = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-project-foreign-git-')));
  const previous = { GIT_DIR: process.env.GIT_DIR, GIT_WORK_TREE: process.env.GIT_WORK_TREE };
  try {
    execFileSync('git', ['init', '-q', foreign]);
    rmSync(join(root, '.git'), { recursive: true }); mkdirSync(join(root, '.git'));
    process.env.GIT_DIR = join(foreign, '.git'); process.env.GIT_WORK_TREE = root;
    assert.equal(execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: root, encoding: 'utf8' }).trim(), root, 'the original inherited environment falsely reports the requested root');
    const rejected = run(); assert.equal(rejected.outcome, 'rejected', JSON.stringify(rejected));
    assert.equal(rejected.reason, 'target_not_in_repository', 'the existing canonical target resolver rejects before Git-provider or setup dispatch');
    assert.equal(rejected.dispatch, 'not_dispatched'); assert.equal(existsSync(join(root, '.agdf')), false);
  } finally {
    for (const [name, value] of Object.entries(previous)) { if (value === undefined) delete process.env[name]; else process.env[name] = value; }
    rmSync(foreign, { recursive: true, force: true });
  }
}));

test('an owned unpublished stage preserves its original request; another request cannot adopt it', () => fixture(({ root, input, run }) => {
  const direct = { operationId: input.operation_id, requestDigest: 'sha256:' + 'a'.repeat(64), targetId: input.target_id, language: 'en', producer: 'test' };
  assert.throws(() => initializeCanonicalProject(root, direct, { beforePublish: () => { throw Error('partial-stage'); } }), /partial-stage/);
  assert.equal(inspectCanonicalProject(root, { operationId: input.operation_id }).status, 'pending');
  assert.equal(run({ ...input, operation_id: randomUUID() }).outcome, 'rejected');
  const done = initializeCanonicalProject(root, direct);
  assert.equal(done.status, 'created'); assert.equal(done.receipt.operation.operation_id, input.operation_id);
}));

test('changed stage plan or foreign bytes block public recovery guidance and preserve the original stage', () => {
  for (const change of ['plan', 'foreign-file', 'version']) fixture(({ root, input }) => {
    const original = { operationId: input.operation_id, requestDigest: 'sha256:' + 'a'.repeat(64), targetId: input.target_id, language: 'en', producer: 'original-producer' };
    assert.throws(() => initializeCanonicalProject(root, original, { beforePublish: () => { throw Error('owned-interruption'); } }), /owned-interruption/);
    const stage = join(root, '.agdf', `.control-stage-${input.operation_id}`), marker = join(stage, '.agdf-canonical-init-stage.json');
    const data = JSON.parse(readFileSync(marker, 'utf8'));
    if (change === 'plan') { data.plan_fingerprint = '0'.repeat(64); writeFileSync(marker, JSON.stringify(data, null, 2) + '\n'); }
    if (change === 'version') { data.schema_version = 99; writeFileSync(marker, JSON.stringify(data, null, 2) + '\n'); }
    if (change === 'foreign-file') writeFileSync(join(stage, 'foreign.txt'), 'retain foreign bytes');
    const before = files(stage), status = inspectProjectState(root, input, cliGitObservation);
    assert.equal(status.status, 'blocked', JSON.stringify(status));
    assert.equal(status.recovery, undefined); assert.deepEqual(status.next_calls, []);
    assert.throws(() => initializeCanonicalProject(root, original));
    assert.deepEqual(files(stage), before); assert.equal(existsSync(join(root, '.agdf/control')), false);
  });
});

test('an interrupted operation rejects a changed runtime producer without adopting or rebuilding the stage', () => fixture(({ root, input }) => {
  const original = { operationId: input.operation_id, requestDigest: 'sha256:' + 'a'.repeat(64), targetId: input.target_id, language: 'en', producer: 'original-producer' };
  assert.throws(() => initializeCanonicalProject(root, original, { beforePublish: () => { throw Error('owned-interruption'); } }), /owned-interruption/);
  const stage = join(root, '.agdf', `.control-stage-${input.operation_id}`), before = files(stage);
  assert.throws(() => initializeCanonicalProject(root, { ...original, producer: 'changed-producer' }), /AGDF_CANONICAL_INIT_IDENTITY_CONFLICT/);
  assert.deepEqual(files(stage), before); assert.equal(existsSync(join(root, '.agdf/control')), false);
  assert.equal(initializeCanonicalProject(root, original).status, 'created');
}));

test('stage and ancestor replacement preserve foreign ownership without publishing or cleaning another directory', () => {
  for (const replace of ['stage', 'ancestor']) fixture(({ root, input }) => {
    const original = { operationId: input.operation_id, requestDigest: 'sha256:' + 'a'.repeat(64), targetId: input.target_id, language: 'en', producer: 'original-producer' };
    let displaced;
    assert.throws(() => initializeCanonicalProject(root, original, { beforePublish({ stagePath }) {
      const path = replace === 'stage' ? stagePath : join(root, '.agdf'); displaced = path + '-displaced';
      renameSync(path, displaced); mkdirSync(path); writeFileSync(join(path, 'foreign.txt'), 'retain replacement');
    } }));
    const replacement = replace === 'stage' ? join(root, '.agdf', `.control-stage-${input.operation_id}`) : join(root, '.agdf');
    assert.equal(readFileSync(join(replacement, 'foreign.txt'), 'utf8'), 'retain replacement');
    assert.equal(existsSync(displaced), true); assert.equal(existsSync(join(root, '.agdf/control')), false);
  });
});

test('changed published content blocks marker cleanup while retaining original receipt and foreign bytes', () => fixture(({ root, input, run }) => {
  const path = join(root, '.agdf/control/config.json');
  const lost = run(input, phase => { if (phase === 'project_before_marker_cleanup') writeFileSync(path, 'retain changed published bytes'); });
  assert.equal(lost.outcome, 'effect_unknown'); assert.deepEqual(validateRunCommandResult(lost), []);
  const state = inspectProjectState(root, input, cliGitObservation);
  assert.equal(state.status, 'blocked'); assert.equal(state.operation_status, 'recorded');
  assert.equal(state.receipt.operation.operation_id, input.operation_id); assert.deepEqual(state.next_calls, []);
  assert.equal(existsSync(join(root, '.agdf/control/.agdf-canonical-init-stage.json')), true);
  assert.equal(run().outcome, 'already_applied', 'the historical original effect is acknowledged without repairing the now-invalid current state');
  assert.equal(readFileSync(path, 'utf8'), 'retain changed published bytes');
}));

test('a non-regular pending marker blocks without reading a foreign FIFO', { skip: process.platform === 'win32' }, () => fixture(({ root, input }) => {
  const stage = join(root, '.agdf', `.control-stage-${input.operation_id}`), marker = join(stage, '.agdf-canonical-init-stage.json');
  mkdirSync(stage, { recursive: true }); execFileSync('mkfifo', [marker]);
  const module = new URL('../lib/control-state/canonical-initialization.js', import.meta.url).href;
  const child = spawnSync(process.execPath, ['--input-type=module', '--eval',
    `import {inspectCanonicalProject} from ${JSON.stringify(module)};console.log(JSON.stringify(inspectCanonicalProject(process.argv[1])));`, root],
    { encoding: 'utf8', timeout: 3000 });
  assert.equal(child.error, undefined, 'inspection must reject the non-regular marker before readFileSync');
  assert.equal(child.status, 0, child.stderr); assert.equal(JSON.parse(child.stdout).status, 'blocked');
  assert.equal(existsSync(marker), true, 'the foreign object is preserved');
}));

test('real CLI and MCP initializer processes serialize publication using the same owned target lock', async () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-project-concurrent-')));
  execFileSync('git', ['init', '-q', root]);
  const intent = { operationId: randomUUID(), requestDigest: 'sha256:' + 'c'.repeat(64),
    targetId: resolveControlCommandTarget(root).target_id, language: 'en', producer: 'test-concurrency' };
  const module = new URL('../lib/control-state/canonical-initialization.js', import.meta.url).href;
  const release = join(root, 'release-fixture-writer');
  const script = `import {initializeCanonicalProject} from ${JSON.stringify(module)};
    import {existsSync} from 'node:fs';
    const [root,intent,release]=process.argv.slice(1);
    initializeCanonicalProject(root,JSON.parse(intent),{beforePublish(){
      process.stdout.write('locked\\n'); const until=Date.now()+10000;
      while(!existsSync(release)){if(Date.now()>until)throw Error('fixture-release-timeout');Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,10);}
    }});`;
  const child = spawn(process.execPath, ['--input-type=module', '--eval', script, root, JSON.stringify(intent), release], { stdio: ['ignore', 'pipe', 'pipe'] });
  let stderr = ''; child.stderr.on('data', b => { stderr += b; });
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(Error('fixture-ready-timeout: ' + stderr)), 8000);
      child.once('error', reject); child.stdout.once('data', () => { clearTimeout(timer); resolve(); });
    });
    const cliModule = new URL('../../cli/lib/scaffold/canonical-init.js', import.meta.url).href;
    const planModule = new URL('../../cli/lib/scaffold/plan.js', import.meta.url).href;
    const contender = spawnSync(process.execPath, ['--input-type=module', '--eval',
      `import {initializeCanonicalControl} from ${JSON.stringify(cliModule)};import {generatedFilesForTarget} from ${JSON.stringify(planModule)};
       initializeCanonicalControl(process.argv[1],generatedFilesForTarget('init',process.argv[1],false,'en'));`, root], { encoding: 'utf8', timeout: 5000 });
    assert.notEqual(contender.status, 0); assert.match(contender.stderr, /AGDF_RUN_WRITE_LOCKED/);
    assert.match(contender.stderr, /lock_owner_status: 'live'/);
    const completed = new Promise((resolve, reject) => child.once('exit', code => code === 0 ? resolve() : reject(Error(stderr))));
    writeFileSync(release, 'release only this owned fixture'); await completed;
    const replay = initializeCanonicalProject(root, intent);
    assert.equal(replay.historical_effect, true);
    assert.equal(replay.receipt.operation.operation_id, intent.operationId);
    assert.equal(existsSync(join(root, '.agdf/.canonical-init.lock')), false);
    assert.deepEqual(readdirSync(join(root, '.agdf/control/runs')), []);
  } finally {
    if (child.exitCode === null && child.signalCode === null) {
      const stopped = new Promise(resolve => child.once('exit', resolve)); child.kill(); await stopped;
    }
    rmSync(root, { recursive: true, force: true });
  }
});
