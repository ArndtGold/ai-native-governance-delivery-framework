# TP: AGDF Delivery Path Search

Status: approved
Gate: TP
Gate approval: `Approval: TP`
Based on: `.agdf/control/artefacts/agdf-delivery-path-search/SD.md`
Date: 2026-07-09
Owner: agent

## 1. Task List

| task_id | Task | Dependencies | Acceptance mapping | Evidence required |
|---|---|---|---|---|
| DPS-01 | Run a bounded feasibility probe for the Codex evaluator transport in read-only mode and record the selected SDK or non-interactive invocation path. Do not retain throwaway product code. | none | PRD AC 8, 10; SD sections 8, 16 | Reproducible command/probe, observed structured output, read-only evidence, decision recorded in implementation notes |
| DPS-02 | Add versioned input, candidate, evaluator-response and search-result validators under the approved portable runtime owner. | DPS-01 | PRD AC 1, 6, 8, 9, 13 | Positive and negative contract fixtures; schema/version rejection evidence |
| DPS-03 | Extend the existing AGDF state/parser ownership to project live control state into an immutable normalized search input without copying gate transitions. | DPS-02 | PRD AC 3, 15 | Fixtures for allowed/forbidden state; review showing canonical gate reuse |
| DPS-04 | Implement deterministic candidate legality, hard rejection and versioned scoring policy with explicit fact/judgement separation. | DPS-02, DPS-03 | PRD AC 3, 4, 6, 8 | Gate-illegal candidates rejected before evaluator calls; fixed-fixture ranking tests |
| DPS-05 | Implement bounded best-first search, expansion, budgets, stopping rules and `no_safe_recommendation`. | DPS-04 | PRD AC 2, 5, 7 | Deterministic search fixtures covering depth, count, time/cost budget signals and stable-leader stopping |
| DPS-06 | Implement the evaluator protocol and primary Codex adapter using the transport selected by DPS-01, with no write-capable tools and no silent fallback scoring. | DPS-02, DPS-05 | PRD AC 8, 10; SD sections 8, 10, 15 | Adapter contract tests, timeout/auth/schema failures, observable runtime metadata and mutation-safety evidence |
| DPS-07 | Implement enforcement declarations and validation for `full`, `tool_enforced` and `instruction_only`, including downgrade/failure behavior for unsupported claims. | DPS-02 | PRD AC 12; SD section 10 | Capability fixtures and negative contradictory-claim tests |
| DPS-08 | Implement redacted decision persistence and compact output; exclude raw prompts, hidden reasoning, secrets and source snapshots. | DPS-02, DPS-05, DPS-07 | PRD AC 6, 7, 9; SD sections 11, 12 | Persistence snapshot, redaction fixtures, failure handling and compact/JSON output evidence |
| DPS-09 | Add the `delivery-path-search` CLI command and ensure its result is re-evaluated by canonical `gate-check` rather than treated as permission. | DPS-03–DPS-08 | PRD AC 4, 15; SD sections 3, 12, 15 | CLI positive/negative smoke tests and gate disagreement fixture where gate-check wins |
| DPS-10 | Add one shared `delivery-path-search` skill and canonical routing metadata without creating surface-specific source copies. | DPS-09 | PRD AC 1, 13, 14 | Runtime-integrity assertions and generated routing comparison |
| DPS-11 | Add Codex and Claude Code plugin mappings, generated Copilot mapping and OpenCode agent/instruction/permission mapping through existing sync owners. | DPS-07, DPS-10 | PRD AC 10–13 | Cross-surface fixture matrix and generated-asset comparison |
| DPS-12 | Add conformance fixtures that prove contract-equivalent state, decisions and capability reporting across the four supported surfaces; mark unsupported evaluator transports explicitly. | DPS-06, DPS-11 | PRD AC 11–13; success measures | Conformance report for Codex, Claude Code, Copilot and OpenCode |
| DPS-13 | Update user and maintainer documentation to explain bounded Path Search, adapter extensibility, enforcement levels and the non-MCTS boundary. | DPS-09–DPS-12 | PRD sections 4, 8–10, 14 | Documentation diff checked against canonical terminology and support claims |
| DPS-14 | Run focused tests, runtime integrity, package smoke/routing checks, wrapper smoke where applicable, review the final diff and record TP coverage. | DPS-01–DPS-13 | PRD AC 1–15 | Command logs, review reports, TP coverage matrix and unresolved-risk list |

## 2. Delivery Sequence

Implementation must proceed in these slices:

1. **Feasibility and contracts:** DPS-01–DPS-03
2. **Core decision engine:** DPS-04–DPS-05
3. **Evaluator, enforcement and persistence:** DPS-06–DPS-08
4. **CLI and canonical skill:** DPS-09–DPS-10
5. **Cross-surface mappings and conformance:** DPS-11–DPS-12
6. **Documentation and verification:** DPS-13–DPS-14

A failed DPS-01 blocks the executable Codex adapter and requires SD revision. It must not be worked around with an undocumented provider path.

## 3. Automated Test Plan

### Contracts

- accept the canonical versioned input, candidate, evaluator and result fixtures
- reject missing fields, unknown required versions, invalid numeric ranges and contradictory capability declarations
- reject evaluator-returned commands or executable payloads
- verify unknown optional fields cannot alter gate or scoring policy

### State and legality

- project approved artefact references, current gate, allowed/forbidden actions and evidence without copying transition rules
- reject forbidden candidate actions before evaluator invocation
- reject candidates outside approved scope
- prove an evaluator cannot promote an illegal candidate

### Search behavior

