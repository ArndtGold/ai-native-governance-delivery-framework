import { validateEnforcement } from "../contracts.js";

// Claude is `instruction_only` here only because no evaluator implementation exists yet, not
// because no technical evidence path exists. `--disallowedTools "Edit,Write,Bash"` (headless
// `-p` invocation) is enforced by Claude Code itself, not the model, and combined with the same
// git-diff mutation check `evaluators/codex.js` uses would be `tool_enforced`-equivalent. See
// `.agdf/control/CONTEXT_GRAPH.md#CG-DELIVERY-PATH-SEARCH` (claude_enforcement_finding) and
// backlog item `claude-evaluator-tool-enforcement-implementation`.
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
