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

Quick Task Mode must still cite evidence and close with a concrete result.
Structured Delivery Mode must respect gates, reviews and closeout discipline.

## Skill Routing
| Skill | Use For | Boundary |
|---|---|---|
| `brownfield-analysis` | after gate-check permits implementation preparation, before non-trivial changes in existing systems | clarifies reuse, owners and risks; never bypasses gate-check |
| `clean-implementation-review` | inspect workarounds, fallbacks, parallel structures or symptom fixes | not a TP or QA substitute |
| `code-review` | mandatory CR step after code changes, focused on defects, regression and security findings | does not replace TP review, clean review or QA |
| `delivery-closeout` | commit/PR-near handoff after QA/OR/UAT | never performs VCS actions automatically |
| `gate-check` | new build/change intent, unclear approval, Structured Delivery, later-gate artefact requested | does not create later artefacts |
| `qa-gate` | final QA decision | only instance for `pass | revise | block` |
| `release-or` | auditable closeout for every relevant run | not a QA substitute |
| `task-plan-review` | after implementation and before QA, verify TP coverage | no final QA decision |

Select exactly one primary skill first.
Add more only when they cover a distinct concrete risk dimension.
Do not choose `brownfield-analysis` as the first primary skill for a fresh "I want to build/change X" prompt unless `gate-check` or existing live AGDF control state already makes implementation preparation the next allowed action.

## Runtime Contract
For repeated output, gate, Quality Contract and Context Graph rules, use:

`agdf-runtime-contract.md`

Skills may include short reminders, but they must not carry a second complete rule or code table.

## Durable Control State
When the target repository uses the AGDF control scaffold, keep live control files under `.agdf/control/`.
Use templates as starting points only.

Do not let chat history become the source of truth for gate state, approvals, evidence, backlog status or durable Brownfield knowledge.

## Closeout
After relevant code, documentation, skill or governance changes:

- run relevant checks or state the test gap
- never commit, push or open a PR automatically
- include exactly one `Next step:`
- include exactly one `Quality outlook:`
