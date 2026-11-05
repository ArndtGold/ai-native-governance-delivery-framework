import { resolutionRecordVersion } from './input-resolution.js';
import { currentInputResolution } from './input-resolution.js';
import { assertInputConfigurationCurrent } from '../resources/configuration.js';
import { randomUUID } from 'node:crypto';
import { resolveTaskTarget } from '../task-target-resolution.js';
import { canonicalJson, digest, resolveControlCommandTarget, COOPERATIVE_ASSURANCE } from './approval-command-contract.js';
import { readRun } from './run-state-edits.js';
import { runSealState } from './run-seal.js';
import { canonicalRunText } from './run-seal-compute.js';
import { validateRunCommand, runCommandRequestDigest } from './run-command-contract.js';
import { inspectRunOperation } from './run-operation-status.js';
import { readFileSync, statSync } from 'node:fs';
import { parseRunState } from './run-state-parser.js';
import { containedRegularFile, hasSymlinkComponent } from './contained-file.js';
import { readPendingSourceRevisionJournal } from './run-step-transaction.js';
import { inspectPlannedOperation, inspectPlannedSelection } from './planned-entry.js';

import { MATERIAL_LIMITS } from './material-limits.js';
export { MATERIAL_LIMITS } from './material-limits.js';

// A rejected transfer step names its concrete cause; the reason code stays stable for clients.
const MATERIAL_RECOVERY = Object.freeze({
  file_index_unknown: 'file is not an index of this transfer; use the 0-based position from begin.files.',
  offset_invalid: 'offset must be a non-negative integer byte offset.',
  data_not_base64: 'data must be canonical standard base64 (A-Z a-z 0-9 + /, = padding, no whitespace or line breaks) of the raw UTF-8 bytes.',
  data_empty: 'data must encode at least one byte.',
  part_too_large: 'one append decodes to at most 16384 bytes; split the file into more parts.',
  part_exceeds_file: 'offset plus decoded length exceeds the bytes declared at begin; check the byte count (UTF-8 bytes, not characters).',
  offset_not_next: 'append the next part at offset received; read status for the current received count.',
  file_incomplete: 'seal requires every file to have received exactly its declared bytes; read status and append the missing parts.',
  transfer_expired: 'the transfer expired (idle or lifetime bound) or the serving generation changed; begin a new transfer and restage the bytes.',
});
const materialError = (reason, detail, facts = {}) => Object.assign(Error(reason), { detail, facts });

