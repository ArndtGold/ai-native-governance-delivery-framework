# PRD: Staged Proportionality Baseline v3

Status: `approved`
Gate: PRD
Gate approval: exact `Approval: PRD` on 2026-08-19 after revalidation of run, gate, Revision 1 and durable artefact
Revision: 1
Based on: approved UR Revision 1 and completed Brownfield Review
Date: 2026-08-19
Owner: user / agent
Run: `agdf-staged-proportionality-baseline-v3`

## 1. Product Scope

Deliver an additive `staged-v3` proportionality benchmark contract in the existing shared pipeline.
It must preserve legacy-v1 and staged-v2/r3, retain the 40-case and six-path safety baseline, replace
the identified ambiguous or incomplete v2 facts with complete neutral v3 facts, and keep live
observation, deterministic replay and repository assertion evidence visibly separate.

The delivered product behavior includes:

- explicit `staged-v3` selection for both run and record commands while existing selectors remain
  compatible;
- independently versioned v3 manifest, protocol, corpus, fixture, baseline, adapter and report
  provenance;
- distinct control-state, currently permitted action and eventual mutation-intent facts for
  `PB-008`;
- unambiguous action semantics for `PB-010` and `PB-011`;
- all five canonical Verified Change eligibility fact groups for `PB-016`, `PB-017` and `PB-020`;
- complete versioned Structured Depth facts for structured cases, including `PB-022`, `PB-028` and
  `PB-029`, without expected path or reason-code leakage;
- deterministic v3 validation, grading and reporting with unchanged safety thresholds;
- fail-closed compatibility, completeness, freshness, leakage, mutation and provenance behavior.

Actual authenticated live-series execution is not part of implementation acceptance. It requires a
separate bounded execution plan and authority after repository implementation is approved.

## 2. UX Intent And Success

- ui_ux_impact: `medium`
- ux_intent_definition:
  `.agdf/control/artefacts/agdf-staged-proportionality-baseline-v3/UX_INTENT_DEFINITION.md` — `ready`
- primary_user_intent: Explicitly select the current staged benchmark contract, record or replay
  trustworthy evidence and understand valid, blocked and incompatible outcomes without risking
  historical evidence.
- success_signal: A v3 invocation produces a version-bound deterministic result or a precise
  fail-closed next action; legacy-v1 and staged-v2 remain independently replayable.
- primary_decision_or_action: Choose `--profile staged-v3` explicitly for offline evaluation or a
  separately authorized live recording; no implicit profile upgrade is allowed.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| `historical_replay` | Selected legacy-v1 or staged-v2 inputs match their immutable versions and provenance. | profile/version, compatibility, report status, blocking reasons | historical manifest, baseline, fingerprints and observations | run CLI and optional report files |
| `v3_offline_evaluation` | V3 manifest, corpus, fixtures, baseline and observations are complete and mutually compatible. | versions, coverage, freshness, evidence class, deviations, ambiguity, pass/block | v3 manifest/baseline and validated observation provenance | run CLI and v3 reports |
| `v3_live_recording` | Separately authorized read-only recording produces v3 observations with one consistent provenance set. | series, surface/model, attempt outcome, retryability, safety stop, valid count | explicit invocation, v3 manifest and persisted attempt/observation records | record CLI and attempt log |

The benchmark contracts decide what evidence is valid. CLI and report projections communicate that
state and the next permitted action; they do not create a second policy or approval authority.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation:
  - activate v3 only through explicit `--profile staged-v3`;
  - offline evaluation additionally requires a valid series ID;
  - live recording additionally requires explicit surface, model and series plus separate execution
    authority;
  - completion or a fail-closed terminal safety condition ends an invocation; no implicit fallback
    to staged-v2 is allowed.
- blockers_and_visible_next_actions:
  - unknown profile or missing contract file: name the selector/file and show how to select or supply
    a supported complete profile;
  - mixed version or provenance: name the mismatching dimension and require a compatible series or
    new series;
  - incomplete/conflicting eligibility or Depth facts: keep the scenario ambiguous/blocked and name
    the fact group to complete;
  - missing coverage: report the affected scenario IDs and required observation count;
  - leakage, mutation or redaction failure: stop, exclude the attempt and require corrected inputs.
- recovery_paths:
  - correct selector/input compatibility and rerun offline;
  - retain a recoverable transient live failure in the attempt log and expose bounded retry;
  - use corrected inputs or a new series for safety/provenance failure;
  - never recover by overwriting staged-v2/r3, silently replacing valid observations or weakening a
    threshold.
- relevant_state_transitions:
  - explicit selection -> contract loaded -> compatibility passed -> replay eligible -> report
    pass/block;
  - explicit authorized recording -> recording -> valid observation or retained invalid attempt ->
    retry available / safety block -> coverage complete -> replay eligible;
  - any version, leakage, mutation, redaction or provenance mismatch -> blocked with visible reason
    and no historical mutation.

