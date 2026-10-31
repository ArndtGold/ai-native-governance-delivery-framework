# OR: Planned URs, backlog-free Core and optional Codex Planning

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done
Date: 2026-10-31
Owner: Codex release-or; AI-assisted audit closeout

## Run

- run_id: run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74
- related_ur: .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/UR.md
- related_prd: .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/PRD.md
- related_sd: .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/SD.md
- related_tp: .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/TP.md
- related_qa_report: .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

Prepared against canonical revision 29 / 9269dc66-642e-47d3-a573-481e4a422a29 after deliberate QA and UAT approvals. The canonical closeout.record owner publishes this exact report, records completion and synchronizes the selected legacy backlog pointer atomically. This report is not another QA decision, approval, installation or VCS authorization.

Version-matched OR template sha256:63bde2e942e18b3ae1ba34a48474043b78c2e3782689eb691cf3918cff42c2dd and all 19 pages of authoring manifest 73e1057e11566f74a3fc616205a5145d143b25f96b03ad08b7c6d5214163eec7 were consumed. References below are relative to this Run artefact directory unless fully qualified.

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_delivery | Recorded persistence/migration/architecture depth; no shortcut inferred |
| PRD | approved | .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/PRD.md |
| SD | approved | .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/SD.md |
| TP | approved | .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/CD_TESTS.md |
| TP Review | pass | TP_REVIEW.md; implementation tasks/ACs fulfilled; T-013's then-pending QA step subsequently completed by QA_REPORT.md |
| Clean Implementation Review | pass | CLEAN_IMPLEMENTATION_REVIEW.md |
| CR | done | .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/run-2f333208-b8c4-46cf-ad87-b6cc7ffc4f74/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-31 · revision 28 · presentation 752a13e4-c2a4-4fbc-8dcf-a72f28d66a47 sha256:2b7d4cd2a081da73c382eee5bf37f24adfa95fd65aca0384991dedcd0b623314 |

No user gate approval is missing. Approval records are cooperative local evidence of the supplied deliberate replies; no independent human source-code review or new native observation is inferred from them. T-001 through T-013's accepted technical/review obligations are fulfilled; later Git/CI/rollout actions retain their own boundaries.

## Run Status Card

Projection of Delivery Map at preparation, not an independent transition model.

| Run status | Value |
|---|---|
| Status | Active OR preparation; technical readiness pass and all user gates approved |
| Current gate | OR |
| Allowed now | Record exact OR through the canonical closeout owner; prepare the separate delivery handoff |
| Blocked by | none |
| Missing approval | none for Run closeout |
| Next step | Offer the scoped commit after canonical OR completion |
| Quality outlook | No further technical follow-up for the accepted local scope |

## Delivered

| Item | Evidence |
|---|---|
| Independent planned URs and high/normal/low priority, stable identity and digest-bound replacement | Shared planned-entry owner; core-cli.log capture/incomplete/CAS/input/foreign-byte negatives |
| One Core UR author/template in planning and Run modes | Shared ur-definition planning dispatch/material scope and exact template identity; native-read-core.log and actual native traces |
| Deliberate selected-source handoff, original-operation replay and immutable origin/snapshot | planned-handoff/origin; interrupted/concurrent/negative cases and both native feature flows |
| New-layout v3 Runs/v6 journals without mandatory live backlog or shared backlog lock | Initialization, Run writers/recovery/approval/revision/closure, independent mutation claims and maintenance freeze/drain; version/process tests |
| Shared derived inventory and passive CLI/MCP/Cockpit source views | Core projection, source-bound sessions/UI and automated browser observations; no second saved state authority |
| Optional skill-only Codex Planning package | Existing build/install owners, explicit selection/capability checks and actual Core delegation; no copied server/runtime/template |
| Explicit lossless legacy preview/apply/recovery and historical v2 compatibility | Complete raw source/row accounting, isolated interruption/recovery, closed journal/epoch/Run-lock validation and actual read-only Worktree preview |
| Documentation, canonical CI test registration and generated package/compatibility output | Existing sync/assembly owners and targeted package/schema/compatibility checks; README/help/control rules |
| Existing Context Graph reconciliation | run_inventory_20261030 and run_closure_20261029 updated, with source/evidence and version/qualification limits |

