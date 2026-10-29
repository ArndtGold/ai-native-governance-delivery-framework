import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { atomicWrite, withOwnedFileLock } from './run-state-writer.js';
import { canonicalJson, digest, DIGEST_PATTERN, exactObject, resolveControlCommandTarget } from './approval-command-contract.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { RUN_ID_PATTERN, REVISION_ID_PATTERN, APPROVAL_GATES } from './run-identity.js';
import { parseControlState, parseRunState } from './run-state-parser.js';
import { runSealState, listedArtefactPaths } from './run-seal.js';
import { readRunOperations, closureLine, ENDED_LIFECYCLES } from './run-operations.js';
import { readApprovalOperations } from './approval-operations.js';
import { pendingRunStepIds } from './run-step-pending.js';
import { recordRunStep } from './run-steps.js';
import { policyForRunContent } from '../control-evaluation/run-step-policy.js';
import { readArtefactHeading } from '../control-evaluation/run-state.js';
import { resolveHumanRunTitle } from '../interaction-presentation.js';
import { readGitIdentity } from './git-identity.js';

// Closure of active Runs as superseded or abandoned. A preview is a stored, immutable and
// non-authorizing working file; only the owner's exact phrase applies it, one Run at a time,
// each through the existing run-step journal with its own sealed receipt.
export const CLOSURE_OUTCOMES = Object.freeze(['superseded', 'abandoned']);
export const CLOSURE_LIMITS = Object.freeze({ entries: 64, reason: 1024, reference: 512, preview_bytes: 1048576 });
export const CLOSURE_PREVIEW_DIRECTORY = '.agdf/control/closure-previews';
export const CLOSURE_PREVIEW_ID_PATTERN = /^[0-9a-f]{8}$/u;
export const closurePhrase = previewId => `Close runs: ${previewId}`;
export function closureOperationId(previewId, runId) {
  const hex = createHash('sha256').update(`agdf-run-close/1\0${previewId}\0${runId}`, 'utf8').digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
const previewDigest = body => digest(canonicalJson(body));
const singleLine = value => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f\s]+/gu, ' ').replaceAll('|', '/').trim() : '';
const language = value => String(value ?? '').toLowerCase().startsWith('de') ? 'de' : 'en';
const ENTRY_FIELDS = ['run_id', 'outcome', 'reason', 'successor_run', 'successor_reference'];
const NEXT = Object.freeze({
  run_missing: 'Check the run id, then create a new preview.', run_unreadable: 'Repair the run file, then create a new preview.',
  run_completed: 'none', run_already_ended: 'none', seal_invalid: 'Repair the run through run-recovery first, then create a new preview.',
  changed_since_preview: 'Create a new preview.', not_active: 'none', successor_run_unknown: 'Create a new preview with an existing successor run or a free reference.',
  run_write_locked: 'Retry the apply with the same preview while the run is unchanged.',
  run_step_recovery_required: 'Recover the pending run step, then repeat the same apply.',
  closure_write_failed: 'Repeat the same apply; if it fails again, inspect the run.',
  closed_recovery_pending: 'Recover the pending run step to finish its backlog update, then repeat the same apply.',
  closure_recovery_pending: 'Recover the pending run step first, then create a new preview.',
});
const nextAction = reason => NEXT[reason] ?? 'Inspect the run, then create a new preview.';
const NEXT_DE = Object.freeze({
  run_missing: 'Run-ID prüfen, dann eine neue Vorschau erstellen.', run_unreadable: 'Run-Datei reparieren, dann eine neue Vorschau erstellen.',
  run_completed: 'keiner', run_already_ended: 'keiner', seal_invalid: 'Den Run zuerst über run-recovery reparieren, dann eine neue Vorschau erstellen.',
  changed_since_preview: 'Eine neue Vorschau erstellen.', not_active: 'keiner', successor_run_unknown: 'Eine neue Vorschau mit vorhandenem Nachfolge-Run oder freiem Verweis erstellen.',
  run_write_locked: 'Mit derselben Vorschau erneut anwenden, solange der Run unverändert ist.',
  run_step_recovery_required: 'Den offenen Run-Step wiederherstellen, dann dieselbe Anwendung wiederholen.',
  closure_write_failed: 'Dieselbe Anwendung wiederholen; scheitert sie erneut, den Run prüfen.',
  closed_recovery_pending: 'Den offenen Run-Step wiederherstellen, damit das Backlog nachgezogen wird, dann dieselbe Anwendung wiederholen.',
  closure_recovery_pending: 'Erst den offenen Run-Step wiederherstellen, dann eine neue Vorschau erstellen.',
  preview_unknown: 'Eine neue Vorschau erstellen.', preview_invalid: 'Eine neue Vorschau erstellen.', preview_blocked: 'Eine neue Vorschau erstellen.',
});
const actionDe = (reason, text) => NEXT_DE[reason] ?? (String(reason).startsWith('confirmation_')
  ? text.replace(/^Repeat with the exact phrase (.+)\.$/u, 'Mit dem genauen Satz $1 wiederholen.') : text);

