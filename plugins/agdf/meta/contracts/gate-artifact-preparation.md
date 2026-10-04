# AGDF Runtime Contract — Gate Artifact Preparation

This contract guides the `gate-check` skill when canonical gate evaluation returns
`control.next_operation.type: prepare_gate_artifact`. It is procedural guidance only; canonical
Run State, gate evaluation and exact approval remain authoritative.

## Common Route

- Use only the supplied `gate`, `artifact_path`, `source_artifacts`, `target`, `run_id` and
  `revision_id`. Do not rediscover or substitute a run, target, or source artifact.
- Prepare only the named current-gate artifact. Keep it derived from the supplied approved sources
  and record it with the current runtime's `run-step --step artefact --gate <PRD|SD|TP|QA>
  --evidence <recording-input.json> --run <run_id> --revision <revision_id>` operation below.
  Do not publish a pointer and its required source relationship in separate accepted revisions.
- After persistence, redispatch `gate-check` for the same target/run and use its fresh revision,
  gate route and approval presentation. Do not reuse this operation or ask for approval until the
  fresh dispatcher result supplies a valid presentation.
- If a source is missing, a prerequisite is unresolved, the state changed, or the artifact cannot be
  persisted, stop with the concrete blocker. Never create a later-gate artifact or infer approval.

## Reviewed Recording Input (version 1)

Prepare files under `.agdf/control/artefacts/<run_id>/` before recording. The single shared Core
relationship registry selects PRD-derived_from-UR, SD-derived_from-PRD, TP-derived_from-SD or
QA_REPORT-tests-TP. UR-approved_by remains exclusively approval-owned. QA recording copies an
existing report's explicit Decision/Status value (`pass | revise | block`); it does not decide QA.

The JSON object has exactly these fields:

- `schema_version`: string `1`.
- `target_id`: existing local command-target identity, SHA-256 of `agdf-command-target/1`, NUL,
  and the canonical real absolute governance target. This is a binding, not authority.
- `run_id`, `expected_revision_id`: the supplied selected run and current revision.
- `destination`: exactly `type`, `path`, `digest`, `status`; logical registry type, canonical
  run-local `<type>.md`, full canonical SHA-256 and `draft` for PRD/SD/TP, report decision for QA.
- `source`: exactly `type`, `path`, `digest`; the registry's approved source and canonical digest.
- `relationship`: exactly `from`, `relationship`, `to`; the explicit registry triple.
- `review`: exactly `reviewer`, `path`, `digest`; named reviewer, separate contained mapping file
  and its canonical SHA-256. Do not overwrite an earlier sealed proof file.
- `update_draft`: boolean; true only for an explicit current-gate draft update.

The mapping file is JSON with exactly `schema_version`, `target_id`, `run_id`, `relationship`,
`destination`, `source`, `reviewer`, `reviewed`. Identity and source/destination objects match
the recording input exactly; reviewer matches review.reviewer, and reviewed is boolean true.
Digests use the existing canonical text/line-ending semantics. This is cooperative review
attestation, never independent proof of a human review or semantic derivation. QA/review assesses
the meaning. A prose header or gate order is not machine proof.

The existing operation checks current permission, contained non-symlink files, exact approved
sources and revision under locks. It appends its sealed Artefact Bindings receipt/history and
publishes pointer, relationship and audit together. The receipt is writer-owned; do not hand-author
it. An allowed draft replacement supersedes the prior active binding, retaining history. A changed
draft is accepted only when its prior binding reconstructs the recorded seal and every other
bound/approved byte remains unchanged. Otherwise stop with explicit maintenance/revision recovery.

Before presentation/approval, a recorded eligible current artefact must have its evidenced source
relationship. Missing artefacts remain draftable; a relationship-only blocker must not redraft the
artefact repeatedly. Only authorized bound continuation can attempt one exact previously sealed
proof correction before output. The shared Core continuation service coordinates this operation
and fresh routing; the dispatcher service itself only reads and routes. Explicit status, doctor,
evaluation and run-present never correct.
Unknown/malformed/foreign/stale/ambiguous proof, missing full approval integrity or unrelated
blockers remain blocked; legacy absence grants no correction permission. A successful correction
creates a new audited revision and fresh evaluation without another approval. Terminal output
already emitted is never intercepted. Older runtimes have no automatic correction capability.

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
