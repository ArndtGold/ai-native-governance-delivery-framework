# SD: Guided AGDF UX Interaction Delivery

Status: approved
Gate: SD
Gate approval: `Approval: SD` provided on 2026-07-15
Based on: `.agdf/control/artefacts/agdf-ux-next-round/PRD.md`
Date: 2026-07-15
Owner: AGDF

## 1. Solution Overview

Extend the existing canonical control-state projection rather than adding a UX state store. The
solution has four coordinated projections:

| Concern | Canonical owner | Delivery approach |
|---|---|---|
| Ambiguous runs | `create-agdf/lib/control-state/*`, `create-agdf/bin/create-agdf.js` | Add one display-safe candidate projection to ambiguity reports; native hosts use it only for scope clarification and revalidate selection before any gate action. |
| Gate interaction and fallback | `create-agdf/lib/interaction-presentation.js`, Runtime Contract, `gate-check` skill | Add pure interaction-attempt/fallback payload helpers and locale copy; host adapters remain responsible for actual native invocation. |
| First contact and skill discovery | `plugin/meta/agdf-plugin.definition.json`, `pages/src/data/skills.ts`, Pages rendering | Add one canonical discovery classification and derive AGDF-owned grouped surfaces from it. |
| Version and screenshot evidence | package metadata, installer/status output, Pages proof metadata | Label expected package, observed installed state and historical visual evidence separately; never infer a live session version. |

The selected `RUN_STATE.md`, existing artefacts and exact approval validator remain the only
durable authority. Interaction payloads and receipts are derived, transient presentation data.

## 2. Ownership And Source Of Truth

| Domain | Authority | Non-authoritative projection |
|---|---|---|
| Gate state, approval and run lifecycle | `.agdf/control/runs/<run_id>/RUN_STATE.md` plus artefact chain | Gate Transition Card, status-card and interaction payload |
| Active-run discovery and ambiguity | `create-agdf/lib/control-state/run-state-repository.js` | Candidate list in gate-check detail/host selection prompt |
| Human title | Existing `resolveHumanRunTitle()` precedence | Sanitized candidate title; never raw Objective content |
| Gate interaction semantics | `plugin/meta/agdf-runtime-contract.md` | Adapter prompts and fallback copy |
| Native adapter availability | `plugin/meta/agdf-plugin.definition.json` | Codex/Claude/OpenCode host call or text fallback |
| Skill identity and routing | `skillSet` in canonical plugin definition | Pages grouping and onboarding copy |
| Package-version truth | canonical package/plugin metadata and surface-specific status command | Pages screenshot label and session-verification state |

## 3. Architecture Decisions

### 3.1 Candidate projection for ambiguous runs

Add a pure `buildRunCandidates()` projection close to the existing control-state/presentation
helpers. It accepts only valid active canonical runs and emits a bounded array of:

```text
run_id
display_title
current_gate
next_allowed_action
revision_id
```

- `display_title` derives from the current artefact heading, approved UR heading, then a
  normalized `run_id`; it must not use free-form Objective content for candidate display.
- Sort candidates by normalized `display_title`, then `run_id`; disambiguate duplicate titles with
  the secondary `run_id`.
- Do not include invalid, completed, non-active or stale candidates. The receiving adapter reruns
  canonical selection/evaluation immediately before presenting the next gate interaction.
- `gate-check --json` retains its fail-closed result and gains an optional detail-only
  `candidate_runs` projection when ambiguity is the blocker. Human primary copy stays concise.
- If a host cannot safely present all candidates, show a localized textual selection instruction
  with the same bounded list and no implied approval. The SD implementation must define an
  accessible list limit and an explicit “show remaining runs” continuation that remains
  clarification-only.

### 3.2 Non-authoritative interaction-attempt payload

Extend `create-agdf/lib/interaction-presentation.js` with validated pure helpers for:

```text
interaction_id
run_id
current_gate
surface
attempt_outcome: presented | unavailable_before_invocation | attempted_not_applied | unsafe_to_wait
fallback_reason
expected_approval
```

- The payload is created for an eligible gate decision and is never written into `RUN_STATE.md`,
  treated as an approval, or accepted by the existing approval validator.
