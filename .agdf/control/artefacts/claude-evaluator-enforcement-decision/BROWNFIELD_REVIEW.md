# Brownfield Review: Decide And Document Claude Code's Delivery Path Search Enforcement Level

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: claude-evaluator-enforcement-decision
- related_ur: .agdf/control/artefacts/claude-evaluator-enforcement-decision/UR.md
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-10

## Objective

Determine, with factual verification rather than assumption, whether Claude Code can support a
technical evidence path for Delivery Path Search enforcement, and decide the smallest safe next step.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | none directly | Decision affects documentation and a hardcoded default, not current runtime behavior | low |
| Source of truth | `create-agdf/lib/delivery-path-search/surfaces/capabilities.js`; `.agdf/control/CONTEXT_GRAPH.md` (`CG-DELIVERY-PATH-SEARCH`) | The Context Graph node's existing `risks` line ("instruction_only surfaces cannot technically prove write prevention") is a blanket claim that this review found to be inaccurate for Claude Code specifically | high |
| Runtime path | `create-agdf/lib/delivery-path-search/evaluators/codex.js` (reference pattern) | Codex's evaluator combines a CLI-level sandbox flag with an independent `git status --porcelain` before/after mutation check — the mutation check itself is harness-agnostic and reusable | medium |
| UI / UX | none | | none |
| Persistence / data | none | | none |
| Tests / QA | none yet for a Claude evaluator | No `evaluators/claude.js` exists | none (nothing to regress) |
| Release / operations | none | | none |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Claude Code CLI factually supports headless, tool-permission-restricted invocation enforced by the CLI itself, not the model | Verified against official docs (code.claude.com, 2026-07-09): `-p`/`--print` for non-interactive one-shot invocation with `--output-format json`; `--disallowedTools "Edit,Write,Bash"` (or `--allowedTools`) is enforced by Claude Code before the model can call a disallowed tool, quoted directly: "Permission rules are enforced by Claude Code, not by the model." | none | Record this as the concrete technical evidence path; a follow-up UR can implement `evaluators/claude.js` combining `--disallowedTools "Edit,Write,Bash"` with the same `git status --porcelain` diff check already used in `codex.js` |
| The existing Context Graph risk statement is a blanket claim broader than the facts support | `CG-DELIVERY-PATH-SEARCH` risks: "instruction_only surfaces cannot technically prove write prevention" — true for Copilot/OpenCode (not researched here, not verified false), but now known incorrect as a blanket statement covering Claude Code | warn | Update the Context Graph node to scope this risk correctly instead of leaving an inaccurate blanket claim in a durable artefact |
| Codex's `--sandbox` uses OS-level process isolation (Seatbelt/bubblewrap, Linux/macOS/WSL2 only); Claude Code's equivalent (`--sandbox`) is Bash-specific and also lacks native Windows support | Official docs: "Built-in file tools: Read, Edit, and Write use the permission system directly rather than running through the sandbox" | none | The correct analog for Claude is the tool-permission layer (`--disallowedTools`), not Claude's `--sandbox` flag — cross-platform including Windows, since it's enforced by Claude Code's own tool dispatch, not OS sandboxing |
| Implementing the actual evaluator is out of this UR's Non-Goals | UR: "Not implementing a new `evaluators/claude.js` file in this UR — only deciding whether that follow-up is worth pursuing" | none | Record the decision and open a new Planned/Parking Lot backlog item for the implementation; do not implement here |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: This UR's scope is research + a durable decision + documentation update, not new code — exactly matching Quick Task's "narrow local change, no architecture/policy/persistence/contract expansion" bar.
- evidence: Verified factual research is complete; remaining work is updating `CONTEXT_GRAPH.md`, adding an explanatory comment in `capabilities.js`, and adding one new backlog item for the (separately gated) implementation follow-up.
- transparency_note: Quick Task Execution may now update the Context Graph node, add a code comment, and record a new Planned/Parking Lot item — no change to `capabilities.js`'s actual runtime `enforcementForSurface` values, since upgrading Claude's enforcement level to `tool_enforced` requires the actual evaluator implementation, which is out of scope here.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | none | none |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: The node's `risks` line inaccurately generalized "instruction_only surfaces cannot technically prove write prevention" to all non-Codex surfaces; this review found that false for Claude Code specifically and the node must be corrected.

## Next Permissible Step

- next_allowed_action: Quick Task Execution — update `CONTEXT_GRAPH.md`, add an explanatory comment in `capabilities.js`, add a new Planned/Parking Lot backlog item for the `evaluators/claude.js` implementation follow-up.
- forbidden_until_then: Implementing `evaluators/claude.js` itself or changing `capabilities.js`'s `claude` enforcement level value (both belong to a separate, later-gated UR).

## Quality Outlook

- quality_outlook: This closes the "unreviewed hardcoded default" gap identified earlier, replaces an inaccurate blanket claim in the Context Graph with a verified, scoped one, and hands off a concretely scoped implementation opportunity instead of a vague TODO.
