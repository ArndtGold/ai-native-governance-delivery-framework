# AGDF Runtime Contract — Control Scaffold

## Delivery Path Search

Delivery Path Search is an optional read-only planning step for high-impact decisions with several materially different next actions.

- It consumes current AGDF state and must reject gate-illegal candidates before model evaluation.
- It returns one advisory recommendation or `no_safe_recommendation`.
- It must report budgets, stopping reason and `full | tool_enforced | instruction_only` enforcement.
- Model scores are judgements, not measurements.
- Search output is evidence only. Canonical `gate-check` independently decides what may proceed.
- The bounded first-release algorithm must not be labelled MCTS.
- Surface adapters may translate transport and presentation, but must not fork scoring, search or gate semantics.
- Optional AI-native candidate generation supplements the deterministic candidate baseline; it never replaces it.
- Generated proposals are untrusted. The core must validate schema, exact canonical gate action, scope, duplicates and material diversity before evaluation.
- Generation is opt-in and bounded to one call, five proposals, 30 seconds and five abstract cost units by default, within whole-run budgets.
- External generation receives only bounded normalized control summaries and references, never secrets, full artefacts, raw prompts, hidden reasoning or source snapshots.
- Generator status, provenance, accepted/rejected counts, separate budget use and typed failure must remain visible. Failure retains the deterministic baseline; automatic provider fallback is forbidden.
- Codex and Claude Code may provide tool-enforced generator transports. Copilot, OpenCode and generic surfaces remain instruction-only without conforming evidence.

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

When a repository needs durable AGDF state, use the plugin-local `control/` scaffold as the starting point.

- `config.json` stores project language preferences. Use `artifact_language` for generated AGDF artefacts and `chat_language` for user-facing responses unless the user explicitly asks otherwise. Runtime rules remain English.
- `.agdf/control/runs/<run_id>/RUN_STATE.md` is the canonical current-run dashboard; legacy `AGDF_RUN.md` is migration input or an explicit non-authoritative projection.
- `MASTER_BACKLOG.md` is the living pointer for active delivery work.
- `BROWNFIELD_REVIEW.md` records the post-UR existing-system view and Mode/Slice Decision before PRD depth or Quick Task execution is chosen.
- `SOT_REGISTRY.md` prevents parallel sources of truth.
- `CONTEXT_GRAPH.md` stores durable Brownfield findings, decisions, risks, evidence and exit criteria.
- `AGENT_QUALITY_CONTRACTS.json` stores reusable block, revise and warning conditions.
- `memory_target`, `multi_scope_state` and branch/workspace evidence fields make ambiguity and persistence decisions visible without turning chat history into the source of truth.
- OR reports live under `.agdf/control/artefacts/<key>/OR.md` when a run closeout is steering-relevant or should be auditable beyond the chat.

### Human-readable Master Backlog

The Markdown backlog is a human steering view; CLI reports are its normalized
machine projection.

- Use readable status labels such as `In progress`, `Awaiting UAT` and
  `Completed` in Markdown.
- Use links relative to `MASTER_BACKLOG.md`, such as
  `[UR](artefacts/<key>/UR.md)`, instead of exposing long raw paths.
- Keep `Priority`, `Key`, `Work item`, `Status`, `Artefacts`, `Current spec`
  and `Next step` visible for active and planned work.
- Keep one canonical template. Generated surface copies remain derived output.
- Normalize human labels and link targets only at the CLI parser boundary.
- Existing wide rows, raw paths and snake_case statuses remain supported for
  backward compatibility.

The scaffold is not a second documentation site. Link to authoritative artefacts instead of copying them.

## Agent-Native Runtime And CLI Verification

AGDF is agent-native first and CLI-verifiable by design.

The primary operating path is the active skill plus the live `.agdf/control/` artefacts.
Agents should read the repository state, apply this Runtime Contract, create or update only the currently allowed artefact, and make the next permissible step explicit.
When control state is missing for a fresh request, keep the first step lightweight: draft the minimal UR in the response and request `Approval: UR`.
Initialize a control scaffold only when durable AGDF control state is explicitly requested, already used by the repository, or required by a deterministic CLI/CI setup path.

Helper commands are deterministic proof and automation interfaces, not the normal-work ritual:

- `init` creates the machine-readable control scaffold.
- `doctor --json` checks whether `.agdf/control/` is consistent and actionable; it is not the reviewer.
- `gate-check --json` reports reproducible gate state; it does not replace the gate-check skill judgement.
- `gate-check --approval-envelope` prints the canonical ready-gate cards and exact-text request from the same evaluation; it does not grant approval or replace the chat workflow.
- `delivery-map --json` reports the delivery picture for CI, PRs, regression checks and audit trails.

Machine-readable outputs should stay agent-friendly: stable decisions, blocking gate or current gate, missing approval, allowed outputs, forbidden outputs, next step, evidence and findings.
They make the repository state checkable, but they do not replace the native skill workflow or the durable control artefacts.

## Delivery Map

`delivery-map --json` is the machine-readable delivery picture for the selected canonical control state.
It derives, but does not replace, the selected `RUN_STATE.md` and `MASTER_BACKLOG.md` state.

It must expose:

- approved or active artefacts and approvals
- `UR -> PRD -> SD -> TP -> QA_REPORT` relationships
- evidence refs, missing evidence and declared risks
- multi-scope ambiguity and branch/workspace evidence limits when present
- memory persistence target, reason and references when present
- Context Graph impact and gate effect
- the Run Status Card as a compact projection of current gate, next step and quality outlook
- findings that explain why the delivery picture is `pass | warn | revise | block`

Missing relationship evidence in the Artefact Chain is at least `revise` once the related gate artefact is approved or passed.
Declared missing evidence, declared risk or Context Graph gate effect may escalate the delivery map to `warn`, `revise` or `block`.
