import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function inspectControlConfiguration(targetDir) {
  const control_dir = join(targetDir, ".agdf", "control");
  const config_path = join(control_dir, "config.json");
  const base = { control_dir, config_path };
  if (!existsSync(config_path)) return { ...base, state: "inactive", active: false, diagnostic: "missing_control_config" };
  try {
    const config = JSON.parse(readFileSync(config_path, "utf8"));
    if (!config || typeof config !== "object" || Array.isArray(config)
        || !["artifact_language", "chat_language", "runtime_language"].every((field) => typeof config[field] === "string" && config[field].trim())) {
      return { ...base, state: "invalid_control", active: false, diagnostic: "invalid_control_config" };
    }
  } catch (error) {
    return { ...base, state: "invalid_control", active: false, diagnostic: "invalid_control_json", error: error.message };
  }
  return { ...base, state: "active", active: true, diagnostic: "valid_control_config" };
}
