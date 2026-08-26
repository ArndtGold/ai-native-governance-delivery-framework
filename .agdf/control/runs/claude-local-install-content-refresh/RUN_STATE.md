# AGDF Run State

## Run Meta

- control_state_version: 2
- run_id: claude-local-install-content-refresh
- lifecycle: completed
- revision: 3
- revision_id: 9901b124-15b2-41d8-8cc9-ee197c920d15
- mode: verified_change
- current_gate: OR
- decision: pass
- owner: agent

## Objective

Make `npm run install:claude` deliver current source content to the Claude host deterministically (uninstall→install) and make its version verification read the real multi-line `claude plugin list` output.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Same-version `claude plugin update` never refreshes the host cache (proven stale: 2026-08-24 copy vs 11:10 marketplace build); uninstall→install refreshes it (live-host probe passed). `pluginVersionFromList` is same-line-only and returns "unknown" for the real multi-line output, silently bypassing the mismatch guard. |
| What is approved? | UR is approved by exact user approval on 2026-08-26. Verified Change requires no further user gate. |
| What is missing? | Nothing within scope; loaded-host proof awaits the user's Claude Code restart. |
| What is the next allowed action? | Use delivery closeout only when the user explicitly requests a commit, push or pull-request handoff. |
| What is explicitly forbidden right now? | Automatic commit, push, pull request, release, publication or deployment. |

## Approvals

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided by the user on 2026-08-26 for revision 1 (`9901b124-15b2-41d8-8cc9-ee197c920d15`) via native gate question and revalidated before persistence. |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | `.agdf/control/artefacts/claude-local-install-content-refresh/UR.md` | approved | Staleness and blind-verification defects with solution-open scope. |
| Brownfield Review | `.agdf/control/artefacts/claude-local-install-content-refresh/BROWNFIELD_REVIEW.md` | done | Mechanism decision B (deterministic reinstall) with live-host evidence; alternative A rejected for contract collision; `verified_change` selected. |
| Verified Change | `.agdf/control/artefacts/claude-local-install-content-refresh/VERIFIED_CHANGE.md` | pass | Reinstall sequencing, multi-line parsing, tests, healthy end-to-end lifecycle result and fresh host cache. |

## Mode/Slice Decision

- decision: verified_change
- required_next_gate: none
- scope_reason: `bounded_regression_fix`; one owner file plus its existing test, no contract or interface change, locally reversible and independently verifiable on this host.
- evidence: `.agdf/control/artefacts/claude-local-install-content-refresh/BROWNFIELD_REVIEW.md`; live-host probe of 2026-08-26.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | defines | Claude local install content-refresh scope | `.agdf/control/artefacts/claude-local-install-content-refresh/UR.md` |
| UR | approved_by | `Approval: UR` | User input on 2026-08-26 after revalidation of revision 1. |
| UR | fixes_regression_in | run `agdf-local-plugin-install-scripts` | The delivered Claude path reports success while the host keeps stale content; prior UAT covered Codex only. |
| Brownfield Review | sizes | UR | `.agdf/control/artefacts/claude-local-install-content-refresh/BROWNFIELD_REVIEW.md` |
| Verified Change | implements_and_verifies | UR | `.agdf/control/artefacts/claude-local-install-content-refresh/VERIFIED_CHANGE.md`; standalone assertions, healthy end-to-end lifecycle and fresh-cache evidence of 2026-08-26. |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Stale cache despite "installation complete" | Host cache timestamp 2026-08-24 vs marketplace build 11:10, missing `distributionProfiles` | Staleness defect | direct |
| Same-version `update` no-op vs `uninstall`+`install` refresh | Live-host probe 2026-08-26 (cache refreshed, provenance marker present) | Mechanism decision B | direct |
| Multi-line `claude plugin list` output | Real CLI output (`❯ agdf@agdf` / `Version: 0.13.5`) | Parsing defect | direct |
| Same-line-only parser and skipped guard | `plugin-installers.js:220-228`, `:54` (`installedVersion && ...`) | Blind verification | direct |
| Single-line-only test fixture | `local-marketplace-test.js:328` | Why tests missed it | direct |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: resolved
- context_graph_required_action: update
- context_graph_gate_effect: none
- context_graph_evidence: Claude same-version refresh boundary and multi-line list parsing recorded on `CG-CREATE-AGDF-CLI-COMPOSITION`.

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: The Claude same-version refresh boundary and multi-line list parsing are reusable for future host-lifecycle work.
- memory_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`

## Closeout

- next_allowed_action: Use `delivery-closeout` only if the user explicitly requests a commit, push or pull-request handoff.
- quality_outlook: After the user's Claude Code restart, capture one loaded-host observation (fresh session with AGDF skills active) as UAT-grade evidence; make `local-marketplace-test.js` platform-portable so the new assertions also run on Windows; revisit per-content version identity only with the runtime-integrity contract owner.
