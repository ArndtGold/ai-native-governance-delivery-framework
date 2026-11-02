# Implementation Evidence: Reliable Native Gate-Approval Invocation

Status: implementation complete; review pending
Run: `native-gate-buttons-live`
Date: 2026-07-14

## Delivered

- Extended the canonical Native Interaction Contract with a single first native
  attempt and immediate exact-text fallback when the host does not render or
  apply the control.
- Extended the canonical `gate-check` skill with the same no-retry boundary for
  Codex and Claude Code.
- Added runtime-integrity assertions that prevent removal of the first-attempt
  and no-retry requirements.
- Synchronized the generated package surfaces through the existing sync owner.
- Preserved OpenCode mappings, exact approval formulas and control-state
  authority.

## Files and ownership

- `plugin/meta/agdf-runtime-contract.md` — canonical semantic contract
- `plugin/skills/gate-check/SKILL.md` — agent-side invocation guidance
- `plugin/scripts/check-runtime-integrity.mjs` — deterministic contract guard
- generated copies under `create-agdf/generated/` — derived output only

## Verification

- `node plugin/scripts/check-runtime-integrity.mjs` — passed
- `node create-agdf/scripts/test-routing.js` — passed
- `node create-agdf/scripts/control-state-test.js` — passed
- `node create-agdf/scripts/smoke-test.js` — completed without reported failure
- `git diff --check` — passed

## Live evidence boundary

No native gate question was invoked during implementation because the selected
run was at an internal `CD+Tests` step, not a ready user gate; invoking one
would have violated the Native Interaction Contract. Existing supporting
evidence shows Codex rendering after the host feature was enabled in a fresh
session, while Claude required a follow-up request. A later bounded live probe
must verify first-attempt rendering or immediate fallback on both surfaces
without changing AGDF state.

## Scope result

The change improves agent-side reliability and fallback behavior but cannot
force host-owned button rendering. If a host still does not display the control
on the first eligible attempt, exact text is the correct product outcome.
