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

Canonical mutable state lives at `.agdf/control/runs/<run_id>/RUN_STATE.md`.
Only explicit `control_layout: run-folders-v1` and Run version 4 are supported.
Missing/old/unknown layouts or versions are unsupported, not an empty store or
an invitation to migrate, reset or fall back. Read-only inspection preserves bytes.

One Run owns `documents/`, `evidence/`, `control/presentations/` and
`history/` below its directory. Pending operation journals live in `control/` only
while required; source archives live in `history/revisions/<operation_id>/`.
The creation receipt and `history/planning/UR.md` preserve handed-off planning
provenance without an origin JSON copy. Project configuration, templates, SoT,
curated context and target-wide multi-Run closure previews remain project-wide.

Identity, objective, mode and typed records are canonical. Current gate, approval
status, current document pointers, document relationships, evidence summaries and
inventory derive through the existing parser/evaluator boundary. Do not persist
parallel current tables, a generated state file, global dashboard or maintained index.
Independent Parent/programme relations use the authored Relationships section;
derived document bindings never become hand-editable rows.

`run-create` creates a sealed unapproved Run. Current CLI aliases and fixed MCP
groups share input normalization and captured configuration. Every original UUID
binds its effective input. Exact replay acknowledges that original effect only;
changed intent, stale bindings and unknown ownership fail closed. No command
repairs arbitrary edits by resealing them. Only `approval.record` records a fresh
deliberate exact gate reply to the frozen presentation. Local seals are cooperative
integrity checks, not signatures or independent human identity proof.

Current persisted families are Run 4, RunOperation 4, ArtefactBinding 3,
ApprovalOperation 4, presentation 7, source proposal 3, source receipt 4,
revision archive 2 and transaction journal 7. Existing resolved/1 wrapping and
resolution version 1 are mandatory; captured active configuration includes the
current layout. Unchanged record families retain their current shape. Source
revision policy 2 preserves its existing eligibility, confirmation, invalidation
and reassessment boundaries. Content seal domain is agdf-run-seal/2; approval
seal domain is agdf-approval-seal/4. No old codec/default omission is accepted.
Current optional QA-deviation and preview payloads retain their capability semantics.

An ArtefactBinding contains exact source/destination and inline reviewer attestation;
there is no separate RECORD/REVIEW JSON. Internal steps reference their canonical
EvidenceBinding identity instead of copying report and source-set metadata.
The writer publishes typed facts and owned output atomically. Independent Run locks,
resource claims and exact original-operation recovery remain mandatory. Unsupported
journals and foreign bytes never grant relocation, deletion or recovery permission.

A Run ends as superseded or abandoned only through the current closure preview/apply
owner with exact deliberate confirmation. The target-wide preview changes no Run.
Each applied Run gets its own lifecycle receipt; its subsequent writers reject with
lifecycle_ended. Continuing work needs a new Run. Pending repository closure conflicts
retain the existing fail-closed boundary.

Planning is UR-only under `planned/<plan_id>/UR.md`. Core inventory derives from
planned entries and Runs. The optional Codex planning extension authors planning
inputs through existing ur-definition; explicit source-bound handoff creates one
unapproved Run. Core does not require that extension. See control/planned-urs.md.

The normative worktree rule is owned by
[task-target-resolution.md](task-target-resolution.md#worktree-placement-and-assigned-checkout).
`config.json` stores project language preferences: artifact_language for authored artefacts,
chat_language for direct presentation defaults; current explicit presentation_language
never changes artifact_language. Runtime rules remain English.
Keep config preferences, SoT, context and quality contracts under their existing
project owners. No central Masterbacklog participates in reading or writing control.

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
It derives from the selected `RUN_STATE.md` and its registered sources. Current inventory also includes independent planned URs.

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
