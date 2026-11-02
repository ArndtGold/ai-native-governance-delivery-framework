# TP: Implement and verify bound PRD preview review

Status: draft
Gate: TP
Gate approval: open
Based on: approved SD and PRD
Date: 2026-10-18
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

Approved source digests: PRD `sha256:e0ebc5711d585392e58765453498ae2679d886ac358f09e841a5faf34aa58a99`; SD `sha256:4b6eac0a3f58ad1c17ad7dfa65d2a299a60f198e4a7e09a9fa3fd5f32f520564`. Acceptance remains in the PRD and design authority in the SD. This plan authorizes no work until its deliberate approval and the existing implementation-preparation Brownfield Analysis are complete.

## 1. Task List

| task_id | task | owner | dependencies |
|---|---|---|---|
| T-001 | After TP approval, perform pre-implementation Brownfield Analysis for this exact scope, verify source validity, inspect version-sensitive consumers and record the tracked/untracked baseline. Preserve inherited branch guidance and foreign changes. Confirm the approved reuse path and package prerequisites before coding. | Codex, brownfield-analysis | Deliberate TP approval |
| T-002 | Implement the new UR declaration and PRD descriptor grammar, shared source/file inspector, declared resource manifest facts, explicit source-owner recovery and authoring guidance. Add real-file preview material tests and criterion/descriptor validation. | Codex, Core/source authoring owner | T-001 |
| T-003 | Implement supported static resource resolution and isolated rendering with the exact SD parser versions and bounds. Check local resource closure, media/UTF-8, script order and cycles. Add renderer and hostile-input fixtures. Declare actual production dependencies rather than using dev transitive imports. | Codex, Core presentation/resource owner | T-002 |
| T-004 | Extend existing presentation owner to version 5 with exact raw snapshots, safe rendered chunks, strict envelopes, byte digests and same-UUID publication recovery. Keep earlier versions unchanged. Add real preparation, snapshot tamper, UTF-8/chunk and interruption tests. | Codex, Core presentation owner | T-003 |
| T-005 | Integrate live preview validation into existing approval transactions and current approved-source proof. Extend historical closure/archive byte readers and all affected revision consumers. Preserve current receipt/material algorithms and prevent legacy-presentation bypass. | Codex, Core approval/history owner | T-004 |
| T-006 | Extend existing decision-session reader and stateless Inspect with exact preview selectors, bounded chunks, freshness, expiry, close and read-only retry. Propagate read schema/type contracts through MCP without arbitrary file selectors or a new command family. | Codex, Core read/MCP owner | T-004, T-005 |
| T-007 | Extend central localized presentation and existing DecisionCard/DecisionEntry/bootstrap/port. Put named preview access beside document access, show task and criterion relation, isolate executable content, preserve return/focus and one approval action, and show actual capability/retry/stale states. Add component and synthetic browser integration tests. | Codex, existing decision UI owner | T-006 |
| T-008 | Verify complete file-to-presentation-to-read-to-deliberate-approval path with valid and invalid material. Add transaction checkpoint/race, same-version retry, safe standalone and adversarial iframe tests. Prove example actions neither approve nor send messages. Retain an honest live/local evidence report. | Codex, integration/evidence owner | T-005, T-006, T-007 |
| T-009 | Propagate runtime/schema/locale/guidance changes using existing generators; ensure parser dependencies survive production assembly and a clean isolated package load. Register new tests in the existing verification inventory. Run affected regression groups, measured payload/integrity checks and clean-checkout/package checks. | Codex, package/verification owner | T-002 through T-008 |
| T-010 | Record CD+Tests with actual evidence, perform existing TP coverage/UX fidelity, clean implementation and code reviews, resolve findings within the approved scope, then run the sole QA decision owner. Preserve native-host qualification limits, request exact QA/UAT approvals only when eligible, and close out only through the existing lifecycle. | Codex using existing review/QA owners; Arndt Gold decides user gates | T-008, T-009 |

