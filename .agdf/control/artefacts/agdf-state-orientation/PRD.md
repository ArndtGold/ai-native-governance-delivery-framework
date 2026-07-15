# PRD: State Orientation Visibility in the Compact Run Status Card (Slice A)

Status: approved
Gate: PRD
Gate approval: exact `Approval: PRD` provided on 2026-07-15 after the PRD artefact was persisted and same-run, same-gate and revision revalidation
Date: 2026-07-15
Derived from: `.agdf/control/artefacts/agdf-state-orientation/UR.md`
Based on Brownfield Review: `.agdf/control/artefacts/agdf-state-orientation/BROWNFIELD_REVIEW.md`

## 1. Product Outcome

AGDF users following a multi-gate delivery run can self-orient from the compact human
Run Status Card alone: they see their position in the journey (breadcrumb), receive a
one-line transition narration after each gate advancement, and see stable human labels
instead of raw internal sub-states — without reading the full Runtime Contract and without
any change to approval authority, gate logic, interaction kinds, or the machine contract.

## 2. State Contract

### 2.1 Path-Derived Breadcrumb (H3)

A single-line path indicator is added to the compact human Run Status Card. It is derived
from the Mode/Slice Decision and the Approvals table — not a fixed template.

| Mode/Slice | Breadcrumb |
|---|---|
| structured_delivery / structured_slice | `UR ✓ · PRD ✓ · SD ● · TP ○ · QA ○ · UAT ○` |
| verified_change | `UR ✓ · Verified Change ● · OR ○` |
| quick_task | `UR ✓ · Quick Task ●` |
| block | `UR ✓ · Block ●` |

- `✓` fulfilled, `●` current, `○` open.
- Non-applicable gates are absent (no `–` placeholders, no thinned standard template).
- `verified_change` is one collapsed node, not a degraded standard route.
- The breadcrumb is a derived, non-authorising projection. It does not add a new gate
  model or override the Gate Transition Model.

### 2.2 Post-Acceptance Transition Micro-Narration (H4)

After each accepted gate approval, the agent emits exactly one status line:

```text
<what was satisfied> → <what the agent does next internally> → <user action: yes/no>
```

Example: "UR approved → Agent runs Brownfield Review next → no user action required now."

Temporal and structural separation from the Gate Transition Card:

- The Gate Transition Card is **pre-approval** (in the orientation envelope before the
  question); it is subjunctive ("if you approve, X happens") and contains the exact
  `Approval:` value.
- The narration is **post-acceptance** (after the gate advanced); it is indicative
  ("X was satisfied → agent now does Y → no input needed") and does not contain the
  `Approval:` value.
- Both never appear in the same assistant message.
- The narration does not repeat the decision's effect (the card's job) and uses its own
  template, not the card's three-question form.

### 2.3 Internal-Sub-State Collapse (H5)

