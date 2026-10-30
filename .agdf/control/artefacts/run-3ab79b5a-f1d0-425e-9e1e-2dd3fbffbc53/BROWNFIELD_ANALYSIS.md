# Brownfield Analysis: Defaults and shortened MCP inputs

Status: done
Decision: pass
Mode: pre_implementation_analysis
Owner: Codex

## Bound Scope And Sources

Run: run-3ab79b5a-f1d0-425e-9e1e-2dd3fbffbc53. TP approval is recorded at revision 12, 50fcc66a-e468-4416-9062-a3979ceac866. Reviewed current approved TP 5256fc869495413d7806da6e4ba0f30b238205d947fbbf6b25216bf8392aaeda, SD c3b0dbfa250a7e991e4a02e30221d19baf1456592016eac37153b46e506d1791, PRD 81229effc36ffb32a5606bb7b666ecada7de9f747e4901bba7082f1f79d51dc8 and completed Brownfield Review. No source changed. All current authoring-inputs chunks were consumed; current doctor is pass. The full structured-delivery route remains; this analysis does not select another Mode/Slice.

## Existing-System Evidence And Reuse

Current coverage is partially_done. resources/context.js and binding.js own matched generated resources and language selection; language-preference.js owns setup locale selection and the existing config serializer. control-configuration.js owns activation requiring all three legacy language fields. Extend these owners with the approved single configuration helper; do not replace activation or add another file hierarchy. Preserve optional/unknown siblings during explicit language changes.

skill-dispatch/contract.js, control-inspect/contract.js and run-command-schema.js own complete inputs. SDK server.js validates definitions before handlers. mcp-protocol-runtime.js composes public descriptors/parsers; mcp-dispatch-runtime.js owns services, parent-owned material/delivery and postprocessing. Worker and generation routes use private process/thread transport. Reuse this flow with one normalization snapshot and complete Core validation. No demonstrated native task-cwd binding exists; the SD's explicit-directory/error behavior applies.

run-command-service.js hashes the whole effective input. run-operation-status.js reads each existing family; run-operation-identity.js prevents cross-family UUID reuse. run-operations.js, approval-operations.js, artefact-bindings.js and run-source-revisions.js have strict receipt schemas, while run-step-transaction.js owns pending publication/recovery. Presentation envelopes and delivery have separate immutable/connection-local lifetimes. canonical-initialization.js, closure and runtime-generation retain their own ownership. Extend these existing formats and readers atomically with bounded resolution metadata; never place a shadow ledger in the adapter. Legacy receipt/digest/seal algorithms and exact approved bytes stay protected. Current version checks must be updated together wherever they interpret a new family's base semantics; retaining only an unvalidated metadata field is insufficient.

Source/resource propagation already uses sync-package-assets.js, core-projection.mjs and assemble-npm.mjs. Regenerate through these owners and inspect closure/diff. Core language and family tests, CLI contract/inspection tests and MCP SDK protocol/safety/generation suites are reusable. Two focused boundary suites and the bounded native probe/harness have the uncovered purpose identified by TP; no duplicate framework is needed.

The local Codex 0.163.0 generated API declares direct MCP calls and ephemeral contexts. That is planning evidence for a zero-model-call native probe, not observed success. Use temporary profile/fixtures and the exact candidate; if unavailable retain an evidence gap instead of using installed older code.

## Regression And Parallel-Structure Risks

- Receipt/pending/version changes are high risk. Keep one shared bounded resolution representation but each family validates, persists and recovers it under its existing locks/seal. Cover old-reader rejection, current legacy readers, corruption, config changes and interrupted publication. No new replay authority.
- Missing, malformed and absent optional project settings differ. Explicit overrides cannot hide invalid recognized config; defaults cannot activate invalid/missing control. Existing valid locale fallback remains with the registry.
- Public omission without executable normalization would be an incomplete delivery. Cover all nine tools/seven groups, parent and Worker paths, unknown fields, constants and authority-negative cases together.
- Existing narrow descriptor/payload limits cannot be raised. Schema/provenance help must be concise and on demand; generated resources must fit the approved budgets.
- Working-directory trust remains conditional; do not use process cwd, target or installation root. Project preferences are read only after existing target binding and cannot leak across calls.

All have approved SD ownership and executable TP checks; no new material scope/design question was found. No accepted debt or temporary parallel structure is proposed. Test outcomes remain future evidence, not analysis blockers.

## Protected Work And Context Graph

Read-only git status confirms unrelated CONTRIBUTING.md and installer-script edits plus other Run material. Their byte hashes are retained in a temporary preservation snapshot; no source index/branch changes are authorized. Shared backlog mutation stays with the typed writer. Existing CG-MCP-DISPATCH-ADAPTER should link the implemented defaults/resolution and replay boundaries; update the existing node through its owner during implementation, no new competing node.

## Minimal Clean Path And Quality Boundary

Extend resources/resolver first, then existing original-resolution receipt/read/recovery owners, then public projections and one adapter normalization path, scoped presentation/errors/help, and generated guidance/resources. Execute the focused TP matrix and native fixture probe on one frozen candidate. Required reviews and sole QA remain separate; no native/UI/UAT or efficiency claims arise from this analysis. Technical failures or newly discovered source contradictions route to their existing owners without changing approved source intent.

Required next step: Record this pre-implementation analysis through step.record, then redispatch gate-check for the same Run with continue_delivery true. Begin CD+Tests only when current control permits it. No Git, installation, release or later gate approval is inferred.
