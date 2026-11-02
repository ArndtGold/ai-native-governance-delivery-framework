# Product Requirements — Versioned AGDF Skill Evaluation Framework

## Status

- status: ready_for_approval
- run_id: agdf-skill-evaluation-framework
- related_ur: .agdf/control/artefacts/agdf-skill-evaluation-framework/UR.md
- brownfield_review: .agdf/control/artefacts/agdf-skill-evaluation-framework/BROWNFIELD_REVIEW.md

## Product Objective

Make behavioral evaluation a release-blocking, repository-owned property of every canonical AGDF skill, while preserving deterministic AGDF gate authority and keeping optional model judgement subordinate to safety-critical grading.

## Users

- AGDF maintainers changing skills, runtime contracts, routing or evaluation infrastructure
- reviewers deciding whether a skill change is safe to merge or release
- CI and release automation requiring stable machine-readable evidence

## First-Release Scope

1. A versioned root `evals/` corpus with a validated case schema and disposable repository/control-state fixtures.
2. Coverage for every skill declared by `plugin/meta/agdf-plugin.definition.json`.
3. A deterministic evaluation runner with stable JSON output, concise human output and non-zero failure exit status.
4. Deterministic graders for routing, gate or internal-step decisions, allowed and forbidden actions, approval boundaries, output artefacts and file mutation boundaries.
5. A separate artefact-quality assessment for scenarios that create or review durable artefacts.
6. Integration into the existing local smoke, pull-request guardrail and release-validation chains.
7. Optional live-model evaluation as explicitly labelled supporting evidence, never as a prerequisite for the offline deterministic baseline.

## Functional Requirements

### PRD-EVAL-001 — Canonical Skill Coverage

- The runner must derive the required skill set from `plugin/meta/agdf-plugin.definition.json`.
- Every canonical skill must have at least three realistic cases: a normal routing case, a boundary or ambiguity case, and an adversarial fail-closed case.
- Missing cases for any canonical skill must block evaluation before case execution.
- Removed or renamed skills must produce an explicit corpus drift failure until the corpus is intentionally reconciled.

### PRD-EVAL-002 — Versioned Case Contract

- Every case must declare a schema version, stable case ID, target skill, user prompt, repository fixture, control-state fixture and grader profile.
- Expected behavior must include the selected skill, current gate or internal step, allowed actions, forbidden actions and permitted mutation boundary.
- Artefact-producing cases must declare expected artefact roles and required quality assertions.
- Unknown fields that affect authority, unsupported schema versions, missing expectations and ambiguous fixture references must fail closed.

### PRD-EVAL-003 — Realistic Isolated Fixtures

- Repository fixtures must represent realistic clean, Brownfield, ambiguous-scope, missing-evidence and completed-run states rather than implementation-only unit inputs.
- Each case must execute in a disposable workspace created from its fixture.
- Fixture setup and evaluation must not modify the source repository.
- Cases may declare an empty mutation allowance or an explicit repository-relative allow-list; any other mutation is a safety failure.

### PRD-EVAL-004 — Deterministic Safety Grading

- Routing grading must compare the observed selected skill with the canonical expected skill.
- Gate grading must compare the observed gate or internal step and missing exact approval with the case expectation.
- Action grading must detect missing required actions and any proposed or performed forbidden action.
- Approval grading must reject inferred, decorated, stale, wrong-run, wrong-gate or non-deliberate approvals where the case covers an approval boundary.
- Mutation grading must compare the before/after workspace state and reject undeclared path changes on both successful and failing execution paths.
- A missing grader result, unknown outcome or grader exception must be reported as a blocking failure, never skipped or converted to pass.

### PRD-EVAL-005 — Artefact Quality Assessment

- Artefact quality must be reported separately from safety grading.
- Required deterministic quality assertions must cover the artefact's declared schema or headings, evidence references, explicit missing evidence, risks, decision ownership and exactly one permissible next step where applicable.
- Case-specific semantic assertions may check required and forbidden claims without depending on exact prose wrapping.
- An optional model-based quality assessor may provide advisory dimensions and rationale, but it must not override a failed deterministic assertion or safety grader.
- Missing required artefact-quality evidence must fail the case.

### PRD-EVAL-006 — Reports And Reproducibility

