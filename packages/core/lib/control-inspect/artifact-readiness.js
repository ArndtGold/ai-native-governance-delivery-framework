import { readFileSync } from '../control-read/fs.js';
import { join } from 'node:path';
import { captureControlScope } from '../control-read/snapshot.js';
import { readRunState } from '../control-evaluation/run-state.js';
import { evaluateGateCheck } from '../control-evaluation/gate-check.js';
import { evaluatePrdReadiness } from '../control-evaluation/prd-readiness.js';
import { evaluateUrReadiness } from '../control-evaluation/ur-readiness.js';
import { evaluateSdReadiness } from '../control-evaluation/sd-readiness.js';
import { evaluateSdTraceability, evaluateTpTraceability } from '../control-evaluation/traceability-readiness.js';
import { resolveArtifactPresentationLanguages } from '../resources/context.js';
import { evaluateApprovalSummaryReadiness } from '../control-state/run-presentation-render.js';
import { artefactFileDigest, runSealState } from '../control-state/run-seal.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';
import { extractField } from '../control-evaluation/verified-change.js';

export const ARTIFACT_READINESS_GATES = Object.freeze(['UR', 'PRD', 'SD', 'TP']);

// Describes the original author's findings; it does not validate or change gate policy.
export function describeArtifactReadiness(result) {
  const names = new Set(['approval_summary', 'prd_readiness', 'ur_readiness', 'sd_decisions', 'sd_traceability', 'tp_traceability',
    'approval_summary_locale_missing', 'approval_summary_locale_duplicate', 'approval_summary_source_language_mismatch',
    'approval_summary_truncated_or_overlong', 'approval_summary_field_overlong', 'approval_summary_criteria_missing',
    'approval_summary_source_criteria_duplicate', 'approval_summary_criteria_duplicate', 'approval_summary_criteria_unknown',
    'approval_summary_criteria_incomplete', 'approval_summary_user_goal_missing', 'approval_summary_scope_missing',
    'approval_summary_decisions_missing', 'approval_summary_criterion_content_missing', 'approval_summary_content_missing']);
  let findings = result.diagnostics.filter(row => names.has(row.code));
  const readinessOwner = { AGDF_UR_REQUIREMENTS_INCOMPLETE: 'ur', AGDF_PRD_DECISIONS_OPEN: 'prd',
    AGDF_SD_DECISIONS_OPEN: 'sd', AGDF_SD_TRACEABILITY_INCOMPLETE: 'traceability', AGDF_TP_TRACEABILITY_INCOMPLETE: 'traceability' };
  const key = readinessOwner[result.blocking_reason];
  const details = key && result.current_gate === result.gate && result.readiness_details?.[key];
  const items = details && (details.open_items ?? details.open_decisions);
  if (result.diagnostics.length === 1 && result.diagnostics[0].code === 'artifact_gate_not_ready'
      && Array.isArray(items) && items.length && items.every(item => typeof item === 'string' && item.trim())) {
    findings = items.map(message => ({ code: result.blocking_reason, message }));
  }
  const corrections = findings.length > 0 && (result.diagnostics.every(row => names.has(row.code))
    || result.diagnostics.length === 1 && result.diagnostics[0].code === 'artifact_gate_not_ready' && !!key && !!details);
  return { state: result.ready ? 'passed' : corrections ? 'corrections_required' : 'unavailable',
    reason: result.diagnostics[0]?.code ?? null, recovery: result.ready || corrections ? 'authoring' : 'reload',
    findings: corrections ? findings : [] };
}

