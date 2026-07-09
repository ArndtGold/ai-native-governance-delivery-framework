# SD: AGDF Delivery Path Search

Status: approved
Gate: SD
Gate approval: `Approval: SD`
Based on: `.agdf/control/artefacts/agdf-delivery-path-search/PRD.md`
Date: 2026-07-09
Owner: agent

## 1. Solution Overview

Implement Delivery Path Search as a provider-neutral orchestration runtime exposed through the existing AGDF CLI package.

The runtime reads normalized AGDF state, rejects illegal candidate actions deterministically, coordinates bounded candidate evaluation through an evaluator-adapter contract and emits one versioned result. Coding-agent surfaces invoke the same runtime through their existing skills, instructions, agents or plugin integration.

The design deliberately separates four concerns:

1. **AGDF state adapter** — projects durable control state into a normalized search state.
2. **Search core** — owns candidate legality, bounded expansion, ranking and stopping.
3. **Evaluator adapter** — obtains structured model judgement without owning policy.
4. **Surface adapter** — connects a coding agent to the shared runtime and declares enforcement strength.

No adapter may grant gate permission or maintain a second gate model.

## 2. Ownership And Source Of Truth

| Concern | Authoritative owner |
|---|---|
| Gate transitions and permissions | `plugin/meta/agdf-runtime-contract.md` |
| Skill identity and surface routing | `plugin/meta/agdf-plugin.definition.json` |
| Shared workflow instructions | `plugin/skills/delivery-path-search/SKILL.md` |
| Portable runtime and schemas | `create-agdf/lib/delivery-path-search/` |
| CLI entry point | `create-agdf/bin/create-agdf.js` |
| Generated Copilot/OpenCode assets | `create-agdf/scripts/sync-package-assets.js` |
| Codex and Claude plugin packaging | `plugin/` manifests and shared skill path |
| OpenCode runtime integration | `create-agdf/opencode-plugin.js` and generated OpenCode assets |
| Cross-surface consistency | `plugin/scripts/check-runtime-integrity.mjs` and `create-agdf/scripts/test-routing.js` |
| Durable run result | `.agdf/control/artefacts/<scope>/DELIVERY_PATH_SEARCH.json` plus a concise Markdown decision summary |

Generated assets remain derived output. No surface keeps an independent algorithm, schema, score model or gate table.

## 3. Runtime Architecture

```text
Coding-agent surface
        |
        v
Surface adapter ----> Enforcement declaration
        |
        v
AGDF CLI: delivery-path-search
        |
        +--> State adapter --> live .agdf/control + approved artefacts
        |
        +--> Search core --> legality --> bounded expansion --> ranking
        |                         |
        |                         v
        +----------------> Evaluator adapter --> coding agent/model
        |
        v
Versioned result --> gate-check --> permitted next process action
```

The search result flows into `gate-check` as evidence only. `gate-check` recalculates the operative process permission from canonical state.

## 4. Module Boundaries

Use dependency-light ECMAScript modules because the existing published CLI package is Node.js ESM and currently has no TypeScript build step.

```text
create-agdf/lib/delivery-path-search/
  contracts.js
  state-adapter.js
  candidate-policy.js
  search-engine.js
  scoring.js
  persistence.js
  evaluators/
    protocol.js
    codex.js
  surfaces/
    capabilities.js
```

Responsibilities:

- `contracts.js`: schema versions, validation and normalized types
- `state-adapter.js`: reads existing CLI/control parsers and constructs immutable search input
- `candidate-policy.js`: deterministic legality and hard rejection
- `search-engine.js`: budgets, bounded expansion, evaluator scheduling and stopping
- `scoring.js`: versioned weights, rank calculation and uncertainty penalties
- `persistence.js`: redacted result and Markdown summary output
- `evaluators/protocol.js`: evaluator request/response validation
- `evaluators/codex.js`: primary executable evaluator adapter
- `surfaces/capabilities.js`: enforcement-level declaration and validation

The CLI parser and gate implementation are reused rather than copied into the new modules.

## 5. Contracts

### 5.1 Search input

Use a versioned JSON object containing:

