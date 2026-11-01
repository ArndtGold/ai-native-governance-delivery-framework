import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { atomicWrite, fsyncDirectory, withOwnedFileLock } from '../owned-file-lock.js';
import { renameSyncWithRetry } from '../fs-swap.js';
import { canonicalRunText } from './run-seal-compute.js';
import { exactObject, canonicalJson } from './approval-command-contract.js';
import { RUN_ID_PATTERN, REVISION_ID_PATTERN } from './run-identity.js';
import { hasSymlinkComponent, containedRegularFile } from './contained-file.js';
import { PLANNED_LAYOUT, readControlLayout, withControlMutation, withControlRecovery, inspectMutationClaims, markControlMutationEffect } from './control-layout.js';
import { evaluateUrContentReadiness } from '../control-evaluation/ur-readiness.js';
import { resolveArtifactPresentationLanguages } from '../resources/context.js';
import { readContainedControlText, controlPathPresent } from '../control-read/snapshot.js';
import { assertPlannedNotTransferred } from './planned-origin.js';
import { bindInputResolution, resolutionRecord } from './input-resolution.js';
import { existsSync as observedExists } from '../control-read/fs.js';

export const PLANNED_SCHEMA = 'planned-ur-v1';
export const PLANNED_ROOT = '.agdf/control/planned';
export const PLANNED_INTENT_BYTES = 1048576;
export const plannedTextDigest = text => 'sha256:' + createHash('sha256').update(canonicalRunText(text)).digest('hex');
export const plannedRawDigest = text => 'sha256:' + createHash('sha256').update(text).digest('hex');
const digestPattern = /^sha256:[a-f0-9]{64}$/u;
const fail = code => { throw Error(code); };
const priorities = ['high', 'normal', 'low'];
const json = value => JSON.stringify(value) + '\n';
export const planningId = operationId => {
  if (!REVISION_ID_PATTERN.test(operationId)) fail('AGDF_PLANNED_OPERATION_INVALID');
  return `plan-${operationId}`;
};
export function plannedEntryPath(id) {
  if (typeof id !== 'string' || !RUN_ID_PATTERN.test(id)) fail('AGDF_PLANNED_ID_INVALID');
  return `${PLANNED_ROOT}/${id}`;
}

