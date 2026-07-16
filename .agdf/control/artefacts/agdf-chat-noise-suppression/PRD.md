# PRD: Chat Noise Suppression

Status: draft
Gate: PRD
Date: 2026-07-16
Derived from: `.agdf/control/artefacts/agdf-chat-noise-suppression/UR.md`

## Product Outcome

AGDF chat output shows gate decisions, one-line narration and results — not internal file
operations, template reads or verbose review blocks. When everything passes, the chat is
short. When something fails, the chat shows exactly what, why and what to do. This works
identically on Codex, Claude Code and OpenCode because it changes agent behaviour and
framework text, not host rendering.

## Design Principle

Chat shows decisions and outcomes. Files show evidence and detail. The agent minimises
both the number of tool calls and the amount of accompanying chat text. Skill output is
compact at `pass` and expanded only at `revise`/`block`.

## State Contract

### Chat Output Layers

| Layer | What it covers | Default visibility | Surface-agnostic? |
|---|---|---|---|
| Gate decisions | Run Status Card, Gate Transition Card, approval question | always visible | yes — framework text |
| Narration | one line per gate transition | always visible | yes — framework text |
| Skill output | QA, CR, TP Review, Clean Review | 1 line at `pass`; expanded at `revise`/`block` | yes — framework text |
| Delivery summary | UAT/OR compact summary | always visible | yes — framework text |
| Artefact writes | UR, PRD, SD, TP, reviews, QA, OR, Brownfield | silent (path + 1-line summary on first creation only) | yes — agent behaviour |
| State updates | RUN_STATE.md | batched: 1 write per user gate, not per field change | yes — agent behaviour |
| Template reads | reading existing artefacts for format reference | none — format is in skill instructions | yes — agent behaviour |
| Validation | tests, integrity, diff | pass/fail line only; full output on failure | yes — agent behaviour |

### Surface Neutrality

The rules are surface-agnostic: they reduce the *number* of tool calls and the *amount* of
chat text. They do not attempt to hide, collapse or suppress tool-call blocks in the host
rendering. Whether OpenCode, Codex or Claude Code renders a `write` block visibly is a
host concern; the framework ensures the agent makes fewer calls and produces less text
around them.

## Functional Requirements

### Framework text compaction

- **PRD-01:** Add "Chat and Tool-Call Discipline" clause to §Chat Output Discipline in
  `plugin/meta/agdf-runtime-contract.md`.
- **PRD-02:** The clause specifies:
  - Skill output (QA, CR, TP Review, Clean Review) is 1 line at `pass`: `<skill>: pass — <one-line summary>`. At `revise`/`block`: the decisive dimension, reason and next action.
  - Quality Readiness projection is shown only at `revise`/`block`, not at `pass`.
  - Artefact writes are silent; the agent names the path and a 1-line summary only when an
    artefact is first created or significantly changed — not on every state update.
  - Validation commands show pass/fail only; full output on failure.
  - Gate decisions, narration and delivery summary remain always visible.
- **PRD-03:** Add one-line note in `plugin/skills/gate-check/SKILL.md` referencing the clause.
- **PRD-04:** Add compact output guidance to `plugin/skills/qa-gate/SKILL.md`: 1-line output
  at `pass`; expanded at `revise`/`block`.
- **PRD-05:** Add compact output guidance to `plugin/skills/code-review/SKILL.md`,
  `plugin/skills/task-plan-review/SKILL.md` and
  `plugin/skills/clean-implementation-review/SKILL.md`: 1-line output at `pass`; decisive
  finding + evidence at `revise`/`block`.

### Agent behaviour: tool-call batching

- **PRD-06:** The clause specifies RUN_STATE.md batching: the agent writes RUN_STATE.md once
  per user gate approval (6 writes for a full UR→UAT run), not once per field change
  (15+ edits). Intermediate state is kept in agent memory between gate approvals.
- **PRD-07:** The clause specifies template-read avoidance: the agent does not `read`
  existing artefacts for format reference. The skill instructions carry the format/structure
  inline. If a specific existing artefact must be inspected for content (not format), the
  read is visible with no commentary.
- **PRD-08:** No change to what is persisted — all artefacts and RUN_STATE updates still
  happen. No change to gate logic, approval authority or interaction kinds.
- **PRD-09:** The clause is surface-agnostic and applies identically to Codex, Claude Code,
  OpenCode and fallback. It does not attempt to hide, collapse or suppress tool-call blocks
  in the host rendering.

## Acceptance Criteria

1. `agdf-runtime-contract.md` contains a "Chat and Tool-Call Discipline" clause in
   §Chat Output Discipline covering skill output compaction, artefact-write silence,
   RUN_STATE batching, template-read avoidance, validation output and surface neutrality.
2. `gate-check/SKILL.md` contains a one-line note referencing the clause.
3. `qa-gate/SKILL.md` contains compact output guidance (1 line at `pass`, expanded at
   `revise`/`block`).
4. `code-review/SKILL.md`, `task-plan-review/SKILL.md` and
   `clean-implementation-review/SKILL.md` contain compact output guidance.
5. Tests and runtime integrity pass.
6. The clause explicitly states it is surface-agnostic and does not attempt to control host
   rendering.

## Non-Goals

- No change to what artefacts are created or persisted.
- No change to gate logic, approval authority or interaction kinds.
- No suppression of errors, blockers or evidence.
- No host-rendering control (collapsing/hiding tool blocks is a host feature, not a
  framework rule).
- No change to the mandatory two-card approval envelope.

## Next Step

`Approval: PRD`
