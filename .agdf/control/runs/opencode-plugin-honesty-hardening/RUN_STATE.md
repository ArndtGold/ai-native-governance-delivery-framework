# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: opencode-plugin-honesty-hardening
- lifecycle: active
- revision: 1
- revision_id: 4b1c9a20-7d3e-4f2a-9e1b-2a8f7c6d5e3a
- mode: verified_change
- current_gate: OR
- decision: ready_for_closeout
- owner: agent

## Objective

Remove three false-confidence sources in the OpenCode plugin surface without adding enforcement logic: document the subagent enforcement bypass, surface inactive-repository warnings in the TUI, and report plugin/validator version drift at load time.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | `Approval: UR` accepted on 2026-07-23; UR artefact persisted. Brownfield Review done 2026-07-23: Mode/Slice Decision `verified_change` (pass). Three scoped changes: subagent-bypass disclosure, inactive-repo TUI toast, version-drift check. All candidate paths clean at baseline; single canonical owner; deterministic validation via opencode-hardening-test.js. |
| What is approved? | `Approval: UR` provided on 2026-07-23 after same-scope exact-formula revalidation. |
| What is missing? | VERIFIED_CHANGE.md record with baseline snapshot, execution, and mini-closeout evidence. |
| What is the next allowed action? | Create VERIFIED_CHANGE.md record with baseline snapshot, then implement the three scoped changes, then run deterministic validation, then mini-closeout. |
| What is explicitly forbidden right now? | PRD/SD/TP ritual, scope expansion beyond the three scoped changes, cross-surface adapter work, VCS actions, and any mutation of existing `.agdf/control/` content beyond this run's own scaffold. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` accepted on 2026-07-23; UR artefact `.agdf/control/artefacts/opencode-plugin-honesty-hardening/UR.md` revision 1 persisted. |
| Brownfield Review | done | `.agdf/control/artefacts/opencode-plugin-honesty-hardening/BROWNFIELD_REVIEW.md` 2026-07-23; Mode/Slice Decision `verified_change`; all eligibility criteria met. |
| Mode/Slice Decision | verified_change | Single-owner additive honesty-hardening; bounded clean-at-baseline paths; no prohibited impact; deterministic validation; structured_slice escalation target if TUI API or cross-surface sync fails. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/opencode-plugin-honesty-hardening/UR.md` | approved | Revision 1; three scoped honesty-hardening changes; non-goals exclude enforcement and adapter skins. |
| Brownfield Review | `.agdf/control/artefacts/opencode-plugin-honesty-hardening/BROWNFIELD_REVIEW.md` | done | 2026-07-23; Mode/Slice Decision `verified_change`; all eligibility criteria met; UI/UX impact low, ux_intent_definition not_applicable. |
| Verified Change | `.agdf/control/artefacts/opencode-plugin-honesty-hardening/VERIFIED_CHANGE.md` | executed | Baseline captured 2026-07-23; 4 source + 5 derived paths; prohibited_impacts none; deterministic validation passed; propagation passed; 0 VC findings. |
| OR | `.agdf/control/artefacts/opencode-plugin-honesty-hardening/OR.md` | pass | Mini-closeout recorded; delivery closeout offered. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| `opencode-plugin.js` hook surface | `create-agdf/opencode-plugin.js` | session.created/shell.env/transform hooks | direct |
| Subagent hook bypass | anomalyco/opencode issue #5894, PR #36238 | OpenCode tool.execute.before does not fire for subagent tool calls | direct |
| Validator version pin | `agdf/bin/agdf-local.js` expectedVersion 0.11.4 | Version-drift check source | direct |
| Plugin version source | `create-agdf/package.json` version 0.11.4 | Loaded plugin version | direct |
| TUI toast API | OpenCode plugin docs / `client.tui.toast.show` | Inactive-repo visibility surface | direct |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-23 after same-scope revalidation. |
| UR | scoped_by | Non-Goals section of UR | Excludes enforcement guard, core engine, adapter skins, schema changes, VCS. |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| `client.tui.toast.show` API stability and availability | medium; determines fallback design | Brownfield Review |
| Inventory of skills beyond gate-check needing subagent-bypass disclosure | medium; determines disclosure scope | Brownfield Review |
| Generated-surface propagation path for plugin code changes | low; canonical sync owner exists | Brownfield Review |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| Disclosure reduces user confidence in AGDF on OpenCode | medium; adoption risk | Brownfield Review weighs honesty gain vs adoption risk |
| TUI toast API unavailable or unstable | medium; fallback needed | Degrade to app.log only; document fallback |
| Version-drift check fails open when validator file absent | low; must not block | Fail open to existing path, warn in log |
| Cross-surface disclosure gap (Codex/Claude/Copilot) | low; out of scope here | Brownfield Review notes; separate run if needed |

## Mode/Slice Decision

- decision: verified_change
- required_next_gate: none
- scope_reason: Single-owner additive honesty-hardening of the OpenCode plugin surface; three bounded changes (subagent-bypass disclosure, inactive-repo TUI toast, version-drift check); no gate/schema/policy/persistence/architecture impact; all candidate paths clean at baseline; deterministic validation via opencode-hardening-test.js; no new product semantics.
- evidence: Brownfield Review `.agdf/control/artefacts/opencode-plugin-honesty-hardening/BROWNFIELD_REVIEW.md` 2026-07-23; verified_change eligibility criteria all met; worktree baseline clean except this run's own scaffold; escalation target structured_slice if TUI API or cross-surface sync fails.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: to be confirmed in Brownfield Review (candidate: existing opencode-surface-hardening-parity, opencode-single-install-activation nodes)
- context_graph_reconciliation: not_applicable_yet
- context_graph_required_action: none yet
- context_graph_gate_effect: none

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The "OpenCode subagent bypass is a host limitation, not AGDF-owned; disclose, do not pretend to enforce" invariant is reusable across future enforcement and adapter work; if unstated, false confidence recurs.
- memory_refs: to be created or extended in Brownfield Review.

## Next Step

Verified Change execution is the next allowed action. Create VERIFIED_CHANGE.md record with baseline
snapshot, implement the three scoped changes, run deterministic validation, then mini-closeout. PRD/SD/TP
ritual is skipped while eligibility holds; escalate to structured_slice only if a record condition fails.

- next_allowed_action: Offer delivery closeout; commit/push/PR/release only on separate explicit user instruction.
