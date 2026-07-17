import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginDefinition } from "../cli/runtime-context.js";

const requiredConfigFields = ["artifact_language", "chat_language", "runtime_language"];

export function isOpenCodeLegacySurfacePresent(targetDir) {
  return existsSync(join(targetDir, ".opencode", pluginDefinition.opencode.instructionsFileName))
    && existsSync(join(targetDir, ".opencode", "skills", `${pluginDefinition.opencode.skillPrefix}gate-check`, "SKILL.md"));
}

export function evaluateOpenCodeRepositoryActivation(targetDir) {
  const controlDir = join(targetDir, ".agdf", "control");
  const configPath = join(controlDir, "config.json");
  const legacySurface = isOpenCodeLegacySurfacePresent(targetDir);
  const base = {
    control_dir: controlDir,
    config_path: configPath,
    legacy_surface: legacySurface,
  };

  if (!existsSync(configPath)) {
    return { ...base, state: "inactive", active: false, diagnostic: "missing_control_config" };
  }

  try {
    const config = JSON.parse(readFileSync(configPath, "utf8"));
    const valid = config
      && typeof config === "object"
      && !Array.isArray(config)
      && requiredConfigFields.every((field) => typeof config[field] === "string" && config[field].trim());
    if (!valid) return { ...base, state: "invalid_control", active: false, diagnostic: "invalid_control_config" };
  } catch (error) {
    return { ...base, state: "invalid_control", active: false, diagnostic: "invalid_control_json", error: error.message };
  }

  return {
    ...base,
    state: legacySurface ? "legacy_compatible" : "active",
    active: true,
    diagnostic: "valid_control_config",
  };
}
