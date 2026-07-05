# AGDF Control Scaffold

AGDF is primarily a control system for AI-assisted delivery. The skills guide the agent during a run; these files make the run state durable in a repository.

Use this scaffold when a target repository should keep AGDF state outside chat history and tool memory.

## Files

| File | Purpose |
|---|---|
| `templates/AGDF_RUN.md` | Template for current run state: mode, gate, approvals, evidence, risks, next allowed action |
| `templates/MASTER_BACKLOG.md` | Template for the living backlog pointer: active initiatives and current UR/PRD/SD/TP artefacts |
| `templates/SOT_REGISTRY.md` | Template for the source-of-truth registry: one primary owner per domain |
| `templates/CONTEXT_GRAPH.md` | Template for project memory: durable decisions, Brownfield findings, risks, evidence and exit criteria |
| `templates/AGENT_QUALITY_CONTRACTS.json` | Template for machine-readable warning, revise and block contracts for review and QA |

## Recommended Target Layout

```text
.agdf/
  control/
    AGDF_RUN.md
    MASTER_BACKLOG.md
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
```

`doctor` does not replace agent judgment. It catches basic control failures: missing live files, missing current gate, missing next allowed action, empty evidence, empty backlog pointer, empty source-of-truth registry, duplicate active SoT rows and invalid quality contracts.

## Operating Rules

- `AGDF_RUN.md` is the current run dashboard.
- `MASTER_BACKLOG.md` points to active delivery work; detailed artefacts live beside the work item.
- `SOT_REGISTRY.md` decides which document owns which domain.
- `CONTEXT_GRAPH.md` records durable project knowledge only when it has evidence and an exit criterion.
- `AGENT_QUALITY_CONTRACTS.json` names reusable block, revise and warning conditions.

Do not duplicate full product documentation in this scaffold. Link to the authoritative artefact instead.
