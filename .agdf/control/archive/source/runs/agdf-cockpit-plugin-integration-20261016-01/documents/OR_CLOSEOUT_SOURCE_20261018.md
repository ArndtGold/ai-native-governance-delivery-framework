# OR: Integrated AGDF Cockpit — accepted bounded internal use

Gate: OR
Type: Orchestration Report
Report mode: OR-full
Status: done

## Run

- run_id: agdf-cockpit-plugin-integration-20261016-01
- related_ur: .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/UR.md
- related_prd: .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/PRD.md
- related_sd: .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/SD.md
- related_tp: .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/TP.md
- related_qa_report: .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/QA_REPORT.md
- mode_slice_decision: structured_delivery
- current_gate: OR
- decision: pass
- qa_acceptance: accepted_with_deviations
- accepted_qa_deviations_digest: sha256:13158280dd17817f129c1725bc2ac25e870bcf32f4a451094df5a0e0a8ca63a7

The pass above denotes completion of this accepted closeout. Technical QA remains revise; CPI-E01 remains open under exact human acceptance. No native production qualification is asserted.

## Gate State

| Gate or step | Status | Evidence |
|---|---|---|
| UR | approved | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/UR.md |
| Brownfield Review | done | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/BROWNFIELD_REVIEW.md |
| Mode/Slice Decision | structured_delivery | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/BROWNFIELD_REVIEW.md |
| PRD | approved | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/PRD.md |
| SD | approved | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/SD.md |
| TP | approved | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/TP.md |
| Brownfield Analysis | done | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/BROWNFIELD_ANALYSIS.md |
| CD+Tests | done | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/CD_TESTS.md |
| CR | done | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/CODE_REVIEW.md |
| QA | approved | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/QA_REPORT.md |
| UAT | approved | `Approval: UAT` · 2026-10-18 · revision 51 · presentation 7faa42ca-86b0-44ec-be8f-771c2a749dad sha256:06e752d0a17285ff013d513a8bfe77261edd80636826304d9a2122ff74726383 |
| TP Review | revise | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/TP_REVIEW.md |
| Clean Implementation Review | done | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/CLEAN_IMPLEMENTATION_REVIEW.md |

QA acceptance: operation c2290974-3ece-4926-987d-5f37f15e50ac at revision 51. UAT: operation b617bd51-0f70-4a04-9559-afe2b81c38cb at revision 52. Every user gate is recorded. TP Review remains revise: eight tasks fully done, T-008 partial; the remaining native evidence is CPI-E01, accepted for this bounded use.

## Run Status Card

| Run status | Value |
|---|---|
| Status | Completed for accepted bounded internal use on recording this OR |
| Current gate | OR |
| Allowed now | Prepare delivery handoff |
| Blocked by | No remaining closeout gate blocker; CPI-E01 retained as accepted evidence limit |
| Missing approval | none |
| Next step | Offer the reviewed change for an explicitly requested commit |
| Quality outlook | Future runtime verification before broader native production claims |

## Delivered

| Item | Evidence |
|---|---|
| Cockpit packaged and installed through the AGDF plugin; visible feature Cockpit, technical server agdf-cockpit | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/CD_TESTS.md; .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/PLUGIN_DISCOVERY_NATIVE_20261018.md |
| Correct project binding, contained canonical reads and acknowledged context/session cleanup | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/TERMINAL_NATIVE_RESULT_20261018.md |
| Closed chat card no longer flickers according to the latest direct user confirmation | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/TERMINAL_RECONCILIATION_REPAIR_20261018.md |
| Project-scoped public origin discovery and reversible retirement of owned Legacy entry | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/PROJECT_ORIGIN_DISCOVERY_FIX_20261018.md; .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/LEGACY_RETIREMENT_APPLIED_20261018.md |
| Architecture and compatibility documentation with separate source/package/native evidence boundaries | docs/architecture/06-agdf-cockpit.md; docs/compatibility/HOST_COMPATIBILITY.md |
| Large Run Objective and approved localized prose reader repairs, with focused regressions and public CLI proof | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/RUN_OBJECTIVE_READER_FIX_20261018.md; .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/LOCALIZED_UR_READER_FIX_20261018.md |

Brownfield fit: existing plugin packaging, lifecycle, runtime, Core read/context and shared writer owners were reused. No additional setup authority, gate writer or control store was introduced. Code Review and Clean Implementation Review passed their recorded evidence dimensions; the later small reader repairs have separate focused source/test evidence in the linked notes and are not silently added to those sealed reviews.

## Not Delivered / Intentionally Deferred

