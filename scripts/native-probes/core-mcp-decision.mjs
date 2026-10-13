// Prepare, never install, a bounded native decision probe. Only disposable Runs
// are writable; this entrypoint is separately identified from production.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, rmSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOwnedRuntimeFixture } from '../../packages/mcp-server/test/owned-runtime.js';
import { createSdDefinitionTestRun, syntheticSd } from '../../packages/cli/scripts/fixtures/sd-definition.js';
import { createPrdDefinitionTestRun, syntheticPrd } from '../../packages/cli/scripts/fixtures/prd-definition.js';
import { createLateSourceRevisionTestRun, syntheticTp } from '../../packages/cli/scripts/fixtures/late-source-revision.js';
import { artefactFileDigest } from '../../packages/core/lib/control-state/run-seal.js';
import { randomUUID } from 'node:crypto';
import { readDecisionUiBuild } from '../cockpit-ui-build.mjs';
import { resolveControlCommandTarget } from '../../packages/core/lib/control-state/approval-command-contract.js';
const repo = fileURLToPath(new URL('../../', import.meta.url));
const options = {};
for (let i = 2; i < process.argv.length; ++i) {
  const arg = process.argv[i];
  if (arg === '--all-gates') { options.allGates = true; continue; }
  if (!['--evidence-dir', '--dispatcher-root', '--server-root'].includes(arg) || !process.argv[i + 1] || options[arg]) throw Error('Unsupported native probe option');
  options[arg] = resolve(process.argv[++i]);
}
const evidenceRoot = options['--evidence-dir'] ?? join(repo, '.agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/evidence');
if (!evidenceRoot.startsWith(join(repo, '.agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/evidence') + '/')
    && evidenceRoot !== join(repo, '.agdf/control/artefacts/core-mcp-flow-coherence-20261010-01/evidence')) throw Error('Native probe evidence scope invalid');
mkdirSync(evidenceRoot, { recursive: true });
const allGates = options.allGates === true;
const locales = Object.keys(JSON.parse(readFileSync(join(repo, 'plugins/agdf/meta/agdf-interaction-locales.json'), 'utf8')).locales);
// build:prepare owns dist/npm. A previous local installation build is a different
// candidate, even when its release version matches; use it only as an explicit override.
const fixture = createOwnedRuntimeFixture({ dispatcherSourceRoot: options['--dispatcher-root'] ?? join(repo, 'dist/npm/create-agdf'),
  candidateServerRoot: options['--server-root'] ?? join(repo, 'dist/npm/agdf-mcp-server') });