- `presented` is evidence that the adapter invocation was requested, not that a user approved.
- A fallback emits its localized explanation from the complete locale pack and exposes the exact
  text value. It must say whether the adapter was unavailable, not applied or unsafe to await.
- A pre-artefact approval uses a separate `not_ready` explanation. It records no approval and, once
  the artefact is ready, the agent presents a fresh gate decision rather than reusing the old
  message as authority.
- A user can explicitly reopen an unchanged decision after a fallback. That creates a new
  `interaction_id`, revalidates run/gate/artefact state and allows one new native attempt; it is
  never an automatic retry.
- `revise`, `decline`, `cancel`, `no_response`, `timeout`, `empty`, `invalid` and `stale` remain
  existing non-approval outcomes. Their visible receipt names the selected run and gate, confirms
  that authority did not change, and gives one next action.

### 3.3 Surface adapters and evidence boundary

The existing surface rules remain unchanged: Codex uses `request_user_input` when callable,
Claude uses `AskUserQuestion` only when safe, OpenCode uses `question` only with permitted
`permission.question`, and all other cases use exact text.

Deterministic tests validate payload construction, ordering and fallback semantics. They cannot
prove that a host actually rendered a native control. A live session check is therefore required
as separate evidence for every changed host; unavailable hosts are reported as unverified, never
as a passing native interaction.

### 3.4 Progressive skill discovery

Add a canonical discovery classification to each `skillSet` entry:

```text
start_here | automatic | optional
```

Pages and supported onboarding copy derive the grouping from that field. No second skill catalogue
or manually copied skill descriptions are introduced. Codex/Claude plugin detail pages remain
host-owned; where they retain a flat list, AGDF does not claim in-place grouping and links users to
the grouped AGDF-owned explanation.

### 3.5 Version and screenshot evidence

Model visible version evidence with three distinct labels:

| Label | Meaning | Evidence source |
|---|---|---|
| Expected package version | Version declared by canonical package/plugin metadata | repository/package metadata |
| Observed installed version | Version reported by a surface-specific status or installation check | command/session observation with timestamp |
| Session version unverified | No direct evidence of the version loaded by the active host session | explicit unknown state |

Pages proof metadata adds an observation label/date where known and retains its existing statement
that screenshots are historical integration evidence, not release-version proof.

## 4. Integration Points

- `create-agdf/bin/create-agdf.js`: ambiguity report and status-card/detail projection; JSON field
  additions must be backward compatible.
- `create-agdf/lib/control-state/run-state-repository.js`: active-run discovery only; no write path
  is added for candidate selection.
- `create-agdf/lib/interaction-presentation.js`: candidate, receipt and locale-safe fallback
  helpers.
- `plugin/meta/agdf-runtime-contract.md`, `plugin/skills/gate-check/SKILL.md` and
  `plugin/meta/agdf-plugin.definition.json`: one aligned semantic contract and adapter mapping.
- `pages/src/data/skills.ts`, `pages/src/pages/index.astro`, `pages/src/data/site.ts`: grouped
  discovery and version/screenshot evidence projection.
- `create-agdf/scripts/sync-package-assets.js`: propagation of canonical plugin metadata and
  runtime files into generated package surfaces.

## 5. Constraints And Compatibility

- Preserve exact `Approval: <GateName>` values, existing outcome normalization, `--run`,
  `AGDF_RUN_ID`, lifecycle semantics, locale fallback and all JSON fields.
- Candidate selection, interaction receipt and native presentation are input/presentation only;
  none may persist an approval or choose a run implicitly.
- Receipt data is bounded, redacted and non-durable. It must never contain free-text approval
  input, Objective text or host permission data beyond the defined outcome/reason.
- Do not retry automatically after a host failure. Reopen only from a fresh explicit user request
  and fresh gate evaluation.
- Keep the existing no-table Gate Transition Card boundary for ready gate approvals.

## 6. Test And Evidence Strategy

- Extend `interaction-presentation-test.js` with candidate title/sort/collision/safe-display tests,
  interaction-attempt payload validation, fallback reasons, non-approval receipts, pre-artefact
  handling and explicit reopen/revalidation behavior.
- Extend control-state and CLI tests with an ambiguous-run fixture that verifies `candidate_runs`
  contains only eligible runs and preserves failure-closed behavior.
