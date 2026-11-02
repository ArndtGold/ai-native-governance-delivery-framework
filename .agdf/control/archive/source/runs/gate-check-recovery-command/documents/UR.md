# UR: Make Gate Recovery and Approval Readiness Consistent

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided in session on 2026-07-15
Date: 2026-07-15
Owner: agent

## 1. Problem

When more than one AGDF run is active, `gate-check` returns a structured
`AGDF_ACTIVE_RUN_AMBIGUOUS` blocker but recommends `--all-active` as one recovery option.
The same CLI rejects `gate-check --all-active` because that option is supported only by
`doctor` and `delivery-map`, and the rejected invocation currently exposes a raw Node.js
stack trace. The recovery guidance therefore directs the user into another failure.

After the user explicitly selects a run and the current gate's durable artefact exists, the same
projection classifies a missing exact approval as `status: blocked`, `interaction_kind: blocked`
and `native_attempt_required: false`. The host-native approval control is therefore skipped before
invocation even though the canonical interaction contract defines this state as a ready
`gate_approval`. The user is left with plain approval text and no explanation that the native path
was suppressed by an internal classification contradiction.

The agent orchestration then treated that executable projection as decisive and requested exact
text without detecting its conflict with the canonical Runtime Contract. This was an execution
error enabled by a missing cross-layer consistency guard: CLI reports are validators rather than a
second authority, but the current workflow neither prevents the contradictory projection nor makes
the contradiction fail visibly before the native-attempt decision.

## 2. User Need

As an AGDF user moving from ambiguous run selection to a deliberate gate decision, I need recovery
guidance and approval readiness to represent the same canonical state consistently, so that every
suggested command is valid and every ready approval reaches the configured native interaction path.

## 3. Scope

- Make ambiguous-run recovery guidance command-specific.
- For `gate-check`, recommend explicit selection through `--run <run_id>` or `AGDF_RUN_ID` and
  do not recommend `--all-active`.
- Preserve valid `--all-active` guidance for commands that support aggregate evaluation.
- Present invalid option combinations as concise CLI errors without a raw Node.js stack trace.
- When exactly one run is selected, the current user-gate artefact is durable and the only missing
  condition is `Approval: <GateName>`, classify the interaction as `gate_approval` with
  `native_attempt_required: true`.
- Keep ambiguous selection, missing durable artefacts, stale gates and other genuine readiness
  failures classified as `blocked` with no approval control.
- Make the Runtime Contract, executable gate projection and gate-check orchestration agree on the
  same readiness invariant; contradictory readiness signals must fail visibly and must not silently
  suppress or fabricate a native attempt.
- Add deterministic regression coverage for command recovery and the ready-versus-blocked
  interaction boundary.

## 4. Non-Goals

- No change to run-selection precedence or gate authority.
- No automatic run selection.
- No addition, removal or semantic expansion of CLI flags.
- No change to JSON field names or approval formulas.
- No redesign of native gate buttons, labels, ordering, localization or host rendering.
- No claim that a host rendered a button merely because the native attempt became eligible.

## 5. Acceptance Criteria

1. Ambiguous `gate-check` output recommends only `--run <run_id>` and `AGDF_RUN_ID` as recovery paths.
2. `doctor` and `delivery-map` may continue to recommend `--all-active` where it is valid.
3. `gate-check --all-active` exits non-zero with a concise actionable error and no raw stack trace.
4. Existing machine-readable ambiguous-run diagnostics and candidate-run evidence remain compatible.
5. Automated tests fail if an unsupported command again recommends `--all-active` or emits the raw stacktrace path.
6. The directly affected control-state tests and `doctor` verification pass without skipped or weakened assertions.
7. A selected run with a durable current-gate artefact and only the exact approval missing reports
   `status: open`, `interaction_kind: gate_approval` and `native_attempt_required: true`.
8. Ambiguous selection, missing artefacts and stale or mismatched gate state report
   `interaction_kind: blocked` and `native_attempt_required: false`.
9. The gate-check skill performs exactly one configured native attempt for the ready fixture and
   retains the existing exact-text fallback and post-response revalidation authority boundary.
10. Runtime-integrity or equivalent deterministic coverage fails when the canonical interaction
    contract, executable projection and gate-check orchestration disagree about ready versus blocked.
11. An agent encountering contradictory readiness evidence reports the conflict explicitly and
    re-evaluates the selected run, gate and durable artefact; it neither silently skips the required
    native attempt nor overrides a genuine blocker by inventing one.

## 6. Existing Source Of Truth

- `create-agdf/bin/create-agdf.js` owns CLI recovery text and option validation.
- `create-agdf/scripts/control-state-test.js` owns deterministic control-state regression coverage.
- `plugin/meta/agdf-runtime-contract.md` owns run-selection and ambiguity policy.
- `plugin/skills/gate-check/SKILL.md` owns the native-attempt orchestration boundary.
- `plugin/scripts/check-runtime-integrity.mjs` owns cross-surface contract-drift detection.

## 7. Risks And Open Questions

- Brownfield Review must confirm whether one shared recovery helper can remain the single owner while
  producing command-specific text.
- Brownfield Review must determine whether concise top-level CLI error handling already exists and can
  be reused instead of introducing a parallel error renderer.
- Brownfield Review must confirm the smallest single-owner correction for the transition status and
  status-card interaction projection instead of adding a second readiness evaluator.
- Cross-layer validation must detect drift without teaching the agent to bypass executable blockers
  or creating a second independent gate authority in prompt text.

## 8. Next Step

Run the post-UR Brownfield Review and record the smallest justified Mode/Slice Decision.
