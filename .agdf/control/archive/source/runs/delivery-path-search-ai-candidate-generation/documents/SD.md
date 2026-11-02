# Solution Design: AI-Native Delivery Path Candidate Generation

Status: approved
Gate: SD
Gate approval: `Approval: SD`
Date: 2026-07-11
Owner: agent
Derived from: approved `PRD.md`; `BROWNFIELD_REVIEW.md`

## 1. Design Outcome

Extend the existing provider-neutral Delivery Path Search runtime with one optional candidate-generator phase before evaluation. Deterministic candidates remain the baseline. A generator adapter may add concrete proposals, but the core alone validates contracts, maps proposals to legal AGDF actions, removes cosmetic or materially duplicate variants, enforces budgets and exposes provenance and failure state.

The change extends the existing module tree. It does not create a second search engine, gate model, scoring system or persistence owner.

## 2. Existing Owners To Extend

| Existing owner | Design responsibility |
|---|---|
| `state-adapter.js` | Add optional normalized generation configuration and build the allowlisted generator context |
| `contracts.js` | Validate additive generation input/result fields and versioned generator request/response schemas |
| `candidate-policy.js` | Preserve deterministic baseline; own proposal normalization, legality mapping, deduplication and material-diversity checks |
| `search-engine.js` | Orchestrate at most one generation attempt before evaluation and combine accepted proposals with baseline candidates |
| `evaluators/` | Remain evaluation-only; reuse only lower-level read-only transport utilities |
| `surfaces/capabilities.js` | Continue to own enforcement claims used by evaluation and generation |
| `persistence.js` | Persist redacted generation status, provenance, budgets and rejection summaries |
| `create-agdf.js` | Own opt-in CLI flags, generator selection and project/runtime wiring |
| focused test scripts | Own contract, policy, orchestration, fallback and compatibility evidence |

## 3. Module Design

Add under `create-agdf/lib/delivery-path-search/`:

```text
generators/
  protocol.js
  codex.js
  claude.js
transports/
  read-only-guard.js
```

- `generators/protocol.js` exposes a deterministic fixture generator and validates the canonical generator interface.
- Provider generator modules own command construction, schema-constrained output and runtime metadata only.
- `transports/read-only-guard.js` centralizes repository-state snapshots, mutation detection, timeout/error normalization and temporary-file cleanup currently duplicated by evaluator adapters. It contains no provider commands, prompts or AGDF policy.

Existing evaluators may adopt the shared guard only when their observable behavior and tests remain unchanged.

## 4. Additive Contract Strategy

Keep `CONTRACT_VERSION = "1"` because deterministic callers remain valid and new fields are optional. Add `GENERATOR_CONTRACT_VERSION = "1"` for the new adapter boundary.

### Search input

Add optional `generation`:

```json
{
  "enabled": false,
  "max_calls": 1,
  "max_proposals": 5,
  "max_duration_ms": 30000,
  "max_cost_units": 5
}
```

When absent, normalize to disabled defaults. `max_calls` must equal one; numeric limits are positive integers within approved maxima and cannot exceed whole-run limits. Enabled generation requires a configured adapter and evidenced surface capability.

### Candidate

Add optional fields:

- `source`: `deterministic | generated | expanded`
- `gate_action`: canonical allowed AGDF action used for legality
- `intent`: concrete path intent
- `affected_boundaries`: normalized string array
- `risk_strategy` and `reversibility`
- `generator_proposal_id` for generated candidates

Legacy candidates default to `source: deterministic`, with `gate_action` and `intent` equal to `action`. This separates a concrete path from the canonical gate action it instantiates. Legality continues to compare exact normalized `gate_action` values with canonical allowed and forbidden actions.

### Search result

Add `generation` with status (`disabled | success | partial | failed`), adapter/model metadata, configured and consumed budgets, returned/accepted/rejected counts, typed failure code and rejection summaries. Historical results without the field remain readable as legacy deterministic runs.

## 5. Generator Request And Response

The core constructs a fresh allowlisted request; it never forwards complete search input or control files by reference.

Request fields are limited to generator contract version, scope key, objective and approved scope summary, current gate, canonical actions, approved artefact references, concise evidence/missing-evidence/risk/constraint summaries, enforcement capability and generator budgets. Arrays and strings are bounded. Secret, credential, environment, raw-prompt, source-snapshot and hidden-reasoning fields are rejected.

The response contains contract version, proposals, observable adapter/model metadata and abstract cost units. Each proposal contains `proposal_id`, `gate_action`, `intent`, expected evidence, tests, assumptions, affected boundaries, risk strategy and reversibility. Unknown fields, executable payloads, invalid ranges, excess proposals or missing required fields reject the response. Hidden reasoning is neither requested nor accepted.

## 6. Deterministic Candidate Pipeline

1. Validate and normalize search input.
2. Create deterministic baseline candidates.
3. If generation is disabled, continue unchanged.
4. Build the allowlisted generator request.
5. Invoke exactly one adapter under its hard timeout.
6. Validate the complete response before accepting proposals.
7. For each proposal in stable order, validate `gate_action`, normalize fields, reject duplicates, apply diversity rules and accept within budget.
8. Append accepted generated candidates after deterministic candidates.
9. Run the unchanged evaluation, ranking and stopping pipeline.
10. Return recommendation, alternatives, rejection reasons and separate generation/evaluation budgets.

Generator failure never removes baseline candidates. It reports failure and continues deterministically unless the whole-run budget is exhausted. Mutation detection invalidates the entire run because the read-only guarantee failed.

## 7. Normalization And Diversity

Normalize intent using Unicode NFKC, lowercase, Markdown/punctuation removal, whitespace collapse and a small versioned stop-word set. Compare token sets using Jaccard similarity.

