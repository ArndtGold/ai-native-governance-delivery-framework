# AGDF Control Scaffold

AGDF is primarily a control system for AI-assisted delivery. The skills guide the agent during a run; these files make the run state durable in a repository.

Use this scaffold when a target repository should keep AGDF state outside chat history and tool memory.

## Files

| File | Purpose |
|---|---|
| `templates/AGDF_RUN.md` | Template for current run state: mode, gate, approvals, evidence, risks, next allowed action |
| `templates/MASTER_BACKLOG.md` | Template for the living backlog pointer: active initiatives and current UR/Brownfield/PRD/SD/TP/QA/OR artefacts |
| `templates/artefacts/UR.md` | Template for the durable user requirement artefact of a work item |
| `templates/artefacts/BROWNFIELD_REVIEW.md` | Template for the durable Brownfield Review and Mode/Slice Decision |
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
npm create agdf@latest init
```

Then check whether the live state is actionable:

```bash
npm create agdf@latest doctor
npm create agdf@latest doctor --json
npm create agdf@latest gate-check --json
```

`doctor` does not replace agent judgment. It catches basic control failures: missing live files, missing current gate, missing next allowed action, empty evidence, empty backlog pointer, empty source-of-truth registry, duplicate active SoT rows and invalid quality contracts.
`gate-check` consumes the doctor result and live run state to report whether the next process step is `open` or `blocked`.

## Operating Rules

- `AGDF_RUN.md` is the current run dashboard.
- `MASTER_BACKLOG.md` points to active delivery work; detailed artefacts live beside the work item.
- Brownfield Review records the post-UR Mode/Slice Decision before PRD depth or Quick Task execution is chosen.
- UR, PRD, SD, TP and QA decisions require durable artefacts or links to the authoritative repository source of truth before the next gate can open.
- OR records the run closeout and next permissible step; it does not approve later gates.
- `SOT_REGISTRY.md` decides which document owns which domain.
- `CONTEXT_GRAPH.md` records durable project knowledge only when it has evidence and an exit criterion.
- `AGENT_QUALITY_CONTRACTS.json` names reusable block, revise and warning conditions.

Do not duplicate full product documentation in this scaffold. Link to the authoritative artefact instead.
