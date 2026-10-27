// The three persisted user choices (SDD-07): one JSON file in the AGDF plugin data directory, which
// `claude plugin uninstall` removes; never `$.store`, which Claude keeps after uninstall (T-001).
// Host-independent: the adapter supplies the environment values and file access.

export const STATE_FILE = 'companion-state.json';
const PLUGIN_ID = 'agdf@agdf';
const DEFAULT_STATE = Object.freeze({ enabled: false, still: false, selections: Object.freeze({}) });

// Mirrors claudePluginDataRoot (packages/cli/lib/mcp-lifecycle/plugin-runtime.js): the plugin id with
// every character outside [A-Za-z0-9_-] replaced by "-" below <config dir>/plugins/data.
export function pluginDataDir({ configDir, userProfile, home }, pluginId = PLUGIN_ID) {
  const base = configDir || (userProfile || home ? `${userProfile || home}/.claude` : '');
  return base ? `${base.replace(/[\\/]+$/u, '')}/plugins/data/${pluginId.replace(/[^A-Za-z0-9_-]/gu, '-')}` : null;
}

// Invalid or foreign content reads as fresh, mutable defaults; selections map project roots to run ids.
export function parseCompanionState(text) {
  try {
    const value = JSON.parse(text);
    if (!value || value.schema_version !== 1) return defaultCompanionState();
    const selections = {};
    for (const [root, runId] of Object.entries(value.selections ?? {})) {
      if (typeof root === 'string' && typeof runId === 'string' && /^[A-Za-z0-9._-]{1,200}$/u.test(runId)) selections[root] = runId;
    }
    return { enabled: value.enabled === true, still: value.still === true, selections };
  } catch {
    return defaultCompanionState();
  }
}

export const serializeCompanionState = ({ enabled, still, selections }) =>
  `${JSON.stringify({ schema_version: 1, enabled: Boolean(enabled), still: Boolean(still), selections: { ...selections } }, null, 2)}\n`;

export const defaultCompanionState = () => ({ ...DEFAULT_STATE, selections: {} });
