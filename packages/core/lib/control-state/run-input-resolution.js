import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { inspectRunOperation } from './run-operation-status.js';
import { recordedInputResolution } from './input-resolution.js';
import { creationRunId } from './run-identity.js';
import { recoverRunCreationStage } from './run-state-repository.js';
import { parseRunState } from './run-state-parser.js';
import { readRunOperations } from './run-operations.js';
import { runSealState } from './run-seal.js';
import { readPendingRunStepJournal } from './run-step-transaction.js';
import { inspectCanonicalProject } from './canonical-initialization.js';
import { inspectClosureInputResolution } from './run-closure.js';
import { validateRunPresentationRecord } from './run-presentation.js';

export function inspectRunInputResolution(root, input) {
  if (['presentation-document', 'presentation-preview'].includes(input.operation)) {
    const checked = validateRunPresentationRecord(root, { runId: input.run_id, gate: input.gate,
      revisionId: input.expected_revision_id, presentationId: input.presentation_id });
    return checked.reason ? null : { known: true, resolution: recordedInputResolution(checked.record) };
  }
  if (['closure.preview', 'closure.apply'].includes(input.command.kind)) return inspectClosureInputResolution(root, input);
  if (input.command.kind === 'project.initialize') {
    const observed = inspectCanonicalProject(root, { operationId: input.operation_id });
    if (observed.receipt?.operation?.operation_id === input.operation_id) return { known: true, resolution: recordedInputResolution(observed.receipt) };
    if (observed.operation?.operation_id === input.operation_id) return { known: true, resolution: observed.input_resolution ?? null };
    return null;
  }
  const runId = input.run_id ?? (input.command?.kind === 'run.create' ? creationRunId(input.operation_id) : null);
  if (!runId) return null;
  if (!existsSync(join(root, '.agdf/control/runs'))) return null;
  if (input.command.kind === 'run.create' && !existsSync(join(root, `.agdf/control/runs/${runId}`))) {
    const receipt = recoverRunCreationStage(root, runId, content => {
      const state = parseRunState(content, runId), operations = readRunOperations(content);
      if (!state.valid || !operations.valid || runSealState(root, content).status !== 'valid') throw Error('original_operation_unconfirmed');
      const row = operations.receipts.find(r => r.operation_id === input.operation_id && r.kind === 'run.create' && r.target_id === input.target_id);
      if (!row) throw Error('original_operation_unconfirmed');
      return row;
    }, { inspectOnly: true });
    return receipt ? { known: true, resolution: recordedInputResolution(receipt) } : null;
  }
  const observed = inspectRunOperation(root, { runId, operationId: input.operation_id, targetId: input.target_id });
  if (['recorded', 'committed_recovery_required'].includes(observed.status)) return { known: true, resolution: recordedInputResolution(observed.receipt) };
  if (observed.status === 'pending') {
    const pending = readPendingRunStepJournal(root, runId);
    return { known: true, resolution: recordedInputResolution(pending) };
  }
  if (observed.status === 'absent') return null;
  throw Object.assign(Error('original_operation_unconfirmed'), { facts: { code: 'original_operation_unconfirmed', dispatch: 'not_dispatched' } });
}