The earlier prerequisite routing repair, unrelated dirty work and primary checkout remain preserved. Generated assets/caches are outputs; implementation changes are in canonical repository sources. No package cache was used as a source-edit workaround.

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Actual Worktree/main control migration | Approved TP permits only actual read-only preview; cutover needs a deliberate separate action | Repository owner and existing preview/confirm/recover migration owner |
| Permanent installation of the final package | Native candidate installation was temporary and restored | Explicit installation request and supported native lifecycle |
| Native execution of final a679e02c1b68, native migration, Desktop/Cockpit, Windows or other hosts | Preserve exact actual observations; later guard change affects migration only | Future qualification if expanded support is requested |
| Commit, push, PR, merge or release | UAT and OR grant no automatic VCS/publication authority | delivery-closeout offers the scoped commit; explicit user instruction required |
| Actual current-head remote CI | Work remains uncommitted with no current PR/head to qualify | Required workflow checks for the eventual authorized head before merge |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Approved requirements/design/plan and exact source associations | UR.md, PRD.md, SD.md, TP.md and canonical Run receipts | Scope, architecture, 11 ACs/33 scenarios and approvals | direct |
| Implementation/Code/Clean/TP assessment | CD_TESTS.md, CODE_REVIEW.md, CLEAN_IMPLEMENTATION_REVIEW.md, TP_REVIEW.md | Brownfield fit, no parallel authority, actual defects and targeted corrections | direct |
| Core/CLI, persistence, process/concurrency and migration | evidence/implementation/core-cli.log 76/76; final journal-binding-after.log 17/17; journal-boundaries.log 10/10; targeted regression logs | New behavior, safety negatives, original ownership, known rollback/forward and legacy compatibility | direct |
| UI/HTTP/actual browser | ui.log 25 files/283 UI tests and HTTP 8/8; typecheck; browser-affected/palette/final-candidate logs | Actual visible source/state/retry/navigation obligations, no native Desktop claim | direct |
| Actual MCP and schemas | review-stdio.log 2/2 protocol eras; native-read-regression-before/after and error logs; 3036 schema parity cases | Defect detection, successful/stale/unreadable planned reads and bounded scopes | direct |
| Package and compatibility | review-generation/assembly/package/payload/compatibility logs; package 1538 files; reviewed 452 files/4927790 bytes; compatibility 56/56 and freshness | Canonical-to-derived consistency and source fingerprint d2e83cd19a2fa73602fac4ad1d07cb6e138679414135482be742a9f2457f799c | direct |
| Actual native feature cases | NATIVE_QUALIFICATION_REPORT.md; evidence/implementation/native/manifest.json and exact traces/fixture effects | Core-only and Core+Planning Codex CLI 0.163.0/macOS x86_64 on unchanged 826ca9884801 and optional 8b32f58de579 | direct |
| Native result reuse boundary | native-final-applicability.json and qa-final-candidate.json | Final source a679e02c1b68 changes only migration validateIntent and its generated worker function; exercised feature paths and optional package unchanged | direct structural applicability; original host observation retained |
| Actual legacy input preview | worktree-preview.json and worktree-readonly.json | All 316 lines across 156 Runs/3 drafts, 105 explicit findings; all 14240 entries/631450625 file bytes unchanged | direct |
| Current protected-source integrity and control | Bound Delivery Map pass/Doctor pass, zero findings; qa-source-snapshot-summary.json and drift checks | Approved source bytes, current QA association and preserved evidence | direct |

