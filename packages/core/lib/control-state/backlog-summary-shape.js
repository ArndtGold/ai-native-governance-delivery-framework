import { SUMMARY_KINDS } from '../control-evaluation/backlog-vocabulary.js';
const exactObject = (v, keys) => !!v && typeof v === 'object' && !Array.isArray(v)
  && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
export const BACKLOG_SUMMARY_FIELDS = ['schema_version', 'target_id', 'run_id', 'section', 'row_digest', 'revision_id', 'observed_at',
  'kind', 'phase', 'qa_outcome', 'lifecycle', 'recorded_approvals', 'decisive_obligation', 'open_obligation_count',
  'display_action', 'sources', 'limitations', 'authorizes'];
const id = value => typeof value === 'string' && /^[A-Za-z0-9_-]{1,128}$/u.test(value);
const hash = value => typeof value === 'string' && /^sha256:[a-f0-9]{64}$/u.test(value);
const text = value => typeof value === 'string' && !value.includes('\0');
const list = value => Array.isArray(value) && value.every(text);
const sourcePath = value => typeof value === 'string' && value.startsWith('.agdf/control/artefacts/')
  && !/[\\:%?#\0]/u.test(value) && value.split('/').every(part => part && part !== '.' && part !== '..');
const sections = ['Active Backlog', 'Planned / Parking Lot', 'Completed / Superseded Pointers'];

export function validBacklogSummary(row) {
  return exactObject(row, BACKLOG_SUMMARY_FIELDS) && row.schema_version === 1 && hash(row.target_id) && id(row.run_id)
    && sections.includes(row.section) && hash(row.row_digest)
    && typeof row.revision_id === 'string' && /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/u.test(row.revision_id)
    && text(row.observed_at) && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{3})?Z$/u.test(row.observed_at) && Number.isFinite(Date.parse(row.observed_at))
    && validWorkSummary(row, row.run_id);
}

export function validWorkSummary(row, runId) {
  if (!row || !id(runId)) return false;
  return SUMMARY_KINDS.includes(row.kind) && text(row.phase)
    && ['not_applicable', 'missing', 'unconfirmed', 'pass', 'revise', 'block'].includes(row.qa_outcome)
    && ['active', 'completed', 'superseded', 'abandoned'].includes(row.lifecycle)
    && list(row.recorded_approvals) && row.recorded_approvals.length <= 6
    && row.recorded_approvals.every(g => ['UR', 'PRD', 'SD', 'TP', 'QA', 'UAT'].includes(g))
    && (row.decisive_obligation === null || exactObject(row.decisive_obligation, ['id', 'routing_target', 'action', 'source_path'])
      && text(row.decisive_obligation.id) && row.decisive_obligation.id.length <= 128
      && ['UR', 'PRD', 'SD', 'TP', 'CD+Tests', 'evidence_obligation'].includes(row.decisive_obligation.routing_target)
      && text(row.decisive_obligation.action) && sourcePath(row.decisive_obligation.source_path)
      && row.decisive_obligation.source_path.startsWith(`.agdf/control/artefacts/${runId}/`))
    && Number.isSafeInteger(row.open_obligation_count) && row.open_obligation_count >= 0 && row.open_obligation_count <= 64
    && text(row.display_action) && Array.isArray(row.sources) && row.sources.length <= 64
    && row.sources.every(s => exactObject(s, ['path', 'digest', 'state']) && sourcePath(s.path)
      && s.path.startsWith(`.agdf/control/artefacts/${runId}/`) && hash(s.digest) && s.state === 'available')
    && list(row.limitations) && row.authorizes === false;
}
