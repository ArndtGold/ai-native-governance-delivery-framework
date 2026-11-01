import { SUMMARY_KINDS } from '../control-evaluation/work-vocabulary.js';
import { RUN_ID_PATTERN, runDocumentPath, runEvidencePath } from './run-identity.js';
const exactObject = (v, keys) => !!v && typeof v === 'object' && !Array.isArray(v)
  && Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k));
const id = value => typeof value === 'string' && RUN_ID_PATTERN.test(value);
const hash = value => typeof value === 'string' && /^sha256:[a-f0-9]{64}$/u.test(value);
const text = value => typeof value === 'string' && !value.includes('\0');
const list = value => Array.isArray(value) && value.every(text);
const sourcePath = (value, runId) => typeof value === 'string'
  && [runDocumentPath(runId, ''), runEvidencePath(runId, '')].some(prefix => value.startsWith(`${prefix}/`))
  && !/[\\:%?#\0]/u.test(value) && value.split('/').every(part => part && part !== '.' && part !== '..');

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
      && text(row.decisive_obligation.action) && sourcePath(row.decisive_obligation.source_path, runId))
    && Number.isSafeInteger(row.open_obligation_count) && row.open_obligation_count >= 0 && row.open_obligation_count <= 64
    && text(row.display_action) && Array.isArray(row.sources) && row.sources.length <= 64
    && row.sources.every(s => exactObject(s, ['path', 'digest', 'state']) && sourcePath(s.path, runId) && hash(s.digest) && s.state === 'available')
    && list(row.limitations) && row.authorizes === false;
}
