# UR: Improve State Orientation Visibility in the Compact Run Status Card (Slice A)

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-15
Date: 2026-07-15
Owner: agent

## 1. Problem

AGDF keeps chat output compact (Chat Output Discipline), but the underlying state model
(the Runtime Contract gate-transition table, `verified_change` sub-states, `context_graph`
required-action values and `multi_scope_state`) is largely opaque to the user. The compact
Run Status Card shows the *current* gate, but not the user's position in the overall journey,
not the rationale of a transition, and not a clean human projection of internal sub-state.

A user who consumes the card without reading the full Runtime Contract cannot answer
"why am I here?" or "where am I in this delivery?" without reconstructing the 17-row gate
transition table and the verified_change state graph mentally. This gap is the largest UX
challenge of the current surface: the card is compact, but the model it projects from is
complex, and nothing in between helps the user self-orient.

Three additive, non-behavioural improvements to the card-projection layer address this gap.
They do not change approval authority, gate logic, interaction kinds, or the machine
contract. They make the existing state model *visible* incrementally rather than requiring
upfront comprehension.

## 2. User Need

As an AGDF user following a multi-gate delivery run, I need the compact Run Status Card to
show where I am in the journey (not just the current gate), to narrate each transition in one
line so I build a mental model incrementally, and to hide agent-tracked internal sub-states
behind stable human labels (while keeping audit and CLI output unchanged), so that I can
self-orient without reading the full Runtime Contract.

## 3. Scope

This is Slice A of a two-slice improvement. Slice B (Gate Rationale Registry, on-demand
"Why?", block-rationale guarantee) is tracked separately.

### 3.1 H3 — Path-Derived Breadcrumb

Add a single-line path indicator to the compact human Run Status Card, derived from the
Mode/Slice Decision (not a fixed template):

| Mode/Slice | Breadcrumb |
|---|---|
| structured_delivery / structured_slice | `UR ✓ · PRD ✓ · SD ● · TP ○ · QA ○ · UAT ○` |
| verified_change | `UR ✓ · Verified Change ● · OR ○` |
| quick_task | `UR ✓ · Quick Task ●` |
| block | `UR ✓ · Block ●` |

- `✓` fulfilled, `●` current, `○` open.
- Non-applicable gates are **absent** (no `–` placeholders, no thinned standard template).
- `verified_change` is a first-class path with one collapsed node, not a degraded standard
  route.

### 3.2 H4 — Post-Acceptance Transition Micro-Narration

Generalise the existing TP transition pattern (gate-check: "Brownfield Analysis runs next, no
further user action required") to every gate advancement. After each accepted approval,
emit exactly one status line:

- Template: `<what was satisfied> → <what the agent does next internally> → <user action:
  yes/no>`
- Example: "UR approved → Agent runs Brownfield Review next → no user action required now."

Temporal and structural separation from the Gate Transition Card:

| | Gate Transition Card | Transition Micro-Narration |
|---|---|---|
| When | pre-approval (in the orientation envelope) | post-acceptance (after the gate advanced) |
| Mode | subjunctive: "if you approve, X happens" | indicative: "UR was satisfied → agent now does Y → no input needed" |
| Form | where am I / what does the decision do / what's next | what was satisfied / agent-next / user-action |
| Contains `Approval:` value? | yes (authorisation anchor) | no (only localised gate title as satisfied) |

Non-overlap rules:
1. The narration does not repeat the decision's effect (that is the card's job).
2. The narration uses its own template, not the card's three-question form.
3. Both never appear in the same assistant message (card is pre-question; narration is
   post-acceptance).

### 3.3 H5 — Apply the Existing Derived-Projection Principle to Internal Sub-States

H5 is not a new "hiding" mechanism. It applies the existing derived-projection principle
(Runtime Contract: human-facing Markdown presents the same projection with readable labels;
the projection is derived, non-persistent and non-authorising) to internal sub-states
specifically.

The **full** Run Status Card (machine/audit projection in `RUN_STATE.md` and CLI JSON) keeps
all fields unchanged. Only the **compact human card** collapses internal sub-states:

| Internal sub-state | Human label | Stays explicit |
|---|---|---|
| `verified_change`: missing/draft/invalid/eligible/executed | "Compact change under review" | `escalated` → "escalated to structured delivery" |
| `context_graph_required_action`: link/update/create/resolve_drift | "Project memory maintained" | `open_gap` → "Graph gap open" |
| `multi_scope_state`: clear/ambiguous | (not shown) | `blocked` → "Ambiguous scope, clarification needed" |

### 3.4 Files Affected

