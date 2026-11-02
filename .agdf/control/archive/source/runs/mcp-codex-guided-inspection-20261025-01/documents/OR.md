# OR: reliable Codex MCP inspection

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: mcp-codex-guided-inspection-20261025-01
- related_ur: .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/UR.md
- related_prd: .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/PRD.md
- related_sd: .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/SD.md
- related_tp: .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/TP.md
- related_qa_report: .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass

The exact technical QA report is pass and deliberately approved. The user subsequently approved the exact prepared UAT material with Approval: UAT; operation cb685df2-c3ab-4dca-9c4d-bf65d91f8d5f accepted presentation 8dd620c3-2806-4531-b690-7c6d7a87d366 at revision 33 and produced revision 34 (2da50dc0-7889-435e-af40-207da2c89ee7). This report records the approved delivery and its limitations. Its canonical closeout transaction publishes the report and completes the selected Run; it performs no Git, installation or publication action.

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_delivery | BROWNFIELD_REVIEW.md; canonical Run Mode/Slice Decision |
| PRD | approved | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/PRD.md |
| SD | approved | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/SD.md |
| TP | approved | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/CD_TESTS.md |
| TP Review | done | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/TP_REVIEW.md |
| Clean Implementation Review | done | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/CLEAN_IMPLEMENTATION_REVIEW.md |
| CR | done | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/mcp-codex-guided-inspection-20261025-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-25 · revision 33 · presentation 8dd620c3-2806-4531-b690-7c6d7a87d366 sha256:2f97c8b9f734093dd258bd7e3de5538b738a8b2fbace32c118a58655024a5388 |

## Run Status Card

This is the compact pre-registration control projection; the canonical closeout receipt establishes lifecycle completion.

| Run status | Value |
|---|---|
| Status | Ready for formal closeout |
| Current gate | OR |
| Allowed now | Publish this exact report and complete this selected Run |
| Blocked by | none |
| Missing approval | none |
| Next step | Retain the completed delivery for an explicit version-control handoff instruction |
| Quality outlook | Approved scope accepted with the documented qualification limits |

## Delivered

| Item | Evidence |
|---|---|
| Existing inspection tool exposes all 14 parameters and 11 operations in actual Codex CLI rendering, preserving validation | Core contract.js; pair-guidance renderer capture; 247,003 equivalent SDK cases and 160 frozen Core outcomes |
| Optional sequential read navigation from explicit target/Run and canonical command/catalog owners, preserving exact known document identity and original revision | Core service.js; current CLI and both SDK/STDIO protocol regression evidence |
| Single inherited T7 OS guard/controller with bound source/preflight, exclusive reservation, actual negative/positive controls and owned-tree deadlines | codex-host-e2e.mjs; codex-command-guard.mjs; synthetic OS tests and native controller evidence |
| Two genuine current-runtime normal T7 successes, each original/strict pass, exactly one intended approval, four MCP calls and zero SDK/other errors | qualification/pair-guidance-01 native-summary.json, original traces, retained manifests and separate ledger |
| Human-authorized one-line negative-test stderr correction and model-free verification | DIRECT_FIX_AUTHORIZATION_04.md; evidence/direct-fix-04/assessment.json, darwin.log and platform.log |
| Separate current review dimensions, final QA decision, deliberate QA/UAT approvals and reconciled delivery scope | TP_REVIEW.md; CLEAN_IMPLEMENTATION_REVIEW.md; CODE_REVIEW.md; QA_REPORT.md; canonical approval receipts and this report |

