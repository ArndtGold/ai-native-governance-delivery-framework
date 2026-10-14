// Installed report-field qualification. All prerequisites and approvals are synthetic on disposable targets.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync, rmSync, appendFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
const pluginRoot = '/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const installedCore = pluginRoot + '/runtime/create-agdf/runtime/core/lib';
const transcript = new URL('./installed-stdio.jsonl', import.meta.url);
appendFileSync(transcript, JSON.stringify({kind:'installed_identity',marker:JSON.parse(readFileSync(pluginRoot+'/.agdf-installation.json','utf8')),native_model_qualified:false})+'\n');
import { withStdioClient } from '../../../../../packages/mcp-server/test/helpers.js';
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
const results={marker:JSON.parse(readFileSync(pluginRoot+'/.agdf-installation.json','utf8')),parser_cases:observedCases,internal_cases:reportInternalCases.length,flows:[],native_model_observed:false};
function snapshot(root,runId){const dir=join(root,'.agdf/control/runs',runId),data={};const walk=p=>{for(const e of readdirSync(p,{withFileTypes:true})){const f=join(p,e.name);if(e.isDirectory())walk(f);else data[f]=readFileSync(f).toString('base64');}};walk(dir);walk(join(root,'.agdf/control/artefacts',runId));data.backlog=readFileSync(join(root,'.agdf/control/MASTER_BACKLOG.md')).toString('base64');return data;}
for (const modern of [true]) for (const route of ['structured_delivery', 'structured_slice']) {
const root=mkdtempSync(join(tmpdir(),'agdf-validator-installed-'));
execFileSync('git',['init','-q',root]);
// Only disposable scaffold setup uses source init; Run CLI commands and MCP below use installed entrypoints.
execFileSync(process.execPath,['/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/cli/bin/create-agdf.js','init','--dir',root,'--language','en']);
const config=JSON.parse(readFileSync(pluginRoot+'/mcp.json','utf8')).mcpServers.agdf;
const fixture={command:process.execPath,args:config.args,cwd:root};
try {
  const cli = pluginRoot + '/runtime/agdf-local.js';
  const f = createLateSourceRevisionTestRun(root, cli, 'structured-closeout-command', process.env, { route, prepare: false });
  await withStdioClient({ ...fixture, modern }, async client => {
  const service = async (name, input) => { const before=snapshot(root,f.runId); const out = await client.callTool({ name, arguments: input }); if(out.structuredContent?.outcome==='rejected')assert.deepEqual(snapshot(root,f.runId),before,'Rejected installed operation changes no canonical Run/receipts/backlog'); appendFileSync(transcript,JSON.stringify({kind:'actual_installed_stdio',route,name,input,result:out,native_model_qualified:false})+'\n'); assert.ok(out.structuredContent, JSON.stringify(out)); return out.structuredContent; };
  const target = resolveControlCommandTarget(root).target_id;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
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
  writeFileSync(join(root, qaPath), '# QA: Synthetic closeout\nStatus: pass\n\n## 1. QA Decision\nDecision: pass\n\n## Examples\n~~~\nDecision: block\n~~~\n> Example:\nDecision: unknown\n\n## Scope\nApproved synthetic task fulfilled.\n\n## Evidence\nExact tests and reviews recorded.\n\n## Risks\nNo applicable open required finding.\n');
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
  const qa = await service('agdf_record', { ...bound(), command: { kind: 'artefact.record', payload: { gate: 'QA', reviewed_request: { path: request, digest: artefactFileDigest(root, request) } } } });
  assert.equal(qa.outcome, 'accepted', JSON.stringify(qa));
  const inspected=await service('agdf_inspect',{operation:'gate-check',presentation_language:'en',working_directory:root,target_source:'explicit_target',primary_target:root,run_id:f.runId});
  assert.equal(inspected.report.current_gate,'QA');assert.equal(inspected.report.blocking_reason,'none');
  assert.equal(inspected.runtime.provenance_status,'matched');
  assert.deepEqual(readFileSync(join(inspected.runtime.plugin_root,'runtime/core/lib/control-evaluation/report-decision.js')),
    readFileSync(installedCore+'/control-evaluation/report-decision.js'),'Actually loaded MCP generation contains the installed hardened reader');
  for (const gate of ['QA', 'UAT']) {
    const preparedReply = await client.callTool({ name: 'agdf_prepare', arguments: { ...bound(), command: { kind: 'presentation.prepare', payload: { gate } } } });
    appendFileSync(transcript,JSON.stringify({kind:'actual_installed_presentation',route,result:preparedReply})+'\n');
    const prepare = preparedReply.structuredContent;
    assert.equal(prepare.outcome, 'accepted', JSON.stringify(prepare));
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
  assert.deepEqual(readFileSync(join(root,qaPath)),qaApprovedBytes,'Closeout preserves approved matching-declaration QA bytes.');
  results.flows.push({route,protocol:'2026-07-28',outcome:'pass',completed:true,replay:'already_applied',negative_canonical_state_unchanged:true,runtime:inspected.runtime});
  console.log(`Actual default-entrypoint STDIO ${route}: CD/reviews, reviewed QA recording, exact QA/UAT approvals, OR confirmation, completion and original-UUID replay passed; synthetic disposable decisions only.`);
  });
} finally { rmSync(root,{recursive:true,force:true}); }
}

writeFileSync(new URL("./installed-qualification.json",import.meta.url),JSON.stringify(results,null,2)+"\n");
