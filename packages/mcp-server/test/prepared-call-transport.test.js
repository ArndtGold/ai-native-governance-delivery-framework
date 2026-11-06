import assert from 'node:assert/strict';
import { AjvJsonSchemaValidator } from '@modelcontextprotocol/server/validators/ajv';
import { commandGroupDefinition, RUN_COMMAND_GROUPS, RUN_COMMAND_LIMITS, validateRunCommand } from '../../core/lib/control-state/run-command-schema.js';
import { decisionActionDefinition, DECISION_VIEW_DEFINITION } from '../../core/lib/control-state/decision-action-contract.js';
import { CONTROL_INSPECT_FUNCTION_DEFINITION, CONTROL_INSPECT_MAX_DEFINITION_BYTES } from '../../core/lib/control-inspect/contract.js';
import { preparedTransportSchema, createPreparedCallTransport } from '../src/prepared-call-transport.js';
let time = 0;
const registry = createPreparedCallTransport({ now: () => time, maxEntries: 2, lifetimeMs: 10 });
const call = { tool: 'agdf_record', arguments: { target_id: 'immutable', run_id: 'run-fixed', expected_revision_id: 'revision-fixed', operation_id: '00000000-0000-4000-8000-000000000001', command: { kind: 'material.stage', payload: { action: 'put', files: [{ slot: 'UR' }] } } } };
const original = { material_call: { call, required_inputs: ['/command/payload/files/0/content'] } };
const decorated = registry.decorate(original), form = decorated.material_call;
assert.equal(original.material_call.submit, undefined);
assert.equal(form.submit, undefined);
assert.deepEqual(Object.keys(form.call.arguments).sort(), ['inputs', 'prepared_call_id']);
assert.deepEqual(form.recovery_only.original_call, call);
assert.equal(form.recovery_only.authorizes, false);
assert.equal(form.operation.operation_id, call.arguments.operation_id);
assert.match(form.instruction, /call\.tool with call\.arguments/u);
assert.match(form.instruction, /call\.arguments\.inputs/u);
assert.match(form.instruction, /host-supported serialization/u);
assert.match(form.instruction, /Check failure before reading/u);
assert.ok(!form.instruction.includes('undefined'));
assert.deepEqual(form.required_inputs, ['content']);
assert.deepEqual(form.input_fields, [{name: 'content', required: true}]);
assert.deepEqual(form.recovery_only.required_inputs, ['/command/payload/files/0/content']);
assert.deepEqual(form.recovery_only.input_fields, [{name:'content',pointer:'/command/payload/files/0/content'}]);
assert.deepEqual(form.call.arguments.inputs, {}, 'Named author fields are never prefilled.');
assert.equal(registry.isAvailable(form.call),true,'An unfilled offered form is available, not an attested or approved command.');
assert.equal(registry.isAvailable({...form.call,tool:'agdf_approve'}),false);
assert.equal(registry.isAvailable({tool:'agdf_record',arguments:{...form.call.arguments,target_id:'another'}}),false);
assert.equal(registry.isAvailable(form.recovery_only.original_call),false,'Raw recovery is not a registered normal reference.');
const filled = { ...form.call.arguments, inputs: { content: 'Exact authored 😀 bytes' } };
const actual = registry.resolve('agdf_record', filled);
assert.equal(actual.command.payload.files[0].content, 'Exact authored 😀 bytes');
assert.equal(actual.target_id, call.arguments.target_id);
assert.deepEqual(registry.resolve('agdf_record', filled), actual, 'Identical retries reconstruct the identical original command/UUID.');
assert.throws(() => registry.resolve('agdf_approve', filled), /command_schema_invalid/);
for (const inputs of [{}, { '/target_id': 'changed' }, { ...filled.inputs, '/command/payload/files/0/slot': 'TP' }])
  assert.throws(() => registry.resolve('agdf_record', { ...filled, inputs }), /command_schema_invalid/);
assert.throws(() => registry.resolve('agdf_record', { ...filled, run_id: 'another' }), /command_schema_invalid/);
assert.equal(registry.decorate(original).material_call.call.arguments.prepared_call_id, form.call.arguments.prepared_call_id);
assert.equal(registry.decorate({ material_call: { ...original.material_call, required_inputs: ['/command/payload/__proto__/bad'] } }).material_call.call, null);
time = 10;
assert.equal(registry.isAvailable(form.call),false,'A cached form must not be offered after its registered reference expires.');
assert.throws(() => registry.resolve('agdf_record', filled), /session_expired/);
const next = registry.decorate(original).material_call.call;
assert.notEqual(next.arguments.prepared_call_id, form.call.arguments.prepared_call_id);
registry.close();assert.throws(() => registry.resolve('agdf_record', next.arguments), /command_schema_invalid/);
console.log('Prepared transport immutable binding, exact replay, group/input isolation, expiry and close passed.');

