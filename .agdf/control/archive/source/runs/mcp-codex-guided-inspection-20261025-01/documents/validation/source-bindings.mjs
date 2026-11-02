import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, realpathSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';
const root='/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework';
const run=join(root,'.agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01');
const candidate=JSON.parse(readFileSync(join(run,'evidence/baseline/candidate.json'))).candidate;
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const files=['packages/core/lib/control-inspect/contract.js','packages/core/lib/control-inspect/service.js','packages/cli/scripts/control-inspect-test.js','packages/mcp-server/test/protocol.test.js'];
const source={};for(const path of files){assert.equal(hash(join(root,path)),hash(join(candidate,path)),path);source[path]=hash(join(candidate,path));}
const req=createRequire(join(candidate,'packages/cli/package.json'));
const loaded=req.resolve('#agdf-core/control-inspect/contract.js');
assert.equal(realpathSync(loaded),join(candidate,'packages/core/lib/control-inspect/contract.js'));
const assembly={};for(const name of ['contract.js','service.js']){
 const file=join(candidate,'dist/npm/create-agdf/runtime/core/lib/control-inspect',name);
 assert.equal(hash(file),source[`packages/core/lib/control-inspect/${name}`]);assembly[file]=hash(file);
}
const sdkRoot=join(candidate,'packages/mcp-server');
const {digestMcpSdkRuntime}=await import(join(candidate,'packages/core/lib/runtime/plugin-provenance.js'));
const sdk={};for(const name of ['@modelcontextprotocol/server','@modelcontextprotocol/client']){
 const file=join(sdkRoot,'node_modules',name,'package.json');const pkg=JSON.parse(readFileSync(file));assert.equal(pkg.version,'2.0.0');sdk[name]={version:pkg.version,manifest_sha256:hash(file)};
}
const invariant={};for(const path of ['scripts/native-probes/codex-host-e2e.mjs','evals/mcp-ergonomics/lib/native-run.js','evals/mcp-ergonomics/lib/native-tasks.js','packages/mcp-server/test/performance.test.js','plugins/agdf/meta/copilot-payload-baseline.json','package-lock.json','packages/mcp-server/package-lock.json','packages/control-ui/package-lock.json']){
 assert.equal(hash(join(root,path)),hash(join(candidate,path)),path);invariant[path]=hash(join(candidate,path));
}
const ui={};for(const name of ['manifest.json','decision-manifest.json','cockpit.html','decision.html']){const file=join(candidate,'packages/control-ui/dist-mcp',name);ui[file]=hash(file);}
const output=join(run,'evidence/build');mkdirSync(output,{recursive:true});
writeFileSync(join(output,'source-bindings.json'),JSON.stringify({head:JSON.parse(readFileSync(join(run,'evidence/baseline/candidate.json'))).head,candidate,source,loaded_core:loaded,assembly,sdk,sdk_runtime_digest:digestMcpSdkRuntime(sdkRoot),invariants:invariant,ui,qualification:'candidate_source_and_assembled_Core_match',model_invocations:0},null,2)+'\n');
const {createProtocolRuntime,withAgdfClient}=await import(join(candidate,'evals/mcp-ergonomics/lib/protocol-harness.js'));
const runtime=createProtocolRuntime();
try{await withAgdfClient(runtime,{},async client=>{
 const {tools}=await client.listTools();const rows=tools.map(tool=>({name:tool.name,bytes:Buffer.byteLength(JSON.stringify(tool)),sha256:createHash('sha256').update(JSON.stringify(tool)).digest('hex')}));
 const commands=rows.filter(tool=>!['agdf_dispatch','agdf_inspect'].includes(tool.name));const aggregate=commands.reduce((sum,row)=>sum+row.bytes,0);
 assert.equal(rows.find(row=>row.name==='agdf_inspect').bytes,4992);assert(commands.every(row=>row.bytes<=8192));assert(aggregate<=24576);
 const {createMcpDispatchRuntime,createMcpDecisionRuntime}=await import(join(candidate,'packages/cli/lib/mcp-dispatch-runtime.js'));
 const decision=await createMcpDecisionRuntime({runtime:createMcpDispatchRuntime({surface:'codex'}),ui:JSON.parse(readFileSync(join(candidate,'packages/control-ui/dist-mcp/decision-manifest.json')))});
 const decisionRows=decision.tools.filter(tool=>commands.some(row=>row.name===tool.name)||tool.name==='agdf_decision_action').map(tool=>({name:tool.name,bytes:Buffer.byteLength(JSON.stringify(tool.definition))}));
 const decisionAggregate=decisionRows.reduce((sum,row)=>sum+row.bytes,0);assert(decisionAggregate<=24576);await decision.close();
 const inventory=JSON.parse(readFileSync(join(candidate,'packages/cli/generated/plugins/copilot/agdf/.agdf-payload-inventory.json')));
 assert(inventory.stats.files<=397&&inventory.stats.bytes<=3509461);
 writeFileSync(join(run,'evidence/checks/budget.json'),JSON.stringify({tools:rows,command_aggregate_bytes:aggregate,decision_definitions:decisionRows,command_and_decision_bytes:decisionAggregate,limits:{inspect_definition:5000,each_command:8192,command_aggregate:24576,input:65536,output:1048576,copilot_files:397,copilot_bytes:3509461},copilot:inventory.stats,normal_build_profile_enforces_budget:true,model_invocations:0},null,2)+'\n');
});}finally{runtime.dispose();}
console.log(JSON.stringify({source_files:files.length,core_resolution:loaded,assembly_matches:true,model_invocations:0}));
