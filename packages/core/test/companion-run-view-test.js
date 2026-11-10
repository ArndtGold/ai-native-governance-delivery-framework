// Companion run view (TP T-002, SCN-001): every evaluated run entry carries exactly the status card
// fields of the unchanged gate-check report for the same run, for all fixtures F01 to F13.
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCompanionFixtures, LEGACY_V2_RUN_ID } from './fixtures/companion-fixtures.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { CAPTURE_ATTEMPTS, captured, projectRunEntry, readRunView, RUN_VIEW_SCHEMA, DIAGNOSIS_REASONS } from '../lib/companion/run-view.js';
import { fixture as cockpitFixture } from './control-cockpit-fixtures.js';
import { deriveFigureState, COMPANION_MOODS } from '../lib/companion/figure-state.js';
import { validateInteractionCatalog } from '../lib/interaction-catalog-validation.js';
import { validateLocaleRegistry } from '../lib/interaction-presentation.js';
import { mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const cardFields = card => ({
  status: card.status, current_gate: card.current_gate, path: card.breadcrumb.map(({ gate, status }) => ({ gate, status })),
  missing_approval: card.missing_approval, blocking_reason: card.blocking_condition, next_step: card.next_step,
});
const entryFields = entry => ({
  status: entry.status, current_gate: entry.current_gate, path: entry.path,
  missing_approval: entry.missing_approval, blocking_reason: entry.blocking_reason, next_step: entry.next_step,
});

test('SCN-001: run view entries equal the status card of the same run for F01 to F13', t => {
  let localizedChecks = 0;
  for (const fx of buildCompanionFixtures(t)) {
    for (const language of ['en', 'de']) {
      const view = readRunView(fx.root, { language, runIds: [fx.runId] });
      assert.equal(view.schema_version, RUN_VIEW_SCHEMA);
      assert.equal(view.authorizes, false);
      const entry = view.runs.find(run => run.run_id === fx.runId);
      assert.ok(entry?.evaluated, `${fx.id} ${language}: requested run is evaluated`);
      const report = evaluateGateCheck(fx.root, { runId: fx.runId, ignoreRunIdEnv: true, presentationLanguage: language });
      assert.deepEqual(entryFields(entry), cardFields(report.status_card), `${fx.id} ${fx.name} (${language})`);
      assert.equal(entry.doctor_status, report.doctor_status, `${fx.id} doctor status`);
      // The card shows the agent's next step unless it is the user's turn (approval or user action).
      const card = report.status_card;
      const userTurn = card.user_action_required === 'yes'
        || (card.interaction_kind === 'gate_approval' && card.status === 'open' && card.missing_approval === `Approval: ${card.current_gate}`);
      if (report.status_presentation?.markdown && !userTurn) {
        assert.ok(report.status_presentation.markdown.includes(entry.next_step_text), `${fx.id} ${language}: localized next step as on the card`);
        localizedChecks += 1;
      }
    }
  }
  t.diagnostic(`localized next-step checks: ${localizedChecks}`);
  assert.ok(localizedChecks >= 10, 'the localized next step is compared for most fixtures');
});

test('Review finding 5: a completed run that evaluates as blocked is shown as blocked, not as done', () => {
  const completed = { valid: true, lifecycle: 'completed', evaluated: true, status: 'blocked', current_gate: 'OR',
    missing_approval: 'none', blocking_reason: 'AGDF_CLOSEOUT_EVIDENCE_MISSING', user_action_required: 'no', mode: 'quick_task' };
  assert.deepEqual(deriveFigureState(completed), { mood: 'blockiert', reason: { key: 'blocked', gate: 'OR', decision: 'AGDF_CLOSEOUT_EVIDENCE_MISSING' } });
  assert.deepEqual(deriveFigureState({ ...completed, status: 'open' }).mood, 'blockiert', 'a blocking reason alone blocks too');
  assert.deepEqual(deriveFigureState({ ...completed, status: 'pass', blocking_reason: 'none' }), { mood: 'fertig', reason: { key: 'done' } });
  assert.deepEqual(deriveFigureState({ valid: true, lifecycle: 'completed', evaluated: false }), { mood: 'fertig', reason: { key: 'done' } },
    'a summarized completed run stays done');
});

test('SCN-001: active runs are evaluated, unreadable and terminal runs are summarized unless requested', t => {
  const [active, completed, mixed] = buildCompanionFixtures(t, ['F02', 'F07', 'F10']);
  assert.equal(readRunView(active.root).runs.find(run => run.run_id === active.runId).evaluated, true);
  const summary = readRunView(completed.root).runs.find(run => run.run_id === completed.runId);
  assert.deepEqual({ evaluated: summary.evaluated, lifecycle: summary.lifecycle }, { evaluated: false, lifecycle: 'completed' });
  assert.equal(summary.status, undefined, 'a summarized run carries no status card fields');
  const runs = readRunView(mixed.root).runs;
  assert.deepEqual(runs.map(run => [run.run_id === LEGACY_V2_RUN_ID ? 'legacy' : 'current', run.valid, run.evaluated]).sort(),
    [['current', true, true], ['legacy', false, false]], 'an unreadable run costs no gate check of its own (review finding 6)');
  const legacy = runs.find(run => run.run_id === LEGACY_V2_RUN_ID);
  assert.deepEqual([legacy.unreadable_reason, legacy.figure.mood, legacy.figure.reason.key], ['run_version_unsupported', 'blockiert', 'unreadable'],
    'its reason and figure come from the inventory findings');
  const requested = readRunView(mixed.root, { runIds: [LEGACY_V2_RUN_ID] }).runs.find(run => run.run_id === LEGACY_V2_RUN_ID);
  assert.deepEqual([requested.valid, requested.evaluated], [false, true], 'requested by id it is still evaluated');
});

test('SCN-004/SCN-006: unreadable runs carry MCP reason codes and counts next to the readable runs', t => {
  const [legacy, invalid, oversized, mixed, missing] = buildCompanionFixtures(t, ['F08', 'F11', 'F12', 'F10', 'F02']);
  const reasons = fx => readRunView(fx.root).diagnosis;
  assert.deepEqual(reasons(legacy).unreadable.map(row => [row.run_id, row.reason]), [[LEGACY_V2_RUN_ID, 'run_version_unsupported']]);
  assert.deepEqual(reasons(legacy).counts, { unreadable: 1, readable: 0,
    by_reason: { run_version_unsupported: 1, run_state_invalid: 0, too_large: 0, missing: 0 } });
  assert.deepEqual(reasons(invalid).unreadable.map(row => row.reason), ['run_state_invalid']);
  assert.deepEqual(reasons(oversized).unreadable.map(row => row.reason), ['run_state_invalid'], 'Core reports the oversized run state as invalid; it has no size bound');
  const mixedView = readRunView(mixed.root);
  assert.deepEqual(mixedView.diagnosis.counts.by_reason.run_version_unsupported, 1);
  assert.equal(mixedView.diagnosis.counts.readable, 1);
  assert.ok(mixedView.runs.some(run => run.run_id === mixed.runId && run.valid && run.evaluated), 'the readable run stays listed');
  mkdirSync(join(missing.root, '.agdf', 'control', 'runs', 'run-without-state'), { recursive: true });
  assert.deepEqual(reasons(missing).unreadable.map(row => [row.run_id, row.reason]), [['run-without-state', 'missing']]);
});

test('SCN-001: an unsupported layout is a store diagnosis and a requested run still matches its card', t => {
  const [fx] = buildCompanionFixtures(t, ['F09']);
  const view = readRunView(fx.root, { runIds: [fx.runId] });
  assert.deepEqual(view.store, { status: 'unavailable', reason: 'control_layout_unsupported', run_folders: 1 });
  const report = evaluateGateCheck(fx.root, { runId: fx.runId, ignoreRunIdEnv: true, presentationLanguage: 'en' });
  assert.deepEqual(entryFields(view.runs.find(run => run.run_id === fx.runId)), cardFields(report.status_card));
});

test('SCN-004 (T-004, T-013 finding F2): an unsupported store counts its run folders as discovery would list them', t => {
  const [fx] = buildCompanionFixtures(t, ['F09']);
  const runs = join(fx.root, '.agdf', 'control', 'runs');
  for (const name of ['legacy-a', 'legacy-b']) mkdirSync(join(runs, name, 'documents'), { recursive: true });
  mkdirSync(join(runs, '.hidden'), { recursive: true });
  writeFileSync(join(runs, '.gitkeep'), '');
  assert.deepEqual(readRunView(fx.root).store, { status: 'unavailable', reason: 'control_layout_unsupported', run_folders: 3 },
    'the F09 run and two legacy folders count, dot entries do not');
  // The count reads inside the captured snapshot: a linked runs folder is refused there, which leaves the
  // count out but keeps the store diagnosis (delta review of 2026-11-07).
  const target = join(fx.root, 'linked-runs');
  mkdirSync(join(target, 'legacy-c'), { recursive: true });
  rmSync(runs, { recursive: true, force: true });
  symlinkSync(target, runs, 'junction');
  assert.deepEqual(readRunView(fx.root).store, { status: 'unavailable', reason: 'control_layout_unsupported' },
    'a linked runs folder is not counted through the link');
  rmSync(runs, { recursive: true, force: true });
  assert.deepEqual(readRunView(fx.root).store, { status: 'unavailable', reason: 'control_layout_unsupported', run_folders: 0 },
    'a store without a runs folder counts none');
  const [readable] = buildCompanionFixtures(t, ['F02']);
  assert.equal(readRunView(readable.root).store.run_folders, undefined, 'a supported store carries no folder count');
});

test('SCN-008 (T-005): figure moods follow the status card and all six moods are reachable', t => {
  const expected = { F01: 'laeuft', F02: 'wartet', F03: 'wartet', F04: 'laeuft', F05: 'wartet', F06: 'fertig', F07: 'fertig',
    F08: 'blockiert', F09: 'blockiert', F10: 'wartet', F11: 'blockiert', F12: 'blockiert', F13: 'blockiert' };
  const seen = new Set();
  for (const fx of buildCompanionFixtures(t)) {
    const entry = readRunView(fx.root, { runIds: [fx.runId] }).runs.find(run => run.run_id === fx.runId);
    assert.equal(entry.figure.mood, expected[fx.id], `${fx.id} ${fx.name}`);
    assert.deepEqual(entry.figure, deriveFigureState(entry), `${fx.id}: the view carries the derived figure`);
    seen.add(entry.figure.mood);
  }
  assert.deepEqual(deriveFigureState({ valid: true, lifecycle: 'active', evaluated: true, status: 'open', current_gate: 'CD+Tests',
    missing_approval: 'none', blocking_reason: 'none', user_action_required: 'no', mode: 'structured_delivery' }), { mood: 'baut', reason: { key: 'building', gate: 'CD+Tests' } });
  assert.deepEqual(deriveFigureState(null), { mood: 'bereit', reason: { key: 'idle' } });
  for (const mood of ['baut', 'bereit']) seen.add(mood);
  assert.deepEqual([...seen].sort(), [...COMPANION_MOODS].sort());
});

test('SCN-017 (T-005): the catalog carries complete companion copy in de and en', () => {
  const registry = JSON.parse(readFileSync(new URL('../../../plugins/agdf/meta/agdf-interaction-locales.json', import.meta.url), 'utf8'));
  assert.equal(validateInteractionCatalog(registry), true);
  assert.equal(validateLocaleRegistry(registry).valid, true);
  for (const locale of ['en', 'de']) {
    const copy = registry.locales[locale].companion;
    for (const mood of COMPANION_MOODS) assert.ok(copy.states[mood]?.trim(), `${locale} mood ${mood}`);
    for (const key of ['working', 'waitingApproval', 'waitingDecision', 'blocked', 'done', 'building', 'idle', 'ended', 'unreadable'])
      assert.ok(copy.reasons[key]?.trim(), `${locale} reason ${key}`);
    for (const reason of DIAGNOSIS_REASONS) assert.ok(copy.unreadable[reason]?.trim(), `${locale} diagnosis ${reason}`);
  }
  const broken = structuredClone(registry);
  delete broken.locales.de.companion.unreadable.run_state_invalid;
  assert.throws(() => validateInteractionCatalog(broken), /AGDF_INTERACTION_CATALOG_INCOMPLETE: de\.companion\.unreadable/u);
  assert.equal(validateLocaleRegistry(broken).valid, false);
});

test('SCN-014 (T-009): a changed bound document raises a drift warning with both digests', t => {
  const [fx] = buildCompanionFixtures(t, ['F03']);
  const entry = () => readRunView(fx.root, { language: 'en' }).runs.find(run => run.run_id === fx.runId);
  assert.deepEqual(entry().drift, [], 'a run as recorded has no drift');
  const path = `.agdf/control/runs/${fx.runId}/documents/PRD.md`;
  const recorded = readFileSync(join(fx.root, path), 'utf8');
  writeFileSync(join(fx.root, path), `${recorded}\nChanged after recording.\n`);
  const [warning] = entry().drift;
  assert.deepEqual([warning.document, warning.path], ['PRD', path]);
  assert.match(warning.recorded_digest, /^sha256:[a-f0-9]{64}$/u);
  assert.match(warning.current_digest, /^sha256:[a-f0-9]{64}$/u);
  assert.notEqual(warning.current_digest, warning.recorded_digest);
  writeFileSync(join(fx.root, path), recorded);
  assert.deepEqual(entry().drift, [], 'restoring the document clears the warning');
});

test('CR A7: a run whose evaluation threw is shown as unreadable with its bounded reason, not as idle', () => {
  const inventoryEntry = { run_id: 'run-a', title: 'A', lifecycle: 'active', valid: true, findings: [] };
  const entry = projectRunEntry(inventoryEntry, { evaluation_error: 'resource_denied' }, { language: 'en' });
  assert.deepEqual([entry.evaluated, entry.evaluation_error], [false, 'resource_denied']);
  assert.deepEqual(entry.figure, { mood: 'blockiert', reason: { key: 'unreadable', reason: 'resource_denied' } });
  assert.deepEqual(projectRunEntry(inventoryEntry, null, { language: 'en' }).figure, { mood: 'bereit', reason: { key: 'idle' } },
    'an active run that was not evaluated stays idle');
});

test('CR C2: the run view carries the authored objective only, never a run-id title or the card title', () => {
  const base = { run_id: 'run-a', lifecycle: 'active', valid: true, findings: [] };
  assert.equal(projectRunEntry({ ...base, title: 'Ship the companion', title_source: 'objective' }, null).objective, 'Ship the companion');
  assert.equal(projectRunEntry({ ...base, title: 'Run A', title_source: 'run_id' }, null).objective, null, 'a template objective leaves no goal');
  assert.equal(projectRunEntry({ ...base, title: 'Run A' }, null).objective, null);
});

test('CIR-01/RV-2: each run is evaluated inside its own captured snapshot, so a document outside the control folder blocks only its run', () => {
  const f = cockpitFixture();
  try {
    f.register('PRD', 'docs/notes.md');
    const view = readRunView(f.root, { runIds: ['fixture-a', 'fixture-completed'] });
    assert.equal(view.store.status, 'ok');
    const outside = view.runs.find(run => run.run_id === 'fixture-a');
    assert.deepEqual([outside.evaluated, outside.evaluation_error, outside.figure.mood], [false, 'resource_denied', 'blockiert'],
      'the captured read refuses the registered path outside .agdf/control; the uncaptured seam would have evaluated it');
    const other = view.runs.find(run => run.run_id === 'fixture-completed');
    assert.equal(other.evaluated, true, 'the other run stays readable and evaluated');
  } finally { f.close(); }
});

test('RV-3/RV-5: a linked project root reads like its target and keeps the caller spelling; a missing root has no control folder', t => {
  const [fx] = buildCompanionFixtures(t, ['F01']);
  const link = join(fx.root, '..', `${fx.runId}-linked-root`);
  symlinkSync(fx.root, link, 'junction');
  t.after(() => rmSync(link, { force: true, recursive: false }));
  const direct = readRunView(fx.root, { runIds: [fx.runId] }), linked = readRunView(link, { runIds: [fx.runId] });
  assert.equal(linked.root, link);
  assert.deepEqual(linked.runs, direct.runs, 'the same run view through the link');
  assert.deepEqual(readRunView(join(fx.root, 'no-such-folder')).store, { status: 'no_control', reason: null });
});

test('RV-1: a change during a captured read is retried a bounded number of times, other failures are not', () => {
  const changed = () => Object.assign(Error('source_changed'), { code: 'source_changed' });
  const capture = failures => { let calls = 0; return { get calls() { return calls; }, run: (root, project) => {
    calls += 1; if (calls <= failures) throw changed(); return { data: project({ root }) }; } }; };
  const recovering = capture(CAPTURE_ATTEMPTS - 1);
  assert.equal(captured('R', base => `read ${base}`, recovering.run), 'read R');
  assert.equal(recovering.calls, CAPTURE_ATTEMPTS);
  const persistent = capture(CAPTURE_ATTEMPTS);
  assert.throws(() => captured('R', () => 'x', persistent.run), error => error.code === 'source_changed');
  assert.equal(persistent.calls, CAPTURE_ATTEMPTS, 'never more than the bounded attempts');
  let denied = 0;
  assert.throws(() => captured('R', () => 'x', () => { denied += 1; throw Object.assign(Error('resource_denied'), { code: 'resource_denied' }); }),
    error => error.code === 'resource_denied');
  assert.equal(denied, 1, 'a boundary refusal is not retried');
});

test('CIR-02: run entries carry the status card fields and the figure, and no second state classification', t => {
  const [fx] = buildCompanionFixtures(t, ['F02']);
  for (const entry of readRunView(fx.root, { runIds: [fx.runId] }).runs) {
    assert.equal(Object.hasOwn(entry, 'attention'), false, entry.run_id);
    assert.equal(Object.hasOwn(entry, 'assessment'), false, entry.run_id);
  }
});

test('CIR-03: the unreadable reason follows the reader findings classification like run-state-resolver.js', () => {
  const unreadable = findings => projectRunEntry({ run_id: 'run-a', lifecycle: null, valid: false, findings }, null).unreadable_reason;
  assert.equal(unreadable([{ code: 'AGDF_CONTROL_LAYOUT_UNSUPPORTED', classification: 'unsupported_layout' }]), 'run_version_unsupported');
  assert.equal(unreadable([{ code: 'AGDF_RUN_STATE_VERSION', classification: 'unsupported_version' }]), 'run_version_unsupported');
  assert.equal(unreadable([{ code: 'AGDF_RUN_PATH_INVALID' }]), 'missing');
  assert.equal(unreadable([{ code: 'AGDF_RUN_STATE_UNAVAILABLE' }]), 'missing');
  assert.equal(unreadable([{ code: 'AGDF_RUN_STATE_MISSING' }]), 'run_state_invalid', 'a code no Core reader produces is no missing state');
  assert.equal(unreadable([{ code: 'AGDF_RUN_PATH_INVALID' }, { code: 'AGDF_RUN_META_INVALID' }]), 'run_state_invalid');
});

test('CIR-04: the figure reads a pending approval like the run inventory, so a negated mention is no waiting state', () => {
  const entry = missing => ({ run_id: 'run-a', lifecycle: 'active', valid: true, evaluated: true, status: 'open', current_gate: 'QA',
    missing_approval: missing, blocking_reason: 'none', user_action_required: 'no', mode: 'structured_delivery' });
  assert.deepEqual(deriveFigureState(entry('Approval: QA')), { mood: 'wartet', reason: { key: 'waitingApproval', gate: 'QA' } });
  for (const negated of ['No Approval: QA', 'not Approval: QA', 'Without Approval: QA'])
    assert.notEqual(deriveFigureState(entry(negated)).mood, 'wartet', negated);
});