Task dependencies describe necessary sequencing; no new agent delegation or parallel work is implied. T-010 never substitutes agent review for independent human approval or actual-host evidence.

### Planned implementation and test ownership

Use the approved SD's existing owners. New cohesive internal preview helpers may live next to the current presentation/source owners, without creating a second service. Planned new test entrypoints, to be implemented under the tasks above, are:

- `packages/core/test/preview-material-test.js` — requirement/descriptor/file/closure checks.
- `packages/core/test/preview-render-test.js` — parser/resource embedding, limits and safe document output.
- `packages/core/test/preview-presentation-test.js` — real preparation, immutable snapshots, actual approval, tamper and revision/history cases.
- `packages/core/test/preview-session-test.js` — exact read contracts and lifetime/chunk/freshness behavior.
- `packages/control-ui/test/preview-review.test.tsx` — component states, local actions and access failure behavior.
- `packages/control-ui/test/browser/preview-review.spec.mjs` — real Core-backed synthetic host, interaction/layout and hostile sandbox cases.

These names are planned files, not existing passed tests. Extend existing fixtures and suites where appropriate; keep each scenario ID/assertion traceable even if a test is placed with its coupled regression. The existing test catalog and CI must execute all added tests, with no skipped assertions or reduced coverage used to obtain a pass.

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | New explicit UR requirement survives authoring and the PRD descriptor identifies current task, version, scenarios and valid criterion IDs. Missing, duplicate or unknown required declarations/descriptors are unready. | preview-material-test.js assertions plus source authoring diff |
| AC-001 | SDD-006 | T-007 | SCN-002 | Native synthetic view and text projection display the same checked task/version/criteria and consent effect; generic link stripping cannot remove the only access path. | interaction-presentation-test.js and preview-review.test.tsx |
| AC-002 | SDD-003 | T-003 | SCN-003 | Local scripts, styles and images render offline in the isolated derived document with the declared script order and complete example interactions. | preview-render-test.js and browser resource assertions |
| AC-002 | SDD-004 | T-006 | SCN-004 | Exact session/presentation selector opens the matching immutable preview and returns without source or approval mutation; foreign selectors are denied. | preview-session-test.js and before/after state bytes |
| AC-002 | SDD-006 | T-007 | SCN-005 | Open preview/document and return preserve parent identity, undecided state and initiating focus; example controls affect only local state. | preview-review.test.tsx and preview-review.spec.mjs |
| AC-003 | SDD-001 | T-002 | SCN-006 | Existing before-PRD readiness stays authoritative; unconfirmed example policy is visibly open and is not silently promoted into product requirements. | material/readiness assertions and exact example/document inspection |
| AC-004 | SDD-001 | T-002 | SCN-007 | Real files with absent entry/assets, wrong run, traversal/Windows/encoded aliases, symlinked ancestors, source mismatch or duplicate paths are rejected; existing inspected version is preserved. | preview-material-test.js negative matrix |
| AC-004 | SDD-003 | T-003 | SCN-008 | Parser-derived local closure resolves stylesheet-relative resources and CSS imports, rejects undeclared resources/cycles and unsupported URL/module/resource forms. | preview-render-test.js static closure matrix |
| AC-005 | SDD-002 | T-004 | SCN-009 | Valid source files prepare a strict version-5 envelope and exact immutable snapshots; tampered raw snapshots/render chunks or unsupported fields fail verification. | preview-presentation-test.js prepared record and digest assertions |
| AC-005 | SDD-005 | T-005 | SCN-010 | Actual native-command and exact-text approval paths reject missing, changed, foreign or source-mismatched required material with unchanged approval rows; valid unchanged input records one existing effect. | preview-presentation-test.js actual command/receipt assertions |
| AC-006 | SDD-002 | T-004 | SCN-011 | Raw change after presentation invalidates the old presentation even when run metadata did not change; old immutable bytes remain historical evidence. | presentation/tamper regression |
| AC-006 | SDD-005 | T-005 | SCN-012 | Supported source revision and newly adopted descriptor produce fresh presentation; the old reply cannot approve the new basis, while a new deliberate synthetic reply can. | source-revision/approval integration with exact revisions |
| AC-007 | SDD-004 | T-006 | SCN-013 | A transient read failure exposes same-version retry; stale, expired, closed, wrong-target or wrong-resource reads remain denied without rebinding. | preview-session-test.js lifetime/failure matrix |
| AC-007 | SDD-006 | T-007 | SCN-014 | Denied framing/unsupported host is distinct from loaded preview; supported exact safe standalone access is offered honestly or review remains visibly open, with no view receipt. | preview-review.test.tsx and synthetic host/browser result |
| AC-008 | SDD-002 | T-005 | SCN-015 | Existing receipt and material-version schemas/algorithms remain unchanged and both approving inputs identify the same version-5 presentation once. | presentation-decision, decision-action and preview integration regressions |
| AC-008 | SDD-006 | T-007 | SCN-016 | Preview clicks, scenario changes, forged preview messages, host permissions and closing never submit approval or messages; actual consent states PRD to SD only. | UI/harness action counters and localized presentation assertions |
| AC-009 | SDD-002 | T-004 | SCN-017 | Existing unmarked/no-preview runs, envelope versions 1–4, document snapshots and QA-deviation version 4 retain their original supported behavior. | existing presentation/document/QA-deviation suites plus compatibility fixtures |
| AC-009 | SDD-005 | T-005 | SCN-018 | New declared required material cannot be approved using an older presentation lacking its binding; historical proof never adopts live bytes. | approved-source/history tests and old-envelope bypass regression |
| AC-010 | SDD-003 | T-009 | SCN-019 | Production assembly contains exact pinned parsers and dependencies, and clean isolated runtime can inspect/render without a dev dependency tree. | package smoke and clean-checkout reports with resolved dependency paths |
| AC-010 | SDD-004 | T-008 | SCN-020 | Real Core session/Inspect reads assemble the full matching safe view under result limits; no mock response substitutes for the integrated read path. | Core-backed read-to-browser integration report |
| AC-010 | SDD-005 | T-008 | SCN-021 | File-to-presentation-to-approval test exercises actual persistence with valid/missing/changed/foreign cases and unchanged-state rejection assertions. | integrated actual command reports and saved receipts |
| AC-010 | SDD-006 | T-010 | SCN-022 | Evidence report distinguishes source/tests, synthetic browser, native-host observation and human feedback; no unsupported native or delivery claim is emitted. | CD+Tests/review/QA evidence and qualification ledger |
| AC-004 | SDD-003 | T-003 | SCN-023 | Exact limits for descriptor, file count, raw file/total bytes and safe render output pass at boundary and reject over-limit data without truncation; binary bytes and UTF-8 are handled as designed. | renderer/material boundary matrix |
| AC-002 | SDD-003 | T-008 | SCN-024 | Hostile preview cannot access parent decision/bridge, send a decision, navigate top, submit forms, open popups, create workers or use arbitrary network/files; unsupported content is not a successful blank preview. | browser security assertions, blocked-request counters and safe fallback checks |
| AC-005 | SDD-002 | T-004 | SCN-025 | Interrupted snapshot publication resumes only for the same operation UUID and exact bytes; altered partial files and symlinks are rejected untouched. | publication checkpoint/recovery tests |
| AC-007 | SDD-004 | T-006 | SCN-026 | Chunk offsets are UTF-8 safe, ordered, digest-bound and complete; foreign/replayed-invalid cursors, modified chunks and response overflow are rejected. | preview-session/presentation chunk assertions |
| AC-009 | SDD-005 | T-005 | SCN-027 | Current source revision archives version-5 raw snapshots/render chunks and pending presentations; historical reconstruction uses exact archive bytes after live files change. | revision archive closure and tamper regression |
| AC-010 | SDD-003 | T-009 | SCN-028 | Added tests run from the canonical inventory and source/generated package contracts, measured payload and runtime integrity pass with no installed-cache edits. | verification inventory, generator/parity, budget and integrity reports |
| AC-010 | SDD-006 | T-008 | SCN-029 | At 736, 360 and 320px, task/version/actions remain usable; complete and missing-proof scenarios, return/focus and unsupported-access recovery work with zero real decision/message side effects. | Core-backed browser assertions and screenshots |
| AC-005 | SDD-005 | T-005 | SCN-030 | Source change at the transaction's pre-commit checkpoint rejects approval; changed required files after PRD approval invalidate current proof before dependent preparation. | actual approval race and approved-source validation tests |