- objective and scope key
- current gate
- allowed and forbidden actions
- approved artefact references
- evidence references and missing evidence
- risks and constraints
- enforcement capability
- candidate, depth, evaluation, duration and cost budgets

Only normalized summaries and references cross the evaluator boundary. Full repository content is fetched only through explicitly permitted read tools owned by the active surface.

### 5.2 Candidate

Each candidate contains:

- stable candidate identifier
- parent identifier when expanded
- proposed next delivery action
- expected evidence and verification
- declared assumptions
- deterministic legality result

Illegal candidates never reach an evaluator.

### 5.3 Evaluator request and response

The request contains the normalized state, one candidate and the canonical evaluation rubric.

The response contains:

- rubric scores with bounded numeric ranges
- concise rationale per dimension
- risks, assumptions and uncertainty
- predicted evidence/test effect
- optional child-action proposals
- runtime/model metadata when observable

Responses are treated as untrusted data. Unknown fields may be ignored, but missing required fields, invalid ranges, executable instructions or contract-version mismatches reject the evaluation.

### 5.4 Search result

The result contains:

- contract and scoring-policy versions
- recommendation or `no_safe_recommendation`
- rejected alternatives
- deterministic evidence separately from model judgement
- budgets consumed and stopping reason
- enforcement level
- gate-check evidence reference
- redaction report

The result contains no hidden reasoning or raw provider prompt.

## 6. Search Algorithm

The first release uses deterministic bounded best-first path search:

1. Read the current governed state.
2. Generate a bounded initial candidate set from allowed AGDF actions.
3. Reject gate-illegal candidates deterministically.
4. Evaluate legal candidates using the configured adapter.
5. Rank candidates using versioned weights plus uncertainty and enforcement penalties.
6. Expand only the strongest candidates while depth and evaluation budgets remain.
7. Stop when:
   - a hard budget is reached,
   - no legal candidate remains,
   - all candidates fail a safety threshold, or
   - the leader remains stable across the configured comparison window.
8. Return one recommendation or `no_safe_recommendation`.

No stochastic rollout, reward backpropagation or UCB-style exploration is included. Therefore the feature is not named MCTS.

## 7. Scoring And Decision Policy

The scoring policy is versioned and owned by the core.

Base dimensions:

- scope fit
- gate readiness
- risk reduction
- evidence gain
- testability
- reversibility
- cost

Hard rejection always outranks numeric score. Examples:

- action is forbidden by current gate
- action expands beyond approved scope
- evaluator response is invalid
- required evidence is unavailable
- surface claims stronger enforcement than it can prove

Model scores are judgements. The core labels them as such and applies deterministic penalties for unresolved assumptions, high uncertainty, weak enforcement and excessive cost.

Default weights and thresholds are CLI-owned configuration with contract tests. They are not editable by evaluator prose.

## 8. Evaluator Architecture

### Primary Codex adapter

The first executable reference adapter invokes a Codex programmatic interface in read-only mode and requests schema-constrained evaluator output.

The adapter must:

- create or use an evaluation-only thread
- expose no write-capable tools
- apply model and evaluation-count budgets
- return only the canonical evaluator response
- record observable runtime/model identity
- propagate timeout, authentication and schema failures without fallback scoring

The implementation choice between Codex SDK and a non-interactive Codex process is made in TP after a focused feasibility probe. The adapter interface remains unchanged.

### Additional evaluator adapters

Claude Code, GitHub Copilot and OpenCode integrations may use:

- a native programmatic interface when available and testable, or
- the surface's agent loop as an evaluator transport, or
- a configured external evaluator implementing the JSON protocol.

Absence of a native evaluator transport does not fork the search core. The surface reports the unsupported capability or uses the explicit external adapter.

## 9. Surface Integration

### Codex

- shared plugin skill discovers and invokes the CLI runtime
- plugin/hook layer declares or verifies read-only enforcement
- primary Codex evaluator adapter supplies structured evaluations

### Claude Code

- same canonical skill source and plugin package
- surface adapter invokes the same CLI runtime
- evaluator transport must satisfy the canonical protocol

### GitHub Copilot

- package sync renders the shared skill and AGENTS routing
- generated instructions invoke the same CLI/runtime contract
- enforcement is declared honestly; instruction-only operation is not upgraded implicitly

### OpenCode

