import { inspectRunRecovery as inspect, previewRunRecovery as preview } from "#agdf-core/control-state/run-recovery.js";
import { readGitHistory } from "../runtime/git-history.js";
export { applyRunRecovery, inspectSelfReferenceRecovery } from "#agdf-core/control-state/run-recovery.js";
export const inspectRunRecovery = (root, runId, options = {}) => inspect(root, runId, { readGitHistory, ...options });
export const previewRunRecovery = (root, runId, options = {}) => preview(root, runId, { readGitHistory, ...options });
