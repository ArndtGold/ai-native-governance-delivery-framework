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
- If a source is missing, a prerequisite is unresolved, the state changed, or persistence fails, stop
  dependent authoring. Use interaction.md Bounded internal recovery only for its dispatched eligible
  analytical owner; other conditions stay blocked. Never infer approval or create later-gate work.

## Reviewed Recording Input (version 1)

### Language and approval summary preparation

Use the supplied `artifact_language` from `.agdf/control/config.json` for the artefact and
the resolved `presentation_language` for user-facing text. The configured chat language is
the direct-command default; dispatcher presentation input follows its current-request contract.
Neither the request language nor English runtime/template text changes the artefact language.
When `approval_summary_required` is true, before recording include exactly one
`## <approval_summary_heading>` section with the supplied heading verbatim and a complete
summary in the resolved presentation language. Apply the existing interaction contract's
summary completeness and size limits; use no ellipses or hidden decision-relevant omissions.
For PRD include user goal, scope, every canonical criterion ID exactly once, and decision context
when approval decisions exist. Corrections use the existing permitted recording/revision path
and require a fresh presentation. The summary grants no approval and is not another authority.

Before recording, prefer the existing read-only MCP tool `agdf_inspect` with
`operation: artifact-readiness`, `presentation_language`, `working_directory`, the resolved
`primary_target`/`target_source`, and the supplied `run_id`, `gate` and `expected_revision_id`.
Supported draft gates are `UR | PRD | SD | TP`. The Core derives the contained run-local
`<gate>.md` path; there is no caller-supplied arbitrary path or implicit Run selection.
This operation calls the existing summary, product-decision and traceability validators.
The response has `report.ready`, `checks`, concrete `diagnostics`, `artifact_path`,
`artifact_digest`, current/expected revision and `next_action`; `authorizes` is always false.
`ready` covers authoring checks only: it neither records the draft nor establishes semantic
derivation, source-binding proof, final QA, presentation or approval readiness. Missing source,
stale revision, approved source or canonical integrity/gate blockers keep it unready. Resolve
the named issue through its existing owner. No recording or approval follows from this result
alone. Registration and run-present repeat their own current canonical checks.

If this installed MCP capability is unavailable, the exact Core function is
`inspectArtifactReadiness(root, { runId, gate, expectedRevisionId, presentationLanguage })`
in `packages/core/lib/control-inspect/artifact-readiness.js` (packaged as
`runtime/core/lib/control-inspect/artifact-readiness.js`). It returns the same report without
writing. Do not search for internal validator signatures or invent a replacement validator.
The existing Core `evaluateApprovalSummaryReadiness` remains the summary owner.
For a German PRD summary use separate `- Ziel:`, `- Umfang:` and, when decisions exist,
`- Entscheidungen:` lines; English summaries use `- Goal:`, `- Scope:` and `- Decisions:`.
Each criterion has its own `- AC-...:` line. A combined label such as `Ziel und Umfang:` or
`Entscheidungskontext:` is not one of these fields. Readiness and presentation share this validator;
do not accept prose as a substitute or invent another parser. An eligible own unapproved format
correction stays with the existing authoring continuation, once per diagnosed condition, followed
by canonical replacement and fresh evaluation. A ready draft still needs actual editing intent;
status is read-only, protected sources and unrelated blockers remain stopped.

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

Semantic PRD drafting and clarification belongs exclusively to prd-definition under its focused
contract. This module supplies the shared Reviewed Recording Input procedure only; gate-check
controls prerequisites, readiness and presentation.

### SD

Semantic SD drafting and clarification belongs exclusively to sd-definition under its focused
contract. This module supplies the shared Reviewed Recording Input procedure only; gate-check
controls prerequisites, declared decision readiness, traceability and presentation.

### TP

Derive the Task/Test Plan from the approved PRD and Solution Design. Preserve `criteria-chain-v1`.
Map every PRD criterion and SD decision to stable task IDs, scenarios, observable expected results
and specific evidence sources. Include proportionate boundary/failure scenarios, dependencies and
risks. Do not copy or rename acceptance criteria. Do not implement or claim QA/release readiness
before TP approval.
