# TP: One Explicit Approval-Recording Command

Status: draft
Gate: TP
Gate approval: open
Based on: Approved PRD.md and SD.md
Date: 2026-09-30
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

PRD remains the sole product-acceptance source. This plan implements the approved SD decisions SDD-001 through SDD-011; it creates neither additional acceptance criteria nor a broader package-restructuring scope. All tasks and scenarios below are planned, not completed evidence.

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Perform the required pre-implementation Brownfield Analysis after TP approval; capture source/runtime identity, exact dirty-path baseline and protected unrelated bytes; run focused baseline regressions in an isolated snapshot and record the reference workflow observation boundary. | Agent; existing Brownfield and control-state owners | Exact Approval: TP and canonical continuation to Brownfield Analysis |
| T-002 | Implement the closed command/result schema, target resolver, stable request digest and cooperative assurance checks in the existing control-state responsibility; document error/version semantics and separate original effect from current observation. | Agent; approval-service and contract owner | T-001 |
| T-003 | Implement versioned same-Run receipt parsing and approval-seal coverage; preserve the exact legacy seal for receipt-free Runs and enforce append/preservation rules across normal approval-changing writers. | Agent; parser/seal/Run-writer owner | T-001, T-002 |
| T-004 | Refactor the existing approval application service for locked receipt lookup, fresh-policy validation, one approval/receipt commit, exact replay/conflict and destination-based failure acknowledgement; preserve existing legacy approval behavior. | Agent; run-recording.js and run-state-writer.js owner | T-002, T-003 |
| T-005 | Add the thin public facade and runtime composition; move only shared context out of CLI ownership with compatible re-exports; wire explicit CLI and local API to the same evaluator/Git observation/service and preserve existing input/result projections. | Agent; public API, CLI and shared runtime-context owners | T-004 |
| T-006 | Add executable process-level concurrency, fault and interruption coverage with isolated fixtures and private harness checkpoints; prove lock ownership, pre/post-commit behavior, no duplicated revision and receipt preservation through progress/revision/recovery. | Agent; command and existing writer/recovery test owners | T-004, T-005 |
| T-007 | Add the additive package export and documentation; register new modules/resources in existing synchronization; implement external packed-consumer and generated-validator qualification, dependency closure, inert import, missing-resource and existing-export tests. | Agent; package/runtime synchronization and package-test owners | T-005 |
| T-008 | Run compatibility/read-only regression scenarios and comparable baseline/result workflow measurements; qualify evidence classes and available platforms without installation, publication or stronger authority claims. | Agent; CLI/presentation/MCP-observer and evidence owners | T-006, T-007 |
| T-009 | Consolidate scenario evidence and exact source/runtime identity into CD+Tests inputs, complete mandatory code review and prepare QA coverage/gap inputs under existing routes; resolve actual findings before requesting later decisions. | Agent; CR owner and sole QA decision owner | T-001 through T-008 |

Execution order follows these dependencies. T-001 is a prerequisite check, not implementation permission by itself. No production changes start before TP approval and a permitted pre-implementation Brownfield result. The plan requires no delegated agents, new public package or automatic VCS action.

## 2. Verification Traceability