// One serving generation/connection owns these bounded private buffers. They are
// not files, Run State, evidence, receipts or an approval authority.
export function createRunMaterialStore({ now = Date.now } = {}) {
  const sets = new Map();
  let closed = false;
  function expire() {
    for (const [id, row] of sets) if (now() - row.created >= MATERIAL_LIMITS.lifetime || now() - row.touched >= MATERIAL_LIMITS.idle) sets.delete(id);
  }
  const planning = input => Object.hasOwn(input, 'planning');
  function binding(input) { return planning(input) ? canonicalJson(['planned', input.target_id, input.planning.plan_id, input.planning.expected_digest])
    : canonicalJson([input.target_id, input.run_id, input.expected_revision_id]); }
  function current(input) {
    const target = resolveTaskTarget({ workingDirectory: input.working_directory, targetSource: input.target_source, primaryTarget: input.primary_target });
    if (target.resolution_state !== 'resolved') throw Error('target_unresolved');
    const root = target.governance_target;
    if (resolveControlCommandTarget(root).target_id !== input.target_id) throw Error('target_binding_mismatch');
    assertInputConfigurationCurrent(root);
    if (planning(input)) return inspectPlannedSelection(root, input.planning, { presentationLanguage: input.presentation_language });
    const runPath = `.agdf/control/runs/${input.run_id}/RUN_STATE.md`;
    if (hasSymlinkComponent(root, runPath)) throw Error('run_path_invalid');
    const source = containedRegularFile(root, runPath);
    if (source.status !== 'valid') throw Error(source.status === 'missing' ? 'run_missing' : 'run_path_invalid');
    let run = readRun(root, input.run_id);
    if (run.rejection?.reason === 'run_step_recovery_required') {
      const pending = readPendingSourceRevisionJournal(root, input.run_id), path = `.agdf/control/runs/${input.run_id}/RUN_STATE.md`;
      const file = containedRegularFile(root, path);
      if (resolutionRecordVersion(pending) === 7 && [pending.old_revision_id, pending.next_revision_id].includes(input.expected_revision_id)
        && !hasSymlinkComponent(root, path) && file.status === 'valid' && statSync(file.path).size <= 1048576) {
        const content = readFileSync(file.path, 'utf8'), parsed = parseRunState(content, input.run_id);
        if (parsed.valid) run = { ...parsed, content };
      }
    }
    if (run.rejection) throw Error(run.rejection.reason);
    if (run.meta.revision_id !== input.expected_revision_id) throw Error('stale_revision');
    if (run.meta.lifecycle !== 'active' || runSealState(root, run.content).status !== 'valid') throw Error('material_binding_invalid');
    return { available: true, revision: Number(run.meta.revision), revision_id: run.meta.revision_id, lifecycle: run.meta.lifecycle };
  }
  function rowFor(input, id) {
    expire(); const row = sets.get(id);
    if (closed || !row) throw materialError('material_transfer_expired', 'transfer_expired', { idle_ms: MATERIAL_LIMITS.idle, lifetime_ms: MATERIAL_LIMITS.lifetime });
    if (row.binding !== binding(input)) throw Error('material_binding_mismatch');
    row.touched = now(); return row;
  }
  function rememberResolution(row, input) {
    const resolution = currentInputResolution();
    if (!resolution || row.resolutions.has(input.operation_id)) return;
    const bytes = Buffer.byteLength(canonicalJson(resolution));
    if (row.resolutions.size >= 64 || row.size + row.resolutionBytes + bytes > MATERIAL_LIMITS.set
      || [...sets.values()].reduce((total, entry) => total + entry.size + entry.resolutionBytes, bytes) > MATERIAL_LIMITS.total) throw Error('material_resource_limit');
    row.resolutions.set(input.operation_id, resolution);
    row.resolutionBytes += bytes;
  }
  return Object.freeze({
    originalInput(input) {
      expire();
      for (const row of sets.values()) {
        const resolution = row.resolutions.get(input.operation_id);
        if (resolution && row.binding === binding(input)) return { known: true, resolution };
      }
      return null;
    },
    stage(input) {
      const envelope = (outcome, reason, family = {}, state = null) => ({ schema_version: '1', outcome, reason,
        operation_id: input?.operation_id ?? null, request_digest: digest(canonicalJson(input)),
        binding: planning(input) ? { target_id: input.target_id, planning: input.planning, kind: 'planned_material.stage' }
          : { target_id: input.target_id, run_id: input.run_id, expected_revision_id: input.expected_revision_id, kind: 'material.stage' },
        effect: null, receipt: null, current: state ?? { available: false }, assurance: COOPERATIVE_ASSURANCE,
        historical_effect: Boolean(family.replayed), recovery: null, authorizes: false, family_result: family });
      const explained = (reason, detail, facts) => ({ ...envelope('rejected', reason), recovery: MATERIAL_RECOVERY[detail],
        diagnostics: [{ code: detail, ...facts }] });
      if (validateRunCommand('agdf_record', input).length || !['material.stage', 'planned_material.stage'].includes(input.command.kind)) return envelope('rejected', 'command_schema_invalid');
      try {
        if (closed) throw materialError('material_transfer_expired', 'transfer_expired', { idle_ms: MATERIAL_LIMITS.idle, lifetime_ms: MATERIAL_LIMITS.lifetime });
        const state = current(input), p = input.command.payload;
        expire();
        let row;
        if (p.action === 'begin' || p.action === 'put') {
          // The small-text path bundles only private transfer work. Validate the
          // whole set before allocating; canonical recording still uses its owner.
          const files = p.action === 'put' ? p.files.map(({ slot, content }) => {
            const bytes = Buffer.from(content, 'utf8');
            if (bytes.length > MATERIAL_LIMITS.inline || new TextDecoder('utf-8', { fatal: true }).decode(bytes) !== content)
              throw Error('material_text_invalid');
            return { slot, bytes: bytes.length, content, data: bytes };
          }) : p.files;
          const request = digest(canonicalJson(input));
          row = sets.get(input.operation_id);
          if (row) {
            if (row.request !== request || row.binding !== binding(input)) throw Error('operation_payload_conflict');
          } else {
            const size = files.reduce((n, f) => n + f.bytes, 0);
            const resolutionBytes = currentInputResolution() ? Buffer.byteLength(canonicalJson(currentInputResolution())) : 0;
            if (!files.length || files.length > 4 || files.some(f => !Number.isSafeInteger(f.bytes) || f.bytes < 0 || f.bytes > MATERIAL_LIMITS.file)
              || size + resolutionBytes > MATERIAL_LIMITS.set || sets.size >= MATERIAL_LIMITS.sets
              || [...sets.values()].reduce((n, r) => n + r.size + r.resolutionBytes, size + resolutionBytes) > MATERIAL_LIMITS.total) throw Error('material_resource_limit');
            row = { request, binding: binding(input), size, created: now(), touched: now(), resolutions: new Map(), resolutionBytes: 0,
              files: files.map(f => ({ slot: f.slot, bytes: f.bytes, parts: f.data ? [f.data] : [],
                received: f.data ? f.bytes : 0, material_id: randomUUID(), content: f.content ?? null,
                digest: f.data ? digest(canonicalRunText(f.content)) : null })) };
            sets.set(input.operation_id, row);
          }
          rememberResolution(row, input);
          return envelope('accepted', null, { transfer_id: input.operation_id, files: row.files.map(({ slot, bytes, received, content, material_id, digest }) => ({ slot, bytes, received,
            ...(content !== null ? { sealed: true, reference: { material_id, digest } } : {}) })), limits: MATERIAL_LIMITS }, state);
        }
        row = rowFor(input, p.transfer_id);
        rememberResolution(row, input);
        if (p.action === 'discard') { sets.delete(p.transfer_id); return envelope('accepted', null, { discarded: true }, state); }
        if (p.action === 'append') {
          const file = row.files[p.file], bytes = Buffer.from(p.data, 'base64');
          if (!file) throw materialError('material_part_invalid', 'file_index_unknown', { file: p.file, files: row.files.length });
          if (!Number.isSafeInteger(p.offset) || p.offset < 0) throw materialError('material_part_invalid', 'offset_invalid');
          if (bytes.toString('base64') !== p.data) throw materialError('material_part_invalid', 'data_not_base64');
          if (!bytes.length) throw materialError('material_part_invalid', 'data_empty');
          if (bytes.length > MATERIAL_LIMITS.part) throw materialError('material_part_invalid', 'part_too_large', { decoded_bytes: bytes.length, part_bytes: MATERIAL_LIMITS.part });
          if (p.offset + bytes.length > file.bytes) throw materialError('material_part_invalid', 'part_exceeds_file',
            { offset: p.offset, decoded_bytes: bytes.length, declared_bytes: file.bytes });
          if (p.offset < file.received) {
            const original = Buffer.concat(file.parts).subarray(p.offset, p.offset + bytes.length);
            if (!original.equals(bytes)) throw Error('material_part_conflict');
            return envelope('accepted', null, { transfer_id: p.transfer_id, file: p.file, received: file.received, replayed: true }, state);
          }
          if (file.content !== null || p.offset !== file.received) throw materialError('material_part_offset_invalid', 'offset_not_next', { offset: p.offset, received: file.received, sealed: file.content !== null });
          file.parts.push(bytes); file.received += bytes.length;
        }
        if (p.action === 'seal') {
          if (row.files.some(f => f.received !== f.bytes)) throw materialError('material_incomplete', 'file_incomplete',
            { files: row.files.map(({ received, bytes }) => ({ received, bytes })) });
          // Validate every file before publishing any sealed reference.
          const decoded = row.files.map(f => new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(f.parts)));
          row.files.forEach((f, i) => { f.content = decoded[i]; f.digest = digest(canonicalRunText(f.content)); });
        }
        return envelope('accepted', null, { transfer_id: p.transfer_id, files: row.files.map(({ slot, bytes, received, content, material_id, digest: hash }) => ({
          slot, bytes, received, sealed: content !== null, ...(content !== null ? { reference: { material_id, digest: hash } } : {}) })) }, state);
      } catch (e) { return e.detail ? explained(e.message, e.detail, e.facts) : envelope('rejected', e.message); }
    },
    grants(input) {
      const refs = [input.command?.payload?.source, input.command?.payload?.material, input.command?.payload?.or, input.command?.payload?.proposal].filter(r => r?.material_id);
      if (!refs.length) return [];
      const target = resolveTaskTarget({ workingDirectory: input.working_directory, targetSource: input.target_source, primaryTarget: input.primary_target });
      if (target.resolution_state === 'resolved' && resolveControlCommandTarget(target.governance_target).target_id === input.target_id) {
        if (planning(input)) {
          const previous = inspectPlannedOperation(target.governance_target, input.planning.plan_id, input.operation_id);
          if (previous.receipt?.request_digest === runCommandRequestDigest(input)) return [];
        } else {
        const previous = inspectRunOperation(target.governance_target, { runId: input.run_id, operationId: input.operation_id, targetId: input.target_id });
        if (previous.status === 'recorded' && previous.request_digest === runCommandRequestDigest(input)) return [];
        if (input.command.kind === 'source_revision.recover' && ['recorded', 'committed_recovery_required'].includes(previous.status)
          && previous.family === 'source_revision.apply' && previous.receipt?.proposal_reference?.digest === input.command.payload.proposal.digest) return [];
        }
      }
      current(input); expire();
      return refs.map(ref => {
        for (const row of sets.values()) {
          const file = row.files.find(f => f.material_id === ref.material_id);
          if (!file) continue;
          if (row.binding !== binding(input) || file.content === null || file.digest !== ref.digest) throw Error('material_binding_mismatch');
          row.touched = now();
          return { material_id: file.material_id, digest: file.digest, slot: file.slot, content: file.content,
            target_id: input.target_id, ...(planning(input) ? { planning: input.planning }
              : { run_id: input.run_id, expected_revision_id: input.expected_revision_id }) };
        }
        throw Error('material_transfer_expired');
      });
    },
    settle(input, result) {
      if (!['accepted', 'already_applied'].includes(result.outcome) || !result.receipt
        || result.request_digest !== runCommandRequestDigest(input)) return;
      const ids = new Set([input.command.payload.source?.material_id, input.command.payload.material?.material_id,
        input.command.payload.or?.material_id, input.command.payload.proposal?.material_id].filter(Boolean));
      // A confirmed mutating commit advances the bound revision, so remaining
      // parts in that same set cannot be used for another current write.
      for (const [id, row] of sets) if (row.files.some(file => ids.has(file.material_id))) sets.delete(id);
    },
    close() { closed = true; sets.clear(); },
    inspectOwnership() { expire(); return { sets: sets.size, bytes: [...sets.values()].reduce((n, r) => n + r.size, 0) }; },
  });
}

export function grantedMaterial(input, reference, grants = []) {
  const row = grants.find(g => g.material_id === reference?.material_id);
  const sameScope = row && (Object.hasOwn(input, 'planning') ? row.planning && !Object.hasOwn(row, 'run_id')
    && canonicalJson(row.planning) === canonicalJson(input.planning) : !Object.hasOwn(row, 'planning') && row.run_id === input.run_id && row.expected_revision_id === input.expected_revision_id);
  if (!row || row.target_id !== input.target_id || !sameScope
    || row.digest !== reference.digest || typeof row.content !== 'string' || Buffer.byteLength(row.content) > MATERIAL_LIMITS.file
    || digest(canonicalRunText(row.content)) !== row.digest) throw Error('material_binding_invalid');
  return row;
}
