# SD: State Orientation Visibility Solution Design (Slice A)

Status: approved
Gate: SD
Gate approval: exact `Approval: SD` provided on 2026-07-15 after the SD artefact was persisted and same-run, same-gate and revision revalidation
Revision: 1
Derived from: `.agdf/control/artefacts/agdf-state-orientation/PRD.md`
Date: 2026-07-15
Owner: AGDF

## 1. Solution Overview

Extend the existing Run Status Card presentation layer with three additive, non-behavioural
projections: a path-derived breadcrumb, a post-acceptance transition narration, and an
internal-sub-state collapse. All three are derived from existing machine fields in
`buildStatusCard()` and rendered by `interaction-presentation.js`. No new gate model,
interaction kind, machine field name, or authority path is introduced.

```
buildStatusCard()  ──►  status_card JSON (unchanged field names)
       │                        │
       │                        ├─ mode_slice_decision ──► buildBreadcrumb() ──► breadcrumb line
       │                        ├─ current_gate + approvals ──► buildTransitionNarration() ──► narration line
       │                        └─ mode_slice_decision + context_graph + multi_scope ──► collapseInternalState() ──► human label
       │
       └─ human presentation layer renders breadcrumb + collapsed labels in compact card;
          narration emitted as separate post-acceptance message
```

## 2. Architecture And Ownership

| Concern | Canonical owner | Design rule |
|---|---|---|
| Breadcrumb derivation | `create-agdf/bin/create-agdf.js` `buildStatusCard()` | Derive `breadcrumb` array from `mode_slice_decision` + Approvals; add as derived field (not replacing any existing field) |
| Breadcrumb rendering | `create-agdf/lib/interaction-presentation.js` `buildBreadcrumb()` | New exported function; renders `✓`/`●`/`○` from breadcrumb array + locale `gateTitles` |
| Narration output | `create-agdf/lib/interaction-presentation.js` `buildTransitionNarration()` | New exported function; consumes `postApprovalTransition()` output + locale `narration` templates |
| Collapse mapping | `create-agdf/lib/interaction-presentation.js` `collapseInternalState()` | New exported function; maps raw sub-state to human label; `escalated`/`open_gap`/`blocked` stay explicit |
| Locale data | `plugin/meta/agdf-interaction-locales.json` | New keys under existing `statusCard` and `primary` sections; `en` and `de` |
| Runtime contract | `plugin/meta/agdf-runtime-contract.md` | New subsections in §Run Status Card: §Breadcrumb, §Post-Acceptance Narration, §Internal-State Collapse |
| Skill guidance | `plugin/skills/gate-check/SKILL.md` | New rendering guidance after existing card-rendering steps |
| Generated surfaces | `create-agdf/scripts/sync-package-assets.js` | Propagate without forking |
| Regression tests | `create-agdf/scripts/control-state-test.js` | New assertions for breadcrumb, narration, collapse |
| Integrity checks | `plugin/scripts/check-runtime-integrity.mjs` | New locale-key completeness checks |

## 3. Breadcrumb Derivation Algorithm (H3)

### 3.1 Input

- `mode_slice_decision` from `buildStatusCard()` (values: `undecided`, `quick_task`,
  `verified_change`, `structured_slice`, `structured_delivery`, `block`)
- Approvals table from `RUN_STATE.md` (gates with `approved` status)

### 3.2 Algorithm

```text
function buildBreadcrumb(modeSliceDecision, approvedGates):
  pathTemplates = {
    structured_delivery: ["UR", "PRD", "SD", "TP", "QA", "UAT"],
    structured_slice:    ["UR", "PRD", "SD", "TP", "QA", "UAT"],
    verified_change:     ["UR", "Verified Change", "OR"],
    quick_task:          ["UR", "Quick Task"],
    block:               ["UR", "Block"],
    undecided:           ["UR"]
  }
  gates = pathTemplates[modeSliceDecision] ?? pathTemplates.undecided
  return gates.map(gate => ({
    gate,
    status: approvedGates.includes(gate) ? "fulfilled"
          : gate === currentGate ? "current"
          : "open"
  }))
```

### 3.3 Rendering

- Symbols: `✓` fulfilled, `●` current, `○` open
- Separator: ` · ` (space-middot-space)
- Locale: gate labels from `gateTitles`; `Verified Change`, `Quick Task`, `Block`, `OR`
  are added to `gateTitles` in both `en` and `de`
- Single line; non-applicable gates absent

### 3.4 Derived JSON field

`buildStatusCard()` adds `breadcrumb: [{gate, status}]` to the status card object.
This is a new derived field for the presentation layer. Existing JSON consumers ignore
unknown fields (additive, not breaking). The SD confirms this is the only new field name
and it is derived (not authoritative).

## 4. Post-Acceptance Narration Output (H4)

### 4.1 Trigger

After `Approval: <GateName>` is accepted and persisted (post-revalidation), the agent
emits exactly one narration line. This is an orchestration output, not a persisted field.