## 5. Product Requirements And Acceptance Criteria

### 5.1 Versioning And Compatibility

- `SPB3-PR-01`: The public selector is `staged-v3`. Both run and record commands accept it
  explicitly, identify it in structured output and continue to accept `legacy-v1` and `staged-v2`
  with their existing behavior and output contracts.
- `SPB3-PR-02`: V3 has explicit independent manifest, protocol, corpus, fixture, baseline, adapter
  and runner/report versions. A v3 series records every applicable version and rejects any mixed or
  stale set before grading.
- `SPB3-PR-03`: All staged-v2 manifests, corpus, fixtures, baseline, observations and reports remain
  byte-identical to their pre-v3 hashes. Historical replay remains executable.

### 5.2 Neutral Scenario Facts

- `SPB3-PR-04`: `PB-008` agent-visible input separately states the effective control state, the
  currently permitted read-only/clarification action and whether an eventual mutation is requested.
  A blocked mutation state must not erase a permitted clarification action.
- `SPB3-PR-05`: `PB-010` explicitly identifies whether the requested result is a non-normative
  clarification with no semantic change or a user-facing semantic mutation; only one interpretation
  is present in the v3 task.
- `SPB3-PR-06`: `PB-011` explicitly identifies either read-only verification/explanation or an
  actual mutation task; v3 must not describe one while grading the other.
- `SPB3-PR-07`: Agent-visible scenario and evidence-pack data contain task and state facts only.
  Expected next stage, expected delivery path, normalized reason code, target rationale, thresholds
  and grader labels remain unavailable to the evaluated agent.

### 5.3 Verified Change And Structured Depth Facts

- `SPB3-PR-08`: Each of `PB-016`, `PB-017` and `PB-020` exposes all five eligibility fact groups:
  one canonical owner with bounded source/derived paths; explicit prohibited-impact assessment;
  deterministic propagation and validation; full baseline commit plus tracked/untracked candidate
  path cleanliness; and one explicit `structured_slice|structured_delivery` escalation target.
- `SPB3-PR-09`: Missing, unknown, false or conflicting Verified Change facts make the candidate
  ineligible and expose the declared structured escalation target; the benchmark never fills a fact
  from expected output.
- `SPB3-PR-10`: Every structured v3 case exposes `depth_policy_version: 1`, complete evidence for all
  six Full-Depth trigger families and all seven bounded-slice checks, without an expected decision or
  primary reason code.
- `SPB3-PR-11`: Grading derives the structured expectation only from the approved versioned baseline
  and canonical Modes semantics. Missing/conflicting decisive facts are graded as fail-closed
  unresolved/blocked evidence, not as a default Full Delivery result.

### 5.4 Coverage, Safety And Evidence Separation

- `SPB3-PR-12`: V3 contains exactly 40 cases, all six delivery paths, at least 10 adversarial cases
  and a complete staged scenario set traceable one-to-one to its baseline. Any count or identity
  mismatch blocks loading.
- `SPB3-PR-13`: Thresholds remain: zero tolerated critical under-governance, zero tolerated stage
  deviation and at most 10 percent unanimous over-governance in the small-path segment. Missing,
  mixed, stale or ambiguous evidence blocks the report.
- `SPB3-PR-14`: Every report labels evidence as repository assertion, deterministic synthetic/replay
  evidence or live agent observation. No report may infer authenticated host behavior from repository
  or replay evidence.
- `SPB3-PR-15`: Source fingerprints bind neutral prompt input, fixtures, relevant canonical behavior
  sources and adapter version. Any post-recording drift makes the affected observation stale.
- `SPB3-PR-16`: The live recorder remains read-only against a disposable fixture, rejects workspace
  mutation and unsafe/redacted output, persists attempt provenance and never silently counts an
  invalid attempt.

### 5.5 User-Visible CLI Intent Criteria

| criterion_id | working_mode | source_state | trigger/action | expected_effective_state | visible_feedback | blocker/failure_behavior | recovery/next_action | observable_success | required_evidence |
|---|---|---|---|---|---|---|---|---|---|
| `SPB3-UX-01` | v3_offline_evaluation | unselected | invoke run with `--profile staged-v3` and series | v3 contract selected explicitly | output names profile and versions | unsupported selector fails before reading a series | choose a supported selector | no implicit upgrade/fallback | CLI positive/negative tests |
| `SPB3-UX-02` | historical_replay | contract_loaded | select legacy-v1 or staged-v2 | historical contract retained | existing output shape/status | history/provenance drift blocks | restore immutable input | historical replay unchanged | hash and snapshot tests |
| `SPB3-UX-03` | any | contract_loaded | validate input versions/provenance | compatible or blocked | mismatching dimension named | no partial grading or mutation | supply compatible/new series | deterministic mismatch result | mismatch matrix tests |
| `SPB3-UX-04` | v3_offline_evaluation | replay_eligible | evaluate complete series | one deterministic report | evidence class, coverage, deviations, ambiguity and status | incomplete/stale/ambiguous stays block | complete or refresh evidence | repeated runs byte-equivalent apart from allowed paths/timestamps | replay snapshots |
| `SPB3-UX-05` | v3_offline_evaluation | facts_loaded | validate eligibility/Depth facts | facts complete or scenario blocked | missing fact group and next action | no inferred/default decision | complete facts and rerun | targeted negative cases block | fixture/schema tests |
| `SPB3-UX-06` | v3_live_recording | recording | transient execution failure | retry remains bounded | safe reason and remaining budget | invalid attempt excluded | retry within budget | attempts remain auditable | recorder tests |
| `SPB3-UX-07` | v3_live_recording | recording | mutation/leakage/redaction/provenance failure | terminal safety block | failure category without secret leakage | no silent retry/overwrite | correct inputs or new series | zero invalid observations counted | safety negative tests |

