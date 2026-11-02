# TP: Repository-specific migration and repair

Status: draft
Gate: TP
Gate approval: open
Based on: approved PRD revision 7 and SD revision 10
Date: 2026-09-30
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | After TP approval, perform implementation-preparation Brownfield Analysis; capture the current source/index/untracked baseline and approved artefact digests, verify existing owners and dependency closure, and preserve unrelated work. | Codex; existing Brownfield/control owners | Approval: TP; durable approved PRD and SD |
| T-002 | Extract compatibility, migration and repair to `lib/control-maintenance/`; retain canonical transactions and installer compatibility exports; extract shared result/count projection and remove duplicated policy ownership. | Codex; maintenance/control-state owners | T-001 passed |
| T-003 | Add the dedicated `control-maintenance` CLI handler, explicit absolute target validation, read-only default/details/JSON contract, guided-mode validation and registration in full CLI/local validator. | Codex; CLI/runtime composition owner | T-002 |
| T-004 | Extract shared localized maintenance presentation/interaction and implement the guided 1/2/3 sequence with existing reviewed migration/repair callbacks, explicit apply and final reinspection; retain installer behavior and compatible aliases. | Codex; maintenance interaction and installer owners | T-002, T-003 |
| T-005 | Add consent-bound read-only startup compatibility facts and bounded invocation hint, separate from Doctor, with deadline/error handling and supported repository reentry; preserve host input/transport and OpenCode's explicit adapter directory. | Codex; generator, repository-context and runtime-check owners | T-003, T-004 |
| T-006 | Include the minimum shared runtime dependency closure; regenerate supported profiles/manifests, review payload growth, add command/menu/runtime integration tests and update existing CLI/installation documentation. | Codex; generator/provenance/payload/documentation owners | T-002 through T-005 |
| T-007 | Run targeted regressions and package checks, verify actual source diff and scope, record CD+Tests, task-plan and clean-implementation evidence, complete mandatory Code Review and resolve findings. | Codex; existing implementation/review owners | T-006; passing functional checks |
| T-008 | Obtain and record a separately identified fresh Codex observation for startup notice and direct installed-runtime maintenance on isolated repositories; record permission/install/session prerequisites and missing evidence honestly. | Codex prepares evidence; Arndt Gold owns host provisioning and human observation | Concrete verified candidate from T-006/T-007; permitted installed candidate and fresh session |
| T-009 | Run the existing QA gate using criterion/scenario evidence, reviews and the live-host lane; present its bounded result for exact QA approval. Prepare human UAT/closeout only at the subsequent permitted gates. | Codex via existing QA owner; Arndt Gold owns QA/UAT decisions | T-007; T-008 passed or explicitly unresolved in QA evidence |

Tasks are sequential where dependencies require it; independent read-only checks may run together. No delegated agents are required. T-008 is an evidence task, not an authorization to install, restart or alter host permission. Its absence prevents a full fresh-host acceptance claim even when repository/package checks pass.

## 2. Verification Traceability

