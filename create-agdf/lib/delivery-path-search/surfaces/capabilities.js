import { validateEnforcement } from "../contracts.js";

export function enforcementForSurface(surface, evidence = [], context = {}) {
  const defaults = {
    codex: { level: "tool_enforced", evidence: ["codex exec --sandbox read-only --ephemeral"] },
    claude: { level: "tool_enforced", evidence: ["claude -p --disallowedTools Edit,Write,Bash"] },
    copilot: { level: "instruction_only", evidence: [] },
    opencode: { level: "instruction_only", evidence: [] },
    generic: { level: "instruction_only", evidence: [] },
  };
  const selected = structuredClone(defaults[surface] ?? defaults.generic);
  if (surface === "opencode") {
    const preflight = context.preflight;
    if (preflight?.surface === "opencode"
      && preflight.status === "passed"
      && typeof preflight.invocation_id === "string"
      && preflight.invocation_id
      && Array.isArray(preflight.evidence)
      && preflight.evidence === evidence) {
      selected.level = "tool_enforced";
      selected.evidence = [...evidence];
    }
  } else if (evidence.length) {
    selected.evidence = evidence;
  }
  return validateEnforcement(selected);
}