- Extend runtime-integrity negative tests to prove drift between Runtime Contract, gate-check
  guidance, locale keys, plugin definition and generated surfaces fails.
- Add Pages data/render checks for one-source skill grouping and evidence labels.
- Run runtime integrity, control-state, routing, package smoke, Pages check/build and
  `git diff --check`.
- Capture live native-control evidence separately for Codex, Claude and OpenCode where callable;
  record unavailable surfaces as unverified.

## 7. Risks And Open Questions

- The current CLI does not itself invoke host-native controls; the SD depends on agent/host
  adapters honouring the contract. Live evidence is required to avoid overstating enforcement.
- Adding `candidate_runs` to JSON needs a compatibility review for consumers that validate a
  strict schema.
- Host short-question controls may impose option-count or label-length limits; the exact bounded
  overflow interaction must be specified in the TP from current host capability evidence.
- Session-version observation may not be available for every host. The UI must retain the explicit
  `session version unverified` state rather than approximate it.

## 8. Next Step

Review this solution design and approve only with:

`Approval: SD`

## 9. Follow-up Solution Design: Reconciliation And Human-Language Status

Status: approved
Scope: PRD section 2.5 and section 2.6
Gate approval: `Approval: SD` provided on 2026-07-15

This follow-up design extends the existing projections. It does not reopen the completed delivery,
create a second run registry or change gate authority.

### 9.1 Pre-creation reconciliation

Add a read-only reconciliation step before a new UR or run is drafted or persisted:

1. Normalize the requested objective into a bounded comparison record using explicit user wording,
   requested product area and any already-known scope key. Do not use branch recency, timestamps or
   chat proximity as semantic evidence.
2. Compare that record against valid active and recently completed runs using deterministic fields
   and explicit artefact headings. A match requires sufficient evidence; otherwise return
   `match_uncertain`.
3. Project one of four non-authorizing outcomes: `active_match`, `completed_match`, `no_match` or
   `match_uncertain`.
4. For `active_match`, present the existing run as the candidate scope and revalidate its current
   gate before any next action. Never create a second run silently.
5. For `completed_match`, present the delivered result and delivery state. Do not treat the
   completed run as an active approval candidate. Only an explicit distinct follow-up may create a
   new run.
6. For `match_uncertain`, ask a plain-language clarification naming the competing work lines; do
   not select, approve or persist anything.
7. For `no_match`, continue with the existing UR drafting path.

The reconciliation projection is detail/presentation data only. It cannot authorize a gate,
reopen a completed run or replace `RUN_STATE.md`.

### 9.2 Lifecycle and closeout projection

Keep the canonical lifecycle and gate fields unchanged in durable state and machine-readable JSON.
Add a derived human-facing delivery state to the presentation layer:

| Canonical state | Human-facing chat wording |
|---|---|
| active work | `in Arbeit` / configured-language equivalent |
| completed, closeout available | `abgeschlossen — Abschluss noch ausstehend` / configured-language equivalent |
| completed, closeout complete | `abgeschlossen` / configured-language equivalent |
| blocked | `blockiert — [plain-language reason]` / configured-language equivalent |

The machine value `status: open` may remain backward compatible where consumers depend on it, but
it must not be the only human-facing explanation for an OR/completed handoff.

### 9.3 Human-language projection

All primary chat surfaces use the configured chat locale and a plain-language-first composition:

- `structured_slice` becomes a localized explanation such as `kleiner, strukturierter
  Arbeitsabschnitt`.
- `structured_delivery` becomes `umfangreiche strukturierte Lieferung`.
- `Brownfield Review` becomes `Prüfung des bestehenden Systems`.
- `OR` becomes `Abschlussbericht`.
- `PRD`, `SD`, `TP` and `UAT` receive localized explanatory labels wherever they appear outside
  the exact approval token or an explicit technical view.

Raw identifiers remain allowed in artefact links, code blocks, JSON, audit details and explicit
technical-status requests. The exact token `Approval: <GateName>` remains unchanged and is always
paired with a plain-language explanation.

### 9.4 Ownership and integration

- `create-agdf/lib/control-state/run-state-repository.js`: expose read-only run summaries needed
  for deterministic reconciliation; no new write authority.