const groups = Object.keys(RUN_COMMAND_GROUPS);
const publishedBytes = groups.reduce((sum, name) => {
  const definition = commandGroupDefinition(name);
  const bytes = Buffer.byteLength(JSON.stringify({ ...definition, inputSchema: preparedTransportSchema(name, definition.inputSchema) }));
  assert.ok(bytes <= (RUN_COMMAND_LIMITS.definition_bytes_by_group[name] ?? RUN_COMMAND_LIMITS.definition_bytes));
  return sum + bytes;
}, 0) + [decisionActionDefinition(groups), DECISION_VIEW_DEFINITION].reduce((sum, value) => sum + Buffer.byteLength(JSON.stringify(value)), 0);
assert.ok(publishedBytes <= RUN_COMMAND_LIMITS.aggregate_definition_bytes, String(publishedBytes));

const originalReadSchema={type:'object',properties:{operation:{type:'string'}}};
assert.equal(preparedTransportSchema('agdf_dispatch',originalReadSchema),originalReadSchema,'Dispatch never gains a read-only reference path.');
assert.notEqual(preparedTransportSchema('agdf_inspect',originalReadSchema),originalReadSchema);
assert.deepEqual(createPreparedCallTransport().decorate({next_calls:[{tool:'agdf_inspect',arguments:{operation:'gate-check'}}]}).next_calls,[],
  'A read template cannot be registered without the owning canonical validator.');
const hints=createPreparedCallTransport();const f=hints.decorate(original).material_call;
assert.match(hints.validationHint('agdf_record',{...f.call.arguments,target_id:'immutable'}),/Normal call arguments/u);
assert.match(hints.validationHint('agdf_record',{...f.call.arguments,target_id:'another'}),/fixed fields conflict/u);
assert.match(hints.validationHint('agdf_approve',f.call.arguments),/cannot cross permission groups/u);
assert.match(hints.validationHint('agdf_inspect',f.call.arguments),/cannot cross permission groups/u);

// Native authoring mistakes must remain rejected by the real published schema,
// while the hint identifies the exact copy/fill boundary without inventing IDs.
const rawArguments = {
  target_source: 'current_repository', primary_target: '/tmp/native-prepared-test', target_id: 'sha256:' + '0'.repeat(64),
  operation_id: '00000000-0000-4000-8000-000000000001', run_id: 'run-fixed', expected_revision_id: '00000000-0000-4000-8000-000000000002',
  command: { kind: 'material.stage', payload: { action: 'put', files: [{ slot: 'UR' }] } },
};
const canonical = createPreparedCallTransport();
const offered = canonical.decorate({ material_call: { call: { tool: 'agdf_record', arguments: rawArguments },
  required_inputs: ['/command/payload/files/0/content'] } }).material_call;
