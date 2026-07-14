# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: native-gate-buttons-live
- lifecycle: active
- revision: 6
- revision_id: EBDBF827-22FA-4FBF-8470-3938F2CAE8E9
- mode: structured_delivery
- current_gate: PRD
- decision: block
- owner: agent

## Objective

Deliver and live-verify native Codex and Claude Code gate-approval buttons without creating a custom UI or weakening AGDF approval authority.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | The prior surface-native interaction run delivered contract and fallback behavior; a fresh Codex session now captured native Default-mode question rendering. |
| What is approved? | `Approval: UR` provided on 2026-07-14 after the durable UR was persisted. |
| What is missing? | The PRD and exact `Approval: PRD` for the reopened structured-delivery path. |
| What is the next allowed action? | Draft and persist the PRD, then request `Approval: PRD`. |
| What is explicitly forbidden right now? | SD, TP, implementation, custom UI, host configuration changes and release actions. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | Exact `Approval: UR` provided on 2026-07-14 after UR persistence. |
| PRD | missing | |
| SD | missing | |
| TP | missing | |
| QA | missing | |
| UAT | missing | |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/native-gate-buttons-live/UR.md | approved | Exact approval recorded after artefact persistence. |
| Brownfield Review | .agdf/control/artefacts/native-gate-buttons-live/BROWNFIELD_REVIEW.md | reopened | Codex Default-mode native question control callable and visibly rendered after fresh session. |
| PRD |  | missing | |
| SD |  | missing | |
| TP |  | missing | |
| Brownfield Analysis |  | missing | |
| CD+Tests |  | missing | |
| CR |  | missing | |
| QA |  | missing | |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Fresh Codex session after enabling the feature flag rendered the native `request_user_input` choices in Default mode. | Current Codex task conversation, 2026-07-14 | Live host capability and visible control | direct |
| Native probe returned `answers: {}`; no deliberate answer or AGDF approval was accepted. | Native `request_user_input` probe, 2026-07-14 | Deliberate-input boundary | direct |
| Codex manual documents Plan mode questions and plugin skills/hooks, not a plugin-callable normal-chat button API. | Fresh Codex manual, 2026-07-14 | Public host capability boundary | direct |
| `default_mode_request_user_input = true` is configured locally on Codex CLI 0.142.4. | `~/.codex/config.toml`; local CLI version check, 2026-07-14 | Host capability enablement | direct |

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | `Approval: UR` | Exact approval provided on 2026-07-14 after artefact persistence. |
| Brownfield Review | sizes | structured_delivery | Fresh-session native probe resolves the prior host-capability block; see `BROWNFIELD_REVIEW.md`. |

## Mode/Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: The fresh-session probe establishes the requested Codex host capability; the existing contract and adapter can be extended without a custom UI or second approval store.
- evidence: `.agdf/control/artefacts/native-gate-buttons-live/BROWNFIELD_REVIEW.md`; native `request_user_input` probe; CLI 0.142.4 feature-flag verification.
- transparency_note: The probe was capability evidence only. Its empty answer set did not approve any gate; PRD remains the earliest blocking user gate.

## Closeout

- next_allowed_action: Draft the PRD and request `Approval: PRD`.
- quality_outlook: Preserve the exact-text fallback and avoid a custom UI workaround until host support exists.
