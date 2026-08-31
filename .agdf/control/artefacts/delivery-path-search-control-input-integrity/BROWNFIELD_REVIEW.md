# Brownfield Review: Delivery Path Search Control Input Integrity

- mode: post_ur_review
- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- artefact: `.agdf/control/artefacts/delivery-path-search-control-input-integrity/BROWNFIELD_REVIEW.md`
- scope: Canonical control-input derivation, pre-evaluation outcome semantics, CLI/JSON projection and focused regression coverage for Delivery Path Search.
- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The change alters visible CLI and machine-readable status, blocker and recovery semantics for operators and calling agents.
- ux_intent_definition_required: yes
- evidence: Approved UR, canonical gate-evaluation owner, current search adapter/core, CLI presentation, persistence and focused tests.
- transparency: Full structured depth is required because the public CLI/JSON contract changes; no new gate or search authority is introduced.
- missing_evidence: SD must decide the reusable snapshot API and compatibility projection; TP must bind every status transition to regression evidence.
- current_coverage: Canonical gate actions are fully available in gate evaluation; search adaptation, empty-input semantics and real-run integration coverage are partial.
- reuse_strategy: Extend the canonical gate-evaluation result, refactor the adapter to consume it, and extend the existing search result/presentation owners.
- risks: Parallel gate policy, recursive CLI evaluation, public output drift, and scope claims beyond the selected run.
- context_graph_impact: update_existing_node
- required_next_step: Use the ready UX Intent Definition as PRD input and request PRD approval; implementation remains forbidden.

## Existing Owners And Coverage

| Surface | Existing owner | Coverage | Reuse decision |
|---|---|---|---|
| Canonical selected-run transition | `create-agdf/lib/control-evaluation/gate-policy.js` through `gate-check.js` | fully_done | expose or reuse one normalized evaluated control snapshot |
| Search control adapter | `create-agdf/lib/delivery-path-search/state-adapter.js` | partially_done | refactor; stop parsing a persisted presentation section |
| Candidate legality and baseline | `create-agdf/lib/delivery-path-search/candidate-policy.js` | partially_done | retain exact action legality; reject unavailable input before candidate creation |
| Search outcome | `create-agdf/lib/delivery-path-search/search-engine.js` | partially_done | distinguish input, candidate, evaluator and evaluated-search outcomes |
| CLI orchestration/presentation | `create-agdf/lib/cli/delivery-path-search-command.js` | partially_done | extend current owner; no second presenter |
| Persisted advisory summary | `create-agdf/lib/delivery-path-search/persistence.js` | partially_done | persist only contract-valid terminal search results |
| Tests | focused unit, generator and integration scripts | partially_done | add canonical real-run and zero-evaluation regressions |

## Reuse And Parallel-Structure Assessment

- The fix must consume the same selected-run evaluation that produces `gate-check.allowed` and
  `gate-check.forbidden`; copying `gate-policy` tables or parsing rendered Markdown is blocked.
- `Run Status Card` remains a derived presentation. Persisting it to satisfy the search adapter would
  create a second mutable projection and is rejected.
- Search may project the selected run's objective and identity, but must not become a product-scope
  resolver or infer authority from a caller's unrelated question.
- Existing evaluator/generator transports, scoring, budgets and read-only mutation guards remain
  unchanged unless later evidence proves a directly coupled compatibility requirement.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: external_contract_depth
- decisive_full_depth_triggers: public CLI and JSON status semantics; cross-surface packaged runtime projection
- rejected_alternative: `structured_slice` is rejected because new terminal outcomes affect compatibility-sensitive CLI/JSON consumers and generated runtime packages, not only one internal function.
- missing_or_conflicting_facts: none
- depth_evidence_refs: approved UR; `gate-check.js`; `state-adapter.js`; `search-engine.js`; `delivery-path-search-command.js`; `persistence.js`; existing focused tests and release projection paths

| Bounded-slice check | Result | Evidence |
|---|---|---|
| coherent_outcome | pass | One outcome: search results cannot misrepresent missing input as an evidence-backed recommendation decision. |
| authority_boundary | pass | Canonical gate-check remains sole authority; search remains advisory and read-only. |
| owner_consumer_coordination | fail_full_depth | CLI, JSON, persisted summaries, generated plugin runtimes and calling agents consume the changed contract. |
| full_depth_impacts_absent | fail_full_depth | A compatibility-sensitive public CLI/JSON contract is directly affected. |
| migration_propagation_bounded | pass | Additive typed outcomes and deterministic generated-asset propagation can be tested and rolled back together. |
| failure_recovery_local | pass | Failures stop before evaluator invocation and point back to gate/scope recovery without repository mutation. |
| independently_acceptable | pass | The integrity outcome is independently testable without changing search scoring or candidate generation. |

## UI And UX Routing

- effective user: operator or calling agent running Delivery Path Search for exactly one selected AGDF run
- visible change: terminal and JSON output distinguish unavailable canonical input, absent legal candidates, evaluator failure and an actual search conclusion
- recovery expectation: every pre-evaluation stop names one precise corrective action and never presents a recommendation
- ux_intent_definition: `.agdf/control/artefacts/delivery-path-search-control-input-integrity/UX_INTENT_DEFINITION.md` (`ready`)

## Context Graph Decision

- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`; `CG-RUN-STATUS-CARD`; `CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: `CG-DELIVERY-PATH-SEARCH` now records canonical evaluated input, pre-evaluation outcome and zero-valid-evaluation invariants.

## Quality Outlook

The clean solution is one canonical evaluated control snapshot consumed by both Gate Check and
Delivery Path Search, with typed pre-evaluation outcomes and real-run regression coverage.
