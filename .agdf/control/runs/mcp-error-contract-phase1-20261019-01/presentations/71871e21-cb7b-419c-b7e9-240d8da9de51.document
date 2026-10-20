# TP: MCP error contract implementation and evidence

Status: draft
Gate: TP
Gate approval: open
Based on: approved SD and approved PRD; Brownfield Review; ready UX Intent Definition
Date: 2026-10-19
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Planning Decisions contract: tp-decisions-v1

## 1. Task List

| task_id | task | Owner | Dependencies |
|---|---|---|---|
| T-001 | After TP approval, perform implementation-preparation Brownfield Analysis; capture current HEAD, candidate-path dirtiness, approved source digests, supported operation/result inventory, dependency/runtime facts, unchanged tools/list and pre-change protocol evaluation. Isolate unrelated user work and confirm this SD still applies before editing code. | Codex | Deliberate Approval: TP; existing control routing |
| T-002 | Implement the single pure Core projector and bounded descriptor/guidance validation; add EN/DE messages through the existing locale owner; write projector tests covering genuine failures, successful neighbor reports, safe correction and unknown/untrusted inputs. Register the new Core test through the existing CLI plugin-MCP-runtime suite. | Codex | T-001 passing Brownfield Analysis |
| T-003 | Preserve typed known causes and verified execution-phase facts across existing CLI failure constructors, worker parsing/execution, parent-owned paths and generation catches. Keep recovery.action/host_action text consistent with the same guidance and retain uncertain-effect behavior. | Codex | T-002 |
| T-004 | Integrate exactly-once producing-runtime projection and checked MCP delivery: preserve domain structuredContent/first block, set actual error flag, append one bounded explanation, validate error result invariants and enforce complete-response limits including fallback. Add real SDK/stdio tool-error tests to the existing protocol suite. | Codex | T-002, T-003 |
| T-005 | Carry the private descriptor through the existing worker/generation result, declare its version in the existing generation manifest and qualification digest, reject incompatible candidates and retain old-operation/session routing, capacity and teardown guards. | Codex | T-003, T-004 |
| T-006 | Adapt current Cockpit/decision transport and feedback consumers to preserve only validated negative domain data under isError. Keep binding/session checks, safe uncertain state and existing action/approval authority; add component and browser scenarios. | Codex | T-004, T-005 |
| T-007 | Complete the boundary/recovery matrix with SDK schema/protocol cases, command rejection and original-UUID/receipt checks, denied resources, stale decisions, preserved successful reports and exact presentation text. Run existing relevant Core/CLI/MCP regressions and retain state/receipt evidence. | Codex | T-003 through T-006 |
| T-008 | Update only affected existing MCP/architecture/interaction documentation and build/provenance assertions. Build through the canonical pipeline, run packed-runtime and UI checks, register all new tests in their existing suites/CI owners and validate complete inventory. | Codex | T-002 through T-007 |
| T-009 | Re-run the unchanged ergonomics protocol matrix and tools/list capture; compare with both pre-change current-checkout evidence and preserved historical baseline. Explain intended error/text changes and any non-comparable data; retain separately labeled supplemental recovery/consumer evidence. | Codex | T-001 baseline capture; T-008 passing candidate |
| T-010 | Record CD+Tests with exact final source/check inventory, obtain the existing Code Review, TP Review and Clean Implementation Review results, resolve applicable findings, and invoke qa-gate. Prepare deliberate QA/UAT and OR only through the later canonical routing. | Codex; qa-gate owns final QA decision | T-007 through T-009; all mandatory planned evidence |

Tasks are sequential where listed. This plan does not request subagents or delegate to other chats. Required review skills remain separate quality owners even if the same host conducts them. A finding changes only its existing earliest source/implementation/evidence owner, never silently changes approved sources.

## 2. Verification Traceability

