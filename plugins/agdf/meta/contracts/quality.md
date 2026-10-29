# AGDF Runtime Contract — Quality

This is the shared normative quality contract. SD defines strategy, TP plans executable
checks, reviews assess their dimensions, and `qa-gate` alone decides final technical QA.
Human approvals, mode/depth, recording and presentation retain their existing owners.
Graph, registry and architecture entries explain and reference this contract; they do
not own parallel rules. These instructions guide assessment, not universal enforcement.

## Proportionate Tests And Evidence

Before adding tests, evidence documents or repeat executions, assess approved criteria,
changed behavior, affected interfaces/dependencies, regression risks and existing coverage.
Choose the smallest sufficient checks for those claims; file locality alone is no impact
assessment. Unknown reach requires broader checking or an explicit evidence gap.

Distinguish targeted Run checks, required PR/merge CI and, where actually available,
full nightly checks. Explain placement and the decision point by which results are needed.
Verify actual automated coverage against the authoritative test inventory: a CI label
does not prove a full suite, and an undeclared or pending nightly supplies no result.
Essential change-specific proof must exist before the decision it supports. Preserve
complete required regression coverage; no dropping tests, weakening assertions or raising
timeouts merely to shorten execution.

For each obligation or coherent group, identify the claim, acceptance/risk/rule basis
and required decision point in existing planning/review records. Reuse before collection:
reference retrievable authoritative results with their tested revision, environment and
justified applicability to the current claim. One result may support multiple mapped
criteria, tasks or reviews. Never relabel an older result as execution on a newer revision.
Changed behavior/dependencies, incompatible environments, expired sources, contradictions
or uncertain applicability require new proof or a visible gap.

Additional files, source/log copies and repeated runs need concrete added value, such as
an uncovered claim, changed conditions, reproducibility or required independent review.
A later gate alone supplies none. Use compact references and grouped explanations in
existing records; no separate registry, mandatory per-proof form, fixed file budget or
report about overhead. A summary never replaces the underlying proof. Technical binding,
approval and history records stay with their existing writers and retention rules;
this policy authorizes no deletion or rewriting. Required reviews retain their own
assessment and accountable owner even when they share evidence.

For Run control, follow the bound typed MCP continuation and operation-contract.
Authoring inputs, material staging and recording use the existing owners described in
gate-artifact-preparation.md, section Typed MCP control transport. Local path/validator
examples are fallback only when the required MCP group is unavailable; they never require
a shell switch when the current host exposes the corresponding typed operation.

## Verification Effectiveness And Completion

Derive expected results from approved requirements and domain rules, not copied
implementation logic. For a defect fix, where feasible, show the targeted regression
check failing on the original defect for the intended reason and passing with the fix.
Critical new rules need an applicable negative case. Empty assertions or infrastructure
failure do not establish defect detection. Unsafe or impractical replay needs a concrete
reason and an adequate alternative with visible limits in the existing test/review record;
this is no blanket mutation-testing or historical-replay obligation.

Resolve a finding only after targeted re-verification of its original failure condition
and relevant side effects, or a justified adequate alternative within the existing owner.
A code edit, status change or green aggregate build alone is insufficient. Missing or
inadequate re-verification remains a gap through Normalized Review Gaps below; deviation
acceptance never converts a gap into technical resolution or pass.

Technical verification is complete when required claims/coverage have valid proof,
applicable findings are resolved and contradictions are cleared. Stop redundant collection
then. Further checks need a concrete trigger: changed conditions, invalidated evidence,
an uncovered obligation or a new contradiction. Recheck affected obligations, broadening
when impact is uncertain. Mandatory reviews, required independent assessments, human gates
and closeout still apply; verification completion is no delivery approval. Record what
was actually observed: structural checks, semantic self-review, package parity and native
host behavior are distinct evidence classes. Claim savings or compliance only as measured.

## Quality Readiness Projection

When `qa-gate` authors or refines `QA_REPORT.md`, it uses the version-matched `QA_REPORT`
template from bound `authoring-inputs` at the current QA gate. Follow every cursor and preserve
the manifest/digest binding. CLI fallback uses only the supplied absolute plugin-owned
`template_path`. Repository scaffold copies are derived review references, not an authoring source.
An unavailable or unsafe template blocks QA report authoring without mutation or success-shaped
fallback; it does not turn missing evidence into a QA decision.

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
- Routine `pass` output is one concise result line with its report reference, without
  automatic four-row expansion. At `revise` or `block`, show the four dimensions and
  expand only the decisive reason with its source and next permissible action. Full
  reports and the derived overview remain available on explicit detail/status requests,
  including at `pass`; human gate presentations retain their existing complete material.


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
uses the sole Routine Continuation And Visible Events policy in interaction.md; every required
checkpoint and review still executes. It minimises tool calls and accompanying chat text. This
is surface-agnostic: it changes agent behaviour and framework text, not host rendering.
Whether a host renders a tool-call block visibly is a host concern; the framework ensures
the agent makes fewer calls and produces less text around them.

