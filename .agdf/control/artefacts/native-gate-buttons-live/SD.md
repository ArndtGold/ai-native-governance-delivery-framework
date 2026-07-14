# Solution Design: Reliable Native Gate-Approval Invocation

Status: draft
Run: `native-gate-buttons-live`
Derived from: `.agdf/control/artefacts/native-gate-buttons-live/PRD.md`
Date: 2026-07-14

## 1. Design decision

Extend the existing gate-check interaction adapter and its readiness boundary.
The adapter remains presentation-only; the control-state workflow remains the
sole owner of approval validation and persistence. Native invocation is
opportunistic, but its first eligible attempt must have a deterministic
outcome: either the host renders the native question or AGDF immediately uses
the exact-text fallback. A second prompt must never be required to activate a
native control.

## 2. Flow

1. Resolve exactly one selected run.
2. Evaluate the current gate and confirm the required durable artefact.
3. Build the bounded native question with exact approval, revise and decline.
4. Make one first-attempt call to the declared surface adapter when the host
   capability is callable.
5. If the adapter is unavailable, not callable, not applied by the host or
   cannot establish deliberate input, immediately present exact textual
   approval; do not retry the native control.
6. Re-resolve the same run and expected gate immediately after native input.
7. Persist only an exact, validated approval; otherwise leave state unchanged.

## 3. Surface behavior

### Codex

Use `request_user_input` when the host exposes it in the current mode. The
first eligible attempt must either render the bounded native question or
transition to exact text. The feature flag or host capability is not an AGDF
approval and must not be changed by the implementation. A user request to
retry is not part of the normal path and must not be required for fallback.

### Claude Code

Use `AskUserQuestion` only when the current Claude session exposes a deliberate
question control on the first eligible attempt. If the control is not applied,
appears only after a second prompt or cannot establish deliberate input,
classify native invocation as unavailable for that attempt and present exact
text immediately. Do not add prompting loops or simulated UI.

### OpenCode

No change in this slice. Preserve its existing question/permission distinction
and exact-text fallback unless shared ownership is demonstrated by analysis.

## 4. Ownership and boundaries

- `plugin/meta/agdf-runtime-contract.md` remains the semantic source of truth.
- `plugin/skills/gate-check/SKILL.md` owns agent-side readiness and adapter use.
- Existing surface adapter metadata remains the capability declaration.
- Existing control-state persistence remains the approval authority.
- No custom renderer, MCP app, hook approval or parallel store is introduced.

## 5. Verification design

- deterministic tests for ready-gate, unavailable-adapter and fallback paths
- regression tests proving empty, revise, decline and non-deliberate responses
  do not advance a gate
- same-run/same-gate/artefact revalidation test immediately before persistence
- bounded live Claude probe documenting first-attempt behavior and immediate
  fallback when the host does not apply the control
- bounded live Codex probe documenting first-attempt native rendering when
  callable and immediate fallback when it is not
- runtime integrity, control-state tests and package smoke checks

## 6. Failure handling

Unknown host behavior is treated as unavailable native capability on the first
attempt. The user receives the exact approval formula rather than a repeated
native prompt. Any ambiguous run, stale gate, missing artefact or non-exact
response fails closed.

## 7. Delivery constraints

Implementation requires an approved Task Plan after this SD. No code, host
configuration or release change is authorized by this design alone.

## 8. Next gate

After valid `Approval: SD`, derive the Task Plan and request `Approval: TP`.
