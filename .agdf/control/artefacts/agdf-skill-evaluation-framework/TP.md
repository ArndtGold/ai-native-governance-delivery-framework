# Task and Test Plan — Versioned AGDF Skill Evaluation Framework

## Status

- status: ready_for_approval
- run_id: agdf-skill-evaluation-framework
- related_sd: .agdf/control/artefacts/agdf-skill-evaluation-framework/SD.md

## Delivery Strategy

Build and negatively prove the deterministic safety core before scaling the corpus or connecting CI. Live recording remains explicit and cannot weaken offline conformance.

## Tasks

| Task ID | Implementation | Required test evidence |
|---|---|---|
| TP-EVAL-001 | Add versioned manifest and case, observation and report contracts. | Valid contracts plus missing, unknown and unsupported-version failures. |
| TP-EVAL-002 | Load the corpus from the canonical plugin skill inventory with safe path resolution. | Missing skill/class, duplicate ID, traversal, absolute-path and escaping-symlink failures. |
| TP-EVAL-003 | Compute cross-platform source fingerprints from case, fixture, skill, routing and declared Runtime Contract owners. | Stable repeat, relevant-owner change, fixture change and unrelated-file stability. |
| TP-EVAL-004 | Materialize disposable repositories and generalize exact before/after mutation protection. | Allowed mutation plus undeclared mutation on success, failure and timeout paths. |
| TP-EVAL-005 | Implement coverage, routing, gate, approval, action, mutation and claim-boundary graders. | Positive and focused blocking cases per grader with stable codes. |
| TP-EVAL-006 | Implement separate deterministic artefact-quality grading. | Missing evidence, contradictory decision, forbidden claim and multiple-next-step failures. |
| TP-EVAL-007 | Implement stable JSON/human reports and 100% threshold aggregation. | Repeat-run semantic equality and non-zero exits for every threshold family. |
| TP-EVAL-008 | Add the offline `eval:skills` runner without network or credentials. | End-to-end pass, missing/stale observation and safety-failure runs. |
| TP-EVAL-009 | Add explicit Codex/Claude live-recording seams with bounded subprocess and provenance controls. | Adapter success, timeout, malformed output, mutation and rejected failing-observation persistence. |
| TP-EVAL-010 | Add normal, boundary and adversarial cases for all nine canonical skills. | At least 27 behavioral cases, 9/9 coverage and fresh required observations. |
| TP-EVAL-011 | Wire deterministic evaluation into aggregate smoke, AGDF Guardrails and publish validation. | Workflow assertions and complete local aggregate pass. |
| TP-EVAL-012 | Document schema versions, refresh workflow, thresholds and replay/live evidence boundaries. | Documentation assertions and links; negative integrity checks where normative. |
| TP-EVAL-013 | Run the complete regression and packaging bundle. | Eval suite, Runtime Integrity, both package smokes, Pages check/build, package dry-runs, doctor, delivery-map and diff check. |

## Required Case Matrix

Every canonical skill (`gate-check`, `brownfield-analysis`, `delivery-path-search`, `task-plan-review`, `clean-implementation-review`, `code-review`, `qa-gate`, `release-or`, `delivery-closeout`) requires three distinct cases: normal routing, boundary/ambiguity and adversarial fail-closed. Artefact-producing or reviewing skills additionally require deterministic artefact-quality assertions; these may attach to the three cases but cannot reduce the 27-case minimum.

## Mandatory Negative Families

- incomplete coverage, duplicate/unknown case and unsupported schema
- unsafe fixture path or escaping symlink
- missing/stale observation fingerprint
- wrong routing, wrong gate/internal step or invalid approval boundary
- missing required action or present forbidden action
- out-of-bound mutation on success and failure paths
- missing/contradictory artefact evidence or multiple next steps
- grader exception, timeout, malformed adapter output and false live-evidence claim
- attempted automatic observation or golden rewrite

## Acceptance Evidence

- All 13 task IDs map to changed files, acceptance criteria and tests.
- Canonical coverage is 9/9 with at least 27 behavioral cases.
- Every deterministic threshold is 100%; unknown or missing required results are zero.
- Offline evaluation runs twice with identical semantic JSON.
- Existing validation suites remain authoritative and pass without weakened assertions.
- Live and replay provenance remain visibly distinct.

## Boundaries

- No public CLI surface, automatic VCS action, release, publish or reinstall.
- No fallback from stale or missing evidence to expected values.
- No model score can override deterministic safety or required artefact assertions.
- Ownership or gate-semantics conflicts return to SD/PRD before implementation.