Evidence paths name planned executable owners. Reports are generated only after scenarios run. `CD_TESTS.md` denotes the selected Run's later CD+Tests artefact; it must identify the dated command, environment, result and evidence file for each scenario rather than declare completion from this table.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-005 | SCN-001 | Equivalent fresh UR fixtures through explicit CLI and public API reach one semantically equal approval/next-action result through the same application service. | create-agdf/scripts/control-command-test.js: shared_consumer_success; CLI/API JSON and final fixture RUN_STATE.md |
| AC-001 | SDD-002 | T-002 | SCN-002 | Valid explicit target/Run/gate/revision/presentation/reply/operation binding is returned; malformed action, UUID, version or unknown field has no accepted effect. | control-command-test.js: command_binding_schema; before/after byte digests |
| AC-001 | SDD-003 | T-003 | SCN-003 | Successful approval and matching receipt coexist in one resulting Run revision; receipt effect names that exact revision UUID and increment. | control-command-test.js: single_commit_receipt; parsed state and seal verification |
| AC-001 | SDD-008 | T-002 | SCN-004 | Structured result distinguishes binding, original effect, fresh current state, assurance and missing observations; CLI projects this authoritative result. | control-command-test.js: result_contract; serialized CLI/API result snapshots |
| AC-001 | SDD-009 | T-007 | SCN-005 | External consumer imports create-agdf/control-command by package name and invokes the documented synchronous function; exported target helper and schema version match the service. | create-agdf/scripts/control-command-package-test.js: public_export; actual tarball inventory and external consumer output |
| AC-001 | SDD-010 | T-005 | SCN-006 | Both consumers use identical runtime-owned evaluator/Git wiring; no caller-supplied callback can replace gate eligibility and the command dependency closure excludes CLI/installer/MCP startup modules. | control-command-test.js: composition_identity; control-command-package-test.js: dependency_closure |
| AC-002 | SDD-001 | T-008 | SCN-007 | Doctor/status/inspection/wait make no approval or Run-revision change; preparing a presentation creates only supported binding bookkeeping. | control-command-test.js: read_and_prepare; existing control-inspect-test.js; state/presentation byte inventories |
| AC-002 | SDD-002 | T-002 | SCN-008 | Missing reply, revise/decline, informal consent and wrong gate formula do not create approval or receipt; an earlier reply cannot satisfy changed current binding. | control-command-test.js: non_approval_inputs; existing approval-validator/revision tests and before/after state |
| AC-003 | SDD-002 | T-002 | SCN-009 | Independent-verification assurance, fabricated actor/origin/role/proof fields and unsupported assurance without operation UUID are rejected before mutation; only the declared cooperative lane is accepted. | control-command-test.js: authority_negative_matrix; CLI exit/JSON and protected byte digests |
| AC-003 | SDD-008 | T-008 | SCN-010 | Every accepted, replayed and legacy result accurately reports caller-forwarded cooperative assurance and unavailable independent human proof; fixtures are labelled simulated. | control-command-test.js: assurance_projection; CD_TESTS.md assurance/evidence classification |
| AC-004 | SDD-002 | T-002 | SCN-011 | Foreign target, Run, gate and presentation bindings, moved-target receipt and previous Run revision reject without adopting another scope. | control-command-test.js: foreign_binding_matrix; affected and unrelated Run digests |
| AC-004 | SDD-005 | T-006 | SCN-012 | Changes to revision, presented artefact, gate eligibility or presentation at the pre-commit checkpoint abort the new effect; no receipt claims approval for changed content. | create-agdf/scripts/control-command-process-test.js: freshness_at_commit; checkpoint trace and final sealed/rejected fixture state |
| AC-005 | SDD-003 | T-006 | SCN-013 | Two real processes competing from the same snapshot leave exactly one approval/receipt transition and one numeric revision increment. | control-command-process-test.js: single_concurrent_effect; child JSON and authoritative final Run |
| AC-005 | SDD-004 | T-006 | SCN-014 | Identical operation/payload competitors converge through safe retry to accepted plus already_applied with the same original effect; no second revision. | control-command-process-test.js: identical_concurrent_request; retry sequence and receipt identity |
| AC-005 | SDD-005 | T-006 | SCN-015 | Distinct competing operations cannot overwrite the winner; loser reports current binding conflict after safe lock retry. Live/unknown owners remain protected and their locks are not deleted. | control-command-process-test.js: distinct_competitors_and_lock_owner; existing run-lock-test.js |
| AC-006 | SDD-003 | T-006 | SCN-016 | Discard a completed process response, replay its original operation, and receive the saved effect/revision with byte-identical Run state. | control-command-process-test.js: response_loss; captured destination receipt and retry JSON |
| AC-006 | SDD-004 | T-004 | SCN-017 | Exact replay is recognized after ordinary gate progress; changed payload under the same UUID conflicts, and a different UUID for the stale snapshot is not a replay. | control-command-test.js: replay_identity_and_progress; original/current result fields and unchanged bytes |
| AC-006 | SDD-007 | T-006 | SCN-018 | Later ordinary update, supersession and supported recovery preserve valid historical receipts; replay never restores the cleared approval. Legacy receipt-free approval is not backfilled as this operation. | control-command-process-test.js: receipt_retention_and_revocation; existing run-revision-test.js/run-recovery-test.js |
| AC-006 | SDD-008 | T-004 | SCN-019 | Replay reports original next transition separately from fresh current gate, revision and effective approval status; unavailable current readiness is explicit and never copies old permission. | control-command-test.js: historical_effect_current_observation; result field assertions |
| AC-007 | SDD-003 | T-006 | SCN-020 | Faults before/after atomic replacement establish either valid pre-commit state without receipt or one valid committed approval/receipt; unrelated files stay unchanged. | control-command-process-test.js: atomic_boundary_faults; receipt/seal/byte report |
| AC-007 | SDD-005 | T-006 | SCN-021 | Terminate a real child at flushed-temp/pre-rename and post-rename/pre-response checkpoints; successor reclaims only a proven-dead owned lock and never applies the approval twice. | control-command-process-test.js: kill_before_after_commit; IPC checkpoint/PID-exit evidence and successor result |
| AC-007 | SDD-006 | T-006 | SCN-022 | Inject post-replacement directory-flush failure: observed commit is recovery-required until supported flush/verification succeeds; same-request acknowledgement adds no approval or revision. | control-command-process-test.js: flush_failure_acknowledgement; writer checkpoint trace and final bytes |
| AC-007 | SDD-007 | T-006 | SCN-023 | Malformed/duplicate/unsupported receipts, invalid seals, unknown lock owner and pending Run-step transaction do not become successful effects or trusted recovery reseals. | control-command-process-test.js: unknown_state_recovery; parser/seal diagnostics and run-step/recovery regressions |
| AC-008 | SDD-001 | T-008 | SCN-024 | Supported legacy CLI invocations and existing gate-specific UR/PRD/SD/TP/QA/UAT fixtures keep exact reply/presentation/prerequisite behavior; MCP inspect/dispatch introduce no write tool or approval effect. | cli-gate-scenarios-test.js, run-revision-test.js, control-inspect-test.js; agdf-mcp-server existing contract/safety tests |
| AC-008 | SDD-007 | T-003 | SCN-025 | Receipt-free seal bytes remain unchanged; receipt-bearing version validates only under an aware runtime; ordinary run-update cannot create/edit/delete receipts and approval-changing writers preserve them. | control-command-test.js: legacy_seal_and_receipt_guards; existing run-revision/run-recovery tests and versioned fixture outputs |
| AC-008 | SDD-008 | T-008 | SCN-026 | Same reference workflow before/after yields dated call/presentation/correction/retry counts with equal boundaries; report zero/negative improvement honestly and no added routine human decision. | CD_TESTS.md workflow_observations and referenced baseline/result event tables; simulated versus visible-host labels |
| AC-008 | SDD-009 | T-007 | SCN-027 | Existing package exports/bins retain targets and load/execute with their supported inputs; only the additive control-command subpath appears and no new npm package/dependency release is introduced. | control-command-package-test.js: export_compatibility; package-contents-test.js; actual packed manifest/export checks |
| AC-008 | SDD-010 | T-005 | SCN-028 | Shared-context extraction preserves configured language, locale fallback, canonical metadata/version checks and local Git availability; evaluators no longer depend on CLI context in the command closure. | control-command-test.js: context_compatibility; cli-modularization-test.js and interaction-presentation/operational-localization regressions |
| AC-008 | SDD-011 | T-007 | SCN-029 | Fresh extracted-package CLI/API fixtures work from unrelated cwd; exact same-Run replay remains idempotent; missing required resource fails without checkout/cache fallback or target mutation. | control-command-package-test.js: hermetic_execution_and_missing_resource; tarball digest, dependency/resource inventory and external process JSON |
| AC-009 | SDD-002 | T-008 | SCN-030 | Source/package/generated results cannot be labelled independent human verification; a request requiring stronger assurance is unsupported regardless of available hashes or presentation records. | control-command-test.js: evidence_assurance_boundary; CD_TESTS.md qualification table |
| AC-009 | SDD-008 | T-009 | SCN-031 | Qualification report binds each claim to scenario/source/runtime/platform, lists unavailable installed and visible-host observations, and keeps source proof distinct from current host/user evidence. | CD_TESTS.md evidence_classes/platform_matrix; dated commands and artefact hashes; QA inputs |
| AC-009 | SDD-011 | T-007 | SCN-032 | Generated local validator includes the new command/context dependency/resource closure and runs the selected transition; packed API and generated-runtime evidence remain separate from installed-path proof. | control-command-package-test.js: generated_validator; sync-plugin-runtime inventory/manifests; runtime-integrity-layout/negative tests |

