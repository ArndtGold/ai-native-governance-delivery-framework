# UX Intent Definition: Staged Proportionality Baseline v3

Status: `ready`
Type: internal analytical input
Run: `agdf-staged-proportionality-baseline-v3`
Date: 2026-08-19

## Decision

- decision: `ready`
- blocking_reason: `none`
- primary_user_intent: A benchmark operator can explicitly select the current staged-v3 contract,
  record or replay evidence against complete neutral facts, and understand whether the result is
  valid, blocked or incompatible without risking historical staged-v2/r3 evidence.
- success_signal: An explicit v3 invocation either produces a version-bound deterministic report
  with traceable evidence classes or fails closed with the incompatible or missing fact identified;
  legacy-v1 and staged-v2 remain independently replayable.
- primary_decision_or_action: Select `staged-v3` explicitly for offline evaluation or separately
  authorized live recording; do not infer or auto-upgrade the profile from a series directory.

## Working Modes

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| `historical_replay` | The selected legacy-v1 or staged-v2 inputs match their immutable version and provenance contracts. | selected profile/version, compatibility result, deterministic report status and blocking reasons | selected historical manifest, baseline, fingerprints and persisted observations | run CLI JSON/stdout and optional report files |
| `v3_offline_evaluation` | The selected staged-v3 manifest, corpus, fixtures, baseline and observations form one complete compatible evidence set. | selected versions, coverage, freshness, evidence class, deviations, ambiguity and pass/block status | staged-v3 manifest/baseline plus validated observation provenance | run CLI JSON/stdout and optional v3 report files |
| `v3_live_recording` | A separately authorized invocation records read-only staged-v3 observations with matching runtime, model, AGDF, adapter and source provenance. | selected profile, series, surface/model, attempt outcome, retryability, safety stop and final observation count | explicit invocation, staged-v3 manifest and persisted attempt/observation records | record CLI structured output, safe error and attempt log |

## Activation, Blockers And Recovery

- activation_paths:
  - Historical replay activates only through an explicit historical `--profile` value and series.
  - V3 offline evaluation activates only through explicit `--profile staged-v3` and a series ID.
  - V3 live recording additionally requires explicit surface, model, series and the separately
    approved execution boundary; repository implementation alone does not activate a live run.
- blockers:
  - unknown profile or missing v3 files: show the rejected selector or missing contract element and
    the allowed next action;
  - mixed profile, schema, corpus, fixture, baseline, adapter or source provenance: reject the series
    and identify the mismatching dimension;
  - missing/conflicting eligibility or Depth facts: keep the affected scenario visibly ambiguous or
    blocked and name the missing fact class;
  - leakage, mutation or redaction failure: stop safely and do not count the attempt as valid;
  - exhausted attempt budget or missing coverage: block the report and show the remaining evidence
    obligation.
- recovery_paths:
  - correct the explicit selector or provide a complete version-compatible series, then rerun;
  - for recoverable live transient execution failure, retain the invalid attempt and expose retry
    within the existing attempt budget;
  - for provenance, leakage, mutation or redaction failure, start from corrected inputs or a new
    series rather than silently overwriting valid or historical evidence;
  - never recover by rewriting staged-v2/r3 or weakening thresholds.

## Relevant State Transitions

| Trigger | Source | Target | Visible feedback | Next action | Failure or rollback |
|---|---|---|---|---|---|
| Select a supported profile and series | `unselected` | `contract_loaded` | profile and all contract versions | evaluate compatibility | reject unsupported selector without mutation |
| Validate all profile inputs | `contract_loaded` | `eligible_for_replay` | compatible versions and evidence class | run deterministic evaluation | identify mismatch and remain blocked |
| Complete deterministic evaluation | `eligible_for_replay` | `reported_pass_or_block` | coverage, deviations, ambiguity, thresholds and evidence boundary | inspect/report result | rerun only after inputs change; no historical rewrite |
| Start separately authorized live recording | `contract_loaded` | `recording` | series, surface/model and attempt budget | collect bounded observations | stop if execution authority is absent |
| Recoverable transient execution failure | `recording` | `retry_available` | invalid attempt, safe reason and remaining budget | retry explicitly/within bounded runner policy | preserve the failed attempt |
| Safety or provenance failure | `recording` | `blocked` | mutation, redaction, leakage or mismatch reason | correct inputs or start a new series | no silent retry or overwrite |
| Required observations complete | `recording` | `eligible_for_replay` | valid count and consistent provenance | run offline evaluation | incomplete coverage remains blocked |

## Proposed PRD Acceptance Criteria

- `SPB3-UX-01`: Explicit `staged-v3` selection is visible in run and record output and is never
  inferred from the series directory.
- `SPB3-UX-02`: Historical selectors remain accepted and produce their existing contract shapes.
- `SPB3-UX-03`: Every version or provenance mismatch names the incompatible dimension and leaves all
  persisted historical evidence unchanged.
- `SPB3-UX-04`: Offline output distinguishes repository assertion, deterministic replay and live
  observation evidence and never presents one as another.
- `SPB3-UX-05`: Missing or conflicting eligibility/Depth facts remain visibly ambiguous or blocked
  with one actionable evidence-completion next step.
- `SPB3-UX-06`: Recoverable transient live failure exposes retryability and remaining attempt budget;
  mutation, leakage, redaction and provenance failures stop safely without silent retry.
- `SPB3-UX-07`: A v3 report exposes selected versions, coverage, thresholds, deviations, ambiguity
  and final pass/block status while keeping expected stage/path/reason values out of agent-visible
  inputs.

## Open Product Questions

- `none`: the PRD can adopt the explicit `staged-v3` selector, additive compatibility rule,
  evidence-class separation and recovery semantics above. Exact module and schema decomposition
  remains an SD decision.

## Evidence And Routing

- affected_outputs: run CLI JSON/stdout; record CLI JSON/stdout and safe errors; optional JSON and
  Markdown reports; attempt logs; versioned corpus/fixture/baseline inputs.
- evidence: approved UR Revision 1; completed Brownfield Review; existing `--profile
  legacy-v1|staged-v2` scripts; staged-v2 manifest, pipeline and test suite; immutable r3 evidence.
- missing_evidence: implementation design, executable task/test plan, v3 deterministic outputs and
  any separately authorized authenticated live series.
- required_next_step: Incorporate this ready input into the PRD and request exact `Approval: PRD`;
  do not create SD or implement.

