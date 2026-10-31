# AGDF Runtime Contract — Gate Artifact Preparation

This contract guides the `gate-check` skill when canonical gate evaluation returns
`control.next_operation.type: prepare_gate_artifact`. It is procedural guidance only; canonical
Run State, gate evaluation and exact approval remain authoritative.

## Typed MCP control transport

When the current host lists the fixed MCP control groups, use them for every eligible control step in Quick Task, Verified Change, Structured Slice and Structured Delivery. External source edits, actual test execution and Git actions remain external work. Read agdf_inspect/operation-contract for exact schemas and agdf_inspect/authoring-inputs for the current versioned template and all exact source chunks. Follow every cursor. Do not require local template/proof discovery, hashing or a validator shell switch.

For explicit first setup, read agdf_inspect/project-state with the confirmed existing Git target and no Run/revision. Only deliberate setup uses agdf_project/project.initialize with the returned target_id and one original UUID. This fixed canonical scaffold operation creates no Run/approval and never repairs/migrates/installs or grants permissions. Matching authored governance is read-only unchanged observation; conflicts/unowned partial states stay protected. After uncertainty inspect operation-status module project.initialize/<original UUID> before exact replay. Setup success returns the creation help next call. No diagnosis or creation implicitly initializes.

Create independent work with agdf_run/run.create using a semantic title and one original operation UUID; observe lost responses with pre-Run operation-status for that original UUID. Never ask the human for Run/revision IDs. An unbound or incomplete inventory cannot establish assignment.

Transfer UTF-8 material using agdf_record/material.stage: begin declares up to four slots and byte counts (128 KiB/file, 512 KiB/set); append supplies exact base64 byte parts of at most 16 KiB at the returned offset; seal validates all bytes and returns material references/digests. Requests remain <=64 KiB. Buffers are private to the serving generation, expire after ten minutes/two idle minutes and are bounded to four sets/two MiB. They are not files or approval. Correct a rejected offset/slot/revision; never publish protected files as a workaround. After a generation loss, restage identical semantic bytes, preserve the original mutation UUID and inspect its receipt before retrying. Reference IDs may change; semantic digests may not.

Record UR/internal/evidence/route/review via step.record; replace only a registered unapproved UR with agdf_revise/ur_draft.replace. Formal artefact.record takes the material, exact gate, reviewer, explicit reviewed:true and update_draft. Follow authoring-inputs recording.mode/update_draft and current operation help: initial uses false; explicit replace_unapproved or renew_invalidated_binding uses true and fresh current source/review. draft_registered false after a source revision does not erase historical binding obligations. Effective analytical next_operation selects the actual template/format, including UX reassessment at an outer PRD gate; never substitute the gate template or require source-code lookup. Actual reviewed source mapping remains required; Core retains its reviewed relationship and proof atomically, never inventing an independent semantic review. Approved sources use the existing reviewed source_revision.preview/apply owner, including a staged EVIDENCE JSON proposal; archive/receipt retains its exact logical reference without publishing a generic caller-selected file. Preserve deliberate confirmation and original-UUID recovery.

Verified Change uses verified_change.record phases eligibility/execution, the same read-only Git observations and unchanged compact evaluator. Core captures baseline/actual paths; scope escape escalates. Stage Mini-Closeout in its Verified Change slot and use closeout.record with the returned exact confirmation. Quick Task uses its existing review/evidence and OR-lite owner. No mode uses run-update as the routine MCP control path. Presentation prepare/deliver follows interaction.md; only a new deliberate exact human reply reaches approval.record.

The following local path/CLI forms remain compatibility fallback for hosts without these listed capabilities. They do not override typed MCP continuations.

## Common Route

- With MCP use only the returned current gate/Run/revision, bound template and exact source
  chunks from `authoring-inputs`; its template role and digest identify the version-matched owner.
  CLI fallback uses only the supplied `gate`, `artifact_path`, `template_path`, `source_artifacts`, `target`,
  `run_id` and `revision_id`. `template_path` is the absolute canonical authoring template from the
  installed, version-matched plugin for PRD, SD, TP or QA Report preparation. Repository scaffold
  copies are derived references only. Do not rediscover or substitute a run, target, source
  artifact or template. A missing or unsafe template blocks authoring without fallback or mutation.
- Prepare only the named current-gate artifact from the supplied approved sources.
  With MCP use `agdf_record/artefact.record` and the bounded reviewed material above.
  CLI fallback records with `run-step --step artefact --gate <PRD|SD|TP|QA>
  --evidence .agdf/control/artefacts/<run_id>/<input.json> --run <run_id> --revision <revision_id>`.
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
the direct-command default; MCP may inherit a known matching configured language; a different current-request language needs an explicit presentation_language override. CLI and complete Core language remain explicit.
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

Without that MCP capability, use the exact Core function
`inspectArtifactReadiness(root, { runId, gate, expectedRevisionId, presentationLanguage })`
in `packages/core/lib/control-inspect/artifact-readiness.js` (packaged as
`runtime/create-agdf/runtime/core/lib/control-inspect/artifact-readiness.js` in the plugin). Same report; no writes.
Do not search for internal validator signatures or invent a replacement validator.
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

Semantic TP drafting, clarification and explicit unapproved revision belong exclusively to
tp-definition under its focused contract. This module supplies shared recording only; gate-check
retains prerequisite/readiness and presentation authority.
