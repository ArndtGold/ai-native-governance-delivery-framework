// Live origin discovery composes current proof and seal validation. The seal's
// immutable-origin proof stays below this reader to keep the dependency acyclic.
import { RUN_ID_PATTERN } from './run-identity.js';
import { existsSync, readdirSync, memoizeControlRead } from '../control-read/fs.js';
import { join } from 'node:path';
import { readContainedControlText, controlPathPresent, READ_LIMITS } from '../control-read/snapshot.js';
import { parseRunState } from './run-state-parser.js';
import { readRunOperations } from './run-operations.js';
import { runSealState } from './run-seal.js';
import { hasSymlinkComponent } from './contained-file.js';
import { plannedOriginFromReceipt, validPlannedOrigin } from './planned-origin.js';

function collectPlannedOrigins(root) {
  const directory = '.agdf/control/runs', matches = [], findings = [];
  if (hasSymlinkComponent(root, directory)) throw Error('AGDF_PLANNED_ORIGIN_UNCONFIRMED');
  if (!existsSync(join(root, directory))) return { matches, findings };
  const names = readdirSync(join(root, directory));
  if (names.length > 20000) throw Error('AGDF_PLANNED_ORIGIN_LIMIT');
  for (const id of names.filter(name => RUN_ID_PATTERN.test(name))) {
    let receipt, origin;
    try {
      const path = `${directory}/${id}/RUN_STATE.md`;
      if (!controlPathPresent(root, path)) continue;
      const content = readContainedControlText(root, path, READ_LIMITS.file), parsed = parseRunState(content, id);
      if (!parsed.valid) throw Error();
      const creations = readRunOperations(content).receipts.filter(row => row.kind === 'run.create_from_planned');
      if (creations.length > 1) throw Error();
      receipt = creations[0]; if (!receipt) continue;
      origin = plannedOriginFromReceipt(receipt);
      if (!validPlannedOrigin(origin) || runSealState(root, content).status !== 'valid') throw Error();
      matches.push({ origin, receipt, run_id: id, current_revision_id: parsed.meta.revision_id });
    } catch { findings.push({ run_id: id, ...(origin ? { plan_id: origin.plan_id } : {}), code: 'planned_origin_unconfirmed' }); }
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
