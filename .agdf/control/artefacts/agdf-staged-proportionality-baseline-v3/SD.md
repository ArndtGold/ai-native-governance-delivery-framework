# SD: Staged Proportionality Baseline v3

Status: `approved`
Gate: SD
Gate approval: exact `Approval: SD` on 2026-08-19 after revalidation of run, gate, Revision 1 and durable artefact
Revision: 1
Based on: approved PRD Revision 1
Date: 2026-08-19
Owner: user / agent
Run: `agdf-staged-proportionality-baseline-v3`

## 1. Solution Overview

Extend the existing proportionality benchmark as one profile-driven pipeline. Add `staged-v3` as an
explicit additive profile, centralize profile metadata that is currently repeated as
`profileId === "staged-v2"`, and make the existing loader, prompt, recorder, evaluator, reporter and
CLI scripts consume that registry. Legacy-v1 and staged-v2 retain their exact contracts and data.

V3 uses new manifest, scenario, fixture, hidden baseline and historical-provenance files. Agent-visible
v3 inputs contain complete neutral action, Verified Change and Structured Depth facts. Expected stage,
path, reason code, rationale and thresholds exist only in the hidden baseline and grader path.

Repository acceptance uses deterministic synthetic v3 observations and negative fixtures. The
recorder is made v3-capable, but no authenticated live series is executed or persisted by this run
without a separate approved execution plan.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design action | Prohibited parallel owner |
|---|---|---|---|
| Profile identity and technical versions | new `create-agdf/lib/proportionality-benchmark/profiles.js` | central registry for legacy-v1, staged-v2 and staged-v3 metadata | profile conditionals copied across scripts/modules |
| Delivery-path and depth semantics | `plugin/meta/contracts/modes.md` | consume through behavior source text/fingerprint | fixture-local routing or Depth policy |
| Gate/stage legality | `plugin/meta/contracts/gate-transition.md` | consume through behavior source text/fingerprint | benchmark-local gate transition table |
| V3 corpus identity | `evals/proportionality/staged-v3-manifest.json` | point to v3 scenarios, fixtures, baseline and history inventory | implicit file-name or directory inference |
| Agent-visible scenarios | `evals/proportionality/staged-v3-scenarios.json` | neutral task, state and action facts | hidden expected values in prompts/fixtures |
| Agent-visible evidence packs | `evals/proportionality/fixtures/staged-v3-catalog.json` | complete Verified Change/Depth fact objects | counts or desired path as a decision proxy |
| Hidden v3 expectations | `.agdf/control/artefacts/agdf-staged-proportionality-baseline-v3/STAGED_PROPORTIONALITY_BASELINE_V3.json` | grader-only stage/path/rationale and constraints | duplicated expected values in scenario files |
| Historical immutability | `evals/proportionality/staged-v3-history-provenance.json` | SHA-256 inventory of every protected staged-v2/r3 input and result | mutable prose-only history claim |
| Profile loading and cross-file validation | `corpus-loader.js` | one loader dispatching through registry and family validators | v3-only loader |
| Agent output and normalization | `contracts.js` | versioned schemas with shared staged invariants | v3-only output parser |
| Blind prompt | `blind-prompt.js` | profile-aware prompt built only from validated visible data | alternate v3 prompt runner |
| Live observation | `live-recorder.js` and existing record script | generic profile metadata/provenance; same read-only fixture boundary | second recorder executable |
| Deterministic grading/reporting | `evaluator.js` and `report.js` | generic staged evaluator/report projection parameterized by profile definition | second v3 evaluator or reporter |
| Regression evidence | `create-agdf/scripts/proportionality-benchmark-test.js` | extend the existing suite and synthetic series helpers | standalone unintegrated test harness |

## 3. Architecture Decisions

### AD-01 — One immutable profile registry

Add `profiles.js` exporting a frozen registry and lookup helpers. Each profile definition contains:

- `profile_id`, family (`legacy` or `staged`), public selector and manifest path;
- observation `schema_version`, `protocol_version`, `adapter_version` and `runner_version`;
- scenario observation-key strategy and fixture selection strategy;
- supported evidence kind and whether historical-provenance validation is mandatory.

