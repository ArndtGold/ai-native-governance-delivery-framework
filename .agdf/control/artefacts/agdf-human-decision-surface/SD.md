# SD: Canonical Human Decision Presentation Contract

Status: approved
Gate: SD
Revision: 3
Gate approval: exact `Approval: SD` provided on 2026-07-15 for revision 3 after same-run, same-gate and revision revalidation
Based on: `.agdf/control/artefacts/agdf-human-decision-surface/PRD.md`
Date: 2026-07-15
Owner: AGDF

## 1. Solution Overview

Extend the existing Gate Transition Card into one canonical Human Decision
Presentation Contract. Canonical AGDF control state remains the authority; the
presentation contract derives bounded primary, detail and machine views without
introducing another gate model or persistence path.

The primary view is driven by a semantic interaction payload. Locale packs map
stable semantic keys to presentation text. Surface adapters render only the
parts they support while preserving option order, outcome meaning and exact
approval validation.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design rule |
|---|---|---|
| Gate and transition semantics | `plugin/meta/agdf-runtime-contract.md` | Remains the sole normative authority. |
| Agent interaction procedure | `plugin/skills/gate-check/SKILL.md` | Builds and presents the bounded interaction after readiness checks. |
| Locale data | new canonical `plugin/meta/agdf-interaction-locales.json` | One data-driven registry; no per-surface translations. |
| Locale registry reference and surface capabilities | `plugin/meta/agdf-plugin.definition.json` | Declares fallback locale, locale-file owner and adapter capabilities. |
| Human CLI projection | `create-agdf/bin/create-agdf.js` | Uses the same semantic keys and locale registry; JSON remains unchanged. |
| Presentation composition | `create-agdf/lib/interaction-presentation.js` | Owns one semantic primary heading and the bounded status/transition blocks; no surface-specific card fork. |
| Generated surfaces | `create-agdf/scripts/sync-package-assets.js` | Copies canonical runtime, skill and locale data without forking content. |
| Integrity rules | `plugin/scripts/check-runtime-integrity.mjs` | Rejects missing keys, mixed locale data, translated approval tokens and surface drift. |

## 3. Semantic Interaction Payload

The presentation layer consumes a derived, non-authoritative payload:

```text
interaction_kind: clarification | gate_approval | blocked | status
presentation_locale: resolved supported language tag
fallback_locale: en
run_id: canonical selected run
revision_id: canonical selected run revision identity
title_key: semantic localized title key
title_source: gate_artefact | ur | objective | run_id
primary_heading: localized action-oriented title
primary_heading_level: 2
secondary_context: AGDF, canonical gate, run title and run_id
artefact_refs: UR | PRD | SD | TP with exists, status and canonical path
message_keys: readiness, approval_effect, remaining_boundary, next_action, blocker
options: ordered semantic outcomes with exact value where applicable
fallback_reason: none | adapter_unavailable | unsafe | non_interactive | not_rendered | not_applied
```

The payload is not persisted and cannot grant authority. It is derived only
after selected-run and gate evaluation.

### 3.1 Ordered orientation envelope composition

`interaction-presentation.js` builds one immutable envelope from the selected snapshot without
flattening its two card blocks:

```text
run_status_card:
  primary_heading
  selected_run
  readiness
  current_gate
  missing_exact_approval
  next_action
  quality_outlook
gate_transition_card:
  human_run_title
  run_id
  readiness_line
  artefact_links
  approval_effect
  next_transition
```

The orchestration output is an ordered event sequence:

```text
emit(run_status_card)
emit(gate_transition_card)
invoke(native_control) | emit(exact_text_fallback)
```

Both card events are serialized into one immediately preceding assistant message but remain
separately recognizable semantic blocks. No renderer or adapter may flatten them into one block.
`primary_heading` is always the first visible line of `run_status_card` and the complete envelope and
is rendered once as Markdown `##` or an equivalent accessible host heading. Neither card introduces
another primary heading.

A sequence preflight rejects invocation until the ordered envelope contains exactly one complete
`run_status_card` followed by exactly one complete `gate_transition_card`. It rejects missing,
merged, reversed, duplicated or button-first sequences and cards represented only in question text,
option descriptions, adapter payload or hidden context. The text fallback occupies the same third
position as the native control and never causes either card to be repeated.

