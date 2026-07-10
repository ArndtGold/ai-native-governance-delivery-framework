# Brownfield Review: Implement Claude Delivery Path Search Evaluator With Tool-Enforced Evidence

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: claude-evaluator-tool-enforcement-implementation
- related_ur: .agdf/control/artefacts/claude-evaluator-tool-enforcement-implementation/UR.md
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-10

## Objective

Resolve the UR's two named risks with live verification (not documentation alone) before sizing the
implementation: (1) is spawning `claude -p` as a subprocess from within a running Claude Code session
safe, and (2) does `--disallowedTools` behave as documented on the actually-installed CLI version.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | none | New evaluator surface, no behavior change to existing gates/search logic | low |
| Source of truth | `create-agdf/lib/delivery-path-search/evaluators/codex.js` | Structural pattern for the new `claude.js`: schema-constrained prompt, subprocess invocation, git-diff mutation check | high |
| Runtime path | `create-agdf/bin/create-agdf.js` `executeDeliveryPathSearch` | Currently `options.surface === "codex" ? codexEvaluator(...) : null` — exact point needing a new branch | high |
| UI / UX | none | | none |
| Persistence / data | `create-agdf/lib/delivery-path-search/contracts.js` | Evaluator output must satisfy `validateEvaluation`/`evaluatorOutputSchema` unchanged | medium |
| Tests / QA | `create-agdf/scripts/delivery-path-search-test.js`, `delivery-path-search-unit-test.js` | Both use `fixtureEvaluator`, not live `codexEvaluator`/`claudeEvaluator` invocation — confirms CI does not require a live evaluator binary | medium |
| Release / operations | none | No CI dependency on a live `claude` binary needed, matching the existing Codex pattern | none |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Live invocation confirmed safe and fast | Ran `claude -p "..." --disallowedTools "Edit,Write,Bash" --output-format json` from within this running session: completed in ~2s, exit 0, `git status --porcelain` identical before/after, no session/quota interference observed | none | Proceed with implementation using this exact invocation shape |
| `--disallowedTools` is genuinely enforced, not just an instruction | Ran a second live test explicitly asking the model to call the Write tool with `--disallowedTools "Edit,Write,Bash"` set: model responded "The Write tool isn't enabled in this session", no file was created, confirmed via `ls` | none | This is real evidence; do not additionally rely on `permission_denials` (it stayed empty in both tests since the tool was never offered, not merely denied — so it is not a reliable proof signal by itself) |
| All required flags exist on the installed CLI | `claude --version` → `2.1.203 (Claude Code)`; `claude --help` confirms `-p/--print`, `--disallowedTools`/`--disallowed-tools`, `--output-format json`, and `--json-schema` (better than Codex's file-based `--output-schema`, can be passed inline) | none | Use `--json-schema` directly instead of writing a schema file to a temp dir, simplifying the pattern slightly vs. `codex.js` |
| Real per-call cost is non-trivial | Test calls cost `$0.190374` and `$0.0705414` respectively for near-trivial prompts (mostly system-prompt/cache-creation overhead) | warn | Not a blocker — Codex evaluations have comparable real cost too — but worth a one-line note in the implementation's evidence/README that each Claude evaluation call has a real, non-zero API cost, same category as Codex |
| No CI dependency required | Existing tests only exercise `fixtureEvaluator`, never a live `codexEvaluator`/future `claudeEvaluator` call | none | New evaluator needs no CI wiring beyond existing fixture-based tests continuing to pass; acceptance is local/manual verification, matching the existing Codex precedent |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: Adds one new surface evaluator following an already-established, verified pattern (`codex.js`); no new architecture, no contract/persistence change, no CI dependency change — narrow and local.
- evidence: Live verification above confirms the approach works exactly as planned with no open unknowns; the only code changes are one new file, one new branch in existing CLI wiring, and one config value update.
- transparency_note: Quick Task Execution may now implement `evaluators/claude.js`, wire it into `executeDeliveryPathSearch`, and update `capabilities.js`'s `claude` entry to `tool_enforced` with real evidence.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | none | none |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: Implements the finding already recorded in `claude_enforcement_finding`; no new node needed, existing node's implementation status should be updated once done.

## Next Permissible Step

- next_allowed_action: Quick Task Execution — implement `evaluators/claude.js`, wire into `bin/create-agdf.js`, update `capabilities.js`, verify against fixture tests and a live manual invocation.
- forbidden_until_then: PRD, SD, TP, Brownfield Analysis (not required for quick_task), changes to Copilot/OpenCode evaluator status.

## Quality Outlook

- quality_outlook: Live verification eliminated both risks the UR flagged before any code was written — implementation can proceed with high confidence and no remaining open unknowns.
