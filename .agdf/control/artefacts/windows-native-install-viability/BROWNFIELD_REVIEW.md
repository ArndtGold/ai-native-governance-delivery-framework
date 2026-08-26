# Brownfield Review: Native-Windows Viability Of The Local Install Chain

- mode: post_ur_review
- decision: pass
- mode_slice_decision: verified_change
- required_next_gate: none
- date: 2026-08-26
- run_id: windows-native-install-viability

## Scope

Make the local install chain viable on native Windows: probe-gated skip of the symlink negative fixture in `public-plugin-test.js`, and a bounded Windows-only `EPERM` retry for directory `renameSync` swaps in `builder.js` and `local-marketplace.js`. No validator, marketplace or install semantics change.

## UI/UX Routing

- delivery_context: brownfield
- ui_ux_impact: none
- ui_ux_impact_reason: Test fixture behavior and internal filesystem robustness only; one added CLI log line on skip.
- ux_intent_definition_required: not_applicable

## Current Coverage

| Concern | Status | Evidence |
|---|---|---|
| Symlink rejection check | fully_done, host-dependent fixture | `public-plugin-test.js:161` (`negativeFixture("symlink", ...)`); validator owns `symlink not allowed` |
| Staging swap with backup/rollback | fully_done, not lock-tolerant | `builder.js:66-77`; `local-marketplace.js:215-229, 347-374`; both follow the same backup-swap pattern |
| Windows lock tolerance | not_done | Direct `EPERM` observations 2026-08-26 (`builder.js:71` in repo workspace; `local-marketplace.js:349` in `%TEMP%`); prior ORs disclose native Windows as an evidence limitation |
| Symlink privilege on this host | absent | `AllowDevelopmentWithoutDevLicense` unset; `whoami /priv` lacks `SeCreateSymbolicLinkPrivilege` |

## Reuse Strategy

- strategy: extend
- One new small shared helper (`lib/fs-swap.js`, `renameSyncWithRetry`) used by both swap owners; no second swap implementation, no per-module copies.
- The negative fixture stays in its existing `negativeFixture` structure; only the symlink case becomes probe-gated (capability-gated, not platform-gated, so symlink-capable Windows hosts still run it).
- Focused coverage extends existing test owners rather than creating new suites.

## Parallel-Structure Risk

None. The helper is the single retry owner; call sites keep their existing transaction semantics (backup, rollback, recovery order unchanged; only the rename primitive becomes retry-tolerant).

## SoT / Runtime / Product-Semantics Drift

None. `symlink not allowed` enforcement in the validator is untouched; the fixture skip only acknowledges that the negative input cannot be constructed without the privilege. Retry does not change which errors are ultimately thrown.

## Risks

- Retry adds up to ~750 ms worst-case latency per persistently failing rename before the unchanged error surfaces. Acceptable for install/test paths.
- `Atomics.wait`-based sync sleep requires no timers and keeps the helper dependency-free.

## Mode/Slice Decision

- decision: verified_change
- scope_reason: `bounded_portability_fix`; one shared helper plus mechanical call-site substitution in two owners and one probe-gated fixture, no interface or product-semantics change, locally reversible, independently verifiable on this host (deterministic repro available). PRD/SD/TP depth has no trigger; Quick Task cannot carry the required regression evidence.
- evidence: `.agdf/control/artefacts/windows-native-install-viability/UR.md`; direct EPERM reproductions and privilege probe of 2026-08-26; swap-pattern inspection above.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- required_action: record the Windows lock-tolerance boundary for owned-root swaps at closeout.
- gate_effect: none

## Required Next Step

Execute the Verified Change: add `renameSyncWithRetry`, substitute the swap call sites, probe-gate the symlink fixture, add focused coverage, verify on this host end-to-end, and record `VERIFIED_CHANGE.md`.
