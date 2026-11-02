# PRD: AGDF Delivery Path Search

Status: approved
Gate: PRD
Gate approval: `Approval: PRD`
Date: 2026-07-09
Owner: agent
Derived from: `.agdf/control/artefacts/agdf-delivery-path-search/UR.md`

## 1. Product Outcome

AGDF can search several plausible delivery paths before implementation and recommend one safest evidence-backed next step.

The capability is portable across coding agents. It has one canonical decision model, one governed state model and one output contract. Agent-specific integrations translate capabilities and transport only; they do not redefine search, scoring or gate semantics.

The result is advisory. The normal AGDF gate independently decides whether the recommended step may proceed.

## 2. Users And Use Cases

### Primary users

- teams using AGDF with Codex, Claude Code, GitHub Copilot or OpenCode
- maintainers integrating AGDF with another coding agent
- reviewers who need to reconstruct why one delivery step was selected over alternatives

### Triggering use cases

Delivery Path Search is appropriate when at least one condition applies:

- the decision has high product, architecture, security, policy, persistence or release impact
- several materially different next steps are plausible
- a wrong next step would create expensive rework
- evidence is incomplete and the best evidence-gathering action is unclear
- gate readiness depends on comparing risks or test strategies

It must not run by default for routine questions, obvious local fixes or already approved implementation tasks with one clear next action.

## 3. Product Principles

1. **One portable core:** Search semantics are independent of coding-agent packaging.
2. **AGDF remains authoritative:** Search consumes governed state; it never creates gate permission.
3. **Read-only exploration:** Search and evaluation cannot modify the target repository.
4. **Evidence before confidence:** Observations, assumptions, estimates and model judgements remain distinguishable.
5. **Honest capability reporting:** Every surface declares how read-only behavior is enforced.
6. **Bounded cost:** Every run has explicit candidate, evaluation, depth and time budgets.
7. **Explainable selection:** The recommendation includes rejected alternatives and reasons.
8. **Fail closed:** Missing state, invalid evaluator output or uncertain enforcement cannot produce implementation permission.

## 4. First Release Boundary

The first release implements **bounded Delivery Path Search**, not full Monte Carlo Tree Search.

It must:

- generate a bounded set of permissible candidate next steps
- evaluate candidates against one canonical score contract
- allow limited expansion of the strongest candidates within a configured depth
- stop on explicit budgets or when further exploration no longer changes the leading recommendation materially
- return exactly one recommended next step or an explicit `no_safe_recommendation`

The product may only use the term **MCTS** after verified implementation of tree expansion, repeated simulation, reward backpropagation and an exploration/exploitation policy.

## 5. Canonical Inputs

Every search run receives a normalized, surface-neutral input:

- objective and approved scope
- current AGDF gate and allowed/forbidden actions
- relevant durable artefact references
- known evidence and missing evidence
- declared risks and constraints
- candidate-generation budget
- evaluation and depth budgets
- enforcement capability of the active surface

Candidate actions must be legal process or delivery steps at the current gate. A candidate that violates the current AGDF state is rejected before model evaluation.

## 6. Canonical Evaluation Contract

Every candidate is assessed using the same dimensions:

| Dimension | Meaning |
|---|---|
| Scope fit | Advances the approved objective without expansion |
| Gate readiness | Respects the current gate and improves readiness |
| Risk reduction | Reduces material technical or delivery risk |
| Evidence gain | Produces useful, reviewable evidence |
| Testability | Has a credible verification path |
| Reversibility | Limits irreversible consequences and rework |
| Cost | Accounts for model, engineering and operational effort |

The contract must distinguish:

- deterministic facts derived from AGDF state
- direct repository evidence
- model judgements
- assumptions
- uncertainty

A combined rank may select candidates, but it must not disguise model judgement as measurement. Score weights and hard rejection rules are versioned product configuration, not evaluator discretion.

## 7. Canonical Output

Every completed run returns:

- run identifier and contract version
- current gate and enforcement capability
- recommended next step, or `no_safe_recommendation`
- concise rationale
- expected evidence and tests
- material risks and assumptions
- evaluated alternatives with rejection reasons
- budgets consumed and stopping reason
- next AGDF gate action

The durable result stores the decision summary and evidence references. Raw prompts, hidden reasoning and unrestricted repository content are not persisted.

## 8. Portability And Adapter Model

### Core

The core owns:

- normalized delivery state
- candidate legality
- search budgets and stopping rules
- evaluation schema
- ranking and rejection rules
- output schema
- persistence boundary

It has no dependency on Codex, Claude Code, Copilot, OpenCode or their plugin formats.

### Evaluator adapter

An evaluator adapter:

- receives only the normalized candidate-evaluation request
- calls an available coding agent or model
- returns schema-valid structured judgement
- reports model/runtime identity when available
- cannot alter gates, score weights or persistence rules

