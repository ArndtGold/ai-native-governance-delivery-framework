# Brownfield Analysis: Deterministic Agent UX

## Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/deterministic-agent-ux/BROWNFIELD_ANALYSIS.md`

## Scope

Verify approved TP revision 1 against the existing interaction presentation, gate-check composition,
CLI wrapper/routing, locale, contract, generated-surface, documentation and test owners before code
changes.

## Existing Owners And Reuse Path

| TP tasks | Existing owner | Coverage before implementation | Reuse action |
|---|---|---|---|
| DAU-01 | `plugin/meta/agdf-interaction-locales.json`; `validateLocaleRegistry()` | partially_done | Extend the complete English/German packs and existing validation budgets; create no second copy registry. |
| DAU-02/03 | `buildApprovalOrientationSnapshot()` and `validateApprovalOrientationSnapshot()` in `create-agdf/lib/interaction-presentation.js` | partially_done | Refactor the existing immutable six-field snapshot to the approved five-field shape and add rendering at the same validation boundary. |
| DAU-04 | `evaluateGateCheck()` and non-enumerable `approvalOrientation` attachment in `create-agdf/lib/control-evaluation/gate-check.js` | partially_done | Promote a validated additive public projection while retaining full `status_card` meaning and evaluator authority. |
| DAU-05 | CLI `parse-args.js`, `command-registry.js`, `application.js` and gate-check printer | partially_done | Add one gate-check-only option and printer path; reuse the existing evaluator and exit status. |
| DAU-06 | snapshot validation, `executeNativeApprovalAttempt()` and gate-check re-evaluation boundary | partially_done | Extend existing fail-closed behavior with the approved ready/non-ready recovery branch. |
| DAU-07 | `plugin/meta/contracts/interaction.md`, `plugin/skills/gate-check/SKILL.md`, plugin definition | partially_done | Replace procedural rendering obligations with projection consumption while preserving transport and authority rules. |
| DAU-08 | `README.md`, `INSTALL.md`, `agdf/README.md`, `create-agdf/README.md`, CLI usage | partially_done | Reorder and sharpen existing guidance; retain all supported bootstrap and compatibility commands. |
| DAU-09 | `create-agdf/scripts/sync-package-assets.js` and Runtime Integrity | fully_done as generation boundary | Extend assertions and run the existing canonical-to-generated synchronization path. |
| DAU-10 | interaction, CLI, wrapper, smoke, routing and integrity suites | partially_done | Extend focused fixtures first, then reuse aggregate checks and separate optional live evidence. |

## Runtime And Source-Of-Truth Evidence

- `create-agdf/lib/interaction-presentation.js` already owns locale validation, safe artefact references,
  ordered outcomes, the immutable approval snapshot, snapshot validation and native-attempt fallback.
- `create-agdf/lib/control-evaluation/gate-check.js` already owns the selected evaluated run, the full
  `status_card`, human presentation attachment and human/JSON printing.
- `plugin/meta/agdf-interaction-locales.json` already contains complete English/German action headings,
  labels, actions, transition copy and length budgets; current gate action headings are approval-biased.
- `create-agdf/scripts/interaction-presentation-test.js` already covers all six gates, field order,
  mutation rejection, locale completeness, options and non-enumerable snapshot compatibility.
- CLI option validation and dispatch are modular in `parse-args.js`, `command-registry.js` and
  `application.js`; `--approval-envelope` does not yet exist.
- The stable user-facing `@agdf/cli` package already exposes `agdf` through `agdf/bin/agdf.js`, delegates
  to `create-agdf/cli` and verifies the packed wrapper in `agdf/scripts/smoke-test.js`. No new binary
  alias is required.
- `sync-package-assets.js` already propagates canonical skills, contracts and locale data into Codex,
  Claude Code, OpenCode and Copilot surfaces.

## Change Impact And Regression Risk

- The compact approval-time snapshot changes from six fields to five, but the full `status_card` must
  keep `missing_approval`, `quality_outlook`, allowed/forbidden and audit semantics unchanged.
- Adding an enumerable `approval_presentation` changes JSON additively and increases ready-gate payload
  size; non-ready reports must expose `null` and retain exit behavior.
- Exact approval data exists in the transition card, structured option and exact-text request for
  different purposes. Validation must enforce one occurrence across the two cards without rejecting
  the later input transport occurrences.
- Renderer failure recovery crosses presentation and evaluator concerns. Re-evaluation stays in the
  gate-check composition; the pure renderer must not read repository state.
- CLI help and documentation currently emphasize registry-resolved commands, while `agdf/README.md`
  already documents global installation and local `agdf` execution. Guidance changes must preserve
  bootstrap reproducibility and the `create-agdf` compatibility surface.
- Generated assets and Runtime Integrity contain explicit legacy six-field/action-title expectations;
  canonical edits and assertion updates must remain synchronized.
- No data migration, persistence schema, destructive operation, external service or host permission
  change is required.

## Parallel-Structure And Visible-Ownership Check

The implementation remains clean only if `interaction-presentation.js` owns snapshot semantics and
rendering, `gate-check.js` owns repository re-evaluation and public composition, and surface adapters
transmit the resulting blocks. A renderer in a generated skill, host adapter, CLI wrapper or
documentation file would be a forbidden parallel owner. The full status/audit card and the compact
approval-time card are distinct projections from the same evaluated state, not competing sources of
truth.

## Test Obligations

- all six gates in English and German with neutral headings and the five exact field IDs;
- exact two-block Markdown snapshots, narrow/long title behavior and accessible order;
- duplicate/decorated approval, biased/generic heading, wrong order/fields, mixed locale, unsafe link,
  stale revision and run/gate mismatch rejection;
- ready projection object, non-ready `null`, non-enumerable compatibility and unchanged full status;
- ready-after-render-failure exact-text path versus newly non-ready no-decision path;
- CLI parser, help, incompatible option, human output and exit-code fixtures;
- `@agdf/cli` wrapper/pack regression and no routine network dependency claim;
- generated Codex, Claude Code, OpenCode and Copilot parity plus Runtime Integrity drift rejection;
- focused suites before aggregate smoke, doctor, gate-check and `git diff --check`.

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: `CG-RUN-STATUS-CARD`; `CG-NATIVE-INTERACTION-AUTHORITY`;
  `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `link`
- rationale: the approved change extends three existing reusable invariants and creates no new
  authority, capability class or persisted concept.

## Minimal Clean Implementation Path

Extend locale semantics and the existing snapshot first; add one pure renderer and focused tests;
expose the validated projection through the existing gate-check composition and one CLI flag; implement
recovery at the evaluator boundary; then update canonical contracts and documentation, synchronize all
generated surfaces and run focused-to-aggregate verification. Preserve the existing `@agdf/cli`
wrapper unchanged except for help/output inherited from `create-agdf`.

## Required Next Step

Proceed to `CD+Tests` for DAU-01 through DAU-10. No earlier gate reopens.