The PRD remains the sole product acceptance register. Every mapped design decision is covered for its criterion. Scenario names below denote executable assertions/observations to be implemented, not completed results. Existing test suites remain regression owners; new suites cover the actual direct-command/startup paths.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-002 | SCN-001 | Installer and direct service consume one classifier; absent/current roots return identical facts and no maintenance offer. | `control-maintenance-test.js`: shared inspection parity; existing `install-control-migration-test.js` |
| AC-001 | SDD-002 | T-003 | SCN-002 | Independent roots A/B, invalid root and paths with spaces affect only the explicitly selected root; all inspection bytes remain unchanged. | `control-maintenance-command-test.js`: target isolation and before/after tree digests |
| AC-002 | SDD-001 | T-002 | SCN-003 | Future format, legacy active, historical unsealed, planned missing, completed missing and unsafe paths retain canonical distinct classifications. | Shared compatibility fixtures plus unchanged migration/repair and recovery assertions |
| AC-002 | SDD-004 | T-005 | SCN-004 | Current compatibility with blocked Doctor remains current; bad output/timeout is unavailable, while known structural damage remains repair required. | `repository-control-startup-test.js`: parsed facts, separate Doctor result and injected child failure |
| AC-003 | SDD-003 | T-005 | SCN-005 | Startup child requests only read-only JSON; no guided call, stdin choice, run/journal creation or configuration mutation occurs. | Startup invocation spy and generated-hook execution with repository/data/config tree digests |
| AC-003 | SDD-004 | T-005 | SCN-006 | Disabled/stale/missing check consent emits base context without repository-control probing; enabled exact context permits bounded inspection. | Startup/consent tests using temporary receipts and explicit hook cwd |
| AC-003 | SDD-007 | T-006 | SCN-007 | Candidate executable/source identity change retains renewal-required behavior; a previous receipt never enables the changed automatic check. | Existing runtime-check/codex-plugin-consent tests plus candidate identity comparison |
| AC-004 | SDD-002 | T-003 | SCN-008 | Selecting root B after A binds B afresh; A's proposal/selection cannot redirect or authorize writes to B. | Command/service target-switch tests; immutable A/B snapshots |
| AC-004 | SDD-004 | T-005 | SCN-009 | Fresh supported reentry/subdirectory context reports its verified root; repo-less context emits no invented root; OpenCode uses only its supplied adapter directory. | Generated-hook/adapter fixtures for A/B, nested cwd, invalid input and ignored stdin |
| AC-004 | SDD-005 | T-004 | SCN-010 | A source or target changed after review is rejected before mutation, with an explicit fresh-plan action. | Guided stale-selection test plus canonical stale-revision/recovery tests |
| AC-005 | SDD-003 | T-003 | SCN-011 | Missing interaction, guided+JSON and invalid flags fail before mutation; blank/EOF defer and never choose a default. | Direct command validation and injected input tests with no-write snapshots |
| AC-005 | SDD-005 | T-004 | SCN-012 | Entry choice 1 searches only; selected migration batch and repair application each show consequences before apply, without repeated per-run/search consent. | Guided callback transcript and migration/repair proposal snapshots |
| AC-005 | SDD-006 | T-004 | SCN-013 | Numeric 1/2/3, repeated details, invalid input, empty input and EOF behave equivalently in EN/DE; legacy details aliases remain compatible. | Shared interaction tests and actual rendered menu transcripts |
| AC-006 | SDD-001 | T-002 | SCN-014 | Installer and direct orchestration use identical eligibility and preserve the explicit installer's existing safe-mode scope. | Existing install setup/service and migration regressions; shared import/behavior inspection |
| AC-006 | SDD-005 | T-004 | SCN-015 | Reviewed selected legacy migration produces valid seals, original backups and required approval reset; unselected runs, pending outputs and missing host observations are preserved. | Direct guided migration fixture, journal/source comparison and `run-recovery-test.js` |
| AC-007 | SDD-001 | T-002 | SCN-016 | Checkpoint and exact Git-path originals produce the existing proposal types; nested Git roots work and absent originals remain required input. | Existing `install-control-repair-test.js` plus shared direct-service parity fixtures |
| AC-007 | SDD-005 | T-004 | SCN-017 | Tampered checkpoints, symlink/dangling paths, unsafe references and callback/source changes cannot be applied; search/details expose no raw private original bytes and write nothing. | Direct repair negatives and existing canonical tamper/path assertions |
| AC-008 | SDD-005 | T-004 | SCN-018 | Lock contention, pre/post-rename interruption, concurrent edits and newly appearing pending files preserve local recovery/owned rollback; successful repeat creates no needless revision. | Existing run recovery/lock/transaction tests and direct guided repeat/fault cases |
| AC-009 | SDD-002 | T-003 | SCN-019 | Omitted/relative/invalid directory cannot inherit parser cwd or host config directory; explicit absolute directory remains visible in structured/text results. | Command parser/handler target boundary tests |
| AC-009 | SDD-003 | T-003 | SCN-020 | Default/details/JSON inspection makes no journals or changes; guided mode is the only new direct application path, and unavailable input reports its reason. | Command end-to-end temporary-root tests with byte snapshots |
| AC-009 | SDD-007 | T-006 | SCN-021 | Each supported generated full runtime executes the direct command in isolation without installer modules, registry/network, MCP or host configuration writes; invalid identity remains rejected. | Generated-runtime integration suite, module inventory, execution logs and integrity negatives |
| AC-010 | SDD-005 | T-004 | SCN-022 | Mixed success, skipped migration, unresolved repair and interruption report actual completed operations plus fresh remaining compatibility; no-source produces needs-input, repeat reflects current state. | Shared service fault/mixed fixtures compared with canonical reinspection and backup references |
| AC-010 | SDD-006 | T-004 | SCN-023 | Text and JSON distinguish deferral, partial, complete and unavailable; exit codes/next actions agree with operation and actual compatibility rather than Doctor. | Actual CLI result rendering/exit-code matrix in EN/DE |
| AC-011 | SDD-004 | T-005 | SCN-024 | Large inventories produce bounded startup fields/hint; no full per-run dump or executable interpretation of diagnostic text occurs. | Generated startup output size, parsed invocation argv and malicious diagnostic fixtures |
| AC-011 | SDD-006 | T-004 | SCN-025 | Every applicable state/menu/proposal/result renders in EN/DE and fallback; explicit details retain required paths/causes including spaces and inert special characters. | Shared renderer output matrix and operational-localization regression |
| AC-012 | SDD-001 | T-006 | SCN-026 | Installer/direct parity has one implementation owner; runtime dependency inventory excludes installer, marketplace, MCP config and consent mutation modules. | Dependency closure/import inspection and shared-service parity tests |
| AC-012 | SDD-007 | T-006 | SCN-027 | Full profile regeneration is deterministic with complete needed dependencies, matching provenance/digests and reviewed payload growth; reference-only profiles retain honest limitations. | Package build/contents, public plugin, Copilot profile, payload budget, runtime integrity positive/negative logs |
| AC-012 | SDD-007 | T-008 | SCN-028 | Fresh Codex session identifies the installed candidate/digests and evidence boundary; actual startup and manual maintenance are recorded separately from source/package fixtures. | New run-local `CODEX_LIVE_OBSERVATION.md` only after observation; explicit missing-evidence record otherwise |
| AC-003 | SDD-004 | T-008 | SCN-029 | Fresh Codex startup visibly obeys effective check permission and reports the correct isolated repository need without waiting for terminal input. | Human-visible fresh-session transcript with candidate identity, target, permission and before/after inventory |
| AC-009 | SDD-007 | T-008 | SCN-030 | Actual installed candidate directly inspects and deliberately maintains an isolated repository without reinstallation as part of maintenance, network or host config changes. | Fresh Codex direct invocation transcript, canonical result, tree/backup comparison and explicit observation limitations |

