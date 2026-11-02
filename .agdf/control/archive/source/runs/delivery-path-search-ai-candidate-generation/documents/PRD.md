# PRD: AI-Native Delivery Path Candidate Generation

Status: approved
Gate: PRD
Gate approval: `Approval: PRD`
Date: 2026-07-11
Owner: agent
Derived from: `UR.md`; `BROWNFIELD_REVIEW.md`

## 1. Product Outcome

Delivery Path Search can use one bounded AI-native generation call to propose materially different delivery-path candidates in addition to its deterministic baseline. Every proposal remains untrusted until the canonical runtime validates its schema, scope, diversity and current-gate legality. The final result remains advisory and cannot grant implementation permission.

## 2. Users And Use Cases

### Primary users

- teams using AGDF for high-impact planning decisions with several plausible legal paths
- maintainers integrating Codex, Claude Code or an external generator transport
- reviewers who must reconstruct candidate provenance, rejection and budget use

### Triggering use cases

AI-native candidate generation is useful only when:

- Delivery Path Search itself is gate-legal and appropriate;
- several materially different delivery paths may exist;
- deterministic allowed-action candidates do not adequately represent the decision space; and
- the active surface can honestly report its enforcement capability.

It is optional. Routine work and deterministic-only Delivery Path Search must continue without it.

## 3. Product Principles

1. **Deterministic authority:** Gate legality, scope checks, normalization, diversity, budgets, ranking and execution authority remain deterministic.
2. **Supplement, never replace:** AI-native proposals supplement the deterministic baseline in this release.
3. **Provider-neutral core:** Provider SDKs, prompts and transports stay behind a replaceable generator-adapter contract.
4. **Untrusted proposals:** Generated content is validated before evaluation and never executed.
5. **Bounded by construction:** Candidate count, calls, time and cost have independent hard limits.
6. **Minimum necessary context:** External generation receives only an explicit normalized allowlist.
7. **Honest capability claims:** Read-only enforcement is reported per surface and backed by evidence.
8. **Observable degradation:** Generator failure falls back to the deterministic baseline and is reported, never hidden.

## 4. Product Boundary

### In scope

- one versioned, provider-neutral candidate-generator request/response contract
- one bounded generation attempt per Delivery Path Search run
- deterministic normalization, material-diversity checks, duplicate rejection, scope checks and gate-legality validation
- deterministic candidates generated first and retained as the baseline
- generator provenance, rejection reasons and generation budget consumption in results
- Codex and Claude generator transports using their existing read-only enforcement patterns
- explicit `instruction_only` behavior for Copilot, OpenCode and generic surfaces unless a conforming external transport is configured
- backwards-compatible deterministic-only operation
- focused contract, policy, failure, redaction, budget and cross-surface tests
- coherent runtime, skill, CLI and public documentation updates

### Out of scope

- replacing deterministic candidates
- autonomous implementation or execution of generated content
- provider-specific legality, diversity, scoring, persistence or gate rules
- unrestricted repository retrieval or raw source snapshots sent to a generator
- multiple generator calls, recursive generation or unbounded expansion
- automatic provider fallback
- a claim of Monte Carlo Tree Search
- native generator integrations for Copilot or OpenCode without evidenced technical enforcement
- commit, push, PR, release or publish

## 5. Ownership Model

The Delivery Path Search core owns:

- the generator contract and invocation policy
- normalized context and redaction policy
- deterministic baseline generation
- generator and whole-run budgets
- schema, scope, duplicate, diversity and gate-legality validation
- candidate provenance and rejection reporting
- fallback behavior and stopping semantics

A candidate-generator adapter owns only:

- provider authentication and transport
- provider/model invocation
- translation into the canonical generator response
- observable runtime/model metadata when available

An adapter cannot change gates, allowed actions, budgets, diversity, scoring, persistence or fallback policy.

## 6. Candidate And Diversity Contract

