import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { candidateFixture } from './test-support.mjs';
import { jsonDigest, sha } from './lib/release-candidate.mjs';
import { releasePolicy, requiredReleaseCases, optionalCliCases } from './lib/release-policy.mjs';
import { assertHostReleaseEvidence, assertHumanReport, referencesFrom, releaseRecords } from './lib/release-observation.mjs';
import { assertBundleReview, bundleDigest, importClaudeEvidence, importNativeEvidence, runReleaseTool } from './lib/release-handoff.mjs';

async function runFixtureReleaseTool(args, fixture) {
  const previous = process.env.GITHUB_SHA;
  try {
    process.env.GITHUB_SHA = fixture.git('rev-parse', 'HEAD').trim();
    return await runReleaseTool(args, fixture.root);
  } finally {
    if (previous === undefined) delete process.env.GITHUB_SHA; else process.env.GITHUB_SHA = previous;
  }
}

// All records below are synthetic validator fixtures, never installed-host observations.
function desktopFixtures(f) {
  const root = mkdtempSync(join(tmpdir(), 'agdf-desktop-fixture-'));
  const policy = releasePolicy(f.root);
  const lockedTuples = ['codex','claude'].map(host => ({ host, surface: 'desktop-code', os: host === 'codex' ? 'darwin' : 'win32',
    arch: 'x64', version: '9.8.7', node: 'v22.22.3', model: 'fixture-desktop-model' }));
  const rows = requiredReleaseCases(policy, undefined, lockedTuples).map((item, index) => {
    const directory = join(root, item.host, item.surface, String(index)); mkdirSync(directory, { recursive: true });
    const environment = lockedTuples.find(t => t.host === item.host);
    const calls = (item.scenario === 'session' ? ['dispatch','failure_case','skill_continuation'] : ['dispatch']).map(scenario => {
      const result = { schema_version: '1', outcome: scenario === 'failure_case' ? 'invalid_input' : scenario === 'skill_continuation' ? 'skill_continuation' : 'control_result',
        authorizes: false, terminal: scenario !== 'skill_continuation', runtime: { runtime_digest: f.candidate.identities.mcp_dispatcher.digest } };
      if (scenario === 'skill_continuation') result.continuation = { runtime_contracts: ['quality','context-graph'].map(module => ({module,content:module,sha256:sha(module)})) };
      // Claude Desktop calls use the shape of the app's session transcript: no init event, model per assistant message.
      const session = {sessionId:'fixture-desktop-session',entrypoint:'claude-desktop',version:'2.1.0',isSidechain:false};
      const events = item.host === 'codex' ? [{type:'turn_context',payload:{model:environment.model}},
        {item:{id:scenario,type:'mcp_tool_call',pluginId:'agdf@agdf',invocation:{tool:'agdf_dispatch',server:'agdf'},result:{content:[{text:JSON.stringify(result)}]}}}]
        : [{...session,type:'assistant',message:{model:environment.model,content:[{type:'tool_use',id:scenario,name:'mcp__plugin_agdf_agdf__agdf_dispatch'}]}},
          {...session,type:'user',message:{content:[{type:'tool_result',tool_use_id:scenario,content:[{text:JSON.stringify(result)}]}]}}];
      return {scenario,status:0,stdout:events.map(e=>JSON.stringify(e)).join('\n')};
    });
    const transition = item.scenario === 'session' ? undefined : {baseline:{version:'0.14.5',integrity:'sha512-'+Buffer.alloc(64).toString('base64'),source_digest:'c'.repeat(64)},
      preserved_foreign_state:true,permission_preserved:true,...(item.scenario==='recovery'?{repair:'owned_stale_install'}:{})};
    const primary = {session_id:'fixture-desktop-session',environment,candidate_id:f.candidate.candidate_id,loaded_identity:f.candidate.identities.agdf,
      coding_surface:'code',fresh_session:true,owned_scope:'fixture-owned-scope',installation:{status:0,consent:'configured',loaded_identity:f.candidate.identities.agdf},
      discovery:{plugin:'agdf@agdf',loaded_identity:f.candidate.identities.agdf},
      cleanup:{status:0,leftovers:{mcp_listed:false,config_mcp_section:false,plugin_cache:false,mcp_runtime:false,plugin_tool_policy:false,
        plugin_data:false,enabled:false,permission_rules:0,user_mcp:false,installed_entry:false}},calls,...(transition?{transition}:{})};
    writeFileSync(join(directory,'desktop-primary.json'),JSON.stringify(primary));
    writeFileSync(join(directory,'capture.png'),'Synthetic fixture; not a native screenshot');
    const record={schema_version:3,kind:'qualified_desktop',id:'desktop-fixture-'+index,recorded_at:'2026-10-22T10:00:00Z',environment,
      tuple_digest:jsonDigest(environment),source:f.candidate.source_revision,candidate_id:f.candidate.candidate_id,policy_digest:f.candidate.policy_digest,
      loaded_identity:f.candidate.identities.agdf,scenario:item.scenario,result:'pass',assurance:'operator_observed',session_id:primary.session_id,
      ...(transition?{transition}:{}),references:referencesFrom(directory,['desktop-primary.json','capture.png'])};
    writeFileSync(join(directory,'desktop-'+item.scenario+'.json'),JSON.stringify([record]));
    return {record,directory};
  });
  for(const host of ['codex','claude']) {
    const scoped=rows.filter(r=>r.record.environment.host===host);
    writeFileSync(join(root,host,'desktop-code','review.json'),JSON.stringify({schema_version:1,reviewed:true,reviewer:'Fixture reviewer',
      candidate_id:f.candidate.candidate_id,bundle_digest:bundleDigest(scoped),tuples:lockedTuples.filter(t=>t.host===host)}));
  }
  return {root,rows,options:{candidate:f.candidate,policy,lockedTuples,commit:f.candidate.source_revision.commit}};
}

