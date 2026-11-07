import { resolveTaskTarget } from '../task-target-resolution.js';
import { preparedCommandCall } from '../control-state/prepared-control-calls.js';
import { inspectUxIntentDecision, UX_DECISION_FORMAT } from '../control-evaluation/definition-sources.js';
import { validateRunCommand } from '../control-state/run-command-schema.js';
import { inspectAuthoringInputs } from './authoring-inputs.js';

// Mirrors an explicit author declaration; never chooses a judgement or review.
export function withUxSourceDecision(form, content) {
  const observed = inspectUxIntentDecision(content);
  const source_validation = { ...observed, format: UX_DECISION_FORMAT, authorizes: false };
  if (!observed.well_formed || !observed.supported || observed.decision === 'not_applicable') return {
    source_validation: { ...source_validation, recordable: false,
      reason: !observed.well_formed ? 'ux_decision_malformed' : 'ux_decision_not_supported_for_required_analysis',
      instruction: 'Correct the explicit - decision: field in the authored report, then stage the corrected bytes with the new material_call. No canonical record was attempted; choose ready or blocked from actual analysis, never from this diagnostic.' } };
  const filled = structuredClone(form);
  filled.call.arguments.command.payload.decision = observed.decision;
  filled.required_inputs = filled.required_inputs.filter(p => p !== '/command/payload/decision');
  filled.state = validateRunCommand(filled.call.tool, filled.call.arguments).length ? 'requires_author_input' : 'ready';
  return { form: filled, source_validation: { ...source_validation, recordable: true,
    decision_origin: 'exact explicit author declaration in staged source; not generated judgement' } };
}

// Reuse the canonical author/source selection, including analytical prerequisites
// at an outer gate. Transport itself cannot choose a future/protected writer.
export function withMaterialRecordingCalls(input, result) {
  if (result.outcome !== 'accepted' || input.planning || !['put', 'seal'].includes(input.command.payload.action)) return result;
  try {
    const target = resolveTaskTarget({ workingDirectory: input.working_directory, primaryTarget: input.primary_target, targetSource: input.target_source });
    if (target.resolution_state !== 'resolved') return result;
    const authoring = inspectAuthoringInputs(target.governance_target, input);
    if (!authoring.available || authoring.revision_id !== input.expected_revision_id) return result;
    const slot = authoring.material_call?.call.arguments.command.payload.files[0].slot;
    const files = (result.family_result.files ?? []).filter(file => file.reference && file.slot === slot);
    if (files.length !== 1 || !authoring.formats?.available) return result;
    if (!['step.record', 'artefact.record', 'ur_draft.replace'].includes(authoring.formats.kind)) return result;
    const form = preparedCommandCall(authoring.formats.group, authoring.formats.kind, input,
      { gate: authoring.authoring_owner, material: files[0].reference, recording: authoring.recording });
    if (form && authoring.authoring_owner === 'UX Intent Definition' && input.command.payload.action === 'put') {
      const text = input.command.payload.files.find(file => file.slot === slot)?.content;
      if (typeof text === 'string') {
        const checked = withUxSourceDecision(form, text);
        return { ...result, source_validation: checked.source_validation,
          ...(checked.form ? { recording_calls: [{ slot, ...checked.form }] }
            : { recording_calls: [], material_call: authoring.material_call }) };
      }
    }
    return form && !form.required_inputs.includes('/command/payload') ? { ...result, recording_calls: [{ slot, ...form }] } : result;
  } catch { return result; } // Guidance cannot conceal an accepted private transfer.
}
