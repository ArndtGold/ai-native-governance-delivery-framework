import { createHash } from 'node:crypto';
import { readFileSync } from '../control-read/fs.js';
import { containedRegularFile, hasSymlinkComponent, isSafeControlRelativePath } from '../control-state/contained-file.js';
import { policyForRunContent } from './run-step-policy.js';
import { effectiveNextAllowedAction } from './next-action.js';
import { evaluateQaFollowUp, inspectQaReports } from './qa-follow-up.js';
import { prepareRunContentState, modeSliceDecision } from './run-state.js';
import { extractField } from './verified-change.js';
import { summaryLabel } from './backlog-vocabulary.js';
import { readReportDecision } from './report-decision.js';

// Shared projection; never invokes gate-check, changes control or grants permission. `proposed`
// maps run artefact paths to the content a pending write publishes before its precommit check.
export function runWorkSummary(root, content, runPath = '', decision = policyForRunContent(root, content, runPath), { proposed } = {}) {
  const state = prepareRunContentState(root, content, runPath);
  const runId = extractField(content, 'run_id'), lifecycle = extractField(content, 'lifecycle');
  const policyOnly = modeSliceDecision(state) === 'verified_change' || /## Source Revisions\b/u.test(content);
  const summary = { kind: 'work_pending', phase: decision.current_gate, qa_outcome: 'not_applicable', lifecycle,
    recorded_approvals: [...state.approvals].filter(([, row]) => row.status === 'approved').map(([gate]) => gate),
    decisive_obligation: null, open_obligation_count: 0,
    display_action: policyOnly ? decision.next_allowed_action : effectiveNextAllowedAction(state, decision),
    sources: [], limitations: [], authorizes: false };
  summary.evidence_applicability = Object.fromEntries(['current', 'superseded', 'applicability_unknown'].map(group => [group,
    state.evidence_applicability[group].map(row => ({ path: row.report?.path ?? row.source, step: row.step ?? null, reason: row.reason, available: row.available }))]));
  if (lifecycle === 'completed') summary.kind = decision.completion?.fulfilled ? 'completed' : 'unconfirmed';
  else if (decision.status === 'blocked') summary.kind = 'unconfirmed';
  else if (decision.current_gate === 'OR') summary.kind = 'closeout_pending';
  else if (decision.missing_approval !== 'none') summary.kind = 'approval_pending';
  const qa = state.artefacts.get('QA');
  const structured = ['structured_slice', 'structured_delivery'].includes(modeSliceDecision(state));
  const qaRelevant = structured && (qa?.path || ['QA', 'UAT', 'OR'].includes(decision.current_gate));
  const unconfirmed = reason => { summary.kind = 'source_unconfirmed'; summary.limitations.push(reason);
    summary.display_action = decision.next_allowed_action; };
  if (qaRelevant) {
    summary.qa_outcome = 'unconfirmed';
    const path = String(qa?.path ?? '').replace(/^`|`$/gu, '');
    if (!path) { summary.kind = 'qa_report_pending'; summary.qa_outcome = 'missing'; }
    else if (!isSafeControlRelativePath(path) || /[%?#]/u.test(path) || !path.startsWith(`.agdf/control/artefacts/${runId}/`)
        || hasSymlinkComponent(root, path)) unconfirmed('qa_source_unsafe');
    else {
      const overlay = proposed?.get(path), file = typeof overlay === 'string' ? null : containedRegularFile(root, path);
      if (file && file.status !== 'valid') unconfirmed('qa_source_unavailable');
      else {
        const bytes = file ? readFileSync(file.path) : Buffer.from(overlay);
        let text = '';
        try { if (bytes.length > 262144) throw Error(); text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
        catch { unconfirmed('qa_source_unsupported'); }
        const authoredDecision = readReportDecision(text);
        summary.sources.push({ path, digest: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), state: 'available' });
        const normalized = value => value === 'passed' ? 'pass' : value;
        if (bytes.length > 262144 || !authoredDecision || authoredDecision !== normalized(qa.status)) unconfirmed('qa_decision_unconfirmed');
        else {
          summary.qa_outcome = normalized(qa.status);
          const association = state.evidence_applicability.by_step.get('QA');
          if (association && association.applicability !== 'current') {
            unconfirmed('qa_evidence_association_not_current');
          }
          else if (qa.status === 'revise' && state.qa_acceptance?.accepted) {
            // Human acceptance does not change the original QA outcome or mark tests passed.
            summary.qa_acceptance = { kind: 'accepted_with_deviations', digest: state.qa_acceptance.digest,
              deviation_ids: state.qa_acceptance.proposal.deviations.map(row => row.finding_id) };
            summary.open_obligation_count = state.qa_acceptance.proposal.deviations.length;
            summary.sources = state.qa_acceptance.sources;
          }
          else if (qa.status === 'revise' && state.qa_acceptance?.eligible) {
            summary.kind = 'approval_pending'; summary.sources = state.qa_acceptance.sources;
            summary.open_obligation_count = state.qa_acceptance.proposal.deviations.length;
            summary.qa_acceptance = { kind: 'deviation_acceptance_pending', digest: state.qa_acceptance.digest };
          }
          else if (qa.status === 'revise') {
            const followUp = evaluateQaFollowUp(root, state, runId, 64, true);
            summary.sources = followUp.sources;
            if (followUp.kind === 'blocked') unconfirmed(followUp.reason);
            else {
              summary.kind = { evidence: 'qa_evidence_open', implementation: 'qa_correction_open', upstream: 'qa_source_decision' }[followUp.kind];
              const decisive = followUp.findings.find(f => followUp.kind === 'upstream' ? !['CD+Tests', 'evidence_obligation'].includes(f.target)
                : followUp.kind === 'implementation' ? f.target === 'CD+Tests' : true);
              summary.decisive_obligation = { id: decisive.id, routing_target: decisive.target, action: decisive.action, source_path: decisive.path };
              summary.open_obligation_count = followUp.findings.length;
              summary.display_action = decisive.action + (followUp.kind === 'upstream' ? ' Resolve the source-owner decision before dependent work.' : ' Then rerun QA with refreshed evidence.');
            }
          } else {
            const observation = inspectQaReports(root, state, runId, normalized(qa.status), 64, true, { proposed });
            summary.sources = observation.sources;
            if (observation.kind === 'blocked' || qa.status !== 'block' && observation.findings.length) unconfirmed(observation.reason || 'open_review_findings_contradict_pass');
            else if (qa.status === 'block') { summary.kind = 'qa_blocked'; summary.display_action = decision.next_allowed_action; }
          }
        }
      }
    }
  }
  if (summary.sources.length > 64) { summary.sources = summary.sources.slice(0, 64); unconfirmed('source_limit'); }
  if (Buffer.byteLength(JSON.stringify(summary)) > 60000) {
    summary.decisive_obligation = null; summary.open_obligation_count = 0; summary.sources = [];
    summary.evidence_applicability = { current: [], superseded: [], applicability_unknown: [] };
    summary.limitations = ['summary_size_limit']; summary.kind = 'source_unconfirmed';
    summary.display_action = 'Inspect the current Run and its registered sources before recording a bounded backlog summary.';
  }
  return Object.freeze({ ...summary, status_label: summaryLabel(summary.kind) });
}

// Recheck only already consumed safe sources at the existing mutation precommit boundary.
export function assertSummarySources(root, summary) {
  for (const source of summary.sources) {
    const file = containedRegularFile(root, source.path);
    if (file.status !== 'valid' || hasSymlinkComponent(root, source.path)
      || 'sha256:' + createHash('sha256').update(readFileSync(file.path)).digest('hex') !== source.digest) throw Error('AGDF_STALE_RUN_REVISION');
  }
}
