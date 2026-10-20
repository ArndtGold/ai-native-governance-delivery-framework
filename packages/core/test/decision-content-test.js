import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { readRun } from '../lib/control-state/run-state-edits.js';
import { recordRunStep } from '../lib/control-state/run-steps.js';
import { recordRunRevision } from '../lib/control-state/run-recording.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { policyForRunContent } from '../lib/control-evaluation/run-step-policy.js';
import { readAuthoredContent, readReportDecision } from '../lib/control-evaluation/report-decision.js';
import { authoredGoal, concreteDecisionContent, observeDecisionContent } from '../lib/control-evaluation/decision-content-readiness.js';
import { READ_LIMITS } from '../lib/control-read/snapshot.js';
import { validNormalizedGap } from '../lib/control-evaluation/normalized-gaps.js';

const resolvedRisk = ['CD-PERF-001', 'emergent_risk', 'CD+Tests', 'resolved',
  'PERFORMANCE_FIX.md; both unchanged performance qualifications pass.', 'None for this finding; proceed to the current lifecycle owner.'];
for (const action of ['none', resolvedRisk[5], 'Retain the existing evidence and continue to QA.']) {
  assert.equal(validNormalizedGap([...resolvedRisk.slice(0, 5), action]), true, 'A resolved finding does not invent corrective work');
}
for (const [name, change] of [
  ['open risk without owner assessment', { 3: 'open', 5: 'Correct the affected code.' }],
  ['open risk without action', { 3: 'open', 4: 'Earliest-owner assessment: CD+Tests owns the observed code defect.', 5: 'none' }],
  ['resolved without evidence', { 4: 'none' }], ['resolved without action field', { 5: '' }],
  ['resolved placeholder action', { 5: 'TODO' }], ['invalid status', { 3: 'closed' }],
  ['unknown gap type', { 1: 'none' }], ['contradictory route', { 1: 'implementation_gap', 2: 'SD' }],
  ['changed-intent proof still required', { 1: 'requirements_gap', 2: 'UR' }],
]) {
  assert.equal(validNormalizedGap(Object.assign([...resolvedRisk], change)), false, name);
}
assert.equal(validNormalizedGap(Object.assign([...resolvedRisk], { 3: 'open',
  4: 'Earliest-owner assessment: CD+Tests owns the failing check.', 5: 'Correct the code and rerun the check.' })), true);

