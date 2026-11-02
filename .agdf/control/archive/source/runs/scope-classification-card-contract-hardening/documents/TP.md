# Task/Test Plan: Scope Classification Card Contract Hardening

Status: approved
Gate: TP
Gate approval: approved on 2026-08-19 with exact `Approval: TP`
Based on: approved SD Revision 1
Date: 2026-08-19
Owner: agent

## 1. Delivery Boundary

Apply one bounded contract correction through the existing Scope Classification Card renderer,
locale registry, interaction contract, tests, evals and canonical generated-asset synchronization.
Do not create another renderer, classifier, policy module, persistence shape or presentation path.

Implementation may begin only after exact `Approval: TP` and a passing pre-implementation
Brownfield Analysis that reconciles the live worktree with this plan.

## 2. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| SCH-T1 | In `create-agdf/lib/interaction-presentation.js`, restrict `renderScopeClassificationCard` to valid `outcome === "ungated"`, `mode === "quick_task"` and `trivial_boundary === "inside" | SCH-01, SCH-02, SCH-10 | Focused positive Quick Task render and table-driven `null` assertions for Verified Change, structured, gated, ambiguous and unknown states; existing card regressions green |
| SCH-T2 | Add one frozen module-local limits object and one shared dynamic-value validator in the existing renderer owner: strings only, trimmed non-empty, single-line, maximum 240 Unicode code points, no approved Markdown controls or line-leading structures; reject rather than truncate or sanitize | SCH-05, SCH-08 | Boundary tests at 1/240/241 code points including astral characters; negative matrix for type, whitespace, CR/LF and every Markdown class; security assertions remain green |
| SCH-T3 | Validate escalation triggers through the same helper, require 1–3 items and reject invalid or duplicate normalized items; fail the complete render on the first invalid collection or item | SCH-06 | Table-driven tests for 0/1/3/4 items, non-array values, duplicates, invalid types, whitespace, Markdown and 240/241-code-point items |
| SCH-T4 | Preserve `resolvePresentationLocale` as the sole locale-selection owner; remove the invalid `verified_change` Scope Classification label from every complete locale pack; document and test unsupported requested locale → complete English, invalid/incomplete registry → `null` | SCH-03, SCH-04, SCH-07 | Registry parity validation; deterministic English/German outputs; unknown-tag English fallback; incomplete and malformed registry failure tests |
| SCH-T5 | Align `plugin/meta/contracts/interaction.md` with Quick Task-only activation, bounded plain-text input, escalation-list bounds, unsupported-locale recovery and invalid-registry fail-closed behavior; add only reliable structural Runtime Integrity assertions and no local template | SCH-02, SCH-04, SCH-05, SCH-06, SCH-08, SCH-09 | Contract review; Runtime Integrity detects missing canonical requirements and invalid locale vocabulary without prose-fragile broad matching |
| SCH-T6 | Extend the existing gate-check eval owners only where needed to prove Scope Classification Card suppression for Verified Change and other non-fresh-Quick-Task states; update canonical corpus metadata/fingerprints through existing mechanisms | SCH-02, SCH-09, SCH-10 | Relevant eval cases pass; deterministic replay and manifest checks pass; no approval or run-status behavior changes |
| SCH-T7 | Propagate canonical changes with the existing sync owner, update generated/runtime digests deterministically, verify idempotence, and reconcile `CG-NATIVE-INTERACTION-AUTHORITY` with delivered evidence | SCH-09, SCH-10 | Focused interaction suite, eval suite, source and installed-layout Runtime Integrity, relevant package smoke, sync idempotence, `git diff --check`, Context Graph evidence |

## 3. Acceptance Coverage

| criterion_id | task_ids | Observable evidence |
|---|---|---|
| SCH-01 | SCH-T1, SCH-T2, SCH-T3, SCH-T4 | Valid Quick Task renders byte-identically with `authorizes: false` |
| SCH-02 | SCH-T1, SCH-T5, SCH-T6 | Every non-Quick-Task state returns `null`; evals prove suppression |
| SCH-03 | SCH-T4 | Unsupported requested locale renders the complete English card |
| SCH-04 | SCH-T4, SCH-T5 | Incomplete or invalid registry returns `null` without partial fallback |
| SCH-05 | SCH-T2, SCH-T5 | Every invalid scalar and boundary case returns `null` |
| SCH-06 | SCH-T3, SCH-T5 | Every invalid escalation collection or item returns `null` |
| SCH-07 | SCH-T4 | Complete English/German packs remain deterministic and canonical values stay untranslated |
| SCH-08 | SCH-T2, SCH-T5 | Result remains non-authorizing with no approval options or vocabulary |
| SCH-09 | SCH-T5, SCH-T6, SCH-T7 | Canonical sync, eval and source/installed-layout integrity all pass |
| SCH-10 | SCH-T1, SCH-T6, SCH-T7 | Existing Run Status and approval-presentation regressions remain green |

All approved PRD criteria are covered. No criterion is deferred.

## 4. Test Execution Plan

Execute the narrow checks first and expand only to the established affected-surface checks:

1. Focused interaction presentation tests, including all boundary and negative matrices.
2. Relevant gate-check skill evals and deterministic replay/manifest validation.
3. Runtime Integrity against canonical source layout.
4. Canonical asset synchronization followed by a second no-diff synchronization run.
5. Runtime Integrity against the generated/installed-layout fixture and relevant package smoke.
6. `git diff --check` and a reviewed diff-to-task mapping.

After code changes, run the mandatory Task Plan Review, Clean Implementation Review and Code Review
before QA. QA must classify the result from those reports and the test evidence; it must not infer
host-visible UAT from repository checks.

## 5. Pre-Implementation Brownfield Analysis

After `Approval: TP` and before the first code edit, inspect and record:

- current worktree ownership and overlap for every planned canonical/generated path;
- the present renderer validation/export pattern and locale exception boundary;
- the current interaction test fixtures, especially any permissive behavior that must be replaced;
- the exact gate-check eval case, fixture, observation and manifest owners;
- reliable Runtime Integrity assertion patterns and the risk of prose-fragile checks;
- the canonical sync surface list, runtime manifest/digest ownership and installed-layout test path;
- the current `CG-NATIVE-INTERACTION-AUTHORITY` node and the narrow reconciliation location.

If this analysis discovers a second required runtime owner, schema change, host adapter change,
unbounded generated surface or semantic conflict with another active run, stop and route back to SD
or PRD rather than widening implementation.

## 6. Out Of Scope

- A new renderer, classifier, policy package, schema or persistent state.
- Card redesign, new user step, approval interaction or exact approval-value change.
- Changes to Run Status Card, Gate Transition Card or unrelated gate ordering.
- Claims of exactly-once host rendering or direct host UAT.
- Commit, push, PR, release, publication, deployment or installed-plugin cache mutation.

## 7. Risks And Controls

- Over-rejection of ordinary prose: encode the approved control-token/line-leading boundary and add
  valid punctuation and plain-URL counterexamples.
- Unicode drift: count code points with the approved mechanism and include astral boundary cases.
- Locale parity drift: remove the invalid key symmetrically and validate complete packs before sync.
- Parallel policy: keep numerical limits and validation in the only renderer owner; contracts state
  behavior without creating executable duplicates.
- Dirty-worktree overlap: Brownfield Analysis assigns every overlapping diff before implementation.
- Generated drift: regenerate only through the canonical sync owner and prove idempotence.

## 8. Next Step

The Task/Test Plan is approved. Implementation starts only after the recorded pre-implementation
Brownfield Analysis passes.
