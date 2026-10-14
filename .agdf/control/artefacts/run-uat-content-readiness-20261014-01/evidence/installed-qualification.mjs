// Installed Run/UAT content qualification. All prerequisites and approvals are synthetic on disposable targets.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync, rmSync, appendFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
const pluginRoot = '/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const installedCore = pluginRoot + '/runtime/create-agdf/runtime/core/lib';
const transcript = new URL('./installed-stdio.jsonl', import.meta.url);
appendFileSync(transcript, JSON.stringify({kind:'installed_identity',marker:JSON.parse(readFileSync(pluginRoot+'/.agdf-installation.json','utf8')),native_model_qualified:false})+'\n');
import { withStdioClient } from '../../../../../packages/mcp-server/test/helpers.js';
import { withSyntheticQaContent } from '../../../../../packages/core/test/fixtures/decision-content.js';
import { reportContextCases, reportInternalCases } from '../../../../../packages/core/test/fixtures/report-decision-cases.js';
import { createLateSourceRevisionTestRun } from '../../../../../packages/cli/scripts/fixtures/late-source-revision.js';
const { resolveControlCommandTarget, canonicalJson, digest } = await import(new URL('file://' + installedCore + '/control-state/approval-command-contract.js'));
const { artefactFileDigest, runSealState } = await import(new URL('file://' + installedCore + '/control-state/run-seal.js'));
const { readRunState } = await import(new URL('file://' + installedCore + '/control-evaluation/run-state.js'));
const { closeoutConfirmation } = await import(new URL('file://' + installedCore + '/control-evaluation/closeout-readiness.js'));
const { COCKPIT_MIME } = await import(new URL('file://' + installedCore + '/control-inspect/cockpit-contract.js'));


