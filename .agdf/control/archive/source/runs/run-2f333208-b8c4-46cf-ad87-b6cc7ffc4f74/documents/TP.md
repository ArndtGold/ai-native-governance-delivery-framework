# TP: Planned URs, backlog-free Core and optional Codex planning

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-31
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

Approved sources: PRD sha256:3e14f3908832efaf379a4322e1bb4e36ab6c1fe9be418411617497e8cc07e2d9; SD sha256:f79cb2eff15ed2616cca559ff913c51216da840b9df73527fdfeb862b3ac8e8d. Bound Review/UX remain analytical input. This renews the user-requested refined TP under the newly approved CLI-only PRD/SD: preserve task/scenario identities and acceptance/design, replace repetitive execution prescriptions with eight shared batches and risk-based fault selection. Native host qualification is Codex CLI only, Core-only and Core plus the optional planning package. SCN-026 moves to automated UI group G-05/task T-009; no native Desktop/Cockpit qualification is claimed. No feature tests or implementation are claimed completed.

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | After TP approval, perform and record mandatory Brownfield preparation: current owners, dirty-path preservation, dependencies and changed recovery boundaries. | Codex implementation owner | Approval: TP |
| T-002 | Implement layout/v3 admission and independent claims/maintenance epoch; preserve exact historical decoding; verify G-02. | Codex Core owner | T-001 |
| T-003 | Implement contained planned-entry format, CAS, atomic writes and entry-local recovery; verify G-01. | Codex Core owner | T-002 |
| T-004 | Extend the shared UR owner and strict pre-Run/material scopes without changing Run authority; verify G-01/G-06. | Codex Core/CLI owner | T-003 |
| T-005 | Remove new-layout backlog coupling from Run writers/scaffolds; add v6 Run-local journals, retained legacy recovery and G-02. | Codex persistence owner | T-002 |
| T-006 | Implement compound handoff, protected origin/snapshot and bounded projection; verify G-03. | Codex persistence owner | T-003; T-004; T-005 |
| T-007 | Derive shared planned/Run inventory, ordering and source-bound selectors; verify G-05. | Codex inventory owner | T-003; T-005; T-006 |
| T-008 | Implement snapshot-bound legacy preview/apply/recover and audited active-state migration; verify G-04 on copies, actual preview read-only. | Codex migration owner | T-002 through T-007 |
| T-009 | Integrate CLI/MCP and Cockpit DTO/session/UI/locales consistently; verify G-05/G-06. | Codex adapter/UI owner | T-004; T-006; T-007; T-008 |
| T-010 | Add the separate optional Codex planning package through existing build/install owners; negotiate Core, copy no UR/runtime/server. | Codex plugin/build owner | T-004; T-006; T-009 |
| T-011 | Regenerate, register checks in canonical npm/CI inventory, execute G-07 and retain exact candidate identities; reconcile required current-head CI before merge. | Codex build/CI owner | T-002 through T-010 |
| T-012 | Execute G-08 Codex CLI Core-only and planning-plugin cases in isolated fixtures; retain actual observations and gaps. | Codex native owner | T-006; T-009; T-010; T-011 local candidate checks; required access |
| T-013 | Complete mandatory TP/Clean/Code reviews and final QA using shared proof; reconcile existing context/docs. Human QA/UAT/OR and VCS remain their existing steps. | Existing review/QA owners; Arndt Gold retains acceptance | T-001 through T-012; required proof valid |