Every row references acceptance in PRD and one design decision already mapped to that criterion in SD. Evidence paths below are relative to this run's artefact directory; actual source/runtime identities and exit codes must accompany each log. No test execution is claimed by this draft.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Every known failed result family is classified as failed without invoking policy/IO; unknown code in a failed envelope stays a failure. | evidence/projector.log; classification inventory |
| AC-001 | SDD-002 | T-004 | SCN-002 | SDK/stdio calls through all seven regular tools return true error flag for actual failures, preserve domain shape/first block and append one usable explanation. | evidence/tool-errors-wire.log; captured results |
| AC-001 | SDD-005 | T-005 | SCN-003 | Cockpit and decision/old-generation failures retain the checked descriptor from their producing runtime and are delivered as errors once. | evidence/generation.log; generation result assertions |
| AC-002 | SDD-001 | T-002 | SCN-004 | Missing target/invalid semantic field yields its specific supported correction rather than runtime repair or invented bindings. | evidence/projector.log; named correction assertions |
| AC-002 | SDD-002 | T-004 | SCN-005 | A real recoverable read failure exposes cause, known effect limit and next permitted action in content even when a consumer ignores metadata. | evidence/tool-errors-wire.log |
| AC-002 | SDD-007 | T-002 | SCN-006 | EN/DE and unsupported-valid-language English fallback produce complete bounded text without raw arbitrary exceptions or sensitive content. | evidence/projector.log; locale contract log |
| AC-003 | SDD-003 | T-003 | SCN-007 | Typed parser failure before execute is rejected as known not dispatched and preserves safe field/cause through actual worker and parent paths. | evidence/worker-safety.log; wire parse-failure case |
| AC-003 | SDD-004 | T-003 | SCN-008 | Unexpected post-dispatch exception, timeout/cancel after handoff, lost generation connection and unconfirmed termination remain uncertain unless stronger existing receipt facts exist. | evidence/worker-safety.log; evidence/generation.log |
| AC-004 | SDD-004 | T-007 | SCN-009 | Stale revision/presentation and payload conflict preserve rejection/receipt facts; the original status/UUID/payload path is required before eligible recovery and causes no duplicate write. | evidence/command-recovery.log; before/after fixture state and receipts |
| AC-004 | SDD-006 | T-006 | SCN-010 | UI retains stale/denied/effect-unknown rejection, shows the supported next action and keeps unsafe resubmission disabled. | evidence/ui-components.log; evidence/browser-report.json; screenshots |
| AC-005 | SDD-001 | T-002 | SCN-011 | Successful doctor/readiness/status/qualification/freshness reports stay successful despite blocked, false readiness or unknown-operation data. | evidence/projector.log; operation/result inventory |
| AC-005 | SDD-002 | T-007 | SCN-012 | Real successful dispatch/inspect/command and already-applied results preserve first content, structured data, exact decision text and historical receipt semantics. | evidence/protocol.log; evidence/command-recovery.log |
| AC-005 | SDD-006 | T-006 | SCN-013 | Browser displays a successfully read blocked run and nested unavailable resource through normal state handling; it does not turn the whole view into a transport failure. | evidence/browser-report.json; screenshots |
| AC-006 | SDD-002 | T-007 | SCN-014 | Both supported protocol eras retain SDK-owned schema-error behavior and distinct malformed/unknown-tool protocol errors; error-path domain invariants are checked independently of SDK output validation. | evidence/protocol.log; evidence/tool-errors-wire.log |
| AC-006 | SDD-005 | T-005 | SCN-015 | Manifest rejects incompatible descriptor version, malformed/missing descriptor and protected replacement; old bound work keeps its original generation. | evidence/generation.log; qualification/route assertions |
| AC-007 | SDD-001 | T-008 | SCN-016 | Pure projector adds no SDK/process/IO/state dependency and ships through existing Core projection; default/Copilot imports do not acquire private Cockpit code. | evidence/package-boundaries.log; evidence/packed-runtime.log |
| AC-007 | SDD-007 | T-007 | SCN-017 | Known cause/fields are allowlisted; unsupported details, oversized text, contradictory descriptor, accepted payload under isError and malformed error-domain data fail safely. | evidence/projector.log; evidence/tool-errors-wire.log; evidence/ui-components.log |
| AC-008 | SDD-008 | T-009 | SCN-018 | Unchanged protocol matrix and tools/list comparison report intended isError/text changes and preserved semantic outcomes against immutable evidence; no native improvement is inferred. | evidence/protocol-before.json; protocol-after.json; comparisons.json; EVALUATION.md |
| AC-001 | SDD-002 | T-004 | SCN-019 | Capability denial and response-budget fallback also carry the correct error flag and safe explanation, with the complete response inside existing limits. | evidence/tool-errors-wire.log; Cockpit limit assertions |
| AC-003 | SDD-003 | T-003 | SCN-020 | Busy/pre-aborted/setup failures known before handoff remain not dispatched; worker exit alone never proves non-execution. | evidence/worker-safety.log |
| AC-004 | SDD-004 | T-007 | SCN-021 | A real stale-write attempt is rejected by Core and produces correction guidance; merely skipping the attempted write cannot satisfy this scenario. | evidence/command-recovery.log; operation and fixture assertions |
| AC-006 | SDD-005 | T-005 | SCN-022 | Two qualified test generations produce and route descriptors correctly during a live replacement; old session/operation uses its original generation without duplicate projection. | evidence/generation.log; replacement/retirement assertions |
| AC-007 | SDD-007 | T-008 | SCN-023 | Canonical build, package/provenance/SDK digest, test inventory and existing contract checks pass for final source; no caps, timeouts or suite coverage are weakened. | evidence/build.log; package.log; verification.log; inventory.json |
| AC-008 | SDD-008 | T-009 | SCN-024 | Supplementary recovery and consumer cases remain labeled separately from matrix v1; current and historical baselines remain byte-identical and evaluation predicates remain unchanged. | evidence/EVALUATION.md; input digests; evaluation diff |
| AC-002 | SDD-007 | T-003 | SCN-025 | Terminal dispatch/inspect recovery text and the appended tool-error explanation agree on the next action; semantic input errors cannot instruct speculative reinstall. | evidence/tool-errors-wire.log; localized recovery assertions |
| AC-004 | SDD-006 | T-006 | SCN-026 | Late replies, changed session/target and forged successful data under isError are rejected before display/action; no stale approval transfers. | evidence/ui-components.log; evidence/browser-report.json |
| AC-005 | SDD-002 | T-007 | SCN-027 | Read-only error/status observations leave protected fixture files unchanged; accepted replay returns the existing effect without another transaction. | evidence/command-recovery.log; protected-byte digests |
| AC-006 | SDD-002 | T-008 | SCN-028 | An exact packed-runtime smoke reproduces actual error and successful-neighbor results with matched provenance rather than relying only on source imports. | evidence/packed-runtime.log; exact package/runtime fingerprints |