| Item | Reason | Next owner or gate |
|---|---|---|
| Complete native clean/same-key/destructive lifecycle and Decision coexistence coverage | CPI-E01 accepted with medium risk; no further restart requested | AGDF runtime/evidence owner before broader qualification |
| Final Desktop refresh after Legacy retirement and final publication settlement | Current Desktop may retain an earlier connection; qualification_pending and rollback remain | Existing publication owner after independent fresh proof |
| Installing the two final Core reader repairs into the loaded immutable plugin runtime | Public repository CLI carries the tested repair; installed Desktop candidate was preserved | Normal package build and installation owner in a subsequent requested update |
| Commit, push, PR, npm/marketplace publication and release | Outside the approved delivery scope and no explicit action instruction | User instruction and applicable VCS/release owners |

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Implementation and automated tests | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/CD_TESTS.md | Approved TP tasks and explicit partial native obligation | direct |
| Scoped review dimensions | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/CODE_REVIEW.md; .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/CLEAN_IMPLEMENTATION_REVIEW.md; .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/TP_REVIEW.md | CR/Clean pass, TP Review revise and exact CPI-E01 scope | direct |
| Current native close/context trace and direct user confirmation | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/TERMINAL_NATIVE_RESULT_20261018.md; .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/TERMINAL_RECONCILIATION_REPAIR_20261018.md | Native replacement journey and terminal card behavior; no broad lifecycle claim | direct |
| Guarded migration | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/evidence/project-origin-fix-20261018/qualified-transition.json; .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/LEGACY_RETIREMENT_APPLIED_20261018.md | Owned project Legacy entry disabled, fresh CLI replacement connected, unrelated configuration preserved | direct |
| Protected-source and current UAT readiness proof | .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/evidence/localized-ur-reader-fix-20261018/protected-sources.json; .agdf/control/artefacts/agdf-cockpit-plugin-integration-20261016-01/evidence/localized-ur-reader-fix-20261018/cli-gate-check.json | Approved bytes unchanged and repaired public CLI UAT readiness | direct |
| Exact QA/UAT deliberate acceptance | Stored approval operations c2290974-3ece-4926-987d-5f37f15e50ac and b617bd51-0f70-4a04-9559-afe2b81c38cb | Bounded scope with accepted deviations, not a technical QA pass | direct |

Reader verification: decision-content regression, report parser compatibility/context, immutable presentation, QA deviation acceptance and command-service suites passed. No test converts a missing native scenario into a pass. The installed cebb candidate retains UI digest sha256:2832b1d94a43656c8af2201ade0a8b4236e621af6acbe7b542ea0534bb128d86; later Core source repairs have not changed that installed tuple.

## Missing Evidence

| Missing evidence | Impact | Required next step |
|---|---|---|
| CPI-E01: broader native clean/same-key/destructive lifecycle/Decision coexistence and final post-retirement Desktop refresh | warn | Retain exact accepted scope; obtain independent proof during a future ordinary Host refresh or supported test context before claiming broader production qualification |

Technical QA remains revise and TP T-008 remains partial. These are accepted evidence limits, not asserted successes.

## Risks And Open Items

| Risk or open item | Impact | Owner or mitigation |
|---|---|---|
| Running Desktop may cache its prior connection | warn | Internal read-only use only; fresh CLI proves replacement discovery, not Desktop refresh |
| Original runtime and guarded publication rollback are retained | warn | Existing publication owner; cleanup only after missing qualification evidence and supported final settlement |
| Repository reader repairs are not installed in the immutable Desktop/MCP candidate | warn | Use the tested public repository CLI for this closeout; future normal build/update, never patch immutable cache |
| No further restart requested by the user | warn | Preserve accepted boundary; do not reopen manual UI testing as a closeout prerequisite |

## Parent Reconciliation Handoff

- outcome: not_applicable
- target_run_id: none
- disposition: not_applicable
- evidence: Delivery Map evaluates no declared qualifying parent relationship for this Run.
- missing_evidence: none
- next_action: none

## Programme Aggregation Readiness

Not applicable according to the evaluated programme_aggregation projection (applicable false). No programme readiness or approval is asserted.

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: Consistent with the approved QA context disposition: exact Run-specific installation, migration and host evidence stays in this artefact chain. No shared Context Graph obligation is declared for this closeout; unrelated historical nodes remain untouched.

## Knowledge Persistence Decision

- memory_target: scope_artifact
- memory_reason: Preserve exact tuple, deliberate acceptance and limits in this Run rather than creating a parallel global source of truth.
- memory_refs: QA_REPORT.md; TP_REVIEW.md; LEGACY_RETIREMENT_APPLIED_20261018.md; RUN_OBJECTIVE_READER_FIX_20261018.md; LOCALIZED_UR_READER_FIX_20261018.md; OR.md

## Next Permissible Step

- next_allowed_action: Offer the reviewed change for an explicitly requested commit through delivery-closeout.
- required_approval: none
- forbidden_until_then: No automatic commit, push, PR, release, publication settlement or deletion of retained rollback. No claim of complete native production qualification.

Quality outlook: future runtime verification before broader native production qualification. No further Desktop restart is requested for the accepted scope.

## Approval

QA was explicitly accepted with deviations; UAT was separately approved for the exact presented material. This OR records completion of that bounded delivery and does not approve any new gate, runtime update or VCS/release action.
