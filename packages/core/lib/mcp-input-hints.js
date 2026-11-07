import { isAbsolute } from 'node:path';
import { CONTROL_INSPECT_FUNCTION_DEFINITION, inspectInputValidationHint } from './control-inspect/contract.js';
import { RUN_COMMAND_DESCRIPTORS, RUN_COMMAND_GROUPS, PLANNING_COMMAND_KINDS, TARGET_SCOPED_COMMAND_KINDS, schemaDiagnostics } from './control-state/run-command-schema.js';
import { RUN_ID_PATTERN } from './control-state/run-identity.js';

function unboundCreationHelp(input) {
  const fields = CONTROL_INSPECT_FUNCTION_DEFINITION.inputSchema.properties;
  const keys = ['working_directory', 'primary_target', 'target_source'];
  if (!keys.every(key => Object.hasOwn(input, key) && !schemaDiagnostics(input[key], fields[key]).length)
    || !isAbsolute(input.working_directory) || !isAbsolute(input.primary_target)
    || input.presentation_language !== undefined && schemaDiagnostics(input.presentation_language, fields.presentation_language).length) return null;
  return { tool: 'agdf_inspect', arguments: { operation: 'operation-contract', module: 'agdf_run/run.create',
    ...Object.fromEntries(keys.map(key => [key, input[key]])),
    ...(input.presentation_language === undefined ? {} : { presentation_language: input.presentation_language }) } };
}

// Presentation only: never repairs an argument or decides permission. The SDK
// and the canonical Core owners still validate the original request unchanged.
export function mcpInputValidationHint(name, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return '';
  const messages = [];
  if (name === 'agdf_inspect') {
    if (input.operation === 'status') messages.push('Run status uses agdf_inspect operation gate-check. status is invalid; never dispatch a skill for a read.');
    const hint = inspectInputValidationHint(input);
    if (hint) messages.push(hint);
    if (['status', 'gate-check', 'presentation-document', 'presentation-preview'].includes(input.operation)) {
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
    if (name === 'agdf_dispatch' && input.intake_mode !== undefined && !input.run_id) {
      messages.push('intake_mode requires intake:true and a nonempty run_id; null is invalid. Initial unbound intake omits BOTH run_id and intake_mode. For a new MCP Run, use the supplied agdf_run/run.create form and its returned binding; never invent a Run ID. A requested resume must keep its confirmed Run/revision, not switch to new.');
      if (input.skill_id === 'gate-check' && input.intake === true && input.intake_mode === 'new'
        && !['run_id', 'expected_revision_id', 'planning', 'ur_action', 'prd_action', 'sd_action', 'tp_action'].some(key => Object.hasOwn(input, key))
        && !input.continue_delivery) {
        const help = unboundCreationHelp(input);
        const correction = help && ` Next read-only schema call (no Run creation): ${JSON.stringify(help)}`;
        if (correction && messages.join(' ').length + correction.length <= 768) return messages.join(' ') + correction;
      }
    }
    if (name === 'agdf_dispatch' && ['ur_action', 'prd_action', 'sd_action', 'tp_action'].some(k => input[k] !== undefined))
      messages.push('Source revision actions use skill_id gate-check, intake:true, intake_mode:resume and expected_revision_id (never revision). An already bound incomplete-draft authoring continuation needs no additional author dispatch/intake: use its supplied writer forms.');
    for (const key of name === 'agdf_dispatch' ? ['skill_id'] : ['command', 'operation_id', 'target_id', 'primary_target', 'target_source'])
      if (!Object.hasOwn(input, key)) messages.push(`Supply ${key}.`);
    const kind = input.command?.kind, descriptor = RUN_COMMAND_DESCRIPTORS[kind];
    if (descriptor?.group === name) {
      if (kind === 'run.create') messages.push('run.create accepts only command.payload.title, with the supplied original operation UUID and target. Omit run_id and expected_revision_id; do not add source, language or other payload fields. Use the returned canonical Run/revision after creation.');
      if (['material.stage', 'planned_material.stage'].includes(kind) && input.command.payload?.action === 'put') {
        const limit = RUN_COMMAND_DESCRIPTORS['material.stage'].payload_schema.oneOf[0].properties.files.items.properties.content.maxLength;
        const oversized = Array.isArray(input.command.payload.files) && input.command.payload.files.find(file => typeof file?.content === 'string' && Buffer.byteLength(file.content, 'utf8') > limit);
        if (oversized) messages.push(`put file is ${Buffer.byteLength(oversized.content, 'utf8')} UTF-8 bytes; maximum ${limit}. Preserve the entire text and use multipart begin/append/seal; measure bytes before submitting. No transfer was dispatched by this validation failure.`);
      }
      if (!['project.initialize', 'run.create', ...PLANNING_COMMAND_KINDS, ...TARGET_SCOPED_COMMAND_KINDS].includes(kind))
        for (const key of ['run_id', 'expected_revision_id']) if (!Object.hasOwn(input, key)) messages.push(`Supply ${key} for ${kind}.`);
      if (PLANNING_COMMAND_KINDS.includes(kind) && !input.planning) messages.push(`Supply planning for ${kind}; no Run/revision.`);
      messages.push(`Read agdf_inspect operation-contract module ${name}/${kind} for this payload. Preserve the original operation UUID and requested revision.`);
    }
  } else return '';
  if (Object.hasOwn(input, 'run_id') && (typeof input.run_id !== 'string' || !RUN_ID_PATTERN.test(input.run_id)))
    messages.push('run_id must match ^[a-z0-9][a-z0-9._-]{0,127}$. Select the canonical Run ID from the request or confirmed inventory; do not guess another Run.');
  if (Object.hasOwn(input, 'primary_target') !== Object.hasOwn(input, 'target_source'))
    messages.push('Supply primary_target and target_source together from the confirmed task target; working_directory alone is not target authority.');
  return messages.join(' ').slice(0, 768);
}