const inputs = { content: 'Exact Markdown `done <id>` and 😀 text' };
const validate = new AjvJsonSchemaValidator().getValidator(preparedTransportSchema('agdf_record', commandGroupDefinition('agdf_record').inputSchema));
const missingReference = JSON.parse(JSON.stringify({ prepared_call_id: offered.call.prepared_call_id, inputs }));
assert.deepEqual(missingReference, { inputs }, 'The observed wrong-path extraction serializes to inputs only.');
for (const [label, malformed] of [
  ['raw plus inputs', { ...rawArguments, inputs }],
  ['inputs without reference', missingReference],
  ['prepared plus duplicated raw fields', { ...rawArguments, ...offered.call.arguments, inputs }],
]) {
  assert.equal(validate(malformed).valid, false, label);
  const hint = canonical.validationHint('agdf_record', malformed);
  assert.match(hint, /Normal call arguments/u, label);
  assert.ok(hint.length <= 768, label);
  if (!Object.hasOwn(malformed, 'prepared_call_id')) {
    assert.match(hint, /call\.arguments/u, label);
    assert.match(hint, /No operation was dispatched/u, label);
    assert.ok(!hint.includes(offered.call.arguments.prepared_call_id), 'Missing references are never guessed from the registry.');
  }
}
const preparedArguments = { ...offered.call.arguments, inputs };
assert.equal(validate(preparedArguments).valid, true);
const reconstructed = canonical.resolve('agdf_record', preparedArguments);
assert.deepEqual(canonical.resolve('agdf_record', { ...preparedArguments, inputs: {'/command/payload/files/0/content': inputs.content} }), reconstructed, 'Complete legacy pointers reconstruct exactly the same canonical request.');
assert.throws(() => canonical.resolve('agdf_record', { ...preparedArguments, inputs: { ...inputs, '/command/payload/files/0/content': inputs.content } }), /command_schema_invalid/, 'Named and legacy inputs cannot be mixed.');
assert.equal(validate(reconstructed).valid, true, 'The exact bound raw command still satisfies the original published schema.');
assert.deepEqual(reconstructed, { ...rawArguments, command: { kind: 'material.stage', payload: { action: 'put', files: [{ slot: 'UR', content: inputs.content }] } } });
assert.deepEqual(canonical.resolve('agdf_record', reconstructed), reconstructed, 'Raw fallback retains its original binding and UUID.');
assert.equal(canonical.validationHint('agdf_record', rawArguments), '', 'Ordinary raw diagnostics remain owned by the command contract.');
assert.equal(canonical.validationHint('agdf_dispatch', missingReference), '', 'Read-only groups never gain a prepared submission path.');
// The normal path never offers a competing executable raw envelope. Recovery
// remains self-contained so it survives a reconnect and preserves the original UUID.
const rawRecovery = canonical.decorate({ material_call: { call: { tool: 'agdf_record', arguments: rawArguments },
  required_inputs: ['/command/payload/files/0/content'] } }).material_call.recovery_only;
assert.deepEqual(rawRecovery.original_call.arguments, rawArguments);
rawRecovery.original_call.arguments.target_id = 'changed outside registry';
rawRecovery.required_inputs.push('/command/payload/files/0/slot');
assert.deepEqual(canonical.resolve('agdf_record', preparedArguments), reconstructed);
const empty = { prepared_call_id: '', inputs: {} };
assert.equal(validate(empty).valid, false);
assert.match(canonical.validationHint('agdf_record', empty), /reference is empty/u);
assert.throws(() => canonical.resolve('agdf_record', empty), /command_schema_invalid/);
const unknown = { prepared_call_id: '00000000-0000-4000-8000-000000000099', inputs: {} };
assert.equal(canonical.isAvailable({tool:'agdf_record',arguments:unknown}),false);
assert.match(canonical.validationHint('agdf_record', unknown), /unknown.*not proof of expiry/u);
assert.throws(() => canonical.resolve('agdf_record', unknown), /command_schema_invalid/);
assert.match(registry.validationHint('agdf_record', filled), /unknown/u, 'A closed connection does not establish TTL expiry.');
const expiring = createPreparedCallTransport({ now: () => time, lifetimeMs: 10 });
const expires = expiring.decorate(original).material_call.call;
time += 10;
assert.match(expiring.validationHint('agdf_record', expires.arguments), /was issued.*expired/u);
assert.throws(() => expiring.resolve('agdf_record', expires.arguments), /session_expired/);
const capped = createPreparedCallTransport({ maxEntries: 1 });
const retained = capped.decorate(original).material_call.call;
const unavailable = capped.decorate({ material_call: { call: { ...call, arguments: { ...call.arguments, operation_id: '00000000-0000-4000-8000-000000000002' } },
  required_inputs: original.material_call.required_inputs } }).material_call;