function readRunFile(root, runId) {
  const relative = `.agdf/control/runs/${runId}/RUN_STATE.md`;
  if (!RUN_ID_PATTERN.test(runId ?? '')) return { reason: 'run_missing' };
  if (!existsSync(join(root, relative))) return { reason: 'run_missing' };
  const file = hasSymlinkComponent(root, relative) ? { status: 'invalid' } : containedRegularFile(root, relative);
  if (file.status !== 'valid') return { reason: 'run_unreadable' };
  try {
    const content = readFileSync(file.path, 'utf8'), parsed = parseRunState(content, runId);
    return parsed.valid ? { content, meta: parsed.meta, path: file.path } : { reason: 'run_unreadable' };
  } catch { return { reason: 'run_unreadable' }; }
}

// Refusals name each affected entry before anything is stored.
function entryProblems(root, entries) {
  if (!Array.isArray(entries) || !entries.length || entries.length > CLOSURE_LIMITS.entries) return [{ index: null, run_id: null, problem: 'entries_invalid' }];
  const problems = [], seen = new Set();
  entries.forEach((entry, index) => {
    const add = problem => problems.push({ index, run_id: typeof entry?.run_id === 'string' ? entry.run_id : null, problem });
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry) || Object.keys(entry).some(key => !ENTRY_FIELDS.includes(key))) return add('entry_fields_invalid');
    if (typeof entry.run_id !== 'string' || !RUN_ID_PATTERN.test(entry.run_id)) add('run_id_invalid');
    else if (seen.has(entry.run_id)) add('run_id_duplicate');
    seen.add(entry.run_id);
    if (!CLOSURE_OUTCOMES.includes(entry.outcome)) add('outcome_invalid');
    const reason = singleLine(entry.reason);
    if (!reason) add('reason_missing'); else if (reason.length > CLOSURE_LIMITS.reason) add('reason_too_long');
    const run = entry.successor_run !== undefined, reference = entry.successor_reference !== undefined;
    if (entry.outcome === 'abandoned' && (run || reference)) add('successor_not_allowed');
    if (entry.outcome === 'superseded') {
      if (run && reference) add('successor_ambiguous');
      else if (!run && !reference) add('successor_missing');
      else if (run && entry.successor_run === entry.run_id) add('successor_run_self');
      else if (run && (typeof entry.successor_run !== 'string' || readRunFile(root, entry.successor_run).reason)) add('successor_run_unknown');
      else if (reference && !singleLine(entry.successor_reference)) add('successor_missing');
      else if (reference && singleLine(entry.successor_reference).length > CLOSURE_LIMITS.reference) add('successor_reference_too_long');
    }
  });
  return problems;
}

function lastActivity(content, meta) {
  const stamps = [...readRunOperations(content).receipts.map(row => row.created_at),
    ...readApprovalOperations(content).receipts.map(row => row.created_at)].filter(Boolean).sort();
  return stamps.at(-1) ?? meta.updated_at ?? null;
}

