# Brownfield Review: Solution Design authoring separation

Date: 2026-10-04
Run: sd-definition-separation-20261004-01
Approved input: UR.md
Baseline: 9df2e7af3c4890a05d59361285b2a4effd7bd97c

## Review Result

- mode: post_ur_review
- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- scope: Separate semantic Solution Design drafting/clarification from gate-check, preserving
  existing recording, traceability, control and deliberate approval ownership.
- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: A named authoring assignment changes skill discovery and professional
  handoff visibility. The existing user intent (prepare an SD), working stage, approved-source
  authority, approval action, blockers and recovery boundaries are preserved. No graphical UI
  or new user decision mode is requested; the bounded interaction semantics are unambiguous.
- ux_intent_definition_required: no
- ux_intent_definition: not_applicable; directly specify the low-impact assignment and existing
  state/approval semantics in PRD.
- current_coverage: partially_done
- reuse_strategy: Extend the canonical skill catalog and existing evaluated authoring handoff;
  reuse the shared contained-file/source proof and artifact recording owners. Add only the focused
  semantic SD responsibility, not another writer or control service.
- missing_evidence: Candidate routing, drafting, revision and regression evidence do not exist
  yet; they belong to the subsequent approved design and Task Plan. Fresh native-host behavior
  is not established by source or protocol evidence.
- required_next_step: Draft the PRD from the approved UR and this analysis through prd-definition.

This pass describes adequate existing-system evidence for routing. It is not implementation,
QA, host-UAT, release or Git authorization.

## Existing Owners And Coverage

| Existing owner | Evidence | Coverage and reuse |
|---|---|---|
| Professional skill catalog and projections | plugins/agdf/meta/agdf-plugin.definition.json, skillSet and runtimeContract | UR/PRD have named judgement skills and focused contracts; reuse this registration and generated projection ownership for SD. |
| Read-only prerequisites and readiness | packages/core/lib/control-evaluation/gate-check.js, requiredGateArtifactPreparation and SD plan | SD still emits prepare_gate_artifact with gate-check. Preserve prerequisite/approval evaluation while routing eligible content work to the named author. |
| Evaluated authoring handoff | packages/core/lib/skill-dispatch/service.js and prd-definition.js | PRD already supplies contained exact sources and a run/revision-bound authoring phase; reuse its ownership split without copying PRD product policy into SD. |
| Semantic SD drafting | plugins/agdf/meta/contracts/gate-artifact-preparation.md, Gate-Specific Work / SD | Current design instructions remain in the control route. Move their semantic ownership into one focused contract; retain the shared recording procedure. |
| Criteria chain readiness | packages/core/lib/control-evaluation/traceability-readiness.js, evaluateSdTraceability and evaluateTpTraceability | Preserve unique PRD criteria, design decision mappings, compatibility/risk evidence and downstream TP coverage. |
| Canonical artifact recording and proof | packages/core/lib/control-state/run-artefact-recording.js, artefact-bindings.js and artefact-binding-proof.js | Reuse the typed SD-derived_from-PRD recording, sealed review mapping, revision and contained-file checks. No additional artifact store or writer is justified. |
| Revision-bound human approval | packages/core/lib/control-state/run-presentation.js and approval-command.js | Reuse fresh presentation/deliberate reply handling. An authoring assignment never approves a design. |
| Existing regression seam | packages/cli/scripts/prd-definition-test.js and fixtures/prd-definition.js | Existing packaged tests exercise drafting, clarification, protected sources and revisions. Their explicit assertion that SD stays on the generic route must be updated only after the new SD behavior is approved and implemented. |
| Host/API contract consumers | packages/core/lib/skill-dispatch/contract.js, resources/contracts.js and packages/mcp-server/src | Skill identities, returned continuation and focused contract delivery are consumed through shared CLI/MCP and host projections; preserve parity and existing limits. |

## Architecture Impact And Reuse/Parallel-Structure Risks

Architecture is relevant: the change moves semantic ownership and changes the externally consumed
authoring handoff. It does not introduce a new governance decision authority or persistence model.

