# AGDF Runtime Contract — Interaction

## Run Status Card

When a run needs an operational status view, use the Run Status Card as a compact projection of existing control state.
It must not introduce a second gate model or override `gate-check`, `delivery-map`, QA, OR, or user approvals.

- `mode`: `quick_task | verified_change | structured_delivery | unknown`
- `run_id`: the exactly selected canonical run
- `presentation_language`: the resolved complete locale-pack tag; absent or unsupported requested locale tags resolve to the registry's deterministic `en` fallback, while an incomplete or invalid registry fails closed
- `status`: `open | blocked | pass | warn | revise | block | in_progress`
- `current_gate`: current user gate or internal step
- `mode_slice_decision`: `undecided | quick_task | verified_change | structured_slice | structured_delivery | block`
- `allowed_now`: outputs or actions currently permitted
- `forbidden_now`: outputs or actions currently forbidden
- `blocking_condition`: current blocker or `none`
- `missing_approval`: exact missing approval formula or `none`
- `next_gate_after_approval`: the next user gate or internal step unlocked by the missing approval, or `none`
- `allowed_after_approval`: concise description of what becomes allowed after the missing approval, or `none`
- `user_visible_outcome_after_approval`: concise user-facing result of approving the current gate
- `internal_next_step`: the next agent-controlled process step, or `none`
- `next_user_gate`: the next actual user approval gate, or `none`
- `user_action_required`: `yes` only when the user must provide another deliberate approval or decision; otherwise `no`
- `evidence`: concrete evidence references currently visible
- `next_skill`: next AGDF skill or `none`
- `next_step`: the single next permissible process action
- `quality_outlook`: the next meaningful quality-improvement focus, or `none`

`next_step` and `quality_outlook` are intentionally different:

- `next_step` is process permission: what may happen next.
- `quality_outlook` is quality direction: what would most improve confidence, maintainability, evidence, or delivery integrity if further investment is made.

`quality_outlook` must not unlock gates, imply QA pass, or substitute for missing evidence.

`allowed_now` and `allowed_after_approval` are intentionally different:

- `allowed_now` is current authority under the active gate.
- `allowed_after_approval` is the immediate authority unlocked only after the exact `missing_approval` is supplied.

`next_gate_after_approval` and `allowed_after_approval` must be `none` when no approval is missing, when the current step is internal, or when the run is in OR/completed handoff. They must not imply implementation, QA, release, commit, push or PR authority unless the existing gate model already allows that authority.

### Deterministic Operational Presentation

`status_card` is the canonical machine/audit projection. The same evaluation also exposes an additive
`status_presentation` object with selected run/revision/gate/locale identity, `semantic_block:
run_status_card`, one compact Markdown block with localized labels and canonical evaluated values,
and `authorizes: false`. The full raw and evidence-bearing projection remains available unchanged in
`status_card` JSON for audit and automation; it is not duplicated into the primary chat card.
Fresh legacy-compatible control state without a durable revision uses the explicit non-authorizing
identity `unversioned`; ready approval presentation remains impossible without a real revision.

`interaction-presentation.js` is the only owner that may select, label, order, localize and render the
operational status fields. The gate-check CLI, skills and surface adapters consume
`status_presentation.markdown` verbatim. They may add concise surrounding explanation, but they must
not reconstruct a table, omit or rename fields, substitute generic gate actions for evaluated
`allowed_now`/`forbidden_now`, or maintain another status-card template. If the projection is missing
or its selected run, revision, gate or locale identity is stale, presentation fails closed rather
than falling back to model-generated status Markdown.

This determinism protects semantic parity, permission boundaries and evidence visibility across
hosts. It does not standardize host chrome or unrelated conversational prose. `approval_presentation`
remains the separate decision-time projection and is present only for a ready user gate; both public
presentations derive from the same `status_card` snapshot and neither grants approval.


### Breadcrumb

The compact human Run Status Card may include a single-line path-derived breadcrumb that
shows the user's position in the delivery journey. It is derived from the Mode/Slice
Decision and the Approvals table — not a fixed template.

| Mode/Slice | Breadcrumb gates |
|---|---|
| structured_delivery / structured_slice | `UR · PRD · SD · TP · QA · UAT` |
| verified_change | `UR · Verified Change · OR` |
| quick_task | `UR · Quick Task` |
| block | `UR · Block` |

