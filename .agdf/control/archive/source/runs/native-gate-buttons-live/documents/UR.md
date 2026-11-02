# UR: Deliver Live Native Gate Buttons

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided on 2026-07-14
Date: 2026-07-14
Owner: AGDF

## 1. Problem

AGDF 0.7.2 defines native interaction adapters and a safe textual fallback, but a real clickable gate-approval control was not observed in Codex after updating the plugin. The prior `surface-native-interactions` run deliberately accepted this as a supporting-evidence gap; it did not deliver or prove host-side button rendering.

## 2. Goal

Make a real, host-native gate-approval button observable and safe in supported interactive Codex and Claude Code sessions, while preserving exact approvals, durable control-state validation and the universal textual fallback.

## 3. Scope

- Establish the actual host capability and invocation path for Codex `request_user_input` and Claude Code `AskUserQuestion`.
- Invoke the native control only for one selected, ready AGDF gate with a durable artefact.
- Present exact `Approval: <GateName>`, revise and decline choices as host-native controls.
- Revalidate selected run, expected gate and artefact immediately after the response and before persistence.
- Produce live, user-visible evidence in each host where the capability is available.
- Preserve safe text fallback when a host mode, authentication state or API cannot support a deliberate native response.

## 4. Non-Goals

- No custom AGDF UI, sidebar, MCP server, plugin-owned button renderer or alternate approval store.
- No attempt to force Codex or Claude Code to expose a host control that their current mode does not provide.
- No approval from a timeout, default, permission prompt, plan approval or agent-produced response.
- No changes to OpenCode in this slice unless Brownfield Review demonstrates shared ownership is required.

## 5. Acceptance Signals

- A real clickable `Approval: <GateName>` control is visibly rendered in at least one supported interactive Codex session and one supported interactive Claude Code session, or a host-owned capability block is evidenced precisely.
- A click advances only after same-run, same-gate and durable-artefact revalidation.
- Revise/decline leaves the control state unchanged.
- The unavailable/non-interactive branch uses exact textual approval without weakening the gate rules.
- No custom UI or parallel approval/persistence path is introduced.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/meta/agdf-plugin.definition.json`
- `.agdf/control/artefacts/surface-native-interactions/OR.md`
- Codex and Claude Code host capabilities, which remain host-owned.

## 7. Risks And Unknowns

- Codex may expose `request_user_input` only in a host mode unavailable to a normal chat session.
- Claude Code may differ by interactive mode, version or authentication state.
- AGDF plugin instructions may guide an agent to invoke host controls but cannot independently create a host UI.
- Brownfield Review must determine whether the gap is an AGDF orchestration defect, a host-capability limitation, or both.

## 8. Next Step

Approval recorded: `Approval: UR` provided on 2026-07-14.
