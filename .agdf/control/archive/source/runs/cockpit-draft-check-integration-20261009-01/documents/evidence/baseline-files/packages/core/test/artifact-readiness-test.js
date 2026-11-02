import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { inspectArtifactReadiness } from '../lib/control-inspect/artifact-readiness.js';
import { evaluatePrdReadiness } from '../lib/control-evaluation/prd-readiness.js';
import { artifactReadinessFixture, readyPrd } from './fixtures/artifact-readiness.js';

function snapshot(root) {
  const files = {};
  const visit = path => { for (const entry of readdirSync(path, { withFileTypes: true })) {
    const file = join(path, entry.name);
    if (entry.isDirectory()) visit(file);
    else files[file] = createHash('sha256').update(readFileSync(file)).digest('hex');
  } };
  visit(root); return files;
}

const f = artifactReadinessFixture();
const input = { runId: f.runId, gate: f.gate, expectedRevisionId: f.revision, presentationLanguage: 'de' };
try {
  writeFileSync(f.path, readyPrd);
  const before = snapshot(f.root), result = inspectArtifactReadiness(f.root, input);
  assert.equal(result.ready, true, JSON.stringify(result));
  assert.equal(result.authorizes, false);
  assert.equal(result.semantic_review_required, true);
  assert.equal(result.registration_required, true);
  assert.deepEqual(result.checks.find(row => row.name === 'prd_readiness').open_decisions,
    evaluatePrdReadiness(f.root, { artefacts: new Map([['PRD', { path: `${f.prefix}PRD.md` }]]) }, { presentationLanguage: 'de' }).open_decisions);
  assert.deepEqual(snapshot(f.root), before, 'Checking must not register, create a presentation, reseal or write any source.');
  for (const [content, code] of [
    [readyPrd.replace('- AC-001: Die gewählte Quelle bleibt lesbar.\n', ''), 'approval_summary_criteria_incomplete'],
    [readyPrd.replace('before_prd | resolved', 'before_prd | open'), 'prd_readiness'],
    [readyPrd.replace('Owner: Synthetic product owner', 'Owner:'), 'prd_readiness'],
  ]) {
    writeFileSync(f.path, content);
    const observed = inspectArtifactReadiness(f.root, input);
    assert.equal(observed.ready, false);
    assert.ok(observed.diagnostics.some(row => row.code === code), JSON.stringify(observed));
  }
  writeFileSync(f.path, readyPrd);
  assert.equal(inspectArtifactReadiness(f.root, { ...input, expectedRevisionId: '00000000-0000-4000-8000-000000000000' }).diagnostics[0].code, 'artifact_revision_stale');
  assert.equal(inspectArtifactReadiness(f.root, { ...input, gate: 'TP' }).diagnostics[0].code, 'artifact_gate_not_ready');
  assert.equal(inspectArtifactReadiness(f.root, { ...input, runId: 'missing-run' }).diagnostics[0].code, 'artifact_run_invalid');
  rmSync(f.path);
  assert.equal(inspectArtifactReadiness(f.root, input).diagnostics[0].code, 'artifact_source_unavailable');
  symlinkSync(join(f.root, `${f.prefix}UR.md`), f.path);
  assert.equal(inspectArtifactReadiness(f.root, input).diagnostics[0].code, 'artifact_read_resource_denied');
  rmSync(f.path); writeFileSync(f.path, readyPrd);
  f.reseal(text => text.replace('- lifecycle: active', '- lifecycle: completed'));
  assert.equal(inspectArtifactReadiness(f.root, input).diagnostics[0].code, 'artifact_run_inactive');
  f.reseal(text => text.replace('- lifecycle: completed', '- lifecycle: active').replace('| PRD | missing | |', '| PRD | approved | Synthetic isolated test evidence |'));
  assert.equal(inspectArtifactReadiness(f.root, input).diagnostics[0].code, 'artifact_already_approved');
  f.reseal(text => text.replace('| PRD | approved | Synthetic isolated test evidence |', '| PRD | missing | |'));
  writeFileSync(f.runPath, readFileSync(f.runPath, 'utf8').replace('Synthetic isolated authoring check.', 'Unrecorded change.'));
  assert.equal(inspectArtifactReadiness(f.root, input).diagnostics[0].code, 'artifact_run_integrity');
} finally { rmSync(f.root, { recursive: true, force: true }); }

for (const gate of ['UR', 'SD', 'TP']) {
  const f = artifactReadinessFixture(gate, 'en');
  try {
    const result = inspectArtifactReadiness(f.root, { runId: f.runId, gate, expectedRevisionId: f.revision, presentationLanguage: 'en' });
    assert.equal(result.ready, true, JSON.stringify(result));
    assert.ok(result.checks.some(row => row.name === `${gate.toLowerCase()}_${gate === 'TP' ? 'traceability' : gate === 'SD' ? 'decisions' : 'readiness'}`));
    const broken = gate === 'UR' ? '# UR: Incomplete need\n\nRequirements clarification: complete\n'
      : gate === 'SD' ? '# SD: Open design\n\nDesign Decisions contract: sd-decisions-v1\n\n## Design Decisions\n| Decision | Timing | Status | Resolution | Owner |\n|---|---|---|---|---|\n| Ownership | before_sd | open | Decide ownership | Synthetic design owner |\n'
        : '# TP: Missing scenario mapping\n\nTraceability contract: criteria-chain-v1\n';
    writeFileSync(f.path, broken);
    const unready = inspectArtifactReadiness(f.root, { runId: f.runId, gate, expectedRevisionId: f.revision, presentationLanguage: 'en' });
    assert.equal(unready.ready, false, JSON.stringify(unready));
    assert.ok(unready.diagnostics.some(row => row.code === `${gate.toLowerCase()}_${gate === 'TP' ? 'traceability' : gate === 'SD' ? 'decisions' : 'readiness'}`));
  } finally { rmSync(f.root, { recursive: true, force: true }); }
}
console.log('Artifact authoring readiness: validator parity, incomplete input, revision, source and read-only checks passed.');
