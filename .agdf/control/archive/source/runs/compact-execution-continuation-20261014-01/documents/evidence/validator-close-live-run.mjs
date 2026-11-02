import assert from 'node:assert/strict';
import { readFileSync, appendFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { withStdioClient } from '../../../../../packages/mcp-server/test/helpers.js';
const target='/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework';
const plugin='/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const directory=join(target,'.agdf/control/artefacts/compact-execution-continuation-20261014-01/evidence');
const proof=join(directory,'validator-live-closeout.jsonl');
const identity=JSON.parse(readFileSync(plugin+'/.agdf-installation.json','utf8'));
assert.equal(identity.codex_install_version,'0.14.5+codex.local-628d4e5b67b2');
const config=JSON.parse(readFileSync(plugin+'/mcp.json','utf8')).mcpServers.agdf;
appendFileSync(proof,JSON.stringify({kind:'installed_closeout_identity',identity})+'\n');
const binding={schema_version:'1',presentation_language:'de',working_directory:target,target_source:'continued_target',primary_target:target,
 target_id:'sha256:a5c1daee7886f81d27b2b7718718fa7a3822b27a4bc1d057f99af01be7688a19',run_id:'compact-execution-continuation-20261014-01',
 expected_revision_id:'85b5ff09-3458-486f-9bb3-b02e62435555',operation_id:'1a6b2101-23da-4cfa-85b3-2a53a4d7b625',assurance:'cooperative_local'};
const request={...binding,command:{kind:'closeout.record',payload:{or:{path:'.agdf/control/artefacts/compact-execution-continuation-20261014-01/OR_CANDIDATE.md',digest:'sha256:dc4c5e7376763d6cee41b1bd72b3b79daa100dcaffcff84ff2f0ef3f549262e8'},
 confirmation:'Close Run: compact-execution-continuation-20261014-01 85b5ff09-3458-486f-9bb3-b02e62435555 1a6b2101-23da-4cfa-85b3-2a53a4d7b625 sha256:dc4c5e7376763d6cee41b1bd72b3b79daa100dcaffcff84ff2f0ef3f549262e8'}}};
await withStdioClient({command:process.execPath,args:config.args,cwd:target,modern:true},async client=>{
 const call=async(name,args)=>{const result=await client.callTool({name,arguments:args});appendFileSync(proof,JSON.stringify({name,args,result})+'\n');assert.ok(result.structuredContent,JSON.stringify(result));return result.structuredContent;};
 const inspect={operation:'operation-contract',module:'agdf_closeout/closeout.record',presentation_language:'de',working_directory:target,target_source:'continued_target',primary_target:target,
 run_id:binding.run_id,expected_revision_id:binding.expected_revision_id};
 const contract=await call('agdf_inspect',inspect);assert.equal(contract.report.available,true);
 const result=await call('agdf_closeout',request);
 writeFileSync(join(directory,'validator-live-closeout-result.json'),JSON.stringify(result,null,2)+'\n');
 assert.equal(result.outcome,'accepted',JSON.stringify(result));assert.equal(result.current.lifecycle,'completed');assert.equal(result.current.completion.fulfilled,true);
 assert.equal(result.current.next_operation,null);
 const replay=await call('agdf_closeout',request);assert.equal(replay.outcome,'already_applied');assert.equal(replay.current.completion.fulfilled,true);
 const doctor=await call('agdf_inspect',{operation:'doctor',presentation_language:'de',working_directory:target,target_source:'continued_target',primary_target:target,run_id:binding.run_id});
 assert.equal(doctor.report.status,'pass',JSON.stringify(doctor.report));
 assert.equal(doctor.report.findings.some(f=>['AGDF_BACKLOG_STATUS_UNKNOWN','AGDF_BACKLOG_ARTEFACT_LABEL_UNKNOWN'].includes(f.code)),false);
 writeFileSync(join(directory,'validator-live-doctor.json'),JSON.stringify(doctor,null,2)+'\n');
 console.log(JSON.stringify({outcome:result.outcome,current:result.current,replay:replay.outcome,doctor:doctor.report.status,identity}));
});
