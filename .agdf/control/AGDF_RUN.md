# AGDF Run State

## Run Meta

- run_id: claude-evaluator-enforcement-decision
- started_at: 2026-07-10
- mode: quick_task
- current_gate: Quick Task Execution
- decision: pass
- owner: agent

## Objective

Decide and durably record whether Claude Code stays a permanent `instruction_only` Delivery Path
Search evaluator, or whether a technical evidence substitute should be pursued — instead of leaving
this as an unreviewed hardcoded default in `capabilities.js`.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Verified against official Claude Code CLI docs (code.claude.com, 2026-07-09) that headless `-p`/`--print` invocation with `--disallowedTools "Edit,Write,Bash"` is enforced by Claude Code itself, not the model. Combined with the same `git status --porcelain` mutation check `evaluators/codex.js` already uses, this is a legitimate `tool_enforced`-equivalent path — correcting an earlier, too-pessimistic claim made in this conversation and a blanket claim in `CG-DELIVERY-PATH-SEARCH`. |
| What is approved? | `Approval: UR` provided on 2026-07-10. Brownfield Review done, selected `quick_task`. Quick Task implemented and verified. |
| What is missing? | Nothing for this run's approved scope. |
| What is the next allowed action? | Offer delivery closeout; commit/push require separate explicit instruction. |
| What is explicitly forbidden right now? | Implementing `evaluators/claude.js` or changing `capabilities.js`'s runtime enforcement level for Claude — that belongs to backlog item `claude-evaluator-tool-enforcement-implementation`, gated by its own future UR. |

## Prior Run Pointers

- `gate-state-clarity`, `create-agdf-lib-test-coverage` and `plugin-author-consistency-fix` all completed on 2026-07-10 with real CI confirmation (commit `4601660`); see `.agdf/control/MASTER_BACKLOG.md` Completed section.
- Remaining Planned/Parking Lot items: `delivery-path-search-ai-candidate-generation`, `claude-evaluator-tool-enforcement-implementation` (new, opened by this run), `npm-publish-qa-caveat-closure`.

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | Pass |
| Current gate | Quick Task Execution |
| Allowed now | Delivery closeout handoff |
| Blocked by | none |
| Missing approval | none |
| Next step | Offer commit-ready handoff; wait for explicit commit/push instruction |
| Quality outlook | Decision recorded and verified; actual `tool_enforced` upgrade for Claude is a separately gated follow-up, not silently implied by this run |

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
| UR | .agdf/control/artefacts/claude-evaluator-enforcement-decision/UR.md | approved | Decide and document Claude Code's Delivery Path Search enforcement level |
| Brownfield Review | .agdf/control/artefacts/claude-evaluator-enforcement-decision/BROWNFIELD_REVIEW.md | done | Verified factual research; corrected Context Graph blanket claim; selected quick_task |
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
- scope_reason: Research + durable decision + documentation update only; no new product semantics, architecture, policy or contract expansion; no evaluator code implemented.
- evidence: Brownfield Review confirmed the research was factual and complete; remaining work was Context Graph correction, a code comment, and one new backlog item.
- transparency_note: Implementation completed under this decision; the actual `evaluators/claude.js` upgrade is explicitly deferred to a separately gated backlog item, not implied by this quick_task.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval captured in session on 2026-07-10 |
| Brownfield Review | sizes | UR | Selected quick_task; verified the technical finding via the `claude-code-guide` agent against official docs |
| Quick Task Execution | implements | Brownfield Review | Updated `.agdf/control/CONTEXT_GRAPH.md` (`CG-DELIVERY-PATH-SEARCH`); added an explanatory comment in `capabilities.js`; opened backlog item `claude-evaluator-tool-enforcement-implementation` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Claude Code CLI permission enforcement | Official docs (code.claude.com/docs/en/cli-reference.md, permissions.md, sandboxing.md; verified 2026-07-09): "-p"/"--print" headless mode; "--disallowedTools"/"--allowedTools" enforced by Claude Code itself, not the model | Basis for correcting the "permanently instruction-only" assumption | direct |
| Windows caveat | Same docs: Claude's Bash-specific `--sandbox` lacks native Windows support and does not cover file tools (Read/Edit/Write use the permission system directly) | Confirms the tool-permission layer, not the Bash sandbox, is the correct analog to pursue | direct |
| Runtime integrity unaffected | `node plugin/scripts/check-runtime-integrity.mjs` → "ok (9 skills and 13 control files checked)" | The `capabilities.js` comment addition introduced no regression | direct |
| Existing tests still pass | `npm --prefix create-agdf run test:delivery-path-search`, `test:delivery-path-search-unit` both pass | No regression to Delivery Path Search behavior | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| none | none | none |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Scope creep avoided: implementation was not started despite a viable path being found | none | Recorded as a separate, explicitly not-yet-approved backlog item instead of being folded into this quick_task |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Corrected the node's `risks` line from a blanket "instruction_only surfaces cannot technically prove write prevention" to scope that claim to Copilot/OpenCode only, and added a `claude_enforcement_finding` field with the verified technical path for Claude.

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-runtime-contract.md`; `plugin/meta/agdf-plugin.definition.json`; live `.agdf/control/`
- multi_scope_state: clear
- active_scope_evidence: Approved UR and done Brownfield Review for `claude-evaluator-enforcement-decision`; implementation of the actual evaluator explicitly out of scope and tracked separately
- competing_scope_lines: none
- branch_workspace_evidence: `.agdf/control/CONTEXT_GRAPH.md` and `create-agdf/lib/delivery-path-search/surfaces/capabilities.js` (comment only) modified
- branch_workspace_scope_effect: supports

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: This is reusable, previously-inaccurate cross-run knowledge about Claude Code's actual enforcement capabilities — correcting it in the Context Graph prevents the same wrong assumption from recurring in future runs or conversations.
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-DELIVERY-PATH-SEARCH; .agdf/control/artefacts/claude-evaluator-enforcement-decision/

## Closeout

- delivered: Approved and persisted UR; Brownfield Review with verified factual research (via the `claude-code-guide` agent against official Claude Code documentation); corrected an inaccurate blanket claim in `CG-DELIVERY-PATH-SEARCH`; added an explanatory comment in `capabilities.js`; opened backlog item `claude-evaluator-tool-enforcement-implementation` for the actual evaluator code as a separately gated follow-up.
- not_delivered: The `evaluators/claude.js` implementation itself and any change to `capabilities.js`'s actual runtime enforcement level — both explicitly deferred to a new backlog item, not part of this UR's approved scope.
- verification_performed: `node plugin/scripts/check-runtime-integrity.mjs`; `npm --prefix create-agdf run test:delivery-path-search`; `npm --prefix create-agdf run test:delivery-path-search-unit`.
- unverified: none for this run's approved scope; the deferred implementation's actual behavior is unverified until its own UR/implementation cycle.
- next_allowed_action: Offer commit-ready handoff; wait for explicit commit/push instruction.
- quality_outlook: No further technical follow-up required for this approved scope before commit; the natural next step is a new UR for `claude-evaluator-tool-enforcement-implementation` if and when prioritized.
