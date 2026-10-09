import { resolve } from "node:path";

// Repository build/evaluation owner only; installed runtime roots have separate authority.
export const PLUGIN_SOURCE_RELATIVE = "plugins/agdf";
export function getPluginSourceRoot(repoRoot) {
  return resolve(repoRoot, PLUGIN_SOURCE_RELATIVE);
}
