import { readControlLayout } from './control-layout.js';
import { prepareRunContentState } from '../control-evaluation/run-state.js';
import { transitionDecisionForRunState } from '../control-evaluation/gate-policy.js';
import { existsSync } from "../control-read/fs.js";
import { join } from "node:path";
import { discoverRuns } from "./run-state-reader.js";
import { buildRunInventory } from "./run-inventory.js";

// Feeds the pure inventory from the run discovery of the current read view: each run's parsed text
// and, when the full parser rejected it, its findings. No run state is read a second time.
export function readRunInventory(root, { language = "en" } = {}) {
  if (!existsSync(join(root, '.agdf/control'))) return buildRunInventory(null, { language });
  readControlLayout(root);
  if (!existsSync(join(root, '.agdf/control/runs'))) return buildRunInventory([], { language,
    findings: [{ code: 'AGDF_RUN_STORE_MISSING', path: '.agdf/control/runs' }] });
  const discovered = discoverRuns(root);
  // Discovery reports a runs path that is no directory as one repository-level sentinel entry.
  const store = discovered.filter((run) => run.run_id === "<repository>");
  const sources = discovered.filter(run => run.run_id !== '<repository>').map(run => {
    const source = { run_id: run.run_id, ...(typeof run.content === 'string' ? { text: run.content } : {}), findings: run.valid ? [] : run.findings };
    if (run.valid) {
      try {
        const state = prepareRunContentState(root, run.content, run.path), decision = transitionDecisionForRunState(state);
        source.observation = { current_gate: decision.current_gate, decision: decision.status, missing: decision.missing_approval,
          next_action: decision.next_allowed_action, presentation_decision: Boolean(decision.presentation_decision?.decided) };
      } catch { source.findings = [{ code: 'AGDF_RUN_OBSERVATION_UNAVAILABLE' }]; }
    }
    return source;
  });
  return buildRunInventory(sources, { language, findings: store.flatMap((run) => run.findings) });
}
