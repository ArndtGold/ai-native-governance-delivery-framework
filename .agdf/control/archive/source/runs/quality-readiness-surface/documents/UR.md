# UR: Quality Readiness Surface

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-15
Owner: agent

## 1. Problem

After CD+Tests, `task-plan-review`, `clean-implementation-review`, `code-review` and
`qa-gate` are all presented as separate pass/revise/block-style reviews. Their formal
responsibilities are distinct, but the visible experience makes them look like four
overlapping quality verdicts. Repeated boundary explanations increase cognitive load for
users who do not already understand AGDF governance.

## 2. Goal

Give users one clear quality-readiness picture before QA while preserving the four formal
reports, their distinct evidence responsibilities, and `qa-gate` as the only final
`pass | revise | block` decision point.

## 3. Scope

- Define one human-facing Quality Readiness projection for the post-CD+Tests review state.
- Map the four dimensions to plain-language rows: plan coverage, solution integrity, code
  quality and QA decision.
- Show `qa-gate` as the decision owner and the other reviews as supporting evidence.
- Surface one reason and one next action by default; retain detailed reports for drill-down,
  failures, blockers and audit use.
- Shorten or remove repeated visible "does not replace" explanations while retaining the
  formal boundaries in runtime rules and skill contracts.
- Preserve machine-readable fields, durable artefact formats, approvals and gate authority.

## 4. Non-Goals

- No merged review skill, merged report or second QA authority.
- No change to `pass | revise | block` semantics or gate order.
- No automatic suppression of evidence required for audit, QA or release-or.
- No new host-specific approval UI or new persistence model.

## 5. Acceptance Signals

- A first-time user can identify the single current quality outcome and next action without
  reading four full reports.
- Each review dimension has one unambiguous user-facing question and owner.
- `qa-gate` remains the only visible final decision authority.
- A `revise` or `block` result names the decisive reason and affected evidence source.
- Existing detailed reports, JSON output, skill identifiers and runtime contracts remain
  available and compatible.
- Focused presentation tests prove that no review row is duplicated or silently dropped.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/meta/agdf-agent-router.md`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/skills/task-plan-review/SKILL.md`
- `plugin/skills/clean-implementation-review/SKILL.md`
- `plugin/skills/code-review/SKILL.md`
- `plugin/skills/qa-gate/SKILL.md`
- `create-agdf/lib/interaction-presentation.js`
- `create-agdf/lib/control-state/aggregate.js`

## 7. Risks And Unknowns

- The primary projection must not become a second status or gate model.
- Existing chat, CLI and host-native surfaces may require different detail projections.
- Aggregate severity ordering must remain deterministic when review results disagree.
- The PRD must define when detailed review output is expanded and how evidence links are
  presented without flooding chat.

## 8. Next Step

Brownfield Review selected `structured_slice`; draft the focused PRD for the Quality Readiness
projection.
