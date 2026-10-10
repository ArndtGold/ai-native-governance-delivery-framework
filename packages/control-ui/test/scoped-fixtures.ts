import type { BacklogEntry, Detail, Envelope, Inventory, ReadingScope } from '../src/types';

export const fixtureMeta = { schema_version: '1' as const, target: { target_id: 'target', display_path: '/fixture' },
  snapshot_id: 'snapshot', observed_as_of: '2026-10-07T08:00:00Z', source_digest: 'digest', state: 'available' as const, code: null, retryable: false };
export function pointer(key: string, title = key): BacklogEntry {
  return { section: 'Active Backlog', key, original_key: key, title, stored_status: 'In progress', scope: 'framework-maintenance',
    priority: '1', stored_next_step: 'Stored next step', source_links: '[UR](UR.md)', current_spec: 'UR', selectable: true };
}
export function backlog(entries = [pointer('run-a'), pointer('run-b')]): Envelope<Inventory> {
  return { ...fixtureMeta, data: { kind: 'backlog', entries, diagnostics: [], source_path: '.agdf/control/MASTER_BACKLOG.md',
    content_digest: 'backlog-digest', counts: Object.fromEntries(['Active Backlog', 'Planned / Parking Lot', 'Completed / Superseded Pointers'].map(section => [section, entries.filter(e => e.section === section).length])), file_count: 1, byte_count: 100 } };
}
export function runData(id: string, title = id): Detail {
  return { run_id: id, title, revision_id: 'revision', lifecycle: 'active', resources: [],
    persisted: { current_gate: 'CD+Tests', decision: 'in_progress', next_allowed_action: 'Implement approved scope', artefacts: [] },
    evaluation: { status: 'open', current_gate: 'CD+Tests', blocking_reason: 'none', missing_approval: 'none', next_allowed_action: 'Implement approved scope',
      next_action_de: 'Freigegebenen Umfang umsetzen.', doctor_status: 'pass', quality_outlook: '', git_evidence: 'unavailable', diagnostics: [], approvals: [], missing_evidence: [], control_assessment: { state: 'open', authorizes: false } } };
}
export function runScope(run: Detail, snapshot = 'run-snapshot'): Envelope<ReadingScope> {
  return { ...fixtureMeta, snapshot_id: snapshot, data: { kind: 'run', run } };
}

export const revision = '00000000-0000-0000-0000-000000000001';
export function documentFixture(): Detail {
  const data = runData('run-a'); data.revision_id = revision;
  data.resources = ['UR', 'PRD', 'SD', 'TP'].map(type => ({resource_id:type,run_id:'run-a',type,path:`.agdf/control/artefacts/run-a/${type}.md`,registered_reference:`.agdf/control/artefacts/run-a/${type}.md`,status:'registered'}));
  data.document_states = data.resources.map(r => ({schema_version:'1',resource_id:r.resource_id,run_id:r.run_id,revision_id:revision,type:r.type,registered_reference:r.registered_reference,source_state:'available',content_digest:'a'.repeat(64),state:'draft',version_kind:'draft',reason:'not_checked',recorded_approval:null,check:null,authorizes:false}));
  return data;
}
