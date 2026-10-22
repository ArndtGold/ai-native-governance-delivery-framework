# Brownfield Review: AGDF 0.20.0 host qualification

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done

## Run

- run_id: release-0200-codex-claude-20261020-01
- related_ur: .agdf/control/artefacts/release-0200-codex-claude-20261020-01/UR.md
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-10-20

## Objective

Size the approved release preparation: one coherent version 0.20.0, native qualification for Codex and Claude Code, and explicit experimental status for Copilot/OpenCode. Claude testing occurs on another computer. The user clarified during this review that it runs Windows with the current Claude Desktop app and Claude CLI. Exact versions and models are runtime observations to record, not facts established by the word current.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: low
- ui_ux_impact_reason: Installation guidance, release status and evidence labels change; installation consent, approval authority, normal working modes and recovery semantics remain owned by their existing components. No new user interaction or UI feature is requested.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | README.md; INSTALL.md | Four hosts are presented together; INSTALL distinguishes published 0.14.5 from the development MCP implementation | medium |
| Source of truth | plugins/agdf/meta/agdf-plugin.definition.json; scripts/release/version-coherence.js | Canonical 0.14.5 metadata and enumerated source/derived version surfaces | medium |
| Runtime path | packages/cli; packages/core; packages/mcp-server | Existing host lifecycle, governance and MCP owners remain authoritative | low |
| UI / UX | scripts/host-compatibility/render.mjs; docs/compatibility/HOST_COMPATIBILITY.md | Public evidence is generated and explicitly distinguishes fixtures from native observations | low |
| Persistence / data | scripts/release/version-bump.js; plugins/agdf/meta/distribution-profile-history.json | Release history and exact-version upgrade compatibility remain validated | medium |
| Tests / QA | scripts/native-probes/codex-host-e2e.mjs; claude-host-e2e.mjs; release-evidence.mjs | Codex evidence binds clean commit/version/model; Claude currently has no equivalent source binding or native upgrade/recovery steps | high |
| Release / operations | .github/workflows/codex-release-e2e.yml; publish-agdf.yml; docs/maintenance/README.md | Publication depends on native Codex Linux/Windows evidence; no equivalent Claude requirement exists | high |

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: medium
- architecture_reason: Release eligibility consumes evidence from independently executed hosts, including a separate Windows computer. Candidate identity and acceptance must remain centralized while execution is host-specific. This changes a public support and release boundary, without creating another governance authority.
- architecture_evidence: scripts/native-probes/release-evidence.mjs; scripts/native-probes/claude-host-e2e.mjs; .github/workflows/publish-agdf.yml; scripts/host-compatibility/contract.mjs.
- architecture_missing_evidence: Exact remote versions/model and results remain execution prerequisites; the evidence exchange format and release integration must be designed by the existing native-probe/release owners in SD.
- architecture_next_owner_and_action: PRD fixes qualified capabilities and evidence obligations; SD extends existing evidence and release owners with a common candidate-binding contract and bounded remote handoff.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: Claude success cannot establish exact release-candidate qualification | claude-host-e2e.mjs records version and steps but lacks the Codex clean-commit binding and upgrade/recovery coverage | revise | PRD defines required proof; SD extends existing probes and evidence validation rather than inventing a second release decision owner |
| problem: Publication protects Codex evidence only | publish-agdf.yml uses codex-e2e; release-evidence.mjs validates Codex observations | revise | Existing release owner must require matching Claude Windows evidence and retain Codex Linux/Windows checks |
| unresolved: Remote Desktop and CLI identities and results | User confirmed Windows with Claude Desktop and Claude CLI; no observation from that computer has been supplied | warn | PRD separates Claude Code CLI and Desktop capability evidence; TP captures exact tuple and returned observations before QA claims |
| problem: Generated report would overwrite a manual experimental-status edit | scripts/host-compatibility/render.mjs generates public compatibility prose | revise | SD chooses one canonical host-support declaration consumed by generated reporting and public guidance; do not fork host policy |
| problem: Release versions must change coherently across existing consumers | version-coherence.js enumerates package, plugin, Pages and submission surfaces | revise | Reuse release-bump.js and release:prepare; retain generated/experimental profile version coherence |
| problem: Existing worktree is shared with unrelated work | Read-only git status at da8be438b381493f4dbbdfb7f73d3f18c4d440ed shows unrelated untracked artefacts and staged release intake | warn | Preserve foreign changes and establish a clean exact candidate before release-grade host observations |

