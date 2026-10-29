import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { initializeCanonicalControl } from '../../cli/lib/scaffold/canonical-init.js';
import { generatedFilesForTarget } from '../../cli/lib/scaffold/plan.js';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { resolveRuns } from '../lib/control-state/run-state-resolver.js';
import { captureControlScope } from '../lib/control-read/snapshot.js';
import { createSkillDispatchService } from '../lib/skill-dispatch/service.js';
import { readDeliveryRunInventory } from '../lib/skill-dispatch/delivery-run-assignment.js';
import { interactionLocales, pluginDefinition } from '../../cli/lib/cli/runtime-context.js';
import { evaluateDoctor } from '../lib/control-evaluation/doctor.js';
import { createDoctorReader } from '../lib/control-read/doctor-reader.js';
import { createDoctorObservationService } from '../lib/control-inspect/doctor-observation.js';
import { createReadWorkerBudget, ReadWorkerPool } from '../lib/control-read/cockpit-pool.js';
import { createHash } from 'node:crypto';
import { readSourceRevisions } from '../lib/control-state/run-source-revisions.js';

test('original Brownfield Analysis history is compatible with the current reader and unsupported by the archived reader', async () => {
  const base = new URL('./fixtures/diagnostic-compatibility/', import.meta.url);
  const provenance = JSON.parse(readFileSync(new URL('provenance.json', base), 'utf8'));
  const history = readFileSync(new URL('original-source-history.md', base));
  const legacy = readFileSync(new URL('legacy-reader.js.txt', base));
  const hash = value => createHash('sha256').update(value).digest('hex');
  assert.equal(hash(history), provenance.history_sha256);
  assert.equal(hash(legacy), provenance.legacy_reader_sha256);
  // Preserve the complete archived reader; relocate only its imports to shared
  // structural helpers. No validator branch is reconstructed or edited here.
  const relocated = legacy.toString().replace(/from (["'])(\.\/[^"']+)\1/g,
    (_match, _quote, specifier) => `from ${JSON.stringify(new URL(specifier, new URL('../lib/control-state/run-source-revisions.js', import.meta.url)).href)}`);
  const older = await import(`data:text/javascript;base64,${Buffer.from(relocated).toString('base64')}`);
  assert.equal(older.readSourceRevisions(history).valid, false);
  const current = readSourceRevisions(history);
  assert.equal(current.valid, true);
  assert.ok(current.receipts.some(row => row.initiating_phase === 'Brownfield Analysis'));
  assert.equal(hash(history), provenance.history_sha256, 'compatibility diagnosis never rewrites foreign evidence');
});

function fixture(work) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-doctor-observation-')));
  try {
    execFileSync('git', ['init', '-q', root]);
    initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en'));
    const path = createRun(root, 'selected');
    mkdirSync(join(root, '.agdf/control/runs/foreign'));
    const foreign = join(root, '.agdf/control/runs/foreign/RUN_STATE.md');
    writeFileSync(foreign, '# Unsupported unrelated history\n');
    return work({ root, path, foreign });
  } finally { rmSync(root, { recursive: true, force: true }); }
}

test('an exact selected observation never captures unrelated Run history', () => fixture(({ root, foreign }) => {
  const reads = [];
  const captured = captureControlScope(root, () => resolveRuns(root, { runIdArg: 'selected' }), {
    checkpoint: (phase, path) => { if (phase === 'file_read') reads.push(path); },
  });
  assert.equal(captured.data.run.run_id, 'selected');
  assert.equal(reads.includes(foreign), false, 'selected scope must not read an unsupported foreign record');
  assert.ok(resolveRuns(root, { allActive: true }).findings.some(f => f.run_id === 'foreign'), 'inventory still accounts for invalid entries');
}));

test('bound revision intake is isolated while unbound assignment remains complete and fail closed', () => fixture(({ root, path, foreign }) => {
  const before = readFileSync(foreign, 'utf8');
  const revision = readFileSync(path, 'utf8').match(/^- revision_id: (.+)$/m)[1];
  const service = createSkillDispatchService({ env: {} });
  const base = { skillSet: pluginDefinition.skillSet, interactionLocales, expectedVersion: pluginDefinition.version,
    skillId: 'gate-check', surface: 'codex', presentationLanguage: 'en', workingDirectory: root,
    targetSource: 'explicit_target', primaryTarget: root, intake: true };
  const selected = service({ ...base, intakeMode: 'resume', runId: 'selected', expectedRevisionId: revision });
  assert.notEqual(selected.diagnostics[0]?.code, 'AGDF_RUN_ASSIGNMENT_INVENTORY_INVALID');
  assert.ok(selected.control, JSON.stringify(selected));
  assert.equal(selected.control.run_id, 'selected');
  assert.equal(selected.control.revision_id, revision);
  const originalInventoryBehavior = createSkillDispatchService({ env: {}, readDeliveryRunInventory: target => readDeliveryRunInventory(target) });
  assert.equal(originalInventoryBehavior({ ...base, intakeMode: 'resume', runId: 'selected', expectedRevisionId: revision })
    .diagnostics[0].code, 'AGDF_RUN_ASSIGNMENT_INVENTORY_INVALID', 'the original full-inventory resume fails for the intended foreign-history reason');
  const unbound = service(base);
  assert.equal(unbound.diagnostics[0].code, 'AGDF_RUN_ASSIGNMENT_INVENTORY_INVALID');
  assert.equal(readFileSync(foreign, 'utf8'), before);
}));

test('all-active diagnosis preserves same-source single/shared findings and accounts invalid entries', () => fixture(({ root }) => {
  const single = evaluateDoctor(root, { runId: 'selected', ignoreRunIdEnv: true });
  const all = evaluateDoctor(root, { allActive: true });
  assert.deepEqual(all.runs.find(r => r.run_id === 'selected').report.findings, single.findings);
  assert.ok(all.findings.some(f => f.run_id === 'foreign'));
  assert.equal(all.status, 'block');
  const observed = createDoctorReader(root).open({ all_active: true, git_snapshot: null });
  const byIdentity = (a, b) => [a.run_id, a.code, a.path, a.message].join('\0').localeCompare([b.run_id, b.code, b.path, b.message].join('\0'));
  assert.deepEqual([...observed.findings].sort(byIdentity), [...all.findings].sort(byIdentity),
    'invalid-entry findings retain the same canonical wording, severity and provenance as direct diagnosis');
}));

test('selected diagnosis preserves a known unsupported version instead of hiding it as generic selection failure', () => fixture(({ root, path, foreign }) => {
  const beforeForeign = readFileSync(foreign);
  writeFileSync(path, readFileSync(path, 'utf8').replace('- control_state_version: 2', '- control_state_version: 3'));
  const report = evaluateDoctor(root, { runId: 'selected', ignoreRunIdEnv: true });
  const finding = report.findings.find(row => row.code === 'AGDF_RUN_VERSION_UNSUPPORTED');
  assert.ok(finding, 'the selected path must retain the existing parser classification for a future format');
  assert.equal(report.status, 'block');
  assert.equal(finding.actual_version, '3');
  assert.equal(finding.classification, 'unsupported_version');
  assert.equal(finding.path, path, 'the finding names the exact selected source, not a legacy projection');
  assert.match(finding.message, /unsupported|incompatib/iu);
  assert.doesNotMatch(finding.next_step, /remove|reseal/iu, 'an unsupported producer is not repaired by rewriting its history');
  assert.deepEqual(readFileSync(foreign), beforeForeign);
}));

test('missing, malformed and conflicting versions remain unclassified rather than asserted producer incompatibility', () => fixture(({ root, path }) => {
  const original = readFileSync(path, 'utf8');
  for (const replacement of ['', '- control_state_version: unknown', '- control_state_version: 3\n- control_state_version: 2']) {
    writeFileSync(path, original.replace('- control_state_version: 2', replacement));
    const report = evaluateDoctor(root, { runId: 'selected', ignoreRunIdEnv: true });
    assert.equal(report.status, 'block');
    assert.ok(report.findings.every(finding => finding.classification !== 'unsupported_version'));
    assert.ok(report.findings.some(finding => ['AGDF_RUN_VERSION_INVALID', 'AGDF_RUN_FIELD_DUPLICATE'].includes(finding.code)));
  }
}));

test('bounded inventory pages account 0/1/10/100 active entries and preserve same-source findings', () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-doctor-pages-')));
  try {
    initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en'));
    let created = 0;
    for (const count of [0, 1, 10, 100]) {
      while (created < count) createRun(root, `run-${String(++created).padStart(3, '0')}`);
      const reference = evaluateDoctor(root, { allActive: true });
      const reader = createDoctorReader(root, { limits: { timeout: 7000, total: 64 * 1024 ** 2 } });
      let report = reader.open({ all_active: true, git_snapshot: null }), checked = [], pages = 0;
      for (;;) {
        pages++; checked.push(...report.runs);
        assert.ok(report.runs.length <= 20);
        assert.equal(report.inventory.remaining_count + report.inventory.accounted_count, count);
        if (report.next_offset === null) break;
        assert.equal(report.completeness, 'partial'); assert.equal(report.status, 'partial');
        const offset = report.next_offset;
        report = reader.page({ offset, git_snapshot: null });
        assert.deepEqual(reader.page({ offset, git_snapshot: null }), report, 'page replay is byte-stable domain data');
      }
      assert.equal(report.completeness, 'complete'); assert.equal(report.status, reference.status);
      assert.equal(report.inventory.accounted_count, count);
      assert.equal(new Set(checked.map(r => r.run_id)).size, count);
      assert.deepEqual(checked.flatMap(r => r.report.findings.map(f => ({ ...f, run_id: r.run_id }))), reference.findings);
      if (count === 100) assert.ok(pages >= 5);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('inventory cursor rejects source mutation and out-of-order replay without stale completion', () => fixture(({ root, foreign }) => {
  for (let i = 0; i < 21; i++) createRun(root, `page-${i}`);
  const reader = createDoctorReader(root), first = reader.open({ all_active: true, git_snapshot: null });
  assert.equal(first.status, 'partial');
  writeFileSync(foreign, '# Changed incompatible foreign record\n');
  assert.throws(() => reader.page({ offset: first.next_offset, git_snapshot: null }), e => e.code === 'source_changed');
  const ordered = createDoctorReader(root), orderedFirst = ordered.open({ all_active: true, git_snapshot: null });
  assert.throws(() => ordered.page({ offset: 999, git_snapshot: null }), e => e.code === 'diagnostic_cursor_invalid');
  assert.equal(ordered.page({ offset: orderedFirst.next_offset, git_snapshot: null }).completeness, 'complete', 'invalid offset cannot discard the advertised continuation');
}));

test('parent observation uses isolated reusable workers, shared capacity and truthful read recovery', async () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-doctor-worker-'))), budget = createReadWorkerBudget(1);
  let ticks = Date.now(), provenances = 0;
  const service = createDoctorObservationService({ budget, now: () => ticks, verifyRuntime: () => { provenances++; } });
  const input = { run_id: 'selected', presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target' };
  try {
    initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en')); createRun(root, 'selected');
    const first = await service.observe(root, input), second = await service.observe(root, input);
    assert.equal(first.available, true, JSON.stringify(first)); assert.equal(second.available, true);
    assert.ok(first.timing.total_ms > 0); assert.ok(first.timing.worker_startup_ms > 0);
    assert.equal(second.timing.worker_startup_ms, 0); assert.equal(provenances, 2);
    const limited = await service.observe(root, { ...input, all_active: true, run_id: undefined });
    assert.equal(limited.available, false); assert.equal(limited.reason, 'resource_limit');
    assert.equal(limited.overall_status, null); assert.ok(limited.timing.total_ms > 0);
    assert.equal(limited.next_calls[0].arguments.cursor, undefined);
    ticks += 60001;
    const expired = await service.observe(root, { ...input, all_active: true, run_id: undefined, cursor: first.observation_id + ':1' });
    assert.equal(expired.available, false); assert.equal(expired.reason, 'diagnostic_cursor_invalid');
    assert.equal(expired.timing.capture_and_evaluation_ms, null);
    assert.ok(!JSON.stringify(expired.next_calls).includes('operation_id'));
  } finally { await service.close(); assert.equal(budget.inspect().occupied, 0); rmSync(root, { recursive: true, force: true }); }
});

test('foreign and out-of-order parent cursors cannot retire a valid advertised continuation', async () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-doctor-cursors-')));
  const other = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-doctor-foreign-'))), budget = createReadWorkerBudget(2);
  const service = createDoctorObservationService({ budget });
  const input = { all_active: true, presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target' };
  try {
    initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en'));
    for (let i = 0; i < 21; i++) createRun(root, `cursor-${i}`);
    const first = await service.observe(root, input); assert.equal(first.overall_status, null); assert.ok(first.next_cursor);
    const foreign = await service.observe(other, { ...input, primary_target: other, working_directory: other, cursor: first.next_cursor });
    assert.equal(foreign.reason, 'diagnostic_cursor_invalid'); assert.equal(service.inspectOwnership().active, 1);
    const future = await service.observe(root, { ...input, cursor: first.observation_id + ':999' });
    assert.equal(future.reason, 'diagnostic_cursor_invalid'); assert.equal(service.inspectOwnership().active, 1);
    const offset = first.next_cursor.split(':')[1];
    for (const cursor of [first.next_cursor + ':extra', `${first.observation_id}:0${offset}`,
      `${first.observation_id}:+${offset}`, first.next_cursor + '\n']) {
      const malformed = await service.observe(root, { ...input, cursor });
      assert.equal(malformed.reason, 'diagnostic_cursor_invalid', 'only the exact advertised cursor syntax is accepted');
      assert.equal(service.inspectOwnership().active, 1, 'malformed cursors preserve the valid continuation');
    }
    const continued = await service.observe(root, { ...input, cursor: first.next_cursor });
    assert.equal(continued.available, true, JSON.stringify(continued)); assert.equal(continued.completeness, 'complete');
    assert.equal(continued.inventory.accounted_count, 21);
  } finally { await service.close(); assert.equal(budget.inspect().occupied, 0); rmSync(root, { recursive: true, force: true }); rmSync(other, { recursive: true, force: true }); }
});

test('actual silent read-worker timeout and cancellation never become clean diagnosis or write recovery', async () => {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-doctor-slow-')));
  const workerURL = new URL('data:text/javascript,' + encodeURIComponent("import {parentPort} from 'node:worker_threads';parentPort.postMessage({phase:'read_worker_ready'});parentPort.on('message',()=>{});"));
  const input = { run_id: 'selected', presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target' };
  try {
    initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en')); createRun(root, 'selected');
    for (const fault of ['timeout', 'cancelled', 'runtime_provenance_invalid']) {
      const budget = createReadWorkerBudget(1), controller = new AbortController();
      const service = createDoctorObservationService({ budget,
        poolFactory: target => new ReadWorkerPool(target, { workerURL, budget }),
        ...(fault === 'runtime_provenance_invalid' ? { verifyRuntime() { throw Object.assign(Error('runtime_provenance_invalid'), { code: 'runtime_provenance_invalid' }); } } : {}) });
      const timer = fault === 'cancelled' ? setTimeout(() => controller.abort(), 20) : null;
      try {
        const report = await service.observe(root, input, controller.signal);
        assert.equal(report.available, false); assert.equal(report.reason, fault);
        assert.equal(report.overall_status, null); assert.equal(report.completeness, 'incomplete');
        assert.equal(report.timing.capture_and_evaluation_ms, null);
        assert.ok(report.timing.total_ms > 0);
        if (fault === 'timeout') assert.ok(report.timing.total_ms >= 6900, 'the real worker uses the unchanged seven-second end-to-end allowance');
        assert.equal(report.next_calls[0].tool, 'agdf_inspect');
        assert.equal(JSON.stringify(report.next_calls).includes('operation_id'), false);
      } finally { clearTimeout(timer); await service.close(); assert.equal(budget.inspect().occupied, 0); }
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
