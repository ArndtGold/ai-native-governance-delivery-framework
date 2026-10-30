import { randomBytes } from 'node:crypto';
import { ReadWorkerPool } from '../control-read/cockpit-pool.js';
import { resolveControlCommandTarget } from '../control-state/approval-command-contract.js';

export function createDoctorObservationService({ budget, gitObservation, verifyRuntime,
  poolFactory = root => new ReadWorkerPool(root, { workerURL: new URL('../control-read/doctor-worker.js', import.meta.url), timeout: 7000,
    limits: { timeout: 7000, total: 64 * 1024 ** 2 }, maxOldGenerationSizeMb: 256, budget }), now = Date.now } = {}) {
  const observations = new Map(); let closed = false;
  function retire(row) {
    if (row.retirement) return row.retirement;
    row.retired = true; clearTimeout(row.timer);
    row.retirement = Promise.resolve().then(() => row.pool.close()).then(() => observations.delete(row.id));
    void row.retirement.catch(() => {}); // Unconfirmed retirement retains its counted slot.
    return row.retirement;
  }
  function touch(row) {
    row.touched = now(); clearTimeout(row.timer);
    row.timer = setTimeout(() => void retire(row), Math.max(0, Math.min(row.created + 60000, row.touched + 30000) - now()));
    row.timer.unref?.();
  }
  function snapshot(root) {
    if (!gitObservation) return null;
    const start = performance.now();
    const head = gitObservation.gitValue(root, ['rev-parse', 'HEAD']);
    if (performance.now() - start > 1500 || head === null) return null;
    const tracked = gitObservation.gitPathList(root, ['diff', 'HEAD', '--name-only']);
    if (performance.now() - start > 1500 || tracked === null) return null;
    const untracked = gitObservation.gitPathList(root, ['ls-files', '--others', '--exclude-standard']);
    if (performance.now() - start > 1500 || untracked === null) return null;
    return { head, tracked, untracked };
  }
  return Object.freeze({
    async observe(root, input, signal) {
      const started = performance.now(); let row, provenanceMs = null;
      const restart = { tool: 'agdf_inspect', arguments: { operation: 'doctor', presentation_language: input.presentation_language,
        working_directory: input.working_directory, target_source: input.target_source, primary_target: input.primary_target,
        ...(input.all_active ? { all_active: true } : input.run_id ? { run_id: input.run_id } : {}) } };
      try {
        if (closed) throw Object.assign(Error(), { code: 'connection_closed' });
        if (verifyRuntime) { const start = performance.now(); try { verifyRuntime(); } finally { provenanceMs = performance.now() - start; } }
        for (const value of observations.values()) if (!value.retired && (now() - value.created >= 60000 || now() - value.touched >= 30000)) void retire(value);
        let offset = 0;
        if (input.cursor) {
          const parts = input.cursor.split(':'), [id, rawOffset] = parts;
          const selected = observations.get(id); offset = Number(rawOffset);
          if (!selected || selected.retired || selected.root !== root || selected.kind !== 'inventory' || !input.all_active
            || parts.length !== 2 || !Number.isSafeInteger(offset) || offset < 0 || String(offset) !== rawOffset) {
            throw Object.assign(Error(), { code: 'diagnostic_cursor_invalid' });
          }
          row = selected;
        } else {
          row = !input.all_active ? [...observations.values()].find(r => !r.retired && !r.pending && r.root === root && r.kind === 'selected') : null;
          if (!row) {
            if (observations.size >= 2) throw Object.assign(Error(), { code: 'resource_limit' });
            row = { id: randomBytes(32).toString('hex'), root, kind: input.all_active ? 'inventory' : 'selected',
              pool: poolFactory(root), created: now(), touched: now(), pending: false, retired: false, retirement: null };
            observations.set(row.id, row);
          }
        }
        if (row.pending) throw Object.assign(Error(), { code: 'busy' });
        row.pending = true; touch(row);
        const git_snapshot = snapshot(root);
        const remaining = 7000 - (performance.now() - started);
        if (remaining <= 0) throw Object.assign(Error(), { code: 'timeout' });
        const report = await row.pool.request({ operation: input.cursor ? 'doctor_page' : 'doctor_open',
          input: { all_active: input.all_active, run_id: input.run_id, git_snapshot, offset } }, signal, { timeout: remaining });
        row.pending = false; touch(row); row.last = report;
        const { next_offset, ...body } = report;
        return { ...body, target_id: resolveControlCommandTarget(root).target_id, observation_id: row.id,
          findings_scope: 'current_page', summary_scope: report.completeness === 'complete' ? 'observation' : 'current_page',
          overall_status: report.completeness === 'complete' ? report.status : null,
          next_cursor: next_offset === null ? null : `${row.id}:${next_offset}`,
          next_calls: next_offset === null ? [] : [{ ...restart, arguments: { ...restart.arguments, cursor: `${row.id}:${next_offset}` } }],
          timing: { ...report.timing, provenance_ms: provenanceMs, provenance_state: verifyRuntime ? 'verified' : 'not_configured',
            worker_startup_ms: row.pool.lastTiming?.startup_ms ?? null, total_ms: performance.now() - started }, authorizes: false };
      } catch (e) {
        if (row && !['busy', 'diagnostic_cursor_invalid'].includes(e.code)) { row.pending = false; void retire(row); }
        else if (row && e.code === 'diagnostic_cursor_invalid') row.pending = false;
        return { schema_version: '1', available: false, status: 'incomplete', completeness: 'incomplete', reason: e.code ?? 'read_failed',
          observed_as_of: row?.last?.observed_as_of ?? null, inventory: row?.last?.inventory ?? null,
          source_currentness: e.code === 'source_changed' ? 'stale' : 'unconfirmed', overall_status: null,
          next_cursor: null, next_calls: [restart], authorizes: false,
          timing: { total_ms: performance.now() - started, provenance_ms: provenanceMs, capture_and_evaluation_ms: null,
            unavailable_reason: 'operation_did_not_complete' } };
      }
    },
    async close() { closed = true; await Promise.all([...observations.values()].map(retire)); },
    inspectOwnership() { return { observations: observations.size, active: [...observations.values()].filter(r => !r.retired).length,
      inflight: [...observations.values()].filter(r => r.pending).length }; },
  });
}
