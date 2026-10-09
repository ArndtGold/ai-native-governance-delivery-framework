# Brownfield Analysis: approved backlog status flow implementation

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: CD+Tests
- run: backlog-status-flow-clarity-20261009-01
- reviewed_revision: 69269852-bd7d-415c-9335-9aacbcb5ba2d
- scope: approved TP T-001 through T-009; criteria-chain-v1 remains the approved PRD acceptance owner.
- evidence: evidence/BASELINE.json and BASELINE.patch; actual source owners listed below; approved SD and TP.
- transparency: this is the distinct post-TP preparation, not the earlier sizing review or implementation/test fulfillment.
- missing_evidence: implementation, transaction/source-movement regressions, rendered UX and current native-host evidence remain execution obligations.
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- memory_target: scope_artifact
- memory_reason: implementation preparation and baseline belong to this Run, not a global memory or new registry.
- required_next_step: fresh gate-check for the same Run; then implement only approved TP tasks if routed to CD+Tests.

## Existing owners and coverage

| Owner | Observed coverage | Reuse / implementation path |
|---|---|---|
| control-evaluation/run-step-policy.js, next-action.js, qa-follow-up.js | Partially done: policy and validated normalized QA routing exist; stored backlog loses their concrete refinement | Extend with a small non-authorizing run-work-summary helper; reuse these evaluators rather than gate-check recursion |
| control-state/run-backlog.js, run-backlog-writer.js | Partially done: strict row identity/layout, three justified skip reasons, ordered locks, unchanged-Run pointer repair exist | Extend the addressed row planner and bounded same-file codec; allocate result revision once and guard all consumed evidence |
| run-steps.js and run-revision.js | Partially done: independent compact row construction, explicit compact closeout and revision journals exist | Route every supported row construction through the same summary/marker finalization; preserve strict versus legacy/skip semantics |
| run-step-transaction.js, run-state-writer.js | Fully reusable transaction and revision/seal owners; current journal captures complete old/next backlog bytes | Preserve the Run commit point and receipt rules; add consumed-source validation at its precommit point, replay exact captured bytes |
| Relationship correction and exceptional recovery | Existing separate Run-only commit/recovery ownership | Retain that owner; disclose pending pointer synchronization and explicit scoped run-update, never nested journals |
| control-read snapshot/fs seam; cockpit-backlog.js; cockpit.js | Saved-only overview and explicit selected immutable capture already exist | Parse optional provenance without following marker paths; compare only selected valid Run and safely captured evidence in the same view |
| Existing HTTP/MCP validators and opaque selectors | Existing bounded read mediation | Extend optional DTO validation consistently, preserve old DTO fallback and malformed-present rejection |
| BacklogRows.tsx, App.tsx, RunDetail.tsx | Earlier opt-out cards/scroll baseline present; compact currently hides next step; async title refresh compares only old fields | Render common Core meaning, action and limitations directly; retain stable keys/query/focus and verify summary refresh coherence |

## Protected baseline and architecture invariants

BASELINE.json binds HEAD, all dirty paths, relevant source hashes and existing artefact hashes. BASELINE.patch preserves the eight earlier UI source/test modifications and prior planning/control changes. The new implementation increment is attributed against these bytes; it must not rewrite unrelated Run artefacts or approved UR/PRD/SD/TP. No VCS, installation or host configuration action is authorized here.

The saved observation is subordinate to canonical sealed Run/evidence/approval sources. It is stored in the same MASTER_BACKLOG file, outside contiguous tables, and is neither a gate nor a second control state. Old seven/thirteen-column rows, links, title, order, section membership and stored-field search remain compatible. No list-wide Run scan or read-triggered write is introduced. UI/HTTP/MCP render or validate data; Core owns meaning. Existing approval and permission outputs must remain unchanged.

## Regression risks and minimal implementation order

1. Reuse QA validation including referenced reports and concrete normalized findings; validate pass/block source agreement without changing QA authority. Prove missing/foreign/invalid sources and custom-action precedence.
2. Build and test strict bounded codec, section/actual-row digest binding and exact old-row fallback. Preserve unrelated marker and table bytes; do not infer truth from an arbitrary comment.
3. Integrate normal writers, strict run-step, revisions and explicit closeout under their existing locks/journal. Test resulting revision identity, source movement before commit, interrupted real boundaries, foreign pending transactions and idempotent unchanged synchronization.
4. Extend saved reading and selected comparison under the existing immutable fs seam; verify no additional Run/report reads on lists and no metadata path following. Extend transport validators and title-refresh equality.
5. Render and test compact/expanded common action/limitation with accessibility, narrow/wide wrapping and stable delayed-title scroll behavior. Capture supported native evidence only if actually available; its absence remains an evidence obligation, not a preparation blocker or fabricated test pass.
6. Document actual final ownership/representation/failure boundaries, execute the mandatory reviews and leave qa-gate as the sole final quality owner.

## Reuse and parallel-structure risks

No unresolved product/design decision was found in preparation. The SD already chooses storage, authority, compatibility and exceptional recovery boundaries. Known trade-offs have explicit owners and exit conditions: saved freshness is the read owner's bounded selected comparison; skip/pending projection is the mutation owner's truthful result and scoped repair; current native evidence is the visible-evidence/QA owner's observation obligation before any host claim. Implementation defects route to CD+Tests; material new product/design/plan facts route to their existing upstream owner. No parallel registry or evaluator is accepted.
