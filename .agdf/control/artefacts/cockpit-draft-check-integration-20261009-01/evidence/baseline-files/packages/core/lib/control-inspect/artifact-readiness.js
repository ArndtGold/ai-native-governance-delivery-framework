import { readFileSync } from '../control-read/fs.js';
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

// Authoring preflight, not registration or approval readiness. All reads share a bounded,
// revalidated snapshot; the same content validators remain owned by the gate/presentation code.
export function inspectArtifactReadiness(root, { runId, gate, expectedRevisionId, presentationLanguage }) {
  const path = `.agdf/control/artefacts/${runId}/${gate}.md`;
  try {
    const { data } = captureControlScope(root, view => {
      const targetRoot = view.root;
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
          || state.path !== `.agdf/control/runs/${runId}/RUN_STATE.md`
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
    });
    return data;
  } catch (error) {
    if (!['resource_denied', 'source_changed', 'resource_limit', 'timeout', 'read_failed'].includes(error.code)) throw error;
    return { run_id: runId, gate, expected_revision_id: expectedRevisionId, revision_id: null,
      artifact_path: path, artifact_digest: null, ready: false, readiness_scope: 'authoring_checks',
      authorizes: false, semantic_review_required: true, registration_required: true, presentation_required: true,
      checks: [], diagnostics: [{ code: `artifact_read_${error.code}`, message: 'A safe stable draft/source snapshot could not be captured.' }],
      next_action: 'Resolve the source boundary or obtain a fresh stable source snapshot, then repeat the bound read-only check.' };
  }
}
