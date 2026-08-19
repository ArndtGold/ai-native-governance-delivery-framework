# Brownfield Review: Staged Proportionality Baseline v3

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-staged-proportionality-baseline-v3`
- related_ur: `.agdf/control/artefacts/agdf-staged-proportionality-baseline-v3/UR.md`
- current_gate: `PRD`
- reviewer: `agent`
- reviewed_at: `2026-08-19`

## Brownfield Analysis

- mode: `post_ur_review`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `PRD`
- artefact: `.agdf/control/artefacts/agdf-staged-proportionality-baseline-v3/BROWNFIELD_REVIEW.md`
- scope: Extend the existing staged proportionality profile with a separately versioned v3 corpus,
  fixtures, baseline, adapter/provenance contract and deterministic evaluation path while preserving
  every staged-v2/r3 artefact and consuming the canonical Mode and Gate owners.
- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: The additive v3 profile changes the benchmark operator's explicit CLI
  working mode, visible compatibility state, blockers, retry/safety recovery and evidence projection.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
- ux_intent_definition_ref:
  `.agdf/control/artefacts/agdf-staged-proportionality-baseline-v3/UX_INTENT_DEFINITION.md`
- evidence:
  - `evals/proportionality/staged-manifest.json`, `staged-scenarios.json` and
    `fixtures/staged-catalog.json` own the current staged-v2 corpus and evidence packs.
  - `.agdf/control/artefacts/agdf-staged-proportionality-observation/STAGED_PROPORTIONALITY_BASELINE.json`
    and the r3 observation/report set are immutable historical evidence for this scope.
  - `create-agdf/lib/proportionality-benchmark/corpus-loader.js`, `contracts.js`,
    `blind-prompt.js`, `live-recorder.js`, `evaluator.js`, `report.js` and
    `source-fingerprint.js` form the existing single benchmark pipeline.
  - `create-agdf/scripts/run-proportionality-benchmark.js` and
    `record-proportionality-benchmark.js` expose `--profile legacy-v1|staged-v2` as an explicit CLI
    contract; a non-destructive v3 path must extend that public selector or add an equivalent
    version selector instead of silently replacing staged-v2.
  - `create-agdf/scripts/proportionality-benchmark-test.js` already owns profile, provenance,
    leakage, mutation, threshold and deterministic replay coverage.
  - Parent findings SPF-01 through SPF-04 identify the bounded cases and the accepted Structured
    Depth closeout supplies the current canonical decision policy.
- transparency: `quick_task` is ineligible because the work changes executable benchmark behavior
  and a documented CLI contract. `verified_change` is ineligible because public CLI behavior is a
  prohibited impact and the scope spans several existing owners. `structured_slice` is rejected
  because preserving staged-v2 while making v3 selectable requires a compatibility-sensitive public
  CLI/profile contract change, which is a decisive Full-Depth trigger. Full delivery does not
  authorize a live series; live execution remains a separately planned and approved evidence step.
- missing_evidence: Exact approval of PRD Revision 1; SD must then map the approved v3 selector,
  neutral fact schemas, blindness, compatibility, recovery and threshold decisions onto existing
  owners.
- current_coverage:
  - `fully_done`: one staged-v2 pipeline, 40 cases, 72 staged scenarios, six delivery paths,
    three-repeat recording, provenance fingerprints, mutation/redaction checks, deterministic
    replay and r3 historical evidence;
  - `partially_done`: stage and eventual-path separation plus versioned manifest/corpus/fixture
    handling, but only for staged-v2 facts and the pre-Depth baseline;
  - `not_done`: neutral v3 case semantics for PB-008/PB-010/PB-011, complete Verified Change facts
    for PB-016/PB-017/PB-020, complete Depth facts for PB-022/PB-028/PB-029 and a separately
    selectable v3 profile/version.
- reuse_strategy: `extend` the existing corpus loader, contract, prompt, recorder, evaluator,
  report, fingerprint, scripts and test suite; add versioned v3 data alongside v2; do not create a
  second evaluator, recorder, policy engine or benchmark-local router.
- risks:
  - A silent replacement of `staged-v2` would invalidate historical replay and provenance.
  - Expected-path or reason-code leakage could make a passing score circular.
  - Copying Mode, Gate, Verified Change or Structured Depth rules into fixtures would create a
    second policy owner.
  - Profile branching is currently hard-coded across loader, recorder, evaluator, reporter and
    scripts; an incomplete extension could mix schemas or histories.
  - A deterministic pass would not prove authenticated live-host behavior.
- context_graph_impact: `link_only`
- context_graph_refs: `CG-DELIVERY-PATH-SEARCH`; `CG-DOCUMENTATION-CEREMONY-BOUNDARY`
- context_graph_reconciliation: `resolved`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: The run consumes the existing routing and proportional-ceremony
  boundaries without changing their authority; version-specific findings stay in this scope.
- required_next_step: Review PRD Revision 1 and provide exact `Approval: PRD`, request revision or
  decline; keep SD, implementation and live execution locked.

## Existing-System View

| Area | Existing owner or artefact | Coverage | Reuse decision | Impact |
|---|---|---|---|---|
| Historical evidence | staged-v2 baseline, manifest, corpus, fixtures, r3 observations and reports | fully_done | preserve byte-for-byte and link as predecessor evidence | high |
| Corpus and profile loading | `corpus-loader.js` plus staged manifest | partially_done | extend with explicit v3 identity and mismatch rejection | high |
| Agent input contract | `contracts.js` and `blind-prompt.js` | partially_done | extend versioned facts; retain leakage and redaction guards | high |
| Live evidence | `live-recorder.js` and record script | partially_done | extend provenance only after an approved execution plan | high |
| Deterministic grading | `evaluator.js` and `report.js` | partially_done | extend without weakening thresholds or evidence labels | high |
| Public CLI | run/record scripts and their `--profile` usage contract | partially_done | compatibly extend; keep legacy and staged-v2 accepted | high |
| Regression evidence | `proportionality-benchmark-test.js` | fully_done for v2 | extend with v2 immutability, v3 positive and mismatch negatives | high |
| Canonical policy | Modes and Gate Transition contracts | fully_done | consume by fingerprint/reference; do not duplicate | high |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Existing pipeline is already shared | loader, recorder, evaluator and reporter serve legacy-v1 and staged-v2 | block | Extend the shared pipeline; no v3-only runner or evaluator. |
| Historical evidence has stable provenance | staged manifest versions and r3 fingerprints | block | Add new versions and negative history-drift tests; never edit v2/r3. |
| CLI profile selection is explicit | both run and record usage strings enumerate accepted profiles | block | Treat v3 selection as a designed compatibility contract in PRD/SD. |
| Canonical decision rules already exist | Modes, Gate Transition and Structured Depth closeout | block | Fixtures carry neutral facts only; source fingerprints bind current owners. |
| Candidate implementation paths are currently clean | scoped Git status returned no changes for `evals/proportionality/**` or benchmark implementation/scripts | warn | Revalidate immediately before implementation and isolate unrelated control-state edits. |

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `external_contract_depth`
- decisive_full_depth_triggers:
  - `external_contract_depth`: v3 must be independently selectable without replacing staged-v2;
    the existing run/record CLI exposes accepted `--profile` values and its observation schemas,
    provenance and reports are compatibility-sensitive contracts.
- rejected_alternative: `structured_slice` is rejected because the required non-destructive version
  separation cannot be delivered without changing the public profile/version selection contract;
  bounded internal ownership does not neutralize that decisive effect.
- missing_or_conflicting_facts: `none`
- depth_evidence_refs: `UR.md` SPB3-1 through SPB3-8;
  `create-agdf/scripts/run-proportionality-benchmark.js`;
  `create-agdf/scripts/record-proportionality-benchmark.js`;
  `create-agdf/lib/proportionality-benchmark/corpus-loader.js`;
  `evals/proportionality/staged-manifest.json`; Modes Contract Structured Depth Decision.

| Check ID | Result | Evidence |
|---|---|---|
| `coherent_outcome` | pass | One independently accepted outcome: a neutral, versioned v3 benchmark that preserves v2/r3. |
| `authority_boundary` | pass | Mode, Gate, Verified Change and Depth authority remain with canonical contracts; the benchmark only supplies facts and observations. |
| `owner_consumer_coordination` | pass | Owners are identified inside the existing benchmark pipeline and no independent external consumer cutover is required. |
| `full_depth_impacts_absent` | fail | A compatibility-sensitive public CLI/profile and observation contract change is necessarily present. |
| `migration_propagation_bounded` | pass | No historical migration occurs; v3 is additive, and propagation stays within the existing pipeline and generated evidence. |
| `failure_recovery_local` | pass | Invalid versions, mixed provenance, leakage, mutation and incomplete evidence can fail closed inside the benchmark tooling. |
| `independently_acceptable` | pass | Repository implementation and deterministic replay can be accepted before any separately authorized live series. |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Is the public selector `staged-v3` or a separate protocol/version option, and what remains backward compatible? | PRD | block |
| What exact neutral facts distinguish control state, permitted action and mutation intent? | PRD | block |
| Which five Verified Change facts and seven Depth facts are agent-visible, and which expected values remain grader-only? | PRD | block |
| How are 40 cases, six paths, adversarial coverage and safety thresholds preserved without target tuning? | PRD | block |
| What explicit evidence gate separates repository replay from authenticated live observations? | PRD | revise |
| Which existing module owns each v3 schema, provenance and failure rule? | SD | revise |
| How are staged-v2 hashes and replay protected against accidental mutation? | SD | revise |

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: `external_contract_depth` — an additive, history-preserving v3 necessarily extends
  the public profile/version CLI and compatibility-sensitive observation/provenance contract.
- evidence: complete Structured Depth Evidence above; approved UR Revision 1; existing CLI, loader,
  recorder, evaluator, reporter and historical v2/r3 evidence.
- transparency_note: Full depth follows from public-contract effect, not from file or owner count.
  No release, host execution or historical rewrite is included.

## Knowledge Persistence Decision

- memory_target: `scope_artifact`
- memory_reason: Version-specific ownership, compatibility and evidence boundaries belong to this
  run; no new reusable Context Graph authority is created.
- memory_refs: `.agdf/control/artefacts/agdf-staged-proportionality-baseline-v3/BROWNFIELD_REVIEW.md`

## Next Permissible Step

- next_allowed_action: Review PRD Revision 1 and provide exact `Approval: PRD`, request revision or
  decline.
- forbidden_until_then: SD, TP, benchmark or runtime changes, live recording, QA/UAT, VCS, release,
  deployment and reinstall.
