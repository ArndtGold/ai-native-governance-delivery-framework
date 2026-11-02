# Brownfield Review: AGDF 0.20.0 revised Desktop matrix

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: release-0200-codex-claude-20261020-01
- related_ur: .agdf/control/artefacts/release-0200-codex-claude-20261020-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-22
- source_revision: b65c1a90-2c2e-44e3-b949-28a28f8491e9; resulting revision 52f2e573-5c5c-49a7-9182-b6920df82804

## Objective

Reassess the existing release preparation after the confirmed PRD-source revision. Retain the exact approved UR and one 0.20.0 release line. Codex Desktop and Claude Desktop are the manually checked release targets. Codex CLI Windows/Linux remains unqualified outside the revised mandatory matrix; Copilot/OpenCode remain experimental. This changes required scope, not the truth or assurance of earlier results.

The archived PRD/SD/TP and previous review describe the old matrix and have historical authority only. The exact source-revision archive is .agdf/control/runs/release-0200-codex-claude-20261020-01/revisions/b65c1a90-2c2e-44e3-b949-28a28f8491e9/manifest.json. Retained code and tests require renewed applicability assessment.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Existing guidance and generated compatibility/readiness labels change; no new interaction or approval authority is introduced.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Retained UR and explicit revised scope decision | UR.md; DESKTOP_HANDCHECKS_20261022.md; source revision receipt | high |
| Source of truth | plugins/agdf/meta/agdf-plugin.definition.json; existing schema/generator | hostSupport schema 1 still mandates Codex Linux/Windows CLI and Claude Windows CLI/Desktop | high |
| Runtime path | packages/cli; packages/core; packages/mcp-server | Existing installation, consent, ownership, MCP and governance owners retained | low |
| UI / UX | scripts/host-compatibility/contract.mjs and render.mjs; README.md; INSTALL.md | Generated reports remain derived projections of canonical support policy | low |
| Persistence / data | scripts/native-probes/lib/release-observation.mjs and release-handoff.mjs | Immutable candidate/bundle/tuple review and import; strict operator_observed Desktop records | medium |
| Tests / QA | scripts/native-probes/lib/release-policy.mjs; scripts/ci-plan.mjs | Five CLI cases and three Desktop cases; ordinary CI is not native qualification | high |
| Release / operations | .github/workflows/publish-agdf.yml; codex-release-e2e.yml | Publication currently requires codex-e2e then claude-evidence | high |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: Public support and mandatory publication eligibility change to Desktop targets with human observations. Candidate identity, assurance, policy derivation and publication remain coordinated through existing owners.
- architecture_evidence: hostSupport; release-policy.mjs; release-observation.mjs; release-handoff.mjs; publish-agdf.yml; host-compatibility/contract.mjs.
- architecture_missing_evidence: Desktop app/model/session/candidate identity and primary captures not supplied; original observations belong to the maintainer. These qualification limits do not prevent choosing delivery depth.
- architecture_next_owner_and_action: PRD defines acceptance and honest incomplete/manual states; SD assigns representation, policy migration, validators and publication projection to existing owners.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Old effective matrix conflicts with revised requested scope | Confirmed source revision; hostSupport still requires Codex Linux/Windows CLI | revise | Renew PRD/SD/TP, then propagate canonical definition/schema/generator through existing release consumers |
| problem: Reported Desktop passes lack exact execution identity | DESKTOP_HANDCHECKS_20261022.md confirms invocation, upgrade and recovery, with unknown tuple/candidate/captures | revise | PRD separates human-reported success from candidate-bound qualification; recover original identity first and prohibit invented facts |
| problem: Current strict Desktop validator cannot qualify an unbound report | release-observation.mjs requires tuple, session, loaded identity, operator assurance and primary references | revise | SD reuses this owner, retains strict qualified-record checks and makes incomplete reports visibly non-qualifying |
| problem: CLI/CI success could be overgeneralized | Separate Claude Windows CLI candidate 830d8b94; older dirty Codex macOS diagnostic evidence | revise | Preserve exact tuple/candidate and surface/OS boundaries in renewed criteria |
| problem: Old publication dependency would preserve the unavailable matrix | publish-agdf.yml codex-e2e then claude-evidence | revise | Replace only after renewed approvals and tested migration; retain ordinary CI coverage and timeouts |
| problem: Manual report edits could fork support policy | Existing definition plus generated compatibility contract/rendering | revise | Extend canonical owner and generated projections, never a second compatibility or approval authority |