## 3. Test Plan

All commands are run from the repository root unless prefixed. Evidence paths below are relative to `.agdf/control/artefacts/prd-preview-review-integration-20261018-01/evidence/`. Create that evidence directory during execution, not as invented completed evidence now. Record command, environment, commit/baseline, changed files, start/end, exit status and scenario assertions. Tests create synthetic runs in temporary roots and must not alter actual approvals.

Define these concrete execution routes for the table:

- **R1**: `node packages/core/test/preview-material-test.js`.
- **R2**: `node packages/core/test/preview-render-test.js`.
- **R3**: `node packages/core/test/preview-presentation-test.js`.
- **R4**: `node packages/core/test/preview-session-test.js`.
- **R5**: `npm --prefix packages/control-ui test`, plus `npm --prefix packages/control-ui run typecheck`.
- **R6**: `npm --prefix packages/control-ui run build:mcp`, then `npm --prefix packages/control-ui run test:browser -- preview-review.spec.mjs decision-card.spec.mjs decision-close-integration.spec.mjs`.
- **R7**: `node packages/core/test/presentation-document-test.js`, `node packages/core/test/presentation-decision-test.js`, `node packages/core/test/decision-action-test.js`, `node packages/core/test/qa-deviation-acceptance-test.js`, `node packages/core/test/run-source-revisions-test.js`, `node packages/core/test/expanded-source-revision-test.js`, `node packages/core/test/early-ur-revision-test.js` and `node packages/core/test/approval-command-recovery-test.js`.
- **R8**: `node scripts/sync-package-assets.js`, `npm --prefix packages/control-ui run build:mcp`, `node scripts/assemble-npm.mjs`, `node scripts/check-package-boundaries.mjs`, `node scripts/test-clean-checkout.mjs`, `npm --prefix packages/cli run test:control-command-package`, `npm --prefix packages/mcp-server run test:package`. Extend the clean-source fixture and package smoke to include/load the new production dependencies; do not count a source import as clean install.
- **R9**: `npm run test:verification`, `npm --prefix packages/cli run test:agent-skills-conformance`, `npm --prefix packages/cli run test:interaction-catalog`, `npm --prefix packages/cli run test:control-inspect`, `npm --prefix packages/cli run test:runtime-integrity-layout`, `npm --prefix packages/cli run test:runtime-integrity-negative`, `node scripts/payload-budget.js`, `npm --prefix packages/mcp-server run test:contract`, `npm --prefix packages/mcp-server run test:run-command-flow` and `git diff --check`. Register new source tests with existing verification profiles before running the canonical changed-scope verification.
- **R10**: Inspect retained command/browser evidence, source and generated diffs through existing task-plan-review, clean-implementation-review, code-review and qa-gate owners. If a particular native host is claimed supported, add an actual supported host observation of rendering, interaction and teardown; package/source/harness checks alone cannot establish it.