- `✓` fulfilled, `●` current, `○` open.
- Non-applicable gates are absent (no `–` placeholders, no thinned standard template).
- `verified_change` is one collapsed node, not a degraded standard route.
- The breadcrumb is a derived, non-authorising projection. It does not add a new gate
  model or override the Gate Transition Model.
- The machine-readable `status_card` JSON may carry a derived `breadcrumb` array
  `[{gate, status}]` for the presentation layer; this is additive and does not replace
  any existing field.

### Post-Acceptance Transition Narration

After each accepted gate approval, the agent emits exactly one status line using the
template:

```text
<what was satisfied> → <what the agent does next internally> → <user action: yes/no>
```

This narration is temporally and structurally separate from the Gate Transition Card:

- The Gate Transition Card is **pre-approval** (in the orientation envelope); it is
  subjunctive and contains the exact `Approval:` value.
- The narration is **post-acceptance** (after the gate advanced); it is indicative and
  does not contain the `Approval:` value.
- Both never appear in the same assistant message.
- The narration does not repeat the decision's effect (the card's job) and uses its own
  template, not the card's three-question form.
- For internal steps (Brownfield Review, Brownfield Analysis), the narration states what
  the agent does next and that no user action is required, without exposing
  `next_user_gate: none` or asking for a second approval.

### Internal-State Collapse

The derived-projection principle above applies explicitly to internal sub-states. The
full Run Status Card (machine/audit projection) keeps all fields unchanged. Only the
compact human card collapses internal sub-states to stable human labels:

| Internal sub-state | Human label | Stays explicit |
|---|---|---|
| `verified_change`: missing/draft/invalid/eligible/executed | "Compact change under review" | `escalated` → "Escalated to structured delivery" |
| `context_graph_required_action`: link/update/create/resolve_drift | "Project memory maintained" | `open_gap` → "Graph gap open" |
| `multi_scope_state`: clear/ambiguous | (not shown) | `blocked` → "Ambiguous scope, clarification needed" |

`open_gap` and `escalated` remain explicitly visible. The full machine projection retains
all raw values unchanged.


## Gate Transition Card

Every ready `gate_approval` uses one fixed visible sequence: first the compact
approval-time Run Status Card, then the Gate Transition Card, then exactly one
native question or exact-text fallback. Both cards derive from one immutable,
non-authorizing presentation snapshot produced after canonical selected-run,
gate and durable-artefact readiness evaluation. The snapshot never selects a
run, decides a gate, persists state or grants approval.

The two distinct card blocks form one Approval Orientation Envelope in one
immediately preceding assistant message. The agent must complete that message
before invoking any native question tool or emitting an exact-text approval
request. Splitting the cards across separate assistant turns or invoking the
tool after only one card is a failed interaction, not a valid presentation.

The first visible line of that envelope is the localized neutral decision title
of the current user gate, rendered as a level-two Markdown heading or equivalent
accessible host heading inside the compact approval-time Run Status Card.
`AGDF Status`, `Run Status Card`, `Gate Transition Card`, raw gate identifiers
and machine values are semantic or diagnostic labels only and must not become
the primary heading. Approval-directed titles such as `Approve solution design`
are also invalid. The decision title appears exactly once and does not replace,
merge or reorder either required card block.

The compact approval-time Run Status Card contains exactly five operational
fields: selected run, readiness status, current gate, a localized human-readable
required decision and one neutral instruction to choose approve, request revision
or decline. It does not contain the exact approval value or quality outlook. It uses localized human-readable labels
and must not contain evidence, diagnostic codes, raw control-state keys,
allowed/forbidden inventories or machine values. The complete Run Status Card remains the operational,
CLI and audit projection and remains available for complete detail outside the
approval-time compact view.

The first scan across both cards reveals the requested decision, readiness,
required approval, approval effect, remaining boundary and next transition.
Identity and artefact references provide supporting context without competing
with that sequence. Across the two cards, the exact `Approval: <GateName>` value
appears exactly once, in the Gate Transition Card. The later native prompt or
exact-text request may repeat it only as the required input.

The canonical `interaction-presentation.js` owner builds and validates one
immutable snapshot, then renders both complete Markdown blocks and the approval
interaction. The public additive `approval_presentation` schema contains
`schema_version`, selected run/revision/gate/locale identity, fixed sequence,
both rendered blocks, canonical prompt/options/exact-text fallback and
`authorizes: false`. It is a valid object only for a ready user gate and `null`
otherwise. Agents and surface adapters transmit these blocks without rebuilding
headings, fields, ordering, locale copy or Markdown.

