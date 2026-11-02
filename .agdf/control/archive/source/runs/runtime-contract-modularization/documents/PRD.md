# PRD: Runtime Contract Modularization

## Scope

Split the 855-line `plugin/meta/agdf-runtime-contract.md` monolith into 7 thematic modules under `plugin/meta/contracts/`. Replace the monolith with a thin manifest that lists the modules. Update all skills, scripts, installer, and tests to reference specific modules instead of the monolith.

## Acceptance Criteria

1. 7 module files exist under `plugin/meta/contracts/` with exact content from the monolith, organized as defined in the UR
2. `plugin/meta/agdf-runtime-contract.md` is a thin manifest (~20 lines) listing modules and their coverage
3. All 9 plugin skills reference `../../meta/contracts/<module>.md` instead of `../../meta/agdf-runtime-contract.md`
4. `plugin/meta/agdf-agent-router.md` references `meta/contracts/` modules
5. `check-runtime-integrity.mjs` reads all module files and concatenates for content checks; passes with 0 findings
6. `sync-package-assets.js` copies `contracts/` directory to all generated surfaces (Copilot `.github/skills/contracts/`, OpenCode `.opencode/contracts/`, Codex `plugins/agdf/meta/contracts/`); path replacements updated
7. `create-agdf.js` includes contract module files in `codexPluginFiles`, `copilotSkillFiles`, `openCodeFiles`; installs to global OpenCode config
8. `runtime-integrity-negative-test.js` modifies module files instead of monolith; passes
9. `verified-change-test.js` reads from module file; passes
10. `smoke-test.js` checks generated module files for transition-card content; passes
11. `SOT_REGISTRY.md` updated: Runtime contracts SoT points to `plugin/meta/contracts/`
12. `CONTEXT_GRAPH.md` node refs updated to point to specific modules where applicable

## Non-Goals

- No change to gate semantics, approval formulas, or interaction contracts
- No change to locale registry or interaction presentation logic
- No change to control scaffold structure
- No content change in any module — pure restructure, word-for-word identical

## Design Decisions

### Module Organization

| Module | Sections from monolith |
|---|---|
| `gate-transition.md` | Source Precedence, Workstate And Scope Ambiguity, Domain Guardrail Packs, Gate Rules, Brownfield Review After G-00, Gate Transition Model, Brownfield Modes |
| `interaction.md` | Run Status Card (+ human-facing format text), Breadcrumb, Post-Acceptance Transition Narration, Internal-State Collapse, Gate Transition Card, Native Interaction Contract, Interaction Locale Contract, Gate-Rationale-Registry, On-Demand "Why?" Interaction, Human Decision Presentation Contract |
| `modes.md` | Mode Selection, Quick Task Output, Verified Change, Non-Normative Trivial Change Boundary, Narrow Code-Fix Criterion, Bug Lightweight Track |
| `quality.md` | Quality Readiness Projection, Chat Output Discipline (+ Chat and Tool-Call Discipline), Quality Contract Output, Skill Output |
| `context-graph.md` | Knowledge Persistence Decision, Context Graph Output, Context Graph Reconciliation |
| `control-scaffold.md` | Delivery Path Search, Control Scaffold (+ Run-Scoped Control State + Human-readable Master Backlog), Agent-Native Runtime And CLI Verification, Delivery Map |
| `closeout.md` | Support Answer Bridge, Relevant Run, Do Not Duplicate |

### Skill-to-Module Mapping

| Skill | Modules needed |
|---|---|
| gate-check | gate-transition, interaction, control-scaffold, modes, quality |
| brownfield-analysis | gate-transition, context-graph, quality |
| qa-gate | quality, context-graph, gate-transition |
| release-or | closeout, quality, context-graph, control-scaffold |
| delivery-path-search | control-scaffold, gate-transition, quality |
| code-review | quality, context-graph |
| clean-implementation-review | quality, context-graph |
| task-plan-review | quality, context-graph, gate-transition |
| delivery-closeout | closeout, context-graph, gate-transition |

### Heading Levels

Each module starts with `# AGDF Runtime Contract — <Name>`. Original `##` section headings are preserved as `##` so the integrity checker's `sectionAfterHeading()` regex and `includes()` string checks work against concatenated module content.

### Manifest

`agdf-runtime-contract.md` becomes a ~20-line index listing modules and their coverage. The file still exists at the same path for backward compatibility (session-start hook, plugin definition, SOT_REGISTRY).

### Path Replacement in Sync Script

- `../../meta/contracts/` → `../contracts/` (Copilot)
- `../../meta/contracts/` → `../../contracts/` (OpenCode)
- `../../meta/agdf-runtime-contract.md` → still replaced to destination manifest path (backward compat)