- The runner must produce a versioned JSON report containing corpus version, runner version, case results, grader results, coverage, thresholds, timing, enforcement level and failure codes.
- Human output must summarize pass/fail counts and decisive failures without exposing hidden reasoning or full prompts unnecessarily.
- The deterministic lane must run without network access, external credentials or paid model calls.
- Repeated deterministic execution against unchanged inputs must produce the same semantic result; timestamps and temporary paths must not affect grading.

### PRD-EVAL-007 — CI And Release Enforcement

- Existing pull-request/push guardrails and tag release validation must execute the deterministic evaluation lane.
- Evaluation must run within the existing AGDF validation chain, not through a competing policy workflow.
- CI must fail when the corpus, schema, runner or report cannot be validated.
- CI must preserve evidence that distinguishes deterministic fixture evaluation from optional live-model evidence.

### PRD-EVAL-008 — Change Traceability

- A change to a canonical skill, its routing definition or its governing Runtime Contract must be covered by an existing relevant case or add/update at least one case.
- A changed expected result must be visible as an intentional fixture diff; automatic golden-output rewriting is forbidden.
- Reports must identify which cases cover each canonical skill and which source files are declared by the case as relevant behavior owners.

## CI Threshold Contract

The deterministic baseline is fail-closed:

| Metric | Required threshold | Failure effect |
|---|---:|---|
| Canonical skill coverage | 100% | block |
| Required case classes per skill | 3 of 3 | block |
| Safety grader pass rate | 100% | block |
| Routing expectation pass rate | 100% | block |
| Gate and approval-boundary pass rate | 100% | block |
| Allowed/forbidden action pass rate | 100% | block |
| Mutation-boundary pass rate | 100% | block |
| Required deterministic artefact-quality assertions | 100% | block |
| Invalid, missing or unknown required results | 0 | block |

Optional model-based quality scores are advisory in the first release. Their absence or variance must remain visible but cannot lower any deterministic threshold or turn a safety failure into pass.

## Non-Functional Requirements

- **Fail closed:** incomplete, malformed or ambiguous authority-related inputs block evaluation.
- **Cross-platform:** the deterministic lane must work on supported Node.js versions and avoid POSIX-only assumptions.
- **Bounded:** case and suite timeouts must be explicit and reported; timeouts fail required cases.
- **Secure:** fixtures must contain no secrets, and external model adapters must receive only the bounded case payload explicitly approved for that lane.
- **Maintainable:** schemas, graders and fixtures must have single canonical owners and focused tests.
- **Portable evidence:** reports must not claim live host enforcement unless that host was actually executed with conforming evidence.

## Non-Goals

- Replacing `qa-gate` as the final AGDF delivery decision owner.
- Replacing existing unit, smoke, runtime-integrity or package tests.
- Measuring universal intelligence or guaranteeing identical behavior for every model.
- Making network-backed evaluation mandatory for ordinary pull requests.
- Automatically accepting changed golden results, committing changes or publishing packages.

## Acceptance Criteria

1. The canonical nine-skill inventory is covered by at least 27 versioned realistic cases and the runner detects an intentionally missing skill or case class.
2. Focused negative fixtures prove that wrong routing, gate bypass, unsafe action, invalid approval and out-of-bound mutation each fail with stable codes.
3. At least one artefact-producing scenario per relevant skill proves deterministic quality assertions and separate quality reporting.
4. The deterministic suite produces stable JSON and concise human reports and exits non-zero on threshold breach.
5. The suite runs offline in local verification, `agdf-guardrails.yml` and the release validation job.
6. Existing smoke, runtime-integrity, package and Pages checks continue to pass without weakened assertions.
7. Documentation states the evidence boundary between deterministic fixtures and optional live-model or live-host runs.

## Product Risks

- Cases may become implementation-coupled and cease to represent user behavior.
- A 100% deterministic threshold is only meaningful if fixtures include adversarial and ambiguous scenarios.
- Live-model results may be noisy or expensive and must not destabilize baseline CI.
- Corpus maintenance may become burdensome unless shared fixture layers stay explicit and bounded.

## Open Design Decisions

- Exact directory and package-module ownership for schemas, runner, graders and fixture materialization.
- Whether the first release exposes a public CLI command or a repository-maintainer npm script only.
- Stable JSON field names, failure-code taxonomy and report persistence location.
- How shared fixture layers avoid duplication without allowing hidden state inheritance.
- Which artefact roles require quality cases beyond their normal, boundary and adversarial routing cases.
