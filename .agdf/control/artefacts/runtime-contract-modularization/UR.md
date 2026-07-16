# UR: Runtime Contract Modularization

## Problem

`plugin/meta/agdf-runtime-contract.md` is a single 855-line file. When a skill references it via `../../meta/agdf-runtime-contract.md`, the agent must read the entire file to find the relevant 10–20 lines. With 9 skills each loading the full monolith, this wastes ~7,700 lines of context per session.

## Proposed Change

Split the monolith into thematic modules under `plugin/meta/contracts/`:

| Module | Covers |
|---|---|
| `gate-transition.md` | Gate rules, gate transition model, Brownfield review, Brownfield modes, source precedence, scope ambiguity, domain guardrail packs |
| `interaction.md` | Run status card, gate transition card, breadcrumb, narration, internal-state collapse, native interaction contract, locale, gate rationale, why interaction, human decision presentation |
| `modes.md` | Mode selection, quick task output, verified change, trivial change boundary, narrow code-fix criterion, bug lightweight track |
| `quality.md` | Quality readiness projection, chat output discipline, quality contract output, skill output |
| `context-graph.md` | Context graph output, reconciliation, knowledge persistence decision |
| `control-scaffold.md` | Delivery path search, control scaffold, CLI verification, delivery map |
| `closeout.md` | Relevant run, support answer bridge, do not duplicate |

Replace the monolith with a thin ~20-line manifest that lists the modules. Update each skill to reference only the modules it needs. Update the integrity checker, sync script, installer, and tests.

## Scope

- `plugin/meta/agdf-runtime-contract.md` — replaced by thin manifest
- `plugin/meta/contracts/` — new directory with 7 module files
- `plugin/skills/*/SKILL.md` — all 9 skills: Runtime Contract references updated
- `plugin/meta/agdf-agent-router.md` — Runtime Contract section updated
- `plugin/scripts/check-runtime-integrity.mjs` — read modules instead of monolith
- `create-agdf/scripts/sync-package-assets.js` — sync contracts directory
- `create-agdf/bin/create-agdf.js` — install contracts in all surfaces
- `create-agdf/scripts/runtime-integrity-negative-test.js` — modify module files
- `create-agdf/scripts/verified-change-test.js` — read from module
- `create-agdf/scripts/smoke-test.js` — check module files

## Non-Goals

- No change to gate semantics, approval formulas, or interaction contracts
- No change to the locale registry or interaction presentation logic
- No change to the control scaffold structure
- No change to existing run state or backlog entries

## Acceptance Criteria

1. The 7 module files exist under `plugin/meta/contracts/` with the exact content from the monolith
2. `plugin/meta/agdf-runtime-contract.md` is a thin manifest (~20 lines) listing the modules
3. All 9 plugin skills reference specific modules instead of the monolith
4. `check-runtime-integrity.mjs` passes with 0 findings
5. `runtime-integrity-negative-test.js` passes
6. `smoke-test.js` passes
7. `sync-package-assets.js` propagates the contracts directory to all generated surfaces
8. The generated output for Copilot, OpenCode, and Codex includes the contracts directory
