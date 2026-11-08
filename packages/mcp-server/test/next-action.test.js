import assert from 'node:assert/strict';
import test from 'node:test';
import { createNextActionProjection } from '../src/next-action.js';
import { createPreparedCallTransport } from '../src/prepared-call-transport.js';

const revision = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const presentation = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const target = 'sha256:' + 'a'.repeat(64);
const reference = number => `${String(number).padStart(8, '0')}-cccc-4ccc-8ccc-cccccccccccc`;
test('an unavailable OR recording form retains accepted staging and the original recovery request', () => {
  const transport = createPreparedCallTransport({ maxEntries: 0 });
  const original = { tool: 'agdf_closeout', arguments: {
    operation_id: reference(1), target_id: target, run_id: 'fixture-run', expected_revision_id: revision,
    command: { kind: 'closeout.record', payload: { or: { material_id: reference(2), digest: target }, confirmation: 'fixture binding' } },
  } };
  const stage = { outcome: 'accepted', family_result: { files: [{ slot: 'OR', sealed: true }] },
    recording_calls: [{ slot: 'OR', state: 'ready', call: original, required_inputs: [] }] };
  const projected = createNextActionProjection().project(transport.decorate(stage));
  assert.equal(projected.outcome, 'accepted');
  assert.deepEqual(projected.family_result, stage.family_result);
  assert.equal(projected.next_action.state, 'requires_source');
  assert.equal(projected.next_action.call, null);
  assert.equal(projected.recording_calls[0].state, 'transport_unavailable');
  assert.deepEqual(projected.recording_calls[0].recovery_only.original_call, original);
});
function form(number, fields = ['content'], kind = 'material.stage', tool = 'agdf_record') {
  return { state: fields.length ? 'requires_author_input' : 'ready',
    call: { tool, arguments: { prepared_call_id: reference(number), inputs: {} } },
    operation: { kind, target_id: target, run_id: 'fixture-run', expected_revision_id: revision,
      ...(kind === 'approval.record' ? { gate: 'TP', presentation_id: presentation } : {}) },
    required_inputs: fields,
    input_fields: fields.map(name => ({ name, pointer: '/command/payload/' + name })),
    content_contract: { max_utf8_bytes_per_file: 49152 },
    recovery_only: { original_call: { tool, arguments: { operation_id: reference(number + 100), target_id: target,
      run_id: 'fixture-run', expected_revision_id: revision, command: { kind, payload: {} } } }, authorizes: false },
    authorizes: false, instruction: 'Provided form.' };
}
const read = (cursor = '1') => ({ tool: 'agdf_inspect', arguments: { operation: 'authoring-inputs',
  working_directory: '/fixture', primary_target: '/fixture', target_source: 'explicit_target',
  presentation_language: 'de', run_id: 'fixture-run', expected_revision_id: revision, bundle: true,
  cursor: 'a'.repeat(64) + ':' + cursor } });
function authoring({ manifest = 'a', complete = true, material = undefined, page = 0, root = '/fixture' } = {}) {
  return { outcome: 'inspect_result', terminal: false, operation: 'authoring-inputs', target: { governance_target: root, target_id: target },
    report: { available: true, format: 'document_bundle_v2', manifest_digest: 'sha256:' + manifest.repeat(64),
      run_id: 'fixture-run', revision_id: revision, authoring_owner: 'SD', artifact_language: 'en', presentation_language: 'de',
      complete, page_index: page, ...(material ? { material_call: material } : {}) } };
}

test('one normal input form retains every binding and descriptor without mutating input', () => {
  const projection = createNextActionProjection();
  const supplied = form(1), input = { outcome: 'accepted', recording_calls: [supplied], receipt: { accepted: true } };
  const before = structuredClone(input), result = projection.project(input);
  assert.equal(result.next_action.state, 'form');
  assert.deepEqual(result.next_action.call, supplied.call);
  for (const key of ['operation', 'input_fields', 'recovery_only', 'content_contract', 'required_inputs'])
    assert.deepEqual(result.next_action[key], supplied[key]);
  assert.equal(result.next_action.authorizes, false);
  assert.deepEqual(input, before);
  result.next_action.call.arguments.inputs.content = 'Later authored text';
  assert.deepEqual(input, before, 'Returned action cannot mutate its producer envelope.');
});

