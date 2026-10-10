# Brownfield Review: document state and truthful reading links

- mode: post_ur_review
- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- artefact: .agdf/control/artefacts/cockpit-documented-approvals-20261009-01/BROWNFIELD_REVIEW.md
- scope: Approved revised UR db2ce267; two-column document/state overview, canonical approved-version correspondence and applicable draft-check findings in existing reading surfaces.
- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: Replaces inline evidence disclosure with a document-reading action and introduces evidenced draft/check/approval states in the overview without changing human approval authority.
- ux_intent_definition_required: yes
- current_coverage: partially_done
- reuse_strategy: extend existing Core descriptive projection and presentation/read components; reuse approval proof, authoring checks, snapshot and navigation owners.
- transparency: Quick Task is ineligible because product state semantics and a consumed MCP/HTTP descriptive result change. Verified Change is ineligible because contract impact and existing dirty in-progress product files fail compact eligibility. Structured Slice is rejected because the returned version/state contract is consumed by model/App MCP and authenticated browser readers and requires explicit compatibility qualification.
- missing_evidence: Implementation, final output shape, negative/version/check tests, browser and native-host qualification are future SD/TP work; not asserted by this review.
- required_next_step: Complete required UX intent analysis, then derive the PRD from the approved revised UR.

## G-00 and scope binding

Target is the confirmed repository; selected Run cockpit-documented-approvals-20261009-01, approved UR revision 16 / 50246889-10c2-4f8d-8b1b-d304d2581255. Dispatcher doctor passes. UR digest sha256:db2ce267f9330751e0eb6c27027fba09b0be3e19889dff206423025b7e1a6495. Source revision operation 6cd14441-2dee-4d7f-aac5-e89ea6167506 archived previous approved sources; they are historical only. No implementation authority from this review. Seven old-design source/test changes remain retained work in progress and require reassessment after renewed TP. No repository instruction override is inferred from cwd or historical Run evidence.

## Existing owners and coverage

| Outcome | Existing owner and evidence | Coverage and bounded reuse |
|---|---|---|
| Registered documents and saved statuses | packages/core/lib/control-inspect/cockpit.js manifest/detail; persisted.artefacts and evaluation.approvals | Present. Resource.status means registered/blocked, not approved; preserve this meaning. |
| Exact approved source | packages/core/lib/control-state/artefact-binding-proof.js exactApprovedArtefacts/validateBindingProof; run-seal.js; approval-operations.js; presentations | Canonical proof already checks actual canonical and raw content against presentations/receipts/bindings. Current cockpit resources do not expose a per-document proof result. Extend descriptive reading through these owners rather than accepting prose/partial digests or reimplementing checks in App. |
| Supported draft checking | packages/core/lib/control-inspect/artifact-readiness.js projectArtifactReadiness; cockpit.js draftDescriptor/artifactReadiness | Existing read-only authoring check, currently supported UR/PRD/SD/TP and selected current gate only. Preserve this boundary; do not pretend all visible resources were checked. |
| Check identity and visible classification | cockpit.js and packages/control-ui/src/api.ts validDraftCheck; useDraftCheck.ts, DraftCheck.tsx | Snapshot, Run, revision, path and digest are already checked. Missing result is unchecked/unavailable. Preserve distinctions between content diagnostics and technical/gate blockers. Concrete applicable findings can be surfaced without a new validator. |
| Document reading and return | App.tsx, DocumentView.tsx, mcp/CompactCockpit.tsx | Current opaque-resource read, expansion, close/back and contextual focus path exist. Extend current document view instead of making a separate approval-document target. |
| Transport and consumer compatibility | core/control-inspect/cockpit-contract.js; mcp-server/src/server.js; control-ui/src/mcp/transport.ts, api.ts; server/service.mjs | Existing MCP model/App-visible run/document operations and authenticated HTTP reader share Core result. Added descriptive state must be qualified through both; old-reader absence remains explicit uncertainty. |
| Tests | core/test/cockpit-draft-check-test.js, artifact-readiness-test.js, control-cockpit-projection-test.js; MCP protocol/contract tests; UI unit/browser suites | Existing isolated fixture and native proof boundaries reusable. Old inline-design test results are superseded evidence, not revised-state fulfillment. |

## Architecture Impact

architecture_relevance: relevant

