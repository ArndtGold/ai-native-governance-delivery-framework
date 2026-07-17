# Code Delivery and Test Evidence: Coherent AGDF Installation Lifecycle

Status: done
Date: 2026-07-16
Approved plan: `TP.md` revision 2

## Delivered Scope

- Added schema-v1 lifecycle results and localized Success Card/status rendering from the canonical locale registry.
- Integrated Codex, Claude Code and OpenCode installation evidence with phase-specific failure reporting.
- Added read-only installation/repository/delivery status composition without run creation or implicit ambiguous selection.
- Added fail-closed repository disable and preview-first global uninstall with ownership checks, retention and postcondition verification.
- Strengthened `codex-repo` completion verification and routed it through the shared lifecycle card.
- Added the once-per-request read-only orientation contract while preserving the existing state projection owner.
- Documented the capability-dependent native approval path and exact-text fallback without changing approval transport metadata.
- Reordered onboarding around `@agdf/cli` and documented status, disable and uninstall.

## Verification

| Evidence | Result | Coverage |
|---|---|---|
| `npm --prefix create-agdf run smoke-test` | pass | package sync, CLI, lifecycle, control state, interaction, Verified Change, integrity, 27/27 skill evals, delivery-path search, bootstrap smoke and routing |
| `npm --prefix create-agdf run test:release-bootstrap` | pass | unchanged public bootstrap command shape |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass | canonical runtime layout and source integrity |
| `git diff --check` | pass | whitespace and patch integrity |
| local `status --surface codex --run installer-output-parity --json` | pass | `installation: healthy`, `delivery: open`, selected run retained, no worktree mutation |

Focused lifecycle fixtures cover ordered cards, partial results, exact and ambiguous disable state,
unsupported disable surfaces, uninstall preview/apply/retention/partial failure, marker-owned OpenCode
cleanup, postcondition verification, explicit and auto-detected surfaces, multiple surfaces, missing
control state, selected blocked delivery and ambiguous run selection.

## Boundaries And Missing Evidence

- No real host plugin was installed, disabled or uninstalled during deterministic verification.
- No native Codex approval-button pass is claimed. Exact-text fallback remains canonical, and fresh
  host-visible evidence belongs to IOP-13 after QA.
- No commit, push, publish, plugin reinstall or PR was performed.

## Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: the three existing nodes link lifecycle ownership, CLI composition and the approval dependency boundary.

## Post-QA UAT Remediation

Non-mutating UAT found that `status` reported a disabled repository correctly but offered the wrong
next action. `create-agdf/lib/lifecycle/status.js` now prioritizes the repository-disabled branch and
directs the user to restart the host while retaining the healthy global installation. A focused
fixture reproduces the combined state and verifies the corrected action. The focused lifecycle/CLI
tests, full package smoke, 27/27 skill evals, release-bootstrap smoke and `git diff --check` pass after
the delta.