test('Desktop policy requires both exact observed tuples and preserves optional CLI pins', () => {
  const f=candidateFixture({policyVersion:2}), d=desktopFixtures(f);
  try {
    assert.equal(d.rows.length,6); assert.equal(requiredReleaseCases(d.options.policy)[0].os,'observed');
    assert.deepEqual(d.options.policy.optional_cli.codex,JSON.parse(readFileSync(new URL('./codex-release-policy.json',import.meta.url))));
    assert.equal(assertHostReleaseEvidence(d.rows,d.options).result,'pass');
    for(const mutate of [rows=>rows.pop(),rows=>rows.push(rows[0]),rows=>rows[0].record.kind='human_report',
      rows=>rows[0].record.schema_version=2,rows=>rows[0].record.candidate_id='0'.repeat(64),
      rows=>rows[0].record.environment.os='unknown',rows=>rows[0].record.assurance='native_process',
      rows=>rows[0].record.environment.version='0.157.1',rows=>delete rows[0].record.session_id]) {
      const rows=structuredClone(d.rows);mutate(rows);assert.throws(()=>assertHostReleaseEvidence(rows,d.options));
    }
    assert.throws(()=>assertHostReleaseEvidence(d.rows,{...d.options,lockedTuples:[]}));
    assert.throws(()=>assertHostReleaseEvidence(d.rows,{...d.options,lockedTuples:[...d.options.lockedTuples,{...d.options.lockedTuples[0],os:'win32'}]}),/ambiguous/u);
  } finally {rmSync(f.root,{recursive:true,force:true});rmSync(d.root,{recursive:true,force:true});}
});
test('Desktop primary capabilities, raw calls, transitions and cleanup cannot be replaced by booleans', () => {
  const f=candidateFixture({policyVersion:2}),d=desktopFixtures(f);
  try {
    const row=d.rows[0],file=join(row.directory,'desktop-primary.json'),original=readFileSync(file);
    for(const mutate of [p=>p.calls=[],p=>p.calls[0].stdout='model says PASS',p=>p.installation.consent='unknown',
      p=>p.cleanup.leftovers.enabled=true,p=>p.discovery.loaded_identity=null,p=>p.session_id='wrong',
      p=>p.environment={...p.environment,model:'wrong'},p=>p.coding_surface='chat',
      p=>p.calls[0].stdout=p.calls[0].stdout.replaceAll('false','true'),
      p=>p.calls[2].stdout=p.calls[2].stdout.replaceAll('quality','forged')]) {
      const primary=JSON.parse(original);mutate(primary);writeFileSync(file,JSON.stringify(primary));
      row.record.references=referencesFrom(row.directory,['desktop-primary.json','capture.png']);
      assert.throws(()=>assertHostReleaseEvidence(d.rows,d.options));
    }
    writeFileSync(file,original);row.record.references=referencesFrom(row.directory,['desktop-primary.json','capture.png']);
    const transition=d.rows.find(r=>r.record.scenario==='recovery');
    transition.record.transition.permission_preserved=false;assert.throws(()=>assertHostReleaseEvidence(d.rows,d.options));
  } finally {rmSync(f.root,{recursive:true,force:true});rmSync(d.root,{recursive:true,force:true});}
});
test('Claude Desktop calls require one native Desktop transcript session and reject CLI streams', () => {
  const f=candidateFixture({policyVersion:2}),d=desktopFixtures(f);
  try {
    const row=d.rows.find(r=>r.record.environment.host==='claude'&&r.record.scenario==='session');
    const file=join(row.directory,'desktop-primary.json'),original=readFileSync(file);
    const events=stdout=>stdout.split('\n').map(line=>JSON.parse(line));
    const write=(call,list)=>{call.stdout=list.map(e=>JSON.stringify(e)).join('\n');};
    const cliStream=call=>write(call,[{type:'system',subtype:'init',model:d.options.lockedTuples[1].model},
      ...events(call.stdout).map(({sessionId,entrypoint,version,isSidechain,...e})=>e)]);
    for(const [mutate,code] of [[c=>cliStream(c),/desktop_transcript_cli_stream/u],
      [c=>write(c,events(c.stdout).map(e=>({...e,entrypoint:'cli'}))),/desktop_transcript_entrypoint/u],
      [c=>write(c,events(c.stdout).map(({entrypoint,...e})=>e)),/desktop_transcript_entrypoint/u],
      [c=>write(c,events(c.stdout).map((e,i)=>i?{...e,sessionId:'other-session'}:e)),/desktop_transcript_session/u],
      [c=>write(c,events(c.stdout).map(e=>({...e,sessionId:'other-session'}))),/desktop_call_session_mismatch/u],
      [c=>write(c,events(c.stdout).map(e=>({...e,isSidechain:true}))),/desktop_transcript_sidechain/u],
      [c=>write(c,[...events(c.stdout),{...events(c.stdout)[0],message:{model:'other-model',content:[]}}]),/desktop_model_mismatch/u],
      [c=>write(c,events(c.stdout).map(e=>e.type==='assistant'?{...e,message:{...e.message,model:undefined}}:e)),/desktop_model_mismatch/u],
      [c=>write(c,[...events(c.stdout),{...events(c.stdout)[0],message:{model:d.options.lockedTuples[1].model,content:[{type:'tool_use',id:'shell',name:'Bash'}]}}]),/primary_unexpected_native_tool/u]]) {
      const primary=JSON.parse(original);mutate(primary.calls[0]);writeFileSync(file,JSON.stringify(primary));
      row.record.references=referencesFrom(row.directory,['desktop-primary.json','capture.png']);
      assert.throws(()=>assertHostReleaseEvidence(d.rows,d.options),code);
    }
    writeFileSync(file,original);row.record.references=referencesFrom(row.directory,['desktop-primary.json','capture.png']);
    assert.equal(assertHostReleaseEvidence(d.rows,d.options).result,'pass');
  } finally {rmSync(f.root,{recursive:true,force:true});rmSync(d.root,{recursive:true,force:true});}
});
test('default and explicit full validation cannot accept a Codex-only Desktop bundle or legacy publication policy', async () => {
  const f=candidateFixture({policyVersion:2}),d=desktopFixtures(f);
  const previous = process.env.GITHUB_SHA;
  try {
    const candidate=join(f.root,'.release-candidate.json');writeFileSync(candidate,JSON.stringify(f.candidate));
    const args=['validate','--candidate',candidate,'--directory',d.root];
    assert.equal((await runFixtureReleaseTool(args,f)).cases.length,6);
    assert.equal((await runFixtureReleaseTool([...args,'--all-hosts'],f)).cases.length,6);
    assert.equal(process.env.GITHUB_SHA, previous);
    rmSync(join(d.root,'claude'),{recursive:true});
    await assert.rejects(runFixtureReleaseTool(args,f));
    await assert.rejects(runFixtureReleaseTool([...args,'--all-hosts'],f));
    assert.equal(process.env.GITHUB_SHA, previous);
  } finally {rmSync(f.root,{recursive:true,force:true});rmSync(d.root,{recursive:true,force:true});}
  const old=candidateFixture();
  try { const candidate=join(old.root,'.release-candidate.json');writeFileSync(candidate,JSON.stringify(old.candidate));
    await assert.rejects(runFixtureReleaseTool(['validate','--candidate',candidate,'--directory',old.root,'--all-hosts'],old),/publication_requires_desktop_policy/u);
  } finally {rmSync(old.root,{recursive:true,force:true});}
});
test('Codex Desktop import is scoped, reviewed, immutable and produces only its actual host projection', () => {
  const f=candidateFixture({policyVersion:2}),d=desktopFixtures(f);
  try {
    const bundle=join(d.root,'codex','desktop-code'),review=JSON.parse(readFileSync(join(bundle,'review.json')));
    const imported=importNativeEvidence(f.root,{candidate:f.candidate,bundle,review,host:'codex',surface:'desktop-code'});
    assert.equal(imported.cases.length,3);
    const manifest=JSON.parse(readFileSync(join(f.root,'evals/host-compatibility/manifest.json')));
    assert.ok(manifest.native_sources[0].includes('codex-desktop-code-release'));
    assert.ok(manifest.native_targets.every(t=>t.environment.host==='codex'&&t.environment.variant==='desktop-code'));
    f.git('add','.'); f.git('commit','-qm','fixture evidence-only import');
    assert.throws(()=>importNativeEvidence(f.root,{candidate:f.candidate,bundle,review,host:'codex',surface:'desktop-code'}),/already_exists/u);
  } finally {rmSync(f.root,{recursive:true,force:true});rmSync(d.root,{recursive:true,force:true});}
});
test('attributed human reports preserve unknown identity and cannot supply native qualification', () => {
  const f=candidateFixture({policyVersion:2});
  try {
    const report={schema_version:1,kind:'human_report',id:'fixture-report',recorded_at:'2026-10-22T10:00:00Z',reported_by:'Fixture operator',
      host:'codex',surface:'desktop-code',assurance:'human_reported',qualification:'unverified',candidate_id:null,
      scenarios:{session:'reported_pass',upgrade:'reported_pass',recovery:'reported_pass'},
      identity:{os:null,arch:null,version:null,model:null,node:null,session_id:null,executed_at:null},missing_evidence:['candidate and actual tuple'],
      references:referencesFrom(f.root,['package.json'])};
    assert.equal(assertHumanReport(report,f.root).identity.os,null);
    assert.throws(()=>assertHostReleaseEvidence([{record:report,directory:f.root}],{candidate:f.candidate,policy:releasePolicy(f.root)}));
    for(const mutation of [{qualification:'qualified'},{candidate_id:f.candidate.candidate_id},{assurance:'operator_observed'}])
      assert.throws(()=>assertHumanReport({...report,...mutation},f.root));
    assert.throws(()=>assertHumanReport({...report,references:[{path:'../outside',sha256:'a'.repeat(64)}]},f.root));
  } finally {rmSync(f.root,{recursive:true,force:true});}
});

