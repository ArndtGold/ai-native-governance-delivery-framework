import { canonicalJson, digest } from './approval-command-contract.js';
import { canonicalRunText } from './run-seal.js';
import { prepareOwnedOutput } from './run-owned-outputs.js';
import { upsertTableRow, replaceFirstScalar } from './run-state-edits.js';
import { prepareRunContentState } from '../control-evaluation/run-state.js';
import { evaluateVerifiedChange, extractField, parseVerifiedChangePathList, readVerifiedChangeRecord } from '../control-evaluation/verified-change.js';
import { filled, isPlaceholderValue } from '../control-evaluation/shared.js';
import { closeoutConfirmation, closeoutContextDigest } from '../control-evaluation/closeout-readiness.js';

// These exact transient paths belong to the locks/journal of the active recording
// owner. Caller paths, foreign locks and arbitrary suffixes are never ignored.
export function ownedRecordingGitObservation(observation, runId) {
  const transient = new Set([`.agdf/control/runs/${runId}/RUN_STATE.md.lock`, '.agdf/control/MASTER_BACKLOG.md.lock',
    `.agdf/control/runs/${runId}/RUN_STEP_PENDING.json`]);
  return { gitValue: observation?.gitValue, gitPathList(root, args) {
    return observation?.gitPathList?.(root, args)?.filter(p => !transient.has(p)) ?? null;
  } };
}
const invariantFields = ['related_ur', 'escalation_target', 'canonical_owner', 'allowed_source_paths', 'allowed_derived_paths',
  'prohibited_impacts', 'propagation_command', 'validation_commands', 'baseline_commit', 'baseline_tracked_paths', 'baseline_untracked_paths'];
const scalar = (text, key, value) => {
  if ([...text.matchAll(new RegExp(`^- ${key}:.*$`, 'gmu'))].length !== 1) throw Error('verified_change_field_ambiguous');
  return replaceFirstScalar(text, key, value);
};

// Domain preparation inside the existing Run/backlog transaction owner. Core
// still evaluates the same compact eligibility rules as the CLI.
export function prepareVerifiedChangeRecording(root, run, control, before, input, source, gitObservation) {
  const phase = input.step === 'closeout' ? 'closeout' : input.phase;
  const route = control.mode_slice_decision.decision;
  if (control.approvals.get('UR')?.status !== 'approved' || control.meta.lifecycle !== 'active') throw Error('verified_change_not_ready');
  if (phase === 'eligibility') {
    if (!['Brownfield Review', 'Mode/Slice Decision', 'Verified Change Execution'].includes(before.current_gate)
      || control.artefacts.get('Verified Change')?.path) throw Error('verified_change_not_ready');
  } else if (route !== 'verified_change' || !['Verified Change Execution', 'OR'].includes(before.current_gate)) throw Error('verified_change_not_ready');
  const observation = ownedRecordingGitObservation(gitObservation, input.runId);
  const actual = () => ({ head: observation.gitValue?.(root, ['rev-parse', 'HEAD']) ?? null,
    tracked: observation.gitPathList(root, ['diff', 'HEAD', '--name-only']), untracked: observation.gitPathList(root, ['ls-files', '--others', '--exclude-standard']) });
  const seen = actual();
  if (!seen.head || seen.tracked === null || seen.untracked === null) throw Error('verified_change_git_unavailable');
  const path = `.agdf/control/artefacts/${input.runId}/VERIFIED_CHANGE.md`;
  let content = source.content;
  if (phase === 'eligibility') {
    content = scalar(content, 'baseline_commit', seen.head);
    content = scalar(content, 'baseline_tracked_paths', seen.tracked.join(', ') || 'none');
    content = scalar(content, 'baseline_untracked_paths', seen.untracked.join(', ') || 'none');
    if (extractField(content, 'status') !== 'eligible') throw Error('verified_change_status_invalid');
  } else {
    const prior = readVerifiedChangeRecord(root, control);
    if (prior.status !== 'present' || invariantFields.some(key => extractField(prior.content, key) !== extractField(content, key))) throw Error('verified_change_scope_changed');
    if (phase === 'execution') {
      if (!['executed', 'escalated'].includes(extractField(content, 'status'))) throw Error('verified_change_status_invalid');
      const baseline = new Set([...parseVerifiedChangePathList(extractField(prior.content, 'baseline_tracked_paths')),
        ...parseVerifiedChangePathList(extractField(prior.content, 'baseline_untracked_paths'))]);
      const changed = [...new Set([...seen.tracked, ...seen.untracked])].filter(p => !baseline.has(p)).sort();
      content = scalar(content, 'execution_changed_paths', changed.join(', ') || 'none');
    }
  }
  let text = upsertTableRow(run.content, 'Artefacts', 0, 'Verified Change', ['Verified Change', path, extractField(content, 'status'), 'Canonical compact record']);
  const hash = digest(canonicalRunText(content)), proposedArtefacts = new Map([[path, { content, digest: hash }]]);
  const candidate = prepareRunContentState(root, text, run.path, { proposedArtefacts });
  const evaluated = evaluateVerifiedChange(root, candidate, { ...observation, proposedArtefacts });
  if (evaluated.findings.length && evaluated.status !== 'escalated' || phase === 'closeout' && evaluated.status !== 'executed') throw Error('verified_change_validation_failed:' + evaluated.findings.map(f => f.code).join(','));
  if (phase === 'closeout') {
    if (before.current_gate !== 'OR' || ['revise', 'block'].includes(control.context_graph?.gate_effect)) throw Error('verified_change_closeout_not_ready');
    if (!['delivered', 'intentionally_not_delivered', 'residual_risk', 'next_step'].every(key => filled(extractField(content, key)) && !isPlaceholderValue(extractField(content, key)))) throw Error('verified_change_mini_closeout_incomplete');
    if (input.confirmation !== closeoutConfirmation(input.runId, input.revisionId, input.operationId, hash)) throw Error('confirmation_required');
    text = upsertTableRow(text, 'Artefacts', 0, 'OR', ['OR', path, 'done', 'Verified Change Mini-Closeout; same canonical record']);
    text = replaceFirstScalar(text, 'lifecycle', 'completed');
    text = replaceFirstScalar(text, 'decision', 'pass');
  }
  const record = phase === 'closeout' ? { mode: 'verified_change', verified_change: { path, digest: hash }, lifecycle: 'completed',
    context_evidence_digest: closeoutContextDigest(content), confirmation_digest: digest(input.confirmation) } : null;
  // Ignore only the transaction's own new control output when comparing paths.
  const stable = value => canonicalJson({ ...value, tracked: value.tracked?.filter(p => p !== path), untracked: value.untracked?.filter(p => p !== path) });
  return { text, content, path, digest: hash, record, outputs: [prepareOwnedOutput(root, input.runId, path, content)],
    validate() { if (stable(actual()) !== stable(seen)) throw Error('verified_change_git_changed'); } };
}
