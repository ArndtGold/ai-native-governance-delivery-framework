---
name: qa-gate
description: "Use this skill for this scope: sole final Quality Readiness decision. Boundary: only instance for `pass | revise | block`. Automatic discovery alone does not activate AGDF."
---

# qa-gate

## Purpose
Make the formal QA gate decision.

This skill is the only final QA decision point for `pass | revise | block`.

It answers:

- whether `QA pass` is allowed
- whether the implementation must be revised
- whether a hard blocker remains
- whether relevant TP tasks are sufficiently verified
- whether P0/P1 tasks are complete
- whether Brownfield fit is sufficient
- whether solution integrity is sufficient
- whether blockers, critical risks, or missing evidence remain

## Runtime Contract
After `skill_continuation`, use these focused runtime-contract modules:

- `../../meta/contracts/quality.md`
- `../../meta/contracts/context-graph.md`
- `../../meta/contracts/gate-transition.md`

`instruction_only`: first load `../../meta/contracts/task-target-resolution.md` and `../../meta/contracts/interaction.md`.

<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->
## Request Activation

- `owner`: `request_activation_contract`
- `path`: `plugin/meta/contracts/request-activation.md`
- `policy_version`: `1`
- `guard_fingerprint`: `sha256:50833bf7396f65e57ffd73bb9200e6dfd5dc016440e6d7186fbcd8a6e07dd2ab`

Decide effect from loaded instructions before AGDF action/output.

Abstain silently, call no AGDF owner, for assessment/explanation/comparison/recommendation/review/diagnosis/advice; hypothetical/example/error/code/quoted/negated delivery language; AGDF as subject; or a read-only constraint absent other delivery. Ambiguity is read-only: answer or ask one neutral question.

Activate only for actual delivery/mutation, binding gate artefact, explicit AGDF/control-lifecycle operation or unambiguous active-run action; delivery wins mixed intent.

Invocation proof: explicit user text/trusted ephemeral action, not discovery/selection, skill load, hooks, cwd, repo/control or prior runs.

Then choose one catalog route. Non-authorizing; downstream checks remain.
<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->

## Executable Dispatch

First invoke the supplied dispatcher with `--skill qa-gate`, current language and working directory, and only
explicit target/run evidence. On `terminal: true`, return presentation verbatim; only if absent return recovery,
then stop. On `skill_continuation`, use only its target/control. If unavailable, report `dispatcher_unavailable`;
do not search for another runtime. Dispatch never authorizes.

QA-specific `decision` is exactly `pass | revise | block`.
`pass` is allowed only when TP coverage, Brownfield fit, solution integrity, and relevant documentation/Context Graph impact are sufficiently evidenced.
`sot_drift` must not pass silently as a warning.
Consume applicable findings through `../../meta/contracts/quality.md` §Normalized Review Gaps.
QA must not maintain a second mapping or reclassify review findings.

When post-CD+Tests review evidence exists, present the Runtime Contract's derived Quality
Readiness projection before the detailed QA report: Plan coverage, Solution integrity, Code
quality and QA decision in that order. Name `qa-gate` as the sole decision owner, show one
decisive reason and one permissible next action, and keep detailed reports as evidence links or
on-demand detail. The projection is non-authorizing and must not replace the Run Status Card,
Gate Transition Card or the durable QA report.

## Resolved Target Run And Evidence Discovery

After the Direct Skill Invocation Preflight resolves one governance target, discover QA context from
that target instead of asking the user to reconstruct repository evidence:

1. Prefer an explicit run identifier only when it belongs to the resolved governance target and
   matches the requested QA scope. Otherwise inspect the durable active-run inventory.
2. Select exactly one run whose objective matches the request and whose canonical gate state permits
   QA. Validate that state through gate-check or the equivalent agent-native control inspection.
3. If no eligible run exists, report the current earlier gate or internal step and stop before a QA
   decision. If several runs remain plausible, list only their identifiers and objectives, request
   one run selection and stop before a QA decision. Run clarification is a pre-decision outcome, not
   a fabricated `block` result.
