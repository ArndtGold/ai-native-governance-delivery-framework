import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tryLinkFile } from '../../../scripts/support/symlinks.js';
import { inspectArtifactReadiness, describeArtifactReadiness } from '../lib/control-inspect/artifact-readiness.js';
import { evaluatePrdReadiness } from '../lib/control-evaluation/prd-readiness.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { prdDefinitionEligible } from '../lib/skill-dispatch/prd-definition.js';
import { createCoreServices } from '../lib/index.js';
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
  if (tryLinkFile(join(f.root, `${f.prefix}UR.md`), f.path, 'artifact-readiness')) {
    assert.equal(inspectArtifactReadiness(f.root, input).diagnostics[0].code, 'artifact_read_resource_denied');
    rmSync(f.path);
  }
  writeFileSync(f.path, readyPrd);
  f.reseal(text => text.replace('- lifecycle: active', '- lifecycle: completed'));
  assert.equal(inspectArtifactReadiness(f.root, input).diagnostics[0].code, 'artifact_run_inactive');
  f.reseal(text => text.replace('- lifecycle: completed', '- lifecycle: active'));
  const originalState = readFileSync(f.runPath, 'utf8'); const tampered = originalState.replace(/^- owner:.*$/mu, '- owner: Foreign owner'); assert.notEqual(tampered, originalState);
  writeFileSync(f.runPath, tampered);
  assert.equal(inspectArtifactReadiness(f.root, input).diagnostics[0].code, 'artifact_run_integrity');
  writeFileSync(f.runPath, originalState); // restore this deliberate test fault only
  const recorded = f.recordCandidate(); assert.equal(recorded.value.outcome, 'accepted', recorded.text); const approved = f.approveCandidate(); assert.equal(approved.value.outcome, 'accepted', approved.text);
  assert.equal(inspectArtifactReadiness(f.root, { ...input, expectedRevisionId: f.currentRevision() }).diagnostics[0].code, 'artifact_already_approved');

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

{
  const f = artifactReadinessFixture('PRD', 'en', 'same-language-source-repair');
  const input = () => ({ runId: f.runId, gate: 'PRD', expectedRevisionId: f.revision, presentationLanguage: 'en' });
  try {
    const broken = readyPrd.replace('observable_success:', 'observable_success_required_evidence:');
    writeFileSync(f.path, broken);
    const before = snapshot(f.root), checked = inspectArtifactReadiness(f.root, input());
    assert.equal(checked.ready, false, JSON.stringify(checked));
    const issue = checked.diagnostics.find(row => row.code === 'approval_summary_criterion_content_missing');
    assert.ok(issue?.message.includes('AC-001') && issue.message.includes('observable_success'), JSON.stringify(checked));
    assert.equal(describeArtifactReadiness(checked).state, 'corrections_required');
    assert.deepEqual(snapshot(f.root), before, 'An invalid same-language draft is diagnosed without mutation.');
    writeFileSync(f.path, readyPrd);
    assert.equal(inspectArtifactReadiness(f.root, input()).ready, true);
    writeFileSync(f.path, broken);
    assert.equal(f.recordCandidate().value.outcome, 'accepted', 'Draft registration is not readiness or approval.');
    const registered = readFileSync(f.runPath, 'utf8');
    const gate = evaluateGateCheck(f.root, { runId: f.runId, presentationLanguage: 'en' });
    assert.equal(gate.blocking_reason, 'AGDF_PRD_DECISIONS_OPEN', JSON.stringify(gate));
    assert.ok(gate.prd_readiness.open_decisions.some(row => row.includes('AC-001') && row.includes('observable_success')));
    assert.equal(prdDefinitionEligible(gate, { run_id: f.runId, skill_id: 'gate-check', continue_delivery: true }), true,
      'The registered unready draft remains with its existing PRD author instead of a terminal evaluator error.');
    const services = createCoreServices();
    const routed = services.dispatch({ skillId: 'gate-check', runId: f.runId,
      workingDirectory: f.root, primaryTarget: f.root, targetSource: 'explicit_target',
      presentationLanguage: 'en', continueDelivery: true, surface: 'codex',
      expectedVersion: services.resources.pluginDefinition.version, interactionLocales: services.resources.interactionLocales });
    assert.equal(routed.outcome, 'skill_continuation', JSON.stringify(routed));
    assert.equal(routed.continuation.phase, 'prd_definition');
    assert.equal(routed.continuation.revision_id, f.revision);
    assert.equal(routed.terminal, false);
    assert.equal(f.approveCandidate().value.outcome, 'rejected');
    assert.equal(readFileSync(f.runPath, 'utf8'), registered, 'Rejected presentation/approval does not mutate the draft.');
  } finally { f.close(); }
}
console.log('Same-language source-field defects remain repairable by the PRD author and cannot be approved.');