test('delivered approval waits for a new reply and never copies the format example', () => {
  const projection = createNextActionProjection();
  const approval = { ...form(2, ['response'], 'approval.record', 'agdf_approve'),
    response_contract: { approval_value: 'Approval: TP', exact: true } };
  const result = projection.project({ outcome: 'accepted', approval_call: approval,
    presentation_delivery: { presentation_id: presentation, historical_delivery: false } });
  assert.equal(result.next_action.state, 'requires_new_reply');
  assert.deepEqual(result.next_action.call.arguments.inputs, {});
  assert.deepEqual(result.next_action.response_contract, approval.response_contract);
  assert.equal(result.next_action.authorizes, false);
  const prefilled = structuredClone(approval); prefilled.call.arguments.inputs.response = 'Approval: TP';
  assert.equal(projection.project({ outcome: 'accepted', approval_call: prefilled,
    presentation_delivery: { historical_delivery: false } }).next_action.call, null);
  assert.equal(projection.project({ outcome: 'accepted', historical_effect: true, approval_call: approval,
    presentation_delivery: { historical_delivery: true } }).next_action.state, 'idle');
});

test('approval schema help is never projected as an automatic ready write', () => {
  const result = createNextActionProjection().project({ outcome: 'inspect_result', operation: 'operation-contract',
    report: { prepared_call: { ...form(3, ['response'], 'approval.record', 'agdf_approve'),
      response_contract: { approval_value: 'Approval: TP' } } } });
  assert.equal(result.next_action.state, 'requires_new_reply');
  assert.deepEqual(result.next_action.call.arguments.inputs, {});
});

test('terminal outer and nested results expose no next call and preserve outer receipt', () => {
  const projection = createNextActionProjection(), pending = form(4, []);
  const host = { text: 'Stop here.', allow_surrounding_text: false };
  const outer = projection.project({ terminal: true, host_action: host, next_calls: [pending.call] });
  assert.equal(outer.next_action.state, 'terminal'); assert.equal(outer.next_action.call, null);
  assert.deepEqual(outer.next_action.host_action, host);
  const input = { outcome: 'accepted', receipt: { digest: 'outer' }, next_calls: [pending.call],
    next_read: { call: read(), result: { outcome: 'invalid_input', terminal: true, host_action: host } } };
  const nested = projection.project(input);
  assert.equal(nested.outcome, 'accepted'); assert.deepEqual(nested.receipt, input.receipt);
  assert.equal(nested.next_action.state, 'terminal'); assert.equal(nested.next_action.call, null);
  assert.deepEqual(nested.next_action.host_action, host);
  const successfulTerminalRead = projection.project({ ...input, next_read: { call: read(),
    result: { outcome: 'inspect_result', terminal: true, report: { available: true }, host_action: host } } });
  assert.equal(successfulTerminalRead.next_action.state, 'terminal'); assert.equal(successfulTerminalRead.next_action.call, null);
});

test('multiple distinct recording forms require selection; a ready fallback never wins', () => {
  const projection = createNextActionProjection();
  const result = projection.project({ outcome: 'accepted', recording_calls: [form(5), form(6)], next_calls: [form(7, []).call] });
  assert.equal(result.next_action.state, 'requires_selection'); assert.equal(result.next_action.call, null);
});

test('primary next calls precede resume fallbacks and remain ambiguous when distinct', () => {
  const projection = createNextActionProjection(), exact = read('0');
  const result = projection.project({ outcome: 'inspect_result', next_calls: [exact],
    continuation: { next_calls: [structuredClone(exact)], resume_call: read('1') } });
  assert.equal(result.next_action.state, 'ready'); assert.deepEqual(result.next_action.call, exact);
  const ambiguous = projection.project({ next_calls: [exact], continuation: { next_calls: [read('1')] } });
  assert.equal(ambiguous.next_action.state, 'requires_selection'); assert.equal(ambiguous.next_action.call, null);
  const fallback = projection.project({ next_calls: [], continuation: { next_calls: [], resume_call: exact } });
  assert.equal(fallback.next_action.state, 'ready'); assert.deepEqual(fallback.next_action.call, exact);
  const ambiguousFallback = projection.project({ resume_call: exact, continuation: { resume_call: read('1') } });
  assert.equal(ambiguousFallback.next_action.state, 'requires_selection'); assert.equal(ambiguousFallback.next_action.call, null);
});