## 3. Test Plan

### Environment, ownership and prerequisites

The following routes cover every approved criterion. All automated suites run on this macOS checkout with the available Node 22 executable and Git in disposable directories; Codex owns execution/evidence. The execution environment does not establish native Windows/Linux or another host's behavior. Do not change the real repository's historical approvals as test fixtures.

| Criteria | Route and environment | Prerequisites / permissions | Evidence owner and unavailable behavior |
|---|---|---|---|
| AC-001 | Shared service/CLI and two isolated root fixtures | Writable temporary roots; generated canonical scaffold fixture | Codex, SCN-001/002; unavailable fixture/build fails validation rather than assuming target isolation |
| AC-002 | Canonical classification fixtures and generated hook | Approved source, generated runtime, injected Doctor/child outcomes | Codex, SCN-003/004; missing dependency is a failing prerequisite; unavailable runtime stays unavailable |
| AC-003 | Generated hook/consent fixtures plus fresh Codex | Temporary data receipts; explicit event context; live candidate and effective host permission for live lane | Codex fixtures and Arndt Gold live observation, SCN-005/006/007/029; no permission renewal bypass; absent live evidence remains open |
| AC-004 | Target-switch, subdirectory and stale-proposal fixtures | Separate root snapshots and controlled source change injection | Codex, SCN-008/009/010; missing supported host reentry is documented with manual fallback, not invented monitoring |
| AC-005 | Direct command and shared interaction/render fixtures | Injected reader for unit tests; real terminal input channel for guided integration; no native approval automation | Codex, SCN-011/012/013; unavailable input rejects before writes |
| AC-006 | Canonical/direct migration fixture and installer adapter | Reviewed fake historical fixture; temporary journals/backup directory | Codex, SCN-014/015; source mismatch or missing proof rejects; preserve pending output and approval reset semantics |
| AC-007 | Exact Git/checkpoint and symlink/tamper tests | Local disposable Git history; contained-path fixture; no remote access | Codex, SCN-016/017; missing Git original remains manual input, never manufactured test success |
| AC-008 | Canonical lock/recovery fault injection and repeat | Existing hooks, controlled file ownership and temporary journals | Codex, SCN-018; recovery/conflict remains explicit; unsupported interrupted repair is not auto-resumed |
| AC-009 | Parser/CLI/generated runtime and fresh installed candidate | Absolute target; generated package; explicit guided input/native execution permission in live lane | Codex and Arndt Gold, SCN-019/020/021/030; unsupported runtime/input/host permission is named and live evidence remains open |
| AC-010 | Mixed/partial/deferral result and exit-code matrix | Canonical reinspection, controlled operation failures and real output capture | Codex, SCN-022/023; no cached success on verification failure |
| AC-011 | Actual renderer and bounded generated startup | Existing locale registry; EN/DE/fallback; large inventories and special-character paths | Codex, SCN-024/025; locale/inventory loss is a test failure rather than a suppressed diagnostic |
| AC-012 | Dependency/package integrity plus fresh Codex evidence | Generated full profiles; baseline review; permitted candidate install/session for live lane | Codex package evidence, Arndt Gold host provisioning, SCN-026/027/028; no baseline weakening or fresh-host claim from fixtures |

