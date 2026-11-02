# Solution Design: Actionable, Localized AGDF Cards

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD revision 8
Date: 2026-09-28
Owner: agent
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Extend the existing canonical card projections and the digest-bound gate-approval renderer. Keep effective state and permission decisions with their current owners. Render a named wait separately from a real blocker, expose structured blocker detail, and show the selected run's concrete next action only when it can be represented safely in the requested locale.

For approval summaries whose source artefact language differs from the selected presentation language, use a concise, authored locale-specific summary embedded in the same canonical Markdown artefact. The summary is a non-authorizing view, not a second decision source. `run-present` selects and hashes that exact summary from the current artefact; adapters pass the generated presentation through unchanged. Do not translate or rewrite text after the presentation binding is prepared.

The solution has four bounded parts:

1. Retain `interaction-presentation.js` as the owner for target, setup and operational status cards, adding localized wait/blocker/action presentation from existing canonical state.
2. Retain `run-presentation-render.js` as the owner for gate-approval artefact summaries, adding locale-section selection, complete coverage validation and summary digest binding.
3. Keep `gate-check.js`, task-target resolution, doctor/setup evaluation and `RUN_STATE.md` as the existing state and authority owners; pass only derived presentation details to renderers.
4. Keep Codex, Claude, Copilot and OpenCode as consumers of canonical Markdown; do not add host-local card templates or approval logic.

No new gate, approval value, CLI flag, public status-card field, persisted run-state field or host adapter is introduced.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design action |
|---|---|---|
| Target resolution and target authority | `create-agdf/lib/task-target-resolution.js`; `plugin/meta/contracts/task-target-resolution.md` | Consume the normalized resolution; do not infer a target from evidence or working directory. |
| Control/setup state | Existing doctor and control-setup evaluation | Preserve explicit authorize/cancel effects and their authority boundary. |
| Run/gate state, actor eligibility and allowed action | `create-agdf/lib/control-evaluation/gate-check.js`; selected `RUN_STATE.md`; `plugin/meta/contracts/gate-transition.md` | Continue to decide state and permission. Supply structured blocker/readiness details to the card renderer without changing approval decisions. |
| Target, setup and status card rendering | `create-agdf/lib/interaction-presentation.js` | Continue as the sole owner for these semantic blocks; resolve all labels through `plugin/meta/agdf-interaction-locales.json`. |
| Gate-approval artefact summary | `create-agdf/lib/control-state/run-presentation-render.js`; exact current artefact | Select source-language or embedded localized summary content and bind it with the current artefact and revision digests. |
| Approval persistence | `create-agdf/lib/control-state/run-presentation.js`; existing `run-approve` validation | Preserve exact `run_id`, gate, revision and `presentation_id` revalidation. |
| Host-visible rendering | Existing CLI/skill/host adapters and `plugin/meta/contracts/interaction.md` | Consume the exact canonical Markdown; never translate, rebuild or omit card blocks. |
| Generated package surfaces | `create-agdf/scripts/sync-package-assets.js`; runtime integrity checks | Propagate the canonical source and locale changes through the existing generation path. |

`RUN_STATE.md`, the normalized target result and gate policy remain authoritative. A localized summary is read from the same digest-bound artefact it summarizes. Summary prose does not change the artefact's decisions, criteria, actor, gate or authority.

## 3. Architecture Decisions

- SDD-001: Derive actor, wait and blocker presentation from canonical state rather than prose; rationale: `status`, `user_action_required`, `interaction_kind`, `missing_approval`, `blocking_condition` and structured readiness findings already belong to gate-check; trade-off: an unknown actor or missing blocker detail remains an explicit localized clarification instead of a guessed explanation.
- SDD-002: Render run-specific actions only through the existing locale catalogue or a safe localized clarification; rationale: a free-text action cannot be translated or actor-classified reliably by string matching; trade-off: an unregistered action may require the agent to clarify its canonical wording before the card can tell the user to act.
- SDD-003: Store locale-specific approval summaries inside the canonical gate artefact and select them before the approval binding is created; rationale: the artefact digest then binds both the decision source and its localized review aid without a sidecar, new CLI input or post-render rewrite; trade-off: the author must maintain a concise summary for each registered presentation locale, and readiness validation must reject missing or incomplete summaries when source and presentation languages differ.
- SDD-004: Keep the existing two rendering owners and pass their Markdown verbatim through all hosts; rationale: target/status projections and digest-bound artefact summaries have different inputs but already share the canonical locale and approval contracts; trade-off: native layout differences still require separate fresh-session evidence on each requested host.