Each SCN ID has one accountable task. Data-driven rows must log every named subcase independently; a family passes only when all required subcases have the stated result. Other assertions in a family may support more criteria, but this table retains the criterion/design links from the approved SD without inventing new acceptance identifiers.

## 3. Test Plan

### 3.1 Baseline and isolation

After TP approval, T-001 records the then-current Git commit, package and runtime versions/digests, validator identity, platform/Node version, and complete tracked/untracked dirty-path inventory. Existing unrelated changes are preserved. Do not attribute another chat's changes to this Run or reset them to create a clean baseline. If a required owner changes concurrently, re-read it and update the impact/evidence record before implementation; a conflicting product/authority change routes back to the appropriate gate.

Capture the current reference legacy workflow on a fresh temporary target: create/record a minimal eligible UR, prepare its presentation, forward a simulated exact reply in the fixture, approve and inspect. Capture failure/response-loss behavior separately. Keep product intent and event-count boundary fixed for later comparison. These synthetic observations establish CLI behavior and effort counts for the scripted workflow only, not actual human reading time or host visibility.

Use disposable contained targets with fresh Runs and real prepared presentations. Set task-specific AGDF/host data directories for lifecycle-adjacent tests; no global plugin, user Run or production target is a fault fixture. Build, package-content and runtime synchronization tests can modify generated assets, so run them in an isolated source snapshot with all required canonical sources and local dependencies. Snapshot unrelated fixture files before every negative/fault scenario and assert they remain unchanged. No registry access or installation is necessary for the planned packed consumer.

