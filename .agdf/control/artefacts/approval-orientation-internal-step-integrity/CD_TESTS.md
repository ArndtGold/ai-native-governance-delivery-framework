# Compact Delivery And Test Evidence: Approval Orientation Internal-Step Integrity

Status: `done`
Run: `approval-orientation-internal-step-integrity`
Date: 2026-08-21

## Implementation

- `buildApprovalOrientationSnapshot` now requires internally consistent `next_user_gate` and
  `user_action_required` values before constructing approval orientation.
- No-action narration is selected from `user_action_required: no`; genuine next-decision narration
  uses the canonical `next_user_gate`.
- Snapshot validation treats only recognized user gates as future user decisions; internal steps and
  `none` use the canonical localized no-action narration.
- No gate, approval formula, locale copy, schema field, contract, persistence or public CLI field was
  changed.

## Changed Production And Test Paths

- `create-agdf/lib/interaction-presentation.js`
- `create-agdf/scripts/interaction-presentation-test.js`

Unrelated pre-existing Harness control files and `.github/workflows/publish-create-agdf.yml` were not
modified by the implementation.

## Requirement Evidence

| Requirement | Result | Evidence |
|---|---|---|
| AOI-1 preserve immediate transition | `pass` | `gate_transition_card.next_gate` remains sourced from `next_gate_after_approval`; UR keeps Brownfield Review and TP keeps `none`. |
| AOI-2 user-action derivation | `pass` | Builder uses canonical `next_user_gate` and `user_action_required`; focused EN/DE assertions pass. |
| AOI-3 fail closed | `pass` | Contradictory no-action/user-gate and mismatched required-user-gate fixtures return `null`. |
| AOI-4 avoid same-bug validation | `pass` | Validator distinguishes recognized user gates from internal steps and rejects incorrect localized transition content. |
| AOI-5 regression coverage | `pass` | UR and TP internal steps plus PRD genuine next-user decision are asserted in English and German. |
| AOI-6 compatibility | `pass` | Full package smoke, Runtime Integrity, package contents, routing and 66/66 skill evals pass unchanged in shape. |

## Validation

| Command or observation | Result |
|---|---|
| `npm --prefix create-agdf run test:interaction-presentation` | `pass` |
| `npm --prefix create-agdf run test:control-state` | `pass` |
| `node create-agdf/bin/create-agdf.js gate-check --run codex-harness-conformance-slice --approval-envelope` | `pass`; UR transition keeps Brownfield Review and renders canonical no-action narration |
| `npm --prefix create-agdf run smoke-test` | `pass`; complete suite including package contents, Runtime Integrity, conformance, 66/66 skill evals, aggregate smoke and routing render |
| `git diff --check` | `pass` |

The first sandboxed full-smoke attempt stopped only because the global npm cache was not writable.
The identical command was rerun with permitted cache access and passed completely; a final focused
interaction/control-state run also passed after the test-fixture cleanup.

## Evidence Boundary

Repository and release-built package checks pass. No installed plugin cache was refreshed and no
authenticated Codex, Claude Code or OpenCode host session was observed. Those states are not claimed.
