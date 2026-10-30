import { projectMcpInputSchema } from '../mcp-input-schema.js';
// Compatibility facade: existing exports retain the same schema/validator objects.
export { RUN_COMMAND_VERSION, RUN_COMMAND_LIMITS, TARGET_SCOPED_COMMAND_KINDS, strictObject, MATERIAL_REFERENCE_SCHEMA, RUN_COMMAND_DESCRIPTORS, RUN_COMMAND_GROUPS, commandGroupSchema, compactCommandSchema, RUN_COMMAND_RESULT_SCHEMA, commandResultSchema, validateRunCommandResult, commandGroupDefinition, schemaDiagnostics, validateRunCommand, runCommandRequestDigest } from './run-command-schema.js';
import { RUN_COMMAND_GROUPS, RUN_COMMAND_VERSION, RUN_COMMAND_DESCRIPTORS, payloadSchema, describeFields, strictObject, commandEnvelope, RUN_COMMAND_RESULT_SCHEMA, RUN_COMMAND_LIMITS } from './run-command-schema.js';
import { UR_AUTHORING_FORMAT } from '../control-evaluation/ur-readiness.js';
import { PRD_DECISION_FORMAT } from '../control-evaluation/prd-readiness.js';
import { SD_DECISION_FORMAT } from '../control-evaluation/sd-readiness.js';
import { ACCEPTANCE_CRITERIA_FORMAT, TP_AUTHORING_FORMAT } from '../control-evaluation/traceability-readiness.js';
import { UX_DECISION_FORMAT } from '../control-evaluation/definition-sources.js';
import { REVIEWED_REQUEST_FORMAT, REVISION_PROPOSAL_FORMAT } from './recording-formats.js';
import { relationshipForGate } from '../control-evaluation/delivery-relationships.js';
import { PREVIEW_REVIEW_FORMAT } from './preview-review.js';
import { closeoutConfirmation, QUICK_CLOSEOUT_AUTHORING_FORMAT } from '../control-evaluation/closeout-readiness.js';


export function operationContract(group, kind, { gate } = {}) {
  if (!RUN_COMMAND_GROUPS[group]?.includes(kind)) return { available: false, reason: 'command_group_unsupported' };
  return { schema_version: RUN_COMMAND_VERSION, available: true, group, kind, ...RUN_COMMAND_DESCRIPTORS[kind], payload_schema: projectMcpInputSchema(payloadSchema(group, kind)),
    schema: projectMcpInputSchema(describeFields(strictObject({ ...commandEnvelope(group, kind), command: strictObject({ kind: { const: kind }, payload: { ...payloadSchema(group, kind), description: RUN_COMMAND_DESCRIPTORS[kind].effects.join('; ') } }) }))), input_completion: { precedence: 'explicit > confirmed project config > versioned plugin defaults', constants: ['schema_version', 'assurance'], cwd: 'Explicit unless private trustworthy task context exists; current native adapters require it.', core: 'The adapter validates a complete envelope before dispatch; target/Run/revision/UUID/material/reply bindings remain explicit.' }, result_schema: RUN_COMMAND_RESULT_SCHEMA, retry_class: 'inspect_original_operation_after_dispatch', assurance: 'cooperative_local',
    reference_limits: { input_bytes: RUN_COMMAND_LIMITS.input_bytes, source_file_bytes: 131072, result_bytes: RUN_COMMAND_LIMITS.result_bytes },
    ...(kind === 'material.stage' ? { material_transport: { part_bytes: 16384, file_bytes: 131072, set_bytes: 524288, max_sets: 4,
      total_bytes: 2097152, lifetime_ms: 600000, idle_ms: 120000, effect: 'private transfer only; no canonical files or gate decision',
      replay: 'begin preserves its original UUID; append uses exact offsets/base64 bytes. Seal returns Core identity/digest. Read transfer status after uncertainty; generation loss requires restaging semantic bytes. Preserve the future canonical write UUID.',
      lifecycle: 'A receipt-confirmed canonical commit retires its consumed set; otherwise discard it explicitly or let it expire.' } } : {}),
    internal_result_formats: kind === 'step.record' ? { 'UX Intent Definition': UX_DECISION_FORMAT,
      reviews: { declaration: '- decision: pass | revise | block | not_applicable', result_scope: 'actual current owner report; no generated judgement or approval' } } : undefined,
    reviewed_request_format: kind === 'artefact.record' ? { ...REVIEWED_REQUEST_FORMAT, current_relationship: relationshipForGate(gate) ?? null,
      destination_status: gate === 'QA' ? 'pass | revise | block matching the actual QA report' : 'draft' } : undefined,
    proposal_format: kind.startsWith('source_revision.') ? REVISION_PROPOSAL_FORMAT : undefined,
    ...(kind === 'closeout.record' ? { confirmation_format: closeoutConfirmation('{run_id}', '{expected_revision_id}', '{operation_id}', '{or.digest}'),
      closeout_modes: { quick_task: 'OR-lite: Result, Evidence, Risk, Next Step', verified_change: 'Verified Change Mini-Closeout; retain the same canonical record',
        structured_slice: 'Existing OR-full closeout and its applicable obligations', structured_delivery: 'Existing OR-full closeout and its applicable obligations' } } : {}),
    ...(kind === 'verified_change.record' ? { canonical_receipt_kind: 'step.record', execution: 'Actual edits/tests/Git actions remain external; this writer records their bounded observed result.' } : {}),
    authorizes: false, authoring_format: kind === 'closeout.record' ? { quick_task: QUICK_CLOSEOUT_AUTHORING_FORMAT } : kind === 'artefact.record' || kind === 'presentation.prepare' || kind === 'step.record'
      ? ({ UR: UR_AUTHORING_FORMAT, PRD: { decisions: PRD_DECISION_FORMAT, criteria: ACCEPTANCE_CRITERIA_FORMAT, preview_review: PREVIEW_REVIEW_FORMAT }, SD: SD_DECISION_FORMAT, TP: TP_AUTHORING_FORMAT }[gate] ?? null) : undefined,
    presentation_format: kind === 'presentation.prepare' || kind === 'artefact.record' ? {
      owner: 'run-presentation-render', record_version: 6, primary_document: 'one immutable Markdown with the complete source summary exactly once',
      source: 'source-authored canonical artefact or validated localized AGDF Approval Summary; no adapter paraphrase',
      missing_fields: 'retain absence; do not fabricate summary fields',
      delivery: 'prepare opens no UI. Optional agdf_decision_view is a non-primary preview. presentation.deliver selects ui_primary only with live exact current-surface display proof, otherwise full_markdown. UI primary gets only a short Chat pointer. Qualification and intent are separate. Replay adds no question; fallback retires UI first.',
      remote_document: 'presentation-document; exact binding and every cursor; local file links do not prove iPad access',
      remote_preview: 'presentation-preview; exact binding and every cursor; render only through isolated supported access; unavailable access leaves the review open',
    } : undefined,
    confirmation_boundary: 'host permission, concrete human intent and Core eligibility are separate' };
}
