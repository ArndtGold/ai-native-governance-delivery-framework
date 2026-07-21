# OR: Canonical Scope Classification Card

Gate: OR
Report mode: OR-lite
Date: 2026-07-21
Owner: agent

## Run Status Card

| Status | Current gate | Allowed now | Blocked by | Missing approval | Next step | Quality outlook |
|---|---|---|---|---|---|---|
| pass | OR | Produce OR; VCS handoff on separate instruction | none | none | Produce OR | Keep the presentation owner singular |

## Delivered

- `renderScopeClassificationCard` in `create-agdf/lib/interaction-presentation.js` — additive, validated input contract, `authorizes: false`, fail-closed `null`
- `scopeClassification` locale section in `plugin/meta/agdf-interaction-locales.json` (en/de, parity via `validateLocaleRegistry`)
- `### Scope Classification Card` section in `plugin/meta/contracts/interaction.md` — activation boundary, fail-closed, mutual exclusivity with read-only orientation and two-card envelope
- `### Scope Classification Output` section in `plugin/skills/gate-check/SKILL.md` — consume-verbatim, no local template
- 4 Runtime Integrity assertions in `plugin/scripts/check-runtime-integrity.mjs` (contract section, skill reference, no template, renderer export, registry keys)
- 6 unit tests in `create-agdf/scripts/interaction-presentation-test.js` (SCC-1/2/5/6 + fail-closed)
- 3 eval cases in `evals/cases/gate-check.json` + fixtures + observations + manifest (SCC-3/4/8); corpus 36→39; corpus_version 1.3.0
- Generated surfaces synced via `sync-package-assets.js`; built-plugin integrity green

## Intentionally Not Delivered

- CLI-side run-less evaluation path (deferred per UR §7)
- Machine-readable JSON twin for the classification card (UR non-goal)
- Persistence or state store for classifications (UR non-goal)
- Live host UI verification (within manifest's declared `evidence_boundary`)
- VCS actions: commit, push, PR, release, reinstall — require separate explicit user instruction

## Gate Status

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` 2026-07-21 |
| Brownfield Review | done | `structured_slice`, `ui_ux_impact: medium` |
| UX Intent | ready | 3 working modes, 8 proposed criteria, 3 routed questions |
| PRD | approved | `Approval: PRD` 2026-07-21; SCC-1…SCC-8, 3 product decisions |
| SD | approved | `Approval: SD` 2026-07-21; additive renderer, input contract, activation boundary |
| TP | approved | `Approval: TP` 2026-07-21; T1–T9, UX Fidelity all `fulfilled` |
| Brownfield Analysis | done | `pass`; reuse path clear, runtime-digest risk owned by T8 |
| CD+Tests | done | T1–T9 implemented; all checks green |
| TP Review | done | 9/9 fully_done, UX Fidelity 8/8 fulfilled |
| CR | done | `pass`, 0 findings |
| QA | approved | `Approval: QA` 2026-07-21; decision `pass` |
| UAT | approved | `Approval: UAT` 2026-07-21 |

## TP Coverage

9/9 tasks fully_done (T1–T9). UX Intent Fidelity SCC-1…SCC-8 all `fulfilled` with visible evidence.

## Brownfield Fit

`pass` — reuse path clear; `renderScopeClassificationCard` mirrors `renderOperationalStatusCard`; locale parity via derived baseline; no parallel structures.

## Solution Integrity

`pass` — purely additive; no existing export, test, assertion, locale key or contract section modified; `authorizes: false` frozen into return; fail-closed on invalid input, incomplete locale and stale renderer.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: none
- context_graph_reconciliation: open_gap
- context_graph_required_action: link after UAT
- context_graph_gate_effect: none

## Open Risks

- SCC-3 "card appears exactly once" is deterministic replay evidence, not live host observation (within manifest's `evidence_boundary`)
- Agent-side input construction could drift over time; mitigated by validated input contract and fail-closed `null`

## Next Permissible Step

- next_allowed_action: Delivery closeout is ready. VCS actions (commit, push, PR, release) require separate explicit user instruction.
- OR does not approve later gates.
