import { readControlLayout } from './control-layout.js';
import { existsSync, readdirSync, lstatSync, currentControlReadView } from '../control-read/fs.js';
import { captureControlScope, controlPathPresent } from '../control-read/snapshot.js';
import { join } from 'node:path';
import { inspectPlannedEntry, inspectPlannedOperation, PLANNED_ROOT } from './planned-entry.js';
import { inspectPlannedOrigins } from './planned-origin-reader.js';
import { readRunInventory } from './run-inventory-reader.js';
import { artefactFileDigest } from './run-seal.js';
import { RUN_ID_PATTERN } from './run-identity.js';
import { hasSymlinkComponent } from './contained-file.js';

const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const titleKey = title => title.normalize('NFKC').replace(/\s+/gu, ' ').trim().toLowerCase();
const rank = { high: 0, normal: 1, low: 2 };

export function projectPlannedInventory(root, { language = 'en' } = {}) {
  readControlLayout(root);
  const entries = [], findings = [];
  if (!existsSync(join(root, PLANNED_ROOT))) throw Error('AGDF_PLANNED_STORE_MISSING');
  if (hasSymlinkComponent(root, PLANNED_ROOT) || !lstatSync(join(root, PLANNED_ROOT)).isDirectory()) throw Error('AGDF_PLANNED_PATH_INVALID');
  const names = readdirSync(join(root, PLANNED_ROOT));
  if (names.length > 20000) throw Error('AGDF_PLANNED_INVENTORY_LIMIT');
  for (const name of names.filter(name => !RUN_ID_PATTERN.test(name))) {
    if (/^\.entry-[a-z0-9][a-z0-9._-]{0,127}\.lock(?:\.reclaim)?$/u.test(name)) continue;
    const staged = name.match(/^\.stage-(plan-[a-f0-9-]{36})-([a-f0-9-]{36})$/u);
    if (staged) {
      try {
        const operation = inspectPlannedOperation(root, staged[1], staged[2]);
        if (operation.status !== 'pending' || !operation.pending) throw Error('planned_stage_unknown');
        findings.push({ plan_id: staged[1], code: 'planned_creation_pending', operation_id: staged[2] });
        entries.push({ kind: 'planned', identity: `planned/${staged[1]}`, plan_id: staged[1], title: staged[1], priority: null,
          source: { path: `${PLANNED_ROOT}/${staged[1]}/UR.md`, digest: null, raw_digest: null }, coverage: 'recovery_required',
          run_id: null, handoff_ready: false, diagnostics: [{ code: 'planned_creation_pending', operation_id: staged[2] }],
          actions: ['inspect_original_operation'], authorizes: false });
      } catch (error) { findings.push({ code: 'planned_stage_unknown', path: `${PLANNED_ROOT}/${name}`, reason: error.code ?? error.message }); }
    } else findings.push({ code: 'planned_name_unsupported', path: `${PLANNED_ROOT}/${name}` });
  }
  for (const id of names.filter(name => RUN_ID_PATTERN.test(name)).sort()) {
    try {
      const entry = inspectPlannedEntry(root, id, { presentationLanguage: language }), origins = inspectPlannedOrigins(root, id);
      const handedOff = origins.matches.length === 1 && origins.complete;
      const handoffPending = controlPathPresent(root, `${PLANNED_ROOT}/${id}/HANDOFF_PENDING.json`);
      const orphanTransfer = !handedOff && controlPathPresent(root, `${PLANNED_ROOT}/${id}/TRANSFER.json`);
      if (orphanTransfer) origins.findings.push({ code: 'planned_transfer_unconfirmed', plan_id: id });
      const coverage = !origins.complete || orphanTransfer ? 'unconfirmed' : handedOff ? 'transferred' : entry.pending || handoffPending ? 'recovery_required'
        : entry.readiness.ready ? 'ready' : 'draft';
      entries.push({ kind: 'planned', identity: `planned/${id}`, plan_id: id, title: entry.title, priority: entry.priority,
        source: { path: entry.path, digest: entry.digest, raw_digest: entry.raw_digest }, coverage,
        run_id: handedOff ? origins.matches[0].run_id : null, handoff_ready: coverage === 'ready',
        diagnostics: origins.findings, actions: handedOff ? ['inspect_source', 'open_run'] : coverage === 'unconfirmed' || coverage === 'recovery_required'
          ? ['inspect_source', 'inspect_original_operation'] : ['inspect_source', 'continue_planning'], authorizes: false });
      findings.push(...origins.findings.map(row => ({ ...row, plan_id: id })));
    } catch (error) {
      findings.push({ plan_id: id, code: error.code ?? error.message });
      entries.push({ kind: 'planned', identity: `planned/${id}`, plan_id: id, title: id, priority: null,
        source: { path: `${PLANNED_ROOT}/${id}/UR.md`, digest: null, raw_digest: null }, coverage: 'unavailable', run_id: null,
        handoff_ready: false, diagnostics: [{ code: error.code ?? error.message }], actions: ['retry_inspection'], authorizes: false });
    }
  }
  entries.sort((a, b) => (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3) || compare(titleKey(a.title), titleKey(b.title)) || compare(a.plan_id, b.plan_id));
  return { schema_version: 'planned-inventory/1', state: findings.length ? 'partial' : 'complete', entries, findings, authorizes: false };
}

export function readPlannedInventory(root, options) {
  try { return currentControlReadView()?.readOptionalFileSync ? projectPlannedInventory(root, options) : captureControlScope(root, () => projectPlannedInventory(root, options)).data; }
  catch (error) { return { schema_version: 'planned-inventory/1', state: 'unavailable', entries: [], findings: [{ code: error.code ?? error.message }], authorizes: false }; }
}

export function readWorkInventory(root, options = {}) {
  try {
    readControlLayout(root);
    const project = () => {
      const planned = projectPlannedInventory(root, options), runs = readRunInventory(root, options);
      const references = planned.entries.filter(row => row.coverage === 'transferred');
      const entries = [...planned.entries.filter(row => row.coverage !== 'transferred'), ...runs.runs.map(row => ({ ...row,
        kind: 'run', identity: `run/${row.run_id}`, source: { path: row.path, digest: row.valid ? artefactFileDigest(root, row.path) : null },
        planning_origins: references.filter(ref => ref.run_id === row.run_id).map(ref => ({ plan_id: ref.plan_id, source: ref.source })),
        coverage: row.valid ? 'available' : 'unavailable', actions: ['open_run'], authorizes: false }))];
      return { schema_version: 'work-inventory/1', state: planned.state === 'partial' || runs.state !== 'complete' ? 'partial' : 'complete',
        entries, planning_references: references, findings: [...planned.findings, ...runs.findings, ...runs.runs.flatMap(row => row.findings)],
        counts: { planned: planned.entries.length - references.length, runs: runs.runs.length, planning_references: references.length }, authorizes: false };
    };
    return currentControlReadView()?.readOptionalFileSync ? project() : captureControlScope(root, project).data;
  } catch (error) { return { schema_version: 'work-inventory/1', state: 'unavailable', entries: [], planning_references: [],
    findings: [{ code: error.code ?? error.message }], counts: null, authorizes: false }; }
}