4. From the selected run and its Artefacts/Artefact Chain, resolve and read the approved TP,
   Brownfield Analysis, CD+Tests evidence, Task Plan Review, Clean Implementation Review, Code
   Review, normalized findings, test results and Context Graph state that are present and readable.
5. Treat inaccessible external evidence and missing mandatory artefacts as explicit evidence gaps.
   Do not ask the user to paste or relink repository files that the skill can read itself.
6. Once one eligible QA run is established, evaluate the discovered evidence and emit exactly one
   `pass | revise | block` decision with one permissible next step.

QA owns the Quality Readiness and QA decision only. It must not reconstruct or promise a Run Status
Card, Gate Transition Card, native QA card or interactive QA card. Operational run status and gate
approval orientation remain owned by gate-check and the Interaction Contract.

## Rules
1. No QA pass without strong evidence.
2. TP is the reference, not merely working code.
3. P0/P1 gaps block `pass`.
4. Brownfield fit is mandatory.
5. UI surface integrity is mandatory for UI-impacting changes.
6. Solution integrity is mandatory.
7. After one eligible QA run is selected, always output exactly one decision: `pass`, `revise`, or `block`.
8. Open risks, missing tests, partial TP coverage, or side effects must be visible.
9. Applicable UX Intent Fidelity rows must all be `fulfilled` with suitable visible evidence before `pass`.
10. A `requirements_gap` routes to PRD revision; QA must not invent or accept the missing criterion.
11. Any applicable normalized finding that is `open`, missing, unknown, contradictory or supported by
    insufficient evidence prevents `pass`.
12. A `resolved` finding counts only when its durable review evidence proves the routed correction or decision.

## When To Use
- after `CD+Tests`
- after `code-review`
- after `task-plan-review`
- after `clean-implementation-review`
- before UAT
- before any claim that implementation is done, releasable, or QA-ready
- when evidence from Brownfield, TP, or clean-review skills exists

Important:

- `CD+Tests` is implementation and test status only.
- Without review evidence and TP coverage, `QA pass` is not allowed.

## Inputs
Use what is available:

- approved TP and TP Review
- Brownfield Analysis
- Clean Implementation Review
- `code-review` or Code Review Report
- test/build results
- documentation impact review
- runtime or UI evidence
- known blockers and risks

If evidence is missing, lower the decision accordingly.

## Workflow
1. Resolve the target, select exactly one eligible run and discover its durable evidence.
2. Confirm the relevant gate context and verify TP coverage.
3. Verify P0/P1 completion.
4. Verify Brownfield fit.
5. Verify UX Intent Fidelity when applicable, including visible evidence for visible-behavior claims.
6. Consume normalized findings without reclassification; fail closed on every open or invalid row.
7. Verify solution integrity.
8. Verify tests and evidence strength.
9. Verify documentation and Context Graph impact if relevant.
10. Decide:
   - `pass`
   - `revise`
   - `block`
11. State the single required next step.

## Output
Use this shape:

```text
## QA Gate
- decision: pass | revise | block
- evidence:
- missing_evidence:
- risks:
- required_next_step:
- impact_codes:
```

If Context Graph impact is relevant, include the fields from `../../meta/contracts/context-graph.md`.

### Compact Chat Output

At `pass`: one line — `QA: pass — <one-line summary>`. Reference the durable QA report
path. Do not show the Quality Readiness projection or evidence inventory in chat.
At `revise`/`block`: show the decisive dimension, reason and next action.

## Decision Guidance
- `pass`: required TP tasks are done, evidence is strong, no blocking Brownfield or solution-integrity risk remains.
- `revise`: implementation is plausible but missing evidence, partial tasks, UX gaps, or fixable integrity issues remain.
- `block`: hard prerequisite, approval, product semantics, security/compliance, SoT drift, or critical behaviour is unresolved.

## Forbidden
This skill must not:

- grant QA pass from a green build alone
- hide partial task completion
- replace UAT
- treat missing reviews as completed
- downgrade SoT drift to harmless warning
- silently repair, normalize or reroute a review finding