## 3. Test Plan

### Execution routes

Commands run from the repository root under a supported Node runtime, preferring the already available Node 22 installation. npm commands use that same supported runtime. Evidence capture records command, cwd, source commit plus changed-source digests, runtime/package identities, start/end, exit code and redacted diagnostic output. A passing source test is not a native-host test. Run the canonical build before assembled/protocol tests. Reuse one successful final run for all covered scenario rows; do not repeat identical suites per row.

| route | concrete commands or procedure | result retention |
|---|---|---|
| R-PREP | Post-TP bound brownfield-analysis; git rev-parse HEAD; git status --short; inspect owned source paths and approved-source digests. Then npm run build, followed by R-EVAL with before filenames and tools-before.json. | BROWNFIELD_ANALYSIS.md; evidence/source-baseline.json; build-before.log; pre-change captures |
| R-CORE | node packages/core/test/mcp-tool-errors-test.js (new behavioral test owned by T-002); npm --prefix packages/cli run test:interaction-presentation; npm --prefix packages/cli run test:operational-localization. | evidence/projector.log and locale logs with scenario assertions |
| R-WIRE | node packages/mcp-server/test/tool-errors.test.js (new SDK/stdio integration cases owned by T-004); npm --prefix packages/mcp-server run test:cockpit-gating. | evidence/tool-errors-wire.log; sanitized actual responses and fixture state |
| R-WORKER | npm --prefix packages/mcp-server run test:safety, extended in its existing worker scenarios to cover typed parse/execute facts; R-WIRE exercises the actual packaged worker seam. | evidence/worker-safety.log; exact test and result identities |
| R-GEN | npm --prefix packages/mcp-server run test:generation, extended with descriptor/version, actual replacement and old-operation/session scenarios. | evidence/generation.log; source/manifest/producer fingerprints |
| R-PROTOCOL | npm --prefix packages/mcp-server run test:protocol, including the new tool-errors test registered in its canonical script chain. | evidence/protocol.log; supported-era results |
| R-RECOVERY | npm --prefix packages/mcp-server run test:run-command-flow; npm --prefix packages/cli run test:run-command-flow; retain before/after state and receipts inside disposable fixtures. | evidence/command-recovery.log; protected-byte and operation assertions |
| R-UI | npm --prefix packages/control-ui run typecheck; npm --prefix packages/control-ui test, with cases in the existing decision-entry/decision-card/transport test ownership. | evidence/ui-components.log; typecheck.log |
| R-BROWSER | npm --prefix packages/control-ui run test:browser, with new test/browser/mcp-errors.spec.mjs using current browser/server/decision-host fixtures; retain Playwright JSON report and scenario screenshots under run evidence after output validation/redaction. | evidence/browser-report.json; evidence/screenshots/; browser.log |
| R-PACK | npm run build; node scripts/check-package-boundaries.mjs; npm --prefix packages/mcp-server run test:package; npm --prefix packages/mcp-server run test:provenance; npm --prefix packages/mcp-server run test:sdk-digest; npm --prefix packages/cli run test:plugin-mcp-runtime; npm --prefix packages/cli run test:plugin-mcp-cockpit-variant. Extend existing package/provenance tests with the matched packed-runtime error/success smoke. | evidence/build.log; package-boundaries.log; package.log; packed-runtime.log |
| R-INVENTORY | npm run test:verification; node scripts/ci-plan-test.mjs; npm run test:host-compatibility; npm run compatibility:check. Register new tests in their existing canonical npm suites and verify inclusion via the existing planner. Update generated compatibility evidence only through its supported recorder when affected source fingerprints require it, retaining claim scope. | evidence/verification.log; inventory.json; compatibility logs |
| R-EVAL | npm run eval:mcp-ergonomics:protocol -- --out .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/evidence/protocol-after.json; npm run eval:mcp-ergonomics:protocol -- --capture-tools .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/evidence/tools-after.json; npm run eval:mcp-ergonomics:compare -- --baseline evals/mcp-ergonomics/baselines/2026-10-16-win32-x64 --protocol .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/evidence/protocol-after.json; npm run eval:mcp-ergonomics:compare -- --tools-before .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/evidence/tools-before.json --tools-after .agdf/control/artefacts/mcp-error-contract-phase1-20261019-01/evidence/tools-after.json. At R-PREP use corresponding before output names. | Raw protocol/tool captures, exact exit codes and comparison JSON; evidence/EVALUATION.md explains expected versus unexpected changes |
| R-QUALITY | Record exact CD+Tests; run code-review, task-plan-review, clean-implementation-review and qa-gate through current AGDF bindings. No test result or review is inferred from this plan. | Registered review/QA sources, findings, evidence manifest and later deliberate decisions |

