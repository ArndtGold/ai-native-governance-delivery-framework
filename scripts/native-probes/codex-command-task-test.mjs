import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync, spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, chmodSync, readdirSync, mkdirSync, existsSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const entry = join(root, 'scripts/native-probes/codex-host-e2e.mjs');
const args = ['--command-task', 'T7', '--repetitions', '2', '--model', 'gpt-6.1-sol', '--reasoning-effort', 'low'];
const rawRun = (argumentsValue, env) => spawnSync(process.execPath, [entry, ...argumentsValue], { cwd: root, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 120000 });

const sha = value => createHash('sha256').update(value).digest('hex');
const guardFiles = ['scripts/native-probes/codex-host-e2e.mjs', 'scripts/native-probes/lib/codex-command-guard.mjs'];
const ownedOutputs = [];
function guardInput(home) {
  const base = join(root, 'probe-results', 't7-guard-test-' + randomUUID());
  mkdirSync(base, { recursive: true }); ownedOutputs.push(base);
  const original = realpathSync(mkdtempSync(join(tmpdir(),'agdf-t7-original-'))); ownedOutputs.push(original); mkdirSync(join(original, '.agdf/control'), { recursive: true });
  mkdirSync(join(original, 'packages/core/lib/control-inspect'), { recursive: true });
  writeFileSync(join(original, 'packages/core/lib/control-inspect/contract.js'), 'protected Root probe\n');
  const bindings = {};
  for (const file of guardFiles) { const bytes = readFileSync(join(root,file)); bindings[file] = sha(bytes); mkdirSync(join(original,file,'..'), { recursive:true }); writeFileSync(join(original,file),bytes); }
  assert.equal(spawnSync('git',['init','-q'],{cwd:original}).status,0);
  const settings = {};
  for (const file of ['config.toml','plugins/installed_plugins.json','plugins/known_marketplaces.json']) settings[file] = existsSync(join(home,file)) ? sha(readFileSync(join(home,file))) : null;
  const frozen = join(base,'frozen.json'); writeFileSync(frozen,JSON.stringify({files:Object.fromEntries(guardFiles.map(file=>[file,{sha256:bindings[file]}]))}));
  return {schema_version:1,root:realpathSync(original),candidate:realpathSync(root),codex_home:realpathSync(home),ledger:join(base,'ledger.json'),bindings,expected_settings:settings,frozen_candidate:{path:frozen,sha256:sha(readFileSync(frozen))},base};
}
const run = (argumentsValue, env = {}) => {
  if (argumentsValue.includes('--dry-run') || !argumentsValue.includes('--command-task') || process.platform !== 'darwin' || !env.CODEX_HOME) return rawRun(argumentsValue,env);
  const {base,...binding} = guardInput(env.CODEX_HOME), preflightInput = join(base,'preflight-input.json');
  const preflightArgs = argumentsValue.includes('--preflight-only') ? argumentsValue : [...argumentsValue,'--preflight-only'];
  writeFileSync(preflightInput,JSON.stringify({...binding,output:join(base,'preflight')}));
  let result=rawRun(preflightArgs,{...env,AGDF_T7_GUARD_INPUT:preflightInput});
  if (!argumentsValue.includes('--preflight-only') && result.status===0) {
    const receipt=join(base,'preflight/result.json'), input=join(base,'cohort-input.json');
    writeFileSync(input,JSON.stringify({...binding,output:join(base,'cohort'),preflight:{path:receipt,sha256:sha(readFileSync(receipt))}}));
    result=rawRun(argumentsValue,{...env,AGDF_T7_GUARD_INPUT:input});
  }
  const output=argumentsValue.includes('--preflight-only') || !existsSync(join(base,'cohort/stdout.log')) ? join(base,'preflight') : join(base,'cohort');
  result.controller_stdout=result.stdout;
  if(existsSync(join(output,'stdout.log'))) result.stdout=readFileSync(join(output,'stdout.log'),'utf8');
  if(existsSync(join(output,'stderr.log'))) result.stderr+=readFileSync(join(output,'stderr.log'),'utf8');
  result.guard_base=base;
  return result;
};

