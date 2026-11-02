import { currentFixture } from './fixtures/current-run.js';
import { resolveMcpInput } from '../lib/mcp-input-resolution.js';
import { resources } from '../lib/resources/context.js';
import { withInputResolution } from '../lib/control-state/input-resolution.js';
import { inspectRunInputResolution } from '../lib/control-state/run-input-resolution.js';
import { commandGroupDefinition, runCommandRequestDigest } from '../lib/control-state/run-command-schema.js';
import { plannedTextDigest, planningId, mutatePlannedUr as mutateOwner } from '../lib/control-state/planned-entry.js';
import { createRunFromPlanned as handoffOwner } from '../lib/control-state/planned-handoff.js';
import { mkdtempSync, realpathSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { resolveControlCommandTarget } from '../lib/control-state/approval-command-contract.js';
import { createRunMaterialStore } from '../lib/control-state/run-material.js';

export const completeUr = '# UR: Independent work\n\n## Problem\nThe current flow loses the selected intent.\n\n## Goal\nPreserve one explicit intent.\n\n## Scope\nOnly the selected undertaking.\n\n## Non-Goals\nOther work remains excluded.\n\n## Acceptance Signals\nThe selected intent is visible after handoff.\n\n## Risks And Unknowns\nNo unresolved clarification.\n';
export const clarifiedUr = completeUr.replace('\n\n## Problem', '\n\nStatus: draft\nGate: UR\nGate approval: open\nRequirements clarification: complete\nPreview requirement: none\n\n## Problem')
  + '\n## Affected Users\nMaintainers managing independent work.\n\n## Existing Source Of Truth\nThe existing repository contracts and sources.\n\n## Next Step\nReview the UR and request explicit Approval: UR.\n';

export function plannedFixture(t, ids = ['first']) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-planned-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', root]);
  currentFixture(t, { root });
  for (const id of ids) createRun(root, id);
  return root;
}

export function commandBinding(root, id = 'first') {
  const text = readFileSync(join(root, `.agdf/control/runs/${id}/RUN_STATE.md`), 'utf8');
  return { schema_version: '1', presentation_language: 'en', working_directory: root, primary_target: root,
    target_source: 'explicit_target', target_id: resolveControlCommandTarget(root).target_id, run_id: id,
    expected_revision_id: text.match(/^- revision_id: (.+)$/m)[1], operation_id: randomUUID(), assurance: 'cooperative_local' };
}

export function stagedUr(t, binding, text = completeUr) {
  const store = createRunMaterialStore(); t.after(() => store.close());
  const call = payload => store.stage({ ...binding, operation_id: randomUUID(), command: { kind: 'material.stage', payload } });
  const transfer_id = call({ action: 'begin', files: [{ slot: 'UR', bytes: Buffer.byteLength(text) }] }).family_result.transfer_id;
  const bytes = Buffer.from(text);
  for (let offset = 0; offset < bytes.length; offset += 16384)
    call({ action: 'append', transfer_id, file: 0, offset, data: bytes.subarray(offset, offset + 16384).toString('base64') });
  const source = call({ action: 'seal', transfer_id }).family_result.files[0].reference;
  const input = { ...binding, command: { kind: 'step.record', payload: { step: 'ur', title: 'Independent work', source } } };
  return { input, materialGrants: store.grants(input) };
}

// Unit/process owners still use the same normalized captured command context.
// Material content is an explicit private synthetic fixture input, not a public
// material capability or a production authorization shortcut.
function captured(root, input, kind, payload, work) {
  const plan_id = input.plan_id ?? planningId(input.operation_id);
  const group = kind === 'run.create_from_planned' ? 'agdf_run' : 'agdf_record';
  const command = { schema_version: '1', presentation_language: 'en', working_directory: root,
    primary_target: root, target_source: 'explicit_target', target_id: input.target_id ?? resolveControlCommandTarget(root).target_id,
    planning: { plan_id, expected_digest: input.expected_digest }, operation_id: input.operation_id,
    assurance: 'cooperative_local', command: { kind, payload } };
  const resolved = resolveMcpInput(commandGroupDefinition(group), command, { defaults: resources.defaults, lookupOriginal: inspectRunInputResolution });
  return withInputResolution(resolved.resolution, () => work({ ...input, request_digest: runCommandRequestDigest(resolved.arguments) }), resolved.original);
}
export function boundMutatePlannedUr(root, input, options) {
  const source = { material_id: input.operation_id, digest: plannedTextDigest(input.content) };
  return captured(root, input, input.kind, { source, ...(input.priority === undefined ? {} : { priority: input.priority }) },
    bound => mutateOwner(root, bound, options));
}
export function boundCreateRunFromPlanned(root, input, options) {
  return captured(root, input, 'run.create_from_planned', { title: input.title ?? 'Independent work' },
    bound => handoffOwner(root, bound, options));
}
