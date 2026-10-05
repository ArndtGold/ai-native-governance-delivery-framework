# Actual Scope / Derivation Review

- decision: pass
- reviewer: Codex (cooperative scope/derivation review; not independent human approval)
- candidate: CANDIDATE_OPERATIONAL_FINAL.json, 56 capability paths
- sources: exact approved UR/PRD/SD/TP digests in PROTECTED_PATHS_OPERATIONAL_FINAL.json
- evidence: CAPABILITY_DIFF_FINAL.patch; CURRENT_PROOF_CONSUMERS.json; EVAL_QUALIFICATION_DELTA.json/.patch; EVAL_QUALIFICATION_REVIEW.md; OPERATIONAL_LOCALIZATION_FINAL_PROPOSAL.json/.patch and DECISION.json; GENERATED_OPERATIONAL_FINAL_RECONCILIATION.json; final tests; TASK_PLAN_REVIEW.md

Each actual capability path is compared with its verified T-000 raw starting digest, not an
unrelated whole-HEAD diff. Approval bytes and original design Run are unchanged. The prior
SD authoring work and independent CI edits are retained as baseline contributions. New modules
remain in planned Core/CLI/MCP test owners. The same eleven PRD criteria, eight SD decisions,
ten task IDs and 29 scenarios are traced to actual code/outputs in Task Plan Review. No material
product/design scope was invented during implementation.

Reviewed qualification correction is required to make the inherited new SD skill pass existing
guards: four reviewed SD instruction-replay cases, one responsibility update in gate-check,
current thirteen-skill fingerprints and two exact test snapshots. Existing prompts/thresholds,
activation policy and assertions remain enforced. Replay is deterministic fixture evidence,
not fresh native model behavior. Current adapter evidence uses an immutable source-bound
observation and derived producer outputs. Historical observations are retained unchanged.

The incomplete human preview and missing operationalValues registration were actual defects
against already approved preview/visible-state requirements; their focused changes are within
T-005/T-006 and are tested by actual packaged output plus the strict full plan. Their exact
generated payload impact and protected derived files were separately approved before workspace
application. Final five applied bytes match the saved last proposal; package headroom is zero.
Earlier approved observations/decisions remain attributed rather than discarded.

No production application of late revision, other-run reapproval, new MCP write tool, new
acceptance store, independent verifier modification, cache installation, VCS action or release
occurred. Existing node knowledge is curated in CONTEXT_GRAPH_RECONCILIATION.md. Required remote
platform evidence remains TPR-001; a scope review pass cannot substitute it or decide QA.

Required next step: consume the reviewed scope and TPR-001 in the sole QA decision.