### 3.2 Automated owners and entry points

Create three focused Node test scripts using the existing test conventions, with planned family names from Section 2:

- `create-agdf/scripts/control-command-test.js`: schema, target identity, assurance, shared service, receipt/seals, replay/result fields, legacy/input/context compatibility and read-only operations.
- `create-agdf/scripts/control-command-process-test.js`: real process competition, checkpointed interruption/faults, lock ownership, flush acknowledgement and receipt retention/recovery. Worker helpers stay under `create-agdf/scripts/support/`; private hooks are not public command fields or environment switches that grant permission.
- `create-agdf/scripts/control-command-package-test.js`: actual tarball import/execution, allowed transitive module/resource closure, import effects, missing resources, existing exports and generated local-validator execution.

Run them with `node <script>` under Node >=22 and integrate their corresponding test scripts into the existing package test/smoke orchestration only after implementation. Every SCN family prints a structured result or records a named assertion and evidence path suitable for the CD+Tests report. Private fault instrumentation may inject IO failure/checkpoints but must not replace production eligibility with unconditional success.

Keep the existing production composition in test success/negative scenarios. For same-request CLI/API convergence use one Run; for equivalent first-success comparisons use independent equivalent Runs and compare semantic fields after accounting for declared UUID/path/time differences. Never remove binding/assurance/next-action assertions merely to make snapshots equal.

### 3.3 Required boundary subcases

Schema/authority: unsupported action/version, malformed target/Run/gate/UUID, unknown fields, actor/origin/role/proof/signature assertions, stronger assurance with and without operation UUID, missing reply, informal consent and wrong exact formula. The local resolver checks realpath alias equivalence; moved or foreign targets conflict. Assert no approval, receipt, accepted revision or unrelated change.

Freshness: change each of Run revision, gate eligibility, relevant artefact bytes and prepared presentation; also use a foreign target/Run/gate presentation. Include a change at the final validation checkpoint. The service must reject stale/mismatched content and name the need for current presentation/reply. Presentation records and temporary files are never adopted as operation receipts.

Concurrency/replay: start two real children using an IPC barrier on the same snapshot. Cover same UUID/same payload, distinct UUIDs and same UUID/changed payload; a held lock can first return retryable, then the controlled retry must converge deterministically. After a committed response is deliberately discarded, retry original UUID/payload. Progress the Run and replay again; independently revise/reset effective approval and verify no restoration. Replay with a different UUID is a fresh stale request, not retrospective adoption.

Persistence/receipt: validate canonical encoding/schema, duplicate identity, row/receipt mismatches, unsupported versions and incomplete effect records; test ordinary run-update changes to receipts, normal progress, approval updates, bounded PRD supersession and supported recovery. Old receipt-free fixtures retain the original approval-seal calculation. Missing/unverifiable receipts never receive provenance through resealing or legacy backfill.

Interruption/faults: private harness checkpoints bracket lock ownership, temp creation/write/flush, atomic replacement, directory flush, response and lock release. Inject write/flush/rename failures before commit and directory-flush/response/cleanup failures after commit. Actually terminate children at flushed-temp/pre-rename and post-rename/pre-response checkpoints; wait for confirmed process exit before testing dead-owner recovery. Unknown or live owners stay protected. Retry must produce unchanged pre-commit state or acknowledgement of exactly one committed receipt, with no revision added for acknowledgement. Integrity corruption or unresolved pending Run-step transaction remains recovery-required. Do not treat absence of a response as absence of an effect.

