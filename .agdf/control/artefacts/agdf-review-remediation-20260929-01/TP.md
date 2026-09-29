# TP: Verify and repair control, host and release paths

Status: draft
Gate: TP
Gate approval: open
Based on: approved PRD revision 6 and SD revision 10, SD artefact sha256:2e9c147451bce01a2533ccfc7fd47b895ff5f3734d7669f7f51ee3b3e7e7b19b
Date: 2026-09-29
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Task List

Work in order within each dependency chain. A reproduction can close a disproved review finding with an explicit counterexample; it does not require a speculative code change. All fixtures use isolated temp roots and never the live user installation.

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Capture exact source revision and isolated C1–C7 reproductions or counterexamples; inventory Run/OR/Backlog readers and current historical marketplace and package-payload run boundaries. | Control-state, installer and package owners | Approved SD; no implementation |
| T-002 | Implement and test the owned closeout intent, fixed lock order, staged OR, guarded Run commit, Backlog compare/write and recovery at every durable boundary. | `control-state/run-steps.js` and writer owner | T-001 C1–C2 evidence and reader inventory |
| T-003 | Implement and test owner-identity locks, live/dead/ambiguous recovery, normal-write seal rejection and explicit migration or repair route if legacy data requires it. | `control-state/run-state-writer.js`, seal and doctor owner | T-001 C3 evidence; T-002 lock protocol |
| T-004 | Extract shared cross-platform contained-file validation and route Run artefact, seal and Verified Change readers through it. | Control-state and control-evaluation path owners | T-001 C4 evidence |
| T-005 | Implement atomic owned-file replacement and execution-time revalidation for OpenCode and lifecycle writes and removes. | OpenCode installer and lifecycle owners | T-001 C5–C6 evidence |
| T-006 | Add marketplace commit-phase/provenance recovery and cleanup treatment in the existing transaction owner. | Local-marketplace owner | T-001 C7 evidence; read current `legacy-profile-upgrade-recovery` state |
| T-007 | Consolidate the `agdf-v*` release route, version and lockfile coherence, clean dependency setup and pre-publish validation. | Release workflow and version-coherence owner | T-001 baseline; no live publish |
| T-008 | Add LICENSE and applicable NOTICE to the three package sources and assert exact tarball inventory. | Package-content and release owner | Coordinate current `agdf-npm-package-payload-cleanup` boundary; T-007 pack path |
| T-009 | Add exact registry read-back, partial/unknown outcome and operator recovery procedure with simulated publication states. | Publish workflow and `RELEASE.md` owner | T-007 canonical route |
| T-010 | Correct installed guard path and generated projections through the canonical contract/generator; check source, build and packed layouts and drift negatives. | Plugin contract and instruction-footprint owner | T-001 source baseline |
| T-011 | Audit Eval provenance and public claims against source, tagged package and observed host level; change only unsupported text or metric labels. | Evaluation and documentation owner | T-007/T-010 exact version evidence |
| T-012 | Bound CI permissions, action and dependency policy, publish credential ownership and validation order. | CI/release owner | T-007/T-009 workflow model |
| T-013 | Run focused suites and clean-checkout Linux/Windows gates, inspect diffs and observed artefacts, record Code Review and QA evidence for the approved scope. | Delivery and QA owners | T-002–T-012; QA remains separate |

## 2. Verification Traceability