The routes R1–R4 and the new browser spec are implementation outputs, not currently available passed checks. Build and dependency prerequisites must be satisfied before their execution. The table's unavailable action is binding: an unexecuted check is never reported as passed.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | R1 plus source/guidance review | Local supported Node, synthetic temp files | TP approval and T-001 complete, T-002 tests implemented, writable scratch | Codex | material.json with marker/descriptor assertions | Fix scoped authoring/inspector gap or report missing execution evidence, no approval-ready claim |
| AC-001 | SCN-002 | R5 and node packages/core/test/interaction-presentation-test.js | Local UI test runtime and Core locales | UI dependencies available, T-007 projection implemented | Codex | ui-unit.log and presentation.log | Record actual locale/UI failure and fix within scope before review |
| AC-002 | SCN-003 | R2 and R6 | Local Node and synthetic Chromium host | Exact production parser dependencies and browser available, temporary localhost listen permitted | Codex | renderer.json and browser.json with resource order | Obtain only existing authorized dependencies/listen permission or record blocked evidence, no offline-render claim |
| AC-002 | SCN-004 | R4 | Local Core with real temporary run | T-006 reader implemented, scratch access, no real run writes | Codex | session.json with exact selectors and unchanged state | Keep read integration unverified and fix scoped reader failure |
| AC-002 | SCN-005 | R5 and R6 | Local component runtime and Chromium | Built current decision UI and browser binary, temporary listener access | Codex | focus/navigation/action-counter assertions | Record browser capability gap and retain missing visible evidence |
| AC-003 | SCN-006 | R1 and node packages/core/test/prd-readiness-test.js | Local Node and actual source text | Approved source bytes unchanged, new inspector tests available | Codex | readiness.log and open-policy inspection | Return any material product conflict to existing source owner, never invent an answer |
| AC-004 | SCN-007 | R1 | Temp filesystem under actual host OS | Writable scratch, symlink creation capability for that subcase | Codex | negative matrix with actual path/file cases | Report unavailable native symlink subcase, do not call synthetic path tests native proof |
| AC-004 | SCN-008 | R2 | Local Node production parser path | T-003 resource fixtures and exact parsers installed | Codex | static-closure.json | Reject unsupported/unverified closure, fix scoped resolver or explicit authoring recovery |
| AC-005 | SCN-009 | R3 | Real temp run and presentation files | T-004 writer implemented, scratch filesystem | Codex | snapshot/envelope and tamper assertions | Keep presentation binding unproven until actual files pass |
| AC-005 | SCN-010 | R3 with existing approval/action regressions | Actual Core commands on temp run | Synthetic deliberate replies only, no transfer of actual human approval | Codex | approval-matrix.json with unchanged rejection state | Fix scoped enforcement defects and rerun affected matrix, no pass from mocked receipts |
| AC-006 | SCN-011 | R3 | Real mutable source and immutable snapshot | Prepared temp presentation, raw-byte mutation fixture | Codex | changed-material assertions | Do not rehash evidence to conceal a stale presentation |
| AC-006 | SCN-012 | R3 and R7 | Temp source revision and approval lifecycle | Existing revision preview/apply with explicit synthetic confirmations | Codex | fresh-presentation.json with old/new response results | Route unsupported revision behavior to its owner and keep scenario unproven |
| AC-007 | SCN-013 | R4 | Actual session service with controlled failure/time | T-006 service implemented, deterministic clock and failure fixture | Codex | lifetime/retry/close assertions | Report exact unavailable state, do not create replacement binding silently |
| AC-007 | SCN-014 | R5 and R6 | Synthetic allowed/denied frame host | Browser/SDK harness, current safe standalone view | Codex | capability-fallback.json | Keep unsupported framing visible and provide only an actually supported exact safe access route |
| AC-008 | SCN-015 | R3 and R7 | Local real approval service | Existing receipt/material fixtures and new version-5 fixture | Codex | receipt-schema and once-only approval assertions | Treat receipt/material regression as blocking implementation defect |
| AC-008 | SCN-016 | R5 and R6 plus presentation locale test | Local UI and hostile child frame | Isolated frame and parent action/message counters | Codex | action-isolation.json and consent screenshots | Do not expose unsupported executable preview; resolve isolation/consent defect |
| AC-009 | SCN-017 | R7 plus R3 compatibility fixtures | Local existing/new presentation readers | Baseline fixtures retained unchanged in meaning | Codex | legacy-compatibility.log | Fix regression without weakening old predicates or rewriting historical receipts |
| AC-009 | SCN-018 | R3 and R7 | Actual proof owner and temp archive | Required descriptor and legacy-presentation bypass fixture | Codex | bypass/archive-proof assertions | Keep new required path blocked and preserve legacy history |
| AC-010 | SCN-019 | R8 | Clean temp source/package runtime, local npm | Exact locked parser packages/caches or authorized package retrieval, no installed host update | Codex | package-runtime.json with resolved dependency origin | Stop package completion, acquire permitted dependency bytes or report packaging gap |
| AC-010 | SCN-020 | R4 and R6 Core-backed harness | Actual Core plus browser SDK harness | T-006/T-007 built, no static-only response substitution | Codex | integrated-read.json | Keep source/harness distinction explicit and collect actual integrated read evidence |
| AC-010 | SCN-021 | R3 | Actual Core command writer on synthetic run | Writable temporary run and approval transaction fixture | Codex | file-to-approval.json and synthetic receipts | Do not use replay observations in place of persistence proof |
| AC-010 | SCN-022 | R10 | Repository reports and any expressly claimed host | Completed local test evidence, actual host access only if supported/authorized | Codex; Arndt Gold decides user gates | qualifications.md and review/QA reports | Omit unsupported host claims; missing mandatory evidence keeps QA revise/block through its owner |
| AC-004 | SCN-023 | R1 and R2 | Node with actual binary/text fixtures | Exact approved limits and parser implementations | Codex | limits.json with boundary/over-limit assertions | Fix boundary defect, never trim inputs or weaken limits to pass |
| AC-002 | SCN-024 | R6 adversarial frame cases | Local Chromium with real CSP/sandbox | Built UI, hostile fixture, request/navigation counters, temporary listener permission | Codex | sandbox-security.json and console observations | Isolation failure blocks executable preview exposure and QA, no permissive CSP workaround |
| AC-005 | SCN-025 | R3 | Actual filesystem writer checkpoints | Same-UUID interruption fixture and real partial files | Codex | publication-recovery.json | Use existing recovery on exact operation, do not overwrite suspect snapshots |
| AC-007 | SCN-026 | R3 and R4 | Node with multi-byte and multi-chunk fixtures | T-004/T-006 implementations and current result limits | Codex | chunks.json with offsets/digests and malformed cursor denials | Keep failed/truncated access unavailable and fix scoped chunk protocol |
| AC-009 | SCN-027 | R3 and R7 | Actual source revision archive | Archived raw files/chunks and controlled live mutations | Codex | history-closure.json | Repair implementation through archive owner, never substitute live bytes for absent history |
| AC-010 | SCN-028 | R9 plus canonical changed-scope verification | Local repository and generated runtime | T-009 inventory/generator updates, current dependency tree | Codex | verification-inventory.json, parity/integrity/budget logs | Record exact failure and affected owner; no blanket pass from generated fixture consistency |
| AC-010 | SCN-029 | R6 complete/missing-proof task | Chromium viewports 736, 360 and 320px | Actual Core-backed decision harness and safe preview fixture | Codex | layout-interaction.json and screenshots per width | Retain missing visible evidence and fix clipping/focus/state defects |
| AC-005 | SCN-030 | R3 with transaction checkpoints | Actual approval/proof writer | Controlled pre-commit mutation and post-approval proof fixture | Codex | precommit-race.json and dependent-source denial | Treat accepted stale approval as blocking defect; preserve originals and diagnose owner |

