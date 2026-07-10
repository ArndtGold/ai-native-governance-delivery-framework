# UR: Implement Claude Delivery Path Search Evaluator With Tool-Enforced Evidence

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-10
Date: 2026-07-10
Owner: agent

## 1. Problem

`create-agdf/lib/delivery-path-search/surfaces/capabilities.js` currently reports Claude Code as
`instruction_only` with empty `evidence: []`, and no `evaluators/claude.js` exists — only
`evaluators/codex.js`. The prior `claude-evaluator-enforcement-decision` UR verified against official
Claude Code CLI documentation that a technical, `tool_enforced`-equivalent path exists (headless `-p`
invocation with `--disallowedTools "Edit,Write,Bash"`, enforced by Claude Code itself, not the model),
but explicitly deferred implementation to this follow-up UR.

## 2. Goal

Implement `evaluators/claude.js` analogous to `evaluators/codex.js`, wire it into the
`delivery-path-search` CLI command, and upgrade Claude's reported enforcement level in
`capabilities.js` from `instruction_only` to `tool_enforced` with real evidence — so Claude Code
reaches the same evaluator-quality tier Codex already has.

## 3. Scope

- In scope: new `create-agdf/lib/delivery-path-search/evaluators/claude.js`, following `codex.js`'s
  structure — spawn `claude -p` (or documented equivalent headless invocation) with
  `--disallowedTools "Edit,Write,Bash"`, a schema-constrained evaluation-only prompt, and the same
  `git status --porcelain` before/after mutation check `codex.js` already uses.
- In scope: wiring the new evaluator into `executeDeliveryPathSearch` in `create-agdf/bin/create-agdf.js`
  (currently only `options.surface === "codex"` resolves to an executable evaluator; add `"claude"`).
- In scope: updating `capabilities.js`'s `claude` entry to `{ level: "tool_enforced", evidence: [...] }`
  once the evaluator exists, removing the now-outdated explanatory comment added by the prior UR.
- In scope: confirming the exact CLI invocation (flag names, output format, headless mode syntax)
  against the installed Claude Code CLI version in this environment before finalizing the
  implementation, since documentation can drift from the exact installed version's behavior.

## 4. Non-Goals

- No Copilot or OpenCode evaluator implementation — those remain contract-ready, out of scope here.
- No change to the bounded best-first search algorithm, scoring, or candidate-policy logic.
- No change to AI-native candidate generation (`delivery-path-search-ai-candidate-generation` remains
  its own, separately deferred backlog item).
- Not requiring CI to install a real `claude` CLI binary — matching the existing pattern where
  `codexEvaluator` also has no live-invocation test in CI, only fixture-based search-engine tests;
  this UR's evaluator should be manually/locally verifiable in an environment with the `claude` CLI
  available (such as this one), not gated on a new CI dependency.

## 5. Acceptance Signals

- `node -e "..."` or a small local script can invoke the new Claude evaluator against a real
  candidate and get back a validated evaluation, with the mutation check confirming no repository
  changes occurred.
- `capabilities.js`'s `claude` entry reports `tool_enforced` with concrete, real evidence (the actual
  invocation flags used), passing `validateEnforcement`.
- Existing `delivery-path-search-test.js` and `delivery-path-search-unit-test.js` continue to pass
  unmodified in their fixture-based coverage.
- `check-runtime-integrity.mjs` and both packages' smoke tests still pass.

## 6. Existing Source Of Truth

- `create-agdf/lib/delivery-path-search/evaluators/codex.js` (structural pattern to follow)
- `create-agdf/lib/delivery-path-search/surfaces/capabilities.js` (current hardcoded default, and the
  explanatory comment added by `claude-evaluator-enforcement-decision`)
- `.agdf/control/CONTEXT_GRAPH.md#CG-DELIVERY-PATH-SEARCH` (`claude_enforcement_finding`)
- `create-agdf/bin/create-agdf.js` `executeDeliveryPathSearch` (integration point)

## 7. Risks And Unknowns

- The exact headless invocation syntax must be verified against the actually-installed Claude Code
  CLI version in this environment, not assumed from documentation alone — flag names or output
  formatting could differ from what was verified via docs research.
- Spawning `claude -p` as a subprocess from within a script that itself may be run inside a Claude
  Code session needs a sanity check that this does not create unexpected session/quota interference;
  Brownfield Analysis before implementation should confirm this is safe.
- Claude Code's Bash-specific `--sandbox` is not the mechanism used here (no native Windows support,
  does not cover file tools); using the wrong flag would silently produce a non-enforced result that
  looks enforced — the git-diff mutation check is the safety net against exactly this.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