### 4.2 Narration template

```text
<narration.gateSatisfied> {gateTitle} → <narration.agentNext> {action} → <narration.userAction> {yes/no}
```

Per-gate templates in locale pack (keyed by gate name):

| Gate | agentNext (en) | userAction |
|---|---|---|
| UR | "Agent runs Brownfield Review next" | "no user action required now" |
| PRD | "Agent drafts the Solution Design next" | "no user action required now" |
| SD | "Agent drafts the Task and Test Plan next" | "no user action required now" |
| TP | "Agent runs pre-implementation Brownfield Analysis next" | "no user action required now" |
| QA | "Agent prepares the user-acceptance decision" | "user acceptance decision next" |
| UAT | "Agent prepares the delivery report" | "no user action required now" |

### 4.3 Non-overlap enforcement

- `buildTransitionNarration()` is called only in the post-acceptance code path, never
  in the pre-approval envelope construction.
- The narration function does not receive and does not emit the `Approval:` value.
- The narration template is structurally distinct from the Gate Transition Card's
  three-question form (`where/what/next`).
- Regression test: `control-state-test.js` asserts that a narration fixture and a Gate
  Transition Card fixture are never in the same message.

## 5. Internal-State Collapse Mapping (H5)

### 5.1 Function

```text
function collapseInternalState(modeSliceDecision, contextGraphRequiredAction, multiScopeState):
  labels = {
    verified_change: {
      missing: "Compact change under review",
      draft: "Compact change under review",
      invalid: "Compact change under review",
      eligible: "Compact change under review",
      executed: "Compact change under review",
      escalated: "Escalated to structured delivery"     // stays explicit
    },
    context_graph: {
      none: null,                                         // not shown
      link: "Project memory maintained",
      update: "Project memory maintained",
      create: "Project memory maintained",
      resolve_drift: "Project memory maintained",
      open_gap: "Graph gap open"                          // stays explicit
    },
    multi_scope: {
      clear: null,                                         // not shown
      ambiguous: null,                                    // not shown
      blocked: "Ambiguous scope, clarification needed"    // stays explicit
    }
  }
  return labels (filtered: null = not shown, explicit values = shown)
```

### 5.2 Application

`collapseInternalState()` is called by the human presentation renderer only. The full
`status_card` JSON retains `mode_slice_decision`, `context_graph_required_action` and
`multi_scope_state` as raw values unchanged.

### 5.3 Locale labels

Collapse labels are added to `agdf-interaction-locales.json` under a new
`internalStateLabels` key in both `en` and `de`:

```json
"internalStateLabels": {
  "verifiedChange": "Compact change under review",
  "verifiedChangeEscalated": "Escalated to structured delivery",
  "contextGraphMaintained": "Project memory maintained",
  "contextGraphOpenGap": "Graph gap open",
  "multiScopeBlocked": "Ambiguous scope, clarification needed"
}
```

German equivalents:
```json
"internalStateLabels": {
  "verifiedChange": "Kompakte Änderung wird geprüft",
  "verifiedChangeEscalated": "Eskaliert zu structured delivery",
  "contextGraphMaintained": "Projektgedächtnis wird gepflegt",
  "contextGraphOpenGap": "Graph-Lücke offen",
  "multiScopeBlocked": "Mehrdeutiger Scope, Klärung nötig"
}
```

## 6. Locale-Pack Additions

### 6.1 New keys under `statusCard`

```json
"breadcrumb": "Path",
"breadcrumbFulfilled": "✓",
"breadcrumbCurrent": "●",
"breadcrumbOpen": "○",
"breadcrumbSeparator": " · "
```

### 6.2 New keys under `primary.narration`

```json
"narration": {
  "gateSatisfied": "{gate} approved",
  "agentNext": "→",
  "userAction": "→",
  "noAction": "no user action required now",
  "gates": {
    "UR": { "agentNext": "Agent runs Brownfield Review next" },
    "PRD": { "agentNext": "Agent drafts the Solution Design next" },
    "SD": { "agentNext": "Agent drafts the Task and Test Plan next" },
    "TP": { "agentNext": "Agent runs pre-implementation Brownfield Analysis next" },
    "QA": { "agentNext": "Agent prepares the user-acceptance decision", "userAction": "user acceptance decision next" },
    "UAT": { "agentNext": "Agent prepares the delivery report" }
  }
}
```

German equivalents provided in the `de` pack. All within `lengthBudgets` (label ≤ 40,
description ≤ 160, title ≤ 100).

### 6.3 New gateTitles entries

`Verified Change`, `Quick Task`, `Block`, `OR` added to `gateTitles` in both locales.

## 7. Implementation Plan

