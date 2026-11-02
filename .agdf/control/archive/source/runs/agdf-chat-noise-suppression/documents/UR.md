# UR: Suppress Tool-Call Noise in AGDF Chat Output

Status: draft
Gate: UR
Date: 2026-07-16
Owner: agent

## 1. Problem

AGDF runs produce many visible tool calls (read, write, edit, bash) that flood the chat.
Most are internal bookkeeping (RUN_STATE updates, template reads, artefact writes) the
user does not need to see. The existing Chat Output Discipline says "keep the chat
response compact" but does not explicitly minimize tool-call accompaniment or internal
process noise.

## 2. User Need

As an AGDF user, I need the chat to show only gate decisions, brief narration and results
— not every file read, write or edit — so I can follow the delivery without drowning in
internal process output.

## 3. Scope

Add a "Tool-Call Discipline" clause to the Chat Output Discipline section in
`plugin/meta/agdf-runtime-contract.md` and a corresponding note in
`plugin/skills/gate-check/SKILL.md`.

The clause codifies:
- Artefact writes (UR, PRD, SD, TP, reviews, QA, OR, RUN_STATE) run without accompaniment
  text; the agent names the path and a one-line summary only when the artefact is first
  created or significantly changed.
- RUN_STATE.md updates are silent bookkeeping; no commentary.
- Template/format reads are internal; no visible output.
- Gate approval questions, post-acceptance narration, reviews and the final delivery
  summary remain visible.
- Validation commands (tests, integrity, diff) show pass/fail only.

## 4. Non-Goals

- No change to what artefacts are created or persisted.
- No change to gate logic, approval authority or interaction kinds.
- No suppression of errors, blockers or evidence.

## 5. Acceptance Criteria

1. `agdf-runtime-contract.md` contains a Tool-Call Discipline clause in §Chat Output
   Discipline.
2. `gate-check/SKILL.md` contains a one-line note referencing the clause.
3. Tests and runtime integrity pass.

## 6. Next Step

Brownfield Review and Mode/Slice Decision.
