import { spawn, execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, lstatSync, realpathSync, cpSync, rmSync, openSync, closeSync, constants, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { consumeUtf8Output, rolloutDates } from '../mcp-ergonomics/lib/edge-output.js';
import { loadEdgeTasks, buildEdgeFixture, renderEdgePrompt, evaluateEdge } from '../mcp-ergonomics/lib/edge-tasks.js';
import { CODEX_TASK_CONTEXT_VERSION, classifyNativeCall } from '../mcp-ergonomics/lib/native-tasks.js';
import { hashManifest, compareManifests, parseCodexT4Trace, nativeSessionMetrics } from '../mcp-ergonomics/lib/native-run.js';
import { snapshotWorkspace, changedPaths } from '../lib/skill-evals/workspace.js';
import { combinedPolicy } from '../../scripts/native-probes/lib/codex-command-guard.mjs';
import { independentCodexEnvironment } from '../../packages/cli/lib/host-adapters/codex/mcp-startup.js';

const owner = realpathSync(fileURLToPath(new URL('../../',import.meta.url)));
const candidate = owner;
const [baseArgument, mode='confirm', selectedArgument] = process.argv.slice(2);
if(!baseArgument || !['diagnostic','confirm','preflight'].includes(mode))throw Error('Usage: node evals/scripts/run-codex-mcp-edges.mjs /absolute/new/output [diagnostic|confirm|preflight] [E1,...|E4R]');
const base = join(realpathSync(dirname(baseArgument)),baseArgument.split('/').at(-1));
if(!baseArgument.startsWith('/') || base===owner || base.startsWith(owner+'/'))throw Error('OUTPUT_MUST_BE_EXTERNAL_OWNED_DIRECTORY');
const set=loadEdgeTasks(), repetitions=mode==='diagnostic'?1:set.repetitions;
const selected=selectedArgument?.split(',');
const available=[...set.tasks,...(set.renderer_tasks??[])];
if(selected && (new Set(selected).size!==selected.length || selected.some(id=>!available.some(t=>t.id===id))))throw Error('UNKNOWN_OR_DUPLICATE_TASK_SELECTION');
const definitions=selected?available.filter(t=>selected.includes(t.id)):set.tasks;
const cohortMs=(definitions.length*repetitions*set.session_timeout_ms)+120000;
const home = realpathSync(process.env.CODEX_HOME ?? join(homedir(), '.codex'));
const executable = execFileSync('which',['codex'],{encoding:'utf8'}).trim();
if(process.platform!=='darwin')throw Error('MACOS_COMBINED_GUARD_REQUIRED');
const model = set.model, effort = set.effort;
const settings = ['config.toml','plugins/installed_plugins.json','plugins/known_marketplaces.json'];
const tools = ['agdf_dispatch','agdf_inspect','agdf_project','agdf_run','agdf_prepare','agdf_record','agdf_approve','agdf_revise','agdf_closeout'];
const sha = value => createHash('sha256').update(value).digest('hex');
mkdirSync(base, { mode: 0o700 });
const save = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2)+'\n', {mode:0o600});
const env = independentCodexEnvironment(process.env);
for (const key of Object.keys(env)) if (/^(OPENAI_|AZURE_OPENAI_|CODEX_API_KEY$)/u.test(key)) delete env[key];
const command = args => execFileSync(executable, args, {env, encoding:'utf8',maxBuffer:16*1024**2,timeout:15000,stdio:['ignore','pipe','pipe']});
const settingHashes = () => Object.fromEntries(settings.map(name => [name,existsSync(join(home,name))?sha(readFileSync(join(home,name))):null]));
const preservation = () => ({control:hashManifest(join(owner,'.agdf/control')),settings:settingHashes(),index:sha(execFileSync('git',['-c','core.fsmonitor=false','ls-files','--stage','-z'],{cwd:owner,maxBuffer:16*1024**2})),head:execFileSync('git',['-c','core.fsmonitor=false','rev-parse','HEAD'],{cwd:owner,encoding:'utf8'}).trim()});
const before = preservation();
save(join(base,'preservation-before.json'),before);
for (const name of settings) if (existsSync(join(home,name)) && (lstatSync(join(home,name)).isSymbolicLink() || realpathSync(join(home,name))!==join(home,name))) throw Error('SETTINGS_ALIAS_REFUSED');
const auth = spawnSync(executable,['login','status'],{env,encoding:'utf8',timeout:15000});
if (auth.status!==0||!/ChatGPT/u.test(auth.stdout+'\n'+auth.stderr)) throw Error('EXISTING_CHATGPT_AUTH_REQUIRED');
const {createProtocolRuntime}=await import('../mcp-ergonomics/lib/protocol-harness.js');
const runtime=createProtocolRuntime();
const marker=JSON.parse(readFileSync(join(runtime.fixture.root,'.agdf-mcp-owned.json'),'utf8'));
const installed={version:'assembled_worktree_candidate_0.20.2'};
const pluginConfig={};
const overrides={model,model_reasoning_effort:effort,model_provider:'openai',forced_login_method:'chatgpt',web_search:'disabled',mcp_optional_startup_grace_ms:0,
  'features.plugins':false,'features.hooks':false,'mcp_servers.agdf.command':process.execPath,'mcp_servers.agdf.args':[join(runtime.fixture.serverRoot,'bin/agdf-mcp.js'),'--surface','codex'],'mcp_servers.agdf.required':true,'mcp_servers.agdf.enabled_tools':tools,...Object.fromEntries(tools.map(name=>['mcp_servers.agdf.tools.'+name+'.approval_mode','approve'])),project_doc_max_bytes:0,'features.shell_tool':false,'features.memories':false,'features.multi_agent':false,'features.apps':false,'features.code_mode_host':true};
