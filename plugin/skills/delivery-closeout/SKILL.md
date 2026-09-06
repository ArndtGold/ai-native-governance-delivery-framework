---
name: delivery-closeout
description: "Use this skill for this scope: commit/PR-near handoff after QA/OR/UAT. Boundary: never performs VCS actions automatically. Automatic discovery alone does not activate AGDF."
---

# delivery-closeout

## Purpose
Standardize the operational delivery closeout.

It answers:

- what operational delivery status applies after QA, OR, or UAT
- whether a commit-ready Git summary should be provided
- whether a commit should be actively offered after `Approval: UAT`
- which next delivery step makes sense: commit, push, PR, rollout, or none
- whether evidence-based technical follow-up remains useful
- whether Context Graph follow-up from OR/QA remains open

This skill does not replace `qa-gate`, `release-or`, user approvals, or gate decisions.

## Runtime Contract
After `skill_continuation`, use these focused runtime-contract modules:

- `../../meta/contracts/closeout.md`
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

Use supplied binding schema 2 only: executable, child-only environment and immutable argv_prefix.
Follow binding.arguments exactly with `--skill delivery-closeout`, language and working directory.
`target_source`: `explicit_target` if request names `primary_target`; `continued_target` if it unambiguously continues confirmed target; `current_repository` if request names this/current repo with one matching repo active. Otherwise omit the pair; cwd has no target authority.
Quote shell values as data.
On `terminal: true`, transmit host_action.text verbatim and stop; on skill_continuation use only its
target/control. Missing/failed/old binding: `dispatcher_unavailable`; no search, environment repair
or help retries. Dispatch never authorizes.

## Rules
1. Delivery follows gate clarity.
2. Never perform commit, push, or PR automatically.
3. Use one handoff format:
   - `Commit title`
   - `Commit body`
   - optional `Migration/Rollout note`
4. `Approval: UAT` unlocks an active commit offer when code changes exist.
5. No commit handoff for runs without code changes.
6. Always include exactly one next step and one quality outlook.
7. If OR, QA or current run state reports `context_graph_reconciliation: open_gap`, do not provide a clean commit-ready handoff; set the next step to resolve or explicitly retain the Context Graph gap.

## When To Use
- after `QA pass` with code changes
- after OR when delivery handoff should be clean
- after `Approval: UAT`
- when the user asks for commit, push, or PR handoff

Do not use as a substitute for `qa-gate`, `release-or`, or `gate-check`.

## Inputs
Use what is available:

- QA Report
- OR
- current gate status
- whether code changes exist
- existing commit-ready summary
- rollout or migration notes
- open technical risks or documentation gaps
- Context Graph impact from OR/QA/review
- Parent reconciliation projection already reported by OR

If code-change status is unclear, do not claim a commit handoff.

## Workflow
1. Classify the closeout:
   - `qa_pass_with_code`
   - `qa_pass_without_code`
   - `uat_approved_with_code`
   - `uat_approved_without_code`
   - `non_delivery_closeout`
2. Check Context Graph reconciliation from OR, QA, review and current run state.
3. If reconciliation is `open_gap`, report the delivery status as not cleanly handoff-ready and do not derive commit-ready Git text.
4. Derive Git handoff only when code changes exist and no unresolved Context Graph gap remains.
5. Set exactly one next delivery step:
   - offer commit
   - offer push
   - offer PR
   - no further delivery step
   - run QA/review
   - obtain UAT/approval
   - perform documentation follow-up
   - resolve Context Graph gap
6. Set quality outlook:
   - no further technical follow-up
   - more tests
   - refactoring
   - documentation sharpening
   - monitoring/runtime verification
   - Context Graph reconciliation
7. If `Approval: UAT` exists, code changes were delivered, and no Context Graph gap remains, actively offer the commit but do not run it.
8. If OR reports an `open` Parent reconciliation, retain its named Parent and one next action in the
   handoff while preserving an otherwise valid commit offer. This coordination warning is not a
   Child gate failure.
9. Consume Parent reconciliation from the OR only. Do not inspect sibling runs, infer Parentage,
   reevaluate evidence or mutate a Parent.

## Output
For code-changing runs:

```text
Delivery status:
Next step:
Quality outlook:
Commit title:
Commit body:
Migration/Rollout note:
```

For non-code runs:

```text
Delivery status:
Next step:
Quality outlook:
```

## Forbidden
This skill must not:

- decide QA pass
- replace OR
- execute commit, push, or PR
- invent a commit handoff for non-code runs
- imply new gate approvals
- rediscover, reclassify or repair Parent reconciliation outside the OR
