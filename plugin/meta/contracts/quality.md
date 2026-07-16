# AGDF Runtime Contract — Quality

## Quality Readiness Projection

After CD+Tests, when any of the four review/QA artefacts exists, surfaces may show one compact
derived `Quality Readiness` projection. It answers the user-facing question "what is the current
quality outcome and what should happen next?" without replacing evidence or creating another
decision authority.

- It contains exactly four rows, in this order: `Plan coverage` from `task-plan-review`,
  `Solution integrity` from `clean-implementation-review`, `Code quality` from `code-review`,
  and `QA decision` from `qa-gate`.
- `qa-gate` is always labeled as the sole decision owner. The other three rows are evidence
  dimensions, not competing pass/revise/block decisions.
- Overall status reuses canonical severity ordering. Missing or conflicting required evidence
  must not render `pass`; surface `revise` or `block` with the decisive reason and one permitted
  next action instead.
- The projection is derived, non-persistent and non-authorizing. It cannot accept an approval,
  advance a gate, suppress a report or replace the Run Status Card, Gate Transition Card, JSON
  projection or durable review artefacts.
- Show compact rows on `pass`. On `revise` or `block`, expand only the decisive row with its
  canonical report reference; do not paste complete reports into chat.


## Chat Output Discipline

Durable artefacts are for the repository, not for flooding the chat.
When a skill creates or updates `.agdf/control/` files, gate artefacts, reviews, QA reports or OR reports, the chat response must stay compact:

- name the artefact path and status
- summarize the decision or content in a few lines
- state the current gate, forbidden work and next permissible step
- mention validation evidence when available

Do not paste full control files, full artefact bodies, full templates or full generated reports into the chat unless the user explicitly asks to see the full content.
For larger or more formal work, create or update the durable artefacts fully, then reference them by path and summarize what changed.

### Chat and Tool-Call Discipline

Chat output shows decisions and outcomes. Files show evidence and detail. The agent
minimises both the number of tool calls and the amount of accompanying chat text. This
is surface-agnostic: it changes agent behaviour and framework text, not host rendering.
Whether a host renders a tool-call block visibly is a host concern; the framework ensures
the agent makes fewer calls and produces less text around them.

Skill output compaction:

- QA, Code Review, TP Review and Clean Implementation Review output is 1 line at `pass`:
  `<skill>: pass — <one-line summary>`.
- At `revise`/`block`: the decisive dimension, reason and next action. The Quality
  Readiness projection is shown only at `revise`/`block`, not at `pass`.
- Full reports remain in durable files; the chat references the path.

Tool-call batching:

- `RUN_STATE.md` is written once per user gate approval, not once per field change. The
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


## Quality Contract Output

Structured Delivery skills use this shape when relevant:

- `decision`: `pass | revise | block | not_applicable`
- `evidence`: concrete artefacts, files, tests, logs, diffs, or observations
- `missing_evidence`: missing proof needed for a stronger claim
- `risks`: remaining risks, assumptions, fallbacks, drift, or blockers
- `required_next_step`: exactly the next clean step
- `impact_codes`: affected Quality Contract codes, if the target repo has a registry

A skill may briefly remind this shape, but must not duplicate a complete code or rule matrix.


## Skill Output

Every skill output should be as short as possible and as concrete as needed.
It must distinguish:

- facts
- evidence
- assumptions
- interpretations
- missing evidence
- the next permissible step

