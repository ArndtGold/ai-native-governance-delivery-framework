# Brownfield Analysis

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: CD+Tests
- run: agdf-portable-plugin-package-structure-20261001-01
- source_revision_id: 9541d743-f180-4bd6-a7b2-76a88048f5d7
- scope: Approved TP T-001 through T-010; two staged format/source migrations.
- evidence: evidence/BASELINE.md; evidence/BASELINE.json; evidence/SOURCE_CONSUMERS_BASELINE.json; evidence/OWNER_COORDINATION.md; approved SD and TP.
- transparency: This is implementation preparation after exact TP approval, not a new product/design approval or QA decision. Fresh same-run gate-check is required before CD+Tests.
- missing_evidence: Implementation, checkpoint, actual package, adapter and native-host results remain pending planned execution. Dirty payload interference is known and must remain visible in actual-output verification.
- required_next_step: Revalidate this completed analysis through gate-check for the same run; then start T-002 only if the returned control permits CD+Tests.

## Existing coverage and reuse path

| Concern / tasks | Coverage before implementation | Existing owner / evidence | Strategy and exact treatment |
|---|---|---|---|
| Canonical identity and profile projection; T-003 | partially_done | plugin/meta/agdf-plugin.definition.json; create-agdf/lib/public-plugin/manifest.js | Extend existing projector with portable identity; derive every variant from the definition. Source/public inline settings and complete local fallback are distinct approved profiles. |
| Atomic public candidate and semantic validation; T-002/T-004 | partially_done | create-agdf/lib/public-plugin/builder.js; validator.js | Extend actual-output checks before readiness; existing temporary output and previous-candidate recovery remain owners. Add pinned schema input/build tooling only. |
| Generated runtime/host composition; T-004 | partially_done | create-agdf/scripts/sync-package-assets.js; sync-plugin-runtime.js; sync-plugin-mcp.js; plugin/hooks/ | Refactor canonical hook templates into build-only host-templates/shared/hooks, explicitly materialize runtime hooks and preserve generated directories during repeat sync. Source/public must not auto-discover optional capabilities. |
| Canonical-source location; T-005 | not_done | Existing scripts, release helpers, source integrity/conformance, workflow and fixture consumers in evidence/SOURCE_CONSUMERS_BASELINE.json | Add one source-root locator under existing build/public-plugin ownership, then relocate plugin to plugins/agdf after Stage A passes. No old mirror, symlink or runtime repository lookup. |
| npm/package interfaces; T-006 | fully_done for existing boundaries; verification pending | create-agdf/package.json; agdf/package.json and bin/agdf.js; agdf-mcp-server/package.json and src/server.js | Preserve three npm names, exports, exact create-agdf version binding and generated destinations. No new core package or shipped Ajv runtime import. |
| Control/provenance/consent authority; T-006/T-008 | fully_done for existing ownership; regression verification pending | create-agdf/lib/control-state/; runtime/plugin-provenance.js; runtime/control-context.js; installers/; host-adapters/ | Reuse authority unchanged. Source labels may migrate; installed data paths, normalized absolute Codex MCP bindings and Claude lifecycle contract remain owned by existing runtime/installer paths. |
| Documentation and knowledge; T-007 | partially_done | Current docs/handbook, architecture/maintenance guidance, SOT_REGISTRY.md, CONTEXT_GRAPH.md | Update current source paths and curated existing node refs only after implemented evidence. Historical approvals and observation snapshots remain immutable. |
| Tests and observations; T-008/T-009/T-010 | partially_done | Existing public-plugin, integrity, control, installer, host-compatibility, MCP package/protocol and review entry points | Extend existing meaningful tests; add focused portable-schema/profile tests; build prerequisites before dependent consumers. Isolated fixture/native observations are separate evidence lanes. |

## Boundary and regression findings

The installed runtime is not a canonical-source locator consumer. Its local roots,
data ownership and relative metadata contract continue to resolve from the generated
installed package. Copilot's root plugin.json keeps its host grammar, and OpenCode
keeps its own projection. A generic portable mcp.json is deliberately excluded by
the approved compatibility decision; no launcher/data-root redesign is authorized.

Inline extensions.com.openai replaces a fallback object rather than merging it.
Consequently, the shared local runtime portable root omits inline settings and its
.codex-plugin/plugin.json must carry complete hooks/MCP/presentation fallback. A
source/public profile may contain inline presentation because optional activation
is excluded. Contradictory-overlay fixtures are necessary to verify selection.

Source integrity currently assumes parentRoot/plugin and root hooks. Its source
classification must change with the template relocation and deeper canonical root,
while installed-layout integrity continues to require materialized hooks. Builders
must exclude build-only templates, retain intended generated hooks/runtime/MCP on
resync, and reject wrong profile discovery, resource escaping and case mismatch.

No file migration has begun. There are no unresolved product/authority/owner decisions
preventing the approved implementation path. Two-stage checkpoints and task-owned
rollback address migration risk. The unrelated dirty-payload interference is an
execution/evidence obligation, not accepted technical debt: Arndt Gold owns any
separate remediation decision; T-006/T-010 must reject unsupported actual-package
readiness if it remains. Do not substitute clean-fixture evidence for dirty output.

## Test impact and minimal clean sequence

1. T-002 through T-004: pin approved bytes and exact build-only Ajv, extend existing
   generators and validators, relocate hooks and pass Stage A before parent movement.
2. T-005: use the current path inventory and owned snapshot to migrate active source
   reads, fixtures, version/release/CI and integrity classification together. Pass
   Stage B; test bounded rollback in a disposable fixture with an unrelated sentinel.
3. T-006 through T-009: inspect all actual npm archives, preserve control and adapter
   behavior, reconcile docs and report exact source/package/fixture/native lanes.
4. T-010: actual diff, structural review and TP fulfillment feed sole qa-gate. Known
   missing required evidence remains open; only verified findings may be resolved.

UI rendering/state/monolith checks are not applicable: this scope changes package
organization and profile discovery, not an interactive product surface.

## Context Graph and knowledge persistence

- Situation: Portable identity and canonical-source ownership change existing distribution references; implemented invariants must be reconciled before clean closeout.
- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-MCP-DISPATCH-ADAPTER; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: Approved SD/TP T-007 and current graph/source refs; updates are pending implementation, not a new node or approval authority.
- memory_target: scope_artifact
- memory_reason: Baseline/shared-owner coordination is specific to this run; durable implemented changes will be curated through T-007 in existing repository knowledge owners.
- memory_refs: This analysis and evidence/BASELINE.md; evidence/OWNER_COORDINATION.md.

The analysis pass permits only the next internal implementation step after fresh
control validation. Graph reconciliation remains a closeout obligation, and no
QA, host acceptance, publication or VCS readiness is asserted.
