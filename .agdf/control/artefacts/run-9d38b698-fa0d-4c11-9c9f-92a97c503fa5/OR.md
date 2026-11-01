# OR: Run-based Cockpit and worktree convention

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done
Date: 2026-10-31
Owner: Codex, release-or author

## Run

- run_id: run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5
- related_ur: .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/UR.md
- related_prd: .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/PRD.md
- related_sd: .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/SD.md
- related_tp: .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/TP.md
- related_qa_report: .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

The technical decision above is the existing qa-gate pass, not a new OR quality decision. Deliberate QA and UAT approvals are recorded. This report closes the bounded isolated implementation with its disclosed qualification limits; no integration/merge/release or installed-host readiness is asserted. Publication of this exact report and completion of the selected Run are one existing closeout.record transaction.

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/BROWNFIELD_REVIEW.md |
| PRD | approved | .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/PRD.md |
| SD | approved | .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/SD.md |
| TP | approved | .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/run-9d38b698-fa0d-4c11-9c9f-92a97c503fa5/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-31 · revision 23 · presentation a95c25ea-e1b1-4808-af1d-229802cc956c sha256:e09d5285b22aab89dc4feeaad41fc9bfac5b033e29e569247d1ee8fbe6198779 |

## Run Status Card

This is a compact projection of the observed pre-closeout state; the atomic writer receipt owns actual Run completion.

| Run status | Value |
|---|---|
| Status | pass; QA and UAT accepted, OR transaction pending at authoring |
| Current gate | OR |
| Allowed now | Produce and record OR; prepare VCS handoff only when separately requested |
| Blocked by | none for bounded local closeout; integration qualification remains unconfirmed |
| Missing approval | none |
| Next step | Record this exact OR through the bound existing closeout owner |
| Quality outlook | Local technical evidence and required reviews support the accepted result; exact-feature mandatory CI remains required before integration/merge |

Delivery Map currently reports pass, zero doctor findings, no missing approval and agent-owned record_closeout. Its machine pass does not erase the explicitly documented future CI/performance obligation.

## Delivered

| Item | Evidence |
|---|---|
| Run inventory replaces default backlog membership in both Cockpit surfaces, with Active/History, deterministic shared ordering/search/counts, source basis and explicit partial/missing states | Existing inventory/reader and shared RunOverview; CD and current review browser/Core/UI evidence |
| Exact selected-Run evaluation, stale/failed refresh/retry/return and source/session/resource boundaries retained | Scoped Core/session/HTTP/STDIO tests and rendered cases |
| Optional separate original legacy information, preserving old rows and provenance without creating Runs | Legacy parser/scope, byte-immutability assertions and browser evidence |
| New ordinary Run mutation/revision/approval/closeout has no backlog output or lock | Actual writer, held-lock, independent pending Run, same-Run stale, source/material/receipt/replay tests |
| Explicit captured old journal recovery remains supported, with original v1-v5 decoding/commit/conflict responsibilities | Original transaction/revision/material/typed recovery output; historical sources preserved |
| Fresh setup and current validation no longer seed/require live backlog, while required SoT/graph/registered-source checks remain | Canonical init and actual STDIO initialization; required-source and safety negatives |
| Normative owning-primary .agdf/worktrees/initiative/ rule, ignore verification, assigned reuse and old/explicit alternative support | task-target-resolution.md, affected generated guidance/DE/EN handbook/architecture and actual disposable Git walkthrough |
| Review-discovered invalid directory identity no longer hides the entire inventory or offers an unsafe selector | RUNOV-CR-001 resolved by canonical selectable projection, DTO/UI denial and targeted genuine red/green plus rendered proof |
| Completed independent CI baseline reconciled without changing foreign work | PR47 exact-head/check receipts, 201-file backup and conflict-free c79972c2 adoption |
| Required TP/Clean/Code reviews, sole technical QA pass and deliberate QA/UAT | Current exact source/approval bindings above |
| Human documentation review | Arndt Gold's Doku ok, reviewed translation metadata and passing existing community checker (32 files, four issue forms) |

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Exact unpublished feature-head mandatory Ubuntu/Windows CI and isolated performance qualification | These checks belong before integration/merge under approved SD/TP; publication/check authority has not been granted | Separately requested VCS/CI handoff and existing required CI owners |
| Installed/native-host qualification, live runtime switch or downgrade | Browser/protocol/source proof is bounded; coordinated cutover is separately authorized operational work | Named host/operator workflow with exact candidate proof |
| Automatic worktree creation/switching/relocation/cleanup, cross-worktree dashboard and shared control store | Explicit non-goals | New deliberate scope if ever requested |
| Migration/deletion of old planning/history or historical resealing | Existing original information and recovery obligations must remain preserved | Existing read-only legacy/recovery owners; no automatic transition |
| Commit, push, PR creation/merge, public release and foreign checkout cleanup | No such operative instruction is supplied by QA/UAT or this report | Separate explicit user instruction |
| A full local suite or aggregate preparation pass | Earlier broad verification is incomplete; the additional prepare continuation was stopped after current build/generation/assembly | Required matching-head CI before integration, not another routine local full run |

