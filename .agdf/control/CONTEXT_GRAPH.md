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
- evidence: UAT-approved `agdf-delivery-path-search` delivered bounded best-first advisory search and deterministic gate legality. `claude-evaluator-tool-enforcement-implementation` added a tool-enforced Claude evaluator. `delivery-path-search-ai-candidate-generation` adds opt-in bounded candidate generation: deterministic contracts/policy/guard/orchestration/package tests pass; a real Codex generator probe returned three schema-valid proposals in 19.117s with one abstract cost unit and zero worktree mutation; the real Claude probe reached the installed CLI but stopped unauthenticated before model invocation (`Not logged in`, provider cost $0), while deterministic Claude adapter/auth/guard tests pass.
- decision: Delivery Path Search remains advisory evidence only. Optional AI-native proposals supplement and never replace the deterministic baseline; canonical AGDF gates remain sole execution authority.
- invariants: bounded best-first search, not MCTS; at most one opt-in generation call, five proposals, 30 seconds and five abstract cost units within whole-run budgets; the core alone owns schema, exact `gate_action` legality, context allowlisting, duplicate/material-diversity rejection, budgets and visible fallback; provider adapters own transport only; automatic provider fallback is forbidden; Codex and Claude transports are designed as tool-enforced, while Copilot/OpenCode/generic remain instruction-only without conforming evidence.
- risks: model scores and generator cost units are judgements, not provider-currency measurements; deterministic similarity is conservative; external generation adds privacy/cost/latency exposure bounded by allowlists and hard limits; the current environment lacks authenticated Claude generator evidence; instruction-only surfaces cannot prove write prevention.
- claude_enforcement_finding: Verified against official Claude Code CLI docs (code.claude.com, 2026-07-09) and then live-tested against the actually-installed CLI (2.1.203) that `--disallowedTools "Edit,Write,Bash"` (headless `-p`/`--print` invocation) is enforced by Claude Code itself, not the model — confirmed live: a prompt explicitly asking to call the Write tool was refused because the tool was not offered, no file was created. Combined with the same `git status --porcelain` before/after mutation check already used in `evaluators/codex.js`, this is a legitimate `tool_enforced`-equivalent evidence path, cross-platform including Windows (unlike Claude's Bash-specific `--sandbox` flag, which lacks native Windows support and does not cover the file tools). Implemented in `evaluators/claude.js`, wired into `bin/create-agdf.js`'s `--surface claude`, and `capabilities.js` now reports `tool_enforced` for Claude with real evidence.
- exit_criteria: Runtime contract, CLI behavior, canonical skill routing, Pages/docs and package smoke tests consistently preserve advisory-only gates, deterministic baseline, generator boundaries, explicit surface capability claims and non-MCTS terminology; authenticated Claude generator evidence may close the retained runtime caveat later.

### CG-DOCUMENTATION-CEREMONY-BOUNDARY

- situation: `AGDF_RUN.md` was a single, one-size-fits-all template applied regardless of change size; the Runtime Contract already defined a lightweight "Quick Task Output" shape but had no explicit, mechanically checkable criterion for when it could replace the full file. This was discovered directly in this session: even a prior pure-documentation quick task (`agdf-backlog-vocabulary-visibility`) produced the full ~14-section file.
- refs: plugin/meta/agdf-runtime-contract.md (`Quick Task Output`, `Relevant Run`); plugin/control/templates/AGDF_RUN.md; create-agdf/bin/create-agdf.js (`liveControlFiles`, doctor)
- evidence: `agdf-micro-tier-below-quick-task` UR → Brownfield Review → PRD → SD → TP → Brownfield Analysis, all `pass`/approved on 2026-07-10. Confirmed `doctor` requires `AGDF_RUN.md` to exist (`AGDF_CONTROL_FILE_MISSING` block check) but does not parse or depend on the Runtime Contract's own prose, so the boundary could be added without touching `doctor`, any skill, or any code file.
- decision: A `quick_task` whose entire diff stays fully outside `plugin/skills/**`, `plugin/control/templates/**`, `plugin/meta/**`, `create-agdf/lib/**`, `create-agdf/bin/**` and any other code file may close with only the compact Quick Task Output shape. It must not create, rewrite or expand any of `AGDF_RUN.md`'s core sections. It gets a `MASTER_BACKLOG.md` entry only if otherwise a "Relevant Run," and at most one appended `Prior Run Pointers` line if `AGDF_RUN.md` currently reflects a different, unrelated run.
- invariants: the boundary is an explicit path-based allow-list, not a prose judgment call, and fails closed (unlisted or ambiguous paths keep full ceremony); ceremony for anything touching the listed normative paths is unchanged; no new Mode/Slice Decision value was introduced.
- risks: the allow-list could miss a future normative location added under a new subdirectory — mitigated by the fail-closed default rather than assumed coverage; a prose-only version of this boundary would have been a scope-creep loophole, which is why it was rejected during Brownfield Review/PRD in favor of the explicit path list.
- exit_criteria: Runtime Contract wording, generated Codex/Copilot/OpenCode surface copies (Claude reads `plugin/` directly, no separate copy) and a genuine worked example (this run's own `README.md` `agdf/` directory-listing fix) consistently demonstrate the boundary without weakening ceremony for runtime-governing changes.

## Retired Context Nodes

| Node | Reason | Replacement |
|---|---|---|