These findings are obligations for the renewed sources, not accepted debt or check waivers. Review passes because ownership and safe routing are established; qualification remains incomplete.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: release_cross_host_depth: public release matrix and publication eligibility coordinate independent Desktop/CLI observations. Rejected alternative structured_slice cannot exclude public-contract and cross-host release effects. Quick/verified paths are ineligible for this policy and release change.
- evidence: This review; UR.md; PRD_SCOPE_REVISION_APPLY_RESULT_01.json; DESKTOP_HANDCHECKS_20261022.md; hostSupport; publication graph.
- transparency_note: Renew PRD, SD and TP at existing owners. UR remains exact. Revision confirmation approves no gate. Current preparation, implementation assessment, reviews and QA must precede UAT/OR.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: release_cross_host_depth
- decisive_full_depth_triggers: Public host-support contract and coordinated cross-host release/publication eligibility change.
- rejected_alternative: structured_slice; full_depth_impacts_absent fails because release and compatibility policy change; external observations prevent local-only qualification.
- missing_or_conflicting_facts: none decisive for depth. Unknown Desktop identity remains a qualification limit, never a default pass.
- depth_evidence_refs: DESKTOP_HANDCHECKS_20261022.md; PRD_SCOPE_REVISION_APPLY_RESULT_01.json; hostSupport; release-policy.mjs; release-observation.mjs; release-handoff.mjs; publish-agdf.yml.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One 0.20.0 candidate with Desktop target scope, bounded CLI evidence and explicit unqualified/experimental paths |
| authority_boundary | pass | Existing Core approval and canonical release owners retained; observation recording grants no approval |
| owner_consumer_coordination | fail | Qualification coordinates independent Desktop reports, Windows CLI observations and publication consumers |
| full_depth_impacts_absent | fail | Public support and mandatory release eligibility change |
| migration_propagation_bounded | pass | Existing definition/schema/generator, validators, report and workflow owners enumerate propagation |
| failure_recovery_local | fail | Original Desktop identity cannot be repaired by repository tests or local CLI success |
| independently_acceptable | fail | Overall closeout needs reviewed applicable host evidence and renewed current quality results |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Define mandatory Desktop scope and distinguish reported handchecks from candidate-bound qualification without filling unknown fields | PRD | revise |
| Represent incomplete human reports and revised policy through existing validators/projections while preserving qualified-record safeguards | SD | revise |
| Review/import Claude CLI evidence only for its actual tuple and applicable final candidate | TP | revise |
| Recover original Desktop environment/session/candidate evidence before requiring justified targeted follow-up | TP | warn |

The maintainer already selected the hosts and reported all three Desktop scenarios. Do not ask these decisions again. The answer "alle" supplies no concrete version/model/SHA. Missing identity does not mean the reported scenarios failed.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-specific scope/evidence reassessment; reusable knowledge is reassessed at closeout without automatically creating graph nodes.
- memory_target: scope_artifact
- memory_reason: Preserve human statements and qualification limits in the selected run.
- memory_refs: DESKTOP_HANDCHECKS_20261022.md; PRD_SCOPE_REVISION_APPLY_RESULT_01.json

## Next Permissible Step

- next_allowed_action: Record this review and structured_delivery route together, author a fresh PRD from retained UR and revised matrix, then present for a new deliberate Approval: PRD.
- forbidden_until_then: No implementation, host policy/workflow changes, qualification claims, publication, tags or VCS actions.

## Quality Outlook

- quality_outlook: Routing reassessment passes. Desktop handchecks remain documented human reports with unverified exact identity. Retained code/tests require assessment under renewed TP. Safety, ownership, candidate, unknown-state and approval checks remain binding.
