# AGDF Control Scaffold

AGDF is primarily a control system for AI-assisted delivery. The skills guide the agent during a run; these files make the run state durable in a repository.

Use this scaffold when a target repository should keep AGDF state outside chat history and tool memory.

## Files

| File | Purpose |
|---|---|
| `config.json` | Project language preference for generated AGDF artefacts and user-facing chat |
| `templates/RUN_STATE.md` | Canonical version-2 template for isolated per-run state |
| `templates/AGDF_RUN.md` | Legacy migration-input and compatibility-projection template |
| `templates/MASTER_BACKLOG.md` | Template for the living backlog pointer: active initiatives and current UR/Brownfield/PRD/SD/TP/QA/OR artefacts |
| `templates/artefacts/UR.md` | Template for the durable user requirement artefact of a work item |
| `templates/artefacts/BROWNFIELD_REVIEW.md` | Template for the durable Brownfield Review and Mode/Slice Decision |
| `templates/artefacts/VERIFIED_CHANGE.md` | Compact fail-closed record for an eligible Verified Change |
| `templates/artefacts/PRD.md` | Template for the durable product requirements artefact |
| `templates/artefacts/SD.md` | Template for the durable solution design artefact |
| `templates/artefacts/TP.md` | Template for the durable task and test plan artefact |
| `templates/artefacts/QA_REPORT.md` | Template for the durable QA decision report |
| `templates/artefacts/OR.md` | Template for the durable Orchestration Report closeout |
| `templates/SOT_REGISTRY.md` | Template for the source-of-truth registry: one primary owner per domain |
| `templates/CONTEXT_GRAPH.md` | Template for project memory: durable decisions, Brownfield findings, risks, evidence and exit criteria |
| `templates/AGENT_QUALITY_CONTRACTS.json` | Template for machine-readable warning, revise and block contracts for review and QA |

## Recommended Target Layout

```text
.agdf/
  control/
    runs/
      <run_id>/
        RUN_STATE.md
    config.json
    AGDF_RUN.md
    MASTER_BACKLOG.md
    artefacts/
      <work-item>/
        UR.md
        BROWNFIELD_REVIEW.md
        PRD.md
        SD.md
        TP.md
        QA_REPORT.md
        OR.md
    SOT_REGISTRY.md
    CONTEXT_GRAPH.md
    AGENT_QUALITY_CONTRACTS.json
```

Keep these files small and reviewable. They are control artefacts, not a second documentation site.

Create the live files with:

```bash
npx --yes @agdf/cli@latest init
```

If only the project language preference is missing or should change after plugin installation, write just the config file:

```bash
npx --yes @agdf/cli@latest config --language en
```

Then check whether the live state is actionable:

```bash
agdf doctor
agdf doctor --json
agdf gate-check --json
```

`doctor` does not replace agent judgment. It catches basic control failures: missing live files, missing current gate, missing next allowed action, empty evidence, empty backlog pointer, empty source-of-truth registry, duplicate active SoT rows and invalid quality contracts.
`gate-check` consumes the doctor result and live run state to report whether the next process step is `open` or `blocked`.

## Operating Rules

- Canonical mutable state is isolated per run at `runs/<run_id>/RUN_STATE.md`. Run discovery is
  derived; do not maintain a writable active-run index. When several runs are active, discovery
  presents the most recently updated run first and lists the others, but requires an explicit run
  selection for read-only status or explicit run-selection requests. Implementation intake first
  provides canonical UR evidence to the coding agent for scope assignment, even with one active
  run: resume one same-scope continuation, start a new UR run for an independent scope, or clarify
  genuinely overlapping work. If no active run exists during a status request, ask whether to start
  one or do something else. Status never creates a run. `updated_at` is recorded with
  every canonical run write; older runs use file modification time until their next recorded update.
- Migrate legacy state explicitly with `run-migrate`; read-only commands never migrate. A retained
  `AGDF_RUN.md` is migration input or a non-authoritative projection, not a second writable owner.
- A run created by `run-create` is sealed. Record every change to it or to a listed artefact with
  `run-update`, and record exact gate replies only with `run-approve`; an unrecorded edit blocks
  `doctor` and `gate-check` until it is recorded.
  If a run lists its own `RUN_STATE.md`, the seal covers its body directly and uses a self-reference
  marker for that artefact entry. This avoids circular on-disk hashing; references to other runs
  remain fully hashed. Old self-reference failures require a verified restoration, never a blind re-seal.
- Record the standard small-path steps with one `run-step` call each instead of editing the run state
  and `MASTER_BACKLOG.md` by hand: `--step ur --title` after writing `artefacts/<run_id>/UR.md`;
  `--step route --route <mode> --reason --evidence` after writing `BROWNFIELD_REVIEW.md`;
  `--step evidence` for test or check results; `--step review --decision --evidence` for Code Review;
  and `--step closeout --result --evidence --risk --next` to close a `quick_task` with OR-lite. Each
  call maintains the tables, the backlog pointer and the next allowed action and prints the next step.

- The selected `runs/<run_id>/RUN_STATE.md` is the current run dashboard.
- `config.json` stores the project preference for artefact and chat language; runtime rules stay English.
- `MASTER_BACKLOG.md` points to active delivery work; detailed artefacts live beside the work item.
- Brownfield Review records the post-UR Mode/Slice Decision before PRD depth, Verified Change execution or Quick Task execution is chosen.
- UR, PRD, SD, TP and QA decisions require durable artefacts or links to the authoritative repository source of truth before the next gate can open.
- OR records the run closeout and next permissible step; it does not approve later gates.
- `SOT_REGISTRY.md` decides which document owns which domain.
- `CONTEXT_GRAPH.md` records durable project knowledge only when it has evidence and an exit criterion.
- `AGENT_QUALITY_CONTRACTS.json` names reusable block, revise and warning conditions.
- Never assign `merge=union` to canonical `runs/<run_id>/RUN_STATE.md` records. Concurrent edits to the
  same run must remain conflict-visible; independent runs naturally change different files. After a
  merge or pull, rerun `doctor` and `gate-check` for the selected run.

Do not duplicate full product documentation in this scaffold. Link to the authoritative artefact instead.

## Planned outputs during recovery

A missing file explicitly declared `missing` or `pending` under the selected run's own
`.agdf/control/artefacts/<run_id>/` directory is a planned output, not lost completed evidence.
Recovery retains its path and absence in the integrity snapshot and leaves its status pending.
It does not create evidence or approve a gate. Completed or ready evidence, unsafe paths and
descriptive placeholders still require repair. Creating a planned file after a recovery preview
invalidates that preview; creating it after recovery changes the seal until a canonical update.