function safeRead(root, path, limit = 131072) {
  try { return readContainedControlText(root, path, limit); }
  catch (error) { if (error.code === 'resource_denied') fail('AGDF_PLANNED_PATH_INVALID'); throw error; }
}
function ensureDirectory(root, relative) {
  if (hasSymlinkComponent(root, relative)) fail('AGDF_PLANNED_PATH_INVALID');
  const path = join(root, relative);
  if (!existsSync(path)) {
    try { mkdirSync(path, { mode: 0o700 }); fsyncDirectory(dirname(path)); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
  const stat = lstatSync(path);
  if (!stat.isDirectory() || stat.isSymbolicLink()) fail('AGDF_PLANNED_PATH_INVALID');
}
function validateContent(content) {
  if (typeof content !== 'string' || !content.isWellFormed() || Buffer.byteLength(content) > 131072
    || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(content)) fail('AGDF_PLANNED_CONTENT_INVALID');
  return canonicalRunText(content);
}
export function parsePlannedUr(content, expectedId) {
  const text = validateContent(content), metadata = text.split(/^##[ \t]+/mu)[0];
  const field = key => {
    const rows = [...metadata.matchAll(new RegExp(`^${key}:[ \\t]*([^\\n]*)$`, 'gmu'))];
    if (rows.length !== 1) fail('AGDF_PLANNED_METADATA_INVALID');
    return rows[0][1].trim();
  };
  const schema = field('Planning schema'), id = field('Planning id'), priority = field('Planning priority');
  if (schema !== PLANNED_SCHEMA || !RUN_ID_PATTERN.test(id) || expectedId && id !== expectedId || !priorities.includes(priority)) fail('AGDF_PLANNED_METADATA_INVALID');
  const titles = [...text.matchAll(/^# ([^\n]+)$/gmu)];
  if (titles.length !== 1 || !text.startsWith('# ') || !titles[0][1].trim() || titles[0][1].length > 1024) fail('AGDF_PLANNED_TITLE_INVALID');
  const title = titles[0][1].replace(/^UR:[ \t]*/u, '').trim();
  if (!title) fail('AGDF_PLANNED_TITLE_INVALID');
  return { schema, plan_id: id, priority, title, content: text, digest: plannedTextDigest(text) };
}

export function preparePlannedUr(content, id, priority = 'normal') {
  plannedEntryPath(id);
  const text = validateContent(content);
  if (!priorities.includes(priority) || /^Planning (schema|id|priority):/mu.test(text)) fail('AGDF_PLANNED_METADATA_INVALID');
  const end = text.indexOf('\n');
  if (end < 0) fail('AGDF_PLANNED_TITLE_INVALID');
  const candidate = text.slice(0, end + 1) + `\nPlanning schema: ${PLANNED_SCHEMA}\nPlanning id: ${id}\nPlanning priority: ${priority}\n` + text.slice(end + 1);
  return parsePlannedUr(candidate, id).content;
}

export function inspectPlannedEntry(root, id, { presentationLanguage } = {}) {
  const path = `${plannedEntryPath(id)}/UR.md`;
  const raw = safeRead(root, path), entry = parsePlannedUr(raw, id);
  const readiness = evaluateUrContentReadiness(entry.content, { languages: resolveArtifactPresentationLanguages(root, presentationLanguage), path, requireClarification: true });
  return { ...entry, raw_digest: plannedRawDigest(raw), path, readiness, pending: controlPathPresent(root, `${plannedEntryPath(id)}/MUTATION_PENDING.json`), authorizes: false };
}

export function withPlannedEntryLock(root, id, work, { operation_id, recovery = false, resume = false, proveOutcome, checkpoint } = {}) {
  const path = plannedEntryPath(id);
  if (readControlLayout(root).layout !== PLANNED_LAYOUT) fail('AGDF_CONTROL_LAYOUT_MIGRATION_REQUIRED');
  ensureDirectory(root, PLANNED_ROOT);
  if (hasSymlinkComponent(root, path)) fail('AGDF_PLANNED_PATH_INVALID');
  return withOwnedFileLock(join(root, PLANNED_ROOT, `.entry-${id}`), () => {
    const resource = `planned:${id}`;
    const recovering = recovery || resume && inspectMutationClaims(root, { strict: false }).some(row => row.resource === resource && row.operation_id === operation_id);
    return recovering ? withControlRecovery(root, { resource, operation_id, proveOutcome }, work)
      : withControlMutation(root, { resource, operation_id, checkpoint }, work);
  });
}

function validReceipt(receipt, id) {
  receipt = resolutionRecord(receipt);
  if (!receipt) return false;
  return exactObject(receipt, ['schema_version', 'kind', 'operation_id', 'plan_id', 'request_digest', 'previous_digest', 'resulting_digest'])
    && receipt.schema_version === 1 && ['planned_ur.create', 'planned_ur.replace'].includes(receipt.kind)
    && REVISION_ID_PATTERN.test(receipt.operation_id) && receipt.plan_id === id && digestPattern.test(receipt.request_digest)
    && (receipt.previous_digest === null || digestPattern.test(receipt.previous_digest)) && digestPattern.test(receipt.resulting_digest)
    && (receipt.kind === 'planned_ur.create' ? receipt.previous_digest === null : receipt.previous_digest !== null);
}
function receiptPath(id, operationId) { return `${plannedEntryPath(id)}/operations/${operationId}.json`; }
function receiptAt(root, id, operationId) {
  const path = receiptPath(id, operationId);
  if (!existsSync(join(root, path))) return null;
  let receipt; try { receipt = JSON.parse(safeRead(root, path, 16384)); } catch { fail('AGDF_PLANNED_RECOVERY_REQUIRED'); }
  if (!validReceipt(receipt, id) || receipt.operation_id !== operationId) fail('AGDF_PLANNED_RECOVERY_REQUIRED');
  return receipt;
}
function publishReceipt(root, receipt) {
  const path = receiptPath(receipt.plan_id, receipt.operation_id);
  ensureDirectory(root, `${plannedEntryPath(receipt.plan_id)}/operations`);
  if (existsSync(join(root, path))) {
    if (safeRead(root, path, 16384) !== json(receipt)) fail('AGDF_PLANNED_RECOVERY_REQUIRED');
  } else atomicWrite(join(root, path), json(receipt));
}
function readIntent(root, id) {
  const path = `${plannedEntryPath(id)}/MUTATION_PENDING.json`;
  let intent; try { intent = JSON.parse(safeRead(root, path, PLANNED_INTENT_BYTES)); } catch { fail('AGDF_PLANNED_RECOVERY_REQUIRED'); }
  if (!exactObject(intent, ['schema_version', 'receipt', 'old', 'next']) || intent.schema_version !== 1
    || !validReceipt(intent.receipt, id) || intent.receipt.kind !== 'planned_ur.replace'
    || typeof intent.old !== 'string' || typeof intent.next !== 'string'
    || parsePlannedUr(intent.old, id).digest !== intent.receipt.previous_digest
    || parsePlannedUr(intent.next, id).digest !== intent.receipt.resulting_digest) fail('AGDF_PLANNED_RECOVERY_REQUIRED');
  return { path, intent };
}
export function recoverPlannedMutationLocked(root, id, operationId) {
  const path = `${plannedEntryPath(id)}/MUTATION_PENDING.json`;
  if (!existsSync(join(root, path))) return { status: 'none' };
  const { intent } = readIntent(root, id);
  if (intent.receipt.operation_id !== operationId) fail('AGDF_PLANNED_RECOVERY_REQUIRED');
  const current = safeRead(root, `${plannedEntryPath(id)}/UR.md`);
  let status;
  if (current === intent.old) status = 'rolled_back';
  else if (current === intent.next) { publishReceipt(root, intent.receipt); status = 'completed'; }
  else fail('AGDF_PLANNED_RECOVERY_REQUIRED');
  unlinkSync(join(root, path)); fsyncDirectory(join(root, plannedEntryPath(id)));
  return { status, receipt: status === 'completed' ? intent.receipt : null };
}

export function recoverPlannedMutation(root, id, operationId) {
  return withPlannedEntryLock(root, id, () => recoverPlannedMutationLocked(root, id, operationId), {
    recovery: true, operation_id: operationId, proveOutcome: result => ['none', 'completed', 'rolled_back'].includes(result.status),
  });
}

export function inspectPlannedOperation(root, id, operationId) {
  plannedEntryPath(id);
  if (!REVISION_ID_PATTERN.test(operationId ?? '')) fail('AGDF_PLANNED_OPERATION_INVALID');
  const receipt = receiptAt(root, id, operationId);
  const pendingPath = `${plannedEntryPath(id)}/MUTATION_PENDING.json`;
  const pending = observedExists(join(root, pendingPath)) ? readIntent(root, id).intent.receipt : null;
  const stagePath = `${PLANNED_ROOT}/.stage-${id}-${operationId}/OWNER.json`;
  let creation = null;
  if (observedExists(join(root, stagePath))) {
    creation = JSON.parse(safeRead(root, stagePath, 16384));
    if (!validReceipt(creation, id) || creation.operation_id !== operationId) fail('AGDF_PLANNED_RECOVERY_REQUIRED');
  }
  return { status: receipt ? pending?.operation_id === operationId ? 'committed_recovery_required' : 'recorded'
    : pending?.operation_id === operationId || creation ? 'pending' : 'absent', receipt,
    pending: pending?.operation_id === operationId ? pending : creation, authorizes: false };
}

export function inspectPlannedSelection(root, scope, options) {
  plannedEntryPath(scope.plan_id);
  if (readControlLayout(root).layout !== PLANNED_LAYOUT) fail('AGDF_CONTROL_LAYOUT_MIGRATION_REQUIRED');
  if (scope.expected_digest === null) return { available: true, planning: scope, authorizes: false };
  const entry = inspectPlannedEntry(root, scope.plan_id, options);
  if (entry.digest !== scope.expected_digest) {
    if (!entry.pending || readIntent(root, scope.plan_id).intent.receipt.previous_digest !== scope.expected_digest) fail('AGDF_PLANNED_SOURCE_STALE');
  }
  return { available: true, planning: scope, source_digest: entry.digest, authorizes: false };
}

export function replayPlannedUr(root, { plan_id, operation_id, request_digest }) {
  return withPlannedEntryLock(root, plan_id, () => {
    const previous = receiptAt(root, plan_id, operation_id);
    if (!previous || previous.request_digest !== request_digest) fail('AGDF_OPERATION_PAYLOAD_CONFLICT');
    if (existsSync(join(root, plannedEntryPath(plan_id), 'MUTATION_PENDING.json')) && readIntent(root, plan_id).intent.receipt.operation_id === operation_id)
      recoverPlannedMutationLocked(root, plan_id, operation_id);
    return { outcome: 'already_applied', receipt: previous, entry: inspectPlannedEntry(root, plan_id) };
  }, { operation_id, resume: true, proveOutcome: result => result.outcome === 'already_applied' });
}

// Source content is the only editable authority. Receipts retain operation/source
// history but are never used as a saved title, priority, status or approval.
export function mutatePlannedUr(root, { kind, operation_id, plan_id = planningId(operation_id), expected_digest, content, priority, request_digest: commandDigest }, { checkpoint = () => {} } = {}) {
  if (!['planned_ur.create', 'planned_ur.replace'].includes(kind) || !REVISION_ID_PATTERN.test(operation_id)
    || kind === 'planned_ur.create' && (expected_digest !== null || plan_id !== planningId(operation_id))
    || kind === 'planned_ur.replace' && (!digestPattern.test(expected_digest) || priority !== undefined)) fail('AGDF_PLANNED_OPERATION_INVALID');
  const text = kind === 'planned_ur.create' ? preparePlannedUr(content, plan_id, priority) : parsePlannedUr(content, plan_id).content;
  if (commandDigest !== undefined && !digestPattern.test(commandDigest)) fail('AGDF_PLANNED_OPERATION_INVALID');
  const request_digest = commandDigest ?? plannedTextDigest(canonicalJson({ kind, plan_id, expected_digest, content: text }));
  let effectStarted = false;
  const execute = () => {
    const base = plannedEntryPath(plan_id), destination = join(root, base);
    const existing = receiptAt(root, plan_id, operation_id);
    if (existing) {
      if (existing.kind !== kind || existing.request_digest !== request_digest) fail('AGDF_OPERATION_PAYLOAD_CONFLICT');
      if (existsSync(join(destination, 'MUTATION_PENDING.json')) && readIntent(root, plan_id).intent.receipt.operation_id === operation_id)
        recoverPlannedMutationLocked(root, plan_id, operation_id);
      return { outcome: 'already_applied', receipt: existing, entry: inspectPlannedEntry(root, plan_id) };
    }
    if (existsSync(join(destination, 'MUTATION_PENDING.json'))) {
      if (readIntent(root, plan_id).intent.receipt.request_digest !== request_digest) fail('AGDF_OPERATION_PAYLOAD_CONFLICT');
      recoverPlannedMutationLocked(root, plan_id, operation_id);
      const recovered = receiptAt(root, plan_id, operation_id);
      if (recovered) {
        if (recovered.request_digest !== request_digest) fail('AGDF_OPERATION_PAYLOAD_CONFLICT');
        return { outcome: 'already_applied', receipt: recovered, entry: inspectPlannedEntry(root, plan_id) };
      }
    }
    for (const name of ['HANDOFF_PENDING.json', 'TRANSFER.json'])
      if (existsSync(join(destination, name))) fail('AGDF_PLANNED_ALREADY_TRANSFERRED');
    assertPlannedNotTransferred(root, plan_id);
    const receipt = bindInputResolution({ schema_version: 1, kind, operation_id, plan_id, request_digest,
      previous_digest: expected_digest, resulting_digest: plannedTextDigest(text) });
    if (kind === 'planned_ur.create') {
      if (existsSync(destination)) fail('AGDF_PLANNED_COLLISION');
      const stage = `${PLANNED_ROOT}/.stage-${plan_id}-${operation_id}`, stagePath = join(root, stage);
      if (hasSymlinkComponent(root, stage)) fail('AGDF_PLANNED_PATH_INVALID');
      if (existsSync(stagePath)) {
        if (!lstatSync(stagePath).isDirectory() || readdirSync(stagePath).some(name => !['OWNER.json', 'UR.md', 'operations'].includes(name))
          || safeRead(root, `${stage}/OWNER.json`, 16384) !== json(receipt)) fail('AGDF_PLANNED_RECOVERY_REQUIRED');
        if (existsSync(join(stagePath, 'UR.md')) && safeRead(root, `${stage}/UR.md`) !== text) fail('AGDF_PLANNED_RECOVERY_REQUIRED');
        if (existsSync(join(stagePath, 'operations'))) {
          ensureDirectory(root, `${stage}/operations`);
          if (readdirSync(join(stagePath, 'operations')).some(name => name !== `${operation_id}.json`)
            || existsSync(join(stagePath, 'operations', `${operation_id}.json`)) && safeRead(root, `${stage}/operations/${operation_id}.json`, 16384) !== json(receipt)) fail('AGDF_PLANNED_RECOVERY_REQUIRED');
        }
      } else {
        effectStarted = true;
        markControlMutationEffect();
        ensureDirectory(root, stage);
        atomicWrite(join(stagePath, 'OWNER.json'), json(receipt)); checkpoint('create_intent');
      }
      effectStarted = true;
      markControlMutationEffect();
      if (!existsSync(join(stagePath, 'UR.md'))) atomicWrite(join(stagePath, 'UR.md'), text);
      checkpoint('create_source');
      ensureDirectory(root, `${stage}/operations`);
      if (!existsSync(join(stagePath, 'operations', `${operation_id}.json`))) atomicWrite(join(stagePath, 'operations', `${operation_id}.json`), json(receipt));
      fsyncDirectory(join(stagePath, 'operations')); fsyncDirectory(stagePath); checkpoint('create_staged');
      renameSyncWithRetry(stagePath, destination); fsyncDirectory(join(root, PLANNED_ROOT)); checkpoint('create_committed');
    } else {
      const old = safeRead(root, `${base}/UR.md`);
      if (parsePlannedUr(old, plan_id).digest !== expected_digest) fail('AGDF_PLANNED_SOURCE_STALE');
      if (old === text) fail('AGDF_PLANNED_SOURCE_UNCHANGED');
      effectStarted = true;
      markControlMutationEffect();
      atomicWrite(join(destination, 'MUTATION_PENDING.json'), json({ schema_version: 1, receipt, old, next: text })); checkpoint('replace_intent');
      atomicWrite(join(destination, 'UR.md'), text); checkpoint('replace_committed');
      publishReceipt(root, receipt); checkpoint('replace_receipt');
      unlinkSync(join(destination, 'MUTATION_PENDING.json')); fsyncDirectory(destination); checkpoint('replace_retired');
    }
    return { outcome: 'accepted', receipt, entry: inspectPlannedEntry(root, plan_id) };
  };
  return withPlannedEntryLock(root, plan_id, () => {
    try { return execute(); }
    catch (error) {
      if (!effectStarted || /RECOVERY_REQUIRED/u.test(error.message)) throw error;
      throw Object.assign(Error('AGDF_PLANNED_RECOVERY_REQUIRED'), { cause: error, operation_id, plan_id });
    }
  }, { operation_id, resume: true, proveOutcome: result => ['accepted', 'already_applied'].includes(result.outcome) });
}