Package/module: walk the actual transitive import graph, check forbidden CLI-parser/handler/application, installer, installation-lifecycle and MCP-bootstrap dependencies, and observe import under an unrelated cwd. Import may read declared package-owned resources but must not choose/inspect a user Run, mutate files, spawn children, print or set process exit state. Extract an actual tarball with its public export and run prepared-presentation CLI/API operations from an external consumer. Mask original-checkout resolution and host/cache directories, then remove a required resource in a separate fixture and verify a diagnostic failure/no target mutation. Validate every existing export and the generated local-validator closure with current version/digest assertions.

### 3.4 Existing regressions and propagation

Capture baseline results and rerun the affected suites after implementation: `test:control-state`, `test:run-revision`, `test:run-lock`, `test:run-recovery`, `test:run-step-transaction`, `test:cli-gates`, `test:cli-modularization`, `test:interaction-presentation`, `test:operational-localization`, `test:prd-readiness`, `test:control-inspect`, `test:runtime-integrity-layout`, `test:runtime-integrity-negative`, and relevant AGDF MCP contract/safety/continuation tests. Preserve meaningful existing negative assertions and gate-specific QA/UAT behavior.

For package propagation, run existing asset synchronization and `test:package-build`, `test:package-contents`, `test:release-version-coherence` in the isolated snapshot before the packed-consumer checks. Also run affected local-validator/plugin-runtime suites when the shared module inventory changes. Record exact commands and outcomes; an unavailable dependency or pre-existing baseline failure is named, not skipped into a passing result. Broaden tests only for actual touched owners, failures or unresolved risks.

### 3.5 Evidence and workflow measurement

CD+Tests evidence includes: source commit plus changed-source digest, package version and tarball digest, generated runtime-manifest version/digest, command schema version, receipt/seal version, platform/Node identity, dated scenario results and final Run bytes/revisions. Preserve enough child JSON/checkpoint evidence to distinguish pre-commit, committed effect and acknowledgement failure. These versions identify different contracts; one cannot substitute for another.

The workflow table records the same legacy/new UR reference boundary and separate success, exact retry, stale request and interruption paths: total tool/CLI calls, presentations shown/prepared, manual correction steps, retry/recovery steps, and deliberate human decision count when actually observed. Record how events were counted. Simulated reply count is not a measured human decision; manual/live observations use their own evidence class. No percentage target or assumed improvement is introduced.

| Evidence class | Required treatment |
|---|---|
| Repository source / deterministic scenarios | Execute selected scenarios with actual state assertions; record source identity and simulated reply provenance. |
| Packed npm API/CLI | Execute the external consumer against the actual tarball; no developer-checkout imports or package-inventory-only proof. |
| Generated local validator | Verify its separate module/resource closure, manifest/version and scenario execution; do not call it an installed plugin. |
| Currently installed runtime | Record observed identity and whether it contains this implementation. This scope authorizes no installation; unchanged installed paths remain explicitly unqualified for the new behavior. |
| Visible host / human decision | Require visible multi-turn current presentation and a new deliberate reply for any actual host decision claim. Source/process fixtures cannot create that evidence; independent human verification remains unavailable. |

The executing environment is macOS unless later evidence demonstrates another platform. Linux and native Windows scenario results are required for claims about those platforms. Record absence as unqualified; do not infer cross-platform success from source inspection or macOS execution. Windows-specific rename/lock and directory-flush evidence must identify native execution and actual supported behavior. These limits constrain QA claims; they do not require unsolicited installation, remote access or a platform migration in this slice.

## 4. Brownfield Scope

The required post-TP analysis must verify the exact then-current owners before editing: `run-recording.js`, `run-state-writer.js`, `run-state-parser.js`, `run-seal.js`, `run-presentation.js`, `run-presentation-render.js`, `run-revision.js`, `run-recovery.js` and other approval-changing writer callers. Inventory all callers using approval-change/recovery capabilities and demonstrate receipt preservation on every touched path. Existing pending Run-step transactions retain their own recovery authority.

Inspect `control-evaluation/gate-check.js`, `gate-policy.js`, `delivery-map.js` and `git-observation.js`, current CLI context/parser/registry/handlers, package exports and existing synchronization inventories. The planned new facade/composition/context modules remain under those existing responsibilities; extract helpers rather than introduce parallel policy, configuration or approval registries. Update only the necessary evaluator/rendering context imports and preserve CLI-facing re-exports.

