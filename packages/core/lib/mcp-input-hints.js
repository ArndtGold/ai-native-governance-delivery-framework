import { isAbsolute } from 'node:path';
import { CONTROL_INSPECT_FUNCTION_DEFINITION, inspectInputValidationHint } from './control-inspect/contract.js';
import { RUN_COMMAND_DESCRIPTORS, RUN_COMMAND_GROUPS, PLANNING_COMMAND_KINDS, TARGET_SCOPED_COMMAND_KINDS, schemaDiagnostics } from './control-state/run-command-schema.js';
import { RUN_ID_PATTERN } from './control-state/run-identity.js';

// Presentation only: never repairs an argument or decides permission. The SDK
// and the canonical Core owners still validate the original request unchanged.
export function mcpInputValidationHint(name, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return '';
  const messages = [];
  if (name === 'agdf_inspect') {
    const hint = inspectInputValidationHint(input);
    if (hint) messages.push(hint);
    if (['gate-check', 'presentation-document', 'presentation-preview'].includes(input.operation)) {
      // A new *read* suggestion, not a repaired/replayed original request. Copy
      // only explicit locators; never infer a target, select a Run, refresh a
      // write revision, fabricate a presentation ID or invoke a tool here.
      const keys = ['working_directory', 'primary_target', 'target_source', 'run_id'];
      const fields = CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema.properties;
      if (keys.every(key => Object.hasOwn(input, key) && !schemaDiagnostics(input[key], fields[key]).length)
        && isAbsolute(input.working_directory) && isAbsolute(input.primary_target)
        && (input.presentation_language === undefined || !schemaDiagnostics(input.presentation_language, fields.presentation_language).length)) {
        const args = { operation: 'gate-check', ...Object.fromEntries(keys.map(key => [key, input[key]])),
          ...(input.presentation_language === undefined ? {} : { presentation_language: input.presentation_language }) };
        const correction = ` Next read-only call (preserve the requested document selection): ${JSON.stringify({ tool: 'agdf_inspect', arguments: args })}`;
        if (messages.join(' ').length + correction.length <= 768) return messages.join(' ') + correction;
      }
    }
  } else if (name === 'agdf_dispatch' || Object.hasOwn(RUN_COMMAND_GROUPS, name)) {
    for (const key of name === 'agdf_dispatch' ? ['skill_id'] : ['command', 'operation_id', 'target_id', 'primary_target', 'target_source'])
      if (!Object.hasOwn(input, key)) messages.push(`Supply ${key}.`);
    const kind = input.command?.kind, descriptor = RUN_COMMAND_DESCRIPTORS[kind];
    if (descriptor?.group === name) {
      if (!['project.initialize', 'run.create', ...PLANNING_COMMAND_KINDS, ...TARGET_SCOPED_COMMAND_KINDS].includes(kind))
        for (const key of ['run_id', 'expected_revision_id']) if (!Object.hasOwn(input, key)) messages.push(`Supply ${key} for ${kind}.`);
      if (PLANNING_COMMAND_KINDS.includes(kind) && !input.planning) messages.push(`Supply planning for ${kind}; no Run/revision.`);
      messages.push(`Read agdf_inspect operation-contract module ${name}/${kind} for this payload. Preserve the original operation UUID and requested revision.`);
    }
  } else return '';
  if (Object.hasOwn(input, 'run_id') && !RUN_ID_PATTERN.test(input.run_id))
    messages.push('run_id must match ^[a-z0-9][a-z0-9._-]{0,127}$. Select the canonical Run ID from the request or confirmed inventory; do not guess another Run.');
  if (Object.hasOwn(input, 'primary_target') !== Object.hasOwn(input, 'target_source'))
    messages.push('Supply primary_target and target_source together from the confirmed task target; working_directory alone is not target authority.');
  return messages.join(' ').slice(0, 768);
}
