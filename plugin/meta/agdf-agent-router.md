# AGDF Agent Router

## Role
You are operating inside the AGDF plugin namespace.

Use the plugin skills as workflow controls, not as documentation shortcuts.
Your goal is trustworthy progress: reduce uncertainty, establish evidence, preserve artefacts, verify outcomes and make the next allowed step explicit.

## Surface Convention
Codex and Claude Code already provide the `agdf` plugin namespace.

Therefore plugin skill names are intentionally unprefixed:

- `gate-check`
- `brownfield-analysis`
- `task-plan-review`
- `clean-implementation-review`
- `code-review`
- `qa-gate`
- `release-or`
- `delivery-closeout`

Do not duplicate the plugin namespace in Codex or Claude Code plugin skill names.
That `agdf-` prefix is reserved for GitHub Copilot repository skills, where no plugin namespace exists.

## Mode Selection
Default entry rule: a new user intent to build, add, change, extend, refactor or otherwise deliver something starts with `gate-check` unless it is clearly only a question, explanation, local inspection, or explicitly scoped review.

Use Quick Task Mode for questions, small reviews, local debugging and narrow fixes without new product semantics.

Use Structured Delivery Mode for new capabilities, architecture, policy, persistence, release-critical work, formal artefacts or explicit approvals.

Any new product semantics, functional change or user-visible behaviour change requires a durable UR first.
Persist it in `.agdf/control/` or link it from there to the target repository's authoritative source of truth before PRD, SD, TP, Brownfield Analysis or implementation.
Treat approval text and durable artefact presence as separate checks for UR, PRD, SD, TP and QA report decisions.
Do not infer approval from "ok", "go ahead", "do it", "approved", "continue", "leg los" or similar wording.
Those phrases may express intent to proceed, but they do not unlock a gate unless the exact gate formula is present.
Do not infer active scope from branch names, uncommitted workspace deltas, chat history or generated summaries when durable artefacts point elsewhere.
If multiple active scopes are plausible, list the evidenced lines and route to `gate-check` or workstate clarification instead of choosing silently.
After `Approval: UR`, run lightweight Brownfield Review before PRD when Brownfield, ownership, runtime, policy, persistence, architecture, UI or UX impact is possible.
Brownfield Review must produce a Mode/Slice Decision: `quick_task`, `structured_slice`, `structured_delivery` or `block`.
Make that decision visible before coding or drafting later artefacts: state the selected path, scope reason, evidence and next required gate in the live control state or linked artefact.
Do not assume the full PRD/SD/TP chain before that decision; use only as much gate depth as the reviewed change size justifies.

Quick Task Mode must still use the Runtime Contract mini-output: `result`, `evidence`, `risk`, `next_step`.
Narrow defect work may use the Runtime Contract's Bug Lightweight Track only when a durable bug artefact or linked authoritative issue carries reproduction, actual behavior, expected behavior, fix boundary and evidence plan.
Structured Delivery Mode must respect gates, reviews and closeout discipline.

## Skill Routing
| Skill | Use For | Boundary |
|---|---|---|
| `brownfield-analysis` | after gate-check permits Brownfield Review or implementation preparation, before non-trivial changes in existing systems | clarifies reuse, owners, risks and Mode/Slice Decision; never bypasses gate-check; Brownfield Review is not implementation permission |
| `clean-implementation-review` | inspect workarounds, fallbacks, parallel structures or symptom fixes | not a TP or QA substitute |
| `code-review` | mandatory CR step after code changes, focused on defects, regression and security findings | does not replace TP review, clean review or QA |
| `delivery-closeout` | commit/PR-near handoff after QA/OR/UAT | never performs VCS actions automatically |
| `gate-check` | new build/change intent, unclear approval, Structured Delivery, later-gate artefact requested | does not create later artefacts or skip Mode/Slice Decision after Brownfield Review |
| `qa-gate` | final QA decision | only instance for `pass | revise | block` |
| `release-or` | auditable closeout for every relevant run | not a QA substitute |
| `task-plan-review` | after implementation and before QA, verify TP coverage | no final QA decision |

Select exactly one primary skill first.
Add more only when they cover a distinct concrete risk dimension.
Do not choose `brownfield-analysis` as the first primary skill for a fresh "I want to build/change X" prompt unless `gate-check` or existing live AGDF control state already makes implementation preparation the next allowed action.
Never jump directly from `Approval: UR`, implicit consent, or a generic "start" request to implementation. Route to Brownfield Review, then a visible Mode/Slice Decision with evidence, then the smallest safe next gate or Quick Task execution.

## Runtime Contract
For repeated output, gate, Quality Contract and Context Graph rules, use:

`agdf-runtime-contract.md`

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
