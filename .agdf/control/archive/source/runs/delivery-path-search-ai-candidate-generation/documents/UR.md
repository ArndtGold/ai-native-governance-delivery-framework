# UR: AI-Native Delivery Path Candidate Generation

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-11
Owner: agent

## 1. Problem

Delivery Path Search currently evaluates a bounded set of candidates, but its candidate set is produced deterministically. This limits exploration when several materially different, gate-legal delivery paths are plausible but are not already represented by the deterministic generator.

## 2. Goal

Add AI-native generation of multiple concrete delivery-path candidates before deterministic legality validation and evaluation, while keeping AGDF gates, candidate legality, budgets, scoring contracts and execution authority deterministic and canonical.

## 3. Scope

- Generate a bounded set of distinct candidate delivery paths from normalized, governed delivery state.
- Validate every generated candidate deterministically against the current AGDF gate before evaluation.
- Preserve the existing surface-neutral core and evaluator/surface adapter boundaries.
- Make generation budgets, provenance, rejection reasons and failure modes visible.
- Fail closed when generated candidates are invalid, duplicative, outside scope or gate-illegal.
- Retain exactly one advisory recommendation or `no_safe_recommendation` as the final Delivery Path Search result.
- Add focused contract and regression evidence for candidate generation and legality filtering.

## 4. Non-Goals

- No authority for generated candidates to bypass gate-check or user approvals.
- No autonomous implementation, repository mutation, commit, push, PR, release or publish.
- No provider-specific fork of AGDF gate, scoring or persistence semantics.
- No unbounded recursive exploration or claim of MCTS.
- No replacement of deterministic candidate validation, evaluation contracts or stopping budgets.

## 5. Acceptance Signals

- A bounded AI-native generation step can produce multiple concrete candidate paths from normalized delivery state.
- Every candidate is deterministically accepted or rejected before model evaluation, with a visible reason.
- Gate-illegal, out-of-scope, malformed and duplicate candidates cannot enter ranking.
- Candidate-generation and evaluation budgets are independently visible and enforced.
- Existing deterministic behavior remains available as a safe fallback or explicit operating mode without creating a second rule system.
- Persisted output preserves provenance and decisions without storing hidden reasoning, unrestricted source content or secrets.
- Supported surfaces reuse the same canonical generation and validation contracts and report their actual enforcement capability.
- Focused tests cover valid diversity, duplicate removal, schema failure, gate-illegal rejection, budget exhaustion and `no_safe_recommendation` behavior.

## 6. Existing Sources Of Truth

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/skills/delivery-path-search/SKILL.md`
- `create-agdf/lib/delivery-path-search/`
- `create-agdf/bin/create-agdf.js`
- `.agdf/control/artefacts/agdf-delivery-path-search/PRD.md`
- `.agdf/control/CONTEXT_GRAPH.md` (`CG-DELIVERY-PATH-SEARCH`)

## 7. Product Decisions

### 7.1 Ownership And Provider Boundary

The provider-neutral Delivery Path Search core owns the candidate-generation contract, invocation policy, budgets, normalization, deterministic deduplication, legality filtering and result provenance. A replaceable candidate-generator adapter receives the normalized request and returns untrusted candidate proposals. Provider SDKs, prompts and transport details stay inside that adapter. The adapter cannot alter gates, budgets, legality rules, scoring or persistence policy.

### 7.2 Minimum Diversity Rule

A generated candidate consumes the candidate budget only when it has a unique normalized action intent and materially differs from every accepted candidate in at least one decision-relevant dimension: affected owner or boundary, evidence plan, test strategy, risk-reduction strategy, or reversibility/cost trade-off. Case, punctuation, wording and ordering differences are cosmetic and must be deterministically collapsed. If the minimum number of materially distinct legal candidates cannot be produced within budget, generation stops honestly; it must not pad the set with variants.

### 7.3 Deterministic Baseline

AI-native candidates supplement, but do not replace, deterministic candidates in this scope. Deterministic candidates are generated first and remain the safe baseline. Generated candidates enter the same validation and ranking pipeline only after schema, scope, duplicate and gate-legality checks. A future replacement mode would require a separate approved product decision and must not be introduced as configuration drift.

### 7.4 External Context Boundary

An external generator may receive only the versioned normalized fields already owned by the Delivery Path Search contract: objective, scope key, current gate, allowed and forbidden actions, approved artefact references, concise evidence and missing-evidence summaries, risks and constraints, enforcement capability, and generation/search budgets. It must not receive secrets, environment values, unrestricted repository content, full artefact bodies, raw prompts, hidden reasoning, source snapshots or write-capable instructions. Additional repository reads require an explicitly permitted read tool owned by the active surface and must be reported as evidence provenance.

### 7.5 Cost And Latency Boundary

The initial product boundary permits at most one candidate-generation call per search run, at most five returned proposals, a 30-second generation timeout and a generation budget of at most five abstract cost units. Generation also remains inside the existing whole-run defaults of 120 seconds and 20 abstract cost units. Cost units are policy/rubric units, not currency measurements. A surface may configure stricter limits; higher or provider-priced limits require explicit project configuration and visible reporting. Timeout, authentication, schema or budget failure falls back to the deterministic baseline and is reported; it must not trigger an unreported provider fallback.

### 7.6 Surface Enforcement

- Codex: `tool_enforced` through read-only, ephemeral `codex exec` invocation plus repository mutation detection.
- Claude Code: `tool_enforced` through headless invocation with `Edit`, `Write` and `Bash` disallowed plus repository mutation detection.
- GitHub Copilot: `instruction_only` until a conforming native or external generator transport proves stronger enforcement.
- OpenCode: `instruction_only` until a conforming native or external generator transport proves stronger enforcement.
- Generic or future surfaces: `instruction_only` by default; stronger claims require concrete enforcement evidence validated by the canonical capability contract.

Instruction-only surfaces may expose the advisory workflow, but they must display the weaker guarantee and must not claim technical read-only enforcement.

## 8. Next Step

UR approved on 2026-07-11. Continue with the persisted Brownfield Review and its Mode/Slice Decision before creating later-gate artefacts or implementation.
