# SD: Chat Noise Suppression Solution Design

Status: draft
Gate: SD
Revision: 1
Derived from: PRD
Date: 2026-07-16

## 1. Solution Overview

Add a "Chat and Tool-Call Discipline" clause to the Runtime Contract §Chat Output
Discipline. Add compact-output guidance to 5 skills (gate-check, qa-gate, code-review,
task-plan-review, clean-implementation-review). All changes are additive guidance — no
logic, gate or persistence change.

## 2. Architecture

| Concern | File | Change |
|---|---|---|
| Contract clause | `plugin/meta/agdf-runtime-contract.md` | New subsection in §Chat Output Discipline |
| Gate-check skill | `plugin/skills/gate-check/SKILL.md` | 1-line note referencing clause |
| QA skill | `plugin/skills/qa-gate/SKILL.md` | Compact output guidance |
| Code-review skill | `plugin/skills/code-review/SKILL.md` | Compact output guidance |
| TP-review skill | `plugin/skills/task-plan-review/SKILL.md` | Compact output guidance |
| Clean-review skill | `plugin/skills/clean-implementation-review/SKILL.md` | Compact output guidance |

## 3. Runtime Contract Clause

Append to §Chat Output Discipline:

```markdown
### Chat and Tool-Call Discipline

Chat output shows decisions and outcomes. Files show evidence and detail. The agent
minimises both the number of tool calls and the amount of accompanying chat text. This
is surface-agnostic: it changes agent behaviour and framework text, not host rendering.
Whether a host renders a tool-call block visibly is a host concern; the framework ensures
the agent makes fewer calls and produces less text around them.

Skill output compaction:
- QA, Code Review, TP Review and Clean Implementation Review output is 1 line at `pass`:
  `<skill>: pass — <one-line summary>`.
- At `revise`/`block`: the decisive dimension, reason and next action. Quality Readiness
  projection is shown only at `revise`/`block`, not at `pass`.
- Full reports remain in durable files; the chat references the path.

Tool-call batching:
- RUN_STATE.md is written once per user gate approval, not once per field change. The
  agent keeps intermediate state in memory between gate approvals and writes the complete
  updated state in one operation.
- The agent does not `read` existing artefacts for format reference. Skill instructions
  carry the format/structure inline. If a specific existing artefact must be inspected
  for content (not format), the read has no accompanying commentary.
- Artefact writes are silent: the agent names the path and a 1-line summary only when an
  artefact is first created or significantly changed — not on every state update.
- Validation commands (tests, integrity, diff) show pass/fail only. Full output appears
  only on failure.

Always visible:
- Gate decisions (Run Status Card, Gate Transition Card, approval question).
- Post-acceptance narration (1 line per gate transition).
- Delivery summary (UAT/OR compact summary).
- Errors, blockers and evidence at `revise`/`block`.
```

## 4. Skill Guidance

Each review skill gets a compact addition to its Output section:

**qa-gate/SKILL.md:**
```markdown
### Compact Chat Output

At `pass`: one line — `QA: pass — <one-line summary>`. Reference the durable QA report
path. Do not show the Quality Readiness projection or evidence inventory in chat.
At `revise`/`block`: show the decisive dimension, reason and next action.
```

**code-review/SKILL.md, task-plan-review/SKILL.md, clean-implementation-review/SKILL.md:**
```markdown
### Compact Chat Output

At `pass`: one line — `<skill>: pass — <one-line summary>`.
At `revise`/`block`: show blocking findings with file references.
Full report remains in durable file or inline evidence as specified by the skill.
```

**gate-check/SKILL.md:**
One line after existing Chat Output Discipline reference:
```markdown
See the Runtime Contract §Chat and Tool-Call Discipline for tool-call batching and skill output compaction rules.
```

## 5. Non-Overlapping Sections

This run adds to §Chat Output Discipline (new subsection). The `agdf-gate-rationale-why`
run added to §Native Interaction Contract. No overlap.

## 6. Test Plan

- Runtime integrity passes with updated skills.
- `test:interaction-presentation` unaffected (no logic change).
- Verify 5 skills have compact output guidance.
- Verify runtime contract has the new clause.

## 7. Next Step

`Approval: SD`