## TP Coverage, Brownfield Fit And Solution Integrity

T-001 through T-010 are fully_done for the targeted implementation, safety/compatibility and rendered proof. T-011 completed the independent baseline comparison, isolated reconciliation and mandatory inventory; the exact-feature matrix/performance qualification remains partial until its specified integration decision point. T-012 now has the required review set, technical QA, deliberate QA/UAT and this OR; its lifecycle completion follows only from the closeout transaction receipt. No future integration task is falsely marked executed.

All six applicable UX Intent Fidelity rows in TP_REVIEW.md are fulfilled with actual visible/process evidence. No individual P0/P1 priorities were invented where the TP supplies none. Existing inventory, transaction, selected evaluator, read capture and projection owners are reused. There is no duplicate registry, evaluator, required shared planning file, migration service or worktree manager. The earlier three-file authoring-input hotfix is separately authorized T-001 input, not silently attributed to the feature.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Original targeted manifest, 69 files | evidence/manifest.json, sha256:9f20fc8437d2e336b8056ce0b33f204d17dc0dbc23f25d426cc1e33b0c62b56e | Writer/recovery, bounded inventory/session, HTTP/UI/browser/SDK/package/worktree observations at their original bindings | direct |
| Reconciliation manifest, 58 files | evidence/reconciliation/manifest.json, sha256:c3ecefa1aab163c6766064f1b82b192763c2f3ead0d2690056bf9d688bb93252 | Exact baseline completion/backup/reconciliation, compatibility, focused repairs, all partial attempts and timing failures | direct |
| Review manifest, 33 files | evidence/review/manifest.json, sha256:a18ee1fddfcd605ef6f7f0637a2a9e99a59664a2b2eabac7061ea97be891379c | Genuine corrected-fixture original-guard replay, UI 7/7, Core/scoped 22/22, typecheck/build, six rendered cases, current resource SDK case, both-era STDIO and compatibility 56/56 | direct |
| Registered additive current review evidence | EVIDENCE-a6eb75566fb3397f92065fb0b40fa2016e13b219d114768e1ba12c713e439f03.md, sha256:a6eb75566fb3397f92065fb0b40fa2016e13b219d114768e1ba12c713e439f03 | Later identity-boundary product changes and exact current resource/applicability, not a replacement of old proof | direct |
| Current paired Cockpit resource | ui://agdf/cockpit/v2.html; sha256:9ec5ac5c9b1f871e253b37ab0805eea02048bb5a2c07da7eb024a16d19cb323f; source sha256:d0acdc9c76e627f9c8a2f74c456f1aaeb02c9dc7aaec6595c2dd558750bbe166 | Matching built UI, non-activated owned preparation and actual SDK/STDIO; old 1ff747df payload remains historical | direct |
| Current deterministic compatibility record/check | 56 evaluated, zero failed; fingerprint 0103db4de2473a79bc9eebb989a28eb26c02960a4ab54c6a0f080bdbf9a9e618 | Exact current deterministic fixture/freshness claims; native observations reused unchanged, not rerun | direct |
| Canonical QA/UAT approvals and all source relationships | Exact receipts and material sources in selected Run | Deliberate approval of presented bounded result and qualification limits | direct |
| Final closeout bookkeeping | All nineteen current bound OR authoring-input pages consumed; template sha256:63bde2e942e18b3ae1ba34a48474043b78c2e3782689eb691cf3918cff42c2dd; manifest sha256:8644bd9b26501309e25709853c78f3da8c087d25048b466488a35c9476e04a7f | Current OR format/source binding; no additional test run | direct |

The 127 original/reconciliation and 33 review files were hash-verified at review/QA with current review source hashes; no later product edit occurred. Local environment is isolated macOS/Node22.22.3 with actual local HTTP/STDIO/Chromium and synthetic SDK host. Tests, screenshots, native observations and workflow receipts retain distinct qualifications. The initial sandbox launch failure and malformed test fixture are not defect-detection proof; the corrected original-guard replay is. Current direct whitespace/index observation is clean and the real index remains empty. No test was rerun merely to enter OR.

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| Exact feature-head required platform CI, including the unchanged dedicated cold performance lane | warn for bounded completed local Run; integration/merge remains unqualified | Obtain and assess all required results on the exact separately published candidate before integration/merge |
| Native installed-host behavior and coordinated cutover | warn; no native/operational readiness claim | Qualify only if an explicitly requested host rollout requires that claim |
| Full local shared-chain/preparation aggregate | warn; no aggregate pass claimed | Retain partial outputs and rely on complete required exact-head CI at its proper decision point |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| RUNOV-PERF-001 remains technically open in CD as evidence_gap/evidence_obligation | warn for this bounded accepted result; required before integration | Existing isolated performance CI on exact candidate; unchanged 1500 ms cold p95 and 1000 ms warm budgets, no further local sampling |
| Candidate cold p95 2379.791/1522.431 ms and unchanged-main 1912.955 ms exceed 1500 ms locally | warn; no demonstrated new regression and no passing timing qualification | Keep original failed observations and context; no budget increase or foreign process action |
| Old/new writing runtimes must not be mixed during eventual cutover | warn for future operations | Quiesce writers, inventory/recover pending old outputs, preserve registered/untracked evidence and coordinate matching runtime/UI |
| Post-mutation downgrade needs exact compatibility proof | warn for future operations | Approved current recovery owner, disposable compatibility proof or forward fix; no receipt erasure or synthetic old rows |
| Isolated/untracked evidence is not automatically copied by Git worktrees | warn for future handoff | Preserve intended registered and untracked sources/evidence before any separately authorized Git handoff or cleanup |

