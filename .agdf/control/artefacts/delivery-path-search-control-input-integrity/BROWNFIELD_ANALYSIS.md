# Brownfield Analysis: Delivery Path Search Control Input Integrity

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: none
- artefact: `.agdf/control/artefacts/delivery-path-search-control-input-integrity/BROWNFIELD_ANALYSIS.md`
- scope: Approved DPSI-T01 through DPSI-T13 only; canonical input, phase/status classification,
  provenance, CLI/persistence parity, normative wording and generated distribution evidence.
- evidence: Direct source and test inspection on 2026-08-30; approved PRD, SD and TP; clean target
  source paths; version-matched AGDF 0.14.1 gate-check at TP revision 4.
- transparency: Existing owners are sufficient. No new gate engine, task resolver, persistence owner
  or generated-file owner is needed.
- missing_evidence: Implementation and regression results do not exist yet and must be produced by
  CD+Tests. Installed-host behavior is outside the current repository-evidence claim.
- current_coverage: partially_done
- reuse_strategy: refactor the current adapter and search result construction; extend existing
  contracts, CLI, persistence, tests and canonical skill/contract owners.
- risks: import-cycle regression, full gate-evaluation cost, strict downstream status consumers,
  fixture/production divergence and accidental overlap with unrelated dirty control-state work.
- context_graph_impact: update_existing_node; already reconciled at design level through
  `CG-DELIVERY-PATH-SEARCH`, with final implementation evidence still required before closeout.
- required_next_step: Begin CD+Tests with DPSI-T01 and DPSI-T02, keeping all unrelated control-run
  changes isolated.
- impact_codes: `AGDF_STATUS_CARD_PARALLEL_RULE_MODEL`

## Existing Owners And Coverage

| concern | existing owner | coverage | implementation decision |
|---|---|---|---|
| Selected run, doctor state, transition policy and allowed/forbidden actions | `create-agdf/lib/control-evaluation/gate-check.js` plus its existing control-evaluation dependencies | fully_done | Import and inject `evaluateGateCheck()` directly; do not copy policy or parse presentation. |
| Canonical run content and identity | `create-agdf/lib/control-evaluation/run-state.js` and `create-agdf/lib/control-state/**` | fully_done | Reuse `readRunState()`/resolved report identity for run, revision, gate and objective consistency. |
| Search-input mapping | `create-agdf/lib/delivery-path-search/state-adapter.js` | partially_done | Refactor current adapter; remove `Run Status Card` policy parsing while preserving objective, risks, evidence and budgets. |
| Input/evaluator contracts | `create-agdf/lib/delivery-path-search/contracts.js` | partially_done | Extend contract version 1 additively with revision, phase, status and provenance invariants. |
| Candidate legality | `create-agdf/lib/delivery-path-search/candidate-policy.js` | fully_done for legality; missing provenance | Preserve exact normalized action equality and forbidden precedence; add count evidence only. |
| Search execution and terminal meaning | `create-agdf/lib/delivery-path-search/search-engine.js` | partially_done | Keep scoring and budgets; replace the catch-all terminal status with one phase classifier. |
| Human/JSON projection and OpenCode transport outcomes | `create-agdf/lib/cli/delivery-path-search-command.js` | partially_done | Project the normalized result; align existing OpenCode unavailable/error objects without new policy. |
| Durable advisory output | `create-agdf/lib/delivery-path-search/persistence.js` | partially_done | Add recommendation-facing precondition validation before any write. |
| Normative semantics and generated copies | `plugin/meta/contracts/control-scaffold.md`, `plugin/skills/delivery-path-search/SKILL.md`, `create-agdf/scripts/sync-plugin-runtime.js` | partially_done | Edit canonical sources and use existing release preparation for projections. |
| Regression evidence | focused Delivery Path Search, generator, CLI modularization, control-state, smoke and package tests | partially_done | Extend existing suites and add a real temporary canonical-run fixture. |

## Dependency And Parallel-Structure Check

- `control-evaluation/gate-check.js` has no import from Delivery Path Search. A direct
  `state-adapter.js → control-evaluation/gate-check.js` dependency is therefore acyclic in the
  inspected graph.
- `executeDeliveryPathSearch()` already injects `searchInputFromControl`, the search runner and
  persistence. Extend this seam for deterministic gate/run snapshot tests instead of adding a test
  facade.
- The canonical evaluator returns `allowed`, `forbidden`, selected run state, current gate and
  revision-bearing presentation identity from one evaluation. The adapter must consume those
  values, not re-run transition rules.
- `Run Status Card` remains derived presentation. No durable status-card section will be added.
- Existing source/generated ownership is clear: `create-agdf/lib/**` and canonical `plugin/**`
  sources are edited; release preparation regenerates runtime/package projections.
- The unrelated untracked `agdf-npm-package-payload-cleanup` control artefacts are outside this run
  and must not be edited, staged, tested as scope proof or included in changed-path evidence.

## Compatibility, Regression And Side Effects

| boundary | assessment | required protection |
|---|---|---|
| Public JSON `status` values | additive set with corrected prior false conclusion; strict consumers may need explicit branching | CLI/smoke fixtures and release notes must assert every known status and recommendation-field invariant. |
| Contract version | remains `1` under approved SD because fields are additive | Validate unknown/contradictory combinations and preserve existing valid recommendation fields. |
| Scoring and budgets | unchanged; every valid scored evaluation currently yields a leader | Keep scoring tests unchanged and prevent `no_safe_recommendation` from becoming an error alias. |
| Evaluator/generator mutation protection | unchanged and security-relevant | Preserve fatal mutation behavior and read-only transport tests. |
| Persistence | stronger fail-closed precondition before filesystem writes | Direct negative tests must prove no directory/file creation for non-persistable results. |
| Gate authority | unchanged; search stays advisory | Preserve canonical next-gate message and quality-contract evidence for no parallel rule model. |
| Data/migration | no schema migration or existing durable run rewrite | Only newly persisted search summaries use added provenance fields. |
| Runtime/package propagation | cross-surface generated assets affected | Run release preparation, package tests and full smoke; do not infer installed-host behavior. |

## Minimal Clean Implementation Order

1. Add failing contract and adapter tests for a canonical run without a persisted status card and
   for stale revision/gate identity.
2. Refactor `state-adapter.js` to injected canonical gate/run owners, then extend contract validation.
3. Introduce candidate/evaluation provenance and the pure phase classifier in `search-engine.js`
   without changing scoring, legality or fallback policy.
4. Make CLI and persistence consume the normalized result verbatim, including OpenCode outcomes.
5. Update canonical skill/contract text, regenerate projections and run the TP verification ladder.

## Stop Conditions

Return to the earliest affected approved artefact before continuing if implementation reveals:

- a cycle that requires duplicating gate policy or introducing another selection owner;
- a need for a new score threshold, provider fallback or task-target resolution rule;
- a non-additive compatibility requirement or migration of existing persisted decisions;
- changed mutation/enforcement guarantees;
- overlap with unrelated source changes that cannot be isolated safely.

## Brownfield Decision

`pass`: owners, dependency direction, reuse path, compatibility boundary, regression surface and
scope isolation are sufficiently evidenced for bounded CD+Tests. This decision authorizes no QA,
UAT, release, commit, push or pull request claim.
