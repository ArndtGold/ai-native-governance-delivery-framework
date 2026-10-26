import{readFileSync,writeFileSync}from'node:fs';import{createRequire}from'node:module';
import{parseCodexCommandTrace}from'/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/evals/mcp-ergonomics/lib/native-run.js';
const root='/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework';const out='/private/tmp/agdf-inspect-evaluation';const req=createRequire(root+'/packages/mcp-server/package.json');const{AjvJsonSchemaValidator}=req('@modelcontextprotocol/server/validators/ajv');const p=new AjvJsonSchemaValidator();
const a=p.getValidator(JSON.parse(readFileSync(out+'/baseline.json')).inputSchema),b=p.getValidator(JSON.parse(readFileSync(out+'/guided.json')).inputSchema);
const rows=[];for(const rep of ['repetition-01','repetition-02']){
 const base=root+'/.agdf/control/artefacts/mcp-contract-completeness-20261025-01/evidence/c2-native/'+rep;
 const parsed=parseCodexCommandTrace(readFileSync(base+'/events.jsonl','utf8'),[readFileSync(base+'/rollouts.jsonl','utf8')]);
 for(const[i,c]of parsed.calls.entries())if(c.name.endsWith('agdf_inspect')){
  const sdk_error=c.result.is_error&&c.result.text.startsWith('Input validation error:');const av=a(c.input??{}).valid,bv=b(c.input??{}).valid;
  if(av!==bv||sdk_error&&bv)throw Error('Acceptance mismatch: '+rep+' '+i);
  rows.push({repetition:rep,call:i+1,operation:c.input?.operation??null,module:c.input?.module??null,observed_sdk_error:sdk_error,baseline_accepted:av,candidate_accepted:bv});
 }
}
const result={classification:'offline_replay_of_retained_native_arguments',inspect_calls:rows.length,observed_sdk_errors:rows.filter(x=>x.observed_sdk_error).length,sdk_errors_still_rejected:rows.filter(x=>x.observed_sdk_error&&!x.candidate_accepted).length,acceptance_differences:0,rows,model_invocations:0};writeFileSync(out+'/replay.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,rows:undefined}));