assert.equal(unavailable.state, 'transport_unavailable');
assert.equal(unavailable.call, null);
assert.equal(unavailable.submit, undefined);
assert.equal(unavailable.recovery_only.original_call.arguments.operation_id,'00000000-0000-4000-8000-000000000002');
assert.deepEqual(unavailable.recovery_only.original_call.arguments.command,call.arguments.command);
assert.deepEqual(unavailable.recovery_only.input_fields,[{name:'content',pointer:'/command/payload/files/0/content'}]);
assert.equal(unavailable.operation.operation_id,unavailable.recovery_only.original_call.arguments.operation_id);
assert.equal(capped.isAvailable(retained),true,'Capacity failure does not evict an outstanding original reference.');
const readyRaw={tool:'agdf_record',arguments:{...rawArguments,operation_id:'00000000-0000-4000-8000-000000000050',command:{kind:'material.stage',payload:{action:'put',files:[{slot:'UR',content:'Exact recovery text'}]}}}};
assert.equal(validate(readyRaw.arguments).valid,true);
const noReadyCall=capped.decorate({next_calls:[readyRaw]});
assert.deepEqual(noReadyCall.next_calls,[],'Capacity never turns a Raw call into a normal action.');
assert.deepEqual(noReadyCall.recovery_only.unavailable_calls[0].original_call,readyRaw);
assert.equal(noReadyCall.recovery_only.unavailable_calls[0].operation.operation_id,readyRaw.arguments.operation_id);
assert.equal(noReadyCall.recovery_only.authorizes,false);
const nearLimit=structuredClone(readyRaw);
Object.assign(nearLimit.arguments,{schema_version:'1',assurance:'cooperative_local',presentation_language:'en',working_directory:'/tmp/native-prepared-test'});
nearLimit.arguments.command.payload.files=[{slot:'UR',content:'x'.repeat(49152)},{slot:'EVIDENCE',content:''}];
const remaining=65530-Buffer.byteLength(JSON.stringify(nearLimit.arguments));
assert.ok(remaining>0&&remaining<=49152);
nearLimit.arguments.command.payload.files[1].content='y'.repeat(remaining);
assert.equal(Buffer.byteLength(JSON.stringify(nearLimit.arguments)),65530);
assert.equal(validate(nearLimit.arguments).valid,true,'The Raw request remains within its original schema and 64KiB request bound.');
assert.deepEqual(validateRunCommand('agdf_record',nearLimit.arguments),[],'The canonical Core input and byte-budget validator accepts this exact Raw request.');
assert.ok(Buffer.byteLength(JSON.stringify({call:nearLimit,required:[]}))>65536,'Registry accounting includes the call wrapper and pointer list.');
const sizeCapped=createPreparedCallTransport();
const sizeUnavailable=sizeCapped.decorate({prepared_call:{call:nearLimit,required_inputs:[]}}).prepared_call;
assert.equal(sizeUnavailable.state,'transport_unavailable');assert.equal(sizeUnavailable.call,null);
assert.deepEqual(sizeUnavailable.recovery_only.original_call,nearLimit,'A byte-capped registry entry retains the exact recoverable original Raw request.');
const sizeReadyUnavailable=sizeCapped.decorate({next_calls:[nearLimit]});
assert.deepEqual(sizeReadyUnavailable.next_calls,[]);
assert.deepEqual(sizeReadyUnavailable.recovery_only.unavailable_calls[0].original_call,nearLimit);
const sizeActionUnavailable=sizeCapped.decorate({next_action:{call:nearLimit,required_inputs:[]}}).next_action;
assert.equal(sizeActionUnavailable.call,null);assert.deepEqual(sizeActionUnavailable.recovery_only.original_call,nearLimit);
const delivered = canonical.decorate({ presentation_delivery: { next_calls: [{ tool: 'agdf_prepare',
  arguments: { command: { kind: 'presentation.deliver', payload: {} } } }] } });
assert.deepEqual(delivered.presentation_delivery.next_calls, [], 'A producer must never offer an unbound write call as a normal action.');
assert.equal(delivered.presentation_delivery.recovery_only,undefined,'An unbound producer call gets no invented original-operation recovery.');
const malformed=capped.decorate({material_call:{call,required_inputs:['/command/payload/__proto__/bad']}}).material_call;
assert.equal(malformed.call,null);assert.equal(malformed.recovery_only,undefined);
const sharedForm = { call, required_inputs: original.material_call.required_inputs };
const aliased = canonical.decorate({ material_call: sharedForm, report: { prepared_call: sharedForm }, next_action: sharedForm });
assert.ok(aliased.material_call.call.arguments.prepared_call_id);
assert.deepEqual(aliased.report.prepared_call.call, aliased.material_call.call);
assert.deepEqual(aliased.next_action.call, aliased.material_call.call);
assert.deepEqual(aliased.next_action.recovery_only.original_call, call,
  'A shared producer form or reprojected next action cannot erase its original immutable recovery binding.');
const followingRead = canonical.decorate({ next_read: { result: original } });
assert.ok(followingRead.next_read.result.material_call.call.arguments.prepared_call_id);
assert.equal(followingRead.next_read.result.material_call.submit, undefined);
assert.deepEqual(followingRead.next_read.result.material_call.recovery_only.original_call, call,
  'The exact canonical result of a follow-up read uses the same primary and recovery projection.');
