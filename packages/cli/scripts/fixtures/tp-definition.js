import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { createSdDefinitionTestRun, syntheticSd } from './sd-definition.js';
import { artefactFileDigest } from '../../../core/lib/control-state/run-seal.js';
import { resolveControlCommandTarget } from '../../../core/lib/control-state/approval-command-contract.js';

export const syntheticTp = () => `# TP: Saved filter verification
Status: draft
Gate: TP
Gate approval: open
Owner: Test plan owner
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1
## Task List
| task_id | task |
|---|---|
| T-001 | Exercise save and restore through the existing filter store |
## Verification Traceability
| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | Restored values equal saved values for this user | Isolated filter integration log |
## Test Plan
| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | Execute local integration fixture | Local isolated Node runtime | Local temp write only | Test plan owner | Saved/restored value comparison | Keep evidence missing and repair local fixture access |
## Planning Decisions
| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Fixture execution | TP | resolved | Use a local isolated runtime without external access | Test plan owner |
## AGDF Approval Summary (de; source=en)
- Ziel: Persönliche Filterwerte mit bestehenden Eigentumsgrenzen prüfen.
- Aufgaben: Speichern und Wiederherstellen im isolierten Laufzeitpfad testen.
- Nachweise: Konkrete Werte vergleichen; fehlender Zugriff bleibt als Lücke sichtbar.
`;

export function createTpDefinitionTestRun(root, validator, runId = 'tp-authoring-test', env = process.env) {
  const f = createSdDefinitionTestRun(root, validator, runId, env);
  writeFileSync(f.file('SD.md'), syntheticSd()); assert.equal(f.recordSd().value.outcome, 'recorded');
  const p = f.present('SD', 'de'); assert.equal(p.value.outcome, 'prepared');
  assert.equal(f.approve('SD', p.value.presentation_id).value.outcome, 'approved');
  return f;
}

// Isolated synthetic authorizations only, never production human approval.
export function withTpFixture(callback, { retain = false } = {}) {
  const temporary = mkdtempSync(join(tmpdir(), 'agdf-tp-definition-'));
  try {
    const generated = resolve(import.meta.dirname, '../../generated');
    for (const entry of ['plugins/agdf', '.agents/plugins/marketplace.json']) cpSync(join(generated, entry), join(temporary, entry), { recursive: true });
    const plugin = join(temporary, 'plugins/agdf'), validator = join(plugin, 'runtime/agdf-local.js');
    const root = join(temporary, 'project'); mkdirSync(root); execFileSync('git', ['init', '-q', root]);
    execFileSync(process.execPath, [resolve(import.meta.dirname, '../../bin/create-agdf.js'), 'init', '--dir', root, '--language', 'en']);
    const env = { ...process.env, PLUGIN_ROOT: plugin, AGDF_SURFACE: 'codex' }; delete env.AGDF_RUN_ID;
    const f = createTpDefinitionTestRun(root, validator, 'tp-authoring-test', env);
    const bytes = () => {
      const h = createHash('sha256'), directory = join(root, '.agdf/control');
      const scan = folder => { for (const entry of readdirSync(folder, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
        const path = join(folder, entry.name); if (entry.isDirectory()) scan(path); else if (entry.isFile()) h.update(path.slice(directory.length)).update(readFileSync(path));
      } }; scan(directory); return h.digest('hex');
    };
    const dispatch = (skill = 'gate-check', ...args) => {
      const before = bytes();
      const r = spawnSync(process.execPath, [validator, 'skill-dispatch', '--json', '--skill', skill, '--surface', 'codex', '--language', 'de',
        '--working-directory', root, '--target-source', 'explicit_target', '--primary-target', root, ...args], { env, encoding: 'utf8' });
      const value = JSON.parse(r.stdout); assert.equal(bytes(), before, 'dispatch changes no fixture control bytes');
      f.log.push({ skill, args, code: r.status, value }); return value;
    };
    const recordTp = (update = false, mutate = () => {}) => {
      const proof = f.prefix + `tp-mapping-${randomUUID()}.json`, input = f.prefix + `tp-recording-${randomUUID()}.json`;
      const value = { schema_version: '1', target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId, expected_revision_id: f.revision(),
        destination: { type: 'TP', path: f.prefix + 'TP.md', digest: artefactFileDigest(root, f.prefix + 'TP.md'), status: 'draft' },
        source: { type: 'SD', path: f.prefix + 'SD.md', digest: artefactFileDigest(root, f.prefix + 'SD.md') },
        relationship: { from: 'TP', relationship: 'derived_from', to: 'SD' }, review: { reviewer: 'synthetic TP reviewer', path: proof, digest: '' }, update_draft: update };
      const { schema_version, target_id, run_id, relationship, destination, source } = value;
      writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, relationship, destination, source, reviewer: value.review.reviewer, reviewed: true }));
      value.review.digest = artefactFileDigest(root, proof); mutate(value); writeFileSync(join(root, input), JSON.stringify(value));
      return f.run('run-step', '--revision', f.revision(), '--step', 'artefact', '--gate', 'TP', '--evidence', input);
    };
    const result = callback({ ...f, root, plugin, validator, env, temporary, dispatch, bytes, recordTp,
      bound: (...args) => dispatch('gate-check', '--run', f.runId, ...args),
      revise: () => dispatch('gate-check', '--run', f.runId, '--intake', '--intake-mode', 'resume', '--revision', f.revision(), '--tp-action', 'revise') });
    if (process.env.AGDF_TP_TEST_LOG) writeFileSync(process.env.AGDF_TP_TEST_LOG, JSON.stringify({ synthetic_authorization: true, consumer: 'assembled CLI', log: f.log }, null, 2));
    return result;
  } finally { if (!retain) rmSync(temporary, { recursive: true, force: true }); }
}