Failed attempts and targeted repairs remain retrievable rather than relabelled green. The native Inspect classification defect was reproduced before its production fix. Migration journal substitution failed 2/4 cases before the correction and passes all 17 cases afterwards. The native bypass restart rejected by automatic review was not executed or indirectly retried; the successful cohort used normal Codex workspace permissions. No credentials were read/copied/acquired. No completed model case was automatically repeated after evidence completion. Original installation/config bytes were restored.

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| none for the accepted local Run scope | none | none; current scope is technically reviewed and deliberately accepted |
| Exact future remote PR-head CI | warn; before-merge obligation, not proof of a current pass | Verify all required checks against the eventual authorized commit/head before merge |
| Broader/final-digest native execution | explicit qualification limit, no broadened host claim | Qualify separately only if that broader deployment/support claim is requested |

The native observations belong to the actual tested digest, not the final package digest. The documented unchanged-feature assessment reuses them only for the exercised UR/material/schema/read/handoff/direct-Run paths. Affected migration, compiled protocol/package and compatibility checks were rerun. This preserves the approved TP invalidation rule without fabricating a new native run. QA and UAT accepted these stated limits; this is not a QA deviation reclassification or a retrospective host claim.

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Actual legacy history has 61 unverified ended records, 43 unresolved associations and one unavailable UR | warn for future cutover; no newly trusted approval or lost raw input | Existing migration preview/archive owner preserves exact facts for deliberate reconciliation |
| Migration limits of 256 Run locks and 32 MiB journal | Explicit refusal above capacity; no truncation/fallback | Existing migration owner and repository maintainer |
| Independent worktrees/Git and other hosts | No distributed-lock, conflict-free Git or unmeasured performance promise | Keep same-source/version and required platform/PR checks at their actual decision points |
| Foreign/unrelated work and permanent installation | No automatic cleanup/cutover/update | Preserve primary checkout and unrelated bytes; separate deliberate actions only |

No applicable normalized review finding remains open. CR-001 through CR-004 retain their resolved implementation_gap/CD+Tests classifications and concrete proof in CODE_REVIEW.md. No new technical correction, refactoring or model cohort is required by this closeout. The quality outlook does not waive future CI or qualification duties.

## Parent Reconciliation Handoff

Evaluated Delivery Map projection, copied without sibling discovery or relationship inference:

- outcome: not_applicable
- target_run_id:
- disposition: not_applicable
- evidence:
- missing_evidence: none
- next_action: none

Programme aggregation was evaluated as applicable:false; no Parent/programme readiness or approval is claimed.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: run_inventory_20261030; run_closure_20261029; .agdf/control/CONTEXT_GRAPH.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: both existing nodes describe verified legacy/new-layout mutation, derived inventory, immutable origin and exact native/migration limits, with implementation and test references

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: preserve reusable, verified ownership/version/recovery knowledge in existing nodes rather than a parallel planning or status register
- memory_refs: .agdf/control/CONTEXT_GRAPH.md#CG-RUN-SCOPED-CONTROL-STATE; run_inventory_20261030; run_closure_20261029

Retained compatibility is deliberate: legacy v2/journals 1-5 keep their original owner/predicates until an explicitly authorized supported cutover. New planned-urs-v1/v3/v6 is the target model. Historical ended bytes remain read-only history. Unknown claims, foreign outputs or incompatible state refuse and retain evidence; there is no timeout-based ownership guess or automatic cleanup fallback.

## Next Permissible Step

- next_allowed_action: delivery-closeout offers the scoped commit on agdf/planned-urs-masterbacklog-replacement after canonical OR recording.
- required_approval: none
- forbidden_until_then: automatic VCS/publication, actual repository cutover, unrelated cleanup or additional native credential/session work.
- quality_outlook: no further technical follow-up for the accepted local scope; required future PR CI and any newly requested qualification remain at their own decision points.

## Approval

UR, PRD, SD, TP, QA and UAT have recorded deliberate approvals. OR records the accepted result and next permissible step; it approves no later action. CONTRIBUTING.md and GOVERNANCE.md retain maintainer authority.