The Gate Transition Card is the second orientation message. It is derived from
the same snapshot and canonical post-approval transition, but it is not another
state model, persisted record, renderer or approval authority. It turns only
the decision-relevant subset into concise product copy immediately before the
host-native question or exact-text fallback.

The card answers exactly three user questions, in this order:

1. **Where am I?** A localized human-readable gate title, deterministic human
   run title, selected `run_id` as secondary context, compact `UR · PRD · SD · TP`
   artefact links and a clear ready-for-decision state.
2. **What does this decision do?** The exact `Approval: <GateName>` value, its
   concrete next outcome and the most important boundary that remains.
3. **What happens next?** The immediate agent-controlled action and the next
   actual user decision when one exists; otherwise a plain statement that no
   further user action is required now.

Use this compact composition:

```text
<localized gate title> · <human run title> · `<run_id>`
<UR link or localized missing text> · <PRD link or localized missing text> · <SD link or localized missing text> · <TP link or localized missing text>
<localized ready-for-decision line>

<localized approve heading>
`Approval: <GateName>` <localized concrete effect>. <localized remaining boundary>.

<localized next heading>
<localized immediate agent action>. <localized next user decision or no-action statement>.
```

Resolve all AGDF-owned explanatory text through the canonical Interaction
Locale Registry. `en` and `de` are initial reviewed packs, not a closed locale
list. English is the deterministic fallback for absent or unsupported requested locale tags; an
incomplete or invalid registry fails closed. Gate identifiers, `run_id`, canonical paths and exact
approval values are never translated. The visible gate title is localized;
for example, the German title may be `Lösungsdesign` while the authorization
value remains `Approval: SD`. Meaning, ordering and authority boundaries are
identical across locale packs.

The Gate Transition Card must not be a Markdown table or dashboard. It must not
present raw control-state keys, machine status values, diagnostic codes,
evidence lists, allowed/forbidden inventories or implementation detail that is
not needed for the decision. It must not repeat the native question. The card
normally fits in one title, one readiness line and two short content blocks.
Run and gate identity may appear in both cards to anchor the shared snapshot;
status rows, action inventories and transition prose must not be duplicated.

For `Approval: TP`, the effect is permission to run pre-implementation
Brownfield Analysis, implementation remains gated until that analysis passes,
and the next block states plainly that no further user decision is required
now. Brownfield Analysis must not be presented as a user gate.

If snapshot validation or rendering fails, emit no partial card and forbid native
invocation. Perform a fresh gate evaluation. Show only the localized exact-text
request when the same gate remains ready and the canonical approval value is
independently valid. Otherwise report the current non-ready reason and request no
decision. Never patch, guess or model-reconstruct missing presentation content.


## Native Interaction Contract

Native host controls improve how a decision is presented; they do not create a second approval model or authority source.

Every AGDF interaction belongs to exactly one semantic kind:

- `clarification`: asks for missing intent or a choice that does not itself authorize a gated transition.
- `tool_permission`: requests host-owned authority for a command, file change, network access, external path, app action or comparable technical side effect.
- `gate_approval`: requests deliberate user input for the one current AGDF user gate after its durable artefact and selected run are ready.
- `blocked`: explains a blocker and the one permissible recovery action without offering approval controls.
- `status`: reports current state without asking for a decision.

The semantic interaction envelope is:

```text
interaction_kind: clarification | tool_permission | gate_approval | blocked | status
surface: codex | claude | opencode | fallback
run_id: required for gate_approval
current_gate: required for gate_approval
native_attempt_required: true only after ready-gate and adapter-capability preflight prove exact value transport and safe deliberate waiting
prompt: required
options: required for a structured question
effects: required when the interaction can cause side effects
required_evidence: required for gate_approval
auto_resolution: forbidden for gate_approval
response_origin: deliberate_user_input for gate_approval
```

This envelope is not a new persisted record. The selected canonical `RUN_STATE.md` and existing artefact chain remain the durable authority.

