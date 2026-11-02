import { readFileSync } from "node:fs";
import { join } from "node:path";
import { generatedRoot, pluginDefinition } from "../cli/runtime-context.js";
import { assertMcpCapabilityProfile } from "./profile.js";

const profilePath = join(generatedRoot, "plugins", "agdf", "meta", "agdf-mcp-capability.json");

export const mcpCapabilityProfile = assertMcpCapabilityProfile(
  JSON.parse(readFileSync(profilePath, "utf8")),
  { expectedVersion: pluginDefinition.version },
);