// Per-run facts the owner needs to decide, read only from the sealed Run and its UR heading.
function previewEntry(root, entry) {
  const successor = entry.outcome !== 'superseded' ? null : entry.successor_run !== undefined
    ? { kind: 'run', value: entry.successor_run, verified: true } : { kind: 'reference', value: singleLine(entry.successor_reference), verified: false };
  const row = { run_id: entry.run_id, outcome: entry.outcome, reason: singleLine(entry.reason), successor, revision_id: null,
    closable: false, not_closable: null, facts: null, warnings: [] };
  const run = readRunFile(root, entry.run_id);
  const refuse = reason => ({ ...row, not_closable: { reason, next_action: nextAction(reason) } });
  if (run.reason) return refuse(run.reason);
  const control = parseControlState(run.content, { userGates: APPROVAL_GATES, internalSteps: ['CD+Tests', 'CR'] });
  const approved = APPROVAL_GATES.filter(gate => control.approvals.get(gate)?.status === 'approved');
  const gate = run.meta.current_gate ?? 'unknown';
  row.revision_id = run.meta.revision_id;
  row.facts = { title: resolveHumanRunTitle({ urHeading: readArtefactHeading(root, control.artefacts.get('UR')).replace(/^UR:\s*/iu, ''), runContent: run.content, runId: entry.run_id }),
    lifecycle: run.meta.lifecycle, current_gate: gate, approved_gates: approved,
    open_approvals: APPROVAL_GATES.filter(name => !approved.includes(name) && control.approvals.get(name)?.status !== 'not_applicable'),
    last_activity: lastActivity(run.content, run.meta), artefact_count: listedArtefactPaths(run.content).length };
  if (approved.length) row.warnings.push('approved_gates_exist');
  if (['CD+Tests', 'CR', 'QA', 'UAT', 'OR'].includes(gate) || ['CD+Tests', 'CR'].some(type => ['done', 'revise', 'block'].includes(control.artefacts.get(type)?.status))) row.warnings.push('implementation_started');
  if (successor?.verified === false) row.warnings.push('successor_unverified');
  if (run.meta.lifecycle === 'completed') return refuse('run_completed');
  if (ENDED_LIFECYCLES.includes(run.meta.lifecycle)) return refuse('run_already_ended');
  if (runSealState(root, run.content).status !== 'valid') return refuse('seal_invalid');
  return { ...row, closable: true };
}

// Exclusive creation of one immutable preview file per random 8-hex id, written atomically.
function storePreview(root, body) {
  if (hasSymlinkComponent(root, CLOSURE_PREVIEW_DIRECTORY)) throw Error('AGDF_RUN_PATH_INVALID');
  const directory = join(root, CLOSURE_PREVIEW_DIRECTORY);
  try { mkdirSync(directory); } catch (error) { if (error.code !== 'EEXIST') throw error; }
  if (!statSync(directory).isDirectory()) throw Error('AGDF_RUN_PATH_INVALID');
  for (let attempt = 0; attempt < 16; attempt++) {
    const id = randomBytes(4).toString('hex'), path = join(directory, `${id}.json`);
    const preview = { ...body, preview_id: id };
    const stored = { ...preview, preview_digest: previewDigest(preview) };
    if (withOwnedFileLock(path, () => existsSync(path) ? false : (atomicWrite(path, `${JSON.stringify(stored, null, 2)}\n`), true))) return stored;
  }
  throw Error('AGDF_CLOSURE_PREVIEW_UNAVAILABLE');
}

const validStoredEntry = row => exactObject(row, ['run_id', 'outcome', 'reason', 'successor', 'revision_id', 'closable', 'not_closable', 'facts', 'warnings'])
  && RUN_ID_PATTERN.test(row.run_id) && CLOSURE_OUTCOMES.includes(row.outcome) && closureLine(row.reason, CLOSURE_LIMITS.reason)
  && typeof row.closable === 'boolean' && (!row.closable || REVISION_ID_PATTERN.test(row.revision_id ?? '') && row.not_closable === null)
  && (row.closable || exactObject(row.not_closable, ['reason', 'next_action'])) && Array.isArray(row.warnings);
