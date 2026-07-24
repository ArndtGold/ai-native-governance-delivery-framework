# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: opencode-plugin-honesty-hardening
- lifecycle: completed
- revision: 1
- revision_id: 4b1c9a20-7d3e-4f2a-9e1b-2a8f7c6d5e3a
- mode: verified_change
- current_gate: OR
- decision: completed
- owner: agent

## Objective

Remove three false-confidence sources in the OpenCode plugin surface without adding enforcement logic: document the subagent enforcement bypass, surface inactive-repository warnings in the TUI, and report plugin/validator version drift at load time.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The executed Verified Change was committed as `ae5f57c` on `main` and is present on `origin/main`. Its source changes and focused OpenCode tests pass. Closeout recovery refreshed the deterministically stale gate-check eval fingerprint without changing behavior. |
| What is approved? | `Approval: UR` and the evidenced `verified_change` path; the mini-closeout is pass. |
| What is missing? | Nothing required for this completed run. Release or publish work remains a separate action, not missing run evidence. |
| What is the next allowed action? | None for this run. |
| What is explicitly forbidden right now? | Reusing or recapturing the historical baseline, expanding the completed Verified Change, and automatic release or publish actions. |

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
| OR | `.agdf/control/artefacts/opencode-plugin-honesty-hardening/OR.md` | pass | Mini-closeout recorded; commit `ae5f57c` is present on `main` and `origin/main`; lifecycle reconciled to completed. |

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
| Verified Change | executes | UR | Declared source/derived paths, propagation and focused validation recorded in `VERIFIED_CHANGE.md`. |
| OR | closes | Verified Change | Pass mini-closeout, commit `ae5f57c`, refreshed deterministic gate-check fingerprint and completed lifecycle. |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| none | none | none |

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

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: The existing node now records the OpenCode subagent hook-bypass disclosure invariant and forbids treating audit-only coverage as enforcement.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The "OpenCode subagent bypass is a host limitation, not AGDF-owned; disclose, do not pretend to enforce" invariant is reusable across future enforcement and adapter work; if unstated, false confidence recurs.
- memory_refs: `.agdf/control/CONTEXT_GRAPH.md#cg-native-interaction-authority`

## Next Step

The run is complete. Do not recapture or reuse its historical Verified Change baseline.

- next_allowed_action: none