Planning feasibility checked against current source: Node 22 binding is present, current project suites and fixture helpers exist, the approved owners/command shape are known, and no repository `AGENTS.md` was found. New tests/commands remain future work. T-001 must revalidate this evidence after TP approval and before source changes.

### Automated checks and ordering

Use the existing package scripts rather than substitute test-only logic. New test files planned here are `control-maintenance-test.js`, `control-maintenance-command-test.js`, and `repository-control-startup-test.js`; register focused package test entries and include them in the appropriate existing smoke route. Keep assertions on actual emitted text/JSON, target bytes and canonical writes, not only locale key presence or private implementation structure.

1. After T-001 and extraction, run `test:install-control-migration`, `test:install-control-repair`, `test:install-setup-contract`, `test:install-setup-interaction`, `test:install-setup-service`, and new shared capability tests.
2. After command/guided integration, run new command tests, `test:cli-modularization`, `test:local-validator`, `test:run-recovery`, `test:run-lock`, `test:run-step-transaction`, `test:run-revision`, and `test:control-state`. Exercise direct entry as well as preserved installer imports; keep all existing safety assertions.
3. After startup integration, run new generated-hook tests, `test:runtime-check-consent`, `test:task-target-resolution`, `test:request-activation-host-schema`, `test:request-activation-callbacks`, `test:operational-localization`, and `test:opencode-hardening`. Verify allowed permission/context routes and abstention/no writes.
4. Generate with `sync-package-assets`; run `test:package-build`, `test:package-contents`, `test:public-plugin`, `test:copilot-profile`, `test:payload-budget`, `test:runtime-integrity-layout`, `test:runtime-integrity-negative`, and `node plugin/scripts/check-runtime-integrity.mjs` from repository root. Execute the new command from every generated supported full-runtime profile in isolated roots, without relying on full package installation imports.
5. Review scoped source/generated inventory differences and `git diff --check`; record commands, exit outcomes, runtime/profile/digests, changed-path scope and scenario IDs in CD+Tests evidence. Complete the existing review and QA routes. Repeat checks only after a relevant fix/failure or unresolved concern.