test('Core presentation-required continuation selects prepared presentation before resume dispatch', () => {
  const projection = createNextActionProjection(), supplied = form(22, [], 'presentation.prepare', 'agdf_prepare');
  const resume = { tool: 'agdf_dispatch', arguments: { skill_id: 'gate-check', working_directory: '/fixture',
    primary_target: '/fixture', target_source: 'explicit_target', run_id: 'fixture-run', continue_delivery: true } };
  const result = projection.project({ outcome: 'intake_continuation', terminal: false,
    continuation: { phase: 'presentation_required', next_calls: [{ ...supplied.call, operation: supplied.operation,
      recovery_only: supplied.recovery_only }], resume_call: resume } });
  assert.equal(result.next_action.state, 'ready'); assert.deepEqual(result.next_action.call, supplied.call);
  assert.equal(result.next_action.operation.kind, 'presentation.prepare');
});

test('only the normal prepared call can become a mutating next action', () => {
  const projection = createNextActionProjection(), supplied = form(8);
  const raw = supplied.recovery_only.original_call;
  const result = projection.project({ outcome: 'accepted', recording_calls: [{ ...supplied, call: raw }] });
  assert.equal(result.next_action.state, 'requires_source'); assert.equal(result.next_action.call, null);
  assert.equal(projection.project({ next_calls: [{ tool: 'shell', arguments: { command: 'anything' } }] }).next_action.call, null);
});

test('source-reading priority exposes the operation-contract form after a successful read', () => {
  const projection = createNextActionProjection(), supplied = form(9, ['title'], 'run.create', 'agdf_run');
  const input = { outcome: 'accepted', receipt: { operation_id: 'outer' }, next_calls: [form(10, []).call],
    next_read: { call: { tool: 'agdf_inspect', arguments: { operation: 'operation-contract', module: 'agdf_run/run.create' } },
      result: { outcome: 'inspect_result', terminal: false, operation: 'operation-contract', report: { available: true, prepared_call: supplied } } } };
  const output = projection.project(input);
  assert.equal(output.next_action.state, 'form'); assert.equal(output.next_action.source, 'next_read.result.report.prepared_call');
  assert.deepEqual(output.next_action.call, supplied.call); assert.deepEqual(output.receipt, input.receipt);
  assert.equal(output.outcome, 'accepted');
});

test('unavailable follow-up read retries that exact read and never the outer write', () => {
  const projection = createNextActionProjection(), original = read('1');
  const input = { outcome: 'accepted', receipt: { operation_id: 'outer' }, next_calls: [form(11, []).call],
    next_read: { call: original, result: { outcome: 'inspect_result', terminal: false, report: { available: false, reason: 'stale' } } } };
  const output = projection.project(input);
  assert.equal(output.next_action.state, 'read_required'); assert.deepEqual(output.next_action.call, original);
  assert.deepEqual(output.receipt, input.receipt); assert.equal(output.outcome, 'accepted');
  assert.equal(projection.project({ ...input, next_read: { failed: true, call: original } }).next_action.call.tool, 'agdf_inspect');
  const explicitlyFailed = projection.project({ ...input, next_read: { failed: true, call: original,
    result: { outcome: 'inspect_result', operation: 'operation-contract', report: { available: true, prepared_call: form(20) } } } });
  assert.equal(explicitlyFailed.next_action.state, 'read_required'); assert.deepEqual(explicitlyFailed.next_action.call, original);
  assert.equal(projection.project({ ...input, next_read: { failed: true } }).next_action.call, null);
});

test('incomplete authoring pages cannot stage; complete later page reuses the exact first-page form', () => {
  const projection = createNextActionProjection(), supplied = form(12);
  const first = authoring({ complete: false, material: supplied }); first.report.next_calls = [read('1')];
  const one = projection.project(first);
  assert.equal(one.next_action.state, 'read_required'); assert.deepEqual(one.next_action.call, read('1'));
  assert.equal(one.next_action.call.tool, 'agdf_inspect');
  const last = projection.project(authoring({ complete: true, page: 1 }));
  assert.equal(last.next_action.state, 'form'); assert.equal(last.next_action.source, 'outer.cached_material_call');
  assert.deepEqual(last.next_action.call, supplied.call);
  assert.deepEqual(last.next_action.recovery_only, supplied.recovery_only);
  assert.deepEqual(last.next_action.required_inputs, supplied.required_inputs);
  const explicitlyReissued = authoring({ complete: false, material: form(21) }); explicitlyReissued.report.next_calls = [read('1')];
  projection.project(explicitlyReissued);
  assert.deepEqual(projection.project(authoring({ page: 1 })).next_action.call, form(21).call,
    'Only a newly supplied first-page form can replace its cached exact call; the projector generates no fresh identity.');
});