Unknown profile IDs fail before corpus or series access. CLI usage text derives its accepted values
from the registry so documentation and execution cannot drift. Existing public constants required by
tests or callers remain compatibility aliases to the matching registry values.

### AD-02 — Additive v3 file set

Add these new profile files without editing staged-v2/r3 data:

- `evals/proportionality/staged-v3-manifest.json`;
- `evals/proportionality/staged-v3-scenarios.json`;
- `evals/proportionality/fixtures/staged-v3-catalog.json`;
- `evals/proportionality/staged-v3-history-provenance.json`;
- `.agdf/control/artefacts/agdf-staged-proportionality-baseline-v3/STAGED_PROPORTIONALITY_BASELINE_V3.json`.

The manifest uses `profile_id: staged-v3`, `protocol_version: 3`, independent semantic versions for
corpus, fixture and baseline, three required repeats, the existing attempt ceiling and the evidence
boundary `staged live routing observations with deterministic offline grading`.

The history inventory records repository-relative path plus SHA-256 for every protected staged-v2
manifest/scenario/fixture/baseline file and every persisted r3 attempt, observation and report
artefact. V3 loading and tests reject missing, additional-to-the-declared-protected-set, or changed
protected files with `PROPORTIONALITY_HISTORY_DRIFT`. The inventory itself is new v3 evidence and is
not written during normal evaluation.

### AD-03 — Versioned neutral scenario contract

V3 scenario records retain `scenario_id`, `case_id`, `lifecycle_stage`, `requested_axes`, task and
repository/control context, and optional `evidence_pack_id`. They may additionally carry a
`classification_facts` object with only these neutral dimensions:

- `effective_control_state`;
- `currently_permitted_action` (`clarification`, `read_only_verification`, `non_normative_edit`,
  `mutation`, or `none`);
- `mutation_intent` (`none`, `eventual`, or `current`);
- `semantic_effect` (`none`, `non_normative`, or `user_facing`).

For PB-008 all four dimensions are explicit. PB-010 and PB-011 each select one unambiguous action and
semantic effect; v3 does not retain the contradictory v2 wording. The values describe the task and
current state, never the expected stage or path.

### AD-04 — Complete Verified Change fact object

The v3 evidence packs for PB-016, PB-017 and PB-020 contain `verified_change_facts` with:

1. `canonical_owner` and explicit bounded `source_paths`/`derived_paths`;
2. all prohibited impacts as explicit booleans with evidence text;
3. deterministic propagation command(s) where derived paths exist and at least one deterministic
   validation command;
4. a full baseline commit identifier, tracked/untracked baseline path lists and explicit candidate
   path cleanliness;
5. one explicit `structured_slice|structured_delivery` escalation target.

The object contains no expected selected mode. Missing, unknown, invalid or conflicting facts make
Verified Change ineligible and must be visible to grading as fail-closed escalation evidence.

### AD-05 — Complete Structured Depth fact object

Structured evidence packs contain `structured_depth_facts` with:

- `depth_policy_version: 1` and `depth_facts_status: complete`;
- one fact/evidence record for each of the six Full-Depth trigger families;
- one `pass|fail|unknown` record plus evidence for each of the seven bounded-slice checks;
- no normalized reason code, expected depth, score, count threshold or desired outcome.

Schema validation requires every named dimension. The canonical Modes contract remains the only
semantic owner. PB-022, PB-028 and PB-029 facts are rewritten to make the decisive effect explicit;
owner/file/consumer counts remain descriptive only.

### AD-06 — Strict blindness boundary

`corpus-loader.js` loads and validates visible scenario/fixture data separately from the hidden
baseline. `buildBlindPrompt` receives only the validated case and its visible evidence pack plus the
current canonical behavior-source text. Its interface does not accept a baseline record.

Leakage validation recursively rejects keys or values representing expected stage/path, reason code,
grader classification, target rationale, thresholds or baseline evidence references. Tests inspect
both raw visible JSON and final prompt text for every v3 scenario. The evaluator alone joins
observations to hidden baseline expectations after recording.