Use temporary `AGDF_DATA_DIR` and writable temporary npm cache where tests invoke npm. Fixture Git commits exist only in disposable test repositories with disabled hooks. No package publication, registry acquisition, real plugin installation, MCP configuration or host permission change belongs to automated validation. Generation/package tests mutate only their expected repository-owned outputs or disposable fixtures; capture relevant existing generated/source state first. If a suite attempts an unrelated external mutation, isolate it with its supported fixtures or record the unavailable prerequisite rather than authorize it through testing.

### Fresh Codex lane

Prepare a concrete verified local candidate with identity/digest evidence first. Compare it with the currently installed candidate, which may remain older. A fresh-session observation needs a permitted refreshed install/reload and effective check permission for that candidate; this plan does not grant those changes. If separate native permission/provisioning is required, present the concrete candidate/action only after preparation and ask only for the missing authorization. Until available, record exact missing host evidence and its owner.

Use disposable repositories A/B with differing compatibility and a current/absent root. Observe real startup/reentry and then invoke the displayed installed runtime command on the selected fixture, checking menu deferral/details and deliberate application, backups and fresh compatibility. Capture repository, candidate, runtime/source digest, consent state, session identity/date, actual output, before/after fixture bytes and limitations. Do not manufacture user input or count a direct shell/package test as a fresh model/host session. Other hosts/native Windows remain explicitly unverified until separately observed.

## 4. Brownfield Scope

T-001 must inspect the approved PRD/SD, completed Brownfield Review/UX artefact and selected canonical run; verify source state against the current baseline. Primary touchpoints are:

- `lib/install-setup/control-migration.js`, `control-repair.js`, `service.js`, `contract.js`, `interaction.js`, `presentation.js`, and the new shared maintenance directory. Confirm existing installer safe mode, public projections and callbacks are preserved, with no circular import or second rule owner.
- `lib/control-state/` inspection, planned-artefact/path handling, revision/source checks, seals, canonical transactions and recovery journals. These are reused invariants; change them only if a scoped regression proves a necessary defect and the approved behavior still holds.
- CLI registry/parser/validation handlers and local validator command allowlist, fixed runtime/provenance boundary, `repository-context.js`, generator, runtime-check identity/consent and OpenCode adapter context. Verify exact absolute targets and native permission remain authoritative.
- Locale source, generated profiles/manifests, package tests and payload baseline/history; `create-agdf/README.md` and existing installation/runtime guidance. Generated artifacts derive only from their existing owner. Baseline growth requires concrete dependency justification and recorded before/after values, not weaker guards.

Capture baseline index/worktree/untracked paths and relevant file bytes before implementation. This checkout contains substantial prior work in the same broad modules; preserve it and review only the attributable delta. No checkout reset, staging/unstaging, cleanup of unrelated paths, global control rewrite or automatic VCS action is planned. Existing historical recovery runs remain distinct from this feature's run.

## 5. Out Of Scope

No PRD acceptance change, new control format, approval/provenance formula, arbitrary repair source, combined cross-run transaction, authority cache or extra gate. No neighboring repository search, new noninteractive apply API, automatic installer use, remote download, publication, MCP configuration, permission broadening, host restart or VCS action. Do not claim native UI choices, automatic repository-change monitoring or another live host/platform without evidence of that capability.

## 6. Risks And Blockers

