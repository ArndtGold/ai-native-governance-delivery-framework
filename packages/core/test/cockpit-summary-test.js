import test from 'node:test';
import assert from 'node:assert/strict';
import { projectCockpitSummary, evaluateApprovalSummaryReadiness } from '../lib/control-state/run-presentation-render.js';
import { readyPrd } from './fixtures/artifact-readiness.js';

const languages = { artifact_language:'en', presentation_language:'de', approval_summary_required:true, approval_summary_heading:'AGDF Approval Summary (de; source=en)' };
const source = items => `# Test\n\n## AGDF Approval Summary (de; source=en)\n\n${items}\n`;
test('summary projection reuses readiness and presents only source-authored relevant fields', () => {
  const ur=source('- Ziel: Eindeutiges Ziel.\n- Umfang: Dieser Run.\n- Abnahmesignal: Beobachtbares Ergebnis.');
  assert.equal(evaluateApprovalSummaryReadiness('UR', ur, languages).ready,true);
  const observed=projectCockpitSummary('UR', ur, languages);
  assert.deepEqual(observed.items.map(x=>x.label), ['Ziel','Umfang','Abnahmesignal']);
  assert.equal(observed.authorizes,false);
  assert.deepEqual(projectCockpitSummary('UR',source('- Ziel: Nur ein Ziel.'),languages).items.map(x=>x.label),['Ziel']);
  assert.equal(projectCockpitSummary('UR',source('- Umfang: Ohne Ziel.'),languages),null);
  assert.equal(projectCockpitSummary('UR',ur+'\n'+ur,languages),null);
  const dup=projectCockpitSummary('UR',source('- Ziel: Erstes Ziel.\n- Ziel: Zweites Ziel.\n- Umfang: Dieser Run.'),languages);
  assert.ok(!dup || !dup.items.some(row=>row.label==='Ziel'));
});
test('gate-specific summary fields avoid a universal UR schema', () => {
  const prd=projectCockpitSummary('PRD',readyPrd,languages);
  assert.ok(prd); assert.ok(prd.items.some(row=>row.label==='Ziel')); assert.ok(prd.items.some(row=>row.label==='Umfang'));
  assert.equal(projectCockpitSummary('PRD',readyPrd.replace('- AC-001: Die gewählte Quelle bleibt lesbar.\n',''),languages),null);
  for (const [gate,body,labels] of [
    ['SD','- Lösung: Vorhandenes System erweitern.\n- Verantwortung: Ein Core.\n- Entscheidungen: Keine Dublette.',['Lösung','Verantwortung','Entscheidungen']],
    ['TP','- Aufgaben: Oberfläche anbinden.\n- Tests: Zuordnung prüfen.\n- Risiken: Quelle fehlt.',['Aufgaben','Tests','Risiken']],
  ]) {
    const result=projectCockpitSummary(gate,source(body),languages);
    assert.ok(result,gate); assert.deepEqual(result.items.map(x=>x.label),labels);
  }
});
test('preview projects the selected document and rejects changed snapshot', async () => {
  const { fixture } = await import('./control-cockpit-fixtures.js');
  const { createCockpitReader } = await import('../lib/control-inspect/cockpit.js');
  const { readFileSync, writeFileSync } = await import('node:fs');
  const { join } = await import('node:path');
  const f=fixture(); try {
    const config=join(f.root,'.agdf/control/config.json');
    writeFileSync(config,JSON.stringify({...JSON.parse(readFileSync(config,'utf8')),artifact_language:'en',chat_language:'de'}));
    const path=join(f.root,f.documentPath);
    writeFileSync(path,source('- Ziel: Eindeutiges Ziel.\n- Umfang: Dieser Run.\n- Abnahmesignal: Ergebnis sichtbar.'));
    f.register('UR',f.documentPath);
    const reader=createCockpitReader(f.root), selected=reader.snapshot('fixture-a');
    const resource=selected.data.run.resources.find(row=>row.type==='UR');
    const preview=reader.preview(resource.resource_id,selected.snapshot_id,'fixture-a');
    assert.equal(preview.data.cockpit_summary.run_id,'fixture-a');
    assert.equal(preview.data.cockpit_summary.resource_id,resource.resource_id);
    assert.equal(preview.data.cockpit_summary.revision_id,selected.data.run.revision_id);
    assert.equal(preview.data.cockpit_summary.content_digest,preview.data.content_digest);
    assert.deepEqual(preview.data.cockpit_summary.items.map(row=>row.label),['Ziel','Umfang','Abnahmesignal']);
    writeFileSync(path,source('- Ziel: Geändertes Ziel.'));
    assert.throws(()=>reader.preview(resource.resource_id,selected.snapshot_id,'fixture-a'),/source_changed/);
  } finally { f.close(); }
});