const field = '- delivered_result: The approved source bug is corrected.';
const cases = [
  ['canonical result', '## 2. TP Coverage\n'+field, true],
  ['empty result', '## TP Coverage\n- delivered_result:', false],
  ['title alone', '# Fixed outcome\n'+field, false],
  ['unrelated block', '## Example\n'+field, false],
  ['nested heading', '### TP Coverage\n'+field, false],
  ['fence only', '```\n## TP Coverage\n'+field+'\n```', false],
  ['tilde block', '## TP Coverage\n~~~\n'+field+'\n~~~', false],
  ['explicit quote', '## TP Coverage\n> '+field, false],
  ['lazy quotation', '## TP Coverage\n> Sample:\n'+field, false],
  ['indent', '## TP Coverage\n    '+field, false],
  ['nested list', '## TP Coverage\n  '+field, false],
  ['HTML', '<div>\n## TP Coverage\n'+field+'\n</div>', false],
  ['unclosed markup', '<div>\n## TP Coverage\n'+field, false],
  ['prose does not reopen', '## TP Coverage\nExample follows:\n\n'+field, false],
  ['duplicate field', '## TP Coverage\n'+field+'\n'+field, false],
  ['duplicate section', '## TP Coverage\n'+field+'\n## TP Coverage\n'+field, false],
  ['genuine after closed sample', '<div>sample</div>\n## TP Coverage\n'+field, true],
  ['genuine contrary example', '## TP Coverage\n'+field+'\n## Example\n```\n- delivered_result: contrary\n```', true],
  ['normalized heading', '## 2. TP Coverage ##\r\n'+field, true],
];
for (const [name, text, expected] of cases) assert.equal(concreteDecisionContent(readAuthoredContent(text,'result')?.delivered_result),expected,name);
assert.equal(authoredGoal('## 2. Goal\nThe user can inspect the fixed current result.\n\n## Scope\nOther.'),'The user can inspect the fixed current result.');
assert.equal(authoredGoal('## Goal\n> Example:\nDescribe the trustworthy outcome.'),null);
assert.equal(authoredGoal('## Goal\n```\nA fabricated goal.\n```'),null);
assert.equal(authoredGoal('## Goal\nDescribe the trustworthy outcome.'),null);
assert.equal(concreteDecisionContent('The sample says “Describe the trustworthy outcome.”; the actual bug is fixed.'),true);
assert.equal(concreteDecisionContent('The integration supports A | B.'),true);
for (const value of ['', '<Title>', 'TODO', '`pass | revise | block`', 'Describe the trustworthy outcome.', 'none']) assert.equal(concreteDecisionContent(value),false,value);
assert.equal(concreteDecisionContent('none',{allowNone:true}),true);
assert.equal(concreteDecisionContent('x'.repeat(1201)),false);
assert.equal(readReportDecision('## 1. QA Decision\nDecision: pass\n## 2. TP Coverage\n- delivered_result: Decision: block'),'pass');
assert.equal(readAuthoredContent('```\n# Misleading example title\n```\n# Actual report title','title'),'Actual report title');
const objective = 'Inspect a concrete fixed result.';
const largeRun = '## Objective\n' + objective + '\n\n## Revision History\n' + 'Historical record.\n'.repeat(12000);
assert.ok(Buffer.byteLength(largeRun) > 131072);
assert.equal(readAuthoredContent(largeRun, 'objective'), objective, 'Run history is not subject to the report source limit');
assert.equal(readAuthoredContent('## History\n' + 'Record.\n'.repeat(20000) + '\n## Objective\n' + objective, 'objective'), objective, 'Objective is observed beyond the report-size boundary without truncation');
assert.equal(readAuthoredContent(largeRun + '\n## Objective\nA conflicting goal.\n', 'objective'), null, 'A duplicate after large history remains ambiguous');
assert.equal(readAuthoredContent('```\n## Objective\nA fabricated goal.\n```\n' + largeRun, 'objective'), objective, 'Large Runs retain markup exclusion');
assert.equal(readAuthoredContent('## Objective\n' + 'é'.repeat(READ_LIMITS.file / 2), 'objective'), null, 'Run capture bound is in UTF-8 bytes');
for (const [profile, text] of [
  ['goal', '## Goal\n' + objective], ['result', '## TP Coverage\n' + field],
  ['limits', '## Missing Evidence\n- qualification_limits: Native checks remain open.'],
  ['risks', '## Risks\n- delivery_risks: Host caching remains possible.'], ['title', '# Authored report'],
  ['localized', '## AGDF Approval Summary (de; source=en)\n- Ergebnis: Das Ergebnis ist geprüft.'],
  ['localized_goal', '## AGDF Approval Summary (de; source=en)\nDas konkrete Ergebnis prüfen.'],
]) {
  const options = { locale: 'de', sourceLanguage: 'en' };
  assert.notEqual(readAuthoredContent(text, profile, options), null, profile + ' fixture authors content');
  assert.equal(readAuthoredContent(text + '\n\n' + largeRun, profile, options), null, profile + ' retains its report bound');
}

