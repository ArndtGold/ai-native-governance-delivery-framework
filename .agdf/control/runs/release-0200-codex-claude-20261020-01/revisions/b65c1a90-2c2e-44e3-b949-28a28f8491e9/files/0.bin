# Brownfield Analysis: AGDF 0.20.0 release preparation

Decision: pass
Mode: pre_implementation_analysis
Date: 2026-10-20
Owner: Codex

## Decision

- decision: pass
- scope: Approved TP tasks T-001 through T-011, preserving exact UR/PRD/SD/TP sources.
- evidence: evidence/IMPLEMENTATION_BASELINE.json records source digests and the actual HEAD/index/worktree baseline. The branch is main at da8be438b381493f4dbbdfb7f73d3f18c4d440ed; production source is clean. Release control files and foreign core-model-handoff artefacts are present and must remain intact.

## Reuse and implementation boundary

Extend the canonical plugin definition and sync-package-assets generator for policy. Preserve release-bump/version-coherence/history ownership. Extend native-probes/release-evidence and existing Codex/Claude probes; share only candidate, baseline and contained evidence mechanics under their existing lib. Reuse Core plugin-provenance digests, compatibility checkout normalization and Windows host-command resolution. Keep CLI installer ownership/repair semantics, Core approvals and plugin-managed transport unchanged.

Existing Claude credentials helper already accepts environment OAuth tokens and cleans copied credentials; preserve this newer source behavior. The existing compatibility producer accepts native sources only under its observations directory and requires reviewed references in public_evidence. Integrate through that owner rather than appending arbitrary native rows or changing validation merely to fit a new directory. Candidate input identity excludes defined evidence outputs but includes generators, probe/evaluation dependencies, policies, lockfiles and actual payloads.

Native observations remain distinct from deterministic fixtures. The release evaluator must retain Codex exact-current-SHA, pinned client/model and cleanup assertions while adding complete Claude Windows obligations. Existing archive/version/profile checks remain fail closed. Test native transitions with released 0.14.5, not this checkout's development payload. External Windows execution, CI credentials and a final authorized clean ref are not currently established by this analysis; implementation/test preparation may proceed, but those gaps prevent final native qualification.

## Risks and checks

Primary regressions are omitted candidate inputs, circular result identity, incorrect Windows command invocation, lost session authentication cleanup, foreign install mutation, dropped existing scenario inventory, report/native-lane confusion and a publish job bypass. Exercise these through the approved targeted suites and actual shared verification. Preserve existing fixture inventory and timeouts. Never infer Desktop evidence from CLI calls. A substantive new source/authority conflict stops its affected implementation and routes to the existing source owner.

## Context Graph and next action

- context_graph_impact: none
- memory_target: scope_artifact
- context_graph_reconciliation: not_applicable
- next_action: Record this actual analysis result through the canonical internal step, redispatch the same run, and implement the approved TP scope at CD+Tests.
- qualification_limits: This pass assesses the implementation path; it is not an implementation/test result, native qualification, QA decision or release approval.