R-EVAL compare deliberately exits nonzero when results differ. Retain that status: an intended isError/text change is a reviewed comparison result, not a passing unchanged comparison. An unexplained semantic/schema/tool-inventory change remains a defect. The historical baseline and its report, matrix/tasks/metrics/classifier/predicates are not changed to obtain a green result. The pre-change current-checkout capture enables comparison when historical fingerprints or unrelated upstream changes are non-comparable. Any future metrics/harness change needs its own assessed scope; supplementary test files do not replace matrix v1.

Tests have to exist and be registered by their owning tasks before execution; a proposed filename is not evidence. R-WIRE must exercise the actual owned runtime/SDK, not only a fake executor. Use existing worker/generation test injection for boundary faults and a real child/stdio path for the normal execution seam. A test double alone does not satisfy SCN-022 or SCN-028.

### Per-scenario execution obligations

Environment L: local supported Node/npm and existing SDK 2.0.0 dependencies, disposable fixtures, no paid model/service. Environment B: local Playwright Chromium and existing fixture servers, with loopback/process access. Environment P: canonical local assembled/packed runtime with matched ownership/provenance. Environment E: the unchanged protocol harness on disposable fixtures and preserved baseline. These environments are explicitly protocol/browser/package evidence, not native Codex or Claude observations.

