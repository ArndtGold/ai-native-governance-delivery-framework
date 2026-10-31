# AGDF Runtime Contract — Control Scaffold

## Delivery Path Search

Delivery Path Search is an optional read-only planning step for high-impact decisions with several materially different next actions.

- It consumes the canonical selected-run `gate-check` evaluation for run, revision, current gate and
  legal actions. Persisted presentation Markdown such as the Run Status Card is never policy input.
- It binds the selected `scope_key`, `scope_revision` and objective to one control snapshot. A stale
  or incomplete snapshot fails before candidate generation or evaluation.
- It reports the phase that actually ran: `input | candidate | evaluation | search`. A phase that
  did not run cannot produce a later-phase conclusion.
- Terminal status is `input_unavailable | no_legal_candidates | evaluator_unavailable |
  evaluator_error | recommendation | no_safe_recommendation`. Recommendation-facing statuses
  require at least one contract-valid evaluation. `candidate_queue_exhausted` is a stopping reason,
  not recommendation evidence.
- It reports baseline/generated/legal/rejected candidate counts and attempted/valid/invalid
  evaluation counts. Zero valid evaluations must never be presented or persisted as an evaluated
  recommendation conclusion.
- It must report budgets, stopping reason and `full | tool_enforced | instruction_only` enforcement.
- Model scores are judgements, not measurements.
- Search output is evidence only. Canonical `gate-check` independently decides what may proceed.
- Search applies only to the selected run objective. An unrelated decision needs the correct
  governed scope; Delivery Path Search is not a second task-target resolver.
- The bounded first-release algorithm must not be labelled MCTS.
- Surface adapters may translate transport and presentation, but must not fork scoring, search or gate semantics.
- Optional AI-native candidate generation supplements the deterministic candidate baseline; it never replaces it.
- Generated proposals are untrusted. The core must validate schema, exact canonical gate action, scope, duplicates and material diversity before evaluation.
- Generation is opt-in and bounded to one call, five proposals, 30 seconds and five abstract cost units by default, within whole-run budgets.
- External generation receives only bounded normalized control summaries and references, never secrets, full artefacts, raw prompts, hidden reasoning or source snapshots.
- Generator status, provenance, accepted/rejected counts, separate budget use and typed failure must remain visible. Failure retains the deterministic baseline; automatic provider fallback is forbidden.
- Codex and Claude Code may provide tool-enforced generator transports. Copilot, OpenCode and generic surfaces remain instruction-only without conforming evidence.
- OpenCode may provide a tool-enforced evaluator only for an invocation whose capability preflight proves `opencode run --pure --agent`, the owned evaluator agent and effective executable-tool denies. Preflight or transport failure must return `evaluator_unavailable` with `instruction_only` enforcement and point to the existing instruction-only workflow; it must not continue through a weaker subprocess.
- OpenCode candidate generation remains unavailable.
- Persistence accepts only contract-valid `recommendation` or `no_safe_recommendation` results with
  at least one valid evaluation. Input, candidate and evaluator failure results remain transient.

The field names above are the stable machine-readable contract used by JSON
reports and automation. Human-facing Markdown must present the same projection
with readable labels such as `Current gate`, `Allowed now`, `Blocked by`,
`Next step` and `Quality outlook`; do not expose snake_case keys as the visible
Run Status Card. Keep that card compact: show `Status`, `Current gate`,
`Allowed now`, `Blocked by`, `Missing approval`, `Next gate after approval`
and `Allowed after approval` when a missing approval exists, `Next step` and
`Quality outlook`. Keep mode, forbidden actions, evidence and next-skill detail
in the surrounding control artefact when they are relevant.


## Control Scaffold

### Run-Scoped Control State

Canonical mutable run state lives at `.agdf/control/runs/<run_id>/RUN_STATE.md`, one file per run.
Repository-level discovery is derived; do not maintain a writable active-run dashboard. Select with
`--run`, then `AGDF_RUN_ID`, or automatically only when exactly one run is active. Ambiguity fails
closed. Legacy `AGDF_RUN.md` is migration input or an explicitly rendered non-authoritative projection,
never a second writable owner. Read-only commands must not migrate state.

`run-create` writes a sealed run. The seal covers the run state and every file listed under
Artefacts; an unrecorded edit blocks `doctor` and `gate-check` with `AGDF_RUN_SEAL_MISMATCH`. After
changing either, call `run-update --run <run_id> --revision <revision_id>` before `gate-check`; it
advances the revision and refuses Approvals changes. Only `run-approve` records an approval. Both run
on the surface-local validator. The seal detects unrecorded edits; it is not a signature.
Keep one `Artefacts` row per type: update the existing placeholder row instead of appending another.
`run-update` and all run writers reject duplicate rows without advancing the revision. Remove the
extra row and retry `run-update` to record the correction. Duplicate rows in older sealed runs also
block `doctor` and gate presentation.

An active run that will not be completed ends as `superseded` (successor and reason) or `abandoned`
(reason) only through `run-close` or the MCP `agdf_closeout` kinds `closure.preview` and
`closure.apply`. The preview changes no run and is stored under `.agdf/control/closure-previews/`;
the owner applies it with the exact phrase `Close runs: <preview_id>`. Each eligible run that is
unchanged since the preview receives its own sealed `lifecycle_close.record` receipt; the result
names every listed run. A pending run-step journal anywhere in the repository blocks the whole
closure. An ended run is final: every run writer, approval, presentation, revision, recovery and
delivery continuation rejects it with `lifecycle_ended`; `run-update` on an unchanged ended run only
synchronizes its backlog row. Continuing the work needs a new run.

