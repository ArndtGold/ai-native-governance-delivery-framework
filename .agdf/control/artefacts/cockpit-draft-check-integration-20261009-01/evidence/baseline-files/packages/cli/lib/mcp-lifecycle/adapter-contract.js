import { claudeAdapter } from "./adapters/claude.js";
import { codexAdapter } from "./adapters/codex.js";
import { copilotAdapter } from "./adapters/copilot.js";
import { opencodeAdapter } from "./adapters/opencode.js";

const REQUIRED = Object.freeze([
  "nativeScope",
  "probeHost",
  "resolveSources",
  "inspect",
  "createTransaction",
  "referenceIdentity",
  "permissionEffect",
]);

export function validateMcpHostAdapter(adapter) {
  const errors = [];
  if (!adapter || typeof adapter !== "object") errors.push("adapter");
  if (!["codex", "claude", "opencode", "copilot"].includes(adapter?.surface)) errors.push("surface");
  for (const method of REQUIRED) if (typeof adapter?.[method] !== "function") errors.push(method);
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function validateMcpResolvedSources(sources) {
  const errors = [];
  if (!Array.isArray(sources) || !sources.length) return Object.freeze({ valid: false, errors: Object.freeze(["sources"]) });
  for (const [index, source] of sources.entries()) {
    if (!source || typeof source !== "object") { errors.push(`source:${index}`); continue; }
    if (typeof source.id !== "string" || !source.id.trim()) errors.push(`source:${index}:id`);
    if (typeof source.path !== "string" || !source.path.trim()) errors.push(`source:${index}:path`);
    if (!Number.isInteger(source.priority)) errors.push(`source:${index}:priority`);
    if (typeof source.selected !== "boolean") errors.push(`source:${index}:selected`);
  }
  if (sources.filter((source) => source?.selected === true).length !== 1) errors.push("selected_source");
  if (new Set(sources.map((source) => source?.id)).size !== sources.length) errors.push("source_ids");
  if (new Set(sources.map((source) => source?.priority)).size !== sources.length) errors.push("source_priorities");
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

const entries = [codexAdapter, claudeAdapter, opencodeAdapter, copilotAdapter];
for (const adapter of entries) {
  const validation = validateMcpHostAdapter(adapter);
  if (!validation.valid) throw new Error(`AGDF_MCP_ADAPTER_INVALID:${adapter?.surface ?? "unknown"}:${validation.errors.join(",")}`);
}

const registry = new Map(entries.map((adapter) => [adapter.surface, adapter]));

export function resolveMcpHostAdapter(surface) {
  const adapter = registry.get(surface);
  if (!adapter) throw new Error("AGDF_MCP_SURFACE_UNSUPPORTED");
  return adapter;
}

export const mcpHostAdapters = Object.freeze(Object.fromEntries(entries.map((adapter) => [adapter.surface, adapter])));