// Runs only inside the caller's bounded captured view. Both consumers use these same validators.
export function projectArtifactReadiness(root, { runId, gate, expectedRevisionId, presentationLanguage }) {
  const path = `.agdf/control/artefacts/${runId}/${gate}.md`;
  const targetRoot = root;
  const diagnostics = [], checks = [];
  let state, revision = null, digest = null;
  const report = () => ({
    run_id: runId, gate, expected_revision_id: expectedRevisionId, revision_id: revision,
    artifact_path: path, artifact_digest: digest, ready: diagnostics.length === 0,
    readiness_scope: 'authoring_checks', authorizes: false, semantic_review_required: true,
    registration_required: true, presentation_required: true, checks, diagnostics,
    next_action: diagnostics.length ? 'Correct the reported issue through its existing owner, then recheck this run and revision.'
      : 'Review semantic derivation and record through the existing canonical writer; then obtain a fresh presentation and deliberate approval.',
  });
  const fail = (code, message) => { diagnostics.push({ code, message }); return report(); };
  if (!ARTIFACT_READINESS_GATES.includes(gate)) return fail('artifact_gate_invalid', 'This gate has no supported draft artifact.');
  state = readRunState(targetRoot, { runId, ignoreRunIdEnv: true });
  if (!state.content || state.resolution_error || state.identity_findings.length
      || state.path !== join('.agdf', 'control', 'runs', runId, 'RUN_STATE.md')
      || extractField(state.content, 'run_id') !== runId)
    return fail('artifact_run_invalid', 'The explicitly selected canonical run is unavailable or invalid.');
  revision = extractField(state.content, 'revision_id');
  if (revision !== expectedRevisionId) return fail('artifact_revision_stale', 'Use a fresh selected-run revision; this check cannot adopt a newer revision.');
  if (extractField(state.content, 'lifecycle') !== 'active') return fail('artifact_run_inactive', 'Only an active selected run can be checked.');
  if (runSealState(targetRoot, state.content).status !== 'valid') return fail('artifact_run_integrity', 'Resolve the existing run/source integrity issue before draft checks.');
  if (state.approvals.get(gate)?.status === 'approved') return fail('artifact_already_approved', 'An approved source is outside draft authoring checks.');
  const evaluated = evaluateGateCheck(targetRoot, { runId, ignoreRunIdEnv: true, presentationLanguage });
  if (evaluated.status !== 'open' || evaluated.current_gate !== gate) {
    const blocked = fail('artifact_gate_not_ready', 'Resolve the current canonical gate or blocker before checking this draft.');
    return { ...blocked, current_gate: evaluated.current_gate, blocking_reason: evaluated.blocking_reason,
      readiness_details: {
        ur: evaluated.ur_readiness ?? null, prd: evaluated.prd_readiness ?? null,
        sd: evaluated.sd_readiness ?? null, traceability: evaluated.traceability_readiness ?? null,
      },
      next_action: evaluated.next_allowed_action };
  }
  const registered = state.artefacts.get(gate)?.path;
  if (registered && registered !== path) return fail('artifact_path_conflict', 'The existing registered source differs from the canonical draft path.');
  const file = containedRegularFile(targetRoot, path);
  if (hasSymlinkComponent(targetRoot, path) || file.status !== 'valid') return fail('artifact_source_unavailable', 'The contained canonical draft is missing or unsafe.');
  const content = readFileSync(file.path, 'utf8');
  digest = artefactFileDigest(targetRoot, path);
  const languages = resolveArtifactPresentationLanguages(targetRoot, presentationLanguage);
  const summary = evaluateApprovalSummaryReadiness(gate, content, languages);
  checks.push({ name: 'approval_summary', ...summary });
  if (!summary.ready) diagnostics.push({ code: summary.reason, message: `Prepare ${summary.required_heading} using the existing summary rules.` });
  // Supply only an in-memory draft pointer; no Run, approval or binding is written.
  const candidate = { ...state, artefacts: new Map(state.artefacts) };
  candidate.artefacts.set(gate, { path, status: 'draft' });
  const add = (name, result) => {
    checks.push({ name, ...result });
    if (!result.ready && !(result.open_decisions ?? result.open_items ?? []).length) diagnostics.push({ code: name, message: 'The existing content validator reports an unready draft.' });
    for (const message of result.open_decisions ?? result.open_items ?? []) diagnostics.push({ code: name, message });
  };
  if (gate === 'UR') add('ur_readiness', evaluateUrReadiness(targetRoot, candidate, { presentationLanguage }));
  if (gate === 'PRD') add('prd_readiness', evaluatePrdReadiness(targetRoot, candidate, { presentationLanguage }));
  if (gate === 'SD') {
    add('sd_decisions', evaluateSdReadiness(targetRoot, candidate));
    add('sd_traceability', evaluateSdTraceability(targetRoot, candidate));
  }
  if (gate === 'TP') add('tp_traceability', evaluateTpTraceability(targetRoot, candidate));
  return report();
}

// Standalone authoring preflight retains its original captured/read-only report contract.
export function inspectArtifactReadiness(root, input) {
  const { runId, gate, expectedRevisionId } = input;
  const path = `.agdf/control/artefacts/${runId}/${gate}.md`;
  try {
    return captureControlScope(root, view => projectArtifactReadiness(view.root, input)).data;
  } catch (error) {
    if (!['resource_denied', 'source_changed', 'resource_limit', 'timeout', 'read_failed'].includes(error.code)) throw error;
    return { run_id: runId, gate, expected_revision_id: expectedRevisionId, revision_id: null,
      artifact_path: path, artifact_digest: null, ready: false, readiness_scope: 'authoring_checks',
      authorizes: false, semantic_review_required: true, registration_required: true, presentation_required: true,
      checks: [], diagnostics: [{ code: `artifact_read_${error.code}`, message: 'A safe stable draft/source snapshot could not be captured.' }],
      next_action: 'Resolve the source boundary or obtain a fresh stable source snapshot, then repeat the bound read-only check.' };
  }
}
