// Figure state of a run (SD SDD-004): the Core run view carries the derived mood and reason, so the
// companion only overlays its own turn activity. It derives no run semantics itself.

export const MOODS = Object.freeze(['laeuft', 'baut', 'wartet', 'blockiert', 'fertig', 'bereit']);

// { mood, reason: { key, gate?, decision?, reason? } } as the run view derived it.
export function runState(run) {
  return run?.figure ?? { mood: 'bereit', reason: { key: 'idle' } };
}

// Moods a main-loop turn does not cover: a run being built stays baut, and a run waiting for an
// approval or a decision stays wartet, since the chat usually asks for it during that turn (chat-run
// navigation SDD-07). A blocked run shows läuft, since the chat usually resolves it.
const THROUGH_TURN = new Set(['baut', 'wartet']);

// A main-loop turn in progress shows läuft for every other mood; the run-derived state returns after
// the turn.
export function displayState(run, { isTurnActive = false } = {}) {
  const derived = runState(run);
  if (isTurnActive && !THROUGH_TURN.has(derived.mood)) return { mood: 'laeuft', reason: { key: 'turnActive' } };
  return derived;
}
