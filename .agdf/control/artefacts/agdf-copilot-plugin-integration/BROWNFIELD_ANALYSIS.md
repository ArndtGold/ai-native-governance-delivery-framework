# Brownfield Analysis: Plugin-Only AGDF Integration for GitHub Copilot

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `none`
- revision: 2
- artefact: `.agdf/control/artefacts/agdf-copilot-plugin-integration/BROWNFIELD_ANALYSIS.md`

## Scope And Evidence

Implement approved CPI2-T01 through CPI2-T11 by refactoring existing CLI, scaffold, generator,
lifecycle, documentation and test owners. The current plugin handler, bundle, prefixed skills, hook,
runtime, consent and provenance behavior already exist and must be reused.

Direct repository evidence:

- `application.js` currently maps `copilot` to scaffold and `copilot-plugin` to the plugin handler.
- `command-registry.js` exposes `copilot`, `copilot-plugin` and `both`.
- `scaffold/plan.js` and `presentation.js` own the Copilot repository projection.
- `sync-package-assets.js` owns both repository Copilot assets and the separate plugin
  `copilot-skills/**` projection.
- `install-local-plugin.js` currently translates local `copilot` to `copilot-plugin`.
- Existing focused tests cover every affected owner.

## Current Coverage And Reuse

| Area | Coverage | Strategy |
|---|---|---|
| Copilot plugin bundle and lifecycle | `fully_done` | `reuse` unchanged except public command name |
| Public command routing | `partially_done` | `refactor` existing handler mapping and registry |
| Copilot repository projection | `fully_done` but retired | `remove` only from owned generated and scaffold consumers |
| Non-destructive lifecycle | `partially_done` | `extend` existing tests with legacy-file fixtures |
| Documentation and Pages | `partially_done` | `refactor` existing owners |
| Verification | `fully_done` as test infrastructure | `extend` existing suites; no parallel suite |

## Impact And Clean Path

- Keep the Copilot installation handler in `application.js`; bind it to `copilot` rather than copy it.
- Remove `copilot-plugin` and `both` at the registry and handler boundary so they fail before writes.
- Remove Copilot branches and constants from scaffold plan and presentation while preserving Codex,
  OpenCode, init and config.
- Split repository-only asset generation from plugin asset generation. Clean only owned paths under
  `create-agdf/generated`; never traverse a user repository.
- Keep `copilot-skills/**`, root `plugin.json`, hook and runtime intact.
- Update current tests and documentation together.

## Risks And Boundaries

- Removing root `.github/skills/**` generation must not remove plugin `copilot-skills/**`.
- Retired generated paths may persist unless the generator explicitly cleans its own output.
- No install, update, disable or uninstall operation may inspect or delete legacy repository files.
- Codex, Claude Code, OpenCode and generic control behavior must remain unchanged.
- Marketplace submission, VCS and release remain outside implementation authority.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`; `CG-CREATE-AGDF-CLI-COMPOSITION`;
  `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-RUN-STATUS-CARD`
- context_graph_reconciliation: `pending_after_delivery`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`

## Required Next Step

Implement CPI2-T01 through CPI2-T11 through the identified owners, starting with focused tests and
command/generator changes. Stop if implementation would require a second installer, generator,
consent store, lifecycle model, approval path or target-repository cleanup mechanism.
