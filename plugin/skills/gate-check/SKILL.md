---
name: gate-check
description: Use this skill as the default first AGDF skill for any new build, change, extension, refactor, feature, CLI, app, fix with product semantics, Structured Delivery request, unclear approval, later-gate artefact request, or unclear next permissible step. Use it before brownfield-analysis, implementation, formal artefacts, QA, or release when approval/evidence/next action is not already explicit.
---

# gate-check

## Purpose
Determine the earliest blocking user approval gate and derive:

- the active or blocking gate
- whether the process is open or blocked
- currently allowed outputs
- currently forbidden outputs
- the exact missing approval
- the next permissible step

This skill must not create later artefacts such as PRD, SD, TP, CD, CR, QA, or UAT when the gate does not allow them.

## Runtime Contract
Use these focused runtime-contract modules:

- `../../meta/contracts/gate-transition.md`
- `../../meta/contracts/interaction.md`
- `../../meta/contracts/control-scaffold.md`
- `../../meta/contracts/modes.md`
- `../../meta/contracts/quality.md`
The canonical gate order and transition model live only in `../../meta/contracts/gate-transition.md`. This skill evaluates the current state against that model; it must not maintain a second complete gate table.

## Agent-Native Control Path

AGDF is agent-native first and CLI-verifiable by design.
This skill is the primary operating path for gate judgement.

First inspect the durable control state directly:

- selected `.agdf/control/runs/<run_id>/RUN_STATE.md` (or legacy `AGDF_RUN.md` before explicit migration)
- `.agdf/control/MASTER_BACKLOG.md`
- `.agdf/control/SOT_REGISTRY.md`
- `.agdf/control/CONTEXT_GRAPH.md`
- `.agdf/control/AGENT_QUALITY_CONTRACTS.json`

If required control files are missing, do not automatically create a full `.agdf/control/` scaffold for a fresh small request.
The default first action is to draft the minimal UR in the response and request `Approval: UR`.
Use `init` only when the user explicitly asks for durable AGDF control state, the repository already uses `.agdf/control/` as its live working state, or a deterministic CLI/CI setup path is being executed.

Use the executable control path when a machine-readable check is requested, when the gate state is ambiguous, when CI or PR evidence is needed, when deterministic ready-gate rendering is required, or when a repository-local automation needs JSON output. Resolve the version-matched validator owned by the active surface first: `<plugin-root>/runtime/agdf-local.js` for Codex or Claude, or `<opencode-config>/agdf/bin/agdf-local.js` for OpenCode. Run its `--resolve-only --json` probe before treating its output as machine evidence. An explicitly configured absolute `AGDF_VALIDATOR_PATH` is the only secondary local candidate and must match the active AGDF version.

Routine validation uses that resolved local entrypoint:

```bash
node <surface-local-agdf> doctor --json
node <surface-local-agdf> gate-check --json
node <surface-local-agdf> delivery-map --json
```

If no exact-version local validator exists, continue through agent-native inspection where permitted
and state `machine_validation: unavailable` or `external_required`; do not automatically invoke
`npx`, install a package or contact the registry. Registry-resolved commands are reserved for an
explicit bootstrap, installation, repair or refresh requested as a lifecycle action.

For repeated local checks, use the resolved entrypoint with `doctor --json`, `gate-check --json` or
`gate-check --approval-envelope`. The last command prints the validated
two-card exact-text interaction; JSON exposes the same `approval_presentation`
for a native-capable adapter.

`init` creates the control scaffold. `doctor` checks whether `.agdf/control/` is actionable. `gate-check` consumes that result and the selected canonical run record to report the operative process decision: `open | blocked`, current gate, blocking reason, missing approval, allowed outputs, forbidden outputs, next allowed action and evidence references.
`delivery-map` reports the durable delivery picture: active artefacts, approvals, Artefact Chain relationships, evidence refs, missing evidence, risks, Context Graph gate effect and machine-readable findings.

The CLI reports are validators and JSON evidence, not the primary user experience, not a required ritual for normal work and not a second rule system. If a report says `blocked`, do not continue with later-gate artefacts until the reported blocker is resolved.