All 11 TP tasks are fulfilled at their applicable delivery phase; all eight criteria and 24 technical scenarios are covered. T-REVIEW and T-CLOSE now include completed review/reconciliation work and deliberate QA/UAT decisions. No future Git or publication task is silently included. Brownfield owners and the approved design remain intact; no parallel authority, persistent migration, new public tool, operation or input selector was introduced.

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Commit, push, PR, merge and publication | Outside the current authorization; all foreign staging remains preserved | Explicit later user instruction and delivery-closeout |
| Installed-plugin updates, other-host or native Linux qualification | Not part of the approved technical delivery boundary; the unsupported-platform test uses a labeled simulation on macOS | Separately authorized qualification scope |
| General statistical agent-reliability or independent human/security certification | Two normal T7 observations and cooperative agent reviews do not establish those claims | Separately defined evidence obligation if requested |
| Additional real sessions, retries/resume, account or credential work | Both approved cohorts are consumed; no additional allowance exists | No action within this completed Run |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Exact source and candidate applicability | evidence/direct-fix-04/assessment.json and separate post-fix-candidate.json | All 19,339 original frozen paths checked; only the disclosed test assertion differs; runtime, guard, task/audit, assembly, dependency and UI inputs unchanged | direct |
| Deterministic acceptance, protocol and native type visibility | Current pair-* checks and 53 reverified evidence references for 24 scenarios | 247,003 SDK cases; 160 frozen outcomes; 24-input replay with 15 original invalid calls rejected; actual renderer and modern/legacy STDIO compatibility | direct |
| Real native qualification | evidence/qualification/pair-guidance-01/native-summary.json and retained original session/controller files | Two gpt-6.1-sol/low sessions on CLI 0.163.0, Node 22.22.3, darwin x64/24.6.0; each four calls/zero errors, complete trace and protected data preserved | direct |
| Test correction | evidence/direct-fix-04/darwin.log and platform.log | Four complete actual macOS synthetic groups plus one affected simulated branch pass; zero real models | direct |
| Normal canonical build, budgets and fixed performance | Current build/profile/provenance and original unchanged fixed-performance evidence | 56 deterministic compatibility cases; Inspect 4,993 bytes; command aggregate 23,254 and command/decision aggregate 24,509; Copilot 397 files/3,509,461 bytes; cold/warm p95 701.422/426.184 ms within unchanged limits | direct |
| Immutable retention and preservation | 626 original/retained prestudy pairs; ten current-native file pairs; preservation-uat-closeout-06.json | Historical successes/failures, old ledgers, complete other control files, foreign staging/untracked data and protected settings preserved | direct |
| Current formal quality and deliberate acceptance | Registered review/QA artefacts, QA operation 04608ce3-11be-40d9-9e30-a0892aa48974 and UAT operation cb685df2-c3ab-4dca-9c4d-bf65d91f8d5f | No applicable open normalized finding; QA pass deliberately accepted and UAT deliberately recorded | direct |

There were exactly four real sessions across two authorized cohorts: the original cohort retains its actual 1/2 PRD call/error outcome; the final cohort qualifies 2/2. The final historical native manifest and raw observations remain immutable after the direct test-only correction. Explicit unchanged-runtime applicability supports retained native qualification; it is not a claim of newly executed sessions on a revised test manifest. No extra model, predicate relaxation, provider fallback or source resampling was used.

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| None for the accepted bounded delivery | warn | none; retain the exact current evidence |
| Other-host/native Linux, installed-release and independent certification proof are not claimed | warn | none in this Run; define separate scope only if requested |
| Permission-denial and cost metrics remain unavailable where originally reported | warn | Preserve that unavailability; no estimate is substituted |

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Inspect has seven bytes of definition headroom and Copilot is exactly at its unchanged ceiling | warn | Future changes must pass canonical budget/profile checks; do not raise limits or remove required files |
| Two native successes are bounded samples of the named normal T7 workflow | warn | Maintainer retains exact tuple and qualification limits; do not infer general model reliability |
| Guard evidence and agent reviews rely on their stated trusted local execution/review boundary | warn | Do not present cooperative controls as independent security or human certification |

No unresolved implementation defect, mandatory missing evidence, open normalized finding, source-of-truth drift or blocking Brownfield/solution-integrity issue remains. Optional omission of failed advisory navigation is the approved steady-state policy under SDD-003. It never alters the primary report or evaluator error, and is not a temporary fallback with an outstanding cleanup requirement. No additional fallback, workaround or parallel owner requires an exit plan.

## Parent Reconciliation Handoff

The following projection is copied from the canonical Delivery Map at revision 34, without sibling discovery, inferred parentage or Parent mutation:

- outcome: not_applicable
- target_run_id: none; evaluator returned an empty target
- disposition: not_applicable
- evidence: no qualifying Parent relationship; evaluator evidence is empty
- missing_evidence: none
- next_action: none

## Programme Aggregation Readiness

Not applicable. Delivery Map returned applicable:false, startable:false, final_ready:false, acceptance_ref empty, evidence empty, missing_evidence empty and next_action:none. No programme-readiness or approval claim is made.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Existing canonical owners and graph bytes are unchanged; evidence/direct-fix-04/final-scope.json and evidence/checks/preservation-uat-closeout-06.json verify this bounded selected-Run scope.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Exact qualification, explicit direct-fix provenance and acceptance are Run-specific evidence under the existing delivery owner; no global memory or source-of-truth registry change is required.
- memory_refs: DIRECT_FIX_AUTHORIZATION_04.md; QA_REPORT.md; evidence/direct-fix-04/assessment.json; evidence/direct-fix-04/final-scope.json; evidence/qualification/pair-guidance-01/native-summary.json

## Next Permissible Step

- next_allowed_action: Retain the formally completed delivery and its exact evidence for an explicit subsequent version-control handoff instruction.
- required_approval: none
- forbidden_until_then: Automatic commit, push, PR, merge, installation, release, publication, extra native execution or foreign-work cleanup.

Quality outlook: The approved bounded scope is accepted and complete with documented qualification limits. A separate delivery-closeout is useful only for a later expressly requested operative Git handoff.

## Approval

OR does not approve later gates. It records the next permissible step. All six user gates were deliberately approved before this closeout; this report creates no additional human approval gate and no VCS authority.
