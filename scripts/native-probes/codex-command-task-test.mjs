import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync, chmodSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../../', import.meta.url));
const entry = join(root, 'scripts/native-probes/codex-host-e2e.mjs');
const args = ['--command-task', 'T7', '--repetitions', '2', '--model', 'gpt-6.1-sol', '--reasoning-effort', 'low'];
const run = (argumentsValue, env) => spawnSync(process.execPath, [entry, ...argumentsValue], { cwd: root, env: { ...process.env, ...env }, encoding: 'utf8', timeout: 120000 });

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
    assert.notEqual(result.status, 0); assert.match(result.stdout, /CONFIG_WRITE_GUARD_UNAVAILABLE/);
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), 'agdf-t7-offline-')), log = join(dir, 'calls.jsonl'), mock = join(dir, 'codex.mjs');
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
    assert.equal(readdirSync(dir).some(name => name === 'auth.json' || name === 'config.toml'), false);
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
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