Work stays in the dedicated agdf/planned-urs-masterbacklog-replacement worktree. Dependencies describe sequencing, not agent delegation. T-001 confirms actual touched owners and invalidated evidence before implementation.

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-003 | T-005 | SCN-001 | New-layout init and ordinary create/record/approve/revise/close/recovery succeed without a live backlog and never recreate or lock it. | G-02 shared candidate-bound report; named SCN-001 result |
| AC-001 | SDD-008 | T-002 | SCN-002 | v3 current state and historical v2 are distinguished; unsupported future state rejects before any mutation; new layout has no required live backlog. | G-02 shared candidate-bound report; named SCN-002 result |
| AC-001 | SDD-011 | T-011 | SCN-003 | Generated scaffolds, packaged Core and executable help agree on new-layout requirements; clean assembly does not reintroduce the backlog. | G-07 shared candidate-bound report; named SCN-003 result |
| AC-002 | SDD-001 | T-003 | SCN-004 | Capture, incomplete save, refinement and priority edit produce one current metadata-bearing UR with stable identity and normal default, leaving unrelated entries unchanged. | G-01 shared candidate-bound report; named SCN-004 result |
| AC-002 | SDD-002 | T-004 | SCN-005 | Typed pre-Run creation/replacement works with exact planning scope and material identity without any Run/revision identifiers. | G-01 shared candidate-bound report; named SCN-005 result |
| AC-002 | SDD-010 | T-003 | SCN-006 | Stale digest, duplicate/mismatched ID, invalid priority, unsafe link, invalid UTF-8 and oversized input reject without partial replacement or foreign-byte changes. | G-01 shared candidate-bound report; named SCN-006 result |
| AC-003 | SDD-001 | T-004 | SCN-007 | The same canonical UR content/template/readiness rules diagnose equivalent planning and Run content consistently; incomplete drafts are saveable but not handoff-ready. | G-01 shared candidate-bound report; named SCN-007 result |
| AC-003 | SDD-002 | T-004 | SCN-008 | Planning dispatch/staging cannot create or approve a Run; mixed planning/Run envelopes and cross-scope grants reject, preserving existing Run-bound checks. | G-01 shared candidate-bound report; named SCN-008 result |
| AC-003 | SDD-010 | T-004 | SCN-009 | Missing/unsafe template, stale capability/source binding and instruction-like UR content cannot cause fallback file writes, approval or unbound start. | G-01 shared candidate-bound report; named SCN-009 result |
| AC-004 | SDD-005 | T-007 | SCN-010 | Mixed planned, handed-off, active and ended sources yield deterministic categories/titles/order/counts and include Runs without backlog membership; inspection changes no bytes. | G-05 shared candidate-bound report; named SCN-010 result |
| AC-004 | SDD-010 | T-009 | SCN-011 | The visible overview distinguishes successful empty, partial, invalid and unavailable results; a stale item selector offers refresh and never opens another source. | G-05 shared candidate-bound report; named SCN-011 result |
| AC-005 | SDD-002 | T-012 | SCN-012 | Fresh native Codex with only compatible Core captures via shared UR mode, inspects and explicitly starts the selected fixture; direct Run creation remains available. | G-08 shared candidate-bound report; named SCN-012 result |
| AC-005 | SDD-006 | T-012 | SCN-013 | Fresh native Codex discovers the separately enabled planning plugin and completes clarification/priority through the one Core UR owner; no second MCP server/template is used. | G-08 shared candidate-bound report; named SCN-013 result |
| AC-005 | SDD-011 | T-010 | SCN-014 | Core-only and optional-package archives/install choices are distinct; missing/incompatible Core is diagnosed before mutation and disabling the extension preserves data. | G-07 shared candidate-bound report; named SCN-014 result |
| AC-006 | SDD-004 | T-006 | SCN-015 | Explicit current-source handoff publishes one Run with exact unapproved UR, immutable protected origin/snapshot and no transferred approval; Run publication is the observed commit point. | G-03 shared candidate-bound report; named SCN-015 result |
| AC-006 | SDD-010 | T-006 | SCN-016 | Changed, incomplete, unsafe or unavailable source rejects without an unintended Run or silent source substitution; refresh/reselection is the offered recovery. | G-03 shared candidate-bound report; named SCN-016 result |
| AC-007 | SDD-004 | T-006 | SCN-017 | Every new or changed semantic commit/ownership boundary has interruption coverage; recovery follows the actual commit point and original UUID replay returns the same Run. Unchanged primitives use justified existing proof. | G-03 shared candidate-bound report; named SCN-017 result |
| AC-007 | SDD-009 | T-006 | SCN-018 | Concurrent starts of one entry serialize only on that entry; a different UUID cannot duplicate a completed transfer, while an independent entry can progress. | G-03 shared candidate-bound report; named SCN-018 result |
| AC-007 | SDD-010 | T-006 | SCN-019 | Lost response, changed replay payload, missing completion pointer or added foreign output preserves source/unknown evidence; origin detects the existing Run and unsupported cleanup rejects. | G-03 shared candidate-bound report; named SCN-019 result |
| AC-008 | SDD-007 | T-008 | SCN-020 | Legacy fixture preview/apply accounts for every row and preserved prose/bytes; valid references associate uniquely, ambiguous/custom/orphan/history rows stay preserved and explicit. | G-04 shared candidate-bound report; named SCN-020 result |
| AC-008 | SDD-008 | T-008 | SCN-021 | Active v2 current state advances with an audited revision to v3 with valid existing approvals/artefacts and archived prior bytes; ended v2/history stay byte-identical; old pending presentations become stale. | G-04 shared candidate-bound report; named SCN-021 result |
| AC-008 | SDD-009 | T-008 | SCN-022 | Legacy v1-5 backlog journals prevent affected cutover; interruption before/after config commit rolls back/forward only exact owned effects, and unknown ownership retains the maintenance marker. | G-04 shared candidate-bound report; named SCN-022 result |
| AC-009 | SDD-003 | T-005 | SCN-023 | Two independent real processes complete Run/entry mutations while the other is deliberately paused with its local journal; no shared backlog lock or unrelated-v6 exclusion occurs. | G-02 shared candidate-bound report; named SCN-023 result |
| AC-009 | SDD-009 | T-002 | SCN-024 | Admission/maintenance race permutations drain already admitted effects, reject late entrants safely and preserve unknown claims; same-resource stale revisions still reject. | G-02 shared candidate-bound report; named SCN-024 result |
| AC-010 | SDD-002 | T-009 | SCN-025 | CLI and actual MCP transport expose equivalent bounded diagnostics and original-operation recovery for planning/Run envelopes without shell-only or arbitrary-path fallbacks. | G-06 shared candidate-bound report; named SCN-025 result |
| AC-010 | SDD-005 | T-009 | SCN-026 | Automated Cockpit component/browser fixtures visibly show source identity, draft/Run state and actionable retry/refresh for partial/stale/transient cases; opening/selecting cannot start or approve. Native Desktop qualification is not claimed. | G-05 shared candidate-bound UI report; named SCN-026 result |
| AC-010 | SDD-010 | T-009 | SCN-027 | Invalid/unsafe/unavailable/uncertain sources keep typed uncertainty and a concrete allowed next action; source instructions never execute and readers never recover or write. | G-06 shared candidate-bound report; named SCN-027 result |
| AC-011 | SDD-006 | T-012 | SCN-028 | Candidate-bound installed Core and optional plugin are discovered and invoked on the observed client/OS; emitted capability/template identities match the built candidate. | G-08 shared candidate-bound report; named SCN-028 result |
| AC-011 | SDD-008 | T-011 | SCN-029 | Preserved old 0.20.2 runtime rejects a v3 fixture and cannot create in a new-layout store lacking its mandatory backlog; candidate retains supported legacy recovery/history behavior. | G-02 shared candidate-bound report; named SCN-029 result |
| AC-011 | SDD-011 | T-011 | SCN-030 | Canonical npm/CI inventory includes every added check, clean generation/package/UI checks pass, and required CI is verified against the actual authorized PR head/merge candidate before merge. | G-07 shared candidate-bound report; named SCN-030 result |
| AC-006 | SDD-004 | T-012 | SCN-031 | Native planning dialogue deliberately hands its displayed selected source to one fixture Run, shows source/Run linkage and stops at ordinary UR review without approval inference. | G-08 shared candidate-bound report; named SCN-031 result |
| AC-007 | SDD-004 | T-012 | SCN-032 | Native repetition/inspection of the original fixture handoff returns the same Run link and visible status, without another creation or changed source. | G-08 shared candidate-bound report; named SCN-032 result |
| AC-008 | SDD-007 | T-008 | SCN-033 | Candidate read-only migration preview covers the actual worktree legacy input, including all unparsed material, with no config, Run, backlog, journal or planned-entry byte mutation. | G-04 shared candidate-bound report; named SCN-033 result |