The revise risks above are identified obligations for the next design and implementation stages, not accepted debt or an inability to route this release. No separate debt allowance is granted.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: release_cross_host_depth: Versioned public release qualification coordinates Codex native CI and external Claude Windows execution. Rejected alternatives: quick_task and verified_change prohibit release/public-contract impact; structured_slice cannot exclude full-depth cross-host rollout and release effects.
- evidence: This review; approved UR; publish-agdf.yml; codex-release-policy.json; release-evidence.mjs; claude-host-e2e.mjs.
- transparency_note: PRD, SD and TP remain required to agree qualified combinations, candidate handoff, mandatory checks, upgrade/recovery coverage and operational handling. This review grants no implementation or release authority.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: release_cross_host_depth
- decisive_full_depth_triggers: Release, deployment or cross-host; public support contract and shared release version across independently tested consumers.
- rejected_alternative: structured_slice; full_depth_impacts_absent and local-only recovery cannot be proven because release eligibility requires independently collected remote native observations.
- missing_or_conflicting_facts: none decisive for depth; exact remote client/model identities and results are later execution facts, not reasons to invent a narrower route.
- depth_evidence_refs: .github/workflows/publish-agdf.yml; .github/workflows/codex-release-e2e.yml; scripts/native-probes/codex-release-policy.json; scripts/native-probes/release-evidence.mjs; scripts/native-probes/claude-host-e2e.mjs; approved UR.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | One 0.20.0 candidate with explicitly bounded host qualification and experimental integrations |
| authority_boundary | pass | Existing Core approval owner and existing release evidence owner remain authoritative; tests grant no approvals |
| owner_consumer_coordination | fail | Final release requires evidence from native Codex runners and the independent Windows Claude computer |
| full_depth_impacts_absent | fail | Exact-version distribution and cross-host public support are release-critical effects |
| migration_propagation_bounded | pass | Canonical version bump and preparation enumerate the dependent surfaces and historical profiles |
| failure_recovery_local | fail | Missing or mismatched remote evidence cannot be repaired solely by a local code/test result |
| independently_acceptable | fail | Final native qualification depends on external Windows observations and clean-candidate CI |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which exact combinations and capabilities qualify release, and how are Claude CLI and Desktop evidence separated? | PRD | revise |
| How do existing probe/evidence owners bind, export, validate and consume the remote candidate results without a second support authority? | SD | revise |
| How are supported upgrade baselines and bounded recovery scenarios exercised on each host? | SD | revise |
| Which exact installed Windows client/model versions and credentials are available when the remote test executes? | TP | warn |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Findings are run-specific release prerequisites; this review does not create an architecture decision or reusable graph node. Reassess at closeout if the implemented evidence contract establishes reusable knowledge.
- memory_target: scope_artifact
- memory_reason: Retain release-specific boundaries and facts in this review and subsequent approved sources.
- memory_refs: .agdf/control/artefacts/release-0200-codex-claude-20261020-01/BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: Record this Brownfield Review and structured_delivery route together, then draft the PRD from the approved UR and this analysis.
- forbidden_until_then: Do not change version, product source, workflows or host installations; do not launch native qualification or claim release readiness.

## Quality Outlook

- quality_outlook: Existing deterministic coverage is reusable, but fresh exact-candidate native upgrade/recovery and remote Windows evidence remain mandatory. Review/routing is complete; implementation and qualification are pending.
