import { isAbsolute } from 'node:path';
import { directoryIdentity } from '../control-state/run-store-inspection.js';
import { inspectControlCompatibility } from './compatibility.js';
import { maintenanceResult } from './contract.js';
export async function runControlMaintenance(target, { guided = false } = {}) {
  if (typeof target !== 'string' || !isAbsolute(target)) throw Error('AGDF_MAINTENANCE_TARGET_REQUIRED');
  if (guided) throw Error('AGDF_CONTROL_MIGRATION_UNSUPPORTED');
  directoryIdentity(target);
  return maintenanceResult(target, inspectControlCompatibility(target));
}
