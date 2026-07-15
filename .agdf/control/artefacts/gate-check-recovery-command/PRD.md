# PRD: Consistent Gate Recovery and Approval Readiness

Status: draft
Gate: PRD
Gate approval: pending
Date: 2026-07-15
Derived from: `.agdf/control/artefacts/gate-check-recovery-command/UR.md`

## 1. Product Outcome

AGDF users can move from ambiguous run selection to a ready gate decision without being directed
to an invalid command or losing the native approval opportunity because executable state,
canonical policy and agent orchestration disagree.

## 2. State Contract

### 2.1 Ambiguous run

- The interaction remains `blocked` or clarification-only.
- `native_attempt_required` is `false`.
- Candidate runs remain visible and deterministic.
- Recovery for `gate-check` names only `--run <run_id>` and `AGDF_RUN_ID`.
- Aggregate commands may additionally name `--all-active` when that flag is valid for the invoked target.

### 2.2 Selected, artefact-ready user gate

When exactly one run is selected, the current user gate is valid, its required durable artefact is
present and the only missing condition is the exact approval:

- `status` is `open`;
- `interaction_kind` is `gate_approval`;
- `native_attempt_required` is `true` before the first adapter attempt;
- the configured surface makes exactly one deliberate-input native attempt for that revalidated
  approval interaction;
- unavailable or unapplied native presentation falls back once to the unchanged exact approval;
- same-run, same-gate, artefact and revision revalidation remains mandatory before persistence.

The user-facing rule is: whenever a gate is decision-ready and its exact approval is missing,
AGDF attempts the configured native approval control once. Decision-ready means exactly one run is
selected, the required durable artefact exists, gate and revision are current, and no blocker other
than the missing exact approval remains.

### 2.3 Native presentation evidence

Native interaction has three separate evidence levels:

1. the adapter was invoked;
2. the host visibly presented a deliberate-input control to the user;
3. the user deliberately supplied a valid response through that visible control.

An adapter return value does not prove levels 2 or 3. If the host returns an answer while the user
reports that no control was visible and no choice was made, classify the attempt as
`attempted_not_applied`. Treat the returned value as non-authoritative `no_response` or `invalid`,
do not persist it, do not retry the native control automatically, and use the exact-text fallback.
A host-decorated value such as `Approval: PRD (Recommended)` is not the exact approval value.

The no-retry rule is scoped to one approval interaction and its immutable presentation snapshot.
It is not a session-wide native-control disable. A fresh explicit decision request after successful
same-run, same-gate, artefact and revision revalidation creates a new eligible interaction and must
receive one new first native attempt. A changed artefact revision always requires a new snapshot and
therefore a new first attempt. A prior `attempted_not_applied` outcome must not suppress later
eligible interactions automatically.

### 2.4 Genuine blocker

Ambiguous selection, missing durable artefacts, stale revision, mismatched gate or approval,
invalid control state and other readiness failures remain non-ready. They must not display an
approval control or be overridden from prompt text.

## 3. Functional Requirements

- **PRD-01 Command-aware recovery:** Recovery guidance is derived for the invoked target and never
  advertises an unsupported option.
- **PRD-02 Concise invalid-option failure:** Unsupported target/option combinations exit non-zero
  with one actionable error message and no raw Node.js stack trace.
- **PRD-03 Canonical readiness predicate:** One executable readiness decision distinguishes ready
  approval from genuine blocker without adding a second gate evaluator.
- **PRD-04 Interaction projection:** `status`, `interaction_kind` and
  `native_attempt_required` agree with that readiness decision.
- **PRD-05 Orchestration consistency:** Runtime Contract, gate-check skill and executable projection
  cannot drift silently; contradictory readiness evidence fails visibly and triggers re-evaluation.
- **PRD-06 Authority preservation:** Exact approvals, option ordering, post-response revalidation,
  run-selection precedence and persistence authority remain unchanged.
- **PRD-07 Evidence honesty:** Native eligibility or invocation success never becomes proof that the
  host visibly rendered a control.