Every proposal contains:

- a stable proposal identifier
- a concise next-delivery action
- expected evidence
- expected tests or verification
- assumptions
- material-difference dimensions claimed by the generator

A proposal consumes the accepted-candidate budget only when:

1. its normalized action intent is unique; and
2. it materially differs from every accepted candidate in at least one of:
   - affected owner or system boundary,
   - evidence plan,
   - test strategy,
   - risk-reduction strategy,
   - reversibility or cost trade-off.

Case, punctuation, formatting, ordering and paraphrase-only differences are cosmetic. The runtime rejects them deterministically. An undersized diverse set is valid and reported; the generator must not pad it with variants.

## 7. Deterministic Baseline And Failure Behavior

- Deterministic candidates are created first from the governed allowed actions.
- AI-native proposals may add legal, materially different candidates; they cannot remove or mutate the baseline.
- All accepted candidates use the same canonical evaluation and ranking pipeline.
- Schema, timeout, authentication, privacy, budget or transport failure retains the deterministic baseline.
- The result reports generator status and failure reason without fabricating candidates or scores.
- No unreported provider fallback is allowed.
- If no safe candidate remains, the existing `no_safe_recommendation` outcome applies.

## 8. External Context Allowlist

The generator request may contain only:

- contract version and scope key
- objective and approved scope summary
- current gate
- allowed and forbidden actions
- approved artefact references, not full bodies
- concise evidence and missing-evidence summaries
- concise risks and constraints
- enforcement capability and evidence reference
- generation and whole-run budgets

It must exclude:

- secrets, credentials and environment values
- unrestricted repository content or source snapshots
- full artefact bodies
- raw provider prompts or prior model transcripts
- hidden reasoning
- executable commands or write-capable instructions
- unrelated worktree or user data

Any additional repository read must use an explicitly permitted read tool owned by the active surface and be surfaced as evidence provenance. The default generator request itself requires no repository retrieval.

## 9. Budgets And Limits

Initial defaults are hard upper bounds:

| Budget | Default maximum |
|---|---:|
| Generation calls per search run | 1 |
| Returned proposals | 5 |
| Generation duration | 30 seconds |
| Generation cost | 5 abstract cost units |
| Whole search duration | existing 120 seconds |
| Whole search cost | existing 20 abstract cost units |

Generation and evaluation consumption are reported separately. Abstract cost units are policy/rubric units, not provider currency. A project or surface may configure stricter limits. Higher limits require explicit project configuration and visible output; silent environment-driven increases are forbidden.

Before QA, Codex and Claude test evidence must record observed duration and provider-reported or best-available cost metadata for representative bounded calls. Observations are measurements for those runs only, not universal performance claims.

## 10. Surface Capability Policy

| Surface | Initial generation enforcement | Product behavior |
|---|---|---|
| Codex | `tool_enforced` | May use a conforming read-only, ephemeral generator transport plus mutation detection |
| Claude Code | `tool_enforced` | May use a conforming headless transport with `Edit`, `Write` and `Bash` disallowed plus mutation detection |
| GitHub Copilot | `instruction_only` | Advisory exposure only unless a conforming external transport supplies stronger evidence |
| OpenCode | `instruction_only` | Advisory exposure only unless a conforming external transport supplies stronger evidence |
| Generic/future | `instruction_only` by default | Stronger claims require validated enforcement evidence |

An instruction-only surface must display the weaker guarantee. Mapping support is not executable generator support.

## 11. Compatibility Requirements

- Existing deterministic-only CLI usage, fixtures and integrations remain supported without generator configuration.
- Generation is opt-in in the first release.
- Existing evaluator-adapter behavior and scoring semantics remain unchanged.
- New generator fields in search input and result are additive and optional for deterministic-only callers wherever the existing contract can represent them safely.
- If Solution Design proves an additive change cannot be validated unambiguously, it must introduce an explicit contract-version transition and compatibility path rather than silently changing version 1 semantics.
- Persisted historical Delivery Path Search results remain readable; new provenance fields must not require migration of old results.
- The `@agdf/cli` wrapper and `create-agdf` implementation package remain aligned and their smoke tests must cover deterministic and generated paths.

