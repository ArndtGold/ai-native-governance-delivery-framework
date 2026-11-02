import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRun } from '../lib/control-state/run-state-repository.js';
import { readRun } from '../lib/control-state/run-state-edits.js';
import { recordRunStep } from '../lib/control-state/run-steps.js';
import { recordRunRevision } from '../lib/control-state/run-recording.js';
import { evaluateGateCheck } from '../lib/control-evaluation/gate-check.js';
import { policyForRunContent } from '../lib/control-evaluation/run-step-policy.js';
import { readAuthoredContent, readReportDecision } from '../lib/control-evaluation/report-decision.js';
import { authoredGoal, concreteDecisionContent, observeDecisionContent } from '../lib/control-evaluation/decision-content-readiness.js';

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

const root=mkdtempSync(join(tmpdir(),'agdf-content-'));
try {
  const prefix='.agdf/control/artefacts/content/', files=join(root,prefix);mkdirSync(files,{recursive:true});
  const ur='# UR\n## 2. Goal\nInspect a concrete fixed result.\n## AGDF Approval Summary (de; source=en)\n- Ziel: Das konkrete Ergebnis prüfen.\n- Umfang: Begrenzter Fix.';
  const qa='# QA\nStatus: pass\n## 1. QA Decision\nDecision: pass\n## 2. TP Coverage\n'+field+'\n\nCoverage is complete.\n## 4. Missing Evidence\n- qualification_limits: Fresh native model not observed.\n## 5. Risks\n- delivery_risks: none\n## AGDF Approval Summary (de; source=en)\n- Ergebnis: Der konkrete Quellfehler ist korrigiert.\n- Grenzen: Native Modellprüfung nicht beobachtet.\n- Risiken: keine';
  writeFileSync(join(files,'UR.md'),ur);writeFileSync(join(files,'QA_REPORT.md'),qa);
  const state={run_id:'content',path:'.agdf/control/runs/content/RUN_STATE.md',meta:{lifecycle:'active'},content:'## Objective\nInspect a concrete fixed result.\n',mode_slice_decision:{decision:'structured_slice'},artefacts:new Map([['UR',{path:prefix+'UR.md'}],['QA',{path:prefix+'QA_REPORT.md'}]])};
  const out=observeDecisionContent(root,state,{gate:'UAT'});assert.equal(out.ready,true,JSON.stringify(out));assert.equal(out.groups.goal,'Inspect a concrete fixed result.');assert.equal(out.groups.result,'The approved source bug is corrected.');assert.equal(out.sources.length,2);
  assert.equal(observeDecisionContent(root,state,{gate:'UAT',locale:'de'}).groups.result,'Der konkrete Quellfehler ist korrigiert.');
  writeFileSync(join(files,'QA_REPORT.md'),qa.replace('- Risiken: keine','- Entscheidung: pass\n- TP-Abdeckung: Der begrenzte Plan ist erfüllt.\n- Lücken: Native Prüfung bleibt außerhalb des Scopes.\n- Risiken: keine'));
  assert.equal(observeDecisionContent(root,state,{gate:'QA',locale:'de'}).ready,true,'Existing authored QA summary labels retain the same contiguous scalar context.');
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
  execFileSync(process.execPath,[new URL('../../cli/bin/create-agdf.js',import.meta.url).pathname,'init','--dir',writerRoot,'--language','en'],{stdio:'pipe'});
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
