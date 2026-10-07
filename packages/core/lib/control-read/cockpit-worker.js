import { parentPort, workerData } from 'node:worker_threads';
import { createCockpitReader } from '../control-inspect/cockpit.js';
const reader = createCockpitReader(workerData.root, { limits: workerData.limits });
parentPort.on('message', ({ id, operation, selector, snapshot, input }) => {
  try {
    const result = operation === 'snapshot' ? reader.snapshot(input?.run_id)
      : operation === 'run' ? reader.run(selector, snapshot)
      : operation === 'backlog_titles' ? reader.backlogTitles(input?.row_ids, snapshot)
      : operation === 'document' ? reader.document(selector, snapshot, input?.run_id)
      : operation === 'freshness' ? reader.freshness(snapshot)
      : operation === 'context' ? reader.context(selector, snapshot)
      : operation === 'prepare_context' ? reader.prepareContext(input)
      : operation === 'validate_context' ? reader.validateContext(input.context_id, input.generation)
      : operation === 'invalidate_context' ? reader.invalidateContext()
      : (() => { throw Object.assign(Error('resource_denied'), { code: 'resource_denied' }); })();
    parentPort.postMessage({ id, result });
  } catch (error) { parentPort.postMessage({ id, error: error.code }); }
});