function readPreview(root, previewId) {
  if (typeof previewId !== 'string' || !CLOSURE_PREVIEW_ID_PATTERN.test(previewId)) return { reason: 'preview_unknown' };
  const relative = `${CLOSURE_PREVIEW_DIRECTORY}/${previewId}.json`;
  if (!existsSync(join(root, relative))) return { reason: 'preview_unknown' };
  const file = hasSymlinkComponent(root, relative) ? { status: 'invalid' } : containedRegularFile(root, relative);
  if (file.status !== 'valid' || statSync(file.path).size > CLOSURE_LIMITS.preview_bytes) return { reason: 'preview_invalid' };
  try {
    const stored = JSON.parse(readFileSync(file.path, 'utf8')), { preview_digest: recorded, ...body } = stored;
    if (!exactObject(stored, ['schema_version', 'preview_id', 'created_at', 'target_id', 'blocked', 'entries', 'preview_digest'])
      || stored.schema_version !== '1' || stored.preview_id !== previewId || !DIGEST_PATTERN.test(recorded ?? '') || recorded !== previewDigest(body)
      || stored.target_id !== resolveControlCommandTarget(root).target_id || !Array.isArray(stored.entries)
      || !stored.entries.length || stored.entries.length > CLOSURE_LIMITS.entries || !stored.entries.every(validStoredEntry)) return { reason: 'preview_invalid' };
    return { preview: stored };
  } catch { return { reason: 'preview_invalid' }; }
}

function safePreviewEntry(root, entry, beforeFacts) {
  try { beforeFacts?.(entry.run_id); return previewEntry(root, entry); }
  catch {
    return { run_id: entry.run_id, outcome: entry.outcome, reason: singleLine(entry.reason), successor: null, revision_id: null, closable: false,
      not_closable: { reason: 'run_unreadable', next_action: nextAction('run_unreadable') }, facts: null, warnings: [] };
  }
}

// `beforeFacts` is a package-owned test seam for a failing per-run observation.
export function previewRunClosure(root, { entries, language: requested } = {}, { beforeFacts } = {}) {
  const lang = language(requested);
  const problems = entryProblems(root, entries);
  if (problems.length) return finish({ schema_version: '1', outcome: 'rejected', reason: 'closure_entries_invalid', problems,
    next_action: 'Add the reason, add or correct the successor, give a free reference, or choose abandoned; then request a new preview.', authorizes: false }, lang);
  const pending = pendingRunStepIds(root);
  let stored;
  try {
    stored = storePreview(root, { schema_version: '1', created_at: new Date().toISOString(), target_id: resolveControlCommandTarget(root).target_id,
      blocked: pending.length ? { reason: 'closure_recovery_pending', pending_run_ids: pending, next_action: nextAction('closure_recovery_pending') } : null,
      entries: entries.map(entry => safePreviewEntry(root, entry, beforeFacts)) });
  } catch { return finish({ schema_version: '1', outcome: 'rejected', reason: 'closure_preview_unavailable', authorizes: false }, lang); }
  return finish({ schema_version: '1', outcome: 'preview', preview_id: stored.preview_id, preview_digest: stored.preview_digest,
    preview_path: `${CLOSURE_PREVIEW_DIRECTORY}/${stored.preview_id}.json`, confirmation_phrase: stored.blocked ? null : closurePhrase(stored.preview_id),
    run_count: stored.entries.length, closable_count: stored.entries.filter(row => row.closable).length, blocked: stored.blocked,
    entries: stored.entries, authorizes: false }, lang);
}

