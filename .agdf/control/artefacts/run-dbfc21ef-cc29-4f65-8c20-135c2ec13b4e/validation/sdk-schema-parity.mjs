import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const root='/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework';
const req=createRequire(root+'/packages/mcp-server/package.json');
const {AjvJsonSchemaValidator}=await import(pathToFileURL(req.resolve('@modelcontextprotocol/server/validators/ajv')));
const sdk=new AjvJsonSchemaValidator();
const before=JSON.parse(readFileSync('/private/tmp/agdf-schema-before-dbfc21ef.json'));
const {SKILL_DISPATCH_FUNCTION_DEFINITION:dispatch}=await import(pathToFileURL(root+'/packages/core/lib/skill-dispatch/contract.js'));
const {CONTROL_INSPECT_FUNCTION_DEFINITION:inspect}=await import(pathToFileURL(root+'/packages/core/lib/control-inspect/contract.js'));
const {RUN_COMMAND_GROUPS,commandGroupDefinition,commandGroupSchema}=await import(pathToFileURL(root+'/packages/core/lib/control-state/run-command-schema.js'));
const after=[dispatch,inspect,...Object.keys(RUN_COMMAND_GROUPS).map(commandGroupDefinition)];
const validators=new Map(after.map(d=>[d.name,[sdk.getValidator(before.find(x=>x.name===d.name).inputSchema),sdk.getValidator(d.inputSchema)]]));
const counts={},differences=[];
function check(name,args,label){const [a,b]=validators.get(name);const x=a(args).valid,y=b(args).valid;counts[name]=(counts[name]||0)+1;if(x!==y&&differences.length<5)differences.push({name,label,before:x,after:y});}
const uuid='00000000-0000-4000-8000-000000000001',hash='sha256:'+'a'.repeat(64);
const seed={presentation_language:'de',working_directory:'/repo',primary_target:'/repo',target_source:'explicit_target',run_id:'bounded-run',expected_revision_id:uuid,gate:'UR',module:'agdf_prepare/presentation.prepare',all_active:false,presentation_id:uuid,target_id:hash,cursor:'0'.repeat(64)+':0',variant:'status-card'};
for(const operation of inspect.inputSchema.properties.operation.enum){const keys=Object.keys(inspect.inputSchema.properties);for(let mask=0;mask<2**keys.length;mask++){const args={};for(let i=0;i<keys.length;i++)if(mask&(1<<i))args[keys[i]]=keys[i]==='operation'?operation:seed[keys[i]];check('agdf_inspect',args,'presence');}}
const ds={skill_id:'gate-check',...seed,intake:true,intake_mode:'resume',continue_delivery:true,ur_action:'revise',prd_action:'revise',sd_action:'revise',tp_action:'revise'};
for(const flags of [[false,false],[true,false],[false,true],[true,true]]){ds.intake=flags[0];ds.continue_delivery=flags[1];const keys=Object.keys(dispatch.inputSchema.properties);for(let mask=0;mask<2**keys.length;mask++){const args={};for(let i=0;i<keys.length;i++)if(mask&(1<<i))args[keys[i]]=ds[keys[i]];check('agdf_dispatch',args,'presence');}}
function samples(s){if(s.oneOf||s.anyOf)return (s.oneOf||s.anyOf).flatMap(samples);if('const'in s)return [s.const];if(s.enum)return [s.enum[0]];if(s.type==='object'){let rows=[{}];for(const key of s.required||[]){const values=samples(s.properties[key]);rows=rows.flatMap(r=>values.map(v=>({...r,[key]:v}))).slice(0,64);}return rows;}if(s.type==='array')return [Array.from({length:s.minItems??1},()=>samples(s.items)[0])];if(s.type==='integer')return [s.minimum??0];if(s.type==='boolean')return [true];if(s.pattern?.includes('sha256'))return [hash];if(s.pattern?.includes('[0-9a-f]{8}'))return [s.pattern==='^[0-9a-f]{8}$'?'abcdef01':uuid];return ['fixture'];}
const wrong=[null,false,0,'',{},[], 'x'.repeat(8193)];
function mutations(value){const out=[];if(!value||typeof value!=='object')return out;if(Array.isArray(value))return [[],[...value,...value]];for(const key of Object.keys(value)){const missing={...value};delete missing[key];out.push(missing);for(const v of wrong)out.push({...value,[key]:v});for(const v of mutations(value[key]))out.push({...value,[key]:v});}out.push({...value,injected:true});return out;}
for(const [name,kinds]of Object.entries(RUN_COMMAND_GROUPS)){const expanded=commandGroupSchema(name);for(const row of expanded.properties.command.oneOf){for(const payload of samples(row.properties.payload)){const args={schema_version:'1',presentation_language:'de',working_directory:'/repo',primary_target:'/repo',target_source:'explicit_target',target_id:hash,operation_id:uuid,assurance:'cooperative_local',command:{kind:row.properties.kind.const,payload}};if(expanded.properties.run_id){args.run_id='bounded-run';args.expected_revision_id=uuid;}check(name,args,'sample');for(const v of mutations(args))check(name,v,'mutation');for(const kind of kinds)check(name,{...args,command:{...args.command,kind}},'kind crossover');}}}
const help=JSON.parse(inspect.description.match(/\{[^\n]+\}/u)[0]);if(!validators.get('agdf_inspect')[1](help).valid)throw Error('help_example_invalid');
const evidence=root+'/.agdf/control/artefacts/run-dbfc21ef-cc29-4f65-8c20-135c2ec13b4e/evidence';mkdirSync(evidence,{recursive:true});
const report={classification:'SDK acceptance parity; no host execution or approval',cases:Object.values(counts).reduce((a,b)=>a+b,0),by_tool:counts,differences,help_example_valid:true,model_invocations:0,source_digests:Object.fromEntries(['packages/core/lib/skill-dispatch/contract.js','packages/core/lib/control-inspect/contract.js','packages/core/lib/control-state/run-command-schema.js'].map(f=>[f,createHash('sha256').update(readFileSync(root+'/'+f)).digest('hex')]))};
writeFileSync(evidence+'/schema-parity.json',JSON.stringify(report,null,2)+'\n');writeFileSync(evidence+'/schemas-before.json',JSON.stringify(before));writeFileSync(evidence+'/schemas-after.json',JSON.stringify(after));console.log(JSON.stringify(report));if(differences.length)process.exitCode=1;
