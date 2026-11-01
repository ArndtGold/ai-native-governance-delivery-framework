import { randomUUID } from 'node:crypto';
import { createCoreServices } from '#agdf-core';
import { resolveControlCommandTarget } from '#agdf-core/control-state/approval-command-contract.js';
import { resources } from '../runtime/control-context.js';
import { cliGitObservation } from '../control-evaluation/git-observation.js';

// The convenience initializer uses the same complete command normalization,
// original-operation capture and fixed seed owner as the MCP command.
export function executeProjectInit(options, io = console) {
  if (options.force) { io.error('AGDF_CANONICAL_INIT_FORCE_FORBIDDEN'); return 2; }
  try {
    const target = resolveControlCommandTarget(options.dir);
    const input = { working_directory: options.workingDirectory, primary_target: target.root,
      target_source: options.dirExplicit ? 'explicit_target' : 'current_repository', target_id: target.target_id,
      operation_id: options.operationId ?? randomUUID(),
      command: { kind: 'project.initialize', payload: options.languageExplicit ? { language: options.language.chat_language } : {} } };
    const result = createCoreServices({ resources, observers: { gitObservation: cliGitObservation } }).command('agdf_project', input);
    io.log(JSON.stringify(result, null, 2));
    return ['accepted', 'already_applied'].includes(result.outcome) ? 0 : 2;
  } catch (error) { io.error(error.code ?? error.message); return 2; }
}