| Finding | Classification | Boundary and evidence | Existing owner / next action |
|---|---|---|---|
| BF-SD-01 | problem | SD creation remains inside gate-check preparation; the current contract and SD plan above establish overlapping professional/control ownership. | The SD for this run must define the focused authoring responsibility and exact return to gate-check. |
| BF-SD-02 | problem | Duplicating recording, criteria policy or approval logic would create competing owners; the shared artifact writer and traceability evaluator already exist. | The run's SD must reuse these owners; TP must verify their preservation. |
| BF-SD-03 | unresolved | New-draft, clarification and explicit unapproved-revision eligibility need an SD-specific evaluated handoff. PRD's existing phase is a reusable seam, not SD policy. | Resolve handoff shape and revision intent in this run's SD before TP. No new gate or silent overwrite is permitted. |
| BF-SD-04 | problem | Catalog/contract additions propagate into CLI/MCP, supported hosts and instruction/payload/integrity checks. | The run's SD and TP must identify canonical/derived updates and exact package/protocol/regression evidence without weakening ceilings. |

BF-SD-03 is an expected design-stage question, not missing evidence about the requested scope or
the decisive public-contract impact. No knowingly retained or added debt is accepted here.
Unrelated text-based implementation routing, TP authoring, UAT and release naming remain owned
by their separate work; this review does not expand the approved UR.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: External/public contract: a new registered professional skill
  and its evaluated CLI/MCP continuation replace the SD preparation handoff consumed by agents
  and generated host skills. Existing source/approval and downstream TP behavior must remain
  compatibility-sensitive; this requires explicit contract and regression treatment.
- rejected_alternative: structured_slice; full_depth_impacts_absent fails for the evidenced
  public authoring/continuation contract effect. The decision is not based on file/owner counts.
- missing_or_conflicting_facts: none for routing. Specific handoff, naming and revision mechanics
  remain bounded, owner-assigned SD decisions.
- depth_evidence_refs: UR.md; the catalog, gate evaluator, dispatcher and artifact/traceability
  owners listed above; plugins/agdf/meta/contracts/modes.md (sole depth-policy owner).

| Check ID | Result | Evidence |
|---|---|---|
| coherent_outcome | pass | Approved UR: one independently observable separation of SD semantic drafting from control. |
| authority_boundary | pass | Gate-check, canonical writers and deliberate human approvals retain existing authority; the author only drafts. |
| owner_consumer_coordination | pass | Catalog, Core, CLI/MCP and host projections have existing owners; the change needs no external data cutover. |
| full_depth_impacts_absent | fail | The catalog and returned authoring continuation are public host/CLI/MCP-facing integration contracts; absence of full-depth impact cannot be asserted. |
| migration_propagation_bounded | pass | Use existing generated projections and packaging; approved UR excludes run migration, automatic installation and publication. |
| failure_recovery_local | pass | Existing writers, revision rejection and fresh presentation provide local failure/retry boundaries; no irreversible data transition is requested. |
| independently_acceptable | pass | Approved UR acceptance signals cover this SD responsibility independently; CI and subsequent TP-authoring separation are not delivery prerequisites. |

Quick Task is ineligible because this adds a named professional authoring capability and changes
the consumed handoff contract. Verified Change is ineligible because it excludes architecture,
public CLI and contract effects. The structured route retains the existing gate sequence while
keeping artifact depth focused on the affected boundaries.

## Scope Isolation And Evidence Limits

The workspace has independently prepared CI files, compatibility evidence and verifier changes.
They remain outside this run. Existing UR/PRD separation runs retain their own approvals and open
QA/UAT state. Branch naming and working-copy overlap do not confer scope or approval.

The known source and packaged-runtime patterns establish reuse, not correctness of an unbuilt SD
capability. Implementation-preparation Brownfield Analysis is required after approved TP. Any newly
discovered scope growth must return through the existing earliest affected owner and gate.

## Knowledge Persistence And Context Graph

- memory_target: scope_artifact
- memory_reason: These ownership findings and the depth rationale support this specific separation;
  the focused normative contract will own reusable rules after implementation.
- memory_refs: BROWNFIELD_REVIEW.md; UR.md
- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: No reusable graph node is claimed or created by this routing review.