- deterministic ranking for fixed evaluator fixtures
- bounded initial candidates and expansion depth
- evaluation-count, duration and cost-budget stopping
- stable-leader stopping
- `no_safe_recommendation` for no legal candidate, unsafe candidates, invalid evaluations and exhausted budget without a safe leader
- no stochastic rollout or MCTS-labelled output

### Evaluator adapter

- schema-valid Codex response
- read-only tool configuration
- timeout, authentication, malformed response and model-unavailable handling
- no implicit fallback model or fabricated score
- runtime/model metadata recorded only when observable

### Enforcement and persistence

- accept evidenced `full` and `tool_enforced`
- downgrade or reject unsupported enforcement claims
- visibly retain `instruction_only`
- detect test-fixture mutations and invalidate the run
- redact raw prompts, secrets, hidden reasoning and source snapshots
- persistence failure prevents use as durable gate evidence

### CLI and gate integration

- JSON output matches the versioned result contract
- compact output contains recommendation/status, enforcement, budgets and next gate action
- `gate-check` remains authoritative when search and live state disagree
- normal AGDF commands remain behavior-compatible when search is unused

### Cross-surface conformance

- canonical skill appears once in shared source
- Codex and Claude Code keep unprefixed plugin-scoped skill names
- Copilot and OpenCode receive generated prefixed mappings
- all four mappings use equivalent contract fixtures
- unavailable native evaluator transports are reported, not simulated
- generated files match canonical sources

## 4. Manual And Inspection Plan

- inspect one high-impact example with at least three plausible delivery paths
- confirm rejected alternatives explain scope, risk, evidence and gate reasons
- confirm an `instruction_only` surface displays its weaker guarantee prominently
- confirm persisted artefacts are useful for review without exposing raw provider content
- confirm user-facing terminology says “Delivery Path Search,” not MCTS
- inspect package size and startup impact after adding the executable adapter
- review dependency and licensing impact of the selected Codex transport

## 5. Required Commands

At minimum:

```bash
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run smoke-test
npm --prefix agdf run smoke-test
```

Add focused Delivery Path Search test commands to the package scripts during implementation. Run the smallest focused command after each slice and the complete required set before review.

If the selected Codex transport adds a dependency, also run the repository's package validation and inspect the packed file list before QA.

## 6. Brownfield Scope

The pre-implementation Brownfield Analysis must inspect and bind implementation to:

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/meta/agdf-agent-router.md`
- `plugin/skills/`
- `plugin/.codex-plugin/plugin.json`
- `plugin/.claude-plugin/plugin.json`
- `plugin/hooks/hooks.json`
- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/bin/create-agdf.js`
- `create-agdf/opencode-plugin.js`
- `create-agdf/scripts/sync-package-assets.js`
- `create-agdf/scripts/test-routing.js`
- `create-agdf/scripts/smoke-test.js`
- current package manifests and release boundaries

It must identify the existing CLI parsing and command-dispatch owners, generated-asset boundaries, evaluator dependency impact, and any dirty-worktree overlap before code changes.

## 7. Out Of Scope

- full MCTS mechanics or MCTS naming
- autonomous code implementation during search
- new gate transitions or approval semantics
- provider-specific scoring policy
- native executable evaluator integrations for every coding agent when no stable programmatic interface is available
- a second package, gate parser, skill tree or generated-output authority
- unrestricted evaluator access to shell or write tools
- automatic migration of existing repositories
- commit, push, pull request, release or publishing

## 8. QA Blocking Conditions

| Condition | Expected QA effect |
|---|---|
| Search can recommend or execute a gate-illegal action | block |
| Search result is treated as implementation permission | block |
| Evaluator receives write-capable tools in an enforced mode | block |
| Gate logic, scoring policy or schemas diverge across surfaces | block |
| Raw prompts, hidden reasoning, secrets or source snapshots are persisted | block |
| Invalid evaluator output receives default/fabricated scores | block |
| Product claims MCTS without approved mechanics | block |
| Unsupported surface capability is presented as native/full support | block |
| Budgets or stopping reasons are missing from result | revise |
| Fixed fixtures produce unstable ranking without an explained model-input change | revise |
| Generated assets drift from canonical sources | block |
| Legacy AGDF commands regress when search is unused | block |
| Cost is unavailable and reported as unknown | warn |
| Instruction-only enforcement is visible and correctly limited | pass with documented limitation |

## 9. Evidence Matrix

| PRD acceptance criteria | Primary tasks | Required evidence |
|---|---|---|
| AC 1–2: canonical core and honest naming | DPS-02, DPS-05, DPS-10 | source ownership review, terminology fixtures, runtime integrity |
| AC 3–5: legality and one safe outcome | DPS-03–DPS-05, DPS-09 | legality, search and gate-integration tests |
| AC 6–9: transparency, budgets, fail-closed and redaction | DPS-02, DPS-04–DPS-08 | contract, budget, failure and persistence fixtures |
| AC 10–12: reference adapter and supported surfaces | DPS-06, DPS-07, DPS-11, DPS-12 | Codex read-only evidence and conformance matrix |
| AC 13–15: extensibility, integrity and unchanged gates | DPS-09–DPS-12, DPS-14 | adapter fixture, routing/integrity checks and regression suite |

## 10. Pre-Implementation Brownfield Analysis

Status: passed

Evidence: `.agdf/control/artefacts/agdf-delivery-path-search/BROWNFIELD_ANALYSIS.md`

The analysis confirms the existing CLI, package, generator, skill-routing and test owners. Implementation must begin with DPS-01 and stop for SD revision if the Codex transport cannot satisfy the approved read-only evaluator contract.

## 11. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