Permission C: TP approval plus passing implementation-preparation Brownfield Analysis, scoped source writes and local tests/builds; no real-run fixture mutation, install or network registration. Permission B: C plus browser fixture/loopback access and existing browser availability. Permission E: C plus creation of sanitized run-local evidence; fixtures only, no live user Run commands. All rows are owned by Codex; Arndt Gold remains accountable for any later environmental or human approval decision.

Unavailable actions: U1 means record the exact failed prerequisite and evidence gap, repair only the authorized local fixture/dependency/build path and rerun the affected check; request specific missing permission/access only if actually needed. U2 means preserve browser setup/permission failure as an open visible-evidence gap; use the supported existing browser setup route or obtain the specific missing permission, then rerun, never substitute a component/source check. U3 means preserve runtime/provenance/build failure and fix only this run's authorized packaging path before rerun; never patch installed caches. U4 means preserve comparison failure/non-comparability and classify its exact differences; do not overwrite baseline, change predicates or label it unchanged. All unresolved mandatory scenarios block a clean QA claim and route to their existing evidence/implementation owner.

| criterion_id | scenario_id | test_route | environment | prerequisites_permissions | owner | expected_evidence | unavailable_action |
|---|---|---|---|---|---|---|---|
| AC-001 | SCN-001 | R-CORE | L | C; T-002 test implemented/registered | Codex | projector.log with all failure families and unknown reason | U1 |
| AC-001 | SCN-002 | R-WIRE | P | C; current build, owned SDK/stdio fixture | Codex | actual error results for seven regular tool families | U3 |
| AC-001 | SCN-003 | R-GEN and R-WIRE | P | C; qualified test generations/Cockpit fixture | Codex | once-only producing-runtime descriptor/error results | U3 |
| AC-002 | SCN-004 | R-CORE and R-WIRE | L and P | C; invalid-target/input fixtures | Codex | specific correction and no invented bindings/reinstall | U1 |
| AC-002 | SCN-005 | R-WIRE | P | C; recoverable read error fixture | Codex | content-only consumer receives cause/effect/next action | U3 |
| AC-002 | SCN-006 | R-CORE | L | C; existing locale packs and test cases | Codex | language fallback, size bounds and safe-detail assertions | U1 |
| AC-003 | SCN-007 | R-WORKER and R-WIRE | L and P | C; typed parse fault before execute | Codex | preserved input cause and known non-dispatch | U1 |
| AC-003 | SCN-008 | R-WORKER and R-GEN | L and P | C; bounded fault/termination fixtures | Codex | uncertain-effect cases and retained executor protections | U1 |
| AC-004 | SCN-009 | R-RECOVERY | P | C; original UUID/payload/receipt disposable fixture | Codex | stale/conflict results and no duplicate writes | U3 |
| AC-004 | SCN-010 | R-UI and R-BROWSER | L and B | B; negative decision and Cockpit fixtures | Codex | visible cause/next step and disabled unsafe submit | U2 |
| AC-005 | SCN-011 | R-CORE and R-PROTOCOL | L and P | C; operation-specific positive-neighbor inventory | Codex | successful blocked/readiness/qualification reports | U1 |
| AC-005 | SCN-012 | R-PROTOCOL and R-RECOVERY | P | C; prepared decision/idempotent receipt fixtures | Codex | unchanged success data/first block/presentation bytes | U3 |
| AC-005 | SCN-013 | R-BROWSER | B | B; successful blocked-run view fixture | Codex | successful normal view with nested blocked state | U2 |
| AC-006 | SCN-014 | R-PROTOCOL and R-WIRE | P | C; both supported protocol clients and malformed calls | Codex | SDK/protocol distinctions and error-domain validation | U3 |
| AC-006 | SCN-015 | R-GEN | P | C; compatible/incompatible manifest fixtures | Codex | rejected candidate and preserved old bound work | U3 |
| AC-007 | SCN-016 | R-PACK | P | C; canonical build and default/Copilot package fixture | Codex | pure/import/packed-runtime and provenance assertions | U3 |
| AC-007 | SCN-017 | R-CORE, R-WIRE and R-UI | L and P | C; malformed/oversized/untrusted negative fixtures | Codex | safe rejection without forged success or leaked detail | U1 |
| AC-008 | SCN-018 | R-EVAL | E | E; pre-change capture, preserved historical baseline, candidate build | Codex | before/after protocol/tool capture and exact comparison result | U4 |
| AC-001 | SCN-019 | R-WIRE | P | C; missing UI capability and response-limit fixtures | Codex | flagged bounded fallback after serialization | U3 |
| AC-003 | SCN-020 | R-WORKER | L and P | C; busy/preabort/setup and worker-exit cases | Codex | trustworthy phase distinction with unchanged deadlines | U1 |
| AC-004 | SCN-021 | R-RECOVERY | P | C; actual stale-write attempt on disposable Run | Codex | rejected attempted write and protected state/receipt | U3 |
| AC-006 | SCN-022 | R-GEN | P | C; two actual owned child generations and bound old work | Codex | actual replacement, routing and retirement assertions | U3 |
| AC-007 | SCN-023 | R-PACK and R-INVENTORY | P | C; final source and canonical suite registration | Codex | build/provenance/SDK/test-inventory/compatibility logs | U3 |
| AC-008 | SCN-024 | R-EVAL and source/evidence diff review | E | E; immutable matrix/metrics and baseline hashes | Codex | EVALUATION.md, hashes and separately labeled supplemental coverage | U4 |
| AC-002 | SCN-025 | R-WIRE and R-CORE | P and L | C; terminal dispatch/inspect localized failure fixtures | Codex | consistent host_action/recovery/correction assertions | U1 |
| AC-004 | SCN-026 | R-UI and R-BROWSER | L and B | B; late/malformed/changed-session error fixtures | Codex | rejection before action and no stale approval transfer | U2 |
| AC-005 | SCN-027 | R-RECOVERY and R-PROTOCOL | P | C; protected-byte/idempotent fixture | Codex | unchanged reads and exactly-once historical receipt | U3 |
| AC-006 | SCN-028 | R-PACK packed-runtime smoke | P | C; exact packed candidate and matched marker | Codex | actual packed SDK error/success plus runtime fingerprints | U3 |