- **PRD-08 Deliberate-input proof:** A native response is eligible for approval validation only when
  visible presentation and deliberate user input are both evidenced; a tool-returned value without
  that evidence remains non-authoritative.
- **PRD-09 Unapplied-attempt recovery:** A non-visible or otherwise unapplied attempt is reported as
  `attempted_not_applied`, triggers one exact-text fallback and never triggers an automatic native retry.
- **PRD-10 Interaction-scoped retry boundary:** The one-attempt limit applies only to the current
  revalidated interaction snapshot. A fresh explicit decision request or changed artefact revision,
  after successful revalidation, receives a new first native attempt; prior failure does not create
  a session-wide disable.

## 4. Acceptance Criteria

1. Multi-run `gate-check --json` returns deterministic candidates, no native attempt and no
   `--all-active` recovery suggestion.
2. Equivalent `doctor` and `delivery-map` aggregate guidance retains valid `--all-active` behavior.
3. `gate-check --all-active` exits non-zero with concise stderr and no stack trace.
4. A selected durable UR fixture with only `Approval: UR` missing reports the ready state contract.
5. Equivalent ready PRD, SD, TP, QA and UAT fixtures preserve the same readiness invariant.
6. Missing-artifact, ambiguous-run, stale-revision and mismatched-gate fixtures remain non-ready.
7. Focused tests fail when executable projection contradicts the canonical native-interaction rule.
8. Existing JSON field names, candidate-run shape, CLI flags and exact approval formulas remain compatible.
9. `doctor`, the directly affected test suites, Runtime Integrity and `git diff --check` pass without
   skipped or weakened assertions.
10. A fixture or controlled adapter probe that returns a value without evidenced visible presentation
    or deliberate input does not persist approval and produces `attempted_not_applied` plus exact-text fallback.
11. A host-decorated value such as `Approval: PRD (Recommended)` fails exact-approval validation.
12. A verified visible control with deliberate exact input remains eligible only after same-run,
    same-gate, durable-artefact and revision revalidation.
13. A second native invocation without a fresh explicit decision request or new revalidated snapshot
    is rejected as an automatic retry of the same interaction.
14. A changed PRD revision followed by successful revalidation reports
    `native_attempt_required: true` and receives one new first native attempt even when the previous
    revision ended as `attempted_not_applied`.
15. A fresh explicit request to reopen an unchanged decision, followed by successful revalidation,
    receives one new first attempt; absence of such a request does not trigger a retry.
16. No state or session flag permanently disables native approval controls solely because an earlier
    eligible interaction was unavailable, unapplied, cancelled or invalid.

## 5. Non-Goals

- No automatic run selection or aggregate `gate-check` mode.
- No new CLI flag or machine-output field.
- No change to gate order, approval formula or persistence authority.
- No redesign of native buttons, labels, localization, accessibility or host rendering.
- No claim that repository tests can prove host-owned visible rendering.
- No duplicate status renderer, readiness evaluator or interaction policy owner.

## 6. Brownfield Fit

- Extend `create-agdf/bin/create-agdf.js` for recovery, transition and interaction projection.
- Extend `create-agdf/scripts/control-state-test.js` for subprocess and state-matrix regressions.
- Preserve `plugin/meta/agdf-runtime-contract.md` and `plugin/skills/gate-check/SKILL.md` as canonical
  policy owners; extend existing integrity checks only where needed for deterministic parity proof.
- Reuse existing locale, candidate-run, exact-text fallback and post-response revalidation paths.

## 7. Risks

- Deriving readiness from a human status label would remain fragile; SD must identify the canonical
  semantic predicate.
- Overbroad top-level error handling could hide programming faults; SD must bound which expected CLI
  validation errors are rendered concisely.
- Prompt-only contradiction handling could become a second authority; tests must keep executable
  state and canonical contract aligned instead.
- Some hosts may return structured answers without making the control visibly available to the user;
  invocation output must therefore remain separate from presentation and deliberate-input evidence.
- Treating one failed attempt as a session-wide safety decision would silently violate the native-first
  contract for later revisions; retry identity must be bound to the revalidated interaction snapshot.

## 8. Required Next Step

Review this PRD and approve it only with:

`Approval: PRD`
