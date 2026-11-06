const writeTools = new Set(['agdf_project', 'agdf_run', 'agdf_prepare', 'agdf_record', 'agdf_approve', 'agdf_revise', 'agdf_closeout']);
const knownTools = new Set([...writeTools, 'agdf_inspect', 'agdf_dispatch']);
const clone = value => structuredClone(value);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const canonical = value => JSON.stringify(stable(value));
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  return object(value) ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
}
function callValue(value) {
  return object(value) && knownTools.has(value.tool) && object(value.arguments)
    ? { tool: value.tool, arguments: clone(value.arguments) } : null;
}
function formValue(value) {
  if (!object(value)) return null;
  const call = callValue(value.call ?? value);
  if (!call) return null;
  // A normal mutating action must already be the transport's bound form. Never
  // promote its Raw recovery branch or reconstruct one from operation metadata.
  if (writeTools.has(call.tool) && (!Object.hasOwn(call.arguments, 'prepared_call_id')
    || typeof call.arguments.prepared_call_id !== 'string' || !call.arguments.prepared_call_id
    || !object(call.arguments.inputs) || Object.keys(call.arguments).some(key => !['prepared_call_id', 'inputs'].includes(key)))) return null;
  if (value.required_inputs !== undefined && (!Array.isArray(value.required_inputs)
    || value.required_inputs.some(field => typeof field !== 'string' || !field))) return null;
  const source = clone(value);
  delete source.tool; delete source.arguments;
  return { ...source, call, required_inputs: Array.isArray(value.required_inputs) ? clone(value.required_inputs) : [] };
}
function uniqueForms(values) {
  const forms = new Map();
  for (const value of values.filter(Boolean)) {
    const form = formValue(value);
    if (!form) return null;
    const key = canonical({ call: form.call, required_inputs: form.required_inputs });
    if (!forms.has(key)) forms.set(key, form);
  }
  return [...forms.values()];
}
function base(state, instruction, source, extra = {}) {
  return { state, call: null, required_inputs: [], instruction, source, ...extra, authorizes: false };
}
function terminal(result, source) {
  return base('terminal', 'Respect this result\'s terminal host_action and stop; no next tool call is selected.', source,
    result.host_action ? { host_action: clone(result.host_action) } : {});
}
function selectForms(values, source, { forceReply = false, readOnly = false } = {}) {
  const forms = uniqueForms(values);
  if (!forms?.length) return base('requires_source', 'No complete normal action was supplied. Read the canonical source or use its explicit recovery instructions; do not construct a replacement call.', source);
  if (forms.length !== 1) return base('requires_selection', 'Several distinct actions were supplied. Preserve the current binding and obtain the authoritative selection; do not pick the first action.', source);
  const form = forms[0];
  if (readOnly && form.call.tool !== 'agdf_inspect') return base('requires_source', 'The supplied continuation is not a read-only page call; no action is selected.', source);
  const reply = forceReply || form.call.tool === 'agdf_approve' || form.operation?.kind === 'approval.record';
  if (reply) {
    // The contract's approval_value is syntax, never a response. A producer that
    // filled a reply in an offered form cannot establish new human intent here.
    if (Object.values(form.call.arguments.inputs ?? {}).some(value => value !== '' && value !== undefined))
      return base('requires_new_reply', 'Obtain a fresh blank approval form and a NEW deliberate reply for its exact presentation. No reply or approval is inferred.', source);
    return { ...form, state: 'requires_new_reply', source, authorizes: false,
      instruction: 'Deliver the current presentation before waiting for a NEW deliberate reply. Fill only the supplied reply field from that response; never copy approval_value as a decision. ' + (form.instruction ?? '') };
  }
  return { ...form, state: form.required_inputs.length ? 'form' : 'ready', source, authorizes: false,
    instruction: 'Use this one exact call. Supply only its named required inputs from actual authored content or review; do not rebuild IDs, bindings or a Raw envelope. ' + (form.instruction ?? '') };
}
function authoringKey(result, report) {
  if (report.format !== 'document_bundle_v2' || !/^sha256:[0-9a-f]{64}$/u.test(report.manifest_digest ?? '')) return null;
  return canonical({ manifest: report.manifest_digest,
    target_id: result.target?.target_id ?? result.binding?.target_id ?? report.target_id ?? null,
    target: result.target?.governance_target ?? result.target?.display_path ?? null,
    run_id: report.run_id ?? null, revision_id: report.revision_id ?? null, planning: report.planning ?? null,
    owner: report.authoring_owner ?? null, artifact_language: report.artifact_language ?? null,
    presentation_language: report.presentation_language ?? null });
}

