# Brownfield Review: AGDF 0.20.0 CLI-qualified release matrix

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: release-0200-codex-claude-20261020-01
- related_ur: .agdf/control/artefacts/release-0200-codex-claude-20261020-01/UR.md
- current_gate: Brownfield Review
- reviewer: Claude (Claude Desktop Code, Windows)
- reviewed_at: 2026-10-23
- source_revision: 077ecefa-98b4-47cc-92cd-ae653fcd092b; resulting revision b50844d7-8c02-4106-bb1c-c1ec0c924dae

## Objective

Reassess the release preparation after the confirmed PRD-source revision of 2026-10-23. The six mandatory candidate-bound Desktop records proved infeasible: the Windows test computer has only the daily Claude Desktop profile and no host-supported isolated Desktop scope, and Codex Desktop is not installed there. QA for candidate aa3e4b02 therefore stayed revise without an executable evidence path.

The revision's intended change made Claude Code CLI on Windows the only mandatory qualified target and left Codex without a mandatory row. This review found that this conflicts with the exact approved UR, which requires that both intended qualified hosts, Codex and Claude Code, have mandatory candidate-bound evidence before publication and that mandatory release validation checks Codex and Claude Code evidence. The maintainer resolved the conflict on 2026-10-23 without changing the UR: the mandatory qualified matrix is Claude Code CLI on Windows and Codex CLI on macOS, each with the five cases dispatch, controlled invalid input, skill continuation, upgrade from the released 0.14.5 baseline and bounded owned-stale recovery, each including installation, discovery and clean removal, on the final candidate. The Codex runs execute on the maintainer's Mac.

Codex Desktop and Claude Desktop are released as manually checked (human_reported) surfaces without machine qualification; the schema-3 Desktop tooling stays available but does not gate publication. Codex CLI on Windows and Linux stays unqualified; Copilot and OpenCode stay experimental. No CLI evidence qualifies a Desktop surface. The archived PRD/SD/TP and previous review have historical authority only (archive .agdf/control/runs/release-0200-codex-claude-20261020-01/revisions/077ecefa-98b4-47cc-92cd-ae653fcd092b/manifest.json). Retained code and tests require renewed applicability assessment.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Existing guidance and generated compatibility/readiness labels change between qualified, manually checked, unqualified and experimental; no new interaction or approval authority is introduced.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Retained UR; revision receipt 077ecefa; maintainer decision of 2026-10-23 | UR.md scope and acceptance signals; PRD_SCOPE_REVISION_PROPOSAL_20261023_01.json; PRD_SCOPE_REVISION_PREVIEW_20261023_01.json | high |
| Source of truth | plugins/agdf/meta/agdf-plugin.definition.json hostSupport | schema_version 2 with required_targets for Codex and Claude Desktop only; optional_cli pins Codex 0.157.1 and gpt-6-luna for linux and win32; Claude CLI win32 optional; no macOS Codex row | high |
| Policy owner | scripts/native-probes/lib/release-policy.mjs | Asserts DESKTOP_TARGETS for schema 2; CLI_CASES already defines the five CLI cases; the schema-1 branch already maps mandatory CLI rows | high |
| Native harness | scripts/native-probes/claude-host-e2e.mjs; scripts/native-probes/codex-host-e2e.mjs | Both take --candidate, --scenario and --tuple and emit release records; Codex records process.platform and ran on darwin/x64 with Codex CLI 0.163.0 and gpt-6-luna on 2026-10-21 (dirty diagnostic only) | medium |
| Persistence / data | scripts/native-probes/lib/release-observation.mjs; release-handoff.mjs | Immutable candidate, bundle, tuple review and scoped import; strict CLI and schema-3 Desktop records | medium |
| Release / operations | .github/workflows/publish-agdf.yml; .github/workflows/codex-release-e2e.yml | Publication requires the desktop-evidence job (validate --all-hosts); the Codex E2E workflow runs only Linux and Windows runners | high |
| UI / UX | scripts/host-compatibility/contract.mjs and render.mjs; README.md; INSTALL.md; docs/maintenance/release-0.20.0.md | Reports are derived projections of hostSupport with reported_sources for human reports | low |
| Tests / QA | test:release-qualification; release-workflow-contract-test; ci-plan-test | Current tests assert the Desktop matrix and the publish dependency; ordinary CI is not native qualification | high |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: Public support statements and mandatory publication eligibility change from two Desktop targets to Claude CLI Windows and Codex CLI macOS. Candidate identity, assurance, policy derivation and publication stay coordinated through the existing owners.
- architecture_evidence: hostSupport; release-policy.mjs; release-observation.mjs; release-handoff.mjs; claude-host-e2e.mjs; codex-host-e2e.mjs; publish-agdf.yml; codex-release-e2e.yml; host-compatibility/contract.mjs.
- architecture_missing_evidence: Exact Codex CLI macOS tuple for the final candidate (client version, model, architecture, Node) is not frozen; the policy pin 0.157.1 differs from the 0.163.0 last observed on the Mac. Native execution environments are maintainer-operated. These are qualification facts, not depth facts.
- architecture_next_owner_and_action: PRD defines the mandatory CLI matrix and the manually checked Desktop state; SD assigns the policy migration, tuple pinning, validator, publication and report projections to existing owners.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Effective policy still gates publication on two infeasible Desktop targets | hostSupport schema 2 required_targets; publish-agdf.yml desktop-evidence job; QA_REPORT.md revise | revise | Renew PRD/SD/TP, then migrate hostSupport, release-policy.mjs and the publication job through their existing owners with tests before any eligibility change |
| problem: Codex CLI macOS is not representable in the current policy | optional_cli.codex platforms linux and win32 only; unqualified lists linux and win32 | revise | SD adds a mandatory Codex macOS CLI row in the canonical definition and policy owner; no OS wildcard and no reuse of the Linux/Windows pin |
| problem: Codex tuple pin differs from the client last observed on the Mac | Pin 0.157.1 versus observed Codex CLI 0.163.0 (evidence/CODEX_BLOCKER_REPAIR_20261021) | revise | PRD/SD require the exact tuple to be captured by preflight and frozen before execution; TP binds it to the final candidate |
| problem: Earlier CLI results could be relabelled as qualification | Claude CLI records for 830d8b94; dirty macOS Codex diagnostics | revise | Require fresh records for the final candidate; retain old records with original provenance as historical or diagnostic |
| problem: Strict Desktop tooling could become a second, non-gating eligibility path | release-observation.mjs schema-3 records; validate --all-hosts | revise | Keep one validate path; Desktop records become optional and non-gating through the same owner, never a parallel validator or decision authority |
| problem: Linux/Windows Codex E2E results could be miscounted as qualification | codex-release-e2e.yml matrix linux and win32; unqualified rows in hostSupport | revise | SD defines its role as diagnostic regression coverage outside eligibility, or its explicit removal from the release path; never counted as qualification |
| problem: Native runs depend on maintainer-operated environments | Claude CLI harness completed on Windows only when started outside the Desktop app package (2026-10-21); Codex macOS runs need the maintainer's Mac | revise | TP prepares a reproducible handoff per host and keeps each row open until reviewed records are imported |