When a repository needs durable AGDF state, use the plugin-local `control/` scaffold as the starting point.

- `config.json` stores project language preferences. Use `artifact_language` for generated AGDF artefacts. `chat_language` is the direct-command presentation default; dispatcher calls supply `presentation_language` under their current-request language contract. This presentation override never changes `artifact_language`. Runtime rules remain English. Authoring continuations supply the resolved languages and any required localized approval-summary heading before drafting.
- `.agdf/control/runs/<run_id>/RUN_STATE.md` is the canonical current-run dashboard; legacy `AGDF_RUN.md` is migration input or an explicit non-authoritative projection.
- `MASTER_BACKLOG.md`, when retained, is optional read-only legacy planning/history. Current membership and control belong to Runs; normal operations never maintain its rows or take its lock.
- `BROWNFIELD_REVIEW.md` records the post-UR existing-system view and Mode/Slice Decision before PRD depth or Quick Task execution is chosen.
- `SOT_REGISTRY.md` prevents parallel sources of truth.
- `CONTEXT_GRAPH.md` stores durable Brownfield findings, decisions, risks, evidence and exit criteria.
- `AGENT_QUALITY_CONTRACTS.json` stores reusable block, revise and warning conditions.
- `memory_target`, `multi_scope_state` and branch/workspace evidence fields make ambiguity and persistence decisions visible without turning chat history into the source of truth.
- OR reports live under `.agdf/control/artefacts/<key>/OR.md` when a run closeout is steering-relevant or should be auditable beyond the chat.

### Optional Legacy Backlog

Fresh initialization does not require or seed a live MASTER_BACKLOG.md. Preserve existing
bytes and planning/history information; optional legacy reading retains original rows, links
and provenance within existing limits. Its missing/corrupt state cannot veto valid Run work.
Never fabricate Runs/approvals or replace it with another mandatory shared index. Normal Run
create/record/approval/update/closeout writes only its actual Run/artefact outputs. Historical
pending journals retain original captured outputs: explicit supported recovery alone may
finish a recorded legacy backlog responsibility under its original locks and conflict checks.

The normative worktree placement/reuse/ignore rule is owned by
[task-target-resolution.md](task-target-resolution.md#worktree-placement-and-assigned-checkout).

The scaffold is not a second documentation site. Link to authoritative artefacts instead of copying them.

## Agent-Native Runtime And CLI Verification

AGDF is agent-native first and CLI-verifiable by design.

The primary operating path is the active skill plus the live `.agdf/control/` artefacts.
Agents should read the repository state, apply this Runtime Contract, create or update only the currently allowed artefact, and make the next permissible step explicit.
When control state is missing, follow the existing setup/link boundary before run creation.
After a concrete run is bound, dispatch delegates requirement drafting to `ur-definition`.
Only fresh canonical readiness and a run-present binding may request `Approval: UR`.
This branch is unreachable for `target_unresolved`.
Initialize a control scaffold only when durable AGDF control state is explicitly requested, already used by the repository, or required by a deterministic CLI/CI setup path.

Helper commands are deterministic proof and automation interfaces, not the normal-work ritual:

- `init` creates the machine-readable control scaffold.
- `doctor --json` checks whether `.agdf/control/` is consistent and actionable; it is not the reviewer. On a host that lists the AGDF MCP server, the read-only tool `agdf_inspect` (`operation: doctor | gate-check | delivery-map | contract`) returns the same `--json` object and canonical Markdown without a shell; the shell binding stays the fallback. It never writes control state or prepares an approval binding.
- `gate-check --json` reports reproducible gate state; it does not replace the gate-check skill judgement.
- `gate-check --approval-envelope` prints a read-only summary and link to the current artefact. The agent uses `run-present` before asking for an exact gate approval.
- `delivery-map --json` reports the delivery picture for CI, PRs, regression checks and audit trails.

Machine-readable outputs should stay agent-friendly: stable decisions, blocking gate or current gate, missing approval, allowed outputs, forbidden outputs, next step, evidence and findings.
They make the repository state checkable, but they do not replace the native skill workflow or the durable control artefacts.

### Repository Activation Diagnosis Boundary

`doctor --json` on the resolved surface-local validator is the sole canonical, code-owned, tool-shell-safe activation probe. Plugin `AGDF_*` environment variables set by the OpenCode `shell.env` hook are an internal plugin status channel consumed by `opencode-status`, not an agent-facing diagnosis proof; host shell-env propagation to spawned tool shells is not guaranteed and is OpenCode-owned. A relative glob or `grep` for `.agdf/control/config.json` must not be used as proof of presence or absence of `.agdf/control/config.json`; an absolute `read` or the canonical CLI probe is required.

## Delivery Map

`delivery-map --json` is the machine-readable delivery picture for the selected canonical control state.
It derives, but does not replace, the selected `RUN_STATE.md` and its registered sources.

It must expose:

- approved or active artefacts and approvals
- `UR -> PRD -> SD -> TP -> QA_REPORT` relationships
- evidence refs, missing evidence and declared risks
- multi-scope ambiguity and branch/workspace evidence limits when present
- memory persistence target, reason and references when present
- Context Graph impact and gate effect
- optional evaluated Parent reconciliation and programme aggregation readiness from the Closeout
  Contract, without changing Child gate authority
- the Run Status Card as a compact projection of current gate, next step and quality outlook
- findings that explain why the delivery picture is `pass | warn | revise | block`

Missing relationship evidence in the Artefact Chain is at least `revise` once the related gate artefact is approved or passed.
Declared missing evidence, declared risk or Context Graph gate effect may escalate the delivery map to `warn`, `revise` or `block`.
