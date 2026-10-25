import{readFileSync,writeFileSync}from'node:fs';import{createRequire}from'node:module';
import {resolve} from 'node:path';
const argument=name=>{const i=process.argv.indexOf(name);if(i<0||!process.argv[i+1])throw Error('Missing '+name);return resolve(process.argv[i+1]);};
const root=argument('--candidate'),evidence=argument('--evidence'),out=evidence+'/checks';
const{parseCodexCommandTrace}=await import(root+'/evals/mcp-ergonomics/lib/native-run.js');
const req=createRequire(root+'/packages/mcp-server/package.json');const{AjvJsonSchemaValidator}=req('@modelcontextprotocol/server/validators/ajv');const p=new AjvJsonSchemaValidator();
const a=p.getValidator(JSON.parse(readFileSync(evidence+'/baseline/baseline.json')).inputSchema),b=p.getValidator(JSON.parse(readFileSync(out+'/candidate-definition.json')).inputSchema);
const rows=[];for(const rep of ['repetition-01','repetition-02']){
 const base=evidence+'/prestudy/c2-native/'+rep;
 const parsed=parseCodexCommandTrace(readFileSync(base+'/events.jsonl','utf8'),[readFileSync(base+'/rollouts.jsonl','utf8')]);
 for(const[i,c]of parsed.calls.entries())if(c.name.endsWith('agdf_inspect')){
  const sdk_error=c.result.is_error&&c.result.text.startsWith('Input validation error:');const av=a(c.input??{}).valid,bv=b(c.input??{}).valid;
  if(av!==bv||sdk_error&&bv)throw Error('Acceptance mismatch: '+rep+' '+i);
  rows.push({repetition:rep,call:i+1,operation:c.input?.operation??null,module:c.input?.module??null,observed_sdk_error:sdk_error,baseline_accepted:av,candidate_accepted:bv});
 }
}
const result={classification:'offline_replay_of_retained_native_arguments',inspect_calls:rows.length,observed_sdk_errors:rows.filter(x=>x.observed_sdk_error).length,sdk_errors_still_rejected:rows.filter(x=>x.observed_sdk_error&&!x.candidate_accepted).length,acceptance_differences:0,rows,model_invocations:0};writeFileSync(out+'/replay.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,rows:undefined}));

if(rows.length!==24||rows.filter(x=>x.observed_sdk_error).length!==15)throw Error('Retained input inventory mismatch');