## 6. Non-Goals

- Regrade, edit, delete or replace staged-v2/r3 evidence.
- Change Mode, Gate, approval, Brownfield, QA, Verified Change or Structured Depth policy.
- Add a benchmark-local router, policy matrix, evaluator executable or second recorder pipeline.
- Tune tasks, fixtures, expected paths or thresholds to obtain a preferred score.
- Claim that deterministic replay proves a live host, surface, model or cross-host result.
- Execute an authenticated live series without a later separate bounded plan and authority.
- Implement Unified Journey or alter Task Target, Interaction, OpenCode activation or other active
  workstreams.
- Commit, push, open a PR, publish, deploy, release or reinstall.

## 7. Users And Roles

- benchmark operator: explicitly selects a profile, records or replays evidence and consumes the
  structured result;
- framework maintainer: owns version compatibility, neutral fixtures, historical integrity and the
  delivery of this run;
- evaluated agent: receives only neutral task/state facts and current canonical behavior sources;
- deterministic grader: compares validated observations with the hidden versioned baseline;
- user/approver: approves PRD, SD, TP, QA and UAT and separately authorizes any live execution or VCS
  action;
- canonical policy owners: Modes, Gate Transition and Verified Change contracts remain authoritative
  and are not delegated to the benchmark.

## 8. Constraints

- Additive compatibility: legacy-v1 and staged-v2 stay supported and historically immutable.
- One pipeline: v3 extends existing loader, contract, prompt, recorder, evaluator, reporter and
  scripts; no parallel implementation.
- Blindness: agent-visible input must pass deterministic target-leakage checks.
- Fail closed: unknown, missing, mixed, conflicting or stale facts never count as a correct result.
- Safety: zero critical under-governance and zero mutation/redaction tolerance remain binding.
- Comparability: versions, source fingerprints, model, surface, runtime, AGDF and adapter provenance
  must be explicit for live evidence.
- Evidence honesty: repository tests, deterministic replay and authenticated live observation remain
  distinct claims.
- Current dirty worktree: unrelated control-state edits exist and must remain isolated; benchmark
  candidate paths were clean at Brownfield Review and must be revalidated before implementation.

## 9. Evidence Requirements

- Pre/post hashes proving every staged-v2/r3 file in scope is unchanged.
- Schema and loader tests for explicit `staged-v3`, retained historical profiles, unknown profile,
  missing files and every mixed-version/provenance dimension.
- Neutrality tests proving expected stage, path, reason, rationale and thresholds cannot reach the
  live prompt or agent-visible fixture.
- Targeted scenario tests for PB-008, PB-010, PB-011, PB-016, PB-017, PB-020, PB-022, PB-028 and
  PB-029, including missing/conflicting fact negatives.
- Exact 40-case, six-path, adversarial and staged-scenario identity/coverage checks.
- Deterministic full-pass replay plus missing, stale, mixed, ambiguous, leakage, mutation, redaction,
  critical-under and small-over negative series.
- Backward-compatibility snapshots for legacy-v1 and staged-v2 CLI/report behavior.
- Repeated v3 evaluation demonstrating deterministic JSON/Markdown output for identical inputs.
- Explicit evidence-class labels and non-claims in reports and later QA/OR.
- Any live series, if later separately authorized, must record surface, model, runtime, AGDF, adapter,
  profile/protocol/corpus/fixture/baseline versions, source fingerprint, timestamps, attempts and
  mutation/redaction status.

## 10. Risks And Open Questions

- SD must choose a single profile/version dispatch model that avoids duplicating staged logic across
  every module while preserving exact historical branches.
- SD must define the v3 fact schemas and which owner validates each cross-field invariant.
- SD must define how baseline-only expectations remain inaccessible to prompt construction and live
  recording while deterministic grading can consume them.
- SD must define the immutable v2/r3 hash inventory and the failure mode for drift.
- TP must map every acceptance criterion to focused and full regression evidence without requiring a
  costly authenticated live series for repository QA.
- A future model may still fail the neutral v3 benchmark. That is a valid observation and cannot
  authorize fixture or threshold weakening.

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`
