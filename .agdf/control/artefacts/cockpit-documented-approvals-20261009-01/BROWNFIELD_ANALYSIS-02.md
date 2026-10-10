# Renewed implementation preparation

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_delivery (existing renewed decision, not reselected)
- run_id: cockpit-documented-approvals-20261009-01
- revision_id: 84cf5c3d-4f6a-46b8-bb7b-5ba0003c0bcd
- scope: approved renewed TP sha256:ac12ce007409e7bbb936e4c23f12f8a77f3b9d4fae4ed23886b0ed37b8b5b6f4, PRD and SD exact current approved sources
- evidence: evidence/renewed/BASELINE.json (255 candidate/source/test/qualification records, absent planned files included), PROTECTED_SOURCES.json (5375 protected artefact/history records), exact source files and package/fixture scripts read during preparation
- missing_evidence: implementation, tests, qualified builds, visible evidence and reviews remain future work, not preparation blockers
- required_next_step: record this preparation done and obtain fresh CD+Tests routing before product edits

## Existing Owners And Coverage

| Scope | Coverage | Reuse strategy | Evidence and minimal path |
|---|---|---|---|
| Canonical approval proof | fully_done for existing aggregate, not_done for per-readable-resource descriptions | refactor existing owner | artefact-binding-proof.js already binds canonical/raw bytes, receipts, presentations and revised sources; extract per-gate observation, leave aggregate semantics unchanged |
| Capture, resources and readable bytes | fully_done | extend existing owner | cockpit.js manifests canonical registrations, fresh document reads, dependency capture and invalid selectors; add bounded document_states without replacing Resource.status or following arbitrary sources |
| Draft authoring authority | fully_done; structured early-error descriptive classification partially_done | extend existing owner | artifact-readiness.js returns original reports; classify explicit current diagnostics/readiness_details only, preserve authoring/gate rules |
| Check continuity | not_done | extend existing per-view reader | replaceScope discards current result; one bounded identity-checked slot within reader retains it only for eligible same-Run navigation and clears on all approved boundaries |
| Read DTO/transport validation | fully_done existing fields; new optional shape not_done | extend shared existing boundary | api.ts/types.ts shared by HTTP/MCP; exact present-field association checks, absent old-server uncertainty, malformed presence rejected |
| Document navigation and focus | fully_done | reuse existing App/read route | document:<resource_id> logical type/reference return supported; capture renews selectors; existing expansion/back/close/handoff/context owners remain |
| Overview presentation | partially_done historical inline WIP only | replace scoped presentation | WorkStep currently renders DocumentedApprovals with three groups and per-row details; new RunDocuments uses actual gate registrations, two groups and Core-only state facts |
| Large reader/draft feedback | partially_done | extend presentation | DocumentView currently labels stored row status separately from current permission; add shared descriptive state/findings/original evidence, passive provenance; DraftCheck consumes same Core classification |
| Tests and builds | partially_done reusable owners, new acceptance not_done | extend existing fixtures/suites | canonical disposable approval and source-revision fixtures, production HTTP worker, STDIO helper, scoped MCP tests and immutable browser dist override exist; historical inline success cannot transfer |

## Architecture, Data And Risk Treatment

Optional externally consumed descriptive fields are the approved compatibility impact. Existing MCP/HTTP inputs, registration status, authoring/approval policy and persistence do not change. No migration or distributed cutover is needed; absence stays readable/uncertain and present malformed facts are rejected. One raw result slot belongs to the existing reader lifetime, with no App cache/parallel semantic owner or new service. UI remains presentational; primary generation, failure, retry, context and focus are owned by existing App/hooks/transports.

Known risks and finite exits: proof refactor must pass baseline/canonical legacy/historical parity; result reuse must pass every identity/clear/race/per-view case; authoring classification must preserve original reports and distinguish structured content findings from technical errors; optional shape must pass old/new/malformed transport cases. Owners are the existing proof, authoring/reader and shared validation owners respectively. Exit is passing mapped renewed TP checks plus actual increment review; unresolved material drift returns to approved source owner. No architectural debt is accepted by documenting it.

Current parser stores one row per artefact type and manifest deduplicates paths. The new projection consumes actual resources only; it cannot invent extra registrations to satisfy a visible count or a synthetic multiple-resource case. The presentation supports distinguishable references whenever they exist in supplied actual resources; parser/registry policy is not changed. QA/UAT are shown only when actually registered; unsupported exact approval proof remains uncertainty.

Baseline preserves old seven-file dirty WIP and all selected approved UR/PRD/SD/TP, foreign control artefacts and source-revision archives. Staged state and untracked bytes are retained. Old BROWNFIELD_ANALYSIS.md stays historical; this separately named renewed analysis is linked through current control. No installation/configuration/Git/deployment operation is needed. Test package/runtime qualification uses disposable source fixtures, existing copied dependencies and generated assets, never local installed profile replacement.

## Knowledge And Context

- memory_target: scope_artifact
- memory_reason: exact preparation, MCP discovery candidates and qualification limits belong to this Run; existing architecture doc owns the durable descriptive contract update during implementation
- memory_refs: BROWNFIELD_ANALYSIS-02.md; MCP_CANDIDATES.md; docs/architecture/06-agdf-cockpit.md
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: no graph-node ownership/change is introduced; existing architecture document is reused

Preparation pass confirms safe ownership and a protected minimal implementation path only. It is not test success, native proof, QA, release readiness or transferable approval.
