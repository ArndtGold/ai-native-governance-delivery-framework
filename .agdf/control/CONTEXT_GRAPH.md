# AGDF Context Graph

## Active Context Nodes

### CG-RUN-STATUS-CARD

- situation: AGDF has machine-readable gate and delivery-map outputs, but needs a compact human/agent status projection that includes the next permissible step and the next meaningful quality outlook.
- refs: plugin/meta/agdf-runtime-contract.md; create-agdf/bin/create-agdf.js; plugin/control/templates/AGDF_RUN.md; plugin/control/templates/artefacts/OR.md
- evidence: Existing fields include `next_allowed_action` and `quality_outlook`; the approved UR narrows this run to making the projection explicit and machine-readable.
- exit_criteria: Runtime contract, CLI JSON/text output, templates and smoke tests consistently expose the Run Status Card without creating a second gate model.

### CG-DELIVERY-PATH-SEARCH

- situation: High-impact AGDF delivery decisions can have several plausible next paths, so agents need a read-only way to compare delivery paths before implementation without turning search output into gate authority.
- refs: plugin/meta/agdf-runtime-contract.md; plugin/meta/agdf-plugin.definition.json; plugin/meta/agdf-agent-router.md; plugin/skills/delivery-path-search/SKILL.md; create-agdf/lib/delivery-path-search/; create-agdf/bin/create-agdf.js; .agdf/control/artefacts/agdf-delivery-path-search/OR.md
- evidence: UAT-approved `agdf-delivery-path-search` delivered a bounded best-first advisory search, deterministic gate-legality rejection, redacted persistence, a Codex read-only executable reference evaluator and explicit cross-surface capability boundaries. `claude-evaluator-tool-enforcement-implementation` (2026-07-10) added a second real, executable, `tool_enforced` evaluator for Claude Code, live-verified end-to-end (real CLI invocation, real recommendation, zero repository mutation confirmed via git-diff before/after in an isolated test repo).
- decision: Delivery Path Search is advisory evidence only. Canonical AGDF gates remain the sole execution authority, and every result must route back to gate-check before implementation.
- invariants: first release is bounded best-first search, not MCTS; Codex and Claude Code are both executable, `tool_enforced` reference evaluators; GitHub Copilot and OpenCode remain contract-ready until a conforming native or external evaluator is supplied for them; unsupported evaluator transports fail explicitly rather than being simulated.
- risks: model scores are judgements, not measurements; evaluator cost units are rubric units rather than provider-currency measurements; each Claude evaluation call has a real, non-trivial API cost (observed ~$0.07-$0.19 per near-trivial call), same cost category as Codex; Copilot and OpenCode instruction-only status cannot currently technically prove write prevention (not yet researched whether they have an equivalent path); AI-native candidate generation is intentionally deferred to a separate UR.
- claude_enforcement_finding: Verified against official Claude Code CLI docs (code.claude.com, 2026-07-09) and then live-tested against the actually-installed CLI (2.1.203) that `--disallowedTools "Edit,Write,Bash"` (headless `-p`/`--print` invocation) is enforced by Claude Code itself, not the model — confirmed live: a prompt explicitly asking to call the Write tool was refused because the tool was not offered, no file was created. Combined with the same `git status --porcelain` before/after mutation check already used in `evaluators/codex.js`, this is a legitimate `tool_enforced`-equivalent evidence path, cross-platform including Windows (unlike Claude's Bash-specific `--sandbox` flag, which lacks native Windows support and does not cover the file tools). Implemented in `evaluators/claude.js`, wired into `bin/create-agdf.js`'s `--surface claude`, and `capabilities.js` now reports `tool_enforced` for Claude with real evidence.
- exit_criteria: Runtime contract, CLI behavior, canonical skill routing, Pages/docs and package smoke tests consistently preserve the advisory-only gate boundary, explicit evaluator support matrix and non-MCTS method claim.

## Retired Context Nodes

| Node | Reason | Replacement |
|---|---|---|
