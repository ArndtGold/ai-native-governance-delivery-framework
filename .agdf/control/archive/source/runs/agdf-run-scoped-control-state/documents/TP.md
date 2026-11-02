# TP: Run-Scoped AGDF Control State

Status: approved
Gate: TP
Gate approval: `Approval: TP` provided on 2026-07-11
Based on: approved SD
Date: 2026-07-11
Owner: agent

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| RSC-01 | Freeze version-2 run-state schema, typed finding codes, selector metadata and aggregate JSON fixtures before behavior changes | PRD AC 3-8, 16-18 | Reviewed fixtures covering schema, selection, errors, revision tokens and aggregate output |
| RSC-02 | Extract the existing Markdown run-state parser from `create-agdf/bin/create-agdf.js` into `create-agdf/lib/control-state/run-state-parser.js` without changing legacy normalized output | AC 2, 8, 9, 19 | Characterization tests proving existing legacy gate/delivery fixtures remain equivalent |
| RSC-03 | Implement strict version-2 parsing: unique required fields, identifier grammar, lifecycle, schema version, revision metadata and path/field match | AC 7, 8, 18 | Unit tests for valid records and every typed validation failure |
| RSC-04 | Implement canonical repository discovery and safe path handling in `run-state-repository.js`, including sorted immediate-child scanning and symlink rejection | AC 1, 3, 4, 7 | Unit fixtures for zero/one/many records, ordering, invalid entries, symlinks and path traversal |
| RSC-05 | Implement shared selector precedence in `run-state-resolver.js` for `--run`, `AGDF_RUN_ID`, single-active default and ambiguity failure | AC 3-7 | Resolver matrix proving explicit, environment, automatic, conflicting, unknown and ambiguous behavior |
| RSC-06 | Implement optimistic, atomic writes in `run-state-writer.js` with revision/revision-id validation and no-mutation stale failures | AC 18 | Stale-token, atomic-success and failure-cleanup tests plus file-content assertions |
| RSC-07 | Implement deterministic all-active aggregation and empty-active policy in `aggregate.js` | AC 16, 17 | Per-run/aggregate fixtures for pass, warn, revise, block and configured empty set |
| RSC-08 | Extend CLI parsing and help for `--run`, `--all-active`, `run-create`, `run-migrate` and `run-render-legacy`; reject illegal option combinations | AC 5, 6, 10, 15, 16 | CLI help snapshots and subprocess tests for accepted/rejected invocations |
| RSC-09 | Integrate the shared resolver into `doctor`, retaining repository scaffold checks and adding selected/all-active run findings | AC 2-8, 16 | Existing doctor fixtures plus canonical one/many/all-active regression fixtures |
| RSC-10 | Integrate the shared resolver into `gate-check` and `delivery-map` without forking gate rules or renaming existing single-run fields | AC 2-9, 16, 17, 19 | Gate/delivery golden fixtures before/after migration and aggregate evidence assertions |
| RSC-11 | Replace Delivery Path Search's direct `AGDF_RUN.md` read with the shared selected-state resolver | AC 2-8, 19 | Delivery Path Search tests for selected, single-active, ambiguous and invalid state |
| RSC-12 | Implement explicit, idempotent legacy migration with in-memory semantic equivalence checks, collision safety and unchanged input on failure | AC 9-11, 19 | Valid, repeated, invalid, collision and injected-failure migration fixtures with checksums |
| RSC-13 | Implement explicit legacy projection rendering and drift/mixed-authority detection; do not update projections during canonical writes | AC 12, 13 | Projection marker/digest tests, canonical-write non-mutation proof and drift block fixture |
| RSC-14 | Add canonical `RUN_STATE.md` template and update `init`/`run-create` scaffold behavior without inventing a run or overwriting user state | AC 14, 15 | Fresh/existing scaffold smoke tests and collision/no-overwrite evidence |
| RSC-15 | Update Runtime Contract and directly affected skills to require selected run evidence, canonical authority, explicit migration and no writable global index | AC 2-6, 10, 20 | Runtime integrity assertions and source/generated parity checks |
| RSC-16 | Synchronize package assets and update CLI/package docs, install guidance and supported surface explanations from canonical sources | AC 20, 22 | Generated diff review, package-content inspection, routing tests and documentation reference scan |
| RSC-17 | Update `.github/workflows/agdf-guardrails.yml` to evaluate `delivery-map --all-active` and add workflow-equivalent local coverage | AC 16, 17, 22 | Local aggregate command evidence and workflow diff inspection |
| RSC-18 | Add `CG-RUN-SCOPED-CONTROL-STATE` with approved invariants and update SoT registry only if ownership changes require a new row | AC 2, 20 | Context Graph reconciliation with concrete refs and no parallel SoT |
| RSC-19 | Run focused unit/integration/concurrency/migration suites, runtime integrity, both package smoke suites and diff checks; resolve every in-scope failure | AC 1-22 | Complete command log and pass/fail evidence mapped to acceptance criteria |
| RSC-20 | Perform implementation-preparation Brownfield Analysis before RSC-01 execution, then after CD+Tests run TP Review, Clean Implementation Review and Code Review before QA | Governance coverage | Persisted Brownfield Analysis and review reports with no unresolved blocking findings |

