import { MATERIAL_LIMITS } from './material-limits.js';
import { projectMcpInputSchema } from '../mcp-input-schema.js';
// Compatibility facade: existing exports retain the same schema/validator objects.
export { RUN_COMMAND_VERSION, RUN_COMMAND_LIMITS, TARGET_SCOPED_COMMAND_KINDS, PLANNING_COMMAND_KINDS, PLANNING_SCOPE_SCHEMA, strictObject, MATERIAL_REFERENCE_SCHEMA, RUN_COMMAND_DESCRIPTORS, RUN_COMMAND_GROUPS, commandGroupSchema, compactCommandSchema, RUN_COMMAND_RESULT_SCHEMA, commandResultSchema, validateRunCommandResult, commandGroupDefinition, schemaDiagnostics, validateRunCommand, runCommandRequestDigest } from './run-command-schema.js';
import { RUN_COMMAND_GROUPS, RUN_COMMAND_VERSION, RUN_COMMAND_DESCRIPTORS, payloadSchema, describeFields, strictObject, commandEnvelope, RUN_COMMAND_RESULT_SCHEMA, RUN_COMMAND_LIMITS } from './run-command-schema.js';
import { UR_AUTHORING_FORMAT } from '../control-evaluation/ur-readiness.js';
import { PRD_DECISION_FORMAT } from '../control-evaluation/prd-readiness.js';
import { SD_DECISION_FORMAT } from '../control-evaluation/sd-readiness.js';
import { ACCEPTANCE_CRITERIA_FORMAT, TP_AUTHORING_FORMAT } from '../control-evaluation/traceability-readiness.js';
import { UX_DECISION_FORMAT } from '../control-evaluation/definition-sources.js';
import { REVIEWED_BINDING_FORMAT, REVISION_PROPOSAL_FORMAT } from './recording-formats.js';
import { relationshipForGate } from '../control-evaluation/delivery-relationships.js';
import { PREVIEW_REVIEW_FORMAT } from './preview-review.js';
import { closeoutConfirmation, QUICK_CLOSEOUT_AUTHORING_FORMAT } from '../control-evaluation/closeout-readiness.js';