| Task | File | Change |
|---|---|---|
| SD-01 | `create-agdf/bin/create-agdf.js` | Add `breadcrumb` derivation in `buildStatusCard()` from `mode_slice_decision` + approvals |
| SD-02 | `create-agdf/lib/interaction-presentation.js` | Add `buildBreadcrumb()`, `buildTransitionNarration()`, `collapseInternalState()` exports |
| SD-03 | `plugin/meta/agdf-interaction-locales.json` | Add `breadcrumb`, `narration`, `internalStateLabels`, `gateTitles` entries for `en` and `de` |
| SD-04 | `plugin/meta/agdf-runtime-contract.md` | Add §Breadcrumb, §Post-Acceptance Narration, §Internal-State Collapse subsections under §Run Status Card |
| SD-05 | `plugin/skills/gate-check/SKILL.md` | Add breadcrumb rendering, generalised narration guidance, collapse rules after existing card steps |
| SD-06 | `create-agdf/scripts/sync-package-assets.js` | Propagate to generated surfaces (no content fork) |
| SD-07 | `create-agdf/scripts/control-state-test.js` | Add regression assertions: breadcrumb path types, narration non-overlap, collapse mapping, raw-key absence |
| SD-08 | `plugin/scripts/check-runtime-integrity.mjs` | Add locale-key completeness checks for new `breadcrumb`, `narration`, `internalStateLabels` keys |

## 8. Regression Test Plan

| Test | Asserts |
|---|---|
| BT-01 | `buildBreadcrumb()` with `structured_delivery` and 2 approved gates returns 6 entries with correct `✓`/`●`/`○` |
| BT-02 | `buildBreadcrumb()` with `verified_change` returns 3 entries: `UR`, `Verified Change`, `OR` |
| BT-03 | `buildBreadcrumb()` with `quick_task` returns 2 entries: `UR`, `Quick Task` |
| BT-04 | `buildBreadcrumb()` with `block` returns 2 entries: `UR`, `Block` |
| BT-05 | `buildTransitionNarration()` for `UR` returns one line with Brownfield Review as agent-next and "no user action" |
| BT-06 | Narration fixture and Gate Transition Card fixture are not in the same message |
| BT-07 | Narration fixture does not contain `Approval:` value |
| BT-08 | `collapseInternalState()` with `verified_change: eligible` returns "Compact change under review" |
| BT-09 | `collapseInternalState()` with `verified_change: escalated` returns "Escalated to structured delivery" |
| BT-10 | `collapseInternalState()` with `context_graph: open_gap` returns "Graph gap open" |
| BT-11 | `collapseInternalState()` with `multi_scope: clear` returns null (not shown) |
| BT-12 | Full `status_card` JSON retains `mode_slice_decision` as raw value after collapse |
| BT-13 | `check-runtime-integrity.mjs` fails if `en` or `de` pack is missing `breadcrumb`, `narration`, or `internalStateLabels` keys |
| BT-14 | `doctor --json` and `gate-check --json` remain compatible (no removed or renamed field) |

## 9. Non-Overlapping Implementation Boundary

| File | This slice modifies (new code) | `agdf-human-decision-surface` modifies |
|---|---|---|
| `agdf-runtime-contract.md` | New subsections §Breadcrumb, §Post-Acceptance Narration, §Internal-State Collapse (under §Run Status Card) | §Gate Transition Card, §Human Decision Presentation Contract |
| `gate-check/SKILL.md` | New lines after step 14: breadcrumb render, narration emit, collapse apply (new steps 15-17) | Steps 1-14 (existing envelope + native-attempt procedure) |
| `agdf-interaction-locales.json` | `statusCard.breadcrumb*`, `primary.narration*`, `internalStateLabels*`, `gateTitles` additions | `statusCard.*` existing keys, `interaction.*`, `primary.afterApproval` |
| `interaction-presentation.js` | `buildBreadcrumb()`, `buildTransitionNarration()`, `collapseInternalState()` (new exports) | `buildApprovalOrientationSnapshot()`, `attachApprovalOrientationSnapshot()` (existing) |
| `create-agdf.js` | `buildStatusCard()` adds `breadcrumb` derived field | `buildStatusCard()` existing fields, `postApprovalTransition()` |

Sequencing rule: if `agdf-human-decision-surface` produces further changes to shared files
during its UAT revise, this slice re-validates its non-overlapping sections before CD+Tests.

## 10. Risks

- **Breadcrumb derivation for `undecided`:** returns `["UR"]` only; this is correct because
  the path is not yet chosen. Test BT for `undecided` confirms single-entry breadcrumb.
- **Narration for internal steps (Brownfield Review, Brownfield Analysis):** the narration
  is emitted after the internal step completes, not after a user approval. The
  `buildTransitionNarration()` function handles both user-gate and internal-step triggers.
- **Locale budget for narration:** the `agentNext` strings must fit within
  `lengthBudgets.description` (160). Verified: longest is "Agent runs pre-implementation
  Brownfield Analysis next" (51 chars) — well within budget.
- **New `breadcrumb` JSON field:** additive; existing consumers ignore unknown fields.
  If any consumer strictly validates the schema, it must be updated. SD confirms no
  existing consumer does strict schema validation on `status_card`.

## 11. Required Next Step

Review this SD and approve it only with:

`Approval: SD`
