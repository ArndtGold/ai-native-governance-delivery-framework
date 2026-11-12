import { RUN_OPERATION_VERSION } from './run-operations.js';
import { assertInputConfigurationCurrent } from '../resources/configuration.js';
import { bindInputResolution } from './input-resolution.js';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRun, recoverRunCreationStage } from './run-state-repository.js';
import { assertCanonicalRunStore } from './run-store-inspection.js';
import { appendRunOperation, readRunOperations } from './run-operations.js';
import { parseRunState } from './run-state-parser.js';
import { withOwnedFileLock } from './run-state-writer.js';
import { runSealState } from './run-seal.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { COOPERATIVE_ASSURANCE } from './approval-command-contract.js';
import { withControlMutation } from './control-layout.js';
import { isDecisionContentPlaceholder } from '../control-evaluation/decision-content-placeholder.js';

import { creationRunId } from './run-identity.js';
export { creationRunId };

// The initial receipt lives in the same staged, sealed Run as the creation effect.
// No pre-Run ledger, arbitrary state text, backlog mutation or gate approval.
export function createRunCommand(root, input, { requestDigest, packageVersion, checkpoint = () => {} }) {
  const runId = creationRunId(input.operation_id);
  const relative = `.agdf/control/runs/${runId}/RUN_STATE.md`;
  assertCanonicalRunStore(root, { historicalRead: true });
  return withOwnedFileLock(join(root, '.agdf/control/runs', `.create-${input.operation_id}`), () => withControlMutation(root, { resource: `run.create:${runId}`, operation_id: input.operation_id,
    resume: true, proveOutcome: result => ['recorded', 'already_applied'].includes(result?.outcome) }, () => {
    function matching(content) {
      const parsed = parseRunState(content, runId), receipts = readRunOperations(content);
      const receipt = receipts.receipts.find(r => r.operation_id === input.operation_id);
      if (!parsed.valid || !receipts.valid || runSealState(root, content).status !== 'valid') throw Error('creation_state_unconfirmed');
      if (receipt?.kind !== 'run.create' || receipt.target_id !== input.target_id || receipt.request_digest !== requestDigest) throw Error('AGDF_OPERATION_PAYLOAD_CONFLICT');
      return receipt;
    }
    if (existsSync(join(root, relative))) {
      if (hasSymlinkComponent(root, relative) || containedRegularFile(root, relative).status !== 'valid') throw Error('run_path_invalid');
      return { outcome: 'already_applied', run_id: runId, receipt: matching(readFileSync(join(root, relative), 'utf8')), historical_effect: true };
    }
    // A proven receipt above is a replay, independent of current live pointers.
    // New or staged effects still require today's complete layout scaffold.
    assertCanonicalRunStore(root);
    const recovered = recoverRunCreationStage(root, runId, matching);
    if (recovered) return { outcome: 'recorded', run_id: runId, receipt: recovered, recovered_stage: true };
    assertInputConfigurationCurrent(root);
    let receipt;
    createRun(root, runId, undefined, {
      prepare: content => {
        const parsed = parseRunState(content, runId);
        receipt = bindInputResolution({ schema_version: RUN_OPERATION_VERSION, kind: 'run.create', operation_id: input.operation_id,
          request_digest: requestDigest, target_id: input.target_id, run_id: runId, expected_revision_id: null,
          created_at: new Date().toISOString(), producer: { contract: 'run-command/1', package_version: packageVersion },
          assurance: COOPERATIVE_ASSURANCE, effect: { previous_revision_id: null,
            resulting_revision_id: parsed.meta.revision_id, revision: 1, record: { title: input.command.payload.title } } });
        // Only a semantic title orients the Objective. A placeholder title such as the bare Run ID
        // keeps the template prompt, so recording the UR projects its Goal there.
        const title = input.command.payload.title;
        const oriented = isDecisionContentPlaceholder(title) ? content : content.replace('Describe the trustworthy outcome.', () => title);
        return appendRunOperation(oriented, receipt);
      },
      beforePublish: () => checkpoint('creation_before_publish'),
    });
    checkpoint('creation_published');
    return { outcome: 'recorded', run_id: runId, receipt };
  }));
}
