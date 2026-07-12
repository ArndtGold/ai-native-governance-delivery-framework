# PRD: Run-Scoped AGDF Control State

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` provided on 2026-07-11 after artefact persistence
Based on: approved UR and completed Brownfield Review
Date: 2026-07-11
Owner: agent

## 1. Product Scope

Deliver a portable run-scoped control-state model that removes cross-run write contention from
`.agdf/control/AGDF_RUN.md` while preserving AGDF gate legality, auditability and migration safety.

The canonical mutable state for each delivery run must live at:

`.agdf/control/runs/<run_id>/RUN_STATE.md`

Every runtime consumer must resolve a run through one shared selection contract before parsing or
evaluating state. Repository-level files may support discovery or compatibility, but they must not
duplicate writable run authority.

### 1.1 Canonical Authority

- `RUN_STATE.md` is the only writable authority for its `run_id` after migration.
- The directory name and the document's `run_id` must match.
- A run record declares a control-state schema version and lifecycle state.
- `MASTER_BACKLOG.md` remains the human steering index and artefact pointer; it is not run-state
  authority and is not sufficient by itself to select a run.
- No manually maintained `ACTIVE_RUNS.md` or equivalent second mutable dashboard is introduced.
- Repository-level run discovery is derived by scanning canonical run directories.

### 1.2 Run Identity And Lifecycle

- `run_id` is stable, repository-local and restricted to lowercase ASCII letters, digits, `.`, `_`
  and `-`, beginning with a letter or digit.
- Two canonical records with the same declared `run_id`, a path/field mismatch or duplicate required
  fields are invalid and block evaluation.
- Lifecycle values are `active | completed | superseded | abandoned`.
- Only `active` records participate in default interactive selection and all-active CI evaluation.
- Completed, superseded and abandoned records remain durable and individually addressable for audit.

### 1.3 Selection Contract

Run selection follows this precedence:

1. explicit CLI `--run <run_id>`
2. `AGDF_RUN_ID` environment variable when no CLI selector is supplied
3. automatic selection only when exactly one canonical run is active

Conflicting explicit selectors are an error. Zero active runs, more than one active run without a
selector, an unknown selector or an invalid selected record must fail closed with the discovered run
identifiers and one actionable next step. Branch names, worktree changes, backlog priority, chat
history and model inference never select a run.

Agent-native skills must name the selected `run_id` and inspect the same canonical record used by the
CLI. Surface adapters may translate invocation syntax but must not alter selection precedence.

### 1.4 CLI And CI Behavior

- `doctor`, `gate-check`, `delivery-map` and Delivery Path Search consume the same shared resolver.
- Single-run repositories retain a no-selector convenience path.
- `gate-check` evaluates exactly one selected run.
- `doctor` and `delivery-map` support `--all-active` for repository-level CI validation and return one
  aggregate decision plus per-run findings.
- `--all-active` and `--run` are mutually exclusive.
- Repository CI uses `delivery-map --all-active`; any active run with a blocking decision blocks the
  aggregate result.
- Empty active-run sets produce an explicit non-pass result unless repository policy declares that no
  governed delivery work is active.

### 1.5 Creation And Scaffold Behavior

- `init` creates the canonical `runs/` location and templates but does not invent a run identifier.
- A deterministic command creates a new canonical run record from an explicit `run_id`; it refuses
  collisions and invalid identifiers.
- Surface bootstrap commands ship the same canonical layout and runtime instructions through existing
  package asset generation.

### 1.6 Legacy Migration And Compatibility

- A repository with a legacy `.agdf/control/AGDF_RUN.md` and no canonical run records is reported as
  `migration_required`; it is not silently copied or moved during an ordinary read.
- An explicit, idempotent migration command validates the legacy document, derives or accepts the
  `run_id`, writes the canonical run record and verifies semantic equivalence before changing legacy
  handling.
- Re-running migration after a successful equivalent migration is a no-op success.
- A conflicting canonical record, invalid legacy state or ambiguous identifier blocks migration and
  preserves every input unchanged.
- After migration, `AGDF_RUN.md` may exist only as a generated compatibility projection with a visible
  non-authoritative marker, canonical source reference and content identity. It is never accepted as a
  second writable source.
- If the compatibility projection diverges from its canonical record, new runtimes report
  `legacy_projection_drift` and fail closed until reconciliation.
- Repositories may remove the compatibility projection when all consumers support canonical run
  records. Removal timing is release policy, not gate semantics.

### 1.7 Same-Run Concurrency

- Run isolation removes conflicts between different runs; it does not silently merge concurrent
  changes to the same run.
- Canonical run records must not receive a `merge=union` rule.
- Normal Git conflict visibility remains the baseline for same-line same-run changes.
- Required fields must be unique; duplicate or contradictory fields block `doctor` and all evaluators.
- The state schema includes a revision identity suitable for optimistic CLI writes. A write using a
  stale expected revision must fail without changing the file.

## 2. Acceptance Criteria

1. Two active runs can advance independently without modifying the same authoritative run-state file.
2. Every runtime consumer resolves and parses run state through one shared core owner.
3. Exactly one active run is selected automatically when no explicit selector exists.
4. Multiple active runs without an explicit selector fail closed and list the candidates.
5. `--run` selects exactly the named valid run and overrides environment selection only when the
   environment selector is absent or equal; conflicting selectors fail.
6. `AGDF_RUN_ID` provides deterministic non-interactive selection when `--run` is absent.
7. Unknown, malformed, duplicate or path-mismatched run identifiers block evaluation.
8. Required-field duplication or contradictory state blocks `doctor`, `gate-check`, `delivery-map`
   and Delivery Path Search consistently.
9. Gate decisions for a migrated run are semantically equivalent to decisions from the valid legacy
   input before migration.
10. Legacy-only repositories receive `migration_required` and an actionable migration command; normal
    reads do not mutate the repository.
11. Migration is explicit, idempotent and leaves inputs unchanged on validation or collision failure.
12. A generated legacy projection is visibly non-authoritative and traceable to its canonical source.
13. Divergent legacy projection content produces `legacy_projection_drift` and blocks evaluation.
14. `init` creates run-scoped templates without inventing an active run or identifier.
15. A deterministic run-creation command rejects collisions and invalid identifiers.
16. `doctor --all-active` and `delivery-map --all-active` return per-run evidence and a deterministic
    aggregate decision.
17. Repository CI evaluates all active runs and fails when any active run has a blocking decision.
18. Same-run stale optimistic writes fail without mutation, while direct Git conflicts remain visible.
19. Existing approvals, artefact links, evidence, risks, Context Graph fields and next-step semantics
    survive migration.
20. Canonical runtime, generated package assets, supported agent surfaces and user-facing docs describe
    the same authority, selection and migration model.
21. Focused resolver, selection, validation, migration and concurrency fixtures pass.
22. Runtime integrity, `create-agdf` smoke tests and `@agdf/cli` smoke tests pass.

## 3. Non-Goals

- No hosted coordination service, database, lease server or mandatory network dependency.
- No semantic auto-merge of concurrent writes to the same run.
- No cross-repository global run identifier registry.
- No replacement of Git history or the durable gate artefact chain.
- No change to AGDF gate names, order, approval syntax or transition legality.
- No use of `MASTER_BACKLOG.md` as an execution lock or canonical state record.
- No permanent reliance on `.gitattributes merge=union` for canonical run records.
- No requirement that legacy projections remain forever.

## 4. Users And Roles

| Role | Need | Authority |
|---|---|---|
| Delivery user | Work on one initiative without unrelated run conflicts | Selects scope and provides exact gate approvals |
| Agent | Read and update one evidenced run safely | Must use canonical resolver and preserve gate rules |
| Repository maintainer | Migrate existing state and configure CI | Controls migration timing and repository policy |
| CI | Validate repository delivery state deterministically | Uses all-active evaluation; cannot infer a run |
| Package/runtime maintainer | Preserve compatibility across releases and surfaces | Owns versioned migration and generated asset coherence |

## 5. Constraints

- The Runtime Contract remains the canonical gate and selection-policy owner.
- The CLI is the canonical deterministic validator and migration interface, not a second rule system.
- The implementation must reuse existing gate parsing and delivery analysis rather than fork semantics.
- Source changes must flow through `plugin/` and `create-agdf/scripts/sync-package-assets.js`; generated
  package output is not independently authoritative.
- The model must work with plain files and Git on supported agent surfaces.
- Migration must be reversible until semantic equivalence is verified.
- Read-only commands must remain read-only, including when migration is required.
- Human-readable artefacts remain English under the current project language configuration.

## 6. Evidence Requirements

- Resolver tests for zero, one, multiple, selected and conflicting-selector states.
- Schema tests for invalid identifiers, path mismatch, duplicate fields and lifecycle values.
- Golden before/after gate-check and delivery-map fixtures proving migration equivalence.
- Failure-injection tests proving migration does not partially mutate inputs.
- Idempotency test for repeated successful migration.
- Drift test for a modified legacy compatibility projection.
- Optimistic-write test proving stale revision rejection without mutation.
- Two-run fixture proving independent changes touch distinct canonical files.
- Same-run Git fixture proving conflicts are not hidden by union merge behavior.
- Aggregate CI fixtures for pass, warn, revise and block across active runs.
- Package-content verification for canonical templates and migration/runtime assets.
- Cross-surface instruction and documentation integrity checks.

## 7. Risks And Open Questions

- SD must choose the exact state schema, revision algorithm, shared resolver module boundary and atomic
  write mechanism without changing the product behavior above.
- SD must decide whether the compatibility projection is generated automatically after canonical
  writes or only by an explicit compatibility command; either choice must preserve one authority.
- TP must map every direct legacy read/write call site and every generated copy before implementation.
- Release planning must define the minimum package-version window for mixed old/new consumers.
- The Context Graph node identified by Brownfield Review remains an open reconciliation action until
  approved PRD/SD decisions can be recorded precisely.

## 8. Next Step

Review this PRD and approve only after it exists with:

`Approval: PRD`

The earlier pre-artefact approval was not accepted. A new valid post-artefact `Approval: PRD` was
provided on 2026-07-11.