## Native Interaction Path

`../../meta/contracts/interaction.md` is the complete normative owner for interaction kinds, locale,
canonical values, presentation order, adapter capability, deliberate waiting, native/fallback
behavior, transient outcomes, permissions and post-response validation. Load and apply that contract;
do not restate or infer a surface matrix in this skill.

This skill owns only these operational responsibilities:

1. Select exactly one run and evaluate its current gate.
2. Confirm that the required durable artefact is present and ready.
3. Consume the canonical `approval_presentation` verbatim for the selected run, gate and revision.
4. Present that projection and obtain deliberate input through the contract-selected native or exact-text path.
5. Revalidate the same run, gate and revision immediately after the response and before persistence.
6. Persist only a currently valid exact approval through the existing control-state workflow.

For status, blocked, read-only or rationale interactions, consume the canonical
`status_presentation.markdown` verbatim and apply the locale contract without asking for approval.
Do not reconstruct its fields, ordering, labels or Markdown from `status_card` JSON. Internal process
steps remain distinct from user decisions. If the projection, adapter evidence or revalidation is
missing, follow the contract's fail-closed outcome and leave authority unchanged.

## Rules
1. Fail closed when a required approval or artefact status is missing.
2. The earliest blocking gate wins.
3. A user approval is valid only as `Approval: <GateName>`.
4. Treat `Freigabe: <GateName>` as a legacy alias only when reviewing older German runs.
5. Implicit consent is not approval. "ok", "go ahead", "do it", "approved", "continue", "leg los" and similar phrases do not unlock gates.
6. Do not preview later artefacts while a gate blocks.
7. Internal process steps are not user approval gates.
8. OR-lite is allowed if it does not leak blocked content.
9. SoT/runtime/product-semantics drift can trigger an early product gate, usually `UR`.
10. Approval of one user gate permits work on the next allowed gate artefact or required internal step only; it never skips directly to implementation.
11. New product semantics, functional change or user-visible behaviour change requires a durable UR in `.agdf/control/` or a linked authoritative repository SoT before Brownfield Review, PRD, SD, TP, Brownfield Analysis or implementation.
12. Approval text and durable artefact presence are separate requirements for UR, PRD, SD, TP and QA report decisions. Approval text without the corresponding persisted or linked artefact keeps the current gate at that gate.
13. After Brownfield Review, decide the process size before drafting PRD or implementing: `quick_task | verified_change | structured_slice | structured_delivery | block`.
14. The Mode/Slice Decision must be visible and evidenced before any Quick Task execution, PRD shortcut or implementation. A decision value without scope reason and evidence is still missing.
15. Missing or incomplete control state must not push setup work back to the user. For a fresh request, draft the current minimal artefact in the response and request the exact approval. Initialize or write `.agdf/control/` only when durable control state is explicitly requested, already live for the repository, or required for a deterministic CLI/CI setup path. Implementation remains forbidden.
16. Branch names, uncommitted diffs, generated summaries and chat history are not sufficient scope proof when durable artefacts or approvals are missing or conflicting.
17. If multiple active scopes are plausible, list the evidenced competing lines and keep the current step at scope clarification or the earliest common safe gate.
18. When maintaining `MASTER_BACKLOG.md`, use its canonical compact columns, readable status labels and document-relative Markdown links. Do not expose raw long paths or internal snake_case statuses in the human-facing table. The canonical status/artefact label vocabulary is defined in the AGDF control scaffold's `MASTER_BACKLOG.md` template Rules section; do not invent other labels.
19. Preserve legacy backlog compatibility through the CLI parser; do not create a second surface-specific backlog format.
20. Native interaction must follow the Runtime Contract's interaction envelope, readiness check, deliberate-user-input requirement and post-response revalidation boundary.

## Gate Evaluation

If `Approval: UR` is present, do not say implementation is the next step.
The next step is Brownfield Review when Brownfield, ownership, runtime, policy, persistence, architecture, UI or UX impact is possible; after that, the next step is a Mode/Slice Decision. Do not assume the full PRD/SD/TP chain before the existing-system impact is understood.
Use the Runtime Contract's Gate Transition Model to derive the current gate, allowed outputs, forbidden outputs and missing approval.

