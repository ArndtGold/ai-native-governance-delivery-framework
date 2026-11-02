# Brownfield Review: Clear backlog status and reliable update flow

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: backlog-status-flow-clarity-20261009-01
- related_ur: .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/UR.md
- current_gate: Brownfield Review
- reviewer: agent; source review, no independent review claim
- reviewed_at: 2026-10-09
- reviewed_revision: 5efa537b-74c9-462f-b514-ce366022b972
- review_decision: pass
- missing_evidence: none for routing; implementation, new transition tests and current native display proof are not claimed.

## Objective

Size the approved outcome: first make the saved backlog intelligible and reliably maintained, then project the same meaning through Core and both Cockpit surfaces. Preserve canonical control/QA/human authority. Existing wording and scrolling changes in the working tree are baseline context, not implementation under this Run.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The bounded undertaking list gains materially clearer visible work, blocker/evidence and approval states and next actions; this changes interpretation of effective state across its existing compact/expanded presentations, without creating an approving action or another capability.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready

The required analytical input is recorded in UX_INTENT_DEFINITION.md with decision ready. It adds no user gate or approval authority. Existing-system and depth facts below are sufficient for the structured route.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; gate-transition/quality contracts | UR acceptance 1–7; qa-gate remains sole quality decision owner | medium |
| Source of truth | Run state, recorded artefacts, bound approvals; MASTER_BACKLOG is a saved pointer | .agdf/control/SOT_REGISTRY.md; run-state.js; run-recording.js | medium |
| Runtime path | Core policy, dependent writers and transaction recovery | run-step-policy.js; gate-check.js; run-backlog.js; run-backlog-writer.js; run-step-transaction.js | medium |
| UI / UX | Core list projection, BacklogRow, Overview and CompactCockpit | cockpit-backlog.js; cockpit-list.js; packages/control-ui/src/BacklogRows.tsx | medium |
| Persistence / data | Compact seven-column and legacy thirteen-column saved tables | Exact layouts in run-backlog.js; preparatory insert/closeout path in run-steps.js | medium |
| Tests / QA | Existing transition, recovery, projection and browser coverage | packages/core/test/run-backlog-writer-test.js; run-step-transaction-test.js; cockpit-list-test.js; packages/control-ui/test/browser/backlog.spec.mjs | medium |
| Release / operations | Existing packaging/host adapters | packages/mcp-server/src/server.js; control-ui/server; docs/architecture/06-agdf-cockpit.md | low; local source/protocol/browser evidence differs from native installed proof |

Coverage is partially_done: safe saved-row reads and substantial dependent-write/recovery primitives already exist. Concrete QA-open-work summaries and their persisted evidence/revision correspondence are not demonstrated. Reuse strategy: extend the existing Core summary/writer/read owners; do not create another evaluator or storage service.

## Observed Architecture And Flow

1. Control operations enter the existing Core writers. run-approve uses run-recording.js and the presentation/revision-bound approval validation. run-update either records changed Run/evidence content or, for a valid unchanged seal, explicitly synchronizes the associated backlog pointer. run-step records UR, route, review, evidence, artefact and supported closeout operations.
2. policyForRunContent parses the candidate Run and calls transitionDecisionForRunState. It returns status, current_gate, missing_approval, next_allowed_action and forbidden. It does not expose QA report availability, normalized findings or a report-derived concrete action.
3. run-backlog.js maps that policy to stored status and the last table column. QA/UAT with a missing exact approval become Awaiting QA/UAT; other open QA states fall through to In Progress. Therefore report availability and revise evidence work disappear from the saved label.
4. gate-check.js additionally applies doctor, effective Run-specific next actions, report readiness and evaluateQaFollowUp. The latter validates registered QA/review paths, decision agreement and normalized finding routes; it distinguishes evidence, implementation, upstream and blocked follow-up. Its validated findings include exact action and source path. This evidence owner already exists, but the simpler saved-summary path does not consume equivalent meaning. Reuse must avoid calling the full gate-check/doctor recursively from a writer or granting readiness from report prose.
5. run-backlog-writer.js locks Run then shared Backlog, checks pending operations and stale revision/content. When both change, run-step-transaction.js journals dependent changes; the sealed Run revision is the commit point. Recovery completes committed backlog writes or rolls back pre-commit work; foreign conflicts are not silently overwritten. A valid unchanged Run's explicit pointer repair uses an atomic backlog write without a fabricated Run revision.
6. run-steps.js also contains an insert/link/closeout table path, using the shared status mapping but separate row construction. It creates compact active entries, maintains links and supports explicit compact closeout placement. Legacy rows preserve title/link columns and do not silently migrate or archive. This second construction path must consume the same summary meaning as run-backlog.js.
7. projectCockpitBacklog reads only MASTER_BACKLOG, with bounded bytes, digest, section/count and malformed/duplicate diagnostics. It deliberately does not follow Run/report links or evaluate gates. projectCockpitList supplies membership/order/search/identity from stored fields. Title observations are separate and cannot determine classification.
8. Existing immutable control-read snapshots and opaque selectors feed local HTTP and MCP mediation. BacklogRow renders stored_status and stored_next_step, clearly labelled saved. Compact mode currently puts next step in details; expanded mode shows it. Opening the Run invokes current bound reading/evaluation. Neither mediation nor React may acquire summary or approval authority.

