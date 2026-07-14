# CD+Tests: Product-Style Gate Transition Card

Status: done
Gate: CD+Tests
Based on: approved `TP.md` and passed `BROWNFIELD_ANALYSIS.md`
Date: 2026-07-14
Owner: AGDF

## Delivered behavior

The approved NGB-13 through NGB-17 implementation is complete through the
existing canonical owners.

- Added `Gate Transition Card` as the approval-time product presentation in
  the Runtime Contract while preserving the Run Status Card as the stable
  operational, CLI and audit projection.
- Updated `gate-check` to render one localized three-part message before the
  native question or exact-text fallback: current position, approval effect
  and next transition.
- Added deterministic German labels and English-default labels without
  translating gate names, run identifiers or exact approval values.
- Prohibited Markdown tables, dashboard rows, raw control-state keys,
  diagnostic codes, evidence lists, duplicated questions and false user gates
  in the approval-time card.
- Preserved the TP transition: Brownfield Analysis is an internal next step and
  the user is told plainly that no further action is required now.
- Kept `buildStatusCard`, CLI flags, JSON fields, adapter metadata and approval
  persistence unchanged.
- Synchronized all existing Codex/plugin, Copilot and OpenCode package mirrors.
- Introduced no custom UI, renderer, translation service, approval store, host
  configuration mutation or parallel gate policy.

## Task evidence

| task_id | Status | Evidence |
|---|---|---|
| NGB-01–NGB-12 | baseline retained | Prior native-adapter, authority, locale and validation evidence remains unchanged and passing. |
| NGB-13 | done | Runtime Contract and canonical `gate-check` now require the product-style Gate Transition Card instead of the operational table at approval time. |
| NGB-14 | done | Contract and skill explicitly preserve the machine-readable/CLI Run Status Card boundary; existing CLI status fixtures pass unchanged. |
| NGB-15 | done | Canonical German and English-default composition is present in every generated skill surface; exact tokens and TP transition semantics remain stable. |
| NGB-16 | done | Runtime integrity rejects table/dashboard, raw-key, diagnostic, evidence, duplicate-question and false-Brownfield-gate patterns; six negative fixtures pass. |
| NGB-17 | done | Existing asset synchronizer propagated canonical changes; canonical and generated surface assertions pass. |
| NGB-18 | pending reviews | CD+Tests is complete; TP Review, Clean Implementation Review and Code Review must now be refreshed before QA. |

## Test evidence

| Check | Result | Evidence |
|---|---|---|
| Asset synchronization | pass | `node create-agdf/scripts/sync-package-assets.js` |
| Runtime integrity | pass | `node plugin/scripts/check-runtime-integrity.mjs` — 9 skills and 15 control files checked |
| Runtime-integrity negative fixtures | pass | `node create-agdf/scripts/runtime-integrity-negative-test.js` |
| Control-state tests | pass | `node create-agdf/scripts/control-state-test.js` |
| Aggregate package smoke | pass | `node create-agdf/scripts/smoke-test.js` |
| Generated transition-card mirrors | pass | Smoke assertions cover Codex/plugin, Copilot and OpenCode skills and contracts. |
| Existing CLI status-card compatibility | pass | German/English fallback and TP transition smoke fixtures remain passing. |
| Whitespace | pass | `git diff --check` |

## Scope and evidence boundary

- Deterministic evidence proves canonical content, ordering, locale fallback,
  prohibited approval-time patterns, generated propagation and stable
  machine-readable status semantics.
- Host typography and rich-card rendering remain outside AGDF control. The
  visible card is an agent-rendered product message immediately before the
  host-native decision control.
- Live host behavior remains supporting evidence and cannot replace the
  deterministic checks above.
- Exact-text fallback and the existing approval validator remain authoritative.

## Required next step

Run Task Plan Review for NGB-13 through NGB-17, then refresh Clean
Implementation Review and Code Review. QA remains forbidden until those review
artefacts are complete and all actionable findings are resolved.
