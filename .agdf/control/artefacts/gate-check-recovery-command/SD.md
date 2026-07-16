# Solution Design: Consistent Gate Recovery and Approval Eligibility

Status: approved
Gate: SD
Gate approval: `Approval: SD` provided in session on 2026-07-16 after same-run and same-gate revalidation
Date: 2026-07-16
Derived from: `.agdf/control/artefacts/gate-check-recovery-command/PRD.md` revision 2

## 1. Design Outcome

Use one executable gate-readiness decision for run state, the existing capability preflight for native
eligibility, and one command-aware recovery/error boundary. A ready gate remains a `gate_approval`
while an incompatible host adapter is skipped in favor of exact text. No layer may infer native
eligibility from callability, human status text or the presence of a question tool.

## 2. Readiness And Capability Flow

### 2.1 Canonical gate readiness

Extract the semantic ready-gate decision currently embedded in `transitionDecisionForRunState()` into
one internal result consumed by transition and status-card projection. It confirms that the selected
run and current user gate are valid, the required current-gate artefact exists and is ready, and the
exact approval is the only missing gate condition. That projects `status: open` and
`interaction_kind: gate_approval`. Genuine ambiguity, missing artefact, stale revision or invalid state
remains blocked. This result owns readiness only, never host-adapter safety.

### 2.2 Native eligibility

Continue using `evaluateNativeApprovalCapability()` as the only native-eligibility evaluator.
Eligibility requires `waitSafety: deliberate_no_auto_resolution` plus
`approvalValueTransport: exact_option_value | separate_label_and_value`.

`decorated_label_only`, unknown, missing, conflicting or unsafe capability returns
`native_attempt_required: false` with its existing fail-closed reason. A report-only CLI projection
without verified current adapter capability also remains false; it must not turn the ready gate into
blocked.

### 2.3 Codex boundary

Keep canonical metadata truthful: Codex exposes `request_user_input`, but the observed contract
requires a visible `(Recommended)` suffix and has no separate canonical value. The metadata therefore
remains `approvalValueTransport: decorated_label_only` and `authorizationPath: exact_text`.

Generated Runtime Contract and gate-check instructions must state the derived operational rule:
for Codex gate approvals under this capability, do not invoke `request_user_input`; emit the approval
orientation once and request exact text. "One native attempt" applies only to an **eligible** ready
gate. Callability alone is never eligibility.

## 3. Command-Aware Recovery

Add one internal recovery formatter parameterized by the invoked target:

- `gate-check`: recommend only `--run <run_id>` or `AGDF_RUN_ID`;
- `doctor` and `delivery-map`: those options plus `--all-active` where supported;
- no target receives an unsupported recovery flag.

Run-selection policy and candidate calculation remain in their existing owners; the formatter only
renders a valid next command for the already-determined ambiguity.

## 4. Concise CLI Error Boundary

Catch expected argument and target/option validation failures at the existing top-level entrypoint,
write one actionable stderr message and exit non-zero. Preserve unexpected programming errors rather
than converting every exception into a friendly validation message. Illegal
`gate-check --all-active` must use this boundary without a Node.js stack trace.

## 5. Integrity Enforcement

Extend Runtime Integrity with these capability-to-instruction invariants:

- `decorated_label_only` requires `authorizationPath: exact_text`;
- gate-check instructions forbid adapter invocation for decorated-only transport;
- "first native attempt" wording is qualified by eligibility;
- exact `Approval: <Gate>` remains the only authorizing value;
- no AGDF option payload or locale label contains `Approval: <Gate> (Recommended)`.

Executable behavior remains owned by the readiness and capability evaluators; integrity checks guard
canonical-to-generated instruction parity and do not become a second runtime authority.

## 6. Files And Owners

| Owner | Design change |
|---|---|
| `create-agdf/bin/create-agdf.js` | Centralize semantic gate readiness, derive command-aware recovery and route expected CLI validation through the concise boundary. |
| `create-agdf/lib/interaction-presentation.js` | Reuse the existing capability preflight; no second evaluator. |
| `create-agdf/scripts/control-state-test.js` | Add readiness/blocker and command-recovery subprocess matrices. |
| `create-agdf/scripts/interaction-presentation-test.js` | Preserve decorated-only no-invocation coverage and add the prevented Codex call scenario. |
| `plugin/meta/agdf-plugin.definition.json` | Remain the canonical truthful surface-capability source. |
| `plugin/meta/agdf-runtime-contract.md` | Qualify native attempts by eligibility and make the Codex exact-text rule explicit. |
| `plugin/skills/gate-check/SKILL.md` | Mirror the same non-bypassable orchestration rule without creating new policy. |
| `plugin/scripts/check-runtime-integrity.mjs` | Enforce capability, authorization-path and generated-instruction parity. |

Generated plugin surfaces are synchronized through the existing generation path; generated copies
are never edited as primary sources.

## 7. Verification Design

1. Ambiguous `gate-check` recommends no `--all-active`; aggregate targets retain it.
2. Illegal `gate-check --all-active` exits non-zero with concise stderr and no stack trace.
3. Artefact-ready UR, PRD, SD, TP, QA and UAT fixtures report `open` plus `gate_approval`.
4. Genuine blockers remain blocked and never invoke a native adapter.
5. Decorated-only Codex capability reports native false with reason `decorated_only`, records zero
   native calls and produces exact-text fallback.
6. Eligible exact/separate-value fixtures still receive exactly one native attempt.
7. Fresh revalidated identity permits a new eligible attempt; it never makes a decorated adapter eligible.
8. Runtime Integrity fails on metadata/instruction drift or unqualified native-attempt wording.
9. Package smoke, control-state tests, interaction tests, Runtime Integrity, selected doctor and
   `git diff --check` pass.

## 8. Rejected Alternatives

- Accepting or stripping `(Recommended)` is rejected because decoration is not authorization.
- Invoking Codex and rejecting the result is rejected because it knowingly shows an invalid option.
- Treating native ineligibility as a blocked gate is rejected because presentation does not change readiness.
- Prompt-only readiness overrides are rejected because they duplicate executable state.
- Session-wide native disablement is rejected because eligibility belongs to the current interaction.

## 9. Risks

- Static metadata can become stale if Codex adds separate label/value transport; enabling native approval
  requires a versioned metadata update and new live evidence.
- Wording checks can become brittle; Runtime Integrity should assert narrow semantic anchors while
  behavior remains covered by executable tests.
- Centralizing readiness affects every user gate, so the complete fixture matrix is mandatory.

## 10. Required Next Step

Draft the compact Task/Test Plan and request exact `Approval: TP`. Implementation remains forbidden.
