# Brownfield Review: Live Native Gate Buttons

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `native-gate-buttons-live`
- related_ur: `.agdf/control/artefacts/native-gate-buttons-live/UR.md`
- current_gate: `Brownfield Review`
- reviewer: agent
- reviewed_at: 2026-07-14

## Review Decision

- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: PRD
- reuse_strategy: `extend_existing_native_adapter`

## Evidence

- The canonical AGDF interaction contract already maps Codex to `request_user_input` only `when_callable`; its specified fallback is exact text.
- The current Codex session does not expose `request_user_input` as a callable control in Default mode.
- The current Codex manual documents that Plan mode can ask clarifying questions and that plugins package skills, lifecycle hooks, and optionally MCP-backed apps. It does not document a plugin-callable native question/button API for normal Codex chat.
- The prior `surface-native-interactions` OR explicitly records the absence of safely captured Codex/Claude native-button rendering as a host-owned supporting-evidence gap.
- A fresh Codex session was started after enabling `default_mode_request_user_input = true`.
- In that new Default-mode session, `request_user_input` was callable and rendered the native short-question control with the bounded `Approval: PRD`, `Revise`, and `Decline` choices.
- The probe returned no deliberate answer (`answers: {}`); no value was persisted as an AGDF approval.

## Existing Owners And Boundaries

| Area | Owner | Finding |
|---|---|---|
| AGDF approval semantics | `plugin/meta/agdf-runtime-contract.md` | Complete; must remain the sole gate authority. |
| Agent-side selection guidance | `plugin/skills/gate-check/SKILL.md` | Complete; can request a native control only when the host exposes one. |
| Codex native controls | Codex host | Callable and visibly rendered in the new Default-mode session. |
| Plugin UI extension | Codex MCP-backed app capability | Would be a custom UI, explicitly outside this UR and not equivalent to a host-native approval control. |

## Resolution Of Previous Block

The previous host-capability block is resolved for Codex Default mode: the enabled feature flag made the native `request_user_input` control callable after a fresh session. AGDF still does not render or force the control; the Codex host owns presentation and AGDF remains the approval authority.

## Configuration Update

The local Codex CLI is `0.142.4`. The user supplied the post-`0.106.0` feature flag and it is now present in `~/.codex/config.toml`:

```toml
[features]
default_mode_request_user_input = true
```

The new session provides the required live evidence. The native probe was deliberately not treated as a gate approval because it returned no deliberate answer.

## Non-Solution Rejected

Do not add a custom MCP/app button panel, fake Markdown buttons, hook-supplied approval, or a second approval store. Each would either violate the UR boundary or weaken the host/AGDF authority separation.

## Context Graph Impact

- context_graph_impact: `not_applicable`
- context_graph_reconciliation: `not_applicable`

## Required Next Step

Draft the PRD for the reopened `structured_delivery` path and request `Approval: PRD`. Preserve the exact-text fallback and use the native Codex control only for a later ready AGDF gate after its durable artefact exists.