### AD-07 — Generic staged normalization and recording

`contracts.js` provides a staged schema factory/normalizer parameterized by the selected profile's
schema version while preserving the v2 schema and invariant behavior. V3 agent output keeps the same
semantic fields—observed next permissible stage, stage evaluability, observed path, path
evaluability, rationale and decision grounds—but uses schema version `3`.

`live-recorder.js` resolves profile metadata from the case, selects the corresponding schema and
adapter version, and persists profile/protocol/corpus/fixture/baseline versions from validated
inputs. It retains disposable-fixture mutation detection, safe error mapping, atomic writes,
duplicate protection and redaction. Transient execution failures remain auditable attempts; safety,
redaction, mutation or provenance errors terminate without silent retry.

### AD-08 — Generic staged evaluation and reporting

Refactor the existing staged evaluator into one family implementation parameterized by the selected
profile definition and validated corpus. V2 output remains byte-compatible. V3 output carries
schema/profile/protocol and all version/provenance fields from the v3 definition and input series.

Evaluation retains axis invariants, minimum three unique repeats, series-wide provenance equality,
source-fingerprint freshness, stage/path consensus, ambiguity and safety classifications. Thresholds
come only from the hidden baseline: 40 cases, all six paths, at least 10 adversarial cases, zero
critical under-governance, zero stage deviation and at most 10 percent unanimous small-path
over-governance.

The reporter uses the same staged layout with dynamic profile/protocol/version labels. It labels
repository assertion, deterministic synthetic/replay and live-agent observation evidence separately
and includes the non-claim that replay does not establish authenticated live-host behavior.

### AD-09 — CLI compatibility and visible recovery

Both existing scripts resolve the profile through `profiles.js`. Their usage output lists
`legacy-v1|staged-v2|staged-v3`. Observation key, fixture shape, schema version and provenance checks
come from the selected definition rather than string comparisons.

Errors identify the incompatible dimension: profile, protocol, corpus, fixture, baseline, adapter,
source fingerprint, scenario coverage or historical hash. No invocation falls back to another
profile. Existing exit behavior remains: invalid input throws/fails; a valid report with status
other than `pass` exits non-zero.

### AD-10 — Deterministic tests without live cost

Extend the existing test suite with in-memory/temporary synthetic staged-v3 observations. Do not
persist a fabricated live series under `evals/proportionality/observations/**`. A complete synthetic
series has three observations for every mandatory v3 scenario and proves deterministic JSON and
Markdown output.

Negative matrices cover every protected boundary and targeted fact gap. Repository QA may pass from
these deterministic and static artifacts; later live execution remains a separately identified
evidence obligation and non-claim.

## 4. Integration Points And Data Flow

```text
CLI --profile staged-v3
        |
        v
profiles.js -> corpus-loader.js -> manifest/scenarios/fixtures
                                  -> history provenance check
                                  -> hidden baseline (grader side only)
        |                                      |
        | visible case + facts                 | expectations
        v                                      |
blind-prompt.js -> live-recorder.js -> observation series
                                           |
                                           v
                         evaluator.js <-----+
                              |
                              v
                         report.js -> JSON / Markdown / exit status
```

| Integration | Input | Output | Failure boundary |
|---|---|---|---|
| Profile resolution | explicit CLI selector | frozen profile definition | unknown selector before file access |
| Corpus load | definition and v3 manifest | validated visible cases plus grader baseline | version, coverage, leakage or history drift |
| Prompt construction | one visible case and canonical behavior sources | read-only structured prompt | forbidden key/value or unsafe text |
| Live recording | prompt, surface/model and version context | atomic observation and attempt provenance | mutation, redaction, timeout, duplicate or mismatch |
| Offline evaluation | validated corpus and observations | deterministic report model | missing/mixed/stale/ambiguous/safety evidence |
| Report rendering | report model | JSON and Markdown projections | unsupported profile/schema |

No network API, persistent database, migration, deployment job or new executable is introduced. The
existing Codex read-only live-agent adapter remains the only optional live execution surface.

