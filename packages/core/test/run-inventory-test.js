import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRunInventory, normalizedRunTitle, runAttention, runInventoryLabel } from '../lib/control-state/run-inventory.js';
import { readRunInventory } from '../lib/control-state/run-inventory-reader.js';
import { renderRunState } from '../lib/control-state/run-state-repository.js';
import { currentFixture, currentRun } from './fixtures/current-run.js';
import { readRunOperations } from '../lib/control-state/run-operations.js';
import { isDecisionContentPlaceholder as movedPlaceholder } from '../lib/control-evaluation/decision-content-placeholder.js';
import { isDecisionContentPlaceholder as exportedPlaceholder } from '../lib/control-evaluation/decision-content-readiness.js';
import { normalizedRunTitle as presentationTitle } from '../lib/interaction-presentation.js';
const libRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../lib');
// Pure projection inputs carry an explicit derived observation. No old stored
// gate/decision/table is a fallback source, and no synthetic receipt is approved.
const source = (id, { lifecycle = 'active', objective = `Outcome of ${id}.`, revision = 3, gate = 'UR', decision = 'open', missing = 'none' } = {}) => ({
  run_id: id, text: renderRunState(id, `## Objective\n\n${objective}\n`, { lifecycle }).replace('- revision: 1', `- revision: ${revision}`),
  findings: [], observation: { current_gate: gate, decision, missing, next_action: 'Continue through the bound owner.' },
});
for (const value of ['Describe the trustworthy outcome.', '`What remains unverified?`', 'todo', 'TBD', '<goal>', 'pass | revise', '', '  ', null, 'A real sentence.'])
  assert.equal(exportedPlaceholder(value), movedPlaceholder(value), String(value));
assert.equal(presentationTitle, normalizedRunTitle);
assert.equal(normalizedRunTitle('run-inventory-core-20261029-01'), 'Run Inventory Core 20261029 01');
const entries = buildRunInventory([
  source('active-run', { gate: 'PRD', missing: 'Approval: PRD' }), source('completed-run', { lifecycle: 'completed', gate: 'OR' }),
  source('wrapped-run', { objective: 'Create a discussion document for\ncurrent capabilities.\n\nAnother paragraph.' }),
  source('template-run', { objective: 'Describe the trustworthy outcome.' }), source('empty-run', { objective: '' }),
]);
assert.equal(entries.schema_version, '1'); assert.equal(entries.state, 'complete'); assert.equal(entries.authorizes, false);
assert.equal(entries.counts.total, 5);
const active = entries.runs.find(row => row.run_id === 'active-run');
assert.equal(active.current_gate, 'PRD'); assert.equal(active.decision, 'open'); assert.equal(active.attention.code, 'decision_required');
assert.equal(active.title, 'Outcome of active-run.'); assert.equal(active.revision, 3);
assert.equal(active.path, '.agdf/control/runs/active-run/RUN_STATE.md'); assert.equal(active.closure, null);
assert.equal(entries.runs.find(row => row.run_id === 'wrapped-run').title, 'Create a discussion document for current capabilities.');
for (const id of ['template-run', 'empty-run']) {
  const row = entries.runs.find(entry => entry.run_id === id);
  assert.equal(row.title_source, 'run_id'); assert.equal(row.objective, null, 'a placeholder Objective is no goal');
}
assert.equal(active.objective, 'Outcome of active-run.');
assert.equal(entries.runs.find(row => row.run_id === 'wrapped-run').objective, 'Create a discussion document for current capabilities.');
assert.equal(entries.runs.find(row => row.run_id === 'completed-run').attention.code, 'none');
assert(entries.runs.every(row => row.last_activity.at === null), 'updated_at cannot invent receipt activity');
const noObservation = source('no-observation'); delete noObservation.observation;
assert.equal(buildRunInventory([noObservation]).runs[0].current_gate, null, 'No persisted gate fallback');
const attentionCases = [
  [{ lifecycle: 'completed', valid: true, decision: 'block' }, 'none'],
  [{ valid: false, decision: 'open' }, 'blocked'], [{ decision: 'block' }, 'blocked'], [{ gateResult: 'blocked' }, 'blocked'],
  [{ decision: 'revise' }, 'clarification_required'], [{ decision: 'decline' }, 'clarification_required'],
  [{ gateResult: 'revise' }, 'clarification_required'], [{ presentationDecision: true }, 'clarification_required'],
  [{ missing: 'Approval: UR' }, 'decision_required'], [{ decision: 'pending' }, 'decision_required'],
  [{ decision: 'open' }, 'in_progress'], [{ decision: 'in_progress' }, 'in_progress'], [{ decision: 'unknown' }, 'unclear'],
];
for (const [patch, expected] of attentionCases) assert.equal(runAttention({ lifecycle: 'active', valid: true, ...patch }), expected);
const orderInput = [source('stuck', { decision: 'block' }), source('working'), source('decision-b', { missing: 'Approval: UR' }),
  source('decision-a', { missing: 'Approval: UR' }), source('clarify', { decision: 'revise' }), source('history', { lifecycle: 'completed' })];
