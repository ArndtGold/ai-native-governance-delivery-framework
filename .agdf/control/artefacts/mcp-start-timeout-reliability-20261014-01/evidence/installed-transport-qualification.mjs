import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,cpSync,realpathSync} from 'node:fs';
import {join,dirname} from 'node:path';import {tmpdir} from 'node:os';import {pathToFileURL} from 'node:url';
import {withStdioClient} from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/mcp-server/test/helpers.js';
const root="/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework", run="mcp-start-timeout-reliability-20261014-01";
const plugin='/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const cfg=JSON.parse(readFileSync(join(plugin,'mcp.json'))).mcpServers.agdf;
const lifecycle=await import(pathToFileURL(join(plugin,'runtime/create-agdf/lib/mcp-lifecycle/plugin-runtime.js')));
const runtime=lifecycle.ensurePluginMcpRuntime({pluginRoot:plugin,dataRoot:cfg.args.at(-1)});
const output=process.argv[2], samples={cold:[],warm:[],multi:[],diagnostic:[]};
const inspect={operation:'doctor',presentation_language:'de',working_directory:root,primary_target:root,target_source:'continued_target',run_id:run};
const timings=[], original={root:runtime.root,server:runtime.digest,dispatcher:runtime.dispatcherDigest,sdk:runtime.sdkDigest};
const options={command:process.execPath,args:cfg.args};
async function call(client,lane){
 const started=performance.now();const result=await client.callTool({name:'agdf_inspect',arguments:inspect});
 samples[lane].push(performance.now()-started);
 assert.notEqual(result.isError,true,JSON.stringify(result));assert.equal(result.structuredContent.outcome,'inspect_result',JSON.stringify(result));
 assert.equal(result.structuredContent.runtime.runtime_digest,runtime.dispatcherDigest);
 return result.structuredContent;
}
async function connect(lane,invoke=false){
 const started=performance.now();
 return withStdioClient(options,async client=>{const tools=await client.listTools();samples[lane].push(performance.now()-started);
 assert.ok(tools.tools.some(t=>t.name==='agdf_dispatch'));assert.ok(tools.tools.some(t=>t.name==='agdf_record'));
 if(invoke)await call(client,'multi');});
}
const report={evidence_class:'actual configured installed product CLI/STDIO; direct transport, not native desktop UI',node:process.version,platform:process.platform+'-'+process.arch,producer:original,configured_launcher:cfg.args,workloads:samples,native_qualified:false,authorizes:false,phase_samples:timings};
try{
 for(let n=0;n<20;n++)await connect('cold');
 await withStdioClient(options,async client=>{for(let n=0;n<20;n++)await call(client,'warm');});
 for(let wave=0;wave<10;wave++)await Promise.all(Array.from({length:3},()=>connect('multi',true)));
 // An explicitly labelled read-only diagnostic producer uses the exact installed SDK package.
 // Its direct owned subprocess has no config registration and no mutation tools.
 const diagnostic={command:process.execPath,args:[runtime.entrypoint,'--surface','codex'],env:{AGDF_MCP_COMMAND_GROUPS:'',AGDF_DISPATCH_PLUGIN_ROOT:plugin}};
 for(let wave=0;wave<10;wave++)await Promise.all([
   withStdioClient(options,async c=>{await call(c,'diagnostic');}),
   withStdioClient(diagnostic,async c=>{const tools=await c.listTools();assert.deepEqual(tools.tools.map(t=>t.name),['agdf_dispatch','agdf_inspect']);await call(c,'diagnostic');})
 ]);
 const workerModule=await import(pathToFileURL(join(runtime.packageRoot,'src/worker.js')));
 const worker=workerModule.createWorkerDispatchExecutor({surface:'codex',expectedVersion:runtime.version,onEvent:event=>timings.push(event)});
 for(let n=0;n<3;n++){const result=await worker.execute(inspect,{toolName:'agdf_inspect'});assert.equal(result.outcome,'inspect_result');}
 await worker.close();
 const p95=values=>[...values].sort((a,b)=>a-b)[Math.ceil(values.length*.95)-1];
 report.metrics=Object.fromEntries(Object.entries(samples).map(([lane,values])=>[lane,{count:values.length,p95_ms:p95(values),max_ms:Math.max(...values)}]));
 report.status='pass';for(const [lane,m]of Object.entries(report.metrics)){if(m.p95_ms>5000||m.max_ms>10000)throw Error('fixed installed bound failed:'+lane+JSON.stringify(m));}
}catch(error){report.status='fail';report.failure=String(error.message).slice(0,1600);throw error;}
finally{writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,metrics:report.metrics,producer:original}));}
