import assert from 'node:assert/strict';
import {resolve} from 'node:path';
const argument=name=>{const i=process.argv.indexOf(name);if(i<0||!process.argv[i+1])throw Error('Missing '+name);return resolve(process.argv[i+1]);};
const root=argument('--candidate'),evidence=argument('--evidence'),out=evidence+'/checks';
const{parseControlInspectFunctionArguments:parseB,normalizeControlInspectInput:normalizeB}=await import(root+'/packages/core/lib/control-inspect/contract.js');
const{interactionLocales}=await import(root+'/packages/cli/lib/cli/runtime-context.js');
const trusted={surface:'codex',expectedVersion:'0.20.1',interactionLocales};let coreCases=0;const evaluate=(parse,normalize,v)=>{try{return{ok:true,value:normalize(parse(v,trusted))};}catch(e){return{ok:false,name:e.name,field:e.field,message:e.message};}};
import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire}from'node:module';
const require=createRequire(root+'/packages/mcp-server/package.json');
const {AjvJsonSchemaValidator}=require('@modelcontextprotocol/server/validators/ajv');
const baseline=JSON.parse(readFileSync(evidence+'/baseline/baseline.json'));
const {CONTROL_INSPECT_FUNCTION_DEFINITION:candidate}=await import(root+'/packages/core/lib/control-inspect/contract.js');writeFileSync(out+'/candidate-definition.json',JSON.stringify(candidate,null,2)+'\n');const expectations=JSON.parse(readFileSync(evidence+'/baseline/core-expectations.json'));
const provider=new AjvJsonSchemaValidator();const a=provider.getValidator(baseline.inputSchema),b=provider.getValidator(candidate.inputSchema);
const seed={operation:'gate-check',presentation_language:'de',working_directory:'/workspace/project',target_source:'explicit_target',primary_target:'/workspace/project',run_id:'demo-run-01',gate:'UR',expected_revision_id:'00000000-0000-4000-8000-000000000001',presentation_id:'00000000-0000-4000-8000-000000000002',target_id:'sha256:'+'a'.repeat(64),cursor:'a'.repeat(64)+':0',variant:'status-card',module:'agdf_prepare/presentation.prepare',all_active:false};
const keys=Object.keys(seed),operations=baseline.inputSchema.properties.operation.enum;let checked=0,accepted=0;const differences=[];
function check(v,label){const x=a(v).valid,y=b(v).valid;checked++;if(x){accepted++;coreCases++;const expected=expectations[coreCases-1];assert.equal(expected.label,label);assert.deepEqual(expected.input,v);const actual=evaluate(parseB,normalizeB,v);assert.deepEqual(JSON.parse(JSON.stringify(actual)),expected.value,label);assert.deepEqual(Object.keys(actual.value??{}),expected.keys,label);}if(x!==y)differences.push({label,original:x,candidate:y,input:v});}
for(const operation of [...operations,'help','catalog','presentation','']){
 for(let mask=0;mask<2**keys.length;mask++){
  const row=Object.fromEntries(keys.flatMap((k,i)=>mask&(1<<i)?[[k,k==='operation'?operation:seed[k]]]:[]));
  check(row,operation+':presence:'+mask);
 }
}
for(const operation of operations){
 const minimum={operation,presentation_language:'de',working_directory:'/workspace/project'};
 if(['artifact-readiness','operation-contract','operation-status','native-qualification','presentation-document','presentation-preview','runtime-generations'].includes(operation))Object.assign(minimum,{run_id:seed.run_id,expected_revision_id:seed.expected_revision_id,target_source:seed.target_source,primary_target:seed.primary_target});
 if(['contract','operation-contract','operation-status'].includes(operation))minimum.module=seed.module;
 if(operation==='artifact-readiness')minimum.gate='UR';
 if(['presentation-document','presentation-preview'].includes(operation))Object.assign(minimum,{gate:'UR',presentation_id:seed.presentation_id,target_id:seed.target_id});
 for(const key of keys)for(const value of [null,false,true,0,'',{},[],seed[key]])check({...minimum,[key]:value},operation+':mutate:'+key);
 check({...minimum,unexpected:true},operation+':unknown');
}
const report={classification:'offline_schema_acceptance_parity',definition_bytes:{baseline:Buffer.byteLength(JSON.stringify(baseline)),candidate:Buffer.byteLength(JSON.stringify(candidate))},cases:checked,core_translation_cases:coreCases,accepted,rejected:checked-accepted,differences: differences.length,examples:differences.slice(0,3),model_invocations:0,candidate_bound:true};writeFileSync(out+'/schema-parity.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(differences.length)process.exitCode=1;

assert.equal(checked,247003);assert.equal(coreCases,160);await import('./replay-contract-checks.mjs');