// A connection-local projection of supplied actions, not an executor, permission
// decision or proof that the model has read/reviewed all source pages.
export function createNextActionProjection({ maxEntries = 32, isAvailable = () => true } = {}) {
  if (!Number.isSafeInteger(maxEntries) || maxEntries < 1 || maxEntries > 32) throw Error('next_action_cache_limit_invalid');
  if (typeof isAvailable !== 'function') throw Error('next_action_availability_invalid');
  const forms = new Map();
  function available(form) {
    const normal = formValue(form);
    if (!normal) return false;
    try { return isAvailable(clone(normal.call)) === true; } catch { return false; }
  }
  function remember(key, form) {
    if (!key) return;
    if (!available(form)) { forms.delete(key); return; }
    forms.delete(key); forms.set(key, clone(form));
    while (forms.size > maxEntries) forms.delete(forms.keys().next().value);
  }
  function rememberAuthoring(result) {
    if (result?.terminal === true || result?.outcome !== 'inspect_result' || result.operation !== 'authoring-inputs') return;
    const report = result.report;
    if (!object(report) || report.available === false || !report.material_call
      || report.page_index !== undefined && report.page_index !== 0) return;
    for (const owner of [result, result.continuation, result.navigation, report, result.family_result].filter(object))
      if (owner.next_calls !== undefined && owner.next_calls !== null && !Array.isArray(owner.next_calls)
        || owner.recording_calls !== undefined && owner.recording_calls !== null && !Array.isArray(owner.recording_calls)) return;
    remember(authoringKey(result, report), report.material_call);
  }
  function fromContext(result, source) {
    if (result.terminal === true) return terminal(result, source);
    if (['rejected', 'recovery_required', 'effect_unknown', 'invalid_input', 'evaluator_error', 'target_unresolved'].includes(result.outcome))
      return base('requires_source', 'This operation did not establish a successful normal continuation. Preserve its original receipt and recovery instructions; no write form is selected.', source);
    const report = object(result.report) ? result.report : null;
    for (const owner of [result, result.continuation, result.navigation, report, result.family_result].filter(object))
      if (owner.next_calls !== undefined && owner.next_calls !== null && !Array.isArray(owner.next_calls)
        || owner.recording_calls !== undefined && owner.recording_calls !== null && !Array.isArray(owner.recording_calls))
        return base('requires_source', 'The supplied action list is malformed. Preserve the existing outcome and obtain the canonical action source.', source);
    if (result.approval_call && result.presentation_delivery && !result.historical_effect && !result.presentation_delivery.historical_delivery
      && ['accepted', 'already_applied'].includes(result.outcome)) return selectForms([result.approval_call], source + '.approval_call', { forceReply: true });
    if (Array.isArray(result.recording_calls) && result.recording_calls.length)
      return selectForms(result.recording_calls, source + '.recording_calls');
    if (result.operation === 'operation-contract' && report?.prepared_call && report.available === false)
      return base('requires_source', 'The operation-contract report is unavailable. Preserve its original binding and recovery instructions; no write form is selected.', source + '.report');
    if (result.operation === 'operation-contract' && report?.prepared_call)
      return selectForms([report.prepared_call], source + '.report.prepared_call');
    if (result.operation === 'authoring-inputs' && report) {
      if (report.available === false)
        return base('requires_source', 'The authoring source is unavailable. Preserve its original binding and recovery instructions; no staging form is selected.', source + '.report');
      const key = authoringKey(result, report);
      if (report.material_call && (report.page_index === 0 || report.page_index === undefined)) remember(key, report.material_call);
      if (report.complete !== true) {
        if (report.next_calls?.length) {
          const next = selectForms(report.next_calls, source + '.report.next_calls', { readOnly: true });
          return next.state === 'ready' ? { ...next, state: 'read_required',
            instruction: 'Read this exact next page before authoring. Retain earlier bytes and respect fragment identities; page transport does not prove review. ' + next.instruction } : next;
        }
        return base('requires_source', 'The authoring source is incomplete and no exact next-page call was supplied. Do not stage or edit incomplete content.', source + '.report');
      }
      let material = report.material_call ?? (key && forms.get(key));
      if (material && !available(material)) {
        if (key) forms.delete(key);
        material = null;
      }
      if (material) return selectForms([material], source + (report.material_call ? '.report.material_call' : '.cached_material_call'));
      if (report.first_page_call) {
        const next = selectForms([report.first_page_call], source + '.report.first_page_call', { readOnly: true });
        return next.state === 'ready' ? { ...next, state: 'read_required',
          instruction: 'No first-page form is retained for this exact manifest. Read the supplied first page; never derive a cursor, reference or new binding. ' + next.instruction } : next;
      }
      return base('requires_source', 'No authoring form is available for this exact manifest. Obtain its canonical first page; do not reuse another target, revision or manifest.', source + '.report');
    }
    const supplied = [...(result.next_calls ?? []), ...(result.continuation?.next_calls ?? []),
      ...(report?.next_calls ?? []), ...(result.navigation?.next_calls ?? []), ...(result.family_result?.next_calls ?? [])];
    if (supplied.length) return selectForms(supplied, source + '.next_calls');
    const resume = [...(result.resume_call ? [result.resume_call] : []),
      ...(result.continuation?.resume_call ? [result.continuation.resume_call] : [])];
    if (resume.length) return selectForms(resume, source + '.resume_call');
    if ([result, result.continuation, report].filter(object).some(owner => owner.recovery_only?.unavailable_calls?.length))
      return base('requires_source', 'No normal call could be registered. The exact original requests are retained only in recovery_only; follow original-operation recovery without creating new identities.', source);
    return base('idle', 'No unique next action was supplied. Follow the canonical current-state instruction; no tool call is inferred.', source);
  }
  return Object.freeze({
    project(domain) {
      const result = clone(domain);
      // An adapter may already have loaded one safe page after this result.
      // Retain the exact outer first-page form before selecting that nested
      // context; incomplete nested pages still select only their supplied read.
      rememberAuthoring(result);
      if (result.terminal === true) result.next_action = terminal(result, 'outer');
      else if (result.next_read) {
        const read = result.next_read, nested = read.result;
        // An explicit null means the exact read could not be retained. Its Raw
        // execution record remains evidence/recovery, never a normal fallback.
        const retry = Object.hasOwn(read, 'call') ? read.call : read;
        if (read.failure?.phase === 'validation') result.next_action = base('requires_source',
          'The supplied read could not be validated. Preserve the original outcome and receipt; obtain the canonical read source without repeating the write.', 'next_read');
        else if (nested?.terminal === true) result.next_action = terminal(nested, 'next_read.result');
        else if (!read.error && read.failed !== true && nested?.outcome === 'inspect_result' && nested.report?.available !== false)
          result.next_action = fromContext(nested, 'next_read.result');
        else if (callValue(retry)?.tool === 'agdf_inspect') {
          const next = selectForms([retry], 'next_read', { readOnly: true });
          result.next_action = next.state === 'ready' ? { ...next, state: 'read_required',
            instruction: 'The follow-up read did not produce an available nonterminal result. Retry only this exact read when appropriate; never repeat the outer write. ' + next.instruction } : next;
        } else result.next_action = base('requires_source', 'The follow-up read failed without an exact supplied read call. Preserve the outer outcome/receipt; do not retry the outer write.', 'next_read');
      } else result.next_action = fromContext(result, 'outer');
      result.next_action.context_path = result.next_read?.result ? 'next_read.result' : 'outer';
      if (result.next_read?.result?.report) result.next_action.instruction +=
        ' The already loaded source report is response.structuredContent.next_read.result.report. Consume that report without another inspect call.';
      return result;
    },
    close() { forms.clear(); },
  });
}