Each row names one observable scenario. The evidence column points to an existing suite, a new test in that suite, an exact artefact or an external observation; it does not declare that evidence already exists.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-001 | SCN-001 | A stale revision or held Run lock against an existing OR leaves the old sealed Run, OR and Backlog intact after recovery. | `create-agdf/scripts/control-state-test.js` isolated C1 reproduction and before/after digests |
| AC-001 | SDD-001 | T-002 | SCN-002 | Failure after intent, OR install, Run commit or Backlog replace yields either the prior complete state or one matching committed state after guarded recovery. | `control-state-test.js` failpoint table, Run seal check and three-file digest report |
| AC-001 | SDD-001 | T-002 | SCN-003 | Two run-step writers against different runs do not lose either Backlog row; incompatible external edit blocks automatic overwrite. | `control-state-test.js` concurrent worker and conflict fixture |
| AC-002 | SDD-002 | T-003 | SCN-004 | A live owner lock remains held even past the old timeout threshold; an owner proven dead can be recovered once; ambiguous identity remains blocked. | `run-revision-test.js` process workers and lock metadata assertions; Windows CI lane |
| AC-002 | SDD-002 | T-003 | SCN-005 | Removing either or both seal lines, changing approvals or modifying listed artefacts cannot create a normal new revision or approval. | `run-revision-test.js`, `control-state-test.js` and doctor negative fixtures |
| AC-003 | SDD-003 | T-004 | SCN-006 | `D:foo`, UNC, device, absolute, traversal and symlink-escape paths are rejected by Run, Verified Change and seal readers without reading external content. | `verified-change-test.js`, `run-revision-test.js` path matrix on Linux and Windows |
| AC-003 | SDD-003 | T-004 | SCN-007 | A normal contained relative regular file remains readable and produces the same digest and approval presentation. | `verified-change-test.js` and control-state positive path fixtures |
| AC-004 | SDD-004 | T-005 | SCN-008 | An injected interruption during OpenCode or lifecycle config replacement leaves exactly the old or new parseable bytes. | `opencode-hardening-test.js` and `lifecycle-test.js` interruption fixtures |
| AC-004 | SDD-004 | T-005 | SCN-009 | A marker or symlink changed between plan and apply blocks write/removal; unowned content remains byte-identical. | `lifecycle-test.js`, `opencode-hardening-test.js` ownership-swap fixtures |
| AC-004 | SDD-004 | T-005 | SCN-010 | A runtime tree replaced after uninstall planning is not recursively removed and the result identifies the ownership conflict. | `lifecycle-test.js` temp-root tree-swap fixture and result JSON |
| AC-005 | SDD-005 | T-006 | SCN-011 | Post-commit backup deletion failure followed by the next install leaves the new stable version and provenance effective. | `local-marketplace-test.js` injected backup-delete failure, restart and provenance read-back |
| AC-005 | SDD-005 | T-006 | SCN-012 | Pre-commit interruption restores the owned prior root; ambiguous or foreign backup is not deleted or restored automatically. | `local-marketplace-test.js` phase and foreign-residue fixtures |
| AC-006 | SDD-006 | T-007 | SCN-013 | Only `agdf-v*` has a publish path; a `create-agdf-v*` fixture cannot publish. | Workflow contract test inspecting `.github/workflows/publish-agdf.yml`, `publish-create-agdf.yml` and release guide |
| AC-006 | SDD-006 | T-007 | SCN-014 | A stale `agdf/package-lock.json` or another package/lock mismatch fails before publication with the exact surface named. | `release-version-coherence-test.js` stale-lock fixtures |
| AC-006 | SDD-006 | T-013 | SCN-015 | A clean Linux and Windows checkout installs declared dependencies and completes the same release preparation and package smoke gates as PR CI. | `agdf-guardrails.yml` and publish validation CI logs for exact commit; clean worktree command log |
| AC-007 | SDD-007 | T-008 | SCN-016 | Each exact `npm pack --json` tarball contains LICENSE, applicable NOTICE, runtime entrypoint and metadata; removing a legal file fails the inventory gate. | `package-contents-test.js` and `agdf-mcp-server/test/package.test.js` inventory assertions plus three tarball listings |
| AC-008 | SDD-008 | T-009 | SCN-017 | Simulated first-package success and later-package failure reports exact published, absent and unknown versions and ends non-successfully. | Workflow contract/failure simulation and machine-readable registry-state fixture |
| AC-008 | SDD-008 | T-009 | SCN-018 | A retry of a partially published version first reads all exact registry versions and presents a deliberate completion or superseding-version decision, with no automatic unpublish. | Release workflow retry fixture and `RELEASE.md` recovery procedure review |
| AC-009 | SDD-009 | T-010 | SCN-019 | Contract path resolves under the packed installed plugin root for each supported profile; all generated guards match the canonical fingerprint. | `instruction-footprint-test.js`, `runtime-integrity-layout-test.js`, `package-contents-test.js` and packed path listing |
| AC-009 | SDD-009 | T-010 | SCN-020 | A wrong guard path, changed projection or generic target-project AGDF assumption fails the respective build or integrity check. | `runtime-integrity-negative-test.js` and instruction-footprint negative fixtures |
| AC-010 | SDD-010 | T-011 | SCN-021 | Eval output identifies deterministic replay and real fixture/fingerprint provenance; no offline result is labeled live execution. | Eval runner fixture output, `skill-evals-test.js` and dated metric review |
| AC-010 | SDD-010 | T-011 | SCN-022 | README, INSTALL, privacy and terms describe MCP/CLI local reads and `npx` acquisition for the exact claimed version; unsupported host or tag claims are narrowed. | Public-text diff, docs assertions, `agdf-v0.14.5` tag/package comparison and dated host observation if claimed |
| AC-011 | SDD-011 | T-012 | SCN-023 | PR validation and publish jobs declare only needed permissions, acquire dependencies from committed sources and fail clearly without publish credential. | Workflow static check and clean CI run logs for affected commit |
| AC-011 | SDD-011 | T-012 | SCN-024 | Action-version or lock/dependency drift is detected before publish; registry-side credential policy is stated only from observed external evidence. | Workflow contract negative fixture, lockfile diff and release-operator registry observation |