### Evidence and verification execution rules

Run the new focused tests as their tasks complete, then the affected existing regression groups and one canonical changed-scope verification. Re-run only affected checks after fixes unless a new failure broadens the risk. Do not write tests that merely mirror static implementation fields: assert actual files, observed UI state, action counters and persisted outcomes. Register new test files in the canonical verification inventory/appropriate CLI test group so future CI executes them. Never replace production-path tests with deterministic replay rows.

Retain final command logs, scenario results and relevant screenshots beneath this run's evidence directory. Preserve the source digest and package build identity for every integrated/browser report. Distinguish synthetic approval fixtures from the actual run's human gate receipts. Include parser production-resolution and raw/derived byte hashes in the package evidence.

Actual native support is not presumed. This run can prove its local Core/packaged API and synthetic-browser paths. A claimed native host needs visible rendering, supported interaction, lifecycle and teardown evidence for that exact package/host; if access is absent, record the gap and make no native qualification claim. This is the approved SD capability boundary, not permission to waive an otherwise required test. Any missing proof needed for an acceptance claim goes to the existing QA evidence owner and prevents an unsupported pass. Actual human product judgment remains with the existing UAT decision.

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Resolve implementation and validation sequence | SD: Executable implementation and validation sequence | resolved | T-001 through T-010 and SCN-001 through SCN-030 identify dependencies, existing owners, concrete routes, required access, expected evidence and unavailable actions. Source, runtime, UI, security, history and package proof are all included. | Codex, Task/Test Plan owner |
| Evidence executability and host claims | TP | resolved | Use existing local Node, temporary filesystem and synthetic Chromium/SDK routes; obtain only required authorized dependency/listen access. Native access is separately observed only for a supported claimed host; absence is an explicit qualification gap and never a synthetic native pass. | Codex, evidence owner |
| Baseline and foreign changes | TP | resolved | T-001 captures current dirty paths before implementation. Preserve inherited UR/UX/PRD guidance, `.gitignore`, other run artifacts and unrelated working-tree changes. Record only the scoped implementation and canonical run changes. | Codex, implementation owner |
| Verification inventory and production parser availability | TP | resolved | T-009 adds new tests to existing verification execution and extends production dependency assembly/clean fixture checks. Missing exact parser bytes or package loading is an execution blocker to report, not permission for a transitive dev fallback. | Codex, package owner |
| Material planning clarification applicability | TP | resolved | No unanswered question currently changes the approved product/design or this test plan. Concrete implementation discoveries that do must stop affected work and route through the existing earliest-source clarification/revision owner. | Codex, Task/Test Plan owner |

