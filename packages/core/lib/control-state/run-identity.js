export const RUN_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,127}$/;
export const REVISION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const APPROVAL_GATES = Object.freeze(["UR", "PRD", "SD", "TP", "QA", "UAT"]);

export function validateRunIdentity({ runId, revisionId } = {}) {
  const findings = [];
  if (!RUN_ID_PATTERN.test(String(runId ?? ""))) findings.push({ code: "AGDF_RUN_ID_INVALID" });
  if (!REVISION_ID_PATTERN.test(String(revisionId ?? ""))) findings.push({ code: "AGDF_RUN_REVISION_ID_INVALID" });
  return findings;
}

export const creationRunId = operationId => `run-${operationId}`;

// Pure, host-independent paths. Filesystem ownership and containment remain with
// contained-file and the existing reader/writer owners; this API never probes an
// older location or chooses a layout from files found on disk.
export const CURRENT_LAYOUT = 'run-folders-v1';
export const CURRENT_RUN_VERSION = 4;
export const RUN_MODES = Object.freeze(['undecided', 'quick_task', 'verified_change', 'structured_slice', 'structured_delivery', 'block']);
export function runRelativePath(runId, area = '', name = '') {
  if (!RUN_ID_PATTERN.test(String(runId ?? ''))) throw Error('AGDF_RUN_ID_INVALID');
  if (!['', 'documents', 'evidence', 'control', 'history'].includes(area)) throw Error('AGDF_RUN_PATH_INVALID');
  if (typeof name !== 'string' || name.includes('\\') || name.includes(':') || name.includes('\0')
      || name && name.split('/').some(part => !part || part === '.' || part === '..'))
    throw Error('AGDF_RUN_PATH_INVALID');
  if (!area && name && name !== 'RUN_STATE.md') throw Error('AGDF_RUN_PATH_INVALID');
  return [`.agdf/control/runs/${runId}`, area, name].filter(Boolean).join('/');
}
export const runDocumentPath = (runId, name) => runRelativePath(runId, 'documents', name);
export const runEvidencePath = (runId, name) => runRelativePath(runId, 'evidence', name);
export const runControlPath = (runId, name) => runRelativePath(runId, 'control', name);
export const runHistoryPath = (runId, name) => runRelativePath(runId, 'history', name);

export function isRunDataPath(runId, value) {
  if (typeof value !== 'string') return false;
  try {
    for (const area of ['documents', 'evidence']) {
      const prefix = runRelativePath(runId, area) + '/';
      if (value.startsWith(prefix)) return runRelativePath(runId, area, value.slice(prefix.length)) === value;
    }
  } catch { return false; }
  return false;
}

// Qualification records may refer to multiple Runs; each reference still has a
// current Run-owned documents/evidence role and a validated canonical identity.
export function isRunOwnedDataPath(value) {
  const id = typeof value === 'string' ? value.match(/^\.agdf\/control\/runs\/([^/]+)\//u)?.[1] : null;
  return Boolean(id && isRunDataPath(id, value));
}