export function operationContract(group, kind, { gate } = {}) {
  if (!RUN_COMMAND_GROUPS[group]?.includes(kind)) return { available: false, reason: 'command_group_unsupported' };
  return { schema_version: RUN_COMMAND_VERSION, available: true, group, kind, ...RUN_COMMAND_DESCRIPTORS[kind], payload_schema: projectMcpInputSchema(payloadSchema(group, kind)),
    schema: projectMcpInputSchema(describeFields(strictObject({ ...commandEnvelope(group, kind), command: strictObject({ kind: { const: kind }, payload: { ...payloadSchema(group, kind), description: RUN_COMMAND_DESCRIPTORS[kind].effects.join('; ') } }) }))), input_completion: { precedence: 'explicit > confirmed project config > versioned plugin defaults', constants: ['schema_version', 'assurance'], cwd: 'Explicit unless private trustworthy task context exists; current native adapters require it.', core: 'The adapter validates a complete envelope before dispatch; target/Run/revision/UUID/material/reply bindings remain explicit.' }, result_schema: RUN_COMMAND_RESULT_SCHEMA, retry_class: 'inspect_original_operation_after_dispatch', assurance: 'cooperative_local',
    reference_limits: { input_bytes: RUN_COMMAND_LIMITS.input_bytes, source_file_bytes: 131072, result_bytes: RUN_COMMAND_LIMITS.result_bytes },
    ...(['planned_material.stage', 'planned_ur.create'].includes(kind) ? { planning_capture: {
      applies_to: 'New planned UR creation only. Replacement retains the existing plan_id and current expected_digest.',
      plan_id: 'plan-<planned_ur.create operation_id>', expected_digest: null,
      instructions: 'For a new planned UR, reserve the future planned_ur.create UUID first. Use plan- followed by that exact UUID as planning.plan_id. Begin, append and seal planned_material.stage with the same plan_id and null expected_digest; each material call has its own operation_id. Create with the reserved UUID. Creation source material is the plain canonical UR: omit Planning schema, Planning id and Planning priority lines; the writer adds them from the request. Replacement instead stages the full selected UR with its existing planning metadata. Never use a title/slug as the creation plan_id.',
    } } : {}),
    ...(['material.stage', 'planned_material.stage'].includes(kind) ? { material_transport: { inline_file_bytes: MATERIAL_LIMITS.inline, part_bytes: MATERIAL_LIMITS.part, file_bytes: MATERIAL_LIMITS.file, set_bytes: MATERIAL_LIMITS.set, max_sets: MATERIAL_LIMITS.sets,
      preferred: 'action put with files [{slot,content}] seals exact plain UTF-8 text in one bounded private call; at most 49152 UTF-8 bytes per file within the existing 65536-byte JSON request bound. No byte counts, base64 or transfer choreography are needed. Use recording_calls after sealing.',
      total_bytes: 2097152, lifetime_ms: 600000, idle_ms: 120000, effect: 'private transfer only; no canonical files or gate decision',
      encoding: 'append data is canonical standard base64 (no whitespace) of raw UTF-8 bytes; bytes and offsets count decoded bytes, not characters',
      replay: 'Every logical put/begin/append/seal/status call has its own operation UUID; reuse one UUID only for the identical request after uncertainty. transfer_id, not operation_id, links multipart actions. Seal/put return Core identity/digest. Generation loss requires restaging semantic bytes; preserve the future canonical write UUID.',
      lifecycle: 'A receipt-confirmed canonical commit retires its consumed set; otherwise discard it explicitly or let it expire.' } } : {}),
    internal_result_formats: kind === 'step.record' ? { 'UX Intent Definition': UX_DECISION_FORMAT,
      reviews: { declaration: '- decision: pass | revise | block | not_applicable', result_scope: 'actual current owner report; no generated judgement or approval' } } : undefined,
    reviewed_binding_format: kind === 'artefact.record' ? { ...REVIEWED_BINDING_FORMAT, current_relationship: relationshipForGate(gate) ?? null,
      destination_status: gate === 'QA' ? 'pass | revise | block matching the actual QA report' : 'draft' } : undefined,
    proposal_format: kind.startsWith('source_revision.') ? REVISION_PROPOSAL_FORMAT : undefined,
    ...(kind === 'closeout.record' ? { confirmation_format: closeoutConfirmation('{run_id}', '{expected_revision_id}', '{operation_id}', '{or.digest}'),
      closeout_modes: { quick_task: 'OR-lite: Result, Evidence, Risk, Next Step', verified_change: 'Verified Change Mini-Closeout; retain the same canonical record',
        structured_slice: 'Existing OR-full closeout and its applicable obligations', structured_delivery: 'Existing OR-full closeout and its applicable obligations' } } : {}),
    ...(kind === 'verified_change.record' ? { canonical_receipt_kind: 'step.record', execution: 'Actual edits/tests/Git actions remain external; this writer records their bounded observed result.' } : {}),
    ...(['planned_ur.create', 'planned_ur.replace', 'run.create_from_planned'].includes(kind) ? { planning_capability: { schema: 'planned-ur-v1', protocol_version: 1,
      owner: 'ur-definition', approval: 'none; explicit handoff starts an unapproved Run', metadata: ['Planning schema', 'Planning id', 'Planning priority'],
      priority: ['high', 'normal', 'low'], default_priority: 'normal only on explicit create', source_identity: 'SHA-256 of the whole canonical UR text',
      fields: kind === 'planned_ur.create' ? 'Stage the canonical UR without any Planning schema/id/priority lines. The create writer inserts all three from the request.' : 'Use the selected canonical UR including exactly one initial scalar of each planning metadata field. Planning id remains unchanged on replacement.' },
      authoring_format: UR_AUTHORING_FORMAT } : {}),
    authorizes: false, ...(!kind.startsWith('planned_ur.') && kind !== 'run.create_from_planned' ? { authoring_format: kind === 'closeout.record' ? { quick_task: QUICK_CLOSEOUT_AUTHORING_FORMAT } : kind === 'artefact.record' || kind === 'presentation.prepare' || kind === 'step.record' || kind === 'ur_draft.replace'
      ? ({ UR: UR_AUTHORING_FORMAT, PRD: { decisions: PRD_DECISION_FORMAT, criteria: ACCEPTANCE_CRITERIA_FORMAT, preview_review: PREVIEW_REVIEW_FORMAT }, SD: SD_DECISION_FORMAT, TP: TP_AUTHORING_FORMAT }[gate] ?? null) : undefined,
    } : {}),
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