Verify canonical metadata/locales and versioned generated resource paths, runtime-manifest construction, public-plugin/Copilot payload constraints and existing dependency-boundary tests. Register necessary source modules in the existing build owner, never repair a generated copy by hand. Context-graph changes, if needed, update existing Run-state and adapter ownership nodes; no new independent gate or architecture source of truth is introduced. Package rename/extraction, installation/publication and unrelated architecture documentation work are not part of this scope.

## 5. Out Of Scope

No separate npm runtime package, package rename, npm-workspace conversion, independent package releases or broad payload cleanup; no generic control-command framework or arbitrary state writes; no mutating MCP registration; no external human identity/proof channel or historical provenance repair; no prevention of arbitrary shell writes or hardware power-loss promise; no MGDF changes; no automatic plugin installation, publication, commit, push or PR. Source/package/generated validation does not authorize installed-host claims.

## 6. Risks And Blockers

Block or revise implementation/QA when policy/service ownership diverges, a required current-binding negative case accepts, receipt/state evidence can disagree at commit, replay adds a revision/restores revoked approval, concurrency loses an update, an unknown state is guessed into success, or ordinary updates/recovery can fabricate receipt provenance. A missing required scenario, weakened legacy gate assertion, inaccessible runtime resource or forbidden dependency is an evidence gap, not a passing test.

Mixed runtimes are a declared compatibility limit: receipt-free Runs remain compatible, receipt-bearing Runs need the aware runtime. No silent backfill/migration is permitted. Native Windows/Linux and installed/live-host evidence may be unavailable; QA must explicitly limit its claims and block any requested qualification that depends on missing observations. Do not label the implementation globally qualified by omitting those columns.

The current working tree may contain unrelated concurrent work. Establish exact baseline and actual touched paths under T-001, preserve other bytes and avoid stale evidence. If pre-implementation analysis finds a material PRD/SD contradiction or broader rollout need, return to the appropriate gate rather than hide it in a task. No unresolved product/design choice is carried past TP approval; remaining unknowns are implementation-time observations and test results.

## 7. Next Step

Review this exact task/test plan and approve only with `Approval: TP`. That permits the required pre-implementation Brownfield Analysis, then implementation/tests only when the canonical route permits them. CR, QA, UAT and closeout remain their existing subsequent responsibilities.

## AGDF Approval Summary (de; source=en)

- Aufgaben: Neun Aufgaben führen von der Brownfield-Prüfung und Baseline über Auftragsvertrag, geschützte Belege und gemeinsamen Freigabeservice zur öffentlichen API, CLI-Anbindung, Paketprüfung und Review-/QA-Belegen. Gemeinsame Konfiguration wird gezielt aus der CLI-Abhängigkeit gelöst. Alle neun PRD-Kriterien und elf SD-Entscheidungen sind konkreten Szenarien zugeordnet; diese Tabelle ist ein Plan und noch kein Umsetzungsnachweis.
- Tests: 32 Szenariofamilien prüfen CLI/API-Gleichheit, falsche oder veraltete Bindungen, kooperative Autoritätsgrenze, Wiederholung und Altkompatibilität. Echte Kindprozesse prüfen gleichzeitige Aufrufe und Abbrüche vor/nach dem Commit. Ein externer Verbraucher nutzt das tatsächlich entpackte npm-Paket; fehlende Ressourcen, unerlaubte Abhängigkeiten und Import-Nebenwirkungen werden geprüft. Bestehende relevante Regressionen bleiben erhalten. Bedienaufwand und Belegklassen werden nachvollziehbar getrennt gemessen.
- Abgrenzung: Umsetzung bleibt bis TP-Freigabe und erforderlicher Brownfield-Prüfung gesperrt. Kein neues npm-Paket, keine breite Paketmigration, kein MCP-Schreiben, keine unabhängige Human-Verifikation und keine historische Freigabereparatur. Installation, Veröffentlichung und VCS-Aktionen gehören nicht zu diesem Plan.
- Risiken: Freigabe und Beleg müssen nach Parallelität, Abbruch und Recovery konsistent bleiben; exakte Wiederholung darf keine neue Revision oder Wiederherstellung widerrufener Freigaben erzeugen. Neue Beleg-Runs benötigen die passende Runtime. Paket-, generierte-, installierte und sichtbare Host-Belege bleiben getrennt; fehlende Linux-/Windows-/Host-Nachweise begrenzen spätere QA-Aussagen. Fremde Arbeitsänderungen werden vor Umsetzung erfasst und erhalten.
