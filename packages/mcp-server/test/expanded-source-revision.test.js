import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createOwnedRuntimeFixture} from './owned-runtime.js';
import {withStdioClient} from './helpers.js';
import {createExpandedSourceRevisionFixture,SOURCE_PHASE_MATRIX} from '../../cli/scripts/fixtures/expanded-source-revision.js';
import {readSourceRevisions} from '../../core/lib/control-state/run-source-revisions.js';
import {validateRevisionHistory} from '../../core/lib/control-state/run-revision-history.js';
import {runSealState} from '../../core/lib/control-state/run-seal.js';

const runtime=createOwnedRuntimeFixture(),root=runtime.governanceTarget,seeds=mkdtempSync(join(tmpdir(),'agdf-mcp-expanded-seeds-'));
try {
  const cli=join(runtime.dispatcherRoot,'bin/create-agdf.js'),fixture=createExpandedSourceRevisionFixture(root,cli,seeds);
  const {f,restore,prepare,state}=fixture;let cells=0;
  await withStdioClient(runtime,async client=>{
    const call=async input=>{const result=await client.callTool({name:'agdf_revise',arguments:input});assert.ok(result.structuredContent,JSON.stringify(result));return result.structuredContent;};
    for(const [gate,phases] of Object.entries(SOURCE_PHASE_MATRIX))for(const phase of phases){
      restore(phase);const {input}=prepare(gate),before=readFileSync(f.state,'utf8');
      const commandPath=join(root,f.prefix+'cli-command-'+randomUUID()+'.json');writeFileSync(commandPath,JSON.stringify(input));
      const cliPreview=JSON.parse(execFileSync(process.execPath,[cli,'agdf-revise','--command-file',commandPath],{encoding:'utf8'}));
      const preview=await call(input);assert.equal(preview.outcome,'accepted',JSON.stringify({gate,phase,preview}));
      assert.equal(cliPreview.outcome,'accepted',JSON.stringify(cliPreview));assert.deepEqual(cliPreview.family_result,preview.family_result);
      assert.equal(readFileSync(f.state,'utf8'),before,'Both adapters keep preview read-only');
      const applied={...input,command:{kind:'source_revision.apply',payload:{...input.command.payload,
        preview_digest:preview.family_result.preview_digest,confirmation:preview.family_result.confirmation_selector}}};
      const result=await call(applied);assert.equal(result.outcome,'accepted',JSON.stringify({gate,phase,result}));
      const receipt=readSourceRevisions(state().content).receipts.at(-1);
      assert.equal(receipt.schema_version,'3');assert.equal(receipt.initiating_phase,phase);assert.equal(validateRevisionHistory(root,receipt),true);
      assert.equal(runSealState(root,state().content).status,'valid');assert.equal(state().approvals.get('QA').status,'missing');assert.equal(state().approvals.get('UAT').status,'missing');
      writeFileSync(commandPath,JSON.stringify(applied));
      const replay=JSON.parse(execFileSync(process.execPath,[cli,'agdf-revise','--command-file',commandPath],{encoding:'utf8'}));
      assert.equal(replay.outcome,'already_applied');assert.equal((await call(applied)).outcome,'already_applied');
      assert.equal(readSourceRevisions(state().content).receipts.length,1);
      cells++;
    }
  });
  assert.equal(cells,18);console.log('SCN-069/074: all 18 source/phase cells passed through actual generated CLI command adapter and owned STDIO MCP: identical read-only preview, canonical receipt/history, QA withdrawal and cross-adapter replay. Synthetic disposable decisions only; no native host proof.');
} finally {rmSync(seeds,{recursive:true,force:true});runtime.dispose();}