const toml=value=>value&&typeof value==='object'&&!Array.isArray(value)?'{ '+Object.entries(value).map(([k,v])=>JSON.stringify(k)+' = '+toml(v)).join(', ')+' }':JSON.stringify(value);
const args=Object.entries(overrides).flatMap(([k,v])=>['-c',k+'='+toml(v)]);
args.push('-c','plugins='+toml(pluginConfig));
const configured=JSON.parse(command([...args,'mcp','get','agdf','--json']));
if(!configured.enabled||configured.transport?.command!==process.execPath)throw Error('CONFIG_PREFLIGHT_FAILED');
const policy=combinedPolicy({root:realpathSync(owner),codex_home:home});
writeFileSync(join(base,'native.sb'),policy,{mode:0o600});
const check=`const fs=require('node:fs');for(const p of process.argv.slice(1)){let fd;try{fd=fs.openSync(p,fs.constants.O_WRONLY|fs.constants.O_APPEND)}catch(e){if(['EPERM','EACCES'].includes(e.code))continue;throw e}finally{if(fd!==undefined)fs.closeSync(fd)}throw Error('PROTECTION_NOT_ACTIVE')}fs.writeFileSync(${JSON.stringify(join(base,'positive.tmp'))},'owned',{flag:'wx'});fs.unlinkSync(${JSON.stringify(join(base,'positive.tmp'))});console.log('root/settings denied; owned positive control passed')`;
const guard=spawnSync('/usr/bin/sandbox-exec',['-f',join(base,'native.sb'),process.execPath,'-e',check,join(owner,'CONTRIBUTING.md'),join(home,'config.toml')],{env,encoding:'utf8',timeout:15000});
save(join(base,'guard-preflight.json'),{exit:guard.status,stdout:guard.stdout,stderr:guard.stderr,policy_digest:sha(policy),model_invocations:0});
if(guard.status!==0)throw Error('ACTUAL_SANDBOX_PREFLIGHT_FAILED');
const taskSet={task_set_version:set.version,tasks:Array.from({length:repetitions},(_,rep)=>definitions.map(t=>({...t,session:t.id+'-'+(rep+1)}))).flat()};
const sourceBindings=Object.fromEntries(['packages/cli/README.md','packages/cli/lib/cli/codex-document-command.js','packages/cli/lib/cli/command-registry.js','packages/cli/lib/cli/parse-args.js','packages/cli/lib/cli/validation-handlers.js','evals/mcp-ergonomics/test/document-renderer.test.mjs','evals/mcp-ergonomics/test/termination-proof.test.mjs','evals/mcp-ergonomics/edge-tasks.v1.json','evals/mcp-ergonomics/lib/uuid-expression-proof.js','evals/mcp-ergonomics/test/uuid-proof.test.mjs','packages/core/lib/control-state/run-presentation.js','evals/mcp-ergonomics/lib/edge-output.js','evals/mcp-ergonomics/lib/edge-tasks.js','evals/mcp-ergonomics/lib/edge-transport.mjs','evals/mcp-ergonomics/test/edge.test.mjs','evals/mcp-ergonomics/EDGE_CASES.md','evals/scripts/run-codex-mcp-edges.mjs','scripts/native-probes/lib/codex-command-guard.mjs','evals/mcp-ergonomics/tasks.v1.json','evals/mcp-ergonomics/lib/native-tasks.js','evals/mcp-ergonomics/lib/native-run.js','evals/mcp-ergonomics/lib/fixtures.js','packages/core/lib/mcp-input-hints.js','packages/core/lib/control-state/run-command-schema.js','packages/core/lib/control-inspect/contract.js','packages/core/lib/control-inspect/service.js','packages/core/lib/skill-dispatch/contract.js','packages/cli/lib/mcp-protocol-runtime.js'].map(p=>[p,sha(readFileSync(join(candidate,p)))]));
save(join(base,'plan.json'),{model,effort,cli:command(['--version']).trim(),candidate:installed.version,source_commit:before.head,task_set:taskSet.task_set_version,tasks:taskSet.tasks.map(t=>t.session),delivery_modes:Object.fromEntries(definitions.map(t=>[t.id,t.delivery_mode??'agent_message'])),renderer_read_only_tools:['agdf_inspect'],sessions:taskSet.tasks.length,attempts_per_task:repetitions,mode,full_suite:!selected,session_timeout_ms:300000,cohort_timeout_ms:cohortMs,auth:'existing_chatgpt_account',additional_api_spend_authorized_usd:0,credential_copy:false,plugin_install:false,source_bindings:sourceBindings,process_overrides:{base:overrides,plugins:pluginConfig},prompt_policy:definitions.every(t=>t.delivery_mode==='verified_terminal')?'production_render_document_request/1':CODEX_TASK_CONTEXT_VERSION,candidate_marker:marker,source_diff_sha256:sha(execFileSync('git',['-c','core.fsmonitor=false','diff','--binary'],{cwd:owner,maxBuffer:16*1024**2}))});
for(const path of Object.keys(sourceBindings)){mkdirSync(dirname(join(base,'source',path)),{recursive:true,mode:0o700});cpSync(join(candidate,path),join(base,'source',path));}
save(join(base,'reservation.json'),{model,effort,reserved:mode==='preflight'?[]:taskSet.tasks.map(t=>t.session),created_at:new Date().toISOString()});
const launched=[], results=[];let active=null,stopping=false,actualRuntime=null;
const started=Date.now();
const kill=()=>{if(active?.pid)try{process.kill(-active.pid,'SIGKILL')}catch(e){if(e.code!=='ESRCH')throw e}};
const deadline=setTimeout(()=>{stopping=true;kill()},cohortMs-5000);
const stop=()=>{stopping=true;kill()};
process.once('SIGINT',stop);process.once('SIGTERM',stop);
function findRollout(threadId,startedAt){
 const dates=rolloutDates(startedAt);
 for(const date of dates){const d=join(home,'sessions',date);if(!existsSync(d))continue;const name=readdirSync(d).find(n=>n.endsWith(threadId+'.jsonl'));if(name)return readFileSync(join(d,name),'utf8')}
 return null;
}
try{
 for(const task of mode==='preflight'?[]:taskSet.tasks){
  if(stopping)break;
  for(const [path,digest] of Object.entries(sourceBindings))if(sha(readFileSync(join(candidate,path)))!==digest)throw Error('SOURCE_CHANGED_DURING_COHORT:'+path);
  const directory=join(base,task.session);mkdirSync(directory,{mode:0o700});
  let fixture;const result={task:task.id,session:task.session,title:task.title,delivery_mode:task.delivery_mode??'agent_message',requested_model:model,requested_effort:effort,model_invocations:0};
  console.log(JSON.stringify({task:task.id,phase:'fixture'}));
  try{
   fixture=buildEdgeFixture(task);
   const baseline=snapshotWorkspace(fixture.root),initialRevision=fixture.revision?.();
   save(join(directory,'workspace-before.json'),Object.fromEntries(baseline));
   const expectedDocument=fixture.expectedDocument;
   if(expectedDocument)writeFileSync(join(directory,'expected.document'),expectedDocument,{mode:0o600});
   const otherBaselines=(fixture.projects??[]).slice(1).map(f=>({f,before:snapshotWorkspace(f.root)}));
   save(join(directory,'fixture.json'),{root:fixture.root,run_id:fixture.runId,target_id:fixture.targetId,presentation_id:fixture.presentationId,revision:initialRevision,stale_revision:fixture.staleRevisionId,document_bytes:expectedDocument?.length});
   const prompt=renderEdgePrompt(task,fixture);
   writeFileSync(join(directory,'prompt.txt'),prompt,{mode:0o600});
   const faultConfig={serverMain:join(runtime.fixture.serverRoot,'src/main.js'),fault:task.fixture,root:fixture.root,runId:fixture.runId,revision:initialRevision,cli:join(owner,'packages/cli/bin/create-agdf.js'),evidencePath:fixture.evidence?join(fixture.root,fixture.evidence.path):null,journal:join(directory,'fault.json')};
   save(join(directory,'transport.json'),faultConfig);
   const faultArgs=['race','lost_ack'].includes(task.fixture)?['-c','mcp_servers.agdf.args='+toml([fileURLToPath(new URL('../mcp-ergonomics/lib/edge-transport.mjs',import.meta.url)),join(directory,'transport.json')]),'-c','mcp_servers.agdf.tool_timeout_sec=15']:[];
   if(task.delivery_mode==='verified_terminal')faultArgs.push('-c','mcp_servers.agdf.enabled_tools=["agdf_inspect"]');
   result.prompt_sha256=sha(prompt);
   const final=join(directory,'final-message.txt'),sessionArgs=[...args,...faultArgs,'exec','--ignore-user-config','--json','--sandbox','workspace-write','--skip-git-repo-check','-C',fixture.cwd??fixture.root,'-m',model,'-o',final,prompt];
   const begun=Date.now();console.log(JSON.stringify({task:task.id,phase:'model_started'}));
   launched.push(task.session);save(join(base,'launches.json'),launched);result.model_invocations=1;
   const output=await new Promise((resolve,reject)=>{
    let stdout='',stderr='',bytes=0,timedOut=false,limited=false;
    const child=spawn('/usr/bin/sandbox-exec',['-f',join(base,'native.sb'),executable,...sessionArgs],{cwd:fixture.root,env,detached:true,stdio:['ignore','pipe','pipe']});active=child;
    const timer=setTimeout(()=>{timedOut=true;kill()},set.session_timeout_ms);
    const collect=(key,data)=>{appendFileSync(join(directory,key==='stdout'?'events.jsonl':'stderr.log'),data,{mode:0o600});bytes+=Buffer.byteLength(data);if(bytes>64*1024**2){limited=true;kill();return}if(key==='stdout')stdout+=data;else stderr+=data};
    consumeUtf8Output(child.stdout,d=>collect('stdout',d));consumeUtf8Output(child.stderr,d=>collect('stderr',d));
    child.once('error',e=>{clearTimeout(timer);active=null;reject(e)});
    child.once('close',(code,signal)=>{clearTimeout(timer);active=null;resolve({stdout,stderr,code,signal,timedOut,limited})});
   });
   writeFileSync(join(directory,'events.jsonl'),output.stdout,{mode:0o600});writeFileSync(join(directory,'stderr.log'),output.stderr,{mode:0o600});
   const events=output.stdout.split('\n').filter(Boolean).flatMap(line=>{try{return[JSON.parse(line)]}catch{return[]}});
   const threadId=events.find(e=>e.type==='thread.started')?.thread_id;
   const rollout=threadId?findRollout(threadId,begun):null;
   if(rollout)writeFileSync(join(directory,'rollout.jsonl'),rollout,{mode:0o600});
   const rendererMode=task.delivery_mode==='verified_terminal';
   let parsed=parseCodexT4Trace(output.stdout,rollout?[rollout]:[],rendererMode?['agdf_inspect']:tools,{literalTermination:rendererMode});
   if(output.code!==0||output.timedOut||output.limited)parsed.trace_complete=false;
   const changes=changedPaths(baseline,snapshotWorkspace(fixture.root));
   save(join(directory,'changed-paths.json'),changes);
   for(const {f,before} of otherBaselines)if(changedPaths(before,snapshotWorkspace(f.root)).length)throw Error('UNSELECTED_PROJECT_CHANGED');
   const fault=existsSync(join(directory,'fault.json'))?JSON.parse(readFileSync(join(directory,'fault.json'),'utf8')):null;
   let delivery=null;
   if(task.delivery_mode==='verified_terminal') {
    const rendered=spawnSync(process.execPath,[join(owner,'packages/cli/bin/create-agdf.js'),'render-document','--dir',fixture.root,'--run',fixture.runId,'--revision',fixture.selectedRevision,'--gate','UR','--presentation',fixture.presentationId],{input:Buffer.from(output.stdout),maxBuffer:4*1024**2,timeout:15000,env});
    writeFileSync(join(directory,'rendered.document'),rendered.stdout??Buffer.alloc(0),{mode:0o600});
    writeFileSync(join(directory,'renderer-stderr.log'),rendered.stderr??Buffer.alloc(0),{mode:0o600});
    let receipt;const stderr=rendered.stderr?.toString('utf8')??'';
    if(stderr.startsWith('AGDF_DOCUMENT_DELIVERY '))try{receipt=JSON.parse(stderr.slice('AGDF_DOCUMENT_DELIVERY '.length))}catch{}
    delivery={exit:rendered.status,bytes_match:!!rendered.stdout?.equals(expectedDocument),receipt};
    save(join(directory,'delivery.json'),delivery);
   }
   result.edge=evaluateEdge({task,fixture,parsed,delivery,finalText:existsSync(final)?readFileSync(final,'utf8'):'',changes,fault,messages:events.filter(e=>e.type==='item.completed'&&e.item?.type==='agent_message').map(e=>e.item.text)});
   result.failures=parsed.calls.flatMap(call=>{
    const classification=classifyNativeCall(call);if(classification.class==='ok')return[];
    let domain;try{domain=JSON.parse(call.result.text)}catch{}
    const expected=(task.id==='E1'&&domain?.outcome==='target_unresolved')||(task.id==='E2'&&/stale|binding/u.test(JSON.stringify(domain)))||(task.id==='E5'&&call.input.run_id==='demo-run-0l')||(task.id==='E6'&&fault?.kind==='lost_ack'&&call.input.operation_id===fault.request.params.arguments.operation_id);
    return[{tool:call.name,operation:call.input.operation??call.input.command?.kind,classification:classification.class,code:domain?.reason??domain?.diagnostics?.[0]?.code??domain?.report?.reason??null,expected_negative:expected}];
   });
   const runtimes=parsed.calls.flatMap(call=>{try{const r=JSON.parse(call.result.text).runtime;return r?[r]:[]}catch{return[]}});
   result.runtime_digests=[...new Set(runtimes.map(r=>r.runtime_digest))];
   result.no_runtime_call_required=task.id==='E1'&&parsed.calls.length===0;
   result.runtime_matched=runtimes.length>0&&runtimes.every(r=>r.provenance_status==='matched'&&r.expected_version==='0.20.2');
   if(actualRuntime===null&&result.runtime_digests.length===1)actualRuntime=result.runtime_digests[0];
   result.same_built_runtime=result.no_runtime_call_required||result.runtime_digests.length===1&&result.runtime_digests[0]===actualRuntime;
   result.orchestration_errors=rollout?rollout.split('\n').filter(Boolean).flatMap(line=>{let e;try{e=JSON.parse(line)}catch{return[]}const p=e.payload;if(e.type!=='response_item'||!['custom_tool_call_output','function_call_output'].includes(p?.type))return[];const text=typeof p.output==='string'?p.output:JSON.stringify(p.output);return text?.includes('Script failed')&&text.includes('Script error:')?[{type:p.type,reason:'actual CLI orchestration failure'}]:[]}):[];
   result.process={exit:output.code,signal:output.signal,timeout:output.timedOut,output_limit:output.limited};
   result.thread_id=threadId;result.observed_models=parsed.observed_models;result.observed_efforts=parsed.observed_efforts;result.trace_complete=parsed.trace_complete;
   result.detours=parsed.detours;result.warning_count=events.filter(e=>e.type==='item.completed'&&e.item?.type==='error').length;
   result.metrics={...nativeSessionMetrics({...parsed,result:{usage:parsed.usage}},[{path:fixture.root,token:'<FIXTURE>'},{path:home,token:'<HOME>'}]),calls:parsed.calls.length,wall_time_ms:Date.now()-begun,usage:parsed.usage};
   result.identity_confirmed=!!rollout&&parsed.observed_models.length===1&&parsed.observed_models[0]===model&&parsed.observed_efforts.length===1&&parsed.observed_efforts[0]===effort;
   result.delivery_binding_confirmed=!delivery||delivery.receipt?.thread_id===threadId&&delivery.receipt?.runtime_digest===result.runtime_digests[0];
   result.success=result.edge.success&&result.delivery_binding_confirmed&&result.identity_confirmed&&(result.no_runtime_call_required||result.runtime_matched)&&result.same_built_runtime&&parsed.trace_complete&&!parsed.detours.length;
   result.frictionless=result.success&&result.failures.every(f=>f.expected_negative)&&!result.orchestration_errors.length&&(!delivery||delivery.receipt?.duplicate_reads===0&&delivery.receipt?.failed_reads===0);
   if(!result.identity_confirmed||!result.no_runtime_call_required&&!result.runtime_matched||!result.same_built_runtime||output.code!==0&&!output.timedOut)stopping=true;
  }catch(error){result.error=error.message;result.success=false;if(!result.model_invocations)stopping=true}
  finally{
   if(fixture){try{if(existsSync(join(fixture.root,'.agdf/control')))cpSync(join(fixture.root,'.agdf/control'),join(directory,'control-after'),{recursive:true})}catch(error){result.retention_error=error.message;result.success=false;stopping=true}if(fixture.projects)for(const [index,project] of fixture.projects.entries()){cpSync(join(project.root,'.agdf/control'),join(directory,'project-'+index+'-control-after'),{recursive:true});}fixture.dispose()}
   save(join(directory,'result.json'),result);results.push(result);save(join(base,'results.json'),results);
   console.log(JSON.stringify({task:task.id,phase:'completed',success:result.success,frictionless:result.frictionless,calls:result.metrics?.calls,seconds:result.metrics?result.metrics.wall_time_ms/1000:null,error:result.error??(result.edge?.success?null:JSON.stringify(result.edge?.detail))}));
  }
 }
}finally{
 kill();clearTimeout(deadline);process.off('SIGINT',stop);process.off('SIGTERM',stop);
 for(const [path,digest] of Object.entries(sourceBindings))if(sha(readFileSync(join(candidate,path)))!==digest)throw Error('SOURCE_CHANGED_DURING_COHORT:'+path);
 const after=preservation();save(join(base,'preservation-after.json'),after);
 const preserved=before.head===after.head&&before.index===after.index&&JSON.stringify(before.settings)===JSON.stringify(after.settings)&&!compareManifests({control:before.control},{control:after.control}).length;
 const summary={model,effort,candidate:installed.version,runtime_digest:actualRuntime,source_commit:before.head,full_suite:!selected,reserved_sessions:mode==='preflight'?0:taskSet.tasks.length,executed_sessions:launched.length,retries:0,elapsed_ms:Date.now()-started,preserved,credential_copy:false,plugin_install:false,additional_api_spend_usd:0,subscription_usage:launched.length?'consumed; monetary cost unavailable':'none',tasks:results.map(r=>({task:r.task,session:r.session,title:r.title,protection:r.edge?.protection_passed,detail:r.edge?.detail,success:r.success,frictionless:r.frictionless,calls:r.metrics?.calls,seconds:r.metrics?r.metrics.wall_time_ms/1000:null,failures:r.failures?.length,unexpected_failures:r.failures?.filter(f=>!f.expected_negative).length,orchestration_errors:r.orchestration_errors?.length,reason:r.error??null})),all_tasks_executed:results.length===taskSet.tasks.length,all_tasks_passed:results.length===taskSet.tasks.length&&results.every(r=>r.success)&&preserved};
 runtime.dispose();process.exitCode=summary.all_tasks_passed||mode==='preflight'&&preserved?0:1;save(join(base,'summary.json'),summary);console.log(JSON.stringify({summary:join(base,'summary.json'),...summary}));
}
