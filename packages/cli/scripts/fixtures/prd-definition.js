import { createCoreServices } from '../../../core/lib/index.js';
import { resolveControlCommandTarget } from '../../../core/lib/control-state/approval-command-contract.js';
import { artefactFileDigest } from '../../../core/lib/control-state/run-seal.js';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createRun } from '../../../core/lib/control-state/run-state-repository.js';
import { parseRunState } from '../../../core/lib/control-state/run-state-parser.js';
import { clarifiedUr } from '../../../core/test/planned-fixtures.js';

// Synthetic disposable approvals only. Sources are authored outside canonical
// documents, then atomically published by the actual CLI current writer.
export function createPrdDefinitionTestRun(root, validator, runId = 'prd-authoring-test', env = process.env,
  { route = 'structured_delivery', previewRequirement = false, uxRequired = false, uxRecorded = false } = {}) {
  const log = [];
  const call = (command, ...args) => {
    const result = spawnSync(process.execPath, [validator, command, ...(command.startsWith('agdf-') ? [] : ['--dir', root]), '--json', ...args], { encoding: 'utf8', env });
    assert.equal(result.error, undefined);
    let value; try { value = JSON.parse(result.stdout); } catch { value = null; }
    log.push({ command, args, code: result.status, value, stderr: result.stderr });
    return { code: result.status, value, text: result.stdout + result.stderr };
  };
  const state = createRun(root, runId), prefix = `.agdf/control/runs/${runId}/documents/`;
  const inputDirectory = join(root, '.test-inputs', runId); mkdirSync(inputDirectory, { recursive: true });
  const file = name => join(inputDirectory, name), canonicalFile = name => join(root, prefix, name);
  const revision = () => parseRunState(readFileSync(state, 'utf8')).meta.revision_id;
  const run = (command, ...args) => call(command, '--run', runId, ...args);
  const check = result => { assert.equal(result.value?.outcome, 'accepted', result.text); return result; };
  writeFileSync(file('UR.md'), clarifiedUr.replace('Independent work', 'Synthetic saved-filter need')
    .replace('Preview requirement: none', `Preview requirement: ${previewRequirement ? 'before_prd_interactive' : 'none'}`)
    + '\n## AGDF Approval Summary (de; source=en)\n- Problem: Derselbe Filter muss wiederholt aufgebaut werden.\n- Ziel: Einen persönlichen Filter speichern und wiederherstellen.\n- Umfang: Ein Filter ohne Teilen oder Berechtigungsänderung.\n');
  check(run('run-step', '--revision', revision(), '--step', 'ur', '--title', 'Synthetic saved filter', '--evidence', file('UR.md')));
  const approve = (gate, presentation, rev = revision(), response = `Approval: ${gate}`) => run('run-approve',
    '--revision', rev, '--gate', gate, '--presentation', presentation, '--response', response, '--operation', randomUUID());
  const present = (gate = 'PRD', language = 'en') => run('run-present', '--revision', revision(), '--gate', gate, '--language', language);
  const ur = check(present('UR')); check(approve('UR', ur.value.family_result.presentation_id));
  writeFileSync(file('BROWNFIELD_REVIEW.md'), `# Brownfield Review\n\nSynthetic existing filter owner.\n- ux_intent_definition_required: ${uxRequired ? 'yes' : 'no'}\n`);
  check(run('run-step', '--revision', revision(), '--step', 'route', '--route', route, '--reason',
    'Synthetic public-contract test route, never live authorization', '--evidence', file('BROWNFIELD_REVIEW.md')));
  if (uxRecorded) {
    writeFileSync(canonicalFile('UX_INCOMING.md'),'# UX Intent Definition\n- decision: ready\nSynthetic reviewed analytical input before PRD.\n');
    const target=resolveControlCommandTarget(root),path=prefix+'UX_INCOMING.md';
    const result=createCoreServices().command('agdf_record',{schema_version:'1',assurance:'cooperative_local',presentation_language:'en',working_directory:target.root,primary_target:target.root,target_source:'explicit_target',target_id:target.target_id,run_id:runId,expected_revision_id:revision(),operation_id:randomUUID(),command:{kind:'step.record',payload:{step:'internal',internal_step:'UX Intent Definition',decision:'ready',source:{path,digest:artefactFileDigest(root,path)}}}});
    assert.equal(result.outcome,'accepted',JSON.stringify(result));
  }
  const recording = (gate = 'PRD', update_draft = false, mutate = () => {}) => {
    const value = { gate, material: { path: file(gate === 'QA' ? 'QA_REPORT.md' : gate + '.md') },
      reviewer: 'Synthetic current test reviewer', reviewed: true, update_draft };
    mutate(value); return value;
  };
  const recordGate = (gate, update = false, mutate) => {
    const value = recording(gate, update);
    if (mutate) {
      const path = `.agdf/control/runs/${runId}/evidence/source-proof-${gate}.md`;
      mkdirSync(join(root, `.agdf/control/runs/${runId}/evidence`), { recursive: true });
      writeFileSync(join(root, path), readFileSync(value.material.path));
      value.material = { path, digest: artefactFileDigest(root, path) };
      mutate(value);
      const target = resolveControlCommandTarget(root), request = join(inputDirectory, 'source-proof-command.json');
      writeFileSync(request, JSON.stringify({ schema_version: '1', working_directory: root, primary_target: root,
        target_source: 'explicit_target', target_id: target.target_id, run_id: runId, expected_revision_id: revision(),
        operation_id: randomUUID(), assurance: 'cooperative_local', command: { kind: 'artefact.record', payload: value } }));
      return call('agdf-record', '--command-file', request);
    }
    return run('run-step', '--revision', revision(), '--step', 'artefact', '--gate', value.gate, '--evidence', value.material.path,
      '--reviewer', value.reviewer, ...(value.reviewed ? ['--reviewed', 'true'] : []), ...(value.update_draft ? ['--update-draft', 'true'] : []));
  };
  const record = (update = false, mutate) => recordGate('PRD', update, mutate);
  return { root, runId, prefix, state, file, canonicalFile, revision, run, call, log, present, approve, record, recording, recordGate };
}

export const syntheticPrd = (open = false) => `# PRD: Synthetic saved filter

Status: draft
Gate: PRD
Gate approval: open
Owner: Test product owner
Traceability contract: criteria-chain-v1

## Product Scope
Save and restore one named user-owned filter. No sharing or permissions change.

## Acceptance Criteria
- criterion_id: AC-001
- requirement: Saving and restoring reproduces the selected filter values for the same user.
- observable_success: The restored filter values equal the saved values.

## Approval Decisions
| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Saved-filter ownership | before_prd | ${open ? "open" : "resolved"} | ${open ? "" : "Only the saving user owns the filter"} | Test product owner |

## AGDF Approval Summary (de; source=en)
- Ziel: Einen persönlichen Filter speichern und wiederherstellen.
- Umfang: Ein benannter Filter ohne Freigabe für andere Nutzer.
- AC-001: Wiederherstellung reproduziert die gespeicherten Filterwerte desselben Nutzers.
- Entscheidungen: ${open ? "Die Produktentscheidung zur Eigentümerschaft ist offen." : "Persönliche Eigentümerschaft ist geklärt."}
`;
