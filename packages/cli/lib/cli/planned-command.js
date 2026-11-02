import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { openSync, closeSync, fstatSync, lstatSync, readFileSync, constants } from 'node:fs';
import { createRunCommandService } from '#agdf-core/control-state/run-command-service.js';
import { createRunMaterialStore } from '#agdf-core/control-state/run-material.js';
import { resolveControlCommandTarget } from '#agdf-core/control-state/approval-command-contract.js';
import { planningId, inspectPlannedEntry, inspectPlannedOperation } from '#agdf-core/control-state/planned-entry.js';
import { readPlannedInventory } from '#agdf-core/control-state/planned-inventory.js';
import { pluginDefinition } from './runtime-context.js';

function readUr(path) {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isFile() || stat.size > 131072) throw Error('planned_source_invalid');
  const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
  try {
    const actual = fstatSync(fd);
    if (actual.ino !== stat.ino || actual.dev !== stat.dev || actual.size !== stat.size) throw Error('planned_source_changed');
    const bytes = readFileSync(fd);
    if (bytes.length > 131072) throw Error('planned_source_limit');
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } finally { closeSync(fd); }
}
export function executePlannedCli(options, io = console) {
  const store = createRunMaterialStore();
  try {
    const root = resolveControlCommandTarget(options.dir), action = options.recoveryAction;
    const emit = value => { io.log(JSON.stringify(value, null, 2)); return ['rejected', 'effect_unknown', 'recovery_required'].includes(value.outcome) ? 2 : 0; };
    if (options.target === 'planned' && action === 'list') return emit(readPlannedInventory(root.root));
    if (options.target === 'planned' && action === 'inspect') return emit(inspectPlannedEntry(root.root, options.planId));
    if (action === 'status') return emit(inspectPlannedOperation(root.root, options.planId, options.operationId));
    const operation_id = options.operationId ?? randomUUID();
    const base = { schema_version: '1', presentation_language: options.language?.chat_language ?? 'en', working_directory: root.root,
      primary_target: root.root, target_source: 'explicit_target', target_id: root.target_id, operation_id, assurance: 'cooperative_local' };
    const scope = { plan_id: action === 'create' ? planningId(operation_id) : options.planId, expected_digest: action === 'create' ? null : options.sourceDigest };
    const bound = { ...base, planning: scope };
    if (action === 'start') {
      const entry = inspectPlannedEntry(root.root, scope.plan_id);
      return emit(createRunCommandService({ packageVersion: pluginDefinition.version })('agdf_run', { ...bound, command: { kind: 'run.create_from_planned', payload: { title: entry.title } } }));
    }
    const content = readUr(resolve(options.workingDirectory, options.stepFields.evidence)), bytes = Buffer.from(content);
    const stage = payload => store.stage({ ...bound, operation_id: randomUUID(), command: { kind: 'planned_material.stage', payload } });
    const started = stage({ action: 'begin', files: [{ slot: 'UR', bytes: bytes.length }] });
    if (started.outcome !== 'accepted') return emit(started);
    const transfer_id = started.family_result.transfer_id;
    for (let offset = 0; offset < bytes.length; offset += 16384) {
      const chunk = stage({ action: 'append', transfer_id, file: 0, offset, data: bytes.subarray(offset, offset + 16384).toString('base64') });
      if (chunk.outcome !== 'accepted') return emit(chunk);
    }
    const sealed = stage({ action: 'seal', transfer_id }); if (sealed.outcome !== 'accepted') return emit(sealed);
    const input = { ...bound, command: { kind: `planned_ur.${action}`, payload: { source: sealed.family_result.files[0].reference,
      ...(options.priority ? { priority: options.priority } : {}) } } };
    return emit(createRunCommandService({ packageVersion: pluginDefinition.version, materialGrants: store.grants(input) })('agdf_record', input));
  } catch (error) { io.error(error.code ?? error.message); return 1; }
  finally { store.close(); }
}
