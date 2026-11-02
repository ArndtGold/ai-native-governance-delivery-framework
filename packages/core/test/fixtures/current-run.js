import { resolveMcpInput } from '../../lib/mcp-input-resolution.js';
import { resources } from '../../lib/resources/context.js';
import { withInputResolution } from '../../lib/control-state/input-resolution.js';
import { inspectRunInputResolution } from '../../lib/control-state/run-input-resolution.js';
import { commandGroupDefinition } from '../../lib/control-state/run-command-schema.js';
// Actual current Core commands in disposable repositories. Approval replies here
// are explicit synthetic test prerequisites, never human production acceptance.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { cliGitObservation } from '../../../cli/lib/control-evaluation/git-observation.js';
import { createRunCommandService } from '../../lib/control-state/run-command-service.js';
import { RUN_COMMAND_DESCRIPTORS } from '../../lib/control-state/run-command-schema.js';
import { createRunMaterialStore } from '../../lib/control-state/run-material.js';
import { resolveControlCommandTarget } from '../../lib/control-state/approval-command-contract.js';
import { runRelativePath } from '../../lib/control-state/run-identity.js';
import { parseControlState, parseRunState } from '../../lib/control-state/run-state-parser.js';
import { resolutionRecord } from '../../lib/control-state/input-resolution.js';
import { prepareRunContentState } from '../../lib/control-evaluation/run-state.js';
import { transitionDecisionForRunState } from '../../lib/control-evaluation/gate-policy.js';
export function currentFixture(t, { root: supplied, initialize = true, ...options } = {}) {
  const root = supplied ?? realpathSync(mkdtempSync(join(tmpdir(), 'agdf-current-')));
  if (!supplied) t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init', '-q', root]);
  const store = createRunMaterialStore(); t.after(() => store.close());
  const base = { schema_version: '1', working_directory: root, primary_target: root, target_source: 'explicit_target',
    target_id: resolveControlCommandTarget(root).target_id, presentation_language: 'en', assurance: 'cooperative_local' };
  const request = (kind, payload, binding = {}) => ({ ...base, operation_id: randomUUID(), ...binding, command: { kind, payload } });
  const execute = input => {
    const group = input.command.kind === 'operation.recover' ? input.command.payload.original_kind === 'lifecycle_close.record' ? 'agdf_closeout' : RUN_COMMAND_DESCRIPTORS[input.command.payload.original_kind].group : RUN_COMMAND_DESCRIPTORS[input.command.kind].group;
    const selected = resolveMcpInput(commandGroupDefinition(group), input, { defaults: resources.defaults, lookupOriginal: inspectRunInputResolution });
    return withInputResolution(selected.resolution, () => {
      const result = createRunCommandService({ packageVersion: '0.20.2', gitObservation: cliGitObservation, ...options,
        materialGrants: store.grants(selected.arguments) })(group, selected.arguments);
      store.settle(selected.arguments, result); return result;
    }, selected.original);
  };
  const call = (kind, payload, binding) => execute(request(kind, payload, binding));
  if (initialize) {
    const result = call('project.initialize', { language: 'en' });
    assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  }
  const material = (binding, slot, text, { transfer = false } = {}) => {
    const bytes = Buffer.from(text), stage = payload => store.stage(request(binding.planning ? 'planned_material.stage' : 'material.stage', payload, binding));
    const first = stage({ action: 'begin', files: [{ slot, bytes: bytes.length }] });
    assert.equal(first.outcome, 'accepted', JSON.stringify(first));
    const transfer_id = first.family_result.transfer_id;
    for (let offset = 0; offset < bytes.length; offset += 16384) {
      const appended = stage({ action: 'append', transfer_id, file: 0, offset, data: bytes.subarray(offset, offset + 16384).toString('base64') });
      assert.equal(appended.outcome, 'accepted', JSON.stringify(appended));
    }
    const sealed = stage({ action: 'seal', transfer_id }); assert.equal(sealed.outcome, 'accepted', JSON.stringify(sealed));
    const reference = sealed.family_result.files[0].reference;
    return transfer ? { reference, transfer_id } : reference;
  };
  return { root, store, base, request, execute, call, material };
}
export function currentRun(f, title = 'Synthetic current Run') {
  const created = f.call('run.create', { title }); assert.equal(created.outcome, 'accepted', JSON.stringify(created));
  const id = created.family_result.run_id, path = join(f.root, runRelativePath(id, '', 'RUN_STATE.md'));
  const content = () => readFileSync(path, 'utf8');
  const binding = () => ({ run_id: id, expected_revision_id: parseRunState(content()).meta.revision_id });
  const call = (kind, payload) => f.call(kind, payload, binding());
  const record = (gate, text, update_draft = false) => call('artefact.record', {
    gate, material: f.material(binding(), gate, text), reviewer: 'Synthetic reviewer', reviewed: true, update_draft });
  const step = (step, text, fields = {}) => call('step.record', { step,
    source: f.material(binding(), fields.internal_step ?? ({ ur: 'UR', route: 'Brownfield Review', review: 'CR', evidence: 'EVIDENCE' })[step], text), ...fields });
  const present = gate => call('presentation.prepare', { gate });
  const approve = gate => {
    const p = present(gate); assert.equal(p.outcome, 'accepted', JSON.stringify(p));
    return call('approval.record', { gate, presentation_id: p.family_result.presentation_id, response: `Approval: ${gate}` });
  };
  const state = () => prepareRunContentState(f.root, content(), path);
  return { f, id, path, created, content, binding, call, record, step, present, approve, state,
    control: () => parseControlState(content()), decision: () => transitionDecisionForRunState(state()), receipt: result => resolutionRecord(result.receipt) };
}