Invalid, incomplete or contradictory evaluator output is rejected.

### Surface adapter

A surface adapter:

- discovers or invokes the shared AGDF workflow using native extension points
- exposes the surface's evaluator mechanism
- reports its enforcement level
- maps the canonical output into the native interaction surface
- preserves the canonical artefact and gate references

Surface adapters must not fork the core algorithm or decision contract.

## 9. Supported Surfaces

The first release must define and verify mappings for the four AGDF-supported surfaces:

| Surface | Delivery mechanism | Required first-release outcome |
|---|---|---|
| Codex | plugin, shared skill, lifecycle hooks, programmatic interface | primary executable reference adapter |
| Claude Code | shared plugin and skill source | equivalent workflow mapping and conformance evidence |
| GitHub Copilot | generated `AGENTS.md`, repository skills and instructions | generated mapping and explicit enforcement declaration |
| OpenCode | repository instructions, generated agents, permissions and npm hooks | mapped workflow, permissions and conformance evidence |

Additional coding agents are supported through the published adapter contract. “Works with every coding agent” means contract-based extensibility, not an unverified promise of native integration.

## 10. Enforcement Levels

Every run reports exactly one enforcement level:

| Level | Meaning |
|---|---|
| `full` | Trusted lifecycle controls technically prevent writes during search |
| `tool_enforced` | An external orchestrator exposes only read/evaluation tools |
| `instruction_only` | The agent is instructed not to write, but the surface cannot prove prevention |

`instruction_only` is allowed for advisory exploration only. It must be visibly labelled and must never be presented as equivalent to technical enforcement.

## 11. Persistence And Security

- Persist only normalized inputs needed for traceability, result summaries, evidence references, budgets and contract versions.
- Do not persist secrets, unrestricted source snapshots, raw provider prompts or hidden reasoning.
- Apply repository and surface permissions before evaluator invocation.
- Treat evaluator responses as untrusted input and validate them against the canonical schema.
- Do not execute commands, tool requests or code returned by an evaluator.
- Make model cost and evaluation count visible.
- Allow a project to disable external evaluator calls.

## 12. Acceptance Criteria

1. One canonical search and evaluation contract exists in the authoritative AGDF source tree.
2. The first release is labelled Delivery Path Search and does not claim full MCTS.
3. Candidate legality is checked against the current AGDF gate before evaluation.
4. Search cannot grant implementation permission.
5. Search produces one recommendation or `no_safe_recommendation`.
6. Facts, evidence, assumptions, estimates and model judgements remain distinguishable.
7. Candidate count, depth, evaluation count, time and cost budgets are bounded and reported.
8. Invalid evaluator output fails closed.
9. The persisted result excludes raw prompts, hidden reasoning and unrestricted source content.
10. Codex provides the primary executable reference adapter.
11. Claude Code, GitHub Copilot and OpenCode mappings pass the same contract fixtures or explicitly report unsupported capabilities.
12. Every surface reports `full`, `tool_enforced` or `instruction_only`.
13. Adding another coding agent requires an adapter and conformance tests, not changes to core semantics.
14. Runtime-integrity validation detects missing canonical routing and cross-surface drift.
15. Existing AGDF gate-check, approvals and delivery-state semantics remain unchanged.

## 13. Success Measures

- selected recommendations contain no gate-illegal actions in contract tests
- all supported surface mappings produce schema-equivalent decisions for shared fixtures
- adapter conformance failures are visible and block support claims
- every run reports budgets, stopping reason and enforcement level
- reviewers can reconstruct the recommendation from persisted summaries and evidence references

These are verification targets, not claims of current performance.

## 14. Non-Goals

- autonomous implementation during search
- replacement of AGDF gate-check or approvals
- unrestricted recursive agent spawning
- provider-specific scoring rules
- hidden chain-of-thought storage or display
- guaranteed identical prose or scores across models
- native integration with every existing coding agent in the first release
- release, publishing or migration of existing AGDF projects

## 15. Product Risks

- A model may produce persuasive but weak evaluations; deterministic legality and schema checks remain mandatory.
- Cross-agent outputs will vary; conformance covers contracts and invariants, not identical wording.
- Weak surfaces may ignore instructions; enforcement level must remain visible.
- Repeated evaluation may be expensive or slow; budgets and opt-out controls are mandatory.
- A portable abstraction may collapse to the lowest common denominator; the core stays minimal while adapters may expose stronger enforcement.
- Search can create false certainty; `no_safe_recommendation` is a first-class outcome.

## 16. Design Questions For SD

- Runtime package ownership and module boundaries
- evaluator transport and structured-output validation
- deterministic candidate generation versus model-assisted expansion
- default budgets and stopping thresholds
- contract versioning and compatibility
- surface-specific enforcement detection
- conformance fixture and test harness structure
- durable decision-summary format and redaction implementation

## 17. Approval

Approve only with:

`Approval: PRD`
