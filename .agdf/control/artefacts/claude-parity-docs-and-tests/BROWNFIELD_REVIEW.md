# Brownfield Review: Close Remaining Claude/Codex Parity Gaps In Docs, Tests And CLI Help

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: claude-parity-docs-and-tests
- related_ur: .agdf/control/artefacts/claude-parity-docs-and-tests/UR.md
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-10

## Objective

Locate the exact owners for each of the four scoped items and confirm this is pure copy/test
addition with no architecture, build-pipeline or contract impact.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | none | Copy/test-only change | none |
| Source of truth | `INSTALL.md:18`; `pages/src/data/site.ts:404` (`compatibility` array, Claude row `support: "First-class"`); `pages/src/pages/index.astro:946` (compatibility section prose) | Additional exact owner found beyond the UR's named locations: the `compatibility` data array in `site.ts` also needs its Claude row updated, not just the prose paragraph | high |
| Runtime path | `create-agdf/bin/create-agdf.js` lines ~178 and ~194 (`--surface codex` examples in `--help`) | Exact lines identified for a parallel `--surface claude` example | low |
| UI / UX | Pages site compatibility table | Rendered from `pages/src/data/site.ts`, not hand-written HTML — must edit the data source, not the `.astro` template's static text for the table row | medium |
| Persistence / data | none | | none |
| Tests / QA | `create-agdf/scripts/delivery-path-search-unit-test.js` | Existing convention (plain `node:assert/strict`, one file per module area) to extend for `capabilities.js` | medium |
| Release / operations | `pages/package.json` `check` script (per `agdf-guardrails.yml`'s "Verify Pages" step) | Confirms the minimal verification needed is the existing `npm --prefix pages run check`, no extra build step | low |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| The UR under-scoped the Pages site fix | UR only named `pages/src/pages/index.astro:946`'s prose; the compatibility *table* is data-driven from `pages/src/data/site.ts`'s `compatibility` array, where Claude's row currently says `support: "First-class"` instead of an executable-reference-equivalent label | warn | Update both: the prose paragraph in `index.astro` and the `support` value for the Claude row in `site.ts` |
| New test should follow the exact existing convention | `delivery-path-search-unit-test.js` already covers `scoring.js`, `candidate-policy.js`, `contracts.js` in one file with plain `node:assert/strict` | none | Add `capabilities.js` coverage to the same file rather than creating a new one, avoiding a parallel test-file structure |
| CLI help fix is copy-only | Two exact lines identified (`--surface codex` in the `npx` and `npm create` example blocks) | none | Add one `--surface claude` line next to each, matching existing style |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: Pure copy and test additions reusing existing conventions and data structures; no architecture, contract, or build-pipeline change.
- evidence: All four owners are now precisely identified, including the one the UR missed (`site.ts`'s data array); no open unknowns remain.
- transparency_note: Quick Task Execution may now edit `INSTALL.md`, `pages/src/data/site.ts`, `pages/src/pages/index.astro`, `create-agdf/bin/create-agdf.js`'s help text, and extend `delivery-path-search-unit-test.js`.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| none | none | none |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Context Graph is already accurate; no update needed there.

## Next Permissible Step

- next_allowed_action: Quick Task Execution — implement the doc/data/help/test changes listed above, verify with `npm --prefix pages run check` and the existing package smoke tests.
- forbidden_until_then: Any change to Copilot/OpenCode's actual or documented enforcement status.

## Quality Outlook

- quality_outlook: Closes the last known drift between actual capability and public/internal documentation for this delivery slice, and adds a regression net for `capabilities.js` that did not exist before.