- generated agent and instructions expose the workflow
- explicit edit/bash permissions contribute to enforcement declaration
- npm plugin hooks may validate lifecycle state but do not run the search algorithm

New surfaces implement the adapter contract and conformance fixtures. They do not require changes to search semantics.

## 10. Enforcement Model

The surface adapter supplies evidence for one declared level:

- `full`: trusted lifecycle controls and tool restrictions prevent writes
- `tool_enforced`: the evaluator receives only read/evaluation tools
- `instruction_only`: write prohibition is prompt-level only

The core validates that required evidence accompanies `full` or `tool_enforced`. Unsupported or contradictory claims downgrade to `instruction_only` or fail according to project policy.

Search runs in a separate evaluation context where possible. Repository mutations detected during a run invalidate the result.

## 11. Persistence And Redaction

Write only after search completes and only to the current scope's AGDF artefact directory.

Persist:

- normalized decision summary
- candidate identifiers and concise alternatives
- evidence references
- model judgements marked as judgements
- budgets, versions and stopping reason
- enforcement level and redaction report

Do not persist:

- raw prompts
- hidden reasoning
- secrets or credentials
- full source snapshots
- unbounded tool transcripts
- evaluator-returned commands or executable code

Persistence failure leaves the recommendation non-durable and therefore unusable as gate evidence.

## 12. CLI Surface

Add one command family to the existing AGDF CLI:

```text
delivery-path-search
```

Required modes:

- machine-readable JSON for automation and conformance tests
- compact status/result card for interactive surfaces
- explicit dry-run or fixture mode for contract verification

Configuration comes from documented project-local control configuration or explicit flags. Environment secrets select evaluator credentials but never alter gate or scoring policy.

## 13. Compatibility And Migration

- Existing gate commands and JSON schemas remain unchanged.
- Existing repositories require no migration until they opt into Delivery Path Search.
- Missing Delivery Path Search configuration does not affect normal AGDF operation.
- The new skill is added once to canonical `skillSet`; prefixes remain generated.
- Generated package output is synchronized through the existing script.
- Hooks remain deterministic lifecycle controls and do not become a second orchestrator.

## 14. Test And Evidence Strategy

### Contract tests

- valid and invalid search inputs
- gate-illegal candidate rejection before evaluation
- evaluator schema, ranges and version failures
- deterministic ranking for fixed fixtures
- budget and stopping behavior
- `no_safe_recommendation`
- redaction and persistence boundaries

### Adapter conformance

- shared fixtures for Codex, Claude Code, Copilot and OpenCode mappings
- enforcement declaration validation
- schema-equivalent output independent of surface presentation
- unsupported capabilities reported explicitly

### Integration evidence

- Codex evaluator read-only proof
- no repository mutation during search
- result is rechecked by canonical gate-check
- generated Copilot and OpenCode assets match canonical sources
- runtime-integrity and routing checks cover the new skill

### Required validation

- focused Delivery Path Search tests
- `node plugin/scripts/check-runtime-integrity.mjs`
- `npm --prefix create-agdf run smoke-test`
- package wrapper smoke test where the CLI surface changes

## 15. Failure Handling

- missing or contradictory AGDF state: stop with `no_safe_recommendation`
- evaluator unavailable or unauthorized: return explicit adapter failure
- invalid evaluator response: reject evaluation; do not invent defaults
- budget exhausted without stable safe leader: `no_safe_recommendation`
- detected mutation: invalidate run and report enforcement failure
- persistence failure: result cannot be used as durable gate evidence
- gate-check disagreement: gate-check wins

No automatic provider fallback is allowed unless configured explicitly and reported in the result.

## 16. Risks And Deferred Decisions

- The exact Codex invocation mechanism requires a feasibility probe before TP finalization.
- Native evaluator transports for every supported surface may not offer equal guarantees; conformance must distinguish mapping support from executable evaluator support.
- Cost estimation may be unavailable on some adapters; report unknown rather than estimating silently.
- Mutation detection cannot prove absence on instruction-only surfaces; preserve the weaker declaration.
- Default score weights require evaluation fixtures and may need later versioned tuning.

## 17. Next Step

Review this solution design and approve only with:

`Approval: SD`
