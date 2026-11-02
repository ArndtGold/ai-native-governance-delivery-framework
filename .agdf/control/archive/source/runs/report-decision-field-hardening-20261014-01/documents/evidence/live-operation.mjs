// Call the configured installed MCP entrypoint for this exact live Run only.
// The request is prepared separately; this transport adds no decision authority.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { withStdioClient } from '../../../../../packages/mcp-server/test/helpers.js';
const root='/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework';
const run='report-decision-field-hardening-20261014-01';
const evidence=join(root,'.agdf/control/artefacts',run,'evidence');
const path=resolve(process.argv[2]);assert.equal(dirname(path),evidence);
const {name,input}=JSON.parse(readFileSync(path,'utf8'));
assert.ok(['agdf_dispatch','agdf_inspect','agdf_record','agdf_prepare','agdf_approve','agdf_closeout'].includes(name));
assert.equal(input.primary_target,root);assert.equal(input.working_directory,root);assert.equal(input.run_id,run);
assert.equal(input.target_source,'continued_target');
const plugin='/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf';
const config=JSON.parse(readFileSync(plugin+'/mcp.json','utf8')).mcpServers.agdf;
await withStdioClient({command:process.execPath,args:config.args,cwd:root,modern:true},async client=>{
  const response=await client.callTool({name,arguments:input});assert.ok(response.structuredContent,JSON.stringify(response));
  writeFileSync(path.replace(/\.json$/u,'.result.json'),JSON.stringify(response.structuredContent,null,2)+'\n');
  appendFileSync(join(evidence,'live-stdio.jsonl'),JSON.stringify({name,input,response})+'\n');
  const value=response.structuredContent;
  console.log(JSON.stringify({outcome:value.outcome,reason:value.reason,terminal:value.terminal,
    current:value.current,control:value.control,continuation:value.continuation && {...value.continuation,
      runtime_contracts:value.continuation.runtime_contracts?.map(({module,sha256})=>({module,sha256}))},
    family_result:value.family_result,runtime:value.runtime,host_action:value.host_action}));
});
