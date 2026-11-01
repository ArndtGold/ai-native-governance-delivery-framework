import { existsSync, lstatSync, mkdirSync, unlinkSync, readdirSync, rmdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { atomicWrite, fsyncDirectory, withOwnedFileLock } from '../owned-file-lock.js';
import { readContainedControlText, controlPathPresent } from '../control-read/snapshot.js';
import { inspectPlannedEntry, withPlannedEntryLock, plannedEntryPath, plannedTextDigest, plannedRawDigest, PLANNED_INTENT_BYTES } from './planned-entry.js';
import { inspectPlannedOrigins, validPlannedOrigin } from './planned-origin.js';
import { exactObject, canonicalJson, COOPERATIVE_ASSURANCE, resolveControlCommandTarget } from './approval-command-contract.js';
import { REVISION_ID_PATTERN, creationRunId } from './run-identity.js';
import { hasSymlinkComponent } from './contained-file.js';
import { markControlMutationEffect, withControlRecovery } from './control-layout.js';
import { createRun, recoverRunCreationStage } from './run-state-repository.js';
import { parseRunState } from './run-state-parser.js';
import { readRunOperations, appendRunOperation } from './run-operations.js';
import { projectUrObjective, upsertTableRow, appendTableRow, replaceFirstScalar } from './run-state-edits.js';
import { runSealState } from './run-seal.js';
import { bindInputResolution, resolutionRecord, recordedInputResolution } from './input-resolution.js';

const json = value => JSON.stringify(value) + '\n';
const fail = code => { throw Error(code); };
function ensureDirectory(root, path) {
  if (hasSymlinkComponent(root, path)) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
  const full = join(root, path);
  if (!existsSync(full)) { mkdirSync(full, { mode: 0o700 }); fsyncDirectory(dirname(full)); }
  if (!lstatSync(full).isDirectory() || lstatSync(full).isSymbolicLink()) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
}
function validateIntent(stored, id) {
  const intent = resolutionRecord(stored);
  if (!intent) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
  if (!exactObject(intent, ['schema_version', 'origin', 'outputs']) || intent.schema_version !== 1 || !validPlannedOrigin(intent.origin)
    || intent.origin.plan_id !== id || !Array.isArray(intent.outputs) || intent.outputs.length !== 3) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
  const { origin, outputs } = intent, base = `.agdf/control/artefacts/${origin.run_id}/`;
  const expected = ['UR.md', 'PLANNED_UR.md', 'PLANNED_ORIGIN.json'].map(name => `${base}${name}`);
  if (outputs.some((row, i) => !exactObject(row, ['path', 'content', 'digest']) || row.path !== expected[i]
      || typeof row.content !== 'string' || Buffer.byteLength(row.content) > 131072 || plannedTextDigest(row.content) !== row.digest)
    || outputs[0].content !== outputs[1].content || outputs[0].digest !== origin.planned.digest
    || plannedRawDigest(outputs[1].content) !== origin.raw_digest || outputs[2].content !== json(origin)) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
  const resolution = recordedInputResolution(stored);
  if (resolution && (resolution.operation_id !== intent.origin.operation_id || resolution.kind !== 'run.create_from_planned'
    || resolution.effective_digest !== intent.origin.request_digest)) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
  return stored;
}
function transferRecord(origin, originDigest) {
  return { schema_version: 1, plan_id: origin.plan_id, run_id: origin.run_id, operation_id: origin.operation_id,
    request_digest: origin.request_digest, source_digest: origin.planned.digest, origin_digest: originDigest };
}
function finishEntry(root, origin, originDigest, checkpoint) {
  const base = plannedEntryPath(origin.plan_id), transfer = `${base}/TRANSFER.json`, pending = `${base}/HANDOFF_PENDING.json`;
  const receipt = transferRecord(origin, originDigest), text = json(receipt);
  if (existsSync(join(root, transfer))) {
    if (readContainedControlText(root, transfer, 4096) !== text) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
  } else { markControlMutationEffect(); atomicWrite(join(root, transfer), text); checkpoint('handoff_entry_receipt'); }
  if (existsSync(join(root, pending))) {
    const intent = validateIntent(JSON.parse(readContainedControlText(root, pending, PLANNED_INTENT_BYTES)), origin.plan_id);
    if (canonicalJson(intent.origin) !== canonicalJson(origin)) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
    unlinkSync(join(root, pending)); fsyncDirectory(join(root, base)); checkpoint('handoff_retired');
  }
  return receipt;
}

export function inspectPlannedHandoffOperation(root, planId, operationId) {
  plannedEntryPath(planId);
  if (!REVISION_ID_PATTERN.test(operationId ?? '')) fail('AGDF_PLANNED_HANDOFF_INPUT_INVALID');
  const observed = inspectPlannedOrigins(root, planId);
  if (!observed.complete) return { status: 'unknown', reason: 'planned_origin_unconfirmed', findings: observed.findings, authorizes: false };
  const known = observed.matches[0], path = `${plannedEntryPath(planId)}/HANDOFF_PENDING.json`;
  if (known) {
    if (known.origin.operation_id !== operationId) return { status: 'already_transferred', run_id: known.run_id, authorizes: false };
    return { status: existsSync(join(root, path)) ? 'committed_recovery_required' : 'recorded', receipt: known.receipt,
      request_digest: known.origin.request_digest, run_id: known.run_id, historical_effect: true, authorizes: false };
  }
  if (controlPathPresent(root, `${plannedEntryPath(planId)}/TRANSFER.json`)) return { status: 'unknown', reason: 'planned_transfer_unconfirmed', authorizes: false };
  if (!existsSync(join(root, path))) return { status: 'absent', reason: 'absence_is_not_proof_of_non_execution', authorizes: false };
  const pending = validateIntent(JSON.parse(readContainedControlText(root, path, PLANNED_INTENT_BYTES)), planId);
  if (pending.origin.operation_id !== operationId) return { status: 'unknown', reason: 'another_pending_handoff', authorizes: false };
  return { status: 'pending', request_digest: pending.origin.request_digest, pending, run_id: pending.origin.run_id, authorizes: false };
}

// Explicit selected-source handoff, never approval. Entry -> deterministic
// creation -> staged Run publication. No active UR synchronization afterwards.
export function createRunFromPlanned(root, { plan_id, expected_digest, operation_id, target_id, request_digest, presentation_language = 'en', title },
  { packageVersion = '0.20.2', checkpoint = () => {} } = {}) {
  plannedEntryPath(plan_id);
  if (!REVISION_ID_PATTERN.test(operation_id ?? '') || !/^sha256:[a-f0-9]{64}$/u.test(expected_digest ?? '')
    || !/^sha256:[a-f0-9]{64}$/u.test(request_digest ?? '') || target_id !== resolveControlCommandTarget(root).target_id) fail('AGDF_PLANNED_HANDOFF_INPUT_INVALID');
  let effectStarted = false;
  return withPlannedEntryLock(root, plan_id, () => {
    const execute = () => {
      const origins = inspectPlannedOrigins(root, plan_id);
      if (!origins.complete) fail('AGDF_PLANNED_ORIGIN_UNCONFIRMED');
      if (origins.matches.length) {
        const known = origins.matches[0], originDigest = known.receipt.effect.record.origin.digest;
        if (known.origin.operation_id === operation_id && (known.origin.request_digest !== request_digest || known.origin.target_id !== target_id)) fail('AGDF_OPERATION_PAYLOAD_CONFLICT');
        effectStarted = true;
        const finish = () => withOwnedFileLock(join(root, '.agdf/control/runs', `.create-${known.origin.operation_id}`),
          () => finishEntry(root, known.origin, originDigest, checkpoint));
        if (known.origin.operation_id === operation_id) finish();
        else withControlRecovery(root, { resource: `planned:${plan_id}`, operation_id: known.origin.operation_id,
          proveOutcome: () => inspectPlannedOrigins(root, plan_id).matches.length === 1 }, finish);
        return { outcome: known.origin.operation_id === operation_id ? 'already_applied' : 'already_transferred', run_id: known.run_id, receipt: known.receipt, historical_effect: true, authorizes: false };
      }
      if (controlPathPresent(root, `${plannedEntryPath(plan_id)}/TRANSFER.json`)) fail('AGDF_PLANNED_ORIGIN_UNCONFIRMED');
      const entry = inspectPlannedEntry(root, plan_id, { presentationLanguage: presentation_language });
      if (entry.pending) fail('AGDF_PLANNED_RECOVERY_REQUIRED');
      if (entry.digest !== expected_digest) fail('AGDF_PLANNED_SOURCE_STALE');
      if (!entry.readiness.ready) throw Object.assign(Error('AGDF_PLANNED_UR_NOT_READY'), { readiness: entry.readiness });
      if (title !== undefined && title !== entry.title) fail('AGDF_PLANNED_TITLE_INVALID');
      const rawSource = readContainedControlText(root, entry.path);
      if (plannedRawDigest(rawSource) !== entry.raw_digest) fail('AGDF_PLANNED_SOURCE_STALE');
      const runId = creationRunId(operation_id), base = plannedEntryPath(plan_id), runBase = `.agdf/control/artefacts/${runId}/`;
      const origin = { schema_version: 1, plan_id, operation_id, run_id: runId, target_id, request_digest, raw_digest: entry.raw_digest,
        planned: { path: entry.path, digest: entry.digest }, snapshot: { path: `${runBase}PLANNED_UR.md`, digest: entry.digest },
        initial_ur: { path: `${runBase}UR.md`, digest: entry.digest } };
      const outputs = [{ path: origin.initial_ur.path, content: rawSource, digest: entry.digest },
        { path: origin.snapshot.path, content: rawSource, digest: entry.digest },
        { path: `${runBase}PLANNED_ORIGIN.json`, content: json(origin), digest: plannedTextDigest(json(origin)) }];
      const intent = validateIntent(bindInputResolution({ schema_version: 1, origin, outputs }), plan_id), pendingPath = `${base}/HANDOFF_PENDING.json`;
      function matching(content) {
        const parsed = parseRunState(content, runId), receipt = readRunOperations(content).receipts.find(row => row.operation_id === operation_id);
        if (!parsed.valid || runSealState(root, content).status !== 'valid' || receipt?.kind !== 'run.create_from_planned'
          || receipt.target_id !== target_id || receipt.request_digest !== request_digest
          || canonicalJson(receipt.effect.record.planned) !== canonicalJson({ plan_id, path: entry.path, digest: entry.digest })) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
        return receipt;
      }
      return withOwnedFileLock(join(root, '.agdf/control/runs', `.create-${operation_id}`), () => {
        if (existsSync(join(root, pendingPath))) {
          const previous = validateIntent(JSON.parse(readContainedControlText(root, pendingPath, PLANNED_INTENT_BYTES)), plan_id);
          if (canonicalJson(previous) !== canonicalJson(intent)) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
          // No Run directory was published (the derived origin check above would
          // have found it). Roll back only verified owned precommit effects,
          // then retry the same operation/source, never adopt foreign siblings.
          const artefactDirectory = join(root, runBase);
          if (hasSymlinkComponent(root, runBase.slice(0, -1))) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
          if (existsSync(artefactDirectory) && (!lstatSync(artefactDirectory).isDirectory()
            || readdirSync(artefactDirectory).some(name => !outputs.some(row => row.path === `${runBase}${name}`)))) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
          for (const row of outputs)
            if (existsSync(join(root, row.path)) && readContainedControlText(root, row.path) !== row.content) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
          effectStarted = true; markControlMutationEffect();
          recoverRunCreationStage(root, runId, matching, { discard: true });
          for (const row of outputs) if (existsSync(join(root, row.path))) unlinkSync(join(root, row.path));
          if (existsSync(artefactDirectory)) { fsyncDirectory(artefactDirectory); rmdirSync(artefactDirectory); fsyncDirectory(dirname(artefactDirectory)); }
          // Keep the original identity/source intent through rollback and retry.
          // Even an interruption here cannot free this UUID for different input.
          checkpoint('handoff_rolled_back');
        } else {
          // No pre-existing publication or sibling output may be adopted just
          // because its bytes happen to match the requested content.
          if (existsSync(join(root, `.agdf/control/runs/${runId}`)) || outputs.some(row => existsSync(join(root, row.path)))) fail('AGDF_PLANNED_HANDOFF_COLLISION');
        }
        effectStarted = true; markControlMutationEffect();
        if (existsSync(join(root, pendingPath))) {
          if (readContainedControlText(root, pendingPath, PLANNED_INTENT_BYTES) !== json(intent)) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
        } else atomicWrite(join(root, pendingPath), json(intent));
        checkpoint('handoff_intent');
        ensureDirectory(root, '.agdf/control/artefacts'); ensureDirectory(root, runBase.slice(0, -1));
        for (const row of outputs) {
          if (hasSymlinkComponent(root, row.path)) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
          if (existsSync(join(root, row.path))) {
            if (readContainedControlText(root, row.path) !== row.content) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
          } else atomicWrite(join(root, row.path), row.content);
          checkpoint(`handoff_output_${row.path.split('/').at(-1)}`);
        }
        let receipt = recoverRunCreationStage(root, runId, matching);
        if (!receipt) {
          createRun(root, runId, undefined, { prepare(content) {
            let next = projectUrObjective(content, entry.content);
            for (const [type, path, status] of [['UR', origin.initial_ur.path, 'draft'], ['Planned UR Snapshot', origin.snapshot.path, 'done'], ['Planned UR Origin', outputs[2].path, 'done']])
              next = upsertTableRow(next, 'Artefacts', 0, type, [type, path, status]);
            if (!next) fail('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED');
            next = replaceFirstScalar(next, 'next_allowed_action', 'Review the imported UR and request exact Approval: UR.');
            next = appendTableRow(next, 'Evidence', ['Planned UR handoff', entry.path, entry.digest, 'unapproved imported intent']);
            const parsed = parseRunState(next, runId);
            receipt = bindInputResolution({ schema_version: '3', kind: 'run.create_from_planned', operation_id, request_digest, target_id,
              run_id: runId, expected_revision_id: null, created_at: new Date().toISOString(), producer: { contract: 'run-command/1', package_version: packageVersion },
              assurance: COOPERATIVE_ASSURANCE, effect: { previous_revision_id: null, resulting_revision_id: parsed.meta.revision_id, revision: 1,
                record: { title: entry.title, planned: { plan_id, path: entry.path, digest: entry.digest }, ur: origin.initial_ur, snapshot: origin.snapshot,
                  origin: { path: outputs[2].path, digest: outputs[2].digest } } } });
            return appendRunOperation(next, receipt);
          }, beforePublish: () => {
            checkpoint('handoff_before_run_publish');
            if (readContainedControlText(root, entry.path) !== rawSource) fail('AGDF_PLANNED_SOURCE_STALE');
          } });
        }
        checkpoint('handoff_run_committed');
        finishEntry(root, origin, outputs[2].digest, checkpoint);
        return { outcome: 'accepted', run_id: runId, receipt, historical_effect: false, authorizes: false };
      });
    };
    try { return execute(); }
    catch (error) {
      if (!effectStarted || /RECOVERY_REQUIRED/u.test(error.message)) throw error;
      throw Object.assign(Error('AGDF_PLANNED_HANDOFF_RECOVERY_REQUIRED'), { cause: error, operation_id, plan_id });
    }
  }, { operation_id, resume: true, proveOutcome: result => ['accepted', 'already_applied', 'already_transferred'].includes(result.outcome) });
}