The 33 IDs are coverage/scenario mappings, not 33 independent command runs. Each points to exactly one primary group below. One actual command/report may support multiple rows and reviews when the named scenarios and applicable source/environment are covered. Keep existing IDs for comparison; add cases only for an uncovered obligation or changed boundary, not to manufacture another count.

## 3. Test Plan

### Execution order, timing and completion

1. Local feedback: execute only the groups affected by the current edit, with their invalidated dependencies. Reuse current applicable results; do not run all groups after every task.
2. Integration/QA: complete all required group obligations and mandatory TP/Clean/Code reviews. Missing critical, native or visible evidence remains an explicit gap and blocks the affected claim. A group is complete when required scenarios have valid source/candidate-bound proof and no unresolved contradiction; another gate or mapping is not a rerun trigger.
3. Merge: all required canonical CI jobs must pass for the actual authorized PR head or corresponding merge candidate. Targeted local success does not replace CI. If a QA claim requires CI not yet available, keep it open and obtain concrete publication authority at the appropriate stage.
4. Additional local full/nightly runs require a concrete uncovered/broad regression, changed dependency/environment or uncertain evidence applicability. Mandatory CI and reviews are retained.

G-01 through G-06 execute after their owners are ready; G-07 provides current generated/package inputs for downstream adapter/native checks; G-08 follows a valid candidate. Groups are batches, not a promise of eight commands or a measured runtime budget. Share fixture constructors and setup within a group; use a fresh isolated instance for a destructive case so faults cannot contaminate another result.

Current executable inventory remains package.json scripts plus scripts/ci-plan.mjs/verify-ci.mjs and required workflows. Existing CI covers Linux Node 22/24 and Windows Node 22. T-011 registers new source files/scripts and actual duration needs through these owners; no duplicate workflow test list. New filenames/scripts below are planned entrypoints, not existing or executed tests.

### G-01 — Planned entries and shared UR authoring

Covers SCN-004 through SCN-009. Run once per relevant candidate:
- node --test packages/core/test/planned-entry-test.js packages/core/test/planned-authoring-test.js

Reuse one disposable-project/material/UR fixture builder. Cover capture, incomplete save, refinement, priority/default, CAS and unchanged unrelated bytes; invalid/duplicate/unsafe/oversized inputs; common template/readiness; scope separation and no inferred Run/approval. The internal command service proves the owner behavior here. G-06 adds actual packaged transport checks without duplicating this whole boundary matrix. Keep existing Run-mode protections and applicable authoring regression proof.

