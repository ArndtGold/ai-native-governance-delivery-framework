import { isAbsolute, relative } from 'node:path';
import { realpathSync, statSync } from 'node:fs';
import { resolveTaskTarget } from './task-target-resolution.js';
import { COOPERATIVE_ASSURANCE, resolveControlCommandTarget } from './control-state/approval-command-contract.js';
import { schemaDiagnostics, RUN_COMMAND_VERSION } from './control-state/run-command-schema.js';
import { resolveConfiguration } from './resources/configuration.js';
import { createInputResolution, restoreResolvedInput, validInputResolution } from './control-state/input-resolution.js';
import { canonicalizeLanguageTag } from './interaction-presentation.js';
import { validExecutionFacts } from './mcp-tool-errors.js';

function reject(code, field) {
  return Object.assign(Error(code), { code, facts: { code, dispatch: 'not_dispatched', ...(field ? { field } : {}) } });
}
// Called only by the serving adapter. Context and original-operation observations
// are injected privately; neither can be supplied in public tool arguments.
export function resolveMcpInput(definition, original, { defaults, executionContext, runtimeRoots = [], lookupOriginal = () => null } = {}) {
  const diagnostics = schemaDiagnostics(original, definition.inputSchema);
  if (diagnostics.length) {
    const code = definition.name === 'agdf_inspect' ? 'inspect_input_invalid' : definition.name === 'agdf_dispatch' ? 'dispatch_input_invalid' : 'command_schema_invalid';
    const field = diagnostics[0].path.match(/^\$\.([a-z_]+)$/u)?.[1];
    throw reject(code, field && validExecutionFacts({ code, dispatch: 'not_dispatched', field }) ? field : undefined);
  }
  let effective = structuredClone(original);
  if (effective.working_directory === undefined) {
    if (executionContext?.source !== 'task_execution' || typeof executionContext.invocation_id !== 'string' || !executionContext.invocation_id
      || !isAbsolute(executionContext.working_directory ?? '')) throw reject('working_directory_required', 'working_directory');
    let directory;
    try {
      directory = realpathSync(executionContext.working_directory);
      if (!statSync(directory).isDirectory() || runtimeRoots.some(root => {
        const path = relative(realpathSync(root), directory); return path === '' || !path.startsWith('..') && !isAbsolute(path);
      })) throw Error();
    } catch { throw reject('working_directory_required', 'working_directory'); }
    effective.working_directory = directory;
  }
  if (!isAbsolute(effective.working_directory)) throw reject('working_directory_required', 'working_directory');
  let root = null;
  if (effective.target_source !== undefined || effective.primary_target !== undefined) {
    const target = resolveTaskTarget({ workingDirectory: effective.working_directory, targetSource: effective.target_source, primaryTarget: effective.primary_target });
    if (target.resolution_state !== 'resolved') {
      if (effective.command) throw reject('target_unresolved');
      // Read/dispatch retain the Core's existing unresolved-target result plane.
      // An unconfirmed target cannot supply project settings.
    } else root = target.governance_target;
    if (effective.command && effective.target_id !== undefined && resolveControlCommandTarget(root).target_id !== effective.target_id) throw reject('target_binding_mismatch');
  }
  let readLocator;
  if (root && effective.operation === 'operation-status') {
    const id = effective.module?.split('/').at(-1);
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/u.test(id ?? '')) readLocator = {
      ...effective, operation_id: id, target_id: resolveControlCommandTarget(root).target_id,
      command: { kind: effective.module.startsWith('project.initialize/') ? 'project.initialize' : effective.run_id ? 'status.inspect' : 'run.create' },
    };
  } else if (root && ['presentation-document', 'presentation-preview'].includes(effective.operation)) readLocator = {
    ...effective, operation_id: effective.presentation_id, command: { kind: 'presentation.prepare' },
  };
  const previous = root && (effective.operation_id || readLocator) ? lookupOriginal(root, readLocator ?? effective) : null;
  if (readLocator && previous?.resolution) {
    const c = previous.resolution.configuration;
    if (c.root !== root) throw reject('target_binding_mismatch');
    effective.presentation_language ??= previous.resolution.fields.presentation_language ?? c.values.chat_language;
    const configuration = original.presentation_language === undefined ? c : { ...c,
      values: { ...c.values, chat_language: canonicalizeLanguageTag(original.presentation_language) }, sources: { ...c.sources, chat_language: { kind: 'explicit' } } };
    return { arguments: effective, resolution: createInputResolution(original, effective, configuration), original: true };
  }
  if (readLocator && previous?.known && effective.presentation_language !== undefined) return { arguments: effective, resolution: null, original: true };
  if (!readLocator && previous?.resolution) {
    if (['operation.recover', 'source_revision.recover'].includes(effective.command?.kind)) {
      const c = previous.resolution;
      for (const key of ['presentation_language', 'working_directory', 'schema_version', 'assurance']) effective[key] ??= c.fields[key];
      effective.presentation_language ??= c.configuration.values.chat_language;
      effective.schema_version ??= RUN_COMMAND_VERSION;
      effective.assurance ??= COOPERATIVE_ASSURANCE.lane;
      const resolution = createInputResolution(original, effective, c.configuration);
      if (!validInputResolution(resolution)) throw reject('command_schema_invalid');
      return { arguments: effective, resolution, original: true };
    }
    try { effective = restoreResolvedInput(original, previous.resolution); }
    catch { throw reject('operation_payload_conflict'); }
    return { arguments: effective, resolution: previous.resolution, original: true };
  }
  if (!readLocator && previous?.known) {
    // A legacy explicit request cannot reconstruct values introduced by this
    // omission contract. Full original requests retain the existing replay path.
    if (['presentation_language', 'working_directory', 'schema_version', 'assurance'].some(key => original[key] === undefined))
      throw reject('operation_payload_conflict');
    return { arguments: effective, resolution: null, original: true };
  }
  const explicit = { ...(original.presentation_language === undefined ? {} : { chat_language: original.presentation_language }),
    ...(original.command?.kind === 'presentation.deliver' && original.command.payload.route !== undefined ? { presentation_route: original.command.payload.route } : {}),
    ...(original.operation === 'gate-check' && original.variant !== undefined ? { gate_check_variant: original.variant } : {}) };
  const configuration = resolveConfiguration(root, defaults, explicit);
  effective.presentation_language ??= configuration.values.chat_language;
  if (effective.command) {
    effective.schema_version ??= RUN_COMMAND_VERSION;
    effective.assurance ??= COOPERATIVE_ASSURANCE.lane;
    if (effective.command.kind === 'presentation.deliver') effective.command.payload.route ??= configuration.values.presentation_route;
  }
  if (effective.operation === 'gate-check' && configuration.values.gate_check_variant !== null) effective.variant ??= configuration.values.gate_check_variant;
  const resolution = createInputResolution(original, effective, configuration);
  if (!validInputResolution(resolution)) throw reject('command_schema_invalid');
  return { arguments: effective, resolution, original: false };
}
