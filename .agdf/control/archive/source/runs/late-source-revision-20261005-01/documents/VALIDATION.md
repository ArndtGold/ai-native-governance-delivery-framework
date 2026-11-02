# Final candidate validation

- local_result: pass
- final_candidate: CANDIDATE_OPERATIONAL_FINAL.json
- shared_plan: FINAL_SHARED_VERIFICATION.json, exit 0, all 20 existing stages
- platform: darwin-x64, Node 22.22.3
- normal_workspace_build: logs/WORKSPACE_FINAL_APPROVED_BUILD.log, exit 0
- normal_workspace_compatibility_check: logs/WORKSPACE_FINAL_APPROVED_COMPATIBILITY.log, exit 0
- source_and_package_reconciliation: GENERATED_OPERATIONAL_FINAL_RECONCILIATION.json, pass
- protected_inputs: PROTECTED_PATHS_OPERATIONAL_FINAL.json, pass

The unchanged full repository verification plan checks dependencies, maintenance, shell,
preparation, MCP dependencies, runtime, community, host compatibility, built runtime,
CLI/wrapper packages, transactions, delivery map, evaluations, MCP package, actual archives,
CLI/wrapper smoke and Pages install/build. All stages completed against the final frozen
isolated candidate. 1477 inventoried canonical sources and four generated trees match
production workspace bytes after the exact last approval. This does not assert equality
of unrelated physical temporary files or dependencies.

Host adapters: 56 cases, no failures; source-bound immutable current observation and its
three generated documents match the separately approved saved files. Skill evaluations:
102/102 across 13 skills, reviewed deterministic instruction replay, not live model behavior.
Activation: 39 existing cases with unchanged guard/graders. Existing MCP p95 limits remain
1500 ms cold and 1000 ms warm over 20 samples; final measurements pass (PERFORMANCE.json).
Core/CLI/MCP behavior includes actual fault and process paths, not source-only assertions.

The first payload refusal, preview defect, localization scan failure and intermediate
performance/verification results remain preserved as historical logs. They are not renamed
or treated as passes. Root fixes were rechecked in the complete final plan. No old assertion,
verifier policy or performance threshold was weakened.

Qualification conditions: child-only disposable npm cache; compatibility production in the
isolated copy temporarily quarantined two pre-existing tracked duplicate outputs, then
restored their exact bytes. The ordinary workspace compatibility check passed. This is not
a claim that the normal workspace compatibility recorder accepts those foreign duplicates.

Missing required evidence: Ubuntu Node22 repository lane, Windows Node22 runtime lane,
Ubuntu Node24 runtime lane in .github/workflows/agdf-guardrails.yml. No execution of these
platforms or GitHub-green result is claimed. Native installed model/session unverified;
that observation is optional under this TP. Installation, VCS, release and the original
design-run source revision are outside scope.

Required next step: formal reviews followed by QA assessment of the missing CI evidence.