Prerequisites: implemented T-003/T-004, Node 22, temporary filesystem/material access. Owner: Core/authoring test owner. Evidence: named cases, expected digests/diagnoses and no unauthorized effects. A missing fixture/template/capability is a gap to repair, never permission for a copied template or fake Run.

### G-02 — Run transactions, admission and compatibility

Covers SCN-001, SCN-002, SCN-023, SCN-024 and SCN-029:
- node --test packages/core/test/planned-run-transaction-test.js packages/core/test/planned-control-version-test.js packages/core/test/planned-concurrency-test.js

Reuse existing Run creation, operation, seal, revision, approval, closure and legacy fixtures. Verify ordinary new-layout operations without a live backlog; future/v3/v2 admission; controlled independent-process progress; same-resource rejection; maintenance admission race orderings and uncertain claims. Use deterministic barriers and a bounded watchdog, not sleep duration as proof.

For SCN-029, reuse one verified immutable pre-feature 0.20.2 runtime across the cases, recording its digest. Execute it against a disposable v3/new-layout fixture to observe rejection, including its missing mandatory backlog prerequisite. Candidate tests retain original historical receipt policies and at least the applicable positive/negative fixtures for each supported legacy journal version 1-5. Broaden legacy regression if dispatch, validation or primitive dependencies changed; never relax old expected results.

Prerequisites: T-002/T-005, local child processes/temp targets and verified old runtime (after candidate build where needed). Owner: persistence/compatibility test owner. Evidence: actual operation results, event order, exact history/foreign-byte checks and no unrelated-Run exclusion. Missing old runtime or failed invariant stays an explicit gap.

### G-03 — Handoff and recovery

Covers SCN-015 through SCN-019:
- node --test packages/core/test/planned-handoff-test.js

One shared handoff/staging fixture supplies current/stale/incomplete/unsafe cases, origin/snapshot integrity, same/different-UUID replay, lost response, concurrent starts and foreign outputs. Deep fault injection runs at the Core transaction owner here. G-06 checks transport uncertainty/identity with representative cases; G-08 observes the native flow. Neither repeats the complete fault matrix.

Select fault points from changed semantic ownership/durability boundaries:
- durable intent established before owned outputs;
- partial new source/origin outputs and staged Run before publication;
- immediately before and after Run publication, the actual commit point;
- committed Run before entry completion, and completed effect before intent retirement.

Each distinct new/changed recovery branch needs an interruption case and observable outcome. Do not multiply identical primitive failures by every file, criterion, caller or host. Existing atomic temp/write/fsync/rename tests are reusable only when helper implementation, options, containment assumptions and platform applicability remain unchanged. Changed wrappers/output ownership or missing proof require new targeted cases. The before/after commit invariants, no-loss/no-duplicate outcome and foreign-byte protection are never removed.

Prerequisites: T-006, controlled local processes/hooks, original UUID/source and isolated target. Owner: persistence test owner. Evidence: selected-boundary matrix, receipts/Run counts and exact preservation. Unknown ownership/outcome stays protected; no journal deletion to force progress. This is process-interruption evidence, not physical power-loss qualification.

### G-04 — Migration and real-input preview

Covers SCN-020 through SCN-022 and SCN-033:
- node --test packages/core/test/planned-layout-migration-test.js
- npm --prefix packages/cli run test:control-maintenance (reuse the valid existing result if unchanged/applicable)
- candidate planned_layout.preview via its supported CLI/MCP reader, read-only on the confirmed worktree

Reuse one legacy corpus with normal/ambiguous/duplicate/orphan/history rows, custom prose, active approvals, ended v2 sources and journals 1-5. Keep raw byte/row accounting. Exercise changed migration boundaries: durable maintenance/snapshot intent, partial per-Run/entry publication, backlog retirement before config commit, config commit before cleanup and actual ownership-conflict branches. Select representative first/partial/final outputs where one code path repeats; do not multiply by every row or unchanged atomic primitive. Each different rollback/roll-forward branch still needs proof.

Verify active audited v3 state and retained approvals/old bytes, ended-v2 byte stability, stale pending presentations, legacy-journal exclusion, interrupted replay and foreign preservation. SCN-033 compares complete relevant control bytes before/after actual preview; no write, snapshot, journal or revision may appear. Apply/recover faults use disposable copies only.

Prerequisites: T-008, local fixture access, synthetic fixture approvals labeled as such; no real cutover authority used. Owner: migration test owner. Evidence: row/byte disposition and actual commit/recovery outcomes. Preserve ambiguous/unowned data on failure; do not reseal or migrate live state to manufacture success.

### G-05 — Inventory and browser presentation

Covers SCN-010, SCN-011 and SCN-026:
- node --test packages/core/test/planned-inventory-test.js
- npm --prefix packages/control-ui run typecheck
- npm --prefix packages/control-ui test
- npm --prefix packages/control-ui run test:browser -- planned-work.spec.mjs