## 2. Execution Order And Dependencies

1. RSC-20 pre-implementation Brownfield Analysis confirms the call-site map and existing dirty/staged
   control-state boundary.
2. RSC-01 freezes contracts and fixtures.
3. RSC-02 and RSC-03 establish one parser before discovery or CLI behavior changes.
4. RSC-04 through RSC-07 build the state core and may proceed in parallel after parser contracts are
   stable, except the writer consumes repository validation from RSC-04.
5. RSC-08 through RSC-11 integrate the core into all runtime consumers.
6. RSC-12 and RSC-13 implement migration/projection after normalized equivalence is available.
7. RSC-14 through RSC-18 propagate scaffold, runtime, package, CI, docs and durable knowledge.
8. RSC-19 runs the complete evidence suite.
9. RSC-20 runs mandatory post-implementation reviews before QA.

No task may introduce a temporary second parser, selector or writable run-state authority to unblock a
later task.

## 3. Test Plan

### 3.1 Unit matrix

| Area | Required cases |
|---|---|
| Parser | Legacy characterization; valid v2; duplicate scalar; malformed table; unsupported version; invalid lifecycle/revision/revision-id; path mismatch |
| Repository | Zero/one/many; sorted discovery; hidden entries; symlinked directory/file; non-file target; traversal rejection |
| Resolver | CLI only; env only; equal CLI/env; conflicting CLI/env; single active; multiple active; zero active; unknown/inactive selector; all-active conflicts |
| Writer | Correct revision; stale revision; destination changed between read/write; temp cleanup; atomic replacement; symlink refusal |
| Aggregate | pass/warn/revise/block precedence; deterministic ordering; empty default revise; configured empty pass; repository discovery block |
| Migration | Valid; absent run id with/without selector; invalid legacy; equivalent repeat; non-equivalent collision; injected write/readback failure |
| Projection | Marker/source/revision/digest; explicit render; no automatic update; modified projection drift; unmarked mixed authority |

### 3.2 Integration and smoke matrix

- `init` creates templates and run directory without a live run.
- `run-create` creates exactly one valid isolated record and refuses collisions.
- One active run preserves no-selector convenience for doctor, gate-check, delivery-map and Delivery
  Path Search.
- Two active runs fail single-run commands without selection while all-active commands aggregate.
- Independent writes to two runs change distinct files only.
- Same-run concurrent Git edits remain conflict-visible and are never assigned `merge=union`.
- Legacy migration preserves gate decisions, approvals, artefacts, evidence, risks, Context Graph and
  next-step fields.
- Generated package contents include the canonical template, core modules and updated instructions.
- Existing supported-surface routing and bootstrap fixtures continue to pass.

### 3.3 Required commands