## 4. Brownfield Scope

Before coding, T-001 must inspect the current source owners and their version-sensitive branches: `definition-sources.js`, UR/PRD readiness, `run-presentation.js`, `run-presentation-render.js`, `presentation-decision.js`, approval command/transaction, `artefact-binding-proof.js`, source-revision closure/history, read snapshot seam, decision-session and Inspect contracts, `DecisionCard.tsx`, `DecisionEntry.tsx`, bootstrap/port types, central locale catalog and runtime/package generation. Inspect actual current package projection and dependency manifests before adding parser packaging.

Review the approved PRD/SD and analytical source digests against fresh Core state. Source or binding drift is a blocker, not permission to reseal or repair protected sources. The new requirement/descriptor and resource helper changes must stay within the approved authority and version strategy. Read-only source/fixture discovery in planning is not implementation evidence or the required post-TP Brownfield Analysis.

## 5. Out Of Scope

No new gate, preview approval, click receipt, second product authority, hosting service, arbitrary file browser, automatic message, prototype-product implementation, unrelated status-owner repair, installed-cache edit, release, merge, push or publication. No silent mutation of the already approved UR/PRD/SD to add new markers or descriptors to this run. New supported cases use newly authored declarations and synthetic fixtures; actual source revision uses its current explicit owner and approvals. Keep the example product's missing-proof policy unanswered as specified.

