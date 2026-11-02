import {cpSync,mkdtempSync,rmSync,writeFileSync,readFileSync,realpathSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {inspectMcpServerPackage,acquireMcpExecutableClaim} from '/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-a90b74966806/runtime/create-agdf/lib/mcp-lifecycle/package.js';
const original='/Users/arndtgold/Library/Application Support/agdf/mcp/codex-plugin/mcp/generations/632ba9e56ced0a9d0603d9c91d2d9a22dc0ddfbba4c90988299918baed51ad85/0.14.5';
const temporary=realpathSync(mkdtempSync(join(tmpdir(),'agdf-tp-claim-baseline-')));
const output=process.argv[2];let report;
try {
 const before=inspectMcpServerPackage({dataRoot:original.slice(0,-7),expectedVersion:'0.14.5'});
 if(before.status!=='matched')throw Error('installed baseline not matched');
 cpSync(original,join(temporary,'0.14.5'),{recursive:true,filter:source=>!source.includes('/.agdf-executable-claims')});
 const runtime=inspectMcpServerPackage({dataRoot:temporary,expectedVersion:'0.14.5'});
 if(runtime.status!=='matched'||runtime.digest!==before.digest||runtime.dispatcherDigest!==before.dispatcherDigest||runtime.sdkDigest!==before.sdkDigest)throw Error('copied baseline mismatch');
 const samples=[];
 for(let index=0;index<20;index++){
  const started=performance.now();
  const claim=acquireMcpExecutableClaim(runtime,{generation:index+1});
  if(!claim.token)throw Error('missing real claim');
  samples.push(performance.now()-started);
 }
 const sorted=[...samples].sort((a,b)=>a-b),maximum=sorted.at(-1);
 report={schema_version:'1',purpose:'pre-implementation claim-wait planning',lane:'actual installed function; verified full runtime copy; owned disposable directory',node:process.version,platform:process.platform+'-'+process.arch,original,original_status:before.status,server_digest:before.digest,dispatcher_digest:before.dispatcherDigest,sdk_digest:before.sdkDigest,sample_count:20,claim_elapsed_upper_bound_ms:samples,p95_ms:sorted[18],max_ms:maximum,measurement:'Uncontended complete call includes acquisition, fsync and release, so upper-bounds that claim critical-section hold; not publication/network hold or native host time',claim_wait_ceiling_proposal_ms:Math.ceil((3*maximum+150)/150)*150,policy:'Three measured max holds (existing 3 generation slots) plus one existing 150ms polling interval, rounded to 150ms; remaining 30000ms publication budget still caps it',synthetic_preparation:false,configured_host_launched:false,product_mutated:false,cleanup:'pending'};
}finally{rmSync(temporary,{recursive:true,force:true});if(report){report.cleanup='only owned disposable copied runtime removed';writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));}}