for (const gate of ['SD', 'TP']) {
  const f = artifactReadinessFixture(gate, 'de', `localized-${gate.toLowerCase()}-repair`);
  const input = () => ({ runId: f.runId, gate, expectedRevisionId: f.revision, presentationLanguage: 'de' });
  const services = createCoreServices();
  const dispatch = () => services.dispatch({ skillId: 'gate-check', runId: f.runId,
    workingDirectory: f.root, primaryTarget: f.root, targetSource: 'explicit_target',
    presentationLanguage: 'de', continueDelivery: true, surface: 'codex',
    expectedVersion: services.resources.pluginDefinition.version, interactionLocales: services.resources.interactionLocales });
  try {
    const valid = readFileSync(f.path, 'utf8');
    const source = valid.replace(/\n## AGDF Approval Summary[^\n]*\n[\s\S]*$/u, '\n');
    const summary = valid.slice(source.length);
    let registeredDraft = false;
    assert.notEqual(source, valid);
    assert.equal(inspectArtifactReadiness(f.root, input()).ready, true);
    for (const [broken, reason] of [
      [source, 'approval_summary_locale_missing'],
      [valid + '\n' + summary, 'approval_summary_locale_duplicate'],
      [valid.replace('(de; source=en)', '(de; source=de)'), 'approval_summary_source_language_mismatch'],
      [source + '\n## AGDF Approval Summary (de; source=en)\n', 'approval_summary_locale_missing'],
    ]) {
      if (!registeredDraft) {
        writeFileSync(f.path, broken);
        const before = snapshot(f.root), preflight = inspectArtifactReadiness(f.root, input());
        assert.equal(preflight.ready, false, JSON.stringify(preflight));
        assert.ok(describeArtifactReadiness(preflight).findings.some(row => row.message.includes(reason)), JSON.stringify(preflight));
        assert.equal(describeArtifactReadiness(preflight).state, 'corrections_required');
        assert.deepEqual(snapshot(f.root), before);
      }
      const recorded = f.recordCandidate(registeredDraft, broken);
      assert.equal(recorded.value.outcome, 'accepted', recorded.text);
      registeredDraft = true;
      const registered = snapshot(f.root);
      const control = evaluateGateCheck(f.root, { runId: f.runId, presentationLanguage: 'de' });
      assert.equal(control.status, 'blocked');
      assert.equal(control.blocking_reason, gate === 'SD' ? 'AGDF_SD_DECISIONS_OPEN' : 'AGDF_TP_TRACEABILITY_INCOMPLETE');
      const findings = gate === 'SD' ? control.sd_readiness.open_decisions : control.traceability_readiness.open_items;
      assert.ok(findings.some(row => row.includes(reason) && row.includes('AGDF Approval Summary (de; source=en)')), JSON.stringify(findings));
      assert.equal(evaluateGateCheck(f.root, { runId: f.runId, presentationLanguage: 'en' }).status, 'open',
        'A presentation-language override uses the source language and needs no translation.');
      const checked = inspectArtifactReadiness(f.root, input());
      assert.equal(describeArtifactReadiness(checked).state, 'corrections_required');
      assert.ok(describeArtifactReadiness(checked).findings.some(row => row.message.includes(reason)), JSON.stringify(checked));
      const routed = dispatch();
      assert.equal(routed.outcome, 'skill_continuation', JSON.stringify(routed));
      assert.equal(routed.terminal, false);
      assert.equal(routed.continuation.phase, `${gate.toLowerCase()}_definition`);
      assert.equal(routed.continuation.revision_id, f.revision);
      assert.ok(routed.continuation.instruction.includes(reason), 'The bound author receives the precise correction finding.');
      assert.equal(routed.continuation.draft_registered, true);
      assert.deepEqual(snapshot(f.root), registered, 'Gate inspection and author routing remain read-only.');
      assert.equal(f.approveCandidate().value.outcome, 'rejected');
      assert.deepEqual(snapshot(f.root), registered, 'An unpresentable draft cannot obtain approval.');
      // Restore through the canonical writer before another fault case; no Run state is patched.
      const corrected = f.recordCandidate(true, valid);
      assert.equal(corrected.value.outcome, 'accepted', corrected.text);
    }
    const ready = evaluateGateCheck(f.root, { runId: f.runId, presentationLanguage: 'de' });
    assert.equal(ready.status, 'open');
    assert.ok(ready.approval_presentation);
    assert.equal(inspectArtifactReadiness(f.root, input()).ready, true);
    const before = snapshot(f.root), routed = dispatch();
    assert.notEqual(routed.continuation?.phase, `${gate.toLowerCase()}_definition`, 'A ready registered draft is preserved.');
    assert.deepEqual(snapshot(f.root), before);
    assert.equal(f.approveCandidate().value.outcome, 'accepted', 'Corrected material requires a fresh presentation and simulated test approval.');
  } finally { f.close(); }
}
console.log('SD/TP localized summaries: preflight, gate readiness, author routing, read-only failures and corrected approval agree.');