// Names are transport aliases only; the canonical pointer ownership and every
// review/reply field stay unchanged and are never supplied by the adapter.
const recordRaw = { ...rawArguments, command: {kind: 'artefact.record', payload: {gate: 'SD', material: {material_id: '00000000-0000-4000-8000-000000000003', digest: 'sha256:'+'0'.repeat(64)}, update_draft: true}} };
const reviewing = canonical.decorate({recording_calls:[{call:{tool:'agdf_record',arguments:recordRaw},required_inputs:['/command/payload/reviewer','/command/payload/reviewed']}]}).recording_calls[0];
assert.deepEqual(reviewing.required_inputs,['reviewer','reviewed']);
assert.deepEqual(reviewing.call.arguments.inputs,{});
assert.ok(reviewing.input_fields.every(field=>Object.keys(field).sort().join() === 'name,required'), 'Descriptors contain no supplied reviewer, default or review decision.');
const reviewed = canonical.resolve('agdf_record',{...reviewing.call.arguments,inputs:{reviewer:'Actual synthetic reviewer',reviewed:true}});
assert.equal(reviewed.command.payload.reviewer,'Actual synthetic reviewer');assert.equal(reviewed.command.payload.reviewed,true);
assert.deepEqual(reviewed.command.payload.material,recordRaw.command.payload.material);assert.equal(reviewed.operation_id,recordRaw.operation_id);assert.equal(reviewed.expected_revision_id,recordRaw.expected_revision_id);
assert.throws(()=>canonical.resolve('agdf_record',{...reviewing.call.arguments,inputs:{reviewer:'Actual synthetic reviewer','/command/payload/reviewed':true}}),/command_schema_invalid/);
assert.throws(()=>canonical.resolve('agdf_record',{...reviewing.call.arguments,inputs:{reviewer:'Actual synthetic reviewer',reviewed:true,gate:'TP'}}),/command_schema_invalid/);
const notReviewed=canonical.resolve('agdf_record',{...reviewing.call.arguments,inputs:{reviewer:'Actual synthetic reviewer',reviewed:false}});
assert.equal(notReviewed.command.payload.reviewed,false,'The adapter never promotes a caller value to reviewed:true.');
assert.equal(validate(notReviewed).valid,false,'The original Core schema still rejects a missing review.');
const replying = canonical.decorate({approval_call:{call:{tool:'agdf_approve',arguments:{...rawArguments,command:{kind:'approval.record',payload:{gate:'TP',presentation_id:'00000000-0000-4000-8000-000000000004'}}}},required_inputs:['/command/payload/response']}}).approval_call;
assert.deepEqual(replying.required_inputs,['response']);assert.deepEqual(replying.call.arguments.inputs,{});
const reply=canonical.resolve('agdf_approve',{...replying.call.arguments,inputs:{response:'Approval: TP'}});assert.equal(reply.command.payload.response,'Approval: TP');assert.equal(reply.command.payload.gate,'TP');
assert.equal(canonical.resolve('agdf_approve',{...replying.call.arguments,inputs:{response:''}}).command.payload.response,'','An empty reply is never turned into approval.');
assert.throws(()=>canonical.resolve('agdf_approve',{...replying.call.arguments,inputs:{response:'Approval: TP',presentation_id:'changed'}}),/command_schema_invalid/);
const titled=canonical.decorate({prepared_call:{call:{tool:'agdf_run',arguments:{...rawArguments,command:{kind:'run.create',payload:{}}}},required_inputs:['/command/payload/title']}}).prepared_call;
assert.deepEqual(titled.required_inputs,['title']);assert.equal(canonical.resolve('agdf_run',{...titled.call.arguments,inputs:{title:'Actual authored title'}}).command.payload.title,'Actual authored title');
const filesRaw={...rawArguments,command:{kind:'material.stage',payload:{action:'put',files:[{slot:'SD'},{slot:'TP'}]}}};
const files=canonical.decorate({material_call:{call:{tool:'agdf_record',arguments:filesRaw},required_inputs:['/command/payload/files/0/content','/command/payload/files/1/content']}}).material_call;
assert.deepEqual(files.required_inputs,['files_0_content','files_1_content']);
assert.deepEqual(files.recovery_only.input_fields,[{name:'files_0_content',pointer:'/command/payload/files/0/content'},{name:'files_1_content',pointer:'/command/payload/files/1/content'}]);
const texts=['Exact Markdown `done <id>` 😀','Second line\n日本語'];
const resultFiles=canonical.resolve('agdf_record',{...files.call.arguments,inputs:{files_0_content:texts[0],files_1_content:texts[1]}});
assert.deepEqual(resultFiles.command.payload.files,[{slot:'SD',content:texts[0]},{slot:'TP',content:texts[1]}]);
assert.throws(()=>canonical.resolve('agdf_record',{...files.call.arguments,inputs:{content:texts[0],files_1_content:texts[1]}}),/command_schema_invalid/);
assert.throws(()=>canonical.resolve('agdf_record',{...files.call.arguments,inputs:{files_0_content:texts[0],'/command/payload/files/1/content':texts[1]}}),/command_schema_invalid/);
console.log('Single named-input prepared path, exact recovery, bounded truthful diagnostics and rejected native malformed shapes passed.');