function closeEntry(root, preview, entry, confirmedBy, { packageVersion, afterWrite }) {
  const base = { run_id: entry.run_id, outcome: entry.outcome, successor: entry.successor };
  const notClosed = (reason, extra = {}) => ({ ...base, result: 'not_closed', reason, next_action: nextAction(reason), ...extra });
  if (!entry.closable) return { ...base, result: 'not_closed', ...entry.not_closable };
  if (entry.successor?.kind === 'run' && readRunFile(root, entry.successor.value).reason) return notClosed('successor_run_unknown');
  const record = { lifecycle: entry.outcome, reason: entry.reason, successor: entry.successor, confirmed_by: confirmedBy,
    preview: { id: preview.preview_id, digest: preview.preview_digest } };
  const context = { kind: 'lifecycle_close.record', operation_id: closureOperationId(preview.preview_id, entry.run_id), target_id: preview.target_id,
    request_digest: digest(canonicalJson({ contract: 'agdf-run-close/1', preview_id: preview.preview_id, preview_digest: preview.preview_digest,
      run_id: entry.run_id, revision_id: entry.revision_id, lifecycle: entry.outcome, reason: entry.reason, successor: entry.successor })) };
  let result;
  try {
    result = recordRunStep(root, { runId: entry.run_id, revisionId: entry.revision_id, step: 'lifecycle_close', closure: record },
      { policy: policyForRunContent, packageVersion, operationContext: context, afterWrite });
  } catch (error) { return notClosed('closure_write_failed', { detail: String(error?.message ?? error).slice(0, 256) }); }
  if (result.outcome === 'recorded') return { ...base, result: 'closed', operation_id: context.operation_id, revision_id: result.revision_id,
    backlog: result.backlog === 'missing' ? 'skipped' : result.backlog, backlog_reason: result.backlog_reason ?? null };
  if (result.outcome === 'already_applied') return { ...base, result: 'already_closed', operation_id: context.operation_id };
  const reason = { stale_revision: 'changed_since_preview', lifecycle_ended: 'not_active' }[result.reason] ?? result.reason;
  if (result.committed) return { ...base, result: 'closed_recovery_pending', reason, operation_id: context.operation_id, revision_id: result.revision_id,
    next_action: nextAction('closed_recovery_pending') };
  return notClosed(reason);
}

export function applyRunClosure(root, { previewId, confirmation, language: requested } = {}, { packageVersion = '0.14.5', afterWrite, readIdentity = readGitIdentity } = {}) {
  const lang = language(requested);
  const refuse = (reason, extra = {}) => finish({ schema_version: '1', outcome: 'rejected', reason, preview_id: typeof previewId === 'string' ? previewId : null,
    applied: false, next_action: extra.next_action ?? { preview_unknown: 'Create a new preview.', preview_invalid: 'Create a new preview.', preview_blocked: 'Create a new preview.' }[reason]
      ?? `Repeat with the exact phrase ${CLOSURE_PREVIEW_ID_PATTERN.test(previewId ?? '') ? closurePhrase(previewId) : 'of the preview'}.`, ...extra, authorizes: false }, lang);
  const loaded = readPreview(root, previewId);
  if (loaded.reason) return refuse(loaded.reason);
  const preview = loaded.preview, phrase = closurePhrase(preview.preview_id), reply = typeof confirmation === 'string' ? confirmation.trim() : '';
  if (!reply) return refuse('confirmation_missing');
  if (reply !== phrase) return refuse(/^Close runs: [0-9a-f]{8}$/u.test(reply) ? 'confirmation_other_preview' : 'confirmation_mismatch');
  const pending = pendingRunStepIds(root);
  if (pending.length) return refuse('closure_recovery_pending', { pending_run_ids: pending, next_action: nextAction('closure_recovery_pending') });
  if (preview.blocked) return refuse('preview_blocked');
  const confirmedBy = readIdentity(root);
  const results = preview.entries.map(entry => closeEntry(root, preview, entry, confirmedBy, { packageVersion, afterWrite }));
  return finish({ schema_version: '1', outcome: 'applied', preview_id: preview.preview_id, preview_digest: preview.preview_digest, applied: true,
    confirmed_by: confirmedBy, closed_count: results.filter(row => row.result === 'closed').length,
    recovery_pending_count: results.filter(row => row.result === 'closed_recovery_pending').length, run_count: results.length, results, authorizes: false }, lang);
}

