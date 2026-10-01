import { existsSync } from "node:fs";
import { join } from "node:path";
import { pluginDefinition } from "../cli/runtime-context.js";

import { inspectControlConfiguration } from "../control-state/control-configuration.js";

export function isOpenCodeLegacySurfacePresent(targetDir) {
  return existsSync(join(targetDir, ".opencode", pluginDefinition.opencode.instructionsFileName))
    && existsSync(join(targetDir, ".opencode", "skills", `${pluginDefinition.opencode.skillPrefix}gate-check`, "SKILL.md"));
}

export function evaluateOpenCodeRepositoryActivation(targetDir) {
  const observation = inspectControlConfiguration(targetDir);
  const legacySurface = isOpenCodeLegacySurfacePresent(targetDir);
  return { ...observation, legacy_surface: legacySurface,
    state: observation.active && legacySurface ? "legacy_compatible" : observation.state };
}