## 4. Locale-Pack Contract

`agdf-interaction-locales.json` uses standard language tags and contains the
complete key set for each supported language. English is the deterministic
fallback. German and English are initial packs, not a closed language list.

Each language pack supplies:

- human-readable titles for `UR`, `PRD`, `SD`, `TP`, `QA` and `UAT`;
- readiness, approval-effect, boundary and next-action copy;
- labels and descriptions for `revise`, `decline` and explicit `cancel` where supported;
- clarification, blocked-state and fallback-reason copy;
- localized missing-artefact text for `UR`, `PRD`, `SD` and `TP`.

`Approval: <GateName>`, gate identifiers, run IDs, canonical paths and internal
outcomes are never translated. Locale resolution uses exact tag, then language
subtag, then English. One interaction resolves exactly one presentation locale.

## 5. Option Semantics And Ordering

The canonical visible order is:

1. exact `Approval: <GateName>` for ready gate approval;
2. `revise`;
3. `decline`.

`cancel` is distinct from `decline`. On hosts where dismissal is host-owned or
the native control supports only three explicit choices, dismissal maps to
`cancel` and is not simulated as a fourth option. On surfaces with an explicit
cancel action it follows the same stable semantic order after `decline`.

No option is preselected or auto-submitted. `Skip`/`Überspringen`, host free
text, position, label or recommendation styling never authorizes a transition.
Only an exact, revalidated approval value may do so.

Each semantic option has a stable outcome ID and, for approval, a separate canonical value. Display
labels may be localized or host-decorated but cannot become the authorization payload. An adapter
that cannot carry the canonical value separately declares `canonical_value_transport: false`; its
native control remains non-authorizing presentation and exact text owns approval input.

## 6. Artefact Links In Chat Cards

Every primary chat card includes a compact artefact row in the stable order
`UR · PRD · SD · TP`.

- Existing artefacts render as links with readable labels.
- Missing artefacts render localized `not yet created` text and no link.
- Paths come only from the selected canonical run's artefact chain; no path is guessed.
- Surface adapters render clickable links when supported and a readable path reference otherwise.
- Raw long paths are not used as the primary label.
- Machine JSON retains canonical paths and does not receive presentation-only Markdown.

## 7. Human-Readable Title Resolution

Resolve the visible title deterministically:

1. current gate artefact heading;
2. approved UR heading;
3. first non-empty Objective line from the selected run;
4. normalized `run_id` as the final fallback.

The canonical `run_id` remains visible as secondary context. Title resolution
never selects a run and never changes gate authority.

## 8. Surface Integration

### Codex

`request_user_input` receives the resolved label and description payload. The
three-choice host limit uses approve, revise and decline; closing/dismissing is
cancel. Auto-resolution is omitted. The adapter must not treat the returned display label as the
canonical approval value. If the host cannot provide separate canonical-value and deliberate-input
evidence, the result is non-authorizing and routes to exact text.

### Claude Code

`AskUserQuestion` receives the same semantic options when deliberate input is
safe. Hook-supplied answers, timeouts and auto-continue never become outcomes.

### OpenCode

The built-in `question` uses the same ordered outcomes when permission allows.
An explicit question denial selects exact-text fallback, not decline.

### Text fallback

The fallback renders the same localized title, artefact links, approval effect,
boundary and next action. It states the concrete fallback reason and accepts
only the exact approval value after revalidation.

### Native attempt result envelope

Every adapter attempt produces a transient, non-persisted result:

```text
attempt_id: stable only for this interaction snapshot
run_id
gate
revision_id
invoked: yes | no
presentation_outcome: presented | unavailable_before_invocation | attempted_not_applied | unsafe_to_wait
presentation_evidence: host_visible | user_confirmed | none
response_origin: deliberate_user_input | host_return_only | none
semantic_outcome: approve | revise | decline | cancel | no_response | invalid
canonical_value: exact Approval value | none
```

The attempt envelope is created only after the two ordered card emissions pass sequence preflight.
`attempt_id` therefore cannot be used as evidence that either card was visibly presented; visible
presentation remains a distinct evidence boundary.