test('T7 dry-run binds exactly two low-effort account sessions without invoking a host', () => {
  const output = run([...args, '--dry-run'], { CODEX_BIN: '/absent/no-host' });
  assert.equal(output.status, 0, output.stderr);
  const unboundPreflight = run(['--preflight-only', '--model', 'gpt-6.1-sol'], { CODEX_BIN: '/absent/no-host' });
  assert.notEqual(unboundPreflight.status, 0); assert.match(unboundPreflight.stderr, /COMMAND_TASK_MODE_REQUIRED/);
  assert.deepEqual(JSON.parse(output.stdout), { task: 'T7', sessions: 2, repetitions: 2, model: 'gpt-6.1-sol', reasoning_effort: 'low', timeout_ms: 600000,
    additional_api_spend_authorized_usd: 0, auth: 'existing_chatgpt_account', credential_copy: false, plugin_install: false, executes: false });
  for (const changed of [args.map(v => v === '2' ? '3' : v), args.map(v => v === 'low' ? 'high' : v), [...args, '--keep'], [...args, '--single-session']]) {
    assert.notEqual(run([...changed, '--dry-run'], { CODEX_BIN: '/absent/no-host' }).status, 0);
  }
  const t4 = run(['--single-session', '--task', 'T4', '--model', 'gpt-6.1-sol', '--dry-run'], { CODEX_BIN: '/absent/no-host' });
  assert.equal(t4.status, 0, t4.stderr); assert.equal(JSON.parse(t4.stdout).reasoning_effort, 'high');
});