const root=mkdtempSync(join(tmpdir(),'agdf-content-'));
try {
  const prefix='.agdf/control/artefacts/content/', files=join(root,prefix);mkdirSync(files,{recursive:true});
  const ur='# UR\n## 2. Goal\nInspect a concrete fixed result.\n## AGDF Approval Summary (de; source=en)\n- Ziel: Das konkrete Ergebnis prüfen.\n- Umfang: Begrenzter Fix.';
  const qa='# QA\nStatus: pass\n## 1. QA Decision\nDecision: pass\n## 2. TP Coverage\n'+field+'\n\nCoverage is complete.\n## 4. Missing Evidence\n- qualification_limits: Fresh native model not observed.\n## 5. Risks\n- delivery_risks: none\n## AGDF Approval Summary (de; source=en)\n- Ergebnis: Der konkrete Quellfehler ist korrigiert.\n- Grenzen: Native Modellprüfung nicht beobachtet.\n- Risiken: keine';
  writeFileSync(join(files,'UR.md'),ur);writeFileSync(join(files,'QA_REPORT.md'),qa);
  const state={run_id:'content',path:'.agdf/control/runs/content/RUN_STATE.md',meta:{lifecycle:'active'},content:'## Objective\nInspect a concrete fixed result.\n',mode_slice_decision:{decision:'structured_slice'},artefacts:new Map([['UR',{path:prefix+'UR.md'}],['QA',{path:prefix+'QA_REPORT.md'}]])};
  const out=observeDecisionContent(root,state,{gate:'UAT'});assert.equal(out.ready,true,JSON.stringify(out));assert.equal(out.groups.goal,'Inspect a concrete fixed result.');assert.equal(out.groups.result,'The approved source bug is corrected.');assert.equal(out.sources.length,2);
  assert.equal(observeDecisionContent(root,{...state,content:largeRun},{gate:'QA',locale:'de'}).ready,true,'Current QA stays eligible when append-only Run history exceeds the report limit');
  assert.equal(observeDecisionContent(root,{...state,content:largeRun+'\n## Objective\nA conflicting goal.\n'},{gate:'QA',locale:'de'}).ready,false,'Readiness still rejects a duplicate after large history');
  assert.equal(observeDecisionContent(root,state,{gate:'UAT',locale:'de'}).groups.result,'Der konkrete Quellfehler ist korrigiert.');
  const summaryHeading = '## AGDF Approval Summary (de; source=en)\n';
  const proseGoal = 'Das vorhandene Cockpit gehört zur normalen Plugin-Installation.\nEs lässt sich ohne zusätzliche Einrichtung öffnen.';
  const legacyUr = ur.slice(0,ur.indexOf(summaryHeading)) + summaryHeading + proseGoal + '\n\nWeitere Angaben zum Umfang bleiben unverändert.';
  writeFileSync(join(files,'UR.md'),legacyUr);
  const legacyResult = observeDecisionContent(root,state,{gate:'UAT',locale:'de'});
  assert.equal(legacyResult.ready,true,JSON.stringify(legacyResult));
  assert.equal(legacyResult.groups.goal,proseGoal.replace('\n',' '),'Use the entire authored first paragraph, without selecting or translating sentences');
  assert.equal(readFileSync(join(files,'UR.md'),'utf8'),legacyUr,'Approved prose summary is never rewritten');
  for (const [name,summary] of [
    ['wrong locale', summaryHeading.replace('(de;','(en;') + proseGoal],
    ['wrong source', summaryHeading.replace('source=en','source=de') + proseGoal],
    ['nested heading', '#' + summaryHeading + proseGoal],
    ['quoted', summaryHeading + '> Beispiel:\n' + proseGoal],
    ['fenced', summaryHeading + '```\n' + proseGoal + '\n```'],
    ['HTML', summaryHeading + '<div>\n' + proseGoal + '\n</div>'],
    ['duplicate summary', summaryHeading + proseGoal + '\n\n' + summaryHeading + proseGoal],
    ['empty field', summaryHeading + '- Ziel:\n' + proseGoal],
    ['duplicate field', summaryHeading + '- Ziel: Erstes Ziel.\n- Ziel: Anderes Ziel.'],
    ['mixed prose and field', summaryHeading + proseGoal + '\n\n- Ziel: Ein anderes Ziel.'],
    ['unrelated field', summaryHeading + '- Umfang: Eine begrenzte Änderung.'],
    ['unbulleted unrelated field', summaryHeading + 'Problem: Die Einrichtung erfordert Zusatzaufwand.'],
    ['mixed prose and scope field', summaryHeading + proseGoal + '\n\nUmfang: Eine begrenzte Änderung.'],
    ['placeholder', summaryHeading + 'TODO'],
    ['overlong paragraph', summaryHeading + 'x'.repeat(1201)],
  ]) {
    writeFileSync(join(files,'UR.md'),ur.slice(0,ur.indexOf(summaryHeading)) + summary);
    const observed = observeDecisionContent(root,state,{gate:'UAT',locale:'de'});
    assert.ok(observed.gaps.some(g=>g.field==='ziel'),name + ': ' + JSON.stringify(observed));
  }
  writeFileSync(join(files,'UR.md'),ur);
  assert.equal(observeDecisionContent(root,state,{gate:'UAT',locale:'de'}).groups.goal,'Das konkrete Ergebnis prüfen.','Structured summaries still use the explicit goal field');
  const combinedGoal = 'Coding-Agenten zeigen das vollständige Dokument. Maintainer erhalten nachvollziehbare Nachweise.';
  const combinedUr = ur.replace('- Ziel: Das konkrete Ergebnis prüfen.', '- Ziel und Betroffene: ' + combinedGoal);
  writeFileSync(join(files,'UR.md'),combinedUr);
  const combinedResult = observeDecisionContent(root,state,{gate:'UAT',locale:'de'});
  assert.equal(combinedResult.ready,true,JSON.stringify(combinedResult));
  assert.equal(combinedResult.groups.goal,combinedGoal,'The exact existing combined label retains its complete authored value');
  assert.equal(readFileSync(join(files,'UR.md'),'utf8'),combinedUr,'Observing the legacy label never rewrites approved content');
  for (const options of [{locale:'en',sourceLanguage:'de'}, {locale:'de',sourceLanguage:'de'}]) {
    assert.equal(readAuthoredContent(combinedUr,'localized',options),null,'The alias never bypasses locale/source matching');
  }
  assert.equal(readAuthoredContent(combinedUr.replace('(de; source=en)','(en; source=de)'),'localized',{locale:'en',sourceLanguage:'de'}),null,'The German alias is restricted to German summaries');
  for (const [name,summary] of [
    ['duplicate with canonical field', '- Ziel: Anderes Ziel.\n- Ziel und Betroffene: ' + combinedGoal],
    ['reverse duplicate with canonical field', '- Ziel und Betroffene: ' + combinedGoal + '\n- Ziel: Anderes Ziel.'],
    ['same-value canonical duplicate', '- Ziel: ' + combinedGoal + '\n- Ziel und Betroffene: ' + combinedGoal],
    ['duplicate alias', '- Ziel und Betroffene: ' + combinedGoal + '\n- Ziel und Betroffene: ' + combinedGoal],
    ['empty alias', '- Ziel und Betroffene:'],
    ['placeholder alias', '- Ziel und Betroffene: TODO'],
    ['oversized alias', '- Ziel und Betroffene: ' + 'x'.repeat(1201)],
    ['unrecognized combined label', '- Ziel und Umfang: ' + combinedGoal],
    ['quoted alias', '> - Ziel und Betroffene: ' + combinedGoal],
    ['fenced alias', '```\n- Ziel und Betroffene: ' + combinedGoal + '\n```'],
    ['HTML alias', '<div>\n- Ziel und Betroffene: ' + combinedGoal + '\n</div>'],
    ['mixed prose and alias', proseGoal + '\n\n- Ziel und Betroffene: ' + combinedGoal],
  ]) {
    writeFileSync(join(files,'UR.md'),ur.slice(0,ur.indexOf(summaryHeading)) + summaryHeading + summary);
    assert.ok(observeDecisionContent(root,state,{gate:'UAT',locale:'de'}).gaps.some(g=>g.field==='ziel'),name);
  }
  writeFileSync(join(files,'UR.md'),ur);
  writeFileSync(join(files,'QA_REPORT.md'),qa.replace('- Risiken: keine','- Entscheidung: pass\n- TP-Abdeckung: Der begrenzte Plan ist erfüllt.\n- Lücken: Native Prüfung bleibt außerhalb des Scopes.\n- Risiken: keine'));
  assert.equal(observeDecisionContent(root,state,{gate:'QA',locale:'de'}).ready,true,'Existing authored QA summary labels retain the same contiguous scalar context.');
  writeFileSync(join(files,'QA_REPORT.md'),qa);
  const findingTable = '\n\n## Normalized Findings\n\n| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |\n|---|---|---|---|---|---|\n';
  const findingRow = cells => '| ' + cells.join(' | ') + ' |\n';
  const reviewPath = prefix + 'CODE_REVIEW.md';
  for (const gate of ['QA', 'UAT']) {
    for (const inReview of [false, true]) {
      const candidateState = { ...state, artefacts: new Map(state.artefacts) };
      if (inReview) candidateState.artefacts.set('CR', { path: reviewPath, status: 'done' });
      for (const [name, rows, ready] of [
        ['resolved risk with no new repair', [resolvedRisk], true],
        ['invalid resolved route', [Object.assign([...resolvedRisk], { 1: 'implementation_gap', 2: 'SD' })], false],
        ['missing resolution evidence', [Object.assign([...resolvedRisk], { 4: 'none' })], false],
        ['unassessed open risk', [Object.assign([...resolvedRisk], { 3: 'open', 5: 'Repair the defect.' })], false],
        ['open finding contradicts pass', [Object.assign([...resolvedRisk], { 1: 'implementation_gap', 3: 'open', 5: 'Repair the defect.' })], false],
        ['duplicate finding', [resolvedRisk, resolvedRisk], false],
      ]) {
        const normalized = findingTable + rows.map(findingRow).join('');
        const report = qa + (inReview ? '' : normalized);
        writeFileSync(join(files, 'QA_REPORT.md'), report);
        writeFileSync(join(root, reviewPath), '# Code Review\nDecision: pass\n' + (inReview ? normalized : ''));
        const observed = observeDecisionContent(root, candidateState, { gate });
        assert.equal(observed.ready, ready, gate + '/' + inReview + '/' + name + ': ' + JSON.stringify(observed));
        if (!ready) assert.ok(observed.gaps.some(g => g.field === 'Normalized Findings'));
        if (inReview) assert.ok(observed.sources.some(s => s.path === reviewPath), 'Referenced review participates in current decision freshness');
        assert.equal(readFileSync(join(files, 'QA_REPORT.md'), 'utf8'), report, 'Observation never rewrites the report');
      }
    }
  }
  rmSync(join(root, reviewPath));
  writeFileSync(join(files,'QA_REPORT.md'),qa);
  assert.equal(observeDecisionContent(root,{...state,content:'## Objective\nDescribe the trustworthy outcome.\n'},{gate:'UAT'}).ready,false);
  assert.equal(observeDecisionContent(root,{...state,meta:{lifecycle:'completed'},content:'## Objective\nDescribe the trustworthy outcome.\n'},{gate:'UAT'}).ready,true,'completed history not regraded');
  for (const value of ['QA', 'QA_REPORT.md', 'all tasks completed', 'T-001, T-002', 'UR, PRD, SD, TP', '`UR.md`, `QA_REPORT.md`', '[QA](QA_REPORT.md); [TP](TP.md)']) {
    writeFileSync(join(files,'QA_REPORT.md'),qa.replace(field,'- delivered_result: '+value));
    assert.equal(observeDecisionContent(root,state,{gate:'QA'}).ready,false,'Association/count/title alone: '+value);
    writeFileSync(join(files,'QA_REPORT.md'),qa.replace('- Ergebnis: Der konkrete Quellfehler ist korrigiert.','- Ergebnis: '+value));
    assert.equal(observeDecisionContent(root,state,{gate:'QA',locale:'de'}).ready,false,'Localized association/count/title alone: '+value);
  }
  writeFileSync(join(files,'QA_REPORT.md'),qa.replace(field,'- delivered_result: The fix preserves UR.md while enforcing current QA content.'));
  assert.equal(observeDecisionContent(root,state,{gate:'QA'}).ready,true,'Concrete prose with references remains authored result.');
  for(const text of [qa.replace(field,'- delivered_result: pass'),qa.replace(field,'> Example:\n'+field),qa.replace('- qualification_limits: Fresh native model not observed.',''),qa.replace('- Ergebnis: Der konkrete Quellfehler ist korrigiert.','')]) {
    writeFileSync(join(files,'QA_REPORT.md'),text);
    assert.equal(observeDecisionContent(root,state,{gate:'UAT',locale:'de'}).ready,false,text);
    assert.equal(readFileSync(join(files,'QA_REPORT.md'),'utf8'),text,'observation never repairs');
  }
  writeFileSync(join(files,'QA_REPORT.md'),'x'.repeat(131073));
  assert.equal(observeDecisionContent(root,state,{gate:'QA'}).gaps.some(g=>g.reason==='source_unavailable'),true,'Oversized source is unavailable before reading');
  rmSync(join(files,'QA_REPORT.md'));
  assert.equal(observeDecisionContent(root,state,{gate:'QA'}).gaps.some(g=>g.reason==='source_unavailable'),true,'Missing current source is an explicit gap');
  writeFileSync(join(files,'QA_REPORT.md'),qa);
  const unsafe={...state,artefacts:new Map(state.artefacts).set('QA',{path:'../foreign.md'})};
  assert.equal(observeDecisionContent(root,unsafe,{gate:'QA'}).gaps.some(g=>g.reason==='source_unavailable'),true,'Foreign source is never read');
  assert.equal(observeDecisionContent(root,state,{gate:'QA',readArtefact:()=>null}).ready,false,'Unavailable captured source cannot fall back to file bytes');
} finally {rmSync(root,{recursive:true,force:true});}
console.log('Closed authored-content contexts, field-local placeholder boundaries, current source/localization and historical/read-only limits passed.');