RUNOV-DOCS-001 and RUNOV-CR-001 are resolved with actual human/check and defect/re-verification evidence. RUNOV-INTEGRATION-001's false unfinished-independent-CI premise is resolved; the separate future exact-feature CI duty remains unchanged. No technical deviation was accepted or missing result converted to pass.

## Retained Fallbacks And Exit Criteria

Optional legacy reading retains original planning/history data without requiring a new shared writer. It remains only while deliberately retained; removal/migration needs separate scope. Compatibility function names still import the existing writer, whose new path is Run-only. Captured legacy journal recovery ends when its exact original responsibility is completed and the journal retired; unknown/conflicting bytes remain recovery-required. Completed historical Verified Change execution scope remains historical. No automatic cleanup deadline or portable branch/checkout lock is invented.

## Parent Reconciliation Handoff

Copied from the current Delivery Map evaluator, without scanning sibling Runs or inferring parentage:

- outcome: not_applicable
- target_run_id: 
- disposition: not_applicable
- evidence: 
- missing_evidence: none
- next_action: none

## Programme Aggregation Readiness

The current evaluated programme projection is not applicable. Its actual values are startable:false, final_ready:false, acceptance_ref empty, evidence:[], missing_evidence:[], next_action:none. These are non-authorizing evidence values; no programme or sibling state was created or changed.

## Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#cg-run-scoped-control-state; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: warning
- context_graph_evidence: Existing entries now record the actual Run-only/inventory/legacy/worktree owners, current compatibility fingerprint, completed reviews and deliberate QA/UAT. They keep exact-feature CI/performance due before integration/merge and distinguish bounded local OR from installed/native readiness. Historical source entries remain historical.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Commands, candidate hashes, local qualification and approval/closeout history are Run-specific. The changed reusable invariant is already reconciled in existing Context Graph/SoT owners.
- memory_refs: this OR; QA_REPORT.md; TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; CD_TESTS.md; evidence/review/manifest.json

## Next Permissible Step

- next_allowed_action: Await a separate explicit VCS/CI handoff instruction for the isolated candidate, retaining all required exact-head integration checks.
- required_approval: none
- forbidden_until_then: automatic commit, push, PR, merge, release, host activation, downgrade or foreign-worktree cleanup.
- quality_outlook: Accepted bounded local implementation with technical QA pass and human QA/UAT; all remaining exact-head integration/performance and native qualification limits remain explicit.
- delivery_closeout: Useful only when an operative Git/PR handoff is separately requested; that skill owns its text/actions within authorized scope. This OR performs no VCS action.

## Approval

OR does not approve later gates. It records the next permissible step. Arndt Gold's deliberate Approval: UAT authorizes the current agent-owned OR continuation; the exact closeout command binds this Run/revision/operation and staged report digest, without inventing another human gate.

## AGDF Approval Summary (de; source=en)

- Ergebnis: QA und Nutzerabnahme sind freigegeben. Run-Übersicht, separate Legacy-Ansicht, Run-Schreiben ohne gemeinsame Backlog-Pflege und die Worktree-Regel sind im isolierten Worktree umgesetzt und durch die dokumentierten gezielten Prüfungen belegt. Die formellen Reviews sind abgeschlossen; der darin gefundene Auswahlfehler ist behoben.
- Grenzen: Pflicht-CI und unveränderter isolierter Performancecheck des exakten Feature-Stands bleiben vor Integration/Merge erforderlich. Der lokale Timing-Fehlschlag bleibt offen; die breite lokale Prüfung gilt nicht als vollständig bestanden. Native Installation/Umstellung ist nicht qualifiziert; die Paketvorbereitung bleibt nicht aktiviert.
- Abschluss: Dieser Lieferbericht dokumentiert den abgenommenen lokalen Stand samt Restpflichten. Er behauptet keine Merge- oder Release-Bereitschaft und führt keine Git-, Veröffentlichungs- oder Host-Aktion aus. Als nächster Schritt ist ein gesonderter Auftrag zur Git-/CI-Übergabe möglich.