Use one shared mixed-state fixture dataset for Core and components/browser. Check source-derived membership/title/priority/order/counts, no-backlog Runs, handed-off reference, active/ended meaning, stale selectors and complete/partial/unavailable/empty distinctions. Core validates derivation; components/browser validate visible consumption and permitted actions. Do not recreate deep writer faults in UI tests.

Prerequisites: T-007/T-009, current DTO/UI build, locked UI dependencies and available Chromium/local fixture service. Owner: inventory/UI test owner. Evidence: named Core/DOM/browser results and read-only/selection assertions. This is automated UI evidence. Per the user's CLI-only host-test decision, native Desktop/Cockpit qualification is outside this Run and is not claimed.

### G-06 — CLI/MCP transport parity

Covers SCN-025 and SCN-027:
- npm --prefix packages/cli run test:planned-authoring
- npm --prefix packages/mcp-server run test:planned-work

Use the existing generated CLI and actual locked-SDK STDIO harness. Representative integration cases cover one successful planning-to-handoff path, mixed/foreign/stale binding rejection, bounded paging/material, lost response with original-operation inspection, and actionable unsafe/partial/uncertain diagnosis. Assert that transport preserves the Core facts and readers produce no effects. Core owns the exhaustive semantic/fault variants in G-01/G-03/G-04.

Prerequisites: T-009, generated candidate and local SDK/temp access; no login/account changes. Owner: adapter test owner. Evidence: actual transport results/operation IDs and source/permission preservation. A transport gap is not cured by direct-file or shell-only execution.

### G-07 — Generation, packages and mandatory CI

Covers SCN-003, SCN-014 and SCN-030. Current UI build precedes shared package generation:
- npm --prefix packages/control-ui run build:mcp
- npm --prefix packages/cli run sync-package-assets
- npm --prefix packages/cli run test:canonical-init
- npm --prefix packages/cli run test:planning-plugin
- npm --prefix packages/cli run test:package-contents
- node scripts/ci-plan.mjs --matrix github --scope all --suite cli
- node scripts/ci-plan.mjs --matrix github --scope all --suite mcp

Use existing prepare/assembly/installer owners and impacted existing package/host checks. Verify separate explicit Core/optional install choices, clean build/provenance, dependency rejection, no duplicated runtime/template/server and retained data when the extension is disabled. Register planned checks in existing CLI smoke-test/MCP test and CI domains/budgets. Matrix generation checks inventory only; it is not test execution.

Before merge verify all actual required GitHub checks/jobs and their covered inventory at the authorized current head/merge candidate SHA. Extra local nested execution of the same valid constituent suite adds no evidence; reference its result. Full mandatory CI still runs according to workflow, including its platform coverage.

Prerequisites: T-010/T-011, locked build dependencies and separate VCS/publication authority when remote work becomes necessary. Owner: build/CI test owner. Evidence: candidate digests, clean-package results and available exact-head CI links. Failed/pending checks remain failed/pending and block applicable completion/merge.

### G-08 — Codex CLI host qualification only

Covers SCN-012, SCN-013, SCN-028, SCN-031 and SCN-032. Use one unchanged exact candidate and two fresh Codex CLI configurations: Core only, and Core plus the optional planning package. Share the report/results across these five mappings:
- N-CORE (SCN-012): fresh Codex CLI with compatible Core only. Capture/refine a ready planned UR through the shared owner, inspect source/priority and deliberately hand it off; separately confirm direct Run creation. Observe no inferred approval.
- N-PLUGIN (SCN-013/028/031/032): fresh Codex CLI with separately enabled Core plus optional planning package. One continuous fixture session proves discovery/capability identity, explicit planning dialogue/priority through one UR owner, selected-source handoff and same-operation inspection/replay returning the same Run. Stop at normal UR review; never approve/implement the fixture need.

The observed planning environment was Codex CLI 0.163.0 on Darwin x86_64; execution records the actual client/OS/architecture and installed Core/extension/resource digests again. Do not claim unchanged versions or expanded Windows/other-host native support from CI. CLI discovery/invocation and direct Core imports are distinct; a direct import is not native CLI qualification. No native Codex Desktop/Cockpit test is planned or claimed; SCN-026 is covered in G-05.

Prerequisites: T-012, validated installed candidate, current machine-level install/enablement authority and existing Codex CLI authentication. Owner: native qualification owner; Arndt Gold retains machine/account permissions. No login/credential work or automatic access acquisition. Use independent fixture projects, preserving other plugins/data; restore temporary selection only through its supported owner with known prior state.

Evidence: one bounded candidate-bound Codex CLI record with the two configurations, actual tool/operation/source outcomes and qualification limits. The N-PLUGIN result serves its four scenario mappings. If one procedure lacks access/capability, retain that specific gap without discarding valid other results, automatic completed-case reruns or fallback source writes. Infeasible delegation returns to the existing SD owner; native Desktop/Cockpit qualification remains outside the claimed scope.