## Planning Decisions

| Decision | Source | Status | Resolution | Owner |
|---|---|---|---|---|
| Executable task/matrix definition | SD: Exact execution matrix and command order | resolved | T-001 through T-010 and SCN-001 through SCN-028 define routes, dependencies, environments, prerequisites and evidence. Build precedes assembled tests; final successful runs are reused across mapped rows. Mandatory errors remain blockers. | Codex, accountable Arndt Gold |
| Native claims and paid-run boundary | SD: Native observation availability and cost | resolved | Mandatory scope is local protocol/SDK, fixture, actual generation, packed-runtime and browser evidence. No paid native run or model is selected, no credentials or host installation are acquired and no native improvement is claimed. Optional native follow-up requires an actually available host, explicit cost/action authorization and separately recorded evidence; its absence cannot satisfy a native claim. This follows SD's conditional native-claim boundary. | Codex, accountable Arndt Gold |
| Existing CI ownership and test registration | TP | resolved | Register Core projector tests in packages/cli test:plugin-mcp-runtime, wire tests in packages/mcp-server test:protocol and browser tests under the current Playwright inventory; canonical npm suites remain the executable inventory. No parallel CI plan or removed checks. | Codex |
| Comparison and historical evidence | TP | resolved | Capture the current checkout before implementation, retain both it and the historical baseline, use unchanged matrix/metrics/predicates, and record intentional nonzero compare exits plus cause-specific differences. No promotion or overwritten baseline. | Codex |
| Current-checkout and unrelated-work protection | TP | resolved | Planning observed HEAD a8a867a3578a2d8b16853860276c401ddd04db28 after an external commit; T-001 captures the then-current exact checkout and source dirtiness. Preserve staged/unrelated user work; no branch, index, reset, commit or checkout action is authorized. A candidate dirty source or incompatible scope change stops dependent edits until its existing owner resolves the conflict. | Codex |

