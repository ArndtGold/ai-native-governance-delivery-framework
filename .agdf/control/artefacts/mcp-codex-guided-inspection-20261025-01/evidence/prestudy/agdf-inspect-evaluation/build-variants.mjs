import{readFileSync,writeFileSync}from'node:fs';
import{CONTROL_INSPECT_FUNCTION_DEFINITION as original,inspectContractHelp,BOUND_INSPECT_OPERATIONS,PRESENTATION_OPERATIONS,PRESENTATION_CATALOG_MODULE}from'/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/core/lib/control-inspect/contract.js';
import{ALL_ACTIVE_OPERATIONS}from'/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/core/lib/control-inspect/selection.js';
import{ARTIFACT_READINESS_GATES}from'/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/core/lib/control-inspect/artifact-readiness.js';
const out='/private/tmp/agdf-inspect-evaluation';const help=inspectContractHelp();const props=original.inputSchema.properties;const shared={target_source:'t',primary_target:'p',run_id:'r',expected_revision_id:'i'};const defs=Object.fromEntries(Object.entries(shared).map(([key,id])=>[id,key==='expected_revision_id'?{type:'string',pattern:'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',description:props[key].description}:props[key]]));
const groups=new Map();
for(const op of props.operation.enum){
 const fields=Object.fromEntries(Object.entries(props).filter(([k])=>!['operation','presentation_language','working_directory'].includes(k)&&help.parameters[k].operations.includes(op)).map(([k,v])=>[k,shared[k]?{$ref:'#/$defs/'+shared[k]}:structuredClone(v)]));
 if(fields.all_active&&!ALL_ACTIVE_OPERATIONS.has?.(op)&&!Array.from(ALL_ACTIVE_OPERATIONS).includes(op))fields.all_active={const:false};
 if(fields.presentation_id)fields.presentation_id={...defs.i};
 if(op==='artifact-readiness')fields.gate={...fields.gate,enum:[...ARTIFACT_READINESS_GATES]};
 const required=help.operations[op].required.filter(k=>!['operation','presentation_language','working_directory'].includes(k));
 const key=JSON.stringify({fields,required});if(!groups.has(key))groups.set(key,{operations:[],fields,required});groups.get(key).operations.push(op);
}
const branches=[...groups.values()].map(g=>({type:'object',properties:{operation:{enum:g.operations},...g.fields},required:['operation',...g.required]}));
const schema={type:'object',required:[...original.inputSchema.required],$defs:defs,dependentRequired:original.inputSchema.dependentRequired,dependentSchemas:{cursor:original.inputSchema.dependentSchemas.cursor},unevaluatedProperties:false,allOf:[{type:'object',properties:{presentation_language:props.presentation_language,working_directory:props.working_directory},required:['presentation_language','working_directory']},{oneOf:branches}]};
const tool={...original,inputSchema:schema};writeFileSync(out+'/typed.json',JSON.stringify(tool,null,2)+'\n');writeFileSync(out+'/baseline.json',JSON.stringify(original,null,2)+'\n');console.log(JSON.stringify({branches:branches.length,bytes:Buffer.byteLength(JSON.stringify(tool)),input_bytes:Buffer.byteLength(JSON.stringify(schema)),output_bytes:Buffer.byteLength(JSON.stringify(tool.outputSchema))}));