test('offline mock host proves two fresh fixtures, account-home reuse, low overrides and API exclusion', () => {
  if (process.platform !== 'darwin') {
    const result = run(args, { CODEX_BIN: '/absent/no-host' });
    assert.notEqual(result.status, 0); assert.match(result.stderr, /T7_GUARD_APPLICATION_UNAVAILABLE/);
    return;
  }
  const dir = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-t7-offline-'))), log = join(dir, 'calls.jsonl'), mock = join(dir, 'codex.mjs');
  const source = `#!${process.execPath}
import {appendFileSync,readFileSync,readdirSync,writeFileSync,renameSync,unlinkSync,mkdirSync} from 'node:fs';import {join,dirname} from 'node:path';import {randomUUID} from 'node:crypto';
import {createCoreServices} from ${JSON.stringify(new URL('../../packages/core/lib/index.js', import.meta.url).href)};
import {resolveControlCommandTarget} from ${JSON.stringify(new URL('../../packages/core/lib/control-state/approval-command-contract.js', import.meta.url).href)};
const a=process.argv.slice(2),targets=['config.toml','plugins/installed_plugins.json','plugins/known_marketplaces.json'];
let writeBlocked=true,renameBlocked=true;
for(const file of targets){const config=join(process.env.CODEX_HOME,file),temp=config+'.fixture-temp';mkdirSync(dirname(config),{recursive:true});
let direct=false,atomic=false;
try{writeFileSync(config,'unexpected settings mutation')}catch(e){direct=['EPERM','EACCES'].includes(e.code)}
writeFileSync(temp,'unexpected atomic replacement');try{renameSync(temp,config)}catch(e){atomic=['EPERM','EACCES'].includes(e.code);unlinkSync(temp)}
writeBlocked&&=direct;renameBlocked&&=atomic;}
if(!writeBlocked||!renameBlocked)throw Error('IMMUTABLE_SETTINGS_GUARD_FAILED');
appendFileSync(process.env.MOCK_CODEX_LOG,JSON.stringify({args:a,cwd:process.cwd(),home:process.env.CODEX_HOME,settings_write_blocked:writeBlocked,atomic_replace_blocked:renameBlocked,api_absent:!process.env.OPENAI_API_KEY&&!process.env.CODEX_API_KEY})+'\\n');
if(a.includes('--version')) console.log('codex-cli 0.163.0');
else if(a.includes('login')) console.log(process.env.MOCK_CODEX_AUTH==='unavailable'?'Not logged in':'Logged in using ChatGPT');
else if(a.includes('features')) console.log('code_mode_host stable true');
else if(a.includes('mcp')) { const get=k=>JSON.parse(a.find(v=>v.startsWith(k+'=')).slice(k.length+1));console.log(JSON.stringify({enabled:true,transport:{command:get('mcp_servers.agdf.command'),args:get('mcp_servers.agdf.args')},enabled_tools:get('mcp_servers.agdf.enabled_tools')})); }
else if(a[0]==='exec') {
const root=process.cwd(),run='demo-run-01',rd=join(root,'.agdf/control/runs',run),rev=readFileSync(join(rd,'RUN_STATE.md'),'utf8').match(/^- revision_id: (.+)$/m)[1].trim();
const presentation=readdirSync(join(rd,'presentations')).find(x=>/^[a-f0-9-]{36}\\.json$/.test(x)).slice(0,-5);
const binding={target_id:resolveControlCommandTarget(root).target_id,run_id:run,expected_revision_id:rev,presentation_id:presentation};
const input={schema_version:'1',presentation_language:'de',working_directory:root,primary_target:root,target_source:'explicit_target',target_id:binding.target_id,run_id:run,expected_revision_id:rev,operation_id:randomUUID(),assurance:'cooperative_local',command:{kind:'approval.record',payload:{gate:'UR',presentation_id:presentation,response:'Approval: UR'}}};
const value=await createCoreServices().command('agdf_approve',input);
const item=(id,tool,args,result)=>({type:'item.completed',item:{id,type:'mcp_tool_call',server:'agdf',tool,arguments:args,status:'completed',result:{structuredContent:result}}});
for(const e of [{type:'thread.started',thread_id:randomUUID()},item('read','agdf_inspect',{operation:'operation-contract'},{outcome:'inspect_result',report:{binding}}),item('write','agdf_approve',input,value),{type:'turn_context',payload:{model:'gpt-6.1-sol',effort:'low'}},{type:'turn.completed',usage:{input_tokens:1,output_tokens:1}}]) console.log(JSON.stringify(e));
}
`;
  writeFileSync(mock, source); chmodSync(mock, 0o700);
  writeFileSync(join(dir,'config.toml'),'synthetic immutable account config\n');
  try {
    const result = run(args, { CODEX_BIN: mock, CODEX_HOME: dir, MOCK_CODEX_LOG: log, OPENAI_API_KEY: 'synthetic-must-be-removed', CODEX_API_KEY: 'synthetic-must-be-removed' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const calls = readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse), sessions = calls.filter(c => c.args[0] === 'exec');
    assert.equal(sessions.length, 2); assert.notEqual(sessions[0].cwd, sessions[1].cwd);
    for (const call of sessions) {
      assert.equal(call.home, dir); assert.equal(call.api_absent, true); assert.ok(call.args.includes('--ignore-user-config'));
      assert.ok(call.args.includes('model_reasoning_effort="low"')); assert.ok(call.args.includes('forced_login_method="chatgpt"'));
    }
    assert.ok(calls.every(call => call.settings_write_blocked && call.atomic_replace_blocked), 'preflight and model invocations both enforce immutable config');
    assert.equal(calls.some(c => c.args.includes('plugin') || c.args.includes('install')), false);
    assert.equal(existsSync(join(dir,'auth.json')), false);
    assert.equal(readFileSync(join(dir,'config.toml'),'utf8'),'synthetic immutable account config\n');
    assert.equal(result.stdout.trim().split('\n').filter(Boolean).length, 2);
    writeFileSync(log, '');
    const preflight = run([...args, '--preflight-only'], { CODEX_BIN: mock, CODEX_HOME: dir, MOCK_CODEX_LOG: log });
    assert.equal(preflight.status, 0, preflight.stdout + preflight.stderr);
    const preflightReports = preflight.stdout.trim().split('\n').filter(Boolean).map(JSON.parse);
    assert.equal(preflightReports.length, 1); assert.equal(preflightReports[0].session_invocations, 0);
    assert.equal(readFileSync(log, 'utf8').trim().split('\n').map(JSON.parse).some(call => call.args[0] === 'exec'), false, 'read-only host preflight never invokes the model');
    writeFileSync(log, '');
    const denied = run(args, { CODEX_BIN: mock, CODEX_HOME: dir, MOCK_CODEX_LOG: log, MOCK_CODEX_AUTH: 'unavailable' });
    assert.notEqual(denied.status, 0);
    assert.equal(readFileSync(log, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse).some(call => call.args[0] === 'exec'), false, 'missing auth cannot start a session or fallback');
  } finally { rmSync(dir, { recursive: true, force: true }); for(const path of ownedOutputs.splice(0)) rmSync(path,{recursive:true,force:true}); }
});


test('combined worker guard rejects direct flags and tampered binding before host use; deadline kills only owned descendants', {skip:process.platform!=='darwin'}, async () => {
  const home=mkdtempSync(join(tmpdir(),'agdf-t7-controls-'));
  writeFileSync(join(home,'config.toml'),'synthetic protected config\n');
  const {base,...binding}=guardInput(home), input=join(base,'input.json'), output=join(base,'deadline');
  writeFileSync(input,JSON.stringify({...binding,output}));
  const fixture=join(base,'worker.mjs');
  writeFileSync(fixture,`import {verifyGuardedWorker} from ${JSON.stringify(new URL('./lib/codex-command-guard.mjs',import.meta.url).href)};
import {spawn} from 'node:child_process';import {writeFileSync} from 'node:fs';
verifyGuardedWorker(${JSON.stringify(root)});
const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'});
writeFileSync(${JSON.stringify(join(base,'descendant.json'))},JSON.stringify({worker:process.pid,child:child.pid}));
setInterval(()=>{},1000);`);
  const runner=join(base,'controller.mjs');
  writeFileSync(runner,`import {runGuardedCohort} from ${JSON.stringify(new URL('./lib/codex-command-guard.mjs',import.meta.url).href)};
console.log(JSON.stringify(await runGuardedCohort({candidate:${JSON.stringify(realpathSync(root))},entry:${JSON.stringify(fixture)},args:['--preflight-only'],deadlineMs:2000})));`);
  const unrelated=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'});
  const alive=pid=>{try{process.kill(pid,0);return true}catch{return false}};
  try {
    const result=spawnSync(process.execPath,[runner],{env:{...process.env,AGDF_T7_GUARD_INPUT:input},encoding:'utf8',timeout:10000});
    assert.equal(result.status,0,result.stderr);
    const report=JSON.parse(result.stdout.trim()); assert.equal(report.failure,'T7_COHORT_DEADLINE');
    const descendants=JSON.parse(readFileSync(join(base,'descendant.json')));
    await new Promise(resolve=>setTimeout(resolve,150));
    assert.equal(alive(descendants.worker),false); assert.equal(alive(descendants.child),false); assert.equal(alive(unrelated.pid),true);
    const direct=spawnSync(process.execPath,[fixture],{env:{...process.env,AGDF_T7_GUARD_INPUT:input,AGDF_T7_GUARD_WORKER:join(output,'worker-context.json')},encoding:'utf8'});
    assert.notEqual(direct.status,0); assert.match(direct.stderr,/T7_GUARD_PROTECTION_NOT_ACTIVE/);
    const context=join(output,'worker-context.json'), original=readFileSync(context);
    const value=JSON.parse(original);value.policy_digest='0'.repeat(64);writeFileSync(context,JSON.stringify(value));
    const tampered=spawnSync(process.execPath,[fixture],{env:{...process.env,AGDF_T7_GUARD_INPUT:input,AGDF_T7_GUARD_WORKER:context},encoding:'utf8'});
    assert.notEqual(tampered.status,0);assert.match(tampered.stderr,/T7_GUARD_WORKER_BINDING_INVALID/);
    assert.equal(readFileSync(join(home,'config.toml'),'utf8'),'synthetic protected config\n');
    assert.equal(existsSync(binding.ledger),false,'zero-model preflight reserves no session');
  } finally { unrelated.kill('SIGKILL');rmSync(home,{recursive:true,force:true});for(const path of ownedOutputs.splice(0))rmSync(path,{recursive:true,force:true}); }
});


test('guard failure classification and setup/teardown deadlines stay model-free', {skip:process.platform!=='darwin'}, () => {
  const home=realpathSync(mkdtempSync(join(tmpdir(),'agdf-t7-failures-')));writeFileSync(join(home,'config.toml'),'unchanged settings\n');
  const {base,...binding}=guardInput(home), input=join(base,'input.json'), output=join(base,'verified');
  const helper=new URL('./lib/codex-command-guard.mjs',import.meta.url).href;
  const fixture=join(base,'controls.mjs');
  writeFileSync(fixture,`import {verifyGuardedWorker} from ${JSON.stringify(helper)};import {writeFileSync} from 'node:fs';
if(process.env.FAILURE_CASE==='setup')setInterval(()=>{},1000);
else {if(process.env.FAILURE_CASE==='positive')writeFileSync(${JSON.stringify(output)}+'/positive-'+process.pid+'.tmp','occupied');verifyGuardedWorker(${JSON.stringify(root)});if(process.env.FAILURE_CASE==='teardown')setInterval(()=>{},1000);}`);
  const invoke=(label,{application,phase,ms=6000}={})=>{
    const out=join(base,label);writeFileSync(input,JSON.stringify({...binding,output:out}));
    const runner=join(base,label+'.mjs');writeFileSync(runner,`import {runGuardedCohort} from ${JSON.stringify(helper)};console.log(JSON.stringify(await runGuardedCohort({candidate:${JSON.stringify(realpathSync(root))},entry:${JSON.stringify(fixture)},args:['--preflight-only'],deadlineMs:${ms}${application?',executable:'+JSON.stringify(application):''}})));`);
    const result=spawnSync(process.execPath,[runner],{env:{...process.env,AGDF_T7_GUARD_INPUT:input,FAILURE_CASE:phase??''},encoding:'utf8',timeout:12000});
    assert.equal(result.status,0,result.stderr);return {report:JSON.parse(result.stdout.trim()),out};
  };
  try {
    const fake=join(base,'failed-application.sh');writeFileSync(fake,'#!/bin/sh\necho "sandbox-exec: sandbox_apply: synthetic failure" >&2\nexit 71\n');chmodSync(fake,0o700);
    const startup=invoke('application',{application:fake});assert.equal(startup.report.failure,'T7_GUARD_APPLICATION_FAILED');assert.equal(startup.report.model_invocations,0);
    for(const phase of ['setup','teardown']) {const result=invoke(phase,{phase,ms:1200});assert.equal(result.report.failure,'T7_COHORT_DEADLINE');assert.equal(existsSync(join(result.out,'session-launches.jsonl')),false);}
    const good=invoke('verified');assert.equal(good.report.exit_code,0);assert.equal(good.report.model_invocations,0);
    // A weaker actual profile must fail despite valid canonical profile bytes/context.
    const weak=join(base,'weak.sb');writeFileSync(weak,'(version 1)\n(allow default)\n(deny file-write* (subpath '+JSON.stringify(binding.root)+'))\n');
    const directEnv={...process.env,AGDF_T7_GUARD_INPUT:input,AGDF_T7_GUARD_WORKER:join(output,'worker-context.json')};
    const denied=spawnSync('/usr/bin/sandbox-exec',['-f',weak,process.execPath,fixture],{env:directEnv,encoding:'utf8'});assert.notEqual(denied.status,0);assert.match(denied.stderr,/T7_GUARD_PROTECTION_NOT_ACTIVE/);
    const positive=spawnSync('/usr/bin/sandbox-exec',['-f',join(output,'combined.sb'),process.execPath,fixture],{env:{...directEnv,FAILURE_CASE:'positive'},encoding:'utf8'});assert.notEqual(positive.status,0);assert.match(positive.stderr,/EEXIST/);
    const wrong={...binding,output:join(base,'wrong'),bindings:{...binding.bindings,[guardFiles[0]]:'0'.repeat(64)}};writeFileSync(input,JSON.stringify(wrong));
    const bindingFailure=spawnSync(process.execPath,[fixture],{env:directEnv,encoding:'utf8'});assert.notEqual(bindingFailure.status,0);assert.match(bindingFailure.stderr,/T7_GUARD_SOURCE_CHANGED/);
    assert.equal(readFileSync(join(home,'config.toml'),'utf8'),'unchanged settings\n');assert.equal(existsSync(binding.ledger),false);
  } finally {rmSync(home,{recursive:true,force:true});for(const path of ownedOutputs.splice(0))rmSync(path,{recursive:true,force:true});}
});
