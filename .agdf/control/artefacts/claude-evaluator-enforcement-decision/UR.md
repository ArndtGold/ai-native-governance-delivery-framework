# UR: Decide And Document Claude Code's Delivery Path Search Enforcement Level

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-10
Date: 2026-07-10
Owner: agent

## 1. Problem

`create-agdf/lib/delivery-path-search/surfaces/capabilities.js` hardcodes Claude Code's Delivery
Path Search evaluator enforcement as `instruction_only` with an empty `evidence: []` array — the
same as the `generic` fallback. Only Codex has `tool_enforced` status, backed by a real sandbox flag
(`codex exec --sandbox read-only --ephemeral`). There is no `evaluators/claude.js` file; only
`evaluators/codex.js` exists. This was surfaced during an earlier project evaluation in this
conversation but never turned into a durable decision — it currently sits as an implicit, permanent
default rather than a reviewed and recorded choice.

## 2. Goal

Produce one durable, explicit answer: does Claude Code stay a permanent `instruction_only` evaluator
by design (because no equivalent sandboxed enforcement flag exists for it today), or is a technical
evidence substitute pursued (e.g. deriving evidence from Claude Code's own tool-permission /
sandbox-mode configuration, if and when such a signal becomes inspectable)? Whichever answer is
chosen, it should be recorded where `capabilities.js` and the Context Graph (`CG-DELIVERY-PATH-SEARCH`)
can reference it, instead of remaining an unreviewed hardcoded default.

## 3. Scope

- In scope: research what enforcement evidence (if any) is realistically obtainable from a Claude
  Code session today; decide whether to (a) keep `instruction_only` as a permanent, explicitly
  documented design boundary, or (b) define a concrete technical evidence path and what would need to
  change in `capabilities.js` / `evaluators/` to support it.
- In scope: recording the decision durably (Context Graph entry and/or a short note near
  `capabilities.js`), not necessarily writing new evaluator code — that would be a follow-up UR if
  option (b) is chosen and requires implementation.

## 4. Non-Goals

- Not implementing a new `evaluators/claude.js` file in this UR — only deciding whether that follow-up
  is worth pursuing, and under what conditions.
- Not changing Codex's, Copilot's or OpenCode's enforcement levels.
- Not reopening the already-decided non-MCTS, advisory-only nature of Delivery Path Search.

## 5. Acceptance Signals

- A recorded decision exists (Context Graph and/or code comment/doc) stating either "permanent
  instruction_only, here is why" or "technical evidence substitute planned, here is the concrete
  signal and follow-up UR scope".
- `capabilities.js`'s `claude` entry either stays as-is with a documented rationale, or is changed
  with a clear justification tied to a real, inspectable signal (not a placeholder).

## 6. Existing Source Of Truth

- `create-agdf/lib/delivery-path-search/surfaces/capabilities.js`
- `.agdf/control/CONTEXT_GRAPH.md` (`CG-DELIVERY-PATH-SEARCH` node, which already documents the
  Codex-as-reference-evaluator boundary and could hold this decision too)
- Prior conversation analysis in this session comparing Codex's `tool_enforced` sandbox evidence to
  Claude's `instruction_only` status

## 7. Risks And Unknowns

- Whether Claude Code (or the harness running it) will ever expose an inspectable, provable
  read-only/sandbox signal comparable to Codex's `--sandbox read-only --ephemeral` flag — this may
  simply not exist yet, in which case option (a) is likely correct for now.
- Scope creep risk: this could balloon into redesigning the enforcement model instead of just
  recording a decision; Brownfield Review should keep this bounded to research + decision, not
  implementation, unless the smallest safe path is clearly a `quick_task` doc/comment change.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