### Reuse and invalidation rule

Reuse an existing result only with retrievable source/candidate/environment identity and a stated reason its covered behavior/dependencies are unchanged. A new code/dependency/schema/resource change, conflicting result, stale source, uncovered branch or unsupported environment invalidates affected proof. Rerun the affected group/subcase and dependent consumers; broaden when impact is uncertain. Successful unchanged cases are not rerun merely for another mapping, gate or report.

New critical behavior needs a negative case or feasible defect-detecting regression; green infrastructure or zero executed matching cases never suffices. Retain actual failures and limits. Process/lock/symlink platform differences are recorded and covered by relevant CI/host proof, without multiplying native testing across unsupported hosts.

Use existing CD+Tests/review evidence fields to reference shared reports and decisive logs. No new per-proof registry, status database or duplicate acceptance list. Do not copy raw prompts, credentials or unrelated machine/account data. Existing writer-owned receipts/history keep their original retention rules.

### Scenario routes and shared execution prerequisites

The references to G-01 through G-08 resolve to the concrete commands, environment, prerequisites, owner and failure policy above; these rows do not request another execution for each reference.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | G-02: executable batch above | G-02: environment above | G-02: prerequisites/permissions above | Codex persistence/compatibility test owner | G-02 shared result: named SCN-001 outcome | G-02: failure action above |
| AC-001 | SCN-002 | G-02: executable batch above | G-02: environment above | G-02: prerequisites/permissions above | Codex persistence/compatibility test owner | G-02 shared result: named SCN-002 outcome | G-02: failure action above |
| AC-001 | SCN-003 | G-07: executable batch above | G-07: environment above | G-07: prerequisites/permissions above | Codex build/CI test owner | G-07 shared result: named SCN-003 outcome | G-07: failure action above |
| AC-002 | SCN-004 | G-01: executable batch above | G-01: environment above | G-01: prerequisites/permissions above | Codex Core/authoring test owner | G-01 shared result: named SCN-004 outcome | G-01: failure action above |
| AC-002 | SCN-005 | G-01: executable batch above | G-01: environment above | G-01: prerequisites/permissions above | Codex Core/authoring test owner | G-01 shared result: named SCN-005 outcome | G-01: failure action above |
| AC-002 | SCN-006 | G-01: executable batch above | G-01: environment above | G-01: prerequisites/permissions above | Codex Core/authoring test owner | G-01 shared result: named SCN-006 outcome | G-01: failure action above |
| AC-003 | SCN-007 | G-01: executable batch above | G-01: environment above | G-01: prerequisites/permissions above | Codex Core/authoring test owner | G-01 shared result: named SCN-007 outcome | G-01: failure action above |
| AC-003 | SCN-008 | G-01: executable batch above | G-01: environment above | G-01: prerequisites/permissions above | Codex Core/authoring test owner | G-01 shared result: named SCN-008 outcome | G-01: failure action above |
| AC-003 | SCN-009 | G-01: executable batch above | G-01: environment above | G-01: prerequisites/permissions above | Codex Core/authoring test owner | G-01 shared result: named SCN-009 outcome | G-01: failure action above |
| AC-004 | SCN-010 | G-05: executable batch above | G-05: environment above | G-05: prerequisites/permissions above | Codex inventory/UI test owner | G-05 shared result: named SCN-010 outcome | G-05: failure action above |
| AC-004 | SCN-011 | G-05: executable batch above | G-05: environment above | G-05: prerequisites/permissions above | Codex inventory/UI test owner | G-05 shared result: named SCN-011 outcome | G-05: failure action above |
| AC-005 | SCN-012 | G-08: executable batch above | G-08: environment above | G-08: prerequisites/permissions above | Codex native qualification owner | G-08 shared result: named SCN-012 outcome | G-08: failure action above |
| AC-005 | SCN-013 | G-08: executable batch above | G-08: environment above | G-08: prerequisites/permissions above | Codex native qualification owner | G-08 shared result: named SCN-013 outcome | G-08: failure action above |
| AC-005 | SCN-014 | G-07: executable batch above | G-07: environment above | G-07: prerequisites/permissions above | Codex build/CI test owner | G-07 shared result: named SCN-014 outcome | G-07: failure action above |
| AC-006 | SCN-015 | G-03: executable batch above | G-03: environment above | G-03: prerequisites/permissions above | Codex persistence test owner | G-03 shared result: named SCN-015 outcome | G-03: failure action above |
| AC-006 | SCN-016 | G-03: executable batch above | G-03: environment above | G-03: prerequisites/permissions above | Codex persistence test owner | G-03 shared result: named SCN-016 outcome | G-03: failure action above |
| AC-007 | SCN-017 | G-03: executable batch above | G-03: environment above | G-03: prerequisites/permissions above | Codex persistence test owner | G-03 shared result: named SCN-017 outcome | G-03: failure action above |
| AC-007 | SCN-018 | G-03: executable batch above | G-03: environment above | G-03: prerequisites/permissions above | Codex persistence test owner | G-03 shared result: named SCN-018 outcome | G-03: failure action above |
| AC-007 | SCN-019 | G-03: executable batch above | G-03: environment above | G-03: prerequisites/permissions above | Codex persistence test owner | G-03 shared result: named SCN-019 outcome | G-03: failure action above |
| AC-008 | SCN-020 | G-04: executable batch above | G-04: environment above | G-04: prerequisites/permissions above | Codex migration test owner | G-04 shared result: named SCN-020 outcome | G-04: failure action above |
| AC-008 | SCN-021 | G-04: executable batch above | G-04: environment above | G-04: prerequisites/permissions above | Codex migration test owner | G-04 shared result: named SCN-021 outcome | G-04: failure action above |
| AC-008 | SCN-022 | G-04: executable batch above | G-04: environment above | G-04: prerequisites/permissions above | Codex migration test owner | G-04 shared result: named SCN-022 outcome | G-04: failure action above |
| AC-009 | SCN-023 | G-02: executable batch above | G-02: environment above | G-02: prerequisites/permissions above | Codex persistence/compatibility test owner | G-02 shared result: named SCN-023 outcome | G-02: failure action above |
| AC-009 | SCN-024 | G-02: executable batch above | G-02: environment above | G-02: prerequisites/permissions above | Codex persistence/compatibility test owner | G-02 shared result: named SCN-024 outcome | G-02: failure action above |
| AC-010 | SCN-025 | G-06: executable batch above | G-06: environment above | G-06: prerequisites/permissions above | Codex adapter test owner | G-06 shared result: named SCN-025 outcome | G-06: failure action above |
| AC-010 | SCN-026 | G-05: executable batch above | G-05: environment above | G-05: prerequisites/permissions above | Codex inventory/UI test owner | G-05 shared result: named SCN-026 outcome | G-05: failure action above |
| AC-010 | SCN-027 | G-06: executable batch above | G-06: environment above | G-06: prerequisites/permissions above | Codex adapter test owner | G-06 shared result: named SCN-027 outcome | G-06: failure action above |
| AC-011 | SCN-028 | G-08: executable batch above | G-08: environment above | G-08: prerequisites/permissions above | Codex native qualification owner | G-08 shared result: named SCN-028 outcome | G-08: failure action above |
| AC-011 | SCN-029 | G-02: executable batch above | G-02: environment above | G-02: prerequisites/permissions above | Codex persistence/compatibility test owner | G-02 shared result: named SCN-029 outcome | G-02: failure action above |
| AC-011 | SCN-030 | G-07: executable batch above | G-07: environment above | G-07: prerequisites/permissions above | Codex build/CI test owner | G-07 shared result: named SCN-030 outcome | G-07: failure action above |
| AC-006 | SCN-031 | G-08: executable batch above | G-08: environment above | G-08: prerequisites/permissions above | Codex native qualification owner | G-08 shared result: named SCN-031 outcome | G-08: failure action above |
| AC-007 | SCN-032 | G-08: executable batch above | G-08: environment above | G-08: prerequisites/permissions above | Codex native qualification owner | G-08 shared result: named SCN-032 outcome | G-08: failure action above |
| AC-008 | SCN-033 | G-04: executable batch above | G-04: environment above | G-04: prerequisites/permissions above | Codex migration test owner | G-04 shared result: named SCN-033 outcome | G-04: failure action above |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Shared execution batches and fault selection | SD: Executable scenarios and fault checkpoints | resolved | Preserve all 33 stable scenario mappings in eight groups; execute shared fixtures/results once, select every changed semantic durability/ownership branch and reuse valid unchanged atomic proof. G-08 has two Codex CLI configurations; SCN-026 uses G-05 automated UI evidence; all required CI remains intact. | Arndt Gold |
| Proof completion and invalidation | TP | resolved | Required valid outcomes and no contradictions complete a group; rerun only changed/invalidated/contradictory or uncovered proof, broadening for uncertain impact. Another gate/row alone adds no run. | Arndt Gold |
| Isolation and authority | TP | resolved | Destructive/fault/cutover work uses disposable projects. Actual worktree preview is read-only. Preserve current Run/main/foreign state; supported global install, VCS and real migration retain their actual authorization boundaries; no credential work. | Arndt Gold |
| Executability and native scope | TP | resolved | Existing Node/CLI/MCP/browser harnesses and fresh actual Codex CLI procedures provide concrete routes; register new entrypoints through existing CI owners. Missing access/results stays a named gap, never synthetic native qualification or human acceptance. | Arndt Gold |

