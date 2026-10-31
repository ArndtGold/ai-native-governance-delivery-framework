# Code Review: Run overview and worktree convention

- decision: pass
Date: 2026-10-31
Owner: Codex, code reviewer; cooperative self-review, no independent review claim
Run: run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5
Reviewed baseline: c79972c2f3fc3d8bd21d45d10e90a1dd79c5d763 plus this isolated candidate's tracked and untracked feature paths

## Code Review

- findings: One functional defect was found and fixed, RUNOV-CR-001 below. No meaningful open correctness/security/data-integrity finding remains evident in the reviewed implementation.
- scope: Actual production changes in control-state writer/step/transaction/revision/recovery/closure/Verified Change/init; required-file/doctor/delivery-map; Cockpit snapshot/session/parser/context/list/read-worker/domain projector/resource contract; HTTP service and React App/Overview/RunOverview/state/DTO/transport/bootstrap; canonical worktree/backlog contracts and affected setup/handbook/architecture; focused high-risk test changes and new run-only/Run-overview tests. Compatibility and deterministic replay changes were assessed as derived bindings/facts, with original native observations and expectation/provenance data protected. The three pre-existing authoring-input hotfix paths were reviewed separately, including its existing missing/malformed/unrecorded/blocked/completed UX prerequisite tests.
- evidence_strength: Source/diff assessment plus retrievable targeted original/reconciliation/review logs and inspected screenshots. Existing red no-backlog/writer regressions prove intended defect detection. Current identity repair has an additional genuine old-guard failing replay with a corrected valid fixture, seven passing UI cases, 22 passing Core/read cases, typecheck/build/resource proof, six browser cases and a matching built-resource SDK case. Existing mandatory platform CI is future evidence, not retroactively inferred from main.
- missing_evidence: No presently required implementation-review evidence is missing. Full exact-feature platform CI, including RUNOV-PERF-001, remains open before integration/merge. Native host installation/rendering is separately unqualified.
- risks: Operational cutover still requires all intended writers to use a matching qualified runtime; arbitrary old writers are not technically blocked by a new flag. Existing old sessions are not v2 qualification. Optional retained legacy data and old journal recovery remain supported obligations.
- required_next_step: Run the sole qa-gate judgement after the required TP/Clean review records are current.

## Review checks and conclusions

1. Inventory discovery/order/title/activity remains with the pure existing owner. The snapshot reads consumed Run records and directory membership through the bounded read abstraction; it does not evaluate every row or scan other worktrees/artefact archives.
2. Exact selection grammar is shared with canonical Run identity at Core. Invalid directory observations stay counted and visible; the current serializing projection marks them non-selectable, DTO validation refuses forged selectable/valid claims and React never issues an invalid selector. Safe malformed-record identities can still be opened for their existing diagnostic evaluation.
3. Stored list state cannot approve delivery. Current detail retains selected source/revision/registration/seal/presentation checks and removes only its incidental legacy comparison. Source replacement and stale/foreign/resource/session denials remain intact.
4. New create/record/approval/update/revision/closeout paths plan no backlog output or lock. runWorkSummary/assertSummarySources still guard registered evidence at the actual transaction commit. Expected revision/content, operation identity/digest, material outputs, archive retention and atomic commit remain.
5. pendingRunStepConflictIds ignores only successfully decoded foreign null-backlog journals; malformed or legacy shared journals remain fail-closed. Explicit legacy recovery retains Run-then-backlog locking and exact recorded old/next checks. Same-Run pending operations, original operation/replay and source-revision proof remain enforced. No old receipt/source is fabricated by production code.
6. Initialization omits only the formerly required live backlog. SoT/graph/quality contracts, registered relationships, symlink boundaries and exact approved source validation remain. Existing optional file bytes are preserved.
7. Reader envelope/resource v2 is paired across Core/HTTP/MCP/UI, while control/bootstrap/decision and context packet formats keep their own v1 contracts. Unsupported envelopes fail explicitly. Session/source/snapshot bindings are not widened.
8. Desktop and compact share row/search policy, Active/History and explicit legacy switching. Existing generation/cancellation/stale-retention/return/focus paths remain; meaningful browser assertions and source immutability cover the review repair's changed path.
9. The worktree rule names the primary owner and ignored container, requires assigned reuse and resolves unsafe/colliding destinations before Git. It introduces no automatic creation/relocation/cleanup or technical cross-checkout locking claim.
10. Obsolete backlog-projection test expectations were replaced with no-write/no-lock and immutable-source assertions. Original safety/failure checks remain at applicable required sources; old captured recovery cases are explicitly retained. Offline fingerprint refresh changed no expected action, gate, mutation permission or provenance. No workflow/performance budget/native observation was modified to obtain a pass.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| RUNOV-CR-001 | implementation_gap | CD+Tests | resolved | An actual discovered BAD NAME directory yielded an invalid diagnostic inventory row; the old UI canonical-ID-only DTO guard rejected the entire overview. Core now derives selectable from RUN_ID_PATTERN; UI accepts non-selectable invalid diagnostics, rejects forged valid/selectable claims, and disables their selector. evidence/review/red-valid-fixture.log reproduces dto_invalid with the original guard and a valid fixture; green.log passes 7/7, core.log 22/22, typecheck passes, run-overview-report.json passes all six rendered desktop/compact cases with unchanged fixture bytes. Current resource SDK proof exercises the rebuilt v2 resource. | none |

The initial red attempt also had a test fixture missing the existing authorizes:false member; it is retained separately and does not establish regression detection. The corrected valid-fixture replay isolates the original offending ID guard and fails for the intended reason. The repaired production sources were restored exactly after that bounded replay. RUNOV-PERF-001 is referenced from CD with its original open classification and future integration/merge timing; it is not silently resolved or presented as a new current Code Review defect.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: warning
- context_graph_evidence: Existing nodes match the actual source owners and retain unqualified feature integration/native rollout limits.
- memory_target: scope_artifact
- memory_reason: Review findings and exact candidate evidence are Run-specific.
- memory_refs: this report; CD_TESTS.md; evidence/review/manifest.json

## Current evidence binding

Registered review-time evidence: .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/EVIDENCE-a6eb75566fb3397f92065fb0b40fa2016e13b219d114768e1ba12c713e439f03.md, sha256:a6eb75566fb3397f92065fb0b40fa2016e13b219d114768e1ba12c713e439f03. Review manifest sha256:a18ee1fddfcd605ef6f7f0637a2a9e99a59664a2b2eabac7061ea97be891379c; current compatibility 56/56, fingerprint 0103db4de2473a79bc9eebb989a28eb26c02960a4ab54c6a0f080bdbf9a9e618. Current paired UI 9ec5ac5c... is distinct from the original 1ff747df...; both source bindings remain explicit. Reuse the completed pre-review bound authoring-input sources, unchanged approved digests and current additive evidence; no source approval is inferred.