## 3. Test Plan

### Stage A — Reproduce and bound work

Record HEAD and the exact Review v2 C1–C7 source lines. Run isolated fixtures with temporary `AGDF_DATA_DIR` and temp host config roots. For C1–C3 use actual child processes where locking or crashes are material; do not mock away the filesystem ordering. For C4 execute the same lexical input matrix on Windows and POSIX. For C5–C7 inject errors at the actual write, delete and commit boundaries. Record baseline failure or counterexample per finding. Inventory direct readers of `RUN_STATE.md`, OR and Backlog; a reader lacking journal recovery must be added to T-002 scope or block that implementation.

### Stage B — Focused owner suites

Run `npm --prefix create-agdf run test:control-state`, `test:run-revision`, `test:verified-change`, `test:lifecycle`, `test:opencode-hardening` and `test:local-marketplace` after their changes. Every closeout failpoint asserts old/new bytes, revision, seal and recovery status. Run live/dead/ambiguous lock cases and symlink/ownership swaps in isolated roots. Repeat C1–C7 reproductions against the final implementation; document any disproved finding without adding an unused mechanism.

### Stage C — Release, package and contract checks

Run `npm ci --ignore-scripts` from a clean checkout before root-dependent validation, `npm --prefix create-agdf run release:prepare`, `test:release-version-coherence`, `test:package-contents`, `test:instruction-footprint`, `test:runtime-integrity-layout`, `test:runtime-integrity-negative`, `npm --prefix agdf-mcp-server test`, and the CLI/MCP package smoke tests. Use the existing build/generator for projected guard changes. Assert all three `npm pack --json` inventories. Evaluate release scripts against simulated partial registry states; do not publish a test version to create that failure.

### Stage D — Integration and evidence

Run affected `agdf-guardrails.yml` Linux/Windows jobs and publish validation on the same commit and version candidate. Record exact CI run IDs, tag, package inventory digests, root dependency lock and registry observations. Inspect documentation statements against the precise source, tag, package and fresh host evidence available. Review diff and TP scenario coverage, then pass results to Code Review and QA. QA decides `pass`, `revise` or `block`; successful test commands alone do not close the run.

## 4. Brownfield Scope

Before changing code, read the current `legacy-profile-upgrade-recovery` and `agdf-npm-package-payload-cleanup` run states and identify their exact overlapping files. Keep C7 post-commit behavior and legal-file inclusion in this run; do not transfer other runs' approvals. Inspect `run-steps.js`, writer/seal/parser, Verified Change and direct-read callers; `lifecycle/operations.js`, OpenCode and marketplace adapters; both publish workflows, version coherence and all lockfiles; canonical activation contract and generated host guards; Eval runner and public copy. Reuse each module's existing tests and source-of-truth entry.