No material clarification finding is currently open. The design expressly allows bounded protocol/browser claims without native measurements; this plan does not waive a native requirement or silently mark an unavailable test passed. Future material evidence/design conflicts use the existing clarification/source-revision owner and block dependent work.

## 4. Brownfield Scope

T-001 is mandatory after deliberate TP approval. Reinspect the approved SD's candidate paths and current result variants against the exact checkout, particularly:

- packages/core/lib/skill-dispatch/, control-inspect/, control-state/run-command-service.js and recovery/receipt ownership; new pure packages/core/lib/mcp-tool-errors.js must not import private Cockpit, filesystem, SDK or process modules.
- packages/cli/lib/mcp-dispatch-runtime.js and existing locale recovery; packages/mcp-server/src/server.js, worker-entry.js, worker.js, generation-entry.js, generation.js and generation-protocol.js.
- packages/control-ui/src/mcp/transport.ts, DecisionEntry.tsx, DecisionCard.tsx and existing feedback.tsx, with session/binding and safe negative-envelope validation.
- Existing Core/runtime packaging and digests, relevant existing contracts/docs, plugins/agdf/meta/agdf-interaction-locales.json, packages/cli/package.json, packages/mcp-server/package.json and the canonical verification/planner ownership.
- Existing protocol, safety, generation, Cockpit, decision/recovery, UI/component/browser and packed-runtime fixtures. Preserve the immutable evals/mcp-ergonomics baseline/matrix/metrics/classifier/predicates.

The allowed implementation boundary is SD's listed existing owners, the new pure module and the tests/docs/suite registration necessary for those owners. New test sources include packages/core/test/mcp-tool-errors-test.js, packages/mcp-server/test/tool-errors.test.js and packages/control-ui/test/browser/mcp-errors.spec.mjs, reusing current fixture infrastructure. Update existing tests/helpers and exact-source generated compatibility/provenance evidence only through their owning supported commands. No general refactor, new service, additional runtime privilege, unrelated UI design or hidden policy store.

Capture all touched source and approved input hashes in the evidence manifest. The planner and package scripts may add the new test routes but cannot remove existing tests or relax timeouts/caps. Reassess before code if changed upstream source invalidates an approved design assumption. Do not use the current chat's immutable installed runtime as proof that newly edited repository code is loaded.

## 5. Out Of Scope

No new run-create/intake MCP tool, general schema/annotation redesign, SDK upgrade, performance/warm-worker project, response-budget increase, CI regression thresholds, persistent error database, approval bypass, model/host certification or new preview. No paid native/model sessions, credential copying, plugin installation, release, publication, commit/push/PR or editing installed/generated files as primary source. No autonomous subagents or cross-chat messaging is requested. Existing mandatory checks and evidence thresholds remain unchanged.

## 6. Risks And Blockers

- Any failed mandatory scenario, missing browser/packed-runtime evidence, lost execution cause, unsafe retry advice, changed successful presentation or wrongly flagged status report is an open implementation/evidence finding for CR/QA; do not count it as a passed test.
- Descriptor production must cover all direct/worker/parent/generation error seams exactly once; source inspection alone does not prove live replacement or error rendering. SCN-022 and SCN-028 require actual processes/packed runtime; browser cases require actual interaction.
- The pinned SDK skips output validation on errors. Independent checked domain invariants and negative UI validation are required; adding an error flag cannot become a shortcut around schema/binding checks.
- Existing baseline qualification remains Claude Code under Windows with two repetitions. New protocol/browser evidence cannot establish native agent success or cross-host behavior. A documented pre-existing performance failure is retained as an actual result and assessed by QA, never hidden or repaired by raising limits.
- Missing local dependency/browser/process/network access is a concrete evidence gap with U1/U2/U3 action, not implied authority to install globally or acquire credentials. Request only the specific prerequisite if it is encountered; continue unaffected work.
- T-010 cannot approve QA/UAT or complete OR by itself. Reviews must inspect actual final source/evidence. If current checks or reviews require upstream changes, follow the existing normalized route and renew approvals where required.

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

