# Brownfield Review: Compact documented approvals

- mode: post_ur_review
- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: PRD
- scope: The approved UR's compact documented-approval overview and truthful current/approved document actions in the existing read-only Cockpit.
- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The overview changes the visible approval state from a generic approved label to documented evidence and explicitly distinguishes the document version action. Reading, disclosure and current-control authority remain unchanged.
- ux_intent_definition_required: yes
- current_coverage: partially_done; recorded approvals, original evidence, names, registered resource reading, disabled/freshness guards and focus restoration exist. Compact comparable rows and explicit current-version wording are missing.
- reuse_strategy: extend existing presentation and styles; reuse registered resource readers and canonical descriptive approval data. No archive, approval writer or parallel evaluator.
- architecture_relevance: architecture-not-applicable
- architecture_reason: This bounded presentation can fulfil the UR with existing gate/status/evidence and registered resources. Existing readers do not expose a validated exact-approved-version action; use the approved current-version fallback. No new protocol, public DTO, persistence, permission or host boundary is required. An implementation proposal to extend such a boundary requires fresh routing before proceeding.
- evidence: packages/control-ui/src/WorkStep.tsx; packages/control-ui/src/types.ts; packages/control-ui/src/api.ts; packages/control-ui/src/style.css; packages/core/lib/control-inspect/cockpit.js; packages/core/lib/control-state/run-recording.js; packages/core/lib/control-state/run-presentation.js; packages/core/lib/control-read/snapshot.js; docs/architecture/06-agdf-cockpit.md.
- missing_evidence: No existing Cockpit DTO certifies that a registered resource is the exact approval-bound version. This is the UR's explicit supported fallback, not an implementation prerequisite for an archive. Fresh rendered behaviour is still future implementation evidence; no host claim is made.
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- memory_target: scope_artifact
- memory_reason: This review records run-specific reuse and version-reading limitations; it changes no reusable architecture ownership.
- memory_refs: This BROWNFIELD_REVIEW.md and the approved UR.
- required_next_step: Prepare the required UX intent analysis, then draft the smallest PRD for the bounded outcome and present it for a new deliberate approval.

## Existing Owners And Source Facts

WorkStep.tsx owns the documented approval presentation. It filters evaluation.approvals by approved status and opens resources registered for the same gate through the existing onOpen callback and approval focus identifier. documentName in presentation.ts supplies human labels; style.css supplies layout. Existing WorkStep/component and journeys browser tests cover disabled source actions, disclosure, navigation and focus restoration. RunDetail and App retain selection/navigation and freshness ownership.

Core cockpit.js projects canonical approval rows as gate/status/evidence and manifests current registered artefacts. readDocument returns the current captured bytes and their digest through the selected Run/resource/snapshot. It does not expose an historical approved-version selector or a verified join between the recorded approval and those bytes. run-recording.js saves approval evidence including the then-current revision, partial artefact digest and presentation reference. run-presentation.js validates full bound presentation records for approval operations; the UI DTO does not expose that operation's binding as a readable approved-version resource. The snapshot reader captures only requested bounded dependencies and freezes/revalidates them. Raw evidence text or file-path equality cannot serve as independent version certification.

Consequently the currently supported action is labelled Aktuelle Fassung ansehen. The disclosure retains original evidence, describing unsupported fields as unavailable rather than extracting identity or version authority from prose. If later existing canonical proof becomes available, only its verified matching readable resource can receive Freigegebene Fassung ansehen; inventing new storage or proof is excluded from this slice.

## Reuse And Parallel-Structure Risk

| Finding | Classification | Evidence and treatment | Owner | Exit condition |
|---|---|---|---|---|
| Current file mistaken for approved version | problem | WorkStep resource action and Core manifest open a current registered path; label it current and explain the unconfirmed approved version. | Existing Cockpit presentation owner | Meaningful changed/missing-source cases prove truthful wording and guarded reading. |
| Prose promoted to signature or identity | problem | Approval evidence is stored text; preserve it as original evidence and mark absent structured identity/version fields explicitly. | Existing Core approval owner / Cockpit presentation | No inferred verified identity, approval action or evaluator is introduced. |
| Historical archive recreated in UI | problem | No existing approved-version read selector in the current DTO; use the UR's accepted fallback. | Existing read-service owner | No archive, selector or persistent parallel store added. |
| Narrow layout and focus regressions | problem | Existing details, resource action and focus identifiers must survive the compact rows. | Existing UI owner | Wide/narrow visible and keyboard checks preserve actions, focus and disabled/stale handling. |

No debt-accepting trade-off is proposed; missing historical proof remains an explicit product limitation accepted by the UR.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: bounded_structured_slice
- decisive_full_depth_triggers: none
- rejected_alternative: quick_task and verified_change; this changes approval-evidence/version presentation semantics and needs observable acceptance across responsive reading states. Verified Change also cannot certify clean candidate paths: WorkStep.tsx, style.css and related tests already contain protected preceding-scope work. structured_delivery is disproportionate because there is no external contract, archive, migration, rollout or authority change.
- missing_or_conflicting_facts: none decisive for this bounded current-version-fallback scope
- depth_evidence_refs: approved UR; owners and source facts above; current worktree status; packages/control-ui/test/work-step.test.tsx; packages/control-ui/test/browser/journeys.spec.mjs.

| Check ID | Result | Evidence |
|---|---|---|
| coherent_outcome | pass | One compact documented-approval overview with truthful document actions; UR acceptance signals 1–6. |
| authority_boundary | pass | Existing Core approval/evaluation and scoped readers remain authoritative; disclosure only reads. |
| owner_consumer_coordination | pass | Existing local Cockpit components/read DTO suffice; no external consumer coordination or shared cutover. |
| full_depth_impacts_absent | pass | Existing DTO current-version fallback fulfils the UR; no protocol, CLI, persistent schema, gate, security or cross-host/release behaviour changes. |
| migration_propagation_bounded | pass | No migration; existing UI build and tests are sufficient. The source increment can be locally reverted without changing approved control records. |
| failure_recovery_local | pass | Existing selected Run/resource/snapshot, disabled/stale controls and document open/close/retry remain the recovery owners. |
| independently_acceptable | pass | Compact rows, disclosure and truthful current-only/missing actions have independent observable acceptance; no future archive or installer work is a prerequisite. |

## Transparency And Limits

Structured Slice retains the existing PRD/SD/TP/QA/UAT sequence with depth limited to this coherent outcome. It does not transfer preceding Run approvals. Preserve existing dirty files, the earlier backlog QA and foreign findings; establish the scoped implementation baseline after TP. No implementation, plugin installation, Git action or native-host success has occurred in this review.