// R0: the native SD failures reconstructed this complete read without its target
// pair twice. The supplied reference retains every original field server-side;
// no target/default/Run/revision is inferred from the malformed raw retries.
const inspectDefinition = CONTROL_INSPECT_FUNCTION_DEFINITION;
const validateRawRead = new AjvJsonSchemaValidator().getValidator(inspectDefinition.inputSchema);
const validatePreparedRead = new AjvJsonSchemaValidator().getValidator(preparedTransportSchema('agdf_inspect',inspectDefinition.inputSchema));
const readOptions = { validateRead: offeredCall => offeredCall.tool === 'agdf_inspect'
  && inspectDefinition.annotations.readOnlyHint === true && validateRawRead(offeredCall.arguments).valid };
const reads = createPreparedCallTransport(readOptions);
const readRaw = { tool:'agdf_inspect',arguments:{ operation:'authoring-inputs',presentation_language:'de',
  working_directory:'/tmp/native-bound-read',primary_target:'/tmp/native-bound-read',target_source:'explicit_target',
  run_id:'run-fixed',expected_revision_id:'00000000-0000-4000-8000-000000000002',bundle:true } };
assert.equal(validateRawRead(readRaw.arguments).valid,true);
const offeredRead = reads.decorate({next_calls:[readRaw]}).next_calls[0];
assert.deepEqual(Object.keys(offeredRead.arguments).sort(),['inputs','prepared_call_id']);
assert.deepEqual(offeredRead.arguments.inputs,{});
assert.deepEqual(offeredRead.required_inputs,[]);
assert.deepEqual(offeredRead.input_fields,[]);
assert.equal(offeredRead.operation.kind,'inspect.read');assert.equal(offeredRead.operation.read_only,true);
assert.equal(offeredRead.operation.operation,'authoring-inputs');
assert.equal(Object.hasOwn(offeredRead.operation,'operation_id'),false,'A read reference never invents an operation UUID.');
assert.deepEqual(offeredRead.recovery_only.original_call,readRaw);
assert.deepEqual(offeredRead.recovery_only.required_inputs,[]);
assert.equal(offeredRead.recovery_only.authorizes,false);
assert.equal(reads.isAvailable(offeredRead),true);
assert.equal(validatePreparedRead(offeredRead.arguments).valid,true);
assert.deepEqual(reads.resolve('agdf_inspect',offeredRead.arguments),readRaw.arguments);
assert.deepEqual(reads.resolve('agdf_inspect',offeredRead.arguments),readRaw.arguments,'Identical read retries retain exactly the selected source.');
assert.equal(validatePreparedRead(reads.resolve('agdf_inspect',offeredRead.arguments)).valid,true,'Resolved reads still satisfy the original published schema.');
const missingReadTargets = structuredClone(readRaw.arguments);
delete missingReadTargets.primary_target;delete missingReadTargets.target_source;
for(let attempt=0;attempt<2;attempt++) {
  assert.equal(validateRawRead(missingReadTargets).valid,false,'The two observed wrong Raw reads remain rejected.');
  assert.equal(validatePreparedRead(missingReadTargets).valid,false);
  assert.equal(reads.resolve('agdf_inspect',missingReadTargets),missingReadTargets,'Transport never repairs or fills an invalid Raw read.');
}
assert.equal(reads.validationHint('agdf_inspect',missingReadTargets),'','Missing Raw target diagnostics remain canonical Core responsibility.');
for(const inputs of [{primary_target:'/another'},{run_id:'run-other'},{expected_revision_id:'00000000-0000-4000-8000-000000000003'},{operation:'gate-check'}]) {
  const changed={...offeredRead.arguments,inputs};
  assert.equal(validatePreparedRead(changed).valid,false);assert.equal(reads.isAvailable({tool:'agdf_inspect',arguments:changed}),false);
  assert.throws(()=>reads.resolve('agdf_inspect',changed),/command_schema_invalid/);
  assert.deepEqual(reads.decorate({next_calls:[{tool:'agdf_inspect',arguments:changed}]}).next_calls,[],
    'An already prepared read with supplied selector inputs is not reoffered as a normal action.');
}
for(const field of ['primary_target','target_source','expected_revision_id','operation']) {
  const mixed={...offeredRead.arguments,[field]:readRaw.arguments[field]};
  assert.equal(validatePreparedRead(mixed).valid,false,'Prepared reads cannot mix duplicated Raw selectors.');
  assert.throws(()=>reads.resolve('agdf_inspect',mixed),/command_schema_invalid/);
}
assert.throws(()=>reads.resolve('agdf_record',offeredRead.arguments),/command_schema_invalid/);
assert.equal(reads.isAvailable({...offeredRead,tool:'agdf_dispatch'}),false);
assert.match(reads.validationHint('agdf_record',offeredRead.arguments),/cannot cross permission groups/u);
assert.deepEqual(reads.decorate({next_calls:[{tool:'agdf_inspect',arguments:missingReadTargets}]}).next_calls,[],
  'Malformed offered Raw reads are not promoted to a registered normal path.');
