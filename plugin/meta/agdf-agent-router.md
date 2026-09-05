# AGDF Agent Router

## Role
You are operating inside the AGDF plugin namespace.

Use the plugin skills as workflow controls, not as documentation shortcuts.
Your goal is trustworthy progress: reduce uncertainty, establish evidence, preserve artefacts, verify outcomes and make the next allowed step explicit.

## Surface Convention
Codex and Claude Code already provide the `agdf` plugin namespace.

Therefore plugin skill names are intentionally unprefixed:

- `gate-check`
- `delivery-path-search`
- `brownfield-analysis`
- `ux-intent-definition`
- `task-plan-review`
- `clean-implementation-review`
- `code-review`
- `qa-gate`
- `release-or`
- `delivery-closeout`

Do not duplicate the plugin namespace in Codex or Claude Code plugin skill names.
That `agdf-` prefix is reserved for GitHub Copilot repository skills, where no plugin namespace exists.

<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->
## Request Activation

- `owner`: `request_activation_contract`
- `path`: `plugin/meta/contracts/request-activation.md`
- `policy_version`: `1`
- `guard_fingerprint`: `sha256:50833bf7396f65e57ffd73bb9200e6dfd5dc016440e6d7186fbcd8a6e07dd2ab`

Decide effect from loaded instructions before AGDF action/output.

Abstain silently, call no AGDF owner, for assessment/explanation/comparison/recommendation/review/diagnosis/advice; hypothetical/example/error/code/quoted/negated delivery language; AGDF as subject; or a read-only constraint absent other delivery. Ambiguity is read-only: answer or ask one neutral question.

Activate only for actual delivery/mutation, binding gate artefact, explicit AGDF/control-lifecycle operation or unambiguous active-run action; delivery wins mixed intent.

Invocation proof: explicit user text/trusted ephemeral action, not discovery/selection, skill load, hooks, cwd, repo/control or prior runs.

Then choose one catalog route. Non-authorizing; downstream checks remain.
<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->

## Task Target Resolution

Only after positive Request Activation, and only for a target-bound route, resolve or revalidate the
primary work target through `contracts/task-target-resolution.md` before repository activation,
Mode Selection or `gate-check`.

An explicit file, artefact or repository named as the work target outranks the current working
directory. A repository mentioned or inspected as evidence does not gain mutation or governance
authority. Derive repository-local AGDF activation only from the resolved primary target or an
explicit user governance assignment.

If the target is unavailable, conflicts with the requested content, remains ambiguous or cannot be
reliably resolved, fail closed to visible clarification. Do not borrow scope from `cwd`, a neighboring
file or an evidence source. A confirmed target may continue across related turns only after
unambiguous revalidation; a new explicit target wins and ends the old binding.

## Mode Selection
This section is downstream of positive Request Activation. A request that abstained or remained an
ordinary read-only request never enters AGDF Mode Selection or Quick Task handling.

Default entry rule: a new user intent to build, add, change, extend, refactor or otherwise deliver something starts with `gate-check` unless it is clearly only a question, explanation, local inspection, or explicitly scoped review.

Use Quick Task Mode only for a positively invoked AGDF operation that remains a small question,
review, local debugging task or narrow fix without new product semantics. Use Verified Change only after approved UR and Brownfield Review when the Runtime Contract's compact record can prove bounded ownership, clean-at-baseline paths, prohibited-impact absence and deterministic validation.

Use Structured Delivery Mode for new capabilities, architecture, policy, persistence, release-critical work, formal artefacts or explicit approvals.

Any new product semantics, functional change or user-visible behaviour change requires a durable UR first.
Persist it in `.agdf/control/` or link it from there to the target repository's authoritative source of truth before PRD, SD, TP, Brownfield Analysis or implementation.
Treat approval text and durable artefact presence as separate checks for UR, PRD, SD, TP and QA report decisions.
Do not infer approval from "ok", "go ahead", "do it", "approved", "continue", "leg los" or similar wording.
Those phrases may express intent to proceed, but they do not unlock a gate unless the exact gate formula is present.
Do not infer active scope from branch names, uncommitted workspace deltas, chat history or generated summaries when durable artefacts point elsewhere.
If multiple active scopes are plausible, list the evidenced lines and route to `gate-check` or workstate clarification instead of choosing silently.
After `Approval: UR`, run lightweight Brownfield Review before PRD when Brownfield, ownership, runtime, policy, persistence, architecture, UI or UX impact is possible.
Brownfield Review must produce a Mode/Slice Decision: `quick_task`, `verified_change`, `structured_slice`, `structured_delivery` or `block`.
That same review records the shared UI/UX impact classification. Run `ux-intent-definition` before
PRD readiness for medium/high impact and for low impact with ambiguous mandatory PRD semantics. It is
an internal analytical step, not a gate or product authority; a required blocked result keeps PRD
readiness closed.
Make that decision visible before coding or drafting later artefacts: state the selected path, scope reason, evidence and next required gate in the live control state or linked artefact.
Do not assume the full PRD/SD/TP chain before that decision; use only as much gate depth as the reviewed change size justifies. A user-visible change is not automatically Verified Change eligible; any missing or ambiguous record condition escalates to the declared structured target before implementation.