This trace establishes ownership from source, not runtime success of new behavior. It answers the ownership/dependency question without another diagram. Documentation at docs/architecture/06-agdf-cockpit.md:147–184 agrees with saved-only reading and the current write/recovery boundaries; it does not prove precision or complete trigger coverage.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: Saved status meaning and source/evidence correspondence change across the existing persisted file and read projections. The missing common refinement between transition policy and QA-follow-up must be resolved within Core. Writer/reader authority, compatibility and recovery are directly affected.
- architecture_evidence: run-backlog.js; run-step-policy.js; gate-check.js:387–398; qa-follow-up.js; run-steps.js; run-backlog-writer.js; run-step-transaction.js; cockpit-backlog.js; BacklogRows.tsx; SOT_REGISTRY.md.
- architecture_missing_evidence: none for route selection. Exact representation, provenance binding and operation coverage are explicit SD obligations after PRD decisions, not evidence of an absent owner.
- architecture_next_owner_and_action: prd-definition resolves saved-summary product meaning and compatibility promise; sd-definition maps that promise to existing Core evaluation/writer/read owners and their failure boundaries before TP.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem BF-01: QA follow-up meaning is lost at saved mapping boundary | run-backlog.js falls through to In Progress; policyForRunContent lacks finding data; gate-check/qa-follow-up contain valid specific evidence routes | revise | PRD defines distinctions; SD reuses the existing authoritative refinement with a writer-safe bounded path. Test report absent/revise/block/pass and concrete obligations. |
| problem BF-02: policy next action and valid Run-specific next action are separate levels of detail | run-backlog consumes plain policy action; gate-check uses effectiveNextAllowedAction and QA refinement | revise | SD determines precedence/validation once in Core; tests preserve legitimate specific work and prohibit unrelated/unsafe actions. |
| problem BF-03: summary propagation spans two existing row-construction paths | run-backlog.js prepares existing active row; run-steps.js prepares insertion/link/closeout | revise | SD makes both consume identical meaning while retaining layout/link/section responsibilities; transition matrix exercises each operation. |
| trade-off BF-04: control success can coexist with unusable saved pointer | prepareRunBacklogOrSkip; backlogSkip; run-recording result; doctor diagnoses backlog | warn | Preserve control independence and expose skipped outcome/source limitation through existing diagnostics. See bounded trade-off below. |
| problem BF-05: list observation cannot prove current Run/report freshness | cockpit-backlog is deliberately saved-only; immutable capture supplies file digest, not Run revision verification | revise | PRD distinguishes saved unverified vs synchronized bound observation; SD chooses compatible provenance and explicit selected comparison without list-wide scans. |
| problem BF-06: UI-side status inference would create competing policy | BacklogRow/CompactCockpit consume saved fields; cockpit-list search uses stored text | revise | Extend presentation of Core-owned meaning only; preserve query/membership and delayed title/scroll stability checks. |

### Retained Debt Detail

- finding: trade-off BF-04: control success can coexist with unusable saved pointer
- rationale: A presentation-oriented saved pointer must not invalidate an otherwise legitimate exact approval/control operation solely because its table is unavailable, unsupported or ambiguous. Existing writers already provide the explicit skip reason.
- accountable_owner: Existing Core dependent-write owner in run-backlog-writer.js; Arndt Gold is accountable for approved product compatibility intent.
- mitigation: Preserve reason-bearing results, no silent repair/read write, actionable limitation and explicit scoped synchronization; SD enumerates strict versus skippable operations and tests prove zero false-success and no foreign mutation.
- review_date_or_exit_condition: Before SD approval every applicable writer/read outcome is assigned a visible diagnostic/recovery; before QA pass each chosen scenario is evidenced. If these obligations cannot be satisfied, revise SD/TP rather than accepting invisible drift.