## 6. Risks And Blockers

- Wrong-run binding, stale acceptance, approval-side effect from preview content, unsafe resource access, live/history byte substitution, legacy bypass or accepted pre-commit mutation are blocking defects.
- Production parser resolution, exact-version packaging, default CSP and real host framing can differ from a dev harness. Record the actual result and fix only within the approved scope; no development-only package fallback or permissive sandbox workaround.
- Byte/count/chunk boundaries, script and stylesheet order, local path aliases and symlink behavior need actual fixture tests. Platform-unavailable subcases remain explicit gaps and do not prove another operating system.
- A missing tool/browser/dependency or required permission produces the table's unavailable action. It does not count as test success or user consent to unrelated setup/install operations.
- Do not claim malicious-process atomicity beyond cooperative filesystem assurance. Check transaction freshness at the approved points and retain that boundary in QA.
- If a new finding changes intended behavior or binding architecture, stop affected implementation and route to PRD/SD clarification or supported revision. Do not choose a new policy as an implementation detail.
- Existing review and QA gates remain mandatory. A technical pass needs the complete applicable evidence, while a user acceptance or accepted deviation needs its own exact deliberate decision. No hand-authored receipts or inherited approval.

## 7. Next Step

Review and deliberately approve this plan with `Approval: TP` after the exact presentation is prepared. Then perform T-001 through the existing Brownfield Analysis owner. Only a passing applicable implementation-preparation result permits T-002 onward. Stop at later QA and UAT human gates; do not infer them from this approval.

