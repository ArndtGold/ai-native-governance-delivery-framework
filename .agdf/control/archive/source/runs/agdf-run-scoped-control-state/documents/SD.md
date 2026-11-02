# SD: Run-Scoped AGDF Control State

Status: approved
Gate: SD
Gate approval: `Approval: SD` provided on 2026-07-11
Based on: approved PRD
Date: 2026-07-11
Owner: agent

## 1. Solution Overview

Refactor the existing single-file run-state reader into one shared control-state core used by every
CLI and Delivery Path Search path. The core discovers canonical run records, applies deterministic
selection, validates strict Markdown state, and returns the existing normalized run-state shape to the
unchanged gate and delivery-map evaluators.

Canonical records live at:

`.agdf/control/runs/<run_id>/RUN_STATE.md`

The solution deliberately has no writable repository-level active-run index. Active-run discovery is
derived from canonical records. The existing `.agdf/control/AGDF_RUN.md` becomes migration input or an
explicitly rendered, non-authoritative compatibility projection only.

## 2. Ownership And Source Of Truth

| Domain | Canonical owner | Responsibility |
|---|---|---|
| Gate and selection policy | `plugin/meta/agdf-runtime-contract.md` | Human/agent runtime semantics, precedence and fail-closed rules |
| Run-state template | `plugin/control/templates/RUN_STATE.md` | Canonical Markdown schema for one run |
| Legacy template | `plugin/control/templates/AGDF_RUN.md` | Deprecated migration/compatibility shape during transition |
| State core | `create-agdf/lib/control-state/` | Discovery, strict parsing, validation, selection, revision checks and atomic writes |
| CLI orchestration | `create-agdf/bin/create-agdf.js` | Argument parsing, command presentation and invocation of the state core |
| Delivery evaluation | Existing gate-check/delivery-map functions | Consume normalized selected state without owning discovery or parsing |
| Delivery Path Search adapter | `create-agdf/lib/delivery-path-search/state-adapter.js` | Consume the same resolved normalized state; no direct file read |
| Human steering | `MASTER_BACKLOG.md` | Scope and artefact pointers only; never execution-state authority |
| Generated package assets | `create-agdf/generated/` via `sync-package-assets.js` | Derived copies only |

No alternate surface-specific state loader is permitted.

## 3. Architecture Decisions

### 3.1 Canonical Layout

```text
.agdf/control/
  config.json
  runs/
    <run_id>/
      RUN_STATE.md
  templates/
    RUN_STATE.md
  AGDF_RUN.md                  # optional legacy input or explicit projection
  MASTER_BACKLOG.md
  SOT_REGISTRY.md
  CONTEXT_GRAPH.md
  AGENT_QUALITY_CONTRACTS.json
```

Directory discovery scans only immediate children of `runs/`, sorts by `run_id`, ignores hidden
entries and rejects symlinked run directories or state files. The directory and declared identifier
must match the PRD identifier grammar.

### 3.2 Run-State Schema

`RUN_STATE.md` reuses the current `AGDF_RUN.md` sections and adds these required Run Meta fields:

- `control_state_version: 2`
- `run_id: <stable id>`
- `lifecycle: active | completed | superseded | abandoned`
- `revision: <positive integer>`
- `revision_id: <UUID>`

All required scalar fields may occur exactly once. The parser returns structured duplicate-field,
invalid-value, path-mismatch and unsupported-version findings before any gate evaluation.

`revision` increments on every controlled write. `revision_id` changes on every controlled write and
is the optimistic concurrency token returned to callers. A writer must provide the observed token;
mismatch produces `AGDF_STALE_RUN_REVISION` before mutation.

Direct human/agent edits remain possible but must set a fresh `revision_id` and increment `revision`.
`doctor` reports unchanged or malformed revision metadata as a validation finding when detectable;
Git remains the final conflict surface for uncontrolled simultaneous edits.

### 3.3 Shared Core Modules

Create these source-owned modules under `create-agdf/lib/control-state/`:

- `run-state-parser.js`: strict Markdown parsing and normalized state production.
- `run-state-repository.js`: canonical path construction, discovery and safe reads.
- `run-state-resolver.js`: selector precedence, lifecycle filtering and ambiguity findings.
- `run-state-writer.js`: optimistic token check, temporary-file write, fsync/rename and cleanup.
- `legacy-migration.js`: validation, equivalence comparison, migration and explicit projection render.
- `aggregate.js`: deterministic all-active result aggregation.

The existing `readRunState` behavior moves behind the parser/repository boundary. Gate analysis stays
in its existing owner and accepts a normalized state object, preventing a second transition model.

### 3.4 Selection Algorithm

Inputs are `{ runIdArg, runIdEnv, allActive, commandCapability }`.

1. Reject `allActive` with either explicit run selector.
2. Reject unequal `runIdArg` and `runIdEnv`; do not silently override.
3. Validate and select the explicit identifier when present.
4. Otherwise discover canonical records and filter `lifecycle=active`.
5. Select automatically only when exactly one active record exists.
6. Return typed zero-active or ambiguous-active findings otherwise.

`gate-check` and Delivery Path Search reject `allActive`. `doctor` and `delivery-map` accept it.
Selection output always includes selection source, selected `run_id`, discovered active identifiers and
the canonical path.

### 3.5 All-Active Aggregation

All active records are evaluated independently in sorted `run_id` order. Aggregate severity uses:

`block > revise > warn > pass`

The output contains one summary decision, per-run decisions/evidence and repository-level discovery
findings. No run's approval or evidence can satisfy another run. Empty active sets return `revise` by
default; `config.json` may explicitly set `allow_no_active_runs: true` for repositories with no active
governed delivery.

### 3.6 Creation

Add `run-create --run <run_id>`. It validates the identifier, refuses any existing destination,
creates the directory and writes a version-2 active record using the canonical template. It never
derives an identifier from branch names or backlog text.

`init` creates `runs/` and the template only. It does not create a live run and does not overwrite a
legacy file.

### 3.7 Legacy Migration

Add `run-migrate [--run <run_id>]`:

1. Require a legacy file and validate it with the strict legacy parser.
2. Resolve the identifier from a valid legacy `run_id` or require `--run` when absent/invalid.
3. Build the version-2 canonical record in memory.
4. Evaluate legacy and candidate normalized state and compare gate-relevant semantics.
5. Refuse collision unless the existing canonical record is semantically equivalent.
6. Write atomically only after all validation and equivalence checks pass.
7. Re-read and verify the canonical record.
8. Leave the legacy input unchanged and report the optional explicit projection/removal actions.

Equivalent repeated migration returns success without writing. No ordinary read command migrates.

### 3.8 Legacy Projection

Add `run-render-legacy --run <run_id>`. It explicitly replaces `AGDF_RUN.md` with a generated
projection containing:

- a visible non-authoritative warning
- canonical source path
- selected `run_id`
- canonical `revision_id`
- SHA-256 digest of canonical source bytes

Canonical writes never update the projection automatically, avoiding renewed cross-run contention.
When a projection exists, new read commands verify its marker and digest. Divergence reports
`AGDF_LEGACY_PROJECTION_DRIFT`; the canonical record remains authoritative but the command fails closed
until the projection is regenerated or removed.

### 3.9 Atomic And Safe Writes

Controlled writes use a temporary file in the destination directory, flush content, atomically rename
over the canonical path and remove leftovers on failure. They refuse symlinks, path traversal,
unexpected file types and stale `revision_id`. Migration never deletes or rewrites legacy input.

### 3.10 Compatibility Sequence

1. Release runtime that understands both legacy-only and canonical layouts but requires explicit
   migration before canonical evaluation.
2. Migrate repositories explicitly and optionally render a legacy projection for older readers.
3. Update CI and all supported surfaces to canonical/all-active operation.
4. Remove projections repository-by-repository when older consumers are retired.
5. A later separately governed release may remove legacy parsing; this delivery does not.

