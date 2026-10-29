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

export const MATERIAL_LIMITS = Object.freeze({ part: 16384, file: 131072, set: 524288, sets: 4, total: 2097152,
  lifetime: 600000, idle: 120000 });

// One serving generation/connection owns these bounded private buffers. They are
// not files, Run State, evidence, receipts or an approval authority.
export function createRunMaterialStore({ now = Date.now } = {}) {
  const sets = new Map();
  let closed = false;
  function expire() {
    for (const [id, row] of sets) if (now() - row.created >= MATERIAL_LIMITS.lifetime || now() - row.touched >= MATERIAL_LIMITS.idle) sets.delete(id);
  }
  function binding(input) { return canonicalJson([input.target_id, input.run_id, input.expected_revision_id]); }
  function current(input) {
    const target = resolveTaskTarget({ workingDirectory: input.working_directory, targetSource: input.target_source, primaryTarget: input.primary_target });
    if (target.resolution_state !== 'resolved') throw Error('target_unresolved');
    const root = target.governance_target;
    if (resolveControlCommandTarget(root).target_id !== input.target_id) throw Error('target_binding_mismatch');
    let run = readRun(root, input.run_id);
    if (run.rejection?.reason === 'run_step_recovery_required') {
      const pending = readPendingSourceRevisionJournal(root, input.run_id), path = `.agdf/control/runs/${input.run_id}/RUN_STATE.md`;
      const file = containedRegularFile(root, path);
      if ([2, 5].includes(pending.schema_version) && [pending.old_revision_id, pending.next_revision_id].includes(input.expected_revision_id)
        && !hasSymlinkComponent(root, path) && file.status === 'valid' && statSync(file.path).size <= 1048576) {
        const content = readFileSync(file.path, 'utf8'), parsed = parseRunState(content, input.run_id);
        if (parsed.valid) run = { ...parsed, content };
      }
    }
    if (run.rejection || run.meta.revision_id !== input.expected_revision_id) throw Error('stale_revision');
    if (run.meta.lifecycle !== 'active' || runSealState(root, run.content).status !== 'valid') throw Error('material_binding_invalid');
    return { available: true, revision: Number(run.meta.revision), revision_id: run.meta.revision_id, lifecycle: run.meta.lifecycle };
  }
  function rowFor(input, id) {
    expire(); const row = sets.get(id);
    if (closed || !row) throw Error('material_transfer_expired');
    if (row.binding !== binding(input)) throw Error('material_binding_mismatch');
    row.touched = now(); return row;
  }
  return Object.freeze({
    stage(input) {
      const envelope = (outcome, reason, family = {}, state = null) => ({ schema_version: '1', outcome, reason,
        operation_id: input?.operation_id ?? null, request_digest: digest(canonicalJson(input)),
        binding: { target_id: input.target_id, run_id: input.run_id, expected_revision_id: input.expected_revision_id, kind: 'material.stage' },
        effect: null, receipt: null, current: state ?? { available: false }, assurance: COOPERATIVE_ASSURANCE,
        historical_effect: Boolean(family.replayed), recovery: null, authorizes: false, family_result: family });
      if (validateRunCommand('agdf_record', input).length || input.command.kind !== 'material.stage') return envelope('rejected', 'command_schema_invalid');
      try {
        if (closed) throw Error('material_transfer_expired');
        const state = current(input), p = input.command.payload;
        expire();
        let row;
        if (p.action === 'begin') {
          const request = digest(canonicalJson(input));
          row = sets.get(input.operation_id);
          if (row) {
            if (row.request !== request || row.binding !== binding(input)) throw Error('operation_payload_conflict');
          } else {
            const size = p.files.reduce((n, f) => n + f.bytes, 0);
            if (!p.files.length || p.files.length > 4 || p.files.some(f => !Number.isSafeInteger(f.bytes) || f.bytes < 0 || f.bytes > MATERIAL_LIMITS.file)
              || size > MATERIAL_LIMITS.set || sets.size >= MATERIAL_LIMITS.sets
              || [...sets.values()].reduce((n, r) => n + r.size, size) > MATERIAL_LIMITS.total) throw Error('material_resource_limit');
            row = { request, binding: binding(input), size, created: now(), touched: now(),
              files: p.files.map(f => ({ ...f, parts: [], received: 0, material_id: randomUUID(), content: null, digest: null })) };
            sets.set(input.operation_id, row);
          }
          return envelope('accepted', null, { transfer_id: input.operation_id, files: row.files.map(({ slot, bytes, received }) => ({ slot, bytes, received })), limits: MATERIAL_LIMITS }, state);
        }
        row = rowFor(input, p.transfer_id);
        if (p.action === 'discard') { sets.delete(p.transfer_id); return envelope('accepted', null, { discarded: true }, state); }
        if (p.action === 'append') {
          const file = row.files[p.file], bytes = Buffer.from(p.data, 'base64');
          if (!file || !Number.isSafeInteger(p.offset) || p.offset < 0 || bytes.toString('base64') !== p.data || bytes.length > MATERIAL_LIMITS.part
            || !bytes.length || p.offset + bytes.length > file.bytes) throw Error('material_part_invalid');
          if (p.offset < file.received) {
            const original = Buffer.concat(file.parts).subarray(p.offset, p.offset + bytes.length);
            if (!original.equals(bytes)) throw Error('material_part_conflict');
            return envelope('accepted', null, { transfer_id: p.transfer_id, file: p.file, received: file.received, replayed: true }, state);
          }
          if (file.content !== null || p.offset !== file.received) throw Error('material_part_offset_invalid');
          file.parts.push(bytes); file.received += bytes.length;
        }
        if (p.action === 'seal') {
          if (row.files.some(f => f.received !== f.bytes)) throw Error('material_incomplete');
          // Validate every file before publishing any sealed reference.
          const decoded = row.files.map(f => new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(f.parts)));
          row.files.forEach((f, i) => { f.content = decoded[i]; f.digest = digest(canonicalRunText(f.content)); });
        }
        return envelope('accepted', null, { transfer_id: p.transfer_id, files: row.files.map(({ slot, bytes, received, content, material_id, digest: hash }) => ({
          slot, bytes, received, sealed: content !== null, ...(content !== null ? { reference: { material_id, digest: hash } } : {}) })) }, state);
      } catch (e) { return envelope('rejected', e.message); }
    },
    grants(input) {
      const refs = [input.command?.payload?.source, input.command?.payload?.material, input.command?.payload?.or, input.command?.payload?.proposal].filter(r => r?.material_id);
      if (!refs.length) return [];
      const target = resolveTaskTarget({ workingDirectory: input.working_directory, targetSource: input.target_source, primaryTarget: input.primary_target });
      if (target.resolution_state === 'resolved' && resolveControlCommandTarget(target.governance_target).target_id === input.target_id) {
        const previous = inspectRunOperation(target.governance_target, { runId: input.run_id, operationId: input.operation_id, targetId: input.target_id });
        if (previous.status === 'recorded' && previous.request_digest === runCommandRequestDigest(input)) return [];
        if (input.command.kind === 'source_revision.recover' && ['recorded', 'committed_recovery_required'].includes(previous.status)
          && previous.family === 'source_revision.apply' && previous.receipt?.proposal_reference?.digest === input.command.payload.proposal.digest) return [];
      }
      current(input); expire();
      return refs.map(ref => {
        for (const row of sets.values()) {
          const file = row.files.find(f => f.material_id === ref.material_id);
          if (!file) continue;
          if (row.binding !== binding(input) || file.content === null || file.digest !== ref.digest) throw Error('material_binding_mismatch');
          row.touched = now();
          return { material_id: file.material_id, digest: file.digest, slot: file.slot, content: file.content,
            target_id: input.target_id, run_id: input.run_id, expected_revision_id: input.expected_revision_id };
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
  if (!row || row.target_id !== input.target_id || row.run_id !== input.run_id || row.expected_revision_id !== input.expected_revision_id
    || row.digest !== reference.digest || typeof row.content !== 'string' || Buffer.byteLength(row.content) > MATERIAL_LIMITS.file
    || digest(canonicalRunText(row.content)) !== row.digest) throw Error('material_binding_invalid');
  return row;
}
