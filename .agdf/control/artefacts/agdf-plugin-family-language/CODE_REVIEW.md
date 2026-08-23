# Code Review: AGDF Local Marketplace Family Label

Status: done
Decision: pass
Date: 2026-08-23

## Code Review

- decision: pass
- findings: none
- missing_evidence: New-task cache persistence and direct Codex rendering are outside code-review proof and remain explicit evidence obligations.
- risks: The exact selector is CLI-equivalent by contract, but its observed stale-cache replacement must not be promoted to new-task visible proof. Marketplace ownership, registration revision, Claude isolation and recovery order remain unchanged.
- required_next_step: Proceed to QA with exact-selector repository behavior proven and post-reinstall new-task behavior explicitly unverified.

## Revision 2 Code Review

- decision: pass
- findings: none
- reviewed_scope: `create-agdf/lib/public-plugin/manifest.js`;
  `create-agdf/scripts/sync-package-assets.js`; `create-agdf/scripts/public-plugin-test.js`;
  `.agents/plugins/marketplace.json`
- correctness: renderer produces the exact validated Marketplace shape and the sync owner writes the
  intended repository-relative path.
- compatibility: technical IDs and core product name remain unchanged; Claude strict validation and
  public candidate digest pass.
- regression: focused package tests and complete smoke test pass; app-server selection is directly
  asserted.
- security_and_state: no permissions, credentials, persistence, network, cache or recovery paths are
  added.
- missing_evidence: native rendered Plugins screen remains outside code-review proof.
- risks: future Codex repository-discovery precedence drift requires the retained app-server and UI
  evidence boundary.
- required_next_step: proceed to QA with no open code finding and one explicit visible-evidence gap.

## Reviewed Scope

- `create-agdf/lib/installers/local-marketplace.js`
- `create-agdf/lib/installers/plugin-installers.js`
- `create-agdf/scripts/local-marketplace-test.js`
- `create-agdf/scripts/local-development-install-test.js`
- `create-agdf/scripts/cli-modularization-test.js`
- `create-agdf/scripts/release-bootstrap-smoke-test.js`
- `create-agdf/scripts/smoke-test.js`
- Approved PRD, SD, TP and pre-implementation Brownfield Analysis
- Focused Marketplace, Runtime Integrity, public candidate and fixture-only local development install results

## Review Evidence

- Correctness: exact `agdf@agdf --json` dispatch is asserted across installer and smoke fixtures; current shape remains idempotent and invalid shape fails closed.
- Compatibility: technical identities, Claude output, core plugin identity and public candidate remain unchanged.
- Security and integrity: marker, plugin digest and exact JSON ownership checks precede refresh; remove, add and plugin failures restore state in tested order.
- Maintainability: one canonical brand value, one projector and one installer transaction remain; compatibility and refresh branches are explicit and tested.

## Normalized Findings

No open code-review finding.
