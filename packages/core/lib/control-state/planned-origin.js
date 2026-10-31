import { existsSync, readdirSync, lstatSync, memoizeControlRead } from '../control-read/fs.js';
import { join } from 'node:path';
import { readContainedControlText, controlPathPresent, READ_LIMITS } from '../control-read/snapshot.js';
import { exactObject, digest } from './approval-command-contract.js';
import { RUN_ID_PATTERN, REVISION_ID_PATTERN } from './run-identity.js';
import { parseControlState, parseRunState } from './run-state-parser.js';
import { readRunOperations } from './run-operations.js';
import { artefactFileDigest, runSealState, APPROVAL_GATES } from './run-seal.js';
import { hasSymlinkComponent } from './contained-file.js';
import { sectionTableRows, scalarFields } from './run-state-document.js';

const hash = value => typeof value === 'string' && /^sha256:[a-f0-9]{64}$/u.test(value);
const reference = (value, path) => exactObject(value, ['path', 'digest']) && value.path === path && hash(value.digest);
export function validPlannedOrigin(origin) {
  if (!exactObject(origin, ['schema_version', 'plan_id', 'operation_id', 'run_id', 'target_id', 'request_digest', 'raw_digest', 'planned', 'snapshot', 'initial_ur'])
    || origin.schema_version !== 1 || !RUN_ID_PATTERN.test(origin.plan_id ?? '') || !REVISION_ID_PATTERN.test(origin.operation_id ?? '')
    || origin.run_id !== `run-${origin.operation_id}` || !hash(origin.target_id) || !hash(origin.request_digest) || !hash(origin.raw_digest)) return false;
  const base = `.agdf/control/artefacts/${origin.run_id}/`;
  return reference(origin.planned, `.agdf/control/planned/${origin.plan_id}/UR.md`)
    && reference(origin.snapshot, `${base}PLANNED_UR.md`) && reference(origin.initial_ur, `${base}UR.md`)
    && origin.snapshot.digest === origin.planned.digest && origin.initial_ur.digest === origin.planned.digest;
}

