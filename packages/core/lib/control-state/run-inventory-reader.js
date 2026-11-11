import { readControlLayout } from './control-layout.js';
import { prepareRunContentState, readArtefactHeading } from '../control-evaluation/run-state.js';
import { transitionDecisionForRunState } from '../control-evaluation/gate-policy.js';
import { evaluateGateCheck } from '../control-evaluation/gate-check.js';
import { projectCockpitAssessment } from '../control-inspect/run-classification.js';
import { projectWorkSituation } from '../control-inspect/work-situation.js';
import { runClosure } from './run-operations.js';
import { existsSync } from "../control-read/fs.js";
import { join } from "node:path";
import { discoverRuns } from "./run-state-reader.js";
import { buildRunInventory } from "./run-inventory.js";
import { parseControlState } from './run-state-parser.js';
import { runSealState, listedArtefactPaths } from './run-seal.js';
import { isSafeControlRelativePath } from './contained-file.js';

const READ_BOUNDARY_CODES = ['source_changed', 'resource_limit', 'resource_denied', 'timeout'];
const inControlScope = path => isSafeControlRelativePath(path) && path.startsWith('.agdf/control/');
// The detail reader's boundary: a run registering sources outside .agdf/control cannot be proven here.
const registersOnlyControlSources = content => listedArtefactPaths(content).every(inControlScope);

// Feeds the pure inventory from the run discovery of the current read view: each run's parsed text
// and, when the full parser rejected it, its findings. No run state is read a second time. `observe: false`
// skips the per-run gate observation, which reads registered documents, for a caller that evaluates the
// runs itself (the companion run view, which reads each run in its own captured snapshot).
// `cockpitAssessment` evaluates active runs only, like the companion run view: terminal runs stay
// summarized history, so a long history costs no gate evaluation per run and per refresh.
export function readRunInventory(root, { language = "en", observe = true, includePresentation = false, cockpitAssessment = false } = {}) {
  if (!existsSync(join(root, '.agdf/control'))) return buildRunInventory(null, { language });
  readControlLayout(root);
  if (!existsSync(join(root, '.agdf/control/runs'))) return buildRunInventory([], { language,
    findings: [{ code: 'AGDF_RUN_STORE_MISSING', path: '.agdf/control/runs' }] });
  const discovered = discoverRuns(root);
  // Discovery reports a runs path that is no directory as one repository-level sentinel entry.
  const store = discovered.filter((run) => run.run_id === "<repository>");
  const sources = discovered.filter(run => run.run_id !== '<repository>').map(run => {
    const source = { run_id: run.run_id, ...(typeof run.content === 'string' ? { text: run.content } : {}), findings: run.valid ? [] : run.findings };
    if (includePresentation && typeof run.content === 'string') {
      let name = '', seal = 'unconfirmed';
      try {
        const ur = parseControlState(run.content).artefacts.get('UR');
        const path = String(ur?.path ?? '').replace(/^`|`$/g, '').trim();
        if (inControlScope(path)) name = readArtefactHeading(root, ur).replace(/^UR:\s*/i, '').trim();
      } catch { /* An unreadable title must not hide the inventory. */ }
      try {
        if (registersOnlyControlSources(run.content)) {
          const result = runSealState(root, run.content).status;
          seal = result === 'valid' ? 'valid' : result === 'unsealed' ? 'unsealed'
            : ['invalid', 'content_changed', 'approvals_changed'].includes(result) ? 'invalid' : 'unconfirmed';
        }
      } catch { /* Unavailable evidence cannot prove a seal state. */ }
      source.presentation = { name: name || null, seal };
    }
    if (run.valid && observe) {
      try {
        const state = prepareRunContentState(root, run.content, run.path), decision = transitionDecisionForRunState(state);
        source.observation = { current_gate: decision.current_gate, decision: decision.status, missing: decision.missing_approval,
          next_action: decision.next_allowed_action, presentation_decision: Boolean(decision.presentation_decision?.decided) };
        if (cockpitAssessment && run.meta?.lifecycle === 'active') {
          let report = null;
          if (registersOnlyControlSources(run.content)) { try { report = evaluateGateCheck(root, { runId: run.run_id, ignoreRunIdEnv: true }); } catch (error) {
            if (READ_BOUNDARY_CODES.includes(error.code)) throw error;
            // Preserve the Run but do not claim a verified assessment.
          } }
          const assessed = report ? projectCockpitAssessment(report, run.meta?.lifecycle) : { state: 'unconfirmed' };
          source.observation.work_situation = projectWorkSituation({ assessment: assessed.state,
            gate: report?.current_gate, blockingReason: report?.blocking_reason, missingApproval: report?.missing_approval,
            persistedGate: report ? state.current_gate : undefined, persistedNext: state.next_allowed_action, nextAllowedAction: report?.next_allowed_action,
            closureOutcome: runClosure(run.content)?.outcome });
          if (report) Object.assign(source.observation, { current_gate: report.current_gate, decision: report.status,
            missing: report.missing_approval, next_action: report.next_allowed_action });
        }
      } catch (error) {
        if (cockpitAssessment && READ_BOUNDARY_CODES.includes(error.code)) throw error;
        source.findings = [{ code: 'AGDF_RUN_OBSERVATION_UNAVAILABLE' }];
      }
    }
    return source;
  });
  return buildRunInventory(sources, { language, findings: store.flatMap((run) => run.findings) });
}