## When To Use
- new user intent to build, add, change, extend, refactor or deliver something
- Structured Delivery before first artefact creation
- unclear current gate
- user says "continue" or similar without exact approval
- code or a later-gate artefact is requested
- implementation permission is unclear
- QA, UAT, or release permission is unclear

Not required for simple Quick Tasks without new product scope and without formal artefacts.

For a fresh prompt such as "I want to build a small CLI", use this skill first.
Do not route directly to `brownfield-analysis` or implementation until this skill or live AGDF control state says that implementation preparation is the next allowed action.

## Inputs
Use what is available:

- current user request
- existing exact approvals
- status of UR, PRD, SD, TP
- Brownfield Review status
- Mode/Slice Decision
- Brownfield Analysis status
- CD+Tests, CR, QA, UAT status
- signs of documentation/runtime/product-semantics drift
- branch/workspace evidence and whether it conflicts with durable artefacts
- competing active scopes or work lines

If a status is not explicit, do not assume it is satisfied.

## Workflow
1. Check exact approvals.
2. Check artefact status.
3. Determine the earliest blocking user gate or internal mandatory step.
4. Derive allowed and forbidden outputs.
5. Name the exact missing approval, if any.
6. If consent was only implicit, say it is not yet approval and provide the exact formula.
7. Ensure the next step follows the gate transition table. In particular, never jump from `Approval: UR` to implementation.
8. Treat a generic "start", "continue" or "leg los" request as a request to perform only the current next allowed action.
9. After Brownfield Review, choose the smallest safe process path before creating later artefacts.
10. If the selected path is not visibly recorded with scope reason and evidence, keep the run at `Mode/Slice Decision`.
11. When `.agdf/control/` is missing or incomplete, make the next allowed artefact action explicit. For a fresh request, that means draft the minimal UR in the response, then request `Approval: UR`. Do not write a full control scaffold unless durable control state was explicitly requested or is already the repository's live AGDF working state.
12. If branch, workspace and durable artefacts disagree, do not choose a scope silently; report the ambiguity and ask for the smallest clarifying gate action.

## Output
Keep the result short and operational. For a status-only response, consume the Runtime Contract's
code-owned `status_presentation.markdown` verbatim. It is the compact localized operational Run
Status Card and already includes current and post-approval authority, next-step and quality fields.
Keep full raw evidence in `status_card` JSON or concise surrounding detail when relevant; do not turn
the primary chat card into an audit dump. Do not maintain or render a skill-local table template.

This complete operational status table remains the status-reporting and detail
surface. When the same response immediately requests a ready gate approval,
render its five-field compact approval-time projection first, then the Gate
Transition Card in the same immediately preceding assistant message, then
invoke exactly one native question or exact-text fallback. Both cards derive
from the same snapshot and are shown exactly once.

If this skill creates or updates control artefacts, do not paste full file bodies into the chat.
List paths, summarize the decision, name the blocker or approval needed, and keep the durable content in the files.
See the Runtime Contract §Chat and Tool-Call Discipline for tool-call batching and skill output compaction rules.

## Forbidden
This skill must not:

- create PRD before UR approval
- create PRD before required Brownfield Review is done or explicitly not_applicable
- create PRD before Mode/Slice Decision is recorded
- create SD before PRD approval
- create TP while earlier gates block
- suggest implementation immediately after `Approval: UR`
- suggest implementation before Brownfield Review has explicitly selected `quick_task`
- suggest implementation immediately after `Approval: PRD`
- suggest implementation immediately after `Approval: SD`
- treat "ok", "leg los", "go ahead", "approved" or similar wording as gate approval
- perform full Brownfield Analysis unless explicitly requested
- provide implementation snippets while implementation is gated
- paste full `.agdf/control/` files, templates or artefact bodies into the chat unless the user explicitly asks for the full content
- present QA or UAT as passed without evidence
- present release as allowed without QA pass and UAT approval where required