## 4. State And Card Rendering

### 4.1 Actor and blocker precedence

Derive the visible actor without inspecting free-text action wording:

| Canonical state | Visible state | Rendered guidance |
|---|---|---|
| `status: blocked` with a canonical blocker | `Blockiert durch` | Localized cause, concrete unresolved decisions/criteria/evidence when supplied by gate-check, responsible actor when known, and the permitted next action. A code may be secondary detail only. |
| Ready `gate_approval` and `user_action_required: yes` | `Wartet auf` / `Du bist dran` | Localized decision name and the exact protocol value in the designated approval interaction. Do not label this state `Blockiert durch`. |
| `status: open`, user action not required, agent step available | `Ich arbeite weiter` | The immediate canonical next action, not the full allowed-action inventory. |
| `status: open`, no user response required and no active agent step | `Keine Antwort nötig` | The next expected state transition or a clear statement that the run is waiting for an external event. |
| Actor/action data missing or conflicting | Localized clarification | Identify the selected run and the exact fact that cannot be determined; do not substitute a generic QA/gate action. |

When there is no actual blocker, omit the `Blockiert durch` row rather than rendering `keine` beside a pending user decision. For a ready gate, derive the `Wartet auf` value from the canonical `missing_approval` and localized gate-title mapping. Exact approval protocol text remains unchanged and is emitted only by the existing approval interaction owner.

Gate-check continues to own `blocking_condition` and its structured readiness data. Extend its render-time `humanPresentation` projection with only the already-evaluated cause, unresolved items and responsible actor needed by `interaction-presentation.js`. Keep that projection non-enumerable and derived; do not add a public `status_card` field or persist a second blocker record. Map known blocker codes through the locale registry. If the evaluator has only an unknown code, show a localized explanation that details are unavailable plus the safe recovery; retain the code only as secondary diagnostic context.

### 4.2 Target and setup orientation

Keep `renderTaskTargetOrientation` and `renderControlSetupOrientation` in the current presentation module. Target cards consume only normalized `task-target-resolution` results and display the exact missing path, URL or run ID plus a copyable response. Setup cards consume only doctor/control-setup results and show the existing explicit authorize/cancel choices and effects. Neither card evaluates gates or implies approval.

### 4.3 Run-specific actions

Use the existing `operationalValues` and `primary.actions` locale catalogue for known canonical action values. Determine actor from the machine-readable status fields before rendering any action. If a run-specific free-text action has no safe localized catalogue entry:

- keep the raw canonical value in machine/audit data;
- do not replace the visible action with a generic QA or gate transition;
- render a localized clarification naming the selected run and whether a user response is actually required; and
- ask only for the missing action/actor fact if that fact changes what the user must do.

The implementation may add locale keys for the fixed clarification and actor labels. It must not translate arbitrary action prose by token matching or expose an unmarked foreign-language string as localized copy.

## 5. Digest-Bound Approval Summary

### 5.1 Summary source and shape

Add a Markdown convention within the existing gate artefact, with one block per registered locale when a localized summary is needed:

```markdown
## AGDF Approval Summary (de; source=en)

- Nutzerziel: …
- Umfang: …
- Abnahmekriterien:
  - AC-001: …
  - AC-002: …
- Vor PRD geklärt: …
- Für SD/TP offen: …
```

The heading is machine-selectable; the body is ordinary localized Markdown. `source` explicitly identifies the language of the artefact's substantive sections. For PRD summaries, list every canonical `criterion_id` exactly once and include concise localized user-goal, scope and decision context. Other gates use their existing reviewable content: UR problem/goal/success signals; SD design/ownership/decisions and criterion mapping; TP tasks/scenarios/evidence; QA decision/evidence/gaps. Keep UAT evidence values tied to their existing evidence references; do not translate or rename their identity.

These blocks live in the same artefact whose digest is presented. They are derivative editorial summaries; the canonical product criteria and design/evidence data remain in the main artefact sections. No acceptance register, summary sidecar or second authority is created.

### 5.2 Selection, validation and binding

