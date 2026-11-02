import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,cpSync,mkdtempSync,rmSync,realpathSync,symlinkSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {randomUUID,createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {createOwnedRuntimeFixture} from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/mcp-server/test/owned-runtime.js';
import {createLateSourceRevisionTestRun} from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/cli/scripts/fixtures/late-source-revision.js';
import {resolveControlCommandTarget} from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/core/lib/control-state/approval-command-contract.js';
import {artefactFileDigest} from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/core/lib/control-state/run-seal.js';
import {withStdioClient} from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/mcp-server/test/helpers.js';
const plugin='/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const cfg=JSON.parse(readFileSync(join(plugin,'mcp.json'))).mcpServers.agdf;
const lifecycle=await import(pathToFileURL(join(plugin,'runtime/create-agdf/lib/mcp-lifecycle/plugin-runtime.js')));
const packages=await import(pathToFileURL(join(plugin,'runtime/create-agdf/lib/mcp-lifecycle/package.js')));
const runtime=lifecycle.ensurePluginMcpRuntime({pluginRoot:plugin,dataRoot:cfg.args.at(-1)});
const report={evidence_class:'actual configured installed STDIO and installed-function negative probes in disposable runtime/Run only',producer:{root:runtime.root,server:runtime.digest,dispatcher:runtime.dispatcherDigest,sdk:runtime.sdkDigest},native_qualified:false,cases:[],status:'running'};
const fixture=createOwnedRuntimeFixture({candidateServerRoot:runtime.packageRoot});
const temporary=realpathSync(mkdtempSync(join(tmpdir(),'agdf-installed-negative-')));
const output=process.argv[2];
try {
 const root=fixture.governanceTarget;
 const f=createLateSourceRevisionTestRun(root,join(plugin,'runtime/agdf-local.js'),'installed-recovery-disposable',{...process.env,PLUGIN_ROOT:plugin,AGDF_SURFACE:'codex'});
 const path=f.prefix+'CD_INSTALLED.md';writeFileSync(join(root,path),'# CD+Tests\n- decision: pass\nDisposable synthetic qualification, never a production decision.\n');
 const input={schema_version:'1',presentation_language:'en',working_directory:root,primary_target:root,target_source:'explicit_target',target_id:resolveControlCommandTarget(root).target_id,run_id:f.runId,expected_revision_id:f.revision(),operation_id:randomUUID(),assurance:'cooperative_local',command:{kind:'step.record',payload:{step:'internal',internal_step:'CD+Tests',decision:'pass',source:{path,digest:artefactFileDigest(root,path)}}}};
 await withStdioClient({command:process.execPath,args:cfg.args},async client=>{
  const call=async(name,args)=>(await client.callTool({name,arguments:args})).structuredContent;
  const observe={presentation_language:'en',working_directory:root,primary_target:root,target_source:'explicit_target',run_id:f.runId,expected_revision_id:f.revision()};
  const contract=await call('agdf_inspect',{...observe,operation:'operation-contract',module:'agdf_record/step.record'});assert.equal(contract.report.available,true);
  const accepted=await call('agdf_record',input);assert.equal(accepted.outcome,'accepted',JSON.stringify(accepted));assert.equal(contract.runtime.runtime_digest,runtime.dispatcherDigest);
  const recorded=readFileSync(f.state,'utf8');
  // Deliberately treat the response as lost. Recovery starts with the original UUID.
  const status=await call('agdf_inspect',{...observe,expected_revision_id:f.revision(),operation:'operation-status',module:input.operation_id});assert.equal(status.report.status,'recorded');
  const replay=await call('agdf_record',input);assert.equal(replay.outcome,'already_applied');assert.equal(replay.receipt.operation_id,input.operation_id);assert.equal(readFileSync(f.state,'utf8'),recorded);
  const conflict=await call('agdf_record',{...input,command:{...input.command,payload:{...input.command.payload,covers:'different intent'}}});assert.equal(conflict.reason,'operation_payload_conflict');
  const stale=await call('agdf_record',{...input,operation_id:randomUUID()});assert.notEqual(stale.outcome,'accepted');assert.equal(readFileSync(f.state,'utf8'),recorded);
  report.cases.push({case:'original-status-identical-replay-changed-payload-stale-revision',status:'pass',accepted,operation_status:status,replay,conflict,stale,response_loss:'caller simulation after actual committed response, not native transport-loss proof'});
 });
 const copied=join(temporary,'0.14.5');cpSync(runtime.root,copied,{recursive:true});
 const inspect=()=>packages.inspectMcpExecutableRoot({root:copied,expectedVersion:runtime.version});
 assert.equal(inspect().status,'matched');
 const lock=join(temporary,'.agdf-publication.lock');
 for(const body of ['{',JSON.stringify({schema_version:1,pid:process.pid,token:'-'.repeat(36),started_at:new Date().toISOString()}),JSON.stringify({schema_version:1,pid:process.pid,token:randomUUID(),started_at:new Date().toISOString(),owner:'foreign'}),'X'.repeat(4097)]){
  writeFileSync(lock,body);assert.throws(()=>packages.acquireMcpExecutableClaim(inspect()),/AGDF_MCP_EXECUTABLE_CLAIM_LOCK_UNCONFIRMED/);assert.equal(readFileSync(lock,'utf8'),body);rmSync(lock);
 }
 report.cases.push({case:'unknown-malformed-foreign-oversized-lock',status:'pass',lane:'actual installed package owner on own complete runtime copy; exact bytes retained'});
 for(const [name,path] of [['marker',join(copied,'.agdf-mcp-owned.json')],['server',join(copied,'node_modules/@agdf/mcp-server/src/main.js')],['dispatcher',join(copied,'node_modules/create-agdf/lib/mcp-dispatch-runtime.js')],['sdk',join(copied,'node_modules/@modelcontextprotocol/server/package.json')]]){
  const before=readFileSync(path);writeFileSync(path,name==='marker'?'{}':Buffer.concat([before,Buffer.from('\nPRIVATE_SECRET_CANARY\n')]));
  let refused=false;try{refused=inspect().status!=='matched';}catch{refused=true;}assert.equal(refused,true,name);assert.ok(readFileSync(path).equals(name==='marker'?Buffer.from('{}'):Buffer.concat([before,Buffer.from('\nPRIVATE_SECRET_CANARY\n')])));
  report.cases.push({case:name+'-corruption',status:'pass',state:'refused and bytes retained',lane:'installed-function on own complete runtime copy'});writeFileSync(path,before);assert.equal(inspect().status,'matched');
 }
 const alias=join(temporary,'alias');symlinkSync(copied,alias,'dir');assert.throws(()=>packages.inspectMcpExecutableRoot({root:alias,expectedVersion:runtime.version}));
 report.cases.push({case:'noncanonical-symlink-root',status:'pass'});
 const acq=join(temporary,'acquisition'),started=performance.now();let suppliedTimeout;
 assert.throws(()=>lifecycle.ensurePluginMcpRuntime({pluginRoot:plugin,dataRoot:acq,env:{},publicationDeadline:started+30000,
  exec(_command,_args,options){suppliedTimeout=options.timeout;assert.ok(suppliedTimeout>0&&suppliedTimeout<=30000);assert.equal(options.killSignal,'SIGKILL');execFileSync(process.execPath,['-e','setTimeout(() => {}, 31000)'],options);}}),/AGDF_MCP_PUBLICATION_DEADLINE_EXCEEDED/);
 report.cases.push({case:'shared-30000ms-acquisition-deadline',status:'pass',supplied_timeout_ms:suppliedTimeout,elapsed_ms:performance.now()-started,lane:'actual installed functions; directly owned controlled acquisition child, not network/native incident'});
 report.status='pass';
}catch(error){report.status='fail';report.failure=error.message;throw error;}
finally{fixture.dispose();rmSync(temporary,{recursive:true,force:true});report.disposable_cleanup='own roots only';writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,producer:report.producer,cases:report.cases.map(c=>({case:c.case,status:c.status}))}));}