## 5. Constraints And Compatibility

- Do not edit any protected staged-v2/r3 file; the history inventory and Git diff are both required
  evidence.
- Keep existing imports/exports and v2 constants working unless TP proves no consumer exists and the
  change is explicitly planned; additive aliases are preferred.
- Keep one profile registry and one staged-family implementation; no parallel v3 runner, recorder,
  evaluator, reporter or policy engine.
- Do not place hidden baseline fields in a function reachable by prompt construction.
- Preserve existing safety error codes where semantics match; add a specific profile/version mismatch
  classification only when needed for actionable recovery.
- Accept only repository-relative controlled paths and retain symlink/path-escape rejection.
- Keep all written observations atomic and non-overwriting by default.
- A synthetic test observation is labeled deterministic/synthetic and never as live evidence.
- A live-series command or persisted live observation requires separate authority and is outside the
  implementation task plan unless later explicitly added through the gate chain.
- Unrelated dirty control-state paths remain out of implementation scope; candidate benchmark paths
  must be rechecked before CD+Tests.

## 6. Test And Evidence Strategy

| Evidence ID | Design/requirement coverage | Required proof |
|---|---|---|
| `SPB3-E01` | AD-01, PR-01/02 | registry unit tests; all three selectors; usage text; unknown selector; no repeated staged-v2-only branch in consumers |
| `SPB3-E02` | AD-02, PR-03 | complete protected-file SHA-256 inventory; pre/post verification; historical v2 replay snapshots |
| `SPB3-E03` | AD-03, PR-04/05/06 | schema and semantic fixtures for PB-008/PB-010/PB-011 plus exact visible prompt snapshots |
| `SPB3-E04` | AD-04, PR-08/09 | five-fact positive cases for PB-016/017/020 and one negative per missing/conflicting fact group |
| `SPB3-E05` | AD-05, PR-10/11 | all six trigger families and seven checks present; PB-022/028/029 outcomes; missing/conflicting Depth negatives |
| `SPB3-E06` | AD-06, PR-07 | recursive raw-data leakage tests and final-prompt scans for expected stage/path/reason/rationale/thresholds |
| `SPB3-E07` | AD-07, PR-15/16 | schema v2/v3 normalization, axis invariants, redaction, mutation, duplicate, retry/attempt and provenance tests |
| `SPB3-E08` | AD-08, PR-12/13/14 | 40 cases, six paths, adversarial minimum, complete scenario identity, synthetic three-repeat pass and every threshold/ambiguity negative |
| `SPB3-E09` | AD-08/09, UX-01 through UX-07 | JSON/Markdown snapshots, evidence labels, mismatch dimension, non-zero block status and no fallback |
| `SPB3-E10` | AD-10 | two identical offline runs with stable normalized JSON/Markdown and zero repository mutation |
| `SPB3-E11` | one-pipeline and package fit | focused benchmark tests, full create-agdf smoke/control-state tests, Runtime Integrity and `git diff --check` |

TP must map every PRD criterion to at least one evidence ID and distinguish static repository proof,
deterministic execution and unperformed live evidence. QA must not require or imply a live result for
repository acceptance, but must carry the live-series limitation explicitly.

## 7. Risks And Open Questions

- The history inventory spans many r3 files; generation must be deterministic, reviewable and
  followed by an independent verification command in TP.
- Centralizing profile metadata is a bounded refactor but touches v2 behavior. Snapshot and replay
  evidence must prove no compatibility drift before v3 behavior is assessed.
- Recursive leakage checks must avoid false positives on canonical source text while still blocking
  target labels in scenario and fixture inputs; TP needs both positive and negative fixtures.
- Complete Depth facts may change the appropriate hidden expectation for PB-022, PB-028 or PB-029.
  The PRD allows versioned expectations based on canonical semantics, not automatic retention of v2
  expected paths; each change needs traceability in the v3 baseline.
- Exact module functions, task sequencing and test commands remain TP work. No unresolved product or
  architecture decision blocks task planning after SD approval.

## 8. Next Step

Review this solution design and approve only with:

`Approval: SD`
