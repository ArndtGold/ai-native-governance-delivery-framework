import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';import {EventEmitter} from 'node:events';
import {createWorkerDispatchExecutor} from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/mcp-server/src/worker.js';
const digest=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const root="/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework";
const status=execFileSync('git',['status','--porcelain=v1','-z'],{cwd:root}).toString().split('\0').filter(Boolean);
const tracked=execFileSync('git',['ls-files','-z','packages/cli/lib/mcp-lifecycle','packages/cli/lib/host-adapters/codex','packages/mcp-server/src','scripts/prepare-cockpit-local.mjs','scripts/native-probes/core-mcp-decision.mjs'],{cwd:root}).toString().split('\0').filter(Boolean);
const protect=execFileSync('git',['ls-files','-z','--modified','--others','--exclude-standard','docs'],{cwd:root}).toString().split('\0').filter(Boolean);
const approved=['UR','PRD','SD','TP'].map(g=>'.agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/'+g+'.md');
let instances=[];
class DeferredWorker extends EventEmitter{
 constructor(){super();instances.push(this);}
 terminate(){return new Promise(resolve=>{this.end=resolve;});}
}
const executor=createWorkerDispatchExecutor({WorkerClass:DeferredWorker,timeoutMs:1000});
const first=executor.execute({});instances[0].emit('message',{type:'result',result:'first'});
const exposed=executor.active===false;
let overlapping=false,second;
try{second=executor.execute({});overlapping=true;instances[1].emit('message',{type:'result',result:'second'});}catch{}
instances.forEach(w=>w.end?.(0));
await Promise.allSettled([first,second].filter(Boolean));
const result={schema_version:'1',head:execFileSync('git',['rev-parse','HEAD'],{cwd:root}).toString().trim(),status,source:tracked.map(path=>({path,digest:digest(root+'/'+path)})),protected:[...protect,...approved].map(path=>({path,exists:existsSync(root+'/'+path),digest:existsSync(root+'/'+path)?digest(root+'/'+path):null})),worker_regression:{source:'packages/mcp-server/src/worker.js',isolated_real_executor_injected_termination:true,capacity_freed_before_termination:exposed,overlapping_second_worker:overlapping,historical_timeout_cause_proven:false},production_mutated:false};
writeFileSync("/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/.agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/evidence/implementation-baseline.json",JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({head:result.head,source_files:tracked.length,protected_files:result.protected.length,worker_regression:result.worker_regression}));
