# AGDF Run State

## Run Meta

- run_id: claude-evaluator-tool-enforcement-implementation
- started_at: 2026-07-10
- mode: quick_task
- current_gate: Quick Task Execution
- decision: pass
- owner: agent

## Objective

Implement `evaluators/claude.js`, wire it into the `delivery-path-search` CLI command, and upgrade
Claude's reported enforcement level in `capabilities.js` from `instruction_only` to `tool_enforced`
with real evidence.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Brownfield Review live-verified both open risks: spawning `claude -p` as a subprocess from within a running Claude Code session works cleanly (no interference), and `--disallowedTools "Edit,Write,Bash"` genuinely prevents the model from calling those tools (confirmed by asking it to write a file and observing refusal + no file created). Implementation followed and was end-to-end verified with a real CLI invocation producing a real recommendation and zero repository mutation. |
| What is approved? | `Approval: UR` provided on 2026-07-10. Brownfield Review done, selected `quick_task`. Quick Task implemented and verified end-to-end. |
| What is missing? | Nothing for this run's approved scope. |
| What is the next allowed action? | Offer delivery closeout; commit/push require separate explicit instruction. |
| What is explicitly forbidden right now? | Changing Copilot/OpenCode evaluator status, or the search/scoring/candidate-policy logic — both out of scope here. |

## Prior Run Pointers

