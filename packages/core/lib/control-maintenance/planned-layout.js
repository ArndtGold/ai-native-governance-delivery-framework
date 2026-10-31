import { existsSync, mkdirSync, unlinkSync, readdirSync, rmdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { atomicWrite, fsyncDirectory, withOwnedFileLock } from '../owned-file-lock.js';
import { readContainedControlText, READ_LIMITS } from '../control-read/snapshot.js';
import { canonicalJson, digest, exactObject, COOPERATIVE_ASSURANCE, DIGEST_PATTERN, resolveControlCommandTarget } from '../control-state/approval-command-contract.js';
import { bindInputResolution, resolutionRecord, recordedInputResolution, withInputResolution } from '../control-state/input-resolution.js';
import { pluginDefinition } from '../resources/context.js';
import { withLayoutMaintenance, inspectLayoutMaintenance, LEGACY_LAYOUT, PLANNED_LAYOUT, readControlLayout } from '../control-state/control-layout.js';
import { hasSymlinkComponent, isSafeControlRelativePath } from '../control-state/contained-file.js';
import { REVISION_ID_PATTERN, RUN_ID_PATTERN } from '../control-state/run-identity.js';
import { parseRunState } from '../control-state/run-state-parser.js';
import { validRunOperation } from '../control-state/run-operations.js';
import { computeRunSeals, applyRunSeals, canonicalRunText, runSealState } from '../control-state/run-seal.js';
import { layoutMigrationCandidate, validLayoutSourceManifest } from '../control-state/layout-migration-proof.js';
import { writeRunLocked } from '../control-state/run-state-writer.js';
import { parsePlannedUr } from '../control-state/planned-entry.js';
import { collectPlannedLayoutPreview, previewPlannedLayout, LAYOUT_PENDING, LAYOUT_RECEIPTS, layoutJson } from './planned-layout-preview.js';

export { previewPlannedLayout };
const LIMIT = READ_LIMITS.file;
const CONFIG = '.agdf/control/config.json', BACKLOG = '.agdf/control/MASTER_BACKLOG.md';
const fail = code => { throw Error(code); };
const read = (root, path) => readContainedControlText(root, path, LIMIT);
function present(root, path) {
  if (hasSymlinkComponent(root, path)) fail('AGDF_LAYOUT_PATH_INVALID');
  return existsSync(join(root, path));
}
function directories(root, path) {
  if (!path.startsWith('.agdf/control/') || !isSafeControlRelativePath(path) || hasSymlinkComponent(root, path)) fail('AGDF_LAYOUT_PATH_INVALID');
  const components = path.split('/');
  for (let i = 3; i <= components.length; i++) {
    const relative = components.slice(0, i).join('/'), absolute = join(root, relative);
    if (!present(root, relative)) { mkdirSync(absolute, { mode: 0o700 }); fsyncDirectory(dirname(absolute)); }
    // The shared containment reader rejects a non-directory ancestor on use.
  }
}
function immutable(root, path, content) {
  directories(root, dirname(path));
  if (present(root, path)) { if (read(root, path) !== content) fail('AGDF_LAYOUT_FOREIGN_BYTES'); }
  else atomicWrite(join(root, path), content);
}
const receiptPath = operationId => `${LAYOUT_RECEIPTS}/${operationId}.json`;
function previewHash(report) {
  const { preview_digest, ...base } = report;
  return digest(canonicalJson({ ...base, confirmation: null }));
}

function nextRun(root, old, receipt) {
  const candidate = layoutMigrationCandidate(old, receipt).replace(/^- revision:.*$/mu, `- revision: ${receipt.effect.revision}`)
    .replace(/^- revision_id:.*$/mu, `- revision_id: ${receipt.effect.resulting_revision_id}`)
    .replace(/^- updated_at:.*$/mu, `- updated_at: ${receipt.created_at}`);
  // The old-state archive is an immutable artefact not yet published during plan
  // construction. All other digests use the normal seal owner unchanged.
  return applyRunSeals(candidate, computeRunSeals(root, candidate, { artefactDigests: new Map([
    [receipt.effect.record.archive.path, digest(canonicalRunText(old))],
  ]) }));
}
function makeIntent(root, collected, { operation_id, request_digest, packageVersion = pluginDefinition.version }) {
  const { report, source_manifest_text, sources, entries } = collected;
  const created_at = new Date().toISOString(), target_id = report.target_id;
  const upgrades = report.runs.filter(run => run.action === 'upgrade_v3').map(run => {
    const old = sources.get(run.path), state = parseRunState(old);
    const receipt = bindInputResolution({ schema_version: '3', kind: 'control_layout.migrate', operation_id, request_digest,
      target_id, run_id: run.run_id, expected_revision_id: run.revision_id, created_at,
      producer: { contract: 'run-command/1', package_version: packageVersion }, assurance: COOPERATIVE_ASSURANCE,
      effect: { previous_revision_id: run.revision_id, resulting_revision_id: randomUUID(), revision: Number(state.meta.revision) + 1,
        record: { from_version: 2, to_version: 3, layout: PLANNED_LAYOUT,
          archive: { path: `.agdf/control/artefacts/${run.run_id}/CONTROL_LAYOUT_V2.md`, digest: digest(old) },
          source_snapshot: { path: `${report.snapshot_root}/SOURCE_MANIFEST.json`, digest: report.source_snapshot_digest } } } });
    return { run_id: run.run_id, path: run.path, receipt, next: nextRun(root, old, receipt) };
  });
  const intent = bindInputResolution({ schema_version: 1, operation_id, request_digest, target_id, report, source_manifest_text,
    sources: [...sources].map(([path, content]) => ({ path, content })), entries, upgrades });
  if (Buffer.byteLength(layoutJson(intent)) > LIMIT) fail('AGDF_LAYOUT_TRANSACTION_LIMIT');
  return intent;
}

// Closed journal: all writable paths and complete future bytes are derived from
// the confirmed report, immutable old Run, typed receipt and existing seal owner.
function validateIntent(root, stored) {
  const value = resolutionRecord(stored);
  if (!exactObject(value, ['schema_version', 'operation_id', 'request_digest', 'target_id', 'report', 'source_manifest_text', 'sources', 'entries', 'upgrades'])
    || value.schema_version !== 1 || !REVISION_ID_PATTERN.test(value.operation_id) || !DIGEST_PATTERN.test(value.request_digest)
    || value.target_id !== resolveControlCommandTarget(root).target_id || value.report?.target_id !== value.target_id
    || previewHash(value.report) !== value.report.preview_digest || value.report.blockers.length
    || value.report.confirmation !== `Migrate planned layout: ${value.report.preview_digest}`
    || !Array.isArray(value.sources) || value.sources.length > 20000 || !Array.isArray(value.entries) || !Array.isArray(value.upgrades)) fail('AGDF_LAYOUT_JOURNAL_INVALID');
  const maintenance = inspectLayoutMaintenance(root), marker = maintenance.marker;
  if (maintenance.state !== 'pending' || marker.schema_version !== 2 || marker.operation_id !== value.operation_id
    || marker.request_digest !== value.request_digest || marker.preview_digest !== value.report.preview_digest
    || marker.config_digest !== value.report.config_digest) fail('AGDF_LAYOUT_JOURNAL_BINDING_INVALID');
  const manifest = JSON.parse(value.source_manifest_text), sourceMap = new Map();
  if (!validLayoutSourceManifest(manifest) || digest(value.source_manifest_text) !== value.report.source_snapshot_digest
    || value.report.snapshot_root !== `.agdf/control/maintenance/planned-layout/${value.report.source_snapshot_digest.slice(7)}`
    || value.sources.length !== manifest.sources.length) fail('AGDF_LAYOUT_JOURNAL_INVALID');
  for (const row of value.sources) {
    if (!exactObject(row, ['path', 'content']) || typeof row.content !== 'string' || sourceMap.has(row.path)
      || manifest.sources.find(source => source.path === row.path)?.digest !== digest(row.content)) fail('AGDF_LAYOUT_JOURNAL_INVALID');
    sourceMap.set(row.path, row.content);
  }
  const config = sourceMap.get(CONFIG);
  if (digest(config ?? '') !== value.report.config_digest || value.report.config_next !== layoutJson({ ...JSON.parse(config.replace(/^\uFEFF/u, '')), control_layout: PLANNED_LAYOUT })
    || !sourceMap.has(BACKLOG)) fail('AGDF_LAYOUT_JOURNAL_INVALID');
  const expectedEntries = value.report.entries;
  if (value.entries.length !== expectedEntries.length || new Set(value.entries.map(row => row.plan_id)).size !== value.entries.length) fail('AGDF_LAYOUT_JOURNAL_INVALID');
  for (const entry of value.entries) {
    const expected = expectedEntries.find(row => row.plan_id === entry.plan_id);
    if (!exactObject(entry, ['plan_id', 'path', 'digest', 'content']) || !expected
      || entry.path !== `.agdf/control/planned/${entry.plan_id}/UR.md` || !/^plan-legacy-[a-f0-9]{16}-[1-9][0-9]*$/u.test(entry.plan_id)
      || canonicalJson(expected) !== canonicalJson({ plan_id: entry.plan_id, path: entry.path, digest: entry.digest })
      || digest(entry.content) !== entry.digest || parsePlannedUr(entry.content, entry.plan_id).digest !== entry.digest
      || !/^Requirements clarification: open$/mu.test(entry.content) || !/^Gate approval: open$/mu.test(entry.content)) fail('AGDF_LAYOUT_JOURNAL_INVALID');
  }
  const runs = value.report.runs;
  if (!Array.isArray(runs) || runs.length > 256 || new Set(runs.map(run => run.run_id)).size !== runs.length
    || runs.length !== [...sourceMap.keys()].filter(path => /^\.agdf\/control\/runs\/[^/]+\/RUN_STATE\.md$/u.test(path)).length
    || runs.some(run => {
      if (!RUN_ID_PATTERN.test(run.run_id ?? '') || run.path !== `.agdf/control/runs/${run.run_id}/RUN_STATE.md`
        || !sourceMap.has(run.path) || run.digest !== digest(sourceMap.get(run.path))) return true;
      const state = parseRunState(sourceMap.get(run.path), run.run_id);
      return !state.valid || state.meta.control_state_version !== '2' || run.revision_id !== state.meta.revision_id
        || run.action !== (state.meta.lifecycle === 'active' ? 'upgrade_v3' : 'retain_v2');
    })) fail('AGDF_LAYOUT_JOURNAL_INVALID');
  const expectedRuns = runs.filter(run => run.action === 'upgrade_v3');
  if (value.upgrades.length !== expectedRuns.length || new Set(value.upgrades.map(row => row.run_id)).size !== value.upgrades.length) fail('AGDF_LAYOUT_JOURNAL_INVALID');
  for (const upgrade of value.upgrades) {
    const receipt = resolutionRecord(upgrade.receipt), old = sourceMap.get(upgrade.path), expected = expectedRuns.find(run => run.run_id === upgrade.run_id);
    if (!exactObject(upgrade, ['run_id', 'path', 'receipt', 'next']) || !expected || expected.path !== upgrade.path
      || digest(old ?? '') !== expected.digest || !validRunOperation(receipt) || receipt.kind !== 'control_layout.migrate'
      || receipt.run_id !== upgrade.run_id || receipt.target_id !== value.target_id || receipt.operation_id !== value.operation_id
      || receipt.request_digest !== value.request_digest || receipt.expected_revision_id !== expected.revision_id
      || receipt.effect.record.archive.digest !== digest(old) || receipt.effect.record.source_snapshot.digest !== value.report.source_snapshot_digest
      || receipt.effect.revision !== Number(parseRunState(old).meta.revision) + 1 || nextRun(root, old, receipt) !== upgrade.next) fail('AGDF_LAYOUT_JOURNAL_INVALID');
  }
  return { value, manifest, sourceMap };
}

function withRunLocks(root, runs, work, index = 0) {
  return index === runs.length ? work() : withOwnedFileLock(join(root, runs[index].path), () => withRunLocks(root, runs, work, index + 1));
}
function exactSourceState(root, value, sourceMap) {
  for (const [path, old] of sourceMap) {
    if (path.startsWith('@plugin/')) continue;
    const current = present(root, path) ? read(root, path) : null;
    const next = path === CONFIG ? value.report.config_next : value.upgrades.find(run => run.path === path)?.next;
    if (current !== old && current !== next && !(path === BACKLOG && current === null)) fail('AGDF_LAYOUT_FOREIGN_BYTES');
  }
}
function executeIntent(root, stored, options = {}) {
  const resolution = recordedInputResolution(stored);
  return withInputResolution(resolution, () => executeIntentBound(root, stored, options), Boolean(resolution));
}
function executeIntentBound(root, stored, { checkpoint = () => {}, recover = false } = {}) {
  const { value, manifest, sourceMap } = validateIntent(root, stored), report = value.report;
  return withRunLocks(root, report.runs, () => {
    exactSourceState(root, value, sourceMap);
    const committed = read(root, CONFIG) === report.config_next;
    const archiveFile = source => `${report.snapshot_root}/${source.snapshot_name}`;
    // Archive publication is idempotent and only accepts byte-exact owned outputs.
    for (const source of manifest.sources) immutable(root, archiveFile(source), sourceMap.get(source.path));
    immutable(root, `${report.snapshot_root}/SOURCE_MANIFEST.json`, value.source_manifest_text);
    immutable(root, `${report.snapshot_root}/ROW_DISPOSITIONS.json`, layoutJson({ schema_version: 1, rows: report.rows, unparsed_spans: report.unparsed_spans }));
    checkpoint('migration_archived');
    if (recover && !committed) {
      // Only known precommit Run/entry effects may be restored. Immutable history
      // stays as evidence; unknown or foreign bytes are never removed.
      for (const upgrade of value.upgrades) {
        if (read(root, upgrade.path) === upgrade.next) atomicWrite(join(root, upgrade.path), sourceMap.get(upgrade.path));
      }
      for (const entry of value.entries) if (present(root, entry.path)) {
        if (read(root, entry.path) !== entry.content || readdirSync(dirname(join(root, entry.path))).some(name => name !== 'UR.md')) fail('AGDF_LAYOUT_FOREIGN_BYTES');
        unlinkSync(join(root, entry.path)); fsyncDirectory(dirname(join(root, entry.path)));
        rmdirSync(dirname(join(root, entry.path))); fsyncDirectory(dirname(dirname(join(root, entry.path))));
      }
      if (!present(root, BACKLOG)) atomicWrite(join(root, BACKLOG), sourceMap.get(BACKLOG));
      const result = { schema_version: 1, operation_id: value.operation_id, request_digest: value.request_digest,
        preview_digest: report.preview_digest, source_snapshot_digest: report.source_snapshot_digest, outcome: 'rolled_back', authorizes: false };
      const receipt = bindInputResolution(result);
      immutable(root, receiptPath(value.operation_id), layoutJson(receipt));
      unlinkSync(join(root, LAYOUT_PENDING)); fsyncDirectory(dirname(join(root, LAYOUT_PENDING)));
      return { ...result, receipt };
    }
    for (const upgrade of value.upgrades) {
      const receipt = resolutionRecord(upgrade.receipt), old = sourceMap.get(upgrade.path), archive = receipt.effect.record.archive;
      immutable(root, archive.path, old);
      const current = read(root, upgrade.path);
      if (current === old) {
        if (committed) fail('AGDF_LAYOUT_COMMITTED_STATE_UNKNOWN');
        writeRunLocked(join(root, upgrade.path), layoutMigrationCandidate(old, upgrade.receipt), receipt.expected_revision_id, {
          expectedContent: old, nextRevisionId: receipt.effect.resulting_revision_id, updatedAt: receipt.created_at,
          appendedOperation: upgrade.receipt, validateBeforeWrite: () => exactSourceState(root, value, sourceMap) });
      } else if (current !== upgrade.next) fail('AGDF_LAYOUT_FOREIGN_BYTES');
      if (read(root, upgrade.path) !== upgrade.next || runSealState(root, upgrade.next).status !== 'valid') fail('AGDF_LAYOUT_RUN_UNTRUSTED');
      checkpoint('migration_run_published');
    }
    for (const entry of value.entries) immutable(root, entry.path, entry.content);
    checkpoint('migration_entries_published');
    if (!committed) {
      exactSourceState(root, value, sourceMap);
      if (read(root, BACKLOG) !== sourceMap.get(BACKLOG)) fail('AGDF_LAYOUT_FOREIGN_BYTES');
      // Archive is durable before retiring the last live shared backlog.
      unlinkSync(join(root, BACKLOG)); fsyncDirectory(dirname(join(root, BACKLOG))); checkpoint('migration_backlog_retired');
      atomicWrite(join(root, CONFIG), report.config_next); checkpoint('migration_config_committed');
    } else if (present(root, BACKLOG)) fail('AGDF_LAYOUT_COMMITTED_STATE_UNKNOWN');
    const result = { schema_version: 1, operation_id: value.operation_id, request_digest: value.request_digest,
      preview_digest: report.preview_digest, source_snapshot_digest: report.source_snapshot_digest, outcome: 'applied', authorizes: false };
    const receipt = bindInputResolution(result);
    immutable(root, receiptPath(value.operation_id), layoutJson(receipt));
    checkpoint('migration_receipt');
    unlinkSync(join(root, LAYOUT_PENDING)); fsyncDirectory(dirname(join(root, LAYOUT_PENDING))); checkpoint('migration_retired');
    return { ...result, receipt };
  });
}

export function inspectPlannedLayoutOperation(root, operationId) {
  if (!REVISION_ID_PATTERN.test(operationId ?? '')) fail('AGDF_LAYOUT_OPERATION_INVALID');
  const marker = inspectLayoutMaintenance(root);
  let receipt = null, receiptResolution = null, recorded_receipt = null;
  if (present(root, receiptPath(operationId))) {
    const stored = JSON.parse(read(root, receiptPath(operationId))); recorded_receipt = stored; receipt = resolutionRecord(stored); receiptResolution = recordedInputResolution(stored);
    if (!exactObject(receipt, ['schema_version', 'operation_id', 'request_digest', 'preview_digest', 'source_snapshot_digest', 'outcome', 'authorizes'])
      || receipt.schema_version !== 1 || receipt.operation_id !== operationId || !['applied', 'rolled_back'].includes(receipt.outcome)
      || receipt.authorizes !== false || ![receipt.request_digest, receipt.preview_digest, receipt.source_snapshot_digest].every(value => DIGEST_PATTERN.test(value))) fail('AGDF_LAYOUT_RECEIPT_INVALID');
  }
  const pending = present(root, LAYOUT_PENDING) ? read(root, LAYOUT_PENDING) : null;
  const belongs = marker.state === 'pending' && marker.marker.operation_id === operationId;
  return { status: receipt ? belongs ? 'recorded_recovery_required' : 'recorded' : belongs ? 'pending' : 'absent', receipt, recorded_receipt,
    pending_digest: belongs ? digest(pending ?? canonicalJson(marker.stored)) : null, marker,
    input_resolution: pending ? recordedInputResolution(JSON.parse(pending)) : receiptResolution ?? marker.input_resolution ?? null, authorizes: false };
}

export function applyPlannedLayout(root, { operation_id, preview_digest, confirmation, request_digest = digest(canonicalJson({ preview_digest, confirmation })) }, options = {}) {
  if (!REVISION_ID_PATTERN.test(operation_id ?? '') || !DIGEST_PATTERN.test(preview_digest ?? '')
    || !DIGEST_PATTERN.test(request_digest) || confirmation !== `Migrate planned layout: ${preview_digest}`) fail('AGDF_LAYOUT_CONFIRMATION_REQUIRED');
  const previous = inspectPlannedLayoutOperation(root, operation_id);
  if (previous.receipt) {
    if (previous.receipt.request_digest !== request_digest) fail('AGDF_OPERATION_PAYLOAD_CONFLICT');
    if (previous.status === 'recorded') return { ...previous.receipt, outcome: 'already_applied', historical_outcome: previous.receipt.outcome, receipt: previous.recorded_receipt };
  }
  if (previous.status === 'pending' || previous.status === 'recorded_recovery_required') fail('AGDF_LAYOUT_RECOVERY_REQUIRED');
  const collected = collectPlannedLayoutPreview(root), report = collected.report;
  if (report.preview_digest !== preview_digest) fail('AGDF_LAYOUT_PREVIEW_STALE');
  if (report.blockers.length) fail('AGDF_LAYOUT_PREVIEW_BLOCKED');
  // Reject a journal that cannot be persisted before freezing ordinary writers.
  makeIntent(root, collected, { operation_id, request_digest, packageVersion: options.packageVersion });
  return withLayoutMaintenance(root, { operation_id, request_digest, preview_digest, config_digest: report.config_digest, checkpoint: options.checkpoint }, () => {
    const fresh = collectPlannedLayoutPreview(root);
    if (fresh.report.preview_digest !== preview_digest) fail('AGDF_LAYOUT_PREVIEW_STALE');
    const intent = makeIntent(root, fresh, { operation_id, request_digest, packageVersion: options.packageVersion });
    atomicWrite(join(root, LAYOUT_PENDING), layoutJson(intent)); options.checkpoint?.('migration_intent');
    return executeIntent(root, intent, options);
  });
}

export function recoverPlannedLayout(root, { operation_id, pending_digest }, options = {}) {
  const status = inspectPlannedLayoutOperation(root, operation_id), marker = status.marker;
  if (status.status === 'recorded') return { ...status.receipt, outcome: 'already_applied', historical_outcome: status.receipt.outcome, receipt: status.recorded_receipt };
  if (marker.state !== 'pending' || marker.marker.operation_id !== operation_id || pending_digest !== status.pending_digest) fail('AGDF_LAYOUT_RECOVERY_MISMATCH');
  return withLayoutMaintenance(root, { ...marker.marker, checkpoint: options.checkpoint }, () => {
    if (present(root, LAYOUT_PENDING)) return executeIntent(root, JSON.parse(read(root, LAYOUT_PENDING)), { ...options, recover: true });
    if (status.receipt) return { ...status.receipt, receipt: status.recorded_receipt };
    // A marker before intent has no published transaction. In-flight admitted
    // legacy work may legitimately have completed while the freeze drained it.
    // Prove the entire live layout is still genuine legacy, with no pending
    // journal/new planned store/upgraded Run, before retiring this empty epoch.
    // Do not require the old preview to remain current after that admitted work.
    if (marker.marker.schema_version !== 2 || readControlLayout(root, { live: true }).layout !== LEGACY_LAYOUT
      || present(root, receiptPath(operation_id))) fail('AGDF_LAYOUT_RECOVERY_UNKNOWN');
    const fresh = collectPlannedLayoutPreview(root);
    if (fresh.report.blockers.length) fail('AGDF_LAYOUT_RECOVERY_UNKNOWN');
    const result = { schema_version: 1, outcome: 'rolled_back', operation_id, request_digest: marker.marker.request_digest,
      preview_digest: marker.marker.preview_digest, source_snapshot_digest: fresh.report.source_snapshot_digest, authorizes: false };
    const receipt = withInputResolution(marker.input_resolution, () => bindInputResolution(result), Boolean(marker.input_resolution));
    immutable(root, receiptPath(operation_id), layoutJson(receipt));
    return { ...result, receipt, source_changed: fresh.report.preview_digest !== marker.marker.preview_digest,
      next_action: 'No cutover was published. Obtain a fresh complete preview before a new apply.', authorizes: false };
  });
}