const ordered = buildRunInventory(orderInput);
assert.deepEqual(ordered.runs.map(row => row.run_id), ['decision-a', 'decision-b', 'clarify', 'stuck', 'working', 'history']);
assert.deepEqual(buildRunInventory([...orderInput].reverse()), ordered);
assert.deepEqual(ordered.counts.attention, { decision_required: 2, clarification_required: 1, blocked: 1, in_progress: 1, unclear: 0, none: 1 });
const de = buildRunInventory(orderInput, { language: 'de' }), en = buildRunInventory(orderInput, { language: 'en' });
assert.equal(de.runs[0].basis, 'Abgeleitete Beobachtung der Revision 3; keine Lieferfreigabe.');
assert.equal(en.runs[0].basis, 'Derived observation at revision 3; no delivery authority.');
assert.equal(de.runs[0].attention.label, 'Entscheidung erforderlich');
assert.deepEqual(buildRunInventory(orderInput, { language: 'fr' }).runs.map(row => row.attention.label), en.runs.map(row => row.attention.label));
assert.equal(runInventoryLabel('none', 'de-DE'), 'Historie');

const cleanups = [], t = { after: callback => cleanups.push(callback) };
try {
  const f = currentFixture(t), first = currentRun(f, 'Actual current inventory'), successor = currentRun(f, 'Independent successor');
  const initial = readRunInventory(f.root); assert.equal(initial.state, 'complete');
  const entry = initial.runs.find(row => row.run_id === first.id), created = readRunOperations(first.content()).receipts[0];
  assert.equal(entry.current_gate, 'UR'); assert.equal(entry.decision, 'open');
  assert.deepEqual(entry.last_activity, { at: created.created_at, source: 'receipt', precision: 'time' });
  const preview = f.call('closure.preview', { entries: [{ run_id: first.id, outcome: 'superseded', reason: 'Replaced by one actual current successor', successor_run: successor.id }] });
  assert.equal(preview.outcome, 'accepted', JSON.stringify(preview));
  const closed = f.call('closure.apply', { preview_id: preview.family_result.preview_id, confirmation: preview.family_result.confirmation_phrase });
  assert.equal(closed.outcome, 'accepted', JSON.stringify(closed));
  const history = readRunInventory(f.root).runs.find(row => row.run_id === first.id);
  assert.equal(history.lifecycle, 'superseded'); assert.equal(history.closure.reason, 'Replaced by one actual current successor');
  assert.deepEqual(history.closure.successor, { value: successor.id, verified: true });
  assert.equal(history.closure.closed_at, history.last_activity.at);
  const runs = join(f.root, '.agdf/control/runs');
  mkdirSync(join(runs, 'missing-run'));
  mkdirSync(join(runs, 'bad-meta-run')); writeFileSync(join(runs, 'bad-meta-run/RUN_STATE.md'), '# Unparseable foreign Run\n');
  mkdirSync(join(runs, 'pending-run/control'), { recursive: true });
  writeFileSync(join(runs, 'pending-run/RUN_STATE.md'), successor.content().replaceAll(successor.id, 'pending-run'));
  writeFileSync(join(runs, 'pending-run/control/RUN_STEP_PENDING.json'), '{}');
  const partial = readRunInventory(f.root, { language: 'de' }); assert.equal(partial.state, 'incomplete'); assert.equal(partial.counts.lifecycle.invalid, 3);
  for (const id of ['missing-run', 'bad-meta-run', 'pending-run']) {
    const row = partial.runs.find(row => row.run_id === id); assert.equal(row.valid, false); assert.equal(row.attention.code, 'blocked');
    assert(row.findings.every(finding => finding.next_step === `Den Run mit doctor --run ${id} prüfen.`));
  }
  assert.equal(partial.runs.find(row => row.run_id === 'pending-run').findings[0].code, 'AGDF_RUN_STEP_RECOVERY_REQUIRED');
  const absent = mkdtempSync(join(tmpdir(), 'agdf-inventory-absent-')); t.after(() => rmSync(absent, { recursive: true, force: true }));
  assert.equal(readRunInventory(absent).state, 'absent');
} finally { for (const cleanup of cleanups.reverse()) cleanup(); }
// Keep browser/host projection pure and deterministic throughout its import chain.
const seen = new Set();
function walk(file) {
  if (seen.has(file)) return; seen.add(file); const text = readFileSync(file, 'utf8');
  for (const [, specifier] of text.matchAll(/^\s*(?:import|export)[^'"]*?from\s+['"]([^'"]+)['"]/gmu)) {
    assert(!specifier.startsWith('node:') && specifier.startsWith('.'), `${file}: ${specifier}`); walk(resolve(dirname(file), specifier));
  }
  assert.doesNotMatch(text, /\bprocess\.|Date\.now\(|new Date\(\)|\brequire\(|\bimport\(/u, file);
}
walk(join(libRoot, 'control-state/run-inventory.js'));
assert(seen.has(join(libRoot, 'control-state/run-identity.js')));
assert(seen.has(join(libRoot, 'control-state/run-title.js')), 'the shared title rule stays pure');
console.log('Current inventory: pure title/attention/order/count/locale rules, actual receipt activity and closure, partial discovery and contained current pending paths passed.');