- `create-agdf/lib/interaction-presentation.js`: own reconciliation and lifecycle display
  projections as pure helpers.
- `create-agdf/bin/create-agdf.js`: invoke reconciliation before run creation and map lifecycle to
  human status without breaking machine output.
- `plugin/meta/agdf-runtime-contract.md` and `plugin/skills/gate-check/SKILL.md`: own the
  pre-creation invariant and plain-language boundary.
- `plugin/meta/agdf-interaction-locales.json`: own localized labels and status copy.
- `create-agdf/scripts/*` and runtime-integrity checks: protect matching, lifecycle wording,
  locale completeness and raw-enum leakage.

### 9.5 Test strategy

- active matching never creates a duplicate run and revalidates the selected run;
- completed matching reports delivered scope without offering it as an active candidate;
- uncertain matching stays at clarification and persists nothing;
- no-match preserves the current UR path;
- OR/completed status no longer renders only the generic human label `open`;
- configured German and English projections use plain-language labels;
- raw enums are rejected in primary chat prose but accepted in technical/audit projections;
- exact approval tokens remain unchanged and authoritative;
- existing control-state, interaction, routing, runtime-integrity and package smoke tests remain
  green.

### 9.6 Next step

Review this follow-up Solution Design and approve only with:

`Approval: SD`

### 9.7 Native approval orchestration

The reliable native-control path is an agent-orchestration contract, not a second hook. Hooks may
load context or validate readiness, but the assistant's gate-approval turn owns the single native
question attempt.

#### Readiness contract

After canonical evaluation, the gate-check projection exposes an additive detail-only envelope:

```text
interaction_kind: gate_approval
native_attempt_required: true
selected_run: <run_id>
current_gate: <GateName>
expected_approval: Approval: <GateName>
```

`native_attempt_required` is true only when exactly one run is selected, the user gate is ready,
the required durable artefact exists and the presentation snapshot is current. It is false or
absent for status, clarification, blocked, internal-step and non-ready interactions.

#### Single-attempt sequence

1. `gate-check` produces the canonical readiness envelope and immutable presentation snapshot.
2. The agent emits the localized Run Status Card and Gate Transition Card once.
3. The agent invokes the configured host adapter exactly once, with auto-resolution and preselected
   answers omitted.
4. The adapter result is classified as `presented`, `unavailable_before_invocation`,
   `attempted_not_applied` or `unsafe_to_wait`.
5. For any non-presented result, the agent immediately emits the localized exact-text fallback with
   the unchanged approval token and authority boundary. It does not retry automatically.
6. A deliberate response is revalidated against the same run, gate and artefact before persistence.

The adapter call must occur in the assistant interaction path after the cards. A SessionStart,
UserPromptSubmit or permission hook must not call the gate, provide an answer, persist approval or
replace the adapter attempt. Hooks are preparation and diagnostics only.

#### Host adapter mapping

| Surface | Adapter | Required behavior |
|---|---|---|
| Codex | `request_user_input` | One callable attempt on the first eligible gate turn; no auto-resolution. |
| Claude Code | `AskUserQuestion` | One attempt only when no timeout/default or hook-supplied answer can continue the turn. |
| OpenCode | `question` | One attempt when `permission.question` permits; explicit deny selects fallback. |
| Fallback | exact text | Used immediately when no safe native adapter is available or applied. |

Host rendering remains host-owned. AGDF may record whether the adapter was invoked and whether the
control was applied, but it must not simulate buttons or claim `presented` from instruction text
alone.

#### Enforcement and evidence

- Add an `native_attempt_required` assertion to the canonical gate-ready projection.
- Add a hermetic orchestrator fixture that fails when a ready gate goes directly to bare text.
- Add fixtures proving no adapter call occurs for ambiguous, blocked, status-only or non-ready gates.
- Add host-specific probe evidence where the adapter is callable; classify unavailable hosts as
  unverified rather than passed.
- Keep exact approval validation and durable persistence unchanged.
- Runtime-integrity checks must reject drift between the readiness envelope, adapter rules,
  fallback outcomes and locale copy.

#### 9.8 Next step

The revised follow-up Solution Design was approved with:

`Approval: SD`