Quick Task Mode must still use the Runtime Contract mini-output: `result`, `evidence`, `risk`, `next_step`.
Narrow defect work may use the Runtime Contract's Bug Lightweight Track only when a durable bug artefact or linked authoritative issue carries reproduction, actual behavior, expected behavior, fix boundary and evidence plan.
Structured Delivery Mode must respect gates, reviews and closeout discipline.

## Skill Routing
<!-- AGDF-SKILL-ROUTING:START -->
| Skill | Use For | Boundary |
|---|---|---|
| `delivery-path-search` | high-impact planning decisions with several plausible next delivery steps before implementation | read-only advisory search; never grants gate permission or replaces gate-check |
| `brownfield-analysis` | after gate-check permits Brownfield Review or implementation preparation, before non-trivial changes in existing systems | clarifies reuse, owners, risks and Mode/Slice Decision; never bypasses gate-check; Brownfield Review is not implementation permission |
| `ux-intent-definition` | after approved UR and post-UR routing for medium/high UI/UX impact or ambiguous low-impact product semantics before PRD readiness | non-authorizing analytical PRD input; never creates product intent, gate permission, technical design or a parallel product source of truth |
| `clean-implementation-review` | evidence dimension: inspect whether the solution is structurally clean | supports Quality Readiness; not a TP or QA substitute |
| `code-review` | evidence dimension: review the actual diff for defects, regression and security findings | supports Quality Readiness; does not replace QA |
| `delivery-closeout` | commit/PR-near handoff after QA/OR/UAT | never performs VCS actions automatically |
| `gate-check` | new build/change intent, Structured Delivery, or a later-gate artefact request; unclear approval or next-step questions only inside already positive delivery or explicit AGDF context | does not create later artefacts or skip Mode/Slice Decision after Brownfield Review |
| `qa-gate` | sole final Quality Readiness decision | only instance for `pass | revise | block` |
| `release-or` | auditable closeout for every relevant run | not a QA substitute |
| `task-plan-review` | evidence dimension: verify whether the approved Task Plan was fulfilled | supports Quality Readiness; no final QA decision |
<!-- AGDF-SKILL-ROUTING:END -->

Select exactly one primary skill first.
Add more only when they cover a distinct concrete risk dimension.
Do not choose `brownfield-analysis` as the first primary skill for a fresh "I want to build/change X" prompt unless `gate-check` or existing live AGDF control state already makes implementation preparation the next allowed action.
Never jump directly from `Approval: UR`, implicit consent, or a generic "start" request to implementation. Route to Brownfield Review, then a visible Mode/Slice Decision with evidence, then the smallest safe next gate or Quick Task execution.

## Runtime Contract
For repeated output, gate, Quality Contract and Context Graph rules, use:

- `contracts/request-activation.md` for pre-target request applicability, operation routing and silent abstention
- `contracts/task-target-resolution.md` for primary target authority before repository activation
- `contracts/gate-transition.md` for gate terms, Brownfield routing and transition rules
- `contracts/interaction.md` for status cards, approval orientation and native interaction
- `contracts/modes.md` for delivery-mode boundaries
- `contracts/quality.md` for quality and output discipline
- `contracts/context-graph.md` for persistence and reconciliation
- `contracts/control-scaffold.md` for run state, CLI verification and Delivery Map
- `contracts/closeout.md` for relevant-run and closeout boundaries

`agdf-runtime-contract.md` remains the compatibility manifest for these modules.

Skills may include short reminders, but they must not carry a second complete rule or code table.

## Durable Control State
When the target repository uses the AGDF control scaffold, keep live control files under `.agdf/control/`.
Use templates as starting points only.

Do not let chat history become the source of truth for gate state, approvals, evidence, backlog status or durable Brownfield knowledge.

AGDF is agent-native first and CLI-verifiable by design: read the live control state, apply the active skill and make the next allowed step explicit.
Use `init` only when durable control state is explicitly requested, the repository already uses `.agdf/control/` as its live AGDF working state, or a deterministic CLI/CI setup path is being executed.
Use `doctor --json`, `gate-check --json` or `delivery-map --json` as deterministic validators for CI, PR evidence, regression checks or audit trails, not as a substitute for the router or skills.
At run closeout, route new durable knowledge explicitly as `context_graph`, `sot_registry`, `scope_artifact`, `open_questions` or `none`.

## Closeout
For Quick Task Mode, close with the Runtime Contract mini-output only:

- `result`
- `evidence`
- `risk`
- `next_step`

For relevant runs that change durable state, code, artefacts or gate status:

- run relevant checks or state the test gap
- never commit, push or open a PR automatically
- include exactly one `Next step:`
- include exactly one `Quality outlook:`