function nativeFixtures(f, host, scope) {
  const root = mkdtempSync(join(tmpdir(), 'agdf-native-fixture-'));
  const policy = releasePolicy(f.root);
  const rows = (scope === 'optional-cli' ? optionalCliCases(policy, host) : requiredReleaseCases(policy, host)).map((item, i) => {
    const directory = join(root, String(i)); mkdirSync(directory);
    const codexPolicy = policy.optional_cli?.codex ?? policy.codex;
    const environment = { host: item.host, surface: item.surface, os: item.os, arch: 'x64', node: 'v22.22.3',
      version: item.host === 'codex' ? codexPolicy.codex_version : '2.1.193', model: item.host === 'codex' ? codexPolicy.model : 'fixture-model' };
    const result = { schema_version: '1', outcome: item.scenario === 'failure_case' ? 'invalid_input' : item.scenario === 'skill_continuation' ? 'skill_continuation' : 'control_result',
      terminal: item.scenario !== 'skill_continuation', authorizes: false, runtime: { runtime_digest: f.candidate.identities.mcp_dispatcher.digest } };
    if (item.scenario === 'skill_continuation') result.continuation = { runtime_contracts: ['quality','context-graph'].map(module => ({ module, content: module, sha256: sha(module) })) };
    let record = { schema_version: 2, id: `fixture-${item.host}-${i}`, recorded_at: '2026-10-20T12:00:00Z', environment,
      tuple_digest: jsonDigest(environment), source: f.candidate.source_revision, candidate_id: f.candidate.candidate_id, policy_digest: f.candidate.policy_digest,
      scenario: item.scenario, result: 'pass', loaded_identity: f.candidate.identities.agdf, assurance: 'native_process' };
    if (item.surface === 'desktop-code') {
      writeFileSync(join(directory, 'native.json'), JSON.stringify({ fixture: true, result }));
      writeFileSync(join(directory, 'capture.png'), 'deterministic fixture image; not native evidence');
      writeFileSync(join(directory, 'native.log'), 'synthetic fixture\r\nsecond line\r\n');
      record = { ...record, assurance: 'operator_observed', session_id: 'fixture-session',
        ...(['upgrade','recovery'].includes(item.scenario) ? { transition: { baseline: { version: '0.14.5', integrity: 'sha512-fixture', source_digest: 'c'.repeat(64) }, preserved_foreign_state: true, permission_preserved: true, repair: 'owned_stale_install' } } : {}),
        observations: { coding_surface: true, fresh_session: true, candidate_loaded: true, agdf_access: true, cleanup: true }, references: referencesFrom(directory, ['native.json','capture.png','native.log']) };
    } else {
      const events = item.host === 'codex' ? [
        { type: 'turn_context', payload: { model: environment.model } },
        { item: { id: 'call', type: 'mcp_tool_call', pluginId: 'agdf@agdf', invocation: { tool: 'agdf_dispatch', server: 'agdf' }, result: { content: [{ text: JSON.stringify(result) }] } } },
      ] : [
        { type: 'system', subtype: 'init', model: environment.model },
        { type: 'assistant', message: { content: [{ type: 'tool_use', id: 'call', name: 'mcp__plugin_agdf_agdf__agdf_dispatch' }] } },
        // Claude CLI joins an error reply's machine report and human diagnostic into one string.
        { type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: 'call', ...(item.scenario === 'failure_case'
          ? { is_error: true, content: `${JSON.stringify(result, null, 2)}\nAGDF tool failed: dispatch_input_invalid (working_directory).` }
          : { content: [{ text: JSON.stringify(result) }] }) }] } },
      ];
      const text = events.map(event => JSON.stringify(event)).join('\n');
      const primary = { status: 0, stdout: text, ...(item.host === 'codex' ? { rollouts: [text] } : {}) };
      writeFileSync(join(directory, `${item.scenario}-process.json`), JSON.stringify(primary));
      writeFileSync(join(directory, 'host-process.json'), JSON.stringify({ status: 0, stdout: item.host === 'codex' ? `codex-cli ${environment.version}` : `${environment.version} (Claude Code)` }));
      for (const path of ['uninstall-process.json','removal-process.json']) writeFileSync(join(directory, path), JSON.stringify({ status: 0, stdout: 'fixture native cleanup' }));
      const evidence = { exec_status: 0, calls: 1, observed_models: [environment.model], plugin_id: 'agdf@agdf', outcome: result.outcome,
        terminal: result.terminal, authorizes: false, runtime_digest: result.runtime.runtime_digest, contracts_verified: true,
        baseline: { version: '0.14.5', integrity: 'sha512-fixture', source_digest: 'c'.repeat(64) }, preserved_foreign_state: true, permission_preserved: true, repair: 'owned_stale_install' };
      record.steps = ['host','install','installation_consent','discovery','removal',item.scenario].map(name => ({ name, status: 'pass',
        evidence: name === 'removal' ? { mcp_listed: false, installed_entry: false, plugin_data: false, enabled: false, permission_rules: 0, user_mcp: false, config_mcp_section: false, plugin_cache: false, mcp_runtime: false, plugin_tool_policy: false }
          : name === 'installation_consent' ? { mcp_approval: { status: 'configured' } } : evidence }));
      record.references = referencesFrom(directory, [`${item.scenario}-process.json`, 'host-process.json', 'uninstall-process.json', 'removal-process.json']);
    }
    writeFileSync(join(directory, item.surface === 'desktop-code' ? `desktop-${item.scenario}.json` : 'release-records.json'), JSON.stringify([record]));
    return { record, directory };
  });
  return { root, rows, options: { candidate: f.candidate, policy, host, commit: f.candidate.source_revision.commit,
    lockedTuples: rows.map(row => row.record.environment) } };
}
test('complete matrix accepts real-shaped primary events and rejects missing/forged observations', () => {
  const f = candidateFixture(), data = nativeFixtures(f);
  try {
    assert.equal(data.rows.length, 18);
    assert.equal(assertHostReleaseEvidence(data.rows, data.options).result, 'pass');
    for (const mutate of [rows => rows.pop(), rows => rows.push(rows[0]), rows => rows[0].record.source = { ...rows[0].record.source, dirty: true },
      rows => rows[0].record.candidate_id = '0'.repeat(64), rows => rows[0].record.environment.version = 'latest',
      rows => rows[0].record.steps.at(-1).evidence.calls = 0, rows => rows[0].record.steps.find(row => row.name === 'removal').evidence.enabled = true,
      rows => rows[0].record.references[0].sha256 = '0'.repeat(64), rows => rows[0].record.references[0].path = '../escape',
      rows => rows.at(-1).record.observations.coding_surface = false, rows => delete rows.at(-1).record.transition]) {
      const rows = structuredClone(data.rows); mutate(rows);
      assert.throws(() => assertHostReleaseEvidence(rows, data.options));
    }
    assert.throws(() => assertHostReleaseEvidence(data.rows, { ...data.options, commit: 'f'.repeat(40) }), /commit_mismatch/u);
    assert.throws(() => assertHostReleaseEvidence(data.rows, { ...data.options, lockedTuples: [] }), /tuple_not_reviewed/u);
    const drift = structuredClone(data.rows);
    const changed = drift.at(-1).record;
    changed.environment.version = '3.0.0'; changed.tuple_digest = jsonDigest(changed.environment);
    assert.throws(() => assertHostReleaseEvidence(drift, { ...data.options, lockedTuples: [...data.options.lockedTuples, changed.environment] }), /tuple_changed_between_cases/u);
    // A native call reports the MCP dispatcher projection; the plugin runtime manifest digest is no substitute.
    const { mcp_dispatcher: { digest: dispatcher }, agdf: { runtime_digest: manifest } } = f.candidate.identities;
    assert.notEqual(dispatcher, manifest);
    const executed = data.rows.find(row => row.record.environment.surface === 'cli' && row.record.scenario === 'dispatch');
    const capture = join(executed.directory, 'dispatch-process.json'), bytes = readFileSync(capture, 'utf8');
    const step = executed.record.steps.find(row => row.name === 'dispatch');
    writeFileSync(capture, bytes.replaceAll(dispatcher, manifest)); step.evidence.runtime_digest = manifest;
    executed.record.references = referencesFrom(executed.directory, executed.record.references.map(row => row.path));
    assert.throws(() => assertHostReleaseEvidence(data.rows, data.options), /native_executed_runtime_mismatch/u);
    writeFileSync(capture, bytes); step.evidence.runtime_digest = dispatcher;
    executed.record.references = referencesFrom(executed.directory, executed.record.references.map(row => row.path));
    const primary = data.rows[0];
    const original = readFileSync(join(primary.directory, primary.record.references[0].path));
    writeFileSync(join(primary.directory, primary.record.references[0].path), JSON.stringify({ status: 0, stdout: 'model says PASS' }));
    primary.record.references = referencesFrom(primary.directory, primary.record.references.map(row => row.path));
    assert.throws(() => assertHostReleaseEvidence(data.rows, data.options), /primary_native_calls/u);
    writeFileSync(join(primary.directory, primary.record.references[0].path), original);
    primary.record.references = referencesFrom(primary.directory, primary.record.references.map(row => row.path));
    const claude = data.rows.find(row => row.record.environment.host === 'claude' && row.record.environment.surface === 'cli');
    const path = join(claude.directory, claude.record.references[0].path), captured = JSON.parse(readFileSync(path));
    captured.stdout += `\n${JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', id: 'unexpected', name: 'Bash', input: {} }] } })}`;
    writeFileSync(path, JSON.stringify(captured));
    claude.record.references = referencesFrom(claude.directory, claude.record.references.map(row => row.path));
    assert.throws(() => assertHostReleaseEvidence(data.rows, data.options), /primary_unexpected_native_tool/u);
  } finally { rmSync(f.root, { recursive: true, force: true }); rmSync(data.root, { recursive: true, force: true }); }
});
test('Claude import requires reviewed exact bundle, remains immutable and excludes unrelated files', () => {
  const f = candidateFixture(), data = nativeFixtures(f, 'claude');
  try {
    const review = { schema_version: 1, candidate_id: f.candidate.candidate_id, reviewed: true, reviewer: 'Fixture reviewer',
      bundle_digest: bundleDigest(data.rows), tuples: data.options.lockedTuples };
    assert.throws(() => importClaudeEvidence(f.root, { candidate: f.candidate, bundle: data.root, review: { ...review, reviewed: false } }), /review_required/u);
    writeFileSync(join(data.root, 'unrelated-secret.txt'), 'must not be copied');
    const imported = importClaudeEvidence(f.root, { candidate: f.candidate, bundle: data.root, review });
    assert.equal(imported.result, 'pass');
    assertBundleReview(review, data.rows, f.candidate);
    assert.throws(() => assertBundleReview({ ...review, reviewed: false }, data.rows, f.candidate), /review_required/u);
    assert.throws(() => assertBundleReview({ ...review, bundle_digest: '0'.repeat(64) }, data.rows, f.candidate), /bundle_mismatch/u);
    assert.throws(() => readFileSync(join(imported.destination, 'unrelated-secret.txt')));
    // The import itself is now an uncommitted output: persist it in this disposable fixture only.
    f.git('add', '.'); f.git('commit', '-qm', 'native result only');
    const desktop = data.rows.find(row => row.record.environment.surface === 'desktop-code');
    const nativePath = `evals/host-compatibility/native/${f.candidate.candidate_id}/claude/${desktop.record.id}/native.log`;
    assert.equal(f.git('show', `HEAD:${nativePath}`), 'synthetic fixture\r\nsecond line\r\n', 'Git storage must preserve the bytes referenced by imported Windows captures');
    rmSync(join(f.root, nativePath)); f.git('checkout', '--', nativePath);
    assert.equal(readFileSync(join(f.root, nativePath), 'utf8'), 'synthetic fixture\r\nsecond line\r\n', 'fresh checkout must preserve reference digests');
    assert.equal(assertHostReleaseEvidence(releaseRecords(imported.destination), data.options).result, 'pass');
    assert.throws(() => importClaudeEvidence(f.root, { candidate: f.candidate, bundle: data.root, review }), /already_exists/u);
  } finally { rmSync(f.root, { recursive: true, force: true }); rmSync(data.root, { recursive: true, force: true }); }
});
test('Desktop templates are explicitly unverified and cannot satisfy release acceptance', async () => {
  const f = candidateFixture();
  try {
    const folder = join(f.root, 'probe-results'); mkdirSync(folder);
    const environment = { host: 'claude', surface: 'desktop-code', os: 'win32', arch: 'x64', node: 'v22.22.3', version: '2.1.193', model: 'fixture-model' };
    const candidatePath = join(folder, 'candidate.json'), tuplePath = join(folder, 'tuple.json'), output = join(folder, 'desktop-session.json');
    writeFileSync(candidatePath, JSON.stringify(f.candidate)); writeFileSync(tuplePath, JSON.stringify({ candidate_id: f.candidate.candidate_id, environment, tuple_digest: jsonDigest(environment) }));
    f.put('docs/evidence-only.txt', 'evidence-only fixture commit\n'); f.git('add', '.'); f.git('commit', '-qm', 'evidence only');
    await runReleaseTool(['desktop-template','--candidate',candidatePath,'--tuple',tuplePath,'--output',output], f.root);
    assert.equal(JSON.parse(readFileSync(output)).result, 'unverified');
    assert.equal(JSON.parse(readFileSync(output)).source.commit, f.git('rev-parse','HEAD').trim());
    assert.notEqual(JSON.parse(readFileSync(output)).source.commit, f.candidate.source_revision.commit);
    assert.throws(() => assertHostReleaseEvidence([{ record: JSON.parse(readFileSync(output)), directory: folder }], { candidate: f.candidate, policy: releasePolicy(f.root), host: 'claude' }));
    await assert.rejects(runReleaseTool(['handoff','--candidate',candidatePath,'--output',folder,'--unexpected','value'], f.root), /command_invalid/u);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
test('local validation binds the actual checkout and CI additionally requires its exact trusted SHA', async () => {
  const f = candidateFixture(), data = nativeFixtures(f, 'codex');
  const previous = process.env.GITHUB_SHA;
  try {
    const candidatePath = join(f.root, '.release-candidate.json');
    writeFileSync(candidatePath, JSON.stringify(f.candidate));
    delete process.env.GITHUB_SHA;
    const args = ['validate','--candidate',candidatePath,'--directory',data.root];
    assert.equal((await runReleaseTool(args, f.root)).result, 'pass');
    process.env.GITHUB_SHA = f.git('rev-parse', 'HEAD').trim();
    assert.equal((await runReleaseTool(args, f.root)).result, 'pass');
    process.env.GITHUB_SHA = 'f'.repeat(40);
    await assert.rejects(runReleaseTool(args, f.root), /release_checkout_sha_mismatch/u);
  } finally {
    if (previous === undefined) delete process.env.GITHUB_SHA; else process.env.GITHUB_SHA = previous;
    rmSync(f.root, { recursive: true, force: true }); rmSync(data.root, { recursive: true, force: true });
  }
});
test('optional current-policy CLI diagnostics retain strict checks and never grant Desktop eligibility', async () => {
  const f=candidateFixture({policyVersion:2}),d=nativeFixtures(f,'codex','optional-cli');
  try {
    const candidate=join(f.root,'.release-candidate.json');writeFileSync(candidate,JSON.stringify(f.candidate));
    const args=['validate-cli','--candidate',candidate,'--directory',d.root];
    const result=await runFixtureReleaseTool(args,f);
    assert.equal(result.cases.length,10);assert.equal(result.qualification,'unqualified');
    await assert.rejects(runFixtureReleaseTool(['validate','--candidate',candidate,'--directory',d.root,'--all-hosts'],f));
    const record=d.rows[0].record;
    record.source.commit='f'.repeat(40);
    writeFileSync(join(d.rows[0].directory,'release-records.json'),JSON.stringify([record]));
    await assert.rejects(runFixtureReleaseTool(args,f),/commit_mismatch/u);
  } finally {rmSync(f.root,{recursive:true,force:true});rmSync(d.root,{recursive:true,force:true});}
});
test('Desktop preflight uses captured runtime identity, never the helper process tuple', async () => {
  const f=candidateFixture({policyVersion:2}), temp=mkdtempSync(join(tmpdir(),'agdf-desktop-preflight-'));
  try {
    const candidate=join(f.root,'.release-candidate.json');writeFileSync(candidate,JSON.stringify(f.candidate));
    const capture=join(temp,'native-version.json'),output=join(temp,'tuple.json');
    const observed={host:'codex',surface:'desktop-code',os:process.platform,arch:'captured-native-arch',version:'9.8.7',node:'v24.1.2',model:'captured-native-model'};
    writeFileSync(capture,JSON.stringify(observed));
    const args=['preflight','--candidate',candidate,'--host','codex','--surface','desktop-code','--version','9.8.7','--version-evidence',capture,'--model','captured-native-model','--output',output];
    const tuple=await runReleaseTool(args,f.root);
    assert.deepEqual(tuple.environment,observed);
    rmSync(output);writeFileSync(capture,JSON.stringify({...observed,version:'1.2.3'}));
    await assert.rejects(runReleaseTool(args,f.root),/version_capture_mismatch/u);
    writeFileSync(capture,JSON.stringify({...observed,node:'unknown'}));
    await assert.rejects(runReleaseTool(args,f.root),/tuple_node_missing/u);
  } finally {rmSync(f.root,{recursive:true,force:true});rmSync(temp,{recursive:true,force:true});}
});
