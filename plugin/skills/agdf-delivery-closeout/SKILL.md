---
name: agdf-delivery-closeout
description: Use this skill for the final delivery handoff after QA, OR, or UAT when a run should move toward commit, push, or PR. It standardizes commit-ready summaries, UAT-gated commit offers, and the next delivery step without replacing QA or OR decisions.
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

This skill does not replace `agdf-qa-gate`, `agdf-release-or`, user approvals, or gate decisions.

## Runtime Contract
Use `../../meta/agdf-runtime-contract.md` for closeout discipline, gate terms, Context Graph fields, and non-duplication rules.

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

## When To Use
- after `QA pass` with code changes
- after OR when delivery handoff should be clean
- after `Approval: UAT`
- when the user asks for commit, push, or PR handoff

Do not use as a substitute for `agdf-qa-gate`, `agdf-release-or`, or `agdf-gate-check`.

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

If code-change status is unclear, do not claim a commit handoff.

## Workflow
1. Classify the closeout:
   - `qa_pass_with_code`
   - `qa_pass_without_code`
   - `uat_approved_with_code`
   - `uat_approved_without_code`
   - `non_delivery_closeout`
2. Derive Git handoff only when code changes exist.
3. Set exactly one next delivery step:
   - offer commit
   - offer push
   - offer PR
   - no further delivery step
   - run QA/review
   - obtain UAT/approval
   - perform documentation follow-up
4. Set quality outlook:
   - no further technical follow-up
   - more tests
   - refactoring
   - documentation sharpening
   - monitoring/runtime verification
5. If `Approval: UAT` exists and code changes were delivered, actively offer the commit but do not run it.

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