If canonical records and an unmarked legacy file coexist, commands report mixed-authority drift and
fail closed. They never choose one silently.

## 4. Integration Points

| Integration | Change |
|---|---|
| CLI argument parser | Add `--run`, `--all-active` and commands `run-create`, `run-migrate`, `run-render-legacy` |
| `evaluateDoctor` | Resolve one/all canonical records, include discovery findings and retain repository scaffold checks |
| `evaluateGateCheck` | Resolve exactly one canonical record, then use existing gate evaluator |
| `analyzeDeliveryMap` | Evaluate selected/all-active normalized records and aggregate deterministically |
| Delivery Path Search | Receive resolved normalized state or call shared resolver; remove direct `AGDF_RUN.md` read |
| `init` | Ship `runs/` layout and canonical template without inventing a run |
| Runtime Contract/skills | Name canonical path, selector rules, migration boundary and agent-native selected-run evidence |
| Runtime integrity | Validate canonical template, shared ownership, generated copies and absence of surface forks |
| Workflow | Change repository delivery-map validation to `--all-active` |
| Docs/site/package README | Explain selection, migration, compatibility projection and CI policy consistently |

## 5. Constraints And Compatibility

- Existing gate order, exact approvals, artefact statuses and normalized output fields remain stable.
- JSON outputs add selection and per-run aggregation fields without renaming existing single-run fields.
- Legacy-only repositories receive typed migration guidance rather than an unstructured missing-file
  error.
- Generated outputs are synchronized from canonical sources; no direct generated-file edits.
- Surface adapters may expose equivalent invocation affordances but use the same core modules.
- Canonical run records never use `merge=union`.
- Read-only commands perform no migration, rendering or revision updates.
- New filesystem writes remain inside the target repository after realpath/symlink validation.

## 6. Test And Evidence Strategy

### Focused unit tests

- strict parser and duplicate-field rejection
- identifier, lifecycle and schema-version validation
- resolver precedence and selector conflicts
- discovery ordering, symlink rejection and path mismatch
- optimistic revision and stale-write rejection
- aggregate severity and empty-set policy

### Integration fixtures

- fresh scaffold and `run-create`
- one-run no-selector flow
- multiple-run ambiguity and explicit selection
- all-active mixed decisions
- valid migration, repeated migration and collision failure
- semantic equivalence before/after migration
- marked projection generation and drift detection
- mixed canonical/unmarked-legacy block
- two-run independent writes and same-run Git conflict visibility
- Delivery Path Search selected-run input

### Required validation

- `node plugin/scripts/check-runtime-integrity.mjs`
- `npm --prefix create-agdf run smoke-test`
- `npm --prefix agdf run smoke-test`
- repository workflow-equivalent `delivery-map --all-active`
- package-content inspection after asset sync/prepack
- `git diff --check`

## 7. Risks And Open Questions

- Extracting parsing from the CLI monolith is broad but necessary to prevent a second state owner; TP
  must sequence extraction before behavior changes.
- Compatibility projections intentionally become stale after canonical writes; operational guidance
  must make explicit regeneration/removal easy without making projections authoritative.
- Revision metadata cannot prevent uncontrolled direct edits; it protects controlled writes while Git
  and strict duplicate validation preserve visible conflicts for manual edits.
- Existing staged control-artefact changes belong to the current run and must be preserved; task
  implementation must not assume a clean index.
- The exact JSON field names for aggregate outputs and typed findings must be frozen in TP fixtures
  before implementation.

## 8. Context Graph Reconciliation Plan

- target_node: `CG-RUN-SCOPED-CONTROL-STATE`
- create_after: approved SD, when architecture decisions are stable
- durable_invariants: one mutable authority per run; one shared resolver; derived discovery; explicit
  ambiguity; explicit migration; no automatic legacy projection writes
- current_state: open_gap; warning only before implementation, required to resolve before closeout

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`