1. Resolve the requested `presentation_language` through the existing locale registry, including its complete English fallback for unsupported valid tags.
2. Detect the substantive artefact language without scanning the localized summary blocks. Treat low-confidence language detection as unknown; never guess a source-language label.
3. If source and presentation language match, generate the summary from the source content using gate-specific parsers, but include all decision-bearing criterion IDs and do not truncate with an ellipsis.
4. If they differ, select exactly one `AGDF Approval Summary (<resolved-locale>; source=<tag>)` block from the current artefact. For PRD, compare the summary's IDs with the canonical PRD criterion IDs and require one-to-one coverage. Reject duplicates, omissions, unknown IDs, overlong fields or absent blocks; never silently omit material.
5. Render all headings and explanatory copy in the selected locale. Add a localized source-language note when different. Keep protocol literals, run/gate/revision IDs, file paths and hashes unchanged.
6. Compute `summary_digest` from the exact selected rendered summary and retain the existing artefact, revision and presentation digest binding. `run-approve` continues to revalidate the live canonical artefact and the exact `presentation_id`.

If a localized block is absent or invalid, do not prepare an approval binding. Return a localized non-authorizing recovery presentation that identifies the run/gate/revision, the missing locale summary, the exact artefact link and the agent's next step to complete it. Do not ask the user to approve an incomplete review card. After the summary is added to the current draft and the run revision is sealed, prepare a fresh `run-present`; never reuse an earlier presentation.

No model-generated text may be inserted after `run-present` creates its digest binding. Locale summaries must be authored alongside the current draft and reviewed for fidelity against every mapped criterion/decision. The code can enforce locale selection, criterion coverage, non-truncation and digest integrity; semantic translation fidelity remains a human-review/QA obligation.

## 6. Data Flow

```text
explicit target / selected RUN_STATE.md / current gate artefact
                 |
                 v
 existing target resolver, doctor and canonical gate-check
                 |
       +---------+----------------+
       |                          |
       v                          v
normalized target/setup/run   structured blocker and
state + exact next action     readiness details
       |                          |
       +-----------+--------------+
                   v
      interaction-presentation.js
       target / setup / status cards
                   |
                   +--------------------------+
                                              |
current gate artefact ------------------------+
       |                                      v
       +--> source or locale summary --> run-presentation-render.js
                                              |
                         artefact + summary + revision digests
                                              |
                                              v
                               run-present binding / exact Markdown
                                              |
                                              v
                       Codex / Claude / Copilot / OpenCode pass-through
                                              |
                                              v
                deliberate user input -> existing run-approve revalidation
```

No card renderer selects a run, resolves a target, changes a gate, or grants authority.

## 7. Integration Points

| Integration point | Design action | Compatibility boundary |
|---|---|---|
| `create-agdf/lib/control-evaluation/gate-check.js` | Supply structured readiness/blocker details and exact canonical actor/action state to the existing renderers. | Keep current machine status-card schema and gate decisions. |
| `create-agdf/lib/interaction-presentation.js` | Render `Wartet auf`, actual blocker details, actor state and safe action clarification; omit an empty blocker row. | Preserve semantic block names, `authorizes: false`, resolver ownership and locale fallback. |
| `create-agdf/lib/control-state/run-presentation-render.js` | Select and validate the locale-specific summary from the current artefact; bind the exact rendered summary. | No model rewrite after preparation; retain artifact/revision/summary digest and current run-present API. |
| `create-agdf/lib/control-state/run-presentation.js` and `run-approve` | Keep write-once presentation evidence and fresh same-run/gate/revision validation. | No approval value, persistence authority or stale-response behavior changes. |
| `plugin/meta/agdf-interaction-locales.json` | Add only the fixed labels/recovery copy that existing locale packs lack, for every registered locale. | Registry remains complete; unsupported tags use the complete English pack. |
| `plugin/meta/contracts/interaction.md` | Specify pass-through, wait-vs-blocked semantics and localized summary source/validation rules. | Contract continues to define one projection path and non-authorizing cards. |
| `create-agdf/scripts/*` and generated surfaces | Add the regression and package/runtime-integrity coverage defined by TP, then use existing synchronization. | Host adapters continue to consume canonical output; no host-specific templates. |