Fail implementation preparation if approved artefacts changed, owner/source facts conflict, target/runtime provenance is unavailable, or preservation of prior work cannot be established. Reject unsafe/stale/locked maintenance sources at the existing boundary; report recoverable partial outcomes without inventing missing originals. Regression, dependency, localized rendering, safety or package-integrity failure requires revision before QA readiness.

Payload growth must be measured and justified against the existing baseline/history owner; do not silence or enlarge a guard merely to get green output. Startup timeout/unavailable states must retain a usable explicit manual route. Missing fresh Codex evidence is a delivery limitation with named prerequisites; QA cannot claim that lane passed or reinterpret source/package success as human UAT. Arndt Gold remains owner of exact QA/UAT decisions. All test results in this TP are expected results; none are execution evidence yet.

## 7. Next Step

Review this Task/Test Plan and approve only with `Approval: TP`. Then perform T-001 implementation-preparation Brownfield Analysis; proceed to source changes only after its canonical passing evidence permits CD+Tests. QA/UAT remain subsequent decisions.

## AGDF Approval Summary (de; source=en)

- Ziel: Das freigegebene Lösungsdesign umsetzen und den Repository-Einstieg für Migration/Reparatur durch konkrete Tests und getrennte Host-Beobachtung nachweisen.
- T-001: Nach TP-Freigabe die Brownfield-Analyse durchführen, aktuelle Quellen und freigegebene Artefakte prüfen und vorhandene Änderungen sichern beziehungsweise eindeutig abgrenzen.
- T-002: Bestehende Prüf-, Migrations- und Reparaturlogik in den gemeinsamen Owner auslagern; Installer-Aufrufe und kanonische Schreibregeln erhalten.
- T-003: Direkten CLI-/Runtime-Aufruf mit ausdrücklich absolutem Repository-Pfad, lesendem Standard, Details/JSON und geprüftem interaktivem Modus ergänzen.
- T-004: Gemeinsame deutsche/englische Auswahl 1/2/3, geprüfte Vorschläge, bewusste Anwendung und abschließende neue Bestandsprüfung integrieren.
- T-005: Berechtigten Start-Check um kurze Repository-Fakten und Aufrufhinweis erweitern; Doctor, Berechtigung, Kontext, Zeitlimit und Host-Transport getrennt behandeln.
- T-006: Minimale Runtime-Abhängigkeiten aufnehmen, Profile erzeugen, Paketwachstum prüfen, Integrationstests ergänzen und bestehende Bedienungsdokumentation aktualisieren.
- T-007: Relevante Regressionen und Paketprüfungen ausführen, Umsetzung/Testnachweise erfassen und Aufgabenplan-, Struktur- sowie verpflichtendes Code-Review abschließen; Befunde beheben.
- T-008: Einen frischen Codex-Live-Test mit eindeutigem installiertem Kandidaten und isolierten Repositories durchführen. Fehlende Installation, Sitzung oder native Berechtigung als konkrete Voraussetzung offen halten; keine automatische Host-Änderung.
- T-009: QA mit den tatsächlichen Nachweisen durchführen und das Ergebnis zur exakten QA-Freigabe vorlegen; UAT und Abschluss folgen erst an ihren erlaubten Gates.
- Prüfung: 30 konkrete Szenarien decken alle zwölf PRD-Kriterien und ihre sieben Designentscheidungen ab, darunter Repository-Trennung, fehlende Originale, leere Eingabe/EOF, veraltete Vorschläge, Locks, Unterbrechung, Wiederholung, EN/DE-Ausgabe und Paketintegrität.
- Reihenfolge und Grenzen: Quellen/Fixtures und erzeugte Runtime zuerst; frische Codex-Ausführung als eigener Nachweis. Tests nutzen temporäre Bestände und Datenverzeichnisse. Vorhandene fremde Änderungen und echte historische Freigaben bleiben erhalten.
- Freigabefolge: `Approval: TP` erlaubt zuerst die erforderliche Brownfield-Analyse und danach bei positivem Ergebnis die Umsetzung. QA, UAT, Veröffentlichung und Installation werden dadurch nicht freigegeben.