Before presenting `gate_approval` for any user gate (`UR`, `PRD`, `SD`, `TP`,
`QA`, or `UAT`), the agent must emit the compact localized Run Status Card and
the localized Gate Transition Card as two distinct blocks in that order within
one immediately preceding assistant message. Neither card is optional, hidden
in the question text or replaced by a host button label. Do not invoke the
native question tool until the complete two-card envelope is visible. Native
buttons or exact-text fallback may appear only after both cards. Render the two
cards once per eligible attempt; an unavailable or not-applied native control
proceeds to exact text without repeating them.

Before presenting `gate_approval`, the agent must:

1. resolve exactly one selected run;
2. run the canonical gate evaluation and confirm that the current gate's durable artefact is present and ready;
3. consume one validated canonical `approval_presentation`, emit its compact Run Status Card and Gate Transition Card verbatim in that order immediately before the gate question, then ask exactly one gate question that identifies `run_id` and `current_gate` and offers the exact approving value `Approval: <GateName>` followed by stable `revise` and `decline` outcomes; host-owned dismissal maps to `cancel` where only three choices are available;
4. wait for deliberate user input without a timeout, default, preselection, hook-supplied answer or agent-to-agent substitute;
5. re-run canonical gate evaluation against the same `run_id` and expected gate immediately before persistence;
6. reject missing evidence, ambiguous or wrong run, wrong gate, stale state and any response that is no longer valid;
7. persist an accepted approval only through the existing control-state workflow.

For a ready `gate_approval`, interaction kind and native capability are separate. Evaluate callability,
deliberate wait safety and canonical approval-value transport before invocation. `native_attempt_required`
is true only when current evidence proves `exact_option_value` or `separate_label_and_value` transport
with safe deliberate waiting. Decorated-only, missing, conflicting or unknown capability fails closed to
`unavailable_before_invocation`; unsafe waiting fails closed to `unsafe_to_wait`. Both expose false and use
exact text without invoking the adapter. A report-only CLI evaluation has no verified current host adapter
and therefore exposes false. Hooks may prepare context but must not answer, approve or replace an eligible attempt.
An adapter that requires a visible suffix such as `(Recommended)` on its approving option is
`decorated_label_only`: do not invoke it for an AGDF gate. `Approval: <GateName> (Recommended)` is never a
valid AGDF approval option or authorization value; use the undecorated exact-text fallback instead.

The first eligible native-attempt has a single bounded outcome: the declared
host control is presented, or the agent immediately uses the exact-text
fallback. A host that does not apply the control does not trigger a second
native prompt. AGDF must not simulate or force host-owned presentation.

An eligible interaction must make its presentation outcome visible and
distinguishable: `presented`, `unavailable_before_invocation`,
`attempted_not_applied`, or `unsafe_to_wait`. This is transient presentation
evidence only, never a persisted approval, selected-run authority or substitute
for post-response revalidation. A textual fallback names the outcome, gives the
exact approval value and confirms that authority is unchanged. A fresh explicit
user request may reopen the unchanged decision after revalidation; it is not an
automatic retry.

For deterministic local projection, use an already installed `agdf gate-check
--json` and consume `approval_presentation`, or use `agdf gate-check
--approval-envelope` on an exact-text surface. These are renderer/validator
helpers, not a second UX or gate authority. Do not require a registry-resolved
`npx ...@latest` call for each normal interaction. `npx` remains the explicit
bootstrap, installation, refresh or missing-local-executable path.

A free-form native response is valid only when the existing exact-approval validator accepts it for the current gate after revalidation. A localized label, description, option position, recommendation style or host action never authorizes a gate. Revise, decline and cancel outcomes never advance a gate.

Surface adapter rules:

| Surface | Native question adapter | Gate-safe use | Technical permission boundary |
|---|---|---|---|
| Codex | native `request_user_input` or equivalent short-question control when callable | invoke on the first eligible attempt when preflight proves `exact_option_value`; if unavailable or not applied, use exact text without retry | Codex command, edit, network, external-directory and app-action approvals remain host-owned `tool_permission`. |
| Claude Code | `AskUserQuestion` | on the first eligible attempt, use only when no timeout can auto-continue and no hook supplies `answers` or `updatedInput`; if unavailable or not applied, use exact text without retry | Claude permissions and `ExitPlanMode` are not AGDF approval. |
| OpenCode | built-in `question` | use with exact approval/revise/cancel options when `permission.question` permits it; explicit user deny selects exact-text fallback | `once`, `always`, `reject`, permission suggestions and auto mode are technical outcomes only. |
| GitHub Copilot | none in the current AGDF repository-instruction surface | transmit the canonical rendered cards followed by the exact-text request; never claim or simulate a native approval control | Copilot tool confirmations, plan interactions and repository permissions are not AGDF approval. |
| Fallback or non-interactive | concise exact text | wait for a new explicit user response; never synthesize or auto-resolve one | Host-specific technical permission remains separate. |