## 8. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Render exact unresolved target details and copyable choices from the normalized resolver result. | `task-target-resolution.js` result; `interaction-presentation.js`; locale registry | SDD-001, SDD-004 | Preserve existing reason codes and target authority; incomplete locale/reason mapping fails closed to clarification. |
| AC-002 | Render setup/cancel responses and consequences from the canonical doctor/control-setup result. | Existing doctor/control-setup evaluation; `renderControlSetupOrientation` | SDD-001, SDD-004 | Keep setup separate from gate approval; do not imply a run, UR or implementation permission. |
| AC-003 | Derive user, agent and no-response states from canonical state fields; show a localized named wait for a ready gate decision. | `gate-check.js` status card and selected `RUN_STATE.md`; `interaction-presentation.js` | SDD-001 | Hidden/legacy fields may be missing; render a safe localized clarification and preserve the existing machine projection. |
| AC-004 | Use the locale catalogue for known actions; otherwise state the selected run's action/actor cannot be safely rendered and ask only for the missing fact. | Canonical `next_allowed_action`, `user_action_required` and `internal_next_step`; locale registry | SDD-002 | Unknown free text remains in audit data but is not substituted with unrelated or unmarked prose. |
| AC-005 | Apply the selected locale to all human-facing card content and maintain exact approval authority and protocol literals. | Existing locale registry, canonical status/approval projections and current `run-present` binding | SDD-002, SDD-003, SDD-004 | Missing localized summary blocks fail closed; exact IDs, paths and approval literals remain unchanged. |
| AC-006 | Keep host consumers on exact canonical Markdown and verify each requested host in a fresh session for the required card states. | `interaction.md`; canonical renderer outputs; direct host observations | SDD-004 | Source-level parity cannot prove native rendering; each host remains a separate evidence item. |
| AC-007 | Show structured human-readable blocker cause/items/actor/action, and distinguish a user wait from a real blocker. | `gate-check.js` blocker/readiness findings and selected run state | SDD-001 | Unknown blocker details do not become a code-only explanation; preserve machine reason code for diagnostics. |
| AC-008 | Use a complete locale-specific summary embedded in the exact current artefact; verify criterion coverage and bind its rendered digest before asking for a decision. | Current gate artefact and its canonical criterion/decision sections; `run-presentation-render.js`; `run-approve` | SDD-003 | Embedded summaries can drift semantically; require owner/QA fidelity review and reject missing, duplicate or truncated coverage. |

## 9. Compatibility, Safety And Risks

- No migration, new run-state field, public status-card field, CLI flag, gate, approval value or host adapter.
- Existing English source-only artefacts continue to use their deterministic source-locale view. Cross-language approval requires a complete locale summary in the same artefact before `run-present` can bind it.
- Unsupported presentation locales resolve to the complete existing English locale pack; never mix selected-locale labels with fallback prose.
- Existing `authorizes: false`, exact approval values and `run-approve` revalidation remain unchanged.
- Main artefact sections remain the only decision authority. Localized summary blocks are checked against stable criterion IDs; manual semantic-fidelity review mitigates translation drift.
- Unknown free-text actions and blockers may lead to an explicit clarification. This is safer than displaying a plausible but wrong action or cause.
- The generated renderer/package can drift if assets are not synchronized. Runtime-integrity and package checks must use the existing generation order in TP.
- Repository tests cannot prove host-native rendering. AC-006 requires fresh direct sessions on Codex, Claude, Copilot and OpenCode.

## 10. Verification Design

The Task/Test Plan must include, at minimum:

- target-resolution reason codes and copyable examples in every registered locale;
- control setup authorize/cancel effects and the unchanged authority boundary;
- user-wait, agent-action, no-response and blocked status cards, including PRD readiness details and a non-`none` blocker;
- registered and unregistered run-specific actions, with no generic-action substitution;
- English and German approval summaries for an English PRD with more than two criteria and multiple resolved/open decisions; missing, duplicate, unknown and omitted IDs; summary digest and exact artefact/revision binding;
- stale revision, missing summary and unsupported valid locale recovery; all outputs remain non-authorizing;
- generation/runtime-integrity checks and fresh visible sessions on all four named hosts.

This is a verification design only; no tests were added or run while the SD remains unapproved.

## 11. Approval

This Solution Design is derived from approved PRD revision 8. Review this exact SD and approve only with:

`Approval: SD`

Task/Test Plan drafting is permitted after approval. Implementation remains blocked until both SD and TP are approved.