test('combined two-page result retains outer first-page form before selecting final nested page', () => {
  const projection = createNextActionProjection(), supplied = form(23);
  const first = authoring({ complete: false, material: supplied }); first.report.next_calls = [read('1')];
  const final = authoring({ complete: true, page: 1 });
  first.next_read = { ...read('1'), result: final };
  const original = structuredClone(first), result = projection.project(first);
  assert.equal(result.next_action.state, 'form');
  assert.equal(result.next_action.source, 'next_read.result.cached_material_call');
  assert.equal(result.next_action.context_path, 'next_read.result');
  assert.deepEqual(result.next_action.call, supplied.call);
  assert.deepEqual(result.next_action.recovery_only, supplied.recovery_only);
  assert.deepEqual(first, original, 'The cache projection never mutates either page.');
});

test('combined three-page result selects only the next read until its exact manifest completes', () => {
  const projection = createNextActionProjection(), supplied = form(24);
  const first = authoring({ complete: false, material: supplied }); first.report.next_calls = [read('1')];
  const middle = authoring({ complete: false, page: 1 }); middle.report.next_calls = [read('2')];
  first.next_read = { ...read('1'), result: middle };
  const partial = projection.project(first);
  assert.equal(partial.next_action.state, 'read_required');
  assert.deepEqual(partial.next_action.call, read('2'));
  assert.equal(partial.next_action.call.tool, 'agdf_inspect', 'No cached write is promoted before complete source.');
  const complete = projection.project(authoring({ page: 2 }));
  assert.equal(complete.next_action.state, 'form'); assert.deepEqual(complete.next_action.call, supplied.call);
  const another = authoring({ manifest: 'b', page: 2 }); another.report.first_page_call = read('0');
  assert.equal(projection.project(another).next_action.state, 'read_required');
});

test('changed manifest, target or revision cannot reuse an earlier form', () => {
  const projection = createNextActionProjection();
  const first = authoring({ complete: false, material: form(13) }); first.report.next_calls = [read('1')]; projection.project(first);
  const changedManifest = authoring({ manifest: 'b', page: 1 });
  const changedTarget = authoring({ page: 1, root: '/another-target' });
  const changedRevision = authoring({ page: 1 }); changedRevision.report.revision_id = presentation;
  for (const input of [changedManifest, changedTarget, changedRevision]) {
    const next = projection.project(input).next_action;
    assert.equal(next.state, 'requires_source'); assert.equal(next.call, null);
  }
});

test('unavailable reports cannot return or poison a cached write form', () => {
  const projection = createNextActionProjection();
  const unavailable = authoring({ material: form(18) }); unavailable.report.available = false;
  assert.equal(projection.project(unavailable).next_action.call, null);
  assert.equal(projection.project(authoring({ page: 1 })).next_action.state, 'requires_source');
  assert.equal(projection.project({ operation: 'operation-contract', report: { available: false, prepared_call: form(19) } }).next_action.call, null);
});

test('lost first-page cache uses only the supplied exact first-page read', () => {
  const projection = createNextActionProjection(), last = authoring({ page: 2 });
  last.report.first_page_call = read('0');
  const next = projection.project(last).next_action;
  assert.equal(next.state, 'read_required'); assert.deepEqual(next.call, read('0'));
  assert.equal(projection.project(authoring({ page: 2 })).next_action.state, 'requires_source');
  const malformed = authoring({ complete: false, material: form(14) });
  assert.equal(projection.project(malformed).next_action.state, 'requires_source');
});

