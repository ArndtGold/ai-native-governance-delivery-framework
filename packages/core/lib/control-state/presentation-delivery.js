import { runCommandRequestDigest } from './run-command-contract.js';
import { resolveControlCommandTarget } from './approval-command-contract.js';
import { readRun } from './run-state-edits.js';
import { runSealState } from './run-seal.js';

export const presentationDeliveryKey = input => [input.target_id, input.run_id, input.expected_revision_id,
  input.command?.payload?.presentation_id ?? input.presentation_id ?? input.operation_id].join(':');

// Connection-local delivery bookkeeping, shared by every MCP host. A private UI
// view may offer a live confirmation/retirement hook; it never grants a gate.
export function createPresentationDelivery({ now = Date.now } = {}) {
  const rows = new Map(), pendingRuns = new Set(); let closed = false;
  const sameRun = (a, b) => a.target_id === b.target_id && a.run_id === b.run_id;
  function expire() {
    for (const [key, row] of rows) if (!row.pending && now() - row.created >= 30 * 60_000) {
      void row.view?.retire().catch(() => {}); rows.delete(key);
    }
  }
  const failure = reason => ({ schema_version: '1', outcome: 'rejected', reason, authorizes: false });
  return Object.freeze({
    remember(input, result) {
      expire();
      if (closed || !['accepted', 'already_applied'].includes(result.outcome) || !result.family_result?.text) return;
      const prepared = result.family_result, key = presentationDeliveryKey({ ...input, operation_id: prepared.presentation_id });
      if (rows.has(key)) return;
      if (rows.size >= 64 || [...rows.values()].reduce((n, d) => n + Buffer.byteLength(d.result.family_result.text), 0)
        + Buffer.byteLength(prepared.text) > 8 * 1024 ** 2) return;
      rows.set(key, { input, result, created: now(), selected: null, view: null, pending: false });
    },
    prepared(input) { return rows.get(presentationDeliveryKey(input)) ?? null; },
    async deliver(input, host = {}) {
      const payload = input.command.payload, row = rows.get(presentationDeliveryKey(input));
      const runKey = `${input.target_id}:${input.run_id}`;
      const base = { ...(row?.result ?? {}), family_result: {}, receipt: null, effect: null, historical_effect: false, recovery: null,
        schema_version: '1', outcome: 'accepted', reason: null, operation_id: input.operation_id, request_digest: runCommandRequestDigest(input),
        binding: { target_id: input.target_id, run_id: input.run_id, expected_revision_id: input.expected_revision_id, kind: 'presentation.deliver' }, authorizes: false };
      if (closed || !row || now() - row.created >= 30 * 60_000) return { ...base, ...failure('delivery_state_unavailable') };
      if (row.pending || pendingRuns.has(runKey)) return { ...base, ...failure('busy') };
      const selected = row.selected;
      if (selected?.operation_id === input.operation_id && selected.digest !== base.request_digest) return { ...base, ...failure('operation_payload_conflict') };
      const emit = (mode, text, historical = false) => ({ ...base, historical_effect: historical, presentation_delivery: {
        delivery_id: selected?.operation_id ?? input.operation_id, mode, text, historical_delivery: historical,
        presentation_id: payload.presentation_id, revision_id: input.expected_revision_id, document_digest: row.result.family_result.document_digest,
        cleanup_state: row.cleanup ?? 'not_required',
        instruction: historical ? 'Already delivered. Do not repeat the summary or decision question.' : 'Forward this exact text once; append no second summary or decision request.', authorizes: false } });
      if (selected && !(payload.route === 'fallback' && selected.mode === 'ui_primary')) return emit(selected.mode, '', true);
      row.pending = true; pendingRuns.add(runKey);
      try {
        const root = resolveControlCommandTarget(input.primary_target).root;
        if (resolveControlCommandTarget(root).target_id !== input.target_id || row.input.command.payload.gate !== payload.gate) return { ...base, ...failure('presentation_binding_changed') };
        const run = readRun(root, input.run_id);
        if (run.rejection || run.meta.revision_id !== input.expected_revision_id || runSealState(root, run.content).status !== 'valid') {
          await row.view?.retire().catch(() => {}); return { ...base, ...failure('presentation_binding_changed') };
        }
        const priorViews = [...rows.values()].filter(peer => peer !== row && sameRun(peer.input, input) && peer.view);
        const retired = await Promise.all(priorViews.map(peer => peer.view.retire().then(() => 'confirmed', () => 'unconfirmed')));
        if (retired.length) row.cleanup = retired.includes('unconfirmed') ? 'unconfirmed' : 'confirmed';
        const displayed = !selected && payload.route === 'automatic' && row.view?.confirm(host) === true;
        // The session owner revokes primary/actions synchronously, before its
        // asynchronous read-worker cleanup. Failed cleanup retains capacity but
        // cannot retain decision authority or prevent a safe Markdown fallback.
        if (displayed) row.view.select();
        else if (row.view) {
          const cleanup = await row.view.retire().then(() => 'confirmed', () => 'unconfirmed');
          row.cleanup = row.cleanup === 'unconfirmed' ? row.cleanup : cleanup;
        }
        const mode = displayed ? 'ui_primary' : 'full_markdown';
        row.selected = { mode, operation_id: input.operation_id, digest: base.request_digest };
        return emit(mode, displayed ? row.result.family_result.companion_text : row.result.family_result.text);
      } finally { row.pending = false; pendingRuns.delete(runKey); }
    },
    close() { closed = true; for (const row of rows.values()) void row.view?.retire().catch(() => {}); rows.clear(); },
  });
}