These are proposed planning selections for fresh Approval: TP. No material source/design question is currently open. A discovered product/design contradiction follows its earliest existing owner; do not silently edit approved sources or conceal it as a warning.

## 4. Brownfield Scope

T-001 inspects the actual affected call graph before edits: Run/backlog writers and transaction recovery, creation/staging/owned outputs, strict command/material/receipt/input-resolution versions, parser/seals/history/approvals/revision/closure, initialization/required-files/store validation, control-maintenance/legacy journals, UR contracts/dispatch/readiness/templates, inventory/Cockpit DTO/list/session/selection, CLI/MCP admission, existing generator/assembly/installer/package owners, UI resource identity/locales and install documentation.

Preserve the prerequisite routing repair and unrelated dirty paths. Review changed primitives/wrappers to choose fault cases and proof reuse honestly. Reconcile existing run_inventory_20261030/run_closure_20261029 context nodes with implemented and verified facts at T-013. CONTRIBUTING.md/GOVERNANCE.md and canonical/derived ownership remain applicable.

## 5. Out Of Scope

No product/design expansion, second UR engine, generic extension platform, new external service/framework, copied Core runtime, writable central status or new native planning host beyond Codex. No destructive testing on this governed Run/main, actual repository cutover, blanket cleanup, credentials, inferred approval, automatic VCS/release or unmeasured performance claim. The earlier routing-repair test evidence covers that repair only.

