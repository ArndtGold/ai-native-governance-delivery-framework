# Solution Design: Complete Approval Orientation

Status: approved
Gate: SD
Based on: `.agdf/control/artefacts/approval-orientation-completeness/PRD.md`
Date: 2026-07-15
Owner: AGDF
Gate approval: `Approval: SD` selected deliberately through the native approval control on 2026-07-15 after same-run/same-gate revalidation.

## 1. Design Decision

Add one pure approval-orientation composition to the existing interaction
presentation module. It receives the already evaluated status card and human
presentation values and returns one immutable, non-authorizing snapshot with a
fixed visible sequence:

1. compact Run Status Card;
2. Gate Transition Card;
3. approval interaction descriptor.

Canonical gate evaluation remains the only readiness and authority owner. The
new composition does not select runs, decide gates, persist state or validate
approvals.

## 2. Canonical Data Flow

```text
selected RUN_STATE.md
        |
        v
canonical gate evaluation + durable artefact readiness
        |
        v
existing statusCard + existing humanPresentation + locale pack
        |
        v
buildApprovalOrientationSnapshot(...)
        |
        +--> compactStatusCard
        +--> gateTransitionCard
        +--> interaction descriptor
        |
        v
native attempt or exact-text fallback
        |
        v
fresh canonical same-run/same-gate revalidation before persistence
```

The snapshot records `run_id`, `revision_id`, `current_gate` and
`presentation_language` for traceability, but `authorizes` is always `false`.
The post-response evaluator compares the live canonical state, not the
presentation snapshot, before accepting input.

## 3. Component Design

### 3.1 Shared presentation helper

Extend `create-agdf/lib/interaction-presentation.js` with a pure
`buildApprovalOrientationSnapshot` function.

Inputs:

- evaluated canonical `statusCard`;
- existing `humanPresentation` values;
- canonical interaction locale registry and resolved locale;
- current `revision_id`;
- exact approval and post-approval transition values.

Output:

- immutable snapshot;
- `sequence` fixed to `run_status_card`, `gate_transition_card`,
  `approval_interaction`;
- compact status values: selected run/title, readiness status, current gate,
  missing exact approval, one next action and quality outlook;
- transition values: localized gate title, artefact refs, readiness line,
  exact approval effect and next-transition copy;
- `authorizes: false`.

The helper returns `null` unless all ready-gate conditions are true: one
selected run, recognized user gate, durable current artefact, exact missing
approval for that gate and non-blocked canonical status.

### 3.2 Existing status-card owner

`create-agdf/bin/create-agdf.js` continues to build the complete operational
status card. It supplies only the six PRD-approved fields to the approval
snapshot; complete evidence, diagnostic fields and allowed/forbidden lists
remain outside the approval-time compact view.

The snapshot is attached as non-enumerable human-presentation data for current
CLI compatibility. Existing JSON output is unchanged unless a later explicit
contract adds an additive machine field.

### 3.3 Existing transition-card owner

The Runtime Contract and `gate-check` skill render the snapshot in exact order.
The Gate Transition Card retains human gate/run title, `UR · PRD · SD · TP`
links, approval effect and next transition. It no longer replaces the Run
Status Card at approval time.

### 3.4 Locale ownership

Reuse `plugin/meta/agdf-interaction-locales.json`:

- compact status labels come from existing `statusCard` keys;
- readiness, approval and next-transition copy comes from existing
  `interaction` and `primary` keys;
- add locale keys only if implementation proves an approved concept cannot be
  expressed by existing data;
- incomplete locale packs continue to fail validation and fall back only at
  locale selection boundaries already defined by the registry.

No copied English/German template is permitted in the helper or agent skill.

## 4. Rendering Contract

For a ready gate, agent-facing instructions render two separate blocks before
one question:

### Compact Run Status Card

- localized card heading;
- selected human run title with `run_id`;
- localized readiness status;
- localized current gate title with exact gate identifier;
- exact missing approval;
- one localized next action;
- localized quality outlook.

### Gate Transition Card

- localized gate and run title plus artefact links;
- ready-for-decision line;
- exact approval effect and remaining boundary;
- immediate next action and next actual user decision.

The cards may share run and gate identity because this anchors both views, but
must not duplicate action inventories, evidence, diagnostic details or the
native question.

## 5. Interaction And Authority

- Native-first behavior and one-attempt fallback remain unchanged.
- Both cards render once before the native attempt.
- If the attempt is unavailable or not applied, exact-text fallback follows
  without repeating the cards.
- `revise`, `decline`, `cancel`, `no_response`, `timeout`, `empty`, `invalid`
  and `stale` remain distinct non-approval outcomes.
- Approval persistence still requires a fresh canonical evaluation matching
  the expected `run_id`, gate, revision boundary and durable artefact.
- A snapshot, card, button, option position or host permission never grants
  AGDF authority.

## 6. Non-Ready And Error Behavior

- ambiguous run: no snapshot and no approval interaction;
- blocked state: existing blocker presentation only;
- missing current artefact: no snapshot and no approval interaction;
- mismatched missing approval/current gate: fail closed;
- stale revision after input: return `stale`, persist nothing;
- unavailable native adapter: render cards once, report the bounded attempt
  outcome, then use the exact-text fallback.

## 7. Source Changes

- `create-agdf/lib/interaction-presentation.js`
- `create-agdf/bin/create-agdf.js`
- `create-agdf/scripts/interaction-presentation-test.js`
- `create-agdf/scripts/control-state-test.js`
- `plugin/meta/agdf-runtime-contract.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/meta/agdf-interaction-locales.json` only if reuse is insufficient
- `plugin/scripts/check-runtime-integrity.mjs`
- generated plugin surfaces via `create-agdf/scripts/sync-package-assets.js`

## 8. Verification Design

- pure helper tests for all six gates and exact fixed sequence;
- immutability and `authorizes: false` assertions;
- ready/non-ready fixtures for blocked, ambiguous, missing artefact and
  mismatched gate/approval state;
- German, English, language-subtag and incomplete-locale behavior;
- native, unavailable, revise, decline, cancel/no-response and stale outcomes;
- Runtime Integrity negative fixture for removal, reversal or one-card-only
  approval guidance;
- complete control-state, interaction-presentation, routing, smoke and Pages
  checks; generated assets synchronized before integrity verification.

## 9. Compatibility And Migration

- No data migration or persisted-state change.
- Existing JSON report structure remains unchanged.
- Existing status-card and transition-card concepts remain individually
  available outside approval-time composition.
- Existing exact-text approvals remain valid after live revalidation.
- Historical UAT records remain unchanged.

## 10. Risks And Mitigations

- **Duplicate copy:** fixed field ownership and sequence tests.
- **Dashboard overload:** six-field compact status allowlist; diagnostics stay
  in detail/machine views.
- **State drift:** one immutable snapshot plus fresh canonical persistence-time
  revalidation.
- **Parallel owner:** one helper in the existing interaction module; no host
  renderer or state store.
- **Instruction/runtime drift:** canonical contract, generated sync and
  integrity-negative coverage.

## 11. Approval

Exact `Approval: SD` was selected deliberately through the native approval
control on 2026-07-15 after same-run/same-gate revalidation. Task/Test Plan
creation is allowed; implementation remains forbidden.