- `gate-state-clarity`, `create-agdf-lib-test-coverage`, `plugin-author-consistency-fix` and `claude-evaluator-enforcement-decision` all completed on 2026-07-10 with real CI confirmation (latest pushed commit `debe2e4`); see `.agdf/control/MASTER_BACKLOG.md` Completed section.
- Remaining Planned/Parking Lot items (`delivery-path-search-ai-candidate-generation`, `npm-publish-qa-caveat-closure`) are independent of this run.

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | Pass |
| Current gate | Quick Task Execution |
| Allowed now | Delivery closeout handoff |
| Blocked by | none |
| Missing approval | none |
| Next step | Offer commit-ready handoff; wait for explicit commit/push instruction; then re-check CI |
| Quality outlook | Claude Code is now a second real, `tool_enforced` executable evaluator alongside Codex, live-verified end-to-end, not just documented |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided in session on 2026-07-10 |
| PRD | not_applicable | quick_task; Brownfield Review selected quick_task, no PRD required |
| SD | not_applicable | quick_task |
| TP | not_applicable | quick_task |
| QA | not_applicable | quick_task has no formal QA gate; relevant checks recorded as evidence instead |
| UAT | not_applicable | quick_task |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/claude-evaluator-tool-enforcement-implementation/UR.md | approved | Implement Claude Delivery Path Search evaluator with tool-enforced evidence |
| Brownfield Review | .agdf/control/artefacts/claude-evaluator-tool-enforcement-implementation/BROWNFIELD_REVIEW.md | done | Live-verified both named risks before implementation; selected quick_task |
| PRD | not_applicable | not_applicable | quick_task |
| SD | not_applicable | not_applicable | quick_task |
| TP | not_applicable | not_applicable | quick_task |
| Brownfield Analysis | not_applicable | not_applicable | quick_task |
| Review | none | missing | No separate formal code review artefact for this quick_task; checks recorded as evidence below |
| QA | not_applicable | not_applicable | quick_task |
| OR | inline (OR-lite) | done | Recorded in Closeout below, per quick_task OR-lite allowance |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: One new evaluator file following an established pattern, one new branch in existing CLI wiring, one config value update — no new architecture, contract or persistence change.
- evidence: Brownfield Review's live verification removed all open unknowns before implementation began; implementation matched the plan exactly.
- transparency_note: Implementation completed under this decision; Copilot/OpenCode evaluators remain a separate, not-yet-started scope.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval captured in session on 2026-07-10 |
| Brownfield Review | sizes | UR | Selected quick_task; live-verified subprocess safety and `--disallowedTools` enforcement before implementation |
| Quick Task Execution | implements | Brownfield Review | New `create-agdf/lib/delivery-path-search/evaluators/claude.js`; new `"claude"` branch in `bin/create-agdf.js`'s `executeDeliveryPathSearch`; `capabilities.js`'s `claude` entry upgraded to `tool_enforced` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Subprocess safety confirmed live | Ran `claude -p ... --output-format json` from within this running session: ~2s, exit 0, `git status --porcelain` identical before/after | No session/quota interference | direct |
| `--disallowedTools` genuinely enforced | Ran `claude -p` asking the model to call the Write tool with `--disallowedTools "Edit,Write,Bash"` set: model reported the tool wasn't enabled, no file created | Confirms tool-level enforcement, not just an instruction | direct |
| Full end-to-end CLI run | `node bin/create-agdf.js delivery-path-search --surface claude --dir <isolated temp repo> --json` produced a real, valid recommendation with `enforcement.level: "tool_enforced"`, real evaluator runtime `"2.1.203 (Claude Code)"`, correct `not_in_allowed_actions` rejection of extra model-proposed candidates, and zero mutation in both the temp repo and the main repo | Confirms the full integration works, not just the isolated evaluator function | direct |
| Existing fixture-based tests still pass | `npm --prefix create-agdf run test:delivery-path-search`, `test:delivery-path-search-unit` both pass unmodified | No regression to search-engine/scoring/candidate-policy/contracts | direct |
| Runtime integrity unaffected | `node plugin/scripts/check-runtime-integrity.mjs` → "ok (9 skills and 13 control files checked)" | No skill/control-file drift introduced | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Live CI confirmation for this exact change | warn | Requires commit + push, consistent with prior runs this session |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Per-call API cost for Claude evaluations is real and non-trivial (~$0.07-$0.19 observed for near-trivial prompts) | warn | Documented in Context Graph; same cost category as Codex evaluations, not a new class of risk |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Updated `CG-DELIVERY-PATH-SEARCH`'s `evidence`, `invariants`, `risks` and `claude_enforcement_finding` fields to reflect that Claude Code is now a second real, live-verified, `tool_enforced` executable evaluator, not just a documented finding.

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-runtime-contract.md`; `plugin/meta/agdf-plugin.definition.json`; live `.agdf/control/`
- multi_scope_state: clear
- active_scope_evidence: Approved UR and done Brownfield Review for `claude-evaluator-tool-enforcement-implementation`; Copilot/OpenCode evaluator work explicitly out of scope
- competing_scope_lines: none
- branch_workspace_evidence: `create-agdf/lib/delivery-path-search/evaluators/claude.js` (new), `create-agdf/bin/create-agdf.js`, `create-agdf/lib/delivery-path-search/surfaces/capabilities.js`, `.agdf/control/CONTEXT_GRAPH.md` modified
- branch_workspace_scope_effect: supports

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: This is reusable, durable knowledge that Claude Code now has a live-verified tool-enforced evaluator, directly relevant to future Delivery Path Search or cross-surface enforcement questions.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-DELIVERY-PATH-SEARCH; .agdf/control/artefacts/claude-evaluator-tool-enforcement-implementation/

## Closeout

- delivered: Approved and persisted UR; Brownfield Review with live-verified subprocess safety and tool-enforcement behavior; `evaluators/claude.js` implemented and wired into the CLI; `capabilities.js` upgraded to report `tool_enforced` for Claude with real evidence; full end-to-end CLI run verified with zero mutation; Context Graph updated to reflect the new implementation status.
- not_delivered: Copilot/OpenCode evaluator implementations (separate, not-yet-started scope); live CI confirmation (requires commit + push).
- verification_performed: Live `claude -p` subprocess safety test; live `--disallowedTools` enforcement test (attempted Write tool call, refused); full end-to-end `delivery-path-search --surface claude` CLI run in an isolated temp git repo with zero mutation confirmed; `npm --prefix create-agdf run test:delivery-path-search`; `npm --prefix create-agdf run test:delivery-path-search-unit`; `node plugin/scripts/check-runtime-integrity.mjs`.
- unverified: Live `ubuntu-latest` CI execution of this change.
- next_allowed_action: Offer commit-ready handoff; wait for explicit commit/push instruction; then re-check CI.
- quality_outlook: No further technical follow-up required for this approved scope before commit; Claude Code now matches Codex's evaluator quality tier.
