import type { CockpitBridge } from './transport';
import type { HandoffController } from './handoff';
import { validateEnvelope } from '../api';

// One immutable view binding, using the existing context and session owners.
// Host teardown may force retirement into Core's owner-loss quarantine; an
// explicit application close must confirm context release before retirement.
export function createViewCloser(bridge: CockpitBridge, handoff: HandoffController, session: string, target: string) {
  let pending: Promise<void> | undefined, retirement: Promise<void> | undefined, forcedJob: Promise<void> | undefined;
  const retire = () => retirement ??= (async () => {
    const result = await bridge.operation({ operation: 'close' }, undefined, session);
    validateEnvelope(result, { target, snapshot: '', replacement: true });
    if (result.state !== 'available' || (result.data as { closed?: boolean } | null)?.closed !== true) throw Error('session_close_unconfirmed');
  })();
  const release = () => pending ??= (async () => {
    await handoff.invalidate();
    if (handoff.snapshot().phase !== 'idle') throw Error('context_cleanup_uncertain');
    await retire();
  })();
  const close = (forced = false): Promise<void> => forced
    ? forcedJob ??= release().catch(async error => { await retire(); throw error; })
    : release();
  return { session, close };
}
