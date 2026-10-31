// Canonical private-child entry. Source execution uses the same full factory;
// package builders compile it while retaining protocol/state module identities.
export { createMcpDispatchRuntime, createMcpDecisionRuntime, createMcpCockpitRuntime,
  DECISION_UI_URI, inspectMcpDispatcherRuntime, releaseAbandonedOwnedLock,
  OWNED_LOCK_CHANNEL } from './mcp-dispatch-runtime.js';