## AGDF Approval Summary (de; source=en)

- Aufgaben: Zehn Aufgaben setzen das freigegebene Design um: zuerst bestehende Eigentümer und Ausgangsstand prüfen, danach Anforderung/Dateibindung, Ressourcenprüfung und Isolation, Präsentationsversion 5, erneute Prüfung im Freigabeweg, gebundener Lesezugriff und Bedienung integrieren. Abschließend folgen Paketprüfung, bestehende Reviews und QA.
- Tests: 30 konkrete Szenarien sind allen zehn PRD-Kriterien und sechs SD-Entscheidungen zugeordnet. Sie prüfen echte Dateien und Freigaben: gültiger Stand, fehlende oder veränderte Dateien, falscher Run, unsichere Pfade, Ressourcen- und Größenlimits, unterbrochene Veröffentlichung, veraltete Antworten, Historie und alte Präsentationsversionen.
- Bedienung: Tests prüfen Vorschau öffnen, Normalfall und wichtigen fehlenden Nachweis ansehen, zur gleichen Entscheidung zurückkehren, Fokus und schmale Ansichten bei 736, 360 und 320px. Beispielaktionen und gefälschte Vorschau-Nachrichten dürfen weder eine echte Freigabe noch eine Nachricht auslösen. Fehlender Host-Zugriff und Wiederholung bleiben sichtbar.
- Nachweise: Neue Core-, Komponenten- und Browserprüfungen werden Teil der bestehenden Testausführung. Produktionspaket und sauberer isolierter Runtime-Start müssen die festgelegten Parser tatsächlich enthalten und laden. Ergebnisprotokolle, Szenariobelege und Screenshots landen beim Run. Keine Tests sind durch diesen Plan bereits bestanden.
- Planung: Die offene SD-Planungsentscheidung ist damit auf Aufgaben, Abhängigkeiten, Befehle, Umgebung, Zugriffsbedingungen, Nachweis und Fehleraktion abgebildet. Es bleibt keine materielle Planungsfrage offen. Fehlende Testvoraussetzungen werden als konkrete Lücke behandelt; sie erlauben keine stillen Abkürzungen.
- Grenzen: Kein neues Gate, keine Implementierung des Beispielprodukts, keine Änderung seiner unbestätigten Nachweisregel, keine fremden Änderungen, Installation oder Veröffentlichung. Lokale Tests und Browserharness belegen keine native Host-Unterstützung. Eine solche Zusage braucht eigene tatsächliche Beobachtung; fehlende erforderliche Nachweise verhindern eine unbelegte QA-Freigabe.
- Nächster Schritt: Mit dieser TP-Freigabe beginnt zuerst die vorgeschriebene Brownfield-Analyse vor Implementierung. Danach darf der bestätigte Plan umgesetzt werden. QA- und UAT-Freigaben bleiben eigene bewusste Entscheidungen.
