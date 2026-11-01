import { lstatSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { discoverRuns } from '../control-state/run-state-reader.js';
import { directoryIdentity, regularFileSnapshot } from '../control-state/run-store-inspection.js';
import { runSealState } from '../control-state/run-seal.js';
import { requiredControlFiles } from '../control-evaluation/required-files.js';
import { readControlLayout } from '../control-state/control-layout.js';
import { inspectControlConfiguration } from '../control-state/control-configuration.js';

const present = path => { try { lstatSync(path); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } };
export const CONTROL_COMPATIBILITY_STATUSES = Object.freeze(['not_checked', 'absent', 'current', 'unsupported', 'repair_required']);
export function uncheckedControl() {
  return { schema_version: 1, supported_control_state_version: 4, supported_control_state_versions: [4], control_layout: null,
    target: null, status: 'not_checked', runs: [], diagnostics: [], changes: [], authorizes: false };
}
// Read-only compatibility, never migration or reset. Unsupported and corrupt
// current state are distinct; neither classification creates write permission.
export function inspectControlCompatibility(root) {
  if (!root) return uncheckedControl();
  if (!isAbsolute(root)) throw Error('AGDF_CONTROL_COMPATIBILITY_TARGET_INVALID');
  const result = { ...uncheckedControl(), target: root, status: 'absent' };
  try {
    if (!present(join(root, '.agdf/control'))) return result;
    for (const path of [root, join(root, '.agdf'), join(root, '.agdf/control')]) directoryIdentity(path);
    result.control_layout = readControlLayout(root).layout;
    for (const relative of ['.agdf/control/config.json', '.agdf/control/README.md', ...requiredControlFiles(root)])
      regularFileSnapshot(join(root, relative));
    const configuration = inspectControlConfiguration(root);
    if (!configuration.active) throw Error(configuration.diagnostic);
    directoryIdentity(join(root, '.agdf/control/runs'));
    for (const run of discoverRuns(root)) {
      const unsupported = run.findings.some(row => row.classification === 'unsupported_version');
      const entry = { run_id: run.run_id, control_state_version: run.meta?.control_state_version ?? null,
        status: unsupported ? 'unsupported' : !run.valid ? 'repair_required' : 'current', diagnostics: [...run.findings], pending_recoveries: [] };
      if (run.valid) {
        const seal = runSealState(root, run.content);
        if (seal.status !== 'valid') { entry.status = 'repair_required'; entry.diagnostics.push({ code: 'AGDF_RUN_SEAL_INVALID', seal_status: seal.status }); }
        else if (run.meta.lifecycle !== 'active') entry.status = 'historical';
      }
      result.runs.push(entry);
    }
    result.status = result.runs.some(run => run.status === 'unsupported') ? 'unsupported'
      : result.runs.some(run => run.status === 'repair_required') ? 'repair_required' : 'current';
  } catch (error) {
    const code = String(error.code ?? error.message);
    result.status = /LAYOUT_UNSUPPORTED|VERSION_UNSUPPORTED/u.test(code) ? 'unsupported' : 'repair_required';
    result.diagnostics.push({ code, ...(error.path ? { path: error.path } : {}) });
  }
  return result;
}
export function assertControlCompatibility(value) {
  if (!value || value.schema_version !== 1 || value.supported_control_state_version !== 4
    || JSON.stringify(value.supported_control_state_versions) !== '[4]' || !CONTROL_COMPATIBILITY_STATUSES.includes(value.status)
    || value.authorizes !== false || !(value.target === null || typeof value.target === 'string' && isAbsolute(value.target))
    || (value.status === 'not_checked') !== (value.target === null) || !Array.isArray(value.runs)
    || !Array.isArray(value.diagnostics) || !Array.isArray(value.changes) || value.changes.length)
    throw Error('AGDF_CONTROL_COMPATIBILITY_REPORT_INVALID');
  return value;
}
