# Brownfield Review: OpenCode Global Install Visibility

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: opencode-global-install-visibility
- related_ur: .agdf/control/artefacts/opencode-global-install-visibility/UR.md
- current_gate: Quick Task Execution
- reviewer: agent
- reviewed_at: 2026-07-09

## Objective

Size and route a bounded OpenCode visibility improvement after approved UR, without changing AGDF gate semantics or other runtime surfaces.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| OpenCode global hook | `create-agdf/opencode-plugin.js` | Hook currently logs repository surface status and sets `AGDF_CONTROL_DIR` through `shell.env` | medium |
| CLI install/status behavior | `create-agdf/bin/create-agdf.js` | `opencode` target updates OpenCode global config only; no dedicated status target exists | medium |
| Generated OpenCode repo surface | `create-agdf/scripts/sync-package-assets.js` and generated assets | `opencode-repo` writes `.opencode/AGDF.md`, `.opencode/agents/` and repo `opencode.json` | low |
| Smoke coverage | `create-agdf/scripts/smoke-test.js` | Smoke test checks global config entry and repo surface generation | low |
| User docs | `README.md`; `INSTALL.md`; `create-agdf/README.md` | Docs distinguish layers, but do not provide a deterministic status command | medium |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| OpenCode package name is already canonical in plugin metadata | `plugin/meta/agdf-plugin.definition.json` | warn if package name is duplicated manually | Reuse `pluginDefinition.opencode.npmPackage` |
| Repository surface remains explicitly generated | `opencode-repo` path and generated files | block if global hook silently mutates repositories | Keep repo writes in CLI bootstrap only |
| Session activity can only be proven inside a loaded OpenCode hook | OpenCode hook API | warn if CLI claims active session from config alone | Report environment/session signals separately from config |
| Generated assets are derived | `sync-package-assets.js` | block if generated OpenCode docs are edited as source | Change generator and regenerate |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: The approved scope is a bounded CLI/hook/status/documentation improvement using existing OpenCode integration points. It does not alter AGDF gate semantics, persistence model, or other surfaces.
- evidence: Affected source files and generated asset flow are known; smoke tests can verify global config/status and repo surface behavior.
- transparency_note: PRD, SD and TP would add ceremony without materially reducing risk for this targeted visibility improvement.

## Context Graph Impact

- context_graph_impact: update_needed
- context_graph_refs: CG-OPENCODE-VISIBILITY
- context_graph_required_action: record after implementation outcome
- context_graph_gate_effect: none
- context_graph_evidence: The change clarifies OpenCode install/session/repo-state visibility as an operating concern.

## Next Permissible Step

- next_allowed_action: Implement the narrow approved OpenCode visibility scope, update generated assets/docs, then run focused OpenCode smoke and runtime integrity checks.
- forbidden_until_then: Codex/Claude/Copilot behavior changes, automatic repository mutation at OpenCode startup, release or VCS actions.

## Quality Outlook

- quality_outlook: Make status outputs distinguish facts from inferred or unverified session state.
