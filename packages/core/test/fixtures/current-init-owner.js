// Private initializer hook tests still bind the exact current public command.
// No old marker, arbitrary request digest or unbound operation is synthesized.
import { initializeCanonicalProject } from '../../lib/control-state/canonical-initialization.js';
import { resolveControlCommandTarget } from '../../lib/control-state/approval-command-contract.js';
import { commandGroupDefinition, runCommandRequestDigest } from '../../lib/control-state/run-command-schema.js';
import { resolveMcpInput } from '../../lib/mcp-input-resolution.js';
import { inspectRunInputResolution } from '../../lib/control-state/run-input-resolution.js';
import { resources } from '../../lib/resources/context.js';
import { withInputResolution } from '../../lib/control-state/input-resolution.js';
export function initializationInput(root, operation_id) {
  return { schema_version: '1', assurance: 'cooperative_local', presentation_language: 'de', working_directory: root,
    primary_target: root, target_source: 'explicit_target', target_id: resolveControlCommandTarget(root).target_id,
    operation_id, command: { kind: 'project.initialize', payload: { language: 'en' } } };
}
export function currentInitializationIntent(root, operation_id, producer = 'test') {
  const input = initializationInput(root, operation_id);
  return { operationId: operation_id, requestDigest: runCommandRequestDigest(input), targetId: input.target_id, language: 'en', producer };
}
export function initializeCurrentProjectOwner(root, intent, hooks) {
  const input = initializationInput(root, intent.operationId);
  const selected = resolveMcpInput(commandGroupDefinition('agdf_project'), input, { defaults: resources.defaults, lookupOriginal: inspectRunInputResolution });
  return withInputResolution(selected.resolution, () => initializeCanonicalProject(root, intent, hooks), selected.original);
}
