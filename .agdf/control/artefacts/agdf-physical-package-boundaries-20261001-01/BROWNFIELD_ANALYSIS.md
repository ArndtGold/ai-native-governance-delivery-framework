# Brownfield Analysis: Physical Package Boundaries

- mode: pre_implementation_analysis
- decision: pass
- scope: approved TP T-001–013; same target/run; no change to PRD/SD/TP acceptance or design
- evidence: IMPLEMENTATION_BASELINE.json; SD_MODULE_OWNERSHIP.json; TP_SOURCE_BINDING.json; TP_TEST_INVENTORY.json; approved artefact hashes and dispatcher revision 13
- missing_evidence: none for implementation preparation; implementation/archive/profile/consumer/rollback/review results remain to be collected
- current_coverage: existing controls, CLI/MCP contracts, profiles, provenance and regression suites are fully reusable; physical separation, provider extraction and new assembly are not_done
- reuse_strategy: refactor existing owners and tests; no policy rewrite, new authorization layer or fourth public package
- required_next_step: record this internal step, redispatch the bound gate, then T-002/Core extraction through the approved checkpoints

## Existing owners and concrete reuse path

Control-state writers retain their locks, seals, recovery journals, approval checks
and exact revision semantics. Evaluators, target resolution, dispatch/inspect,
presentation and pure Search logic move as the existing implementations. The
203-module SD map is unchanged at preparation; two mixed resource modules and
identified process providers require extraction, not just directory renaming.

The existing Resource-Context/Contract reader establishes allowlists, locales and
package metadata. Core will own their validation and explicit immutable context;
package/profile bindings will be generated from canonical plugin metadata, never
from cwd or inherited MCP arguments. CLI composes Git observation, history
acquisition, runtime probes and interactive process IO. Existing Core validators
still validate provider results. Missing provider evidence remains unavailable.

The current MCP transport/worker, exact SDK lock and public create-agdf runtime
facade are reused. CLI remains its exact public dependency; no SDK enters Core
or Offline/Copilot. Three public manifests/exports and Node >=22 are preserved.
Root build/assembly projects the private Core into supported runtime artefacts.
Profile integrity, exclusions, source/bundle identity and historical normalization
remain the existing owners; changed layout requires actual generated and packed
evidence rather than relaxing assertions.

## Regression and parallel-structure risks

Core→CLI Contract/metadata imports, Git/history calls in Recovery/Repair, runtime
probes in Binding and process startup in Maintenance are the concrete extraction
points. Default command, locale, unavailable and recovery behavior must remain
stable. Existing package/resource tests need relocation with explicit source/output
roots; they cannot assume an old-root fallback in current builds.

Temporary import bridges are solely delegations to moved canonical implementations,
inventoried and removed at T-011. No permanently duplicated core/build sources are
accepted. New own-package resource bindings and helper providers remain technical
composition, never gate approval or executable instructions from report text.

History readers preserve immutable tag paths. Installed create-agdf/runtime/data
paths remain compatibility artefacts. Active source references, tests, workflows,
SoT and Context Graph are updated after actual cutover, not retrospectively in
approved historical reports.

## Workspace and recovery boundary

IMPLEMENTATION_BASELINE.json records HEAD, all 3183 available tracked/untracked
source files, index digest, status and the actual source backup under
`/tmp/agdf-physical-C00-source-20261001`. This snapshot includes the authorized
MCP discovery repair. It is the starting content, not a claim of clean HEAD.
The five staged-but-removed duplicate additions and other earlier work remain
preserved; no staging, commit, reset or broad cleanup is part of implementation.
Other run approvals are not transferred.

Each checkpoint compares owned post-hashes before restoration. A conflicting
foreign edit stops the affected restoration. Source/output bindings are restored
together, only in this scope. Actual user installations and data are not targets.
TP scenario coverage and its concrete test inventory provide the approved
regression/archive/offline/lifecycle path; no tests have been counted as passed
merely because their files exist.

## Context Graph and quality boundary

- context_graph_impact: update_existing_node
- context_graph_refs: CG-PUBLIC-PLUGIN-DISTRIBUTION; CG-NATIVE-INTERACTION-AUTHORITY; CG-TASK-TARGET-AUTHORITY; SOT_REGISTRY.md
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: approved SD/TP T-008/011; actual new source owners must be reconciled before closeout
- memory_target: scope_artifact
- memory_reason: exact source/index/checkpoint tuples are run-specific; reusable actual owners will be reconciled in existing SoT/Graph after cutover
- memory_refs: this analysis; evidence/IMPLEMENTATION_BASELINE.json; evidence/UNRELATED_PRESERVATION.json

This pass means the reuse path and implementation boundary are evidenced. It is
not QA, archive acceptance, native host evidence or release authority.