Two intents are cosmetic variants when normalized strings match, or token similarity is at least `0.8` and their structured decision signatures match.

The signature uses normalized `gate_action`, affected boundaries, evidence categories, test categories, risk strategy and reversibility category. A generated candidate is materially distinct only when its intent is not cosmetic and at least one signature dimension differs from every accepted candidate sharing its `gate_action`.

Thresholds, stop words and category normalization are versioned constants in `candidate-policy.js`. Adapters cannot override them. Ambiguous proposals fail closed as duplicates.

## 8. Budget And Timeout Enforcement

- Core validation checks maxima before invocation.
- Adapters enforce a 30-second subprocess timeout and terminate timed-out children.
- The core measures elapsed time independently.
- Response cost is an integer within the configured generation maximum.
- Generation cost/time count against whole-run budgets before evaluation.
- If no whole-run budget remains, no evaluation starts and the stopping reason is reported.
- Environment variables may supply credentials but cannot increase budgets.

## 9. Read-Only Enforcement

- Codex uses ephemeral `codex exec` with read-only sandboxing, schema output and before/after mutation detection.
- Claude uses headless `claude -p`, disallows `Edit`, `Write` and `Bash`, requests schema output and performs mutation detection.
- No native Copilot or OpenCode generator is added. Without a conforming external adapter, invocation fails visibly and remains `instruction_only`.

## 10. CLI And Configuration

Extend `delivery-path-search` with:

- `--generate-candidates`
- `--generator-model <id>`
- `--max-generated-candidates <n>` (maximum 5)
- `--generation-timeout-ms <n>` (maximum 30000)
- `--generation-cost-units <n>` (maximum 5)

`--surface` selects matching generator and evaluator adapters. Existing `--model` remains evaluator-specific. Absence of `--generate-candidates` preserves deterministic operation. No environment-driven policy or second configuration source is introduced.

## 11. Persistence And Output

JSON adds the `generation` object. Compact text shows status, accepted/returned counts, cost, duration and typed failure. Persist only normalized candidate fields, adapter/model identifiers, counters, budgets and rejection codes. Never persist prompts, raw responses, hidden reasoning, secrets or full artefact/source content.

## 12. Failure Model

Typed failures:

- `generator_unavailable`
- `generator_timeout`
- `generator_authentication_failed`
- `generator_schema_invalid`
- `generator_budget_exceeded`
- `generator_mutation_detected`
- `generator_context_rejected`
- `generator_no_diverse_proposals`

Failures remain visible and do not trigger provider switching.

## 13. Test Design

Contract and unit tests cover legacy input, generation bounds, allowlisting, response validation, legality, exact/cosmetic duplicates, diversity, stable ordering and adapter-policy isolation.

Integration tests cover baseline plus generation, all-proposals-rejected fallback, timeout/auth/schema/context/cost failures, whole-run exhaustion, mutation invalidation, separate budget accounting and legacy persistence readability.

Surface/package tests cover Codex and Claude read-only evidence, explicit unsupported instruction-only surfaces, CLI help/default/opt-in behavior, focused and smoke tests, wrapper smoke tests, runtime integrity and generated-asset consistency. Live calls are bounded probes, never routine deterministic CI dependencies.

## 14. Source Of Truth And Propagation

- Runtime: `plugin/meta/agdf-runtime-contract.md`
- Skill: `plugin/skills/delivery-path-search/SKILL.md`
- Implementation: `create-agdf/lib/delivery-path-search/`
- CLI: `create-agdf/bin/create-agdf.js`
- Generated assets: `create-agdf/scripts/sync-package-assets.js`
- Public claims: `README.md`, `INSTALL.md`, `create-agdf/README.md`, `agdf/README.md`, `pages/src/data/site.ts` when directly affected

Canonical sources change first, followed by sync and validation. Generated output is never edited directly.

## 15. Verification Plan

Before QA:

1. focused generator contract/policy and Delivery Path Search integration/unit tests
2. bounded Codex and Claude live probes with duration, available cost metadata and zero-mutation evidence
3. `node plugin/scripts/check-runtime-integrity.mjs`
4. `npm --prefix create-agdf run smoke-test`
5. `npm --prefix agdf run smoke-test`
6. `doctor --json`, `gate-check --json` and delivery-map evidence

## 16. Rejected Alternatives

- Evaluator `child_actions` as initial generation: conflates evaluation expansion with generation and hides budgets/provenance.
- Provider-side filtering: creates multiple policy owners.
- Replacing deterministic candidates: removes the safe baseline.
- A second AI search engine: duplicates existing ownership.
- Textual uniqueness only: admits cosmetic variants.
- Generation enabled by default: changes existing cost, privacy and latency behavior.

## 17. Remaining TP Inputs

- Map PRD acceptance criteria and this design to implementation/test tasks.
- Define fixtures for diversity thresholds and signatures.
- Define bounded live-probe evidence capture.
- Confirm exact documentation surfaces against the implementation diff.

## 18. Next Step

SD approved on 2026-07-11. Continue with the persisted Task/Test Plan; implementation remains forbidden until TP approval and pre-implementation Brownfield Analysis.

## 19. Implementation Deviation

Code review found that the approved rule "Jaccard similarity at least 0.8 and equal structured signature" was logically redundant with the separate requirement that every accepted candidate differ in at least one structured signature dimension. The implementation therefore rejects a proposal when any of these deterministic conditions holds: equal normalized intent, equal structured decision signature, or Jaccard token similarity at least 0.8. This is stricter than the draft algorithm, remains within the approved minimum-diversity product boundary, avoids dead comparison logic and is covered by dedicated fixtures.
