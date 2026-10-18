# Brownfield Analysis: Plugin-owned Cockpit implementation

Status: done
Mode: pre_implementation_analysis
Decision: pass
Owner: Codex
Date: 2026-10-16

## Scope and evidence

The exact approved TP covers T-001 through T-009 and 26 scenarios. Approved UR/PRD/SD/TP remain unchanged. Source baseline is evidence/source-baseline.txt; tracked source is clean at baseline. Shared-checkout control changes and the unrelated core-model-handoff-simplification artefact are preserved. A source baseline archive and the Run recovery archive are retained outside the checkout in /private/tmp/agdf-cockpit-run-recovery-20261016/. No branch switch or cleanup is required.

## Existing implementation and reuse path

| Existing owner | Coverage | Minimal extension and regression obligation |
|---|---|---|
| Core cockpit-contract/session | partially_done | Preserve read selectors, one sessions map and publication slot; add a separate strict plugin opening schema and immutable per-view target/root; poolFactory accepts that root; bound mode stays compatible |
| Core task-target-resolution and approval-command-contract | fully_done for canonical target checks | Reuse confirmed target resolution and target identity; do not add a cwd-derived project or target registry |
| CLI mcp-dispatch-runtime | partially_done | Current cockpit requires a startup directory; explicit Codex plugin mode resolves on render, keeps mode cockpit and no dispatch writer |
| CLI plugin-runtime, MCP main/generation/child | partially_done | Forward explicit mode through existing launcher, initial runtime and qualification; avoid Decision wrapping for Cockpit; validate mutually exclusive modes and preserve generation routing |
| Core plugin-provenance and existing sync/assembly scripts | partially_done | Extend the sole Codex renderer and full normalization; explicitly select Codex versus Claude capability generation; normal Codex/all assembly carries exact verified Cockpit UI, other profile declarations stay bounded |
| CLI lifecycle service, Codex adapter, evidence and snapshots | partially_done | Existing adapter recognizes agdf-prefixed local sections and only one plugin entry; extend origin-aware inventory and existing transaction path for conflict admission, exact retirement proof and conditional rollback |
| Existing React Cockpit and protocol UI owner | fully_done for content views | Retain bootstrap metadata and URI; expose checked project/failure states through existing envelopes; UI capability must precede allocation |
| Existing unit/package/MCP/browser tests | partially_done | Extend the TP-named suites for multi-project ownership, profile bytes, same-name origins, rollback and final tuple; no second harness or synthetic native success |

## Implementation sequence

Implement Core target/session handling, CLI/MCP explicit mode, then declaration/build projection; qualify focused tests before lifecycle changes and native installation. Extend lifecycle inspection/evidence/transaction owners next, preserving foreign bytes and old runtimes. Build and run tests in an isolated copied snapshot including the scoped edits; avoid concurrent generation into the source tree. Review exact final diff. Native clean/legacy/same-key/lifecycle scenarios follow only after automated evidence.

## Boundaries and risks

The design resolves ownership and acceptance; no new product or architecture decision is needed to start source work. Both plugin processes share immutable packages, never mutable session/context ownership. All bound-mode and regular Decision reader schemas remain unchanged. Name prefixes do not prove host isolation; actual origin/provider evidence is mandatory before native qualification. Same-key native isolation remains an execution prerequisite with the approved unavailable stop action. Host UI observation, native reload, actual installation and migration are not yet performed or claimed; lack of that later evidence prevents completion, not scoped source implementation.

No deliberate debt/parallel-owner exception is introduced. Evidence may reveal a material design contradiction; return it to the earliest existing owner rather than change approved sources. Existing lifecycle transactions and guarded compensating rollback are reused; no cross-file atomicity is claimed.

## Context graph and knowledge

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md; docs/architecture/06-agdf-cockpit.md
- context_graph_reconciliation: open_gap
- context_graph_required_action: link
- context_graph_gate_effect: warning
- context_graph_evidence: Final integration evidence belongs to the existing Cockpit architecture node at closeout; current source analysis is not native qualification.
- memory_target: scope_artifact
- memory_reason: Implementation-specific baseline and native evidence limitations remain bound to this Run.
- memory_refs: BROWNFIELD_ANALYSIS.md; evidence/source-baseline.txt

## Next permissible step

Record this actual analysis through the canonical internal-step writer, then redispatch the same Run. CD+Tests can start only after this prerequisite is recorded. No implementation, QA or native transition result is asserted here.