No additional deliberate debt is accepted. BF-01/02/03/05/06 are existing problems to resolve, with named product/design owners, not pending approval of newly introduced parallel structures.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: persistence_migration_depth: approved scope changes persisted backlog status meaning and requires a compatibility/source-binding strategy for old and new observations; external_contract_depth also applies to the canonical Markdown file consumed outside React. Reject structured_slice because absence of full-depth persistence/file-contract effects cannot be evidenced. This is a concrete meaning/compatibility effect, not a file/owner count.
- evidence: This review's Observed Architecture And Flow, BF-01–06, Structured Depth Evidence; approved UR scope and acceptance 1–7.
- transparency_note: Quick/Compact is ineligible because new summary semantics and persistence compatibility are required; Verified Change excludes persistence/architecture/public contract impact and candidate UI paths are already dirty. Same UR/PRD/SD/TP/QA/UAT sequence; deeper compatibility/flow evidence is required, no new gate. Preparation Brownfield Analysis after approved TP is required.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: persistence_migration_depth
- decisive_full_depth_triggers: Persistence/data meaning (saved statuses and evidence-bound update behavior); external/public file contract (MASTER_BACKLOG compact/legacy fields and their documented consumers).
- rejected_alternative: structured_slice: full_depth_impacts_absent fails due to those evidenced effects; compact paths excluded above.
- missing_or_conflicting_facts: none decisive for route; design alternatives remain for PRD/SD, not silently preselected implementation.
- depth_evidence_refs: UR.md acceptance 1–7; run-backlog.js layout and status mapping; run-steps.js row construction; cockpit-backlog.js saved DTO; docs/architecture/06-agdf-cockpit.md saved and legacy contracts; run-backlog-writer-test.js.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One saved backlog summary explains actual open work consistently across existing surfaces; UR has independent acceptance 1–7. |
| authority_boundary | pass | Run/registered evidence, existing Core policy and exact human gates retain authority; UR excludes competing policy/store. |
| owner_consumer_coordination | pass | Known Core write/read and HTTP/MCP/UI consumers; no unknown owner is required to draft PRD. Compatibility must be designed, not bypassed. |
| full_depth_impacts_absent | fail | Persisted status meaning and compatibility-sensitive Markdown contract change are material; backward interpretation/source binding is required. |
| migration_propagation_bounded | pass | Approved scope confines updates to explicit canonical operations/selected pointer recovery, preserves unrelated entries and section placement; both existing layouts have identifiable writer owners. Exact migration plan is SD work. |
| failure_recovery_local | pass | Existing Run/Backlog locks, journal, stale checks and explicit skipped-pointer outcomes are reusable; no new execution/recovery service is requested. |
| independently_acceptable | pass | State/transition/failed-write/readability signals in UR stand independently; QF-001 closure in another Run is expressly excluded. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which precise saved state/open-work/approval/freshness terms and compact visible content make the approved distinction understandable? | PRD | revise |
| What backward interpretation is promised for existing compact/legacy and unlinked entries; which changes are explicit rather than automatic? | PRD | revise |
| Which registered evidence and next-action precedence can the canonical writer safely reuse, and how are revision/digests captured without another source of truth? | SD | revise |
| Which applicable writer paths synchronize, skip, reject or recover, including reports and closeout; what is the consistency commit point? | SD | revise |
| Which observable scenarios and narrow/wide/native claims require which evidence? | TP | revise |

These are solution/product choices within complete user intent. The PRD owner can resolve product defaults consistent with UR; no new human clarification is currently necessary.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-specific source trace and routing are persisted here; no graph ownership change or curated reusable graph node is claimed.
- memory_target: scope_artifact
- memory_reason: This review binds observed code gaps and route to this approved Run; later design/docs own durable delivered semantics.
- memory_refs: .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: Record this review and structured_delivery route together, produce required UX Intent Definition, then draft the PRD and obtain a new deliberate Approval: PRD.
- forbidden_until_then: SD/TP authoring before respective upstream approval, implementation, QA approval, another Run's finding closure, automatic release/archive or VCS work.

## Quality Outlook

- quality_outlook: Existing ownership/recovery structure is reusable. Concrete saved semantics and source-binding remain product/design work; no implementation/test/native success is claimed by this source review.
