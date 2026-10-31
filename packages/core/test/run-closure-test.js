import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { initializeCanonicalControl } from '../../cli/lib/scaffold/canonical-init.js';
import { generatedFilesForTarget } from '../../cli/lib/scaffold/plan.js';
import { sealRunState, runSealState, artefactFileDigest, listedArtefactPaths } from '../lib/control-state/run-seal.js';
import { previewRunClosure, applyRunClosure, closurePhrase, closureOperationId, CLOSURE_PREVIEW_DIRECTORY } from '../lib/control-state/run-closure.js';
import { readRunOperations, validRunOperation, runClosure } from '../lib/control-state/run-operations.js';
import { readApprovalOperations } from '../lib/control-state/approval-operations.js';
import { canonicalJson, digest, resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { parseRunState } from '../lib/control-state/run-state-parser.js';
import { readPendingRunStepJournal, recoverPendingRunStep } from '../lib/control-state/run-step-transaction.js';
import { pendingRunStepIds } from '../lib/control-state/run-step-pending.js';
import { recordRunStep } from '../lib/control-state/run-steps.js';
import { approveRunGate } from '../lib/control-state/run-recording.js';
import { prepareRunPresentation } from '../lib/control-state/run-presentation.js';
import { createRunCommandService } from '../lib/control-state/run-command-service.js';
import { policyForRunContent } from '../lib/control-evaluation/run-step-policy.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { evaluateDoctor } from '../lib/control-evaluation/doctor.js';
import { intentStages, commitStages, beforeIntent, beforeRunCommit } from './fixtures/transaction-checkpoints.js';

// Synthetic isolated repositories only; no real run of this repository is read or closed.
const roots = [];
const owner = { name: 'Synthetic Owner', email: 'owner@example.invalid', statement: 'cooperative' };
const options = { readIdentity: () => owner };
function repository(name) {
  const root = mkdtempSync(join(tmpdir(), `agdf-closure-${name}-`)); roots.push(root);
  execFileSync('git', ['init', '-q', root]);
  initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en'));
  // Explicit historical planning fixture; fresh initialization no longer creates it.
  writeFileSync(join(root, '.agdf/control/MASTER_BACKLOG.md'), readFileSync(new URL('../../../plugins/agdf/control/templates/MASTER_BACKLOG.md', import.meta.url)));
  return root;
}
const statePath = (root, id) => join(root, '.agdf', 'control', 'runs', id, 'RUN_STATE.md');
const content = (root, id) => readFileSync(statePath(root, id), 'utf8');
const meta = (root, id) => parseRunState(content(root, id), id).meta;
const backlog = root => readFileSync(join(root, '.agdf', 'control', 'MASTER_BACKLOG.md'), 'utf8');
function snapshot(root) {
  const files = new Map(), walk = dir => { for (const name of readdirSync(dir)) {
    const path = join(dir, name), rel = relative(root, path).replaceAll('\\', '/');
    if (rel === CLOSURE_PREVIEW_DIRECTORY) continue;
    if (statSync(path).isDirectory()) walk(path); else files.set(rel, readFileSync(path).toString('base64'));
  } };
  walk(join(root, '.agdf')); return files;
}
const previews = root => existsSync(join(root, CLOSURE_PREVIEW_DIRECTORY)) ? readdirSync(join(root, CLOSURE_PREVIEW_DIRECTORY)).sort() : [];
function backlogRow(root, id, title = `Work ${id}`) {
  const path = join(root, '.agdf', 'control', 'MASTER_BACKLOG.md'), text = readFileSync(path, 'utf8');
  const marker = '## Active Backlog\n\n| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---:|---|---|---|---|---|---|\n';
  assert.ok(text.includes(marker));
  writeFileSync(path, text.replace(marker, `${marker}| P1 | ${id} | ${title} | Needs UR | | | Write the UR |\n`));
}
function endedOrCompleted(root, id, lifecycle) {
  const path = createRun(root, id);
  writeFileSync(path, sealRunState(root, readFileSync(path, 'utf8').replace(/^- lifecycle: active$/mu, `- lifecycle: ${lifecycle}`)));
}
// An in-process quick-task Run with an approved UR, registered artefacts and a recorded review.
function approvedRun(root, runId) {
  createRun(root, runId);
  const artefacts = join(root, '.agdf', 'control', 'artefacts', runId); mkdirSync(artefacts, { recursive: true });
  writeFileSync(join(artefacts, 'UR.md'), `# UR: Approved ${runId}\n\n## Problem\nA small task needs a clear result. The user should review this document before approval.\n\n## Goal\nRecord the task.\n\n## Scope\nIsolated test repository.\n\n## AGDF Approval Summary (de; source=en)\n- Problem: Eine kleine Aufgabe braucht ein klares Ergebnis.\n- Ziel: Abschluss prüfen.\n- Umfang: Nur isolierter Test.\n`);
  const step = (name, values = {}) => recordRunStep(root, { runId, revisionId: meta(root, runId).revision_id, step: name, ...values }, { policy: policyForRunContent, date: '2026-10-28' });
  assert.equal(step('ur', { title: `Approved ${runId}` }).outcome, 'recorded');
  writeFileSync(join(artefacts, 'BROWNFIELD_REVIEW.md'), '# Brownfield Review\n');
  assert.equal(step('route', { route: 'quick_task', reason: 'small', evidence: 'fixture' }).outcome, 'recorded');
  const presentation = prepareRunPresentation(root, { runId, gate: 'UR', revisionId: meta(root, runId).revision_id }, { evaluateGateCheck });
  assert.equal(presentation.outcome, 'prepared', JSON.stringify(presentation));
  assert.equal(approveRunGate(root, { runId, gate: 'UR', revisionId: meta(root, runId).revision_id, response: 'Approval: UR',
    presentationId: presentation.presentation_id }, { evaluateGateCheck }).outcome, 'approved');
  assert.equal(step('review', { decision: 'pass', evidence: 'fixture' }).outcome, 'recorded');
}

try {
  // SCN-001, SCN-002, SCN-023: preview content, header, immutable storage; nothing else changes.
  const root = repository('main');
  for (const id of ['plain-a', 'plain-b', 'plain-c', 'plain-d']) createRun(root, id);
  approvedRun(root, 'approved-run');
  endedOrCompleted(root, 'done-run', 'completed');
  backlogRow(root, 'plain-a', 'Plain A work');
  const entries = [
    { run_id: 'plain-a', outcome: 'abandoned', reason: 'No longer needed' },
    { run_id: 'plain-b', outcome: 'superseded', reason: 'Replaced by plain-c', successor_run: 'plain-c' },
    { run_id: 'plain-c', outcome: 'superseded', reason: 'Moved into a package', successor_reference: 'PR #41' },
    { run_id: 'done-run', outcome: 'abandoned', reason: 'Listed by mistake' },
    { run_id: 'approved-run', outcome: 'abandoned', reason: 'Approved work dropped' },
  ];
  const before = snapshot(root);
  const preview = previewRunClosure(root, { entries });
  assert.equal(preview.outcome, 'preview', JSON.stringify(preview));
  assert.match(preview.preview_id, /^[0-9a-f]{8}$/u);
  assert.equal(preview.confirmation_phrase, `Close runs: ${preview.preview_id}`);
  assert.deepEqual(snapshot(root), before, 'A preview writes no run, receipt or backlog byte');
  assert.deepEqual(previews(root), [`${preview.preview_id}.json`]);
  const stored = JSON.parse(readFileSync(join(root, CLOSURE_PREVIEW_DIRECTORY, `${preview.preview_id}.json`), 'utf8'));
  const { preview_digest: storedDigest, ...storedBody } = stored;
  assert.equal(storedDigest, digest(canonicalJson(storedBody))); assert.equal(storedDigest, preview.preview_digest);
  const lines = preview.text.split('\n');
  const shortDigest = preview.preview_digest.slice('sha256:'.length, 'sha256:'.length + 12);
  assert.equal(lines[0], `Closure preview ${preview.preview_id} · 5 runs · digest ${shortDigest}`);
  assert.match(preview.text, /cannot be reopened, and continuing the work needs a new run/u);
  assert.ok(lines.includes(`To close the closable runs below, reply exactly: Close runs: ${preview.preview_id}`));
  const row = id => preview.entries.find(entry => entry.run_id === id);
  for (const field of ['title', 'current_gate', 'open_approvals', 'last_activity', 'artefact_count']) assert.ok(Object.hasOwn(row('plain-a').facts, field), field);
  assert.equal(row('approved-run').facts.title, 'Approved approved-run');
  assert.deepEqual(row('approved-run').facts.approved_gates, ['UR']);
  assert.ok(row('approved-run').facts.artefact_count >= 2);
  assert.deepEqual(row('approved-run').warnings, ['approved_gates_exist', 'implementation_started']);
  assert.deepEqual(row('plain-c').successor, { kind: 'reference', value: 'PR #41', verified: false });
  assert.deepEqual(row('plain-c').warnings, ['successor_unverified']);
  assert.deepEqual(row('plain-b').successor, { kind: 'run', value: 'plain-c', verified: true });
  assert.deepEqual(row('done-run').not_closable, { reason: 'run_completed', next_action: 'none' });
  assert.equal(preview.closable_count, 4);
  for (const text of ['Gate: UR', 'Open approvals:', 'Last activity:', 'Artefacts:', 'superseded by plain-c', 'superseded by PR #41 (unverified reference)',
    'approved gates exist', 'implementation has started', 'the successor is an unverified free reference', 'Not closable: run_completed']) assert.ok(preview.text.includes(text), text);
  const german = previewRunClosure(root, { entries: entries.slice(0, 1), language: 'de' });
  assert.match(german.text, /^Abschlussvorschau [0-9a-f]{8} · 1 Run · Digest [0-9a-f]{12}\n/u);
  assert.ok(german.text.includes(`genau antworten: Close runs: ${german.preview_id}`), 'The phrase stays English in German output');
  assert.notEqual(german.preview_id, preview.preview_id);
  assert.equal(readFileSync(join(root, CLOSURE_PREVIEW_DIRECTORY, `${preview.preview_id}.json`), 'utf8'), `${JSON.stringify(stored, null, 2)}\n`, 'A second preview never overwrites the first');

  // SCN-003: each invalid entry is refused with its own reason before any write.
  const previewFiles = previews(root);
  for (const [entry, problem] of [
    [{ run_id: 'plain-d', outcome: 'abandoned', reason: '   ' }, 'reason_missing'],
    [{ run_id: 'plain-d', outcome: 'superseded', reason: 'Replaced' }, 'successor_missing'],
    [{ run_id: 'plain-d', outcome: 'superseded', reason: 'Replaced', successor_run: 'no-such-run' }, 'successor_run_unknown'],
    [{ run_id: 'plain-d', outcome: 'superseded', reason: 'Replaced', successor_run: 'plain-d' }, 'successor_run_self'],
    [{ run_id: 'plain-d', outcome: 'closed', reason: 'Replaced' }, 'outcome_invalid'],
    [{ run_id: 'plain-d', outcome: 'abandoned', reason: 'Stop', successor_reference: 'PR #1' }, 'successor_not_allowed'],
  ]) {
    const refused = previewRunClosure(root, { entries: [entries[0], entry] });
    assert.equal(refused.outcome, 'rejected'); assert.equal(refused.reason, 'closure_entries_invalid');
    assert.deepEqual(refused.problems, [{ index: 1, run_id: 'plain-d', problem }]);
    assert.ok(refused.text.includes(`plain-d: ${problem}`), refused.text);
  }
  assert.equal(previewRunClosure(root, { entries: [] }).problems[0].problem, 'entries_invalid');
  assert.deepEqual(previews(root), previewFiles, 'No refused preview is stored');
  assert.deepEqual(snapshot(root), before);

  // SCN-004: only the exact phrase of this stored preview applies; every other attempt changes nothing.
  for (const [input, reason] of [
    [{ previewId: preview.preview_id }, 'confirmation_missing'],
    [{ previewId: preview.preview_id, confirmation: 'Close runs please' }, 'confirmation_mismatch'],
    [{ previewId: preview.preview_id, confirmation: closurePhrase(german.preview_id) }, 'confirmation_other_preview'],
    [{ previewId: 'ffffffff', confirmation: closurePhrase('ffffffff') }, 'preview_unknown'],
    [{ previewId: '../x', confirmation: 'Close runs: ../x' }, 'preview_unknown'],
  ]) {
    const refused = applyRunClosure(root, input, options);
    assert.equal(refused.outcome, 'rejected'); assert.equal(refused.reason, reason); assert.equal(refused.applied, false);
    assert.match(refused.text, /^Nothing was applied\./u);
    assert.deepEqual(snapshot(root), before, reason);
  }
  // SCN-023: a modified preview file fails its digest.
  const tamperedPreview = previewRunClosure(root, { entries: entries.slice(0, 1) });
  const tamperedPath = join(root, CLOSURE_PREVIEW_DIRECTORY, `${tamperedPreview.preview_id}.json`);
  writeFileSync(tamperedPath, readFileSync(tamperedPath, 'utf8').replace('No longer needed', 'Tampered reason'));
  assert.equal(applyRunClosure(root, { previewId: tamperedPreview.preview_id, confirmation: closurePhrase(tamperedPreview.preview_id) }, options).reason, 'preview_invalid');
  assert.deepEqual(snapshot(root), before);

  // SCN-005, SCN-024, SCN-007, SCN-014, SCN-017: a changed run stays active, the others close in preview order.
  const approvedArtefacts = listedArtefactPaths(content(root, 'approved-run')).map(path => [path, artefactFileDigest(root, path)]);
  const approvedReceipts = canonicalJson(readApprovalOperations(content(root, 'approved-run')).receipts);
  const changedRevision = recordRunStep(root, { runId: 'plain-b', revisionId: meta(root, 'plain-b').revision_id, step: 'evidence', evidence: 'Changed after the preview' },
    { policy: policyForRunContent });
  assert.equal(changedRevision.outcome, 'recorded');
  const plainBBefore = readFileSync(statePath(root, 'plain-b')), doneBefore = readFileSync(statePath(root, 'done-run'));
  const applied = applyRunClosure(root, { previewId: preview.preview_id, confirmation: ` ${preview.confirmation_phrase}\n` }, options);
  assert.equal(applied.outcome, 'applied', JSON.stringify(applied));
  assert.deepEqual(applied.results.map(result => [result.run_id, result.result, result.reason ?? null]), [
    ['plain-a', 'closed', null], ['plain-b', 'not_closed', 'changed_since_preview'], ['plain-c', 'closed', null],
    ['done-run', 'not_closed', 'run_completed'], ['approved-run', 'closed', null]]);
  assert.equal(applied.results[1].next_action, 'Create a new preview.');
  assert.equal(applied.closed_count, 3);
  assert.deepEqual(readFileSync(statePath(root, 'plain-b')), plainBBefore, 'The changed run stays active and unchanged');
  assert.deepEqual(readFileSync(statePath(root, 'done-run')), doneBefore, 'A completed run is never written');
  for (const text of [`Closure result ${preview.preview_id} · 3 of 5 closed · digest ${shortDigest}`, 'Confirmed by: Synthetic Owner <owner@example.invalid> (cooperative local Git statement)',
    '1. `plain-a`: closed as abandoned', '2. `plain-b`: not closed: changed_since_preview · Next: Create a new preview.',
    '3. `plain-c`: closed as superseded by PR #41 (unverified reference)']) assert.ok(applied.text.includes(text), text);
  for (const [id, lifecycle] of [['plain-a', 'abandoned'], ['plain-c', 'superseded'], ['approved-run', 'abandoned']]) {
    const current = content(root, id), parsed = parseRunState(current, id);
    assert.equal(parsed.meta.lifecycle, lifecycle); assert.equal(parsed.meta.decision, lifecycle);
    assert.equal(runSealState(root, current).status, 'valid', `${id} seal stays valid`);
    assert.match(current, /^- next_allowed_action: none, run ended$/mu);
    assert.match(current, /\| Run closure \| preview [0-9a-f]{8} \|/u);
    const receipts = readRunOperations(current).receipts, receipt = receipts.at(-1);
    assert.equal(receipt.kind, 'lifecycle_close.record'); assert.ok(validRunOperation(receipt));
    assert.equal(receipt.operation_id, closureOperationId(preview.preview_id, id));
    assert.deepEqual(Object.keys(receipt.effect.record).sort(), ['confirmed_by', 'lifecycle', 'preview', 'reason', 'successor']);
    assert.deepEqual(receipt.effect.record.confirmed_by, owner);
    assert.deepEqual(receipt.effect.record.preview, { id: preview.preview_id, digest: preview.preview_digest });
    assert.deepEqual(receipt.assurance, { lane: 'cooperative_local', reply_provenance: 'caller_forwarded_deliberate_reply', independent_human_proof: 'unavailable' });
    assert.match(receipt.created_at, /^\d{4}-\d{2}-\d{2}T/u);
    assert.equal(runClosure(current).outcome, lifecycle);
  }
  assert.equal(meta(root, 'approved-run').current_gate, 'Quick Task Execution', 'The closure keeps current_gate');
  assert.deepEqual(readRunOperations(content(root, 'plain-c')).receipts.at(-1).effect.record.successor, { kind: 'reference', value: 'PR #41', verified: false });
  assert.deepEqual(listedArtefactPaths(content(root, 'approved-run')).map(path => [path, artefactFileDigest(root, path)]), approvedArtefacts, 'Artefact bytes stay identical');
  assert.equal(canonicalJson(readApprovalOperations(content(root, 'approved-run')).receipts), approvedReceipts, 'Existing receipts stay identical');
  const doctor = evaluateDoctor(root, { runId: 'approved-run' });
  assert.ok(!doctor.findings.some(row => /SEAL|INTEGRITY|BACKLOG_STATUS/u.test(row.code)), JSON.stringify(doctor.findings));
  // A malformed receipt never validates.
  const valid = readRunOperations(content(root, 'plain-c')).receipts.at(-1);
  for (const change of [r => { r.effect.record.reason = ''; }, r => { r.effect.record.successor = null; }, r => { r.effect.record.lifecycle = 'completed'; },
    r => { r.effect.record.confirmed_by = { name: 'x', statement: 'cooperative' }; }, r => { r.effect.record.preview.id = 'xyz'; },
    r => { r.effect.record.successor = { kind: 'run', value: 'plain-c', verified: true }; }, r => { r.effect.record.reason = 'a|b'; }]) {
    const malformed = JSON.parse(JSON.stringify(valid)); change(malformed); assert.equal(validRunOperation(malformed), false);
  }
  // Closing Runs never synchronizes even explicitly linked historical planning rows.
  assert.deepEqual(applied.results.filter(row => row.result === 'closed').map(row => [row.run_id, row.backlog]),
    [['plain-a', 'not_required'], ['plain-c', 'not_required'], ['approved-run', 'not_required']]);
  assert.equal(Buffer.from(backlog(root)).toString('base64'), before.get('.agdf/control/MASTER_BACKLOG.md'));
  assert.ok(!evaluateDoctor(root, {}).findings?.some(row => row.code === 'AGDF_BACKLOG_STATUS_UNKNOWN'));

  // SCN-006: repeating the same apply reports closed runs as already closed and writes nothing.
  const afterApply = snapshot(root);
  const repeated = applyRunClosure(root, { previewId: preview.preview_id, confirmation: preview.confirmation_phrase }, { readIdentity: () => ({ statement: 'unknown' }) });
  assert.deepEqual(repeated.results.map(row => row.result), ['already_closed', 'not_closed', 'already_closed', 'not_closed', 'already_closed']);
  assert.ok(repeated.text.includes('1. `plain-a`: already closed by this preview'));
  assert.deepEqual(snapshot(root), afterApply);

  // SCN-009: completed, already ended and seal-invalid runs are never closed.
  createRun(root, 'broken-seal');
  writeFileSync(statePath(root, 'broken-seal'), content(root, 'broken-seal').replace('## Objective', '## Objective\n\nHand edit without seal.'));
  const later = previewRunClosure(root, { entries: [{ run_id: 'done-run', outcome: 'abandoned', reason: 'x' }, { run_id: 'plain-a', outcome: 'abandoned', reason: 'again' },
    { run_id: 'broken-seal', outcome: 'abandoned', reason: 'broken' }, { run_id: 'missing-run', outcome: 'abandoned', reason: 'gone' }, { run_id: 'plain-d', outcome: 'abandoned', reason: 'Without identity' }] });
  assert.deepEqual(later.entries.map(row => row.not_closable?.reason ?? null), ['run_completed', 'run_already_ended', 'seal_invalid', 'run_missing', null]);
  assert.equal(later.entries[2].not_closable.next_action, 'Repair the run through run-recovery first, then create a new preview.');
  const untouched = ['done-run', 'plain-a', 'broken-seal'].map(id => readFileSync(statePath(root, id)));
  const laterApplied = applyRunClosure(root, { previewId: later.preview_id, confirmation: later.confirmation_phrase }, { readIdentity: () => ({ statement: 'unknown' }) });
  assert.deepEqual(laterApplied.results.map(row => row.result), ['not_closed', 'not_closed', 'not_closed', 'not_closed', 'closed']);
  assert.ok(laterApplied.text.includes('run-recovery'));
  assert.deepEqual(['done-run', 'plain-a', 'broken-seal'].map(id => readFileSync(statePath(root, id))), untouched);
  // AC-006 without a local Git identity: recorded and shown as unknown.
  assert.deepEqual(readRunOperations(content(root, 'plain-d')).receipts.at(-1).effect.record.confirmed_by, { statement: 'unknown' });
  assert.ok(laterApplied.text.includes('Confirmed by: unknown (no local Git identity found)'));

  // SCN-025: the receipt is sealed; a hand edit of it invalidates the seal.
  const closed = content(root, 'plain-c'), operations = readRunOperations(closed);
  const edited = JSON.parse(JSON.stringify(operations.receipts.at(-1))); edited.effect.record.reason = 'Rewritten afterwards';
  const encoded = cell => Buffer.from(canonicalJson(cell)).toString('base64url');
  const forged = closed.replace(encoded(operations.receipts.at(-1)), encoded(edited));
  assert.notEqual(forged, closed); assert.equal(readRunOperations(forged).valid, true);
  assert.notEqual(runSealState(root, forged).status, 'valid');

  // SCN-017: malformed, missing and non-file legacy backlogs are outside closure writes.
  const skipRoot = repository('skip');
  createRun(skipRoot, 'skip-a'); createRun(skipRoot, 'skip-b'); createRun(skipRoot, 'skip-c');
  const skipBacklog = join(skipRoot, '.agdf', 'control', 'MASTER_BACKLOG.md');
  writeFileSync(skipBacklog, backlog(skipRoot).replace('| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |\n|---:|---|---|---|---|---|---|\n\n## Planned',
    '| Key | Something else |\n|---|---|\n\n## Planned'));
  const skipBacklogBytes = readFileSync(skipBacklog);
  const skipPreview = previewRunClosure(skipRoot, { entries: [{ run_id: 'skip-a', outcome: 'abandoned', reason: 'Backlog unusable' }] });
  const skipped = applyRunClosure(skipRoot, { previewId: skipPreview.preview_id, confirmation: skipPreview.confirmation_phrase }, options);
  assert.deepEqual(skipped.results.map(row => [row.result, row.backlog, row.backlog_reason]), [['closed', 'not_required', null]]);
  assert.deepEqual(readFileSync(skipBacklog), skipBacklogBytes);
  rmSync(skipBacklog);
  const missingPreview = previewRunClosure(skipRoot, { entries: [{ run_id: 'skip-b', outcome: 'abandoned', reason: 'Backlog missing' }] });
  assert.deepEqual(applyRunClosure(skipRoot, { previewId: missingPreview.preview_id, confirmation: missingPreview.confirmation_phrase }, options)
    .results.map(row => [row.result, row.backlog, row.backlog_reason]), [['closed', 'not_required', null]]);
  assert.equal(existsSync(skipBacklog), false);
  // CR-F01: a backlog path that is not a regular file (here a directory) never stops a closure.
  mkdirSync(skipBacklog);
  const pathPreview = previewRunClosure(skipRoot, { entries: [{ run_id: 'skip-c', outcome: 'abandoned', reason: 'Backlog path invalid' }] });
  assert.deepEqual(applyRunClosure(skipRoot, { previewId: pathPreview.preview_id, confirmation: pathPreview.confirmation_phrase }, options)
    .results.map(row => [row.result, row.backlog, row.backlog_reason]), [['closed', 'not_required', null]]);
  assert.equal(meta(skipRoot, 'skip-c').lifecycle, 'abandoned'); assert.ok(statSync(skipBacklog).isDirectory());

  // CR-F07: an exception while observing one run marks only that run not closable.
  const factsRoot = repository('facts');
  for (const id of ['facts-a', 'facts-b']) createRun(factsRoot, id);
  const partial = previewRunClosure(factsRoot, { entries: [{ run_id: 'facts-a', outcome: 'abandoned', reason: 'Fine' }, { run_id: 'facts-b', outcome: 'abandoned', reason: 'Broken' }] },
    { beforeFacts: id => { if (id === 'facts-b') throw Error('observation failed'); } });
  assert.equal(partial.outcome, 'preview');
  assert.deepEqual(partial.entries.map(row => [row.closable, row.not_closable?.reason ?? null]), [[true, null], [false, 'run_unreadable']]);

  // CR-F03, CR-F07: a committed Run with pending recovery does not block independent closures.
  const pendingRoot = repository('recovery-pending');
  for (const id of ['rp-1', 'rp-2']) { createRun(pendingRoot, id); backlogRow(pendingRoot, id); }
  const pendingPreview = previewRunClosure(pendingRoot, { entries: [{ run_id: 'rp-1', outcome: 'abandoned', reason: 'First' }, { run_id: 'rp-2', outcome: 'abandoned', reason: 'Second' }] });
  let thrown = false;
  const interrupted = applyRunClosure(pendingRoot, { previewId: pendingPreview.preview_id, confirmation: pendingPreview.confirmation_phrase },
    { ...options, afterWrite: point => { if (point === 'run' && !thrown) { thrown = true; throw Error('simulated failure after the run commit'); } } });
  assert.deepEqual(interrupted.results.map(row => [row.run_id, row.result, row.reason]), [['rp-1', 'closed_recovery_pending', 'run_step_recovery_required'],
    ['rp-2', 'closed', undefined]]);
  assert.equal(interrupted.recovery_pending_count, 1); assert.equal(meta(pendingRoot, 'rp-1').lifecycle, 'abandoned');
  assert.equal(meta(pendingRoot, 'rp-2').lifecycle, 'abandoned');
  assert.ok(interrupted.text.includes('1. `rp-1`: closed as abandoned; Run recovery pending (run_step_recovery_required)'), interrupted.text);
  assert.ok(interrupted.text.includes('2. `rp-2`: closed as abandoned'));
  assert.equal(recoverPendingRunStep(pendingRoot, 'rp-1').status, 'completed');
  assert.deepEqual(applyRunClosure(pendingRoot, { previewId: pendingPreview.preview_id, confirmation: pendingPreview.confirmation_phrase }, options)
    .results.map(row => row.result), ['already_closed', 'already_closed']);

  // SCN-028, SCN-022, SCN-006: an interrupted second closure blocks that Run while independent Runs continue.
  const childUrl = new URL('../lib/control-state/run-closure.js', import.meta.url).href;
  const service = createRunCommandService();
  for (const stage of [...intentStages, ...commitStages].filter(stage => !stage.startsWith('backlog'))) {
    const crashRoot = repository('crash');
    for (const id of ['x1', 'x2', 'y1']) { createRun(crashRoot, id); backlogRow(crashRoot, id); }
    const first = previewRunClosure(crashRoot, { entries: [{ run_id: 'x1', outcome: 'abandoned', reason: 'First' }, { run_id: 'x2', outcome: 'abandoned', reason: 'Second' }] });
    const x2Before = content(crashRoot, 'x2'), legacyBefore = backlog(crashRoot);
    const program = `import { applyRunClosure } from ${JSON.stringify(childUrl)}; let seen = 0;
      applyRunClosure(process.argv[1], { previewId: process.argv[2], confirmation: process.argv[3] }, { readIdentity: () => ({ statement: 'unknown' }),
        afterWrite(point) { if (point === process.argv[4] && ++seen === 2) process.exit(71); } });`;
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', program, crashRoot, first.preview_id, first.confirmation_phrase, stage]);
    assert.equal(child.status, 71, `${stage}: ${child.stderr}`);
    assert.equal(meta(crashRoot, 'x1').lifecycle, 'abandoned', `${stage}: the first run is closed`);
    const journal = !beforeIntent(stage) && stage !== 'retired';
    assert.deepEqual(pendingRunStepIds(crashRoot), journal ? ['x2'] : [], stage);
    if (beforeRunCommit(stage)) assert.equal(content(crashRoot, 'x2'), x2Before, stage);
    if (journal) {
      // SCN-022: a list selecting the pending Run is blocked; an unrelated Run can still record evidence.
      const blocked = previewRunClosure(crashRoot, { entries: [{ run_id: 'x2', outcome: 'abandoned', reason: 'Waits for its own recovery' }] });
      assert.equal(blocked.outcome, 'preview'); assert.deepEqual(blocked.blocked.pending_run_ids, ['x2']); assert.equal(blocked.confirmation_phrase, null);
      assert.ok(blocked.text.includes('Blocked: pending run-step recovery in x2. Recover the pending run step first, then create a new preview.'));
      const y1Before = readFileSync(statePath(crashRoot, 'y1'));
      const refused = applyRunClosure(crashRoot, { previewId: blocked.preview_id, confirmation: closurePhrase(blocked.preview_id) }, options);
      assert.equal(refused.reason, 'closure_recovery_pending'); assert.deepEqual(refused.pending_run_ids, ['x2']);
      assert.equal(recordRunStep(crashRoot, { runId: 'y1', revisionId: meta(crashRoot, 'y1').revision_id, step: 'evidence', evidence: 'x' },
        { policy: policyForRunContent }).outcome, 'recorded');
      assert.notDeepEqual(readFileSync(statePath(crashRoot, 'y1')), y1Before);
      assert.equal(runSealState(crashRoot, content(crashRoot, 'y1')).status, 'valid');
      // The existing operation recovery completes or rolls back the closure of x2.
      const pending = readPendingRunStepJournal(crashRoot, 'x2');
      assert.equal(pending.kind, 'lifecycle_close.record'); assert.deepEqual(pending.outputs, []);
      const recovered = service('agdf_closeout', { schema_version: '1', presentation_language: 'en', working_directory: crashRoot, target_source: 'explicit_target',
        primary_target: crashRoot, target_id: resolveControlCommandTarget(crashRoot).target_id, run_id: 'x2', expected_revision_id: meta(crashRoot, 'x2').revision_id,
        operation_id: closureOperationId(first.preview_id, 'x2'), assurance: 'cooperative_local', command: { kind: 'operation.recover',
          payload: { original_kind: 'lifecycle_close.record', pending_digest: digest(canonicalJson(pending)), recovery_revision_id: meta(crashRoot, 'x2').revision_id } } });
      assert.equal(recovered.outcome, 'accepted', `${stage}: ${JSON.stringify(recovered)}`);
      assert.deepEqual(pendingRunStepIds(crashRoot), []);
      assert.equal(applyRunClosure(crashRoot, { previewId: blocked.preview_id, confirmation: closurePhrase(blocked.preview_id) }, options).reason, 'preview_blocked');
      const fresh = previewRunClosure(crashRoot, { entries: [{ run_id: 'y1', outcome: 'abandoned', reason: 'After recovery' }] });
      assert.equal(fresh.blocked, null);
      assert.equal(applyRunClosure(crashRoot, { previewId: fresh.preview_id, confirmation: fresh.confirmation_phrase }, options).results[0].result, 'closed');
    }
    assert.equal(runSealState(crashRoot, content(crashRoot, 'x2')).status, 'valid', stage);
    const retry = applyRunClosure(crashRoot, { previewId: first.preview_id, confirmation: first.confirmation_phrase }, options);
    assert.deepEqual(retry.results.map(row => row.result), ['already_closed', beforeRunCommit(stage) ? 'closed' : 'already_closed'], `${stage}: ${retry.text}`);
    assert.equal(meta(crashRoot, 'x2').lifecycle, 'abandoned', stage);
    assert.equal(backlog(crashRoot), legacyBefore, stage);
  }
  console.log('Run closure preview, phrase, per-run apply, receipts, preserved legacy planning, refusals and Run-local interruption recovery passed (synthetic only).');
} finally { for (const root of roots) rmSync(root, { recursive: true, force: true }); }