`presented` requires trustworthy visible-host evidence. `approve` requires both
`response_origin: deliberate_user_input` and the exact canonical value after revalidation. A raw
tool return with `presentation_evidence: none` maps to `attempted_not_applied` and cannot authorize.
The user sees the presentation outcome before the one permitted fallback. Repository tests can prove
payload and mapping behavior but never `host_visible` rendering.

### CLI

Human output uses the same locale and readable semantics. JSON output keeps the
existing stable machine fields and diagnostic codes.

## 9. Accessibility And Host Boundaries

- AGDF-owned labels are concise and meaningful without color or position.
- Descriptions carry the consequence when a short host label cannot.
- Locale fixtures enforce configurable length budgets and non-empty accessible names.
- Long translations must preserve meaning; truncation cannot be the only distinction between outcomes.
- Host-owned chrome, focus behavior, keyboard handling and screen-reader implementation remain host responsibilities.
- AGDF does not claim to translate or control host-owned UI chrome.

## 10. Outcome Model

Keep these outcomes distinct:

```text
approve | revise | decline | cancel | no_response | timeout | empty | invalid | stale
```

Only `approve` with an exact revalidated `Approval: <GateName>` advances a gate.
`decline` is a deliberate rejection. `cancel`, `no_response`, `timeout`, `empty`,
`invalid` and `stale` leave authority unchanged and must not be collapsed into
decline.

## 11. Test And Evidence Strategy

- Schema and completeness tests for every locale pack.
- Exact-tag, language-subtag and English-fallback locale tests.
- Adapter-payload fixtures for Codex, Claude and OpenCode.
- Gate coverage for `UR`, `PRD`, `SD`, `TP`, `QA` and `UAT`.
- Internal-step, clarification, blocked and status-only fixtures that must not ask for approval.
- Stable option-order and no-preselection assertions.
- Distinct outcome tests for decline, cancel, timeout, empty and stale responses.
- Artefact-link tests for existing and missing `UR`, `PRD`, `SD` and `TP`.
- Title-resolution tests for all four fallback levels.
- Primary-heading tests for first-line `##`, action-title locale mapping, generic-title rejection and
  exactly-once composition across ready, blocked, clarification, status and internal-step states.
- Preflight tests proving native invocation and text fallback are both rejected when the primary
  heading invariant is absent, misplaced or duplicated.
- Ordered-event fixtures proving `run_status_card` precedes `gate_transition_card`, which precedes
  either `native_control_attempt` or `exact_text_fallback`, from one immutable snapshot.
- Negative sequence fixtures for merged, missing, reversed, duplicated, hidden-context and
  button-first variants; each must fail before adapter invocation.
- Fallback fixtures proving both cards are emitted once and are not repeated when the native attempt
  becomes `attempted_not_applied`.
- Negative tests proving labels, descriptions, position and host actions cannot authorize a gate.
- Adapter-result fixtures separating invocation, visible presentation and deliberate response.
- A host-return-only fixture maps to `attempted_not_applied`, persists nothing and emits one fallback.
- Decorated-label fixtures prove display text cannot substitute for a separate exact canonical value.
- Capability fixtures prove `canonical_value_transport: false` keeps native controls non-authorizing.
- Runtime integrity, generated-surface sync, control-state tests, package smoke and whitespace checks.

## 12. Constraints And Compatibility

- No removal or rename of existing JSON fields or approval formulas.
- No new approval store, custom UI renderer or automatic run selection.
- No combined-card compatibility mode, adapter-specific ordering or second envelope composer.
- Existing exact-text approval remains compatible.
- Existing Gate Transition Card semantics are extended, not replaced.
- The declined UAT from `native-gate-buttons-live` remains historical evidence and is not reopened.

## 13. Risks And Open Questions

- Some hosts may not expose explicit cancel separately from dismiss; adapters must preserve the semantic distinction without inventing UI.
- Link rendering differs by host; canonical paths and readable non-link fallback must remain available.
- Additional language packs require human-quality translations and review; structural support must not be marketed as translation coverage.
- Some hosts may return structured values without rendering a control or waiting for the user; absent
  visible and deliberate-input evidence must fail closed without claiming host failure details that
  are not observable.
- A host may require recommendation decoration in display labels; the adapter must either transport a
  separate canonical value or keep the native choice non-authorizing.

## 14. Next Step

Refresh the Task/Test Plan against approved SD revision 3. Implementation remains forbidden.