// Rendering in German or English; the confirmation phrase is always the fixed English text.
const COPY = {
  en: { previewHeading: (id, n, d) => `Closure preview ${id} · ${n} run${n === 1 ? '' : 's'} · digest ${d}`,
    finality: 'A closed run is final: it cannot be reopened, and continuing the work needs a new run.',
    phrase: phrase => `To close the closable runs below, reply exactly: ${phrase}`,
    blocked: ids => `Blocked: pending run-step recovery in ${ids.join(', ')}. ${NEXT.closure_recovery_pending}`, action: (reason, text) => text,
    gate: 'Gate', open: 'Open approvals', activity: 'Last activity', artefacts: 'Artefacts', none: 'none', unknown: 'unknown',
    outcome: row => row.outcome === 'superseded' ? `superseded by ${row.successor.value}${row.successor.verified ? '' : ' (unverified reference)'}` : 'abandoned',
    outcomeLabel: 'Outcome', reasonLabel: 'Reason', warningsLabel: 'Warnings', next: 'Next',
    warnings: { approved_gates_exist: 'approved gates exist', implementation_started: 'implementation has started', successor_unverified: 'the successor is an unverified free reference' },
    notClosable: 'Not closable', resultHeading: (id, closed, n, d) => `Closure result ${id} · ${closed} of ${n} closed · digest ${d}`,
    recoveryPending: row => `closed as ${row.outcome}; backlog recovery pending (${row.reason})`,
    confirmedBy: 'Confirmed by', cooperative: 'cooperative local Git statement', unknownPerson: 'unknown (no local Git identity found)',
    closed: row => `closed as ${row.outcome === 'superseded' ? `superseded by ${row.successor.value}${row.successor.verified ? '' : ' (unverified reference)'}` : 'abandoned'}`,
    already: 'already closed by this preview', notClosed: 'not closed', backlog: 'Backlog', backlogState: value => value,
    rejected: 'Nothing was applied.', refusal: 'Refused; no preview was stored.' },
  de: { previewHeading: (id, n, d) => `Abschlussvorschau ${id} · ${n} ${n === 1 ? 'Run' : 'Runs'} · Digest ${d}`,
    finality: 'Ein geschlossener Run ist endgültig: Er kann nicht wieder geöffnet werden; für weitere Arbeit braucht es einen neuen Run.',
    phrase: phrase => `Zum Schließen der schließbaren Runs genau antworten: ${phrase}`,
    blocked: ids => `Blockiert: offene Run-Step-Wiederherstellung in ${ids.join(', ')}. ${NEXT_DE.closure_recovery_pending}`, action: actionDe,
    gate: 'Gate', open: 'Offene Freigaben', activity: 'Letzte Aktivität', artefacts: 'Artefakte', none: 'keine', unknown: 'unbekannt',
    outcome: row => row.outcome === 'superseded' ? `ersetzt durch ${row.successor.value}${row.successor.verified ? '' : ' (ungeprüfter Verweis)'}` : 'aufgegeben',
    outcomeLabel: 'Ergebnis', reasonLabel: 'Grund', warningsLabel: 'Warnungen', next: 'Nächster Schritt',
    warnings: { approved_gates_exist: 'es gibt freigegebene Gates', implementation_started: 'die Umsetzung hat begonnen', successor_unverified: 'der Nachfolger ist ein ungeprüfter freier Verweis' },
    notClosable: 'Nicht schließbar', resultHeading: (id, closed, n, d) => `Abschlussergebnis ${id} · ${closed} von ${n} geschlossen · Digest ${d}`,
    recoveryPending: row => `geschlossen als ${row.outcome === 'superseded' ? 'ersetzt' : 'aufgegeben'}; Backlog-Wiederherstellung offen (${row.reason})`,
    confirmedBy: 'Bestätigt durch', cooperative: 'kooperative Angabe aus der lokalen Git-Identität', unknownPerson: 'unbekannt (keine lokale Git-Identität gefunden)',
    closed: row => `geschlossen als ${row.outcome === 'superseded' ? `ersetzt durch ${row.successor.value}${row.successor.verified ? '' : ' (ungeprüfter Verweis)'}` : 'aufgegeben'}`,
    already: 'bereits durch diese Vorschau geschlossen', notClosed: 'nicht geschlossen', backlog: 'Backlog',
    backlogState: value => ({ updated: 'aktualisiert', unlinked: 'keine Backlog-Zeile', skipped: 'übersprungen', unchanged: 'unverändert' })[value] ?? value,
    rejected: 'Es wurde nichts angewendet.', refusal: 'Abgelehnt; es wurde keine Vorschau gespeichert.' },
};
const shortDigest = value => String(value ?? '').replace(/^sha256:/u, '').slice(0, 12);
export function renderRunClosure(result, requested) {
  const c = COPY[language(requested)], lines = [];
  if (result.outcome === 'preview') {
    lines.push(c.previewHeading(result.preview_id, result.run_count, shortDigest(result.preview_digest)), c.finality);
    lines.push(result.blocked ? c.blocked(result.blocked.pending_run_ids) : c.phrase(result.confirmation_phrase), '');
    result.entries.forEach((row, i) => {
      lines.push(`${i + 1}. ${row.facts?.title ?? row.run_id} · \`${row.run_id}\``);
      if (row.facts) lines.push(`   ${c.gate}: ${row.facts.current_gate} · ${c.open}: ${row.facts.open_approvals.join(', ') || c.none} · ${c.activity}: ${row.facts.last_activity ?? c.unknown} · ${c.artefacts}: ${row.facts.artefact_count}`);
      lines.push(`   ${c.outcomeLabel}: ${c.outcome(row)}`, `   ${c.reasonLabel}: ${row.reason}`);
      if (row.warnings.length) lines.push(`   ${c.warningsLabel}: ${row.warnings.map(key => c.warnings[key] ?? key).join('; ')}`);
      if (!row.closable) lines.push(`   ${c.notClosable}: ${row.not_closable.reason} · ${c.next}: ${c.action(row.not_closable.reason, row.not_closable.next_action)}`);
    });
  } else if (result.outcome === 'applied') {
    const person = result.confirmed_by.statement === 'unknown' ? c.unknownPerson
      : `${[result.confirmed_by.name, result.confirmed_by.email && `<${result.confirmed_by.email}>`].filter(Boolean).join(' ')} (${c.cooperative})`;
    lines.push(c.resultHeading(result.preview_id, result.closed_count, result.run_count, shortDigest(result.preview_digest)), `${c.confirmedBy}: ${person}`, '');
    result.results.forEach((row, i) => {
      lines.push(`${i + 1}. \`${row.run_id}\`: ${row.result === 'closed' ? c.closed(row) : row.result === 'already_closed' ? c.already
        : row.result === 'closed_recovery_pending' ? `${c.recoveryPending(row)} · ${c.next}: ${c.action(row.result, row.next_action)}`
        : `${c.notClosed}: ${row.reason} · ${c.next}: ${c.action(row.reason, row.next_action)}`}`);
      if (row.result === 'closed') lines.push(`   ${c.backlog}: ${c.backlogState(row.backlog)}${row.backlog_reason ? ` (${row.backlog_reason})` : ''}`);
    });
  } else {
    lines.push(`${result.problems ? c.refusal : c.rejected} ${result.reason}`);
    for (const problem of result.problems ?? []) lines.push(`- ${problem.run_id ?? `#${problem.index ?? '-'}`}: ${problem.problem}`);
    if (result.pending_run_ids) lines.push(`- ${result.pending_run_ids.join(', ')}`);
    if (result.next_action) lines.push(`${c.next}: ${c.action(result.reason, result.next_action)}`);
  }
  return lines.join('\n');
}
const finish = (result, lang) => Object.freeze({ ...result, presentation_language: lang, text: renderRunClosure(result, lang) });