After approval, existing control routing must first permit and record implementation-preparation Brownfield Analysis (T-001). Implementation follows only if that analysis confirms the approved sources/design against the current checkout. Later QA/UAT and closeout remain deliberate canonical steps.

## AGDF Approval Summary (de; source=en)

- Ziel: Den freigegebenen MCP-Fehlervertrag mit prüfbaren Aufgaben und konkreten Nachweisen umsetzen.
- Aufgaben: Zehn Schritte umfassen aktuelle Brownfield-Prüfung und Baseline, reine Fehlerprojektion und Sprache, Ursachenweitergabe, MCP-Ergebnisübertragung, Laufzeitgenerationen, UI-Verbraucher, Wiederaufnahme-/Protokolltests, Paket-/CI-/Dokumentationsabgleich, unveränderten Messvergleich und anschließende Qualitätsprüfungen.
- Tests: 28 Szenarien decken alle acht PRD-Kriterien und zugehörigen Designentscheidungen ab. Geprüft werden echte Fehler und erfolgreiche Nachbarfälle, konkrete Korrekturen, bekannte und unklare Wirkung, ursprüngliche UUID/Belege, alte Freigaben, beide Protokollstände, tatsächlicher Generationenwechsel, Fehleranzeige im Browser und ein exakt paketierter Laufzeit-Smoke.
- Durchführung: Unterstütztes lokales Node/npm, vorhandener SDK und wegwerfbare Fixtures; Browserprüfungen benötigen Chromium und lokale Testserver. Jede Szenariozeile nennt Route, Umgebung, Voraussetzungen, Verantwortlichen, Nachweis und Vorgehen bei fehlender Ausführbarkeit. Neue Tests werden in die vorhandenen kanonischen Suites aufgenommen; vorhandene Tests, Grenzen und Zeitlimits bleiben erhalten.
- Abgrenzung: Keine neuen Intake-Funktionen, SDK-/Performance-Umbauten, persistente Fehlerverwaltung, Installation oder Veröffentlichung. Keine bezahlten nativen Modellläufe oder Zugangsdatenbeschaffung; ohne tatsächliche native Beobachtung wird keine native Verbesserung behauptet. Kein Commit, Push, PR oder Subagent beauftragt.
- Messung: Vorher-/Nachher-Aufrufe nutzen unveränderte Matrix und Kennzahlen. Die historische Baseline bleibt erhalten. Beabsichtigte isError-/Textänderungen werden einschließlich nichtnull Compare-Exitcode erklärt; zusätzliche Wiederaufnahme-/UI-Szenarien bleiben separat ausgewiesen. Keine Anpassung von Prüfkriterien, um Erfolg zu erzeugen.
- Entscheidungen: Beide offenen SD-Planungspunkte sind aufgelöst: ausführbare Reihenfolge/Szenarien sowie eine ausdrücklich auf Protokoll-/Fixture-/Paket-/Browsernachweise begrenzte Durchführung ohne native Erfolgsbehauptung. Aktueller Checkout und fremde Änderungen werden vor Umsetzung erneut erfasst und geschützt.
- Risiken: Fehlende Pflichtnachweise, falsche Klassifikation, verlorene Ursache, unsichere Wiederholung, UI-Verlust von Fehlerdetails oder Paketabweichung bleiben Qualitätsbefunde. Abhängigkeiten und Browserzugang werden bei tatsächlichem Fehlen konkret geklärt; kein fehlender Test zählt als bestanden.
- Nächster Schritt: Nach Approval: TP zuerst Brownfield-Vorbereitung, dann Umsetzung und Tests. Danach tatsächliche Reviews, QA und die weiteren erforderlichen menschlichen Freigaben.
