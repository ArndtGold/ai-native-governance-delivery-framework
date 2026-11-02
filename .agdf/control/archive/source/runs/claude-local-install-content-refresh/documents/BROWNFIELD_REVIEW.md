# Brownfield Review: Claude Local Install Content Refresh

- mode: post_ur_review
- decision: pass
- mode_slice_decision: verified_change
- required_next_gate: none
- date: 2026-08-26
- run_id: claude-local-install-content-refresh

## Scope

Make the local Claude install deliver current source content deterministically (uninstall→install instead of same-version update) and make version verification read the real multi-line `claude plugin list` output. Single owner: `create-agdf/lib/installers/plugin-installers.js` plus its existing test file.

## UI/UX Routing

- delivery_context: brownfield
- ui_ux_impact: none
- ui_ux_impact_reason: Installer sequencing and output parsing only; the lifecycle result surface is unchanged apart from becoming truthful.
- ux_intent_definition_required: not_applicable

## Refresh-Mechanism Decision (A vs B)

- **Selected: B — deterministic reinstall.** When the plugin is already installed, the local install path runs `claude plugin uninstall agdf@agdf` followed by `claude plugin install agdf@agdf` (after the marketplace update), instead of `claude plugin update`.
- **Empirical evidence (2026-08-26):** on the real host, `update` with unchanged version 0.13.5 left the cache at the 2026-08-24 build; `uninstall` + `install` refreshed the cache to the 11:10 marketplace build (`distributionProfiles: true`, `.agdf-installation.json` present). B is proven to work on the live host.
- **Rejected: A — Claude-side local version projection (`0.13.5+claude.local-<digest>`).** It would collide with the runtime-integrity contract that requires `.claude-plugin/plugin.json` version to equal the canonical definition version (`plugin-provenance.js` repository-runtime check), owned by run `agdf-cross-host-runtime-integrity` which is itself still Awaiting QA; it would also proliferate per-digest cache directories and touch provenance, validators and integrity tests. Materially wider blast radius for the same outcome.

## Current Coverage

| Concern | Status | Evidence |
|---|---|---|
| Claude lifecycle sequencing | fully_done (but stale-prone) | `plugin-installers.js:40-56`: marketplace update, then `update`/`install` |
| Change detection | partially_done | `transaction.changed` exists but reflects the marketplace transition, not host-cache freshness (today: marketplace fresh, cache stale, `changed` would be false) — so refresh must not be gated on it |
| List parsing | not_done for current CLI | `pluginVersionFromList` (`plugin-installers.js:220`) is same-line-only; real output is multi-line; existing test scripts single-line output only (`local-marketplace-test.js:328`) |
| Mismatch guard | partially_done | `installedVersion && ...` skips the guard when parsing fails; degraded status is reported but staleness passed unnoticed |

## Reuse Strategy

- strategy: extend
- Keep `runPluginPhase`, `captureOptions`, error taxonomy and the migration/recovery flow unchanged; only the plugin-operation step changes from `update` to `uninstall`+`install` for the already-installed case.
- Extend `pluginVersionFromList` to scan the plugin's multi-line block (until the next `name@marketplace` entry) for a `Version:` value, preserving the single-line format for Codex and older outputs.
- Extend the existing `local-marketplace-test.js` scripted-exec coverage; no new test file.

## Parallel-Structure Risk

None. No second parser, no second lifecycle sequence, no cache introspection into Claude-owned internals.

## SoT / Runtime / Product-Semantics Drift

None. Canonical version semantics, provenance and runtime-integrity contracts stay untouched (deciding factor against alternative A).

## Risks

- Between uninstall and install the plugin is briefly absent; if install then fails, the host is left without the plugin until rerun. The failure is loudly reported with phase and next action; marketplace-level recovery is unchanged. Accepted for a local development path.
- Uninstall may drop host-side per-plugin user settings (e.g. enabled state is restored by install; unknown further settings). Disclosed; acceptable for a source-development install.

## Mode/Slice Decision

- decision: verified_change
- scope_reason: `bounded_regression_fix`; one owner file plus its existing test, no contract or interface change, locally reversible, independently verifiable on this host with a deterministic repro. PRD/SD/TP depth has no trigger; Quick Task cannot carry the required regression evidence.
- evidence: `.agdf/control/artefacts/claude-local-install-content-refresh/UR.md`; live-host probe of 2026-08-26; coverage analysis above.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- required_action: record the Claude same-version refresh boundary at closeout.
- gate_effect: none

## Required Next Step

Execute the Verified Change: reinstall sequencing, multi-line parsing, test updates, on-host verification, `VERIFIED_CHANGE.md`.