The existing derived-projection principle ("human-facing Markdown presents the same
projection with readable labels; do not expose snake_case keys as the visible Run Status
Card") is applied explicitly to internal sub-states.

The **full** Run Status Card (machine/audit projection in `RUN_STATE.md` and CLI JSON)
keeps all fields unchanged. Only the **compact human card** collapses:

| Internal sub-state | Human label | Stays explicit |
|---|---|---|
| `verified_change`: missing/draft/invalid/eligible/executed | "Compact change under review" | `escalated` → "escalated to structured delivery" |
| `context_graph_required_action`: link/update/create/resolve_drift | "Project memory maintained" | `open_gap` → "Graph gap open" |
| `multi_scope_state`: clear/ambiguous | (not shown) | `blocked` → "Ambiguous scope, clarification needed" |

### 2.4 Machine Contract Preservation

- No new CLI-JSON field name is added. The `status_card` JSON output is unchanged.
- The breadcrumb, narration and collapse are human-projection-only, rendered by the
  presentation layer from existing machine fields.
- `doctor --json`, `gate-check --json` and `delivery-map --json` remain compatible.

## 3. Functional Requirements

- **PRD-01 Breadcrumb derivation:** The breadcrumb is derived from `mode_slice_decision`
  and the Approvals table in the selected `RUN_STATE.md`. No new persisted field is added.
- **PRD-02 Breadcrumb path types:** Four path types are supported: standard
  (`UR · PRD · SD · TP · QA · UAT`), `verified_change` (`UR · Verified Change · OR`),
  `quick_task` (`UR · Quick Task`), and `block` (`UR · Block`).
- **PRD-03 Breadcrumb absent gates:** Non-applicable gates do not appear as placeholders.
- **PRD-04 Narration template:** After each accepted approval, exactly one line is emitted
  using the template `<satisfied> → <agent-next> → <user-action>`.
- **PRD-05 Narration non-overlap:** The narration never appears in the same message as
  the Gate Transition Card, never contains the `Approval:` value, and never repeats the
  decision's effect.
- **PRD-06 Narration internal steps:** For internal steps (Brownfield Review, Brownfield
  Analysis), the narration states what the agent does next and that no user action is
  required, without exposing `next_user_gate: none` or asking for a second approval.
- **PRD-07 Collapse mapping:** Internal sub-states are mapped to stable human labels in
  the compact human card; `open_gap` and `escalated` remain explicit.
- **PRD-08 Full projection unchanged:** The machine/audit Run Status Card and CLI JSON
  retain all fields and snake_case keys unchanged.
- **PRD-09 Locale-pack additions:** Breadcrumb symbols and narration templates are added
  to `agdf-interaction-locales.json` for `en` and `de` within existing `lengthBudgets`.
  The exact `Approval:` value is never translated.
- **PRD-10 Propagation:** Generated surface copies (Codex/Claude/OpenCode skills) are
  propagated via `sync-package-assets.js` without forking content.
- **PRD-11 Non-overlapping file sections:** The SD must name the exact functions, keys
  and contract sections this slice owns versus `agdf-human-decision-surface`, to prevent
  concurrent-modification conflicts.

## 4. Acceptance Criteria

1. A compact human Run Status Card during a structured_delivery multi-gate run displays
   a single-line breadcrumb with fulfilled/current/open standard gates.
2. For a `verified_change` run, the breadcrumb shows `UR · Verified Change · OR` as one
   collapsed path, not a thinned standard template.
3. For a `quick_task` run, the breadcrumb shows `UR · Quick Task`.
4. Non-applicable gates are absent from the breadcrumb (no `–` or empty placeholders).
5. Each gate advancement is followed by exactly one narration line using the template
   `<satisfied> → <agent-next> → <user-action>`, in a message separate from the Gate
   Transition Card.
6. The narration line never contains the `Approval:` value and never repeats the Gate
   Transition Card's decision-effect content.
7. Internal sub-states (`verified_change` sub-states, `context_graph_required_action`,
   `multi_scope_state`) do not appear as raw keys in the compact human card; only stable
   human labels are shown.
8. `escalated` and `open_gap` remain explicitly visible in the compact human card.
9. The full `status_card` JSON output from `gate-check --json` and `delivery-map --json`
   is unchanged in field names and values; `doctor --json` remains green.
10. `en` and `de` locale packs contain breadcrumb and narration keys; the English fallback
    is used for any unsupported or incomplete pack.
11. Generated surface copies are propagated and `check-runtime-integrity.mjs` passes.
12. `control-state-test.js` includes regression assertions that fail if the compact human
    card exposes raw internal sub-state keys, if the breadcrumb shows a non-applicable
    gate placeholder, or if a narration duplicates the Gate Transition Card in the same
    message.
13. `doctor`, the directly affected test suites, Runtime Integrity and `git diff --check`
    pass without skipped or weakened assertions.

## 5. Non-Goals

- No change to approval authority, gate model, `interaction_kind`s, or the
  `verified_change` eligibility logic.
- No new user gate, interaction kind, or CLI-JSON field name.
- No change to the full machine/audit Run Status Card or CLI JSON output.
- No change to the Gate Transition Card composition, option ordering, or native-attempt
  boundary (owned by `agdf-human-decision-surface`).
- No on-demand "Why?" interaction, Gate Rationale Registry, or block-rationale guarantee
  (Slice B).
- No new locale pack beyond `en`/`de` (existing structure is extended, not replaced).
- No live host-rendering proof (presentation-only changes; host rendering remains
  intentionally unverified, consistent with prior UX slices).

## 6. Brownfield Fit

- Extend `plugin/meta/agdf-runtime-contract.md` with breadcrumb, narration and collapse
  contract clauses (new subsections in existing §Run Status Card and §Gate Transition Card).
- Extend `plugin/skills/gate-check/SKILL.md` with breadcrumb rendering, generalised
  narration guidance and collapse rules.
- Extend `plugin/meta/agdf-interaction-locales.json` with new keys under existing
  `statusCard` and `primary` sections.
- Extend `create-agdf/bin/create-agdf.js` `buildStatusCard()` to derive a `breadcrumb`
  field from existing `mode_slice_decision` + Approvals (human projection only; JSON
  can carry the derived breadcrumb for the presentation layer without changing existing
  field names).
- Extend `create-agdf/lib/interaction-presentation.js` with breadcrumb rendering,
  post-acceptance narration output and collapse mapping.
- Propagate via `create-agdf/scripts/sync-package-assets.js`.
- Extend `create-agdf/scripts/control-state-test.js` with regression assertions.
- Extend `plugin/scripts/check-runtime-integrity.mjs` with locale-key completeness
  checks for new breadcrumb and narration keys.
- Update `CG-RUN-STATUS-CARD` in `.agdf/control/CONTEXT_GRAPH.md` at OR closeout.

## 7. Non-Overlapping File Sections

| File | This slice owns | `agdf-human-decision-surface` owns |
|---|---|---|
| `agdf-runtime-contract.md` | Breadcrumb spec, post-acceptance narration contract, internal-state collapse rules (new subsections in §Run Status Card) | Two-card envelope ordering, semantic interaction payload, sequence preflight (§Gate Transition Card, §Human Decision Presentation) |
| `gate-check/SKILL.md` | Breadcrumb rendering, generalised narration guidance, collapse rules (new lines after existing card-rendering steps) | Approval-time card composition, native-attempt preflight, option ordering (existing steps 1-14) |
| `agdf-interaction-locales.json` | `breadcrumb` keys, `narration` templates, `internalStateLabels` (new keys under existing sections) | `statusCard`, `interaction`, `primary.afterApproval` keys (existing) |
| `interaction-presentation.js` | `buildBreadcrumb()`, `buildTransitionNarration()`, `collapseInternalState()` (new exported functions) | `buildApprovalOrientationSnapshot()`, `attachApprovalOrientationSnapshot()` (existing) |
| `create-agdf.js` | Breadcrumb derivation in `buildStatusCard()` (new derived field) | `postApprovalTransition()`, interaction-kind classification (existing) |

## 8. Risks

- **Sequencing:** If `agdf-human-decision-surface` UAT revise produces further changes to
  shared files, this slice's non-overlapping sections must be re-verified. SD must define
  a merge or rebase strategy.
- **Breadcrumb derivation complexity:** The `verified_change` path has no PRD/SD/TP; the
  derivation must correctly handle all four path types from Mode/Slice Decision + Approvals.
  SD must specify the derivation algorithm.
- **Narration locale budget:** New narration templates per gate transition must stay
  within `lengthBudgets.description` (160 chars). SD must verify all transitions fit.
- **Collapse completeness:** Every internal sub-state must have a human label or be
  explicitly hidden; missing mappings must fail closed. SD must enumerate the complete
  mapping table.

## 9. Required Next Step

Review this PRD and approve it only with:

`Approval: PRD`
