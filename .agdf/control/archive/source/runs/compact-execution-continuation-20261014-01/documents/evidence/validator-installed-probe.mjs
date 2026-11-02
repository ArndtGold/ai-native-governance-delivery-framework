// Existing structured closeout scenario through the actual MCP entrypoint.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { mkdtempSync, rmSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
const pluginRoot = '/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const installedCore = pluginRoot + '/runtime/create-agdf/runtime/core/lib';
const transcript = new URL('./validator-installed-stdio.jsonl', import.meta.url);
appendFileSync(transcript, JSON.stringify({kind:'installed_identity',marker:JSON.parse(readFileSync(pluginRoot+'/.agdf-installation.json','utf8')),native_model_qualified:false})+'\n');
import { withStdioClient } from '../../../../../packages/mcp-server/test/helpers.js';
import { createLateSourceRevisionTestRun } from '../../../../../packages/cli/scripts/fixtures/late-source-revision.js';
const { resolveControlCommandTarget, canonicalJson, digest } = await import(new URL('file://' + installedCore + '/control-state/approval-command-contract.js'));
const { artefactFileDigest, runSealState } = await import(new URL('file://' + installedCore + '/control-state/run-seal.js'));
const { readRunState } = await import(new URL('file://' + installedCore + '/control-evaluation/run-state.js'));
const { closeoutConfirmation } = await import(new URL('file://' + installedCore + '/control-evaluation/closeout-readiness.js'));
const { COCKPIT_MIME } = await import(new URL('file://' + installedCore + '/control-inspect/cockpit-contract.js'));


for (const modern of [true]) for (const route of ['structured_delivery', 'structured_slice']) {
const root=mkdtempSync(join(tmpdir(),'agdf-validator-installed-'));
execFileSync('git',['init','-q',root]);
// Only disposable scaffold setup uses source init; Run CLI commands and MCP below use installed entrypoints.
execFileSync(process.execPath,['/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/cli/bin/create-agdf.js','init','--dir',root,'--language','en']);
const config=JSON.parse(readFileSync(pluginRoot+'/mcp.json','utf8')).mcpServers.agdf;
const fixture={command:process.execPath,args:config.args,cwd:root};
try {
  const cli = pluginRoot + '/runtime/agdf-local.js';
  const f = createLateSourceRevisionTestRun(root, cli, 'structured-closeout-command', process.env, { route });
  await withStdioClient({ ...fixture, modern }, async client => {
  const service = async (name, input) => { const out = await client.callTool({ name, arguments: input }); appendFileSync(transcript,JSON.stringify({kind:'actual_installed_stdio',route,name,input,result:out,native_model_qualified:false})+'\n'); assert.ok(out.structuredContent, JSON.stringify(out)); return out.structuredContent; };
  const target = resolveControlCommandTarget(root).target_id;
  const bound = () => ({ schema_version: '1', presentation_language: 'en', working_directory: root, target_source: 'explicit_target', primary_target: root,
    target_id: target, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(), assurance: 'cooperative_local' });
  writeFileSync(f.file('BROWNFIELD_ANALYSIS.md'), '# Brownfield Analysis\n- decision: pass\nSynthetic current preparation complete.\n');
  assert.equal(f.run('run-update', '--revision', f.revision()).value.outcome, 'updated');
  for (const step of ['CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR']) {
    const path = f.prefix + step.replaceAll(' ', '_').replaceAll('+', '_') + '_CANDIDATE.md';
    writeFileSync(join(root, path), '# ' + step + '\n- decision: pass\nSynthetic exact current result.\n');
    const recorded = await service('agdf_record', { ...bound(), command: { kind: 'step.record', payload: { step: 'internal', internal_step: step, decision: 'pass', source: { path, digest: artefactFileDigest(root, path) } } } });
    assert.equal(recorded.outcome, 'accepted', JSON.stringify(recorded));
  }
  const qaPath = f.prefix + 'QA_REPORT.md', proof = f.prefix + 'QA_MAPPING.json', request = f.prefix + 'QA_RECORD.json';
  writeFileSync(join(root, qaPath), '# QA: Synthetic closeout\nStatus: pass\nDecision: pass\n\n## Scope\nApproved synthetic task fulfilled.\n\n## Evidence\nExact tests and reviews recorded.\n\n## Risks\nNo applicable open required finding.\n');
  const command = { schema_version: '1', target_id: target, run_id: f.runId, expected_revision_id: f.revision(),
    destination: { type: 'QA_REPORT', path: qaPath, digest: artefactFileDigest(root, qaPath), status: 'pass' }, source: { type: 'TP', path: f.prefix + 'TP.md', digest: artefactFileDigest(root, f.prefix + 'TP.md') },
    relationship: { from: 'QA_REPORT', relationship: 'tests', to: 'TP' }, review: { reviewer: 'Synthetic QA mapping reviewer', path: proof, digest: '' }, update_draft: false };
  const { schema_version, target_id, run_id, destination, source, relationship } = command;
  writeFileSync(join(root, proof), JSON.stringify({ schema_version, target_id, run_id, destination, source, relationship, reviewer: command.review.reviewer, reviewed: true }));
  command.review.digest = artefactFileDigest(root, proof); writeFileSync(join(root, request), JSON.stringify(command));
  const matchingReport=readFileSync(join(root,qaPath),'utf8');
  const baselineRequest=readFileSync(join(root,request),'utf8'), baselineProof=readFileSync(join(root,proof),'utf8');
  for(const text of ['Status: pass\nDecision: revise\n','Status: pass\nDecision: unknown\n','Status: draft\n']) {
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
  input.command.payload.confirmation = closeoutConfirmation(f.runId, input.expected_revision_id, input.operation_id, input.command.payload.or.digest);
  const result = await service('agdf_closeout', input); assert.equal(result.outcome, 'accepted', JSON.stringify(result));
  assert.equal(result.current.lifecycle, 'completed'); assert.equal(result.current.completion.fulfilled, true); assert.equal(result.current.next_operation, null);
  assert.equal((await service('agdf_closeout', input)).outcome, 'already_applied');
  assert.equal(runSealState(root, readFileSync(f.state, 'utf8')).status, 'valid');
  assert.deepEqual(readFileSync(join(root,qaPath)),qaApprovedBytes,'Closeout preserves approved matching-declaration QA bytes.');
  console.log(`Actual default-entrypoint STDIO ${route}: CD/reviews, reviewed QA recording, exact QA/UAT approvals, OR confirmation, completion and original-UUID replay passed; synthetic disposable decisions only.`);
  });
} finally { rmSync(root,{recursive:true,force:true}); }
}
