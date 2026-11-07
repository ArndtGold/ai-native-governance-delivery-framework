// Host-neutral harness (TP T-011; SCN-007, SCN-008, SCN-009): a consumer that is not the Claude mod
// renders the run view, the figure state and the journal events from Core's companion exports and the
// versioned formats alone, with the same fields the companion shows. The companion modules are imported
// here only to compare; the harness itself never imports them. No MCP operation or schema is involved.
import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildCompanionFixtures } from './fixtures/companion-fixtures.js';
import { renderEvents, renderProject, renderRun } from './fixtures/host-neutral-harness.js';
import { fixture as cockpitFixture } from './control-cockpit-fixtures.js';
import { COMPANION_MOODS } from '../lib/companion/figure-state.js';
import { createCompanionJournal, journalPath } from '../lib/companion/journal.js';
import { projectToolResult } from '../lib/mcp-tool-errors.js';
import { localePack } from '../lib/interaction-presentation.js';
import { interactionLocales } from '../lib/resources/context.js';

const repoRoot = fileURLToPath(new URL('../../..', import.meta.url));
const { snapshotFromRunView } = await import(pathToFileURL(join(repoRoot, 'plugins/agdf/host-templates/claude/companion/run-state.mjs')).href);
const MARK = Object.freeze({ fulfilled: 'done', current: 'current', blocked: 'current', open: 'open' });

test('SCN-007: the harness imports only the companion core exports', () => {
  const source = readFileSync(new URL('./fixtures/host-neutral-harness.js', import.meta.url), 'utf8');
  assert.deepEqual([...source.matchAll(/from '([^']+)'/gu)].map(match => match[1]).sort(),
    ['../../lib/companion/events.js', '../../lib/companion/figure-state.js', '../../lib/companion/run-view.js']);
});

test('SCN-007/SCN-008: the harness renders F01 to F13 with the companion fields, and all six moods', t => {
  const moods = new Set();
  let compared = 0;
  for (const fx of buildCompanionFixtures(t)) {
    for (const language of ['de', 'en']) {
      const { view, rendered } = renderProject(fx.root, { language, runIds: [fx.runId] });
      const snapshot = snapshotFromRunView(JSON.stringify(view), { now: 0 });
      assert.deepEqual(rendered.runs.map(run => run.id), snapshot.runs.map(run => run.id), `${fx.id} ${language}: the same runs`);
      assert.deepEqual(rendered.unreadable, snapshot.unreadable.map(row => `${row.id}:${row.reason}`), `${fx.id}: the same diagnosis`);
      for (const run of rendered.runs) {
        const shown = snapshot.runs.find(item => item.id === run.id);
        if (!shown.evaluated) continue;
        assert.deepEqual({ gate: run.gate, missing: run.missing, next: run.next, blocking: run.blocking, path: run.path, mood: run.mood, reason: run.reason },
          { gate: shown.gate, missing: shown.missing, next: shown.nextText, blocking: shown.blockingText,
            path: shown.path.map(({ gate, status }) => `${gate}:${MARK[status]}`), mood: shown.figure.mood, reason: shown.figure.reason },
          `${fx.id} ${language} ${run.id}`);
        compared += 1;
        moods.add(run.mood);
      }
    }
  }
  // F08, F09, F11 and F12 have no readable run; every other fixture is compared in both languages.
  assert.ok(compared >= 18, `${compared} rendered runs compared`);
  // A structured build step and an ended run come from the same derivation.
  const build = renderRun({ run_id: 'b', valid: true, evaluated: true, lifecycle: 'active', status: 'open', current_gate: 'CD+Tests',
    mode: 'structured_delivery', missing_approval: 'none', blocking_reason: 'none', user_action_required: 'no', path: [] });
  const ended = renderRun({ run_id: 'e', valid: true, evaluated: false, lifecycle: 'superseded' });
  for (const run of [build, ended]) moods.add(run.mood);
  assert.deepEqual([build.mood, ended.mood], ['baut', 'bereit']);
  assert.deepEqual([...moods].sort(), [...COMPANION_MOODS].sort(), 'each of the six moods is reached');
});

test('SCN-009: the harness parses journal events of real command outcomes with the Core event module only', t => {
  const f = cockpitFixture();
  const dataRoot = mkdtempSync(join(tmpdir(), 'agdf-host-neutral-'));
  t.after(() => { f.close(); rmSync(dataRoot, { recursive: true, force: true }); });
  const pack = localePack(interactionLocales, 'en');
  const journal = createCompanionJournal({ dataRoot, sealedFiles: id => f.context.store.sealedFiles(id) });
  const tools = { 'step.record': 'agdf_record', 'approval.record': 'agdf_approve', 'presentation.prepare': 'agdf_prepare', 'material.stage': 'agdf_record' };
  const run = (kind, payload, execute = f.context.execute) => {
    const input = f.context.request(kind, payload, f.binding());
    const result = kind === 'material.stage' ? f.context.store.stage(input) : execute(input);
    assert.equal(result.outcome, 'accepted', JSON.stringify(result));
    journal.observe(tools[kind], input, projectToolResult(tools[kind], input, result, pack));
    return result;
  };
  const text = '# Brownfield Review\n\nSmall isolated host-neutral fixture.\n';
  const begun = run('material.stage', { action: 'begin', files: [{ slot: 'Brownfield Review', bytes: Buffer.byteLength(text) }] });
  const transfer = begun.family_result.transfer_id;
  run('material.stage', { action: 'append', transfer_id: transfer, file: 0, offset: 0, data: Buffer.from(text).toString('base64') });
  const sealed = run('material.stage', { action: 'seal', transfer_id: transfer });
  run('step.record', { step: 'route', route: 'quick_task', reason: 'Host-neutral fixture', source: sealed.family_result.files[0].reference });
  const prepared = run('presentation.prepare', { gate: 'UR' });
  run('approval.record', { gate: 'UR', presentation_id: prepared.family_result.presentation_id, response: 'Approval: UR' });
  const events = renderEvents(readFileSync(journalPath(dataRoot), 'utf8'), f.root);
  assert.deepEqual(events, [
    { kind: 'material_staged', run: 'fixture-a', gate: 'Brownfield Review', review: 'not_determinable' },
    { kind: 'document_recorded', run: 'fixture-a', gate: 'Brownfield Review', review: 'not_determinable' },
    { kind: 'approval_recorded', run: 'fixture-a', gate: 'UR', review: null },
  ]);
  assert.deepEqual(renderEvents(readFileSync(journalPath(dataRoot), 'utf8'), join(f.root, 'elsewhere')), [], 'another root sees none');
});