## 5. Out Of Scope

- `agdf_inspect` implementation, QA and UAT in its separate run; this TP does not claim that slice is released.
- Historical profile/Claude cache recovery owned by `legacy-profile-upgrade-recovery`, and runtime payload inclusion/exclusion owned by `agdf-npm-package-payload-cleanup`.
- Automatic npm unpublish, destructive cleanup of foreign host content, a new governance policy engine or approval authority.
- Review v2 low-priority C8–C10, D5/D7 and P7/P8 without separately approved scope.
- Changes to already published `agdf-v0.14.5` or claims of fresh host behavior from repository tests alone.

## 6. Risks And Blockers

| Condition | Later QA treatment | Required evidence or action |
|---|---|---|
| A closeout reader can bypass pending-intent recovery or a failpoint yields mismatched sealed Run/OR/Backlog. | block | Repair the owner path and repeat all durable-boundary and concurrent tests. |
| Lock identity cannot be established or a live process could be reclaimed. | block | Fail closed; test process lifetime and recovery on each supported OS. |
| Execution-time ownership or canonical path changes are untested on a supported host. | revise | Add the concrete swap/path case before QA. |
| A C claim is disproved in isolation. | warn or resolved with counterexample | Record the failed premise and avoid a speculative change; verify its PRD outcome remains met. |
| The exact package inventory, clean Windows run or affected CI job is absent. | revise | Run the missing gate and bind its commit/version evidence. |
| A partial registry state, missing credential or live-host observation is unknown. | revise or block for any matching public/release claim | Report unknown explicitly; obtain operator observation or narrow the claim. |
| Package or marketplace work overlaps another active run's files without owner reconciliation. | block | Read that run's current state, preserve its gate and record one implementation owner. |

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)

- Aufgaben: Zuerst C1–C7 an ihren echten Datei- und Prozessgrenzen reproduzieren oder mit Gegenbeleg schließen; anschließend die bestätigten Fehler in bestehenden Control-State-, Installer-, Release- und Vertragsmodulen beheben.
- T-001 bis T-006: Drei-Dateien-Closeout mit Abbruch- und Konkurrenzfällen, Lock- und Siegelautorität, Windows/POSIX-Pfade, atomare Host-Dateien, Besitzprüfung vor Löschung und Marketplace-Commit nachweisen.
- T-007 bis T-012: Einen gekoppelten Tag- und Lockfile-Pfad, drei lizenzierte Tarballs, ehrliche Teilpublish-Meldung, installierte Guard-Pfade, belegtreue Eval-/Dokumentationsaussagen und begrenzte CI-Rechte prüfen.
- T-013: Die fokussierten Tests sowie saubere Linux-/Windows-, Paket- und CI-Läufe auf derselben Revision zusammenführen und für Code Review und QA dokumentieren.
- Szenarien: SCN-001–SCN-024 ordnen jede PRD-Bedingung und jede SD-Entscheidung einem konkreten Fehler- oder Positivfall mit beobachtbarem Ergebnis und Nachweisquelle zu.
- Grenzen: Andere Runs behalten ihre Marketplace-Historie, Payload- und MCP-Inspect-Gates. Ein Review-Befund ohne Reproduktion rechtfertigt keinen spekulativen Fix. Keine Testsimulation veröffentlicht npm-Pakete oder verändert die Live-Installation.
- Risiken: Nicht erfasste Control-State-Leser, unsichere Lock-Rückgewinnung und fremde Host-Dateien blockieren; fehlende Windows-, CI-, Registry- oder Host-Nachweise erzwingen Überarbeitung oder begrenzte Aussagen.
- Nächster Schritt: Nach exakter TP-Freigabe die Reproduktionen und Änderungen in der festgelegten Reihenfolge ausführen. QA, UAT und Veröffentlichung bleiben eigene Entscheidungen.
