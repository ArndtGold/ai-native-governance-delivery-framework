export const SOURCE_REVISION_PROPOSAL_VERSION = '3';
// Field contracts shared by the existing recording/revision owners and selected Inspect
// descriptors. These describe review input; they do not manufacture review findings.
export const REVISION_PROPOSAL_FIELDS = Object.freeze(['schema_version', 'target_id', 'run_id', 'expected_revision_id', 'operation_id', 'source_gate', 'reason', 'intended_change', 'sources', 'impact_assessment', 'policy_version', 'initiating_phase', 'changed_statements', 'quality_assessment']);
export const REVISION_IMPACT_FIELDS = Object.freeze(['reviewer', 'earliest_source', 'upstream', 'analyses', 'implementation_evidence', 'unresolved']);
export const REVISION_UPSTREAM_FIELDS = Object.freeze(['type', 'path', 'digest', 'rationale']);
export const REVISION_ANALYSIS_FIELDS = Object.freeze(['type', 'disposition', 'path', 'digest', 'reason']);
export const REVISION_STATEMENT_FIELDS = Object.freeze(['type', 'path', 'digest', 'statement', 'intended_change', 'reason']);
export const REVISION_QUALITY_FIELDS = Object.freeze(['record', 'record_digest', 'operation_id', 'source_set_digest', 'sources', 'association', 'disposition', 'reason']);

export const REVIEWED_BINDING_FORMAT = Object.freeze({ schema_version: '3',
  command_fields: ['gate', 'material', 'reviewer', 'reviewed', 'update_draft'],
  material: 'Bound private material or an exact contained Run source path/digest; at most 131072 bytes. The owner publishes the canonical document atomically.',
  relationship: 'The current gate relationship and exact approved source come from the canonical Run; callers do not duplicate their mapping in proof files.',
  review: { fields: ['reviewer', 'reviewed'], reviewed: true, storage: 'Embedded attestation in the canonical Artefact Binding; no RECORD/REVIEW JSON files.' },
  update_draft: 'false for first recording; true only for a reviewed replacement of the same unapproved recorded draft. Never edit an approved document.' });
export const REVISION_PROPOSAL_FORMAT = Object.freeze({ schema_version: SOURCE_REVISION_PROPOSAL_VERSION, policy_version: 2, fields: REVISION_PROPOSAL_FIELDS,
  changed_statements: REVISION_STATEMENT_FIELDS, quality_assessment: REVISION_QUALITY_FIELDS,
  initiating_phase: 'Actual current PRD/SD/TP/Brownfield Analysis/CD+Tests/QA/pending UAT; choose the earliest approved changed source, never by phase alone.',
  quality: 'Cover every current registered analysis/result and evidence row exactly; bind report, source set, original operation and record digest. Unknown associations require reassess. Use the inspected current facts; no invented dependency proof.',
  impact_assessment: { fields: REVISION_IMPACT_FIELDS, upstream: REVISION_UPSTREAM_FIELDS, analyses: REVISION_ANALYSIS_FIELDS,
    dispositions: ['retain', 'reassess'], unresolved: [], earliest_source: 'Must match source_gate; unchanged upstream needs actual rationale. UR requires reassess for both applicable analyses.' },
  sources: 'Use the exact current sources returned by the existing preview boundary, in UR/PRD/SD/TP order; the eligible boundary determines the subset.',
  preview: 'Read-only preview returns actual impact, preview_digest and the exact confirmation_selector. Do not derive authorization from a preview.',
  recovery: 'Keep the original UUID, proposal and inspected pending digest/current recovery revision; never submit a new intent to repair the original.' });
