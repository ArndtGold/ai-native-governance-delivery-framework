import { execFileSync } from 'node:child_process';
import { cliGitObservation } from '../../../cli/lib/control-evaluation/git-observation.js';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createRunCommandService } from '../../lib/control-state/run-command-service.js';
import { resolveControlCommandTarget } from '../../lib/control-state/approval-command-contract.js';
import { resolveMcpInput } from '../../lib/mcp-input-resolution.js';
import { resources } from '../../lib/resources/context.js';
import { commandGroupDefinition } from '../../lib/control-state/run-command-schema.js';
import { withInputResolution } from '../../lib/control-state/input-resolution.js';

// Current disposable setup through the production command boundary. Old layouts
// and captured historical fixtures must never be normalized by this helper.
export function initializeCurrentControl(root, language = 'en') {
  execFileSync('git', ['init', '-q', root]);
  const arguments_ = { schema_version: '1', working_directory: root, primary_target: root, target_source: 'explicit_target',
    target_id: resolveControlCommandTarget(root).target_id, presentation_language: typeof language === 'string' ? language : language.chat_language,
    operation_id: randomUUID(), assurance: 'cooperative_local', command: { kind: 'project.initialize', payload: { language } } };
  const selected = resolveMcpInput(commandGroupDefinition('agdf_project'), arguments_, { defaults: resources.defaults });
  const result = withInputResolution(selected.resolution, () => createRunCommandService({ packageVersion: '0.20.2', gitObservation: cliGitObservation })('agdf_project', selected.arguments));
  assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  return result;
}