## 12. Acceptance Criteria

1. Deterministic candidates are produced first and cannot be removed or mutated by the generator.
2. The provider-neutral core owns generator contracts, budgets, normalization, diversity, legality, provenance and fallback policy.
3. A generator adapter cannot alter gates, allowed actions, scoring or persistence policy.
4. At most one generation call and five proposals occur under the default configuration.
5. Generation stops at 30 seconds or five abstract cost units and remains within whole-run budgets.
6. Generated proposals are schema-validated before any further processing.
7. Gate-illegal, forbidden, out-of-scope, malformed, duplicate and cosmetic-variant proposals never reach evaluation.
8. Every accepted generated candidate is materially distinct under the canonical diversity rule.
9. An undersized diverse set is accepted honestly without padding.
10. Generator failure retains deterministic candidates and reports a typed failure reason.
11. No automatic or unreported provider fallback occurs.
12. The outbound request contains only the normalized allowlisted fields and passes redaction fixtures.
13. Raw prompts, hidden reasoning, secrets, full artefacts and source snapshots are neither sent by default nor persisted.
14. Candidate provenance, rejection reasons and separate generation/evaluation budget use are visible in JSON and compact output.
15. Codex and Claude generator transports provide technical read-only and mutation-detection evidence.
16. Copilot, OpenCode and generic surfaces remain visibly `instruction_only` without stronger evidence.
17. Deterministic-only CLI behavior and existing fixtures remain compatible.
18. Historical persisted results remain readable without migration.
19. Focused tests cover valid diversity, cosmetic duplicates, illegal candidates, schema failure, timeout, authentication failure, cost exhaustion, deterministic fallback and `no_safe_recommendation`.
20. Runtime integrity and package smoke tests confirm coherent canonical and generated surfaces.
21. The feature remains advisory, cannot grant implementation permission and is not described as MCTS.
22. Observed Codex and Claude generation latency and available cost metadata are recorded before QA without being generalized beyond the measured runs.

## 13. Success Measures

- zero generated candidates reach evaluation after failing schema, scope, diversity or gate-legality validation in contract tests
- deterministic-only regression fixtures remain unchanged or explicitly compatibility-adapted
- every generated run reports provenance, generator status and separate budget consumption
- supported executable transports show no repository mutation in focused tests
- reviewers can reconstruct why each proposal was accepted, rejected or deduplicated without access to hidden reasoning

These are verification targets, not current performance claims.

## 14. Product Risks

- Semantic diversity is harder than textual deduplication; deterministic rules must remain explainable and testable.
- A provider may return persuasive but structurally weak proposals; schema and legality do not prove usefulness.
- External calls create privacy, cost and latency exposure; allowlists and hard budgets are mandatory.
- Provider-specific conveniences may pressure the core contract; conformance and source-of-truth checks must prevent forks.
- Fallback could hide degraded operation; generator status and failure reason must remain visible.
- Instruction-only surfaces cannot prove write prevention; capability claims must remain conservative.

## 15. Open Design Questions For SD

- Exact module and protocol names for the generator adapter and schema.
- Whether Codex and Claude generator transports reuse evaluator subprocess helpers or share a lower-level read-only transport utility.
- Exact canonicalization algorithm for normalized action intent and material-difference dimensions.
- Typed failure and provenance fields in JSON and Markdown output.
- Contract-version mechanics if optional additive fields are insufficient.
- CLI flags and project-local configuration names for opt-in generation and stricter budgets.

## 16. Next Step

PRD approved on 2026-07-11. Continue with the persisted Solution Design; implementation remains forbidden until later gates permit it.