// Derive transfer from the immutable, sealed Run origin even if entry completion
// was lost. A later active UR may differ; the historical snapshot never follows it.
function collectPlannedOrigins(root) {
  const directory = '.agdf/control/runs', matches = [], findings = [];
  if (hasSymlinkComponent(root, directory)) throw Error('AGDF_PLANNED_ORIGIN_UNCONFIRMED');
  if (!existsSync(join(root, directory))) return { matches, findings, complete: true };
  const names = readdirSync(join(root, directory));
  if (names.length > 20000) throw Error('AGDF_PLANNED_ORIGIN_LIMIT');
  for (const id of names.filter(name => RUN_ID_PATTERN.test(name))) {
    const runPath = `${directory}/${id}/RUN_STATE.md`, originPath = `.agdf/control/artefacts/${id}/PLANNED_ORIGIN.json`;
    // Artefact-only preparation is not a published Run or transfer.
    let origin, content, creation;
    try {
      if (!controlPathPresent(root, runPath)) continue;
      content = readContainedControlText(root, runPath, READ_LIMITS.file);
      const hasOrigin = controlPathPresent(root, originPath);
      // Genuine historical v2 never had this handoff family. Preserving an
      // unsealed ended v2 document cannot fabricate a v3 planning association.
      if (!hasOrigin && scalarFields(content).values.get('control_state_version') === '2') continue;
      const operations = readRunOperations(content);
      if (!operations.valid) throw Error();
      const creations = operations.receipts.filter(row => row.kind === 'run.create_from_planned');
      if (creations.length > 1) throw Error();
      creation = creations[0];
      if (!creation && !hasOrigin) continue;
      if (!hasOrigin) {
        findings.push({ run_id: id, plan_id: creation.effect.record.planned.plan_id, code: 'planned_origin_missing' }); continue;
      }
      origin = JSON.parse(readContainedControlText(root, originPath, 8192));
      if (!validPlannedOrigin(origin) || origin.run_id !== id) throw Error();
    } catch { findings.push({ run_id: id, code: 'planned_origin_unconfirmed' }); continue; }
    try {
      const parsed = parseRunState(content, id);
      if (!parsed.valid || runSealState(root, content).status !== 'valid') throw Error();
      const state = parseControlState(content, { userGates: APPROVAL_GATES, closeoutArtefacts: ['Planned UR Snapshot', 'Planned UR Origin'] });
      const receipt = readRunOperations(content).receipts.find(row => row.kind === 'run.create_from_planned' && row.operation_id === origin.operation_id);
      const snapshot = state.artefacts.get('Planned UR Snapshot'), recordedOrigin = state.artefacts.get('Planned UR Origin');
      if (!receipt || receipt.target_id !== origin.target_id
        || receipt.request_digest !== origin.request_digest || receipt.effect.record.planned.plan_id !== origin.plan_id
        || receipt.effect.record.planned.digest !== origin.planned.digest
        || snapshot?.path !== origin.snapshot.path || recordedOrigin?.path !== originPath
        || artefactFileDigest(root, origin.snapshot.path) !== origin.snapshot.digest
        || digest(readContainedControlText(root, origin.snapshot.path)) !== origin.raw_digest
        || artefactFileDigest(root, originPath) !== receipt.effect.record.origin.digest) throw Error();
      matches.push({ origin, receipt, run_id: id, current_revision_id: parsed.meta.revision_id });
    } catch { findings.push({ run_id: id, plan_id: origin.plan_id, code: 'planned_origin_unconfirmed' }); }
  }
  return { matches, findings };
}
export function inspectPlannedOrigins(root, planId) {
  if (!RUN_ID_PATTERN.test(planId ?? '')) throw Error('AGDF_PLANNED_ID_INVALID');
  const inventory = memoizeControlRead(`plannedOrigins:${root}`, () => collectPlannedOrigins(root));
  const matches = inventory.matches.filter(row => row.origin.plan_id === planId);
  const findings = inventory.findings.filter(row => !row.plan_id || row.plan_id === planId);
  if (matches.length > 1) findings.push({ code: 'planned_origin_ambiguous', plan_id: planId });
  return { matches, findings, complete: findings.length === 0 };
}

export function assertPlannedNotTransferred(root, id) {
  const origins = inspectPlannedOrigins(root, id);
  if (!origins.complete) throw Error('AGDF_PLANNED_ORIGIN_UNCONFIRMED');
  if (origins.matches.length) throw Object.assign(Error('AGDF_PLANNED_ALREADY_TRANSFERRED'), { run_id: origins.matches[0].run_id });
}

export function assertPlannedOriginImmutable(root, before, after) {
  const creation = readRunOperations(before).receipts.find(row => row.kind === 'run.create_from_planned');
  if (!creation) return;
  const r = creation.effect.record;
  const validRows = text => [['Planned UR Snapshot', r.snapshot.path], ['Planned UR Origin', r.origin.path]].every(([type, path]) => {
    const rows = sectionTableRows(text, 'Artefacts').filter(row => row[0] === type);
    return rows.length === 1 && rows[0][1] === path && rows[0][2] === 'done';
  });
  try {
    const raw = readContainedControlText(root, r.origin.path, 8192), origin = JSON.parse(raw);
    if (!validRows(before) || !validRows(after) || !validPlannedOrigin(origin) || origin.operation_id !== creation.operation_id
      || origin.run_id !== creation.run_id || artefactFileDigest(root, r.origin.path) !== r.origin.digest
      || artefactFileDigest(root, r.snapshot.path) !== r.snapshot.digest
      || digest(readContainedControlText(root, r.snapshot.path)) !== origin.raw_digest) throw Error();
  } catch { throw Error('AGDF_PLANNED_ORIGIN_IMMUTABLE'); }
}
export function validPlannedOriginHistory(root, content) {
  try { assertPlannedOriginImmutable(root, content, content); return true; } catch { return false; }
}
