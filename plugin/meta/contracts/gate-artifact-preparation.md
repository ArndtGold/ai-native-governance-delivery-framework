# AGDF Runtime Contract — Gate Artifact Preparation

This contract guides the `gate-check` skill when canonical gate evaluation returns
`control.next_operation.type: prepare_gate_artifact`. It is procedural guidance only; canonical
Run State, gate evaluation and exact approval remain authoritative.

## Common Route

- Use only the supplied `gate`, `artifact_path`, `source_artifacts`, `target`, `run_id` and
  `revision_id`. Do not rediscover or substitute a run, target, or source artifact.
- Prepare only the named current-gate artifact. Keep it derived from the supplied approved sources
  and record it in canonical run control.
- After persistence, redispatch `gate-check` for the same target/run and use its fresh revision,
  gate route and approval presentation. Do not reuse this operation or ask for approval until the
  fresh dispatcher result supplies a valid presentation.
- If a source is missing, a prerequisite is unresolved, the state changed, or the artifact cannot be
  persisted, stop with the concrete blocker. Never create a later-gate artifact or infer approval.

## Gate-Specific Work

### PRD

Derive the PRD from the approved UR and completed Brownfield Review. Preserve the
`criteria-chain-v1` traceability marker. Define scope, non-goals and uniquely identified, observable
acceptance criteria. Record product decisions needed for PRD approval in Approval Decisions; gather
unresolved `before_prd` answers together before recording the final PRD revision. Defer genuine
design and planning decisions with named owners.

### SD

Derive the Solution Design from the approved PRD and resolved Approval Decisions. Preserve
`criteria-chain-v1` and map each PRD criterion exactly once to its design response, authoritative
source/owner, stable SDD decision ID (or reasoned `none`), and compatibility/risk treatment. Define
architecture, boundaries, flows and trade-offs at the smallest justified depth. Do not reopen
answered product questions; material product-scope changes require a PRD revision and fresh PRD
approval first.

### TP

Derive the Task/Test Plan from the approved PRD and Solution Design. Preserve `criteria-chain-v1`.
Map every PRD criterion and SD decision to stable task IDs, scenarios, observable expected results
and specific evidence sources. Include proportionate boundary/failure scenarios, dependencies and
risks. Do not copy or rename acceptance criteria. Do not implement or claim QA/release readiness
before TP approval.