- focused control-state unit/integration script(s) added to `create-agdf/package.json`
- `node plugin/scripts/check-runtime-integrity.mjs`
- `npm --prefix create-agdf run smoke-test`
- `npm --prefix agdf run smoke-test`
- `node create-agdf/bin/create-agdf.js delivery-map --dir . --all-active`
- package prepack/content inspection using existing package workflow
- `git diff --check`
- `git status --short` to demonstrate preserved pre-existing/staged control changes

## 4. Brownfield Scope

The pre-implementation Brownfield Analysis must inspect and freeze the reuse boundary for:

- all direct `AGDF_RUN.md` reads and writes in `create-agdf/bin/create-agdf.js`
- `create-agdf/lib/delivery-path-search/state-adapter.js`
- `plugin/meta/agdf-runtime-contract.md`
- `plugin/control/templates/AGDF_RUN.md` and control README
- `create-agdf/scripts/sync-package-assets.js`
- `create-agdf/scripts/smoke-test.js` and routing/package tests
- `plugin/scripts/check-runtime-integrity.mjs`
- `.github/workflows/agdf-guardrails.yml`
- `INSTALL.md`, `create-agdf/README.md`, `agdf/README.md` and directly affected Pages content
- current staged and unstaged control artefacts, which must not be overwritten or normalized away

It must confirm that gate evaluation remains in one owner and that no generated output is edited as a
source.

## 5. Out Of Scope

- Hosted locks, databases, services or network coordination.
- Semantic merge of concurrent same-run changes.
- Cross-repository run registries.
- Changing gate order, names, exact approval syntax or decision legality.
- Treating backlog, branches, worktree deltas or chat history as automatic run selectors.
- Automatic migration during read-only commands.
- Automatic compatibility-projection writes after canonical state changes.
- Permanent legacy-parser removal in this release.
- Broad cleanup of the existing CLI monolith beyond the state ownership extraction required here.

## 6. Risks And QA Classification

| Risk | QA effect | Required evidence |
|---|---|---|
| Two writable state authorities or a second parser/selector exists | block | Ownership search and architecture review prove one core owner |
| Migration can partially mutate or lose legacy state | block | Failure-injection and checksum evidence |
| Gate decision changes across equivalent migration | block | Golden semantic-equivalence fixtures |
| Multiple active runs are silently auto-selected | block | Ambiguity fixtures across every single-run consumer |
| Canonical records receive `merge=union` or same-run conflicts are hidden | block | Attribute inspection and simulated Git conflict evidence |
| Read-only commands mutate state | block | Before/after filesystem checksums |
| Legacy projection can override canonical state | block | Drift and mixed-authority fixtures |
| All-active aggregate omits or misorders a run | revise | Deterministic multi-run aggregate fixtures |
| Existing single-run JSON fields or agent routing regress | revise | Compatibility and routing smoke tests |
| Context Graph reconciliation remains open at closeout | revise | Concrete node and refs before QA/OR |
| Documented mixed-version release window remains unverified | warn | Explicit release caveat and next verification owner |

## 7. Acceptance Traceability

| PRD acceptance range | Primary tasks | QA evidence owner |
|---|---|---|
| AC 1-2 | RSC-02, RSC-04, RSC-09-RSC-11 | Shared ownership search and two-run fixture |
| AC 3-8 | RSC-03-RSC-05, RSC-08-RSC-11 | Resolver/parser matrix |
| AC 9-13 | RSC-02, RSC-12, RSC-13 | Migration equivalence, idempotency and drift fixtures |
| AC 14-15 | RSC-08, RSC-14 | Scaffold and creation smoke tests |
| AC 16-17 | RSC-07, RSC-09, RSC-10, RSC-17 | Aggregate and workflow-equivalent evidence |
| AC 18-19 | RSC-03, RSC-06, RSC-12 | Revision, conflict and migration-preservation evidence |
| AC 20 | RSC-15, RSC-16, RSC-18 | Runtime/generated/docs/Context Graph parity |
| AC 21-22 | RSC-19, RSC-20 | Full validation and review reports |

## 8. Next Step

Review this Task/Test Plan and approve only with:

`Approval: TP`
