// Canonical worker entry. Source execution delegates to the same full factory;
// package builders compile this entry without changing the Core service owners.
export { createMcpDispatchRuntime, OWNED_LOCK_CHANNEL } from './mcp-dispatch-runtime.js';