These findings are obligations for the renewed sources, not accepted debt or check waivers. The review passes because ownership and safe routing are established; qualification remains open.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: release_cross_host_depth: the public host-support contract and mandatory publication eligibility change across two hosts, two operating systems and independently executed native observations. Rejected alternative structured_slice cannot exclude public-contract and cross-host release effects. Quick and verified paths are ineligible for this policy and release change.
- evidence: This review; UR.md; PRD_SCOPE_REVISION_PREVIEW_20261023_01.json; revision manifest 077ecefa; hostSupport; release-policy.mjs; publish-agdf.yml.
- transparency_note: Renew PRD, SD and TP at the existing owners. The UR stays exact. The revision confirmation approves no gate. Preparation, implementation, a new candidate, the ten native records, reviews and QA must precede UAT and OR.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: release_cross_host_depth
- decisive_full_depth_triggers: Public host-support contract and coordinated cross-host release and publication eligibility change.
- rejected_alternative: structured_slice; full_depth_impacts_absent fails because release and compatibility policy change; external native observations prevent local-only qualification.
- missing_or_conflicting_facts: The UR conflict of the revision intent is resolved by the maintainer decision of 2026-10-23. The unfrozen Codex macOS tuple is a qualification fact, not decisive for depth.
- depth_evidence_refs: UR.md; PRD_SCOPE_REVISION_PREVIEW_20261023_01.json; hostSupport; release-policy.mjs; codex-host-e2e.mjs; claude-host-e2e.mjs; publish-agdf.yml.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One 0.20.0 candidate qualified on Claude CLI Windows and Codex CLI macOS, with manually checked Desktop surfaces and explicit unqualified and experimental paths |
| authority_boundary | pass | Existing Core approval and canonical release owners retained; recording observations grants no approval |
| owner_consumer_coordination | fail | Qualification coordinates two maintainer-operated native environments, policy, validators, publication and report consumers |
| full_depth_impacts_absent | fail | Public support statements and mandatory release eligibility change |
| migration_propagation_bounded | pass | Existing definition, policy, validator, report and workflow owners enumerate the propagation |
| failure_recovery_local | fail | A failed native case needs execution on the affected host environment, not a repository-only repair |
| independently_acceptable | fail | Closeout needs reviewed records for both hosts and renewed quality results |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Define the mandatory matrix Claude Code CLI Windows and Codex CLI macOS with the five cases, and the manually checked Desktop state, without inferring other operating systems or surfaces | PRD | revise |
| Represent the new matrix in hostSupport and release-policy.mjs, keep Desktop records strict but non-gating in the same validate path, and decide the role of the Linux/Windows Codex E2E workflow | SD | revise |
| Pin the exact Codex macOS and Claude Windows tuples through preflight for the final candidate | SD | revise |
| Prepare per-host execution handoffs, import and validation for the final candidate; keep historical CLI and diagnostic records unrelabelled | TP | revise |

The maintainer already selected the mandatory hosts and surfaces and the release of both Desktop surfaces as manually checked. Do not ask these decisions again.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Run-specific scope and evidence reassessment; reusable knowledge is reassessed at closeout without automatically creating graph nodes.
- memory_target: scope_artifact
- memory_reason: Preserve the maintainer decision and the qualification limits in the selected run.
- memory_refs: PRD_SCOPE_REVISION_PREVIEW_20261023_01.json; revision manifest 077ecefa

## Next Permissible Step

- next_allowed_action: Record this review and the structured_delivery route together, author a fresh PRD from the retained UR, the confirmed revision and the maintainer decision of 2026-10-23, then present it for a new deliberate Approval: PRD.
- forbidden_until_then: No implementation, host policy or workflow changes, qualification claims, publication, tags or VCS actions.

## Quality Outlook

- quality_outlook: Routing reassessment passes. Both Desktop handchecks remain human reports with unverified identity. Retained code and tests require assessment under the renewed TP. Safety, ownership, candidate, unknown-state and approval checks remain binding.