test('unavailable cached reference is deleted and uses only the exact supplied first-page read', () => {
  let available = true;
  const observed = [], projection = createNextActionProjection({ isAvailable: call => {
    observed.push(structuredClone(call)); return available;
  } });
  const supplied = form(25), first = authoring({ complete: false, material: supplied }); first.report.next_calls = [read('1')];
  projection.project(first);
  available = false;
  const last = authoring({ page: 1 }); last.report.first_page_call = read('0');
  const next = projection.project(last).next_action;
  assert.equal(next.state, 'read_required'); assert.deepEqual(next.call, read('0'));
  assert.ok(observed.every(call => JSON.stringify(call) === JSON.stringify(supplied.call)));
  available = true;
  assert.equal(projection.project(authoring({ page: 1 })).next_action.state, 'requires_source',
    'A deleted cached reference is not resurrected when availability changes.');
  assert.equal(projection.project(authoring({ manifest: 'b', page: 1 })).next_action.call, null);
  assert.throws(() => createNextActionProjection({ isAvailable: true }), /availability_invalid/u);
});

test('cache is bounded and close removes all retained forms', () => {
  const projection = createNextActionProjection({ maxEntries: 1 });
  for (const [manifest, number] of [['a', 15], ['b', 16]]) {
    const first = authoring({ manifest, complete: false, material: form(number) }); first.report.next_calls = [read('1')]; projection.project(first);
  }
  assert.equal(projection.project(authoring({ manifest: 'a', page: 1 })).next_action.state, 'requires_source');
  assert.equal(projection.project(authoring({ manifest: 'b', page: 1 })).next_action.state, 'form');
  projection.close();
  assert.equal(projection.project(authoring({ manifest: 'b', page: 1 })).next_action.state, 'requires_source');
  assert.throws(() => createNextActionProjection({ maxEntries: 33 }), /limit_invalid/u);
});

test('malformed action lists and fields never promote another path', () => {
  const projection = createNextActionProjection();
  assert.equal(projection.project({ recording_calls: {}, next_calls: [read()] }).next_action.call, null);
  assert.equal(projection.project({ next_calls: 'invalid' }).next_action.call, null);
  assert.equal(projection.project({ family_result: { next_calls: {} } }).next_action.call, null);
  const bad = form(17); bad.required_inputs = ['content', 3];
  assert.equal(projection.project({ recording_calls: [bad] }).next_action.call, null);
});

test('failed internal read uses its exact retained reference, never a Raw fallback when unavailable', () => {
  const raw = read(), retry = { tool: 'agdf_inspect', arguments: { prepared_call_id: reference(30), inputs: {} } };
  const original = { outcome: 'accepted', receipt: { original: true }, next_read: { ...raw, call: retry, result: null,
    failure: { phase: 'execute', original_effect_unchanged: true } } };
  const observed = createNextActionProjection().project(original);
  assert.equal(observed.next_action.state, 'read_required');
  assert.deepEqual(observed.next_action.call, retry);
  assert.deepEqual(observed.next_read.arguments, raw.arguments);
  assert.deepEqual(observed.receipt, original.receipt);
  const unavailable = createNextActionProjection().project({ ...original, next_read: { ...original.next_read, call: null } });
  assert.equal(unavailable.next_action.state, 'requires_source');
  assert.equal(unavailable.next_action.call, null);
  assert.deepEqual(unavailable.receipt, original.receipt);
});

test('accepted private staging offers the exact authored correction after invalid UX source', () => {
  const supplied = form(31), receipt = { operation_id: reference(130), effect: 'private_transfer_only' };
  const input = { outcome: 'accepted', receipt, source_validation: { recordable: false, reason: 'ux_decision_malformed' },
    recording_calls: [], material_call: supplied };
  const before = structuredClone(input), result = createNextActionProjection().project(input);
  assert.equal(result.next_action.state, 'form');
  assert.equal(result.next_action.source, 'outer.material_call');
  for (const key of ['call', 'operation', 'required_inputs', 'input_fields', 'recovery_only', 'content_contract'])
    assert.deepEqual(result.next_action[key], supplied[key]);
  assert.equal(result.next_action.authorizes, false);
  assert.deepEqual(result.source_validation, input.source_validation);
  assert.deepEqual(result.receipt, receipt);
  assert.deepEqual(input, before);
});

