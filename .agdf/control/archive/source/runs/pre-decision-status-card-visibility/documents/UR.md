# UR: Pre-Decision Status Card Visibility

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-09-01 via native gate question after same-run, same-gate, revision and durable-artefact revalidation.
Revision: 1
Date: 2026-09-01
Owner: agent

## 1. Problem

At a ready user gate, the interaction contract deliberately replaces the full operational Run Status
Card with the compact five-field approval projection plus the Gate Transition Card. Over a complete
run driven gate-to-gate in one session, the user therefore almost never sees the full status card:
the delivery path breadcrumb, the currently forbidden actions, the blocking condition and the quality
outlook are all absent exactly at the moments where the user is asked to decide.

Observed in the `doctor-presentation-identity-parity` run on 2026-09-01: the full AGDF-Statuskarte
appeared once in the entire run; the user had to ask why and request it manually. The user's stated
expectation: before a gate decision is requested, the status card must be offered to the user.

## 2. Goal

Every approval request is preceded by, or carries an explicit visible offer of, the full canonical
operational Run Status Card, so the user decides with complete authority context (path, allowed,
forbidden, blocker, quality outlook) — without weakening exactly-once card semantics, exact-approval
authority or the non-authorizing nature of all presentation blocks.

## 3. Scope

After the required approvals, deliver the smallest safe change that:

1. amends the interaction contract's approval-time sequence so the full operational status card is
   part of, or explicitly offered immediately before, the ready-gate presentation (design decides:
   always-render vs. compact-plus-visible-offer);
2. updates the code-owned approval envelope rendering (`gate-check --approval-envelope` and the
   `approval_presentation` JSON consumers) to produce that sequence deterministically;
3. keeps every block exactly-once per decision, localized, immutable and `authorizes: false`;
4. updates snapshot/sequence validators and locale copy only as far as the chosen design requires,
   reusing existing keys where possible;
5. covers the new sequence with tests (envelope rendering, validator acceptance, exactly-once
   assertions) and propagates generated surfaces via the canonical sync owner;
6. updates the gate-check skill text so skill guidance and code-owned rendering state the same
   sequence (single source: the runtime contract).

## 4. Non-Goals

- changing gates, gate order, exact approval values or any authorization semantics;
- changing the status card's field set, layout or ownership;
- changing status-only reporting (the full card already owns that surface);
- host-native UI work beyond the existing envelope/JSON projections;
- commit, push, PR, release or publication as part of this run.

## 5. Acceptance Signals

1. A ready-gate presentation always contains the full operational status card or a visible,
   localized offer of it before the decision is requested.
2. Exactly-once semantics hold: no block is rendered twice within one decision presentation.
3. All presentation blocks remain non-authorizing; approval still requires the exact text or the
   validated native option value.
4. Sequence validators accept the new shape and reject the old silent replacement only as designed.
5. Contract, skill text and code-owned rendering describe the identical sequence.
6. Regression: status-only responses and all existing card tests remain unchanged in behavior.

## 6. Existing Source Of Truth

- `plugin/meta/contracts/interaction.md` — approval sequence owner (`run_status_card`,
  `gate_transition_card`, `approval_interaction`);
- `create-agdf/lib/interaction-presentation.js` — `APPROVAL_SEQUENCE`, snapshot build/validate/render;
- `create-agdf/lib/control-evaluation/gate-check.js` — `status_presentation`, `approval_presentation`,
  `printApprovalEnvelope`;
- `plugin/skills/gate-check/SKILL.md` — approval-time rendering guidance;
- locale registry `agdf-interaction-locales.json` — existing copy and length budgets.

## 7. Risks And Unknowns

- The compact projection exists to avoid chat noise; always rendering the full card may reintroduce
  the ceremony the compact design removed. Brownfield Review must weigh always-render against a
  visible offer (e.g. one localized line linking/naming `--status-card`).
- `APPROVAL_SEQUENCE` and `validateApprovalOrientationSnapshot` pin the exact three-block shape;
  changing the sequence touches validators, envelope tests and generated mirrors.
- The compact block is itself named `run_status_card`; naming/semantics must not end up with two
  blocks claiming the same semantic id.

## 8. Next Step

Perform Brownfield Review and select the smallest safe delivery path before drafting later artefacts
or implementation. Approve only with:

`Approval: UR`
