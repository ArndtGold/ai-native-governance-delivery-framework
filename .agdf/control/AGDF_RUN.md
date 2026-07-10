# AGDF Run State

## Run Meta

- run_id: agdf-run-md-merge-strategy
- started_at: 2026-07-10
- mode: quick_task
- current_gate: Quick Task Execution
- decision: pass
- owner: agent

## Objective

Reduce or eliminate blocking git merge conflicts on `.agdf/control/AGDF_RUN.md` from concurrent edits
across machines/sessions, without breaking the existing CI dependency
(`.github/workflows/agdf-guardrails.yml`'s `delivery-map` check) that requires the file to exist in a
checkout.

## Current Control State

| Question | Answer |
|---|---|
| What is known? | Implementation done and verified. A simulated union merge (`git merge-file --union`) confirmed exit code 0 (no blocking conflict) but revealed a real caveat: `doctor`'s regex-based field extraction reads only the first match, so it silently ignores a duplicated `current_gate` line rather than flagging it — the README bullet was corrected mid-run to state this honestly instead of overclaiming full protection. A separate plugin-manifest drift first observed around external commit `5292f62` has since been fixed and closed under `plugin-manifest-drift-5292f62`. |
| What is approved? | `Approval: UR` provided on 2026-07-10. Brownfield Review done, selected `quick_task`. Quick Task implemented and verified. The later plugin-manifest drift fix was completed as a targeted follow-up after direct user instruction. |
| What is missing? | Nothing for this run's approved scope. |
| What is the next allowed action? | Offer delivery closeout; commit/push require separate explicit instruction. |
| What is explicitly forbidden right now? | Changing anything beyond `.gitattributes` and the `plugin/control/README.md` bullet under this run's scope. |

## Prior Run Pointers

- `agdf-micro-tier-below-quick-task` completed on 2026-07-10 (`pass`); unrelated in scope, but is the
  run during which this UR's triggering incident (external commits `2fff2c8`/`5292f62`) was observed.

## Run Status Card

This is a compact projection of the control state. It does not replace gate-check, QA, OR or approvals.

| Run status | Value |
|---|---|
| Status | Pass |
| Current gate | Quick Task Execution |
| Allowed now | Delivery closeout handoff |
| Blocked by | none |
| Missing approval | none |
| Next step | Offer commit-ready handoff; wait for explicit commit/push instruction |
| Quality outlook | Chose git's built-in `union` driver over a custom `ours` driver to avoid an undocumented, easy-to-skip local setup step; corrected the README wording mid-run once testing showed `doctor` cannot detect the duplicated-line case by itself |

## Approvals

Valid approval format for new runs: `Approval: <GateName>`.

| Gate | Status | Evidence |
|---|---|---|
| UR | approved | `Approval: UR` provided in session on 2026-07-10 |
| PRD | not_applicable | quick_task; Brownfield Review selected quick_task, no PRD required |
| SD | not_applicable | quick_task |
| TP | not_applicable | quick_task |
| QA | not_applicable | quick_task has no formal QA gate; relevant checks recorded as evidence instead |
| UAT | not_applicable | quick_task |

## Artefacts

| Type | Path | Status | Notes |
|---|---|---|---|
| UR | .agdf/control/artefacts/agdf-run-md-merge-strategy/UR.md | approved | Reduce concurrent-edit conflict risk on `AGDF_RUN.md` |
| Brownfield Review | .agdf/control/artefacts/agdf-run-md-merge-strategy/BROWNFIELD_REVIEW.md | done | Rejected custom `ours` driver (undistributable without local config); selected built-in `union`; selected `quick_task` |
| PRD | not_applicable | not_applicable | quick_task |
| SD | not_applicable | not_applicable | quick_task |
| TP | not_applicable | not_applicable | quick_task |
| Brownfield Analysis | not_applicable | not_applicable | quick_task |
| Review | none | missing | No separate formal code review artefact for this quick_task; checks recorded as evidence below |
| QA | not_applicable | not_applicable | quick_task |
| OR | inline (OR-lite) | done | Recorded in Closeout below, per quick_task OR-lite allowance |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: One new `.gitattributes` line plus one Operating Rules bullet in `plugin/control/README.md`; no Runtime Contract, skill, doctor, or CI change; fully reversible.
- evidence: See Brownfield Review Existing-System View and Reuse/Parallel-Structure Risk tables.
- transparency_note: Quick Task Execution may now add `.gitattributes` and the README bullet; nothing else.

## Artefact Chain

| From | Relationship | To | Evidence |
|---|---|---|---|
| UR | approved_by | Approval: UR | Exact approval captured in session on 2026-07-10 |
| Brownfield Review | sizes | UR | Rejected custom `ours` driver, selected built-in `union`; selected `quick_task` |
| Quick Task Execution | implements | Brownfield Review | Added `.gitattributes`; added Operating Rules bullet to `plugin/control/README.md`; verified via simulated union-merge test and `check-runtime-integrity.mjs` |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| CI depends on `AGDF_RUN.md` presence | `.github/workflows/agdf-guardrails.yml` line 27: `node create-agdf/bin/create-agdf.js delivery-map --dir .` | Confirms gitignoring the file outright would break CI | direct |
| Concurrent external edits observed | `git log --oneline --all`, `git reflog`, `git show` on commits `2fff2c8` and `5292f62`; user confirmed `5292f62` originates from another machine | Confirms the conflict risk is real, not hypothetical | direct |
| No actual content collision this time | `git diff --stat HEAD` showed no divergence; `main...origin/main` showed no ahead/behind marker | Confirms this specific incident resolved cleanly by luck of non-overlapping file regions, not by design | direct |
| `.gitattributes` added, propagation confirmed | New file `.gitattributes` (`.agdf/control/AGDF_RUN.md merge=union`); `plugin/control/README.md` Operating Rules bullet added and found in `create-agdf/generated/.agdf/control/README.md` and `create-agdf/generated/plugins/agdf/control/README.md` after `sync-package-assets` | Delivers UR Scope items 1-2 | direct |
| Union merge simulation | `git merge-file --union merged.md base.md theirs.md` with conflicting `current_gate` lines → exit code 0 (no blocking conflict), but result kept both lines (`current_gate: QA` and `current_gate: CR`) side by side | Confirms Acceptance Signal "resolves without a blocking conflict"; confirms the "garbled" risk is real | direct |
| `doctor` blind spot on duplication | Regex test (`content.match(/^- current_gate:.../m)`) against the duplicated-line result returned only the first value (`"QA"`), silently ignoring the second line | Confirms `doctor` alone will not catch this specific duplication class; corrected the README wording to say this honestly instead of overclaiming | direct |
| Runtime integrity: merge-strategy change was isolated | Earlier comparison showed the manifest-description failure was pre-existing and unrelated to the merge-strategy files. The separate manifest drift has since been fixed and `node plugin/scripts/check-runtime-integrity.mjs` now passes. | Confirms the merge-strategy run did not introduce the drift and the follow-up closed it | direct |
| No regression | `create-agdf/scripts/test-routing.js` passed | No regression from `.gitattributes`/README changes | direct |

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| none for this run's scope | none | none |

## Risks

| Risk | Impact | Mitigation or owner |
|---|---|---|
| ~~`merge=ours` could silently discard a more-current incoming run state~~ avoided | none | Rejected `ours`; chose `union`, which keeps both sides rather than discarding either |
| `union` can leave duplicated/conflicting lines that `doctor` alone will not detect (confirmed: it reads only the first regex match per field) | warn | README bullet now explicitly instructs a visual skim in addition to `doctor`/`gate-check` after a merge |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs:
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Not yet assessed — UR stage only.

## Source And Scope State

- normative_instruction_source: `plugin/meta/agdf-runtime-contract.md`; `.github/workflows/agdf-guardrails.yml`; live `.agdf/control/`
- multi_scope_state: clear
- active_scope_evidence: New UR drafted for `agdf-run-md-merge-strategy`
- competing_scope_lines: none
- branch_workspace_evidence: only new `.agdf/control/artefacts/agdf-run-md-merge-strategy/UR.md`
- branch_workspace_scope_effect: supports

## Knowledge Persistence Decision

- memory_target: none
- memory_reason: Not yet relevant — UR stage only.
- memory_refs:

## Closeout

- delivered: `.gitattributes` (`.agdf/control/AGDF_RUN.md merge=union`); Operating Rules bullet added to
  `plugin/control/README.md`, propagated to generated Codex/Copilot/OpenCode surfaces; simulated
  union-merge test confirming no blocking conflict; honest correction of the README wording once
  testing showed `doctor` cannot detect simple line-duplication by itself.
- not_delivered: Any change to `agdf-runtime-contract.md`, skills, `doctor` logic, or CI workflow —
  confirmed unnecessary. The pre-existing, unrelated `check-runtime-integrity.mjs` failure
  (commit `5292f62`) was later fixed and closed under `plugin-manifest-drift-5292f62`.
- verification_performed: `git merge-file --union` simulation (exit 0, duplicated-line result
  inspected); regex test confirming `doctor`'s single-match blind spot;
  `node plugin/scripts/check-runtime-integrity.mjs` comparison during this run; later follow-up
  `node plugin/scripts/check-runtime-integrity.mjs` pass after manifest drift fix; `sync-package-assets` + propagation grep;
  `create-agdf/scripts/test-routing.js` passed.
- unverified: Real-world behavior under an actual concurrent `git merge` from two live clones (only
  simulated via `merge-file --union`, not a full two-clone rehearsal).
- next_allowed_action: Offer delivery closeout; commit/push require separate explicit instruction.
- quality_outlook: The mid-run correction (from overclaiming `doctor` catches all union-merge damage, to
  honestly stating its blind spot) is itself the strongest evidence this run behaved with the rigor it
  is supposed to protect.