assert.deepEqual(reads.decorate({next_calls:[{tool:'agdf_dispatch',arguments:{continue_delivery:true}}]}).next_calls,
  [{tool:'agdf_dispatch',arguments:{continue_delivery:true}}],'Dispatch is never classified as a read-only operation.');

// Bound original-operation status is distinct from legitimate unbound creation
// lookup. The reference preserves the offered Run/revision and original UUID.
const statusRaw={tool:'agdf_inspect',arguments:{...readRaw.arguments,operation:'operation-status',
  module:'00000000-0000-4000-8000-000000000051'}};
delete statusRaw.arguments.bundle;
assert.equal(validateRawRead(statusRaw.arguments).valid,true);
const status = reads.decorate({operation_status_call:statusRaw}).operation_status_call;
assert.deepEqual(reads.resolve('agdf_inspect',status.arguments),statusRaw.arguments);
assert.equal(status.operation.module,statusRaw.arguments.module);
assert.equal(status.operation.run_id,statusRaw.arguments.run_id);
assert.equal(status.operation.expected_revision_id,statusRaw.arguments.expected_revision_id);
assert.equal(Object.hasOwn(status.operation,'operation_id'),false);
const partialStatus=structuredClone(statusRaw.arguments);delete partialStatus.expected_revision_id;
assert.equal(validatePreparedRead(partialStatus).valid,false);
assert.equal(reads.resolve('agdf_inspect',partialStatus),partialStatus);
assert.throws(()=>reads.resolve('agdf_inspect',{...status.arguments,inputs:{run_id:'run-other',expected_revision_id:'replacement'}}),/command_schema_invalid/);
assert.deepEqual(status.recovery_only.original_call,statusRaw);

// All explicitly offered normal read helpers share the one reference shape.
// Raw recovery branches remain exact data and cannot acquire an invented ref.
const helpers=reads.decorate({report:{first_page_call:readRaw},prepared_call:{call,required_inputs:original.material_call.required_inputs,
  contract_call:statusRaw,content_contract:{larger_source_call:readRaw}},recovery_only:{status_call:statusRaw},
  next_action:{call:readRaw,required_inputs:[],contract_call:statusRaw,content_contract:{larger_source_call:readRaw}}});
for(const helper of [helpers.report.first_page_call,helpers.prepared_call.contract_call,helpers.prepared_call.content_contract.larger_source_call,
  helpers.next_action.contract_call,helpers.next_action.content_contract.larger_source_call]) {
  assert.ok(helper.arguments.prepared_call_id);assert.deepEqual(helper.arguments.inputs,{});
  assert.deepEqual(reads.resolve('agdf_inspect',helper.arguments),helper.recovery_only.original_call.arguments);
}
assert.deepEqual(helpers.recovery_only.status_call,statusRaw);
assert.deepEqual(helpers.next_action.call,{tool:'agdf_inspect',arguments:offeredRead.arguments});
assert.deepEqual(helpers.next_action.recovery_only.original_call,readRaw);
const recoveryReadForm={call:readRaw,required_inputs:[]};
const explicitRecovery=reads.decorate({next_calls:[readRaw],prepared_call:recoveryReadForm,
  recovery:{next_calls:[readRaw],contract_call:statusRaw,prepared_call:recoveryReadForm}});
assert.ok(explicitRecovery.next_calls[0].arguments.prepared_call_id);
assert.ok(explicitRecovery.prepared_call.call.arguments.prepared_call_id);
assert.deepEqual(explicitRecovery.recovery,{next_calls:[readRaw],contract_call:statusRaw,prepared_call:recoveryReadForm},
  'Explicit recovery reads retain exact Raw requests across a new connection, including forms shared with the normal path.');
