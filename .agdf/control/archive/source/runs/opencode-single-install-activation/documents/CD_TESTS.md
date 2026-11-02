# CD+Tests: Single-Install OpenCode Activation

Status: done
Date: 2026-07-17

## Delivered

- Added one fail-closed repository-activation helper for durable control and legacy compatibility.
- Moved the OpenCode plugin's activation signal and early system guidance to that helper.
- Extended status with separate global-installation, activation, legacy and session facts.
- Changed `opencode-repo` to create durable control only and preserve existing OpenCode files.
- Updated generated global guidance, public installation guidance and regression fixtures.

## Verification

- `npm --prefix create-agdf run test:lifecycle` — pass, including helper and plugin-hook fixtures.
- `npm --prefix create-agdf run sync-package-assets` — pass.
- `node create-agdf/scripts/smoke-test.js` — pass.
- `node create-agdf/scripts/test-routing.js` — pass.
- `node plugin/scripts/check-runtime-integrity.mjs` — pass.
- `npm --prefix create-agdf run test:runtime-integrity-layout` — pass.
- `npm --prefix create-agdf run test:runtime-integrity-negative` — pass.
- `npm --prefix create-agdf run test:skill-evals` and `npm --prefix create-agdf run eval:skills` — pass (27/27 deterministic cases).
- Delivery Path Search focused, unit and generator suites — pass.
- `git diff --check` — pass.

## Evidence Boundary

Repository tests prove hook registration and injected payloads, not authenticated live OpenCode UI rendering.
No host installation, restart, VCS, publish or release action was performed.
