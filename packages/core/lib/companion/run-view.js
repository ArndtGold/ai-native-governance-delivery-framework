// Companion run view (SD SDD-001, SDD-002): a read-only projection of the unchanged gate-check
// report of each run, beside the run inventory of one project root. It never re-derives a gate
// rule: status fields are copied from the status card verbatim, so every consumer of the run
// view sees exactly what the status card shows. Nothing here writes or authorizes.
import { existsSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { readFileSync, statSync } from '../control-read/fs.js';
import { captureControlScope } from '../control-read/snapshot.js';
import { containedRegularFile, hasSymlinkComponent, isSafeControlRelativePath } from '../control-state/contained-file.js';
import { parseControlState } from '../control-state/run-state-parser.js';
import { runIdentity } from '../control-state/run-title.js';
import { localizedDecisionFields } from '../control-evaluation/decision-content-readiness.js';
import { evaluateGateCheck } from '../control-evaluation/gate-check.js';
import { readRunInventory } from '../control-state/run-inventory-reader.js';
import { runFolderEntries } from '../control-state/run-state-reader.js';
import { readArtefactBindings } from '../control-state/artefact-bindings.js';
import { readEvidenceBindings } from '../control-state/evidence-bindings.js';
import { runRelativePath } from '../control-state/run-identity.js';
import { artefactFileDigest } from '../control-state/run-seal-compute.js';
import { boundedCode } from '../control-inspect/run-classification.js';
import { localizeBlockingCondition, localizeOperationalValue } from '../interaction-presentation.js';
import { interactionLocales, resolveArtifactPresentationLanguages } from '../resources/context.js';
import { deriveFigureState } from './figure-state.js';

export const RUN_VIEW_SCHEMA = 'run-view/1';
export const DIAGNOSIS_REASONS = Object.freeze(['run_version_unsupported', 'run_state_invalid', 'too_large', 'missing']);
// The reader's findings for a run folder without a readable run state: the path finding of
// run-state-reader.js (invalidRun) and the inventory's finding for a run without text (run-inventory.js).
const MISSING_CODES = new Set(['AGDF_RUN_PATH_INVALID', 'AGDF_RUN_STATE_UNAVAILABLE']);
// The classifications run-state-resolver.js treats as unsupported (AGDF_RUN_VERSION_UNSUPPORTED).
const UNSUPPORTED_CLASSIFICATIONS = new Set(['unsupported_version', 'unsupported_layout']);

// Per-run reason of an unreadable run (SD SDD-003) from the reader findings: unsupported by their
// classification, as run-state-resolver.js and the cockpit decide it (CR finding CIR-03), missing
// when only the missing-state findings are present, otherwise invalid. Core reports no size bound
// of its own, so an oversized run state is reported with the reason Core gives it; too_large stays
// reserved for such a bound (contradiction C1).
export function diagnosisReason(findings) {
  if (findings.some(finding => UNSUPPORTED_CLASSIFICATIONS.has(finding.classification))) return 'run_version_unsupported';
  if (findings.length && findings.every(finding => MISSING_CODES.has(finding.code))) return 'missing';
  return 'run_state_invalid';
}

export function projectDiagnosis(entries) {
  const unreadable = entries.filter(entry => !entry.valid).map(entry => ({ run_id: entry.run_id, reason: entry.unreadable_reason ?? 'run_state_invalid', codes: entry.findings }));
  const by_reason = Object.fromEntries(DIAGNOSIS_REASONS.map(reason => [reason, unreadable.filter(row => row.reason === reason).length]));
  return { unreadable, counts: { unreadable: unreadable.length, readable: entries.length - unreadable.length, by_reason } };
}

const NAMING_TEXT_LIMIT = 500;
const UR_READ_LIMIT = 131072;
const bounded = value => (typeof value === 'string' && value.length > NAMING_TEXT_LIMIT ? `${value.slice(0, NAMING_TEXT_LIMIT - 1)}…` : value);

// How a run names itself to a person, read inside the run's own snapshot: the stable title of the
// shared Run title rule (registered UR heading, then the authored Objective; a bare Run ID is no
// title) and the goal in the display language. Where display and artefact language differ, the goal
// is the one the UR's localized approval summary states. An unreadable UR leaves both to the Run document.
export function readRunNaming(root, runId, language = 'en') {
  let content;
  try { content = readFileSync(join(root, runRelativePath(runId, '', 'RUN_STATE.md')), 'utf8'); } catch { return null; }
  let urHeading = '', localizedGoal = null;
  try {
    const path = String(parseControlState(content).artefacts.get('UR')?.path ?? '').replace(/^`|`$/gu, '').trim();
    if (isSafeControlRelativePath(path) && path.startsWith('.agdf/control/') && !hasSymlinkComponent(root, path)) {
      const file = containedRegularFile(root, path);
      if (file.status === 'valid' && statSync(file.path).size <= UR_READ_LIMIT) {
        const text = readFileSync(file.path, 'utf8');
        urHeading = (text.match(/^#\s+(.+)$/mu)?.[1] ?? '').replace(/^UR:\s*/iu, '').trim();
        const sourceLanguage = resolveArtifactPresentationLanguages(root, language).artifact_language;
        localizedGoal = localizedDecisionFields('UR', text, { locale: String(language).split('-')[0], sourceLanguage, path }).fields.goal ?? null;
      }
    }
  } catch (error) { if (error?.code === 'source_changed') throw error; }
  const identity = runIdentity({ runId, runContent: content, urHeading });
  return { run_title: identity.title_source === 'run_id' ? null : bounded(identity.title),
    run_title_source: identity.title_source, goal: bounded(localizedGoal ?? identity.objective) };
}

// One run entry: inventory facts plus, when evaluated, the status card fields of its report.
// `naming` is readRunNaming's result for an evaluated run; without it the inventory names the run.
export function projectRunEntry(inventoryEntry, report, { registry = interactionLocales, language = 'en', naming = null } = {}) {
  const authored = inventoryEntry.title_source === 'objective' ? inventoryEntry.title ?? null : null;
  const base = {
    run_id: inventoryEntry.run_id,
    title: inventoryEntry.title ?? null,
    // The stable human title, the same at every gate; null while only the Run ID could name the run.
    run_title: naming ? naming.run_title : authored,
    run_title_source: naming?.run_title_source ?? (authored ? 'objective' : 'run_id'),
    // The goal in the display language where the UR states one, otherwise the authored objective.
    goal: naming ? naming.goal : inventoryEntry.objective ?? null,
    // The authored objective only, from the shared Run title rule; a template objective or a
    // bare Run ID is no goal (CR finding C2).
    objective: inventoryEntry.objective ?? null,
    lifecycle: inventoryEntry.lifecycle ?? null,
    valid: inventoryEntry.valid !== false,
    revision: inventoryEntry.revision ?? null,
    revision_id: inventoryEntry.revision_id ?? null,
    last_activity: inventoryEntry.last_activity?.at ?? null,
    findings: (inventoryEntry.findings ?? []).map(finding => finding.code),
  };
  if (!base.valid) base.unreadable_reason = diagnosisReason(inventoryEntry.findings ?? []);
  // A run whose evaluation threw is reported with the bounded reason, never as an idle run (CR A7).
  if (report?.evaluation_error) return withFigure({ ...base, evaluated: false, evaluation_error: report.evaluation_error });
  if (!report?.status_card) return withFigure({ ...base, evaluated: false });
  const card = report.status_card;
  return withFigure({
    ...base,
    title: card.humanPresentation?.runTitle ?? base.title,
    evaluated: true,
    completion_confirmed: base.lifecycle === 'completed' && report.completion?.fulfilled === true,
    status: card.status,
    current_gate: card.current_gate,
    path: card.breadcrumb.map(({ gate, status }) => ({ gate, status })),
    missing_approval: card.missing_approval,
    blocking_reason: card.blocking_condition,
    blocking_text: localizeBlockingCondition(card.blocking_condition, { registry, requestedLocale: language }) ?? card.blocking_condition,
    next_step: card.next_step,
    next_step_text: localizeOperationalValue(card.next_step, { registry, requestedLocale: language }) ?? card.next_step,
    user_action_required: card.user_action_required,
    doctor_status: report.doctor_status,
    mode: card.mode_slice_decision ?? card.mode ?? null,
  });
}
const withFigure = entry => ({ ...entry, figure: deriveFigureState(entry) });

// Pure assembly of the versioned view from already evaluated parts.
export function projectRunView({ root, language, store, entries }) {
  return {
    schema_version: RUN_VIEW_SCHEMA,
    root,
    language,
    store,
    diagnosis: projectDiagnosis(entries.filter(entry => entry.listed !== false)),
    runs: entries,
    authorizes: false,
  };
}

// Drift warnings (SD SDD-008, PRD AC-008): documents the run state binds with a recorded digest
// (effective artefact binding destination, latest evidence report per path) whose file now has another
// canonical digest from the node digest owner. Declared input files of a recording are not kept in
// the run state, so only bound documents are compared (contradiction C5 of this run). An unreadable
// run state yields no warning; the status card reports it.
export function readRunDrift(root, runId) {
  let content;
  try { content = readFileSync(join(root, runRelativePath(runId, '', 'RUN_STATE.md')), 'utf8'); } catch { return []; }
  const declared = new Map();
  const artefacts = readArtefactBindings(content);
  // A binding a recorded source revision invalidated is superseded for Core, so its document being
  // re-drafted is no drift (CR finding A5).
  for (const receipt of artefacts.valid ? artefacts.active ?? [] : []) {
    declared.set(receipt.destination.path, { document: receipt.destination.type, digest: receipt.destination.digest });
  }
  const evidence = readEvidenceBindings(content);
  for (const row of evidence.valid ? evidence.bindings : []) {
    declared.set(row.report.path, { document: row.report.path.split('/').at(-1).replace(/\.md$/u, ''), digest: row.report.digest });
  }
  const drift = [];
  for (const [path, { document, digest }] of declared) {
    const current = artefactFileDigest(root, path);
    if (current === digest) continue;
    drift.push({ document, path, recorded_digest: digest, current_digest: /^sha256:/u.test(current) ? current : null });
  }
  return drift;
}

// Active runs are evaluated; terminal and unreadable runs are summarized unless requested by id, so
// neither a large history nor many unreadable runs cost one evaluation per run. An unreadable run's
// reason and figure come from the inventory findings.
const needsEvaluation = (entry, requested) => requested.has(entry.run_id) || (entry.valid && entry.lifecycle === 'active');

// A write that lands during a capture invalidates it (source_changed); the read is repeated a bounded
// number of times before the change is reported (CR delta review RV-1).
export const CAPTURE_ATTEMPTS = 3;
export function captured(readRoot, project, capture = captureControlScope) {
  for (let attempt = 1; ; attempt += 1) {
    try { return capture(readRoot, view => project(view.root)).data; }
    catch (error) { if (error?.code !== 'source_changed' || attempt >= CAPTURE_ATTEMPTS) throw error; }
  }
}

// Reads inside bounded, revalidated control snapshots (TP T-002, SD section 4: captureControlScope,
// CR finding CIR-01): the inventory in one snapshot and each evaluated run with its drift in its own,
// so a read-boundary failure of one run (a linked file, a document outside the control folder, a read
// limit) marks only that run and the readable runs stay listed (SDD-003, RV-2). The root is resolved
// first, as MCP canonicalizes its target, so a junction or symlinked project root reads like its
// target; the view keeps the caller's spelling (RV-3). A missing root has no control folder (RV-5).
export function readRunView(root, { language = 'en', runIds = [] } = {}) {
  const empty = store => projectRunView({ root, language, store, entries: [] });
  if (!existsSync(root)) return empty({ status: 'no_control', reason: null });
  let readRoot;
  try { readRoot = realpathSync(root); } catch (error) { return empty({ status: 'unavailable', reason: boundedCode(error) }); }
  const requested = new Set(runIds);
  const evaluate = runId => {
    try {
      return captured(readRoot, base => {
        const report = evaluateGateCheck(base, { runId, ignoreRunIdEnv: true, presentationLanguage: language });
        return { report, drift: report?.status_card ? readRunDrift(base, runId) : null, naming: readRunNaming(base, runId, language) };
      });
    } catch (error) { return { report: { evaluation_error: boundedCode(error) }, drift: null, naming: null }; }
  };
  const entryOf = (inventoryEntry, evaluated) => {
    const entry = projectRunEntry(inventoryEntry, evaluated?.report ?? null, { language, naming: evaluated?.naming ?? null });
    return entry.evaluated && entry.valid !== false && evaluated.drift ? { ...entry, drift: evaluated.drift } : entry;
  };
  let inventory = null, store;
  try {
    inventory = captured(readRoot, base => readRunInventory(base, { language, observe: false }));
    store = { status: inventory.state === 'absent' ? 'no_control' : 'ok', reason: null };
  } catch (error) {
    store = { status: 'unavailable', reason: boundedCode(error) };
    // An unsupported layout lists no run, but its run folders can be counted, so a consumer names count
    // and reason instead of "no open runs" (PRD AC-002, TP T-004). A failing count leaves the field out.
    if (store.reason === 'control_layout_unsupported') {
      try { store.run_folders = captured(readRoot, base => runFolderEntries(base).length); } catch { /* count unknown */ }
    }
  }
  const listed = inventory?.runs ?? [];
  const entries = listed.map(entry => entryOf(entry, needsEvaluation(entry, requested) ? evaluate(entry.run_id) : null));
  for (const runId of requested) {
    if (listed.some(entry => entry.run_id === runId)) continue;
    // Requested but not listed by the inventory (for example behind an unsupported layout):
    // evaluated for its card, never counted in the diagnosis of listed runs.
    entries.push({ ...entryOf({ run_id: runId, findings: [] }, evaluate(runId)), valid: null, listed: false });
  }
  return projectRunView({ root, language, store, entries });
}