assert.deepEqual(createPreparedCallTransport(readOptions).resolve('agdf_inspect',explicitRecovery.recovery.next_calls[0].arguments),readRaw.arguments);
const recoveryWrite=reads.decorate({recovery:{next_calls:[readyRaw]}}).recovery.next_calls[0];
assert.ok(recoveryWrite.arguments.prepared_call_id,'Existing mutating recovery call semantics are unchanged.');
const readForm=reads.decorate({prepared_call:{call:readRaw,required_inputs:[]}}).prepared_call;
assert.deepEqual(readForm.call,{tool:'agdf_inspect',arguments:offeredRead.arguments});
assert.match(readForm.instruction,/including inputs:\{\}/u);
assert.ok(!readForm.instruction.includes('retains binding and UUID'),'Ordinary reads are not claimed to have a command UUID.');
const adapterRead=reads.decorate({next_read:{...readRaw,result:{outcome:'inspect_result',report:{next_calls:[statusRaw]}}}}).next_read;
assert.deepEqual(adapterRead.arguments,readRaw.arguments,'The adapter execution record remains the actual Raw read.');
assert.deepEqual(adapterRead.call,{tool:'agdf_inspect',arguments:offeredRead.arguments});
assert.deepEqual(adapterRead.recovery_only.original_call,readRaw);
assert.ok(adapterRead.result.report.next_calls[0].arguments.prepared_call_id);
const repeatedReadProjection=reads.decorate({next_calls:[offeredRead]}).next_calls[0];
assert.deepEqual(repeatedReadProjection.arguments,offeredRead.arguments);
assert.deepEqual(repeatedReadProjection.recovery_only.original_call,readRaw);
const mutation=structuredClone(offeredRead);mutation.recovery_only.original_call.arguments.primary_target='/changed';
assert.deepEqual(reads.resolve('agdf_inspect',offeredRead.arguments),readRaw.arguments);
const noReadPermission=createPreparedCallTransport({validateRead:()=>false});
assert.deepEqual(noReadPermission.decorate({next_calls:[readRaw]}).next_calls,[]);
const throwingReadValidator=createPreparedCallTransport({validateRead:()=>{throw Error('invalid read');}});
assert.deepEqual(throwingReadValidator.decorate({next_calls:[readRaw]}).next_calls,[],'Validation failure never registers a read.');

let readTime=0;const limitedReads=createPreparedCallTransport({...readOptions,now:()=>readTime,maxEntries:1,lifetimeMs:10});
const retainedRead=limitedReads.decorate({next_calls:[readRaw]}).next_calls[0];
const cappedRead=limitedReads.decorate({next_calls:[statusRaw]});
assert.deepEqual(cappedRead.next_calls,[]);
assert.deepEqual(cappedRead.recovery_only.unavailable_calls[0].original_call,statusRaw);
assert.equal(cappedRead.recovery_only.unavailable_calls[0].operation.read_only,true);
assert.equal(limitedReads.isAvailable(retainedRead),true);
const cappedAdapter=limitedReads.decorate({next_read:{...statusRaw,result:null}}).next_read;
assert.deepEqual(cappedAdapter.arguments,statusRaw.arguments);assert.equal(cappedAdapter.call,null);
assert.deepEqual(cappedAdapter.recovery_only.original_call,statusRaw);
readTime=10;
assert.equal(limitedReads.isAvailable(retainedRead),false);
assert.throws(()=>limitedReads.resolve('agdf_inspect',retainedRead.arguments),/session_expired/);
const readAfterReconnect=createPreparedCallTransport(readOptions);
assert.throws(()=>readAfterReconnect.resolve('agdf_inspect',retainedRead.arguments),/command_schema_invalid/);
assert.deepEqual(readAfterReconnect.resolve('agdf_inspect',retainedRead.recovery_only.original_call.arguments),readRaw.arguments,
  'Reconnect recovery retains the original Raw read and exact selectors.');

const publishedInspect={...inspectDefinition,inputSchema:preparedTransportSchema('agdf_inspect',inspectDefinition.inputSchema)};
assert.ok(Buffer.byteLength(JSON.stringify(publishedInspect))<=CONTROL_INSPECT_MAX_DEFINITION_BYTES,
  `Prepared inspect definition exceeds unchanged ${CONTROL_INSPECT_MAX_DEFINITION_BYTES}-byte budget: ${Buffer.byteLength(JSON.stringify(publishedInspect))}`);
console.log('Bound read references retain exact targets, source/status revisions and recovery; malformed Raw retries, cross-group use and selector overrides remain rejected.');