const writerRoot=mkdtempSync(join(tmpdir(),'agdf-orientation-'));
try {
  execFileSync(process.execPath,[fileURLToPath(new URL('../../cli/bin/create-agdf.js',import.meta.url)),'init','--dir',writerRoot,'--language','en'],{stdio:'pipe'});
  for(const [id,goal,custom]of [['concrete','The declared fixture goal can be inspected.',null],['custom','The declared fixture goal can be inspected.','Keep this explicit custom orientation.'],['missing','> Example:\nA fabricated goal.',null]]){
    const statePath=createRun(writerRoot,id),dir=join(writerRoot,'.agdf/control/artefacts',id);mkdirSync(dir,{recursive:true});
    const ur='# UR\n## Problem\nOne isolated requirement.\n## Goal\n'+goal+'\n## Scope\nIsolated fixture only.\n## Non-Goals\nNo live approval.';
    const path=join(dir,'UR.md');writeFileSync(path,ur);
    let before=readRun(writerRoot,id);
    if(custom){writeFileSync(statePath,before.content.replace('Describe the trustworthy outcome.',custom));assert.equal(recordRunRevision(writerRoot,{runId:id,revisionId:before.meta.revision_id}).outcome,'updated');before=readRun(writerRoot,id);}
    const recorded=recordRunStep(writerRoot,{runId:id,revisionId:before.meta.revision_id,step:'ur',title:'Synthetic orientation behavior'},{policy:policyForRunContent});
    assert.equal(recorded.outcome,'recorded',JSON.stringify(recorded));
    const current=readRun(writerRoot,id),objective=readAuthoredContent(current.content,'objective');
    assert.equal(objective,custom??(id==='missing'?'Describe the trustworthy outcome.':goal));
    assert.equal(readFileSync(path,'utf8'),ur,'Projection does not rewrite its source.');
    if(id==='missing'){
      const captured=current.content,check=evaluateGateCheck(writerRoot,{runId:id});
      assert.equal(check.blocking_reason,'AGDF_DECISION_CONTENT_INCOMPLETE');assert.notEqual(check.next_operation.type,'human_gate_decision');
      assert.equal(readRun(writerRoot,id).content,captured,'Inspection leaves the authorable incomplete draft unchanged.');
      writeFileSync(path,ur.replace(goal,'A now-concrete unapproved draft goal.'));
      assert.equal(recordRunRevision(writerRoot,{runId:id,revisionId:current.meta.revision_id}).outcome,'updated');
      assert.equal(readAuthoredContent(readRun(writerRoot,id).content,'objective'),'A now-concrete unapproved draft goal.');
    }
  }
}finally{rmSync(writerRoot,{recursive:true,force:true});}
console.log('Actual UR registration/replacement writer projection, custom preservation and read-only missing-content recovery passed (synthetic only).');