const root = fixture.governanceTarget, cli = join(fixture.dispatcherRoot, 'bin/create-agdf.js');
// Reuse the existing canonical fixture owners. All prerequisite decisions below
// are synthetic and confined to this disposable target; the selected gate is
// deliberately left undecided for the native human observation.
function prepareGate(id, gate) {
  if (gate === 'UR') {
    execFileSync(process.execPath, [cli, 'run-create', '--dir', root, '--run', id]);
    const path = `.agdf/control/artefacts/${id}/UR.md`;
    mkdirSync(join(root, `.agdf/control/artefacts/${id}`), { recursive: true });
    writeFileSync(join(root, path), '# UR: Synthetic native gate observation\n\n## Problem\nA personal filter must be restored.\n## Goal\nSave and restore one personal filter.\n## Scope\nOne user-owned filter; no sharing.\n## AGDF Approval Summary (en; source=en)\n- Problem: A personal filter must be restored.\n- Goal: Save and restore one personal filter.\n- Scope: One user-owned filter; no sharing.\n\n## AGDF Approval Summary (de; source=en)\n- Problem: Ein persönlicher Filter soll wiederhergestellt werden.\n- Ziel: Einen nutzereigenen Filter speichern und wiederherstellen.\n- Umfang: Ein Filter für den jeweiligen Nutzer, ohne Teilen.\n');
    const state = join(root, `.agdf/control/runs/${id}/RUN_STATE.md`);
    const revision = () => readFileSync(state, 'utf8').match(/^- revision_id: (.+)$/mu)[1];
    execFileSync(process.execPath, [cli, 'run-step', '--dir', root, '--run', id, '--revision', revision(), '--step', 'ur', '--title', 'Synthetic native gate observation']);
    return { revision };
  }
  if (gate === 'PRD') {
    const f = createPrdDefinitionTestRun(root, cli, id, process.env, { typedApprovals: true });
    writeFileSync(f.file('PRD.md'), syntheticPrd());
    const result = f.record(); if (result.value.outcome !== 'recorded') throw Error(result.text);
    return f;
  }
  const f = ['QA', 'UAT'].includes(gate)
    ? createLateSourceRevisionTestRun(root, cli, id)
    : createSdDefinitionTestRun(root, cli, id, process.env, { typedApprovals: true });
  if (['SD', 'TP'].includes(gate)) {
    writeFileSync(f.file('SD.md'), syntheticSd());
    const result = f.recordSd(); if (result.value.outcome !== 'recorded') throw Error(result.text);
    if (gate === 'SD') return f;
    const prepared = f.present('SD');
    if (f.approve('SD', prepared.value.presentation_id).value.outcome !== 'accepted') throw Error('Synthetic SD prerequisite failed');
    writeFileSync(f.file('TP.md'), syntheticTp() + '\n## AGDF Approval Summary (de; source=en)\n- Aufgaben: Den nutzereigenen Filter mit dem bestehenden Speicher sichern und wiederherstellen.\n- Prüfung: T-001 und SCN-001 prüfen, dass wiederhergestellte Werte den gespeicherten entsprechen.\n');
  }
  if (['QA', 'UAT'].includes(gate)) {
    for (const step of ['CD+Tests', 'TP Review', 'Clean Implementation Review', 'CR']) {
      const path = f.prefix + step.replaceAll(' ', '_').replaceAll('+', '_') + '_CANDIDATE.md';
      writeFileSync(join(root, path), '# ' + step + '\n- decision: pass\nSynthetic disposable prerequisite, never a production review.\n');
      const command = boundCommand(f, 'step.record', { step: 'internal', internal_step: step, decision: 'pass', source: { path, digest: artefactFileDigest(root, path) } });
      executeRecord(f, command);
    }
    writeFileSync(f.file('QA_REPORT.md'), '# QA: Synthetic native gate observation\n- decision: pass\n\n## Scope\nDisposable synthetic filter task.\n## Evidence\nSynthetic tests/reviews, never production quality evidence.\n## Risks\nNo applicable fixture finding.\n\n## AGDF Approval Summary (de; source=en)\n- Umfang: Isolierte synthetische Filteraufgabe.\n- Nachweise: Synthetische Tests und Reviews, keine Produktionsnachweise.\n- Risiken: Kein anwendbarer offener Befund im Wegwerf-Test.\n');
  }
  const destinationGate = gate === 'TP' ? 'TP' : 'QA';
  const type = destinationGate === 'QA' ? 'QA_REPORT' : 'TP';
  const sourceType = destinationGate === 'QA' ? 'TP' : 'SD';
  const relation = { from: type, relationship: destinationGate === 'QA' ? 'tests' : 'derived_from', to: sourceType };
  const mapping = f.prefix + `native-map-${randomUUID()}.json`, request = f.prefix + `native-record-${randomUUID()}.json`;
  const value = { schema_version: '1', target_id: resolveControlCommandTarget(root).target_id, run_id: id, expected_revision_id: f.revision(),
    destination: { type, path: f.prefix + type + '.md', digest: artefactFileDigest(root, f.prefix + type + '.md'), status: destinationGate === 'QA' ? 'pass' : 'draft' },
    source: { type: sourceType, path: f.prefix + sourceType + '.md', digest: artefactFileDigest(root, f.prefix + sourceType + '.md') },
    relationship: relation, review: { reviewer: 'Synthetic native fixture mapping', path: mapping, digest: '' }, update_draft: false };
  const { schema_version, target_id, run_id, destination, source, relationship } = value;
  writeFileSync(join(root, mapping), JSON.stringify({ schema_version, target_id, run_id, destination, source, relationship, reviewer: value.review.reviewer, reviewed: true }));
  value.review.digest = artefactFileDigest(root, mapping); writeFileSync(join(root, request), JSON.stringify(value));
  executeRecord(f, boundCommand(f, 'artefact.record', { gate: destinationGate, reviewed_request: { path: request, digest: artefactFileDigest(root, request) } }));
  if (gate === 'UAT') {
    const prepared = f.present('QA');
    if (f.approve('QA', prepared.value.presentation_id).value.outcome !== 'accepted') throw Error('Synthetic QA prerequisite failed');
  }
  return f;
}
function boundCommand(f, kind, payload) {
  return { schema_version: '1', presentation_language: 'en', working_directory: root, primary_target: root, target_source: 'explicit_target',
    target_id: resolveControlCommandTarget(root).target_id, run_id: f.runId, expected_revision_id: f.revision(), operation_id: randomUUID(),
    assurance: 'cooperative_local', command: { kind, payload } };
}
function executeRecord(f, command) {
  const path = f.file(`native-command-${command.operation_id}.json`); writeFileSync(path, JSON.stringify(command));
  const result = JSON.parse(execFileSync(process.execPath, [cli, 'agdf-record', '--command-file', path], { encoding: 'utf8' }));
  if (result.outcome !== 'accepted') throw Error(JSON.stringify(result));
}
try {
  rmSync(join(root, '.agdf'), { recursive: true }); rmSync(join(root, '.git'), { recursive: true });
  execFileSync('git', ['init', '-q', root]); execFileSync(process.execPath, [cli, 'init', '--dir', root, '--language', 'en']);
  const runs = [];
  // The approved contextual UI has one approval action. Formal change/reject
  // remain covered by disposable Core/transport consumers, not native buttons.
  for (const locale of locales) for (const gate of allGates ? ['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'] : ['SD']) for (const action of ['approve', 'text']) {
    const id = `native-${locale}-${allGates ? gate.toLowerCase() + '-' : ''}${action.replaceAll('_', '-')}`;
    const f = allGates ? prepareGate(id, gate) : createSdDefinitionTestRun(root, cli, id, process.env, { typedApprovals: true });
    if (!allGates) {
    writeFileSync(f.file('SD.md'), syntheticSd() + '\n## Native observation scope\nDisposable synthetic Run. No real undertaking is approved or changed by this probe.\n');
    const recorded = f.recordSd(); if (recorded.value.outcome !== 'recorded') throw Error(recorded.text);
    }
    runs.push({ locale, action, run_id: id, expected_revision_id: f.revision(), gate });
    process.stdout.write(`Prepared isolated ${id}\n`);
  }
  const entry = join(fixture.root, 'native-decision-entry.mjs'), observations = join(fixture.root, 'native-observations.jsonl');
  const source = `// Private experimental native probe; never a production qualification record.
import {appendFileSync,readFileSync,realpathSync} from 'node:fs';
import {createMcpDispatchRuntime,createMcpDecisionRuntime,DECISION_UI_URI} from ${JSON.stringify(fileURLToPath(new URL('lib/mcp-dispatch-runtime.js', 'file://' + fixture.dispatcherRoot + '/')))};
import {runMcpServer} from ${JSON.stringify(join(fixture.serverRoot, 'src/main.js'))};
import {loadCockpitResource} from ${JSON.stringify(join(fixture.serverRoot, 'src/cockpit-resource.js'))};
const root=${JSON.stringify(root)},runs=new Set(${JSON.stringify(runs.map(row => row.run_id))});
const roots=new Set([root,realpathSync(root)]);
const producer={process_id:process.pid,server_started_at:new Date().toISOString()};
const log=(event,data)=>appendFileSync(${JSON.stringify(observations)},JSON.stringify({at:new Date().toISOString(),event,evidence_class:'native_probe_unclassified',producer,data})+'\\n');
log('server_started',{});
let runtime=createMcpDispatchRuntime({surface:'codex',commandGroups:['agdf_prepare','agdf_record','agdf_approve']});
const ui={uri:DECISION_UI_URI,mimeType:'text/html;profile=mcp-app',limit:4*1024**2,kind:'decision'};ui.digest=loadCockpitResource(ui).digest;
runtime=await createMcpDecisionRuntime({runtime,ui,appOnlyMediationQualified:true});
const tools=runtime.tools.map(tool=>({...tool,parse(value){const parsed=tool.parse(value);
if(!tool.parentOwned&&(!roots.has(value.primary_target)||!roots.has(value.working_directory)||value.target_source!=='explicit_target'||!runs.has(value.run_id)))throw Object.assign(Error('native_probe_scope_denied'),{dispatch:'not_dispatched'});
// Allow only canonical continuation routing inside the already whitelisted disposable Runs.
if(tool.name==='agdf_dispatch'&&value.continue_delivery&&value.skill_id!=='gate-check')throw Object.assign(Error('native_probe_scope_denied'),{dispatch:'not_dispatched'});
return parsed;},async execute(input,signal,host){log('tool_request',{name:tool.name,input,client:host?.client});
const result=await tool.execute(input,signal,host);log('tool_result',{name:tool.name,result});return result;}}));
const postprocess=runtime.postprocessToolResult;
runtime={...runtime,tools,tool:name=>tools.find(tool=>tool.name===name),async postprocessToolResult(name,input,result,host){
const next=await postprocess(name,input,result,host);log('view_result',{name,client:host?.client,result:next});return next;}};
await runMcpServer({surface:'codex',runtime,executor:{async execute(input,{toolName,signal}){const tool=runtime.tool(toolName);return tool.execute(tool.parse(input),signal);},async close(){await runtime.close();log('server_closed',{});}}});
`;
  writeFileSync(entry, source);
  const marker = JSON.parse(readFileSync(join(fixture.root, '.agdf-mcp-owned.json'), 'utf8'));
  const candidate = { schema_version: '1', evidence_class: 'prepared_disposable_native_probe', observed_at: new Date().toISOString(),
    production_entrypoint: false, installed: false, native_qualified: false, assurance: 'cooperative_local', authorizes: false,
    runtime_root: fixture.root, target: root, target_id: resolveControlCommandTarget(root).target_id, runs,
    entrypoint: entry, entrypoint_digest: 'sha256:' + createHash('sha256').update(source).digest('hex'),
    server_digest: marker.server_digest, dispatcher_digest: marker.dispatcher_digest, sdk_digest: marker.sdk_digest,
    ui: readDecisionUiBuild().manifest, observations,
    configuration: { name: 'agdf-decision-probe', command: process.execPath, args: [entry] } };
  let descriptor = 'NATIVE_PROBE_CANDIDATE.json';
  if (allGates) {
    let sequence = 1;
    do { descriptor = `NATIVE_PROBE_CANDIDATE_GATE_MATRIX_${String(sequence++).padStart(2, '0')}.json`; }
    while (existsSync(join(evidenceRoot, descriptor)));
  }
  writeFileSync(join(evidenceRoot, descriptor), JSON.stringify(candidate, null, 2) + '\n');
  process.stdout.write(`Candidate descriptor: ${descriptor}\n`);
  process.stdout.write(JSON.stringify(candidate, null, 2) + '\n');
} catch (error) { fixture.dispose(); throw error; }
