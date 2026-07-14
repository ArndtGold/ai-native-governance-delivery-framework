# Brownfield Analysis: Product-Style Gate Transition Card

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/native-gate-buttons-live/BROWNFIELD_ANALYSIS.md`
- scope: NGB-13 through NGB-17 from the approved revised Task Plan

## Evidence

- `plugin/meta/agdf-runtime-contract.md` already separates the stable
  machine-readable Run Status Card fields from human-facing Markdown labels
  and owns the Native Interaction Contract.
- `plugin/skills/gate-check/SKILL.md` is the primary visible interaction owner.
  It currently requires a localized Run Status Card immediately before a gate
  question and renders a dashboard-style table in its general output contract.
- `create-agdf/bin/create-agdf.js` owns the stable CLI/JSON status projection,
  locale selection and German/English status-card labels. This is an audit and
  diagnostic interface, not the approval-time product surface.
- `plugin/scripts/check-runtime-integrity.mjs` currently asserts both the
  canonical native-interaction wording and the general gate-check status table.
  Its assertions can preserve the latter while independently enforcing the new
  approval-time transition-card contract.
- `create-agdf/scripts/smoke-test.js` already covers CLI status-card i18n and
  TP-to-Brownfield-Analysis transition semantics. Those fixtures are reusable
  compatibility evidence and must not be converted into UI-renderer tests.
- `create-agdf/scripts/sync-package-assets.js` already propagates the canonical
  runtime contract and skills to Codex, Claude Code, Copilot and OpenCode
  package surfaces.
- `plugin/meta/agdf-plugin.definition.json` already declares the host-native
  question adapters. No renderer, app, hook or persistence extension is needed.

## Current coverage

| Task | Coverage | Finding |
|---|---|---|
| NGB-13 | `partially_done` | A separate localized status block is required before every gate, but the canonical guidance still describes an internal status card/table rather than the approved three-part product message. |
| NGB-14 | `fully_done` baseline | The Run Status Card already has one stable machine owner and separate CLI/JSON projections. Preserve this interface and clarify that it is not the primary approval UX. |
| NGB-15 | `partially_done` | Locale resolution, exact tokens and transition fields exist, but canonical German/English product-copy composition for the approval-time card is not yet implemented. |
| NGB-16 | `not_done` | No negative assertions currently reject tables, raw keys, diagnostics, evidence lists, duplicated questions or false user gates in approval-time guidance. |
| NGB-17 | `fully_done` infrastructure | Canonical-to-generated synchronization and integrity checks exist; only their content assertions and regenerated outputs need updating. |

## Reuse strategy

- strategy: `extend`
- Keep `buildStatusCard`, `printGateCheckReport`, CLI flags, JSON fields and
  locale resolution unchanged.
- Extend the Native Interaction Contract with one explicitly named
  `Gate Transition Card` presentation layer derived from the existing status
  projection and post-approval transition semantics.
- Update only the approval-ready branch of `gate-check` guidance to require the
  three-part product message before native buttons or exact-text fallback.
- Keep the general gate-check operational status table for non-approval status
  reporting; do not reuse that table as the decision experience.
- Reuse the existing package synchronizer and integrity/smoke suites.

## Impact and compatibility

- Source owners: `plugin/meta/agdf-runtime-contract.md`,
  `plugin/skills/gate-check/SKILL.md`,
  `plugin/scripts/check-runtime-integrity.mjs` and
  `create-agdf/scripts/smoke-test.js`.
- Generated impact: existing package mirrors only, produced through
  `create-agdf/scripts/sync-package-assets.js`.
- Public interface impact: none. CLI flags, JSON schema, approval formulas,
  adapter metadata and persistence behavior remain unchanged.
- Data or migration impact: none.
- Localization impact: approval-time product copy gains deterministic German
  and English-default templates; exact approval values remain English.
- Test impact: preserve all existing status-card fixtures and add separate
  canonical-guidance assertions for the transition card and prohibited
  approval-time patterns.

## Visible ownership and UX boundary

The primary visible composition remains two host-supported layers:

1. an agent-rendered, localized product message that answers where the user is,
   what approval does and what happens next; and
2. the host-native bounded question control.

AGDF cannot turn the first layer into a host-native rich card through the
existing adapter contract. A custom UI, MCP/app renderer, simulated button or
retry loop would create a parallel presentation owner and remains out of scope.
The clean improvement is therefore product-quality agent copy with strict
structure, immediately followed by the native decision control.

## Risks and mitigations

- **Terminology collision:** `Run Status Card` currently means both an audit
  projection and approval orientation. Mitigation: reserve that name for the
  machine/operational projection and use `Gate Transition Card` only for the
  approval-time product message.
- **Schema regression:** changing CLI rendering to achieve the UX would break
  automation. Mitigation: do not modify the status-card builder or output
  schema; add separate instruction-level assertions.
- **False determinism:** tests cannot prove host typography or layout.
  Mitigation: test canonical content, ordering, localization and prohibited
  patterns; classify live host probes as supporting evidence only.
- **Duplicated question:** the product message could repeat the native prompt.
  Mitigation: the card states context, effect and transition, while the native
  control alone asks the yes/no/revise question.
- **False user gate:** internal Brownfield Analysis could again appear as a
  requested approval. Mitigation: retain machine transition semantics and
  require natural-language copy saying no further user action is needed now.

## Parallel-structure and drift check

- parallel_structure_risk: `none` on the selected path
- source_of_truth_drift: `none` after the approved SD/TP revision
- product_semantics_drift: `none`; the change implements the approved UX
  semantics without changing gate authority
- UI_monolith_risk: `not_applicable`; no UI component or central state hook is
  introduced

## Context Graph impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_gate_effect: `none`
- required_action: Preserve the existing authority and presentation boundary;
  do not create a new node.

## Required next step

Implement NGB-13 through NGB-17 through the existing canonical contract and
skill owners, preserve the CLI/JSON Run Status Card unchanged, synchronize the
existing generated surfaces, and run the specified deterministic and live
supporting checks under CD+Tests.
