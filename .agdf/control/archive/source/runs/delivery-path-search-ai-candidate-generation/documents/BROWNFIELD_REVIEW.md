# Brownfield Review: AI-Native Delivery Path Candidate Generation

Status: done
Mode: post_ur_review
Decision: pass
Date: 2026-07-11
Derived from: `UR.md` approved by `Approval: UR` on 2026-07-11

## Scope

Size and route the approved addition of bounded AI-native candidate generation to the existing Delivery Path Search runtime. This review does not define the final product contract, solution design, task plan or implementation.

## Existing-System Evidence

| Owner | Current responsibility | Coverage |
|---|---|---|
| `create-agdf/lib/delivery-path-search/state-adapter.js` | Normalized governed search input and whole-run budgets | partially_done; no generator-specific request or budget |
| `create-agdf/lib/delivery-path-search/candidate-policy.js` | Deterministic candidates and exact allowed/forbidden legality checks | partially_done; no material-diversity or duplicate policy |
| `create-agdf/lib/delivery-path-search/contracts.js` | Versioned search, candidate, evaluation and enforcement validation | partially_done; no generator request/response contract |
| `create-agdf/lib/delivery-path-search/search-engine.js` | Candidate queue, deterministic legality, evaluation, ranking and stopping | partially_done; currently accepts deterministic or injected candidates but has no generator orchestration |
| `create-agdf/lib/delivery-path-search/evaluators/` | Provider transports for candidate evaluation | reusable transport patterns; generation must not be folded into evaluator scoring policy |
| `create-agdf/lib/delivery-path-search/surfaces/capabilities.js` | Canonical enforcement declarations | reusable; Codex and Claude are `tool_enforced`, Copilot and OpenCode remain `instruction_only` |
| `create-agdf/lib/delivery-path-search/persistence.js` | Redacted result persistence | partially_done; generator provenance and generation budgets are absent |
| `create-agdf/bin/create-agdf.js` | CLI parsing, surface selection and runtime orchestration | partially_done; no generator selection/configuration |
| `create-agdf/scripts/delivery-path-search-test.js` and `delivery-path-search-unit-test.js` | Search and contract regression coverage | reusable and extendable; missing generator, diversity, fallback and budget cases |
| `plugin/meta/agdf-runtime-contract.md` and `plugin/skills/delivery-path-search/SKILL.md` | Canonical runtime and workflow semantics | affected authoritative sources if product/runtime behavior changes |
| `create-agdf/scripts/sync-package-assets.js` | Generated Copilot, Codex and OpenCode package assets | existing propagation owner; generated copies must not be edited directly |
| `create-agdf/package.json` and `agdf/package.json` | Published implementation package and CLI wrapper | release-visible compatibility and smoke-test boundary |
| `README.md`, `INSTALL.md`, `agdf/README.md`, `pages/src/data/site.ts` | Public capability and compatibility claims | affected if generation support or surface enforcement is exposed |

## Current Coverage

- current_coverage: partially_done
- The existing provider-neutral search runtime, legality filter, budgets, evaluators, capability declarations, persistence and test harness are strong reuse points.
- Candidate generation currently comes from `allowed_actions` or explicit injected fixtures. There is no versioned AI generator protocol, material-diversity rule, generator-specific budget accounting or surfaced provenance.
- The existing evaluator's `child_actions` already produce model-proposed expansion actions, but they are evaluation output tied to one candidate. Treating this as initial candidate generation would mix responsibilities and create a second implicit generation policy.

## Reuse Strategy

- reuse_strategy: extend
- Extend the existing Delivery Path Search module tree and contract ownership.
- Add one provider-neutral candidate-generator protocol/adapter boundary beside, not inside, the evaluator protocol.
- Keep deterministic candidates as the baseline owned by `candidate-policy.js`.
- Keep deterministic legality in the existing policy owner and extend it with canonical normalization/diversity checks rather than adding provider-side filtering.
- Reuse the Codex and Claude read-only subprocess patterns and mutation detection where a generator transport is supported.
- Reuse the existing capability matrix, CLI command, persistence path, focused tests, smoke tests and asset sync.

## Change Impact

- interfaces: versioned search input/result and new generator request/response/provenance fields
- runtime: generation orchestration before legality filtering and evaluation; separate generation budgets and failure reporting
- compatibility: deterministic-only behavior must remain valid and stable; old fixtures/configuration require an explicit compatibility decision in PRD/SD
- security/privacy: normalized outbound context allow-list, no unrestricted source content, secrets, hidden reasoning or write-capable instructions
- surfaces: Codex and Claude can currently evidence `tool_enforced`; Copilot and OpenCode remain `instruction_only` unless a conforming external transport is supplied
- packaging: `create-agdf` remains implementation owner; `@agdf/cli` remains the wrapper and smoke-test consumer
- documentation: public claims must distinguish candidate generation from candidate evaluation and preserve the advisory-only/non-MCTS boundary
- data/migration: no persistent business-data migration; persisted DPS result schema/version compatibility must be designed

## Parallel-Structure And Drift Risks

- A generator that validates, ranks or filters candidates inside a provider adapter would create a second policy owner.
- Reusing evaluator `child_actions` as the initial generator would conflate evaluation expansion with generation and hide independent budgets/provenance.
- Editing generated package assets directly would fork canonical skill/runtime sources.
- Surface-specific prompts or limits must not become separate product semantics.
- The approved UR sharpens the earlier PRD's open deterministic-versus-model-assisted question; later artefacts must update the current contract coherently rather than silently inheriting the old first-release boundary.

## Mode / Slice Decision

- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- scope_reason: The change introduces new runtime/product semantics across versioned contracts, provider boundaries, privacy and budget policy, CLI behavior, persistence, tests, packaging and cross-surface capability claims. A Quick Task or shortened implementation path would leave material ownership and compatibility decisions implicit.
- evidence: Existing owners are identifiable and reusable, but at least contracts, policy, orchestration, persistence, tests and cross-surface documentation are affected.
- transparency: Full PRD, SD and TP gates are required. This decision does not authorize implementation.

## Missing Evidence

- Exact compatibility strategy for contract/result version changes.
- Whether candidate generation uses the existing evaluator transports or a separately configured model/transport per surface.
- Measured latency and cost behavior of one bounded generator call on Codex and Claude.
- Concrete privacy/redaction fixtures for the normalized generator request.
- Conformance behavior for instruction-only surfaces and explicit external adapters.

These are later-gate design and verification inputs, not blockers to drafting the PRD.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`
- context_graph_reconciliation: open_gap
- required_action: Update the existing node after approved product/design decisions establish reusable generator invariants; do not create a parallel node now.
- gate_effect: none for PRD drafting; must be resolved before clean closeout.

## Required Next Step

Draft the PRD from the approved UR and this Brownfield Review. Do not create SD, TP or implementation until the corresponding gates permit them.