const { readReportDecision } = await import(new URL('file://' + installedCore + '/control-evaluation/report-decision.js'));
const observedCases=reportContextCases.map(([name,input,expected])=>{const actual=readReportDecision(input);assert.equal(actual,expected,name);return {name,expected,actual};});
for(const [name,input,expected] of reportInternalCases)assert.equal(readReportDecision(input,{allowNotApplicable:true}),expected,name);
assert.equal(readReportDecision('Decision: not_applicable\n'),null);
// Previous approved report is compatibility evidence only; never write it.
const previousPath=new URL('../../compact-execution-continuation-20261014-01/QA_REPORT.md',import.meta.url);
assert.equal(readReportDecision(readFileSync(previousPath,'utf8')),'pass');
const results={marker:JSON.parse(readFileSync(pluginRoot+'/.agdf-installation.json','utf8')),parser_cases:observedCases,internal_cases:reportInternalCases.length,flows:[],refusals:[],renderings:[],native_model_observed:false};
function snapshot(root,runId){const dir=join(root,'.agdf/control/runs',runId),data={};const walk=p=>{for(const e of readdirSync(p,{withFileTypes:true})){const f=join(p,e.name);if(e.isDirectory())walk(f);else data[f]=readFileSync(f).toString('base64');}};walk(dir);walk(join(root,'.agdf/control/artefacts',runId));data.backlog=readFileSync(join(root,'.agdf/control/MASTER_BACKLOG.md')).toString('base64');return data;}
for (const language of ['en','de']) for (const modern of [true]) for (const route of ['structured_delivery', 'structured_slice']) {
const root=mkdtempSync(join(tmpdir(),'agdf-validator-installed-'));
execFileSync('git',['init','-q',root]);
// Only disposable scaffold setup uses source init; Run CLI commands and MCP below use installed entrypoints.
execFileSync(process.execPath,['/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/cli/bin/create-agdf.js','init','--dir',root,'--language','en']);
const config=JSON.parse(readFileSync(pluginRoot+'/mcp.json','utf8')).mcpServers.agdf;
const fixture={command:config.command,args:config.args,cwd:root};
try {
  const cli = pluginRoot + '/runtime/agdf-local.js';
  const f = createLateSourceRevisionTestRun(root, cli, 'structured-closeout-command', process.env, { route, prepare: false });
  await withStdioClient({ ...fixture, modern }, async client => {
  const service = async (name, input) => { const before=snapshot(root,f.runId); const out = await client.callTool({ name, arguments: input }); if(out.structuredContent?.outcome==='rejected')assert.deepEqual(snapshot(root,f.runId),before,'Rejected installed operation changes no canonical Run/receipts/backlog'); appendFileSync(transcript,JSON.stringify({kind:'actual_installed_stdio',route,language,name,input,result:out,native_model_qualified:false})+'\n'); assert.ok(out.structuredContent, JSON.stringify(out)); return out.structuredContent; };
  const target = resolveControlCommandTarget(root).target_id;
  const bound = () => ({ schema_version: '1', presentation_language: language, working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });

  const pending='content-draft', pendingPrefix=`.agdf/control/artefacts/${pending}/`;
  const cliCall=(command,...args)=>{const text=execFileSync(config.command,[cli,command,'--dir',root,'--json','--run',pending,...args],{encoding:'utf8'});return command==='run-create'?text.trim():JSON.parse(text);};
  cliCall('run-create');
  const draftState=join(root,`.agdf/control/runs/${pending}/RUN_STATE.md`);
  const draftRevision=()=>readFileSync(draftState,'utf8').match(/^- revision_id: (.+)$/mu)[1];
  const draftInspect=()=>service('agdf_inspect',{operation:'gate-check',presentation_language:'en',working_directory:root,target_source:'explicit_target',primary_target:root,run_id:pending});
  assert.notEqual((await draftInspect()).report.blocking_reason,'AGDF_DECISION_CONTENT_INCOMPLETE','Empty initial draft stays authorable');
  const {mkdirSync}=await import('node:fs');mkdirSync(join(root,pendingPrefix),{recursive:true});
  const urSource='# UR: Content draft\n## Problem\nA concrete scoped fixture needs orientation.\n## Goal\nDescribe the trustworthy outcome.\n';
  writeFileSync(join(root,pendingPrefix+'UR.md'),urSource);
  assert.equal(cliCall('run-step','--revision',draftRevision(),'--step','ur','--title','Synthetic content draft').outcome,'recorded');
  const beforeDraft=readFileSync(draftState,'utf8');
  assert.equal((await draftInspect()).report.blocking_reason,'AGDF_DECISION_CONTENT_INCOMPLETE');
  assert.equal(readFileSync(draftState,'utf8'),beforeDraft,'Read-only draft check never projects content');
  const draftRoute=await service('agdf_dispatch',{skill_id:'gate-check',presentation_language:'en',working_directory:root,target_source:'explicit_target',primary_target:root,run_id:pending,continue_delivery:true});
  assert.equal(draftRoute.continuation?.skill_id,'gate-check');assert.equal(draftRoute.continuation?.phase,'required_gate_artifact');assert.equal(readFileSync(draftState,'utf8'),beforeDraft);

  writeFileSync(join(root,pendingPrefix+'UR.md'),urSource.replace('Describe the trustworthy outcome.','The synthetic user can inspect one concrete current result.'));
  assert.equal(cliCall('run-update','--revision',draftRevision()).outcome,'updated');
  assert.ok(readFileSync(draftState,'utf8').includes('## Objective\n\nThe synthetic user can inspect one concrete current result.'));
  assert.notEqual((await draftInspect()).report.blocking_reason,'AGDF_DECISION_CONTENT_INCOMPLETE');

  const bp=f.prefix+'BROWNFIELD_CANDIDATE.md';
  for(const text of ['~~~\nDecision: pass\n~~~\n','> Example:\nDecision: pass\n','<blockquote>\n## QA Decision\nDecision: pass\n</blockquote>\n']){
    writeFileSync(join(root,bp),text);assert.equal((await service('agdf_record',{...bound(),command:{kind:'step.record',payload:{step:'internal',internal_step:'Brownfield Analysis',decision:'pass',source:{path:bp,digest:artefactFileDigest(root,bp)}}}})).outcome,'rejected');
  }
  writeFileSync(join(root,bp),'Decision: not_applicable\n');
  const ba={step:'internal',internal_step:'Brownfield Analysis',decision:'not_applicable',source:{path:bp,digest:artefactFileDigest(root,bp)}};
  assert.equal((await service('agdf_record',{...bound(),command:{kind:'step.record',payload:ba}})).outcome,'rejected','Missing internal applicability reason');
  assert.equal((await service('agdf_record',{...bound(),command:{kind:'step.record',payload:{...ba,reason:'Synthetic applicability fixture; no implementation-preparation obligation'}}})).outcome,'accepted');
  for (const step of ['CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR']) {
    const path = f.prefix + step.replaceAll(' ', '_').replaceAll('+', '_') + '_CANDIDATE.md';
    for(const text of ['~~~\nDecision: pass\n~~~\n','> Example:\nDecision: pass\n','## Examples\nDecision: pass\n']){
      writeFileSync(join(root,path),text);assert.equal((await service('agdf_record',{...bound(),command:{kind:'step.record',payload:{step:'internal',internal_step:step,decision:'pass',source:{path,digest:artefactFileDigest(root,path)}}}})).outcome,'rejected');
    }
    writeFileSync(join(root,path),'Decision: not_applicable\n');
    assert.equal((await service('agdf_record',{...bound(),command:{kind:'step.record',payload:{step:'internal',internal_step:step,decision:'not_applicable',reason:'Synthetic attempted mandatory-step bypass',source:{path,digest:artefactFileDigest(root,path)}}}})).outcome,'rejected');
    writeFileSync(join(root, path), '# ' + step + '\nStatus: pass\n- decision: pass\nSynthetic exact current result.\n\n## Examples\nDecision: block\n');
    const recorded = await service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: step, decision: 'pass', source: { path, digest: artefactFileDigest(root, path) } } } });
    assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
  }
  const qaPath = f.prefix + 'QA_REPORT.md', proof = f.prefix + 'QA_MAPPING.json', request = f.prefix + 'QA_RECORD.json';
  writeFileSync(join(root, qaPath), withSyntheticQaContent('# QA: Synthetic closeout\nStatus: pass\n\n## 1. QA Decision\nDecision: pass\n\n## Examples\n~~~\nDecision: block\n~~~\n> Example:\nDecision: unknown\n\n## Scope\nApproved synthetic task fulfilled.\n\n## Evidence\nExact tests and reviews recorded.\n\n## Risks\nNo applicable open required finding.\n'));
  const command = { schema_version: '1', target_id: target, run_id: f.runId, expected_revision_id: f.revision(),
    destination: { type: 'QA_REPORT', path: qaPath, digest: artefactFileDigest(root, qaPath), status: 'pass' }, source: { type: 'TP', path: f.prefix + 'TP.md', digest: artefactFileDigest(root, f.prefix + 'TP.md') },
    relationship: { from: 'QA_REPORT', relationship: 'tests', to: 'TP' }, review: { reviewer: 'Synthetic QA mapping reviewer', path: proof, digest: '' }, update_draft: false };
  const { schema_version, target_id, run_id, destination, source, relationship } = command;
  writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination, source, relationship, reviewer: command.review.reviewer, reviewed: true }));
  command.review.digest = artefactFileDigest(root, proof); writeFileSync(join(root, request), JSON.stringify(command));
  const matchingReport=readFileSync(join(root,qaPath),'utf8');
  const baselineRequest=readFileSync(join(root,request),'utf8'), baselineProof=readFileSync(join(root,proof),'utf8');
  for(const text of ['Status: pass\nDecision: revise\n','Status: pass\nDecision: unknown\n','Status: draft\n','~~~\nDecision: pass\n~~~\n','> Example:\nDecision: pass\n','## Examples\nDecision: pass\n','<blockquote>\n## QA Decision\nDecision: pass\n</blockquote>\n']) {
    writeFileSync(join(root,qaPath),text);
    const candidate={...command,destination:{...destination,digest:artefactFileDigest(root,qaPath)}};
    writeFileSync(join(root,proof),JSON.stringify({schema_version,target_id,run_id,destination:candidate.destination,source,relationship,reviewer:candidate.review.reviewer,reviewed:true}));
    candidate.review={...candidate.review,digest:artefactFileDigest(root,proof)};
    writeFileSync(join(root,request),JSON.stringify(candidate));
    const original=readFileSync(f.state,'utf8');
    const refused=await service('agdf_record',{...bound(),command:{kind:'artefact.record',payload:{gate:'QA',reviewed_request:{path:request,digest:artefactFileDigest(root,request)}}}});
    assert.equal(refused.outcome,'rejected','Installed registrar rejects conflicting/unknown/missing report results.');
    assert.equal(readFileSync(f.state,'utf8'),original);
  }
  writeFileSync(join(root,qaPath),matchingReport); writeFileSync(join(root,request),baselineRequest); writeFileSync(join(root,proof),baselineProof);

  const originalQa=readFileSync(join(root,qaPath),'utf8');
  const saved=mkdtempSync(join(tmpdir(),'agdf-current-content-snapshot-'));
  cpSync(join(root,'.agdf'),join(saved,'agdf'),{recursive:true});
  try {
    const bad = [
      ['bare-result',originalQa.replace(/^- delivered_result:.*$/mu,'- delivered_result: pass')],
      ['placeholder',originalQa.replace(/^- delivered_result:.*$/mu,'- delivered_result: <Concrete result>')],
      ['missing-limits',originalQa.replace(/^- qualification_limits:.*$/mu,'')],
      ['quote-only',originalQa.replace(/^- delivered_result:.*$/mu,'> Sample:\n- delivered_result: invented')],
      ['code-only',originalQa.replace(/^- delivered_result:.*$/mu,'~~~\n- delivered_result: invented\n~~~')],
      ['html-only',originalQa.replace(/^- delivered_result:.*$/mu,'<div>\n- delivered_result: invented\n</div>')],
      ['duplicate',originalQa.replace(/^- delivered_result:.*$/mu,'$&\n$&')],
      ['association-only',originalQa.replace(/^- delivered_result:.*$/mu,'- delivered_result: UR, PRD, SD, TP')],
      ...(language==='de'?[['missing-translation',originalQa.replace(/^- Ergebnis:.*$/mu,'')]]:[])
    ];
    for(const [scenario,text] of bad){
      rmSync(join(root,'.agdf'),{recursive:true,force:true});cpSync(join(saved,'agdf'),join(root,'.agdf'),{recursive:true});
      writeFileSync(join(root,qaPath),text);
      const candidate={...command,expected_revision_id:f.revision(),destination:{...destination,digest:artefactFileDigest(root,qaPath)}};
      writeFileSync(join(root,proof),JSON.stringify({schema_version,target_id,run_id,destination:candidate.destination,source,relationship,reviewer:candidate.review.reviewer,reviewed:true}));
      candidate.review={...candidate.review,digest:artefactFileDigest(root,proof)};writeFileSync(join(root,request),JSON.stringify(candidate));
      assert.equal((await service('agdf_record',{...bound(),command:{kind:'artefact.record',payload:{gate:'QA',reviewed_request:{path:request,digest:artefactFileDigest(root,request)}}}})).outcome,'accepted');
      const before=snapshot(root,f.runId);
      const observed=await service('agdf_inspect',{operation:'gate-check',presentation_language:language,working_directory:root,target_source:'explicit_target',primary_target:root,run_id:f.runId});
      assert.equal(observed.report.blocking_reason,'AGDF_DECISION_CONTENT_INCOMPLETE',JSON.stringify(observed));
      assert.notEqual(observed.report.next_operation.type,'human_gate_decision');assert.ok(observed.report.status_presentation.markdown);
      const refused=await service('agdf_prepare',{...bound(),command:{kind:'presentation.prepare',payload:{gate:'QA'}}});
      assert.equal(refused.outcome,'rejected',scenario);assert.deepEqual(snapshot(root,f.runId),before,'Content refusal preserves canonical state');
      if(scenario==='bare-result'){
        const routing=await service('agdf_dispatch',{skill_id:'gate-check',presentation_language:language,working_directory:root,target_source:'explicit_target',primary_target:root,run_id:f.runId,continue_delivery:true});
        assert.equal(routing.continuation?.skill_id,'qa-gate');assert.equal(routing.continuation?.phase,'required_gate_artifact');assert.deepEqual(snapshot(root,f.runId),before);
      }
      results.refusals.push({route,language,scenario,blocked:true,canonical_state_unchanged:true});

    }
  }finally{rmSync(join(root,'.agdf'),{recursive:true,force:true});cpSync(join(saved,'agdf'),join(root,'.agdf'),{recursive:true});rmSync(saved,{recursive:true,force:true});}
  assert.match(readFileSync(f.state,'utf8'),/## Objective\n\nAn operator can save and restore one named filter\./,'Installed UR writer projects concrete orientation');

  const qa = await service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root, request) } } } });
  assert.equal(qa.outcome, 'accepted', JSON.stringify(qa));
  const inspected=await service('agdf_inspect',{operation:'gate-check',presentation_language:language,working_directory:root,target_source:'explicit_target',primary_target:root,run_id:f.runId});
  assert.equal(inspected.report.current_gate,'QA');assert.equal(inspected.report.blocking_reason,'none');
  assert.equal(inspected.runtime.provenance_status,'matched');
  assert.deepEqual(readFileSync(join(inspected.runtime.plugin_root,'runtime/core/lib/control-evaluation/report-decision.js')),
    readFileSync(installedCore+'/control-evaluation/report-decision.js'),'Actually loaded MCP generation contains the installed hardened reader');
  const historical=[];
  for (const gate of ['QA', 'UAT']) {
    if(language==='en'&&gate==='UAT'){
      const fallback=await service('agdf_inspect',{operation:'gate-check',presentation_language:'fr-CA',working_directory:root,target_source:'explicit_target',primary_target:root,run_id:f.runId});
      for(const label of ['Intended outcome:','Delivered result:','Technical QA: pass','Qualification limits:','Risks and open issues:','Approval effect:'])assert.ok(fallback.report.approval_presentation.markdown.includes(label),label);
      results.renderings.push({route,requested_language:'fr-CA',effective_language:'en',text:fallback.report.approval_presentation.markdown});
    }
    const preparedReply = await client.callTool({ name: 'agdf_prepare', arguments: { ...bound(), command: { kind: 'presentation.prepare', payload: { gate } } } });
    appendFileSync(transcript,JSON.stringify({kind:'actual_installed_presentation',route,result:preparedReply})+'\n');
    const prepare = preparedReply.structuredContent;
    assert.equal(prepare.outcome, 'accepted', JSON.stringify(prepare));
    const selector={operation:'presentation-document',presentation_language:language,working_directory:root,target_source:'explicit_target',primary_target:root,run_id:f.runId,expected_revision_id:f.revision(),target_id:target,gate,presentation_id:prepare.family_result.presentation_id};
    const doc=await service('agdf_inspect',selector);assert.equal(doc.report.available,true,JSON.stringify(doc));
    assert.equal(doc.report.content,readFileSync(join(root,`.agdf/control/runs/${f.runId}/presentations/${prepare.family_result.presentation_id}.document`),'utf8'));
    historical.push({selector,content:doc.report.content});

    if(gate==='UAT'){
      const exact=readFileSync(join(root,`.agdf/control/runs/${f.runId}/presentations/${prepare.family_result.presentation_id}.document`),'utf8');
      for(const label of (language==='de'?['Ziel:','Geliefertes Ergebnis:','Technische QA: pass','Nachweisgrenzen:','Risiken und offene Punkte:','Freigabewirkung:']:['Intended outcome:','Delivered result:','Technical QA: pass','Qualification limits:','Risks and open issues:','Approval effect:'])) assert.ok(exact.includes(label),label);
      assert.ok(exact.includes(language==='de'?'nicht beobachtet':'unobserved'));
      results.renderings.push({route,language,presentation_id:prepare.family_result.presentation_id,document:exact});
      const stale={...bound(),expected_revision_id:randomUUID(),command:{kind:'approval.record',payload:{gate,presentation_id:prepare.family_result.presentation_id,response:`Approval: ${gate}`}}};
      assert.equal((await service('agdf_approve',stale)).outcome,'rejected','Stale decision is refused');
    }
    const approval = await service('agdf_approve', { ...bound(), command: { kind: 'approval.record', payload: { gate, presentation_id: prepare.family_result.presentation_id, response: `Approval: ${gate}` } } });
    assert.equal(approval.outcome, 'accepted', JSON.stringify(approval));
  }
  const state = readRunState(root, { runId: f.runId });
  const rows = ['UR', 'Brownfield Review', 'PRD', 'SD', 'TP', 'Brownfield Analysis', 'CD+Tests', 'CR', 'QA', 'UAT'].map(type => `| ${type} | ${state.approvals.get(type)?.status ?? state.artefacts.get(type).status} | ${state.artefacts.get(type)?.path || state.approvals.get(type).evidence} |`).join('\n');
  const orPath = f.prefix + 'OR_CANDIDATE.md';
  const report = `# OR: Synthetic closeout
Report mode: OR-full
Status: done
## Run
- run_id: ${f.runId}
- related_ur: ${f.prefix}UR.md
- related_prd: ${f.prefix}PRD.md
- related_sd: ${f.prefix}SD.md
- related_tp: ${f.prefix}TP.md
- related_qa_report: ${qaPath}
- mode_slice_decision: ${route}
- current_gate: OR
- decision: pass
## Gate State
| Gate or step | Status | Evidence |
|---|---|---|
${rows}
## Delivered
Synthetic exact approved fixture task and checks complete.
## Not Delivered / Intentionally Deferred
none
## Evidence
Actual fixture QA and all mandatory reviews are registered and approved.
## Missing Evidence
none
## Risks And Open Items
none
## Context Graph Impact
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Synthetic isolated scope changes no graph owner or knowledge.
## Knowledge Persistence Decision
- memory_target: none
- memory_reason: Synthetic disposable fixture creates no persistent project knowledge.
- memory_refs: none
## Next Permissible Step
- next_allowed_action: Optional explicitly requested VCS handoff.
- required_approval: none
- forbidden_until_then: Automatic Git or release action.
`;
  writeFileSync(join(root, orPath), report);

  const input = { ...bound(), command: { kind: 'closeout.record', payload: { or: { path: orPath, digest: artefactFileDigest(root, orPath) }, confirmation: 'synthetic invalid confirmation' } } };
  const qaApprovedBytes=readFileSync(join(root,qaPath));
  const before = readFileSync(f.state, 'utf8');
  const rejected = await service('agdf_closeout', input); assert.equal(rejected.reason, 'closeout_confirmation_required');
  assert.equal(readFileSync(f.state, 'utf8'), before);
  writeFileSync(join(root,qaPath),qaApprovedBytes.toString()+'\nChanged approved material.\n');
  const changed={...input,operation_id:randomUUID()};changed.command={kind:'closeout.record',payload:{...input.command.payload,confirmation:closeoutConfirmation(f.runId,changed.expected_revision_id,changed.operation_id,input.command.payload.or.digest)}};
  assert.equal((await service('agdf_closeout',changed)).outcome,'rejected','Changed approved bytes remain rejected');
  writeFileSync(join(root,qaPath),qaApprovedBytes);
  const stale={...input,expected_revision_id:randomUUID(),operation_id:randomUUID()};
  assert.equal((await service('agdf_closeout',stale)).outcome,'rejected','Stale revision remains rejected');
  input.command.payload.confirmation = closeoutConfirmation(f.runId, input.expected_revision_id, input.operation_id, input.command.payload.or.digest);
  const result = await service('agdf_closeout', input); assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.current.lifecycle, 'completed'); assert.equal(result.current.completion.fulfilled, true); assert.equal(result.current.next_operation, null);
  assert.equal((await service('agdf_closeout', input)).outcome, 'already_applied');
  assert.equal(runSealState(root, readFileSync(f.state, 'utf8')).status, 'valid');
  for(const item of historical){const doc=await service('agdf_inspect',item.selector);assert.equal(doc.report.available,true);assert.equal(doc.report.applicability,'historical');assert.equal(doc.report.content,item.content,'Historical exact documents preserve original content after completion');}

  assert.deepEqual(readFileSync(join(root,qaPath)),qaApprovedBytes,'Closeout preserves approved matching-declaration QA bytes.');
  results.flows.push({route,language,protocol:'2026-07-28',outcome:'pass',completed:true,replay:'already_applied',negative_canonical_state_unchanged:true,runtime:inspected.runtime});
  console.log(`Actual configured-entrypoint STDIO ${route}/${language}: CD/reviews, reviewed QA recording, exact QA/UAT approvals, OR confirmation, completion and original-UUID replay passed; synthetic disposable decisions only.`);
  });
} finally { rmSync(root,{recursive:true,force:true}); }
}

writeFileSync(new URL("./installed-qualification.json",import.meta.url),JSON.stringify(results,null,2)+"\n");

writeFileSync(new URL('./installed-renderings.json',import.meta.url),JSON.stringify(results.renderings,null,2)+'\n');
writeFileSync(new URL('./installed-refusals.json',import.meta.url),JSON.stringify(results.refusals,null,2)+'\n');
