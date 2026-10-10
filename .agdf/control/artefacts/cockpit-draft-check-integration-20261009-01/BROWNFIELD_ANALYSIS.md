# Brownfield Analysis: bound Cockpit draft checks

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: CD+Tests
- run: cockpit-draft-check-integration-20261009-01
- reviewed_revision: 368b1b2b-379c-4b9a-89bd-db477e3ca023
- scope: approved TP T-001 through T-007; approved PRD and SD remain the product/design owners.
- evidence: evidence/BASELINE.json, BASELINE.patch, baseline-files and PROTECTED_SOURCES.json; inspected owners below.
- transparency: post-TP implementation preparation; no implementation/test/review/QA fulfillment is claimed.
- missing_evidence: executable change, automated/rendered and fresh identity-bound native proof remain execution obligations.
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- memory_target: scope_artifact
- memory_reason: implementation preparation and worktree evidence belong to this Run.
- required_next_step: record this analysis as done, redispatch gate-check for this same Run, then implement only when routed to CD+Tests.

## Existing coverage and reuse path

| Owner | Coverage | Minimal intervention |
|---|---|---|
| control-inspect/artifact-readiness.js | Fully implemented standalone captured authoring checks and existing validators, partially reusable projection | Extract only the captured-view projection; keep standalone behavior/report unchanged |
| control-inspect/cockpit.js; control-read/snapshot.js and fs.js | Immutable recording/replay/final revalidation, selected detail, resources and replacement already exist | Capture canonical draft source/absence when selecting; add exact guarded replacement operation invoking the shared evaluator within that capture |
| cockpit-contract/session.js; cockpit-worker/pool.js; control-changes.js | Strict selectors, expiry, generation/resource registration, bounded workers and source observation exist | Extend schema and all replacement/adoption lists together; retain context cleanup quarantine and worker/session bounds |
| control-ui/server/service.mjs and mcp/transport.ts | Fixed target authenticated GET server and bounded MCP bridge exist | Add only the exact selected draft-check route/operation with strict fields; no inspect/file fallback |
| control-ui/src/api.ts/types.ts/state.ts | Typed envelopes and central generation/selection state exist | Validate optional result/binding; atomic guarded scope commit in existing reducer |
| App.tsx, RunDetail.tsx, CompactCockpit.tsx | Existing reading/freshness/navigation/disclosure/focus and scroll restoration | Dedicated ephemeral request hook and shared inline component; coordinate with freshness and context cleanup, reuse position restoration |
| Existing Core/session/stdio/service/UI/browser tests and build scripts | Existing executable test and generated asset owners | Extend focused meaningful regressions, then existing typecheck/build/sync and exact-build observation |

## Boundaries and preparation result

No product/design contradiction or missing ownership prevents the approved implementation path. The additive interface remains the existing structured-delivery scope. Existing protected approved sources and two other Run histories match their pre-recording bytes. Baseline captures HEAD, dirty tracked/untracked status, source hashes, exact candidate bytes and the prior patch before implementation. Earlier changes must be preserved; incremental diffs are measured against that baseline, not attributed wholesale from HEAD.

The important source boundary is the immutable view: a later draft read cannot acquire dependencies after freezing. Source descriptor/absence must therefore participate in selection capture, and the check must use the existing replacement path and same evaluator. Unsafe optional sources are recorded as denied dependencies without traversal. The check validates old selectors before discarding the legitimate view and validates exact revision/gate/digest again inside capture before publication.

Session/worker/pool generations and returned resource selectors must adopt the new scope together. The new request must honor existing publication cleanup uncertainty; client cleanup must complete before it replaces context. The central reducer remains the only committed reading/result owner. The new hook owns only pending/retry state and cancellation; source or selection change invalidates old results. App.tsx already mixes necessary navigation orchestration, so no new validator or result cache goes there. Position restoration is reused rather than remounting the whole undertaking.

## Regression risks and order

1. Shared Core evaluator and selected draft descriptor: actual-validator parity, pre-registration checks, absence/edit/symlink and capture-publication races.
2. Strict MCP/browser adapters plus session/worker/pool: selectors, replacement generations, resources, observer dependencies, limits, expiry and context quarantine.
3. Typed consumer/controller/central commit and shared component: no automatic check, late A→B replies, duplicate activation, timeout/retry/reload, accessible status and existing document/disclosure/scroll focus.
4. Existing builds and package propagation: old operation compatibility, actual runtime/App identities, generated assets and bounded old-server unavailability.
5. Actual scoped review and source/protocol/browser/native evidence; unavailable native proof stays an evidence gap and cannot be converted to QA pass or implicit global installation.

No parallel validator, persistent result store, new permission boundary, data migration, release operation or accepted architectural debt is proposed. Later implementation discoveries route to their earliest existing approved owner; the analysis grants no approval beyond canonical routing.
