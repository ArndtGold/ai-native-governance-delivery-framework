import { useEffect, useRef, useState } from 'react';
import type { ReadTransport } from './api';
import { validateData, validateEnvelope } from './api';
import type { Envelope, ReadingScope } from './types';
import type { ReadingState } from './state';
import type { HandoffController } from './mcp/handoff';

export function useDraftCheck({ live, read, visible, pending, before, commit, handoff }: {
  live: { current: ReadingState }; read: ReadTransport; visible: boolean;
  pending: { current: AbortController | null }; before: () => void;
  commit: (result: Envelope<ReadingScope>, original: ReadingState) => void; handoff?: HandoffController;
}) {
  const [invalidated, setInvalidated] = useState(false);
  const [busy, setBusy] = useState(false), [problem, setProblem] = useState<string | null>(null);
  const epoch = useRef(0), mounted = useRef(true);
  const state = live.current, identity = `${state.scope?.snapshot_id}:${state.generation}:${state.route.view}:${state.stale}`;
  useEffect(() => {
    ++epoch.current; pending.current?.abort(); pending.current = null; setBusy(false); setProblem(null); setInvalidated(false);
  }, [identity, pending]);
  useEffect(() => { if (!visible) { ++epoch.current; pending.current?.abort(); pending.current = null; setBusy(false); setInvalidated(true); } }, [visible, pending]);
  useEffect(() => {
    mounted.current = true;
    const hidden = () => { if (document.hidden) { ++epoch.current; pending.current?.abort(); pending.current = null; setBusy(false); setProblem(null); setInvalidated(true); } };
    document.addEventListener('visibilitychange', hidden);
    return () => { mounted.current = false; ++epoch.current; pending.current?.abort(); pending.current = null; document.removeEventListener('visibilitychange', hidden); };
  }, [pending]);
  const check = async () => {
    const original = live.current, source = original.detail?.data?.draft_check?.source, scope = original.scope;
    if (invalidated || pending.current || !visible || document.hidden || original.phase !== 'ready' || original.stale || original.problem
      || original.route.view !== 'detail' || !source?.available || !scope?.snapshot_id) return;
    const controller = new AbortController(), token = ++epoch.current;
    pending.current = controller; setBusy(true); setProblem(null); before();
    const current = () => mounted.current && !controller.signal.aborted && epoch.current === token
      && live.current.scope === scope && live.current.generation === original.generation && !live.current.stale
      && live.current.phase === 'ready' && live.current.route.runId === original.route.runId && !document.hidden;
    const timer = setTimeout(() => { controller.abort(); if (mounted.current && epoch.current === token) { ++epoch.current; pending.current = null; setBusy(false); setProblem('timeout'); } }, 12_000);
    try {
      await handoff?.invalidate();
      if (!current()) return;
      if (handoff?.state.phase === 'uncertain') throw Error('context_cleanup_uncertain');
      const path = `/api/draft-check/${source.run_id}?snapshot=${scope.snapshot_id}&gate=${source.gate}&expected_revision=${source.revision_id}`;
      const expected = { target: scope.target.target_id, snapshot: scope.snapshot_id, replacement: true };
      const result = await read<ReadingScope>(path, controller.signal, expected);
      if (!current()) return;
      validateEnvelope(result, expected); validateData(path, result);
      if (!result.data || result.data.kind !== 'run' || !result.data.run?.draft_check?.result) throw Error(result.code ?? 'dto_invalid');
      if (result.data.run.draft_check.source.artifact_digest !== source.artifact_digest) throw Error('source_changed');
      commit(result, original);
    } catch (error) {
      if (current()) setProblem(error instanceof Error ? error.message : 'read_failed');
    } finally {
      clearTimeout(timer);
      if (pending.current === controller) pending.current = null;
      if (mounted.current && epoch.current === token) setBusy(false);
    }
  };
  return { busy, problem, check, invalidated };
}