- `plugin/meta/agdf-runtime-contract.md` — card-spec additions: breadcrumb line as
  path-derived projection, post-acceptance narration contract with non-overlap rules,
  internal-sub-state collapse rules for the compact human card.
- `plugin/skills/gate-check/SKILL.md` (primary card renderer) — derive breadcrumb from
  Mode/Slice Decision, render breadcrumb, emit post-acceptance narration.
- Other card- or transition-emitting skills — align to the generalised narration and
  breadcrumb rule.
- `plugin/meta/agdf-interaction-locales.json` — breadcrumb symbols and narration templates
  across `en`/`de` packs (or English fallback).

## 4. Non-Goals

- Slice-B content: Gate Rationale Registry, on-demand "Why?", block-rationale guarantee —
  own UR / own slice.
- Any change to approval authority, the gate model, `interaction_kind`s, or the
  `verified_change` *eligibility logic* (only its *projection* in the card changes).
- New user gates, new interaction kinds, or new CLI-JSON field names (the machine contract
  stays stable; only the human Markdown projection changes).
- Any change to the **full** Run Status Card / machine projection — it keeps all fields
  unchanged.
- Any change to gate transition semantics, readiness classification, or the native-attempt
  boundary.

## 5. Acceptance Criteria

1. A compact human Run Status Card shown during a multi-gate run displays a single-line
   breadcrumb, path-derived from the Mode/Slice Decision, showing fulfilled/current/open
   milestones of the *selected* path; non-applicable gates are absent.
2. For a `verified_change` run, the breadcrumb shows `UR · Verified Change · OR` as one
   collapsed path, not a thinned standard template.
3. Each gate advancement is followed by exactly one post-acceptance narration line using the
   template `<satisfied> → <agent-next> → <user-action>`, in a message separate from the
   Gate Transition Card, that neither repeats the decision's effect nor contains the
   `Approval:` value.
4. Internal sub-states (`verified_change` sub-states, `context_graph_required_action`,
   `multi_scope_state`) do not appear as raw keys or sub-states in the compact human card;
   they appear only as stable human labels, except `open_gap` and `escalated` which remain
   explicit.
5. The **full** Run Status Card in `RUN_STATE.md` and CLI JSON (`gate-check --json`,
   `delivery-map --json`) retains all fields unchanged; `doctor --json` and
   `gate-check --json` remain green.
6. The compact card stays within its current compactness budget (breadcrumb = one line;
   narration = one line; no multi-row expansion from either addition).
7. `en`/`de` locale packs are updated or the English fallback is used; runtime rules remain
   English; the exact `Approval:` value is never translated.
8. Automated regression coverage fails if the compact human card exposes raw internal
   sub-state keys, if the breadcrumb shows a non-applicable gate placeholder, or if a
   post-acceptance narration duplicates the Gate Transition Card in the same message.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md` owns the Run Status Card spec, the Gate Transition
  Card contract, the derived-projection principle, the Gate Transition Model and the
  Mode/Slice Decision vocabulary.
- `plugin/skills/gate-check/SKILL.md` owns the primary card rendering and the native
  interaction orchestration.
- `plugin/meta/agdf-interaction-locales.json` owns the localised presentation labels.
- Other card-emitting skills (`qa-gate`, `release-or`, `brownfield-analysis`, etc.) emit
  status or transition output that must align to the generalised patterns.
- `create-agdf/scripts/control-state-test.js` (or equivalent) owns deterministic
  control-state regression coverage.

## 7. Resolved Design Decisions

The three design questions raised during UR drafting are resolved as specification, not left
open for Brownfield Review:

1. **Verified-Change breadcrumb shape** — decided: path-derived, not a fixed template.
   `verified_change` shows one collapsed node (`Verified Change`); non-applicable gates are
   absent, not shown as placeholders.
2. **Narration vs. Transition Card overlap** — decided: two temporally separated phases
   (pre-approval card vs. post-acceptance narration) with distinct templates, never in the
   same message; the narration never contains the `Approval:` value or repeats the
   decision's effect.
3. **Auditability under internal-sub-state collapse** — decided: H5 applies the existing
   derived-projection principle, not a new hiding mechanism; the full machine/audit
   projection keeps all fields unchanged; only the compact human card collapses;
   `open_gap` and `escalated` remain explicit.

## 8. Next Step

Run the post-UR Brownfield Review and record the smallest justified Mode/Slice Decision.
Brownfield Review is expected to confirm `structured_slice` against the existing Runtime
Contract, gate-check skill and locale-registry owners, and to verify that no approval,
gate, or authority change is touched.