The affected boundary is the descriptive Core result consumed through existing model/App-visible MCP reads and the HTTP UI adapter. Explicit per-document approval/byte correspondence is currently absent. Check-result applicability must remain with Core/snapshot authority rather than a visual heuristic. No approval-policy, trust, filesystem-selector, writer, persistence or lifecycle boundary is authorized to change. SD must decide additive shape, old-server absence, malformed/foreign proof handling, document/check association and bounded resource use. Scope explicitly forbids new archive/validation authority.

## Reuse And Parallel-Structure Risk

| ID | Classification | Evidence / effect | Existing owner and next action |
|---|---|---|---|
| BF-001 | problem | A resource registration or saved approved flag alone does not certify the read bytes; cockpit.js manifest omits that explicit proof. | Core approval proof and cockpit projection owners; SD defines the descriptive proof path using existing checks. |
| BF-002 | problem | App-only matching or prose parsing would duplicate authority; DocumentView currently explains saved stand separately. | Core owns state; SD preserves presentation as a consumer of bounded facts. |
| BF-003 | problem | projectArtifactReadiness can return artifact_gate_not_ready with readiness_details before content checks; unsupported/current-gate limitations and transport errors cannot be called document defects. | Existing authoring-check and projection owners; SD handles exact diagnostics/applicability without inventing a second readiness implementation. |
| BF-004 | problem | Old inline disclosure files/tests are dirty retained work; repeating their successful checks does not verify the new two-column behaviour. | SD/TP assess replacement/reuse and meaningful revised-state cases; preserve protected baseline/history. |
| BF-005 | trade-off | Not all documents have an applicable check; deliberate current-gate authoring remains bounded and no bulk-checking workflow is added. | Owner: Core authoring-check and PRD document state. Rationale: retain actual checked identity and read-only limits. Mitigation: unchecked/unavailable labels, explicit current check only. Exit condition: renewed TP/QA proves no false passed/defective badge for untested resources. No undocumented technical debt accepted. |

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: External/public contract: new explicit per-document state/version facts change the returned descriptive contract of model/App-visible agdf_cockpit_read and shared browser reads; compatibility and absence semantics require coordinated consumer qualification.
- rejected_alternative: structured_slice; full_depth_impacts_absent cannot pass because the user requested an explicit canonical returned fact that current consumers lack. File/owner counts do not decide depth.
- missing_or_conflicting_facts: none for route selection; specific wire-shape and implementation choices belong to SD.
- depth_evidence_refs: approved UR; cockpit.js detail/manifest/artifactReadiness; cockpit-contract.js COCKPIT_READ_DEFINITION visibility model/app; mcp/transport.ts and api.ts validateData; server/service.mjs; artefact-binding-proof.js.

| Check ID | Result | Evidence |
|---|---|---|
| coherent_outcome | pass | One document overview/read outcome defined in approved UR. |
| authority_boundary | pass | Existing canonical approval/check owners unchanged; output is descriptive/non-authorizing. |
| owner_consumer_coordination | pass | Identified Core, MCP and UI/HTTP owners coordinated in same repository; no independent external rollout authorized. |
| full_depth_impacts_absent | fail | Externally consumed MCP descriptive state result requires additive contract/compatibility qualification. No persistence, approval-policy or new-host expansion. |
| migration_propagation_bounded | pass | Read-only derived fields, no control migration/archive or mass rewriting; old absence must remain safe. |
| failure_recovery_local | pass | Existing snapshot/freshness/retry/session boundaries and local source rollback; no writer. |
| independently_acceptable | pass | Two-column documented states and exact reading labels can be tested as a complete accepted outcome. |

## Risks and next owners

PRD must settle state precedence, what counted/listed records represent, old-server uncertainty and document-view feedback within approved intent. SD must settle source-proof reuse, version identity and descriptor/read association, check diagnostic interpretation, resource bounds and consumer compatibility. TP must map version changes, missing/malformed/foreign proofs, concrete authoring failure vs busy/unavailable, check/source invalidation, narrow/wide keyboard/focus and no-control-mutation to actual tests. No deferred product decision is silently moved to implementation.

## Knowledge and Context Graph

- memory_target: scope_artifact
- memory_reason: Run-specific ownership/compatibility evidence and user-directed MCP candidates; no new generic authority or global memory update.
- memory_refs: BROWNFIELD_REVIEW.md; MCP_CANDIDATES.md
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing read/approval authority is preserved; no graph ownership change claimed. Architecture documentation remains an existing documentation owner for any approved implementation update.
