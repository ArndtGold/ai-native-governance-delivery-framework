import { validateEnforcement } from "../contracts.js";

export function enforcementForSurface(surface, evidence = []) {
  const defaults = {
    codex: { level: "tool_enforced", evidence: ["codex exec --sandbox read-only --ephemeral"] },
    claude: { level: "instruction_only", evidence: [] },
    copilot: { level: "instruction_only", evidence: [] },
    opencode: { level: "instruction_only", evidence: [] },
    generic: { level: "instruction_only", evidence: [] },
  };
  const selected = structuredClone(defaults[surface] ?? defaults.generic);
  if (evidence.length) selected.evidence = evidence;
  return validateEnforcement(selected);
}
