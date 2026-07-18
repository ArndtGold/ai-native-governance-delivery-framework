# Brownfield Review: Release-Built Plugin Runtime Distribution

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done
Date: 2026-07-18

## Run

- run_id: `automatic-version-asset-sync`
- related_ur: `.agdf/control/artefacts/automatic-version-asset-sync/UR.md`
- current_gate: PRD
- reviewer: agent
- reviewed_at: 2026-07-18

## Objective

Determine the smallest safe change that removes generated runtime bytes from the Git source plugin
while preserving exact-version offline validation in installed Codex and Claude plugins.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Source plugin | `plugin/` | `plugin/runtime/` is currently generated but untracked; source integrity currently requires it | high |
| Built plugin | `create-agdf/generated/plugins/agdf/` | package sync already produces a complete plugin and `create-agdf` publishes `generated/` | high |
| Runtime generation | `sync-plugin-runtime.js`; `sync-package-assets.js` | deterministic focused payload, manifest and digest already exist | medium |
| Codex install | `plugin-installers.js` | registers `arndtgold/ai-native-governance-delivery-framework`; CLI help confirms local paths are supported marketplace sources | high |
| Claude install | `plugin-installers.js`; root marketplace | registers the same GitHub repository; CLI help confirms local paths are supported | high |
| OpenCode install | `opencode.js` | already uses an exact config-local npm package and needs no new runtime distribution | none |
| Publish workflow | `.github/workflows/publish-agdf.yml` | publishes `create-agdf` then `@agdf/cli`; prepack sync exists but source integrity runs before package build | high |
| Prior run | `agdf-interaction-ownership-quick-path-ux` | QA pass assumes a runtime-bearing source plugin; exact QA approval was not provided | high |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Existing generated plugin is already the correct distribution input | `create-agdf/generated/plugins/agdf/` | none | reuse it; do not add another plugin builder |
| Ephemeral npm/npx paths cannot back a persistent marketplace | host local-path support plus package lifecycle | block | copy atomically to an AGDF-owned durable per-surface location before registration |
| GitHub and local marketplaces can collide under the same name | current installer commands | revise | design ownership-proven migration and idempotent update behavior |
| Prior QA evidence names the superseded source-bundle architecture | prior QA report | block | mark prior QA revise and rerun runtime/installer evidence under this run |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: The source/build split itself is bounded, but changing two global plugin installation
  and migration paths plus release packaging affects compatibility, durable user configuration and
  rollback. Full design and task planning are proportionate.
- evidence: package file list, current installer adapters, both host CLI help outputs, publish workflow,
  existing runtime generator and prior overlapping QA report.
- transparency_note: OpenCode and evaluator semantics are unchanged. Structured depth is required by
  Codex/Claude distribution migration, not by the runtime generator.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which per-surface durable root and ownership markers are safe across macOS, Linux and Windows? | SD | revise |
| How is the existing GitHub marketplace registration migrated without deleting unrelated marketplaces? | SD | block |
| Which package/build verification proves runtime presence without requiring it in source mode? | PRD | revise |
| How do rollback and version retention work for a failed host update? | SD | revise |

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: the node already owns CLI installer and generated-package composition; its
  source/built/installed layout invariant must change after implementation.

## Next Permissible Step

- next_allowed_action: Draft the PRD for source-only plugin, package-built runtime and durable local marketplace migration; then request exact `Approval: PRD`.
- forbidden_until_then: implementation, deletion of runtime files, installer mutation, publication, tags and VCS actions.

## Quality Outlook

- quality_outlook: Prove three distinct layouts—source without runtime, package with runtime, installed plugin with runtime—and fail closed on unowned migration targets.