Skill output compaction:

- QA, Code Review, TP Review and Clean Implementation Review output is 1 line at `pass`:
  `<skill>: pass — <one-line summary>; <report reference>`.
- At `revise`/`block`: the decisive dimension, reason and next action. The Quality
  Readiness projection follows Quality Readiness Projection above; routine `pass`
  never expands it automatically. Explicit requests may show full detail.
- Full reports remain in durable files; the chat references the path.

Tool-call batching:

- `RUN_STATE.md` is written once per user gate approval, not once per field change. The
  agent keeps intermediate state in memory between gate approvals and writes the complete
  updated state in one operation, then records it with `run-update` before the next `gate-check`.
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

Current structured QA preparation requires concrete authored fields in the first scalar block
of existing QA sections: `delivered_result` under TP Coverage, `qualification_limits` under
Missing Evidence and `delivery_risks` under Risks (canonical numbered headings supported).
Only limits/risks permit explicit `none`. Initial Run drafts stay authorable; current decisions
require concrete orienting Objective. The shared bounded context observer excludes examples,
quotes/code/HTML and whole template values; diagnosis and preparation never repair sources.
UAT derives Goal from approved UR, actual result/limits from current QA, original QA/accepted
deviation disposition and the existing approval effect. It stores no second result authority.
When source and display languages differ, existing source-authored Approval Summary uses
Goal/Ziel and Delivered result/Ergebnis, Qualification limits/Grenzen, Risks/Risiken. Complete
current fields before new QA approval; missing approved legacy content stays protected and
needs its existing renewal assessment, never silent backfill. Historical accepted documents
and completed Runs retain original proof. No content check grants approval or proves truth.

Core reads reported technical results through one shared observer. `Decision`/`decision` and
technical `Status` declarations may repeat the same supported result; `passed` normalizes to
`pass`. Lifecycle metadata such as `Status: draft` or `Status: done` is not a QA result.
Only initial result metadata (optionally after the report H1) and the first scalar field block
under a column-zero H2 `Decision` or `QA Decision` heading are authored result contexts. Numeric
section prefixes and closing heading hashes are supported; canonical `## 1. QA Decision` remains
valid. Prose, unrelated/nested headings and non-metadata fields close the field block; a blank
line never reopens it. Metadata names are the existing Decision, Status, Gate, Gate approval,
Based on, Date, Owner, Type, Mode, Reviewer, reviewed_at, run_id, source_revision and Traceability
contract. Fenced/indented code, lists, blockquotes (including lazy continuations), HTML containers,
comments and raw blocks never supply results or conflicts. Only a clearly terminated container
allows a following genuine decision section; uncertain/unclosed markup keeps its remainder excluded.
This is a conservative bounded report grammar, not general Markdown parsing or prose-intent inference.
Bound Quick review and non-UX internal registration reuse the observer. Only the internal analysis
domain opts into `not_applicable`; its existing eligibility/reason checks remain authoritative.
Conflicting supported values, an unknown or empty explicit Decision, or a missing supported
result remain unconfirmed. This observes authored evidence only: it grants no QA decision,
approval, source replacement or closeout permission. Exact approved bytes and current bindings
remain separately enforced.

Structured Delivery skills use this shape when relevant:

- `decision`: `pass | revise | block | not_applicable`
- `evidence`: concrete artefacts, files, tests, logs, diffs, or observations
- `missing_evidence`: missing proof needed for a stronger claim
- `risks`: remaining risks, assumptions, fallbacks, drift, or blockers
- `required_next_step`: exactly the next clean step
- `impact_codes`: affected Quality Contract codes, if the target repo has a registry


## Normalized Review Gaps

This section is the sole normative owner for review-gap classification and routing. An applicable
finding from Task Plan Review, Clean Implementation Review or Code Review carries exactly one
normalized gap type and one routing target:

| gap_type | meaning | routing_target |
|---|---|---|
| `requirements_gap` | approved product behavior or an acceptance criterion is missing or contradictory | `PRD`; use `UR` only when user intent or scope changed |
| `design_gap` | technical ownership, architecture, fallback policy, exit criterion or a prohibited parallel structure was not decided | `SD` |
| `plan_gap` | an approved requirement or design obligation lacks an executable task, test or evidence mapping | `TP` |
| `implementation_gap` | code or a surface does not fulfil an approved requirement, design or task | `CD+Tests` |
| `evidence_gap` | required test, runtime or visible evidence is absent or insufficient | `evidence_obligation` |
| `emergent_risk` | implementation exposes a concrete risk not reasonably decidable from approved artefacts | earliest affected `UR | PRD | SD | TP | CD+Tests | evidence_obligation` target after explicit assessment |

Normalized finding rows use these fields in order:

`finding_id | gap_type | routing_target | gap_status | evidence | required_next_step`

- `finding_id` is stable within the durable review report.
- `gap_type` is exactly one type from the table above.
- `routing_target` is exactly `UR | PRD | SD | TP | CD+Tests | evidence_obligation` and must agree
  with the fixed route above. `requirements_gap` may use `UR` only with evidence of changed user
  intent or scope. An open `emergent_risk` requires an explicit earliest-owner assessment
  before routing corrective work; a resolved row retains its original route and resolution evidence.
- `gap_status` is exactly `open | resolved`.
- `evidence` names concrete source, diff, test, observation or missing proof.
- `required_next_step` for an open finding is exactly one executable action consistent with
  the routing target. A resolved finding may state `none`, explain that no further corrective
  action remains, or name its subsequent review/lifecycle step. Its evidence must remain concrete;
  resolution never makes a missing field, invalid type/route or placeholder evidence valid.

Missing, unknown or contradictory fields fail closed as an open gap. Consumers must not silently
reclassify a finding. Classification is non-authorizing: it cannot edit or approve UR, PRD, SD or TP,
advance a gate or replace a review decision. `qa-gate` consumes the normalized findings and cannot
return `pass` while any applicable finding is open or invalid.

`none` is not a seventh normalized finding type. It is permitted as a presentation sentinel on a
fulfilled UX Intent Fidelity row and as `required_next_step` on a resolved finding, never as
`gap_type`, `routing_target` or resolution evidence. Open findings still require executable action.

Current QA/UAT decision preparation and prepared closeout use the same normalized-finding
observer. A technical pass cannot present a human approval while a registered review contains
an open or invalid finding. Historical approved reports are observed without rewriting their
bytes, decisions or receipts; a resolved finding does not require a new repair or a new approval.

A consumer may repeat the field order and allowed scalar values needed to emit valid output. It must
reference this section for meanings and routes instead of maintaining a second complete mapping.

## Human QA Acceptance With Deviations

The technical QA decision remains exactly `pass | revise | block`. An explicit human acceptance
of deviations is a separate disposition; it never changes `revise` to `pass`, resolves a finding,
marks a missing test passed, or grants native production qualification.

The existing unapproved QA report may contain one `QA Deviation Acceptance` JSON section,
specified in `docs/qa-deviation-acceptance.md`. Core evaluates it through the normalized finding
owner above. Only complete, current low/medium evidence-only findings may be proposed; every
open finding must be covered exactly. Upstream or implementation gaps, malformed/conflicting
findings, `block`, non-passing protected Code/Clean reviews, stale associations and hard Run
blockers prevent this route. Existing required obligations are not silently waived.

Before requesting a decision, show the bounded usage scope and each finding's risk, consequence,
follow-up and owner. The sole contextual action is `Approve with deviations` (German:
`Mit Abweichungen freigeben`); Chat uses the existing exact `Approval: QA` against that newly
presented version. A previously rejected response is never transferred. The existing approval
transaction, receipt and exact-material owner record one effect for both routes. UAT follows
only after that deliberate acceptance; the original report and open findings remain intact.
UAT and OR must carry the accepted deviations forward explicitly.

## UX Intent Fidelity

When an approved PRD contains applicable UX criteria, `task-plan-review` produces an additional
evidence matrix with these columns in order:

`prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type`

`fidelity_status` is exactly `fulfilled | partial | missing | not_verifiable`. A fulfilled row uses
the `none` sentinel. Any non-fulfilled row uses the applicable normalized type from `Normalized
Review Gaps`; it may also emit the normalized finding shape when routing detail is required.

This matrix verifies PRD-to-TP coverage and TP-to-code/surface fulfilment. It does not create product
requirements and does not decide QA. A missing implementation-relevant PRD requirement is a
`requirements_gap` and routes to PRD revision. `qa-gate` consumes this evidence and cannot return
`pass` while an applicable row is `partial`, `missing` or `not_verifiable`, or while a visible-behavior
claim has code evidence without visible evidence. The four-row Quality Readiness projection and
`qa-gate` sole decision ownership remain unchanged.

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