## 6. Risks And Blockers

Block affected claims for lost/duplicated work, unsafe/incorrect commit recovery, relaxed old policies, hidden global serialization, source substitution, foreign cleanup or implicit authority. Missing required execution/native/visible/CI results remain gaps at the relevant decision; code or another green suite cannot replace them.

Execute before/after commit invariants and same-resource/independent-progress checks regardless of batching. Equivalence-based selection is not permission to omit a new branch or invalidate old proof silently. Existing nightly/full results are reused only when applicable; additional local full runs need a concrete coverage/contradiction trigger. Mandatory reviews/QA/UAT/CI remain unchanged.

## 7. Next Step

Present the revised TP through its canonical owner. A new deliberate Approval: TP first permits T-001 mandatory implementation-preparation Brownfield Analysis, then the approved implementation/testing when that prerequisite passes. This revision supersedes the previous unapproved TP presentation; no earlier response approves changed bytes.

## AGDF Approval Summary (de; source=en)

- Ziel: Den Prüfplan gezielter ausführbar machen, bei unveränderter Abdeckung des freigegebenen PRD und SD.

- Aufgaben: Die 13 Aufgaben und 33 Szenario-IDs bleiben erhalten. Die Szenarien sind jetzt acht Ausführungsgruppen zugeordnet: UR/Planung, Run/Versionen/Parallelität, Übergabe, Migration, Übersicht/Browser, CLI/MCP, Pakete/CI und Codex-CLI-Qualifikation. Gemeinsame Fixtures und ein gültiges Ergebnis bedienen mehrere Zuordnungen; 33 Szenarien bedeuten keine 33 separaten Testläufe.

- Fehlerprüfungen: Jede neue oder geänderte Commit-, Eigentums- und Recovery-Verzweigung wird gezielt geprüft. Unveränderte atomare Schreibprimitive nutzen passende bestehende Nachweise. Kein pauschales Kreuzprodukt über Dateien, Kriterien und Hosts; Schutz vor Verlust, Duplikaten, fremden Löschungen und falscher Freigabe bleibt verbindlich.

- Nachweise: Lokal laufen die betroffenen Gruppen und ihre ungültig gewordenen Abhängigkeiten. Vor entsprechenden QA-Aussagen müssen die Pflichtnachweise vorliegen; vor Merge bleibt die vollständige aktuelle Pflicht-CI erforderlich. Neue Änderungen, fehlende Abdeckung oder Widersprüche lösen Wiederholung aus, eine weitere Tabellenzeile oder ein späteres Gate allein nicht.

- Native Prüfung: Ausschließlich Codex CLI, einmal mit Core allein und einmal mit Planungserweiterung. Ein gemeinsamer Kandidat und Bericht decken Entdeckung, Delegation, Übergabe und Wiederholung ab. Native Desktop-/Cockpit-Tests entfallen; SCN-026 bleibt als automatisierte UI-Prüfung erhalten. Desktop-Qualifikation wird nicht behauptet; menschliche UAT bleibt getrennt.

- Schutz: Schreibende Migrations-/Fehlertests bleiben in isolierten Projekten. Gegen diesen Worktree ist nur eine unverändernde Vorschau geplant. Dieser Run, Hauptarbeitskopie, alte Nachweise und fremde Änderungen bleiben geschützt; Installation, reale Migration und VCS/Release behalten ihre tatsächlichen Autorisierungsgrenzen.

- Stand: Dies ist eine überarbeitete Planung, keine ausgeführte Implementierung oder erfolgreiche Testserie. Alle elf Kriterien und zugehörigen SD-Entscheidungen bleiben zugeordnet; aktuell gibt es keine offene materielle Planungsfrage.

- Nächster Schritt: Die neue Fassung mit Approval: TP freigeben. Danach folgt zuerst die erforderliche Brownfield-Vorbereitung, anschließend die freigegebene Umsetzung mit Prüfungen. QA und UAT bleiben eigene Schritte.
