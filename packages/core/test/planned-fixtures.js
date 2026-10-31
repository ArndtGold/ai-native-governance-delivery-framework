import { mkdtempSync, realpathSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { initializeCanonicalControl } from '../../cli/lib/scaffold/canonical-init.js';
import { generatedFilesForTarget } from '../../cli/lib/scaffold/plan.js';
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
  initializeCanonicalControl(root, generatedFilesForTarget('init', root, false, 'en'));
  const path = join(root, '.agdf/control/config.json');
  // Disposable new-layout fixture, never a shortcut for migrating live control.
  writeFileSync(path, JSON.stringify({ ...JSON.parse(readFileSync(path, 'utf8')), control_layout: 'planned-urs-v1' }, null, 2) + '\n');
  rmSync(join(root, '.agdf/control/MASTER_BACKLOG.md'), { force: true });
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