test('a correction form cannot conceal a failed result, incomplete source, or unavailable transport', () => {
  const correction = { outcome: 'accepted', source_validation: { recordable: false }, material_call: form(32), recording_calls: [] };
  for (const outcome of ['rejected', 'recovery_required', 'effect_unknown', 'invalid_input', 'evaluator_error', 'target_unresolved']) {
    const next = createNextActionProjection().project({ ...correction, outcome }).next_action;
    assert.equal(next.state, 'requires_source', outcome); assert.equal(next.call, null);
  }
  const terminal = createNextActionProjection().project({ ...correction, terminal: true, host_action: { text: 'Stop.' } });
  assert.equal(terminal.next_action.state, 'terminal'); assert.equal(terminal.next_action.call, null);
  for (const report of [{ available: false }, { available: true, complete: false }]) {
    const next = createNextActionProjection().project({ ...correction, report, next_calls: [read()] }).next_action;
    assert.equal(next.state, 'requires_source'); assert.equal(next.call, null);
  }
  const unavailable = createNextActionProjection({ isAvailable: () => false }).project(correction);
  assert.equal(unavailable.next_action.state, 'requires_source'); assert.equal(unavailable.next_action.call, null);
  for (const input of [{ ...correction, historical_effect: true }, { ...correction, outcome: 'already_applied' }]) {
    assert.equal(createNextActionProjection().project(input).next_action.call, null,
      'A historical private transfer does not establish a new authored correction.');
  }
});

test('conflicting correction actions require selection, while malformed corrections never fall through', () => {
  const correction = { outcome: 'accepted', source_validation: { recordable: false }, material_call: form(33), recording_calls: [] };
  for (const competing of [{ recording_calls: [form(34, [], 'step.record')] }, { next_calls: [read()] },
    { family_result: { next_calls: [read()] } }, { approval_call: form(34, ['response'], 'approval.record', 'agdf_approve') },
    { report: { prepared_call: form(34) } }]) {
    const next = createNextActionProjection().project({ ...correction, ...competing }).next_action;
    assert.equal(next.state, 'requires_selection'); assert.equal(next.call, null);
  }
  const malformed = [null, false, {}, { ...form(33), call: form(33).recovery_only.original_call },
    { ...form(33), required_inputs: [] }, { ...form(33), required_inputs: ['content', 'content'] },
    { ...form(33), state: 'transport_unavailable' },
    { ...form(33), operation: { kind: 'approval.record' } },
    { ...form(33), call: { ...form(33).call, arguments: { prepared_call_id: reference(33), inputs: { content: 'Old invalid draft' } } } }];
  for (const material_call of malformed) {
    const next = createNextActionProjection().project({ ...correction, material_call, next_calls: [form(34, []).call] }).next_action;
    assert.equal(next.state, 'requires_source'); assert.equal(next.call, null);
  }
  for (const source_validation of [undefined, { recordable: true }]) {
    const next = createNextActionProjection().project({ ...correction, source_validation }).next_action;
    assert.equal(next.state, 'requires_source'); assert.equal(next.call, null);
  }
  assert.equal(createNextActionProjection().project({ ...correction, recording_calls: [null] }).next_action.call, null);
});

test('a new first-page revision retires only its scoped cache and late old pages cannot revive it', () => {
  const projection = createNextActionProjection(), oldForm = form(35), otherForm = form(36), freshForm = form(37);
  const old = authoring({ complete: false, material: oldForm }); old.report.next_calls = [read('1')];
  const other = authoring({ complete: false, material: otherForm, root: '/other-target' }); other.report.next_calls = [read('1')];
  projection.project(old); projection.project(other);
  const fresh = authoring({ complete: false, material: freshForm });
  fresh.report.revision_id = presentation;
  fresh.report.material_call.operation.expected_revision_id = presentation;
  fresh.report.material_call.recovery_only.original_call.arguments.expected_revision_id = presentation;
  fresh.report.next_calls = [read('1')]; fresh.report.next_calls[0].arguments.expected_revision_id = presentation;
  assert.equal(projection.project(fresh).next_action.state, 'read_required');
  assert.equal(projection.project(authoring({ page: 1 })).next_action.state, 'requires_source', 'Late old page has no cached write.');
  assert.equal(projection.project(old).next_action.state, 'requires_source', 'An older first page cannot reintroduce a retired form.');
  const completeFresh = authoring({ page: 1 }); completeFresh.report.revision_id = presentation;
  assert.deepEqual(projection.project(completeFresh).next_action.call, freshForm.call, 'Old pages do not evict the current form.');
  assert.deepEqual(projection.project(authoring({ page: 1, root: '/other-target' })).next_action.call, otherForm.call,
    'The identical revision on a different target stays independent.');
  projection.close();
  assert.equal(projection.project(old).next_action.state, 'read_required', 'Close discards revision observations as well as cached forms.');
});
