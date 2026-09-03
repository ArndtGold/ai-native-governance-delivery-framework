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

- `../../meta/contracts/task-target-resolution.md`
- `../../meta/contracts/gate-transition.md`
- `../../meta/contracts/interaction.md`
- `../../meta/contracts/control-scaffold.md`
- `../../meta/contracts/modes.md`
- `../../meta/contracts/quality.md`
The canonical gate order and transition model live only in `../../meta/contracts/gate-transition.md`. This skill evaluates the current state against that model; it must not maintain a second complete gate table.

## Mandatory Target First And Early Return

Resolve or revalidate the task target before reading repository control state, selecting a run or
reasoning about a gate. This is the first operational decision, including in a resumed chat.

If target resolution is `unresolved`, return immediately after consuming the canonical
`task_target_orientation.markdown` and asking only for its concrete recovery action. This early return overrides every later branch in this skill, including continuation from chat history,
missing-control handling, fresh-UR drafting and approval guidance. A prior UR, prior run, prior
approval or plausible repository mentioned in the conversation is only candidate context; it must
not be presented conditionally as the current target or used to report `BLOCKED`, a current gate or
`Approval: <GateName>`.

For a repo-less Copilot GeneralChat with no reliable target, ask for one concrete primary target,
such as the repository or file to inspect. Do not append alternatives for a previous UR, a new
project or an existing repository, and do not add an "if the previous UR applies" gate result after
the unresolved orientation.

## Task Target Preflight

Before `doctor`, run selection or `gate-check`, invoke `target-check --json`. When one target is
semantically selected, pass its source and absolute path. When no reliable target exists, omit both
`--target-source` and `--primary-target`; pass only the absolute `--working-directory` as context and
the current chat language through `--language`. `--working-directory` never grants target authority.
Resolve the chat language from the user's current natural-language conversation before invoking the
command. A German user turn or an ongoing German conversation requires the literal argument
`--language de`. English skill text, command names, host process text and the system locale do not
override the user's conversation language. Always pass a concrete supported language tag; never
omit `--language` and never leave `<current-chat-language>` as a placeholder.
Do not label or pass the host cwd as `current_repository` unless the user explicitly or deictically
selected that verified Git repository under the precedence contract. A Copilot chat-storage folder
is never a repository selection merely because it is the working directory.

If the result is `unresolved`, apply the mandatory early return above. Do not report a repository,
run, current gate, missing approval or Run Status Card, and do not draft a synthetic UR. In
particular, a repo-less Copilot GeneralChat is `target_unresolved`, not
`repository_ungoverned`.

After emitting the canonical unresolved orientation, ask exactly one short target clarification.
The clarification must use the orientation's `presentation_language`; a German orientation therefore
requires a German question. Do not add contract narration, an `Early Return` heading, path examples
or a menu of target types.

Only a `resolved` result may provide its repeated `governance_target` to `doctor`, `gate-check` or
`delivery-map` through `--dir`. A fresh-UR branch is allowed only when doctor finds that exact
resolved repository ungoverned and the user's request contains a concrete outcome. Without that
observable intent, ask what should be changed and do not invent a placeholder feature or request
`Approval: UR`.

## Agent-Native Control Path

AGDF is agent-native first and CLI-verifiable by design.
This skill is the primary operating path for gate judgement.

First inspect the durable control state directly:

- selected `.agdf/control/runs/<run_id>/RUN_STATE.md` (or legacy `AGDF_RUN.md` before explicit migration)
- `.agdf/control/MASTER_BACKLOG.md`
- `.agdf/control/SOT_REGISTRY.md`
- `.agdf/control/CONTEXT_GRAPH.md`
- `.agdf/control/AGENT_QUALITY_CONTRACTS.json`

Only after target resolution returned `resolved` and activation checked that exact governance
target may missing control files enter the fresh-request branch. Then do not automatically create a
full `.agdf/control/` scaffold for a fresh small request. When the current user turn contains a
concrete outcome, the default first action is to draft the minimal UR in the response and request
`Approval: UR`.
Use `init` only when the user explicitly asks for durable AGDF control state, the repository already uses `.agdf/control/` as its live working state, or a deterministic CLI/CI setup path is being executed.

Use the executable control path when a machine-readable check is requested, when the gate state is ambiguous, when CI or PR evidence is needed, when deterministic ready-gate rendering is required, or when a repository-local automation needs JSON output. Resolve the version-matched validator owned by the active surface first: `<plugin-root>/runtime/agdf-local.js` for Codex, Claude or Copilot, or `<opencode-config>/agdf/bin/agdf-local.js` for OpenCode. Run its `--resolve-only --json` probe before treating its output as machine evidence. An explicitly configured absolute `AGDF_VALIDATOR_PATH` is the only secondary local candidate and must match the active AGDF version.

Routine validation uses that resolved local entrypoint:

```bash
# No reliable target yet: context and locale only; do not invent target authority.
node <surface-local-agdf> target-check --json --language <current-chat-language> --working-directory <absolute-path>

# One semantically selected target:
node <surface-local-agdf> target-check --json --language <current-chat-language> --target-source <explicit_target|continued_target|current_repository> --primary-target <absolute-path> --working-directory <absolute-path>
node <surface-local-agdf> doctor --json --dir <resolved-governance-target>
node <surface-local-agdf> gate-check --json --dir <resolved-governance-target>
node <surface-local-agdf> delivery-map --json --dir <resolved-governance-target>
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

## Repository Activation Diagnosis

`doctor --json` on the resolved surface-local validator is the sole canonical, code-owned, tool-shell-safe activation probe. Determine whether a repository is AGDF-active through `doctor --json` (or `gate-check --json` for a selected run), not through plugin `AGDF_*` environment variables, not through a relative glob, not through a relative `grep`, and not through a relative `read` of `.agdf/control/config.json`.

Plugin `AGDF_*` environment variables set by the OpenCode `shell.env` hook are convenience only and must not be used as the only proof of activation; host shell-env propagation to spawned tool shells is not guaranteed and is OpenCode-owned, not AGDF-owned. A relative glob or `grep` for `.agdf/control/config.json` must not be used as proof of presence or absence of `.agdf/control/config.json`; an absolute `read` or the canonical CLI probe is required.

## OpenCode Subagent Enforcement Boundary

OpenCode plugin hooks (`tool.execute.before`) do not intercept tool calls from subagents spawned via the `task` tool (anomalyco/opencode issue #5894, PR #36238 open). AGDF enforcement through plugin hooks applies to primary-agent tool calls only; in the subagent path, AGDF governance is auditing-only, not enforcement.

This is a host limitation, not an AGDF-owned defect. Do not claim that AGDF gates are technically enforced in the OpenCode subagent path. Do not route work to a subagent to bypass a primary-agent gate. When subagent work touches gate-relevant files, verify the result through the canonical validator (`doctor --json`, `gate-check --json`) after the subagent returns, not during.

## Native Interaction Path

`../../meta/contracts/interaction.md` is the complete normative owner for interaction kinds, locale,
canonical values, presentation order, adapter capability, deliberate waiting, native/fallback
behavior, transient outcomes, permissions and post-response validation. Load and apply that contract;
do not restate or infer a surface matrix in this skill.

This skill owns only these operational responsibilities:

1. Resolve or revalidate the primary task target before selecting repository control state.
2. Derive repository activation only from the resolved governance target; an evidence source or
   working directory is not sufficient.
3. Select exactly one run and evaluate its current gate.
4. Confirm that the required durable artefact is present and ready.
5. Consume the canonical `approval_presentation` verbatim for the selected run, gate and revision.
6. Present that projection and obtain deliberate input through the contract-selected native or exact-text path.
7. Revalidate the same target, run, gate and revision immediately after the response and before persistence.
8. Persist only a currently valid exact approval through the existing control-state workflow.

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
15. Apply this rule only after the task target is resolved. Missing or incomplete control state must not push setup work back to the user. For a fresh request, draft the current minimal artefact in the response only when the current turn supplies a concrete outcome, then request the exact approval. This rule never applies to `target_unresolved`. Initialize or write `.agdf/control/` only when durable control state is explicitly requested, already live for the repository, or required for a deterministic CLI/CI setup path. Implementation remains forbidden.
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
1. Resolve or revalidate the primary target through `task-target-resolution.md`.
2. If resolution is unresolved, consume the canonical target orientation, request only its
   clarification/recovery action and stop before repository activation, gate evaluation or mutation.
3. Derive the governance target from the primary target; never from `cwd` or an evidence source alone.
4. Check exact approvals.
5. Check artefact status.
6. Determine the earliest blocking user gate or internal mandatory step.
7. Derive allowed and forbidden outputs.
8. Name the exact missing approval, if any.
9. If consent was only implicit, say it is not yet approval and provide the exact formula.
10. Ensure the next step follows the gate transition table. In particular, never jump from `Approval: UR` to implementation.
11. Treat a generic "start", "continue" or "leg los" request as a request to perform only the current next allowed action.
12. After Brownfield Review, choose the smallest safe process path before creating later artefacts.
13. If the selected path is not visibly recorded with scope reason and evidence, keep the run at `Mode/Slice Decision`.
14. Only for a resolved governance target, when `.agdf/control/` is missing or incomplete, make the next allowed artefact action explicit. For a fresh request with a concrete outcome, that means draft the minimal UR in the response, then request `Approval: UR`. This step is unreachable after an unresolved early return. Do not write a full control scaffold unless durable control state was explicitly requested or is already the repository's live AGDF working state.
15. If branch, workspace and durable artefacts disagree, do not choose a scope silently; report the ambiguity and ask for the smallest clarifying gate action.

### Task Target Orientation

When target/context separation is material, the target changed, or resolution is unresolved, consume
`task_target_orientation.markdown` verbatim from `renderTaskTargetOrientation` in
`../../meta/contracts/interaction.md`. Do not reconstruct its fields or maintain a skill-local target
template. If the renderer returns `null`, fail closed to target clarification and do not proceed to
repository activation, Scope Classification or gate evaluation.

### Scope Classification Output
When this skill classifies a fresh scope as ungated (Quick Task or Trivial Change Boundary), consume
`scope_classification.markdown` verbatim from `renderScopeClassificationCard` in
`../../meta/contracts/interaction.md` § Scope Classification Card. The card is a compact, localized,
non-authorizing projection: mode, boundary, UR-trigger evaluation, one allowed line, one forbidden
line, escalation triggers and the challenge path. Do not maintain or render a skill-local
classification card template. If the renderer returns `null`, fail closed to the existing ceremony
and do not model-reconstruct Markdown.

## Output
Keep the result short and operational. For a status-only response, consume the Runtime Contract's
code-owned `status_presentation.markdown` verbatim. It is the compact localized operational Run
Status Card and already includes current and post-approval authority, next-step and quality fields.
Keep full raw evidence in `status_card` JSON or concise surrounding detail when relevant; do not turn
the primary chat card into an audit dump. Do not maintain or render a skill-local table template.

This complete operational status table remains the status-reporting and detail
surface. When the same response immediately requests a ready gate approval,
render its five-field compact approval-time projection first, then the complete
operational Run Status Card verbatim (or its localized failure line with
diagnostic codes when undeliverable), then the Gate Transition Card in the same
immediately preceding assistant message, then invoke exactly one native
question or exact-text fallback. The runtime contract owns this sequence; every
block is shown exactly once.

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
