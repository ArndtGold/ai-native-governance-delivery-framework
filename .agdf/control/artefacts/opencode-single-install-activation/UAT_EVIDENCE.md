# UAT Evidence: Single-Install OpenCode Activation

Status: approved
Date: 2026-07-17

Exact `Approval: UAT` accepted on `2026-08-19` after selected-run, same-gate and Revision 11
revalidation, with the authenticated live OpenCode limitation retained.

## User-Visible Acceptance Scope

- A globally installed OpenCode AGDF runtime recognizes a repository with valid
  `.agdf/control/config.json` as active without requiring a generated `.opencode/**` runtime copy.
- Active repositories receive the documented `agdf-global-gate-check` routing through the early
  system-transform hook; inactive or invalid-control repositories receive only fail-closed orientation.
- `opencode-status` separates global installation, durable activation, legacy compatibility and an
  observable session signal.
- `opencode-repo` creates durable control and leaves existing `opencode.json` and `.opencode/**`
  files untouched.

## Evidence

- Lifecycle plugin fixtures cover missing, invalid, active and legacy-compatible repository states,
  early guidance and shell-environment signals.
- Scaffold/status smoke, generated-asset synchronization, routing, Runtime Integrity and whitespace
  checks pass as recorded in `CD_TESTS.md`.
- QA passed and was accepted through exact `Approval: QA` on 2026-07-17.

## Explicit Limitation

No authenticated interactive OpenCode session was restarted or observed as part of this repository
run. The acceptance decision therefore concerns repository conformance and the stated hook contract,
not a claim that a particular installed OpenCode UI rendered the guidance or selected a skill.

## Decision Requested

Accept the delivered repository behavior and the disclosed live-host limitation with exact
`Approval: UAT`, or decline/revise with the missing host observation named explicitly.