Native structured questions are for real decision points. Prefer repository inspection over clarification and do not show them for status reporting, discoverable facts, routine read-only work or repeated non-ready gate prompts.

### Read-only request orientation

For a newly classified read-only request that does not require a run decision, render the localized
`primary.readOnlyOrientationDescription` sentence exactly once before the findings. This is a visible
orientation, not durable state: do not create a run, write control files, request gate approval or
repeat the sentence later in the same request. Existing-run status inspection remains read-only and
uses the existing status projection; this branch must not create a second status-card or narration
owner.

### Task Target Orientation

Task-target semantics and ordering live in `task-target-resolution.md`. When target/context
separation is material, a confirmed target changes, or resolution is unresolved, the agent consumes
the canonical `task_target_orientation.markdown` verbatim from `renderTaskTargetOrientation` in
`create-agdf/lib/interaction-presentation.js`.

The projection may show the primary target, governance target, evidence sources and working
directory for a resolved result. For an unresolved result it shows the localized reason and required
next action. It carries `authorizes: false`, never renders approval controls and never selects or
derives a target.

For a fresh request, render the target orientation before read-only orientation, Scope
Classification or any gate presentation when it is required. An unresolved result suppresses every
downstream orientation and gate surface. A resolved result with material target separation may be
followed by the one applicable downstream surface. Avoid a redundant target block for an obvious
unchanged target.

If the input is incomplete or contradictory, the renderer returns `null`. The agent then fails closed
to target clarification and must not model-reconstruct Markdown. `gate-check` must not maintain a
skill-local target-orientation template.

### Scope Classification Card

When `gate-check` classifies a fresh scope as an ungated `quick_task` with a resolved Trivial
Change Boundary result,
the agent consumes the canonical `scope_classification.markdown` verbatim from
`renderScopeClassificationCard` in `create-agdf/lib/interaction-presentation.js`. The card is a
compact, localized, non-authorizing projection of the classification: mode, boundary result,
UR-trigger evaluation, one currently-allowed line, one remains-forbidden line, escalation triggers
and the challenge path. It carries `authorizes: false` and never renders approval controls.

The card renders exactly once per valid fresh-scope Quick Task classification, before work proceeds.
It must not appear for Verified Change, Structured Delivery, gated, ambiguous, unknown or selected-
run states, internal steps of a selected run, or as a substitute for the two-card approval envelope.
Read-only requests keep the single read-only orientation sentence above; the scope classification
card and the read-only orientation are mutually exclusive for the same request.

Every dynamic scalar and escalation-trigger item is a non-empty, single-line plain-text string of at
most 240 Unicode code points. Markdown control tokens and line-leading heading, blockquote, list or
ordered-list syntax are invalid. The escalation list contains 1–3 valid, distinct normalized items.
The renderer rejects the complete input on any violation; it never coerces, truncates, sanitizes or
partially retains invalid values.

An unsupported requested locale resolves through the complete deterministic English fallback pack.
A present incomplete or otherwise invalid registry is an invalid presentation source, not an
unsupported locale: the renderer returns `null`. Missing, unknown or contradictory classification
input likewise returns `null`, and the agent fails closed to the existing ceremony — never
model-reconstructed Markdown. The card introduces no gate, no approval value, no persistence and no
second presentation owner. `gate-check` must not maintain a skill-local card template.

Exact textual approvals remain canonical and fully supported on every surface. If native capability availability or safety is unknown, use the textual fallback. Host permission, plan approval, native question presentation, timeout/default behavior, hook output and agent messages never carry AGDF gate authority by themselves.

### Interaction Locale Contract

User-facing native questions, option descriptions, primary chat cards, exact-text
fallback and human CLI output use the configured project chat language from
`.agdf/control/config.json` and the canonical registry
`plugin/meta/agdf-interaction-locales.json`:

- resolve an exact complete pack, then its language subtag, then deterministic English fallback;
- `en` and `de` are the initial complete packs; additional reviewed complete packs are supported without changing runtime logic;
- an unsupported requested locale must fail to English as a complete unit; an incomplete or invalid
  registry is not an unsupported locale and must fail closed without presentation;
- one interaction must not mix presentation languages, including labels and descriptions;
- durable artefacts, runtime rules, task identifiers and machine-facing approval values remain English;
- the exact approval value remains `Approval: <GateName>` in every locale;
- localized `revise`, `decline` and `cancel` labels are presentation text only and never carry gate authority;
- host-owned chrome follows the host's own UI language and must not be presented as AGDF-translated chat copy.

The locale changes presentation only. It must not change gate meaning, option ordering, readiness, validation, revalidation or persistence. Host-provided free-text labels and skip actions are not AGDF-owned approval options and must never advance a gate.

### Gate-Rationale-Registry

The locale registry contains a deterministic, localized `gateRationale` section with one
curated one-liner per gate and internal step. The agent retrieves rationale strings via
the `gateRationale()` function; it does not generate rationale prose. Rationale strings
are the same across invocations for the same gate and locale.

The registry covers all user gates (`UR`, `PRD`, `SD`, `TP`, `QA`, `UAT`) and all internal
steps (`Brownfield Review`, `Mode/Slice Decision`, `Brownfield Analysis`, `CD+Tests`, `CR`,
`OR`). Each string stays within the declared `lengthBudgets.description` budget. Key parity
across locale packs is enforced by the existing `validateLocaleRegistry` baseline
comparison.

A one-liner cannot explain the full protective function. The user needs enough to accept
that the gate makes sense, not the complete rationale. Deeper context is available on
demand through the "Why?" interaction.

### On-Demand "Why?" Interaction

When the user asks "why?" at any gate or internal step, the agent responds with a `status`
interaction containing the curated rationale (Gate-Rationale-Registry) plus one line of
fulfilled/protects context composed from existing state.

- The response is deterministic, non-authorizing, and does not display approval controls.
- It is a separate `status` interaction, never merged with the `gate_approval` sequence.
- The `gate_approval` options remain exactly `approve | revise | decline | cancel`; no
  "why" option is added.
- The response never breaks `APPROVAL_SEQUENCE` or `validateApprovalOrientationSnapshot`.
- Default output is unchanged when the user does not ask.
- The fulfilled line is composed from the selected run's Approvals table and artefact
  status; the protects-against line is composed from the gate's rationale and existing
  `primary.actions` copy. The agent does not generate new prose.

### Human Decision Presentation Contract

The primary user surface is a pure projection of the selected canonical run.
It must never become a second evaluator, state store, renderer authority or
approval path. Native controls, exact-text fallback and human CLI output use
the same semantic payload and outcome ordering; machine JSON retains its
stable field names and diagnostic values.

For every primary chat card:

1. Resolve a human run title deterministically from the current artefact
   heading, approved UR heading, first non-empty Objective line, then normalized
   `run_id`.
2. Show `UR · PRD · SD · TP` in that stable order. Existing selected-run
   artefacts are links with readable labels; missing artefacts use localized
   non-link text. Never guess a path or emit a broken link.
3. Use a localized neutral decision title while preserving the exact gate identifier
   and `Approval: <GateName>` authorization value. The technical value appears
   once across the two cards, in the transition card; the later input control may
   repeat it as the required value.
4. Keep primary copy decision-oriented. Raw keys such as `next_user_gate`,
   `mode_slice_decision` and `required_next_gate`, diagnostic codes and machine
   status values belong to JSON or audit detail, not the primary interaction.

For a ready approval, explicit options are ordered `approve`, `revise`,
`decline`; an explicit `cancel` follows only on surfaces that support it, while
host dismissal maps to `cancel` on three-choice surfaces. Do not preselect,
auto-submit, recommend as authorization, skip or reorder an option. Labels and
descriptions use the same resolved locale and must have distinct, non-empty
accessible names. Translation length budgets must preserve meaning without
truncation being the only distinction.

Normalize outcomes as distinct values:

```text
approve | revise | decline | cancel | no_response | timeout | empty | invalid | stale
```

Missing input, timeout, cancellation and empty input are not decline. Only
`approve` backed by the exact revalidated `Approval: <GateName>` value may
advance a gate. Clarification, blocked, internal-step and status-only
interactions must not display gate-approval controls.
